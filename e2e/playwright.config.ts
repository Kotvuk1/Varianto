import { defineConfig } from '@playwright/test';

const PORT = 3100;

export default defineConfig({
  testDir: '.',
  outputDir: '../test-results',
  reporter: [['list'], ['html', { open: 'never', outputFolder: '../playwright-report' }]],
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'mobile',
      use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: `pnpm --filter web build && pnpm --filter web start -p ${PORT}`,
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
