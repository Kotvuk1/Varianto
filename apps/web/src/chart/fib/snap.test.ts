import { describe, expect, it } from 'vitest';
import type { Candle } from '@tl/core';
import { snapFibAnchor } from './snap';

// SYNTHETIC: минимальный ряд для проверки правила снапа (экстремум в радиусе), не рыночные данные
const mk = (i: number, high: number, low: number): Candle => ({
  openTime: i * 60_000,
  closeTime: i * 60_000 + 59_999,
  open: (high + low) / 2,
  high,
  low,
  close: (high + low) / 2,
  volume: 1,
  quoteVolume: 1,
  trades: 1,
  closed: true,
});
const candles = [mk(0, 10, 5), mk(1, 12, 6), mk(2, 20, 8), mk(3, 14, 7), mk(4, 11, 2), mk(5, 13, 6)];

describe('snapFibAnchor', () => {
  it('касание у верха свечи притягивает к high локального максимума в радиусе', () => {
    expect(snapFibAnchor(candles, 1, 11.5)).toEqual({ time: 2 * 60_000, price: 20 });
  });
  it('касание у низа - к low локального минимума', () => {
    expect(snapFibAnchor(candles, 3, 7.2)).toEqual({ time: 4 * 60_000, price: 2 });
  });
  it('индекс вне ряда ограничивается', () => {
    expect(snapFibAnchor(candles, 99, 13)).toEqual({ time: 2 * 60_000, price: 20 });
  });
});
