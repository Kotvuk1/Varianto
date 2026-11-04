import { expect, test } from '@playwright/test';
import { openSession } from './ms.helpers';
import { startSession } from './challenge.helpers';

// Подсказки заданий: интро, подсказки «Контекста», термины. Чистое состояние (интро не отключены).
// Скриншоты: GUIDE_SHOTS=/path pnpm test:e2e guide
test.use({ storageState: { cookies: [], origins: [] } });
test.describe.configure({ timeout: 240_000 });

const CTX = '/learn/price-action/session?type=context&difficulty=easy&tf=1h&symbol=BTCUSDT';
const shotDir = process.env.GUIDE_SHOTS;

async function shot(page: import('@playwright/test').Page, name: string) {
  if (!shotDir) return;
  const w = page.viewportSize()?.width ?? 0;
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${shotDir}/${w < 1024 ? 'mobile' : 'desktop'}-${name}.png` });
}

test('PA «Контекст»: интро при первом входе, «Больше не показывать» переживает перезагрузку', async ({ page }) => {
  await openSession(page, CTX);
  const intro = page.getByTestId('task-intro');
  await expect(intro).toBeVisible();
  for (const t of ['Что сделать', 'Как выглядит правильный ответ', 'Как оценивается']) await expect(intro).toContainText(t);
  await shot(page, '1-intro-context');
  await page.getByTestId('intro-ok').click();
  await expect(intro).toHaveCount(0);
  // (i) открывает то же интро повторно
  await page.getByTestId('intro-open').click();
  await expect(intro).toBeVisible();
  await page.getByTestId('intro-never').click();
  await expect(intro).toHaveCount(0);
  await page.reload();
  await expect(page.getByTestId('chart')).toHaveAttribute('data-ready', 'true', { timeout: 90_000 });
  await expect(page.getByTestId('task-hint')).toBeVisible();
  await expect(intro).toHaveCount(0);
});

test('PA «Контекст»: подсказки под вопросами, термин открывает определение, шаг «Тренд» на 4H', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('tl.intro.dismissed.pa-context', '1'));
  await openSession(page, CTX);
  const mobile = (page.viewportSize()?.width ?? 0) < 1024;
  const chart = page.getByTestId('chart');
  if (mobile) {
    await expect(page.getByTestId('ctx-hint-sweep')).toContainText('Swing');
    await shot(page, '2-context-step1');
    await expect(chart).toHaveAttribute('aria-label', /1H/);
    for (const id of ['sweep', 'ob', 'level']) {
      await page.getByTestId(`ctx-${id}`).getByRole('radio', { name: 'Нет' }).click();
      await page.getByTestId('step-next').click();
    }
    await expect(page.getByTestId('ctx-hint-trend')).toContainText('HH/HL');
    await expect(chart).toHaveAttribute('aria-label', /4H/, { timeout: 30_000 });
    await expect(chart).toHaveAttribute('data-ready', 'true');
    await shot(page, '3-context-step4-trend');
    await page.getByTestId('ctx-trend').getByRole('radio', { name: 'Вверх' }).click();
    await page.getByTestId('step-next').click();
    await expect(chart).toHaveAttribute('aria-label', /1H/, { timeout: 30_000 });
    await expect(page.getByTestId('ctx-hint-significant')).toContainText('Значима');
    await page.getByTestId('step-prev').click();
    await page.getByTestId('step-prev').click();
  } else {
    for (const id of ['sweep', 'ob', 'level', 'trend', 'significant']) await expect(page.getByTestId(`ctx-hint-${id}`)).toBeVisible();
  }
  const term = page.getByTestId('ctx-sweep').getByTestId('term').first();
  await term.click();
  await expect(page.getByTestId('term-def')).toContainText('забирает стопы');
  await shot(page, '4-term-popover');
  await page.getByRole('button', { name: 'Закрыть' }).last().click();
  await expect(page.getByTestId('term-def')).toHaveCount(0);
  // нет горизонтальной прокрутки
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('MS и Challenge: интро при первом входе', async ({ page }) => {
  await openSession(page, '/learn/market-structure/session?mode=mark&difficulty=easy&tf=1h&symbol=BTCUSDT');
  await expect(page.getByTestId('task-intro')).toContainText('Swing High');
  await shot(page, '5-intro-ms');
  await page.getByTestId('intro-ok').click();
  await startSession(page, 'easy');
  await expect(page.getByTestId('task-intro')).toContainText('LONG');
  await shot(page, '6-intro-challenge');
});
