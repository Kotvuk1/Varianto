// Правила (§4) и рекомендации (§5): граничные значения. Числовые входы - формулы на нормированных ценах, свечей нет.
import { describe, expect, it } from 'vitest';
import { correctionGuides, correctionRules, impulseGuides, impulseRules, measure, priceOrderViolation, validCorrectionTypes } from './measure';

/** v-точки импульса по L1=100: v0=0, v1=100, v2=100-r2*100, v3=v2+r3*100, v4=v3-r4*L3, v5=v4+L5. */
function imp(r2: number, r3: number, r4: number, L5: number): number[] {
  const v2 = 100 - r2 * 100;
  const L3 = r3 * 100;
  const v3 = v2 + L3;
  const v4 = v3 - r4 * L3;
  return [0, 100, v2, v3, v4, v4 + L5];
}
const ruleOf = (v: number[], rule: string) => impulseRules(v, 1).find((r) => r.rule === rule)!;

describe('правила импульса §4.1', () => {
  it('wave 2 ровно на 100% (двойное дно) допустима, чуть глубже - нарушение', () => {
    expect(ruleOf(imp(1, 2, 0.3, 150), 'w2').ok).toBe(true);
    expect(ruleOf(imp(1.0001, 2, 0.3, 150), 'w2').ok).toBe(false);
  });
  it('wave 3 должна выйти за конец wave 1: равенство - нарушение', () => {
    const v = [0, 100, 40, 100, 70, 160];
    expect(ruleOf(v, 'w3-beyond-w1').ok).toBe(false);
    expect(ruleOf([0, 100, 40, 100.01, 70, 160], 'w3-beyond-w1').ok).toBe(true);
  });
  it('wave 3 не самая короткая: равенство длин допустимо, строго короче обеих - нарушение', () => {
    // L1=100, L3=100 (равна L1), L5=300
    expect(ruleOf([0, 100, 50, 150, 120, 420], 'w3-shortest').ok).toBe(true);
    // L3=99.99 < L1 и < L5
    expect(ruleOf([0, 100, 50, 149.99, 120, 420], 'w3-shortest').ok).toBe(false);
    // короче только wave 1, но не wave 5 - допустимо
    expect(ruleOf([0, 100, 50, 149.99, 120, 160], 'w3-shortest').ok).toBe(true);
  });
  it('wave 4 касается конца wave 1 - нарушение (зона включает конец)', () => {
    expect(ruleOf([0, 100, 40, 200, 100, 260], 'w4-overlap').ok).toBe(false);
    expect(ruleOf([0, 100, 40, 200, 100.01, 260], 'w4-overlap').ok).toBe(true);
  });
  it('набор правил зависит от числа точек', () => {
    expect(impulseRules([0, 100, 40], 1).map((r) => r.rule)).toEqual(['w2']);
    expect(impulseRules([0, 100, 40, 200, 150], 1).map((r) => r.rule)).toEqual(['w2', 'w3-beyond-w1', 'w4-overlap']);
    expect(impulseRules(imp(0.5, 2, 0.3, 150), 1).map((r) => r.rule)).toEqual(['w2', 'w3-beyond-w1', 'w3-shortest', 'w4-overlap']);
  });
  it('bear: actual/limit в реальных ценах', () => {
    const r = impulseRules([0, -100, -40], -1).find((x) => x.rule === 'w2')!;
    expect([r.actual, r.limit]).toEqual([40, 0]);
  });
});

/** Коррекция после импульса 0..5 (v5=300, v0=0): A=v5-a, B=A+retrB*a, C=A-cBeyond*a. */
function withCorr(a: number, retrB: number, cBeyond: number): number[] {
  const vA = 300 - a;
  return [0, 100, 40, 200, 150, 300, vA, vA + retrB * a, vA - cBeyond * a];
}

describe('правила коррекций §4.2', () => {
  it('zigzag: B строго меньше 100% A, C строго за концом A', () => {
    const t = (r: number, c: number) => correctionRules('zigzag', measure(withCorr(100, r, c))).map((x) => x.ok);
    expect(t(0.99, 0.01)).toEqual([true, true]);
    expect(t(1, 0.5)).toEqual([false, true]);
    expect(t(0.5, 0)).toEqual([true, false]);
  });
  it('flat: B не меньше 90% A, C не короче конца A более чем на 10%', () => {
    const t = (r: number, c: number) => correctionRules('flat', measure(withCorr(100, r, c))).map((x) => x.ok);
    expect(t(0.9, -0.1)).toEqual([true, true]);
    expect(t(0.8999, -0.1)).toEqual([false, true]);
    expect(t(1.2, -0.1001)).toEqual([true, false]);
  });
  it('зона 0.9 <= retrB < 1 при cBeyond > 0 допускает оба типа; retrB >= 1 - только flat; равные A и C - только flat', () => {
    expect(validCorrectionTypes(measure(withCorr(100, 0.95, 0.2)))).toEqual(['zigzag', 'flat']);
    expect(validCorrectionTypes(measure(withCorr(100, 1.05, 0.2)))).toEqual(['flat']);
    expect(validCorrectionTypes(measure(withCorr(100, 0.95, 0)))).toEqual(['flat']);
    expect(validCorrectionTypes(measure(withCorr(100, 0.5, 0.2)))).toEqual(['zigzag']);
  });
  it('измерения: retrB, cBeyond, cLen, corrRetr', () => {
    const m = measure(withCorr(120, 0.5, 0.25));
    expect([m.a, m.retrB, m.cBeyond, m.cLen]).toEqual([120, 0.5, 0.25, 0.75]);
    expect(m.corrRetr).toBeCloseTo((300 - m.cBeyond! * 0 - (300 - 120 - 0.25 * 120)) / 300, 12);
  });
});

describe('рекомендации §5', () => {
  const guide = (v: number[], idx: number[], g: string) => impulseGuides(measure(v), v, idx).find((x) => x.guide === g)!;
  const IDX = [0, 10, 14, 40, 44, 70];
  it('w2-depth: границы 0.46 и 0.658', () => {
    expect(guide(imp(0.4601, 2, 0.3, 150), IDX, 'w2-depth').ok).toBe(true);
    expect(guide(imp(0.4599, 2, 0.3, 150), IDX, 'w2-depth').ok).toBe(false);
    expect(guide(imp(0.6579, 2, 0.3, 150), IDX, 'w2-depth').ok).toBe(true);
    expect(guide(imp(0.6581, 2, 0.3, 150), IDX, 'w2-depth').ok).toBe(false);
  });
  it('w3-ratio: не меньше 1.4562 (длиннее - удлинённая 3-я)', () => {
    expect(guide(imp(0.5, 1.4563, 0.3, 150), IDX, 'w3-ratio').ok).toBe(true);
    expect(guide(imp(0.5, 1.4561, 0.3, 150), IDX, 'w3-ratio').ok).toBe(false);
    expect(guide(imp(0.5, 6, 0.3, 150), IDX, 'w3-ratio').ok).toBe(true);
  });
  it('w4-depth: граница 0.196 (EW-4: 0.1954 не выполнена) и 0.422', () => {
    expect(guide(imp(0.5, 2, 0.1954, 150), IDX, 'w4-depth').ok).toBe(false);
    expect(guide(imp(0.5, 2, 0.1961, 150), IDX, 'w4-depth').ok).toBe(true);
    expect(guide(imp(0.5, 2, 0.4219, 150), IDX, 'w4-depth').ok).toBe(true);
    expect(guide(imp(0.5, 2, 0.4221, 150), IDX, 'w4-depth').ok).toBe(false);
  });
  it('w5-ratio: |L5/L1-1| <= 0.1 или |L5/(v3-v0)-0.618| <= 0.0618', () => {
    expect(guide(imp(0.5, 2, 0.3, 109.9), IDX, 'w5-ratio').ok).toBe(true);
    expect(guide(imp(0.5, 2, 0.3, 111), IDX, 'w5-ratio').ok).toBe(false);
    const v = imp(0.5, 2, 0.3, 0); // v3 - v0 = 150
    const L5 = 0.618 * (v[3]! - v[0]!);
    expect(guide(imp(0.5, 2, 0.3, L5), IDX, 'w5-ratio').ok).toBe(true);
    expect(guide(imp(0.5, 2, 0.3, L5 * 1.2), IDX, 'w5-ratio').ok).toBe(false);
  });
  it('alternation: разница глубин >= 0.2 или время различается >= 2 раза', () => {
    expect(guide(imp(0.5, 2, 0.3, 150), [0, 10, 20, 40, 50, 70], 'alternation').ok).toBe(true); // глубины 0.2 (граница, с запасом float)
    expect(guide(imp(0.5, 2, 0.45, 150), [0, 10, 20, 40, 50, 70], 'alternation').ok).toBe(false);
    expect(guide(imp(0.5, 2, 0.45, 150), [0, 10, 14, 40, 50, 70], 'alternation').ok).toBe(true); // d2=4, d4=10
  });
  it('рекомендации коррекций (cLen = retrB + cBeyond при A = 100)', () => {
    const g = (t: 'zigzag' | 'flat', retrB: number, cLen: number) => correctionGuides(t, measure(withCorr(100, retrB, cLen - retrB))).map((x) => x.ok);
    expect(g('zigzag', 0.343, 0.618)).toEqual([true, true]);
    expect(g('zigzag', 0.341, 0.618)).toEqual([false, true]);
    expect(g('zigzag', 0.825, 1.099)).toEqual([true, true]); // 1 + 10%
    expect(g('zigzag', 0.827, 1.101)).toEqual([false, false]);
    expect(g('zigzag', 0.5, 1.7)).toEqual([true, true]); // 1.618 + 5%
    expect(g('flat', 1.381, 1.3)).toEqual([true, false]); // 1.3 вне 1±10% и 1.618±10%
    expect(g('flat', 1.381, 1.5)).toEqual([true, true]);
    expect(g('flat', 1.383, 1.0)).toEqual([false, true]);
    expect(correctionGuides('flat', measure(imp(0.5, 2, 0.3, 150)))).toEqual([]);
  });
  it('priceOrderViolation: чередование цен', () => {
    expect(priceOrderViolation([0, 100, 40, 200])).toBeNull();
    expect(priceOrderViolation([0, 100, 100])).toBe(1);
    expect(priceOrderViolation([0, 0])).toBe(0);
  });
});
