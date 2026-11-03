import { test } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import {
  candlePoint,
  chartBox,
  chartCandles,
  findVisibleBos,
  findVisibleFvg,
  isMobile,
  openTerminal,
  pivotSide,
  project,
  selectTool,
  tapAt,
  type RealCandle,
} from './terminal.helpers';

// Скриншоты для приёмки (реальные свечи архива). Запуск: SHOTS_DIR=/path pnpm test:e2e terminal.shots
// Метки ставятся только в корректные места, найденные по реальным данным (свинги, BOS с закрытием тела, FVG, OB).
const dir = process.env.SHOTS_DIR;
test.skip(!dir, 'SHOTS_DIR не задан');
test.setTimeout(180_000);

const iso = (t: number) => new Date(t).toISOString().slice(0, 16).replace('T', ' ') + ' UTC';

/** OB: последняя противоположная свеча перед импульсом, сломавшим структуру (между swing и свечой пробоя). */
function findObBefore(cs: RealCandle[], swingIdx: number, breakIdx: number, bull: boolean): number | null {
  for (let k = breakIdx - 1; k > swingIdx; k--) {
    const opposite = bull ? cs[k]!.close < cs[k]!.open : cs[k]!.close > cs[k]!.open;
    if (opposite) return k;
  }
  return null;
}

for (const theme of ['dark', 'light'] as const) {
  test(`терминал с метками, тема ${theme}`, async ({ page }, info) => {
    const chart = await openTerminal(page);
    const b = await chartBox(chart);
    const cs = await chartCandles(page);
    const log: Record<string, unknown> = { project: info.project.name, theme };

    const bos = await findVisibleBos(page, b);
    const si = cs.findIndex((c) => c.openTime === bos.swing.openTime);
    const bi = cs.findIndex((c) => c.openTime === bos.breakCandle.openTime);
    const bull = bos.side === 'high';
    log.swing = { kind: bull ? 'swing-high' : 'swing-low', time: iso(bos.swing.openTime), price: bos.level, why: 'экстремум в окне +-3 свечи' };
    log.bos = {
      time: iso(bos.breakCandle.openTime),
      level: bos.level,
      close: bos.breakCandle.close,
      why: `первая свеча, пробившая ${bull ? 'high' : 'low'} свинга; закрытие тела за уровнем`,
    };

    // 1) swing-метка на реальном экстремуме, 2) BOS: шаг 1 берёт существующую swing-метку
    await selectTool(page, bull ? 'Swing High' : 'Swing Low', 'Структура');
    await tapAt(page, bos.swingPt);
    await selectTool(page, 'BOS', 'Пробои');
    await tapAt(page, bos.swingPt);
    await tapAt(page, bos.breakPt);

    // OB: последняя противоположная свеча перед импульсом
    const ob = findObBefore(cs, si, bi, bull);
    if (ob !== null) {
      const pt = await candlePoint(page, cs[ob]!);
      if (pt) {
        await selectTool(page, 'Order Block', 'Зоны');
        await tapAt(page, pt);
        log.ob = { time: iso(cs[ob]!.openTime), high: cs[ob]!.high, low: cs[ob]!.low, why: `последняя ${bull ? 'медвежья' : 'бычья'} свеча перед импульсом, сломавшим структуру (BOS ${iso(bos.breakCandle.openTime)})` };
      }
    }

    // FVG на реальном трёхсвечном разрыве
    const fvg = await findVisibleFvg(page, b, 'gap');
    await selectTool(page, 'FVG', 'Зоны');
    await tapAt(page, fvg.pt);
    log.fvg = { middle: iso(fvg.middle.openTime), direction: fvg.gap!.dir, top: fvg.gap!.top, bottom: fvg.gap!.bottom, why: 'low[i+1] > high[i-1] (бычий) или high[i+1] < low[i-1] (медвежий)' };

    // swing противоположной стороны (видимый подтверждённый экстремум)
    const side2 = bull ? 'low' : 'high';
    for (let p = cs.length - 8; p >= 3; p--) {
      if (!pivotSide(cs, p, side2)) continue;
      const pt = await project(page, cs[p]!.openTime, cs[p]![side2]);
      if (pt && pt.x > b.x + 20 && pt.x < b.x + b.width - 80 && pt.y > b.y + 30 && pt.y < b.y + b.height - 70) {
        await selectTool(page, side2 === 'high' ? 'Swing High' : 'Swing Low', 'Структура');
        await tapAt(page, pt);
        log.swing2 = { kind: side2 === 'high' ? 'swing-high' : 'swing-low', time: iso(cs[p]!.openTime), price: cs[p]![side2], why: 'экстремум в окне +-3 свечи' };
        break;
      }
    }

    // уровень: на фитиле второго swing (снап к high/low), отдельно от BOS
    const sw2 = log.swing2 as { price: number; time: string } | undefined;
    if (sw2) {
      const p2 = cs.find((c) => iso(c.openTime) === sw2.time)!;
      const lp = await project(page, p2.openTime, sw2.price);
      if (lp) {
        await selectTool(page, 'Уровень', 'Линии');
        await tapAt(page, { x: lp.x, y: lp.y + (side2 === 'high' ? 4 : -4) });
        log.level = { price: sw2.price, why: 'снап к фитилю (high/low) ближайшей свечи в радиусе' };
      }
    }
    await selectTool(page, 'Выбор');

    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${dir}/${info.project.name}-${theme}.png` });

    if (theme === 'dark') {
      if (!isMobile(page)) {
        await page.getByRole('button', { name: 'Пробои', exact: true }).click();
        await page.waitForTimeout(200);
        await page.screenshot({ path: `${dir}/${info.project.name}-${theme}-flyout.png` });
        await page.keyboard.press('Escape');
      }
      await selectTool(page, 'FVG', 'Зоны');
      await tapAt(page, (await findVisibleFvg(page, b, 'overlap')).pt);
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${dir}/${info.project.name}-${theme}-notice.png` });
      await page.getByRole('button', { name: /^Разметка \(\d+\)$/ }).and(page.locator(':visible')).click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${dir}/${info.project.name}-${theme}-list.png` });
    }
    writeFileSync(`${dir}/${info.project.name}-${theme}.marks.json`, JSON.stringify(log, null, 2));
  });
}
