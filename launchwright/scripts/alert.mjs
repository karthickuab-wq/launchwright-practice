#!/usr/bin/env node
// Phone alerts for a Launchwright project, sent through ntfy.sh to the user's own alert channel.
// Three levels, so a warning is never softened and never louder than it should be:
//   blocking  the build is waiting on the user        (high priority)
//   do-by     something for the user to do by a date  (normal priority)
//   fyi       nothing to do, just so they know        (low priority)
//
// The channel's name works like a password: anyone who knows it can read the channel. So it's
// asked for through the plugin's masked setting `alert_channel` (.claude-plugin/plugin.json), which
// Claude Code hands to the plugin's hooks as CLAUDE_PLUGIN_OPTION_ALERT_CHANNEL. Where that setting
// can't reach (a cloud session; open point O11 in the spec), the cloud environment's
// LAUNCHWRIGHT_ALERT_CHANNEL is used instead. The name is never printed, logged or written to a file.
//
// An alert's title fits on a lock screen, its body is at most two short lines, and tapping it opens
// the status page. Alerts never carry keys, code or the app's data: a message that looks like one is
// refused, not sent. Nothing is held for later delivery: ntfy didn't reliably withdraw held alerts
// when tested (lesson 26), so the quiet-build alert stays off (open point O3) and the status page
// shows its own age instead.
//
// Usage: node alert.mjs <blocking|do-by|fyi> "<one plain sentence>" [--do-by YYYY-MM-DD] [--dry-run] [--root <project>]
// Exit codes: 0 sent (or shown, with --dry-run); 2 bad arguments or a message that isn't safe to send;
// 3 no alert channel; 4 ntfy couldn't be reached.
// Generalized from the Launchwright build's own buildkit/alert.mjs. Plain Node 20+, no packages.

import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const LEVELS = {
  blocking: { priority: '5', tag: 'warning', title: 'needs you' },
  'do-by': { priority: '3', tag: 'date', title: 'to do' },
  fyi: { priority: '2', tag: 'information_source', title: 'for you' },
};
export const CHANNEL = /^[A-Za-z0-9_-]{16,64}$/;
export const TITLE_MAX = 40; // about one line on a lock screen
export const BODY_MAX = 160; // about two short lines
const SETTING = 'CLAUDE_PLUGIN_OPTION_ALERT_CHANNEL';
const FALLBACK = 'LAUNCHWRIGHT_ALERT_CHANNEL';

// Where the channel's name comes from; the name itself is returned only to the sender, never shown.
export function channel(env = process.env) {
  for (const key of [SETTING, FALLBACK]) {
    const v = env[key];
    if (typeof v !== 'string' || !v) continue;
    if (!CHANNEL.test(v))
      return { ok: false, code: 3, reason: "The alert channel's name isn't a valid one: it needs 16 to 64 letters, digits, dashes or underscores, so nobody can guess it. No alert went out." };
    return { ok: true, topic: v, from: key === SETTING ? 'the plugin setting' : 'the cloud environment' };
  }
  return { ok: false, code: 3, reason: 'No alert channel is set up for this project, so no alert went out. The status page still shows everything.' };
}

// Things an alert must never carry: keys, code and links other than the status page.
const UNSAFE = [
  [/\b(sk|pk|rk|ghp|gho|ghs|github_pat|xox[abpr]|AKIA|AIza|eyJ)[A-Za-z0-9_-]{8,}/, 'it looks like it holds a key'],
  [/[A-Za-z0-9+/_-]{32,}/, 'it holds a long code that could be a key'],
  [/-----BEGIN|password\s*[:=]|token\s*[:=]|secret\s*[:=]/i, 'it looks like it holds a key'],
  [/[`{}<>;]|=>|\$\(|\bconst\b|\bfunction\b/, 'it looks like code'],
  [/\b[\w.+-]+@[\w-]+\.[\w.]+\b/, 'it holds an email address, which could be someone\'s data'],
  [/https?:\/\//i, 'it holds a link (the alert already opens the status page)'],
];
export function unsafe(textIn) {
  for (const [re, why] of UNSAFE) if (re.test(textIn)) return why;
  return null;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const showDay = (d) => `${MONTHS[Number(d.slice(5, 7)) - 1]} ${Number(d.slice(8, 10))}`;
const clip = (s, n) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

// A header can carry only plain characters: fetch refuses anything else (the "…" a long name is
// clipped with, an emoji, a name in another script). ntfy reads any header written as an RFC 2047
// encoded word, so such a value goes as =?UTF-8?B?…?= (ntfy's docs, "Message title"; read Nov 18, 2026).
export const headerText = (s) => (/^[\x20-\x7e]*$/.test(s) ? s : `=?UTF-8?B?${Buffer.from(s, 'utf8').toString('base64')}?=`);

// The alert as it would be sent: title, priority, tag, body and the link it opens. No channel needed.
export function compose(level, message, { doBy, project, link } = {}) {
  const L = LEVELS[level];
  if (!L) return { ok: false, code: 2, reason: `Unknown alert level "${level}": use blocking, do-by or fyi.` };
  const body = String(message ?? '').replace(/\s+/g, ' ').trim();
  if (!body) return { ok: false, code: 2, reason: 'The alert has no message.' };
  const why = unsafe(body);
  if (why) return { ok: false, code: 2, reason: `The alert wasn't sent because ${why}. Say it in plain words, without the detail.` };
  if (doBy !== undefined && doBy !== null && !/^\d{4}-\d{2}-\d{2}$/.test(doBy)) return { ok: false, code: 2, reason: '--do-by needs a date like 2026-12-03.' };
  const what = level === 'do-by' && doBy ? `to do by ${showDay(doBy)}` : L.title;
  const name = String(project || 'Your app').replace(/\s+/g, ' ').trim();
  const title = clip(`${clip(name, TITLE_MAX - what.length - 2)}: ${what}`, TITLE_MAX);
  const alert = { title, priority: L.priority, tag: L.tag, body: clip(body, BODY_MAX) };
  if (typeof link === 'string' && /^https:\/\/\S+$/.test(link)) alert.click = link;
  return { ok: true, alert };
}

// Send one alert now. `fetchImpl` and `env` are for tests.
export async function sendAlert(level, message, { doBy, project, link, env = process.env, fetchImpl = fetch } = {}) {
  const m = compose(level, message, { doBy, project, link });
  if (!m.ok) return m;
  const c = channel(env);
  if (!c.ok) return c;
  const headers = { Title: headerText(m.alert.title), Priority: m.alert.priority, Tags: m.alert.tag };
  if (m.alert.click) headers.Click = headerText(m.alert.click);
  try {
    const r = await fetchImpl(`https://ntfy.sh/${c.topic}`, { method: 'POST', headers, body: m.alert.body, signal: AbortSignal.timeout(15000) });
    return r.ok ? { ok: true, alert: m.alert } : { ok: false, code: 4, reason: `ntfy answered with status ${r.status}, so the alert may not have arrived.` };
  } catch (e) {
    return { ok: false, code: 4, reason: `The alert couldn't reach ntfy.sh (${e?.name || 'error'}). Check that ntfy.sh is in the cloud environment's allowed sites.` };
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { parse, findRoot, loadProject } = await import('./status.mjs');
  const { pos, opt } = parse(process.argv.slice(2));
  const [level, ...words] = pos;
  if (!level || !words.length) {
    console.error('Usage: node alert.mjs <blocking|do-by|fyi> "<one plain sentence>" [--do-by YYYY-MM-DD] [--dry-run] [--root <project>]');
    process.exit(2);
  }
  const root = typeof opt.root === 'string' ? resolve(opt.root) : findRoot();
  const project = root ? loadProject(root) : { name: 'Your app', pageLink: null };
  const options = { doBy: typeof opt['do-by'] === 'string' ? opt['do-by'] : undefined, project: project.name, link: project.pageLink };
  if (opt['do-by'] === true) {
    console.error('--do-by needs a date like 2026-12-03.');
    process.exit(2);
  }
  if (opt['dry-run']) {
    const m = compose(level, words.join(' '), options);
    const c = channel();
    if (!m.ok) {
      console.error(m.reason);
      process.exit(m.code);
    }
    console.log(`Would send (${level}): "${m.alert.title}" / "${m.alert.body}"${m.alert.click ? ' / opens the status page' : ''}`);
    console.log(c.ok ? `Alert channel: set, from ${c.from}.` : c.reason);
    process.exit(0);
  }
  const result = await sendAlert(level, words.join(' '), options);
  if (result.ok) console.log(`Alert sent (${level}).`);
  else console.error(result.reason);
  process.exit(result.ok ? 0 : result.code);
}
