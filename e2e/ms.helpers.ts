import { expect, type Page } from '@playwright/test';
import { chartBox, chartCandles, candlePoint, selectTool, tapAt } from './terminal.helpers';

export { selectTool };

/** Куда сохранять скриншоты (M3-M4); без переменной скриншоты не делаются. */
export async function shot(page: Page, name: string) {
  const dir = process.env.M34_SHOTS;
  if (!dir) return;
  const w = page.viewportSize()?.width ?? 0;
  await page.screenshot({ path: `${dir}/${w < 1024 ? 'mobile' : 'desktop'}-${name}.png` });
}

/** Открыть сессию и дождаться графика с реальными свечами сервера. */
export async function openSession(page: Page, url: string) {
  await page.goto(url);
  const chart = page.getByTestId('chart');
  await expect(chart).toHaveAttribute('data-ready', 'true', { timeout: 90_000 });
  await expect.poll(async () => Number(await chart.getAttribute('data-candle-count')), { timeout: 30_000 }).toBeGreaterThan(100);
  return chart;
}

/** Касание закрытой свечи на заданном расстоянии от правого края. */
export async function tapCandle(page: Page, fromEnd: number) {
  const box = await chartBox(page.getByTestId('chart'));
  const cs = (await chartCandles(page)).filter((c) => c.closed);
  for (let k = fromEnd; k < fromEnd + 40; k++) {
    const c = cs[cs.length - 1 - k];
    if (!c) break;
    const p = await candlePoint(page, c);
    if (p && p.x > box.x + 12 && p.x < box.x + box.width - 70 && p.y > box.y + 20 && p.y < box.y + box.height - 60) {
      await tapAt(page, p);
      return c;
    }
  }
  throw new Error('нет видимой свечи для касания');
}

export async function checkAndSeeResult(page: Page) {
  await page.getByTestId('check-button').click();
  await expect(page.getByTestId('result')).toBeVisible({ timeout: 60_000 });
  await expect(page.getByTestId('feedback-view')).toBeVisible();
  // шторка выезжает с анимацией: ждём конца, чтобы измерения и скриншоты были стабильны
  await page.waitForTimeout(600);
}

/** Следующее задание и возврат на главную: цель дня показывает выполненное задание. */
export async function nextThenHomeShowsDone(page: Page, backHref: string) {
  const before = await page.getByTestId('task-counter').innerText();
  await page.getByTestId('next-task').click();
  await expect(page.getByTestId('task-counter')).not.toHaveText(before, { timeout: 90_000 });
  await expect(page.getByTestId('result')).toHaveCount(0);
  await page.getByRole('link', { name: 'К выбору задания' }).click();
  await expect(page).toHaveURL(new RegExp(`${backHref}$`));
  await page.getByRole('link', { name: 'К выбору задания' }).click();
  await expect(page.getByText(/Сегодня: [1-9]\d* из/)).toBeVisible();
}

/** Одна метка BOS в MS «Разметка» easy (ступень 5: swing больше не оценивается): две свечи подряд. */
export async function markOneBos(page: Page) {
  await selectTool(page, 'BOS', 'Пробои');
  await tapCandle(page, 30);
  await tapCandle(page, 15);
  await expect(page.getByTestId('chart')).toHaveAttribute('data-mark-count', '1');
}
