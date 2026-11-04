import { test, type Page } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import type { Mark } from '../packages/core/src/index';
import { chartBox, coreLevels, coreMarks, drawAlgoMark, isMobile, openTerminal, project, selectTool, tapAt, tapsForAlgoMark } from './terminal.helpers';

// Скриншоты для приёмки на реальных свечах архива. Запуск: SHOTS_DIR=/path pnpm test:e2e terminal.shots
// Демо-разметка строится ТОЛЬКО из вывода ядра (analyzeStructure(medium) -> toMarks, findLevels), не вручную:
// каждая метка воспроизводится инструментом терминала по касаниям в точках, которые даёт метка ядра.
const dir = process.env.SHOTS_DIR;
test.skip(!dir, 'SHOTS_DIR не задан');
test.setTimeout(180_000);

const iso = (t: number) => new Date(t).toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
const CHOCH_TIME = Date.UTC(2026, 9, 29, 20, 0);

async function pickVisible(page: Page, marks: Mark[], box: { x: number; y: number; width: number; height: number }, pred: (m: Mark) => boolean, prefer?: (m: Mark) => number) {
  const list = marks.filter(pred).sort((a, b) => (prefer ? prefer(b) - prefer(a) : b.anchors[0]!.time - a.anchors[0]!.time));
  for (const m of list) {
    const pts = await tapsForAlgoMark(page, m, box);
    if (pts) return { m, pts };
  }
  return null;
}

const THEME = process.env.SHOTS_THEME === 'light' ? 'light' : 'dark';

test(`терминал: разметка из вывода ядра и разбор после «Проверить»`, async ({ page }, info) => {
  if (THEME === 'light') await page.addInitScript(() => localStorage.setItem('tl:appearance', JSON.stringify({ theme: 'light', candleStyle: 'color' })));
  const chart = await openTerminal(page);
  const box = await chartBox(chart);
  const marks = await coreMarks(page);
  const log: Record<string, unknown>[] = [];
  const check = page.getByTestId(isMobile(page) ? 'check-button-mobile' : 'check-button');

  const picks = [
    await pickVisible(page, marks, box, (m) => m.kind === 'choch' && m.anchors[1]!.time === CHOCH_TIME),
    await pickVisible(page, marks, box, (m) => m.kind === 'bos' && m.anchors[1]!.time !== CHOCH_TIME),
    await pickVisible(page, marks, box, (m) => (m.kind === 'swing-high' || m.kind === 'swing-low') && m.scope === 'external'),
    await pickVisible(page, marks, box, (m) => m.kind === 'order-block' && m.meta?.valid === true && m.meta?.status !== 'invalidated'),
    await pickVisible(page, marks, box, (m) => m.kind === 'fvg' && m.meta?.status !== 'filled', (m) => Math.abs(m.anchors[0]!.price - m.anchors[1]!.price)),
  ];
  for (const p of picks) {
    if (!p) continue;
    await drawAlgoMark(page, p.m, p.pts);
    log.push({ kind: p.m.kind, id: p.m.id, scope: p.m.scope, direction: p.m.direction, source: 'toMarks(analyzeStructure(medium))', anchors: p.m.anchors.map((a) => ({ t: iso(a.time), price: a.price })) });
  }

  // уровень: из findLevels (ближайшая к цене зона), касание у фитиля её последнего swing
  const levels = await coreLevels(page);
  for (const lv of levels) {
    const sw = lv.swings[lv.swings.length - 1]!;
    const pt = await project(page, sw.time, sw.price);
    if (pt && pt.x > box.x + 12 && pt.x < box.x + box.width - 70 && pt.y > box.y + 20 && pt.y < box.y + box.height - 60) {
      await selectTool(page, 'Уровень', 'Линии');
      await tapAt(page, pt);
      log.push({ kind: 'level', source: 'findLevels', center: lv.center, touches: lv.touches, snappedTo: { t: iso(sw.time), price: sw.price } });
      break;
    }
  }
  await selectTool(page, 'Выбор');
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${dir}/${info.project.name}-${THEME}-marks.png` });

  await check.click();
  await page.getByTestId('check-panel').waitFor();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${dir}/${info.project.name}-${THEME}-check.png` });
  log.push({ checkCodes: await page.getByTestId('check-panel').getAttribute('data-codes') });
  writeFileSync(`${dir}/${info.project.name}-marks.json`, JSON.stringify(log, null, 2));
});

test(`терминал: BOS на месте CHoCH ядра - разбор ошибки`, async ({ page }, info) => {
  const chart = await openTerminal(page);
  const box = await chartBox(chart);
  const marks = await coreMarks(page);
  const p = await pickVisible(page, marks, box, (m) => m.kind === 'choch' && m.anchors[1]!.time === CHOCH_TIME);
  if (!p) throw new Error('CHoCH 29 окт 20:00 не найден ядром среди видимых');
  await selectTool(page, 'BOS', 'Пробои');
  for (const pt of p.pts) await tapAt(page, pt);
  await page.getByTestId(isMobile(page) ? 'check-button-mobile' : 'check-button').click();
  await page.getByTestId('check-panel').waitFor();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${dir}/${info.project.name}-dark-check-confused.png` });
  writeFileSync(`${dir}/${info.project.name}-confused.json`, JSON.stringify({ coreMark: p.m.id, codes: await page.getByTestId('check-panel').getAttribute('data-codes') }, null, 2));
});
