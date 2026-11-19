#!/usr/bin/env node
// Builds a mockup page from an app's screens file, and checks the screens file first.
// The page (page.html, beside this script) is the same for every app; the screens file holds one
// app's screens, its theme and a few settings (SKILL.md, "The screens file").
//
// Checks, each a reason to refuse the build:
// - every screen has an id of small letters, digits and dashes, not one claude.ai keeps for itself
//   (settings, sidebar, customize, upgrade, downloads, comment-…), and a name
// - every button, link and tap target has a note (data-note) saying what it does
// - every tap target (data-go) leads to a screen that exists, or back
// - the main flow (mockup-flow) names screens that exist
// - nothing loads from the network, so the page opens offline and as a Claude artifact page
// - no placeholder text (lorem ipsum, "placeholder", TODO, TBD), because a mockup shows real content
// - the page stays under 256 KiB
//
// Usage: node make-page.mjs <screens file> <page to write>
//        node make-page.mjs <screens file> --check   (checks only, writes nothing)
// Exit code: 0 built (or checked) with no problems, 1 problems (each listed), 2 a usage mistake.
// Plain Node 20+, no packages.

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const PAGE = join(HERE, 'page.html');
export const MARKER = '<!--MOCKUP:SCREENS-->';
export const MAX_BYTES = 256 * 1024;
const RESERVED = /^(settings|sidebar|customize|upgrade|downloads|comment-.*)$/;
const ATTR = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'));
  return m ? (m[2] ?? m[3]) : null;
};
const lineOf = (text, index) => text.slice(0, index).split('\n').length;

// Returns { problems: [...], screens: [{ id, name, variants }] }.
export function check(src) {
  const problems = [];
  const say = (i, what) => problems.push(`line ${lineOf(src, i)}: ${what}`);
  const screens = new Map();
  const templates = [...src.matchAll(/<template\b([^>]*)>([\s\S]*?)<\/template>/gi)];
  if (!templates.length) problems.push('no screens: add a <template data-screen="…" data-name="…"> for each screen');
  const gos = [];
  for (const m of templates) {
    const open = `<template${m[1]}>`;
    const id = ATTR(open, 'data-screen');
    if (id == null) { say(m.index, 'a <template> without data-screen'); continue; }
    if (!/^[a-z][a-z0-9-]*$/.test(id)) say(m.index, `screen id "${id}" must be small letters, digits and dashes, starting with a letter`);
    else if (RESERVED.test(id)) say(m.index, `screen id "${id}" is kept by claude.ai for its own use; pick another`);
    const name = ATTR(open, 'data-name');
    const variant = ATTR(open, 'data-variant');
    if (!screens.has(id)) {
      if (!name) say(m.index, `screen "${id}" needs a data-name, the name the user sees`);
      screens.set(id, { id, name: name || id, variants: [] });
    }
    const s = screens.get(id);
    if (s.variants.length && (!variant || !s.variants[0])) say(m.index, `screen "${id}" has more than one version, so each needs a data-variant label (for example Now and After)`);
    if (s.variants.includes(variant)) say(m.index, `screen "${id}" has two versions called "${variant}"`);
    s.variants.push(variant);
    if (/<template\b/i.test(m[2])) say(m.index, `screen "${id}" has a template inside it; screens can't be nested`);
    // Tap targets inside the screen
    const bodyAt = m.index + open.length;
    for (const t of m[2].matchAll(/<([a-z][a-z0-9-]*)\b[^>]*>/gi)) {
      const tag = t[0], el = t[1].toLowerCase();
      const go = ATTR(tag, 'data-go');
      const tappable = el === 'button' || el === 'a' || go != null || /\srole\s*=\s*["']button["']/i.test(tag);
      if (tappable && !ATTR(tag, 'data-note')) say(bodyAt + t.index, `a ${el === 'a' ? 'link' : el === 'button' ? 'button' : 'tap target'} in screen "${id}" has no data-note saying what it does: ${tag.slice(0, 90)}`);
      if (go != null) gos.push({ go, at: bodyAt + t.index, id });
    }
  }
  for (const g of gos) if (g.go !== 'back' && !screens.has(g.go)) say(g.at, `screen "${g.id}" leads to "${g.go}", which isn't a screen`);
  const flowTag = src.match(/<meta\b[^>]*name\s*=\s*["']mockup-flow["'][^>]*>/i);
  if (flowTag) for (const id of (ATTR(flowTag[0], 'content') || '').split(/\s+/).filter(Boolean)) if (!screens.has(id)) say(flowTag.index, `the main flow names "${id}", which isn't a screen`);
  const kind = src.match(/<meta\b[^>]*name\s*=\s*["']mockup-kind["'][^>]*>/i);
  if (kind && !['new', 'before-after', 'styles'].includes(ATTR(kind[0], 'content'))) say(kind.index, 'mockup-kind must be new, before-after or styles');
  if (kind && ATTR(kind[0], 'content') === 'before-after' && ![...screens.values()].some((s) => s.variants.length > 1)) say(kind.index, 'a before-and-after mockup needs at least one screen with two versions');
  // Nothing from the network
  for (const n of src.matchAll(/<(?:script|img|link|iframe|video|audio|source)\b[^>]*\s(?:src|href)\s*=\s*["']?(?:https?:)?\/\/[^>]*>|url\(\s*["']?(?:https?:)?\/\/[^)]*\)|@import\b/gi)) say(n.index, `loads something from the network, so the page won't open offline: ${n[0].slice(0, 80)}`);
  for (const n of src.matchAll(/<script\b[^>]*\bsrc\s*=|<link\b[^>]*rel\s*=\s*["']?stylesheet/gi)) say(n.index, 'loads a separate file; keep everything inside the screens file');
  // Real content only
  for (const n of src.matchAll(/lorem ipsum|\bplaceholder text\b|\bTODO\b|\bTBD\b|\bFIXME\b|\bxxx+\b/gi)) say(n.index, `placeholder text ("${n[0]}"); a mockup shows real content`);
  return { problems, screens: [...screens.values()] };
}

export function build(src, page = readFileSync(PAGE, 'utf8')) {
  if (!page.includes(MARKER)) throw new Error('page.html has lost its screens marker');
  return page.replace(MARKER, () => src.trim());
}

function main(argv) {
  const [from, to] = argv;
  if (!from || !to) { console.error('Usage: node make-page.mjs <screens file> <page to write> | --check'); return 2; }
  if (!existsSync(from)) { console.error(`No screens file at ${from}`); return 2; }
  const src = readFileSync(from, 'utf8');
  const { problems, screens } = check(src);
  const out = build(src);
  const size = Buffer.byteLength(out);
  if (size > MAX_BYTES) problems.push(`the page would be ${Math.ceil(size / 1024)} KiB; it must stay under 256 KiB (use fewer or smaller pictures)`);
  if (problems.length) { console.error(`The screens file has ${problems.length} problem${problems.length > 1 ? 's' : ''}:`); for (const p of problems) console.error(`- ${p}`); return 1; }
  const versions = screens.reduce((n, s) => n + s.variants.length, 0);
  if (to === '--check') { console.log(`Screens file is fine: ${screens.length} screen${screens.length === 1 ? "" : "s"}, ${versions} version${versions === 1 ? "" : "s"}.`); return 0; }
  mkdirSync(dirname(resolve(to)), { recursive: true });
  writeFileSync(to, out);
  console.log(`Built ${to}: ${screens.length} screen${screens.length === 1 ? "" : "s"}, ${versions} version${versions === 1 ? "" : "s"}, ${Math.ceil(size / 1024)} KiB.`);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
