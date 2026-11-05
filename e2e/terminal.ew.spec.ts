import { expect, test, type Page } from '@playwright/test';
import { chartBox, chartCandles, isMobile, markPoints, openTerminal, project, selectTool, tapAt, type RealCandle } from './terminal.helpers';

// Реальные свечи: архив Binance (data.binance.vision), ?source=archive. Точки волн - реальные swing-экстремумы (окно +-3)
// видимой области, чередующиеся low/high; метка должна встать ровно на них.
test.setTimeout(120_000);

const dir = process.env.SHOTS_DIR;
const THEME = process.env.SHOTS_THEME === 'light' ? 'light' : 'dark';
const shot = async (page: Page, name: string) => {
  if (!dir) return;
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${dir}/${test.info().project.name}-${THEME}-${name}.png` });
};

// Индикатор Next в dev-режиме перекрывает левый нижний угол; в production-сборке его нет.
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
interface P {
  c: RealCandle;
  side: 'high' | 'low';
  pt: Pt;
}
const isPivot = (cs: RealCandle[], p: number, side: 'high' | 'low') => {
  if (p < 3 || p + 3 >= cs.length) return false;
  for (let k = p - 3; k <= p + 3; k++) if (k !== p && (side === 'high' ? cs[k]!.high >= cs[p]!.high : cs[k]!.low <= cs[p]!.low)) return false;
  return true;
};

/** Чередующиеся видимые pivot'ы слева направо (подряд идущие одной стороны - остаётся более экстремальный). */
async function alternating(page: Page, box: { x: number; y: number; width: number; height: number }): Promise<P[]> {
  const cs = (await chartCandles(page)).filter((c) => c.closed);
  const seq: P[] = [];
  for (let i = 3; i < cs.length - 3; i++) {
    for (const side of ['high', 'low'] as const) {
      if (!isPivot(cs, i, side)) continue;
      const pt = await project(page, cs[i]!.openTime, cs[i]![side]);
      if (!pt || pt.x < box.x + 16 || pt.x > box.x + box.width - 90 || pt.y < box.y + 30 || pt.y > box.y + box.height - 70) continue;
      const last = seq[seq.length - 1];
      if (last && last.side === side) {
        if (side === 'high' ? cs[i]!.high > last.c.high : cs[i]!.low < last.c.low) seq[seq.length - 1] = { c: cs[i]!, side, pt };
      } else seq.push({ c: cs[i]!, side, pt });
    }
  }
  // разделение по x, чтобы касания не слипались
  return seq.filter((p, i) => i === 0 || p.pt.x - seq[i - 1]!.pt.x >= 14);
}

test('Импульс: касания 0→5 (или 3/5 + «Готово»), метка на экстремумах, подписи, перезагрузка', async ({ page }) => {
  const chart = await openTerminal(page);
  const box = await chartBox(chart);
  const seq = await alternating(page, box);
  expect(seq.length).toBeGreaterThanOrEqual(3);
  const n = seq.length >= 6 ? 6 : seq.length >= 5 ? 5 : 3;
  const pts = seq.slice(-n);

  await selectTool(page, 'Импульс', 'Волны');
  const bar = page.getByTestId('instruction-bar');
  await expect(bar).toContainText('Инструмент: Импульс');
  await expect(bar).toContainText('0 → 5');
  for (let k = 0; k < n; k++) {
    await tapAt(page, pts[k]!.pt);
    if (k < n - 1) {
      await expect(chart).toHaveAttribute('data-mark-count', '0');
      await expect(bar).toContainText(`Нажмите на точку ${k + 1}`);
    }
  }
  if (n < 6) {
    await expect(page.getByTestId('ew-finish')).toBeVisible();
    await page.getByTestId('ew-finish').click();
  }
  await expect(chart).toHaveAttribute('data-mark-count', '1');
  const [m] = await markPoints(page);
  const mx = pts.reduce((a, p) => a + p.pt.x, 0) / n;
  const my = pts.reduce((a, p) => a + p.pt.y, 0) / n;
  expect(m!.x).toBeCloseTo(mx, -1);
  expect(m!.y).toBeCloseTo(my, -1);
  await selectTool(page, 'Выбор');
  await shot(page, 'ew-impulse');

  await page.waitForTimeout(500);
  await openTerminal(page);
  await expect(page.getByTestId('chart')).toHaveAttribute('data-mark-count', '1');
  await shot(page, 'ew-impulse-reload');
});

test('Зигзаг, Плоская и Инвалидация: A-B-C тремя касаниями, горизонталь одним', async ({ page }) => {
  const chart = await openTerminal(page);
  const box = await chartBox(chart);
  const seq = await alternating(page, box);
  expect(seq.length).toBeGreaterThanOrEqual(3);
  const abc = seq.slice(-3);
  await selectTool(page, 'Зигзаг', 'Волны');
  for (const p of abc) await tapAt(page, p.pt);
  await expect(chart).toHaveAttribute('data-mark-count', '1');
  await selectTool(page, 'Плоская', 'Волны');
  for (const p of seq.slice(0, 3).length === 3 && seq.length >= 6 ? seq.slice(0, 3) : abc) await tapAt(page, p.pt);
  await expect(chart).toHaveAttribute('data-mark-count', '2');
  await selectTool(page, 'Инвалидация', 'Волны');
  await tapAt(page, { x: box.x + box.width / 2, y: abc[0]!.pt.y });
  await expect(chart).toHaveAttribute('data-mark-count', '3');
  await selectTool(page, 'Выбор');
  await shot(page, 'ew-corrections');
  await page.getByRole('button', { name: /^Разметка \(3\)$/ }).and(page.locator(':visible')).click();
  await expect(page.getByTestId('marks-list')).toContainText('Elliott: zigzag');
});

test('горячая клавиша W выбирает «Импульс» (десктоп); группа «Волны» видна', async ({ page }) => {
  await openTerminal(page);
  await expect(page.getByRole('button', { name: 'Волны', exact: true }).and(page.locator(':visible'))).toBeVisible();
  test.skip(isMobile(page), 'клавиатура - десктоп');
  await page.keyboard.press('w');
  await expect(page.getByTestId('instruction-bar')).toContainText('Инструмент: Импульс');
});
