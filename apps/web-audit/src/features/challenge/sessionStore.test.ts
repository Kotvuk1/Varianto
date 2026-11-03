import { describe, expect, it } from 'vitest';
import type { Candle } from '@tl/core';
import { createSessionStore } from './sessionStore';
import type { ChallengeGradeResult, ChallengeTaskEnvelope } from './types';

const candle = (i: number): Candle => ({
  openTime: i * 3_600_000, closeTime: (i + 1) * 3_600_000 - 1, open: 100 + i, high: 103 + i, low: 98 + i, close: 101 + i, volume: 1, quoteVolume: 1, trades: 1, closed: true,
});
const series = Array.from({ length: 30 }, (_, i) => candle(i));
// SYNTHETIC: минимальный конверт для логики стора, не данные рынка
const task = {
  taskId: 'synthetic_t', taskToken: 'x'.repeat(20), difficulty: 'easy', symbol: 'BTCUSDT', algoVersion: 'v', expiresAt: 1, timeline: { mode: 'relative' },
  decisionTime: 30 * 3_600_000, series: { '1h': series }, payload: { kind: 'challenge', defaultTf: '1h', entryPrice: 130, reasonOptions: [], timeLimitCandles: { '15m': 96, '1h': 72, '4h': 60, '1d': 30 } },
} as unknown as ChallengeTaskEnvelope;

describe('sessionStore', () => {
  it('LONG ставит SL ниже и TP выше входа, WAIT сбрасывает уровни и лишние причины', () => {
    const s = createSessionStore();
    s.getState().loaded(task, 'auto');
    s.getState().setSide('LONG');
    const { sl, tp } = s.getState();
    expect(sl!).toBeLessThan(130);
    expect(tp!).toBeGreaterThan(130);
    s.getState().toggleReason('fvg-fill');
    s.getState().toggleReason('range-no-edge');
    s.getState().setSide('WAIT');
    expect(s.getState().sl).toBeNull();
    expect(s.getState().reasons).toEqual(['range-no-edge']);
  });
  it('проигрывание: tick доводит до результата, skip сразу', () => {
    const s = createSessionStore();
    s.getState().loaded(task, '4h');
    expect(s.getState().tf).toBe('4h');
    const grade = { replay: { tf: '1h', candles: [candle(30), candle(31)], exitIndex: 1 } } as unknown as ChallengeGradeResult;
    s.getState().graded(grade);
    expect(s.getState().tf).toBe('1h');
    s.getState().tick();
    s.getState().tick();
    expect(s.getState().played).toBe(2);
    expect(s.getState().phase).toBe('replay');
    s.getState().tick();
    expect(s.getState().phase).toBe('result');
    const k = createSessionStore();
    k.getState().loaded(task, 'auto');
    k.getState().graded(grade);
    k.getState().skip();
    expect(k.getState()).toMatchObject({ phase: 'result', played: 2, resultOpen: true });
  });
});
