import { expect, test, type Page } from '@playwright/test';
import { chartBox, chartCandles, isMobile, markPoints, openTerminal, project, selectTool, tapAt, type RealCandle } from './terminal.helpers';

// Реальные свечи: архив Binance (data.binance.vision), ?source=archive. Точки A/B/C берутся из реальных
// swing-экстремумов (окно +-3) видимой области; сетка должна встать ровно на них (снап к high/low).
test.setTimeout(120_000);

const dir = process.env.SHOTS_DIR;
const THEME = process.env.SHOTS_THEME === 'light' ? 'light' : 'dark';
const shot = async (page: Page, name: string) => {
  if (!dir) return;
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${dir}/${test.info().project.name}-${THEME}-${name}.png` });
};

// Индикатор Next в dev-режиме перекрывает левый нижний угол (кнопка «Ластик»); в production-сборке его нет.
test.beforeEach(async ({ page }) => {
  if (THEME === 'light') {
    await page.goto('/settings');
    await page.getByRole('radio', { name: 'Светлая' }).click();
    await page.locator('html[data-theme="light"]').waitFor();
  }
  await page.addInitScript(() => {
    const st = document.createElement('style');
    st.textContent = 'nextjs-portal{display:none!important}';
    document.addEventListener('DOMContentLoaded', () => document.head.appendChild(st));
  });
});

type Pt = { x: number; y: number };
interface Fib {
  a: RealCandle & { pt: Pt };
  b: RealCandle & { pt: Pt };
  c?: RealCandle & { pt: Pt };
}

const pivot = (cs: RealCandle[], p: number, side: 'high' | 'low') => {
  if (p < 3 || p + 3 >= cs.length) return false;
  for (let k = p - 3; k <= p + 3; k++) if (k !== p && (side === 'high' ? cs[k]![side] >= cs[p]![side] : cs[k]![side] <= cs[p]![side])) return false;
  return true;
};

/** Видимые реальные экстремумы: low-pivot A, затем high-pivot B (выше A), затем low-pivot C между A и B по цене. */
async function findFib(page: Page, box: { x: number; y: number; width: number; height: number }, withC: boolean): Promise<Fib> {
  // реальные данные меняются со временем: если импульса с запасом нет, ослабляем минимальные расстояния между точками
  for (const k of [1, 0.6, 0.4]) {
    const f = await findFibScaled(page, box, withC, k);
    if (f) return f;
  }
  throw new Error('нет видимого импульса из реальных swing-экстремумов');
}

async function findFibScaled(page: Page, box: { x: number; y: number; width: number; height: number }, withC: boolean, scale: number): Promise<Fib | null> {
  const cs = (await chartCandles(page)).filter((c) => c.closed);
  const vis = async (c: RealCandle, side: 'high' | 'low') => {
    const pt = await project(page, c.openTime, c[side]);
    return pt && pt.x > box.x + 16 && pt.x < box.x + box.width - 90 && pt.y > box.y + 30 && pt.y < box.y + box.height - 70 ? { ...c, pt } : null;
  };
  const gx = (box.width < 600 ? 20 : 60) * scale; // на узком экране импульсы плотнее
  const gy = (box.width < 600 ? 50 : 120) * scale;
  let best: Fib | null = null;
  let bestSize = 0;
  for (let i = cs.length - 1; i >= 3; i--) {
    if (!pivot(cs, i, 'low')) continue;
    const a = await vis(cs[i]!, 'low');
    if (!a) continue;
    for (let j = i + 6; j < cs.length - 3 && j < i + 60; j++) {
      if (!pivot(cs, j, 'high') || cs[j]!.high <= cs[i]!.low) continue;
      const b = await vis(cs[j]!, 'high');
      if (!b || b.pt.x - a.pt.x < gx || a.pt.y - b.pt.y < gy) continue;
      if (!withC) {
        if (a.pt.y - b.pt.y > bestSize) { best = { a, b }; bestSize = a.pt.y - b.pt.y; }
        continue;
      }
      for (let k = j + 6; k < cs.length - 3 && k < j + 40; k++) {
        if (!pivot(cs, k, 'low') || cs[k]!.low <= cs[i]!.low || cs[k]!.low >= cs[j]!.high) continue;
        const c = await vis(cs[k]!, 'low');
        if (c && c.pt.x - b.pt.x >= gx && c.pt.y - b.pt.y >= 30 && a.pt.y - b.pt.y > bestSize) { best = { a, b, c }; bestSize = a.pt.y - b.pt.y; }
      }
    }
  }
  return best;
}

async function openFibTool(page: Page, tool: 'Фибо: коррекция' | 'Фибо: расширение') {
  await selectTool(page, tool, 'Фибо');
}

test('Фибо-коррекция двумя касаниями: сетка по экстремумам A и B, подписи, перезагрузка сохраняет', async ({ page }) => {
  const chart = await openTerminal(page);
  const box = await chartBox(chart);
  const f = await findFib(page, box, false);
  await openFibTool(page, 'Фибо: коррекция');
  const bar = page.getByTestId('instruction-bar');
  await expect(bar).toContainText('Инструмент: Фибо: коррекция');
  await expect(bar).toContainText('нажмите на начало импульса (A)');

  // касание рядом с экстремумом (смещение по цене и времени внутри радиуса снапа)
  const fresh = async (c: RealCandle, side: 'high' | 'low') => (await project(page, c.openTime, c[side]))!; // график сдвигается при смене строки-инструкции
  const pa0 = await fresh(f.a, 'low');
  await tapAt(page, { x: pa0.x + 2, y: pa0.y - 4 });
  await expect(chart).toHaveAttribute('data-mark-count', '0');
  await expect(bar).toContainText('конец импульса (B)');
  const pb0 = await fresh(f.b, 'high');
  await tapAt(page, { x: pb0.x - 2, y: pb0.y + 4 });
  await expect(chart).toHaveAttribute('data-mark-count', '1');

  // центр метки = середина между A и B (ручки стоят ровно на экстремумах)
  await expect.poll(async () => (await markPoints(page)).length).toBe(1); // центры метки обновляются после отрисовки
  const [m] = await markPoints(page);
  const [pa1, pb1] = [await fresh(f.a, 'low'), await fresh(f.b, 'high')];
  expect(m!.x).toBeCloseTo((pa1.x + pb1.x) / 2, -1);
  expect(m!.y).toBeCloseTo((pa1.y + pb1.y) / 2, -1);
  await selectTool(page, 'Выбор');
  await shot(page, 'fib-retracement');

  await page.getByRole('button', { name: /^Разметка \(1\)$/ }).and(page.locator(':visible')).click();
  await expect(page.getByTestId('marks-list')).toContainText('Фибо: коррекция вверх');
  await page.keyboard.press('Escape');

  await page.waitForTimeout(500); // запись в IndexedDB
  await openTerminal(page);
  await expect(page.getByTestId('chart')).toHaveAttribute('data-mark-count', '1');
  await expect.poll(async () => (await markPoints(page)).length, { timeout: 10_000 }).toBe(1);
  const [m2] = await markPoints(page);
  const [pa2, pb2] = [await fresh(f.a, 'low'), await fresh(f.b, 'high')];
  expect(m2!.x).toBeCloseTo((pa2.x + pb2.x) / 2, -1);
  await shot(page, 'fib-retracement-reload');

  // ластик: касание по линии уровня удаляет сетку
  await selectTool(page, 'Ластик');
  const mid = await project(page, f.a.openTime + 0, (f.a.low + f.b.high) / 2);
  await tapAt(page, { x: Math.min(box.x + box.width - 100, pb2.x + 40), y: mid!.y });
  await expect(page.getByTestId('chart')).toHaveAttribute('data-mark-count', '0');
});

test('Фибо-расширение тремя касаниями: A, B, C, шаги в строке-инструкции', async ({ page }) => {
  const chart = await openTerminal(page);
  const box = await chartBox(chart);
  const f = await findFib(page, box, true);
  await openFibTool(page, 'Фибо: расширение');
  const bar = page.getByTestId('instruction-bar');
  await expect(bar).toContainText('3) на конец коррекции (C)');
  // строка-инструкция меняет высоту между шагами и сдвигает график: координаты берём заново перед каждым касанием
  const fresh = async (c: RealCandle, side: 'high' | 'low') => (await project(page, c.openTime, c[side]))!;
  await tapAt(page, await fresh(f.a, 'low'));
  await tapAt(page, await fresh(f.b, 'high'));
  await expect(chart).toHaveAttribute('data-mark-count', '0');
  await expect(bar).toContainText('(C)');
  await tapAt(page, await fresh(f.c!, 'low'));
  await expect(chart).toHaveAttribute('data-mark-count', '1');
  await expect.poll(async () => (await markPoints(page)).length).toBe(1); // центры метки обновляются после отрисовки
  const [m] = await markPoints(page);
  const [pa, pb, pc] = [await fresh(f.a, 'low'), await fresh(f.b, 'high'), await fresh(f.c!, 'low')];
  expect(m!.x).toBeCloseTo((pa.x + pb.x + pc.x) / 3, -1);
  await selectTool(page, 'Выбор');
  await shot(page, 'fib-extension');

  await page.waitForTimeout(500);
  await openTerminal(page);
  await expect(page.getByTestId('chart')).toHaveAttribute('data-mark-count', '1');
});

test('горячая клавиша G выбирает Фибо (десктоп); группа «Фибо» видна в палитре', async ({ page }) => {
  await openTerminal(page);
  await expect(page.getByRole('button', { name: 'Фибо', exact: true }).and(page.locator(':visible'))).toBeVisible();
  test.skip(isMobile(page), 'клавиатура - десктоп');
  await page.keyboard.press('g');
  await expect(page.getByTestId('instruction-bar')).toContainText('Инструмент: Фибо: коррекция');
});
