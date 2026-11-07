import { expect, test, type Page } from '@playwright/test';
import { chartBox, chartCandles, markPoints, openTerminal, pivotSide, project, selectTool, tapAt, type RealCandle } from './terminal.helpers';

// Реальные свечи: архив Binance (data.binance.vision), ?source=archive. Края зоны берутся у реальных swing-экстремумов.
test.setTimeout(180_000);

const dir = process.env.SHOTS_DIR;
const shot = async (page: Page, name: string) => {
  if (!dir) return;
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${dir}/${test.info().project.name}-dark-${name}.png` });
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const st = document.createElement('style');
    st.textContent = 'nextjs-portal{display:none!important}';
    document.addEventListener('DOMContentLoaded', () => document.head.appendChild(st));
  });
});

type Box = { x: number; y: number; width: number; height: number };

/** Видимые реальные экстремумы: swing high, затем правее swing low ниже него не менее чем на 40 px. */
async function findEdges(page: Page, box: Box): Promise<{ hi: RealCandle; lo: RealCandle }> {
  const cs = (await chartCandles(page)).filter((c) => c.closed);
  const vis = async (c: RealCandle, side: 'high' | 'low') => {
    const pt = await project(page, c.openTime, c[side]);
    return pt && pt.x > box.x + 24 && pt.x < box.x + box.width - 90 && pt.y > box.y + 40 && pt.y < box.y + box.height - 80 ? pt : null;
  };
  for (let i = cs.length - 8; i >= 3; i--) {
    if (!pivotSide(cs, i, 'high')) continue;
    const a = await vis(cs[i]!, 'high');
    if (!a) continue;
    for (let j = i + 4; j < Math.min(cs.length - 3, i + 30); j++) {
      if (!pivotSide(cs, j, 'low')) continue;
      const b = await vis(cs[j]!, 'low');
      if (b && b.y - a.y >= 40) return { hi: cs[i]!, lo: cs[j]! };
    }
  }
  throw new Error('нет видимой пары swing high / swing low');
}

test('зона двумя касаниями: края по экстремумам, подпись, сохраняется после перезагрузки', async ({ page }) => {
  const chart = await openTerminal(page);
  const box = await chartBox(chart);
  const e = await findEdges(page, box);
  await selectTool(page, 'Зона', 'Уровни');
  const bar = page.getByTestId('instruction-bar');
  await expect(bar).toContainText('Инструмент: Зона');

  const fresh = async (c: RealCandle, side: 'high' | 'low') => (await project(page, c.openTime, c[side]))!; // строка-инструкция сдвигает график
  const p1 = await fresh(e.hi, 'high');
  await tapAt(page, { x: p1.x + 2, y: p1.y + 5 });
  await expect(chart).toHaveAttribute('data-mark-count', '0');
  await expect(bar).toContainText('второй край');
  const p2 = await fresh(e.lo, 'low');
  await tapAt(page, { x: p2.x, y: p2.y - 5 });
  await expect(chart).toHaveAttribute('data-mark-count', '1');

  await selectTool(page, 'Выбор');
  await expect.poll(async () => (await markPoints(page)).length).toBe(1);
  await shot(page, 'zone');

  await page.getByRole('button', { name: /^Разметка \(1\)$/ }).and(page.locator(':visible')).click();
  await expect(page.getByTestId('marks-list')).toContainText('Зона');
  await page.keyboard.press('Escape');

  await page.waitForTimeout(600); // запись в IndexedDB
  await openTerminal(page);
  await expect(page.getByTestId('chart')).toHaveAttribute('data-mark-count', '1');
  await expect.poll(async () => (await markPoints(page)).length, { timeout: 10_000 }).toBe(1);
  await shot(page, 'zone-reload');
});

test('лимитный ордер: плашка Limit BUY/SELL, перетаскивание меняет цену', async ({ page }) => {
  const chart = await openTerminal(page);
  const box = await chartBox(chart);
  await selectTool(page, 'Лимитка', 'Уровни');
  const cs = (await chartCandles(page)).filter((c) => c.closed);
  const last = cs[cs.length - 1]!;
  const at = (await project(page, last.openTime, last.close * 0.995))!;
  await tapAt(page, { x: Math.min(at.x, box.x + box.width - 160), y: at.y });
  await expect(chart).toHaveAttribute('data-mark-count', '1');
  await selectTool(page, 'Выбор');
  await expect.poll(async () => (await markPoints(page)).length).toBe(1);
  const [m0] = await markPoints(page);

  const text0 = await page.getByTestId('instruction-text').innerText();
  await tapAt(page, { x: m0!.x, y: m0!.y });
  await expect(page.getByTestId('instruction-text')).toContainText('Лимитка BUY');
  const sel = await page.getByTestId('instruction-text').innerText();
  expect(sel).not.toBe(text0);
  await shot(page, 'limit');

  // перетаскивание вверх на 50 px: цена растёт
  const [m1] = await markPoints(page);
  await page.mouse.move(m1!.x, m1!.y);
  await page.mouse.down();
  await page.mouse.move(m1!.x, m1!.y - 25, { steps: 4 });
  await page.mouse.move(m1!.x, m1!.y - 50, { steps: 4 });
  await page.mouse.up();
  await expect.poll(async () => (await markPoints(page))[0]?.y ?? 0).toBeLessThan(m1!.y - 30);
  await expect(chart).toHaveAttribute('data-mark-count', '1'); // лимитка одна
  expect(await page.getByTestId('instruction-text').innerText()).not.toBe(sel);
  await shot(page, 'limit-dragged');
});
