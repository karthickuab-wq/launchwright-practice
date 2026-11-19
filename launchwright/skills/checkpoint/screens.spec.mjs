// The checkpoint's screenshots: every screen of the exported web build, at a phone's size, for the
// design review (skills/checkpoint/SKILL.md, section 4). The checkpoint copies this file and
// list-screens.mjs into the app's flows/ folder. It does nothing unless SCREENS_DIR is set, so
// ordinary flow runs skip it.
//
// Run from the app's folder, after `npm run export:web`:
//   SCREENS_DIR=../project/checkpoints/C1/screens npx playwright test flows/screens.spec.mjs --project phone
// SAMPLE_ROUTES (optional) lists addresses for screens that need a value, comma-separated,
// such as "/recipe/1,/list/2".

import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { listScreens, shotName } from './list-screens.mjs';

const out = process.env.SCREENS_DIR;
const { screens, needsValue, onePage } = out ? listScreens(resolve('dist')) : { screens: [], needsValue: [], onePage: false };
const samples = (process.env.SAMPLE_ROUTES || '').split(',').map((s) => s.trim()).filter(Boolean);

test.describe('checkpoint screenshots', () => {
  test.skip(!out, 'SCREENS_DIR is not set');
  test.beforeAll(() => mkdirSync(out, { recursive: true }));

  for (const route of [...screens, ...samples]) {
    test(`screen ${route}`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.ok(), `${route} opens`).toBeTruthy();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: join(out, shotName(route)), fullPage: true });
    });
  }

  test('the web build has a page for each screen', () => {
    expect(onePage, 'The web build is one page for everything: set "web" > "output" to "static" in app.json, export again, then take the pictures').toBe(false);
    expect(screens.length + samples.length, 'No screens found in dist/: run npm run export:web first').toBeGreaterThan(0);
  });

  test('every screen that needs a value has a sample', () => {
    const covered = needsValue.filter((r) => samples.some((s) => s.split('/').length === r.split('/').length));
    expect(covered, `Screens that need a sample address in SAMPLE_ROUTES: ${needsValue.join(', ')}`).toEqual(needsValue);
  });
});
