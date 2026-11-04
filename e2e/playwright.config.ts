import { defineConfig } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 3100);
const INTRO_KEYS = ['ms-mark', 'ms-question', 'pa-find', 'pa-level', 'pa-context', 'challenge'];
/** Интро заданий отключены по умолчанию, чтобы не перекрывать график в обычных сценариях; guide.spec.ts начинает с чистого состояния. */
export const INTRO_DISMISSED = {
  cookies: [],
  origins: [{ origin: `http://localhost:${PORT}`, localStorage: INTRO_KEYS.map((k) => ({ name: `tl.intro.dismissed.${k}`, value: '1' })) }],
};

export default defineConfig({
  testDir: '.',
  outputDir: '../test-results',
  reporter: [['list'], ['html', { open: 'never', outputFolder: '../playwright-report' }]],
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    storageState: INTRO_DISMISSED,
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
    command: `pnpm --filter ./apps/web build && pnpm --filter ./apps/web start -p ${PORT}`,
    // Run from the repo root so the path filter resolves to apps/web.
    cwd: '..',
    url: `http://localhost:${PORT}/api/health`,
    // Тестовые хуки графика (window.__tl*) только в e2e-сборке (D-14); архив доступен в production без флага.
    env: {
      NEXT_PUBLIC_E2E_HOOKS: '1',
      // Test-only signing secret for task tokens; never used in production.
      TASK_SIGNING_SECRET: process.env.TASK_SIGNING_SECRET ?? 'e2e-only-task-signing-secret-not-for-production',
      // Route server-side archive fetches through the container proxy when present.
      NODE_USE_ENV_PROXY: '1',
      // Все e2e идут с одного IP: поднимаем лимиты только для тестового сервера (D-07).
      RATE_LIMIT_TASKS_PER_MIN: '100000',
      RATE_LIMIT_HISTORY_PER_MIN: '100000',
    },
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
