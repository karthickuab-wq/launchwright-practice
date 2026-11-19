#!/usr/bin/env node
// Builds the store answers page (spec screen 16): every answer Apple's and Google's websites ask for,
// one copy button per field, sized for a phone. It reads the project's store answers file
// (project/store/listing.md in a project), checks it, and writes one self-contained HTML page.
//
// The answers file, under the kit's headings "## App Store" and "## Google Play":
//   ### <Field, as the store's website names it> · <limit>      the limit is optional: "30" or "100 bytes"
//   *Where:* <the screen on the store's website>                  optional, one line, shown above the box
//   *Draft:* <what the user must approve>                         optional: marks text that waits for the user
//   <the answer, one or more lines, exactly as it is to be pasted>
// Other "## " sections (Screenshots, Approved by the user) are not on the page.
//
// Checks, each a reason to refuse the build:
// - both store sections are there, unless the app isn't in that store (--only apple or --only google)
// - every field has an answer, and no answer is a placeholder (TODO, TBD, lorem ipsum, [square brackets])
// - no answer is over its limit (characters, or bytes when the limit says bytes)
// - nothing looks like a key, a password or a code
// - the page stays under 256 KiB
//
// Usage: node make-answers.mjs <answers file> <page to write> [--only apple|google] [--app "<name>"]
//        node make-answers.mjs <answers file> --check [--only apple|google]
// Exit code: 0 built (or checked), 1 problems (each listed), 2 a usage mistake. Plain Node 20+, no packages.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const MAX_BYTES = 256 * 1024;
const STORES = { apple: 'App Store', google: 'Google Play' };
const PLACEHOLDER = /\b(TODO|TBD|FIXME|lorem ipsum)\b|\[[^\]\n]{2,}\]/i;
const SECRET = /\b(sk|pk|rk)_(live|test)_[A-Za-z0-9]{8,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|\bAKIA[0-9A-Z]{16}\b|\b[a-f0-9]{40,}\b|password\s*[:=]/i;

// Returns { stores: { apple: [fields], google: [fields] }, problems: [...] }.
// A field is { name, limit, bytes, where, draft, answer }.
export function parse(text, { only = null } = {}) {
  const problems = [];
  const stores = {};
  let store = null;
  let field = null;
  const close = () => {
    if (!field) return;
    field.answer = field.lines.join('\n').trim();
    delete field.lines;
    stores[store].push(field);
    field = null;
  };
  for (const line of text.split(/\r?\n/)) {
    const h2 = /^## (.+?)\s*$/.exec(line);
    if (h2) {
      close();
      store = Object.keys(STORES).find((k) => STORES[k] === h2[1]) ?? null;
      if (store) stores[store] = [];
      continue;
    }
    if (!store) continue;
    const h3 = /^### (.+?)(?:\s+·\s+(\d+)(\s+bytes)?)?\s*$/.exec(line);
    if (h3) {
      close();
      field = { name: h3[1], limit: h3[2] ? Number(h3[2]) : null, bytes: Boolean(h3[3]), where: null, draft: null, lines: [] };
      continue;
    }
    if (!field) continue;
    const meta = /^\*(Where|Draft):\*\s*(.+)$/.exec(line);
    if (meta && !field.lines.some((l) => l.trim())) { field[meta[1].toLowerCase()] = meta[2].trim(); continue; }
    field.lines.push(line);
  }
  close();

  const wanted = only ? [only] : Object.keys(STORES);
  for (const k of wanted) {
    if (!stores[k]) { problems.push(`There's no "## ${STORES[k]}" section.`); continue; }
    if (!stores[k].length) problems.push(`The "${STORES[k]}" section has no fields ("### <field>").`);
    for (const f of stores[k]) {
      const at = `${STORES[k]}, "${f.name}"`;
      if (!f.answer) problems.push(`${at} has no answer.`);
      else {
        if (PLACEHOLDER.test(f.answer)) problems.push(`${at} still has placeholder text: ${PLACEHOLDER.exec(f.answer)[0]}`);
        if (SECRET.test(f.answer)) problems.push(`${at} looks like it holds a key, a password or a code; those never go in the answers.`);
        const size = f.bytes ? Buffer.byteLength(f.answer, 'utf8') : [...f.answer].length;
        if (f.limit && size > f.limit) problems.push(`${at} is ${size} ${f.bytes ? 'bytes' : 'characters'}, over its limit of ${f.limit}.`);
      }
    }
  }
  for (const k of Object.keys(stores)) if (!wanted.includes(k)) delete stores[k];
  return { stores, problems };
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function page(stores, { app = 'Your app' } = {}) {
  let n = 0;
  const sections = Object.entries(stores).map(([k, fields]) => `
<section>
  <h2>${esc(STORES[k])}</h2>
  ${fields.map((f) => {
    const id = `a${n++}`;
    const size = f.bytes ? Buffer.byteLength(f.answer, 'utf8') : [...f.answer].length;
    return `<div class="field${f.draft ? ' draft' : ''}">
    <div class="head"><h3>${esc(f.name)}</h3>${f.limit ? `<span class="count">${size} of ${f.limit}${f.bytes ? ' bytes' : ''}</span>` : ''}</div>
    ${f.where ? `<p class="where">${esc(f.where)}</p>` : ''}
    ${f.draft ? `<p class="badge">Draft: ${esc(f.draft)}</p>` : ''}
    <textarea id="${id}" readonly rows="${Math.min(8, Math.max(1, Math.ceil(f.answer.length / 34)) + (f.answer.match(/\n/g) ?? []).length)}">${esc(f.answer)}</textarea>
    <button type="button" data-copy="${id}">Copy</button>
  </div>`;
  }).join('\n  ')}
</section>`).join('\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(app)}: store answers</title>
<style>
  :root { --bg: #fbfaf7; --ink: #1d2320; --muted: #5c6661; --line: #e2e4df; --accent: #2f6b4f; --accent-ink: #fff; --warn: #8a4b00; --warn-soft: #fbf1da; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--ink); font: 16px/1.45 -apple-system, system-ui, "Segoe UI", Roboto, sans-serif; }
  main { max-width: 430px; margin: 0 auto; padding: 16px 16px 48px; }
  h1 { font-size: 24px; margin: 8px 0 4px; }
  .intro { color: var(--muted); margin: 0 0 16px; }
  h2 { font-size: 20px; margin: 28px 0 8px; padding-top: 12px; border-top: 1px solid var(--line); }
  .field { margin: 0 0 20px; }
  .head { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
  h3 { font-size: 16px; margin: 0; }
  .count, .where { color: var(--muted); font-size: 14px; }
  .where { margin: 2px 0 6px; }
  .badge { display: inline-block; margin: 4px 0 6px; padding: 2px 8px; border-radius: 8px; background: var(--warn-soft); color: var(--warn); font-size: 14px; font-weight: 600; }
  textarea { width: 100%; margin: 6px 0; padding: 10px; border: 1px solid var(--line); border-radius: 10px; background: #fff; color: var(--ink); font: inherit; resize: vertical; }
  button { min-height: 44px; min-width: 96px; padding: 0 18px; border: 0; border-radius: 12px; background: var(--accent); color: var(--accent-ink); font: 600 16px/1 inherit; font-family: inherit; }
  button.done { background: var(--ink); }
  .tip { color: var(--muted); font-size: 14px; }
</style>
</head>
<body>
<main>
  <h1>${esc(app)}: store answers</h1>
  <p class="intro">Each box is ready to paste into the store's website. Tap Copy, then paste it into the field with the same name.</p>
  <p class="tip">If Copy doesn't work on your phone, press and hold the text, then tap Copy.</p>
${sections}
</main>
<script>
  for (const b of document.querySelectorAll('button[data-copy]')) {
    b.addEventListener('click', async () => {
      const box = document.getElementById(b.dataset.copy);
      let ok = false;
      try { await navigator.clipboard.writeText(box.value); ok = true; } catch (e) { /* falls back below */ }
      if (!ok) { box.focus(); box.select(); box.setSelectionRange(0, box.value.length); try { ok = document.execCommand('copy'); } catch (e) { ok = false; } }
      b.textContent = ok ? 'Copied' : 'Selected: tap Copy';
      b.classList.toggle('done', ok);
      setTimeout(() => { b.textContent = 'Copy'; b.classList.remove('done'); }, 2500);
    });
  }
</script>
</body>
</html>
`;
}

function main(argv) {
  const args = argv.slice(2);
  const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
  const only = opt('--only');
  const app = opt('--app');
  const plain = args.filter((a, i) => !a.startsWith('--') && !['--only', '--app'].includes(args[i - 1]));
  const checkOnly = args.includes('--check');
  if (!plain[0] || (!checkOnly && !plain[1]) || (only && !STORES[only])) {
    console.error('Usage: node make-answers.mjs <answers file> <page to write> [--only apple|google] [--app "<name>"]\n       node make-answers.mjs <answers file> --check [--only apple|google]');
    return 2;
  }
  const { stores, problems } = parse(readFileSync(plain[0], 'utf8'), { only });
  const html = problems.length ? '' : page(stores, { app });
  if (Buffer.byteLength(html) > MAX_BYTES) problems.push(`The page is over ${MAX_BYTES / 1024} KiB.`);
  if (problems.length) {
    console.error(`${problems.length} problem(s):`);
    for (const p of problems) console.error(`  - ${p}`);
    return 1;
  }
  if (checkOnly) { console.log('Store answers: all good.'); return 0; }
  writeFileSync(plain[1], html);
  console.log(`Store answers page written: ${plain[1]}`);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv);
