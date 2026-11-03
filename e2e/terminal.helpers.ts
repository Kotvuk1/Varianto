import { expect, type Locator, type Page } from '@playwright/test';

export const TERMINAL_URL = '/terminal?source=archive&symbol=BTCUSDT&tf=1h';

export const isMobile = (page: Page) => (page.viewportSize()?.width ?? 0) < 1024;

export async function openTerminal(page: Page, url = TERMINAL_URL) {
  await page.goto(url);
  const chart = page.getByTestId('chart');
  await expect(chart).toHaveAttribute('data-ready', 'true', { timeout: 60_000 });
  await expect.poll(async () => Number(await chart.getAttribute('data-candle-count')), { timeout: 60_000 }).toBeGreaterThan(0);
  return chart;
}

/** Выбор инструмента: на мобильном через группу «веером», на десктопе - рейка. */
export async function selectTool(page: Page, tool: string, group?: string) {
  if (isMobile(page) && group) {
    await page.getByRole('button', { name: group, exact: true }).click();
    await page.getByRole('toolbar', { name: group }).getByRole('button', { name: tool, exact: true }).click();
  } else {
    await page.getByRole('button', { name: new RegExp(`^${tool}( \\(.\\))?$`) }).click();
  }
}

export async function chartBox(chart: Locator) {
  const b = await chart.boundingBox();
  if (!b) throw new Error('нет области графика');
  return b;
}

/** Метка по двум точкам: мобильный - два касания, десктоп - протяжка мышью. */
export async function drawTwoPoint(page: Page, a: { x: number; y: number }, b: { x: number; y: number }) {
  if (isMobile(page)) {
    await page.touchscreen.tap(a.x, a.y);
    await page.touchscreen.tap(b.x, b.y);
  } else {
    await page.mouse.move(a.x, a.y);
    await page.mouse.down();
    await page.mouse.move((a.x + b.x) / 2, (a.y + b.y) / 2, { steps: 4 });
    await page.mouse.move(b.x, b.y, { steps: 4 });
    await page.mouse.up();
  }
}

export async function tapAt(page: Page, p: { x: number; y: number }) {
  if (isMobile(page)) await page.touchscreen.tap(p.x, p.y);
  else await page.mouse.click(p.x, p.y);
}

export async function markPoints(page: Page): Promise<{ id: string; x: number; y: number }[]> {
  return page.evaluate(() => (window as unknown as { __tlMarkPoints?: () => { id: string; x: number; y: number }[] }).__tlMarkPoints?.() ?? []);
}
