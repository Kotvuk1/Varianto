import { expect, type Page } from '@playwright/test';
import { chartBox, chartCandles, project, tapAt } from './terminal.helpers';

const PORT = Number(process.env.E2E_PORT ?? 3100);
/** Интро Fibonacci отключены (guide.spec проверяет интро отдельно). */
export const FIB_STORAGE = {
  cookies: [],
  origins: [{ origin: `http://localhost:${PORT}`, localStorage: ['fib-grid', 'fib-reaction', 'fib-extension'].map((k) => ({ name: `tl.intro.dismissed.${k}`, value: '1' })) }],
};

/** Абсолютная дата/год в тексте: год 2017-2026 вне цены, месяц словом, дд.мм.гггг. */
export const DATE_LEAK = /(?<![\d.,])20(1[7-9]|2[0-6])(?![\d]|[.,]\d)|\d{1,2}\.\d{2}\.\d{4}|\b\d{1,2}\s+(янв|фев|мар|апр|мая|июн|июл|авг|сен|окт|ноя|дек)/i;

export const url = (type: 'grid' | 'reaction' | 'extension', difficulty = 'easy', tf = '1h') =>
  `/learn/fibonacci/session?type=${type}&difficulty=${difficulty}&tf=${tf}`;

/** Куда сохранять скриншоты; без переменной скриншоты не делаются. */
export async function shot(page: Page, name: string) {
  const dir = process.env.FIB_SHOTS;
  if (!dir) return;
  const w = page.viewportSize()?.width ?? 0;
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${dir}/${w < 1024 ? 'mobile' : 'desktop'}-dark-${name}.png` });
}

export async function bodyText(page: Page) {
  return page.evaluate(() => document.body.innerText + '\n' + document.body.innerHTML.replace(/<canvas[^>]*>/g, ''));
}

export async function openFib(page: Page, path: string) {
  await page.goto(path);
  const chart = page.getByTestId('chart');
  await expect(chart).toHaveAttribute('data-ready', 'true', { timeout: 120_000 });
  await expect.poll(async () => Number(await chart.getAttribute('data-candle-count')), { timeout: 30_000 }).toBeGreaterThan(100);
  return chart;
}

type Pt = { x: number; y: number };

/** Точки A (low) -> B (high) -> C (low) по реальным видимым экстремумам; если не нашлись - доли области графика. */
export async function fibPoints(page: Page, withC: boolean): Promise<Pt[]> {
  const box = await chartBox(page.getByTestId('chart'));
  const cs = (await chartCandles(page)).filter((c) => c.closed);
  const inside = (p: Pt | null): p is Pt => p !== null && p.x > box.x + 16 && p.x < box.x + box.width - 90 && p.y > box.y + 30 && p.y < box.y + box.height - 70;
  const tail = cs.slice(-90);
  let bi = -1;
  for (let i = 0; i < tail.length - 3; i++) if (bi < 0 || tail[i]!.high >= tail[bi]!.high) bi = i;
  if (bi > 3) {
    const before = tail.slice(0, bi);
    const ai = before.reduce((m, c, i) => (c.low <= before[m]!.low ? i : m), 0);
    const a = await project(page, tail[ai]!.openTime, tail[ai]!.low);
    const b = await project(page, tail[bi]!.openTime, tail[bi]!.high);
    const after = tail.slice(bi + 1);
    const ci = after.length > 2 ? after.reduce((m, c, i) => (c.low <= after[m]!.low ? i : m), 0) : -1;
    const c = ci >= 0 ? await project(page, after[ci]!.openTime, after[ci]!.low) : null;
    if (inside(a) && inside(b) && (!withC || inside(c))) return withC ? [a, b, c as Pt] : [a, b];
  }
  const f = (fx: number, fy: number) => ({ x: box.x + box.width * fx, y: box.y + box.height * fy });
  return withC ? [f(0.35, 0.7), f(0.55, 0.3), f(0.7, 0.55)] : [f(0.35, 0.7), f(0.6, 0.3)];
}

export async function drawFib(page: Page, withC: boolean) {
  const chart = page.getByTestId('chart');
  for (const p of await fibPoints(page, withC)) await tapAt(page, p);
  await expect(chart).toHaveAttribute('data-mark-count', '1');
}

export async function seeResult(page: Page) {
  await expect(page.getByTestId('result')).toBeVisible({ timeout: 90_000 });
  await expect(page.getByTestId('feedback-view')).toBeVisible();
  await page.waitForTimeout(600);
}
