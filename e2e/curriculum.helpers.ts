import { expect, type Page } from '@playwright/test';
import { chartBox, chartCandles, project, selectTool, tapAt } from './terminal.helpers';

export { selectTool };

export type Side = 'LONG' | 'SHORT';

/** Сторона сделки из текста задания (покупка / продажа). */
export async function sideFromTask(page: Page): Promise<Side> {
  const txt = (await page.getByTestId('task-text').first().innerText()).toLowerCase();
  return /продаж|сопротивлен|вниз/.test(txt) && !/покупк/.test(txt) ? 'SHORT' : 'LONG';
}

/** Точка графика на цене `close * (1 ± frac)`, видимая в области графика; ищет первую подходящую долю. */
export async function pricePoint(page: Page, side: Side, fracs: number[] = [0.004, 0.007, 0.011, 0.016, 0.022], fromEnd = 10) {
  const box = await chartBox(page.getByTestId('chart'));
  const cs = (await chartCandles(page)).filter((c) => c.closed);
  const last = cs[cs.length - 1]!;
  const ref = cs[cs.length - 1 - fromEnd]!;
  for (const f of fracs) {
    const price = last.close * (side === 'LONG' ? 1 - f : 1 + f);
    const p = await project(page, ref.openTime, price);
    if (p && p.x > box.x + 12 && p.x < box.x + box.width - 80 && p.y > box.y + 24 && p.y < box.y + box.height - 60) return { ...p, price };
  }
  throw new Error('нет видимой точки цены');
}

export async function tapPrice(page: Page, side: Side, fracs?: number[], fromEnd?: number) {
  const p = await pricePoint(page, side, fracs, fromEnd);
  await tapAt(page, p);
  return p;
}

/** Нажать «Проверить», пропустить проигрывание будущего и дождаться разбора. */
export async function checkReplayResult(page: Page) {
  await page.getByTestId('check-button').click();
  await page.getByTestId('replay-skip').click({ timeout: 60_000 });
  await expect(page.getByTestId('result')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId('feedback-view')).toBeVisible();
  await page.waitForTimeout(600);
}

export async function noHScroll(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

/**
 * Прогресс-записи в IndexedDB для проверки открытия комбо.
 * SYNTHETIC: искусственные попытки (не рыночные данные), нужны только чтобы проверить отображение замка/открытия.
 */
export async function seedAttempts(page: Page, specs: { module: string; skill: string; n: number }[]) {
  await page.evaluate(async (list) => {
    const db: IDBDatabase = await new Promise((res, rej) => {
      const r = indexedDB.open('trading-lab');
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    const tx = db.transaction('attempts', 'readwrite');
    const st = tx.objectStore('attempts');
    let t = Date.now() - 1_000_000;
    for (const s of list) {
      for (let i = 0; i < s.n; i++) {
        t += 1000;
        st.put({
          id: `synthetic_${s.module}_${i}`,
          module: s.module,
          taskId: `synthetic_${s.module}_${i}`,
          task: {},
          answer: {},
          grade: { verdict: 'correct', skillOutcomes: [{ skill: s.skill, correct: 1, total: 1 }] },
          algoVersion: 'synthetic',
          skills: [s.skill],
          correct: true,
          rMultiple: null,
          localDay: '2026-11-01',
          durationMs: 1000,
          createdAt: t,
          updatedAt: t,
        });
      }
    }
    await new Promise<void>((res, rej) => {
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
    db.close();
  }, specs);
}
