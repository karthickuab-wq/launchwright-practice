#!/usr/bin/env node
// Tests for the starter's own scripts: apply-design, make-icons and check-starter. Each check is
// shown to fail on something broken on purpose, in a temporary copy, so a check that can't fail
// can't pass for nothing. Plain Node 20+, no packages.
//   node scripts/starter-test.mjs
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { applyTokens, format, parseDesign } from './apply-design.mjs';
import { check } from './check-starter.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// The workflows: in the plugin's template, workflows/; in an app, .eas/workflows, where the kit copies them.
const WF = existsSync(join(ROOT, 'workflows')) ? 'workflows' : '.eas/workflows';
const SKIP = new Set(['node_modules', 'dist', '.expo', 'web-build', 'test-results', 'assets']);
let failures = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

function copy() {
  const dir = mkdtempSync(join(tmpdir(), 'starter-'));
  cpSync(ROOT, dir, { recursive: true, filter: (src) => !SKIP.has(src.split(/[\\/]/).pop()) });
  return dir;
}
const edit = (dir, file, fn) => writeFileSync(join(dir, file), fn(readFileSync(join(dir, file), 'utf8')));
const json = (dir, file, fn) => edit(dir, file, (s) => `${JSON.stringify(fn(JSON.parse(s)), null, 2)}\n`);
const withCopy = (fn) => { const dir = copy(); try { return fn(dir); } finally { rmSync(dir, { recursive: true, force: true }); } };
const failsWith = (problems, text) => assert.ok(problems.some((p) => p.includes(text)), `expected a problem mentioning "${text}", got:\n${problems.join('\n') || '(none)'}`);

const GUIDE = `# The design guide
## The style chosen
**Calm and airy**, chosen today.
## Colours
| Name | What it's for | Value |
| --- | --- | --- |
| bg | Background | #FBFAF6 |
| surface | Cards | #F1F3EC |
| ink | Text | #1F2A22 |
| muted | Second lines | #66706A |
| line | Dividers | #E3E6DE |
| accent | Main button | #3F7A5A |
| accent-ink | Words on the main button | #FFFFFF |
| accent-soft | Second buttons | #E5F1E8 |
| warn, warn-soft | The tag | #B2452C, #F8E6E0 |
| amber, amber-soft | The tag | #8A5A00, #FBF1DA |
| good, good-soft | The tag | #2F6B45, #E5F1E8 |
## Type
| Use | Size | Weight |
| --- | --- | --- |
| Screen title | 30 | Bold (750) |
| Section heading | 18 | Bold (700) |
| Body and list items | 16 | Regular; names semibold (650) |
| Second lines, amounts | 14 | Regular |
| Tags | 13 | Semibold (650) |
| Main button | 17 | Bold (700) |
## Spacing and shapes
- **Spacing steps:** 4, 8, 12, 16, 20, 24.
- **Corners:** 18 on cards and buttons; 12 on tiles.
`;

const base = () => JSON.parse(readFileSync(join(ROOT, 'src/theme/tokens.json'), 'utf8'));

test('the guide is read: colours (two to a row), type, spacing, corners and the style name', () => {
  const g = parseDesign(GUIDE);
  assert.equal(g.style, 'Calm and airy');
  assert.equal(g.colors.accentInk, '#FFFFFF');
  assert.equal(g.colors.warn, '#B2452C');
  assert.equal(g.colors.warnSoft, '#F8E6E0');
  assert.deepEqual(g.type.title, { size: 30, weight: '700' });
  assert.deepEqual(g.type.body, { size: 16, weight: '400' }, 'the first weight word wins');
  assert.deepEqual(g.type.small, { size: 14, weight: '400' });
  assert.deepEqual(g.type.tag, { size: 13, weight: '600' });
  assert.deepEqual(g.spacing, [4, 8, 12, 16, 20, 24]);
  assert.equal(g.radius, 18);
  assert.deepEqual(g.problems, []);
});

test('the guide fills the theme, and the result still passes the readable-colours rule', () => {
  const { tokens, problems } = applyTokens(base(), parseDesign(GUIDE));
  assert.deepEqual(problems, []);
  assert.equal(tokens.colors.accent, '#3F7A5A');
  assert.equal(tokens.radius, 18);
  assert.equal(tokens.style, 'Calm and airy');
  assert.equal(format(tokens), format(JSON.parse(format(tokens))), 'writing it twice changes nothing');
});

test('a guide with a colour missing is refused, and says which', () => {
  const { problems } = applyTokens(base(), parseDesign(GUIDE.replace('| line | Dividers | #E3E6DE |\n', '')));
  failsWith(problems, 'no value for: line');
});

test('a guide with a faint text colour is refused, and says which pair', () => {
  const { problems } = applyTokens(base(), parseDesign(GUIDE.replace('#66706A', '#B8BEB9')));
  failsWith(problems, 'muted');
});

test('a guide with text under 13 is refused', () => {
  const { problems } = applyTokens(base(), parseDesign(GUIDE.replace('| Tags | 13 |', '| Tags | 11 |')));
  failsWith(problems, 'under 13');
});

test('a value that is not a # colour is refused', () => {
  failsWith(applyTokens(base(), parseDesign(GUIDE.replace('#3F7A5A', 'green'))).problems, 'isn\'t a # colour');
});

test('the untouched starter passes the check', () => {
  assert.deepEqual(check(ROOT, { starter: true }), []);
});

test('a package whose name only contains a tracking word is not refused', () => {
  const dir = copy();
  try {
    for (const name of ['@react-native-segmented-control/segmented-control', 'react-native-adjustable-text']) {
      json(dir, 'package.json', (p) => ({ ...p, dependencies: { ...p.dependencies, [name]: '1.0.0' } }));
    }
    assert.deepEqual(check(dir, { starter: true }), []);
    json(dir, 'package.json', (p) => ({ ...p, dependencies: { ...p.dependencies, '@segment/analytics-react-native': '1.0.0', '@sentry/react-native': '1.0.0' } }));
    assert.equal(check(dir, { starter: true }).filter((m) => m.includes('analytics or tracking')).length, 2);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('the check refuses what it must, each shown on a broken copy', () => {
  const kind = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).launchwright.template;
  const files = readdirSync(join(ROOT, WF)).sort();
  const CHECKPOINT = files.find((f) => /\[checkpoint\]/.test(readFileSync(join(ROOT, WF, f), 'utf8')));
  const RELEASE = files.filter((f) => /require-approval/.test(readFileSync(join(ROOT, WF, f), 'utf8')));
  assert.ok(CHECKPOINT && RELEASE.length, 'the starter has a checkpoint workflow and a release workflow');
  const cases = [
    ['an old Expo SDK', (d) => json(d, 'package.json', (p) => ({ ...p, dependencies: { ...p.dependencies, expo: '~55.0.1' } })), 'SDK must be 56 or later'],
    ['a deploy script', (d) => json(d, 'package.json', (p) => ({ ...p, scripts: { ...p.scripts, deploy: 'eas deploy --prod' } })), '"deploy"'],
    ['an install script', (d) => json(d, 'package.json', (p) => ({ ...p, scripts: { ...p.scripts, postinstall: 'node x.js' } })), 'run on install'],
    ['an analytics package', (d) => json(d, 'package.json', (p) => ({ ...p, dependencies: { ...p.dependencies, 'expo-firebase-analytics': '1.0.0' } })), 'analytics or tracking'],
    ['a colour written into a screen', (d) => edit(d, 'src/app/(tabs)/more.tsx', (s) => `${s}\nconst x = '#123456';\n`), 'colours come from the theme'],
    ['lorem ipsum', (d) => edit(d, 'src/app/(tabs)/more.tsx', (s) => `${s}\n// Lorem ipsum\nconst y = 'Lorem ipsum';\n`), 'lorem ipsum'],
    ['a faint theme colour', (d) => json(d, 'src/theme/tokens.json', (t) => ({ ...t, colors: { ...t.colors, muted: '#C8CCC9' } })), 'Too faint'],
    ['a missing theme colour', (d) => json(d, 'src/theme/tokens.json', (t) => { delete t.colors.goodSoft; return t; }), '"goodSoft"'],
    ['a flow that looks for words no screen shows', (d) => (kind === 'expo-app'
      ? edit(d, '.maestro/home.yml', (s) => `${s}- assertVisible: 'Words nobody wrote'\n`)
      : edit(d, 'flows/home.spec.ts', (s) => `${s}\ntest('x', async ({ page }) => { await expect(page.getByText('Words nobody wrote')).toBeVisible(); });\n`)), 'Words nobody wrote'],
    ['a deploy to production in a checkpoint workflow', (d) => {
      edit(d, `${WF}/${CHECKPOINT}`, (s) => `${s}\n  ship:\n    type: deploy\n    params:\n      prod: true\n`);
    }, 'without a require-approval job'],
    ['a submit job in a checkpoint workflow', (d) => {
      edit(d, `${WF}/${CHECKPOINT}`, (s) => `${s}\n  send:\n    type: submit\n`);
    }, 'without a require-approval job'],
    ['an update job in any workflow', (d) => {
      edit(d, `${WF}/${RELEASE[0]}`, (s) => `${s}\n  ota:\n    type: update\n`);
    }, '"update" job'],
    ['a release job that does not wait for the approval', (d) => {
      edit(d, `${WF}/${RELEASE[0]}`, (s) => s.replace(/(\n  (send_ios|send_android|deploy_production):[\s\S]*?needs: \[)([^\]]*), approve\]/, '$1$3]'));
    }, "doesn't wait for the approval job"],
    ['a release workflow with no approval job', (d) => {
      edit(d, `${WF}/${RELEASE[0]}`, (s) => s.replace('type: require-approval', 'type: doc'));
    }, 'without a require-approval job'],
    ['a release workflow without its marker', (d) => {
      edit(d, `${WF}/${RELEASE[0]}`, (s) => s.replace(/'\[(store-ios|store-android|release-web)\]'/, "'[checkpoint]'"));
    }, 'must run only for a push whose message says'],
    ['a release workflow started by a pull request', (d) => {
      edit(d, `${WF}/${RELEASE[0]}`, (s) => s.replace('on:\n', 'on:\n  pull_request_labeled:\n    labels: [ship]\n'));
    }, 'something other than a push'],
    ['a release workflow on another branch', (d) => {
      edit(d, `${WF}/${RELEASE[0]}`, (s) => s.replace("branches: ['main']", "branches: ['*']"));
    }, 'working branch'],
    ['a workflow that submits from a command', (d) => {
      edit(d, `${WF}/${CHECKPOINT}`, (s) => `${s}\n  sneak:\n    steps:\n      - run: eas build --auto-submit\n`);
    }, 'deploys to production or submits'],
    ['a workflow that starts on every push', (d) => {
      edit(d, `${WF}/${CHECKPOINT}`, (s) => s.replace(/\n\s*if: .*\n/, '\n'));
    }, 'every push'],
  ];
  if (kind === 'expo-app') {
    cases.push(
      ['a second submit profile', (d) => json(d, 'eas.json', (e) => ({ ...e, submit: { ...e.submit, testers: {} } })), 'submit profile "testers"'],
      ['a submit to Google production', (d) => json(d, 'eas.json', (e) => ({ ...e, submit: { production: { android: { track: 'production' } } } })), 'android.track to "internal"'],
      ['a key file in the submit profile', (d) => json(d, 'eas.json', (e) => ({ ...e, submit: { production: { android: { track: 'internal', serviceAccountKeyPath: './key.json' } } } })), 'serviceAccountKeyPath'],
      ['a rollout in the submit profile', (d) => json(d, 'eas.json', (e) => ({ ...e, submit: { production: { android: { track: 'internal', rollout: 0.5 } } } })), 'rollout'],
      ['another store build profile', (d) => json(d, 'eas.json', (e) => ({ ...e, build: { ...e.build, release: {} } })), 'store build'],
      ['a store build that sends itself', (d) => json(d, 'eas.json', (e) => ({ ...e, build: { ...e.build, production: { autoSubmit: true } } })), 'by itself'],
      ['a production profile that is not a store build', (d) => json(d, 'eas.json', (e) => ({ ...e, build: { ...e.build, production: { distribution: 'internal' } } })), 'must make store versions'],
      ['no test profile', (d) => json(d, 'eas.json', (e) => { delete e.build['e2e-test']; return e; }), '"e2e-test" profile'],
      ['a flow for another app', (d) => edit(d, '.maestro/home.yml', (s) => s.replace('com.example.starterapp', 'com.someone.else')), 'appId'],
      ['a workflow naming a flow that is gone', (d) => edit(d, `${WF}/phone-flows-ios.yml`, (s) => s.replace('.maestro/tap.yml', '.maestro/gone.yml')), 'gone.yml'],
    );
  }
  if (kind === 'web-app') {
    cases.push(
      ['a store build profile in a web app', (d) => writeFileSync(join(d, 'eas.json'), JSON.stringify({ build: { production: {} } })), 'no store build'],
      ['a store workflow in a web app', (d) => edit(d, `${WF}/${RELEASE[0]}`, (s) => s.replace("'[release-web]'", "'[store-ios]'")), '[release-web]'],
    );
  }
  for (const [what, breakIt, expected] of cases) {
    withCopy((dir) => {
      breakIt(dir);
      const problems = check(dir, { starter: true });
      try { failsWith(problems, expected); } catch (e) { e.message = `${what}: ${e.message}`; throw e; }
    });
  }
});

test('the starter check refuses a network call, ready mode refuses placeholders, and a finished app passes', () => {
  withCopy((dir) => {
    edit(dir, 'src/app/(tabs)/more.tsx', (s) => `${s}\nfetch('https://example.org');\n`);
    failsWith(check(dir, { starter: true }), 'network call');
    assert.deepEqual(check(dir, {}), [], 'an app may make calls once it has them; only the starter may not');
  });
  withCopy((dir) => {
    const problems = check(dir, { ready: true });
    const kind = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).launchwright.template;
    for (const text of ['starter name', ...(kind === 'expo-app' ? ['com.example.'] : []), 'starter screen', 'run npm run design', 'icon']) failsWith(problems, text);
  });
});

test('the icons are made: real PNG files, the app icon without an alpha channel, and set in app.json', async () => {
  const { spawnSync } = await import('node:child_process');
  withCopy((dir) => {
    const r = spawnSync(process.execPath, [join(dir, 'scripts/make-icons.mjs'), '--dir', dir], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    const favicon = readFileSync(join(dir, 'assets/favicon.png'));
    assert.deepEqual([...favicon.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.equal(favicon.readUInt32BE(16), 48);
    assert.equal(favicon[25], 2, 'colour type 2 is RGB: no alpha channel');
    const app = JSON.parse(readFileSync(join(dir, 'app.json'), 'utf8')).expo;
    assert.equal(app.web.favicon, './assets/favicon.png');
    if (existsSync(join(dir, 'assets/icon.png'))) {
      const icon = readFileSync(join(dir, 'assets/icon.png'));
      assert.equal(icon.readUInt32BE(16), 1024);
      assert.equal(icon[25], 2);
      assert.equal(readFileSync(join(dir, 'assets/adaptive-icon.png'))[25], 6, 'the adaptive icon keeps its transparency');
      assert.equal(app.icon, './assets/icon.png');
    }
    assert.deepEqual(check(dir, { ready: true }).filter((p) => /icon/i.test(p)), []);
  });
});

for (const [name, fn] of tests) {
  try { await fn(); console.log(`ok   ${name}`); } catch (e) { failures++; console.log(`FAIL ${name}\n     ${String(e.message).split('\n').join('\n     ')}`); }
}
console.log(failures ? `\n${failures} of ${tests.length} failed.` : `\nAll ${tests.length} passed.`);
process.exitCode = failures ? 1 : 0;
