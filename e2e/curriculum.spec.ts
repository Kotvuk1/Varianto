import { expect, test } from '@playwright/test';
import { checkAndSeeResult, openSession, shot, tapCandle } from './ms.helpers';
import { checkReplayResult, noHScroll, seedAttempts, selectTool, sideFromTask, tapPrice } from './curriculum.helpers';

test.describe.configure({ timeout: 240_000 });
const S = (m: string, q: string) => `/learn/${m}/session?${q}&symbol=BTCUSDT`;

test.describe('список «Обучение»: ступени, рекомендация, замки', () => {
  test('новый пользователь: 8 ступеней по порядку, «Рекомендуем» у ступени 1, комбо закрыты с остатком', async ({ page }) => {
    await page.goto('/');
    for (let i = 1; i <= 8; i++) await expect(page.getByTestId(`stage-${i}`)).toBeVisible();
    const titles = await page.locator('[data-testid^="stage-"][data-status]').allInnerTexts();
    expect(titles).toHaveLength(8);
    expect(titles[0]).toContain('Свинги');
    expect(titles[4]).toContain('Smart Money Concepts');
    expect(titles[5]).toContain('Свечные модели');
    expect(titles[7]).toContain('Волны Эллиотта');
    await expect(page.getByTestId('stage-1')).toContainText('Рекомендуем');
    await expect(page.locator('[data-recommended="true"]')).toHaveCount(1);
    await expect(page.getByTestId('stage-1-progress')).toHaveText('Не начато');
    for (const m of ['combo-level-trade', 'combo-smc-entry', 'challenge']) {
      await expect(page.getByTestId(`combo-${m}`)).toHaveAttribute('data-locked', 'true');
      await expect(page.getByTestId(`combo-${m}`).getByRole('link')).toHaveCount(0);
    }
    await expect(page.getByTestId('combo-combo-level-trade-remaining')).toContainText('Ступень 2 «Уровни»: ещё 10 заданий');
    await expect(page.getByTestId('combo-challenge-remaining')).toContainText('Ступень 5');
    // базовые ступени всегда открыты: ссылки на существующие маршруты
    await expect(page.getByTestId('stage-5').getByRole('link')).toHaveAttribute('href', '/learn/market-structure');
    await expect(page.getByTestId('stage-6').getByRole('link')).toHaveAttribute('href', '/learn/price-action');
    await noHScroll(page);
    await shot(page, 'learn-locked');
  });

  test('прогресс ступеней и открытие комбо после ступеней 2-4', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('stage-1')).toBeVisible();
    await seedAttempts(page, [
      { module: 'levels', skill: 'pa-level', n: 10 },
      { module: 'limit-entry', skill: 'limit-placement', n: 10 },
      { module: 'stop-take', skill: 'take-profit', n: 4 },
    ]);
    await page.reload();
    await expect(page.getByTestId('stage-2')).toHaveAttribute('data-status', 'passed');
    await expect(page.getByTestId('stage-3')).toHaveAttribute('data-status', 'passed');
    await expect(page.getByTestId('stage-4')).toHaveAttribute('data-status', 'in-progress');
    await expect(page.getByTestId('stage-4-progress')).toContainText('4 из 10 заданий');
    await expect(page.getByTestId('stage-1')).toHaveAttribute('data-recommended', 'true');
    // комбо 2-4 ещё закрыто: осталась ступень 4
    await expect(page.getByTestId('combo-combo-level-trade')).toHaveAttribute('data-locked', 'true');
    await expect(page.getByTestId('combo-combo-level-trade-remaining')).toContainText('Ступень 4 «Стоп и тейк»: ещё 6 заданий');
    await expect(page.getByTestId('combo-combo-level-trade-remaining')).not.toContainText('Ступень 2');

    await seedAttempts(page, [{ module: 'stop-take', skill: 'stop-placement', n: 10 }]);
    await page.reload();
    await expect(page.getByTestId('stage-4')).toHaveAttribute('data-status', 'passed');
    await expect(page.getByTestId('combo-combo-level-trade')).toHaveAttribute('data-locked', 'false');
    await expect(page.getByTestId('combo-combo-level-trade').getByRole('link')).toHaveAttribute('href', '/learn/combo-level-trade');
    await expect(page.getByTestId('combo-combo-smc-entry')).toHaveAttribute('data-locked', 'true'); // ждёт ступень 5
    await expect(page.getByTestId('combo-challenge')).toHaveAttribute('data-locked', 'true');
    await noHScroll(page);
    await shot(page, 'learn-unlocked');
  });

  test('Challenge открыт тем, кто уже торговал в нём', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('stage-1')).toBeVisible();
    await seedAttempts(page, [{ module: 'challenge', skill: 'challenge-decision', n: 1 }]);
    await page.reload();
    await expect(page.getByTestId('combo-challenge')).toHaveAttribute('data-locked', 'false');
    await expect(page.getByTestId('combo-challenge')).toContainText('вы уже торговали');
  });

  test('замок только в интерфейсе: сессия закрытого комбо открывается по прямой ссылке', async ({ page }) => {
    await page.goto('/learn/combo-level-trade');
    await expect(page.getByTestId('start-session')).toBeVisible();
  });
});

test.describe('экраны выбора новых модулей', () => {
  test('Свинги: тип, сложность и допустимые таймфреймы', async ({ page }) => {
    await page.goto('/learn/stage-swings');
    await page.getByRole('radio', { name: /Тренд по свингам/ }).click();
    await page.getByTestId('setup-difficulty').getByRole('radio', { name: 'Лёгкий' }).click();
    await expect(page.getByTestId('setup-tf').getByRole('radio')).toHaveCount(2); // easy: 1H, 4H
    await page.getByTestId('start-session').click();
    await expect(page).toHaveURL(/type=sw-trend&difficulty=easy&tf=1h/);
    await noHScroll(page);
  });
  test('Лимитный вход: таймфрейм «Авто»', async ({ page }) => {
    await page.goto('/learn/limit-entry');
    await expect(page.getByTestId('setup-tf').getByRole('radio', { name: 'Авто' })).toBeChecked();
    await page.getByTestId('start-session').click();
    await expect(page).toHaveURL(/\/learn\/limit-entry\/session\?difficulty=easy$/);
  });
});

test.describe('ступень 1 «Свинги»', () => {
  test('sw-mark: метка, проверка, разбор', async ({ page }) => {
    await openSession(page, S('stage-swings', 'type=sw-mark&difficulty=easy&tf=1h'));
    await expect(page.getByTestId('task-text').first()).toContainText('Swing High');
    await selectTool(page, 'Swing High', 'Свинги');
    await tapCandle(page, 20);
    await expect(page.getByTestId('chart')).toHaveAttribute('data-mark-count', '1');
    await checkAndSeeResult(page);
    await expect(page.getByTestId('result-summary')).toContainText('Верно:');
    await shot(page, 'sw-mark-after');
  });

  test('sw-trend: вариант, ответ, разбор', async ({ page }) => {
    await openSession(page, S('stage-swings', 'type=sw-trend&difficulty=easy&tf=1h'));
    await shot(page, 'sw-trend-before');
    await page.getByTestId('option-up').click();
    await page.getByTestId('check-button').click();
    await expect(page.getByTestId('result')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('trend-detail')).toContainText('Ваш ответ');
    await shot(page, 'sw-trend-after');
  });
});

test.describe('ступень 2 «Уровни»', () => {
  test('lv-strongest: уровень, проверка, разбор с эталоном', async ({ page }) => {
    await openSession(page, S('levels', 'type=lv-strongest&difficulty=easy&tf=1h'));
    await page.getByTestId('check-button').click();
    await expect(page.getByText(/Проведите уровень/).first()).toBeVisible();
    await tapCandle(page, 15);
    await expect(page.getByTestId('chart')).toHaveAttribute('data-mark-count', '1');
    await checkAndSeeResult(page);
    await expect(page.getByTestId('level-detail')).toContainText('Эталон');
    await shot(page, 'lv-strongest-after');
  });

  test('lv-zone: две точки зоны, проверка, разбор', async ({ page }) => {
    await openSession(page, S('levels', 'type=lv-zone&difficulty=easy&tf=1h'));
    // инструмент «Зона» выбран по умолчанию
    const side = await sideFromTask(page);
    await tapPrice(page, side, [0.004, 0.007, 0.011]);
    await tapPrice(page, side, [0.012, 0.016, 0.02]);
    await expect(page.getByTestId('chart')).toHaveAttribute('data-mark-count', '1');
    await checkAndSeeResult(page);
    await expect(page.getByTestId('zone-detail')).toContainText('Эталон');
    await shot(page, 'lv-zone-after');
  });

  test('lv-reaction: выбор зоны, проигрывание, разбор', async ({ page }) => {
    await openSession(page, S('levels', 'type=lv-reaction&difficulty=easy&tf=1h'));
    await shot(page, 'lv-reaction-before');
    await page.getByTestId('option-z1').click();
    await checkReplayResult(page);
    await expect(page.getByTestId('cur-scenario-date')).toBeVisible();
    await shot(page, 'lv-reaction-after');
  });
});

test.describe('ступень 3 «Лимитный вход»', () => {
  test('limit-entry: лимитка, тип, проигрывание, маркер исполнения/снятия и разбор', async ({ page }) => {
    await openSession(page, S('limit-entry', 'difficulty=easy&tf=1h'));
    await shot(page, 'limit-before');
    await page.getByTestId('check-button').click();
    await expect(page.getByText(/Поставьте лимитку/).first()).toBeVisible();
    const side = await sideFromTask(page);
    await tapPrice(page, side);
    await expect(page.getByTestId('chart')).toHaveAttribute('data-mark-count', '1');
    await page.getByTestId('check-button').click();
    await expect(page.getByText('Выберите тип входа.').first()).toBeVisible();
    await page.getByTestId('limit-type-front-run').click();
    await page.getByTestId('check-button').click();
    await expect(page.getByText('Выберите величину опережения.').first()).toBeVisible();
    await page.getByTestId('front-k-0.2').click();
    await checkReplayResult(page);
    await expect(page.getByTestId('cur-parts')).toContainText('Итого');
    await expect(page.getByTestId('fb-fb-verdict')).toBeVisible();
    await shot(page, 'limit-after');
  });
});

test.describe('ступень 4 «Стоп и тейк»', () => {
  test('stop-take: позиция по умолчанию, проверка, проигрывание и разбор', async ({ page }) => {
    await openSession(page, S('stop-take', 'difficulty=easy&tf=1h'));
    await expect(page.getByTestId('plan-line').first()).toContainText('R:R');
    await shot(page, 'stop-before');
    await checkReplayResult(page);
    await expect(page.getByTestId('cur-parts')).toContainText('Стоп');
    await expect(page.getByTestId('cur-outcome')).toContainText('Исход сделки');
    await shot(page, 'stop-after');
  });
});

test.describe('комбо', () => {
  for (const module of ['combo-level-trade', 'combo-smc-entry'] as const) {
    test(`${module}: зона, лимитка, стоп/тейк, проверка, проигрывание, разбор`, async ({ page }) => {
      await openSession(page, S(module, 'difficulty=easy&tf=1h'));
      await expect(page.getByTestId('task-text').first()).toContainText('Отметьте зону');
      const side = await sideFromTask(page);
      await selectTool(page, 'Зона', 'Уровни');
      await tapPrice(page, side, [0.004, 0.007, 0.011]);
      await tapPrice(page, side, [0.012, 0.016, 0.02]);
      await expect(page.getByTestId('chart')).toHaveAttribute('data-mark-count', '1');
      await selectTool(page, 'Лимитка', 'Уровни');
      await tapPrice(page, side, [0.003, 0.005, 0.008], 25);
      await expect(page.getByTestId('chart')).toHaveAttribute('data-mark-count', '3'); // зона + лимитка + позиция
      await expect(page.getByTestId('plan-line').first()).toContainText('стоп');
      await page.getByTestId('limit-type-near-edge').click();
      await shot(page, `${module}-before`);
      await checkReplayResult(page);
      await expect(page.getByTestId('cur-parts')).toContainText('Зона');
      await shot(page, `${module}-after`);
    });
  }
});

test('draw-level из старых ссылок ведёт в «Уровни»', async ({ page }) => {
  await page.goto('/learn/price-action/session?type=draw-level&difficulty=easy&tf=1h');
  await expect(page).toHaveURL(/\/learn\/levels\/session\?type=lv-strongest/);
});

