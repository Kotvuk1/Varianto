import { expect, test } from '@playwright/test';
import { DATE_LEAK, FIB_STORAGE, bodyText, drawFib, openFib, seeResult, shot, url } from './fib.helpers';

// Реальный сервер (next start): next/grade ходят в data.binance.vision. Моков данных нет.
test.use({ storageState: FIB_STORAGE });
test.setTimeout(300_000);

test.beforeEach(async ({ page }) => {
  // Индикатор Next в dev-режиме не нужен; в production-сборке его нет.
  await page.addInitScript(() => {
    const st = document.createElement('style');
    st.textContent = 'nextjs-portal{display:none!important}';
    document.addEventListener('DOMContentLoaded', () => document.head.appendChild(st));
  });
});

test('/learn/fibonacci: выбор типа, сложности, ТФ; «Начать» ведёт в сессию', async ({ page }) => {
  await page.goto('/learn/fibonacci');
  for (const t of ['Построй сетку', 'Где реакция?', 'Цель по Extension']) await expect(page.getByRole('radio', { name: new RegExp(t) })).toBeVisible();
  await page.getByRole('radio', { name: /Где реакция\?/ }).click();
  await page.getByTestId('setup-difficulty').getByRole('radio', { name: 'Средний' }).click();
  await page.getByTestId('setup-tf').getByRole('radio', { name: '4H' }).click();
  await expect(page.getByTestId('start-session')).toHaveAttribute('href', /type=reaction&difficulty=medium&tf=4h/);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});

test('главная: карточка модуля Fibonacci', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('stage-7').getByRole('link')).toHaveAttribute('href', '/learn/fibonacci');
});

test('«Построй сетку»: сетка по импульсу -> проверка -> эталон поверх и разбор', async ({ page }) => {
  await openFib(page, url('grid'));
  await expect(page.getByTestId('chart')).toHaveAttribute('data-mark-count', '0');
  await shot(page, 'grid-before');
  await drawFib(page, false);
  await page.getByTestId('check-button').click();
  await seeResult(page);
  // эталонная сетка нарисована поверх: разбор доступен, переключатель эталона есть
  await expect(page.getByTestId('toggle-ref')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
  await shot(page, 'grid-after');
  await page.getByTestId('next-task').click();
  await expect(page.getByTestId('result')).toHaveCount(0, { timeout: 90_000 });
});

test('«Где реакция?»: до решения нет дат -> уровень, конфлюэнс, PD -> проигрывание -> разбор с датой', async ({ page }) => {
  await openFib(page, url('reaction'));
  expect(await bodyText(page)).not.toMatch(DATE_LEAK);
  await expect(page.getByTestId('relative-axis')).toBeVisible();
  await shot(page, 'reaction-before');

  // «Принять» без уровня -> подсказка, без запроса
  await page.getByTestId('check-button').click();
  await expect(page.getByTestId('input-message')).toContainText('Выберите уровень');

  const first = page.locator('[data-testid^="level-"]:not([data-testid="level-deep"])').first();
  await first.click();
  await expect(first).toHaveAttribute('aria-checked', 'true');
  await page.getByTestId('conf-fvg').check();
  if (await page.getByTestId('pd-question').count()) await page.getByTestId('pd-discount').click();
  expect(await bodyText(page)).not.toMatch(DATE_LEAK);
  await page.getByTestId('check-button').click();

  // проигрывание: дата по-прежнему скрыта
  await expect(page.getByTestId('fib-replay')).toBeVisible({ timeout: 90_000 });
  expect(await bodyText(page)).not.toMatch(DATE_LEAK);
  await shot(page, 'reaction-replay');
  await page.getByTestId('replay-pause').click();
  await expect(page.getByTestId('replay-pause')).toContainText('Продолжить');
  await page.getByTestId('replay-pause').click();
  await page.getByRole('radio', { name: '×16' }).click();
  await page.getByTestId('replay-skip').click();

  await seeResult(page);
  await expect(page.getByTestId('fib-scenario-date')).toHaveText(/20(1[7-9]|2[0-6])/);
  await expect(page.getByTestId('fib-sum-choice')).toContainText('Ваш выбор');
  await shot(page, 'reaction-after');
});

test('«Цель по Extension»: A-B-C тремя касаниями + цель -> проигрывание -> разбор', async ({ page }) => {
  await openFib(page, url('extension'));
  expect(await bodyText(page)).not.toMatch(DATE_LEAK);
  await expect(page.getByTestId('relative-axis')).toBeVisible();
  await shot(page, 'extension-before');

  await page.getByTestId('check-button').click();
  await expect(page.getByTestId('input-message')).toContainText('Extension');

  await drawFib(page, true);
  await page.getByTestId('check-button').click();
  await expect(page.getByTestId('input-message')).toContainText('цель');
  await page.getByTestId('target-1.272').click();
  expect(await bodyText(page)).not.toMatch(DATE_LEAK);
  await page.getByTestId('check-button').click();

  await expect(page.getByTestId('fib-replay')).toBeVisible({ timeout: 90_000 });
  expect(await bodyText(page)).not.toMatch(DATE_LEAK);
  await page.getByRole('radio', { name: '×16' }).click();
  await page.getByTestId('replay-skip').click();

  await seeResult(page);
  await expect(page.getByTestId('fib-sum-target')).toContainText('Ваша цель');
  await expect(page.getByTestId('fib-scenario-date')).toHaveText(/20(1[7-9]|2[0-6])/);
  await shot(page, 'extension-after');
});

test('ошибки next: 404, 429, 502 показывают блок ошибки', async ({ page }) => {
  for (const [status, kind] of [[404, 'no-situation'], [429, 'rate-limited'], [502, 'archive']] as const) {
    await page.route('**/api/tasks/fibonacci/next', (r) => r.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ error: { code: 'x', details: { retryAfterSec: 7 } } }) }));
    await page.goto(url('grid'));
    await expect(page.getByTestId('task-error')).toHaveAttribute('data-kind', kind, { timeout: 30_000 });
    await page.unroute('**/api/tasks/fibonacci/next');
  }
});
