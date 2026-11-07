import { expect, test } from '@playwright/test';
import { expandResult, startSession, submitDecision, waitResult } from './challenge.helpers';

// Скриншоты приёмки. Запуск: SHOTS_DIR=/path E2E_PORT=3300 pnpm test:e2e challenge.shots
const dir = process.env.SHOTS_DIR;
test.skip(!dir, 'SHOTS_DIR не задан');
test.setTimeout(240_000);

test('скриншоты: решение, проигрывание, итог', async ({ page }, info) => {
  const name = info.project.name;
  await startSession(page, 'easy');
  await page.getByRole('radio', { name: 'LONG' }).click();
  await expect(page.getByTestId('challenge-summary')).toBeVisible();
  await page.screenshot({ path: `${dir}/${name}-1-decision.png` });

  await submitDecision(page, 'trend-continuation');
  await waitResult(page);
  await page.getByRole('radio', { name: '×1', exact: true }).click();
  // Сделка может закрыться раньше 5-й свечи: тогда снимок проигрывания берётся на ближайшей доступной.
  await expect(page.getByTestId('replay-status')).toContainText(/свеча ([3-9]|\d\d) из/, { timeout: 30_000 }).catch(() => undefined);
  if (await page.getByTestId('replay-pause').isVisible()) await page.getByTestId('replay-pause').click();
  await page.screenshot({ path: `${dir}/${name}-2-replay.png` });

  if (await page.getByTestId('replay-pause').isVisible()) {
    await page.getByTestId('replay-pause').click();
    await page.getByTestId('replay-skip').click();
  }
  await expect(page.getByTestId('challenge-session')).toHaveAttribute('data-phase', 'result', { timeout: 30_000 });
  if (await page.getByTestId('challenge-result-peek').isVisible().catch(() => false)) {
    await page.waitForTimeout(600); // анимация шторки
    await page.screenshot({ path: `${dir}/${name}-3-result-peek.png` });
  }
  await expandResult(page);
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${dir}/${name}-3-result.png` });
});
