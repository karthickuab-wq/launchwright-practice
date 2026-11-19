#!/usr/bin/env node
// Builds a Launchwright project's status page from the small files status.mjs writes under status/,
// and the plan (status/baseline.json, else project/plan.json). The page is one self-contained HTML
// file, sized for a 390-pixel-wide phone, with nothing to download: no fonts, images or scripts from
// elsewhere. It shows, top to bottom (spec section 9):
//   1. the state   2. last reported in   3. expected finish against the baseline
//   4. waiting on you now   5. coming up for you   6. the phases   7. where the time went
// The page works out its own age when it's opened, so a page nobody has rebuilt still says how long
// the build has been quiet, and turns "Building" into "Quiet, maybe stuck" after 3 hours.
// No phone alert goes out when the build goes quiet: that stays off until a service holds alerts
// reliably (open point O3), and the page says so.
//
// Usage: node render-status.mjs [--root <project>] [--out <file.html>] [--now <ISO time>]
// Without --out the page goes to the system's temporary folder, and the path is printed.
// Generalized from the Launchwright build's own buildkit/render-status.mjs. Plain Node 20+, no packages.

import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { findRoot, loadProject, readDir, readJson } from './status.mjs';

const MIN = 6e4;
const H = 36e5;
export const QUIET_MS = 3 * H; // a running build that has said nothing for this long may be stuck
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const span = (ms) => {
  if (!(ms > 0)) return 'just now';
  const m = Math.round(ms / MIN);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 48) return m % 60 && h < 10 ? `${h} h ${m % 60} min` : `${h} h`;
  return `${Math.round(h / 24)} days`;
};
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Every number and line the page shows, worked out from the project's files at `nowMs`.
export function model(root, nowMs = Date.now()) {
  const project = loadProject(root);
  const { plan, timeZone: TZ } = project;
  const STATUS = join(root, 'status');
  const run = readJson(join(STATUS, 'run.json'), {}) || {};
  const pieces = readDir(join(STATUS, 'pieces'));
  const waiting = readDir(join(STATUS, 'waiting'));
  const phases = readDir(join(STATUS, 'phases'));
  const modes = readDir(join(STATUS, 'modes')).sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  // A task is done when it's recorded as done, or when the question it waits on (its closedBy) has been
  // answered: answering "which sign-in?" is doing the task "pick the sign-in" (the build's lesson 30).
  // An ask made under the task's own id and answered is the task done too (the status-page skill, section 4).
  const tasksDone = new Set([
    ...readDir(join(STATUS, 'tasks')).map((x) => x.id),
    ...(plan.userTasks || []).filter((u) => u && waiting.some((w) => (w.id === u.closedBy || w.id === u.id) && w.state === 'answered')).map((u) => u.id),
  ]);
  const NOW = nowMs;
  const t = (iso) => (iso ? Date.parse(iso) : NaN);

  const dayOf = (ms) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ms));
  const showDay = (d) => (d ? `${MONTHS[Number(d.slice(5, 7)) - 1]} ${Number(d.slice(8, 10))}` : '');
  const showTime = (ms) =>
    Number.isFinite(ms) ? new Intl.DateTimeFormat('en-US', { timeZone: TZ, month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(new Date(ms)) : '';
  const days = (a, b) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 864e5);
  const addDays = (d, n) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10);
  const TODAY = dayOf(NOW);

  // intervals
  const merge = (list) => {
    const out = [];
    for (const [s, e] of list.filter(([s, e]) => e > s).sort((a, b) => a[0] - b[0])) {
      const last = out.at(-1);
      if (last && s <= last[1]) last[1] = Math.max(last[1], e);
      else out.push([s, e]);
    }
    return out;
  };
  const total = (list) => merge(list).reduce((n, [s, e]) => n + (e - s), 0);
  const modeSpans = (wanted) =>
    modes.map((m, i) => [t(m.at), i + 1 < modes.length ? t(modes[i + 1].at) : NOW, m.mode]).filter(([, , m]) => wanted.includes(m)).map(([s, e]) => [s, e]);
  const starts = [...phases.map((p) => t(p.started)), ...pieces.map((p) => t(p.started))].filter(Number.isFinite);
  const T0 = starts.length ? Math.min(...starts) : null;
  const clipTo = (list) => list.map(([s, e]) => [Math.max(s, T0 ?? s), Math.min(e, NOW)]);
  const building = clipTo(pieces.map((p) => [t(p.started), p.finished ? t(p.finished) : p.state === 'running' ? NOW : t(p.started)]));
  const openItems = waiting.filter((w) => w.state === 'open');
  const blockingOpen = openItems.filter((w) => w.level === 'blocking');
  const waitingYou = clipTo([...waiting.filter((w) => w.level === 'blocking').map((w) => [t(w.since), w.answered ? t(w.answered) : NOW]), ...modeSpans(['waiting'])]);
  const paused = clipTo(modeSpans(['paused', 'done']));
  const covered = merge([...building, ...waitingYou, ...paused]);
  const gaps = [];
  if (T0) {
    let cursor = T0;
    for (const [s, e] of covered) {
      if (s > cursor) gaps.push([cursor, s]);
      cursor = Math.max(cursor, e);
    }
    if (NOW > cursor) gaps.push([cursor, NOW]);
  }
  const stuckMs = gaps.reduce((n, [s, e]) => n + (e - s), 0);
  const time = T0 ? { since: showTime(T0), building: total(building), waiting: total(waitingYou), paused: total(paused), stuck: stuckMs } : null;

  // 1 and 2: the state, and when the build last reported in
  const stamps = [
    ...pieces.flatMap((p) => [p.started, p.finished]),
    ...waiting.flatMap((w) => [w.since, w.answered]),
    ...phases.flatMap((p) => [p.started, p.finished]),
    ...modes.map((m) => m.at),
  ].map(t).filter((x) => Number.isFinite(x) && x <= NOW);
  const lastHeard = stamps.length ? Math.max(...stamps) : null;
  const mode = run.mode || (T0 ? 'running' : 'not started');
  const runningPieces = pieces.filter((p) => p.state === 'running');
  const quiet = lastHeard ? NOW - lastHeard : 0;
  const state =
    mode === 'not started' ? 'not-started'
    : mode === 'done' ? 'done'
    : mode === 'paused' ? 'paused'
    : blockingOpen.length || mode === 'waiting' ? 'waiting'
    : quiet >= QUIET_MS ? 'stuck'
    : 'building';
  const doing = runningPieces.map((p) => p.title).filter(Boolean);

  // 3: the expected finish, from how late or early the phases actually ran against the baseline
  const actual = Object.fromEntries(phases.map((p) => [p.id, p]));
  let delta = 0;
  for (const p of plan.phases || []) {
    const a = actual[p.id];
    if (!a?.started) continue;
    if (a.finished) delta = days(p.end, dayOf(t(a.finished)));
    else delta = Math.max(days(p.start, dayOf(t(a.started))), TODAY > p.end ? days(p.end, TODAY) : -Infinity);
  }
  if (!Number.isFinite(delta)) delta = 0;
  // When each phase is now expected to start and end: the actual day once it has happened, otherwise the
  // plan's day moved by the forecast (never before today). Tasks tied to a phase move with it.
  const DAY = /^\d{4}-\d{2}-\d{2}$/;
  const notBefore = (d) => (d < TODAY ? TODAY : d);
  const phaseWhen = Object.fromEntries(
    (plan.phases || []).filter((p) => p && p.id && DAY.test(p.start || '') && DAY.test(p.end || '')).map((p) => {
      const a = actual[p.id];
      return [p.id, {
        start: a?.started ? dayOf(t(a.started)) : notBefore(addDays(p.start, delta)),
        end: a?.finished ? dayOf(t(a.finished)) : notBefore(addDays(p.end, delta)),
        started: !!a?.started,
        finished: !!a?.finished,
      }];
    }),
  );
  // A task can say when it's needed: "needed": { "phase": "<phase id>", "at": "start" | "end" }. Its planned
  // day (doBy) keeps the same distance from that moment, so its updated day moves with the build.
  const neededAt = (u) => {
    const n = u?.needed;
    const p = n && (plan.phases || []).find((x) => x && x.id === n.phase);
    const e = p && phaseWhen[p.id];
    if (!e || !['start', 'end'].includes(n.at)) return null;
    const plannedAnchor = n.at === 'start' ? p.start : p.end;
    const reached = n.at === 'start' ? e.started : e.finished;
    const base = typeof u.doBy === 'string' && DAY.test(u.doBy) ? u.doBy : plannedAnchor;
    return { at: n.at, phase: p.name || p.id, planned: base, updated: reached ? TODAY : notBefore(addDays(base, days(plannedAnchor, n.at === 'start' ? e.start : e.end))), reached };
  };
  const live = typeof plan.live === 'string' ? plan.live : null;
  const expected = live ? (mode === 'done' ? null : addDays(live, delta) < TODAY ? TODAY : addDays(live, delta)) : null;
  const finish = live
    ? {
        planned: showDay(live),
        expected: expected ? showDay(expected) : null,
        words: mode === 'done' ? 'Finished' : delta > 0 ? `${delta} day${delta === 1 ? '' : 's'} late` : delta < 0 ? `${-delta} day${delta === -1 ? '' : 's'} early` : 'On plan',
        late: delta > 0,
      }
    : null;

  // 4: waiting on you now
  const rank = { blocking: 0, 'do-by': 1, fyi: 2 };
  const waitingNow = openItems
    .map((w) => ({ ...w, neededAt: neededAt(w) }))
    .sort((a, b) => rank[a.level] - rank[b.level] || String(a.doBy).localeCompare(String(b.doBy)) || t(a.since) - t(b.since))
    .map((w) => ({
      level: w.level,
      label: w.level === 'blocking' ? 'The build waits for this' : w.level === 'do-by' ? `Do by ${showDay(w.doBy)}` : 'Good to know',
      text: w.text,
      since: t(w.since),
      waited: span(NOW - t(w.since)),
      holding: typeof w.holding === 'string' ? w.holding : Array.isArray(w.holding) && w.holding.length ? w.holding.join(', ') : null,
      overdue: !!(w.doBy && w.doBy < TODAY),
      needed: w.neededAt ? { at: w.neededAt.at, phase: w.neededAt.phase, updated: showDay(w.neededAt.updated), now: w.neededAt.reached } : null,
    }));

  // 5: coming up for you. A task the relay has asked for (an open ask under the task's own id) shows under
  // "Waiting on you now" instead, so it is listed once.
  const askedNow = new Set(openItems.map((w) => w.id));
  const upcoming = (plan.userTasks || [])
    .filter((u) => u && u.id && !tasksDone.has(u.id) && !askedNow.has(u.id) && typeof u.doBy === 'string')
    .map((u) => ({ ...u, when: neededAt(u) }))
    .map((u) => ({ ...u, day: u.when ? u.when.updated : u.doBy }))
    .sort((a, b) => a.day.localeCompare(b.day) || a.doBy.localeCompare(b.doBy))
    .slice(0, 8)
    .map((u) => ({
      doBy: showDay(u.doBy),
      needed: u.when ? { at: u.when.at, phase: u.when.phase, updated: showDay(u.when.updated), moved: u.when.updated !== u.doBy, now: u.when.reached } : null,
      overdue: u.day < TODAY,
      soon: u.day >= TODAY && days(TODAY, u.day) <= 2,
      text: u.text || u.id,
      minutes: Number.isFinite(u.minutes) ? u.minutes : null,
      neededFor: typeof u.neededFor === 'string' ? u.neededFor : null,
    }));

  // 6: the phases, planned against actual
  const phaseRows = (plan.phases || []).map((p) => {
    const a = actual[p.id];
    return {
      name: p.name || p.id,
      planned: `${showDay(p.start)} to ${showDay(p.end)}`,
      actual: a?.started ? `${showDay(dayOf(t(a.started)))} to ${a.finished ? showDay(dayOf(t(a.finished))) : 'now'}` : 'Not started',
      state: a?.finished ? 'done' : a?.started ? 'now' : 'later',
      expectedEnd: a?.finished ? null : showDay(phaseWhen[p.id]?.end || addDays(p.end, Math.max(0, delta))),
    };
  });

  return {
    name: project.name,
    timeZone: TZ,
    zoneName: new Intl.DateTimeFormat('en-US', { timeZone: TZ, timeZoneName: 'long' }).formatToParts(new Date(NOW)).find((x) => x.type === 'timeZoneName')?.value || TZ,
    generated: NOW,
    generatedText: showTime(NOW),
    state,
    mode,
    doing,
    lastHeard,
    lastHeardText: lastHeard ? showTime(lastHeard) : null,
    quiet: span(quiet),
    finish,
    hasBaseline: project.hasBaseline,
    waiting: waitingNow,
    upcoming,
    phases: phaseRows,
    time,
  };
}

const STATES = {
  'not-started': { word: 'Not started yet', line: 'The build starts once the plan is agreed.' },
  building: { word: 'Building', line: null },
  waiting: { word: 'Waiting on you', line: 'The build needs an answer from you. See below.' },
  paused: { word: 'Paused', line: 'Nothing is being built right now.' },
  stuck: { word: 'Quiet, maybe stuck', line: 'The build should be running but hasn’t reported in for a while. Open the project in the Claude app and ask what’s happening.' },
  done: { word: 'Done', line: 'Everything in the plan is finished.' },
};

// The page itself: one HTML file, its style and its small age script inline.
export function page(m) {
  const S = STATES[m.state];
  const doingLine = m.state === 'building' ? (m.doing.length ? `Working on: ${m.doing.slice(0, 3).join(' · ')}` : 'Between steps.') : S.line;
  // The bar is drawn from the hours as the rows show them (tenths), so it never shows a colour beside 0.0 h.
  const tenths = (ms) => Math.round((10 * ms) / H);
  const shownTotal = m.time ? tenths(m.time.building) + tenths(m.time.waiting) + tenths(m.time.paused) + tenths(m.time.stuck) : 0;
  const pct = (ms) => (shownTotal ? Math.round((100 * tenths(ms)) / shownTotal) : 0);
  const hrs = (ms) => `${(tenths(ms) / 10).toFixed(1)} h`;
  const out = [];
  out.push(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(m.name)}: status</title>
<style>
:root{--bg:#fbfaf7;--card:#fff;--ink:#1d1d1b;--soft:#5f5e5a;--line:#e4e1da;--go:#1f7a4d;--wait:#b3541e;--stop:#b42323;--calm:#4a5a78;--bar1:#2f6f9f;--bar2:#c47a2c;--bar3:#8a8a86;--bar4:#b42323;--tagink:#fff}
@media (prefers-color-scheme:dark){:root{--bg:#161615;--card:#1f1f1d;--ink:#f1efe9;--soft:#aaa79f;--line:#33322f;--go:#5cc28f;--wait:#f0a060;--stop:#f07a7a;--calm:#9fb0d0;--bar1:#6aa7d6;--bar2:#e0a05a;--bar3:#77766f;--bar4:#f07a7a;--tagink:#161615}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:17px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;-webkit-text-size-adjust:100%}
main{max-width:430px;margin:0 auto;padding:16px 16px 40px}
h1{font-size:15px;font-weight:600;color:var(--soft);margin:4px 0 10px;letter-spacing:.01em}
h2{font-size:15px;font-weight:700;margin:26px 0 8px;text-transform:uppercase;letter-spacing:.05em;color:var(--soft)}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin:0 0 10px}
.state{font-size:30px;font-weight:750;line-height:1.15;margin:0 0 6px}
.building .state{color:var(--go)}.waiting .state{color:var(--wait)}.stuck .state{color:var(--stop)}.paused .state,.not-started .state{color:var(--calm)}.done .state{color:var(--go)}
.sub{color:var(--soft);margin:0}
.big{font-size:22px;font-weight:700;margin:0}
.note{background:transparent;border:1px dashed var(--line);border-radius:12px;padding:10px 14px;color:var(--soft);font-size:15px;margin:10px 0 0}
.warn{border-color:var(--stop);color:var(--stop)}
ul{list-style:none;margin:0;padding:0}
li.item{padding:12px 0;border-top:1px solid var(--line);min-height:44px}
li.item:first-child{border-top:0;padding-top:0}
.tag{display:inline-block;font-size:13px;font-weight:700;border-radius:999px;padding:2px 10px;margin:0 0 4px}
.t-blocking{background:var(--stop);color:var(--tagink)}.t-do-by{background:var(--wait);color:var(--tagink)}.t-fyi{background:var(--line);color:var(--ink)}
.meta{color:var(--soft);font-size:15px;margin:2px 0 0}
.late{color:var(--stop);font-weight:700}
.row{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-top:1px solid var(--line);min-height:44px}
.row:first-child{border-top:0;padding-top:0}
.row .n{font-weight:600}.row .v{color:var(--soft);font-size:15px;text-align:right;white-space:nowrap}
.dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:8px;vertical-align:1px;background:var(--line)}
.d-done{background:var(--go)}.d-now{background:var(--wait)}
.bar{display:flex;height:14px;border-radius:7px;overflow:hidden;background:var(--line);margin:4px 0 12px}
.bar span{display:block;height:100%}
.k{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:8px;vertical-align:-1px}
footer{color:var(--soft);font-size:14px;margin-top:28px}
</style>
</head>
<body>
<main>
<h1>${esc(m.name)}</h1>`);

  // 1. The state, and 2. last reported in
  out.push(`<section class="card ${m.state}" id="state" data-state="${m.state}">
<p class="state" id="state-word">${esc(S.word)}</p>
<p class="sub" id="state-line">${esc(doingLine)}</p>
</section>
<section class="card">
<p class="sub">Last reported in</p>
<p class="big"${m.lastHeard ? ` data-ago="${m.lastHeard}"` : ''}>${m.lastHeard ? `${esc(m.quiet === 'just now' ? 'just now' : `${m.quiet} ago`)}` : 'Not yet'}</p>
${m.lastHeardText ? `<p class="meta">${esc(m.lastHeardText)}</p>` : ''}
<p class="note" id="quiet-note">Your phone doesn’t get an alert when the build goes quiet yet, so this page works out how long it’s been each time you open it.</p>
<p class="note warn" id="stale-note" hidden></p>
</section>`);

  // 3. Expected finish
  out.push('<h2>Expected finish</h2><section class="card">');
  if (!m.finish) out.push('<p class="sub">There’s no finish date in the plan yet.</p>');
  else {
    out.push(`<p class="big${m.finish.late ? ' late' : ''}">${m.finish.expected ? `Now expected ${esc(m.finish.expected)}` : esc(m.finish.words)}</p>`);
    out.push(`<p class="meta">Planned ${esc(m.finish.planned)}${m.finish.expected ? ` · ${esc(m.finish.words)}` : ''}</p>`);
    out.push(`<p class="meta">${m.hasBaseline ? 'The planned date only moves when you agree to it.' : 'The planned date is fixed once you agree to the plan.'}</p>`);
  }
  out.push('</section>');

  // 4. Waiting on you now
  out.push('<h2>Waiting on you now</h2><section class="card">');
  if (!m.waiting.length) out.push('<p class="sub">Nothing. The build doesn’t need you right now.</p>');
  else {
    out.push('<ul>');
    for (const w of m.waiting)
      out.push(
        `<li class="item"><span class="tag t-${w.level}">${esc(w.label)}</span><div>${esc(w.text)}</div><p class="meta">Waiting <span data-ago="${w.since}">${esc(w.waited)}</span>${w.overdue ? ' · <span class="late">past its date</span>' : ''}${w.needed ? ` · Needed at the ${w.needed.at} of ${esc(w.needed.phase)}${w.needed.now ? ', which is now' : `, now ${esc(w.needed.updated)}`}` : ''}${w.holding ? ` · Holds up: ${esc(w.holding)}` : ''}</p></li>`,
      );
    out.push('</ul>');
  }
  out.push('</section>');

  // 5. Coming up for you
  out.push('<h2>Coming up for you</h2><section class="card">');
  if (!m.upcoming.length) out.push('<p class="sub">Nothing planned for you.</p>');
  else {
    out.push('<ul>');
    for (const u of m.upcoming)
      out.push(
        `<li class="item">${u.needed ? `<p class="meta"><b>Needed at the ${u.needed.at} of ${esc(u.needed.phase)}</b></p>` : ''}<div>${esc(u.text)}</div><p class="meta"><span class="${u.overdue ? 'late' : ''}">${
          u.needed
            ? u.needed.now
              ? `Needed now (planned ${esc(u.doBy)})`
              : `Now ${esc(u.needed.updated)}${u.overdue ? ' (past its date)' : u.soon ? ' (soon)' : ''}${u.needed.moved ? ` · planned ${esc(u.doBy)}` : ''}`
            : `Do by ${esc(u.doBy)}${u.overdue ? ' (past its date)' : u.soon ? ' (soon)' : ''}`
        }</span>${u.minutes ? ` · about ${u.minutes} min` : ''}${u.neededFor ? ` · Needed for: ${esc(u.neededFor)}` : ''}</p></li>`,
      );
    out.push('</ul>');
  }
  out.push('</section>');

  // 6. The phases
  out.push('<h2>The phases</h2><section class="card">');
  if (!m.phases.length) out.push('<p class="sub">The plan has no phases yet.</p>');
  for (const p of m.phases)
    out.push(
      `<div class="row"><div><span class="dot d-${p.state}"></span><span class="n">${esc(p.name)}</span><p class="meta">Planned ${esc(p.planned)}</p></div><div class="v">${esc(p.actual)}${p.expectedEnd && p.state === 'now' ? `<br>should end ${esc(p.expectedEnd)}` : ''}</div></div>`,
    );
  out.push('</section>');

  // 7. Where the time went
  out.push('<h2>Where the time went</h2><section class="card">');
  if (!m.time) out.push('<p class="sub">The build hasn’t started yet.</p>');
  else {
    const parts = [
      ['Building', m.time.building, 'var(--bar1)'],
      ['Waiting on you', m.time.waiting, 'var(--bar2)'],
      ['Paused', m.time.paused, 'var(--bar3)'],
      ['Stuck', m.time.stuck, 'var(--bar4)'],
    ];
    out.push(`<div class="bar" role="img" aria-label="${parts.map(([n, ms]) => `${n} ${hrs(ms)}`).join(', ')}">${parts.map(([, ms, c]) => (pct(ms) ? `<span style="width:${pct(ms)}%;background:${c}"></span>` : '')).join('')}</div>`);
    for (const [n, ms, c] of parts) out.push(`<div class="row"><div><span class="k" style="background:${c}"></span>${n}</div><div class="v">${hrs(ms)}</div></div>`);
    out.push(`<p class="meta">Since ${esc(m.time.since)}. Stuck is time when nothing was happening and nobody was waiting on you; the build aims to keep it near zero.</p>`);
  }
  out.push('</section>');

  out.push(`<footer>Page made ${esc(m.generatedText)}<span id="page-age"></span>. Times are in ${esc(m.zoneName)}.</footer>
</main>
<script>
(function(){
var made=${m.generated},last=${m.lastHeard ?? 'null'},quietMs=${QUIET_MS},now=Date.now(),H=3600000;
function span(ms){if(!(ms>0))return'just now';var m=Math.round(ms/60000);if(m<1)return'just now';if(m<60)return m+' min';var h=Math.floor(m/60);if(h<48)return(m%60&&h<10)?h+' h '+(m%60)+' min':h+' h';return Math.round(h/24)+' days';}
var els=document.querySelectorAll('[data-ago]');
for(var i=0;i<els.length;i++){var s=span(now-Number(els[i].getAttribute('data-ago')));els[i].textContent=els[i].className==='big'?(s==='just now'?s:s+' ago'):s;}
var st=document.getElementById('state'),word=document.getElementById('state-word'),line=document.getElementById('state-line'),stale=document.getElementById('stale-note');
if(last&&st.getAttribute('data-state')==='building'&&now-last>=quietMs){st.className='card stuck';word.textContent=${JSON.stringify(STATES.stuck.word)};line.textContent=${JSON.stringify(STATES.stuck.line)};}
if(now-made>=H){document.getElementById('page-age').textContent=' ('+span(now-made)+' ago)';if(st.getAttribute('data-state')!=='done'){stale.hidden=false;stale.textContent='This page hasn\\u2019t been updated for '+span(now-made)+'. The times above are worked out now, but anything that happened since isn\\u2019t shown.';}}
})();
</script>
</body>
</html>
`);
  return out.join('\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  const opt = (name) => {
    const i = args.indexOf(`--${name}`);
    return i < 0 ? null : args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
  };
  const root = typeof opt('root') === 'string' ? resolve(opt('root')) : findRoot();
  if (!root || !readJson(join(root, 'launchwright', 'kit.json'))) {
    console.error("This isn't a Launchwright project (there's no launchwright/kit.json here or above), so there's no status page to build.");
    process.exit(3);
  }
  const nowArg = opt('now');
  const nowMs = typeof nowArg === 'string' ? Date.parse(nowArg) : Date.now();
  if (!Number.isFinite(nowMs)) {
    console.error('--now needs a time like 2026-12-01T09:30:00Z.');
    process.exit(2);
  }
  const out = typeof opt('out') === 'string' ? resolve(opt('out')) : join(tmpdir(), 'launchwright', `${basename(root)}-status.html`);
  const m = model(root, nowMs);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, page(m));
  console.log(`Wrote the status page (${STATES[m.state].word}) to ${out}`);
}
