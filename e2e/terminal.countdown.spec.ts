import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { openTerminal } from './terminal.helpers';
import { startSession } from './challenge.helpers';

// Таймер до закрытия свечи. Свечи - записанный ответ Binance REST (fixtures/recorded), время - page.clock.
test.setTimeout(120_000);

const REST_1H = JSON.parse(readFileSync(join(__dirname, '../fixtures/recorded/rest-klines-BTCUSDT-1h-2026-10-20.json'), 'utf8')) as unknown[][];
const LAST = REST_1H[REST_1H.length - 1]!;
const OPEN = LAST[0] as number; // 2026-10-20 23:00 UTC: свеча 1h, закрытие через 60 мин
const T0 = OPEN + 20 * 60_000; // «сейчас»: 20 минут от открытия, до закрытия 40:00
const CORS = { 'access-control-allow-origin': '*' };
const LIVE = '/terminal?symbol=BTCUSDT&tf=1h';
const timer = (page: Page) => page.getByTestId('candle-countdown');
const shot = (page: Page, name: string) =>
  process.env.SHOTS_DIR ? page.screenshot({ path: `${process.env.SHOTS_DIR}/${name}-${test.info().project.name}-dark.png` }) : Promise.resolve(undefined);

async function mockLive(page: Page, serverAheadMs: number | null) {
  await page.route('**/fapi/v1/klines*', (r) => r.fulfill({ status: 200, headers: CORS, contentType: 'application/json', body: JSON.stringify(REST_1H) }));
  await page.routeWebSocket(/fstream\.binance\.com/, (ws) => {
    if (serverAheadMs === null) return;
    // формат записанного ws-kline (fixtures/recorded/ws-kline-*), поля свечи - из последней записанной 1h-строки REST
    const [t, o, h, l, c, v, T] = LAST as [number, string, string, string, string, string, number];
    ws.send(JSON.stringify({ e: 'kline', E: T0 + serverAheadMs, s: 'BTCUSDT', k: { t, T, s: 'BTCUSDT', i: '1h', o, c, h, l, v, n: 1, x: false, q: '0', V: '0', Q: '0', B: '0' } }));
  });
}

test('live: таймер под ценой виден, идёт вниз; формат mm:ss; 00:00 не уходит в минус', async ({ page }) => {
  await mockLive(page, null);
  await page.clock.install({ time: T0 });
  await page.goto(LIVE);
  await expect(page.getByTestId('chart')).toHaveAttribute('data-ready', 'true', { timeout: 60_000 });
  await expect(timer(page)).toBeVisible({ timeout: 30_000 });
  await page.clock.pauseAt(T0 + 60_000);
  await page.clock.runFor(1000);
  await expect(timer(page)).toHaveText('38:59');
  await page.clock.runFor(5000);
  await expect(timer(page)).toHaveText('38:54');
  await expect(timer(page)).toHaveAttribute('aria-label', 'До закрытия свечи');
  expect(await timer(page).evaluate((el) => getComputedStyle(el).fontSize)).toBe('11px');
  await shot(page, 'live-timer');
  // до конца свечи: показывает 00:00, не отрицательное
  await page.clock.runFor(38 * 60_000 + 54_000 + 3000);
  await expect(timer(page)).toHaveText('00:00');
});

test('live: поправка на часы - WS E опережает устройство на 60 с', async ({ page }) => {
  await mockLive(page, 60_000);
  await page.clock.setFixedTime(T0);
  await page.goto(LIVE);
  await expect(page.getByTestId('chart')).toHaveAttribute('data-ready', 'true', { timeout: 60_000 });
  await expect(timer(page)).toHaveText('39:00', { timeout: 30_000 });
});

test('архив: таймера нет', async ({ page }) => {
  await openTerminal(page);
  await page.waitForTimeout(1500);
  await expect(timer(page)).toHaveCount(0);
});

test('задание Challenge: таймера нет', async ({ page }) => {
  await startSession(page);
  await expect(timer(page)).toHaveCount(0);
});
