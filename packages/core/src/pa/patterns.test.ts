import { describe, expect, it } from 'vitest';
import { loadKlines } from '../testing/fixtures-pa-challenge';
import type { Candle } from '../types';
import { detectPatterns } from './patterns';

const c4h = loadKlines('klines/BTCUSDT/4h/BTCUSDT-4h-2026-09.csv');
const ts = (m: number, d: number, h: number) => Date.UTC(2026, m - 1, d, h);
const idx = (m: number, d: number, h: number) => c4h.findIndex((c) => c.openTime === ts(m, d, h));
const all = detectPatterns(c4h);
const at = (type: string, m: number, d: number, h: number) =>
  all.find((p) => p.type === type && p.lastIndex === idx(m, d, h));

describe('detectPatterns: GS-5, BTCUSDT 4h 2026-09 (реальные свечи)', () => {
  it('morning-star 09-08 04:00..12:00', () => {
    const p = at('morning-star', 9, 8, 12)!;
    expect(p.direction).toBe('bull');
    expect(p.firstIndex).toBe(idx(9, 8, 4));
    expect(p.time).toBe(ts(9, 8, 12));
  });
  it('evening-star 09-09 04:00..12:00 и 09-27 04:00..12:00', () => {
    expect(at('evening-star', 9, 9, 12)!.direction).toBe('bear');
    expect(at('evening-star', 9, 9, 12)!.firstIndex).toBe(idx(9, 9, 4));
    expect(at('evening-star', 9, 27, 12)).toBeDefined();
  });
  it('pin-bar bull 09-06 12:00 (медвежья по цвету), bear 09-19 00:00 (бычья по цвету), bull 09-28 08:00', () => {
    const bull = at('pin-bar', 9, 6, 12)!;
    expect(bull.direction).toBe('bull');
    expect(c4h[bull.lastIndex]!.close).toBeLessThan(c4h[bull.lastIndex]!.open);
    const bear = at('pin-bar', 9, 19, 0)!;
    expect(bear.direction).toBe('bear');
    expect(c4h[bear.lastIndex]!.close).toBeGreaterThan(c4h[bear.lastIndex]!.open);
    expect(at('pin-bar', 9, 28, 8)!.direction).toBe('bull');
  });
  it('doji 09-05 16:00 не является pin-bar (range < 0.8 ATR)', () => {
    expect(at('doji', 9, 5, 16)).toBeDefined();
    expect(at('pin-bar', 9, 5, 16)).toBeUndefined();
    expect(at('doji', 9, 5, 16)!.direction).toBeNull();
  });
  it('inside-bar 09-03 04:00/08:00 и engulfing bull 09-04 04:00/08:00, 09-11 08:00/12:00', () => {
    const ib = at('inside-bar', 9, 3, 8)!;
    expect(ib.firstIndex).toBe(idx(9, 3, 4));
    expect(ib.direction).toBeNull();
    const e = at('engulfing', 9, 4, 8)!;
    expect(e.direction).toBe('bull');
    expect(e.firstIndex).toBe(idx(9, 4, 4));
    expect(c4h[e.lastIndex - 1]!.close).toBe(c4h[e.lastIndex]!.open); // стык open == close[i-1] == 80628.0
    expect(c4h[e.lastIndex]!.open).toBe(80628.0);
    expect(at('engulfing', 9, 11, 12)).toBeDefined();
  });
  it('полный набор: 65 экземпляров (ALGORITHMS §18.2 GS-5), порядок по lastIndex', () => {
    expect(all).toHaveLength(65);
    for (let i = 1; i < all.length; i++) expect(all[i]!.lastIndex).toBeGreaterThanOrEqual(all[i - 1]!.lastIndex);
  });
  it('детерминизм: двойной запуск идентичен', () => {
    expect(detectPatterns(c4h)).toEqual(detectPatterns(c4h));
  });
  it('незакрытый хвост не участвует в моделях (FR-DATA-08)', () => {
    const open: Candle[] = c4h.map((c, i) => (i === c4h.length - 1 ? { ...c, closed: false } : c));
    const res = detectPatterns(open);
    expect(res.every((p) => p.lastIndex < c4h.length - 1)).toBe(true);
    expect(res).toEqual(all.filter((p) => p.lastIndex < c4h.length - 1));
  });
  it('первые 14 свечей (ATR = null) моделей не дают', () => {
    expect(all.every((p) => p.lastIndex >= 14)).toBe(true);
  });
});

describe('detectPatterns: граничные случаи', () => {
  const base = c4h.slice(0, 20);
  // SYNTHETIC: свеча с range == 0 и точные границы порогов в реальных 4h-данных не встречаются
  function synthetic_flat(): Candle[] {
    const out = base.map((c) => ({ ...c }));
    const last = out[out.length - 1]!;
    out[out.length - 1] = { ...last, open: last.close, high: last.close, low: last.close };
    return out;
  }
  it('synthetic_ свеча с range == 0 не образует модель', () => {
    const res = detectPatterns(synthetic_flat());
    expect(res.filter((p) => p.lastIndex === 19)).toHaveLength(0);
  });
  it('synthetic_ меньше 15 свечей -> пусто', () => {
    expect(detectPatterns(c4h.slice(0, 10))).toEqual([]);
    expect(detectPatterns([])).toEqual([]);
  });
});
