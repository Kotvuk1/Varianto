import { expect, test } from '@playwright/test';
import { startSession, submitDecision, waitResult } from './challenge.helpers';

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
  await page.getByRole('radio', { name: '×1' }).click();
  await expect(page.getByTestId('replay-status')).toContainText(/свеча ([5-9]|\d\d) из/, { timeout: 30_000 });
  await page.getByTestId('replay-pause').click();
  await page.screenshot({ path: `${dir}/${name}-2-replay.png` });

  await page.getByTestId('replay-pause').click();
  await page.getByTestId('replay-skip').click();
  await expect(page.getByTestId('challenge-result')).toBeVisible({ timeout: 30_000 });
  await page.screenshot({ path: `${dir}/${name}-3-result.png` });
});
