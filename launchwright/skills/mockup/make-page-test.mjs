#!/usr/bin/env node
// Tests for make-page.mjs: the examples pass, and each rule refuses what it should.
// Usage: node skills/mockup/make-page-test.mjs   (plain Node 20+, no packages)
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, check, MARKER, PAGE } from './make-page.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ok = (name, fn) => { fn(); console.log(`ok - ${name}`); };
const usewell = readFileSync(join(HERE, 'examples/usewell/screens.html'), 'utf8');
const ba = readFileSync(join(HERE, 'examples/before-after/screens.html'), 'utf8');
const one = (body, extra = '') => `${extra}<template data-screen="home" data-name="Home">${body}</template>`;
const fails = (src, re) => { const { problems } = check(src); assert.ok(problems.some((p) => re.test(p)), `expected a problem like ${re}, got: ${problems.join(' | ') || 'none'}`); };

ok('both examples pass', () => { assert.deepEqual(check(usewell).problems, []); assert.deepEqual(check(ba).problems, []); });
ok('the examples have the screens they should', () => { assert.equal(check(usewell).screens.length, 9); assert.deepEqual(check(ba).screens.map((s) => s.variants.length), [2, 2, 1]); });
ok('a button with no note is refused', () => fails(one('<button data-go="home">Go</button>'), /no data-note/));
ok('a link with no note is refused', () => fails(one('<a href="#">More</a>'), /link .* no data-note/));
ok('a tap to a missing screen is refused', () => fails(one('<button data-note="x" data-go="nowhere">Go</button>'), /leads to "nowhere"/));
ok('back is fine', () => assert.deepEqual(check(one('<button data-note="Back." data-go="back">Back</button>')).problems, []));
ok('a reserved or bad id is refused', () => { fails('<template data-screen="settings" data-name="S"></template>', /kept by claude\.ai/); fails('<template data-screen="My Screen" data-name="S"></template>', /small letters/); });
ok('a screen with no name is refused', () => fails('<template data-screen="home"></template>', /needs a data-name/));
ok('two versions need labels', () => fails('<template data-screen="a" data-name="A"></template><template data-screen="a"></template>', /data-variant/));
ok('a missing flow screen is refused', () => fails(one('', '<meta name="mockup-flow" content="home gone">'), /names "gone"/));
ok('network loads are refused', () => { fails(one('<img src="https://example.com/a.png">'), /network/); fails(one('', '<style>.a{background:url(https://x.io/b.png)}</style>'), /network/); fails(one('', '<script src="x.js"></script>'), /separate file/); });
ok('placeholder text is refused', () => { fails(one('<p>Lorem ipsum dolor</p>'), /placeholder/); fails(one('<p>TODO</p>'), /placeholder/); });
ok('a before-and-after needs two versions somewhere', () => fails(one('', '<meta name="mockup-kind" content="before-after">'), /two versions/));
ok('the build puts the screens where the marker was', () => { const page = readFileSync(PAGE, 'utf8'); assert.ok(page.includes(MARKER)); const out = build(usewell, page); assert.ok(!out.includes(MARKER)); assert.ok(out.includes('data-screen="today"')); assert.ok(out.startsWith('<!DOCTYPE html>')); });
console.log('All make-page tests passed.');
