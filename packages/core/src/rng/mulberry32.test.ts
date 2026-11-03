import { describe, expect, it } from 'vitest';
import { mulberry32, randInt } from './mulberry32';

describe('mulberry32', () => {
  it('детерминирован и в [0,1)', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 100; i++) {
      const x = a();
      expect(x).toBe(b());
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });
  it('известные значения seed=1 (эталон алгоритма mulberry32)', () => {
    const r = mulberry32(1);
    expect(r()).toBeCloseTo(0.6270739405881613, 15);
    expect(r()).toBeCloseTo(0.002735721180215478, 15);
  });
  it('разные seed дают разные потоки; randInt в диапазоне', () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
    const r = mulberry32(7);
    for (let i = 0; i < 50; i++) expect(randInt(r, 5)).toBeLessThan(5);
  });
});
