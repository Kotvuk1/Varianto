import { describe, expect, it } from 'vitest';
import { loadKlines } from '../testing/fixtures-pa-challenge';
import { findLevels, gradeLevel, inLevelZone, pickLevelReference } from './levels';

const c4h = loadKlines('klines/BTCUSDT/4h/BTCUSDT-4h-2026-09.csv');
const r2 = (x: number) => Math.round(x * 100) / 100;

describe('findLevels: GS-6, BTCUSDT 4h 2026-09', () => {
  const { levels, width } = findLevels(c4h);
  const P = c4h[c4h.length - 1]!.close;

  it('P, ширина кластера W = 480.86 (A = 961.73)', () => {
    expect(P).toBe(83576.9);
    expect(r2(width)).toBe(480.86);
  });
  it('4 сильнейших уровня и порядок ранжирования', () => {
    const top = levels.slice(0, 4).map((l) => ({ c: r2(l.center), t: l.touches, lo: l.low, hi: l.high, type: l.type }));
    expect(top[0]).toEqual({ c: 76208.03, t: 6, lo: 75975.0, hi: 76402.9, type: 'support' });
    expect(top[1]).toEqual({ c: 85088.0, t: 4, lo: 84901.6, hi: 85224.0, type: 'resistance' });
    expect(top[2]).toEqual({ c: 79965.0, t: 4, lo: 79737.3, hi: 80167.0, type: 'support' });
    expect(top[3]).toEqual({ c: 82727.87, t: 3, lo: 82500.1, hi: 82851.5, type: 'support' });
  });
  it('далее уровни с 2 касаниями', () => {
    const rest = levels.slice(4);
    expect(rest.every((l) => l.touches === 2)).toBe(true);
    expect(rest.map((l) => r2(l.center))).toEqual(
      expect.arrayContaining([84452.45, 83290.1, 87316.2, 82108.35, 74967.2, 79348.1, 77538.75, 78627.05]),
    );
    expect(levels).toHaveLength(12);
  });
  it('касания сопротивления 85088.0: 09-22 04:00, 09-24 12:00, 09-25 08:00, 09-27 12:00', () => {
    const l = levels.find((x) => r2(x.center) === 85088.0)!;
    expect(l.swings.map((s) => s.time).sort()).toEqual(
      [Date.UTC(2026, 8, 22, 4), Date.UTC(2026, 8, 24, 12), Date.UTC(2026, 8, 25, 8), Date.UTC(2026, 8, 27, 12)],
    );
  });
  it('детерминизм', () => {
    expect(findLevels(c4h)).toEqual(findLevels(c4h));
  });
});

describe('допуск и эталон «Проведи уровень»', () => {
  const { levels } = findLevels(c4h);
  const res = levels.find((l) => Math.round(l.center) === 85088)!;
  const sup = levels.find((l) => Math.round(l.center) === 79965)!;

  it('допуск GS-6: сопротивление u ∈ [84646.90, 85479.67]; поддержка u ∈ [79498.09, 80407.50]', () => {
    expect(inLevelZone(84646.9, res, 0.3)).toBe(true);
    expect(inLevelZone(84646.0, res, 0.3)).toBe(false);
    expect(inLevelZone(85479.6, res, 0.3)).toBe(true);
    expect(inLevelZone(85480.5, res, 0.3)).toBe(false);
    expect(inLevelZone(79498.2, sup, 0.3)).toBe(true);
    expect(inLevelZone(79497.0, sup, 0.3)).toBe(false);
    expect(inLevelZone(80407.4, sup, 0.3)).toBe(true);
    expect(inLevelZone(80408.5, sup, 0.3)).toBe(false);
  });
  it('эталон: support -> 79965.0 (76208.03 дальше 5 ATR), resistance -> 85088.0', () => {
    const s = pickLevelReference(c4h, 'support', 'medium')!;
    expect(r2(s.ref.center)).toBe(79965.0);
    const r = pickLevelReference(c4h, 'resistance', 'medium')!;
    expect(r2(r.ref.center)).toBe(85088.0);
  });
  it('нет однозначного кандидата -> null (нет уровня того типа в пределах 5 ATR)', () => {
    expect(pickLevelReference(c4h.slice(0, 40), 'resistance', 'hard')).toBeNull();
  });

  it('оценка: точное попадание -> correct, OK_LEVEL, pa-level 1/1', () => {
    const g = gradeLevel(c4h, 'resistance', 85100, 'medium');
    expect(g.verdict).toBe('correct');
    expect(g.score).toBe(1);
    expect(g.errors).toEqual([]);
    expect(g.skillOutcomes).toEqual([{ skill: 'pa-level', correct: 1, total: 1 }]);
    expect(g.ok[0]!.code).toBe('OK_LEVEL');
    expect(g.detail.tolerancePct).toBe(0.3);
    expect(g.detail.referencePrice).toBeCloseTo(85088.0, 6);
    expect(g.detail.deviationPct).toBeCloseTo((12 / 85088) * 100, 3);
  });
  it('другой уровень того же типа (2+ касаний) -> partial LEVEL_NOT_STRONGEST', () => {
    const g = gradeLevel(c4h, 'support', 82727.87, 'medium'); // support 3 касания, не сильнейший (79965 — 4)
    expect(g.verdict).toBe('partial');
    expect(g.errors.map((e) => e.code)).toEqual(['LEVEL_NOT_STRONGEST']);
    expect(g.skillOutcomes).toEqual([{ skill: 'pa-level', correct: 0, total: 1 }]);
  });
  it('уровень другого типа -> incorrect LEVEL_WRONG_TYPE', () => {
    const g = gradeLevel(c4h, 'resistance', 79965, 'medium');
    expect(g.verdict).toBe('incorrect');
    expect(g.errors[0]!.code).toBe('LEVEL_WRONG_TYPE');
  });
  it('мимо любого уровня -> incorrect LEVEL_OFF_TOLERANCE с параметрами разбора', () => {
    const g = gradeLevel(c4h, 'resistance', 90000, 'medium');
    expect(g.verdict).toBe('incorrect');
    expect(g.errors[0]!.code).toBe('LEVEL_OFF_TOLERANCE');
    expect(g.errors[0]!.skill).toBe('pa-level');
    expect(g.errors[0]!.params).toMatchObject({ user: 90000, touches: 4, tolPct: 0.3 });
    expect(g.score).toBe(0);
  });
  it('нет эталона -> исключение', () => {
    expect(() => gradeLevel(c4h.slice(0, 40), 'resistance', 1, 'medium')).toThrow('NO_LEVEL_REFERENCE');
  });
});
