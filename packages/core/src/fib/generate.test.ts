import { describe, expect, it } from 'vitest';
import { detectSwings } from '../smc/swings';
import { readKlines } from '../testing/klines';
import type { Candle } from '../types';
import { availableOptions } from './reaction';
import { fibExtensionTask, fibGridTask, fibReactionTask, pickFibTask, type FibPick } from './generate';
import { buildExtensionRef, buildGridRef, buildReactionRef, fibLimit } from './ref';

// Реальные свечи BTCUSDT 1h (август-сентябрь 2026, 1464 свечи, непрерывный ряд). Глубина 300 - только для коротких фикстур.
const C = [...readKlines('klines/BTCUSDT/1h/BTCUSDT-1h-2026-08.csv'), ...readKlines('klines/BTCUSDT/1h/BTCUSDT-1h-2026-09.csv')];
const D = 300;
const idx = (t: number) => C.findIndex((c) => c.openTime === t);
const pick = (o: Partial<Parameters<typeof pickFibTask>[0]> & { taskType: 'grid' | 'reaction' | 'extension' }) =>
  pickFibTask({ candles: C, tf: '1h', difficulty: 'medium', seed: 1, depth: D, ...o });
const visibleOf = (p: FibPick): Candle[] => C.slice(p.endIndex - D + 1, p.endIndex + 1);

/** Все числа-«времена» (мс UTC) в объекте. */
function times(x: unknown, out: number[] = []): number[] {
  if (typeof x === 'number') {
    if (x > 1e12) out.push(x);
  } else if (Array.isArray(x)) x.forEach((v) => times(v, out));
  else if (x && typeof x === 'object') Object.values(x).forEach((v) => times(v, out));
  return out;
}

describe('pickFibTask: детерминизм и инварианты', () => {
  for (const taskType of ['grid', 'reaction', 'extension'] as const) {
    it(`${taskType}: одинаковый seed - одинаковый результат; разные seed дают разные ситуации`, () => {
      const a = pick({ taskType, difficulty: 'hard', seed: 7 });
      expect(a).not.toBeNull();
      expect(pick({ taskType, difficulty: 'hard', seed: 7 })).toEqual(a);
      const ends = new Set(Array.from({ length: 12 }, (_, i) => pick({ taskType, difficulty: 'hard', seed: i + 1 })?.endIndex));
      expect(ends.size).toBeGreaterThan(1);
    });
  }

  it('grid: эталон восстанавливается по видимому ряду; окно содержит A и B; подсказка направления только easy', () => {
    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      for (let seed = 1; seed <= 8; seed++) {
        const p = pick({ taskType: 'grid', difficulty, seed })!;
        expect(p).not.toBeNull();
        const vis = visibleOf(p);
        const ref = buildGridRef(vis, { nExt: p.nExt, aTime: p.aTime, bTime: p.bTime })!;
        expect(ref).not.toBeNull();
        expect(ref.impulse.confirmedIndex).toBeLessThanOrEqual(ref.T);
        expect(p.window!.fromTime).toBeLessThanOrEqual(p.aTime);
        expect(p.window!.toTime).toBe(vis[vis.length - 1]!.openTime);
        expect(p.T).toBe(vis[vis.length - 1]!.openTime + 3_600_000);
        expect(p.directionHint).toBe(p.evalDifficulty === 'easy' ? p.direction : null);
        // импульс в окне - последний и завершённый (§5.1 п.2)
        const bull = p.direction === 'bull';
        for (let i = idx(p.bTime) + 1; i <= p.endIndex; i++) expect(bull ? C[i]!.high > ref.impulse.b.price : C[i]!.low < ref.impulse.b.price).toBe(false);
        if (p.evalDifficulty === 'hard') {
          const from = idx(p.window!.fromTime);
          const a = idx(p.aTime);
          const prevLeg = C.slice(from, a).some((c) => (bull ? c.low < ref.impulse.a.price : c.high > ref.impulse.a.price));
          const leg = C.slice(a, idx(p.bTime) + 1);
          const internal = detectSwings(leg, { left: 2, right: 2 }, 'internal').some((s) => (bull ? s.type === 'high' : s.type === 'low'));
          expect(prevLeg || internal, 'ловушка hard').toBe(true);
        }
      }
    }
  });

  it('grid: payload не содержит данных позже T', () => {
    const p = pick({ taskType: 'grid', difficulty: 'easy', seed: 3 })!;
    const task = fibGridTask(p, '1h');
    expect(task).toMatchObject({ kind: 'fib-grid', tf: '1h', toleranceCandles: 2, tools: ['fib-retracement'] });
    for (const t of times(task)) expect(t).toBeLessThan(p.T);
  });

  it('reaction: эталон восстанавливается; класс ответа доступен и не пройден; исход после T; payload без будущего', () => {
    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      for (let seed = 1; seed <= 8; seed++) {
        const p = pick({ taskType: 'reaction', difficulty, seed });
        if (!p) continue;
        const vis = visibleOf(p);
        const ref = buildReactionRef(vis, C.slice(p.endIndex + 1, p.endIndex + 1 + fibLimit('1h')), {
          nExt: p.nExt, tf: '1h', evalDifficulty: p.evalDifficulty, aTime: p.aTime, bTime: p.bTime,
        })!;
        expect(ref).not.toBeNull();
        expect(ref.referenceOption).toBe(p.answerClass);
        expect(ref.options).toContain(ref.referenceOption);
        expect(ref.options).toEqual(availableOptions(ref.dT, p.evalDifficulty));
        expect(ref.outcome.index).toBeGreaterThan(ref.T);
        expect(ref.outcome.kind === 'reaction' || ref.outcome.kind === 'fail').toBe(true);
        if (p.evalDifficulty !== 'hard') expect(ref.options).not.toContain('deep');
        const task = fibReactionTask(ref, '1h', difficulty === 'easy', vis);
        expect(task.confluenceOptions).toEqual(['order-block', 'fvg', 'level']);
        expect(task.grid.author).toBe('algo');
        expect(task.limitCandles).toBe(72);
        expect(task.pdQuestion === null).toBe(!ref.pd.asked);
        expect(task.hints !== undefined).toBe(difficulty === 'easy');
        for (const t of times(task)) expect(t, JSON.stringify(task).slice(0, 80)).toBeLessThan(p.T);
        if (p.evalDifficulty === 'easy') expect(Object.values(ref.atReference).some(Boolean)).toBe(true);
      }
    }
  });

  it('reaction: балансировка - в строгом режиме встречаются разные классы, доля ни одного не вырождается', () => {
    const hist = new Map<string, number>();
    for (let seed = 1; seed <= 100; seed++) {
      const p = pick({ taskType: 'reaction', difficulty: 'hard', seed, allowRelax: false });
      if (p) hist.set(p.answerClass!, (hist.get(p.answerClass!) ?? 0) + 1);
    }
    const total = [...hist.values()].reduce((a, b) => a + b, 0);
    expect(hist.size).toBeGreaterThanOrEqual(3);
    for (const n of hist.values()) expect(n / total).toBeLessThan(0.6);
  });

  it('extension: эталон восстанавливается; цель из доступных; payload без будущего; none только hard', () => {
    let seen = 0;
    for (const difficulty of ['medium', 'hard'] as const) {
      for (let seed = 1; seed <= 12; seed++) {
        const p = pick({ taskType: 'extension', difficulty, seed });
        if (!p) continue;
        seen++;
        const vis = visibleOf(p);
        const ref = buildExtensionRef(vis, C.slice(p.endIndex + 1, p.endIndex + 1 + fibLimit('1h')), {
          nExt: p.nExt, tf: '1h', evalDifficulty: p.evalDifficulty, aTime: p.aTime, bTime: p.bTime,
        })!;
        expect(ref).not.toBeNull();
        expect(ref.outcome.reached).toBe(p.answerClass);
        expect(ref.c.time).toBe(p.cTime);
        if (p.evalDifficulty !== 'hard') expect(ref.outcome.reached).not.toBe('none');
        expect(ref.targetOptions.includes('none')).toBe(p.evalDifficulty === 'hard');
        const task = fibExtensionTask(ref, '1h', p.window!, p.directionHint);
        expect(task.tools).toEqual(['fib-extension']);
        for (const t of times(task)) expect(t).toBeLessThan(p.T);
        // C не за A и подтверждена реакцией до Te
        expect(ref.c.index).toBeLessThan(ref.T);
      }
    }
    expect(seen).toBeGreaterThan(3);
  });

  it('isExcluded исключает момент T', () => {
    const first = pick({ taskType: 'grid', difficulty: 'medium', seed: 5 })!;
    const again = pick({ taskType: 'grid', difficulty: 'medium', seed: 5, isExcluded: (T) => T === first.T });
    expect(again?.T).not.toBe(first.T);
  });

  it('короткий ряд: нет задания (null), без исключений', () => {
    expect(pickFibTask({ candles: C.slice(0, 200), tf: '1h', difficulty: 'hard', seed: 1, taskType: 'reaction', depth: D })).toBeNull();
  });
});
