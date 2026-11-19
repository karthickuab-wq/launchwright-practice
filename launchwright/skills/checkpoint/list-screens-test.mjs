// Tests for list-screens.mjs, on a made-up export folder. Plain Node: node list-screens-test.mjs
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { listScreens, shotName } from './list-screens.mjs';

const dist = mkdtempSync(join(tmpdir(), 'lw-screens-'));
const files = [
  'index.html', 'more.html', '(tabs)/index.html', '(tabs)/more.html', '(tabs)/today.html',
  'recipe/[id].html', 'settings/profile.html', 'settings/index.html',
  '_sitemap.html', '+not-found.html', '_expo/static/js/web/entry.js', 'assets/logo.png',
];
for (const f of files) {
  mkdirSync(dirname(join(dist, f)), { recursive: true });
  writeFileSync(join(dist, f), '');
}
try {
  const { screens, needsValue } = listScreens(dist);
  assert.deepEqual(screens, ['/', '/more', '/settings', '/settings/profile', '/today']);
  assert.deepEqual(needsValue, ['/recipe/[id]']);
  assert.equal(listScreens(dist).onePage, false);
  assert.equal(shotName('/'), 'home.png');
  assert.equal(shotName('/settings/profile'), 'settings-profile.png');
  assert.equal(shotName('/recipe/1'), 'recipe-1.png');
  // A build exported as one page for everything (web.output "single") is flagged, not taken as one screen.
  const single = mkdtempSync(join(tmpdir(), 'lw-single-'));
  writeFileSync(join(single, 'index.html'), '');
  mkdirSync(join(single, '_expo'));
  writeFileSync(join(single, '_expo', 'entry.js'), '');
  try {
    assert.equal(listScreens(single).onePage, true);
  } finally {
    rmSync(single, { recursive: true, force: true });
  }
  // A build with server code lists its pages in server/_expo/routes.json, not as .html files.
  const server = mkdtempSync(join(tmpdir(), 'lw-server-'));
  mkdirSync(join(server, 'server', '_expo'), { recursive: true });
  mkdirSync(join(server, 'client'));
  writeFileSync(join(server, 'server', '_expo', 'routes.json'), JSON.stringify({ htmlRoutes: [
    { page: '/(tabs)/index' }, { page: '/(tabs)/more' }, { page: '/recipe/[id]' }, { page: '/+not-found' }, { page: '/_sitemap', generated: true },
  ] }));
  try {
    assert.deepEqual(listScreens(server), { screens: ['/', '/more'], needsValue: ['/recipe/[id]'], onePage: false });
  } finally {
    rmSync(server, { recursive: true, force: true });
  }
  console.log('list-screens: all tests passed');
} finally {
  rmSync(dist, { recursive: true, force: true });
}
