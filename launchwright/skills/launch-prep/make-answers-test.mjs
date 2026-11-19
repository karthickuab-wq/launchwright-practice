#!/usr/bin/env node
// Tests for make-answers.mjs: the example passes, and each rule refuses what it should.
// Usage: node skills/launch-prep/make-answers-test.mjs   (plain Node 20+, no packages)
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MAX_BYTES, page, parse } from './make-answers.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ok = (name, fn) => { fn(); console.log(`ok - ${name}`); };
const usewell = readFileSync(join(HERE, 'examples/usewell-listing.md'), 'utf8');
const both = (apple, google = '### App name · 30\nUsewell') => `## App Store\n${apple}\n## Google Play\n${google}\n`;
const fails = (text, re, opts) => { const { problems } = parse(text, opts); assert.ok(problems.some((p) => re.test(p)), `expected a problem like ${re}, got: ${problems.join(' | ') || 'none'}`); };

ok('the example passes', () => assert.deepEqual(parse(usewell).problems, []));
ok('the example has its fields, with where, draft and limits read', () => {
  const { stores } = parse(usewell);
  assert.equal(stores.apple.length, 10);
  assert.equal(stores.google.length, 7);
  const kw = stores.apple.find((f) => f.name === 'Keywords');
  assert.deepEqual([kw.limit, kw.bytes, kw.where], [100, true, 'the version page, iOS App']);
  assert.match(stores.apple.find((f) => f.name === 'Privacy Policy URL').draft, /approve/);
  assert.ok(stores.apple.find((f) => f.name === 'Description').answer.includes('\n\nToday lists'), 'a long answer keeps its paragraphs');
});
ok('a missing store is refused, unless the app is in one store only', () => {
  fails('## App Store\n### Name · 30\nUsewell\n', /no "## Google Play"/);
  assert.deepEqual(parse('## App Store\n### Name · 30\nUsewell\n', { only: 'apple' }).problems, []);
});
ok('an empty answer is refused', () => fails(both('### Name · 30\n\n### Subtitle\nUse it up'), /"Name" has no answer/));
ok('an answer over its limit is refused, in characters or bytes', () => {
  fails(both('### Name · 30\nUsewell, the app that helps you use it all up'), /over its limit of 30/);
  fails(both('### Keywords · 10 bytes\ncafé,crème'), /12 bytes, over its limit of 10/);
  assert.deepEqual(parse(both('### Keywords · 10\ncafé,crème')).problems, [], 'a limit of 10 lets 10 characters through, though they are 12 bytes');
});
ok('placeholder text is refused', () => { fails(both('### Name · 30\nTODO'), /placeholder/); fails(both('### Support URL\nhttps://[your site]/help'), /placeholder/); });
ok('something like a key is refused', () => { fails(both('### Notes\nUse sk_test_abcdefgh12345678'), /key, a password/); fails(both('### Notes\nreview login password: hunter2'), /key, a password/); });
ok('the page has one copy button per field, escapes the text, and stays small', () => {
  const { stores } = parse(usewell);
  const html = page(stores, { app: 'Usewell' });
  assert.ok(html.startsWith('<!DOCTYPE html>'));
  assert.equal((html.match(/data-copy=/g) ?? []).length, 17);
  assert.ok(html.includes('Food &amp; Drink'));
  assert.ok(!/https?:\/\/(?!usewell\.app)/.test(html.replace(/<textarea[\s\S]*?<\/textarea>/g, '')), 'the page loads nothing from the network');
  assert.ok(Buffer.byteLength(html) < MAX_BYTES);
  assert.ok(html.includes('Draft: the privacy policy itself'));
});
console.log('All make-answers tests passed.');
