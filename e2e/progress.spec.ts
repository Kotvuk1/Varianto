import { expect, test, type Page } from '@playwright/test';
import { checkAndSeeResult, openSession, selectTool, tapCandle } from './ms.helpers';

const SESSION = '/learn/market-structure/session?mode=mark&difficulty=easy&tf=1h&symbol=BTCUSDT';
test.describe.configure({ timeout: 420_000 });

async function shot(page: Page, name: string) {
  const dir = process.env.M7_SHOTS;
  if (!dir) return;
  const w = page.viewportSize()?.width ?? 0;
  await page.screenshot({ path: `${dir}/${w < 1024 ? 'mobile' : 'desktop'}-${name}.png`, fullPage: true });
}

async function solveOne(page: Page) {
  await selectTool(page, 'Swing High', 'Структура');
  await tapCandle(page, 20);
  await expect(page.getByTestId('chart')).toHaveAttribute('data-mark-count', '1');
  await checkAndSeeResult(page);
}

async function noHScroll(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

test('пустой /progress и главная до первой попытки', async ({ page }) => {
  await page.goto('/progress');
  await expect(page.getByText('Пока нет данных')).toBeVisible();
  await expect(page.getByText('Ошибок пока нет')).toBeVisible();
  await page.goto('/');
  await expect(page.getByText('Сегодня: 0 из 10 заданий')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Начать с Market Structure' })).toBeVisible();
  await noHScroll(page);
});

test('задания MS отражаются на главной и в /progress, журнал раскрывает разбор', async ({ page }) => {
  await openSession(page, SESSION);
  await solveOne(page);

  await page.goto('/');
  await expect(page.getByText('Сегодня: 1 из 10 заданий')).toBeVisible();
  await expect(page.getByTestId('continue')).toBeVisible();
  await noHScroll(page);

  await page.goto('/progress');
  await expect(page.getByText(/Мало данных: 1 из 5/)).toBeVisible();
  const group = page.getByTestId('error-group').first();
  await expect(group).toBeVisible();
  await group.getByRole('button').first().click();
  await page.getByTestId('error-example').first().click();
  await expect(page.getByTestId('error-review')).toBeVisible();
  await expect(page.getByTestId('feedback-view')).toBeVisible();
  await noHScroll(page);
  await page.keyboard.press('Escape');

  // навыки по модулям, нейтральные бары
  await page.getByRole('radio', { name: 'Навыки' }).click();
  await expect(page.getByTestId('skill-group').first()).toHaveAttribute('data-module', 'market-structure');
  await page.getByRole('radio', { name: 'Challenge' }).click();
  await expect(page.getByText('Сценариев пока нет')).toBeVisible();
  await noHScroll(page);
});

test('5 заданий: слабые места, тренировка по навыку, скриншоты', async ({ page }) => {
  await openSession(page, SESSION);
  await solveOne(page);
  for (let i = 1; i < 5; i++) {
    const before = await page.getByTestId('task-counter').innerText();
    await page.getByTestId('next-task').click();
    await expect(page.getByTestId('task-counter')).not.toHaveText(before, { timeout: 90_000 });
    await expect(page.getByTestId('result')).toHaveCount(0);
    await expect(page.getByTestId('chart')).toHaveAttribute('data-ready', 'true', { timeout: 90_000 });
    await solveOne(page);
  }

  await page.goto('/progress');
  const rows = page.getByTestId('weak-row');
  await expect(rows.first()).toBeVisible();
  await expect(rows.first().getByRole('progressbar')).toBeVisible();
  await shot(page, 'progress-weak');
  await noHScroll(page);

  await page.getByRole('radio', { name: 'Навыки' }).click();
  await expect(page.getByTestId('skill-group').first()).toBeVisible();
  await shot(page, 'progress-skills');
  await page.getByRole('radio', { name: 'Challenge' }).click();
  await shot(page, 'progress-challenge');

  await page.goto('/');
  await expect(page.getByText('Сегодня: 5 из 10 заданий')).toBeVisible();
  await expect(page.getByTestId('weak-row').first()).toBeVisible();
  await shot(page, 'home');
  await noHScroll(page);

  // «Тренировать» ведёт в сессию с focus на навык
  const skill = await page.getByTestId('weak-row').first().getAttribute('data-skill');
  await page.getByTestId('train-skill').first().click();
  await expect(page).toHaveURL(new RegExp(`/session\\?.*focus=${skill}`));
  await expect(page.getByTestId('chart')).toHaveAttribute('data-ready', 'true', { timeout: 90_000 });
});
