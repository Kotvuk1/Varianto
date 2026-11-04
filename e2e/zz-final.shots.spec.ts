import { test } from '@playwright/test';
import { checkAndSeeResult, openSession, selectTool, tapCandle } from './ms.helpers';
const dir = process.env.SHOTS_DIR;
test.skip(!dir, 'SHOTS_DIR не задан');
test('final: home + ms sheet', async ({ page }, info) => {
  if (info.project.name !== 'mobile') test.skip();
  await page.goto('/');
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${dir}/home-mobile.png` });
  await openSession(page, '/learn/market-structure/session?mode=mark&difficulty=easy&tf=1h&symbol=BTCUSDT');
  await selectTool(page, 'Swing High', 'Свинги');
  await tapCandle(page, 20);
  await checkAndSeeResult(page);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${dir}/ms-mobile.png` });
});
