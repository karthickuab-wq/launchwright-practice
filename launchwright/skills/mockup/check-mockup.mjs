#!/usr/bin/env node
// Opens a built mockup page on a simulated phone (390 × 844) with the network switched off, and
// checks that:
// - the page opens with no errors and asks for nothing from the network
// - every screen is reachable: from the first screen by tapping through the app, and from the
//   list of screens (a screen only the list reaches is reported as a warning, not a failure)
// - every tap target leads where it says, and every version of a screen shows
// - nothing is wider than the phone, and the page's own buttons are at least 44 pixels tall
// - every screen has its notes and its comment box, and a comment is kept by the page
// - no note starts by repeating its button's name, which the notes list already shows above it
// With --shots <folder> it also takes a screenshot of every screen and version, plus one with the
// notes showing, one of the comment box and one of the list of screens.
//
// It needs a browser to drive. Claude's cloud sessions have Playwright and Chromium already; this
// script uses them if they're there and installs nothing. Anywhere else it says so and stops.
//
// Usage: node check-mockup.mjs <built page> [--shots <folder>] [--scale 1|2]
// Exit code: 0 all good, 1 problems (each listed), 2 no browser or a usage mistake.

import { createRequire } from 'node:module';
import { existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : null; };
const file = args.find((a, i) => !a.startsWith('--') && !['--shots', '--scale'].includes(args[i - 1]));
if (!file || !existsSync(file)) { console.error('Usage: node check-mockup.mjs <built page> [--shots <folder>] [--scale 1|2]'); process.exit(2); }
let chromium;
try { ({ chromium } = createRequire(import.meta.url)('playwright')); } catch {
  console.error('No browser to drive here (Playwright isn\'t available). Run this check in a Claude cloud session, which has one.');
  process.exit(2);
}
const shots = opt('shots') ? resolve(opt('shots')) : null;
const scale = Number(opt('scale') || 1);
if (shots) mkdirSync(shots, { recursive: true });

const W = 390, H = 844;
const problems = [], warnings = [];
const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: scale, offline: true, hasTouch: true, isMobile: true });
  const net = [];
  await ctx.route('**/*', (r) => { const u = r.request().url(); if (u.startsWith('file:') || u.startsWith('data:') || u.startsWith('blob:')) return r.continue(); net.push(u); return r.abort(); });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  const url = pathToFileURL(resolve(file)).href;
  await page.goto(url);
  const info = await page.evaluate(() => window.LW_MOCKUP);
  if (!info || !info.screens.length) throw new Error('the page holds no screens');
  const ids = info.screens.map((s) => s.id);
  const first = await page.evaluate(() => window.LW_MOCKUP.current());

  // Reachable by tapping through the app, from the first screen
  const seen = new Set([first]), queue = [first];
  while (queue.length) {
    const id = queue.shift();
    const s = info.screens.find((x) => x.id === id);
    for (let v = 0; v < s.variants.length; v++) {
      await page.evaluate(([i, vi]) => window.LW_MOCKUP.show(i, vi), [id, v]);
      const targets = await page.$$eval('#app [data-go]', (els) => els.map((e) => e.getAttribute('data-go')));
      for (const t of targets) if (t !== 'back' && !seen.has(t)) { seen.add(t); queue.push(t); }
    }
  }
  for (const id of ids) if (!seen.has(id)) warnings.push(`"${id}" is reachable only from the list of screens, not by tapping through the app`);

  // Every screen and version: shows, fits, has notes, its taps lead where they say
  let n = 0;
  for (const s of info.screens) {
    for (let v = 0; v < s.variants.length; v++) {
      await page.evaluate(([i, vi]) => window.LW_MOCKUP.show(i, vi), [s.id, v]);
      const label = s.variants.length > 1 ? `${s.id} (${s.variants[v]})` : s.id;
      const r = await page.evaluate(() => {
        const app = document.getElementById('app');
        const wide = [...app.querySelectorAll('*')].filter((e) => { const b = e.getBoundingClientRect(); return b.width > 0 && (b.right > innerWidth + 1 || b.left < -1); }).filter((e) => !e.closest('[data-scroll-x]'));
        return {
          page: document.documentElement.scrollWidth, app: app.scrollWidth - app.clientWidth,
          wide: wide.slice(0, 3).map((e) => e.tagName.toLowerCase() + (e.className ? '.' + String(e.className).split(' ')[0] : '')),
          noted: app.querySelectorAll('[data-note]').length,
          title: document.getElementById('scrname').textContent,
        };
      });
      if (r.page > W || r.app > 0 || r.wide.length) problems.push(`${label} is wider than the phone (${r.wide.join(', ') || 'the page'})`);
      if (!r.title || r.title === '…') problems.push(`${label} shows no screen name`);
      const echoes = await page.$$eval('#notelist li', (els) => els.map((li) => [li.querySelector('b').textContent.trim(), li.querySelector('.w').textContent.trim()])
        .filter(([l, w]) => w.toLowerCase().startsWith(l.toLowerCase()) && /^([:,.]|$)/.test(w.slice(l.length))).map(([l]) => l));
      for (const l of echoes) problems.push(`in ${label}, the note for "${l}" starts by repeating its name, which the notes list already shows above it`);
      const count = await page.$$eval('#app [data-go]', (els) => els.length);
      for (let k = 0; k < count; k++) {
        await page.evaluate(([i, vi]) => window.LW_MOCKUP.show(i, vi), [s.id, v]);
        const el = (await page.$$('#app [data-go]'))[k];
        const to = await el.getAttribute('data-go');
        await el.scrollIntoViewIfNeeded();
        await el.click();
        const now = await page.evaluate(() => window.LW_MOCKUP.current());
        if (to !== 'back' && now !== to) problems.push(`in ${label}, a tap meant for "${to}" opened "${now}"`);
      }
      if (shots) {
        await page.evaluate(([i, vi]) => window.LW_MOCKUP.show(i, vi), [s.id, v]);
        await page.screenshot({ path: join(shots, `${String(++n).padStart(2, '0')}-${label.replace(/[^a-z0-9-]+/gi, '-').replace(/-$/, '').toLowerCase()}.png`) });
      }
    }
  }

  // The list of screens reaches every screen
  await page.evaluate((i) => window.LW_MOCKUP.show(i, 0), first);
  for (const id of ids) {
    await page.click('#bScreens');
    await page.waitForTimeout(260);
    await page.click(`#screenlist [data-id="${id}"]`);
    const now = await page.evaluate(() => window.LW_MOCKUP.current());
    if (now !== id) problems.push(`the list of screens didn't open "${id}"`);
  }
  // The page's own buttons are big enough to tap
  await page.evaluate((i) => window.LW_MOCKUP.show(i, 0), first);
  const small = await page.$$eval('.dock button:not([hidden]), .variants:not([hidden]) button', (els) => els.filter((e) => e.getBoundingClientRect().height < 44).map((e) => e.id || e.textContent.trim()));
  for (const s of small) problems.push(`the page's "${s}" button is under 44 pixels tall`);

  // Notes, comment box, list: work, and screenshots
  await page.click('#bNotes');
  await page.waitForTimeout(300);
  const pins = await page.$$eval('#notelist li', (els) => els.length);
  const noted = await page.$$eval('#app [data-note]', (els) => els.length);
  if (pins !== noted) problems.push(`the notes list shows ${pins} notes for ${noted} noted buttons`);
  if (pins) { await page.click('#notelist li:last-child button'); await page.waitForTimeout(150); }
  if (shots) await page.screenshot({ path: join(shots, `${String(++n).padStart(2, '0')}-notes.png`) });
  await page.click('#notesHide');
  await page.click('#bComment');
  await page.waitForTimeout(300);
  await page.fill('#cbox', 'Make the recipe photo bigger, and show the cooking time on it.');
  await page.click('#cSend');
  const kept = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem(Object.keys(localStorage).find((k) => k.startsWith('lw-mockup:')) || '[]') || '[]').length; } catch { return -1; } });
  const msg = await page.textContent('#cmsg');
  if (kept !== 1 || !/Saved/.test(msg)) problems.push(`a comment wasn't kept by the page (kept ${kept}, said "${msg}")`);
  if (shots) await page.screenshot({ path: join(shots, `${String(++n).padStart(2, '0')}-comment.png`) });
  await page.click('#sheetComment [data-close]');
  await page.click('#bScreens');
  await page.waitForTimeout(300);
  if (shots) await page.screenshot({ path: join(shots, `${String(++n).padStart(2, '0')}-screens.png`) });

  // The page's frame never moves: the dock stays at the bottom of the phone after all of the above
  const frame = await page.evaluate(() => ({ shell: document.getElementById('shell').scrollTop, doc: document.scrollingElement.scrollTop, dock: Math.round(document.querySelector('.dock').getBoundingClientRect().bottom) }));
  if (frame.shell || frame.doc || frame.dock !== H) problems.push(`the page's frame moved (dock bottom at ${frame.dock}, not ${H}): its buttons can end up off the screen`);

  for (const e of errors) problems.push(`page error: ${e}`);
  for (const u of net) problems.push(`asked the network for ${u}`);
  const versions = info.screens.reduce((t, s) => t + s.variants.length, 0);
  for (const w of warnings) console.log(`Warning: ${w}`);
  if (problems.length) { console.error(`${problems.length} problem${problems.length > 1 ? 's' : ''}:`); for (const p of problems) console.error(`- ${p}`); process.exitCode = 1; }
  else console.log(`Mockup check passed: ${ids.length} screen${ids.length === 1 ? "" : "s"}, ${versions} version${versions === 1 ? "" : "s"}, opened offline at ${W}×${H}, every screen reachable${shots ? `, ${n} screenshots in ${shots}` : ''}.`);
} catch (e) {
  console.error(`The check couldn't finish: ${e.message}`);
  process.exitCode = 1;
} finally {
  await browser.close();
}
