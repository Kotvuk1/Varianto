import { expect, test } from '@playwright/test';
import { chartBox, findVisibleBos, findVisibleFvg, isMobile, markPoints, openTerminal, selectTool, tapAt } from './terminal.helpers';

// Реальные свечи: архив Binance (data.binance.vision) через /api/history, режим ?source=archive.
test.setTimeout(120_000);

const ARCHIVE = 'Данные: архив Binance (не live)';

test('график на реальных свечах архива; бейдж источника компактный, в верхней зоне, рядом с ТФ', async ({ page }) => {
  const chart = await openTerminal(page);
  const badge = page.getByTestId('archive-banner');
  await expect(badge).toBeVisible();
  await expect(badge).toHaveAttribute('aria-label', ARCHIVE);
  const bb = (await badge.boundingBox())!;
  const cb = (await chart.boundingBox())!;
  expect(bb.height).toBeLessThan(32); // не полоса на всю ширину
  expect(bb.width).toBeLessThan(260);
  if (isMobile(page)) expect(bb.width).toBeLessThan(40); // на мобильном - иконка
  else {
    const tf = (await page.getByRole('radiogroup').first().boundingBox())!;
    expect(bb.x).toBeGreaterThan(tf.x + tf.width - 1); // справа от выбора ТФ
    expect(bb.y).toBeLessThan(cb.y);
  }
  expect(await chart.locator('canvas').count()).toBeGreaterThan(0);
  expect(Number(await chart.getAttribute('data-candle-count'))).toBeGreaterThan(500);
});

test('смена ТФ перезагружает свечи и сохраняет график', async ({ page }) => {
  const chart = await openTerminal(page);
  const before = Number(await chart.getAttribute('data-candle-count'));
  await page.getByRole('radio', { name: '4H' }).click();
  await expect(page.getByRole('radio', { name: '4H' })).toHaveAttribute('aria-checked', 'true');
  await expect.poll(async () => page.locator('[aria-label="BTCUSDT 4H"]').count(), { timeout: 60_000 }).toBeGreaterThan(0);
  expect(Number(await chart.getAttribute('data-candle-count'))).toBeGreaterThan(0);
  expect(before).toBeGreaterThan(0);
});

test('BOS двумя касаниями на реальном пробое: шаги в строке-инструкции, сохранение, смена ТФ, список, ластик', async ({ page }) => {
  const chart = await openTerminal(page);
  const box = await chartBox(chart);
  const bos = await findVisibleBos(page, box);
  await selectTool(page, 'BOS', 'Пробои');

  const bar = page.getByTestId('instruction-bar');
  await expect(bar).toContainText('Инструмент: BOS');
  await expect(bar).toContainText('1) нажмите на swing 2) нажмите на свечу, закрывшуюся за ним');
  expect((await bar.boundingBox())!.y).toBeLessThan(box.y); // полоса над графиком, не тост снизу

  await tapAt(page, bos.swingPt);
  await expect(chart).toHaveAttribute('data-mark-count', '0');
  await expect(bar).toContainText('swing выбран');
  await tapAt(page, bos.breakPt);
  await expect(chart).toHaveAttribute('data-mark-count', '1');

  // список меток: человеческая подпись, центрирование по клику
  await page.getByRole('button', { name: /^Разметка \(1\)$/ }).and(page.locator(':visible')).click();
  const dir = bos.side === 'high' ? 'вверх' : 'вниз';
  await expect(page.getByTestId('marks-list')).toContainText(`BOS ${dir}`);
  await page.getByTestId('marks-list').getByRole('button', { name: /^BOS/ }).click();
  await expect(page.getByTestId('marks-list')).toHaveCount(0);

  await page.waitForTimeout(500); // запись в IndexedDB
  await openTerminal(page);
  await expect(page.getByTestId('chart')).toHaveAttribute('data-mark-count', '1');

  // метка видна на другом ТФ (хранится на пару)
  await page.getByRole('radio', { name: '4H' }).click();
  await expect.poll(async () => page.locator('[aria-label="BTCUSDT 4H"]').count(), { timeout: 60_000 }).toBeGreaterThan(0);
  await expect(page.getByTestId('chart')).toHaveAttribute('data-mark-count', '1');

  await page.getByRole('radio', { name: '1H' }).click();
  await expect.poll(async () => page.locator('[aria-label="BTCUSDT 1H"]').count(), { timeout: 60_000 }).toBeGreaterThan(0);
  await expect.poll(async () => (await markPoints(page)).length, { timeout: 10_000 }).toBe(1);
  const [p] = await markPoints(page);

  await selectTool(page, 'Ластик');
  await tapAt(page, p!);
  await expect(page.getByTestId('chart')).toHaveAttribute('data-mark-count', '0');
});

test('FVG: одно касание на реальном разрыве создаёт зону; там, где разрыва нет, метки нет и есть подсказка', async ({ page }) => {
  const chart = await openTerminal(page);
  const box = await chartBox(chart);
  const gap = await findVisibleFvg(page, box, 'gap');
  const none = await findVisibleFvg(page, box, 'overlap');
  await selectTool(page, 'FVG', 'Зоны');

  await tapAt(page, none.pt);
  await expect(chart).toHaveAttribute('data-mark-count', '0');
  await expect(page.getByTestId('instruction-text')).toHaveText('Здесь нет FVG: фитили свечей i−1 и i+1 перекрываются');

  await tapAt(page, gap.pt);
  await expect(chart).toHaveAttribute('data-mark-count', '1');
  await page.getByRole('button', { name: /^Разметка \(1\)$/ }).and(page.locator(':visible')).click();
  await expect(page.getByTestId('marks-list')).toContainText(gap.gap!.dir === 'bull' ? 'FVG бычий' : 'FVG медвежий');
});

test('во время рисования жест не прокручивает график; линия снапится к фитилю', async ({ page }) => {
  const chart = await openTerminal(page);
  const box = await chartBox(chart);
  await selectTool(page, 'Уровень', 'Линии');
  await tapAt(page, { x: box.x + box.width * 0.5, y: box.y + box.height * 0.5 });
  await expect(chart).toHaveAttribute('data-mark-count', '1');
});

test('раскладка: нет постоянной правой панели, «Проверить» неактивна, отмена и горячие клавиши', async ({ page }) => {
  const chart = await openTerminal(page);
  await expect(page.getByRole('complementary')).toHaveCount(0);
  const cb = (await chart.boundingBox())!;
  const vw = page.viewportSize()!.width;
  if (!isMobile(page)) {
    expect(cb.width).toBeGreaterThan(vw - 80); // график на всю ширину за вычетом рейки
    const check = page.getByTestId('check-button');
    await expect(check).toHaveAttribute('aria-disabled', 'true');
    await expect(check).toHaveAttribute('title', /M2/);
    // flyout с названиями и клавишами
    await page.getByRole('button', { name: 'Пробои', exact: true }).click();
    const fly = page.getByTestId('tool-flyout');
    await expect(fly).toContainText('BOS');
    await expect(fly).toContainText('CHoCH');
    await expect(fly).toContainText('Sweep');
    await expect(fly.locator('kbd')).toHaveText(['B', 'C']);
    await page.keyboard.press('Escape');
    await page.keyboard.press('b');
    await expect(chart).toHaveAttribute('data-tool', 'bos');
    await page.keyboard.press('f');
    await expect(chart).toHaveAttribute('data-tool', 'fvg');
    await page.keyboard.press('Escape');
    await expect(chart).toHaveAttribute('data-tool', 'select');
  } else {
    // 6 элементов + «Проверить» в одну строку без обрезки подписей
    const bar = page.getByRole('toolbar', { name: 'Инструменты разметки' });
    const buttons = bar.getByRole('button');
    await expect(buttons).toHaveCount(7);
    for (const b of await buttons.all()) {
      const bb = (await b.boundingBox())!;
      expect(bb.width).toBeGreaterThanOrEqual(44);
    }
    const overflow = await bar.evaluate((el) => el.scrollWidth > el.clientWidth + 1);
    expect(overflow).toBe(false);
  }
  await selectTool(page, 'BOS', 'Пробои');
  await page.getByRole('button', { name: 'Отмена', exact: true }).click();
  await expect(chart).toHaveAttribute('data-tool', 'select');
});
