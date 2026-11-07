import { describe, expect, it } from 'vitest';
import { ALGO_VERSION, TIMEFRAME_MS, type Timeframe } from './index';

describe('TIMEFRAME_MS', () => {
  it('содержит точные длительности в мс', () => {
    expect(TIMEFRAME_MS['1m']).toBe(60_000);
    expect(TIMEFRAME_MS['15m']).toBe(900_000);
    expect(TIMEFRAME_MS['1h']).toBe(3_600_000);
    expect(TIMEFRAME_MS['4h']).toBe(14_400_000);
    expect(TIMEFRAME_MS['1d']).toBe(86_400_000);
  });

  it('каждый старший ТФ кратен младшему (агрегация 1m→15m→1h→4h→1d)', () => {
    const order: Timeframe[] = ['1m', '15m', '1h', '4h', '1d'];
    for (let i = 1; i < order.length; i++) {
      expect(TIMEFRAME_MS[order[i]!] % TIMEFRAME_MS[order[i - 1]!]).toBe(0);
    }
  });
});

describe('ALGO_VERSION', () => {
  it('равна 2.0.0 (курс по ступеням: MS переразмечен, запас стопа в Challenge)', () => {
    expect(ALGO_VERSION).toBe('2.0.0');
  });
});
