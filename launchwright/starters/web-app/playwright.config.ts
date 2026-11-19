import { defineConfig } from '@playwright/test';

// Phone-flow tests for the web app: the exported site is served and opened at a phone's size and at
// a desktop's size. Run `npm run export:web` first, then `npm run flows`.
// In a Claude cloud session the browser is already installed; if the browser can't be found, set
// CHROMIUM_PATH to its file (the cloud session has it at /opt/pw-browsers/chromium).
export default defineConfig({
  testDir: './flows',
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:8099',
    launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
  },
  webServer: {
    command: 'npx expo serve --port 8099',
    url: 'http://localhost:8099',
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [
    { name: 'phone', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
  ],
});
