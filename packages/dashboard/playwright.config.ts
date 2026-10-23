import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: /.*\.spec\.ts/,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  use: {
    baseURL: 'http://localhost:3002',
    trace: 'off',
    headless: true,
  },
  projects: [
    {
      name: 'msedge',
      use: { ...devices['Desktop Chrome'], channel: 'msedge' },
    },
  ],
});
