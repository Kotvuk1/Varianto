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

/** Выбор инструмента: группа (рейка на десктопе, нижняя панель на мобильном) и инструмент в её списке. */
export async function selectTool(page: Page, tool: string, group?: string) {
  if (group) {
    await page.getByRole('button', { name: group, exact: true }).click();
    await page.getByRole('toolbar', { name: group }).getByRole('button', { name: tool, exact: true }).click();
  } else {
    await page.getByRole('button', { name: tool, exact: true }).click();
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

// ---- Поиск корректных мест разметки по реальным свечам графика (для e2e и скриншотов) ----
export interface RealCandle {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  closed: boolean;
}
type Pt = { x: number; y: number };

export async function chartCandles(page: Page): Promise<RealCandle[]> {
  return page.evaluate(() => (window as unknown as { __tlCandles: () => RealCandle[] }).__tlCandles());
}

export async function project(page: Page, time: number, price: number): Promise<Pt | null> {
  return page.evaluate(([t, p]) => (window as unknown as { __tlProject: (t: number, p: number) => Pt | null }).__tlProject(t!, p!), [time, price] as const);
}

/** Точка касания «тела» свечи (середина high-low) в координатах страницы. */
export async function candlePoint(page: Page, c: RealCandle): Promise<Pt | null> {
  return project(page, c.openTime, (c.high + c.low) / 2);
}

const inBox = (p: Pt | null, box: { x: number; y: number; width: number; height: number }): p is Pt =>
  p !== null && p.x > box.x + 12 && p.x < box.x + box.width - 70 && p.y > box.y + 20 && p.y < box.y + box.height - 60;

/** Подтверждённый swing-экстремум (окно +-3). */
export function pivotSide(cs: RealCandle[], p: number, side: 'high' | 'low'): boolean {
  if (p < 3 || p + 3 >= cs.length) return false;
  const v = cs[p]![side];
  for (let k = p - 3; k <= p + 3; k++) {
    if (k === p) continue;
    if (side === 'high' ? cs[k]!.high >= v : cs[k]!.low <= v) return false;
  }
  return true;
}

/** Реальный BOS: swing и первая свеча, ПРОБИВШАЯ уровень, чьё тело закрылось за ним. Обе свечи видимы. */
export async function findVisibleBos(page: Page, box: { x: number; y: number; width: number; height: number }) {
  const cs = await chartCandles(page);
  for (let p = cs.length - 12; p >= 3; p--) {
    for (const side of ['high', 'low'] as const) {
      if (!pivotSide(cs, p, side)) continue;
      const level = cs[p]![side];
      for (let j = p + 4; j < Math.min(cs.length, p + 40); j++) {
        const c = cs[j]!;
        const pierced = side === 'high' ? c.high > level : c.low < level;
        if (!pierced) continue;
        const closedBeyond = side === 'high' ? c.close > level : c.close < level;
        if (!closedBeyond || !c.closed) break;
        const a = await project(page, cs[p]!.openTime, level);
        const b = await candlePoint(page, c);
        if (inBox(a, box) && inBox(b, box) && Math.abs(b.x - a.x) > 16) return { swing: cs[p]!, side, level, breakCandle: c, swingPt: a, breakPt: b };
        break;
      }
    }
  }
  throw new Error('нет видимого реального BOS');
}

/** Реальный трёхсвечный разрыв: средняя свеча i, видимая. Для 'gap' берётся самый крупный видимый разрыв. */
export async function findVisibleFvg(page: Page, box: { x: number; y: number; width: number; height: number }, want: 'gap' | 'overlap') {
  const cs = await chartCandles(page);
  let best: { middle: RealCandle; gap: { dir: string; top: number; bottom: number } | null; pt: Pt; size: number } | null = null;
  for (let i = cs.length - 3; i >= 1; i--) {
    const a = cs[i - 1]!;
    const b = cs[i + 1]!;
    const gap = b.low > a.high ? { dir: 'bull', top: b.low, bottom: a.high } : b.high < a.low ? { dir: 'bear', top: a.low, bottom: b.high } : null;
    if ((want === 'gap') !== (gap !== null) || !b.closed) continue;
    const pt = await candlePoint(page, cs[i]!);
    if (!inBox(pt, box)) continue;
    const size = gap ? gap.top - gap.bottom : 0;
    if (want === 'overlap') return { middle: cs[i]!, gap, pt };
    if (!best || size > best.size) best = { middle: cs[i]!, gap, pt, size };
  }
  if (!best) throw new Error(`нет видимой тройки (${want})`);
  return best;
}
