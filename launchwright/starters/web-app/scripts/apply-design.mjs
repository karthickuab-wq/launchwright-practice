#!/usr/bin/env node
// Fills the app's theme (src/theme/tokens.json) from the project's design guide (project/design.md).
// The guide is the one place the look is decided; the mockup and the app follow it.
//
// Usage: node scripts/apply-design.mjs [path to design.md] [--tokens <tokens.json>] [--dry-run]
//        (default guide: ../project/design.md, the app's folder being app/)
// It reads the guide's tables as the design-direction skill writes them:
//   - Colours: Name | What it's for | Value. A row may name two colours ("warn, warn-soft") with two values.
//   - Type: the rows for title, heading, body, second lines, tags and main button (size and weight).
//   - Spacing and shapes: "Spacing steps: 4, 8, …" and "Corners: 18 on cards…".
// It refuses, and writes nothing, if a colour the theme needs is missing or a text colour is too faint
// (under 4.5 to 1 on its background, the WCAG 2.2 level for normal text).
// Exit code: 0 done, 1 refused (each reason printed), 2 a usage mistake. Plain Node 20+, no packages.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const TOKENS_PATH = join(HERE, '..', 'src', 'theme', 'tokens.json');

export const COLOR_NAMES = ['bg', 'surface', 'ink', 'muted', 'line', 'accent', 'accentInk', 'accentSoft', 'warn', 'warnSoft', 'amber', 'amberSoft', 'good', 'goodSoft'];
// [text, background, what it is]
export const PAIRS = [
  ['ink', 'bg', 'text on the background'],
  ['ink', 'surface', 'text on a card'],
  ['muted', 'bg', 'muted text on the background'],
  ['muted', 'surface', 'muted text on a card'],
  ['accent', 'bg', 'accent-coloured words (links) on the background'],
  ['accentInk', 'accent', "a main button's words"],
  ['warn', 'warnSoft', 'the "today" tag'],
  ['amber', 'amberSoft', 'the "soon" tag'],
  ['good', 'goodSoft', 'the "fine" tag'],
];
export const MIN_CONTRAST = 4.5;

const camel = (name) => name.trim().toLowerCase().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const normalHex = (v) => {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v.trim());
  if (!m) return null;
  const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1];
  return `#${h.toUpperCase()}`;
};
const channel = (c) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const luminance = (hex) => { const n = parseInt(hex.slice(1), 16); return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255); };
export const contrast = (a, b) => { const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };

// The text under a "## <heading>" up to the next "## " heading.
function section(md, heading) {
  const lines = md.split(/\r?\n/);
  const start = lines.findIndex((l) => new RegExp(`^##\\s+${heading}\\b`, 'i').test(l));
  if (start < 0) return '';
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => /^##\s/.test(l));
  return (end < 0 ? rest : rest.slice(0, end)).join('\n');
}
const tableRows = (text) =>
  text.split('\n').filter((l) => /^\s*\|/.test(l)).map((l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()))
    .filter((cells) => !cells.every((c) => /^:?-{2,}:?$/.test(c)));

const WEIGHTS = [[/semi\s*-?bold/i, '600'], [/extra\s*-?bold|heavy/i, '800'], [/(?<!semi\s?-?)bold/i, '700'], [/medium/i, '500'], [/regular|normal/i, '400']];
// The first weight word in the cell wins ("Regular; names semibold" is Regular).
const weightOf = (cell) => {
  const found = WEIGHTS.map(([re, w]) => [cell.search(re), w]).filter(([at]) => at >= 0).sort((a, b) => a[0] - b[0]);
  if (found.length) return found[0][1];
  const n = /\((\d{3})\)|\b([1-9]00)\b/.exec(cell);
  return n ? String(Math.min(800, Math.max(400, Math.round(Number(n[1] || n[2]) / 100) * 100))) : null;
};
const TYPE_ROWS = [['title', /title/i], ['heading', /heading/i], ['button', /button/i], ['tag', /\btags?\b/i], ['small', /second|small|amount|caption/i], ['body', /body|list/i]];

// Reads what it can from the guide: { style, colors, type, spacing, radius, problems }.
export function parseDesign(md) {
  const out = { style: null, colors: {}, type: {}, spacing: null, radius: null, problems: [] };
  const style = /\*\*([^*]+)\*\*/.exec(section(md, 'The style chosen'));
  if (style) out.style = style[1].trim();

  for (const cells of tableRows(section(md, 'Colours?'))) {
    if (cells.length < 3 || /^name$/i.test(cells[0])) continue;
    const names = cells[0].split(',').map(camel);
    const values = cells[cells.length - 1].split(',').map((v) => v.trim());
    if (names.length !== values.length) { out.problems.push(`The colour row "${cells[0]}" has ${names.length} name(s) but ${values.length} value(s).`); continue; }
    names.forEach((n, i) => {
      const hex = normalHex(values[i]);
      if (hex) out.colors[n] = hex; else out.problems.push(`The colour "${n}" has "${values[i]}", which isn't a # colour.`);
    });
  }

  for (const cells of tableRows(section(md, 'Type'))) {
    if (cells.length < 3 || /^use$/i.test(cells[0])) continue;
    const key = TYPE_ROWS.find(([, re]) => re.test(cells[0]))?.[0];
    const size = /\d+(\.\d+)?/.exec(cells[1]);
    const weight = weightOf(cells[2]);
    if (!key || out.type[key]) continue;
    if (size && weight) out.type[key] = { size: Number(size[0]), weight };
    else out.problems.push(`The type row "${cells[0]}" needs a size and a weight (Regular, Medium, Semibold or Bold).`);
  }

  const shapes = section(md, 'Spacing and shapes');
  const steps = /spacing steps[^:]*:\*{0,2}\s*([\d,\s]+)/i.exec(shapes);
  if (steps) out.spacing = steps[1].split(',').map((n) => Number(n.trim())).filter((n) => n > 0);
  const corners = /corners?[^:]*:\*{0,2}\s*(\d+)/i.exec(shapes);
  if (corners) out.radius = Number(corners[1]);
  return out;
}

// The tokens with the guide's values laid over them, and every reason to refuse.
export function applyTokens(tokens, parsed) {
  const next = JSON.parse(JSON.stringify(tokens));
  const problems = [...parsed.problems];
  const missing = COLOR_NAMES.filter((n) => !parsed.colors[n]);
  if (missing.length) problems.push(`The guide's Colours table has no value for: ${missing.join(', ')}.`);
  next.colors = { ...next.colors, ...parsed.colors };
  for (const [text, bg, what] of PAIRS) {
    if (!next.colors[text] || !next.colors[bg]) continue;
    const r = contrast(next.colors[text], next.colors[bg]);
    if (r < MIN_CONTRAST) problems.push(`Too faint: ${what}, ${text} ${next.colors[text]} on ${bg} ${next.colors[bg]} is ${r.toFixed(2)} to 1 (needs ${MIN_CONTRAST}).`);
  }
  for (const [k, v] of Object.entries(parsed.type)) {
    if (v.size < 13) problems.push(`Text under 13 is too small: the guide's "${k}" is ${v.size}.`);
    next.type[k] = v;
  }
  if (parsed.spacing?.length) next.spacing = parsed.spacing;
  if (parsed.radius) next.radius = parsed.radius;
  if (parsed.style) next.style = parsed.style;
  return { tokens: next, problems };
}

// Two-space JSON with the spacing steps kept on one line, as the file is written by hand.
export const format = (tokens) =>
  JSON.stringify(tokens, null, 2)
    .replace(/\[\s*([\d,\s]+?)\s*\]/g, (_, inner) => `[${inner.split(',').map((n) => n.trim()).join(', ')}]`)
    .replace(/\{\s*("size": \d+),\s*("weight": "\d+")\s*\}/g, '{ $1, $2 }');

function main(argv) {
  const args = argv.slice(2);
  const dry = args.includes('--dry-run');
  let tokensPath = TOKENS_PATH;
  const rest = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dry-run') continue;
    if (args[i] === '--tokens') { tokensPath = resolve(args[++i] ?? ''); continue; }
    rest.push(args[i]);
  }
  const guide = resolve(rest[0] ?? join(HERE, '..', '..', 'project', 'design.md'));
  if (!existsSync(guide)) { console.error(`No design guide at ${guide}. Pass its path: node scripts/apply-design.mjs <design.md>`); return 2; }
  if (!existsSync(tokensPath)) { console.error(`No theme file at ${tokensPath}.`); return 2; }
  const tokens = JSON.parse(readFileSync(tokensPath, 'utf8'));
  const { tokens: next, problems } = applyTokens(tokens, parseDesign(readFileSync(guide, 'utf8')));
  if (problems.length) {
    console.error('The theme was not changed:');
    for (const p of problems) console.error(`  - ${p}`);
    return 1;
  }
  const changed = COLOR_NAMES.filter((n) => tokens.colors[n] !== next.colors[n]).length;
  if (!dry) writeFileSync(tokensPath, `${format(next)}\n`);
  console.log(`${dry ? 'Would set' : 'Set'} the theme from the guide "${next.style}": ${changed} colour(s) changed, all text colours readable.`);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv);
