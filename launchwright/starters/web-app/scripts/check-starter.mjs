#!/usr/bin/env node
// The starter's own check: what must stay true of this app (and, in the plugin, of the template),
// with plain Node and nothing installed. It does not replace npm test or npm run typecheck.
//
//   node scripts/check-starter.mjs              what must always hold
//   node scripts/check-starter.mjs --starter    also that the starter is untouched (used on the plugin's template)
//   node scripts/check-starter.mjs --ready      also that nothing is still a placeholder (before a test version)
//   --dir <app folder>                          check another folder (the tests use this)
//
// Always checked:
//   - Expo SDK 56 or later (Google needs Android API 36 and Apple needs Xcode 26 for new uploads).
//   - Nothing reaches the stores or production without the user's tap: a phone app's store build is the
//     one "production" profile, never sending by itself; eas.json's only submit profile is "production",
//     which uploads to Google's internal testing track and names no key file; a workflow that submits,
//     sends to TestFlight or deploys to production is a release workflow, started only by a push whose
//     message carries its own marker ([store-ios], [store-android] or [release-web]), and each of those
//     jobs waits for a require-approval job, which only a person signed in to Expo can approve. No
//     workflow publishes an update, and no package script is named deploy, release, submit, publish,
//     ship, upload or launch.
//   - No analytics or tracking package, and no install script.
//   - Every colour and size comes from the theme: the sources hold no # colours of their own.
//   - The theme has every colour the design guide names, each text colour readable (4.5 to 1), taps 44+.
//   - Phone-flow tests agree with the app: each flow's appId is the app's identifier, each quoted
//     screen text it looks for is in the sources, and each workflow names flows that exist.
// Exit code: 0 all good, 1 something is wrong (each listed), 2 a usage mistake. No packages.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { COLOR_NAMES, MIN_CONTRAST, PAIRS, contrast } from './apply-design.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(p, 'utf8');
const readJson = (p) => JSON.parse(read(p));
const walk = (dir, keep = () => true) => {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).sort().flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? (n === 'node_modules' ? [] : walk(p, keep)) : keep(p) ? [p] : [];
  });
};

const BLOCKED_SCRIPT = /^(pre|post)?(deploy|release|submit|publish|ship|upload|launch)/i;
const INSTALL_SCRIPTS = ['preinstall', 'install', 'postinstall', 'prepare', 'prepublish', 'prepublishOnly'];
// Analytics and tracking packages, matched on whole words of the package's name, so a name that only
// contains one (react-native-segmented-control, a "branch" inside another word) isn't refused.
const TRACKING_WORDS = ['analytics', 'amplitude', 'mixpanel', 'segment', 'posthog', 'sentry', 'bugsnag', 'datadog', 'appsflyer', 'adjust', 'branch', 'firebase', 'facebook', 'admob', 'applovin', 'onesignal', 'braze', 'clarity', 'hotjar', 'logrocket', 'fullstory'];
const isTracking = (name) => /google-mobile-ads/i.test(name) || name.toLowerCase().split(/[^a-z0-9]+/).some((w) => TRACKING_WORDS.includes(w));
const BLOCKED_JOBS = ['update', 'repack', 'update-rollout']; // never in any workflow here
const RELEASE_JOBS = ['submit', 'testflight']; // only in a release workflow, after the user's approval
const MARKERS = { 'expo-app': ['[store-ios]', '[store-android]'], 'web-app': ['[release-web]'] };

// The jobs of a workflow file, read just well enough for these checks: { id: { type, needs, text } }.
export function jobsOf(text) {
  const at = text.search(/^jobs:\s*$/m);
  if (at < 0) return {};
  const jobs = {};
  let cur = null;
  for (const line of text.slice(at).split('\n').slice(1)) {
    if (/^\S/.test(line)) break;
    const m = /^  ([A-Za-z0-9_-]+):\s*$/.exec(line);
    if (m) { cur = jobs[m[1]] = { text: '' }; continue; }
    if (cur) cur.text += `${line}\n`;
  }
  for (const j of Object.values(jobs)) {
    j.type = /^\s{4}type:\s*([\w-]+)/m.exec(j.text)?.[1] ?? null;
    j.needs = (/^\s{4}needs:\s*\[([^\]]*)\]/m.exec(j.text)?.[1] ?? '').split(',').map((x) => x.trim()).filter(Boolean);
    j.prod = /^\s+prod:\s*(true|\$\{\{)/m.test(j.text);
  }
  return jobs;
}
const PLACEHOLDER_TEXT = ['Starter screen', 'Your app starts here', "This screen is replaced with your app's main screen"];

export function check(dir, { starter = false, ready = false } = {}) {
  const problems = [];
  const bad = (msg) => problems.push(msg);
  const rel = (p) => relative(dir, p).split('\\').join('/');
  const need = (p) => { if (!existsSync(join(dir, p))) { bad(`${p} is missing.`); return false; } return true; };

  if (!need('package.json') || !need('app.json')) return problems;
  const pkg = readJson(join(dir, 'package.json'));
  const app = readJson(join(dir, 'app.json')).expo ?? {};
  const kind = pkg.launchwright?.template;
  if (!['expo-app', 'web-app'].includes(kind)) bad('package.json needs "launchwright": { "template": "expo-app" or "web-app" }.');

  // Expo SDK
  const sdk = Number(/(\d+)/.exec(pkg.dependencies?.expo ?? '')?.[1]);
  if (!(sdk >= 56)) bad(`The Expo SDK must be 56 or later; package.json has expo "${pkg.dependencies?.expo}".`);

  // Scripts and packages
  for (const name of Object.keys(pkg.scripts ?? {})) {
    if (BLOCKED_SCRIPT.test(name)) bad(`The package script "${name}" looks like a deploy or release; the user does that, so it doesn't belong here.`);
    if (INSTALL_SCRIPTS.includes(name)) bad(`The package script "${name}" would run on install; none is allowed.`);
  }
  for (const name of Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })) {
    if (isTracking(name)) bad(`The package "${name}" is analytics or tracking; nothing may be added that the README doesn't disclose.`);
  }

  // eas.json
  if (kind === 'expo-app') {
    if (need('eas.json')) {
      const eas = readJson(join(dir, 'eas.json'));
      for (const [name, profile] of Object.entries(eas.build ?? {})) {
        const store = /^(production|release|store|prod)/i.test(name);
        if (store && name !== 'production') bad(`eas.json has a build profile "${name}", which looks like a store build; the one store build profile is "production", which the guard keeps for the user's release.`);
        if (profile.autoSubmit) bad(`The build profile "${name}" sends to a store by itself; sending waits for the user's tap.`);
        if (!store && profile.distribution === 'store') bad(`The build profile "${name}" makes a store build; only "production" does.`);
        if (name === 'production' && (profile.distribution === 'internal' || profile.android?.buildType === 'apk' || profile.ios?.simulator)) bad('The "production" profile must make store versions: no internal distribution, apk or simulator.');
      }
      for (const [name, profile] of Object.entries(eas.submit ?? {})) {
        if (name !== 'production') bad(`eas.json has a submit profile "${name}"; the only one is "production", used by the send-to-stores workflows after the user approves.`);
        const a = profile.android ?? {}, i = profile.ios ?? {};
        if (profile.android && a.track !== 'internal') bad(`The submit profile must set android.track to "internal", not "${a.track}": it uploads to Google's internal testing only, and the user moves a version on in Play Console.`);
        for (const k of ['serviceAccountKeyPath', 'ascApiKeyPath', 'ascApiKeyId', 'ascApiKeyIssuerId', 'appleId']) if (a[k] !== undefined || i[k] !== undefined) bad(`The submit profile names ${k}; keys and sign-ins stay on Expo, never in the repo.`);
        if (a.rollout !== undefined || (a.releaseStatus && !['draft', 'completed'].includes(a.releaseStatus))) bad('The submit profile sets a rollout; releasing to people is the user\'s step in Play Console.');
      }
      const e2e = eas.build?.['e2e-test'];
      if (!e2e || e2e.ios?.simulator !== true || e2e.android?.buildType !== 'apk') bad('eas.json needs an "e2e-test" profile with ios.simulator true and android.buildType "apk", for the phone-flow tests.');
      const preview = eas.build?.preview;
      if (!preview || preview.distribution !== 'internal') bad('eas.json needs a "preview" profile with distribution "internal": the test version the user installs.');
    }
  } else if (kind === 'web-app') {
    if (existsSync(join(dir, 'eas.json'))) {
      const eas = readJson(join(dir, 'eas.json'));
      if (eas.submit) bad('eas.json has a "submit" section; a web app is never submitted.');
      if (eas.build?.production) bad('eas.json has a "production" build profile; a web app has no store build.');
    }
    if (!['single', 'static', 'server'].includes(app.web?.output)) bad('app.json needs web.output set to single, static or server (Expo Hosting needs it).');
  }

  // Workflows: in the plugin's template, workflows/; in an app, .eas/workflows, where the kit copies them
  const flowsDir = existsSync(join(dir, 'workflows')) ? 'workflows' : '.eas/workflows';
  const flows = walk(join(dir, flowsDir), (p) => /\.ya?ml$/.test(p));
  if (kind === 'expo-app' && !flows.length) bad(`${flowsDir}/ has no phone-flow workflow.`);
  for (const file of flows) {
    const text = read(file);
    const jobs = jobsOf(text);
    const approvals = Object.keys(jobs).filter((id) => jobs[id].type === 'require-approval');
    const release = Object.values(jobs).some((j) => RELEASE_JOBS.includes(j.type) || (j.type === 'deploy' && j.prod));
    for (const job of BLOCKED_JOBS) if (new RegExp(`^\\s*type:\\s*${job}\\s*$`, 'm').test(text)) bad(`${rel(file)} has a "${job}" job, which reaches real users' phones; only the user does that.`);
    if (/--prod\b|--production\b|--auto-submit\b/.test(text)) bad(`${rel(file)} runs a command that deploys to production or submits; use the workflow's own jobs, behind an approval.`);
    if (/environment:\s*production/i.test(text)) bad(`${rel(file)} uses the production environment's keys.`);
    if (/on:[\s\S]*?\bschedule\b/.test(text)) bad(`${rel(file)} runs on a schedule; nothing here runs by itself in the background.`);
    if (/^\s*(pull_request|pull_request_labeled|pull_request_comment|ref_delete|app_store_connect|workflow_call):/m.test(text)) bad(`${rel(file)} starts on something other than a push with its marker; nothing else may start a workflow here.`);
    const ifLine = /^\s*if:\s*\$\{\{([^}]*)\}\}/m.exec(text)?.[1] ?? '';
    const markers = [...ifLine.matchAll(/contains\(github\.commit_message,\s*'(\[[a-z-]+\])'\)/g)].map((m) => m[1]);
    const marker = markers[0];
    if (release) {
      if (!approvals.length) bad(`${rel(file)} submits or deploys to production without a require-approval job; the user's tap on Expo's site must come first.`);
      for (const [id, j] of Object.entries(jobs)) {
        if ((RELEASE_JOBS.includes(j.type) || (j.type === 'deploy' && j.prod)) && !j.needs.some((n) => approvals.includes(n))) bad(`${rel(file)}: the job "${id}" doesn't wait for the approval job; list it under needs.`);
      }
      if (!markers.some((m) => (MARKERS[kind] ?? []).includes(m)) || markers.includes('[checkpoint]') || /\|\|/.test(ifLine)) bad(`${rel(file)} must run only for a push whose message says ${(MARKERS[kind] ?? []).join(' or ')}.`);
    } else {
      if (/^\s*push:/m.test(text) && /type:\s*(build|maestro|deploy)/.test(text) && (!markers.includes('[checkpoint]') || /\|\|/.test(ifLine))) bad(`${rel(file)} starts builds on every push; it should run only when the commit message says [checkpoint], to protect the free plan's builds.`);
      if (approvals.length) bad(`${rel(file)} waits for an approval but sends nothing; a checkpoint workflow runs without one.`);
    }
    if (marker && !/^\s*branches:\s*\[\s*'main'\s*\]/m.test(text)) bad(`${rel(file)} must run only for pushes to the working branch, main.`);
    for (const m of text.matchAll(/flow_path:\s*\[([^\]]*)\]/g)) {
      for (const f of m[1].split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)) if (!existsSync(join(dir, f))) bad(`${rel(file)} names the flow ${f}, which doesn't exist.`);
    }
  }

  // The theme
  if (need('src/theme/tokens.json')) {
    const t = readJson(join(dir, 'src/theme/tokens.json'));
    for (const n of COLOR_NAMES) if (!/^#[0-9a-f]{6}$/i.test(t.colors?.[n] ?? '')) bad(`The theme has no # colour for "${n}".`);
    for (const [fg, bg, what] of PAIRS) {
      if (!t.colors?.[fg] || !t.colors?.[bg]) continue;
      const r = contrast(t.colors[fg], t.colors[bg]);
      if (r < MIN_CONTRAST) bad(`Too faint: ${what}, ${fg} on ${bg} is ${r.toFixed(2)} to 1.`);
    }
    if (!(t.tapTarget >= 44)) bad('The tap target must be at least 44.');
    for (const [k, v] of Object.entries(t.type ?? {})) if (!(v.size >= 13)) bad(`The "${k}" text is under 13.`);
  }

  // Sources
  const sources = walk(join(dir, 'src'), (p) => /\.(tsx?|jsx?)$/.test(p));
  const sourceText = sources.map(read).join('\n');
  for (const file of sources) {
    if (/\/src\/theme\//.test(`/${rel(file)}`)) continue;
    const hit = /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b(?![0-9a-zA-Z])/.exec(read(file));
    if (hit) bad(`${rel(file)} holds the colour ${hit[0]}; colours come from the theme (src/theme).`);
  }
  if (/lorem ipsum/i.test(sourceText)) bad('The sources hold "lorem ipsum"; every screen needs real words.');

  // Phone-flow tests agree with the app
  const ids = [app.ios?.bundleIdentifier, app.android?.package].filter(Boolean);
  const flowFiles = [
    ...walk(join(dir, '.maestro'), (p) => /\.ya?ml$/.test(p)),
    ...walk(join(dir, 'flows'), (p) => /\.spec\.ts$/.test(p)),
  ];
  if (!flowFiles.length) bad('There are no phone-flow tests (.maestro/ for a phone app, flows/ for a web app).');
  const screenText = `${sourceText}\n${read(join(dir, 'app.json'))}`;
  for (const file of flowFiles) {
    const text = read(file);
    if (file.endsWith('.yml')) {
      const id = /^appId:\s*(\S+)/m.exec(text)?.[1];
      if (!id) bad(`${rel(file)} has no appId.`);
      else if (ids.length && !ids.every((x) => x === id)) bad(`${rel(file)} has appId ${id}, but app.json has ${ids.join(' and ')}.`);
    }
    const quoted = [...text.matchAll(/(?:assertVisible|tapOn):\s*'([^']+)'/g), ...text.matchAll(/(?:getByText|getByRole\([^)]*name:)\s*\(?\s*'([^']+)'/g)].map((m) => m[1]);
    for (const q of quoted) {
      const literal = q.replace(/\.\*|\^|\$/g, '');
      if (literal && !screenText.includes(literal)) bad(`${rel(file)} looks for "${literal}", which no screen shows.`);
    }
  }

  // The untouched starter
  if (starter) {
    if (/\bfetch\s*\(|XMLHttpRequest|axios|https?:\/\//.test(sourceText.replace(/\/\/[^\n]*/g, ''))) bad('The starter makes a network call or names a web address; the README says it makes none.');
    if (!/^Starter/.test(readJson(join(dir, 'src/theme/tokens.json')).style ?? '')) bad('The starter\'s theme has been changed; the plugin\'s template keeps the neutral starter theme.');
  }

  // Ready for a test version
  if (ready) {
    if (/^Starter\b/.test(app.name ?? '') || /^starter-/.test(app.slug ?? '')) bad('app.json still has the starter name or slug.');
    if (ids.some((x) => x.startsWith('com.example.'))) bad(`The app identifier is still ${ids.find((x) => x.startsWith('com.example.'))}; set the real one (the user's choice) in app.json and .maestro.`);
    for (const t of PLACEHOLDER_TEXT) if (sourceText.includes(t)) bad(`A starter screen is still there ("${t}"); replace it with the app's own screen.`);
    if (/^Starter/.test(readJson(join(dir, 'src/theme/tokens.json')).style ?? '')) bad('The theme is still the starter\'s; run npm run design.');
    const icons = kind === 'web-app' ? [app.web?.favicon] : [app.icon, app.android?.adaptiveIcon?.foregroundImage, app.web?.favicon];
    for (const f of icons) if (!f || !existsSync(join(dir, f))) bad(`An icon is missing${f ? `: ${f}` : ''}; run npm run icons.`);
  }
  return problems;
}

function main(argv) {
  const args = argv.slice(2);
  const i = args.indexOf('--dir');
  const dir = resolve(i >= 0 ? args[i + 1] : join(HERE, '..'));
  const known = ['--starter', '--ready', '--dir'];
  const stray = args.filter((a, k) => a.startsWith('--') && !known.includes(a) && !(k > 0 && args[k - 1] === '--dir'));
  if (stray.length || (i >= 0 && !args[i + 1])) { console.error(`Usage: node scripts/check-starter.mjs [--starter] [--ready] [--dir <folder>]`); return 2; }
  const problems = check(dir, { starter: args.includes('--starter'), ready: args.includes('--ready') });
  if (problems.length) {
    console.error(`${problems.length} problem(s):`);
    for (const p of problems) console.error(`  - ${p}`);
    return 1;
  }
  console.log('Starter check: all good.');
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv);
