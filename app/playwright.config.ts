import { defineConfig } from '@playwright/test';

// The free phone-flow tests: the app's web build, served and opened at a phone's size, tapping through
// the screens the way the Maestro flows in .maestro/ do on Expo's simulated phones (those cost money:
// open point O9). They catch most broken screens and taps, but not what's special to an iPhone or an
// Android phone. Run `npm run export:web` first, then `npm run flows`.
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
  projects: [{ name: 'phone', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } }],
});
