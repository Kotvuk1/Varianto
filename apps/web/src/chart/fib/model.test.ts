import { describe, expect, it } from 'vitest';
import {
  FIB_EXTENSION_INFO,
  FIB_EXTENSION_TARGETS,
  FIB_OTE,
  FIB_RETRACEMENT_LEVELS,
  extensionLevels,
  fibDepth,
  fibDirection,
  fibExtensionPrice,
  fibLevelPrice,
  oteRange,
  pdZone,
  retracementLevels,
  thinLabels,
} from './model';

// SYNTHETIC: чистая арифметика формул FIBONACCI.md §2; цены взяты из примера FG-1 (BTCUSDT 4h, data.binance.vision)
const A = 80095.9;
const B = 87385.1;

describe('формулы §2', () => {
  it('константы уровней', () => {
    expect(FIB_RETRACEMENT_LEVELS).toEqual([0, 0.236, 0.382, 0.5, 0.618, 0.705, 0.786, 1]);
    expect(FIB_OTE).toEqual({ from: 0.62, to: 0.79 });
    expect(FIB_EXTENSION_TARGETS).toEqual([1, 1.272, 1.618]);
    expect(FIB_EXTENSION_INFO).toEqual([2]);
  });

  it('levelPrice(r) = B + r*(A-B): уровень 0 на B, уровень 1 на A', () => {
    expect(fibLevelPrice(A, B, 0)).toBe(B);
    expect(fibLevelPrice(A, B, 1)).toBe(A);
    expect(fibLevelPrice(A, B, 0.5)).toBeCloseTo((A + B) / 2, 9);
    expect(fibLevelPrice(A, B, 0.618)).toBeCloseTo(B + 0.618 * (A - B), 9);
  });

  it('то же для импульса вниз', () => {
    const a = 100;
    const b = 60;
    expect(fibLevelPrice(a, b, 0.5)).toBe(80);
    expect(fibLevelPrice(a, b, 0.25)).toBe(70);
  });

  it('depth - обратная функция', () => {
    expect(fibDepth(A, B, B)).toBe(0);
    expect(fibDepth(A, B, A)).toBe(1);
    for (const r of FIB_RETRACEMENT_LEVELS) expect(fibDepth(A, B, fibLevelPrice(A, B, r))).toBeCloseTo(r, 9);
    expect(fibDepth(A, B, A - 10)).toBeGreaterThan(1);
  });

  it('extension: C + x*(B-A), для bear цели ниже C', () => {
    expect(fibExtensionPrice(100, 200, 150, 1)).toBe(250);
    expect(fibExtensionPrice(100, 200, 150, 1.618)).toBeCloseTo(150 + 161.8, 9);
    expect(fibExtensionPrice(200, 100, 150, 1)).toBe(50);
    expect(fibExtensionPrice(200, 100, 150, 1.272)).toBeCloseTo(150 - 127.2, 9);
  });

  it('pdZone абсолютно: выше EQ - premium, ниже - discount', () => {
    expect(pdZone(100, 200, 160)).toBe('premium');
    expect(pdZone(100, 200, 140)).toBe('discount');
    expect(pdZone(100, 200, 150)).toBe('equilibrium');
    expect(pdZone(200, 100, 160)).toBe('premium');
    expect(pdZone(200, 100, 140)).toBe('discount');
  });

  it('направление по цене B против A', () => {
    expect(fibDirection(1, 2)).toBe('bull');
    expect(fibDirection(2, 1)).toBe('bear');
    expect(fibDirection(2, 2)).toBeNull();
  });
});

describe('наборы уровней', () => {
  it('retracement: 8 уровней в порядке спецификации, цены по формуле', () => {
    const l = retracementLevels(A, B);
    expect(l.map((x) => x.ratio)).toEqual([0, 0.236, 0.382, 0.5, 0.618, 0.705, 0.786, 1]);
    expect(l[0]!.price).toBe(B);
    expect(l[7]!.price).toBe(A);
    expect(l[4]!.price).toBeCloseTo(B + 0.618 * (A - B), 9);
  });

  it('порядок якорей не влияет на формулу: уровень 1 всегда на начале (первый якорь)', () => {
    const up = retracementLevels(100, 200);
    const down = retracementLevels(200, 100);
    expect(up.find((x) => x.ratio === 1)!.price).toBe(100);
    expect(down.find((x) => x.ratio === 1)!.price).toBe(200);
    expect(up.find((x) => x.ratio === 0.5)!.price).toBe(down.find((x) => x.ratio === 0.5)!.price);
  });

  it('OTE: границы 0.62 и 0.79', () => {
    const o = oteRange(100, 200);
    expect(o.from).toBeCloseTo(fibLevelPrice(100, 200, 0.62), 9);
    expect(o.to).toBeCloseTo(fibLevelPrice(100, 200, 0.79), 9);
  });

  it('extension строится от C на величину |B-A|; 2.0 - справочный', () => {
    const l = extensionLevels(100, 200, 160);
    expect(l.map((x) => x.ratio)).toEqual([1, 1.272, 1.618, 2]);
    expect(l.map((x) => x.info)).toEqual([false, false, false, true]);
    expect(l[0]!.price).toBe(260);
    expect(l[3]!.price).toBe(360);
    const bear = extensionLevels(200, 100, 140);
    expect(bear[0]!.price).toBe(40);
    expect(bear[1]!.price).toBeCloseTo(140 - 127.2, 9);
  });
});

describe('thinLabels', () => {
  it('оставляет подписи, не ближе minGap по вертикали; приоритет у меньшего priority', () => {
    const items = [
      { key: 'a', y: 100, priority: 2 },
      { key: 'b', y: 104, priority: 1 },
      { key: 'c', y: 140, priority: 3 },
    ];
    expect(thinLabels(items, 18)).toEqual(new Set(['b', 'c']));
  });
});
