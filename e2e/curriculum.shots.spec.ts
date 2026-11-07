import { test } from '@playwright/test';
import { openSession } from './ms.helpers';
import { checkReplayResult, seedAttempts, selectTool, sideFromTask, tapPrice } from './curriculum.helpers';

// Скриншоты для приёмки (SHOTS_DIR); без переменной тесты пропускаются. Реальные свечи с сервера, deviceScaleFactor 2.
test.skip(!process.env.SHOTS_DIR, 'только при SHOTS_DIR');
test.use({ deviceScaleFactor: 2 });
test.setTimeout(240_000);

const name = (page: import('@playwright/test').Page, n: string) => `${process.env.SHOTS_DIR}/${(page.viewportSize()?.width ?? 0) < 1024 ? 'mobile' : 'desktop'}-${n}.png`;

test('learn: курс, прогресс, замки', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('stage-1').waitFor();
  await seedAttempts(page, [
    { module: 'levels', skill: 'pa-level', n: 10 },
    { module: 'limit-entry', skill: 'limit-placement', n: 6 },
  ]);
  await page.reload();
  await page.getByTestId('stage-2').waitFor();
  await page.waitForTimeout(500);
  await page.screenshot({ path: name(page, 'learn'), fullPage: true });
});

test('limit-entry: лимитка и тип до проверки, затем разбор', async ({ page }) => {
  await openSession(page, '/learn/limit-entry/session?difficulty=easy&tf=1h&symbol=BTCUSDT');
  const side = await sideFromTask(page);
  await tapPrice(page, side);
  await page.getByTestId('limit-type-front-run').click();
  await page.getByTestId('front-k-0.2').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: name(page, 'limit-entry'), fullPage: false });
  await checkReplayResult(page);
  await page.screenshot({ path: name(page, 'limit-entry-result'), fullPage: false });
});

test('combo-level-trade: зона, лимитка, стоп/тейк до проверки', async ({ page }) => {
  await openSession(page, '/learn/combo-level-trade/session?difficulty=easy&tf=1h&symbol=BTCUSDT');
  const side = await sideFromTask(page);
  await selectTool(page, 'Зона', 'Уровни');
  await tapPrice(page, side, [0.004, 0.007, 0.011]);
  await tapPrice(page, side, [0.012, 0.016, 0.02]);
  await selectTool(page, 'Лимитка', 'Уровни');
  await tapPrice(page, side, [0.003, 0.005, 0.008], 25);
  await page.getByTestId('limit-type-near-edge').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: name(page, 'combo-level-trade'), fullPage: false });
});
