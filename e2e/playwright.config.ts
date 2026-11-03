import { defineConfig } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 3100);

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
    // Локально можно указать установленный Chrome, если Playwright-браузеры не скачаны.
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROME_PATH || undefined },
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
    // Режим ?source=archive (реальные свечи архива Binance) в production-сборке e2e.
    env: { NEXT_PUBLIC_ENABLE_ARCHIVE_SOURCE: '1' },
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
