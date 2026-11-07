import { describe, expect, it } from 'vitest';
import { btc1h, btc4h, visibleAt } from '../testing/cur';
import { gradeComboLevel, gradeComboSmc, sideOfZone, smcContext, validateCombo, zoneFromMark, type ComboAnswer } from './combo';
import { htfClosedBefore, levelsContext } from './generate';
import type { LimitOrder } from './limit';
import type { Mark } from '../types';

const h1 = btc1h();
const h4 = btc4h();
const zm = (a: number, b: number): Mark => ({ id: 'z', kind: 'zone', anchors: [{ time: 0, price: a }, { time: 0, price: b }], scope: null, direction: null, author: 'user' });
const lim = (price: number, type: LimitOrder['type'] = 'near-edge', frontK: number | null = null): LimitOrder => ({ price, type, frontK });
const ans = (z: [number, number], l: LimitOrder, sl: number, tp: number): ComboAnswer => ({ zone: zm(...z), limit: l, sl, tp });
const codeOf = (f: () => unknown): string => {
  try {
    f();
  } catch (e) {
    return (e as { code?: string }).code ?? String(e);
  }
  return 'ok';
};

describe('combo-level-trade (§8.1): CB-1..CB-3', () => {
  const ctxAt = (iso: string, role: 'support' | 'resistance' | null, d: 'medium' | 'hard' = 'medium') => {
    const v = visibleAt(h1, iso);
    return { v, ctx: levelsContext(v.visible, htfClosedBefore(h4, v.T, 500), role, d)! };
  };
  it('CB-1 SHORT: 94 correct, tp на k* (RR 1.8744 -> rr 6)', () => {
    const { v, ctx } = ctxAt('2026-09-12T00:00:00Z', 'resistance');
    const g = gradeComboLevel(ctx, v.visible, ans([79380, 79740], lim(79384.4), 80000, 78230.5), 'SHORT');
    expect(g.parts.map((p) => p.score)).toEqual([20, 25, 5, 20, 18, 6]);
    expect([g.quality, g.verdict, g.errors]).toEqual([94, 'correct', []]);
    expect(g.rr).toBeCloseTo(1.8744, 4);
    expect(g.targets.map((t) => t.price).slice(0, 4)).toEqual([79228.5, 78774, 78230.5, 77767.8]);
    expect(g.skillOutcomes.map((o) => [o.skill, o.correct])).toEqual([['level-zone', 1], ['limit-placement', 1], ['stop-placement', 1], ['take-profit', 1], ['risk-reward', 1]]);
  });
  it('CB-2 LONG: 100; CB-3 SHORT: 100', () => {
    const a = ctxAt('2026-09-15T00:00:00Z', 'support');
    const g2 = gradeComboLevel(a.ctx, a.v.visible, ans([77200, 77430], lim(77427.4), 77050, 78343.8), 'LONG');
    expect([g2.quality, g2.verdict]).toEqual([100, 'correct']);
    const b = ctxAt('2026-09-16T12:00:00Z', 'resistance');
    const g3 = gradeComboLevel(b.ctx, b.v.visible, ans([77290, 77470], lim(77291.2), 77600, 76458.9), 'SHORT');
    expect([g3.quality, g3.verdict]).toEqual([100, 'correct']);
  });
  it('слабые звенья: зона мимо, лимитка за зоной, стоп внутри структуры, tp за целями, RR < 1.5', () => {
    const { v, ctx } = ctxAt('2026-09-12T00:00:00Z', 'resistance');
    const bad = gradeComboLevel(ctx, v.visible, ans([78500, 78600], lim(79384.4), 79700, 77000), 'SHORT');
    expect(bad.errors.map((e) => e.code)).toEqual(expect.arrayContaining(['ZONE_OFF', 'SL_INSIDE_STRUCTURE', 'TP_BEYOND_TARGETS']));
    expect(bad.verdict).not.toBe('correct');
    expect(bad.parts[0]!.score).toBe(0);
    const wide = gradeComboLevel(ctx, v.visible, ans([79000, 80700], lim(79384.4), 80500, 78230.5), 'SHORT');
    expect(wide.parts[0]!.score).toBe(10);
    expect(wide.errors.map((e) => e.code)).toContain('ZONE_TOO_WIDE');
    const lowRr = gradeComboLevel(ctx, v.visible, ans([79380, 79740], lim(79384.4), 80000, 79000), 'SHORT');
    expect(lowRr.errors.map((e) => e.code)).toContain('RR_TOO_LOW');
    expect(lowRr.parts[5]!.score).toBe(0);
    const farLimit = gradeComboLevel(ctx, v.visible, ans([79380, 79740], lim(79700, 'middle'), 80000, 78230.5), 'SHORT');
    expect(farLimit.parts[1]!.score).toBe(6);
    expect(farLimit.parts[2]!.score).toBe(0);
  });
  it('другой кандидат той же роли: Zu - он, остальное оценивается относительно него', () => {
    const { v, ctx } = ctxAt('2026-09-12T00:00:00Z', 'resistance');
    const g = gradeComboLevel(ctx, v.visible, ans([77422.8, 77767.8], lim(77422.8), 78100, 76000), 'SHORT');
    expect(g.classification).toBe('LEVEL_NOT_STRONGEST');
    expect(g.parts[0]!.score).toBe(10);
    expect(g.matched.strength).toBe(14.5);
    expect(g.zone).toEqual({ bottom: 77422.8, top: 77767.8 });
  });
  it('hard (side = null): сторону задаёт зона относительно цены', () => {
    const { v, ctx } = ctxAt('2026-09-12T00:00:00Z', null, 'hard');
    const g = gradeComboLevel(ctx, v.visible, ans([79380, 79740], lim(79384.4), 80000, 78230.5), null);
    expect(g.side).toBe('SHORT');
    expect(codeOf(() => gradeComboLevel(ctx, v.visible, ans([79380, 79740], lim(79384.4), 80000, 78230.5), 'LONG'))).toBe('ZONE_SIDE_MISMATCH');
  });
});

describe('валидация ответа комбо (§11.3)', () => {
  const P = 100;
  const ok = ans([105, 110], lim(104), 111, 95);
  it('коды 400', () => {
    expect(validateCombo('SHORT', P, ok, 105, 110)).toBe('SHORT');
    expect(codeOf(() => validateCombo('LONG', P, ok, 105, 110))).toBe('ZONE_SIDE_MISMATCH');
    expect(codeOf(() => validateCombo(null, P, ans([99, 101], lim(104), 111, 95), 99, 101))).toBe('ZONE_SIDE_MISMATCH');
    expect(codeOf(() => validateCombo('SHORT', P, ans([105, 110], lim(99), 111, 95), 105, 110))).toBe('LIMIT_WRONG_SIDE');
    expect(codeOf(() => validateCombo('SHORT', P, ans([105, 110], lim(104, 'front-run'), 111, 95), 105, 110))).toBe('LIMIT_TYPE_INVALID');
    expect(codeOf(() => validateCombo('SHORT', P, ans([105, 110], lim(104), 103, 95), 105, 110))).toBe('SL_WRONG_SIDE');
    expect(codeOf(() => validateCombo('SHORT', P, ans([105, 110], lim(104), 111, 105), 105, 110))).toBe('TP_WRONG_SIDE');
  });
  it('zoneFromMark: ZONE_MARK_INVALID', () => {
    expect(zoneFromMark(zm(110, 105))).toEqual({ ub: 105, ut: 110 });
    expect(codeOf(() => zoneFromMark({ ...zm(1, 2), kind: 'level' }))).toBe('ZONE_MARK_INVALID');
    expect(codeOf(() => zoneFromMark(zm(5, 5)))).toBe('ZONE_MARK_INVALID');
    expect(codeOf(() => zoneFromMark({ ...zm(1, 2), anchors: [{ time: 0, price: 1 }] }))).toBe('ZONE_MARK_INVALID');
    expect(codeOf(() => zoneFromMark(zm(-1, 2)))).toBe('ZONE_MARK_INVALID');
    expect(sideOfZone(1, 3, 2)).toBeNull();
  });
});

describe('combo-smc-entry (§8.2): CB-S1, CB-S2 и классы POI', () => {
  const at = (iso: string) => {
    const v = visibleAt(h4, iso);
    return { v, ctx: smcContext(v.visible)! };
  };
  it('CB-S1: тренд up, fresh bull OB [80095.9-81295], dist 5.8257, защищённый low 74909.4', () => {
    const { v, ctx } = at('2026-10-06T00:00:00Z');
    expect(ctx.trend).toBe('up');
    expect(ctx.side).toBe('LONG');
    expect(ctx.protectedLevel).toBe(74909.4);
    expect(ctx.A).toBeCloseTo(717.5143, 4);
    expect(ctx.candidates[0]).toMatchObject({ kind: 'order-block', bottom: 80095.9, top: 81295, status: 'fresh' });
    expect(ctx.candidates[0]!.dist).toBeCloseTo(5.8257, 4);
    const g = gradeComboSmc(ctx, v.visible, ans([80095.9, 81295], lim(81295), 79850, 84350));
    expect([g.quality, g.verdict, g.poiCode]).toEqual([100, 'correct', 'OK_POI']);
    expect(g.skillOutcomes[0]).toEqual({ skill: 'order-block', correct: 1, total: 1 });
    expect(g.rr).toBeCloseTo(2.1142, 4);
  });
  it('CB-S2: тот же OB, dist 2.3727, tp 84901.6 (цель за k*) допустим', () => {
    const { v, ctx } = at('2026-09-30T20:00:00Z');
    expect(ctx.candidates[0]!.dist).toBeCloseTo(2.3727, 4);
    const g = gradeComboSmc(ctx, v.visible, ans([80095.9, 81295], lim(81295), 79800, 84901.6));
    expect([g.quality, g.verdict]).toEqual([100, 'correct']);
  });
  it('POI_OFF, POI_NOT_FRESH, TRADE_AGAINST_STRUCTURE и стоп за защищённым уровнем тренда', () => {
    const { v, ctx } = at('2026-10-06T00:00:00Z');
    const off = gradeComboSmc(ctx, v.visible, ans([83000, 83500], lim(83500), 82500, 85000));
    expect(off.poiCode).toBe('POI_OFF');
    expect(off.errors[0]).toMatchObject({ code: 'POI_OFF', severity: 'major', skill: 'order-block' });
    const stale = ctx.trendPois.find((p) => !p.fresh)!;
    expect(stale).toBeDefined();
    const mid = (stale.bottom + stale.top) / 2;
    const A = (ctx.P - 1000);
    void A;
    // зона интереса должна лежать ниже цены (LONG): берём устаревший POI ниже P
    const below = ctx.trendPois.find((p) => !p.fresh && p.top < ctx.P)!;
    const nf = gradeComboSmc(ctx, v.visible, ans([below.bottom, below.top], lim(below.top), below.bottom - 0.5 * ctx.A, ctx.P + 3000));
    expect(nf.poiCode).toBe('POI_NOT_FRESH');
    expect(nf.parts[0]!.score).toBe(8);
    expect(nf.errors.find((e) => e.code === 'POI_NOT_FRESH')!.severity).toBe('minor');
    const against = ctx.againstPois.find((p) => p.top < ctx.P)!;
    const ag = gradeComboSmc(ctx, v.visible, ans([against.bottom, against.top], lim(against.top), against.bottom - 0.5 * ctx.A, ctx.P + 3000));
    expect(ag.poiCode).toBe('TRADE_AGAINST_STRUCTURE');
    expect(ag.errors[0]).toMatchObject({ code: 'TRADE_AGAINST_STRUCTURE', severity: 'major' });
    void mid;
    // стоп за защищённым уровнем тренда 74909.4 с запасом: полный балл sl
    const prot = gradeComboSmc(ctx, v.visible, ans([80095.9, 81295], lim(81295), 74909.4 - 0.5 * ctx.A, 84350));
    expect(prot.parts[3]!.score).toBe(20);
    expect(prot.Pl).toBe(74909.4);
    const inside = gradeComboSmc(ctx, v.visible, ans([80095.9, 81295], lim(81295), 80200, 84350));
    expect(inside.errors.map((e) => e.code)).toContain('SL_INSIDE_STRUCTURE');
  });
});
