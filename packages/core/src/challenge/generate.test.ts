import { describe, expect, it } from 'vitest';
import { loadKlines } from '../testing/fixtures-pa-challenge';
import type { Candle, TaskTimeframe, UtcMs } from '../types';
import { buildHints, pickChallengeScenario, type ChallengeSource } from './generate';
import { computeChallengeFacts, TIME_LIMIT_CANDLES } from './facts';

const c4h = loadKlines('klines/BTCUSDT/4h/BTCUSDT-4h-2026-09.csv');
const c15 = [...loadKlines('klines/BTCUSDT/15m/BTCUSDT-15m-2026-10-20.csv'), ...loadKlines('klines/BTCUSDT/15m/BTCUSDT-15m-2026-10-21.csv')];
const h1 = [...loadKlines('klines/BTCUSDT/1h/BTCUSDT-1h-2026-10-20.csv'), ...loadKlines('klines/BTCUSDT/1h/BTCUSDT-1h-2026-10-21.csv')];

const before = (series: Candle[], T: UtcMs) => series.filter((c) => c.closed && c.closeTime < T);

// Источник 1: 15m + старший 1h (реальные).
const src15: ChallengeSource = {
  candidates: c15.slice(40, 180).map((c) => c.closeTime + 1),
  closedAt: (tf: TaskTimeframe, T) => before(tf === '15m' ? c15 : h1, T),
  entryAt: (T) => c15.find((c) => c.closeTime === T - 1)!.close,
};
// Источник 2: 4h-ряд как рабочий и «старший» (htf(1d) = тренд самого ряда): реальные свечи, данных 1d нет.
const src4h: ChallengeSource = {
  candidates: c4h.slice(30, 170).map((c) => c.closeTime + 1),
  closedAt: (_tf, T) => before(c4h, T),
  entryAt: (T) => c4h.find((c) => c.closeTime === T - 1)!.close,
};
const MIN = { minHistory: 25, minHistoryHtf: 10 };

describe('pickChallengeScenario', () => {
  it('детерминирован по seed', () => {
    const a = pickChallengeScenario({ source: src4h, tfs: ['4h'], difficulty: 'medium', seed: 4, ...MIN })!;
    const b = pickChallengeScenario({ source: src4h, tfs: ['4h'], difficulty: 'medium', seed: 4, ...MIN })!;
    expect(a.T).toBe(b.T);
    expect(a.refSide).toBe(b.refSide);
    expect(a.defaultTf).toBe('4h');
  });
  it('easy: сторона LONG/SHORT, последнее внешнее событие — BOS в её сторону не старше 40 свечей', () => {
    const picked = new Set<number>();
    for (let s = 0; s < 12; s++) {
      const r = pickChallengeScenario({ source: src4h, tfs: ['4h'], difficulty: 'easy', seed: s, ...MIN })!;
      expect(r).not.toBeNull();
      picked.add(r.T);
      expect(r.refSide).not.toBe('WAIT');
      const e = r.facts.lastEvent!;
      expect(e.kind).toBe('bos');
      expect(e.direction).toBe(r.refSide === 'LONG' ? 'bull' : 'bear');
      expect(r.facts.lastIndex - e.breakIndex).toBeLessThanOrEqual(40);
      expect(r.facts.trendHtf).toBe(r.refSide === 'LONG' ? 'up' : 'down');
      expect(r.entry).toBe(r.facts.entry);
      expect(r.hints!.length).toBeGreaterThan(0);
    }
    expect(picked.size).toBeGreaterThan(1);
  });
  it('easy допускает только 1h/4h', () => {
    const r = pickChallengeScenario({ source: src4h, tfs: ['15m', '4h'], difficulty: 'easy', seed: 1, ...MIN })!;
    expect(r.defaultTf).toBe('4h');
  });
  it('medium: доля WAIT регулируется seed и waitShare', () => {
    let waits = 0;
    const N = 20;
    for (let s = 0; s < N; s++) {
      const r = pickChallengeScenario({ source: src4h, tfs: ['4h'], difficulty: 'medium', seed: s, waitShare: 1, ...MIN })!;
      if (r.refSide === 'WAIT') waits++;
    }
    expect(waits).toBe(N);
    let non = 0;
    for (let s = 0; s < N; s++) {
      const r = pickChallengeScenario({ source: src4h, tfs: ['4h'], difficulty: 'medium', seed: s, waitShare: 0, ...MIN })!;
      if (r.refSide !== 'WAIT') non++;
    }
    expect(non).toBeGreaterThan(N / 2);
  });
  it('hard: флэт / ложный пробой / sweep; ожидаемо WAIT', () => {
    let waits = 0;
    for (let s = 0; s < 10; s++) {
      const r = pickChallengeScenario({ source: src15, tfs: ['15m'], difficulty: 'hard', seed: s, ...MIN })!;
      expect(r).not.toBeNull();
      const f = r.facts;
      const flat = f.trendHtf === 'none';
      const flip = !!f.lastEvent && !!f.prevEvent && f.lastEvent.direction !== f.prevEvent.direction && f.lastIndex - f.prevEvent.breakIndex <= 60;
      const sweep = f.structure.sweeps.some((x) => x.index >= f.lastIndex - 9);
      expect(r.relaxedTo || flat || flip || sweep).toBeTruthy();
      if (r.refSide === 'WAIT') waits++;
    }
    expect(waits).toBeGreaterThanOrEqual(5);
  });
  it('isFeasible отсекает моменты без будущего', () => {
    const cut = c4h[100]!.closeTime + 1;
    const r = pickChallengeScenario({ source: { ...src4h, feasible: (T) => T <= cut }, tfs: ['4h'], difficulty: 'medium', seed: 2, ...MIN })!;
    expect(r.T).toBeLessThanOrEqual(cut);
  });
  it('нет подходящих моментов -> null', () => {
    expect(pickChallengeScenario({ source: { ...src4h, candidates: [] }, tfs: ['4h'], difficulty: 'hard', seed: 1 })).toBeNull();
    expect(pickChallengeScenario({ source: src4h, tfs: ['4h'], difficulty: 'hard', seed: 1 })).toBeNull(); // history < 300
  });
  it('пропуск в свечах -> момент отбракован', () => {
    // SYNTHETIC: пропуск — удалена одна реальная свеча
    const gappy = c4h.filter((_, i) => i !== 60);
    const src: ChallengeSource = { ...src4h, closedAt: (_tf, T) => before(gappy, T) };
    for (let s = 0; s < 6; s++) {
      const r = pickChallengeScenario({ source: src, tfs: ['4h'], difficulty: 'medium', seed: s, ...MIN });
      if (r) for (let i = 1; i < r.facts.candles.length; i++) expect(r.facts.candles[i]!.openTime - r.facts.candles[i - 1]!.openTime).toBe(4 * 3600_000);
    }
  });
});

describe('подсказки easy (14.6) и лимиты', () => {
  const sl = c4h.slice(0, 82);
  const f = computeChallengeFacts({ candles: sl, tf: '4h', htf: sl });
  const hints = buildHints(f);
  it('внешние swing последних 100 свечей, последнее событие, защищённый уровень', () => {
    expect(hints.some((h) => h.kind === 'swing-high' || h.kind === 'swing-low')).toBe(true);
    expect(hints.filter((h) => h.kind === 'bos' || h.kind === 'choch')).toHaveLength(1);
    const lvl = hints.find((h) => h.kind === 'level')!;
    expect(lvl.meta).toMatchObject({ role: 'protected' });
    expect(lvl.anchors[0]!.price).toBe(f.refHigh!.price); // тренд down -> защищённый high
    expect(hints.every((h) => h.author === 'algo')).toBe(true);
  });
  it('нет защищённого уровня при trend=none', () => {
    const early = c4h.slice(0, 21);
    const g = computeChallengeFacts({ candles: early, tf: '4h', htf: early });
    expect(buildHints(g).some((h) => h.kind === 'level')).toBe(false);
  });
  it('лимиты проигрывания по ТФ (OQ-09)', () => {
    expect(TIME_LIMIT_CANDLES).toEqual({ '15m': 96, '1h': 72, '4h': 60, '1d': 30 });
  });
});
