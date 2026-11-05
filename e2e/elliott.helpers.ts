import { expect, type Page, type Response } from '@playwright/test';
import { enumerateCounts, type Candle, type ElliottTask, type WaveCount } from '../packages/core/src/index';
import { chartBox, project, selectTool, tapAt } from './terminal.helpers';

const PORT = Number(process.env.E2E_PORT ?? 3100);
/** Интро Elliott отключены (guide.spec проверяет интро отдельно). */
export const EW_STORAGE = {
  cookies: [],
  origins: [{ origin: `http://localhost:${PORT}`, localStorage: ['ew-easy', 'ew-medium', 'ew-hard'].map((k) => ({ name: `tl.intro.dismissed.${k}`, value: '1' })) }],
};

/** Абсолютная дата/год в тексте: год 2017-2026 вне цены, месяц словом, дд.мм.гггг. */
export const DATE_LEAK = /(?<![\d.,])20(1[7-9]|2[0-6])(?![\d]|[.,]\d)|\d{1,2}\.\d{2}\.\d{4}|\b\d{1,2}\s+(янв|фев|мар|апр|мая|июн|июл|авг|сен|окт|ноя|дек)/i;

export const url = (difficulty: 'easy' | 'medium' | 'hard', tf = '1h') => `/learn/elliott/session?difficulty=${difficulty}&tf=${tf}`;

/** Куда сохранять скриншоты; без переменной скриншоты не делаются. */
export async function shot(page: Page, name: string) {
  const dir = process.env.EW_SHOTS;
  if (!dir) return;
  const w = page.viewportSize()?.width ?? 0;
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${dir}/${w < 1024 ? 'mobile' : 'desktop'}-dark-${name}.png` });
}

export async function bodyText(page: Page) {
  return page.evaluate(() => document.body.innerText + '\n' + document.body.innerHTML.replace(/<canvas[^>]*>/g, ''));
}

export interface EwEnvelope {
  payload: ElliottTask;
  series: Record<string, Candle[]>;
  decisionTime: number;
}

/** Открывает сессию и перехватывает ответ next (реальный сервер, реальные свечи) для расчёта допустимой разметки. */
export async function openEw(page: Page, path: string): Promise<{ env: EwEnvelope }> {
  const nextResp = page.waitForResponse((r: Response) => r.url().includes('/api/tasks/elliott/next') && r.request().method() === 'POST', { timeout: 120_000 });
  await page.goto(path);
  const env = (await (await nextResp).json()) as EwEnvelope;
  const chart = page.getByTestId('chart');
  await expect(chart).toHaveAttribute('data-ready', 'true', { timeout: 120_000 });
  await expect.poll(async () => Number(await chart.getAttribute('data-candle-count')), { timeout: 30_000 }).toBeGreaterThan(100);
  return { env };
}

/** Допустимые разметки тем же перебором, что использует сервер (на видимых свечах задания). */
export function countsFor(env: EwEnvelope): WaveCount[] {
  const candles = env.series[env.payload.tf]!;
  const idx = (t: number) => candles.findIndex((c) => c.openTime === t);
  const lastIndex = idx(env.payload.lastPivot.time);
  const fromIndex = Math.max(0, idx(env.payload.window.fromTime));
  return enumerateCounts(candles, { nPoint: env.payload.nPoint, fromIndex, lastIndex, maxCounts: 5000 }).counts;
}

export function pickCount(env: EwEnvelope, scenario: WaveCount['scenario'][]): WaveCount {
  const c = countsFor(env).find((x) => scenario.includes(x.scenario));
  if (!c) throw new Error(`нет допустимой разметки ${scenario.join('/')}`);
  return c;
}

async function tapPoints(page: Page, pts: { time: number; price: number }[]) {
  const box = await chartBox(page.getByTestId('chart'));
  for (const p of pts) {
    const px = await project(page, p.time, p.price);
    if (!px) throw new Error(`точка ${p.time} вне графика`);
    await tapAt(page, { x: Math.min(Math.max(px.x, box.x + 3), box.x + box.width - 70), y: px.y });
  }
}

/** Импульс инструментом «Волны -> Impulse», коррекция - «Zigzag»/«Flat». */
export async function drawCount(page: Page, count: WaveCount) {
  await selectTool(page, 'Импульс', 'Волны');
  await tapPoints(page, count.impulse);
  if (count.correction) {
    await selectTool(page, count.correction.type === 'zigzag' ? 'Зигзаг' : 'Плоская', 'Волны');
    await tapPoints(page, count.correction.points);
  }
}

/** Панель «Сценарий»: на мобильном открывается шторкой. */
export async function openPanel(page: Page) {
  const open = page.getByTestId('scenario-open');
  if (await open.count()) await open.click();
  await expect(page.getByTestId('scenario-panel')).toBeVisible();
}

export async function closePanel(page: Page) {
  const done = page.getByTestId('scenario-done');
  if (await done.count()) await done.click();
}

export async function seeResult(page: Page) {
  await expect(page.getByTestId('result')).toBeVisible({ timeout: 90_000 });
  await expect(page.getByTestId('feedback-view')).toBeVisible();
  await page.waitForTimeout(600);
}

export async function skipReplay(page: Page) {
  await expect(page.getByTestId('ew-replay')).toBeVisible({ timeout: 90_000 });
  expect(await bodyText(page)).not.toMatch(DATE_LEAK);
  await page.getByRole('radio', { name: '×16' }).click();
  await page.getByTestId('replay-skip').click();
}
