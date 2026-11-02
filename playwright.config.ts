import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;
const BASE = (process.env.SITE_BASE ?? '/mujahid-s-persona').replace(/\/+$/, '');

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}${BASE}/`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx astro preview --port ${PORT}`,
    url: `http://localhost:${PORT}${BASE}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
