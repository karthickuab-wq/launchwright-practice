#!/usr/bin/env node
// The product's own check. It runs in two places:
// - In the plugin (scripts/check-refs.mjs): the skills, agents, kit templates and README.
// - In a user's project, as the kit's copy (launchwright/scripts/check-refs.mjs): the project's
//   AGENTS.md, CLAUDE.md and the kit's skills.
//
// It checks that:
// 1. Every file a skill or rule names exists. A name in backticks counts (`project/plan.md`,
//    `node launchwright/scripts/status.mjs`), and so does a bare path that starts with one of the
//    kit's or the plugin's folders (launchwright/skills/mockup/SKILL.md). A path a later piece will
//    make is marked right after it: (planned), (to be written) or (made by …).
//    Paths resolve the way the kit lays them out: in the plugin, a project path such as
//    launchwright/skills/mockup/SKILL.md or project/plan.md is checked against what the kit
//    copies into a project (scripts/kit.mjs); in a project, a plugin path such as
//    skills/mockup/SKILL.md is checked under launchwright/.
// 2. Every skill is a folder with a SKILL.md whose front matter has a name and a one-line
//    description, and the name matches the folder (Agent Skills format: agentskills.io/specification).
//    Every agent has a name and a one-line description (Claude Code's subagent docs).
// 3. In the plugin only: the files the plugin ships are text, or complete PNG, JPEG, GIF or WebP
//    images, or fonts; each file that isn't an image or font is under 256 KiB; there are at most
//    512; and there's no top-level bin/ folder (Anthropic's pre-submission checklist, docs/RULES.md).
//    The build's own files, which leave the repo before release, aren't counted.
//
// Usage: node scripts/check-refs.mjs [--root <folder>] [--strict]
//   --root    check that folder instead of the one this script belongs to
//   --strict  also fail on a "(planned)" mark whose file now exists
// Exit code: 0 all good, 1 problems (each is listed), 2 nothing to check or a usage mistake.
// Plain Node 20+, no packages.

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join, posix, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const MAX_FILE_BYTES = 256 * 1024;
export const MAX_FILES = 512;
// The build's own files. They move out of the repo before release (docs/PLAN.md, P6.6), so the
// plugin's file rules don't count them.
export const BUILD_ONLY = ['buildkit/', 'status/', 'tests/', 'docs/', 'CLAUDE.md'];
// Paths a project writes as it runs, that the user's app holds, or that only the home repo has
// (ideas/): named, but not always there.
const RUNTIME = ['status/', 'app/', 'ideas/', '.eas/', 'out/', 'tmp/', 'node_modules/'];
// Places Claude Code itself defines, named when explaining what it loads.
const CLAUDE_PLACES = ['.claude/skills/', '.claude/agents/', '.claude/rules/', '.claude/commands/', '~/.claude/'];
// Bare paths are checked when they start with one of these folders.
const KIT_FOLDERS = ['launchwright', 'project', 'mockup', 'ideas', 'skills', 'scripts', 'templates', 'agents', 'guard', 'hooks', '.claude', '.claude-plugin'];
const PLANNED = /^\s*\((planned|to be written|made by [^)]{1,60})\)/i;
const PLANNED_ONLY = /^\s*\(planned\)/i;
const IMAGE_OR_FONT = /\.(png|jpe?g|gif|webp|svg|woff2?|ttf|otf)$/i;

const toPosix = (p) => p.split(sep).join('/');

// Which kind of folder this is: 'project' (the kit is set up), 'plugin' (a plugin manifest), or null.
export function detect(root) {
  if (existsSync(join(root, 'launchwright', 'kit.json'))) return 'project';
  if (existsSync(join(root, '.claude-plugin', 'plugin.json'))) return 'plugin';
  return null;
}

// The folder this script belongs to: the project, when it's the kit's copy; otherwise the plugin.
export function ownRoot() {
  const here = dirname(fileURLToPath(import.meta.url));
  if (basename(here) === 'scripts' && basename(dirname(here)) === 'launchwright' && existsSync(join(here, '..', 'kit.json'))) {
    return resolve(here, '..', '..');
  }
  return resolve(here, '..');
}

export function walk(root, rel = '') {
  const full = join(root, rel);
  if (!existsSync(full)) return [];
  if (!statSync(full).isDirectory()) return [toPosix(rel)];
  if (['.git', 'node_modules'].includes(basename(full))) return [];
  return readdirSync(full).sort().flatMap((name) => walk(root, rel ? join(rel, name) : name));
}

// The front matter at the top of a Markdown file, as { fields, lines } or null when there's none.
// Only plain "key: value" lines are read; a key whose value is a YAML block (| or >) or runs onto
// more lines is reported as not on one line.
export function frontMatter(text) {
  const lines = text.split(/\r?\n/);
  if (lines[0] !== '---') return null;
  const end = lines.indexOf('---', 1);
  if (end === -1) return null;
  const fields = {};
  const multiLine = new Set();
  let last = null;
  for (const line of lines.slice(1, end)) {
    const m = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (m) {
      last = m[1];
      let value = m[2].trim();
      if (/^[|>][+-]?$/.test(value)) multiLine.add(last);
      if (/^(['"]).*\1$/.test(value)) value = value.slice(1, -1);
      fields[last] = value;
    } else if (line.trim() && last && /^\s/.test(line)) {
      multiLine.add(last);
    }
  }
  return { fields, multiLine };
}

// Agent Skills' name rule: 1 to 64 lowercase letters, digits and single hyphens, not at either end.
export const SKILL_NAME = /^(?!-)(?!.*--)[a-z0-9-]{1,64}(?<!-)$/;

export function checkSkill(root, folder) {
  const problems = [];
  const name = basename(folder);
  const file = posix.join(folder, 'SKILL.md');
  if (!existsSync(join(root, file))) return [`${folder}/: a skill folder needs a SKILL.md`];
  const fm = frontMatter(readFileSync(join(root, file), 'utf8'));
  if (!fm) return [`${file}: no front matter (a --- block at the top, with name and description)`];
  const { fields, multiLine } = fm;
  if (!fields.name) problems.push(`${file}: the front matter has no name`);
  else {
    if (!SKILL_NAME.test(fields.name)) problems.push(`${file}: the name "${fields.name}" must be 1 to 64 lowercase letters, digits and single hyphens, not starting or ending with one`);
    if (fields.name !== name) problems.push(`${file}: the name "${fields.name}" doesn't match its folder "${name}"`);
  }
  if (multiLine.has('name')) problems.push(`${file}: the name must be on one line`);
  if (multiLine.has('description')) problems.push(`${file}: the description must be on one line`);
  else if (!fields.description) problems.push(`${file}: the front matter has no description`);
  else if (fields.description.length > 1024) problems.push(`${file}: the description is ${fields.description.length} characters; the most is 1024`);
  return problems;
}

// Fields Claude Code ignores in a plugin's agents, so an agent that relies on them would silently lose them.
const PLUGIN_AGENT_IGNORED = ['hooks', 'mcpServers', 'permissionMode'];

export function checkAgent(root, file, inPlugin) {
  const problems = [];
  const fm = frontMatter(readFileSync(join(root, file), 'utf8'));
  if (!fm) return [`${file}: no front matter (a --- block at the top, with name and description)`];
  const { fields, multiLine } = fm;
  for (const key of ['name', 'description']) {
    if (multiLine.has(key)) problems.push(`${file}: the ${key} must be on one line`);
    else if (!fields[key]) problems.push(`${file}: the front matter has no ${key}`);
  }
  if (fields.name && (fields.name.includes(':') || fields.name.length > 256)) problems.push(`${file}: the name can't contain ":" or be longer than 256 characters`);
  if (inPlugin) for (const key of PLUGIN_AGENT_IGNORED) if (key in fields) problems.push(`${file}: Claude Code ignores "${key}" in a plugin's agents`);
  return problems;
}

const looksLikePath = (s) =>
  !/[\s<>*{}$|]|:\/\/|^[/~]|^-/.test(s) && (/^\.{0,2}\/?[\w.@-]+(\/[\w.@-]+)+\/?$/.test(s) || /^[\w.-]+\.(md|mjs|js|cjs|json|ya?ml|sh|html|txt)$/.test(s));

const BARE = new RegExp(`(?<![\\w.@/:~-])((?:${KIT_FOLDERS.map((f) => f.replace('.', '\\.')).join('|')})/(?:[\\w.@-]+/)*(?:[\\w@-]+\\.(?:md|mjs|js|cjs|json|ya?ml|html|txt)\\b|[\\w.@-]*/?))`, 'g');

// Every path a Markdown file names, with its line, and whether it's marked as planned.
export function namedPaths(text) {
  const found = [];
  let fenced = false;
  text.split('\n').forEach((line, i) => {
    if (/^\s*```/.test(line)) { fenced = !fenced; return; }
    if (fenced) return;
    const ticked = [];
    for (const m of line.matchAll(/`([^`\n]+)`/g)) {
      ticked.push([m.index, m.index + m[0].length]);
      let token = m[1].trim();
      const run = token.match(/^node\s+(\S+)/);
      if (run) token = run[1];
      if (!looksLikePath(token)) continue;
      const after = line.slice(m.index + m[0].length);
      found.push({ line: i + 1, path: token, shown: m[1], planned: PLANNED.test(after), plannedOnly: PLANNED_ONLY.test(after) });
    }
    for (const m of line.matchAll(BARE)) {
      if (ticked.some(([a, b]) => m.index >= a && m.index < b)) continue;
      const token = m[1].replace(/[.,;:]+$/, '');
      if (!token.includes('/') || token.endsWith('//')) continue;
      const after = line.slice(m.index + m[1].length);
      found.push({ line: i + 1, path: token, shown: token, planned: PLANNED.test(after), plannedOnly: PLANNED_ONLY.test(after) });
    }
  });
  return found;
}

// The paths a project gets from the kit, read from the plugin's own kit script.
async function kitTargets(root) {
  const script = join(root, 'scripts', 'kit.mjs');
  if (!existsSync(script)) return new Set();
  const { readKit } = await import(pathToFileURL(script).href);
  const targets = new Set();
  for (const { path } of readKit(root).files) {
    targets.add(path);
    let dir = posix.dirname(path);
    while (dir !== '.') { targets.add(`${dir}/`); targets.add(dir); dir = posix.dirname(dir); }
  }
  return targets;
}

function shippedFiles(root) {
  let files;
  try {
    const top = execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (resolve(top) === resolve(root)) {
      files = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).split('\0').filter(Boolean);
      files = files.filter((f) => existsSync(join(root, f)));
    }
  } catch { /* not a git repo: walk the folder */ }
  if (!files) files = walk(root);
  return files.filter((f) => !BUILD_ONLY.some((b) => (b.endsWith('/') ? f.startsWith(b) : f === b)));
}

const SIGNATURES = {
  png: (b) => b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) && b.includes(Buffer.from('IEND')),
  jpg: (b) => b.length > 4 && b[0] === 0xff && b[1] === 0xd8 && b[b.length - 2] === 0xff && b[b.length - 1] === 0xd9,
  gif: (b) => /^GIF8[79]a/.test(b.subarray(0, 6).toString('latin1')) && b[b.length - 1] === 0x3b,
  webp: (b) => b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP' && b.readUInt32LE(4) + 8 === b.length,
  font: () => true,
};

export function fileProblem(root, file) {
  const buf = readFileSync(join(root, file));
  const ext = (file.match(/\.([^./]+)$/) || [])[1]?.toLowerCase();
  const kind = ext === 'png' ? 'png' : ['jpg', 'jpeg'].includes(ext) ? 'jpg' : ext === 'gif' ? 'gif' : ext === 'webp' ? 'webp' : ['woff', 'woff2', 'ttf', 'otf'].includes(ext) ? 'font' : null;
  if (kind) return SIGNATURES[kind](buf) ? null : `${file}: not a complete ${ext.toUpperCase()} file`;
  let text = true;
  if (buf.includes(0)) text = false;
  else try { new TextDecoder('utf-8', { fatal: true }).decode(buf); } catch { text = false; }
  if (!text) return `${file}: not a text file, image or font (the directory holds other files for a reviewer)`;
  if (buf.length >= MAX_FILE_BYTES && !IMAGE_OR_FONT.test(file)) return `${file}: ${Math.ceil(buf.length / 1024)} KiB; each file must be under 256 KiB`;
  return null;
}

export async function check(root, { strict = false } = {}) {
  const mode = detect(root);
  const problems = [];
  const notes = [];
  if (!mode) return { mode, problems: [`${root}: neither a Launchwright project (launchwright/kit.json) nor a plugin (.claude-plugin/plugin.json)`], notes, scanned: [] };

  const skillsDir = mode === 'plugin' ? 'skills' : 'launchwright/skills';
  const roots = mode === 'plugin' ? ['README.md', 'skills', 'agents', 'templates'] : ['AGENTS.md', 'CLAUDE.md', 'launchwright/skills'];
  const scanned = roots.flatMap((r) => walk(root, r)).filter((f) => f.endsWith('.md'));
  const skills = existsSync(join(root, skillsDir)) ? readdirSync(join(root, skillsDir)).filter((n) => statSync(join(root, skillsDir, n)).isDirectory()).sort() : [];
  if (!skills.length) problems.push(`${skillsDir}/: no skills found, so nothing was checked`);

  // 1. Named files exist.
  const targets = mode === 'plugin' ? await kitTargets(root) : new Set();
  const exists = (file, clean) => {
    if (existsSync(join(root, clean)) || existsSync(join(root, dirname(file), clean))) return true;
    if (mode === 'plugin') return targets.has(clean);
    const kit = clean.match(/^(skills|scripts|guard)\/(.*)$/);
    return !!kit && existsSync(join(root, 'launchwright', kit[1], kit[2]));
  };
  for (const file of scanned) {
    for (const ref of namedPaths(readFileSync(join(root, file), 'utf8'))) {
      const clean = ref.path.replace(/^\.\//, '').replace(/[#?].*$/, '');
      if (RUNTIME.some((r) => clean.startsWith(r) || clean === r.replace(/\/$/, ''))) continue;
      if (CLAUDE_PLACES.some((r) => clean.startsWith(r))) continue;
      const there = exists(file, clean);
      if (ref.planned) {
        if (there && ref.plannedOnly) (strict ? problems : notes).push(`${file}:${ref.line}: \`${ref.shown}\` is marked (planned) but exists now; remove the mark`);
        continue;
      }
      if (!there) problems.push(`${file}:${ref.line}: \`${ref.shown}\` doesn't exist`);
    }
  }

  // 2. Skills and agents.
  for (const name of skills) problems.push(...checkSkill(root, `${skillsDir}/${name}`));
  if (mode === 'plugin') {
    const agents = walk(root, 'agents').filter((f) => f.endsWith('.md'));
    const names = new Map();
    for (const file of agents) {
      problems.push(...checkAgent(root, file, true));
      const name = frontMatter(readFileSync(join(root, file), 'utf8'))?.fields.name;
      if (name && names.has(name)) problems.push(`${file}: the name "${name}" is also used by ${names.get(name)}`);
      if (name) names.set(name, file);
    }
  }

  // 3. The plugin's files.
  let shipped = [];
  if (mode === 'plugin') {
    shipped = shippedFiles(root);
    if (!shipped.length) problems.push(`${root}: no files found, so the file rules weren't checked`);
    if (existsSync(join(root, 'bin'))) problems.push('bin/: a top-level bin/ folder is refused by claude.ai; put scripts in scripts/');
    if (shipped.length > MAX_FILES) problems.push(`the plugin has ${shipped.length} files; the most is ${MAX_FILES}`);
    for (const file of shipped) { const p = fileProblem(root, file); if (p) problems.push(p); }
  }
  return { mode, problems, notes, scanned, skills, shipped };
}

async function main(argv) {
  let root = null;
  let strict = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--root' && argv[i + 1]) root = resolve(argv[++i]);
    else if (argv[i] === '--strict') strict = true;
    else { console.log('Usage: node scripts/check-refs.mjs [--root <folder>] [--strict]'); return 2; }
  }
  root ||= ownRoot();
  const { mode, problems, notes, scanned, skills, shipped } = await check(root, { strict });
  for (const n of notes) console.log(`Note: ${n}`);
  if (problems.length) {
    console.log(`${problems.length} problem${problems.length === 1 ? '' : 's'} (fix the path, create the file, or mark it "(planned)" right after it):`);
    for (const p of problems) console.log(`  ${p}`);
    return mode ? 1 : 2;
  }
  const files = mode === 'plugin' ? `; ${shipped.length} plugin files within the directory's limits (the build's own ${BUILD_ONLY.join(', ')} not counted)` : '';
  console.log(`References ok (${mode}): ${scanned.length} files checked, ${skills.length} skill${skills.length === 1 ? '' : 's'}${files}.`);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main(process.argv.slice(2));
}
