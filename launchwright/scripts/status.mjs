#!/usr/bin/env node
// Launchwright's status recorder for a user's project. It's the only way a project's status
// changes: Claude runs it, and never edits status/ by hand. Each command writes one small file
// under status/ (so parallel threads never touch the same file), commits only that file, and
// pushes it to the branch this copy is on, pulling newer commits first if the push is turned away.
// The status page (render-status.mjs) is built from these files.
//
// It works in any repo that has the kit (launchwright/kit.json, found from the current folder
// upwards); --root <folder> names the project instead. In a repo without the kit it does nothing.
// The plan comes from project/plan.json; `rebaseline` fixes a baseline in status/baseline.json,
// and from then on the page measures against it.
//
// Generalized from the Launchwright build's own buildkit/status.mjs.
// Plain Node 20+, no packages. Run `node status.mjs help` for the commands.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const HELP = `Usage: node status.mjs <command> [options]
Options for every command: --root <project folder>, --no-push (write without committing).

  start <piece> --title "<what>" [--phase <id>] [--model "<model, effort>"]   a piece begins
  finish <piece> --summary "<what was done, plain words>"                    a piece is done
  fail <piece> --summary "<what went wrong>"                                 a piece failed
  block <piece> --summary "<what it waits for>"                              a piece can't go on
  ask <id> --level <blocking|do-by|fyi> --text "<the question or task>"       something waits on the user
        [--do-by YYYY-MM-DD] [--holding "<what it holds up>"] [--no-alert]   (blocking and do-by also alert the phone)
        [--needed <start|end>:<phase id>]                                    when it's needed: the start or end of a phase
  answered <id> [--note "<the answer, in the user's words>"]                 the user answered
  phase <id>                                                                 a phase of the plan begins (the open one ends)
  mode <running|waiting|paused|done> [--note "<why>"]                         what the build is doing overall
  task-done <task id>                                                        one of the user's planned tasks is done
  rebaseline <plan.json>                                                     a new baseline (only at a stop, with the user's OK)
  page-link <https link>                                                     where the published status page opens (alerts link to it)
  show                                                                       a short summary, nothing written`;

export const ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,40}$/;
export const DATE = /^\d{4}-\d{2}-\d{2}$/;
export const LEVELS = ['blocking', 'do-by', 'fyi'];
export const MODES = ['running', 'waiting', 'paused', 'done'];

export class StatusError extends Error {
  constructor(message, code = 1) {
    super(message);
    this.code = code;
  }
}
const stop = (msg, code = 2) => {
  throw new StatusError(msg, code);
};

export const readJson = (file, fallback = null) => {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
};
export const writeJson = (file, value) => {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
};
export const readDir = (dir) =>
  existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => f.endsWith('.json'))
        .sort()
        .map((f) => readJson(join(dir, f)))
        .filter(Boolean)
    : [];

// The project's root: the folder holding launchwright/kit.json, from `from` upwards. Null outside a project.
export function findRoot(from = process.cwd()) {
  let dir = resolve(from);
  for (;;) {
    if (existsSync(join(dir, 'launchwright', 'kit.json'))) return dir;
    const up = dirname(dir);
    if (up === dir) return null;
    dir = up;
  }
}

// Everything the page and the alerts need to know about a project, read from its files.
export function loadProject(root) {
  const kit = readJson(join(root, 'launchwright', 'kit.json'), {}) || {};
  const baseline = readJson(join(root, 'status', 'baseline.json'));
  const plan = normalizePlan(baseline || readJson(join(root, 'project', 'plan.json'), {}));
  const timeZone = [kit.timezone, kit.timeZone, plan.timezone].find((z) => typeof z === 'string' && validZone(z)) || 'UTC';
  const name = [plan.project, plan.name, kit.name, kit.project].find((n) => typeof n === 'string' && n.trim()) || 'Your app';
  const link = readJson(join(root, 'status', 'page-link.json'), {})?.url;
  return { root, kit, plan, hasBaseline: !!baseline, timeZone, name: name.trim(), pageLink: typeof link === 'string' && /^https:\/\//.test(link) ? link : null };
}
// The plan's dates, from either shape: the kit's project/plan.json keeps them under "baseline"
// ({ baseline: { finish, phases } }); a flat plan has { live, phases }. Each phase is
// { id, name, start, end } and each of the user's tasks { id, text, doBy, minutes, neededFor, needed, closedBy },
// where closedBy names the question whose answer also does the task, and needed ({ phase, at: start or end })
// is the moment the build needs it, so the page can move its day with the build.
export function normalizePlan(raw) {
  const p = raw && typeof raw === 'object' ? raw : {};
  const b = p.baseline && typeof p.baseline === 'object' ? p.baseline : {};
  const phases = Array.isArray(p.phases) ? p.phases : Array.isArray(b.phases) ? b.phases : [];
  const live = [p.live, b.finish].find((d) => typeof d === 'string' && DATE.test(d)) || null;
  return { ...p, live, phases, userTasks: Array.isArray(p.userTasks) ? p.userTasks : [] };
}
function validZone(z) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: z });
    return true;
  } catch {
    return false;
  }
}

export function parse(argv) {
  const pos = [];
  const opt = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      opt[key] = next !== undefined && !next.startsWith('--') ? (i++, next) : true;
    } else pos.push(a);
  }
  return { pos, opt };
}

const text = (v, what) => {
  if (typeof v !== 'string' || !v.trim()) stop(`Give ${what}.`);
  return v.replace(/\s+/g, ' ').trim().slice(0, 600);
};
const stamp = (iso) => iso.replace(/[:.]/g, '-');

const WRITES = ['start', 'finish', 'fail', 'block', 'ask', 'answered', 'phase', 'mode', 'task-done', 'rebaseline', 'page-link'];

// The branch a change will be committed on, checked before anything is written, so a refused
// change leaves no stray files behind (the build's lesson 28).
function branchOf(root) {
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  let branch;
  try {
    branch = git('rev-parse', '--abbrev-ref', 'HEAD').trim();
  } catch {
    stop('This project folder isn\'t a git repo, so nothing was recorded. Run it again with --no-push, or from inside the project\'s repo.', 1);
  }
  if (branch === 'HEAD') stop('This copy isn\'t on a branch, so nothing was recorded. Switch to the project\'s working branch first.', 1);
  return branch;
}

// Commit only the given files and push them to this copy's branch; on a turned-away push, pull and retry.
function save(root, files, message, opt, log) {
  const rel = files.map((f) => relative(root, f));
  if (opt['no-push']) return log(`Written (not committed): ${rel.join(', ')}`);
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const branch = branchOf(root);
  git('add', '--', ...rel);
  try {
    git('commit', '-q', '-m', message, '--', ...rel);
  } catch (e) {
    if (/nothing (added )?to commit|no changes added/i.test(`${e.stdout}${e.stderr}`)) return log('Nothing changed.');
    throw e;
  }
  let hasRemote = true;
  try {
    git('remote', 'get-url', 'origin');
  } catch {
    hasRemote = false;
  }
  if (!hasRemote) return log(`Recorded (no remote to push to): ${message}`);
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      git('push', '-q', 'origin', `HEAD:${branch}`);
      return log(`Recorded and pushed: ${message}`);
    } catch {
      try {
        git('pull', '-q', '--rebase', 'origin', branch);
      } catch {
        try {
          git('rebase', '--abort');
        } catch {
          // nothing to abort
        }
        stop(`Newer commits on the branch clash with this copy's own. The status change is committed here: merge by hand, then push again.`, 1);
      }
    }
  }
  stop('The push was turned away three times. The status change is committed here: push again later.', 1);
}

// Runs one command. Returns nothing; throws StatusError on a problem. `deps` lets tests replace
// the clock, the alert sender and the log.
export async function run(argv, deps = {}) {
  const log = deps.log || ((s) => console.log(s));
  const now = deps.now || (() => new Date().toISOString());
  const [cmd, ...rest] = argv;
  const { pos, opt } = parse(rest);
  if (!cmd || cmd === 'help' || cmd === '--help') return log(HELP);

  const root = typeof opt.root === 'string' ? (existsSync(join(resolve(opt.root), 'launchwright', 'kit.json')) ? resolve(opt.root) : null) : findRoot(deps.cwd);
  if (!root) stop("This isn't a Launchwright project (there's no launchwright/kit.json here or above), so nothing was recorded.", 3);
  if (WRITES.includes(cmd) && !opt['no-push']) branchOf(root);
  const STATUS = join(root, 'status');
  const id = pos[0];
  const needId = (what) => {
    if (!id || !ID.test(id)) stop(`Give ${what}: letters, digits, dots, dashes or underscores (for example 1.2 or sign-in).`);
    return id;
  };
  const pieceFile = join(STATUS, 'pieces', `${id}.json`);
  const waitingFile = join(STATUS, 'waiting', `${id}.json`);
  const done = (files, message) => save(root, files, message, opt, log);

  if (cmd === 'start') {
    needId('the piece id');
    if (opt.phase !== undefined && !(typeof opt.phase === 'string' && ID.test(opt.phase))) stop('--phase needs the id of a phase in the plan.');
    const before = readJson(pieceFile, {}) || {};
    writeJson(pieceFile, {
      id,
      title: typeof opt.title === 'string' ? text(opt.title, 'a title') : id,
      phase: typeof opt.phase === 'string' ? opt.phase : null,
      state: 'running',
      started: now(),
      finished: null,
      summary: null,
      model: typeof opt.model === 'string' ? opt.model.slice(0, 60) : null,
      attempts: (before.attempts || 0) + 1,
    });
    return done([pieceFile], `status: ${id} started`);
  }

  if (['finish', 'fail', 'block'].includes(cmd)) {
    needId('the piece id');
    const piece = readJson(pieceFile);
    if (!piece) stop(`There's no record of ${id} starting: run start first.`);
    const state = { finish: 'done', fail: 'failed', block: 'blocked' }[cmd];
    Object.assign(piece, { state, finished: now(), summary: text(opt.summary, '--summary "<plain words>"') });
    writeJson(pieceFile, piece);
    return done([pieceFile], `status: ${id} ${state}`);
  }

  if (cmd === 'ask') {
    needId('the question id');
    const level = opt.level;
    if (!LEVELS.includes(level)) stop('Give --level blocking, do-by or fyi.');
    const doBy = opt['do-by'];
    if (doBy !== undefined && !(typeof doBy === 'string' && DATE.test(doBy))) stop('--do-by needs a date like 2026-12-03.');
    if (level === 'do-by' && !doBy) stop('A do-by item needs --do-by YYYY-MM-DD.');
    const holding = typeof opt.holding === 'string' ? text(opt.holding, 'what it holds up').slice(0, 160) : null;
    const nm = typeof opt.needed === 'string' ? /^(start|end):([A-Za-z0-9][A-Za-z0-9._-]{0,40})$/.exec(opt.needed) : null;
    if (opt.needed !== undefined && !nm) stop('--needed takes start:<phase id> or end:<phase id>, for example end:build.');
    const item = { id, level, text: text(opt.text, '--text "<the question or task>"'), since: now(), doBy: doBy || null, needed: nm ? { phase: nm[2], at: nm[1] } : null, holding, state: 'open', answered: null, note: null };
    writeJson(waitingFile, item);
    done([waitingFile], `status: waiting on the user (${id})`);
    if (level !== 'fyi' && !opt['no-alert']) {
      const send = deps.sendAlert || (await import('./alert.mjs')).sendAlert;
      const p = loadProject(root);
      const r = await send(level, item.text, { doBy: item.doBy, project: p.name, link: p.pageLink });
      log(r.ok ? 'Phone alert sent.' : `No phone alert: ${r.reason}`);
    }
    return;
  }

  if (cmd === 'answered') {
    needId('the question id');
    const item = readJson(waitingFile);
    if (!item) stop(`There's no open item called ${id}.`);
    Object.assign(item, { state: 'answered', answered: now(), note: typeof opt.note === 'string' ? text(opt.note, 'a note') : null });
    writeJson(waitingFile, item);
    return done([waitingFile], `status: ${id} answered`);
  }

  if (cmd === 'phase') {
    needId('the phase id from the plan');
    const at = now();
    const files = [];
    for (const p of readDir(join(STATUS, 'phases'))) {
      if (p.id !== id && p.started && !p.finished) {
        p.finished = at;
        const f = join(STATUS, 'phases', `${p.id}.json`);
        writeJson(f, p);
        files.push(f);
      }
    }
    const f = join(STATUS, 'phases', `${id}.json`);
    const existing = readJson(f);
    if (!existing || existing.finished) {
      writeJson(f, { id, started: existing?.started || at, finished: null });
      files.push(f);
    }
    return files.length ? done(files, `status: phase ${id}`) : log(`Phase ${id} is already the open phase.`);
  }

  if (cmd === 'mode') {
    const mode = pos[0];
    if (!MODES.includes(mode)) stop('Give the mode: running, waiting, paused or done.');
    const at = now();
    const note = typeof opt.note === 'string' ? text(opt.note, 'a note') : null;
    const runFile = join(STATUS, 'run.json');
    const event = join(STATUS, 'modes', `${stamp(at)}.json`);
    writeJson(runFile, { mode, since: at, note });
    writeJson(event, { mode, at, note });
    return done([runFile, event], `status: mode ${mode}`);
  }

  if (cmd === 'task-done') {
    needId('the task id from the plan');
    const { plan } = loadProject(root);
    if (!(plan.userTasks || []).some((t) => t.id === id)) stop(`The plan has no task of the user's called ${id}.`);
    const f = join(STATUS, 'tasks', `${id}.json`);
    writeJson(f, { id, done: now() });
    return done([f], `status: user task ${id} done`);
  }

  if (cmd === 'rebaseline') {
    const src = pos[0];
    const raw = src ? readJson(resolve(deps.cwd || process.cwd(), src)) : null;
    const plan = raw ? normalizePlan(raw) : null;
    const okPhase = (p) => p && ID.test(p.id) && DATE.test(p.start) && DATE.test(p.end) && p.start <= p.end;
    if (!plan || !plan.phases.length || !plan.phases.every(okPhase))
      stop('Give a plan file with phases (each with id, name, start and end dates) and, if it has one, a finish date.');
    const at = now();
    const current = join(STATUS, 'baseline.json');
    const old = readJson(current);
    const files = [current];
    if (old) {
      const hist = join(STATUS, 'baseline-history', `${stamp(at)}.json`);
      writeJson(hist, old);
      files.push(hist);
    }
    writeJson(current, { ...raw, baselineSet: at.slice(0, 10) });
    return done(files, 'status: new baseline plan');
  }

  if (cmd === 'page-link') {
    const url = pos[0];
    if (!(typeof url === 'string' && /^https:\/\/[^\s]+$/.test(url) && url.length < 400)) stop('Give the page\'s https link.');
    const f = join(STATUS, 'page-link.json');
    writeJson(f, { url, set: now() });
    return done([f], 'status: status page link');
  }

  if (cmd === 'show') {
    const runState = readJson(join(STATUS, 'run.json'), {}) || {};
    const pieces = readDir(join(STATUS, 'pieces'));
    const open = readDir(join(STATUS, 'waiting')).filter((w) => w.state === 'open');
    log(`Mode: ${runState.mode || 'not set'}${runState.note ? ` (${runState.note})` : ''}`);
    log(`Running: ${pieces.filter((p) => p.state === 'running').map((p) => p.id).join(', ') || 'none'}`);
    log(`Done: ${pieces.filter((p) => p.state === 'done').length} pieces`);
    log(`Waiting on the user: ${open.map((w) => `${w.id} (${w.level})`).join(', ') || 'nothing'}`);
    return;
  }

  stop(`Unknown command "${cmd}".\n\n${HELP}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    await run(process.argv.slice(2));
  } catch (e) {
    if (!(e instanceof StatusError)) throw e;
    console.error(e.message);
    process.exit(e.code);
  }
}
