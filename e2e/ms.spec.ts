import { expect, test } from '@playwright/test';
import { checkAndSeeResult, nextThenHomeShowsDone, openSession, selectTool, shot, tapCandle } from './ms.helpers';

const MS = '/learn/market-structure';
test.describe.configure({ timeout: 180_000 });

test('экран выбора: режим, сложность, пара, ТФ ведут в сессию', async ({ page }) => {
  await page.goto(MS);
  await page.getByRole('radio', { name: /Вопрос/ }).click();
  await page.getByTestId('setup-difficulty').getByRole('radio', { name: 'Средний' }).click();
  await page.getByTestId('setup-symbol').getByRole('radio', { name: 'ETH' }).click();
  await page.getByTestId('setup-tf').getByRole('radio', { name: '4H' }).click();
  await shot(page, 'ms-setup');
  await page.getByTestId('start-session').click();
  await expect(page).toHaveURL(/mode=question&difficulty=medium&tf=4h&symbol=ETHUSDT/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('MS «Разметка»: метка, проверка, разбор, следующее задание, главная', async ({ page }) => {
  await openSession(page, `${MS}/session?mode=mark&difficulty=easy&tf=1h&symbol=BTCUSDT`);
  await expect(page.getByTestId('task-text')).toContainText('в подсвеченной области: ожидается');
  await shot(page, 'ms-mark-before');
  if ((page.viewportSize()?.width ?? 0) >= 1024) {
    // F-09: правая панель до проверки не пуста
    await expect(page.getByTestId('task-criteria')).toBeVisible();
  } else {
    // F-08: условие задания не обрезается одной строкой, (i) раскрывает справку
    await expect(page.getByTestId('task-hint-toggle')).toBeVisible();
  }
  // набор инструментов ограничен понятиями задания (лёгкий: без Sweep, FVG, Order Block)
  await expect(page.getByRole('button', { name: 'Зоны', exact: true })).toHaveCount(0);
  await selectTool(page, 'Swing High', 'Свинги');
  await tapCandle(page, 20);
  await expect(page.getByTestId('chart')).toHaveAttribute('data-mark-count', '1');
  await checkAndSeeResult(page);
  await expect(page.getByTestId('result-summary')).toContainText('Верно:');
  await shot(page, 'ms-mark-after');
  // F-06: «Итог» идёт первым, легенда свёрнута
  await expect(page.locator('[data-testid="feedback-view"] section').first()).toHaveAttribute('data-testid', 'fb-fb-verdict');
  await expect(page.getByTestId('grade-legend')).toBeHidden();
  await nextThenHomeShowsDone(page, MS);
});

test('MS «Разметка»: без меток «Проверить» объясняет, что делать', async ({ page }) => {
  await openSession(page, `${MS}/session?mode=mark&difficulty=easy&tf=1h&symbol=BTCUSDT`);
  await page.getByTestId('check-button').click();
  await expect(page.getByText('Поставьте хотя бы одну метку.').first()).toBeVisible();
  await expect(page.getByTestId('result')).toHaveCount(0);
});

test('MS «Вопрос»: вариант, ответ, разбор', async ({ page }) => {
  await openSession(page, `${MS}/session?mode=question&difficulty=easy&tf=1h&symbol=BTCUSDT`);
  await shot(page, 'ms-question-before');
  await page.getByRole('radio').first().click();
  await checkAndSeeResult(page);
  await expect(page.getByTestId('question-detail')).toContainText('Ваш ответ');
  await shot(page, 'ms-question-after');
});

test('MS: «нет подходящей ситуации» (404) и «Другое задание»', async ({ page }) => {
  let fail = true;
  await page.route('**/api/tasks/market-structure/next', async (route) => {
    if (fail) await route.fulfill({ status: 404, json: { error: { code: 'not_found', message: 'x' } } });
    else await route.continue();
  });
  await page.goto(`${MS}/session?mode=mark&difficulty=hard&tf=15m`);
  const err = page.getByTestId('task-error');
  await expect(err).toHaveAttribute('data-kind', 'no-situation');
  await expect(err).toContainText('Нет подходящей ситуации');
  await shot(page, 'ms-error-404');
  fail = false;
  await page.getByRole('button', { name: 'Другое задание' }).click();
  await expect(page.getByTestId('chart')).toHaveAttribute('data-ready', 'true', { timeout: 90_000 });
});

test('MS: 429 и 502 показывают тексты из COPY', async ({ page }) => {
  await page.route('**/api/tasks/market-structure/next', (route) => route.fulfill({ status: 429, headers: { 'Retry-After': '20' }, json: { error: { code: 'rate_limited', message: 'x', details: { retryAfterSec: 20 } } } }));
  await page.goto(`${MS}/session?mode=mark&difficulty=easy&tf=1h`);
  await expect(page.getByTestId('task-error')).toContainText('Слишком много запросов');
  await expect(page.getByTestId('task-error')).toContainText('20 с');
  await page.unroute('**/api/tasks/market-structure/next');
  await page.route('**/api/tasks/market-structure/next', (route) => route.fulfill({ status: 502, json: { error: { code: 'archive_unavailable', message: 'x' } } }));
  await page.getByRole('button', { name: 'Повторить' }).click();
  await expect(page.getByTestId('task-error')).toContainText('Архив данных недоступен');
});

test('MS hard (internal-external): переключатель слоя BOS/CHoCH, клавиша I', async ({ page }) => {
  await openSession(page, `${MS}/session?mode=mark&difficulty=hard&tf=1h&symbol=BTCUSDT&focus=internal-external`);
  const sw = page.getByTestId('scope-switch');
  await expect(sw).toHaveCount(0);
  await selectTool(page, 'BOS', 'Пробои');
  await expect(sw).toBeVisible();
  await expect(sw.getByRole('radio', { name: 'Внешняя' })).toBeChecked();
  await page.keyboard.press('KeyI');
  await expect(sw.getByRole('radio', { name: 'Внутренняя' })).toBeChecked();
  await shot(page, 'polish1-ms-hard-scope');
  await page.keyboard.press('KeyI');
  await expect(sw.getByRole('radio', { name: 'Внешняя' })).toBeChecked();
});

test('MS easy: переключателя слоя нет', async ({ page }) => {
  await openSession(page, `${MS}/session?mode=mark&difficulty=medium&tf=1h&symbol=BTCUSDT`);
  await selectTool(page, 'BOS', 'Пробои').catch(() => undefined);
  await expect(page.getByTestId('scope-switch')).toHaveCount(0);
});

test('404: страница на русском со ссылками «На главную» и «Терминал»', async ({ page }) => {
  await page.goto('/no-such-page');
  await expect(page.getByTestId('not-found')).toContainText('Страница не найдена');
  await expect(page.getByRole('link', { name: 'На главную' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Терминал' }).last()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await shot(page, '404');
});

test('мобильная шторка разбора: график занимает всё над ней на трёх высотах', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) >= 1024, 'только мобильный');
  await openSession(page, `${MS}/session?mode=mark&difficulty=easy&tf=1h&symbol=BTCUSDT`);
  await selectTool(page, 'Swing High', 'Свинги');
  await tapCandle(page, 20);
  await checkAndSeeResult(page);
  const vh = page.viewportSize()!.height;
  const sheet = page.getByTestId('result-sheet');
  for (const [h, share] of [['medium', 0.55], ['peek', 0.25], ['full', 0.9]] as const) {
    if (h === 'peek') await page.getByTestId('sheet-collapse').click();
    if (h === 'full') {
      await page.getByTestId('sheet-expand').click();
      await page.getByTestId('sheet-expand').click();
    }
    await expect(sheet).toHaveAttribute('data-height', h);
    await page.waitForTimeout(400);
    const s = (await sheet.boundingBox())!;
    const c = (await page.getByTestId('chart').boundingBox())!;
    expect(s.height).toBeGreaterThanOrEqual(vh * share * 0.95);
    expect(s.y + s.height).toBeGreaterThanOrEqual(vh - 2);
    // зазор между низом графика и верхом шторки не больше 8 px (на полной высоте график уходит под шторку)
    expect(s.y - (c.y + c.height)).toBeLessThanOrEqual(8);
    expect(c.height).toBeGreaterThan(150);
  }
});
