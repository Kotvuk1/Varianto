import { describe, expect, it } from 'vitest';
import { loadKlines } from '../testing/fixtures-pa-challenge';
import type { Candle } from '../types';
import { computeContext, htfClosedAt } from './context';
import {
  buildPatternAlgoMarkSet,
  FIND_WINDOW,
  patternGradeContext,
  pickContextTask,
  pickFindPattern,
  pickLevelTask,
} from './generate';
import { pickLevelReference } from './levels';
import { detectPatterns } from './patterns';

const c4h = loadKlines('klines/BTCUSDT/4h/BTCUSDT-4h-2026-09.csv');
const MIN = { minHistory: 60 }; // реальный ряд короче 300 свечей: порог прогрева уменьшен только в тестах

describe('pickFindPattern', () => {
  it('детерминирован по seed; цель встречается 1..max раз в окне 40 свечей', () => {
    const a = pickFindPattern({ candles: c4h, tf: '4h', difficulty: 'hard', seed: 5, ...MIN })!;
    const b = pickFindPattern({ candles: c4h, tf: '4h', difficulty: 'hard', seed: 5, ...MIN })!;
    expect(a).toEqual(b);
    const all = detectPatterns(c4h.slice(0, a.endIndex + 1));
    const inWin = all.filter((p) => p.type === a.target && p.lastIndex >= a.endIndex - FIND_WINDOW + 1);
    expect(inWin.length).toBeGreaterThanOrEqual(1);
    expect(inWin.length).toBeLessThanOrEqual(4);
    expect(a.instances.map((p) => p.lastIndex)).toEqual(inWin.map((p) => p.lastIndex));
    expect(a.T).toBe(c4h[a.endIndex]!.closeTime + 1);
    expect(a.window).toEqual({ fromIndex: a.endIndex - FIND_WINDOW + 1, toIndex: a.endIndex });
  });
  it('разные seed дают разные задания', () => {
    const ends = new Set(Array.from({ length: 12 }, (_, s) => pickFindPattern({ candles: c4h, tf: '4h', difficulty: 'medium', seed: s, ...MIN })!.endIndex));
    expect(ends.size).toBeGreaterThan(3);
  });
  it('easy: до 2 экземпляров, только крупные (range >= 1.0 ATR)', () => {
    for (let s = 0; s < 10; s++) {
      const r = pickFindPattern({ candles: c4h, tf: '4h', difficulty: 'easy', seed: s, ...MIN })!;
      expect(r.instances.length).toBeLessThanOrEqual(2);
      expect(r.relaxedTo ?? 'easy').toBe('easy');
    }
  });
  it('focus-цели ограничивают выбор', () => {
    const r = pickFindPattern({ candles: c4h, tf: '4h', difficulty: 'hard', seed: 1, targets: ['engulfing'], ...MIN })!;
    expect(r.target).toBe('engulfing');
  });
  it('нет подходящего момента -> null (мало истории)', () => {
    expect(pickFindPattern({ candles: c4h.slice(0, 20), tf: '4h', difficulty: 'hard', seed: 1 })).toBeNull();
  });
  it('отбраковывает окна с пропуском в свечах', () => {
    // SYNTHETIC: пропуск свечи, которого нет в выбранных реальных файлах (удалена одна реальная свеча)
    const synthetic_gap: Candle[] = c4h.filter((_, i) => i !== 100);
    for (let s = 0; s < 8; s++) {
      const r = pickFindPattern({ candles: synthetic_gap, tf: '4h', difficulty: 'hard', seed: s, ...MIN });
      if (r) {
        const vis = synthetic_gap.slice(Math.max(0, r.endIndex - 499), r.endIndex + 1);
        for (let i = 1; i < vis.length; i++) expect(vis[i]!.openTime - vis[i - 1]!.openTime).toBe(4 * 3600_000);
      }
    }
  });
  it('AlgoMarkSet и GradeContext для gradeMarks', () => {
    const r = pickFindPattern({ candles: c4h, tf: '4h', difficulty: 'hard', seed: 3, ...MIN })!;
    const set = buildPatternAlgoMarkSet(c4h, r.target, r.window);
    expect(set.required).toHaveLength(r.instances.length);
    expect(set.required.every((m) => m.kind === 'pattern' && m.meta?.patternType === r.target && m.author === 'algo')).toBe(true);
    expect(set.tolerated).toEqual([]);
    const ctx = patternGradeContext(c4h, r.target, r.window);
    expect(ctx).toMatchObject({ toleranceCandles: 2, iouMin: 0.5, levelPricePct: 0.1, scoped: false, window: r.window });
    expect(ctx.concepts[0]).toBe(r.target.endsWith('star') ? 'pa-star' : `pa-${r.target}`);
  });
});

describe('pickLevelTask', () => {
  it('эталон однозначен и в пределах 5 ATR; детерминирован', () => {
    const a = pickLevelTask({ candles: c4h, tf: '4h', difficulty: 'medium', seed: 2, ...MIN })!;
    expect(a).toEqual(pickLevelTask({ candles: c4h, tf: '4h', difficulty: 'medium', seed: 2, ...MIN }));
    const ref = pickLevelReference(c4h.slice(0, a.endIndex + 1), a.levelType, a.difficulty)!;
    expect(ref.ref.center).toBe(a.reference.center);
    expect(a.reference.touches).toBeGreaterThanOrEqual(a.difficulty === 'easy' ? 2 : 3);
    expect(a.tolerancePct).toBe(0.3);
  });
  it('нет подходящего -> null', () => {
    expect(pickLevelTask({ candles: c4h.slice(0, 30), tf: '4h', difficulty: 'hard', seed: 2 })).toBeNull();
  });
});

describe('pickContextTask', () => {
  // Старший ряд для 4h-теста — тот же реальный ряд (htf(1d) = 1d, тренд самого ряда).
  it('выдаёт задание с желаемой значимостью (50/50 по seed) и без заглядывания вперёд', () => {
    let sig = 0;
    for (let s = 0; s < 8; s++) {
      const r = pickContextTask({ candles: c4h, tf: '4h', difficulty: 'medium', seed: s, htf: c4h, ...MIN })!;
      expect(r).not.toBeNull();
      const p = r.pattern;
      expect(['engulfing', 'pin-bar', 'morning-star', 'evening-star']).toContain(p.type);
      expect(r.endIndex).toBe(p.lastIndex);
      const recomputed = computeContext(c4h, p, htfClosedAt(c4h, r.T));
      expect(recomputed).toEqual(r.reference);
      expect(r.T).toBe(c4h[p.lastIndex]!.closeTime + 1);
      if (!r.inverted) expect(r.reference.significant).toBe(r.desired);
      if (r.reference.significant) sig++;
    }
    expect(sig).toBeGreaterThan(0);
    expect(sig).toBeLessThan(8);
  });
  it('нет моделей -> null', () => {
    expect(pickContextTask({ candles: c4h.slice(0, 20), tf: '4h', difficulty: 'easy', seed: 1, htf: c4h })).toBeNull();
  });
});
