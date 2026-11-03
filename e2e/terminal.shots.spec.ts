import { test } from '@playwright/test';
import { chartBox, drawTwoPoint, openTerminal, selectTool, tapAt } from './terminal.helpers';

// Скриншоты для приёмки (реальные свечи архива). Запуск: SHOTS_DIR=/path pnpm test:e2e terminal.shots
const dir = process.env.SHOTS_DIR;
test.skip(!dir, 'SHOTS_DIR не задан');
test.setTimeout(180_000);

for (const theme of ['dark', 'light'] as const) {
  test(`терминал с метками, тема ${theme}`, async ({ page }, info) => {
    const chart = await openTerminal(page);
    const b = await chartBox(chart);
    const at = (fx: number, fy: number) => ({ x: b.x + b.width * fx, y: b.y + b.height * fy });

    await selectTool(page, 'BOS', 'Структура');
    await drawTwoPoint(page, at(0.3, 0.3), at(0.55, 0.3));
    await selectTool(page, 'OB', 'Зоны');
    await drawTwoPoint(page, at(0.5, 0.55), at(0.72, 0.65));
    await selectTool(page, 'FVG', 'Зоны');
    await drawTwoPoint(page, at(0.2, 0.45), at(0.35, 0.52));
    await selectTool(page, 'Уровень', 'Линии');
    await tapAt(page, at(0.5, 0.2));
    await selectTool(page, 'Трендовая', 'Линии');
    await drawTwoPoint(page, at(0.1, 0.7), at(0.6, 0.45));
    await selectTool(page, 'Swing High', 'Структура');
    await tapAt(page, at(0.4, 0.15));
    await selectTool(page, 'Выбор');

    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${dir}/${info.project.name}-${theme}.png` });
  });
}
