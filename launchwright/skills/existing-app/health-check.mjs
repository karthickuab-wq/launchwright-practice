#!/usr/bin/env node
// The facts behind an existing app's health check (spec screen E2), gathered from its files without
// running, installing or changing anything. The existing-app skill turns them into plain words.
//
//   node health-check.mjs <app's repo folder> [--history] [--kit <plugin folder>]
//
// Prints one JSON report:
// - builtWith: the toolsets found (Expo, React Native, Next.js, Vite, Flutter, ...), the tool it was
//   made with when that leaves a trace (Lovable, Bolt, Replit), and kind: expo (the kit knows it),
//   web-js (a JavaScript web app on another toolset), other, or none.
// - runsAndShips: package scripts, GitHub workflows (and whether a push to main deploys), Expo's
//   profiles and workflows, and hosting settings files.
// - fragile: things that make changes risky (no tests, no lockfile, very long files, ...).
// - keys: keys sitting in the code, each named by kind, file and line only. A value is never put in
//   the report, and files named like .env are never opened (the guard's rule): a tracked one is
//   reported by name. With --history, the project's history is searched too (by kind, file and commit).
// - packages: how old the Expo family is against the kit's starter (`templates/expo-app/package.json`
//   in the plugin; --kit names the plugin folder when this file isn't inside it).
// - careful: places where a change needs extra care, each with its reason. Everything else is safe to
//   change once the safety net is recorded.
// - guardHints: suggested answers for the guard's settings (production branches and scripts, folders
//   with .env files, real users' data), to ask the user about one at a time. Never written by this file.
//
// Exit code: 0 a report, 2 a usage mistake. Plain Node 20+, no packages.

import { spawnSync } from 'node:child_process';
import { existsSync, lstatSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.expo', '.next', 'web-build', 'coverage', 'Pods', '.gradle', 'vendor']);
const LOCKFILES = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb', 'bun.lock'];
const MAX_BYTES = 512 * 1024;
const LONG_FILE = 800;
const TEST_FILE = /(\.(test|spec)\.[cm]?[jt]sx?$|[-_]test\.[cm]?[jt]s$|(^|\/)__tests__\/|(^|\/)tests?\/|_test\.(go|py|dart)$|(^|\/)\.maestro\/|(^|\/)flows\/)/;

// A file named like a .env file, by the guard's rule (guard/guard-lib.mjs): every name that starts with
// .env except .env.example, .env.sample, .env.template and .env.test, and names that end in .env.
export const isEnvFile = (path) => {
  const name = basename(path);
  if (/^\.env\.(example|sample|template|test)$/i.test(name)) return false;
  return /^\.env/i.test(name) || /\.env$/i.test(name);
};

// Kinds of key, each with the words the user sees. Public-by-design keys (Stripe's publishable keys,
// Supabase's anon key) aren't listed: they're meant to be in an app.
const KEY_KINDS = [
  { kind: 'a Stripe secret key (live)', re: /\b[sr]k_live_[0-9A-Za-z]{16,}/ },
  { kind: 'a Stripe secret key (test)', re: /\b[sr]k_test_[0-9A-Za-z]{16,}/ },
  { kind: 'an Anthropic key', re: /\bsk-ant-[A-Za-z0-9_-]{20,}/ },
  { kind: 'an OpenAI key', re: /\bsk-(?!ant-)(?:proj-)?[A-Za-z0-9_-]{20,}/ },
  { kind: 'an Amazon (AWS) key', re: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/ },
  { kind: 'a Google key', re: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { kind: 'a GitHub token', re: /\b(?:gh[pousr]_[0-9A-Za-z]{36}|github_pat_[0-9A-Za-z_]{22,})/ },
  { kind: 'a Slack token', re: /\bxox[abprs]-[0-9A-Za-z-]{10,}/ },
  { kind: 'a SendGrid key', re: /\bSG\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}/ },
  { kind: 'a private key', re: /-----BEGIN [A-Z ]*PRIVATE KEY( BLOCK)?-----/ },
  { kind: 'a database address with its password', re: /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis|rediss):\/\/[^\s:'"@/]+:[^\s@'"/]+@/ },
  { kind: 'a token', re: /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/, jwt: true },
  { kind: 'a value named like a secret', re: /\b[\w-]*(?:secret|password|passwd|api[_-]?key|access[_-]?token|private[_-]?key)[\w-]*["']?\s*[:=]\s*["'`]([^"'`\s]{12,})["'`]/i, generic: true },
];
const PLACEHOLDER = /^(your|my|xxx|change|replace|example|dummy|test|sample|placeholder|todo)|[<>{}$]|\*{3}|x{6}|\.\.\./i;

// What one line holds: the kinds of key on it, never the values.
export function keyKindsIn(line) {
  const found = [];
  for (const k of KEY_KINDS) {
    const m = line.match(k.re);
    if (!m) continue;
    if (k.jwt) {
      const role = jwtRole(m[0]);
      if (role === 'anon') continue; // Supabase's public key
      found.push(role === 'service_role' ? 'a Supabase service key' : k.kind);
    } else if (k.generic) {
      if (PLACEHOLDER.test(m[1]) || /process\.env|import\.meta\.env|os\.environ/.test(line)) continue;
      if (found.length) continue; // already named more exactly
      found.push(k.kind);
    } else found.push(k.kind);
  }
  return [...new Set(found)];
}

function jwtRole(token) {
  try { return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8')).role ?? null; }
  catch { return null; }
}

const git = (dir, args, max = 256 * 1024 * 1024) => {
  const r = spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8', maxBuffer: max });
  return r.status === 0 ? r.stdout : null;
};

function listFiles(root) {
  const tracked = existsSync(join(root, '.git')) ? git(root, ['ls-files', '-z']) : null;
  if (tracked != null) return { files: tracked.split('\0').filter(Boolean), git: true };
  const out = [];
  const walk = (rel) => {
    for (const name of readdirSync(join(root, rel)).sort()) {
      const p = rel ? `${rel}/${name}` : name;
      const st = lstatSync(join(root, p));
      if (st.isDirectory()) { if (!SKIP_DIRS.has(name)) walk(p); } else if (st.isFile()) out.push(p);
    }
  };
  walk('');
  return { files: out, git: false };
}

// A link is never followed: it could lead to a .env file under another name, or out of the app.
const readText = (root, p) => {
  try {
    const full = join(root, p);
    const st = lstatSync(full);
    if (!st.isFile() || st.size > MAX_BYTES) return null;
    const buf = readFileSync(full);
    return buf.includes(0) ? null : buf.toString('utf8');
  } catch { return null; }
};
const readJson = (root, p) => { try { return JSON.parse(readText(root, p)); } catch { return null; } };
const inSkipped = (p) => p.split('/').some((part) => SKIP_DIRS.has(part));

// The number that counts for a range such as "~58.0.26" (58) or "^0.74.1" (74: below 1, the minor one).
export const mainVersion = (range) => {
  const m = String(range ?? '').match(/(\d+)\.(\d+)/);
  if (!m) return null;
  return Number(m[1]) === 0 ? Number(m[2]) : Number(m[1]);
};

export function healthCheck(root, { history = false, kit = null } = {}) {
  const { files, git: isGit } = listFiles(root);
  const visible = files.filter((p) => !inSkipped(p));
  const has = (re) => visible.filter((p) => re.test(p));
  const report = { folder: root, git: isGit, files: visible.length };

  // ---- what it's built with ----
  const pkgPaths = has(/(^|\/)package\.json$/).filter((p) => p.split('/').length <= 3);
  const pkgs = pkgPaths.map((p) => ({ path: p, json: readJson(root, p) })).filter((x) => x.json);
  const deps = {};
  for (const { json } of pkgs) Object.assign(deps, json.devDependencies, json.dependencies);
  const toolsets = [];
  const add = (name, version) => toolsets.push(version ? { name, version: String(version) } : { name });
  if (deps.expo) add('Expo', deps.expo);
  if (deps['react-native']) add('React Native', deps['react-native']);
  if (deps['expo-router']) add('Expo Router', deps['expo-router']);
  for (const [dep, name] of [['next', 'Next.js'], ['vite', 'Vite'], ['react-scripts', 'Create React App'], ['@remix-run/react', 'Remix'],
    ['astro', 'Astro'], ['nuxt', 'Nuxt'], ['vue', 'Vue'], ['svelte', 'Svelte'], ['@angular/core', 'Angular'], ['react', 'React'], ['express', 'Express']]) {
    if (deps[dep]) add(name, deps[dep]);
  }
  for (const [re, name] of [[/(^|\/)pubspec\.yaml$/, 'Flutter'], [/\.xcodeproj\//, 'Xcode (native iPhone)'], [/(^|\/)build\.gradle(\.kts)?$/, 'Gradle (native Android)'],
    [/(^|\/)(requirements\.txt|pyproject\.toml)$/, 'Python'], [/(^|\/)Gemfile$/, 'Ruby'], [/(^|\/)go\.mod$/, 'Go'], [/(^|\/)Cargo\.toml$/, 'Rust'],
    [/(^|\/)composer\.json$/, 'PHP'], [/\.csproj$/, '.NET']]) {
    // Expo and React Native apps carry their own native folders; those aren't a second toolset.
    if (has(re).some((p) => !(deps['react-native'] && /^(ios|android)\//.test(p)))) add(name);
  }
  const madeWith = [];
  if (deps['lovable-tagger']) madeWith.push('Lovable');
  if (has(/^\.bolt\//).length) madeWith.push('Bolt');
  if (has(/^(\.replit|replit\.nix)$/).length) madeWith.push('Replit');
  const backends = [];
  if (deps['@supabase/supabase-js'] || has(/^supabase\//).length) backends.push('Supabase');
  if (deps.firebase || deps['firebase-admin'] || has(/^firebase\.json$/).length) backends.push('Firebase');
  if (deps['@prisma/client'] || has(/(^|\/)schema\.prisma$/).length) backends.push('Prisma (a database)');
  const names = toolsets.map((t) => t.name);
  const kind = names.includes('Expo') ? 'expo'
    : names.some((n) => ['Flutter', 'Xcode (native iPhone)', 'Gradle (native Android)', 'Python', 'Ruby', 'Go', 'Rust', 'PHP', '.NET'].includes(n)) ? 'other'
      : names.includes('React Native') ? 'other'
        : pkgs.length ? 'web-js' : visible.length ? 'other' : 'none';
  // Where an app sits: each folder whose package file names Expo, React Native or a web toolset.
  const appFolders = pkgs.filter(({ json }) => {
    const d = { ...json.devDependencies, ...json.dependencies };
    return ['expo', 'react-native', 'next', 'vite', 'react-scripts', 'astro', 'nuxt', '@angular/core', 'svelte', 'vue', 'react'].some((n) => d[n]);
  }).map(({ path }) => dirname(path));
  report.builtWith = { kind, toolsets, madeWith, backends, appFolders };

  // ---- how it runs and ships ----
  const scripts = {};
  for (const { path, json } of pkgs) for (const [k, v] of Object.entries(json.scripts ?? {})) scripts[path === 'package.json' ? k : `${dirname(path)}: ${k}`] = v;
  const workflows = has(/^\.github\/workflows\/[^/]+\.ya?ml$/).map((p) => {
    const text = readText(root, p) ?? '';
    const onPush = /\bpush\s*:/.test(text);
    const branches = [...text.matchAll(/branches\s*:\s*(\[[^\]]*\]|(?:\s*\n\s*-\s*[^\n]+)+)/g)]
      .flatMap((m) => m[1].replace(/[[\]'"]/g, '').split(/[,\n]/).map((s) => s.replace(/^\s*-\s*/, '').trim()).filter(Boolean));
    const deploys = /\b(deploy|release|publish|submit|vercel|netlify|firebase\s+deploy|eas\s+(submit|update)|fly(ctl)?\s+deploy|gh-pages|pages-deploy|wrangler)\b/i.test(text);
    return { file: p, onPush, branches: [...new Set(branches)], deploys };
  });
  const eas = readJson(root, has(/(^|\/)eas\.json$/)[0] ?? '');
  const hosting = has(/(^|\/)(vercel\.json|netlify\.toml|firebase\.json|fly\.toml|render\.yaml|Dockerfile|app\.yaml|wrangler\.toml|amplify\.yml|Procfile)$/);
  const deploysOnMainPush = workflows.some((w) => w.deploys && w.onPush && (w.branches.length === 0 || w.branches.some((b) => ['main', 'master'].includes(b))))
    || hosting.some((p) => /vercel|netlify|amplify|render/.test(p)) || madeWith.includes('Lovable');
  report.runsAndShips = {
    scripts,
    workflows,
    expo: eas ? { buildProfiles: Object.keys(eas.build ?? {}), submit: Boolean(eas.submit), workflows: has(/^(.*\/)?\.eas\/workflows\/[^/]+\.ya?ml$/) } : null,
    hosting,
    deploysOnMainPush,
  };

  // ---- what's fragile ----
  const fragile = [];
  const testFiles = has(TEST_FILE);
  const testScript = Object.entries(scripts).find(([k, v]) => /(^|: )test$/.test(k) && !/no test specified/.test(v));
  if (!testFiles.length) fragile.push({ what: 'no-tests', detail: testScript ? 'a test command but no test files' : 'no tests' });
  const locks = has(new RegExp(`(^|/)(${LOCKFILES.map((l) => l.replace('.', '\\.')).join('|')})$`));
  if (pkgs.length && !locks.length) fragile.push({ what: 'no-lockfile', detail: 'package versions are not pinned' });
  if (new Set(locks.map((l) => basename(l))).size > 1) fragile.push({ what: 'two-lockfiles', detail: locks.join(', ') });
  if (files.some((p) => p.split('/').includes('node_modules'))) fragile.push({ what: 'packages-in-code', detail: 'installed packages are kept with the code' });
  const gi = readText(root, '.gitignore');
  if (isGit && (gi == null || !/(^|\n)\s*\/?\*?\.env/.test(gi))) fragile.push({ what: 'env-not-ignored', detail: '.gitignore does not leave out .env files' });
  if (pkgs.length && !has(/(^|\/)tsconfig\.json$/).length) fragile.push({ what: 'no-type-check', detail: 'plain JavaScript, no type check' });
  const longFiles = [];
  let todos = 0;
  const keys = [];
  const envFiles = [];
  for (const p of visible) {
    if (isEnvFile(p)) { envFiles.push(p); continue; }
    if (LOCKFILES.includes(basename(p))) continue;
    const text = readText(root, p);
    if (text == null) continue;
    const lines = text.split('\n');
    if (/\.[cm]?[jt]sx?$|\.dart$|\.py$|\.swift$|\.kt$/.test(p)) {
      if (lines.length > LONG_FILE) longFiles.push({ file: p, lines: lines.length });
      todos += (text.match(/\b(TODO|FIXME|HACK|XXX)\b/g) ?? []).length;
    }
    const inTest = TEST_FILE.test(p);
    lines.forEach((line, i) => { for (const kind of keyKindsIn(line)) keys.push({ kind, file: p, line: i + 1, inTestFile: inTest }); });
  }
  if (longFiles.length) fragile.push({ what: 'long-files', detail: longFiles.sort((a, b) => b.lines - a.lines).slice(0, 5) });
  if (todos) fragile.push({ what: 'todo-notes', detail: todos });
  report.fragile = fragile;

  // ---- keys ----
  report.keys = { inCode: keys, envFilesInCode: envFiles };
  if (history && isGit) report.keys.history = scanHistory(root, new Set(keys.map((k) => `${k.kind}|${k.file}`)));

  // ---- packages ----
  report.packages = comparePackages(deps, kit);

  // ---- where a change needs care ----
  const careful = [];
  const note = (re, why) => { const hit = has(re); if (hit.length) careful.push({ why, paths: [...new Set(hit.map((p) => p.split('/').slice(0, 2).join('/')))].slice(0, 6) }); };
  note(/(^|\/)(migrations?|supabase\/migrations|prisma)\//, 'changes the shape of real users\' data');
  note(/(^|\/)(api|server|functions|supabase\/functions|backend)\//, 'runs on a server, where real users\' data is');
  note(/(^|\/)[^/]*(auth|login|signin|sign-in|session)[^/]*\.[cm]?[jt]sx?$/i, 'sign-in: a mistake can lock people out');
  note(/(^|\/)[^/]*(payment|billing|checkout|subscription|purchase|stripe|revenuecat)[^/]*\.[cm]?[jt]sx?$/i, 'money');
  note(/^\.github\/workflows\//, 'decides what happens on each push, including deploys');
  note(/(^|\/)(eas\.json|app\.json|app\.config\.[jt]s)$/, 'the app\'s store identity and build settings');
  note(/^(ios|android)\//, 'native phone code');
  note(/(^|\/)(vercel\.json|netlify\.toml|firebase\.json|fly\.toml|wrangler\.toml)$/, 'hosting settings');
  report.careful = careful;

  // ---- suggestions for the guard's settings ----
  const prodScripts = Object.entries(scripts)
    .filter(([k, v]) => !/^(deploy|release|submit|publish|ship|upload|launch)/.test(k.split(': ').pop()) && /\b(deploy|vercel|netlify|firebase\s+deploy|eas\s+(submit|update)|supabase\s+db\s+push|prisma\s+migrate\s+deploy|wrangler\s+publish|fly(ctl)?\s+deploy)\b/i.test(v))
    .map(([k]) => k.split(': ').pop());
  const hostRe = /\b[a-z0-9-]+\.(?:supabase\.co|firebaseio\.com|firebasedatabase\.app|mongodb\.net|rds\.amazonaws\.com|neon\.tech|planetscale\.com|turso\.io|upstash\.io)\b/gi;
  const hosts = new Set();
  for (const p of visible) {
    if (isEnvFile(p) || TEST_FILE.test(p) || !/\.([cm]?[jt]sx?|json|toml|ya?ml|dart|py)$/.test(p) || /(^|\/)package(-lock)?\.json$/.test(p)) continue;
    for (const m of (readText(root, p) ?? '').matchAll(hostRe)) hosts.add(m[0].toLowerCase());
  }
  report.guardHints = {
    workingBranch: deploysOnMainPush ? 'its own branch, launchwright-work' : 'main',
    productionBranches: [...new Set(workflows.filter((w) => w.deploys).flatMap((w) => w.branches).filter((b) => !['main', 'master'].includes(b) && !/[*]/.test(b)))],
    productionScripts: [...new Set(prodScripts)],
    keyFolders: [...new Set(envFiles.map((p) => dirname(p)).filter((d) => d !== '.' && d !== 'app'))],
    userDataPaths: [...new Set(has(/(^|\/)(exports?|backups?|dumps?)\/|\.(sql|sqlite|db|csv)$/i).map((p) => /\/(exports?|backups?|dumps?)\//i.test(`/${p}`) ? p.replace(/((^|.*\/)(exports?|backups?|dumps?)\/).*/i, '$1') : p))].slice(0, 10),
    userDataHosts: [...hosts].sort(),
  };
  return report;
}

function scanHistory(root, current) {
  const out = git(root, ['log', '--all', '-p', '-U0', '--no-color', '--no-ext-diff', '--format=commit %h']);
  if (out == null) return { scanned: false, reason: 'the history is too large to search here' };
  const found = new Map();
  const envEver = new Set();
  let commit = null;
  let file = null;
  for (const line of out.split('\n')) {
    if (line.startsWith('commit ')) { commit = line.slice(7).trim(); continue; }
    if (line.startsWith('+++ ')) { file = line.startsWith('+++ b/') ? line.slice(6) : null; if (file && isEnvFile(file)) envEver.add(file); continue; }
    if (!file || isEnvFile(file) || !line.startsWith('+') || line.startsWith('+++')) continue;
    for (const kind of keyKindsIn(line.slice(1))) {
      const k = `${kind}|${file}`;
      if (!found.has(k)) found.set(k, { kind, file, commit, stillInCode: current.has(k) });
    }
  }
  return { scanned: true, found: [...found.values()], envFilesEver: [...envEver].sort() };
}

function comparePackages(deps, kitFolder) {
  const kitPkg = [kitFolder && join(kitFolder, 'templates/expo-app/package.json'), join(HERE, '../../templates/expo-app/package.json')]
    .filter(Boolean).find((p) => existsSync(p));
  const kit = kitPkg ? JSON.parse(readFileSync(kitPkg, 'utf8')) : null;
  const kitDeps = kit ? { ...kit.devDependencies, ...kit.dependencies } : {};
  const compare = (name) => {
    if (!deps[name]) return null;
    const theirs = mainVersion(deps[name]);
    const ours = mainVersion(kitDeps[name]);
    return { name, theirs: deps[name], kit: kitDeps[name] ?? null, behind: theirs != null && ours != null ? ours - theirs : null };
  };
  return {
    count: Object.keys(deps).length,
    kitFound: Boolean(kit),
    compared: ['expo', 'react-native', 'react', 'expo-router', 'typescript'].map(compare).filter(Boolean),
    note: 'Other packages need the registry to compare: run the package manager\'s outdated command in the app\'s folder when the network allows.',
  };
}

// ---- command line ----
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const args = process.argv.slice(2);
  const folder = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--kit');
  const kitAt = args.indexOf('--kit');
  if (!folder || !existsSync(folder) || !statSync(folder).isDirectory() || (kitAt >= 0 && !args[kitAt + 1])) {
    console.error('Usage: node health-check.mjs <app\'s repo folder> [--history] [--kit <plugin folder>]');
    process.exit(2);
  }
  const report = healthCheck(resolve(folder), { history: args.includes('--history'), kit: kitAt >= 0 ? resolve(args[kitAt + 1]) : null });
  console.log(JSON.stringify(report, null, 2));
}
