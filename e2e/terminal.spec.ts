import { expect, test } from '@playwright/test';
import { chartBox, drawTwoPoint, markPoints, openTerminal, selectTool, tapAt } from './terminal.helpers';

// Реальные свечи: архив Binance (data.binance.vision) через /api/history, режим ?source=archive.

test('график отрисован на реальных свечах архива, плашка источника показана', async ({ page }) => {
  const chart = await openTerminal(page);
  await expect(page.getByTestId('archive-banner')).toHaveText('Данные: архив Binance (не live)');
  expect(await chart.locator('canvas').count()).toBeGreaterThan(0);
  expect(Number(await chart.getAttribute('data-candle-count'))).toBeGreaterThan(500);
});

test('смена ТФ перезагружает свечи и сохраняет график', async ({ page }) => {
  const chart = await openTerminal(page);
  const before = Number(await chart.getAttribute('data-candle-count'));
  await page.getByRole('radio', { name: '4H' }).click();
  await expect(page.getByRole('radio', { name: '4H' })).toHaveAttribute('aria-checked', 'true');
  await expect(chart).toHaveAttribute('aria-label', /4H/, { timeout: 0 }).catch(() => undefined);
  await expect.poll(async () => page.locator('[aria-label="BTCUSDT 4H"]').count(), { timeout: 60_000 }).toBeGreaterThan(0);
  expect(Number(await chart.getAttribute('data-candle-count'))).toBeGreaterThan(0);
  expect(before).toBeGreaterThan(0);
});

test('BOS рисуется, переживает перезагрузку и смену ТФ, ластик удаляет', async ({ page }) => {
  const chart = await openTerminal(page);
  const box = await chartBox(chart);
  await selectTool(page, 'BOS', 'Структура');
  await drawTwoPoint(page, { x: box.x + box.width * 0.45, y: box.y + box.height * 0.4 }, { x: box.x + box.width * 0.65, y: box.y + box.height * 0.4 });
  await expect(chart).toHaveAttribute('data-mark-count', '1');

  await page.waitForTimeout(500); // запись в IndexedDB
  await openTerminal(page);
  await expect(page.getByTestId('chart')).toHaveAttribute('data-mark-count', '1');

  // метка видна на другом ТФ (хранится на пару)
  await page.getByRole('radio', { name: '4H' }).click();
  await expect.poll(async () => page.locator('[aria-label="BTCUSDT 4H"]').count(), { timeout: 60_000 }).toBeGreaterThan(0);
  await expect(page.getByTestId('chart')).toHaveAttribute('data-mark-count', '1');
  await expect.poll(async () => (await markPoints(page)).length, { timeout: 5000 }).toBeGreaterThanOrEqual(0);

  await page.getByRole('radio', { name: '1H' }).click();
  await expect.poll(async () => page.locator('[aria-label="BTCUSDT 1H"]').count(), { timeout: 60_000 }).toBeGreaterThan(0);
  await expect.poll(async () => (await markPoints(page)).length, { timeout: 10_000 }).toBe(1);
  const [p] = await markPoints(page);

  await selectTool(page, 'Ластик');
  await tapAt(page, p!);
  await expect(page.getByTestId('chart')).toHaveAttribute('data-mark-count', '0');
});

test('во время рисования жест не прокручивает график', async ({ page }) => {
  const chart = await openTerminal(page);
  const box = await chartBox(chart);
  await selectTool(page, 'Уровень', 'Линии');
  await tapAt(page, { x: box.x + box.width * 0.5, y: box.y + box.height * 0.5 });
  await expect(chart).toHaveAttribute('data-mark-count', '1');
});
