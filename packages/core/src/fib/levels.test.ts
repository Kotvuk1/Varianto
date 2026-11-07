import { describe, expect, it } from 'vitest';
import {
  FIB_EXTENSION_INFO,
  FIB_EXTENSION_TARGETS,
  FIB_OTE,
  FIB_RETRACEMENT_LEVELS,
  fibDepth,
  fibExtensionPrice,
  fibLevelPrice,
  pdZone,
} from './levels';

// Значения FIBONACCI.md §12.2 (получены вручную по реальным свечам Binance, USDⓈ-M futures).
describe('формулы уровней (§2)', () => {
  it('константы сетки', () => {
    expect([...FIB_RETRACEMENT_LEVELS]).toEqual([0, 0.236, 0.382, 0.5, 0.618, 0.705, 0.786, 1]);
    expect(FIB_OTE).toEqual({ from: 0.62, to: 0.79 });
    expect([...FIB_EXTENSION_TARGETS]).toEqual([1, 1.272, 1.618]);
    expect([...FIB_EXTENSION_INFO]).toEqual([2]);
  });

  it('FG-1 (BTCUSDT 4h, bull A=80095.9 B=87385.1): уровни, OTE, EQ', () => {
    const A = 80095.9;
    const B = 87385.1;
    expect(fibLevelPrice(A, B, 0)).toBe(B);
    expect(fibLevelPrice(A, B, 1)).toBe(A);
    expect(fibLevelPrice(A, B, 0.382)).toBeCloseTo(84600.6256, 4);
    expect(fibLevelPrice(A, B, 0.5)).toBeCloseTo(83740.5, 4);
    expect(fibLevelPrice(A, B, 0.618)).toBeCloseTo(82880.3744, 4);
    expect(fibLevelPrice(A, B, 0.705)).toBeCloseTo(82246.214, 4);
    expect(fibLevelPrice(A, B, 0.786)).toBeCloseTo(81655.7888, 4);
    expect(fibLevelPrice(A, B, FIB_OTE.to)).toBeCloseTo(81626.632, 4);
    expect(fibLevelPrice(A, B, FIB_OTE.from)).toBeCloseTo(82865.796, 4);
  });

  it('FG-3 (ETHUSDT 1h, bear A=2779.0 B=2647.9): уровни для импульса вниз', () => {
    const A = 2779;
    const B = 2647.9;
    expect(fibLevelPrice(A, B, 0.382)).toBeCloseTo(2697.9802, 4);
    expect(fibLevelPrice(A, B, 0.5)).toBeCloseTo(2713.45, 4);
    expect(fibLevelPrice(A, B, 0.705)).toBeCloseTo(2740.3255, 4);
    expect(fibLevelPrice(A, B, 0.786)).toBeCloseTo(2750.9446, 4);
    expect(fibLevelPrice(A, B, 0.62)).toBeCloseTo(2729.182, 4);
    expect(fibLevelPrice(A, B, 0.79)).toBeCloseTo(2751.469, 4);
  });

  it('глубина коррекции: 0 = B, 1 = A', () => {
    expect(fibDepth(80095.9, 87385.1, 87385.1)).toBe(0);
    expect(fibDepth(80095.9, 87385.1, 80095.9)).toBe(1);
    expect(fibDepth(80095.9, 87385.1, 86146.1)).toBeCloseTo(0.17, 3); // FG-1: close[T]
    expect(fibDepth(2779, 2647.9, 2667.28)).toBeCloseTo(0.1478, 4); // FG-3
    expect(fibDepth(2403.33, 2666, 2535.21)).toBeCloseTo(0.4979, 4); // FG-4
    expect(fibDepth(80095.9, 87385.1, 79000)).toBeGreaterThan(1);
  });

  it('extension: цели от C на длину AB (FG-1 bull, FG-3 bear)', () => {
    expect(fibExtensionPrice(80095.9, 87385.1, 82832, 1)).toBeCloseTo(90121.2, 4);
    expect(fibExtensionPrice(80095.9, 87385.1, 82832, 1.272)).toBeCloseTo(92103.8624, 4);
    expect(fibExtensionPrice(80095.9, 87385.1, 82832, 1.618)).toBeCloseTo(94625.9256, 4);
    expect(fibExtensionPrice(80095.9, 87385.1, 82832, 2)).toBeCloseTo(97410.4, 4);
    expect(fibExtensionPrice(2779, 2647.9, 2738.68, 1)).toBeCloseTo(2607.58, 4);
    expect(fibExtensionPrice(2779, 2647.9, 2738.68, 1.272)).toBeCloseTo(2571.9208, 4);
    expect(fibExtensionPrice(2779, 2647.9, 2738.68, 1.618)).toBeCloseTo(2526.5602, 4);
  });

  it('Premium / Discount по уровню 0.5 независимо от направления', () => {
    expect(pdZone(80095.9, 87385.1, 86146.1)).toBe('premium');
    expect(pdZone(80095.9, 87385.1, 83000)).toBe('discount');
    expect(pdZone(80095.9, 87385.1, 83740.5)).toBe('equilibrium');
    expect(pdZone(2779, 2647.9, 2667.28)).toBe('discount'); // FG-3
    expect(pdZone(2779, 2647.9, 2730)).toBe('premium');
  });
});
