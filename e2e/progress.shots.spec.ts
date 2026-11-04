import { expect, test, type Page } from '@playwright/test';
import { expandResult, startSession, submitDecision, waitResult } from './challenge.helpers';
import { checkAndSeeResult, openSession, selectTool, tapCandle } from './ms.helpers';

// F-11: 6 реальных заданий (4 MS + 2 Challenge WAIT), у каждого навыка < 5 попыток.
// Запуск: SHOTS_DIR=/path E2E_PORT=3733 pnpm test:e2e progress.shots
test.setTimeout(900_000);

const SESSION = '/learn/market-structure/session?mode=mark&difficulty=easy&tf=1h&symbol=BTCUSDT';

async function shot(page: Page, name: string) {
  const dir = process.env.SHOTS_DIR;
  if (!dir) return;
  const w = page.viewportSize()?.width ?? 0;
  await page.screenshot({ path: `${dir}/${name}-${w < 1024 ? 'mobile' : 'desktop'}.png`, fullPage: true });
}

test('6 заданий: вывод по модулям, «мало данных» по навыкам, тренировка', async ({ page }) => {
  await openSession(page, SESSION);
  for (let i = 0; i < 4; i++) {
    if (i > 0) {
      const before = await page.getByTestId('task-counter').innerText();
      await page.getByTestId('next-task').click();
      await expect(page.getByTestId('task-counter')).not.toHaveText(before, { timeout: 90_000 });
      await expect(page.getByTestId('chart')).toHaveAttribute('data-ready', 'true', { timeout: 90_000 });
    }
    await selectTool(page, 'Swing High', 'Свинги');
    await tapCandle(page, 20);
    await checkAndSeeResult(page);
  }
  for (let i = 0; i < 2; i++) {
    await startSession(page, 'hard');
    await page.getByRole('radio', { name: 'WAIT' }).click();
    await submitDecision(page, 'range-no-edge');
    await waitResult(page);
    await page.getByTestId('replay-skip').click();
    await expandResult(page);
    if (i === 1) await shot(page, 'challenge-result-6');
  }

  await page.goto('/progress');
  const acc = page.getByTestId('module-accuracy');
  await expect(acc).toContainText('Market Structure');
  await expect(acc).toContainText('Trading Challenge');
  await expect(acc).toContainText('по навыкам — мало данных');
  await expect(page.getByTestId('error-group').first()).toContainText(/Пропущенный Swing|Лишний Swing/);
  await shot(page, 'progress-weak');
  await page.getByRole('radio', { name: 'Навыки' }).click();
  await expect(page.getByTestId('module-accuracy')).toBeVisible();
  await shot(page, 'progress-skills');
  await page.getByRole('radio', { name: 'Challenge' }).click();
  await shot(page, 'progress-challenge');

  await page.goto('/');
  await expect(page.getByText('Сегодня: 6 из 10 заданий')).toBeVisible();
  await expect(page.getByTestId('home-few-data')).toContainText('Решено 6');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await shot(page, 'home');

  await page.goto('/settings');
  await expect(page.getByTestId('settings-sign-in')).toHaveCount(0);
  await shot(page, 'settings');

  // «Тренировать» для навыка Challenge несёт focus в сессию, фокус виден в шапке.
  await page.goto('/learn/challenge/session?difficulty=hard&focus=challenge-wait');
  await expect(page.getByTestId('challenge-focus')).toContainText('Ожидание (WAIT)');
});
