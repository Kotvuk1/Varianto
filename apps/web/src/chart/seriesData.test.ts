import { describe, expect, it } from 'vitest';
import type { Candle } from '@tl/core';
import { limitCandles, pricePrecision, toCandleData, toVolumeData } from './seriesData';
import type { ChartTokens } from './theme/chartTokens';

const H = 3_600_000;
const T0 = Date.UTC(2025, 0, 1);
// SYNTHETIC: минимальные свечи для проверки преобразований, не рыночные данные
const mk = (i: number, closed = true, o = 10, c = 12): Candle => ({
  openTime: T0 + i * H,
  closeTime: T0 + (i + 1) * H - 1,
  open: o,
  high: 13,
  low: 9,
  close: c,
  volume: 5,
  quoteVolume: 50,
  trades: 3,
  closed,
});
const tokens = {
  candleBull: '#3a86ff', candleBullFill: '#3a86ff', candleBear: '#ffb45e', candleBearFill: '#ffb45e',
  wickBull: '#3a86ff', wickBear: '#ffb45e', volumeBull: 'rgba(58, 134, 255, 0.35)', volumeBear: 'rgba(255, 180, 94, 0.35)',
} as ChartTokens;

describe('limitCandles: точка «сейчас»', () => {
  const cs = [mk(0), mk(1), mk(2), mk(3)];
  it('без now - все свечи', () => expect(limitCandles(cs)).toHaveLength(4));
  it('свечи, открывшиеся в момент now или позже, отбрасываются', () => {
    expect(limitCandles(cs, T0 + 2 * H).map((c) => c.openTime)).toEqual([T0, T0 + H]);
    expect(limitCandles(cs, T0 + 2 * H + 1)).toHaveLength(3);
  });
});

describe('toCandleData', () => {
  it('время в секундах UTC, пропуски не заполняются', () => {
    const d = [toCandleData(mk(0), tokens), toCandleData(mk(5), tokens)];
    expect(d[0]!.time).toBe(T0 / 1000);
    expect(d[1]!.time).toBe((T0 + 5 * H) / 1000);
  });
  it('растущая - бычий цвет (синий), падающая - медвежий (оранжевый)', () => {
    expect(toCandleData(mk(0, true, 10, 12), tokens).borderColor).toBe('#3a86ff');
    expect(toCandleData(mk(0, true, 12, 10), tokens).borderColor).toBe('#ffb45e');
  });
  it('незакрытая свеча получает полупрозрачную заливку, закрытая - нет', () => {
    expect(toCandleData(mk(0, true), tokens).color).toBe('#3a86ff');
    expect(toCandleData(mk(0, false), tokens).color).toMatch(/^rgba\(58, 134, 255, 0\.\d+\)$/);
  });
  it('объём окрашивается по направлению свечи', () => {
    expect(toVolumeData(mk(0, true, 10, 12), tokens).color).toBe('rgba(58, 134, 255, 0.35)');
    expect(toVolumeData(mk(0, true, 12, 10), tokens).value).toBe(5);
  });
});

describe('pricePrecision', () => {
  it('по порядку цены', () => {
    expect(pricePrecision(64000)).toBe(1);
    expect(pricePrecision(3000)).toBe(2);
    expect(pricePrecision(150)).toBe(2);
    expect(pricePrecision(0.5)).toBe(6);
  });
});
