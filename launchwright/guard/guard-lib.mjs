// The Launchwright guard's logic, apart from any hook (spec section 2.3). Plain Node with no
// packages, so it runs the same on macOS, Linux and Windows, and a port to another AI tool only
// needs its own thin hook. A kit update copies this file into each project as
// launchwright/guard/guard-lib.mjs, and the project's guard settings sit beside it in guard.json.
//
// It answers one question: given this command, file edit or file read, is it refused, and why?
// It only ever refuses. It never approves anything, and it never changes any permission setting.
//
// It does nothing at all outside a Launchwright project: a folder counts as one only when it holds
// the kit's settings file, launchwright/kit.json. Inside one, it refuses, in their ordinary forms
// and whatever the word order:
// - the hard stops a command can carry out: spending money (paid and payment services), production
//   keys, deploying to production, submitting to the stores, messages to real people, real users'
//   data, and installing software
// - printing, expanding or reading keys, and listing the environment
// - every push except to the project's working branch, history rewrites, and moving the
//   production branches
// - changing the kit's rules, the guard itself, Claude Code's settings, GitHub's and Expo's
//   workflow files (a push could otherwise start a submission or a deploy), the status files, and
//   text the user has approved
// - starting Claude Code sessions, ending programs by name, and shutting the computer down.
// It also reads the package.json scripts and shell scripts a command runs, and checks the tools of
// other services (MCP): GitHub's are for reading only, and tools named for a hard stop are refused.
// What it can't see: code in other languages run from a file (`node x.mjs`), names built up
// inside code ('AG' + 'ENTS.md'), and what installed packages' own install scripts do.
//
// Entry point for a hook: guardCall(call), which never throws. It returns the reason a call is
// refused, or null. A call is { kind, command, powershell, filePath, content, edits, glob, tool, cwd,
// projectDir }, where kind is 'shell', 'edit', 'read', 'mcp' (tool: the MCP tool's name), 'other'
// or 'unreadable'.

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const KIT_FILE = 'launchwright/kit.json';
export const SETTINGS_FILE = 'launchwright/guard/guard.json';
// The word that makes the guard answer "on": each piece's first step, in a Launchwright project.
export const CANARY = 'LAUNCHWRIGHT_GUARD_CHECK';
export const CANARY_REPLY = 'Guard check: the guard is on.';
const RULES = 'AGENTS.md';
// The guard's own folders wherever it runs from (the plugin's guard/ and hooks/), protected even
// outside the project.
const GUARD_DIRS = (() => {
  try {
    const own = dirname(fileURLToPath(import.meta.url));
    return [own, join(dirname(own), 'hooks')];
  } catch {
    return [];
  }
})();
// Files outside any project that change what git or Claude Code does there: git's settings for the
// whole computer and any repository's own settings and hooks, and Claude Code's settings, hooks,
// plugins, skills and rules (its memory and plans are fine).
const OUTSIDE_PROTECTED = /(^|\/)\.gitconfig$|\/\.config\/git\/|(^|\/)\.git\/(config|hooks\/)|\/\.claude\/(settings(\.local)?\.json|hooks\/|plugins\/|skills\/|agents\/|commands\/|rules\/|output-styles\/|CLAUDE\.md$)|(^|\/)\.claude\.json$|managed-settings\.json$|managed-mcp\.json$/i;
const underGuard = (abs) => GUARD_DIRS.some((g) => abs === g || abs.startsWith(g + sep));

// ---------- finding the Launchwright project ----------

const isFile = (p) => {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
};
const isDir = (p) => {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
};
const home = () => process.env.HOME || process.env.USERPROFILE || '';
const expandHome = (p) => (p === '~' ? home() : p.startsWith('~/') || p.startsWith('~\\') ? join(home(), p.slice(2)) : p);

// The folder holding launchwright/kit.json at or above dir, or null.
function kitAbove(dir) {
  let d = resolve(dir);
  for (let i = 0; i < 64; i++) {
    if (isFile(join(d, KIT_FILE))) return d;
    const up = dirname(d);
    if (up === d) return null;
    d = up;
  }
  return null;
}
const insideGitRepo = (dir) => {
  let d = resolve(dir);
  for (let i = 0; i < 64; i++) {
    if (existsSync(join(d, '.git'))) return true;
    const up = dirname(d);
    if (up === d) return false;
    d = up;
  }
  return false;
};
// Folders a command moves into or points git at (`cd app && …`, `git -C ../x …`).
function namedFolders(command, cwd) {
  if (typeof command !== 'string') return [];
  const out = [];
  for (const m of command.matchAll(/(?:^|[\s;&|(])(?:cd|pushd|chdir|set-location|sl)\s+(?:-[A-Za-z]+\s+)*(["']?)([^\s"';&|)]+)\1/gi)) out.push(m[2]);
  for (const m of command.matchAll(/\s(?:-C|--git-dir|--work-tree)(?:\s+|=)(["']?)([^\s"';&|)]+)\1/g)) out.push(m[2]);
  return out.filter((p) => !/[$`*?]/.test(p) && p !== '-').map((p) => resolve(cwd, expandHome(p)));
}
// Folders named anywhere in a shell command as a path (`rm -rf /home/me/my-app`, `mv ../my-app
// /tmp`, `--out=/x/y`): words with a slash, or starting with `~` or `.`. A word with a wildcard
// counts up to its last plain folder (`/home/me/my-*` names /home/me). P3.R6.fix1: without this,
// a command run from outside every project could remove one by its full path.
function namedPaths(command, cwd) {
  if (typeof command !== 'string') return [];
  const out = new Set();
  for (const m of command.slice(0, 20000).matchAll(/"([^"]*)"|'([^']*)'|([^\s;&|()<>"'`]+)/g)) {
    for (let w of (m[1] ?? m[2] ?? m[3]).split('=')) {
      w = w.replace(/\\/g, '/');
      if (!w || /:\/\/|[$`]/.test(w) || !/[/]|^[~.]/.test(w)) continue;
      const wild = w.search(/[*?[{]/);
      if (wild >= 0) w = w.slice(0, w.lastIndexOf('/', wild) + 1) || '.';
      out.add(resolve(cwd, expandHome(w)));
      if (out.size >= 100) return [...out];
    }
  }
  return [...out];
}
// A folder's Launchwright projects one level down (a session started above its clones, or a
// command that names the folder holding a project).
function kitsBelow(dir) {
  let names = [];
  try {
    names = readdirSync(dir);
  } catch {
    return [];
  }
  return names.slice(0, 200).filter((n) => isFile(join(dir, n, KIT_FILE))).map((n) => join(dir, n));
}
// Every Launchwright project a call can reach: above the session's folders, above the file it
// edits or the folders its command moves into, and, when the session started above any repo
// (a cloud session starts one folder above its clones), in the folders just below.
export function findProjects(call = {}) {
  const cwd = typeof call.cwd === 'string' && call.cwd ? call.cwd : process.cwd();
  const starts = [call.projectDir, cwd].filter((d) => typeof d === 'string' && d);
  const from = [...starts];
  if (typeof call.filePath === 'string' && call.filePath.trim()) from.push(dirname(resolve(cwd, expandHome(call.filePath.trim()))));
  from.push(...namedFolders(call.command, cwd));
  const roots = new Set();
  for (const d of from) {
    const r = kitAbove(d);
    if (r) roots.add(r);
  }
  if (call.kind !== 'edit' && call.kind !== 'read' && !insideGitRepo(cwd)) {
    for (const d of new Set(starts.map((s) => resolve(s)))) for (const r of kitsBelow(d)) roots.add(r);
  }
  // Every path a shell command names: a project above it, or just below it.
  for (const d of namedPaths(call.command, cwd)) {
    const r = kitAbove(d);
    if (r) roots.add(r);
    for (const k of kitsBelow(d)) roots.add(k);
  }
  return [...roots];
}

// ---------- the project's settings (launchwright/guard/guard.json) ----------
// Settings only ever add to what the guard refuses, so a missing guard.json leaves the built-in
// rules in force. Lists below are added to the built-in ones.
const SETTING_KINDS = {
  workingBranch: 'branch', // the one branch agents push to; null when a push to it builds or deploys
  productionBranches: 'list', // branches that deploy to production
  keyNames: 'names', // names of this project's keys in the environment
  keyFolders: 'list', // folders besides the project folder that hold `.env` files
  userDataPaths: 'list', // files and folders holding real users' data
  userDataHosts: 'list', // hosts that hold real users' data (production databases and APIs)
  productionScripts: 'list', // package.json scripts that deploy, release, update or submit
  protectedPaths: 'list', // more files and folders only a kit update or the user changes
  approvedText: 'list', // text the user has approved: never changed without asking again
  refusedPrograms: 'reasons', // more programs agents don't run, with the reason they see
  refusedHosts: 'reasons', // more hosts agents don't reach, with the reason they see
  easWorkflows: 'list', // Expo workflow files agents may start with `eas workflow:run`
  tests: 'tests', // this project's own cases, for guard-test.mjs
};
const LISTS_THAT_RELAX = ['easWorkflows']; // the only list that lets more through as it grows

export function settingsProblems(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return ['it must hold one JSON object'];
  const problems = [];
  const textList = (v) => Array.isArray(v) && v.every((x) => typeof x === 'string' && x.trim() !== '');
  for (const [key, v] of Object.entries(raw)) {
    if (key.startsWith('//')) continue;
    const kind = SETTING_KINDS[key];
    if (!kind) problems.push(`"${key}" isn't a guard setting (a typo?)`);
    else if (kind === 'branch' && v !== null && !(typeof v === 'string' && /^[\w./-]+$/.test(v))) problems.push(`"${key}" must be a branch name, or null`);
    else if ((kind === 'list' || kind === 'names') && !textList(v)) problems.push(`"${key}" must be a list of text`);
    else if (kind === 'names' && v.some((x) => !/^[A-Za-z_][A-Za-z0-9_]*$/.test(x))) problems.push(`"${key}" must hold environment variable names`);
    else if (kind === 'reasons' && !(v && typeof v === 'object' && !Array.isArray(v) && Object.values(v).every((x) => typeof x === 'string' && x.trim())))
      problems.push(`"${key}" must map names to the reasons agents see`);
    else if (kind === 'tests' && !(v && typeof v === 'object' && !Array.isArray(v) && ['refused', 'allowed'].every((k) => v[k] === undefined || (Array.isArray(v[k]) && v[k].every((x) => typeof x === 'string')))))
      problems.push(`"${key}" must hold "refused" and "allowed" lists of commands`);
  }
  if (!problems.length && typeof raw.workingBranch === 'string' && [...BUILT_IN_PRODUCTION, ...(raw.productionBranches ?? [])].some((b) => b.toLowerCase() === raw.workingBranch.toLowerCase()))
    problems.push(`the working branch ("${raw.workingBranch}") is also a production branch: if a push to it deploys, set "workingBranch" to null`);
  return problems;
}

// Whether new settings only add to what the guard refuses. Agents may record the user's answers
// (a key's name, where real users' data lives, text the user approved) with a file edit, but
// never take anything away. Returns the reason the change is refused, or null.
export function onlyTightens(before, after) {
  const problems = settingsProblems(after);
  if (problems.length) return `that would leave the guard's settings with problems: ${problems.join('; ')}`;
  const b = before && typeof before === 'object' && !Array.isArray(before) ? before : {};
  const lower = (x) => String(x).toLowerCase();
  for (const [key, kind] of Object.entries(SETTING_KINDS)) {
    if (kind === 'tests') continue;
    if (kind === 'branch') {
      const was = b[key] === undefined ? 'main' : b[key];
      const now = after[key] === undefined ? 'main' : after[key];
      if (was !== now && now !== null) return `the working branch can't be changed by an agent ("${was}" to "${now}")`;
      continue;
    }
    if (kind === 'reasons') {
      const was = b[key] || {};
      const now = after[key] || {};
      const gone = Object.keys(was).filter((k) => !Object.keys(now).some((n) => lower(n) === lower(k)));
      if (gone.length) return `"${key}" may only grow: ${gone.join(', ')} would be taken out`;
      continue;
    }
    const was = (b[key] || []).map(lower);
    const now = (after[key] || []).map(lower);
    if (LISTS_THAT_RELAX.includes(key)) {
      const added = now.filter((x) => !was.includes(x));
      if (added.length) return `"${key}" lets agents start more, so only the user adds to it: ${added.join(', ')}`;
    } else {
      const gone = was.filter((x) => !now.includes(x));
      if (gone.length) return `"${key}" may only grow: ${gone.join(', ')} would be taken out`;
    }
  }
  return null;
}

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
export function loadSettings(root) {
  const file = join(root, SETTINGS_FILE);
  let raw = {};
  if (existsSync(file)) {
    try {
      raw = readJson(file);
    } catch (e) {
      return { error: `its settings file (${SETTINGS_FILE}) isn't valid JSON (${e.message})` };
    }
    const problems = settingsProblems(raw);
    if (problems.length) return { error: `its settings file (${SETTINGS_FILE}) has problems: ${problems.join('; ')}` };
  }
  let kit = {};
  try {
    kit = readJson(join(root, KIT_FILE));
  } catch {
    // kit.json only marks the project; its contents may be anything
  }
  return { settings: raw, kit: kit && typeof kit === 'object' ? kit : {} };
}

// ---------- the built-in rules ----------

const BUILT_IN_PRODUCTION = ['release', 'production'];
// Folders and files at the project's top, only a kit update or the user changes: the kit
// (except kit.json and guard.json, which file edits may add the user's answers to), GitHub's and
// Expo's workflows, and the status files (only the status script writes them).
const BUILT_IN_PROTECTED = ['launchwright', '.eas/workflows', '.github', 'status'];
// The first folder of every place the guard keeps agents out of, lower-case: the kit's own and a
// project's settings (protected paths, approved text, real users' data). The kit's setup refuses a
// working branch named after one (P3.R6.fix1), so a branch never reads as one of these folders.
export function protectedTops(settings = {}) {
  const places = [...BUILT_IN_PROTECTED, ...(settings.protectedPaths ?? []), ...(settings.approvedText ?? []), ...(settings.userDataPaths ?? [])];
  return [...new Set(places.map((p) => String(p).replace(/\\/g, '/').replace(/^\.\//, '').split('/')[0].toLowerCase()).filter((x) => x && x !== '.' && x !== '..'))];
}
// Names anywhere: the agents' rules, Claude Code's settings, hooks, skills and the like, git's own
// folder (its settings, hooks, branches and history), git's settings for the whole computer
// (~/.gitconfig, ~/.config/git/), and MCP servers.
const PROTECTED_NAMES = /(^|[\s"'=:(<>\\/])(\.claude([\\/]|$)|CLAUDE(\.local)?\.md|AGENTS\.md|\.mcp\.json|\.git[\\/]+[\w.-]|\.gitconfig\b|\.config[\\/]+git([\\/]|$)|\.husky([\\/]|$))/i;
// A stale lock file in git's folder, which removing is fine (`rm -f .git/index.lock`).
const GIT_LOCK = /(^|[\\/])\.git[\\/]+([\w.-]+[\\/]+)*[\w.-]+\.lock$/i;
const PROTECTED_FOLDER = /(^|[\s"'=:(<>\\/])\.(claude|git|husky)[\\/]*$/i;
const PROTECTED_REASON = `The project's rules and the guard (AGENTS.md, CLAUDE.md, launchwright/, .claude/, git's hooks and settings) change only by a kit update the user accepts: read them, and say in your report what should change (${RULES}).`;
const SERVICE_REASON = (p) =>
  `\`${p}\` reaches a hosting, cloud or payment service, where a command can deploy to production, spend money or touch real users' data: that's the user's step. Prepare it and ask for their go-ahead (${RULES}).`;
const STORE_REASON = `Uploading to the App Store or Google Play, and submitting, are the user's steps: prepare everything and ask them (${RULES}).`;
const MESSAGE_REASON = `Messages to real people are the user's to send: draft it for them (${RULES}).`;
const PUBLISH_REASON = `Publishing a package or a release is the user's step (${RULES}).`;
const BUILT_IN_PROGRAMS = {
  stripe: SERVICE_REASON('stripe'), aws: SERVICE_REASON('aws'), gcloud: SERVICE_REASON('gcloud'), gsutil: SERVICE_REASON('gsutil'), bq: SERVICE_REASON('bq'), az: SERVICE_REASON('az'),
  doctl: SERVICE_REASON('doctl'), heroku: SERVICE_REASON('heroku'), fly: SERVICE_REASON('fly'), flyctl: SERVICE_REASON('flyctl'), railway: SERVICE_REASON('railway'),
  vercel: SERVICE_REASON('vercel'), netlify: SERVICE_REASON('netlify'), firebase: SERVICE_REASON('firebase'), surge: SERVICE_REASON('surge'), amplify: SERVICE_REASON('amplify'),
  render: SERVICE_REASON('render'), 'gh-pages': SERVICE_REASON('gh-pages'), terraform: SERVICE_REASON('terraform'), pulumi: SERVICE_REASON('pulumi'), kubectl: SERVICE_REASON('kubectl'),
  revenuecat: SERVICE_REASON('revenuecat'),
  fastlane: STORE_REASON, deliver: STORE_REASON, pilot: STORE_REASON, supply: STORE_REASON, altool: STORE_REASON, transporter: STORE_REASON, itmstransporter: STORE_REASON,
  testflight: STORE_REASON,
  mail: MESSAGE_REASON, mailx: MESSAGE_REASON, sendmail: MESSAGE_REASON, mutt: MESSAGE_REASON, msmtp: MESSAGE_REASON, ssmtp: MESSAGE_REASON, swaks: MESSAGE_REASON, twilio: MESSAGE_REASON,
  np: PUBLISH_REASON, 'release-it': PUBLISH_REASON, 'semantic-release': PUBLISH_REASON,
};
// Words after these programs that only print help or a version.
const HELP_WORDS = ['--version', '-v', '-V', '--help', '-h', 'help', 'version'];
const HOST_SERVICE = (what) => `Reaching ${what} from the command line is the user's step: the app's own code does it, with the user's go-ahead (${RULES}).`;
const BUILT_IN_HOSTS = {
  'api.github.com': `GitHub's API can merge, release or start workflows: push with git to the working branch instead (${RULES}).`,
  'uploads.github.com': `GitHub's API can merge, release or start workflows: push with git to the working branch instead (${RULES}).`,
  'api.anthropic.com/v1/claude_code': `Only the user starts Claude Code sessions and scheduled tasks (${RULES}).`,
  'api.expo.dev': `Expo's API can submit, update or deploy: builds start with a push, and the rest is the user's (${RULES}).`,
  'exp.host': `Expo's push service sends notifications to real people: the user's step (${RULES}).`,
  'fcm.googleapis.com': HOST_SERVICE('a push notification service'),
  'api.push.apple.com': HOST_SERVICE('a push notification service'),
  'onesignal.com': HOST_SERVICE('a push notification service'),
  'api.stripe.com': HOST_SERVICE('a payment service'),
  'api.revenuecat.com': HOST_SERVICE('a payment service'),
  'api.paddle.com': HOST_SERVICE('a payment service'),
  'api.lemonsqueezy.com': HOST_SERVICE('a payment service'),
  'api.twilio.com': MESSAGE_REASON, 'api.sendgrid.com': MESSAGE_REASON, 'api.mailgun.net': MESSAGE_REASON, 'api.postmarkapp.com': MESSAGE_REASON,
  'api.resend.com': MESSAGE_REASON, 'api.brevo.com': MESSAGE_REASON, 'hooks.slack.com': MESSAGE_REASON, 'discord.com/api/webhooks': MESSAGE_REASON,
  'api.telegram.org': MESSAGE_REASON, 'graph.facebook.com': MESSAGE_REASON,
  'api.appstoreconnect.apple.com': STORE_REASON, 'appstoreconnect.apple.com': STORE_REASON, 'androidpublisher.googleapis.com': STORE_REASON,
  'ntfy.sh': `Phone alerts go out only through the kit's alert script (${RULES}).`,
};
// Keys that are always keys, whatever the project: never printed, expanded or looked up.
const BUILT_IN_KEYS = ['EXPO_TOKEN', 'NTFY_TOPIC', 'GITHUB_TOKEN', 'GH_TOKEN', 'ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'STRIPE_SECRET_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_ACCESS_TOKEN', 'VERCEL_TOKEN', 'NETLIFY_AUTH_TOKEN', 'FIREBASE_TOKEN', 'AWS_SECRET_ACCESS_KEY', 'NPM_TOKEN', 'CLAUDE_CODE_OAUTH_TOKEN'];
// A name that looks like a key's (`STRIPE_SECRET_KEY`, `MY_API_TOKEN`, `DB_PASSWORD`).
const KEYISH = /^[A-Za-z0-9_]*(SECRET|TOKEN|PASSWORD|PASSWD|PRIVATE|API_?KEY|ACCESS_?KEY|CREDENTIAL|_KEY$|_PAT$|DSN$|DATABASE_URL|DB_URL)[A-Za-z0-9_]*$/i;
const BUILT_IN_PRODUCTION_SCRIPTS = /^(deploy|release|submit|publish|ship|upload|launch)([:_-]|$)/i;

// ---------- reading a command ----------

// Remove heredoc bodies from the command text and return them separately: they are data (or code
// for an interpreter), so they are scanned for secrets but not split into commands.
function splitHeredocs(command) {
  const bodies = [];
  const lines = command.split(/\r?\n/);
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    out.push(line);
    const m = line.match(/(?:^|[^<])<<-?\s*(['"]?)([A-Za-z_][\w-]*)\1/);
    i += 1;
    if (m) {
      const end = m[2];
      const body = [];
      while (i < lines.length && lines[i].trim() !== end) body.push(lines[i++]);
      i += 1; // the closing delimiter
      bodies.push(body.join('\n'));
    }
  }
  return { text: out.join('\n'), bodies };
}

// Commands inside $( … ), <( … ) and backticks, checked on their own as well.
function innerCommands(text) {
  const found = [];
  for (let i = 0; i < text.length; i++) {
    if ((text[i] === '$' || text[i] === '<' || text[i] === '>') && text[i + 1] === '(') {
      let depth = 1;
      let j = i + 2;
      while (j < text.length && depth > 0) {
        if (text[j] === '(') depth++;
        else if (text[j] === ')') depth--;
        j++;
      }
      found.push(text.slice(i + 2, j - 1));
      i = j - 1;
    } else if (text[i] === '`') {
      const j = text.indexOf('`', i + 1);
      if (j < 0) break;
      found.push(text.slice(i + 1, j));
      i = j;
    }
  }
  return found;
}

// The program name of a word: no folder, no .exe/.cmd, no @version (npx eas-cli@latest → eas-cli).
const base = (w) =>
  w.replace(/\\/g, '/').split('/').pop().toLowerCase().replace(/\.(exe|cmd|bat|ps1)$/, '').replace(/(.)@[^@]*$/, '$1');

// Single quotes stop the shell from running anything inside them. So the single-quoted message of
// a git commit, tag or stash, and the single-quoted code of a node, deno or bun one-liner (checked
// on its own, in inlineCode), are blanked before looking for commands in `$( … )` and backticks.
// Only in a command with no brackets, braces or backticks outside single quotes.
function quietQuoted(command) {
  if (!command.includes("'")) return command;
  let out = '';
  let part = '';
  let spans = [];
  let runs = false;
  let dq = false;
  const flush = () => {
    out += quietPart(part, spans, runs);
    part = '';
    spans = [];
    runs = false;
  };
  for (let i = 0; i < command.length; i++) {
    const c = command[i];
    if (c === "'" && !dq) {
      const j = command.indexOf("'", i + 1);
      if (j < 0) {
        part += command.slice(i);
        break;
      }
      spans.push([part.length, part.length + j - i + 1]);
      part += command.slice(i, j + 1);
      i = j;
      continue;
    }
    if (c === '\\' && i + 1 < command.length) {
      part += command.slice(i, i + 2);
      i += 1;
      continue;
    }
    if (c === '"') dq = !dq;
    else if ('`(){}'.includes(c)) runs = true;
    else if (!dq && ';|&\n'.includes(c)) {
      flush();
      out += c;
      continue;
    }
    part += c;
  }
  flush();
  return out;
}
function quietPart(part, spans, runs) {
  if (runs || !spans.length) return part;
  const words = part.trim().split(/\s+/);
  const name = base(words[0] || '');
  let flag = null;
  if (name === 'git' && ['commit', 'tag', 'stash'].includes(gitSub(words) || '')) flag = /(^|\s)(-[aefklnpqsuvz]*m|--message=?)\s*$/;
  else if (['node', 'deno', 'bun'].includes(name)) flag = /(^|\s)(-e|-p|-pe|--eval=?|--print=?)\s*$/;
  if (!flag) return part;
  let out = '';
  let at = 0;
  for (const [start, end] of spans) {
    out += part.slice(at, start) + (flag.test(part.slice(0, start)) ? "''" : part.slice(start, end));
    at = end;
  }
  return out + part.slice(at);
}

// Split a command line into segments at && || ; | & and newlines, then into words. Quotes are
// honored: quoted text stays in one word. A backslash keeps the next character in the word (so
// `gi\t` is `git`). `2>&1`, `&>` and `>&` are not separators.
function segments(command) {
  const out = [];
  let words = [];
  let word = '';
  let quote = null;
  let started = false;
  const pushWord = () => {
    if (started) words.push(word);
    word = '';
    started = false;
  };
  const pushSegment = () => {
    pushWord();
    if (words.length) out.push(words);
    words = [];
  };
  for (let i = 0; i < command.length; i++) {
    const c = command[i];
    if (quote) {
      if (c === quote) quote = null;
      else if (c === '\\' && quote === '"' && i + 1 < command.length && '"\\$`'.includes(command[i + 1])) word += command[++i];
      else word += c;
      continue;
    }
    if (c === '\\' && i + 1 < command.length) {
      if (command[i + 1] === '\n') { i++; continue; }
      word += command[++i];
      started = true;
      continue;
    }
    if (c === '"' || c === "'") { quote = c; started = true; continue; }
    if (c === '&') {
      if (command[i - 1] === '>' || command[i + 1] === '>') { word += c; started = true; continue; }
      pushSegment();
      if (command[i + 1] === '&') i++;
      continue;
    }
    if (c === '|') { pushSegment(); if (command[i + 1] === '|') i++; continue; }
    if (c === ';' || c === '\n' || c === '\r') { pushSegment(); continue; }
    if (c === ' ' || c === '\t') { pushWord(); continue; }
    word += c;
    started = true;
  }
  pushSegment();
  return out;
}

// The shell's brace lists (`rm -rf {launchwright,x}` removes launchwright and x), in words
// without spaces; at most 64 words from one.
function expandBraces(word) {
  if (!/\{[^{}\s]*,[^{}\s]*\}/.test(word)) return [word];
  const out = [word];
  for (let i = 0; i < out.length && out.length < 64; i++) {
    const m = out[i].match(/^(.*?)\{([^{}\s]*,[^{}\s]*)\}(.*)$/s);
    if (!m) continue;
    out.splice(i, 1, ...m[2].split(',').map((x) => m[1] + x + m[3]));
    i -= 1;
  }
  return out;
}
const indexesOf = (words, names) => words.map((w, i) => (names.includes(base(w)) ? i : -1)).filter((i) => i >= 0);
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Git settings that change where a push goes or make later git commands run a program.
// Of core.*, only the keys that run a program or move the repository (core.quotepath is fine).
const RISKY_GIT_KEYS = /^(alias|remote|branch|push|url|credential|include|includeif|filter|diff|difftool|merge|mergetool|gpg|pager|http|protocol|uploadpack|receive|submodule|sequence)\.|^core\.(sshcommand|pager|editor|hookspath|fsmonitor|gitproxy|askpass|worktree|bare|attributesfile|alternaterefscommand)$/i;
// Global git options whose value is the next word.
const GIT_OPTS_WITH_VALUE = ['-C', '--git-dir', '--work-tree', '--namespace', '--super-prefix', '--exec-path'];
// Variables that point git at other settings, another repository or other programs.
const GIT_ENV = /^GIT_(CONFIG[A-Z0-9_]*|SSH_COMMAND|SSH|SSH_VARIANT|PROXY_COMMAND|EXEC_PATH|ASKPASS|DIR|WORK_TREE|COMMON_DIR|NAMESPACE|TEMPLATE_DIR|EXTERNAL_DIFF|INDEX_FILE|OBJECT_DIRECTORY|ALTERNATE_OBJECT_DIRECTORIES)=/i;

// Redirections (`2>&1`, `>out.txt`, `> out.txt`) aren't arguments.
function withoutRedirections(args) {
  const out = [];
  for (let k = 0; k < args.length; k++) {
    const a = args[k];
    if (/^(\d|&)?>>?(&\d+|&-)?$/.test(a) || /^\d*<$/.test(a)) { if (!/&(\d+|-)$/.test(a)) k += 1; continue; }
    if (/^(\d|&)?>>?\S+$/.test(a) || /^\d*<\S+$/.test(a)) continue;
    out.push(a);
  }
  return out;
}
function gitSub(words) {
  const i = words.findIndex((w) => base(w) === 'git');
  if (i < 0) return null;
  let j = i + 1;
  while (j < words.length && words[j].startsWith('-')) j += GIT_OPTS_WITH_VALUE.includes(words[j]) || words[j] === '-c' || words[j] === '--config-env' ? 2 : 1;
  return (words[j] || '').toLowerCase();
}
// The places of the words in a git command that name branches, tags or remotes, never files:
// every plain word after `git push|fetch|pull|switch|branch|merge|tag`, and the new branch (and
// its start point) after `-b`/`-B` in `git checkout` or `git worktree add`. P3.R6.fix1: a branch
// called `launchwright` or `status` was read as the kit's folder of that name.
const GIT_REF_ONLY = ['push', 'fetch', 'pull', 'switch', 'branch', 'merge', 'tag'];
const GIT_FILE_OPTS = ['-F', '--file', '--git-dir', '--work-tree', '-C'];
function gitRefWords(words) {
  const out = new Set();
  const i = words.findIndex((w) => base(w) === 'git');
  if (i < 0) return out;
  let j = i + 1;
  while (j < words.length && words[j].startsWith('-')) j += GIT_OPTS_WITH_VALUE.includes(words[j]) || words[j] === '-c' || words[j] === '--config-env' ? 2 : 1;
  const sub = (words[j] || '').toLowerCase();
  const end = words.findIndex((w, k) => k > j && (w === '--' || /^(\d|&)?[<>]/.test(w)));
  const args = words.slice(j + 1, end < 0 ? words.length : end).map((w, k) => [w, j + 1 + k]);
  const plain = ([w, k]) => !w.startsWith('-') && !GIT_FILE_OPTS.includes(words[k - 1]);
  if (GIT_REF_ONLY.includes(sub)) for (const a of args) if (plain(a)) out.add(a[1]);
  if (sub === 'checkout' && args.some(([w]) => ['-b', '-B'].includes(w))) for (const a of args) if (plain(a)) out.add(a[1]);
  if (sub === 'worktree') for (const [w, k] of args) if (['-b', '-B'].includes(words[k - 1]) && !w.startsWith('-')) out.add(k);
  return out;
}

const SHELL_KEYWORDS = ['then', 'do', 'else', 'elif', 'if', 'while', 'until', '{', '(', '!'];
const LEADING = new Set([...SHELL_KEYWORDS, '}', ')', 'time', 'done', 'fi', 'esac', 'in']);
function stripLead(words) {
  let k = 0;
  while (k < words.length && LEADING.has(words[k])) k += 1;
  return k ? words.slice(k) : words;
}
// The program a segment runs: past variable assignments and wrappers such as `npx` or `env`.
function program(words) {
  let k = 0;
  while (k < words.length) {
    const w = words[k];
    const b = base(w);
    if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(w)) { k += 1; continue; }
    if (['env', 'cross-env', 'command', 'builtin', 'exec', 'time', 'nohup', 'nice', 'bunx'].includes(b)) {
      k += 1;
      while (b === 'env' && k < words.length && words[k].startsWith('-')) k += ['-u', '--unset', '-C', '--chdir', '-S'].includes(words[k]) ? 2 : 1;
      continue;
    }
    if (b === 'npx') {
      k += 1;
      while (k < words.length && words[k].startsWith('-')) k += ['-p', '--package'].includes(words[k]) ? 2 : 1;
      continue;
    }
    if (['pnpm', 'yarn'].includes(b) && ['dlx', 'exec'].includes((words[k + 1] || '').toLowerCase())) { k += 2; continue; }
    if (b === 'bundle' && (words[k + 1] || '').toLowerCase() === 'exec') { k += 2; continue; }
    if (b === 'xcrun') { k += 1; continue; }
    return b;
  }
  return '';
}
// The word naming the program a segment runs, as written (`$(echo git)`, `"$G"`), or ''.
function programWord(words) {
  let k = 0;
  while (k < words.length && (/^[A-Za-z_][A-Za-z0-9_]*=/.test(words[k]) || ['env', 'command', 'builtin', 'exec', 'time', 'nohup', 'nice', 'sudo'].includes(base(words[k])))) {
    k += 1;
    while (k < words.length && words[k].startsWith('-')) k += 1;
  }
  return words[k] || '';
}
const COMPUTED_REASON = `A command whose program or git action comes from a variable or another command can't be checked: write it out (${RULES}).`;
// Programs that start the program named after their own options, such as `timeout 600 claude`.
const LAUNCHERS = ['timeout', 'gtimeout', 'start', 'start-process', 'saps', 'setsid', 'stdbuf', 'watch', 'runas', 'call', 'xcrun', 'nohup', 'nice', 'script'];
function launched(words) {
  const i = words.findIndex((w) => LAUNCHERS.includes(base(w)));
  if (i < 0) return null;
  for (let k = i + 1; k < words.length; k++) {
    const w = words[k];
    if (w.startsWith('-') || /^\/\w{1,2}$/.test(w) || /^\d+(\.\d+)?[smhd]?$/.test(w) || /^[A-Za-z_][A-Za-z0-9_]*=/.test(w)) continue;
    return base(w);
  }
  return null;
}
// The command `xargs`, `parallel` or `find -exec` runs for each line or file.
const XARGS_VALUE_OPTS = ['-n', '-I', '-i', '-P', '-L', '-l', '-d', '-E', '-e', '-s', '-a', '--max-args', '--max-procs', '--delimiter', '--arg-file', '-j', '--jobs'];
function perItemCommands(words) {
  const out = [];
  words.forEach((w, i) => {
    const b = base(w);
    if (b === 'xargs' || b === 'parallel') {
      let k = i + 1;
      while (k < words.length && words[k].startsWith('-')) k += XARGS_VALUE_OPTS.includes(words[k]) ? 2 : 1;
      if (words[k]) out.push(base(words[k]));
    }
    if (['-exec', '-execdir', '-ok', '-okdir'].includes(w) && words[i + 1]) out.push(base(words[i + 1]));
  });
  return out;
}
const PACKAGE_MANAGERS = ['npm', 'pnpm', 'yarn', 'bun'];
const PM_COMMANDS = [
  'install', 'i', 'add', 'remove', 'rm', 'uninstall', 'un', 'update', 'up', 'upgrade', 'ci', 'clean-install', 'install-test', 'it', 'cit', 'exec', 'dlx', 'x',
  'ls', 'list', 'view', 'info', 'show', 'why', 'explain', 'outdated', 'audit', 'init', 'create', 'link', 'unlink', 'pack', 'config', 'set', 'get', 'cache',
  'prune', 'dedupe', 'rebuild', 'version', 'help', 'login', 'logout', 'whoami', 'fund', 'doctor', 'pkg', 'query', 'search', 'patch', 'patch-commit', 'store',
  'import', 'workspace', 'workspaces', 'publish', 'unpublish', 'test', 't', 'start', 'run', 'run-script', 'stop', 'restart', 'adduser', 'token',
];
// Every program a command can start: its own, the one a launcher or `xargs` starts, and a
// package's command run through a package manager (`pnpm x`, `npm exec x`, `bun x x`).
function programsRun(words) {
  const out = new Set([program(words), launched(words) || ''].filter(Boolean));
  for (const c of perItemCommands(words)) out.add(c);
  words.forEach((w, i) => {
    const b = base(w);
    if (!PACKAGE_MANAGERS.includes(b) && b !== 'bunx' && b !== 'npx') return;
    let k = i + 1;
    while (k < words.length && words[k].startsWith('-')) k += ['-p', '--package', '-w', '--workspace', '--filter', '-F', '--prefix', '-C', '--cwd', '--dir'].includes(words[k]) ? 2 : 1;
    const first = (words[k] || '').toLowerCase();
    if (b === 'npx' || b === 'bunx') {
      if (words[k]) out.add(base(words[k]));
    } else if (['x', 'exec', 'dlx'].includes(first)) {
      let j = k + 1;
      while (j < words.length && words[j].startsWith('-')) j += ['-p', '--package'].includes(words[j]) ? 2 : 1;
      if (words[j]) out.add(base(words[j]));
    } else if (first === 'workspace' && words[k + 2]) out.add(base(words[k + 2]));
    else if (first && b !== 'npm' && !PM_COMMANDS.includes(first)) out.add(base(words[k]));
  });
  return [...out];
}
// The package.json script a command runs (`npm run deploy`, `yarn deploy`, `pnpm run deploy`), or null.
function scriptsRun(words) {
  const out = [];
  words.forEach((w, i) => {
    if (!PACKAGE_MANAGERS.includes(base(w))) return;
    const rest = words.slice(i + 1).filter((x, k, all) => !x.startsWith('-') && !['-w', '--workspace', '--filter', '-F', '--prefix', '-C', '--cwd', '--dir'].includes(all[k - 1])).map((x) => x.toLowerCase());
    if (!rest.length) return;
    let at = 0;
    if (rest[0] === 'workspace') at = 2;
    if (['run', 'run-script', 'rum', 'urn'].includes(rest[at])) out.push(rest[at + 1] || '');
    else if (base(w) === 'npm') { if (['start', 'test', 't', 'tst', 'stop', 'restart'].includes(rest[at])) out.push(rest[at]); }
    else if (!PM_COMMANDS.includes(rest[at])) out.push(rest[at] || '');
  });
  return out.filter(Boolean);
}
// Interpreters that run code given on their command line or on standard input. Code that starts
// other programs would run commands this guard never sees.
const INTERPRETERS = ['node', 'python', 'python3', 'py', 'deno', 'bun', 'tsx', 'ts-node', 'ruby', 'perl', 'php', 'osascript', 'lua'];
const SCRIPT_RUNNERS = ['node', 'tsx', 'ts-node', 'bun', 'deno'];
function inlineCode(words) {
  for (let k = 0; k < words.length; k++) {
    const name = base(words[k]);
    if (!INTERPRETERS.includes(name)) continue;
    for (let j = k + 1; j < words.length; j++) {
      const w = words[j];
      if (['-e', '--eval', '-p', '--print', '-c', '-E', '-pe', '-ne', '-r'].includes(w) || (name === 'deno' && w === 'eval')) return { name, code: words.slice(j + 1).join(' ') };
      if (/^--(eval|print)=/.test(w)) return { name, code: [w.slice(w.indexOf('=') + 1), ...words.slice(j + 1)].join(' ') };
      if (!w.startsWith('-')) break;
    }
  }
  return null;
}
function readsStdin(words) {
  const k = words.findIndex((w) => INTERPRETERS.includes(base(w)));
  if (k < 0 || inlineCode(words)) return null;
  const first = withoutRedirections(words.slice(k + 1)).find((w) => !w.startsWith('-') || w === '-');
  return first === undefined || first === '-' ? base(words[k]) : null;
}
const RUNS_PROGRAMS = /child_process|process\.(binding|_linkedBinding)\b|\bsubprocess\b|\bos\.(system|popen|exec\w*|spawn\w*)\b|\.system\s*\(|\bpopen\b|__import__|\bimportlib\b|\bfrom\s+(os|pty)\s+import\b|\bpty\.spawn\b|\bDeno\.(run|Command)\b|\bBun\.(spawn\w*|\$)|@anthropic-ai[\\/]+claude-code|\bshell_exec\b|\bproc_open\b|\bdo shell script\b|\bos\.execute\b|\bio\.popen\b/;
const RUNS_PROGRAMS_RUBY_PERL = /\b(system|exec|spawn|fork)\b|IO\.popen|Open3|`|%x/;
const startsPrograms = (name, code) => RUNS_PROGRAMS.test(code) || (['ruby', 'perl', 'php'].includes(name) && RUNS_PROGRAMS_RUBY_PERL.test(code));
const INTERPRETER_REASON = `Starting other programs from inside a node, python or similar one-liner skips the guard's checks: run the command directly (${RULES}).`;
// Code that prints every environment variable at once (`console.log(process.env)`, `print(os.environ)`).
const DUMPS_ENV_CODE = /process\.env(?!\s*(\?\.|[.[\w]))|process\s*\[\s*['"`]env['"`]\s*\](?!\s*(\?\.|[.[\w]))|\bos\.environ(?!\s*[.[\w])|\bos\.environ\s*\.\s*(copy|items|values)\s*\(|\bDeno\.env\.toObject\b|\bBun\.env(?!\s*(\?\.|[.[\w]))|\bENV\.(to_h|to_a|inspect|each)\b|%ENV\b|\bgetenv\(\s*\)|\$_ENV\b|\$_SERVER\b/;
// Ruby's ENV on its own (`p ENV`), not `ENV['X']` or `ENV.fetch('X')`.
const RUBY_DUMPS_ENV = /\bENV\b(?!\s*(\[|\.\s*(fetch|key\?|has_key\?|include\?)\b))/;
const dumpsEnvCode = (name, code) => DUMPS_ENV_CODE.test(code) || (name === 'ruby' && RUBY_DUMPS_ENV.test(code));
// Code that sends email (`smtplib`, `nodemailer`).
const SENDS_MAIL_CODE = /\bsmtplib\b|\bnodemailer\b|\bNet::SMTP\b|\bnet\/smtp\b|\bsend_mail\s*\(/;
const ENV_REASON = `Listing all environment variables can print keys: name the one variable you need instead, and never a key's (${RULES}).`;
const LOADS_ENV_CODE = /\bdotenv\b|\bload_dotenv\b|\bloadEnvFile\b|--env-file\b/i;
const LOADS_ENV_REASON = `Loading \`.env\` files from the command line can print keys: the project's own scripts load what they need (${RULES}).`;
function dumpsEnvironment(words) {
  let k = 0;
  while (k < words.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(words[k])) k += 1;
  const p = base(words[k] || '');
  const args = withoutRedirections(words.slice(k + 1));
  if (p === 'printenv') return args.every((a) => a.startsWith('-'));
  if (p === 'ps') return args.some((a) => /^[a-z]*e[a-z]*$/i.test(a) && !a.startsWith('-'));
  if (p === 'env') {
    let j = 0;
    while (j < args.length && (args[j].startsWith('-') || /^[A-Za-z_][A-Za-z0-9_]*=/.test(args[j]))) j += ['-u', '--unset', '-C', '--chdir'].includes(args[j]) ? 2 : 1;
    return j >= args.length;
  }
  if (p === 'set') return args.length === 0;
  if (['export', 'declare', 'typeset', 'readonly', 'compgen'].includes(p)) return args.every((a) => a.startsWith('-')) && !(p === 'compgen' && !args.includes('-v') && !args.includes('-e'));
  return words.some((w) => /^\$?env:[\\/]?\*?$/i.test(w) || /GetEnvironmentVariables/i.test(w) || /^gci$|^get-childitem$/i.test(w) && words.some((x) => /^env:/i.test(x)));
}

// A package's program run by its file (`node node_modules/.bin/vercel`, `node_modules/eas-cli/bin/run`)
// counts as the package's own command.
const PACKAGE_FILE = /(?:^|[\\/])node_modules[\\/]+(?:\.bin[\\/]+([^\\/]+)|(@[^\\/]+[\\/]+)?([^\\/.][^\\/]*)[\\/])/i;
function aliasPackages(words) {
  const out = words.slice();
  const at = out.findIndex((w) => !/^[A-Za-z_][A-Za-z0-9_]*=/.test(w));
  if (at < 0) return out;
  const runner = SCRIPT_RUNNERS.includes(base(out[at]));
  const k = runner ? out.findIndex((w, i) => i > at && !w.startsWith('-')) : at;
  const m = k >= 0 ? (out[k] || '').match(PACKAGE_FILE) : null;
  if (!m) return out;
  const name = (m[1] || m[3] || '').replace(/\.(c|m)?js$/, '');
  if (runner) out.splice(at, k - at + 1, name);
  else out[k] = name;
  return out;
}

// ---------- keys and `.env` files ----------

const SECRET_PATTERNS = [
  // `.env` files: every name that starts with `.env` (`.env.local`, `.env-prod`, `.envrc`) except
  // exactly `.env.example`, `.env.sample`, `.env.template` and `.env.test`, and names that end in
  // `.env` (`prod.env`). `process.env` and `import.meta.env` in code are fine.
  /(^|[\s"'=/\\:(<>@])\.env(?!(\.example|\.sample|\.template|\.test)(?=$|[\s"'/\\;|&)<>]))[\w.-]*(?=$|[\s"'/\\;|&)<>*?[\]])/i,
  /(^|[\s"'=/\\:(<>@])(?!process\.env\b)[\w-]+\.env(?=$|[\s"'/\\;|&)<>*?[\]])/i,
  {
    test: (text) =>
      text.split(/[\s"'|&;<>=(]+/).some((w) => {
        const k = w.search(/[*?]/);
        return k >= 0 && /\.env(?=$|[/\\)*?[\]])/i.test(w.slice(k + 1));
      }),
  },
  /\.dev\.vars\b/i,
  /\.wrangler[\\/]+config/i,
  /rclone\.conf/i,
  /\.(bash|zsh|sh|python|node_repl|psql|mysql)_history\b|ConsoleHost_history/i,
  /credentials\.json/i,
  /service-?account[^\s"']*\.json/i,
  /google-services\.json|GoogleService-Info\.plist/i,
  /pc-api-[\w-]*\.json/i,
  /\.(p8|p12|pfx|jks|keystore|mobileprovision|pem|key)(\s|$|["')])/i,
  /\.git-credentials|(^|[\\/\s"'@])[._]netrc\b|\.npmrc\b|\.pypirc\b|(^|[\\/\s"'@])\.pgpass\b|\.my\.cnf\b/i,
  /(^|[\\/\s"'=@])\.?secrets?\.(json|ya?ml|toml)\b/i,
  /\.expo[\\/]+state\.json|\.supabase[\\/]+access-token|gh[\\/]+hosts\.yml|firebase-tools\.json|com\.vercel\.cli|\.vercel[\\/]+auth\.json|\.aws[\\/]+credentials|application_default_credentials\.json|\.docker[\\/]+config\.json|\.kube[\\/]+config|\.claude[\\/]+\.credentials|\.claude\.json\b/i,
  /(^|[\\/\s"'])\.ssh[\\/]|\bid_(rsa|ed25519|ecdsa|dsa)\b/i,
  /[\\/]proc[\\/]+[^\s\\/]+[\\/]+environ\b/i,
];
// `.env` names checked against wildcards.
const ENV_NAMES = ['.env', '.env.local', '.env.production', 'prod.env', '.envrc'];
function globRe(glob) {
  try {
    return new RegExp(`^${glob.replace(/[.+^$(){}|\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.')}$`, 'i');
  } catch {
    return /^/;
  }
}
const matchesEnvName = (glob) => ENV_NAMES.some((n) => globRe(glob).test(n));

// ---------- the guard for one project ----------

export function createGuard(settings = {}, root = process.cwd(), kit = {}) {
  const S = settings;
  const ROOT = resolve(root);
  const WORKING_BRANCH = S.workingBranch === undefined ? 'main' : S.workingBranch;
  const PRODUCTION_BRANCHES = [...new Set([...BUILT_IN_PRODUCTION, ...(S.productionBranches ?? [])])];
  const PRODUCTION_REF = new RegExp(`^(\\+)?((refs\\/)?(heads\\/|remotes\\/)?)?(origin\\/)?(${PRODUCTION_BRANCHES.map(escapeRe).join('|')})$`, 'i');
  const mentionsProduction = (a) => a.split(':').some((part) => PRODUCTION_REF.test(part));
  const PRODUCTION_NAMES = PRODUCTION_BRANCHES.map((b) => `\`${b}\``).join(' or ');
  const norm = (p) => p.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '');
  const appFolder = typeof kit.appPath === 'string' && kit.appPath.trim() && !/(^|[\\/])\.\.([\\/]|$)/.test(kit.appPath) ? [norm(kit.appPath.trim())] : [];
  const KEY_FOLDERS = [...new Set(['app', ...appFolder, ...(S.keyFolders ?? []).map(norm)])].filter((f) => f && f !== '.');
  const KEY_NAMES = [...new Set([...BUILT_IN_KEYS, ...(S.keyNames ?? [])])];
  const REFUSED_PROGRAMS = { ...BUILT_IN_PROGRAMS };
  for (const [name, why] of Object.entries(S.refusedPrograms ?? {})) REFUSED_PROGRAMS[base(name)] = `${why} (${RULES})`;
  const REFUSED_HOSTS = [...Object.entries(BUILT_IN_HOSTS), ...Object.entries(S.refusedHosts ?? {}).map(([h, why]) => [h, `${why} (${RULES})`]),
    ...(S.userDataHosts ?? []).map((h) => [h, `\`${h}\` holds real users' data: only the app itself and the user reach it (${RULES}).`])].map(([h, why]) => [h.toLowerCase(), why]);
  const PRODUCTION_SCRIPTS = (S.productionScripts ?? []).map((x) => x.toLowerCase());
  const isProductionScript = (s) => BUILT_IN_PRODUCTION_SCRIPTS.test(s) || PRODUCTION_SCRIPTS.includes(s.toLowerCase());
  const EAS_WORKFLOWS = (S.easWorkflows ?? []).map((x) => norm(x).toLowerCase());
  // Paths at the project's top, each with the reason agents see and what may still touch them.
  const APPROVED_REASON = `The user approved that text: it isn't changed without asking them again. Draft the new wording beside it and ask (${RULES}).`;
  const DATA_REASON = `That's real users' data: agents never read, copy, change or commit it (${RULES}).`;
  const KIT_REASON = `That's part of the kit, the guard, the project's workflows or its status, which change only by a kit update, the status script or the user: read it, and say in your report what should change (${RULES}).`;
  const PLACES = [
    ...BUILT_IN_PROTECTED.map((p) => ({ path: p, reason: KIT_REASON, kind: 'kit' })),
    // Expo reads workflows from its base folder, which is the app's folder in a kit project (P3.Z).
    ...appFolder.map((a) => ({ path: `${a}/.eas/workflows`, reason: KIT_REASON, kind: 'kit' })),
    ...(S.protectedPaths ?? []).map((p) => ({ path: norm(p), reason: KIT_REASON, kind: 'kit' })),
    ...(S.approvedText ?? []).map((p) => ({ path: norm(p), reason: APPROVED_REASON, kind: 'approved' })),
    ...(S.userDataPaths ?? []).map((p) => ({ path: norm(p), reason: DATA_REASON, kind: 'data' })),
  ].filter((x) => x.path && x.path !== '.' && !x.path.startsWith('..') && !isAbsolute(x.path));
  const segs = (p) => norm(p).split('/').filter((x) => x && x !== '.');
  // Whether a folder is the project folder or one above it.
  const isAncestorOrSelf = (abs) => abs === ROOT || ROOT.startsWith(abs.endsWith(sep) ? abs : abs + sep);
  // Whether a path with a wildcard in its last part (`../my-*`, `/home/user/*`) can match the
  // project folder or a folder above it.
  const wildcardReachesRoot = (abs) => {
    const name = abs.split(sep).pop();
    if (!/[*?[]/.test(name)) return false;
    const parent = dirname(abs);
    if (!isAncestorOrSelf(parent) || parent === ROOT) return false;
    const next = relative(parent, ROOT).split(sep)[0];
    return globRe(name).test(next);
  };
  // As in the shell, a wildcard matches a name starting with a dot only when it starts with one too
  // (`rm *` in app/ leaves app/.eas alone).
  const segMatch = (pattern, name) => (/[*?[]/.test(pattern) ? (!name.startsWith('.') || pattern.startsWith('.')) && globRe(pattern).test(name) : pattern.toLowerCase() === name.toLowerCase());

  // The place a path names, as written in a command (`./status/x`, `../launchwright`, `stat*`),
  // resolved from the folder the command runs in. `dir` is null when it isn't known.
  function placeOf(word, dir, destructive, bareOk = destructive) {
    const parts = word.split(/[=]/).map((x) => x.replace(/^[<>]+/, '').replace(/^\d?>+/, '')).filter(Boolean);
    for (const raw of parts) {
      if (!raw || /^-/.test(raw) || /:\/\//.test(raw)) continue;
      if (destructive && /^(?:(~|\$HOME|\$\{HOME\}|%USERPROFILE%|\$env:USERPROFILE|[A-Za-z]:)[\\/]?|[\\/])\*?$/i.test(raw)) return { reason: `That would remove files far outside the project: name the files you mean (${RULES}).` };
      const w = expandHome(raw.replace(/\\/g, '/'));
      // A bare word (`status`) is a path only for commands that change files; `npm run status` isn't.
      const inSub = dir && resolve(dir) !== ROOT;
      if (!/[/*?[]/.test(w) && !(bareOk && (inSub || PLACES.some((p) => segs(p.path)[0]?.toLowerCase() === w.toLowerCase()))) && !(destructive && ['.', '..'].includes(raw))) continue;
      const candidates = [];
      if (dir) candidates.push(resolve(dir, w));
      else candidates.push(resolve(ROOT, w));
      for (const abs of candidates) {
        const rel = relative(ROOT, abs).split(sep).join('/');
        // The computer's top folder or the home folder (or everything in one).
        if (destructive && [resolve('/'), resolve(home() || '/')].some((top) => abs === top || (/[*?]$/.test(w) && dirname(abs) === top))) return { reason: `That would remove files far outside the project: name the files you mean (${RULES}).` };
        // The project folder itself, a folder above it, or a wildcard that matches one of them (`rm -rf my-*`
        // from the folder above): a destructive command there removes the kit.
        if (destructive && (rel === '' || rel === '..' || rel.startsWith('../')) && (isAncestorOrSelf(abs.replace(/[\\/]+$/, '')) || wildcardReachesRoot(abs))) return { reason: `That would change the whole project folder, the kit and the guard with it: name the files you mean (${RULES}).` };
        if (underGuard(abs)) return { path: 'guard', reason: KIT_REASON, kind: 'kit' };
        if (rel.startsWith('..') || isAbsolute(rel)) continue;
        const r = rel.split('/').filter(Boolean);
        for (const place of PLACES) {
          const p = segs(place.path);
          const n = Math.min(p.length, r.length);
          const wild = r.some((x) => /[*?[]/.test(x));
          if (r.length >= p.length && p.every((x, i) => segMatch(r[i], x))) return place;
          // A wildcard or a folder above a protected place, for commands that remove or move files.
          if (destructive && r.length < p.length && r.slice(0, n).every((x, i) => segMatch(x, p[i]))) return place;
          if (destructive && wild && r.length <= p.length && r.every((x, i) => segMatch(x, p[i]))) return place;
        }
      }
      // A path whose folder isn't known (after `cd "$X"`): the kit's own folder name anywhere in it.
      if (!dir && /(^|\/)(launchwright|\.eas\/workflows|\.github)(\/|$)/i.test(w)) return PLACES[0];
    }
    return null;
  }

  // ---------- changes whose files a command doesn't name ----------
  const exists = (p) => existsSync(p);
  // The names of the files in the kit's places, for wildcards that could match one of them.
  let names = null;
  function kitNames() {
    if (names) return names;
    const found = new Set(['agents.md', 'claude.md', 'claude.local.md', '.mcp.json', 'kit.json', 'guard.json', 'guard-lib.mjs', 'settings.json', 'settings.local.json', 'guard.mjs']);
    let budget = 5000;
    const walk = (d) => {
      let list = [];
      try {
        list = readdirSync(d, { withFileTypes: true });
      } catch {
        return;
      }
      for (const e of list) {
        if (budget-- <= 0) return;
        found.add(e.name.toLowerCase());
        if (e.isDirectory()) walk(join(d, e.name));
      }
    };
    for (const place of [...PLACES.map((p) => p.path), '.claude']) walk(join(ROOT, place));
    names = [...found];
    return names;
  }
  const touchesKit = (path) => Boolean(placeOf(path, ROOT, false, true)) || PROTECTED_NAMES.test(normalPath(path)) || PROTECTED_FOLDER.test(normalPath(path));
  // A patch (for `git apply`, `git am` or `patch`) is read, and refused if it changes the kit's files.
  function patchReason(files, dir) {
    const why = `That patch changes the project's rules, the kit or the guard, or can't be read: only a kit update changes them (${RULES}).`;
    if (!files.length) return why; // read from a pipe: can't be checked
    for (const f of files) {
      let text;
      try {
        text = readFileSync(resolve(dir || ROOT, expandHome(f)), 'utf8');
      } catch {
        return why;
      }
      for (const m of text.matchAll(/^(?:\+\+\+|---) (?:[ab]\/)?(\S+)|^diff --git a\/(\S+) b\/(\S+)|^(?:rename|copy) (?:from|to) (\S+)/gm))
        for (const p of [m[1], m[2], m[3], m[4]]) if (p && p !== '/dev/null' && touchesKit(p)) return why;
    }
    return null;
  }
  function switchReason(sub, args, dir) {
    const W = WORKING_BRANCH || 'main';
    const okRef = (r) => [W, `origin/${W}`, 'HEAD', `refs/heads/${W}`].some((x) => x.toLowerCase() === String(r).toLowerCase());
    const why = `Switching to another branch or commit can leave the kit and the guard behind: stay on \`${W}\`, or start a new branch from where you are (\`git switch -c name\`) (${RULES}).`;
    const dash = args.indexOf('--');
    const before = dash >= 0 ? args.slice(0, dash) : args;
    const valueOpts = ['-b', '-B', '-c', '-C', '--orphan', '--conflict', '--track', '-t'];
    const named = before.filter((a, k) => !a.startsWith('-') && !valueOpts.includes(before[k - 1]));
    const creates = before.some((a) => valueOpts.slice(0, 4).includes(a));
    if (sub === 'worktree') {
      if ((args[0] || '').toLowerCase() !== 'add') return null;
      const rest = args.slice(1);
      const pos = rest.filter((a, k) => !a.startsWith('-') && !['-b', '-B'].includes(rest[k - 1]));
      return pos.length > 1 && !okRef(pos[1]) ? why : null;
    }
    if (sub === 'checkout' && dash >= 0) {
      const ref = named[0];
      const paths = args.slice(dash + 1);
      if (ref && !okRef(ref) && paths.some((p) => placeOf(p, dir, true, true))) return `Restoring the kit's files, or the whole project, from another commit can bring back an older guard (${RULES}).`;
      return null;
    }
    if (creates) return named.length && !okRef(named[0]) ? why : null; // a start point other than here
    if (!named.length) return before.includes('-') ? why : null;
    // `git checkout file.ts` restores a file; anything else names a branch or a commit.
    if (sub === 'checkout' && named.every((a) => exists(resolve(dir || ROOT, a)))) return null; // files: checkMisc checks their places
    return named.every(okRef) ? null : why;
  }
  // Commits a revert or cherry-pick would apply, checked with git for changes to the kit's files.
  function commitsTouchKit(refs) {
    const why = `That commit changes the project's rules, the kit or the guard (a revert could undo a kit update): only a kit update changes them (${RULES}).`;
    if (refs.some((r) => ['--continue', '--abort', '--skip', '--quit'].includes(r))) return null;
    for (const r of refs) {
      if (!/^[\w./~^@{}-]+$/.test(r)) return why;
      let names;
      try {
        names = execFileSync('git', ['diff-tree', '--no-commit-id', '--name-only', '-r', '-m', r], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000 });
      } catch {
        return why;
      }
      if (names.split('\n').filter(Boolean).some(touchesKit)) return why;
    }
    return null;
  }

  // ---------- pushes and git ----------
  const PUSH_FLAGS_OK = new Set(['-q', '--quiet', '-v', '--verbose', '--dry-run', '-n', '--porcelain', '--progress', '--no-progress', '--no-verify', '-u', '--set-upstream']);
  function checkGit(words, dir) {
    if (words.some((w) => GIT_ENV.test(w))) return `Setting git's configuration through \`GIT_*\` variables is blocked: it can change where a push goes (${RULES}).`;
    // HOME and XDG_CONFIG_HOME pick the git settings file, which can hold aliases that run anything.
    if (indexesOf(words, ['git']).length && words.some((w) => /^(HOME|XDG_CONFIG_HOME)=/.test(w))) return `Running git with another HOME or XDG_CONFIG_HOME loads other git settings, which can change where a push goes (${RULES}).`;
    for (const i of indexesOf(words, ['git'])) {
      let j = i + 1;
      while (j < words.length && words[j].startsWith('-')) {
        const w = words[j];
        if (w === '-c' || w === '--config-env' || w.startsWith('--config-env=')) {
          const value = w.startsWith('--config-env=') ? w.slice('--config-env='.length) : words[j + 1] || '';
          const key = value.split('=')[0];
          if (RISKY_GIT_KEYS.test(key)) return `\`git ${w.split('=')[0]} ${key}\` is blocked: it can change where a push goes or what git runs (${RULES}).`;
          j += w.includes('=') ? 1 : 2;
        } else if (/^--exec-path=/.test(w)) return `\`git --exec-path=…\` runs git's commands from another folder (${RULES}).`;
        else if (GIT_OPTS_WITH_VALUE.includes(w)) j += 2;
        else j += 1;
      }
      const sub = (words[j] || '').toLowerCase();
      const args = withoutRedirections(words.slice(j + 1));
      const lower = args.map((a) => a.toLowerCase());
      if (sub === 'push') {
        const positional = args.filter((a) => !a.startsWith('-'));
        const flags = args.filter((a) => a.startsWith('-'));
        const W = WORKING_BRANCH;
        const forms = W ? [W, `${W}:${W}`, `HEAD:${W}`, `HEAD:refs/heads/${W}`, `refs/heads/${W}:refs/heads/${W}`] : [];
        const ok = W && positional.length === 2 && positional[0] === 'origin' && forms.includes(positional[1]) && flags.every((f) => PUSH_FLAGS_OK.has(f));
        if (ok) return null;
        if (lower.some(mentionsProduction)) return `Pushing ${PRODUCTION_NAMES} deploys to production: the user's step (${RULES}).`;
        if (!W) return `Agents never push in this project, because a push builds or deploys: the user pushes (${RULES}).`;
        if (flags.some((f) => /^(-f|--force|--force-with-lease|--force-if-includes|--mirror|--all|--tags|--follow-tags|--delete|-d|--prune)/.test(f) || /^-[a-z]*f/.test(f)) || positional.some((p) => p.startsWith('+') || p.startsWith(':')))
          return `Force-pushing, deleting branches and pushing tags or every branch rewrite or publish history: never (${RULES}).`;
        return `Agents push only to the working branch, with \`git push origin ${W}\`; every other push is the user's (${RULES}).`;
      }
      if (['send-pack', 'http-push', 'subtree', 'p4', 'svn'].includes(sub)) return `\`git ${sub}\` is blocked (${RULES}).`;
      if (sub === 'send-email' || sub === 'imap-send') return MESSAGE_REASON;
      if (sub === 'reset' && lower.some((a) => a === '--hard' || a === '--merge' || a === '--keep')) return `\`git reset --hard\` throws work away: commit or stash it instead (${RULES}).`;
      // Finishing or stopping a rebase that `git pull --rebase` started is fine.
      if (sub === 'rebase' && lower.length && lower.every((a) => ['--continue', '--abort', '--skip', '--quit', '--show-current-patch'].includes(a))) continue;
      if (['clean', 'rebase', 'filter-branch', 'filter-repo', 'update-ref', 'replace', 'reflog'].includes(sub) && !(sub === 'reflog' && !lower.some((a) => ['expire', 'delete'].includes(a))))
        return `\`git ${sub}\` rewrites or throws away history (${RULES}).`;
      if (['checkout', 'switch'].includes(sub) && lower.some((a) => a === '--orphan')) return `Starting a branch with no history leaves the kit and the guard behind (${RULES}).`;
      if (['checkout', 'switch', 'branch', 'worktree', 'restore', 'reset', 'symbolic-ref', 'cherry-pick', 'revert', 'tag'].includes(sub) && lower.some(mentionsProduction))
        return `Checking out, creating or moving ${PRODUCTION_NAMES} is the user's step (${RULES}).`;
      if (sub === 'remote' && lower.some((a) => ['add', 'set-url', 'rename', 'remove', 'rm', 'set-head', 'set-branches'].includes(a)))
        return `Changing git's remotes changes where a push goes: the user's step (${RULES}).`;
      if (sub === 'config') {
        const reading = lower.some((a) => ['--get', '--get-all', '--get-regexp', '--list', '-l', '--show-origin', 'get', 'list'].includes(a));
        const key = args.find((a) => !a.startsWith('-') && RISKY_GIT_KEYS.test(a));
        if (!reading && key) return `Changing \`${key}\` is blocked: it can change where a push goes or what git runs (${RULES}).`;
        if (!reading && lower.some((a) => ['--global', '--system'].includes(a))) return `Git's settings for the whole computer are the user's (${RULES}).`;
      }
      // Writing objects or the index by hand, or applying a patch, can change the kit's files
      // without naming them; a patch is read first.
      if (['update-index', 'read-tree', 'commit-tree', 'mktree', 'fast-import', 'checkout-index', 'unpack-objects', 'update-server-info', 'write-tree'].includes(sub) || (sub === 'hash-object' && lower.includes('-w')))
        return `\`git ${sub}\` writes git's objects or index by hand: make changes with the file tools and commit them (${RULES}).`;
      if (['apply', 'am'].includes(sub)) {
        const why = patchReason(args.filter((a) => !a.startsWith('-')), dir);
        if (why) return why;
      }
      // Switching to another branch or commit can leave the kit and the guard behind (or bring back
      // an older guard): stay on the working branch, or start a new branch from where you are.
      if (['checkout', 'switch', 'worktree'].includes(sub)) {
        const why = switchReason(sub, args, dir);
        if (why) return why;
      }
      if (sub === 'restore') {
        const src = args.findIndex((a) => a === '--source' || a === '-s' || a.startsWith('--source='));
        const ref = src < 0 ? null : args[src].startsWith('--source=') ? args[src].slice(9) : args[src + 1];
        const paths = args.filter((a, k) => !a.startsWith('-') && !(src >= 0 && k === src + 1));
        if (ref && !/^HEAD$/i.test(ref) && paths.some((p) => placeOf(p, dir, true, true))) return `Restoring the kit's files, or the whole project, from another commit can bring back an older guard (${RULES}).`;
      }
      if (['revert', 'cherry-pick'].includes(sub)) {
        const why = commitsTouchKit(args.filter((a) => !a.startsWith('-')));
        if (why) return why;
      }
      if (sub === 'grep' && lower.some((a) => a === '--no-index' || a === '--untracked' || a === '--no-exclude-standard'))
        return `\`git grep\` over untracked or ignored files can print keys from \`.env\` files: search tracked files, or use the Grep tool (${RULES}).`;
      if (sub === 'add' && args.some((a) => a === '--force' || /^-[a-zA-Z]*f[a-zA-Z]*$/.test(a))) {
        const paths = args.filter((a) => !a.startsWith('-'));
        if (args.some((a) => a === '--all' || a === '--update' || /^-[a-zA-Z]*[Au][a-zA-Z]*$/.test(a)) || paths.some((a) => a === ':/' || a === '.' || /[*?[]/.test(a) || listsKeys(a)))
          return `\`git add -f\` adds files .gitignore leaves out, \`.env\` files and real users' data among them: add the files you mean by name, without \`-f\` (${RULES}).`;
      }
    }
    return null;
  }

  // ---------- Expo, Supabase, Wrangler, GitHub's CLI and the like ----------
  function checkServices(words) {
    for (const i of indexesOf(words, ['eas', 'eas-cli'])) {
      const rest = words.slice(i + 1).map((w) => w.toLowerCase());
      const sub = rest.find((w) => !w.startsWith('-')) || '';
      if (sub === 'workflow:run') {
        const file = rest.slice(rest.indexOf(sub) + 1).find((w) => !w.startsWith('-')) || '';
        if (!EAS_WORKFLOWS.includes(norm(file).toLowerCase())) return `Only these Expo workflows may be started by agents: ${EAS_WORKFLOWS.join(', ') || 'none'}. The others submit, deploy or cost money: the user's step (${RULES}).`;
      } else if (!['workflow:view', 'workflow:runs', 'workflow:logs', 'workflow:validate'].includes(sub)) {
        const blocked = ['submit', 'update', 'workflow', 'credentials', 'env', 'secret', 'channel', 'branch', 'metadata', 'webhook', 'account', 'login', 'logout', 'register', 'device:create', 'device:delete', 'device:rename', 'build:resign', 'project:transfer', 'init', 'project:init'];
        if (blocked.some((b) => sub === b || sub.startsWith(b + ':'))) return `\`eas ${sub}\` is the user's step: it submits, updates real users' apps, touches keys or changes the account (${RULES}).`;
      }
      if (rest.some((w) => w.startsWith('--auto-submit') || w === '-s')) return `Submitting a build to a store is the user's step (${RULES}).`;
      if (rest.some((w) => /^--prod(uction)?$/.test(w) || w.includes('production'))) return `Production builds and deploys are the user's step (${RULES}).`;
      // A profile, environment, channel or branch named for production (`--profile=prod`, `-e prod`).
      const values = rest.flatMap((w, k) => (['--profile', '-e', '--environment', '--channel', '--branch'].includes(w) ? [rest[k + 1] || ''] : /^--(profile|environment|channel|branch)=/.test(w) ? [w.slice(w.indexOf('=') + 1)] : []));
      if (values.some((v) => /^prod/.test(v) || PRODUCTION_BRANCHES.some((b) => b.toLowerCase() === v))) return `Production builds and deploys are the user's step (${RULES}).`;
    }
    for (const i of indexesOf(words, ['expo', 'expo-cli'])) {
      const sub = (words.slice(i + 1).find((w) => !w.startsWith('-')) || '').toLowerCase();
      if (/^(publish|upload|build:(ios|android|web)|login|logout|register|credentials|push)/.test(sub)) return `\`expo ${sub}\` publishes, uploads or changes the account: the user's step (${RULES}).`;
    }
    for (const i of indexesOf(words, ['supabase'])) {
      const rest = words.slice(i + 1).map((w) => w.toLowerCase());
      const named = rest.filter((w) => !w.startsWith('-'));
      const remote = ['link', 'unlink', 'login', 'logout', 'projects', 'orgs', 'secrets', 'sso', 'domains', 'vanity-subdomains', 'branches', 'postgres-config', 'network-bans', 'network-restrictions', 'ssl-enforcement', 'bootstrap', 'inspect', 'storage', 'snippets', 'encryption', 'backups'];
      if (remote.includes(named[0] || '') || named.some((w) => ['push', 'deploy', 'delete', 'pull', 'dump'].includes(w)) || rest.some((w) => /^--(linked|db-url|project-ref)/.test(w)))
        return `That Supabase command reaches the live project, which holds real users' data: the user's step. Local commands (start, stop, status, db reset, migration new, gen types --local) are fine (${RULES}).`;
    }
    const isWrangler = (w) => ['wrangler', 'wrangler.js'].includes(base(w)) || /(^|[\\/])wrangler[\\/]\S*\.[cm]?js$/i.test(w);
    for (const i of words.map((w, k) => (isWrangler(w) ? k : -1)).filter((k) => k >= 0)) {
      const rest = words.slice(i + 1).map((w) => w.toLowerCase());
      const sub = rest.find((w) => !w.startsWith('-')) || '';
      if (sub === '' && rest.some((w) => HELP_WORDS.includes(w))) continue;
      if (sub === 'dev' && !rest.some((w) => w === '-r' || (w.startsWith('-') && w.includes('remote')))) continue;
      if (['types', 'whoami', 'version'].includes(sub)) continue;
      if (sub === 'd1' && rest.includes('migrations') && rest.includes('create')) continue;
      if (sub === 'd1' && rest.includes('--local') && !rest.some((w) => w.startsWith('--remote'))) continue;
      return `Wrangler is limited to \`dev\` on this computer, \`types\`, \`whoami\` and local D1: anything that deploys or reaches Cloudflare is the user's step (${RULES}).`;
    }
    for (const i of indexesOf(words, ['gh'])) {
      const [a, b] = words.slice(i + 1).filter((w) => !w.startsWith('-')).map((w) => w.toLowerCase());
      const looks = { pr: ['view', 'list', 'status', 'checks', 'diff'], issue: ['view', 'list', 'status'], run: ['view', 'list', 'watch'], repo: ['view'], auth: ['status'], workflow: ['view', 'list'], release: ['view', 'list'] };
      if (words.slice(i + 1).every((w) => HELP_WORDS.includes(w))) continue;
      if (!(looks[a] || []).includes(b)) return `GitHub's command line can merge, release, start workflows or change the repository: only reading (\`gh pr view\`, \`gh run list\` and the like) is for agents. Push with git to the working branch (${RULES}).`;
    }
    return null;
  }

  // ---------- reading files that can hold keys ----------
  const KEY_PLACES = ['the project folder', ...KEY_FOLDERS.map((f) => `\`${f}/\``)].join(' or ');
  const listsKeys = (path) => {
    const n = norm(path);
    return n === '' || n === '.' || n.startsWith('..') || n.startsWith('/') || /^[A-Za-z]:/.test(n) || n === '~' || n.startsWith('~/') || /[*?[$]/.test(n) || KEY_FOLDERS.includes(n);
  };
  const KEY_FOLDER_RE = KEY_FOLDERS.length ? `(?:${KEY_FOLDERS.map((f) => f.split('/').map(escapeRe).join('[\\\\/]+')).join('|')})` : null;
  const HIDDEN_GLOB = new RegExp(
    KEY_FOLDER_RE
      ? `^(\\.[\\\\/])?(${KEY_FOLDER_RE}[\\\\/]+)?\\.[^\\\\/\\s]*[*?[]|[\\\\/]${KEY_FOLDER_RE}[\\\\/]+\\.[^\\\\/\\s]*[*?[]|^~[\\\\/]+\\.[^\\s]*[*?[]`
      : `^(\\.[\\\\/])?\\.[^\\\\/\\s]*[*?[]|^~[\\\\/]+\\.[^\\s]*[*?[]`,
  );
  const secretsIn = (text) => SECRET_PATTERNS.some((p) => p.test(text));
  const SECRET_REASON = `Reading or printing keys and key files is blocked: the project's scripts and the app read what they need themselves (${RULES}).`;
  const tokenReason = (t) => `\`${t}\` names a key: agents never print it, expand it or look it up in the environment (${RULES}).`;
  const ENV_READERS = ['printenv', 'env', 'set', 'export', 'declare', 'typeset', 'echo', 'printf', 'print', 'write-output', 'write-host', 'say', 'tee', 'cat', 'xargs', 'compgen'];
  function checkGrep(words) {
    for (const i of indexesOf(words, ['grep', 'egrep', 'fgrep', 'ag', 'ack'])) {
      const rest = words.slice(i + 1);
      const recursive = ['ag', 'ack'].includes(base(words[i])) || rest.some((w) => w === '--recursive' || w === '--dereference-recursive' || /^-[a-zA-Z]*[rR]/.test(w) || w === '-d' || w.startsWith('--directories=recurse'));
      if (!recursive) continue;
      if (rest.some((w) => /^--exclude=.*\.env/.test(w))) continue;
      // Searching only files named by --include (`--include=*.ts`) can't reach a `.env` file.
      const includes = rest.flatMap((w, k) => (w.startsWith('--include=') ? [w.slice(10)] : w === '--include' ? [rest[k + 1] || '*'] : []));
      if (includes.length && !includes.some(matchesEnvName)) continue;
      let k = 0;
      const positional = [];
      while (k < rest.length) {
        const w = rest[k];
        if (['-e', '-f', '--regexp', '--file', '-m', '-A', '-B', '-C'].includes(w)) { k += 2; continue; }
        if (!w.startsWith('-')) positional.push(w);
        k += 1;
      }
      const hasPatternFlag = rest.some((w) => w === '-e' || w === '--regexp' || w.startsWith('--regexp=') || w === '-f' || w === '--file');
      const paths = hasPatternFlag ? positional : positional.slice(1);
      if ((paths.length ? paths : ['.']).some(listsKeys))
        return `A recursive search over ${KEY_PLACES} can print keys from \`.env\` files. Use the Grep tool (it leaves them out), search one folder (\`grep -rn "word" src\`), or add \`--exclude=.env*\`.`;
    }
    for (const i of indexesOf(words, ['rg'])) {
      const rest = words.slice(i + 1);
      if (rest.some((w) => /^-u+$/.test(w) || w === '--hidden' || w === '--no-ignore' || w.startsWith('--no-ignore') || w.startsWith('--unrestricted') || w === '-.'))
        return '`rg` with hidden or ignored files can print keys from `.env` files: drop `-u`, `--hidden` and `--no-ignore`, or use the Grep tool.';
    }
    return null;
  }
  const FILE_READERS = ['grep', 'egrep', 'fgrep', 'rg', 'cat', 'head', 'tail', 'less', 'more', 'sed', 'awk', 'strings', 'xxd', 'od', 'hexdump', 'base64', 'type', 'get-content', 'gc', 'select-string', 'sls', 'findstr', 'cp', 'tar', 'zip', 'curl', 'nc', 'scp', 'rsync'];
  const PS_LISTERS = ['get-childitem', 'gci', 'ls', 'dir', 'get-item', 'gi'];
  const LISTING_REASON = () =>
    `Reading every file in a listing of ${KEY_PLACES} can print keys from \`.env\` files: use the Grep tool, search one folder (\`grep -rn "word" src\`), or list files by name (\`find src -name "*.ts" …\`) (${RULES}).`;
  function wildcardReachesKeys(path) {
    const n = path.replace(/\\/g, '/');
    if (!/[*?[]/.test(n)) return false;
    const cut = n.lastIndexOf('/');
    return matchesEnvName(n.slice(cut + 1)) && listsKeys(cut < 0 ? '.' : n.slice(0, cut) || '/');
  }
  function checkListings(all, powershell) {
    let listing = false;
    const loop = all.some((segment) => program(stripLead(segment)) === 'read');
    for (const segment of all) {
      const words = stripLead(segment);
      const prog = program(words);
      const runs = perItemCommands(words);
      if (prog === 'find' || prog === 'fd' || prog === 'fdfind') {
        const at = words.findIndex((w) => ['find', 'fd', 'fdfind'].includes(base(w)));
        let k = at + 1;
        const roots = [];
        while (prog === 'find' && k < words.length && !/^[-(!]/.test(words[k])) roots.push(words[k++]);
        let filtered = false;
        for (let j = k; j < words.length - 1; j++) {
          const test = words[j].toLowerCase();
          if (!/^-(i?name|i?path|i?wholename|i?regex)$/.test(test) || ['-not', '!'].includes(words[j - 1])) continue;
          const pattern = words[j + 1];
          if (test.includes('regex')) filtered = true;
          else if (test.endsWith('name')) filtered ||= !matchesEnvName(pattern);
          else filtered ||= ![...KEY_FOLDERS, '.'].some((f) => globRe(pattern).test(`./${f === '.' ? '' : `${f}/`}.env`));
        }
        if (prog !== 'find') filtered = !words.some((w) => w === '-H' || w === '--hidden' || w === '-u' || w === '--no-ignore');
        if ((roots.length ? roots : ['.']).some(listsKeys) && !filtered) {
          if (runs.some((r) => FILE_READERS.includes(r))) return LISTING_REASON();
          listing = true;
        }
      } else if (powershell && PS_LISTERS.includes(prog)) {
        const at = words.findIndex((w) => PS_LISTERS.includes(base(w)));
        const args = words.slice(at + 1);
        const filter = args.findIndex((w) => /^-(filter|include)$/i.test(w));
        const paths = args.filter((w, i) => !w.startsWith('-') && !(i > 0 && /^-(filter|include|exclude|depth|attributes)$/i.test(args[i - 1])));
        const filtered = filter >= 0 && !matchesEnvName(args[filter + 1] || '*');
        if ((paths.length ? paths : ['.']).some(listsKeys) && !filtered) listing = true;
      } else if (listing && (runs.some((r) => FILE_READERS.includes(r)) || (powershell && FILE_READERS.includes(prog)))) return LISTING_REASON();
      else if (listing && loop && FILE_READERS.includes(prog) && words.some((w) => w.includes('$'))) return LISTING_REASON();
      if (words.some((w) => base(w) === 'findstr')) {
        const at = words.findIndex((w) => base(w) === 'findstr');
        const args = words.slice(at + 1);
        const flags = args.filter((w) => /^[/-]/.test(w));
        const masks = args.filter((w) => !/^[/-]/.test(w)).slice(flags.some((f) => /^[/-]c:/i.test(f)) ? 0 : 1);
        const recursive = flags.some((f) => /^[/-]s$/i.test(f));
        if (masks.some((m) => wildcardReachesKeys(m) || (recursive && matchesEnvName(m.replace(/\\/g, '/').split('/').pop()))) || (recursive && masks.some((m) => KEY_FOLDERS.some((f) => m.replace(/\\/g, '/').startsWith(`${f}/`)))))
          return LISTING_REASON();
      }
      if (powershell && ['get-content', 'gc', 'cat', 'type', 'select-string', 'sls', 'copy-item', 'cp', 'copy'].includes(prog) && words.slice(1).some(wildcardReachesKeys)) return LISTING_REASON();
    }
    return null;
  }

  // ---------- ending programs, and the computer itself ----------
  const KILL_REASON = `Ending programs by name, by a filter, by a port or by an ID worked out on the spot can end Claude Code itself or another build. End only a program you started, with the ID it gave you (\`kill $!\` in the command that started it). If a port is busy, use another port (${RULES}).`;
  const POWER_REASON = `Shutting down, restarting or signing out of the computer is the user's step (${RULES}).`;
  const SERVICES_REASON = `Starting, stopping or changing the computer's services is the user's step (${RULES}).`;
  const KILLERS = ['kill', 'taskkill', 'stop-process', 'spps'];
  const KILL_BY_NAME = ['pkill', 'killall', 'tskill', 'kill-port', 'fkill', 'fkill-cli', 'xkill', 'pskill'];
  const POWER = ['shutdown', 'reboot', 'poweroff', 'halt', 'restart-computer', 'stop-computer', 'suspend-computer', 'logoff', 'tsdiscon', 'psshutdown'];
  const KILLS_CODE = /\bprocess\.kill\s*\(|\bos\.kill(pg)?\s*\(|\bpsutil\b|\.kill\s*\(\s*\)|\bStop-Process\b|\btaskkill\b|\bpkill\b|\bkillall\b/i;
  let commandText = '';
  const setFromLastJob = (name) => {
    const n = escapeRe(name);
    return new RegExp(`(^|[\\s;&|(])\\$?${n}\\s*=\\s*["']?\\$(!|\\{!\\})["']?(?=$|[\\s;&|)])`).test(commandText) ||
      new RegExp(`\\$${n}\\s*=\\s*\\(?\\s*(start-process|saps|start)\\b[^;|\\n]*-passthru`, 'i').test(commandText);
  };
  function killTarget(t) {
    for (const part of t.split(',').filter(Boolean)) {
      if (/^\d+$/.test(part)) {
        if (Number(part) <= 1) return KILL_REASON;
        continue;
      }
      if (/^%(\d+|[+-]|%)$/.test(part) || /^\$(!|\{!\})$/.test(part)) continue;
      const v = part.match(/^\$\{?([A-Za-z_][A-Za-z0-9_]*)\}?$/) || part.match(/^\$([A-Za-z_][A-Za-z0-9_]*)\.Id$/i);
      if (v && !/^PPID$/i.test(v[1]) && setFromLastJob(v[1])) continue;
      return KILL_REASON;
    }
    return null;
  }
  function checkProcesses(words) {
    const prog = program(words);
    const lead = LAUNCHERS.includes(prog) ? launched(words) || prog : prog;
    const progs = [prog, lead];
    if (progs.some((p) => KILL_BY_NAME.includes(p))) return KILL_REASON;
    if (perItemCommands(words).some((c) => KILLERS.includes(c) || KILL_BY_NAME.includes(c))) return KILL_REASON;
    if (prog === 'fuser' && words.some((w) => /^-[a-z]*k/i.test(w))) return KILL_REASON;
    if (prog === 'wmic' && words.some((w) => /^process$/i.test(w)) && words.some((w) => /^(delete|terminate)$/i.test(w))) return KILL_REASON;
    if (words.some((w) => /\$_\.kill\s*\(/i.test(w)) || (words.some((w) => /get-process|^\(?gps$/i.test(w)) && words.some((w) => /\.kill\s*\(/i.test(w)))) return KILL_REASON;
    const killer = progs.find((p) => KILLERS.includes(p));
    if (killer) {
      const at = words.findIndex((w) => base(w) === killer);
      const args = withoutRedirections(words.slice(at + 1)).map((a) => a.replace(/^\/\//, '/'));
      const targets = [];
      if (killer === 'taskkill') {
        if (args.some((a) => /^\/\?$/.test(a))) return null;
        for (let i = 0; i < args.length; i++) {
          if (/^[-/](im|fi)$/i.test(args[i])) return KILL_REASON;
          if (/^[-/]pid$/i.test(args[i])) targets.push(args[++i] || '');
        }
      } else {
        if (args.some((a) => /^-(l|L|list|table)$/.test(a))) return null;
        for (let i = 0; i < args.length; i++) {
          const a = args[i];
          if (/^-(name|na|nam|processname|p\w*name|inputobject|in\w*)$/i.test(a)) return KILL_REASON;
          if (a === '-n' && killer !== 'kill') return KILL_REASON;
          if (a === '-n' || a === '-s' || /^-signal$/i.test(a)) {
            if (a === '-n' && !/^\d+$/.test(args[i + 1] || '')) return KILL_REASON;
            i += 1;
            continue;
          }
          if (/^-id$/i.test(a)) { targets.push(args[++i] || ''); continue; }
          if (a === '--') { targets.push(...args.slice(i + 1)); break; }
          if (/^-\d+$/.test(a) && targets.length) return KILL_REASON;
          if (/^-/.test(a)) continue;
          targets.push(a);
        }
      }
      if (!targets.length) return KILL_REASON;
      for (const t of targets) {
        if (/^-\d+$/.test(t)) return KILL_REASON;
        const reason = killTarget(t);
        if (reason) return reason;
      }
    }
    const d = words.findIndex((w) => base(w) === 'docker' || base(w) === 'podman');
    if (d >= 0) {
      const rest = words.slice(d + 1).map((w) => w.toLowerCase());
      const named = rest.filter((w) => !w.startsWith('-'));
      const sub = (named[0] === 'container' ? named[1] : named[0]) || '';
      const computed = rest.some((w) => /[$`]/.test(w) || w === '-a' || w === '--all');
      if (['stop', 'kill', 'rm', 'restart', 'pause'].includes(sub) && computed) return KILL_REASON;
      if (rest.includes('prune') || (sub === 'volume' && rest.some((w) => w === 'rm' || w === 'remove')))
        return `Pruning or removing Docker's containers, images or volumes reaches other projects' data: remove only what you started, by name (${RULES}).`;
      if (['push', 'login', 'logout'].includes(sub)) return `\`docker ${sub}\` publishes or signs in: the user's step (${RULES}).`;
    }
    if (progs.some((p) => POWER.includes(p))) return POWER_REASON;
    if (['init', 'telinit'].includes(prog) && words.some((w) => /^[06sS]$/.test(w))) return POWER_REASON;
    const has = (re) => words.some((w) => re.test(w));
    if (prog === 'systemctl' && has(/^(reboot|poweroff|halt|suspend|hibernate|hybrid-sleep|suspend-then-hibernate|kexec|emergency|rescue|isolate)$/i)) return POWER_REASON;
    if (prog === 'loginctl' && has(/^(poweroff|reboot|halt|suspend|hibernate|terminate-session|terminate-user|kill-session|kill-user|lock-session|lock-sessions)$/i)) return POWER_REASON;
    if (prog === 'rundll32' && has(/powrprof|setsuspendstate|lockworkstation/i)) return POWER_REASON;
    if (prog === 'pmset' && has(/^(sleepnow|displaysleepnow|restoredefaults)$/i)) return POWER_REASON;
    if (prog === 'osascript' && has(/shut down|restart|sleep|log out/i)) return POWER_REASON;
    if (['stop-service', 'restart-service', 'start-service', 'set-service', 'suspend-service', 'new-service', 'remove-service'].includes(prog)) return SERVICES_REASON;
    if (prog === 'sc' && has(/^(stop|start|delete|config|create|pause|failure)$/i)) return SERVICES_REASON;
    if (prog === 'net' && has(/^(stop|start|pause|continue)$/i) && withoutRedirections(words.slice(words.findIndex((w) => base(w) === 'net') + 1)).length > 1) return SERVICES_REASON;
    if (prog === 'systemctl' && has(/^(start|stop|restart|try-restart|reload|enable|disable|mask|unmask|kill|edit|set-property|daemon-reload)$/i)) return SERVICES_REASON;
    if (prog === 'launchctl' && has(/^(unload|load|bootout|bootstrap|kill|stop|start|remove|disable|enable)$/i)) return SERVICES_REASON;
    return null;
  }

  // ---------- everything else ----------
  const RUNNERS = ['npm', 'npx', 'pnpm', 'yarn', 'bun', 'bunx'];
  const CLAUDE = ['claude', 'claude-code'];
  // Programs that only read, search or print what they're given.
  const READS_ONLY = ['echo', 'printf', 'grep', 'egrep', 'fgrep', 'rg', 'cat', 'type', 'head', 'tail', 'less', 'more', 'wc', 'ls', 'dir', 'stat', 'file', 'test', '[', 'which', 'where', 'get-content', 'gc', 'select-string', 'sls', 'findstr', 'jq', 'diff', 'cmp', 'sha1sum', 'sha256sum', 'md5sum', 'shasum', 'get-filehash', 'test-path', 'realpath', 'readlink', 'tree', 'du', 'basename', 'dirname', 'cd', 'pushd', 'popd'];
  // Git commands that may name the kit's files: they read them, or stage and commit them.
  const READ_ONLY_GIT = ['add', 'commit', 'diff', 'log', 'show', 'status', 'ls-files', 'blame', 'check-ignore', 'ls-tree', 'rev-parse', 'cat-file', 'grep', 'shortlog', 'describe', 'name-rev', 'whatchanged', 'rev-list'];
  // Commands that remove or move files: a wildcard or a folder above a protected place counts too.
  const DESTRUCTIVE = ['rm', 'rmdir', 'mv', 'unlink', 'shred', 'remove-item', 'ri', 'del', 'erase', 'rd', 'move-item', 'mi', 'move', 'ren', 'rename', 'rename-item', 'trash', 'chmod', 'chown', 'chattr', 'ln', 'truncate'];
  const DATA_OK = ['ls', 'dir', 'stat', 'du', 'test', '[', 'tree', 'test-path'];
  // Commands that write the files they name.
  const FILE_WRITERS = ['cp', 'copy', 'copy-item', 'cpi', 'touch', 'sed', 'perl', 'tee', 'dd', 'install', 'rsync', 'tar', 'unzip', 'patch', 'ni', 'new-item', 'set-content', 'add-content', 'out-file', 'mkdir', 'md', 'ln', 'git'];
  const GIT_WITH_ACTIONS = ['submodule', 'stash', 'remote', 'worktree', 'notes', 'bisect', 'lfs', 'sparse-checkout', 'maintenance', 'bundle', 'reflog', 'config', 'hook'];
  const SUBCOMMAND_PROGRAMS = ['git', 'npm', 'pnpm', 'yarn', 'bun', 'eas', 'expo', 'systemctl', 'service', 'docker', 'gh', 'supabase', 'launchctl', 'brew', 'pip', 'cargo', 'go', 'make', 'just', 'turbo', 'nx', 'deno', 'npx', 'wrangler', 'kubectl'];
  const SYSTEM_PROGRAMS = ['winget', 'choco', 'scoop', 'setx', 'sudo', 'doas', 'su', 'reg', 'msiexec', 'apt', 'apt-get', 'aptitude', 'dpkg', 'snap', 'flatpak', 'dnf', 'yum', 'rpm', 'pacman', 'apk', 'zypper', 'brew', 'port', 'nix-env', 'bcdedit', 'dism', 'schtasks', 'crontab', 'at', 'icacls', 'takeown', 'softwareupdate', 'installer', 'mas', 'sdkmanager', 'corepack', 'nvm', 'volta', 'fnm', 'asdf', 'mise', 'rustup', 'pipx',
    'install-module', 'install-package', 'install-script', 'update-module', 'register-psrepository', 'set-psrepository', 'set-executionpolicy', 'add-mppreference', 'set-mppreference',
    'new-netfirewallrule', 'set-netfirewallrule', 'remove-netfirewallrule', 'enable-netfirewallrule', 'disable-netfirewallrule', 'register-scheduledtask', 'set-scheduledtask',
    'unregister-scheduledtask', 'enable-windowsoptionalfeature', 'add-windowscapability', 'new-localuser', 'add-localgroupmember', 'ufw', 'iptables', 'useradd', 'usermod', 'passwd', 'visudo'];
  const SYSTEM = `Installing or changing software on the computer is the user's step: say what's needed and why (${RULES}).`;
  const SIGN_IN_REASON = `Signing in to or out of an account is the user's step: if a tool says no one is signed in, stop and ask (${RULES}).`;

  // Running a kit script (`node launchwright/scripts/status.mjs …`): reading and running is fine.
  function runsKitScript(words, prog) {
    if (!SCRIPT_RUNNERS.includes(prog)) return false;
    const at = words.findIndex((w) => base(w) === prog);
    const script = words.slice(at + 1).find((w) => !w.startsWith('-')) || '';
    return /^(\.[\\/])?launchwright[\\/]+(scripts|guard)[\\/]+[\w.-]+\.m?js$/i.test(script);
  }
  // Copies write files the command doesn't name: `cp -r x/. .` and `rsync -a x/ ./` fill the
  // project folder, and `cp /tmp/AGENTS.md .` writes AGENTS.md. Refused when the files a copy
  // writes can include the kit's, the guard's or the project's rules.
  const COPIERS = ['cp', 'copy', 'copy-item', 'cpi', 'rsync', 'install', 'ditto', 'xcopy', 'robocopy', 'scp'];
  const COPY_VALUE_OPTS = ['-t', '--target-directory', '-S', '--suffix', '-m', '--mode', '-o', '--owner', '-g', '--group', '-e', '--rsh', '--exclude', '--include', '--filter', '-f', '--files-from', '--chmod', '--chown', '-destination', '-path', '-filter', '-include', '-exclude'];
  function copyReason(words, prog, dir) {
    if (!COPIERS.includes(prog)) return null;
    const at = words.findIndex((w) => base(w) === prog);
    const args = withoutRedirections(words.slice(at + 1));
    let dest = null;
    const positional = [];
    for (let k = 0; k < args.length; k++) {
      const a = args[k];
      const lower = a.toLowerCase();
      if (['-t', '--target-directory', '-destination'].includes(lower)) { dest = args[k + 1] || ''; k += 1; continue; }
      if (lower.startsWith('--target-directory=')) { dest = a.slice(a.indexOf('=') + 1); continue; }
      if (COPY_VALUE_OPTS.includes(lower)) { k += 1; continue; }
      if (a.startsWith('-') && a !== '-') continue;
      positional.push(a);
    }
    if (dest === null) dest = positional.pop();
    if (!dest || /[$`]/.test(dest)) return null;
    const flags = args.filter((a) => a.startsWith('-')).join(' ');
    const intoFolder = /(^|\s)(-[a-zA-Z]*T|--no-target-directory)\b/.test(flags) ? false : null;
    const destAbs = resolve(dir || ROOT, expandHome(dest));
    const asFolder = intoFolder !== false && (prog === 'rsync' || /[\\/]$/.test(dest) || positional.length > 1 || isDir(destAbs) || ['-t', '--target-directory'].some((o) => args.includes(o)));
    const intoTop = isAncestorOrSelf(destAbs) || Boolean(placeOf(destAbs, ROOT, true, true));
    const why = `That copy would write files into the project folder that can include the kit, the guard or the project's rules: copy into a folder of its own, or name the files (${RULES}).`;
    // Copying a folder's contents (`x/.`, `x/*`, rsync's `x/`, `-T`) into the project folder, or a folder above a kit place.
    if (intoTop && (intoFolder === false || positional.some((src) => /[\\/]\.?$/.test(src) && (prog === 'rsync' || /\.$/.test(src)) || /[*?[]/.test(src.split(/[\\/]/).pop())))) return why;
    if (!asFolder) return null;
    for (const src of positional) {
      const name = src.replace(/[\\/]+$/, '').split(/[\\/]/).pop();
      if (!name || name === '.' || name === '..') continue;
      const target = join(destAbs, name);
      const place = placeOf(target, ROOT, false, true);
      if (place) return place.reason;
      if (isAncestorOrSelf(destAbs) && relative(ROOT, target).split(sep).length === 1 && PLACES.some((p) => segs(p.path)[0]?.toLowerCase() === name.toLowerCase())) return why;
      if (PROTECTED_NAMES.test(normalPath(target)) || PROTECTED_FOLDER.test(normalPath(target))) return PROTECTED_REASON;
    }
    return null;
  }
  function checkMisc(words, dir) {
    const b = words.map(base);
    const isRunner = b.some((x) => RUNNERS.includes(x));
    const gsub = gitSub(words);
    const prog = program(words);
    const progs = programsRun(words);
    const writes = words.some((w) => /^(\d|&)?>/.test(w)) || b.includes('tee');
    // Hosts agents never reach themselves.
    const onlyReads = (READS_ONLY.includes(prog) || (prog === 'git' && ['log', 'show', 'diff', 'grep', 'status', 'blame', 'commit'].includes(gsub || ''))) && !writes;
    for (const [h, why] of REFUSED_HOSTS) if (words.some((w) => w.toLowerCase().includes(h)) && !onlyReads) return why;
    if (!onlyReads && words.some((w) => /^smtps?:\/\//i.test(w) || /^--mail-(rcpt|from)\b/.test(w) || /^--url=smtps?:/i.test(w))) return MESSAGE_REASON;
    // Key names: never expanded, printed or looked up in the environment.
    for (const t of KEY_NAMES) {
      if (!words.some((w) => w.includes(t))) continue;
      const expands = words.some((w) => new RegExp(`\\$\\{?!?${t}\\b|\\$env:${t}\\b|%${t}%|(^|[^$\\w])env:[\\\\/]?${t}\\b`, 'i').test(w));
      const oneLiner = b.some((x) => INTERPRETERS.includes(x)) && words.some((w) => /^(-e|-p|-pe|-c|-r|--eval|--print|-command)$|^--(eval|print)=/i.test(w));
      if (expands || oneLiner || b.some((x) => ENV_READERS.includes(x))) return tokenReason(t);
    }
    // Any key-like name expanded into a command (`echo $MY_SECRET`, `psql "$DATABASE_URL"`) or read
    // from PowerShell's Env: drive. A commit message or a search pattern doesn't count.
    for (const m of scannable(words).matchAll(/\$\{?!?([A-Za-z_][A-Za-z0-9_]*)|\$env:([A-Za-z_][A-Za-z0-9_]*)|%([A-Za-z_][A-Za-z0-9_]*)%|(?:^|[^$\w])env:[\\/]?([A-Za-z_][A-Za-z0-9_]*)/gi)) {
      const name = m[1] || m[2] || m[3] || m[4];
      if (KEYISH.test(name)) return tokenReason(name);
    }
    if (b.some((x) => ENV_READERS.includes(x)) || (prog === 'printenv')) {
      if (prog === 'printenv' || prog === 'env') {
        const named = withoutRedirections(words.slice(words.findIndex((w) => base(w) === prog) + 1)).find((w) => KEYISH.test(w));
        if (named && prog === 'printenv') return tokenReason(named);
      }
    }
    // Programs refused in every Launchwright project, or by this one's settings.
    for (const p of progs) {
      const reason = REFUSED_PROGRAMS[p] || REFUSED_PROGRAMS[p.replace(/-(cli|tools)$/, '')];
      if (!reason) continue;
      const at = words.findIndex((w) => base(w) === p);
      const rest = withoutRedirections(words.slice(at + 1));
      if (rest.length && rest.every((w) => HELP_WORDS.includes(w))) continue;
      return reason;
    }
    // Claude Code sessions are the user's to start: one started from here could load other
    // settings and skip this guard.
    const namesClaude = words.some((w) => CLAUDE.includes(base(w.replace(/^[({!]+|[)};]+$/g, ''))) || /@anthropic-ai[\\/]+claude-code/i.test(w));
    const mentionsOnly = ['echo', 'printf', 'grep', 'egrep', 'fgrep', 'rg', 'cat', 'head', 'tail', 'less', 'more', 'wc', 'ls', 'dir', 'stat', 'file', 'test', '[', 'which', 'where', 'whereis', 'get-command', 'gcm', 'git', 'jq'].includes(LAUNCHERS.includes(prog) ? launched(words) || prog : prog) || (prog === 'command' && words.some((w) => w === '-v' || w === '-V')) || (prog === 'npm' && ['ls', 'list', 'view', 'info', 'show', 'why', 'explain', 'outdated'].includes((words[1] || '').toLowerCase()));
    const cl = words.findIndex((w) => CLAUDE.includes(base(w)));
    const validates = cl >= 0 && (words[cl + 1] || '').toLowerCase() === 'plugin' && (words[cl + 2] || '').toLowerCase() === 'validate' && words.length - cl <= 5 && words.slice(cl + 3).every((w) => /^(--strict|[\w./-]+)$/.test(w));
    const version = cl >= 0 && words.slice(cl + 1).length === 1 && HELP_WORDS.includes(words[cl + 1]);
    if (namesClaude && !mentionsOnly && !validates && !version) return `Only the user starts Claude Code sessions, scheduled tasks and plugins; agents never do (${RULES}).`;
    // Interpreter one-liners that start programs, end them, or print or load the environment.
    const inline = inlineCode(words);
    if (inline && startsPrograms(inline.name, inline.code)) return INTERPRETER_REASON;
    if (inline && KILLS_CODE.test(inline.code)) return KILL_REASON;
    if (inline && dumpsEnvCode(inline.name, inline.code)) return ENV_REASON;
    if (inline && SENDS_MAIL_CODE.test(inline.code)) return MESSAGE_REASON;
    if (inline && inline.name === 'osascript' && /\b(Mail|Messages|Outlook)\b/i.test(inline.code) && /\bsend\b/i.test(inline.code)) return MESSAGE_REASON;
    if (inline) {
      for (const m of inline.code.matchAll(/(?:process\.env|os\.environ|ENV|Deno\.env\.get|Bun\.env|getenv)\s*(?:\.\s*get\(\s*['"]|\.\s*fetch\(\s*['"]|\.\s*|\[\s*['"]|\(\s*['"])([A-Za-z_][A-Za-z0-9_]*)/g))
        if (KEYISH.test(m[1]) || KEY_NAMES.includes(m[1])) return tokenReason(m[1]);
      const host = REFUSED_HOSTS.find(([h]) => inline.code.toLowerCase().includes(h));
      if (host) return host[1];
      if (PROTECTED_NAMES.test(inline.code) || CODE_PLACE.test(inline.code)) return PROTECTED_REASON;
    }
    if (dumpsEnvironment(words)) return ENV_REASON;
    if ((inline && LOADS_ENV_CODE.test(inline.code)) || (INTERPRETERS.includes(prog) && words.some((w) => /dotenv/i.test(w))) || progs.some((x) => ['dotenv', 'dotenvx', 'dotenv-cli', 'env-cmd'].includes(x)))
      return LOADS_ENV_REASON;
    // Publishing packages, and package.json scripts that deploy, release or submit.
    const pm = words.findIndex((w) => PACKAGE_MANAGERS.includes(base(w)));
    if (pm >= 0 && ['publish', 'unpublish', 'deprecate', 'dist-tag', 'owner', 'access', 'token', 'adduser', 'login', 'logout'].includes((words.slice(pm + 1).find((w) => !w.startsWith('-')) || '').toLowerCase()))
      return /publish|deprecate|dist-tag|owner|access/.test(words.slice(pm + 1).find((w) => !w.startsWith('-')).toLowerCase()) ? PUBLISH_REASON : SIGN_IN_REASON;
    for (const sc of scriptsRun(words)) if (isProductionScript(sc)) return `\`${sc}\` deploys, releases or submits: only the user runs it (${RULES}).`;
    if (isRunner) for (const sc of PRODUCTION_SCRIPTS) if (words.some((w) => w.toLowerCase() === sc)) return `\`${sc}\` deploys, releases or submits: only the user runs it (${RULES}).`;
    // The project's rules and the guard, anywhere in the project.
    const reads = (READS_ONLY.includes(prog) || (prog === 'git' && READ_ONLY_GIT.includes(gsub || ''))) && !writes;
    const removesLock = ['rm', 'del', 'remove-item', 'ri', 'erase', 'unlink'].includes(prog);
    const named = words.filter((w) => (PROTECTED_NAMES.test(normalPath(w)) || PROTECTED_FOLDER.test(normalPath(w))) && !(removesLock && GIT_LOCK.test(normalPath(w))));
    if (named.length && (!reads || writesTo(words, (t) => PROTECTED_NAMES.test(normalPath(t)) || PROTECTED_FOLDER.test(normalPath(t))))) {
      if (!(runsKitScript(words, prog) && !writes)) return PROTECTED_REASON;
    }
    // Places at the project's top: the kit, workflows, status, approved text and real users' data.
    const findFiltered = prog === 'find' && words.some((w) => /^-(i?name|i?path|i?wholename|i?regex)$/.test(w));
    const findRemoves = prog === 'find' && (words.includes('-delete') || perItemCommands(words).some((c) => DESTRUCTIVE.includes(c)));
    const destructive = DESTRUCTIVE.includes(prog) || perItemCommands(words).some((c) => DESTRUCTIVE.includes(c)) && prog !== 'find' || (prog === 'git' && ['rm', 'mv', 'clean'].includes(gsub || '')) || (findRemoves && !findFiltered) || (prog === 'rsync' && words.some((w) => w.startsWith('--delete') || w === '--remove-source-files'));
    const bareOk = destructive || findRemoves || FILE_WRITERS.includes(prog);
    // `find … -name x -delete`: refused when its filter can match a file of the kit's.
    if (findRemoves && findFiltered) {
      for (let k = 0; k < words.length - 1; k++) {
        const test = words[k].toLowerCase();
        if (!/^-(i?name|i?path|i?wholename|i?regex)$/.test(test) || ['-not', '!'].includes(words[k - 1])) continue;
        if (!test.endsWith('name') || kitNames().some((n) => globRe(words[k + 1]).test(n))) return `That \`find\` can remove files of the kit or the guard: remove files from a folder of their own, or by name (${RULES}).`;
      }
    }
    const subAt = SUBCOMMAND_PROGRAMS.includes(prog) ? words.findIndex((w, k) => k > words.findIndex((x) => base(x) === prog) && !w.startsWith('-')) : -1;
    // The word after `git submodule`, `git stash` and the like names an action, not a path (`git submodule status`).
    const actionAt = prog === 'git' && GIT_WITH_ACTIONS.includes(gsub || '') && subAt >= 0 ? subAt + 1 : -1;
    const refAt = prog === 'git' ? gitRefWords(words) : new Set();
    for (let k = 0; k < words.length; k++) {
      if (k === subAt || base(words[k]) === prog || refAt.has(k)) continue;
      if (k === actionAt && !/[\\/]/.test(words[k])) continue;
      const place = placeOf(words[k], dir, destructive, bareOk);
      if (!place) continue;
      if (place.kind === 'data') {
        if (DATA_OK.includes(prog) && !writes) continue;
        if (prog === 'git' && ['status', 'log', 'check-ignore', 'ls-files'].includes(gsub || '')) continue;
        return place.reason;
      }
      if (place.kind === undefined) return place.reason;
      const writesHere = writesTo(words, (t) => Boolean(placeOf(t, dir, true)));
      if (reads && !writesHere && !destructive) continue;
      if (runsKitScript(words, prog) && !writesHere && words.filter((w) => placeOf(w, dir, false, false)).length === 1) continue;
      // Expo reads a listed workflow file to start it (checkServices allows only those).
      const easAt = words.findIndex((w) => ['eas', 'eas-cli'].includes(base(w)));
      if (easAt >= 0 && (words[easAt + 1] || '').toLowerCase() === 'workflow:run' && EAS_WORKFLOWS.includes(norm(words[k]).toLowerCase())) continue;
      return place.reason;
    }
    // A file written by redirection, named bare from inside a kit folder (`cd launchwright/guard && echo > guard-lib.mjs`).
    for (const t of writeTargets(words)) {
      const place = placeOf(t, dir, false, true);
      if (place) return place.reason;
    }
    const copied = copyReason(words, prog, dir);
    if (copied) return copied;
    if (words.some((w) => HIDDEN_GLOB.test(w)) && !['ls', 'dir'].includes(prog)) return 'A wildcard on hidden files can match `.env` files: name the file instead.';
    // Patches and archives change files they don't name: a patch is read, and an archive is
    // unpacked only into a folder of its own.
    if (prog === 'patch') {
      const files = [];
      words.forEach((w, k) => {
        if (w === '<' || w === '-i' || w === '--input') files.push(words[k + 1] || '');
        else if (/^<[^<]/.test(w)) files.push(w.slice(1));
        else if (w.startsWith('--input=')) files.push(w.slice(8));
      });
      const why = patchReason(files.filter(Boolean), dir);
      if (why) return why;
    }
    const tarAt = words.findIndex((x) => ['tar', 'bsdtar', 'gtar'].includes(base(x)));
    const unpacks = (prog === 'unzip' && !words.some((w) => ['-l', '-t', '-v', '-Z'].includes(w))) ||
      (['tar', 'bsdtar', 'gtar'].includes(prog) && words.some((w, k) => w === '--extract' || w === '--get' || /^-[a-wyzA-Z]*x[a-zA-Z]*$/.test(w) || (k === tarAt + 1 && /^[a-wyz]*x[a-z]*$/i.test(w)))) ||
      (prog === 'cpio' && words.some((w) => w === '--extract' || /^-[a-zA-Z]*i[a-zA-Z]*$/.test(w))) ||
      (prog === 'ditto' && words.some((w) => /^-[a-zA-Z]*x/.test(w))) ||
      (['expand-archive', '7z', '7za'].includes(prog) && !words.some((w) => /^[lt]$/i.test(w)));
    if (unpacks) {
      const at = words.findIndex((w, k) => ['-d', '-c', '--directory', '-destinationpath'].includes(w.toLowerCase()) && k > 0);
      const target = at >= 0 ? words[at + 1] || '' : words.find((w) => /^--directory=|^-o\S/.test(w))?.replace(/^--directory=|^-o/, '') ?? null;
      const where = target === null ? dir : resolve(dir || ROOT, expandHome(target));
      const rel = where ? relative(ROOT, where).split(sep).join('/') : '';
      if (!where || rel === '' || (!rel.startsWith('..') && !isAbsolute(rel) && placeOf(rel, ROOT, true, true)) || (rel.startsWith('..') && ROOT.startsWith(where)))
        return `Unpack an archive into a folder of its own (\`unzip x.zip -d tmp/x\`, \`tar -xf x.tar -C tmp/x\`): unpacked here it could overwrite the kit or the guard (${RULES}).`;
    }
    if (progs.includes('playwright') && (words.includes('--with-deps') || words.includes('install-deps'))) return SYSTEM;
    if (progs.includes('uv') && ((words.includes('tool') && words.includes('install')) || (words.includes('pip') && words.some((w) => w === '--system' || w === '--break-system-packages')))) return SYSTEM;
    // Software on the computer.
    if (b.includes('npm') && (words.includes('-g') || words.includes('--global') || words.includes('--location=global'))) return SYSTEM;
    if (['pnpm', 'yarn', 'bun'].some((x) => b.includes(x)) && (words.includes('-g') || words.includes('--global') || words.includes('global'))) return SYSTEM;
    if (progs.some((x) => SYSTEM_PROGRAMS.includes(x))) return SYSTEM;
    if (prog === 'netsh' && !words.some((w) => /^show$/i.test(w))) return SYSTEM;
    if (prog === 'net' && ['user', 'localgroup', 'share', 'accounts', 'config'].includes((words[words.findIndex((w) => base(w) === 'net') + 1] || '').toLowerCase())) return SYSTEM;
    if (words.some((w) => /setenvironmentvariable/i.test(w)) && words.some((w) => /\b(user|machine)\b/i.test(w))) return SYSTEM;
    if (words.some((w) => /^(registry::|hk(cu|lm|cr|u|cc):)/i.test(w)) && !['get-itemproperty', 'gp', 'get-item', 'gi', 'get-childitem', 'gci', 'dir', 'ls', 'test-path'].includes(prog)) return SYSTEM;
    if (progs.some((x) => ['pip', 'pip3'].includes(x)) && words.includes('install') && !words.some((w) => w === '--target' || w === '-t' || w === '--prefix') && !process.env.VIRTUAL_ENV) return SYSTEM;
    if (b.some((x) => ['python', 'python3', 'py'].includes(x)) && words.includes('-m') && words.includes('pip') && words.includes('install') && !process.env.VIRTUAL_ENV) return SYSTEM;
    if (['gem', 'cargo', 'go'].includes(prog) && (words[1] || '').toLowerCase() === 'install' && !(prog === 'go' && words.length === 2)) return SYSTEM;
    const pmAt = words.findIndex((w) => ['npm', 'pnpm', 'yarn'].includes(base(w)));
    if (pmAt >= 0) {
      const [first, second] = words.slice(pmAt + 1).filter((w) => !w.startsWith('-')).map((w) => w.toLowerCase());
      const project = words.some((w, i) => w === '--location=project' || (w === '--location' && words[i + 1] === 'project'));
      if (((first === 'config' && ['set', 'delete', 'rm', 'edit', 'fix'].includes(second)) || first === 'set') && !project) return SYSTEM;
    }
    const acctAt = words.findIndex((w) => ['eas', 'eas-cli', 'expo', 'firebase', 'vercel', 'netlify', 'supabase', 'wrangler'].includes(base(w)));
    if (acctAt >= 0 && ['login', 'logout', 'register', 'signin', 'signout'].includes((words.slice(acctAt + 1).find((w) => !w.startsWith('-')) || '').toLowerCase())) return SIGN_IN_REASON;
    return null;
  }
  const normalPath = (w) => w.replace(/\\/g, '/').replace(/\/\.(?=\/)/g, '').replace(/\/{2,}/g, '/');
  // The files a command writes by redirection or tee (`> CLAUDE.md`, `>>status/x`, `tee AGENTS.md`).
  function writeTargets(words) {
    const out = [];
    for (let k = 0; k < words.length; k++) {
      const m = words[k].match(/^(\d|&)?>[>|]?(.*)$/);
      if (m && !/^&(\d+|-)$/.test(m[2])) out.push(m[2] || words[k + 1] || '');
      if (base(words[k]) === 'tee') out.push(...words.slice(k + 1).filter((w) => !w.startsWith('-')));
    }
    return out.filter(Boolean);
  }
  const writesTo = (words, matches) => writeTargets(words).some(matches);
  // Words to scan for secret patterns: everything except a commit or tag message, and nothing for
  // git commands that only list paths.
  function scannable(words) {
    const sub = gitSub(words) || '';
    if (['check-ignore', 'ls-files', 'status'].includes(sub)) return '';
    const message = ['commit', 'tag', 'stash'].includes(sub);
    const prog = program(stripLead(words));
    const search = ['grep', 'egrep', 'fgrep', 'rg'].includes(prog);
    const byFlag = search && words.some((w) => w === '-e' || w === '--regexp' || w.startsWith('--regexp=') || w === '-f' || w === '--file');
    let patternAt = -1;
    if (search && !byFlag) {
      let k = words.findIndex((x) => base(x) === prog) + 1;
      while (k < words.length && words[k].startsWith('-')) k += ['-m', '-A', '-B', '-C', '-g', '--glob', '-t', '--type', '-T', '--type-not', '--max-count'].includes(words[k]) ? 2 : 1;
      if (k < words.length) patternAt = k;
    }
    const out = [];
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      if (message && (/^-[a-zA-Z]*m$/.test(w) || w === '--message')) { i += 1; continue; }
      if (message && /^-[a-zA-Z]*m./.test(w) && !w.startsWith('--')) continue;
      if (/^--message=/.test(w)) continue;
      if (/^--exclude(-dir|-from)?=/.test(w)) continue;
      if (search && (w === '-e' || w === '--regexp')) { i += 1; continue; }
      if (search && w.startsWith('--regexp=')) continue;
      if (i === patternAt) continue;
      if (['select-string', 'sls'].includes(prog) && /^-pattern$/i.test(w)) { i += 1; continue; }
      out.push(w);
    }
    return out.join(' ');
  }

  const SHELLS = ['sh', 'bash', 'zsh', 'dash', 'ksh', 'fish', 'cmd', 'powershell', 'pwsh', 'csh', 'tcsh', 'busybox'];
  const PS_VALUE_OPTS = /^-(executionpolicy|ep|ex|windowstyle|w|version|v|configurationname|config|workingdirectory|wd|outputformat|of|o|inputformat|if|psconsolefile|custompipename|settingsfile|settings)$/i;
  const SH_CODE_FLAG = /^-[a-zA-Z]*c[a-zA-Z]*$/;
  const STDIN_SHELL_REASON = `A shell that reads its commands from a pipe, a heredoc or a here-string can't be checked: run the commands directly, or put them in a script file (${RULES}).`;
  const DEPTH_REASON = `Commands nested this deeply can't be checked: write them out one by one (${RULES}).`;
  // Paths in code (heredocs and one-liners) that name the kit's places from the project's top.
  const CODE_PLACE = new RegExp(`(^|["'\`\\s=(,])(\\.\\/)?((${PLACES.map((p) => segs(p.path).map(escapeRe).join('\\/')).join('|')})\\/|(launchwright|\\.github|\\.eas)(["'\`\\s)]|$))`, 'i');

  // Returns the reason a shell command is refused, or null. `powershell`: also check it with
  // PowerShell's comma lists split into words. `cwd`: the folder it runs in.
  // `inFile`: the command is a script file's text (checked best-effort: a computed program there,
  // such as "$DIR/build.sh", is allowed).
  function check(command, depth = 0, { powershell = false, cwd = null, inFile = false } = {}) {
    if (typeof command !== 'string' || command.trim() === '') return null;
    if (depth > 8) return DEPTH_REASON;
    if (depth === 0) commandText = command;
    const dir0 = cwd === undefined ? null : cwd;
    const quietCommand = quietQuoted(command);
    if (powershell) {
      const split = check(quietCommand.replace(/,/g, ' '), depth + 1, { cwd: dir0, inFile });
      if (split) return split;
    }
    // Brackets and braces group commands: check once more with them as separators.
    if (/[(){}]/.test(quietCommand)) {
      const reason = check(quietCommand.replace(/[(){}]/g, ' ; '), depth + 1, { powershell, cwd: dir0, inFile });
      if (reason) return reason;
    }
    const { text, bodies } = splitHeredocs(command);
    const all = segments(text);
    const messageOnly = all.length === 1 && ['commit', 'tag'].includes(gitSub(all[0]) || '');
    if (!messageOnly) for (const body of bodies) if (secretsIn(body) || KEY_NAMES.some((t) => new RegExp(`\\b${t}\\b`).test(body))) return SECRET_REASON;
    // A heredoc fed to an interpreter is code, and so is the whole command when an interpreter
    // reads its code from a pipe: no starting programs, no printing or loading the environment.
    const fed = all.map((w) => program(stripLead(w))).find((p) => INTERPRETERS.includes(p));
    const piped = all.map(readsStdin).find(Boolean);
    const code = [...(fed ? bodies : []), ...(piped ? [text] : [])];
    for (const c of code) {
      if (startsPrograms(fed || piped, c)) return INTERPRETER_REASON;
      if (KILLS_CODE.test(c)) return KILL_REASON;
      if (dumpsEnvCode(fed || piped, c)) return ENV_REASON;
      if (SENDS_MAIL_CODE.test(c)) return MESSAGE_REASON;
      if (LOADS_ENV_CODE.test(c)) return LOADS_ENV_REASON;
      const host = REFUSED_HOSTS.find(([h]) => c.toLowerCase().includes(h));
      if (host) return host[1];
      if (PROTECTED_NAMES.test(c) || CODE_PLACE.test(c)) return PROTECTED_REASON;
      for (const m of c.matchAll(/(?:process\.env|os\.environ|ENV|Deno\.env\.get|Bun\.env|getenv)\s*(?:\.\s*get\(\s*['"]|\.\s*fetch\(\s*['"]|\.\s*|\[\s*['"]|\(\s*['"])([A-Za-z_][A-Za-z0-9_]*)/g))
        if (KEYISH.test(m[1]) || KEY_NAMES.includes(m[1])) return tokenReason(m[1]);
    }
    for (const inner of innerCommands(quietQuoted(text))) {
      const reason = check(inner, depth + 1, { cwd: dir0 });
      if (reason) return reason;
    }
    // Key names: no environment listing anywhere in a command that names one (`printenv | grep KEY`).
    const listsEnv = (segment) => {
      const words = stripLead(segment);
      const p = base(words[0] || '');
      const args = words.slice(1);
      if (p === 'printenv') return true;
      if (p === 'env') return args.every((x) => x.startsWith('-'));
      if (p === 'set') return args.length === 0;
      if (p === 'export') return args.every((x) => x === '-p');
      if (p === 'declare' || p === 'typeset') return args.length === 0 || args.some((x) => /^-[a-zA-Z]*[px]/.test(x));
      if (p === 'echo' || p === 'printf') return args.some((x) => x.includes('$'));
      return false;
    };
    for (const t of KEY_NAMES) if (text.includes(t) && all.some(listsEnv)) return tokenReason(t);
    const listing = checkListings(all, powershell);
    if (listing) return listing;
    let dir = dir0;
    for (const segment of all) {
      const words = aliasPackages(stripLead(segment)).flatMap((w) => (/\s/.test(w) ? [w] : expandBraces(w)));
      if (!words.length) continue;
      if (!inFile && (/[$`]/.test(programWord(words)) || (program(words) === 'git' && /[$`]/.test(gitSub(words) || '')))) return COMPUTED_REASON;
      // `alias x='…'` and the commands `script -c`, `flock -c`, `watch` and `su -c` run are checked too.
      if (program(words) === 'alias') {
        for (const w of words.slice(1)) {
          const reason = w.includes('=') ? check(w.slice(w.indexOf('=') + 1), depth + 1, { cwd: dir }) : null;
          if (reason) return reason;
        }
      }
      {
        const runner = [program(words), launched(words)].find((p) => ['script', 'flock', 'watch', 'su', 'runuser'].includes(p));
        if (runner) {
          const at = words.findIndex((w) => base(w) === runner);
          const c = words.findIndex((w, n) => n > at && ['-c', '--command'].includes(w));
          const code = c > at ? words[c + 1] || '' : runner === 'watch' ? words.slice(at + 1).filter((w) => !w.startsWith('-') && !/^\d+(\.\d+)?$/.test(w)).join(' ') : '';
          const reason = code ? check(code, depth + 1, { cwd: dir }) : null;
          if (reason) return reason;
        }
      }
      const shell = [program(words), launched(words)].find((p) => SHELLS.includes(p));
      if (shell) {
        const at = words.findIndex((w) => SHELLS.includes(base(w)));
        const after = words.slice(at + 1);
        if (after.some((w) => w.startsWith('<<<'))) return STDIN_SHELL_REASON;
        if (shell === 'powershell' || shell === 'pwsh') {
          const flags = after.map((w) => w.toLowerCase());
          if (!flags.some((w) => /^-(c|command|f|file|e|ec|en\w*)$/.test(w))) {
            let k = 0;
            while (k < after.length && after[k].startsWith('-')) k += PS_VALUE_OPTS.test(after[k]) ? 2 : 1;
            const rest = withoutRedirections(after.slice(k));
            if (!rest.length) return STDIN_SHELL_REASON;
            const reason = check(rest.join(' '), depth + 1, { powershell: true, cwd: dir });
            if (reason) return reason;
          }
        } else if (shell === 'cmd') {
          if (!after.some((w) => /^\/{1,2}[ckr]$/i.test(w))) return STDIN_SHELL_REASON;
        } else if (!after.some((w) => SH_CODE_FLAG.test(w)) && !withoutRedirections(after).some((w) => !w.startsWith('-') && w !== '-s')) return STDIN_SHELL_REASON;
      }
      for (let k = 0; k < words.length; k++) {
        const name = base(words[k]);
        if (SHELLS.includes(name)) {
          if ((name === 'powershell' || name === 'pwsh') && words.some((w, n) => n > k && /^[-/](e|ec|en\w*)$/i.test(w)))
            return `Encoded PowerShell commands can't be checked: write the command out (${RULES}).`;
          const sh = !['powershell', 'pwsh', 'cmd', 'fish'].includes(name);
          const at = words.findIndex((w, n) => n > k && ((sh ? SH_CODE_FLAG : /^-[a-zA-Z]*c$/).test(w) || /^[/-]c(ommand)?$/i.test(w) || /^\/{1,2}[ckr]$/i.test(w)));
          if (at > k) {
            let from = at + 1;
            while (sh && from < words.length && /^[-+]./.test(words[from])) {
              if (words[from] === '--') { from += 1; break; }
              from += /^[-+][oO]$|^--(rcfile|init-file)$/.test(words[from]) ? 2 : 1;
            }
            if (/^\s*[$`]/.test(words[from] || '')) return COMPUTED_REASON;
            const own = sh || name === 'fish' ? check(words[from] || '', depth + 1, { cwd: dir }) : null;
            const reason = own || check(words.slice(from).join(' '), depth + 1, { powershell: name === 'powershell' || name === 'pwsh', cwd: dir });
            if (reason) return reason;
          }
        }
        if (['eval', 'invoke-expression', 'iex'].includes(name)) {
          if (/^\s*[$`]/.test(words.slice(k + 1).join(' '))) return COMPUTED_REASON;
          const reason = check(words.slice(k + 1).join(' '), depth + 1, { cwd: dir });
          if (reason) return reason;
        }
      }
      // The folder this segment runs in: `cd x` changes it for the segments after it.
      const gitC = words.findIndex((w) => w === '-C') > 0 && base(words[0]) === 'git' ? words[words.findIndex((w) => w === '-C') + 1] : null;
      const here = gitC ? (dir === null || /[$`]/.test(gitC) ? null : resolve(dir, expandHome(gitC))) : dir;
      const reason = checkGit(words, here) || checkServices(words) || checkGrep(words) || checkProcesses(words) || checkMisc(words, here) || taskTargetReason(words);
      if (reason) return reason;
      for (const [label, text, at] of fileCommands(words, here)) {
        const inner = check(text, depth + 1, { cwd: at, inFile: true });
        if (inner) return `${label} runs a command the guard refuses. ${inner}`;
      }
      if (secretsIn(scannable(words))) return SECRET_REASON;
      const p = program(words);
      if (['cd', 'pushd', 'chdir', 'set-location', 'sl'].includes(p)) {
        const target = withoutRedirections(words.slice(words.findIndex((w) => base(w) === p) + 1)).find((w) => !w.startsWith('-'));
        dir = dir === null || !target || /[$`*?]/.test(target) || target === '-' ? (target ? null : dir) : resolve(dir, expandHome(target));
      }
    }
    return null;
  }

  // ---------- commands inside files ----------
  // A package.json script (`npm run x`, `npm test`, and the install scripts `npm install` runs) or
  // a shell script (`bash x.sh`, `source x.sh`, `./x.sh`) runs commands the guard never sees on
  // the command line, so their text is checked too. Programs in other languages (`node x.mjs`)
  // can't be read this way.
  const readText = (file) => {
    try {
      if (!isFile(file) || statSync(file).size > 256 * 1024) return null;
      const text = readFileSync(file, 'utf8');
      return text.includes('\0') ? null : text;
    } catch {
      return null;
    }
  };
  const INSTALLS = ['install', 'i', 'ci', 'add', 'clean-install', 'install-test', 'it', 'cit', 'isntall'];
  const LIFECYCLE = ['preinstall', 'install', 'postinstall', 'preprepare', 'prepare', 'postprepare'];
  const PM_FOLDER_OPTS = ['--prefix', '-C', '--cwd', '--dir', '-w', '--workspace', '--filter', '-F'];
  function fileCommands(words, dir) {
    const out = [];
    const here = dir || ROOT;
    const pm = words.findIndex((w) => PACKAGE_MANAGERS.includes(base(w)));
    if (pm >= 0 && !words.some((w) => PM_FOLDER_OPTS.includes(w) || PM_FOLDER_OPTS.some((o) => o.startsWith('--') && w.startsWith(`${o}=`))) && (words[pm + 1] || '').toLowerCase() !== 'workspace') {
      let scripts = {};
      try {
        const pkg = JSON.parse(readText(join(here, 'package.json')) || '{}');
        if (pkg && typeof pkg.scripts === 'object' && pkg.scripts) scripts = pkg.scripts;
      } catch {
        scripts = {};
      }
      const first = (words.slice(pm + 1).find((w) => !w.startsWith('-')) || '').toLowerCase();
      const names = [...scriptsRun(words)];
      if (INSTALLS.includes(first) || (!first && base(words[pm]) !== 'npm')) names.push(...LIFECYCLE);
      for (const n of names) for (const name of [`pre${n}`, n, `post${n}`]) if (typeof scripts[name] === 'string') out.push([`The package.json script \`${name}\``, scripts[name], here]);
    }
    const prog = program(words);
    let file = null;
    const shell = [prog, launched(words)].find((p) => ['sh', 'bash', 'zsh', 'dash', 'ksh'].includes(p));
    if (shell) {
      const at = words.findIndex((w) => base(w) === shell);
      const after = withoutRedirections(words.slice(at + 1));
      if (!after.some((w) => SH_CODE_FLAG.test(w))) file = after.find((w) => !w.startsWith('-') && !w.startsWith('+')) || null;
    } else if (['source', '.'].includes(words[0])) file = words[1] || null;
    else if (/[\\/]/.test(programWord(words)) || /\.(sh|bash|zsh)$/i.test(programWord(words))) {
      file = programWord(words);
      const text = readText(resolve(here, expandHome(file)));
      const shebang = text && text.startsWith('#!') ? text.split('\n')[0] : '';
      if (shebang && !/\b(sh|bash|zsh|dash|ksh)\b/.test(shebang)) file = null;
    }
    if (file && !/[$`*?]/.test(file)) {
      const text = readText(resolve(here, expandHome(file)));
      // Comment lines (and the `#!` line) aren't commands.
      if (text !== null) out.push([`The script \`${file}\``, text.split(/\r?\n/).filter((l) => !/^\s*#/.test(l)).join('\n'), here]);
    }
    return out;
  }
  // Targets of make, just and the like, and of turbo and nx (`nx run app:deploy`), named for a deploy.
  const TASK_RUNNERS = ['make', 'gmake', 'just', 'task', 'rake', 'mage', 'turbo', 'nx', 'lerna', 'moon'];
  function taskTargetReason(words) {
    const runner = programsRun(words).find((p) => TASK_RUNNERS.includes(p));
    if (!runner) return null;
    const at = words.findIndex((w) => base(w) === runner);
    for (const w of words.slice(at + 1)) {
      if (w.startsWith('-') || /^[A-Za-z_][A-Za-z0-9_]*=/.test(w)) continue;
      for (const part of w.split(':')) if (isProductionScript(part)) return `\`${w}\` deploys, releases or submits: only the user runs it (${RULES}).`;
    }
    return null;
  }

  // ---------- file tools ----------
  // Windows ignores dots and spaces at the end of a name (`AGENTS.md.` is AGENTS.md): drop them.
  const relPath = (filePath, cwd) => {
    const abs = resolve(cwd || ROOT, expandHome(filePath.trim()));
    const rel = relative(ROOT, abs).split(sep).join('/');
    return rel.startsWith('..') || isAbsolute(rel) ? null : rel.split('/').map((x) => x.replace(/[. ]+$/, '') || x).join('/');
  };
  const under = (rel, p) => {
    const q = norm(p).toLowerCase();
    const r = rel.toLowerCase();
    return Boolean(q) && (r === q || r.startsWith(q + '/'));
  };
  const nameProtected = (rel) => {
    const parts = rel.split('/');
    const lowerParts = parts.map((x) => x.toLowerCase());
    return lowerParts.includes('.claude') || lowerParts[0] === '.git' || lowerParts.includes('.husky') || ['claude.md', 'claude.local.md', 'agents.md', '.mcp.json'].includes(lowerParts[lowerParts.length - 1]);
  };
  // Returns the reason a file edit is refused, or null. `change` holds the new content (`content`)
  // or the edits (`edits`: [{ old_string, new_string, replace_all }]), for the guard's settings.
  function checkFile(filePath, { cwd = null, content, edits } = {}) {
    if (typeof filePath !== 'string' || !filePath.trim()) return "the guard couldn't find the file's path, so it refuses the edit (fail closed).";
    const abs = resolve(cwd || ROOT, expandHome(filePath.trim()));
    if (underGuard(abs) || OUTSIDE_PROTECTED.test(abs.split(sep).join('/'))) return PROTECTED_REASON;
    const rel = relPath(filePath, cwd);
    if (rel === null) return null; // anywhere else outside the project: not the guard's business
    if (rel.split('/').includes('..')) return `Name the file without \`..\` (${RULES}).`;
    if (nameProtected(rel)) return PROTECTED_REASON;
    if (secretsIn(rel) || secretsIn(`/${rel}`)) return `Keys never go in a file, and key files are never edited by agents (${RULES}).`;
    for (const place of PLACES) {
      if (!under(rel, place.path)) continue;
      if (place.kind === 'data') return place.reason;
      if (rel.toLowerCase() === KIT_FILE) return null; // the user's answers (time zone, review window)
      if (rel.toLowerCase() === SETTINGS_FILE) return checkSettingsEdit(content, edits);
      if (place.kind === 'approved') return existsSync(join(ROOT, rel)) ? place.reason : null;
      return place.reason;
    }
    return null;
  }
  function checkSettingsEdit(content, edits) {
    const file = join(ROOT, SETTINGS_FILE);
    let before = '';
    try {
      before = readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
    } catch {
      before = '';
    }
    let after;
    if (typeof content === 'string') after = content;
    else if (Array.isArray(edits) && edits.length) {
      after = before;
      for (const e of edits) {
        if (!e || typeof e.old_string !== 'string' || typeof e.new_string !== 'string') return `The guard couldn't read the edit to its settings, so it refuses it (${RULES}).`;
        if (e.old_string === '' ? after !== '' : !after.includes(e.old_string)) return `The guard couldn't apply the edit to its settings, so it refuses it (${RULES}).`;
        after = e.replace_all ? after.split(e.old_string).join(e.new_string) : after.replace(e.old_string, () => e.new_string);
      }
    } else return `Only edits that show the new text may change the guard's settings (${RULES}).`;
    let b = {};
    let a;
    try {
      if (before.trim()) b = JSON.parse(before);
    } catch {
      b = {};
    }
    try {
      a = JSON.parse(after.replace(/^\uFEFF/, ''));
    } catch (e) {
      return `The guard's settings would no longer be valid JSON (${e.message}) (${RULES}).`;
    }
    const why = onlyTightens(b, a);
    return why ? `Agents may only add to the guard's settings (the user's answers), never take anything away: ${why} (${RULES}).` : null;
  }
  // Returns the reason a file read (or search) is refused, or null: keys and real users' data.
  function checkRead(filePath, { cwd = null, glob } = {}) {
    if (typeof glob === 'string' && glob && secretsIn(glob)) return SECRET_REASON;
    if (typeof filePath !== 'string' || !filePath.trim()) return null;
    const p = filePath.trim();
    if (secretsIn(p) || secretsIn(`/${p.replace(/\\/g, '/').split('/').pop()}`)) return SECRET_REASON;
    const rel = relPath(p, cwd);
    if (rel === null) return null;
    for (const place of PLACES) if (place.kind === 'data' && under(rel, place.path)) return place.reason;
    return null;
  }

  // ---------- MCP tools ----------
  // Tools from MCP servers reach services directly, past every command check: GitHub's can push,
  // merge, release and start workflows, and others can deploy, take payments, run SQL on the
  // live database or send email. In a Launchwright project, GitHub's tools are for reading only,
  // and tools named for a hard stop are refused. Claude's own tools (talking to the user,
  // publishing a private page) are fine, apart from starting sessions, scheduled tasks and
  // changing the cloud environment.
  const READ_TOOL = /^(get|list|search|read|retrieve|fetch|describe|view|show|find|count)(_|$)/;
  const GITHUB_READS = /^(get|list|search|read)(_|$)|_(get|list|read|search)$/;
  const SESSION_TOOLS = /^(create|update|delete|fire|run)_(trigger|routine|environment)s?$|^switch_environment$/;
  const HARD_STOP_TOOL = /(^|_)(deploy|deployment|publish|submit|merge|release|charge|refund|payout|payment|invoice|subscription|execute_sql|run_sql|query_sql|apply_migration|send_(email|mail|sms|text|push|notification)|delete_project|delete_branch)(s?)(_|$)/;
  function checkMcp(tool) {
    const m = /^mcp__(.+?)__(.+)$/.exec(String(tool || ''));
    if (!m) return null;
    const server = m[1].toLowerCase();
    const action = m[2].toLowerCase();
    if (SESSION_TOOLS.test(action)) return `Only the user starts Claude Code sessions and scheduled tasks, and changes the cloud environment (${RULES}).`;
    if (server.includes('github')) return GITHUB_READS.test(action) ? null : BUILT_IN_HOSTS['api.github.com'];
    if (/^(claude|hearthbot)/.test(server) || READ_TOOL.test(action)) return null;
    if (HARD_STOP_TOOL.test(action)) return `\`${action}\` from the ${m[1]} tools can deploy, publish, merge, take payments, reach the live database or send messages: that's the user's step. Prepare it and ask for their go-ahead (${RULES}).`;
    return null;
  }

  return { check, checkFile, checkRead, checkMcp, settings: S, root: ROOT };
}

// ---------- one entry point for every hook ----------

const guards = new Map();
function guardFor(root) {
  if (!guards.has(root)) {
    const loaded = loadSettings(root);
    guards.set(root, loaded.error ? { error: loaded.error } : { guard: createGuard(loaded.settings, root, loaded.kit) });
  }
  return guards.get(root);
}

// Returns the reason a call is refused, or null. Throws only on a bug; guardCall catches that.
export function decide(call = {}) {
  const roots = findProjects(call);
  if (!roots.length) return null; // not a Launchwright project: the guard does nothing
  const kind = call.kind;
  if (kind === 'unreadable') return "the guard couldn't read the call, so it refuses it (fail closed).";
  if (kind === 'shell' && typeof call.command === 'string' && call.command.includes(CANARY)) return CANARY_REPLY;
  if (kind === 'shell' && typeof call.command !== 'string') return call.requireCommand === false ? null : "the guard couldn't find the command, so it refuses it (fail closed).";
  for (const root of roots) {
    const g = guardFor(root);
    if (g.error) return `The guard refuses everything here because ${g.error}. A kit update or the user fixes it: say so in your report.`;
    const cwd = typeof call.cwd === 'string' && call.cwd ? resolve(call.cwd) : null;
    const inside = cwd && !relative(root, cwd).startsWith('..') && !isAbsolute(relative(root, cwd)) ? cwd : null;
    let reason = null;
    // The real folder the command runs in, even above the project (a cloud session's folder), so
    // `rm -rf my-app` there is seen for what it removes.
    if (kind === 'shell') reason = g.guard.check(call.command, 0, { powershell: Boolean(call.powershell), cwd: inside ?? cwd ?? root });
    else if (kind === 'edit') reason = g.guard.checkFile(call.filePath, { cwd, content: call.content, edits: call.edits });
    else if (kind === 'read') reason = g.guard.checkRead(call.filePath, { cwd, glob: call.glob });
    else if (kind === 'mcp') reason = g.guard.checkMcp(call.tool);
    if (reason) return reason;
  }
  return null;
}

// The hook's one call. Never throws: on a bug, it refuses only inside a Launchwright project.
export function guardCall(call = {}) {
  try {
    return decide(call);
  } catch (e) {
    try {
      return findProjects(call).length ? `the guard hit an error (${e && e.message}), so it refuses this call (fail closed).` : null;
    } catch {
      return null;
    }
  }
}
