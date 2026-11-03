import { expect, test } from '@playwright/test';
import { checkAndSeeResult, nextThenHomeShowsDone, openSession, shot, tapCandle } from './ms.helpers';

const PA = '/learn/price-action';
test.describe.configure({ timeout: 180_000 });

test('экран выбора: тип задания ведёт в сессию', async ({ page }) => {
  await page.goto(PA);
  await page.getByRole('radio', { name: /Проведи уровень/ }).click();
  await page.getByTestId('start-session').click();
  await expect(page).toHaveURL(/type=draw-level/);
});

test('PA «Проведи уровень»: уровень, проверка, разбор', async ({ page }) => {
  await openSession(page, `${PA}/session?type=draw-level&difficulty=easy&tf=1h&symbol=BTCUSDT`);
  await expect(page.getByTestId('task-text')).toContainText('уровень');
  await shot(page, 'pa-level-before');
  await page.getByTestId('check-button').click();
  await expect(page.getByText(/Проведите уровень/).first()).toBeVisible();
  await tapCandle(page, 15);
  await expect(page.getByTestId('chart')).toHaveAttribute('data-mark-count', '1');
  await checkAndSeeResult(page);
  await expect(page.getByTestId('level-detail')).toContainText('Эталон');
  await shot(page, 'pa-level-after');
});

test('PA «Найди модель»: касание свечи, проверка, разбор', async ({ page }) => {
  await openSession(page, `${PA}/session?type=find-pattern&difficulty=easy&tf=1h&symbol=BTCUSDT`);
  await shot(page, 'pa-find-before');
  await tapCandle(page, 10);
  await expect(page.getByTestId('chart')).toHaveAttribute('data-mark-count', '1');
  await checkAndSeeResult(page);
  await expect(page.getByTestId('result-summary')).toBeVisible();
  await shot(page, 'pa-find-after');
});

test('PA «Контекст»: ответы, проверка, разбор, следующее, главная', async ({ page }) => {
  await openSession(page, `${PA}/session?type=context&difficulty=easy&tf=1h&symbol=BTCUSDT`);
  await shot(page, 'pa-context-before');
  await page.getByTestId('check-button').click();
  await expect(page.getByText('Ответьте на все вопросы и выберите, значима ли модель.').first()).toBeVisible();
  for (const id of ['sweep', 'ob', 'level', 'significant']) await page.getByTestId(`ctx-${id}`).getByRole('radio', { name: 'Нет' }).click();
  await page.getByTestId('ctx-trend').getByRole('radio', { name: 'Вверх' }).click();
  await page.getByRole('radio', { name: /Старший ТФ/ }).click();
  await expect(page.getByTestId('chart')).toHaveAttribute('data-ready', 'true');
  await checkAndSeeResult(page);
  await expect(page.getByTestId('context-detail')).toContainText('Эталон');
  await shot(page, 'pa-context-after');
  await nextThenHomeShowsDone(page, PA);
});
