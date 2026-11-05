import { expect, test } from '@playwright/test';
import {
  DATE_LEAK, EW_STORAGE, bodyText, closePanel, drawCount, openEw, openPanel, pickCount, seeResult, shot, skipReplay, url,
  type EwEnvelope,
} from './elliott.helpers';
import { chartBox } from './terminal.helpers';

// Реальный сервер (next start): next/grade ходят в data.binance.vision. Моков данных нет (кроме проверки HTTP-ошибок).
test.use({ storageState: EW_STORAGE });
test.setTimeout(300_000);

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const st = document.createElement('style');
    st.textContent = 'nextjs-portal{display:none!important}';
    document.addEventListener('DOMContentLoaded', () => document.head.appendChild(st));
  });
});

const noOverflow = async (page: import('@playwright/test').Page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);

test('/learn/elliott: сложности, ТФ по сложности, «Начать» ведёт в сессию; карточка на главной', async ({ page }) => {
  await page.goto('/learn/elliott');
  for (const t of ['Лёгкий', 'Средний', 'Сложный']) await expect(page.getByRole('radio', { name: new RegExp(t) })).toBeVisible();
  await expect(page.getByTestId('setup-tf').getByRole('radio', { name: '15m' })).toHaveCount(0);
  await page.getByRole('radio', { name: /Сложный/ }).click();
  await page.getByTestId('setup-tf').getByRole('radio', { name: '4H' }).click();
  await expect(page.getByTestId('start-session')).toHaveAttribute('href', /difficulty=hard&tf=4h/);
  await noOverflow(page);
  await page.goto('/');
  await expect(page.getByRole('link', { name: /^Elliott Wave Lab/ })).toHaveAttribute('href', '/learn/elliott');
});

for (const [status, kind] of [[404, 'no-situation'], [429, 'rate-limited'], [502, 'archive']] as const) {
  test(`ошибка next ${status}: понятное состояние без падения`, async ({ page }) => {
    await page.route('**/api/tasks/elliott/next', (r) => r.fulfill({ status, contentType: 'application/json', headers: status === 429 ? { 'Retry-After': '7' } : {}, body: JSON.stringify({ error: { code: 'x', message: 'x', details: { retryAfterSec: 7 } } }) }));
    await page.goto(url('easy'));
    await expect(page.getByTestId('task-error')).toHaveAttribute('data-kind', kind);
    await noOverflow(page);
  });
}

test('интро Elliott открывается по (i) и содержит термины', async ({ page }) => {
  await page.route('**/api/tasks/elliott/next', (r) => r.fulfill({ status: 404, contentType: 'application/json', body: '{"error":{"code":"x","message":"x"}}' }));
  await page.goto(url('hard'));
  await page.getByTestId('intro-open').click();
  await expect(page.getByTestId('task-intro')).toContainText('Alternative');
});

test('easy: до решения нет дат -> разметка -> сценарий и invalidation -> проигрывание -> разбор', async ({ page }) => {
  const { env } = await openEw(page, url('easy'));
  expect(await bodyText(page)).not.toMatch(DATE_LEAK);
  await expect(page.getByTestId('relative-axis')).toBeVisible();
  await shot(page, 'easy-before');

  // без разметки -> подсказка, без запроса
  await page.getByTestId('check-button').click();
  await expect(page.getByTestId('input-message')).toContainText('Разметьте');

  const count = pickCount(env, ['abc-next']);
  await drawCount(page, count);
  await expect(page.getByTestId('chart')).toHaveAttribute('data-mark-count', '1');
  await openPanel(page);
  await expect(page.getByTestId('live-rules')).toBeVisible();
  await page.getByTestId('option-abc-next').click();
  await expect(page.getByTestId('option-impulse-extends')).toBeVisible();
  await expect(page.getByTestId('option-none')).toBeVisible();
  await page.getByTestId('inv-input').fill(String(count.impulse[5]!.price));
  await page.getByTestId('inv-set').click();
  await expect(page.getByTestId('inv-current')).toBeVisible();
  await shot(page, 'easy-panel');
  await closePanel(page);
  expect(await bodyText(page)).not.toMatch(DATE_LEAK);
  await page.getByTestId('check-button').click();

  await skipReplay(page);
  await seeResult(page);
  await expect(page.getByTestId('ew-scenario-date')).toHaveText(/20(1[7-9]|2[0-6])/);
  await expect(page.getByTestId('ew-not-scored')).toHaveText('Исход не влияет на оценку.');
  await expect(page.getByTestId('ew-outcome')).toBeVisible();
  await expect(page.getByTestId('toggle-ref')).toBeVisible();
  await expect(page.getByTestId('ew-guides')).toBeVisible();
  await noOverflow(page);
  await shot(page, 'easy-after');
  await page.getByTestId('next-task').click();
  await expect(page.getByTestId('result')).toHaveCount(0, { timeout: 90_000 });
});

test('medium: impulse + коррекция A-B-C, альтернатива обязательна', async ({ page }) => {
  const { env } = await openEw(page, url('medium'));
  expect(await bodyText(page)).not.toMatch(DATE_LEAK);
  await expect(page.getByTestId('live-rules')).toHaveCount(0);
  await shot(page, 'medium-before');
  const count = pickCount(env, ['trend-next']);
  await drawCount(page, count);
  await openPanel(page);
  await expect(page.getByTestId('live-rules')).toHaveCount(0);
  await page.getByTestId('option-trend-next').click();
  await expect(page.getByTestId('option-none')).toHaveCount(0);
  await page.getByTestId('inv-input').fill(String(count.correction!.points[2]!.price));
  await page.getByTestId('inv-set').click();
  await closePanel(page);
  // без альтернативы - подсказка
  await page.getByTestId('check-button').click();
  await expect(page.getByTestId('input-message')).toContainText('альтернатив');
  await openPanel(page);
  await page.getByTestId('option-correction-extends').click();
  await closePanel(page);
  await shot(page, 'medium-marked');
  await page.getByTestId('check-button').click();
  await skipReplay(page);
  await seeResult(page);
  await expect(page.getByTestId('ew-alt')).toBeVisible();
  await noOverflow(page);
  await shot(page, 'medium-after');
});

test('hard: основной + альтернативный сценарий и invalidation', async ({ page }) => {
  const { env } = await openEw(page, url('hard'));
  expect(await bodyText(page)).not.toMatch(DATE_LEAK);
  await shot(page, 'hard-before');
  const count = pickCount(env, ['trend-next', 'abc-next', 'w5-next']);
  await drawCount(page, count);
  await openPanel(page);
  await page.getByTestId(`option-${count.scenario}`).click();
  const alt = { 'trend-next': 'correction-extends', 'abc-next': 'impulse-extends', 'w5-next': 'correction-extends' }[count.scenario as 'trend-next'];
  await page.getByTestId(`option-${alt}`).click();
  const pts = [...count.impulse, ...(count.correction?.points ?? [])];
  const level = { 'trend-next': pts[8], 'abc-next': pts[5], 'w5-next': pts[1] }[count.scenario as 'trend-next']!;
  await page.getByTestId('inv-input').fill(String(level.price));
  await page.getByTestId('inv-set').click();
  await shot(page, 'hard-panel');
  await closePanel(page);
  await page.getByTestId('check-button').click();
  await skipReplay(page);
  await seeResult(page);
  await expect(page.getByTestId('ew-alt')).toBeVisible();
  await expect(page.getByTestId('ew-invalidation')).toBeVisible();
  await noOverflow(page);
  await shot(page, 'hard-after');
});

test('график имеет ненулевую область (360 px без горизонтальной прокрутки)', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await openEw(page, url('easy'));
  const box = await chartBox(page.getByTestId('chart'));
  expect(box.height).toBeGreaterThan(200);
  await noOverflow(page);
});
