import { describe, expect, it } from 'vitest';
import type { SkillOutcome } from '@tl/core';
import { buildCourse } from './courseLogic';

// SYNTHETIC: проверка чистой логики открытия на искусственных попытках (данные свечей не участвуют)
const att = (module: string, skill: string, ok: boolean, t: number) => ({
  module,
  createdAt: t,
  grade: { skillOutcomes: [{ skill, correct: ok ? 1 : 0, total: 1 }] as SkillOutcome[] },
});
const many = (module: string, skill: string, n: number, okEvery: number, t0 = 0) =>
  Array.from({ length: n }, (_, i) => att(module, skill, i % okEvery !== 0 || okEvery === 1, t0 + i));

describe('buildCourse', () => {
  it('без попыток: рекомендована ступень 1, комбо закрыты, Challenge закрыт', () => {
    const c = buildCourse([]);
    expect(c.stages).toHaveLength(8);
    expect(c.stages.filter((s) => s.recommended).map((s) => s.id)).toEqual([1]);
    expect(c.combos.every((x) => !x.open)).toBe(true);
    expect(c.combos[0]!.remaining.map((r) => r.stage)).toEqual([2, 3, 4]);
    expect(c.combos[0]!.remaining[0]).toMatchObject({ attemptsLeft: 10, accuracy: null, needAccuracy: true });
  });

  it('ступень пройдена (10 заданий, 100%): рекомендация переходит дальше, остаток по комбо уменьшается', () => {
    const c = buildCourse([...many('levels', 'pa-level', 10, 1), ...many('limit-entry', 'limit-placement', 4, 1, 100)]);
    expect(c.stages[1]!.progress.status).toBe('passed');
    expect(c.recommended).toEqual({ kind: 'stage', id: 1 });
    const combo = c.combos[0]!;
    expect(combo.open).toBe(false);
    expect(combo.remaining.map((r) => r.stage)).toEqual([3, 4]);
    expect(combo.remaining[0]).toMatchObject({ stage: 3, attemptsLeft: 6 });
  });

  it('комбо «Уровень + лимитка + стоп/тейк» открывается после ступеней 2-4 (>=10 заданий, >=70%)', () => {
    const a = [
      ...many('levels', 'pa-level', 10, 1),
      ...many('limit-entry', 'limit-placement', 10, 1, 100),
      ...many('stop-take', 'stop-placement', 10, 1, 200),
    ];
    const c = buildCourse(a);
    expect(c.combos[0]!.open).toBe(true);
    expect(c.combos[0]!.remaining).toEqual([]);
    expect(c.combos[1]!.open).toBe(false); // SMC-вход ждёт ступень 5
    expect(c.combos[2]!.open).toBe(false);
  });

  it('точность ниже 70% при 10 заданиях: не открыто, нужна точность', () => {
    const c = buildCourse(many('limit-entry', 'limit-placement', 12, 2));
    const r = c.combos[0]!.remaining.find((x) => x.stage === 3)!;
    expect(r.attemptsLeft).toBe(0);
    expect(r.needAccuracy).toBe(true);
  });

  it('Challenge: сохраняется доступ при наличии попыток Challenge', () => {
    const c = buildCourse([att('challenge', 'x', true, 5)]);
    expect(c.combos[2]).toMatchObject({ open: true, legacy: true });
  });

  it('Challenge открывается после ступеней 1-5', () => {
    const a = [
      ...many('stage-swings', 'swing-trend', 10, 1),
      ...many('levels', 'pa-level', 10, 1, 100),
      ...many('limit-entry', 'limit-placement', 10, 1, 200),
      ...many('stop-take', 'take-profit', 10, 1, 300),
      ...many('market-structure', 'bos', 10, 1, 400),
    ];
    const c = buildCourse(a);
    expect(c.combos.map((x) => x.open)).toEqual([true, true, true]);
    expect(c.combos[2]!.legacy).toBe(false);
  });

  it('все 1-8 пройдены: рекомендуется первое открытое комбо', () => {
    const a = [
      ...many('stage-swings', 'swing-trend', 10, 1),
      ...many('levels', 'pa-level', 10, 1, 100),
      ...many('limit-entry', 'limit-placement', 10, 1, 200),
      ...many('stop-take', 'take-profit', 10, 1, 300),
      ...many('market-structure', 'bos', 10, 1, 400),
      ...many('price-action', 'pa-doji', 10, 1, 500),
      ...many('fibonacci', 'fib-anchor', 10, 1, 600),
      ...many('elliott', 'ew-impulse', 10, 1, 700),
    ];
    const c = buildCourse(a);
    expect(c.recommended).toEqual({ kind: 'combo', module: 'combo-level-trade' });
    expect(c.combos[0]!.recommended).toBe(true);
    expect(c.stages.some((s) => s.recommended)).toBe(false);
  });
});
