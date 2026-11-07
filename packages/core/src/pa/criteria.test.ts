import { describe, expect, it } from 'vitest';
import { loadKlines } from '../testing/fixtures-pa-challenge';
import { patternCheck, patternCriterion } from './criteria';
import { detectPatterns, PATTERN_ORDER } from './patterns';

const c4h = loadKlines('klines/BTCUSDT/4h/BTCUSDT-4h-2026-09.csv');
const found = detectPatterns(c4h);

describe('patternCheck: согласован с detectPatterns (реальные свечи BTCUSDT 4h 2026-09)', () => {
  it('на каждом найденном экземпляре все проверки выполнены', () => {
    expect(found.length).toBeGreaterThan(20);
    for (const p of found) {
      const r = patternCheck(p.type, c4h, p.lastIndex);
      expect(r.failed, `${p.type}@${p.lastIndex}`).toEqual([]);
      expect(r.ok).toBe(true);
    }
  });

  it('там, где модели нет, есть хотя бы одно невыполненное условие', () => {
    const has = new Set(found.map((p) => `${p.type}:${p.lastIndex}`));
    for (const type of PATTERN_ORDER) {
      let checked = 0;
      for (let i = 20; i < c4h.length && checked < 25; i++) {
        if (has.has(`${type}:${i}`)) continue;
        checked++;
        const r = patternCheck(type, c4h, i);
        expect(r.ok, `${type}@${i}`).toBe(false);
        expect(r.failed.length).toBeGreaterThan(0);
        expect(patternCriterion(type, c4h, i, false)).not.toMatch(/[{}]/);
      }
    }
  });

  it('недостаток свечей слева не падает', () => {
    expect(patternCheck('morning-star', c4h, 1).ok).toBe(false);
    expect(patternCheck('doji', c4h, 3).ok).toBe(false);
  });
});
