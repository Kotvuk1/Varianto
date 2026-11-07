import { expect, test } from '@playwright/test';
import { chartBox, chartCandles, coreMarks, findVisibleBos, findVisibleFvg, isMobile, markPoints, openTerminal, project, selectTool, tapAt, tapsForAlgoMark } from './terminal.helpers';

// Реальные свечи: архив Binance (data.binance.vision) через /api/history, режим ?source=archive.
test.setTimeout(120_000);

// Скриншоты: SHOTS_DIR (по умолчанию - test-results рядом с отчётом Playwright).
const shot = (name: string) => `${process.env.SHOTS_DIR ?? '../test-results/shots'}/${name}-${test.info().project.name}.png`;

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
    await expect(page.getByTestId('check-button')).toBeVisible();
    await expect(page.getByTestId('check-button')).not.toHaveAttribute('aria-disabled', 'true');
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
    // 7 элементов (с группой «Фибо») + «Проверить» в одну строку без обрезки подписей
    const bar = page.getByRole('toolbar', { name: 'Инструменты разметки' });
    const buttons = bar.getByRole('button');
    await expect(buttons).toHaveCount(8);
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

test('«Проверить»: BOS на месте CHoCH ядра - разбор с BOS_CHOCH_CONFUSED, эталон поверх, «Скрыть эталон»', async ({ page }) => {
  const chart = await openTerminal(page);
  const box = await chartBox(chart);
  const check = page.getByTestId(isMobile(page) ? 'check-button-mobile' : 'check-button');

  // пустая разметка: подсказка вместо проверки
  await check.click();
  await expect(page.getByTestId('instruction-text')).toContainText('Нечего проверять');

  const algo = await coreMarks(page);
  let chosen: { pts: { x: number; y: number }[] } | null = null;
  for (const m of algo.filter((x) => x.kind === 'choch').reverse()) {
    const pts = await tapsForAlgoMark(page, m, box);
    if (pts) {
      chosen = { pts };
      break;
    }
  }
  expect(chosen, 'нет видимого CHoCH ядра').not.toBeNull();
  await selectTool(page, 'BOS', 'Пробои');
  for (const p of chosen!.pts) await tapAt(page, p);
  await expect(chart).toHaveAttribute('data-mark-count', '1');

  await check.click();
  const panel = page.getByTestId('check-panel');
  await expect(panel).toBeVisible();
  await expect(panel).toHaveAttribute('data-codes', /BOS_CHOCH_CONFUSED/);
  await expect(panel.getByTestId('check-verdict')).toContainText(/из \d+ ваших меток подтверждено/);
  for (const part of ['understood', 'mistakes', 'why', 'howto', 'principle']) await expect(panel.getByTestId(`fb-fb-${part}`)).toBeVisible();
  await expect(panel.getByTestId('grade-legend')).toBeVisible();
  await expect(panel).toContainText('Проверка в терминале не сохраняется');

  // эталон поверх графика (метки algo) и переключатель
  await expect.poll(async () => (await markPoints(page)).length, { timeout: 5000 }).toBeGreaterThan(1);
  await page.getByTestId('toggle-ref').click();
  await expect.poll(async () => (await markPoints(page)).length, { timeout: 5000 }).toBe(1);
});

// ---- Недоступность живого потока: сообщения по причине (реальные коды ответов через page.route) ----
const LIVE_URL = '/terminal?symbol=BTCUSDT&tf=1h';
const CORS = { 'access-control-allow-origin': '*' };

test('live: 451 от Binance - точное сообщение про регион/сеть, кнопка архива ведёт на ?source=archive с плашкой «не live»', async ({ page }) => {
  await page.route('**/fapi/v1/klines*', (r) =>
    r.fulfill({ status: 451, headers: CORS, contentType: 'application/json', body: JSON.stringify({ code: 0, msg: 'Service unavailable from a restricted location' }) }),
  );
  await page.goto(LIVE_URL);
  const err = page.getByTestId('chart-error');
  await expect(err).toBeVisible({ timeout: 30_000 });
  await expect(err).toContainText('Binance недоступен из вашего региона/сети (ограничение Binance). Попробуйте другую сеть или VPN.');
  await page.screenshot({ path: shot('terminal-451') });
  await page.getByTestId('archive-fallback').click();
  await expect(page).toHaveURL(/source=archive/);
  await expect(page.getByTestId('archive-strip')).toContainText('Архив, не live');
  await expect(page.getByTestId('chart')).toHaveAttribute('data-ready', 'true', { timeout: 60_000 });
  await expect.poll(async () => Number(await page.getByTestId('chart').getAttribute('data-candle-count')), { timeout: 60_000 }).toBeGreaterThan(0);
  await page.screenshot({ path: shot('terminal-archive-fallback') });
});

test('live: сетевая ошибка - прежний текст «Нет подключения к сети» и запасной вариант архива', async ({ page }) => {
  await page.route('**/fapi/v1/klines*', (r) => r.abort('connectionrefused'));
  await page.goto(LIVE_URL);
  const err = page.getByTestId('chart-error');
  await expect(err).toBeVisible({ timeout: 30_000 });
  await expect(err).toContainText('Нет подключения к сети');
  await expect(err).toContainText('Проверьте интернет');
  await expect(page.getByTestId('archive-fallback')).toBeVisible();
});

test('live: WS не открывается, REST работает - режим опроса с бейджем «обновление раз в 3 с»', async ({ page }) => {
  // реальные свечи архива -> тело ответа REST в формате klines (без выдумывания данных)
  await openTerminal(page);
  const cs = await page.evaluate(() => (window as unknown as { __tlCandles: () => { openTime: number; open: number; high: number; low: number; close: number; volume: number }[] }).__tlCandles());
  const step = 3_600_000;
  const rows = cs.slice(-600).map((c) => [c.openTime, String(c.open), String(c.high), String(c.low), String(c.close), String(c.volume), c.openTime + step - 1, '1', 1, '0', '0', '0']);
  await page.addInitScript(() => {
    // WebSocket до Binance недоступен (таймаут): сокет не открывается и не закрывается
    (window as unknown as { WebSocket: unknown }).WebSocket = class {
      onopen = null;
      onclose = null;
      onerror = null;
      onmessage = null;
      close() {}
    };
  });
  await page.route('**/fapi/v1/klines*', (r) => r.fulfill({ status: 200, headers: CORS, contentType: 'application/json', body: JSON.stringify(rows) }));
  await page.goto(LIVE_URL);
  await expect(page.getByTestId('chart')).toHaveAttribute('data-ready', 'true', { timeout: 60_000 });
  await expect(page.locator('text="Обновление раз в 3 с" >> visible=true')).toBeVisible({ timeout: 30_000 });
  await page.screenshot({ path: shot('terminal-polling') });
});

// ---- Подсветка свечи модели и focusMark ----
test('подсветка свечи модели: колонка + подпись над high в обеих темах; focusMark центрирует и гаснет через 1.2 с', async ({ page }) => {
  const chart = await openTerminal(page);
  const cs = await chartCandles(page);
  const c = cs[cs.length - 15]!;
  const ref = cs[cs.length - 16]!;
  for (const theme of ['dark', 'light'] as const) {
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    await page.evaluate(
      ([a, b]) => (window as unknown as { __tlSetHighlight: (x: unknown) => void }).__tlSetHighlight([{ time: a, tone: 'focus', label: 'Pin bar' }, { time: b, tone: 'ref' }]),
      [c.openTime, ref.openTime] as const,
    );
    await expect(chart).toHaveAttribute('data-highlight-count', '2');
    const pt = await project(page, c.openTime, (c.high + c.low) / 2);
    expect(pt).not.toBeNull();
    await page.waitForTimeout(300);
    await page.screenshot({ path: shot(`highlight-${theme}`) });
  }
  await page.evaluate(() => (window as unknown as { __tlSetHighlight: (x: unknown) => void }).__tlSetHighlight(null));
  await expect(chart).toHaveAttribute('data-highlight-count', '0');
});

test('focusMark: метка подсвечивается на 1.2 с (data-flash-id) и график центрируется на ней', async ({ page }) => {
  const chart = await openTerminal(page);
  const box = await chartBox(chart);
  const bos = await findVisibleBos(page, box);
  await selectTool(page, 'BOS', 'Пробои');
  await tapAt(page, bos.swingPt);
  await tapAt(page, bos.breakPt);
  await expect(chart).toHaveAttribute('data-mark-count', '1');
  await expect.poll(async () => (await markPoints(page)).length).toBeGreaterThan(0);
  const id = (await markPoints(page))[0]!.id;
  const t0 = Date.now();
  expect(await page.evaluate((i) => (window as unknown as { __tlFocusMark: (i: string) => boolean }).__tlFocusMark(i), id)).toBe(true);
  await expect(chart).toHaveAttribute('data-flash-id', id);
  await expect(chart).toHaveAttribute('data-flash-id', '', { timeout: 3000 });
  expect(Date.now() - t0).toBeGreaterThan(900);
});
