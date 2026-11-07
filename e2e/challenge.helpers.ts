import { expect, type Page } from '@playwright/test';

export const SESSION_URL = (difficulty = 'easy', tf = 'auto') => `/learn/challenge/session?difficulty=${difficulty}&tf=${tf}`;

/** Абсолютная дата/год в тексте: год 2017-2026 вне цены, месяц словом, дд.мм.гггг. */
export const DATE_LEAK = /(?<![\d.,])20(1[7-9]|2[0-6])(?![\d]|[.,]\d)|\d{1,2}\.\d{2}\.\d{4}|\b\d{1,2}\s+(янв|фев|мар|апр|мая|июн|июл|авг|сен|окт|ноя|дек)/i;

export async function startSession(page: Page, difficulty = 'easy', tf = 'auto') {
  await page.goto(SESSION_URL(difficulty, tf));
  const root = page.getByTestId('challenge-session');
  await expect(root).toHaveAttribute('data-phase', 'decide', { timeout: 90_000 });
  const chart = page.getByTestId('chart');
  await expect(chart).toHaveAttribute('data-ready', 'true', { timeout: 30_000 });
  await expect.poll(async () => Number(await chart.getAttribute('data-candle-count'))).toBeGreaterThan(20);
  return root;
}

export async function projectPoint(page: Page, time: number, price: number) {
  return page.evaluate(([t, p]) => (window as unknown as { __tlProject: (t: number, p: number) => { x: number; y: number } | null }).__tlProject(t!, p!), [time, price] as const);
}

export async function lastCandleTime(page: Page): Promise<number> {
  return page.evaluate(() => {
    const c = (window as unknown as { __tlCandles: () => { openTime: number }[] }).__tlCandles();
    return c[c.length - 1]!.openTime;
  });
}

export const num = async (loc: ReturnType<Page['getByTestId']>) => Number((await loc.inputValue()).replace(/\s/g, '').replace(',', '.'));

export async function openReasons(page: Page) {
  await page.getByTestId('challenge-open-reasons').click();
  await expect(page.getByRole('dialog', { name: 'Обоснование' })).toBeVisible();
}

export async function submitDecision(page: Page, reason: string) {
  await openReasons(page);
  await page.getByTestId(`reason-${reason}`).click();
  await page.getByTestId('challenge-submit').click();
}

export async function waitResult(page: Page) {
  await expect(page.getByTestId('challenge-session')).toHaveAttribute('data-phase', 'replay', { timeout: 90_000 });
  await expect(page.getByTestId('replay-status')).toContainText('Идёт сценарий');
}

/** Итог на мобильном: шторка открывается свёрнутой (peek) — раскрываем до разбора; на десктопе панель уже открыта. */
export async function expandResult(page: Page) {
  await expect(page.getByTestId('challenge-session')).toHaveAttribute('data-phase', 'result', { timeout: 90_000 });
  const toggle = page.getByTestId('sheet-toggle');
  if (await toggle.isVisible().catch(() => false)) await toggle.click();
  await expect(page.getByTestId('challenge-result')).toBeVisible();
}
