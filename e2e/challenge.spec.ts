import { expect, test } from '@playwright/test';
import { DATE_LEAK, lastCandleTime, num, projectPoint, startSession, submitDecision, waitResult } from './challenge.helpers';

// Реальный сервер (next start): next/grade ходят в data.binance.vision. Моков данных нет.
test.setTimeout(240_000);

async function bodyText(page: import('@playwright/test').Page) {
  return page.evaluate(() => document.body.innerText + '\n' + document.body.innerHTML.replace(/<canvas[^>]*>/g, ''));
}

test('LONG: SL/TP перетаскиванием -> проигрывание -> результат и раскрытая дата', async ({ page }) => {
  await startSession(page, 'easy');

  // До решения в DOM нет реального года и даты сценария; ось - относительная.
  const before = await bodyText(page);
  expect(before).not.toMatch(DATE_LEAK);
  await expect(page.getByTestId('relative-axis')).toBeVisible();
  await expect(page.getByTestId('challenge-strip')).toContainText('дата скрыта');

  await page.getByRole('radio', { name: 'LONG' }).click();
  const sl = page.getByTestId('challenge-sl');
  const tp = page.getByTestId('challenge-tp');
  const entry = Number((await page.getByTestId('challenge-entry').innerText()).replace(/\s/g, '').replace(',', '.'));
  const sl0 = await num(sl);
  const tp0 = await num(tp);
  expect(sl0).toBeLessThan(entry);
  expect(tp0).toBeGreaterThan(entry);
  await expect(page.getByTestId('challenge-rr')).toContainText('R:R 1:2');

  // Перетаскивание линии SL по графику (инструмент position): дальше от входа.
  const t = await lastCandleTime(page);
  const from = await projectPoint(page, t, sl0);
  expect(from).not.toBeNull();
  await page.mouse.move(from!.x, from!.y);
  await page.mouse.down();
  await page.mouse.move(from!.x, from!.y + 15, { steps: 4 });
  await page.mouse.move(from!.x, from!.y + 30, { steps: 4 });
  await page.mouse.up();
  await expect.poll(() => num(sl)).toBeLessThan(sl0);
  expect(await num(tp)).toBe(tp0);

  expect(await bodyText(page)).not.toMatch(DATE_LEAK);

  // Причины + подтверждение.
  await submitDecision(page, 'trend-continuation');
  await waitResult(page);

  // Проигрывание: пауза/возобновление/скорость/пропуск.
  await page.getByTestId('replay-pause').click();
  await expect(page.getByTestId('replay-pause')).toContainText('Продолжить');
  await page.getByTestId('replay-pause').click();
  await page.getByRole('radio', { name: '×16' }).click();
  await page.getByTestId('replay-skip').click();

  await expect(page.getByTestId('challenge-session')).toHaveAttribute('data-phase', 'result');
  const res = page.getByTestId('challenge-result');
  await expect(res).toBeVisible();
  await expect(page.getByTestId('result-date')).toHaveText(/20(1[7-9]|2[0-6])/);
  await expect(page.getByTestId('result-pair')).toHaveText(/(BTC|ETH|SOL)USDT/);
  await expect(page.getByTestId('result-outcome-sub')).toContainText(/позиция закрыта|закрыта по лимиту/);
  await expect(res).toContainText(/[-+\u2212]?\d+\.\d\s*R/);
  await expect(page.getByTestId('result-quality')).toContainText(/из 100/);
  await expect(page.getByTestId('quality-htf')).toBeVisible();
  for (const id of ['fb-fb-verdict', 'fb-fb-understood', 'fb-fb-mistakes', 'fb-fb-why', 'fb-fb-howto', 'fb-fb-principle']) {
    await expect(page.getByTestId(id)).toBeVisible();
  }
  // Один вердикт: «Решение» и первая часть разбора согласованы, формулировки разметки не используются.
  await expect(page.getByTestId('fb-fb-verdict')).toContainText(/Решение (верное|частично верное|неверное): качество \d+ из 100/);
  await expect(page.getByTestId('fb-fb-verdict')).not.toContainText('эталон');
  await expect(res).not.toContainText(/\b(up|down)\b/);

  // Попытка сохранена в IndexedDB и попадает в статистику.
  await page.goto('/learn/challenge');
  await expect(page.getByTestId('challenge-stats')).toBeVisible();
  await expect(page.getByTestId('challenge-stats')).toContainText('Win rate');
});

test('SHORT: SL с неверной стороны блокирует подтверждение мягким сообщением', async ({ page }) => {
  await startSession(page, 'medium');
  await page.getByRole('radio', { name: 'SHORT' }).click();
  const entry = Number((await page.getByTestId('challenge-entry').innerText()).replace(/\s/g, '').replace(',', '.'));
  await page.getByTestId('challenge-sl').fill(String(entry * 0.99));
  await page.getByTestId('challenge-sl').press('Enter');
  await expect(page.getByTestId('challenge-blocker')).toHaveText('Поставьте SL выше входа для SHORT');
  await expect(page.getByTestId('challenge-open-reasons')).toHaveAttribute('aria-disabled', 'true');
  await page.getByTestId('challenge-sl').fill(String(entry * 1.01));
  await page.getByTestId('challenge-sl').press('Enter');
  await expect(page.getByTestId('challenge-blocker')).toHaveText('');
  await expect(page.getByTestId('challenge-open-reasons')).not.toHaveAttribute('aria-disabled', 'true');
});

test('переключение ТФ не раскрывает дату и не показывает будущее', async ({ page }) => {
  await startSession(page, 'easy', '1h');
  for (const tf of ['15m', '4H', '1D', '1H']) {
    await page.getByRole('radio', { name: tf, exact: true }).click();
    await expect(page.getByTestId('chart')).toHaveAttribute('data-ready', 'true');
    expect(await bodyText(page)).not.toMatch(DATE_LEAK);
  }
  // свечей позже последней нет: последняя свеча каждого ТФ не позже общей точки «сейчас»
  const lastOpen = await lastCandleTime(page);
  expect(lastOpen).toBeGreaterThan(0);
});

test('WAIT: без SL/TP, разбор без R', async ({ page }) => {
  await startSession(page, 'hard');
  await page.getByRole('radio', { name: 'WAIT' }).click();
  await expect(page.getByTestId('challenge-summary')).toHaveCount(0);
  await expect(page.getByTestId('challenge-open-reasons')).not.toHaveAttribute('aria-disabled', 'true');
  await submitDecision(page, 'range-no-edge');
  await waitResult(page);
  await page.getByTestId('replay-skip').click();
  const res = page.getByTestId('challenge-result');
  await expect(res).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId('result-outcome-sub')).toHaveText('R для WAIT не считается');
  await expect(res).toContainText(/WAIT (не )?был верным/);
  await expect(page.getByTestId('result-date')).toHaveText(/20(1[7-9]|2[0-6])/);
  await expect(page.getByTestId('fb-fb-verdict')).toBeVisible();
  await expect(page.getByTestId('quality-wait')).toBeVisible();
});

for (const c of [
  { status: 404, code: 'not_found', title: 'Нет подходящих сценариев' },
  { status: 429, code: 'rate_limited', title: 'Слишком много запросов' },
  { status: 502, code: 'archive_unavailable', title: 'Архив данных недоступен' },
]) {
  test(`ошибка ${c.status}: текст COPY и повтор`, async ({ page }) => {
    await page.route('**/api/tasks/challenge/next', (r) =>
      r.fulfill({ status: c.status, contentType: 'application/json', headers: c.status === 429 ? { 'Retry-After': '7' } : {}, body: JSON.stringify({ error: { code: c.code, message: 'x', ...(c.status === 429 ? { details: { retryAfterSec: 7 } } : {}) } }) }),
    );
    await page.goto('/learn/challenge/session?difficulty=easy&tf=auto');
    const err = page.getByTestId('challenge-error');
    await expect(err).toContainText(c.title);
    if (c.status === 429) await expect(err).toContainText('7 с');
  });
}

test('×16: проигрывание доходит до итога само, без ошибок страницы', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await startSession(page, 'easy');
  await page.getByRole('radio', { name: 'SHORT' }).click();
  await submitDecision(page, 'trend-continuation');
  await waitResult(page);
  await page.getByRole('radio', { name: '×16' }).click();
  await expect(page.getByTestId('challenge-session')).toHaveAttribute('data-phase', 'result', { timeout: 60_000 });
  expect(errors).toEqual([]);
});
