#!/usr/bin/env node
// Checks that a style's colours are easy to read: each pair of colours that the mockup page puts
// text on (text on the background, muted text on a card, button words on the button, each tag's
// words on its tint) has a contrast of at least 4.5 to 1, the WCAG 2.2 level for normal text.
//
// It reads the theme variables in a screens file (the mockup skill's format): the plain `.app { … }`
// block and every `.app.theme-<name> { … }` block, each laid over the mockup page's own defaults.
// Use it on the design-direction styles file and on a project's mockup screens file.
//
// Usage: node check-contrast.mjs <screens or styles file>
// Exit code: 0 all readable, 1 a pair is too faint (each listed), 2 a usage mistake.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PAGE = join(HERE, '../mockup/page.html');
export const MIN = 4.5;
// [text, background, what it is]
export const PAIRS = [
  ['ink', 'bg', 'text on the background'],
  ['ink', 'surface', 'text on a card'],
  ['muted', 'bg', 'muted text on the background'],
  ['muted', 'surface', 'muted text on a card'],
  ['accent', 'bg', 'accent-coloured words (links) on the background'],
  ['accent-ink', 'accent', "a main button's words"],
  ['warn', 'warn-soft', 'the "today" tag'],
  ['amber', 'amber-soft', 'the "soon" tag'],
  ['good', 'good-soft', 'the "fine" tag'],
];

const vars = (body) => Object.fromEntries([...body.matchAll(/--([a-z0-9-]+)\s*:\s*([^;}]+)/gi)].map((m) => [m[1], m[2].trim()]));
const hex = (v) => {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v || '');
  if (!m) return null;
  const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1];
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
const lum = (rgb) => {
  const [r, g, b] = rgb.map((c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

// Returns { themes: [{ name, results: [{ pair, ratio, ok }] }], problems: [...] }
export function check(src, page = existsSync(PAGE) ? readFileSync(PAGE, 'utf8') : '') {
  const base = vars((page.match(/\.app\s*\{([^}]*--bg[^}]*)\}/) || [, ''])[1]);
  const plain = [...src.matchAll(/\.app\s*\{([^}]*)\}/g)].reduce((o, m) => ({ ...o, ...vars(m[1]) }), {});
  const themes = [{ name: 'the plain theme', v: { ...base, ...plain }, own: Object.keys(plain).length > 0 }];
  for (const m of src.matchAll(/\.app\.theme-([a-z0-9-]+)\s*\{([^}]*)\}/g)) themes.push({ name: `theme "${m[1]}"`, v: { ...base, ...plain, ...vars(m[2]) }, own: true });
  const problems = [];
  const out = [];
  for (const t of themes.filter((x) => x.own)) {
    const results = [];
    for (const [fg, bg, what] of PAIRS) {
      const a = hex(t.v[fg]), b = hex(t.v[bg]);
      if (!a || !b) { problems.push(`${t.name}: --${fg} or --${bg} isn't a #hex colour, so ${what} can't be checked`); continue; }
      const r = ratio(a, b);
      results.push({ pair: `${fg} on ${bg}`, ratio: r, ok: r >= MIN });
      if (r < MIN) problems.push(`${t.name}: ${what} (--${fg} ${t.v[fg]} on --${bg} ${t.v[bg]}) is ${r.toFixed(2)} to 1; it needs at least ${MIN}`);
    }
    out.push({ name: t.name, results });
  }
  if (!out.length) problems.push('no theme found: a screens file sets its colours in `.app { … }` or `.app.theme-<name> { … }`');
  return { themes: out, problems };
}

function main([file]) {
  if (!file || !existsSync(file)) { console.error('Usage: node check-contrast.mjs <screens or styles file>'); return 2; }
  const { themes, problems } = check(readFileSync(file, 'utf8'));
  for (const t of themes) console.log(`${t.name}: lowest ${Math.min(...t.results.map((r) => r.ratio)).toFixed(2)} to 1 (${t.results.find((r) => r.ratio === Math.min(...t.results.map((x) => x.ratio)))?.pair})`);
  if (problems.length) { console.error(`${problems.length} colour pair${problems.length > 1 ? 's are' : ' is'} too faint to read easily:`); for (const p of problems) console.error(`- ${p}`); return 1; }
  console.log(`Every colour pair is readable: at least ${MIN} to 1 in ${themes.length} theme${themes.length > 1 ? 's' : ''}.`);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
