#!/usr/bin/env node
// Tests for check-contrast.mjs: the example passes, and a faint pair is caught.
// Usage: node skills/design-direction/check-contrast-test.mjs   (plain Node 20+, no packages)
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { check, ratio } from './check-contrast.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ok = (name, fn) => { fn(); console.log(`ok - ${name}`); };
const styles = readFileSync(join(HERE, 'examples/usewell/styles.html'), 'utf8');

ok('black on white is 21 to 1, and a colour on itself is 1', () => { assert.equal(Math.round(ratio([0, 0, 0], [255, 255, 255])), 21); assert.equal(ratio([63, 122, 90], [63, 122, 90]), 1); });
ok('the Usewell styles pass, all three themes', () => { const r = check(styles); assert.deepEqual(r.problems, []); assert.equal(r.themes.length, 3); });
ok("the mockup's own Usewell example passes", () => assert.deepEqual(check(readFileSync(join(HERE, '../mockup/examples/usewell/screens.html'), 'utf8')).problems, []));
ok('faint muted text is caught, with its theme', () => { const r = check(styles.replace('--muted: #5B4B73;', '--muted: #B9AFC8;')); assert.ok(r.problems.some((p) => /theme "bold": muted text/.test(p)), r.problems.join(' | ')); });
ok("a button's words too close to the button are caught", () => assert.ok(check('<style>.app { --accent: #8FD3A8; --accent-ink: #FFFFFF; }</style>').problems.some((p) => /main button/.test(p))));
ok('a colour that is not #hex is reported, not skipped silently', () => assert.ok(check('<style>.app { --ink: rgb(0,0,0); }</style>').problems.some((p) => /isn't a #hex/.test(p))));
ok('a file with no theme is reported', () => assert.ok(check('<p>nothing</p>').problems.some((p) => /no theme/.test(p))));
console.log('All check-contrast tests passed.');
