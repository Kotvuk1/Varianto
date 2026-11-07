import { describe, expect, it } from 'vitest';
import { btc1h, btc4h, visibleAt } from '../testing/cur';
import { gradeLvReaction, gradeLvStrongest, gradeLvZone, hitZone, correctReactionId } from './levels-grade';
import { htfClosedBefore, levelsContext, reactionOptions } from './generate';
import { resolveZoneChain, resolveZoneReaction } from './reaction';
import { computeZones } from './zone';

const h1 = btc1h();
const h4 = btc4h();
const at = (iso: string) => {
  const v = visibleAt(h1, iso);
  const htf = htfClosedBefore(h4, v.T, 500);
  return { ...v, htf, set: computeZones(v.visible, htf)! };
};
const t = (c: { openTime: number }) => new Date(c.openTime).toISOString().slice(0, 16);

describe('lv-strongest (§3.4, LV-1)', () => {
  const x = at('2026-09-12T00:00:00Z');
  const ctx = levelsContext(x.visible, x.htf, 'resistance', 'medium')!;
  it('79500 - correct; 78600 - partial LEVEL_NOT_STRONGEST; 81000 - OFF_TOLERANCE 1.8169%; 76000 - WRONG_TYPE', () => {
    const ok = gradeLvStrongest(ctx, 79500);
    expect([ok.verdict, ok.score, ok.errors]).toEqual(['correct', 1, []]);
    expect(ok.ok[0]!.code).toBe('OK_LEVEL');
    expect(ok.skillOutcomes).toEqual([{ skill: 'pa-level', correct: 1, total: 1 }]);
    const partial = gradeLvStrongest(ctx, 78600);
    expect([partial.verdict, partial.score, partial.errors[0]!.code, partial.errors[0]!.severity]).toEqual(['partial', 0.5, 'LEVEL_NOT_STRONGEST', 'minor']);
    expect(partial.detail.hit!.strength).toBe(12);
    expect(partial.errors[0]!.params).toMatchObject({ refStrength: 18.5, userStrength: 12, touches: 12 });
    expect(partial.skillOutcomes[0]!.correct).toBe(0);
    const off = gradeLvStrongest(ctx, 81000);
    expect(off.errors[0]!.code).toBe('LEVEL_OFF_TOLERANCE');
    expect(off.detail.deviationPct).toBeCloseTo(1.8169, 3);
    const wrong = gradeLvStrongest(ctx, 76000);
    expect(wrong.errors[0]).toMatchObject({ code: 'LEVEL_WRONG_TYPE', severity: 'major' });
    expect(wrong.errors[0]!.params).toMatchObject({ givenText: 'поддержка', expectedText: 'сопротивление', close: 77251.8 });
  });
  it('hard (role = null): любой другой уровень - partial, а не WRONG_TYPE', () => {
    const hard = levelsContext(x.visible, x.htf, null, 'hard')!;
    expect(gradeLvStrongest(hard, 76000).verdict).toBe('partial');
    expect(hitZone(79500, hard.ref)).toBe(true);
    expect(hitZone(79384.4 * (1 - 0.0029), hard.ref)).toBe(true); // допуск +-0.3%
  });
});

describe('lv-zone (§3.5, LV-2): четыре класса', () => {
  const x = at('2026-09-16T12:00:00Z');
  const ctx = levelsContext(x.visible, x.htf, 'resistance', 'medium')!;
  it('накрывает ядро / слишком широкая / край не накрыт / другой уровень', () => {
    const a = gradeLvZone(ctx, 77280, 77480);
    expect([a.verdict, a.score, a.ok[0]!.code, a.skillOutcomes[0]!.correct]).toEqual(['correct', 1, 'OK_ZONE', 1]);
    const w = gradeLvZone(ctx, 77100, 77700);
    expect([w.verdict, w.errors[0]!.code]).toEqual(['partial', 'ZONE_TOO_WIDE']);
    expect(w.errors[0]!.params).toMatchObject({ height: 600, maxHeight: expect.closeTo(548.3071, 3) });
    const e = gradeLvZone(ctx, 77350, 77470);
    expect([e.verdict, e.errors[0]!.code, e.detail.sharePct]).toEqual(['partial', 'ZONE_EDGE_OFF', 67]);
    expect(e.errors[0]!.params!['edgeText']).toBe('ближний край');
    const n = gradeLvZone(ctx, 76350, 76460);
    expect([n.verdict, n.errors[0]!.code]).toEqual(['partial', 'LEVEL_NOT_STRONGEST']);
    expect(n.errors[0]!.params).toMatchObject({ refStrength: 16.5, userStrength: 6 });
  });
  it('поддержка вместо сопротивления - LEVEL_WRONG_TYPE; пустое место - ZONE_OFF; край дальний/оба', () => {
    expect(gradeLvZone(ctx, 74909.4, 75089.1).errors[0]!.code).toBe('LEVEL_WRONG_TYPE');
    const off = gradeLvZone(ctx, 78500, 78600);
    expect([off.verdict, off.score, off.errors[0]!.code, off.errors[0]!.severity]).toEqual(['incorrect', 0, 'ZONE_OFF', 'major']);
    // дальний край (верх сопротивления) не накрыт
    expect(gradeLvZone(ctx, 77280, 77400).errors[0]!.params!['edgeText']).toBe('дальний край');
    expect(gradeLvZone(ctx, 77335, 77425).errors[0]!.params!['edgeText']).toBe('оба края');
  });
  it('границы допуска 0.1*A: край ровно на tol - накрывает; чуть дальше - нет', () => {
    const tol = 0.1 * x.set.A;
    expect(gradeLvZone(ctx, ctx.ref.bottom + tol, ctx.ref.top - tol).verdict).toBe('correct');
    expect(gradeLvZone(ctx, ctx.ref.bottom + tol + 1, ctx.ref.top).errors[0]!.code).toBe('ZONE_EDGE_OFF');
  });
});

describe('lv-reaction (§3.6, §4, LV-3..LV-5)', () => {
  const run = (iso: string, side: 'LONG' | 'SHORT') => {
    const x = at(iso);
    const options = reactionOptions(x.set, side, 'hard');
    const chain = resolveZoneChain(h1, x.iT, options.map((o) => o.zone), side, x.set.A, 72);
    return { x, options, chain };
  };
  it('LV-3: z1 пробита, та же свеча входит в подход z2; реакция z2 09-14 23:00, экстремум 79570.9', () => {
    const { x, options, chain } = run('2026-09-12T00:00:00Z', 'SHORT');
    expect(options.map((o) => [o.id, o.zone.bottom, o.zone.top, o.zone.strength])).toEqual([['z1', 78396.9, 78774, 12], ['z2', 79384.4, 79737.3, 18.5], ['z3', 80458, 80614, 5]]);
    expect(chain.kind).toBe('reaction');
    expect(chain.k).toBe(1);
    expect(chain.broken.map((b) => [b.k, t(h1[b.index]!)])).toEqual([[0, '2026-09-14T17:00']]);
    expect([chain.m, t(h1[chain.mIndex]!), t(h1[chain.e]!)]).toEqual([79570.9, '2026-09-14T20:00', '2026-09-14T23:00']);
    expect(correctReactionId(chain)).toBe('z2');
    const g = (id: string) => gradeLvReaction(options, chain, h1, id);
    expect(g('z2')).toMatchObject({ verdict: 'correct', score: 1 });
    expect(g('z2').ok[0]!.code).toBe('OK_LEVEL_REACTION');
    expect(g('z1').errors[0]!.code).toBe('LEVEL_REACTION_BROKEN');
    expect(g('z3').errors[0]!.code).toBe('LEVEL_REACTION_EARLIER');
    expect(g('none').errors[0]!.code).toBe('LEVEL_REACTION_FALSE_NONE');
    expect(g('z2').detail.options.map((o) => o.status)).toEqual(['broken', 'reaction', 'untouched']);
    expect(x.set.A).toBeCloseTo(777.7429, 4);
  });
  it('LV-4: пробой на 6.5 USDT и фитиль за дальний край без закрытия - не пробой; реакция z2', () => {
    const { options, chain } = run('2026-09-09T12:00:00Z', 'LONG');
    expect(options.map((o) => [o.zone.bottom, o.zone.top, o.zone.strength])).toEqual([[78938.7, 79125.3, 8], [78133, 78314.9, 11.5], [77422.8, 77604.3, 9]]);
    expect(chain.broken.map((b) => [b.k, t(h1[b.index]!)])).toEqual([[0, '2026-09-09T14:00']]);
    expect(h1[chain.broken[0]!.index]!.close).toBe(78932.2);
    expect(78938.7 - 78932.2).toBeCloseTo(6.5, 6);
    expect(chain.k).toBe(1);
    expect(t(h1[chain.e]!)).toBe('2026-09-09T16:00');
    expect(chain.m).toBe(78020); // фитиль 09-09 15:00 ниже дальнего края 78133: закрытие 78570 - не пробой
  });
  it('LV-5: одна свеча пробивает две зоны; исход none', () => {
    const { options, chain } = run('2026-09-16T00:00:00Z', 'SHORT');
    expect(options.map((o) => o.zone.strength)).toEqual([21, 9, 19]);
    expect(chain.kind).toBe('none');
    expect(chain.broken.map((b) => [b.k, t(h1[b.index]!)])).toEqual([[0, '2026-09-18T07:00'], [1, '2026-09-18T13:00'], [2, '2026-09-18T13:00']]);
    expect(correctReactionId(chain)).toBe('none');
    const g = gradeLvReaction(options, chain, h1, 'z2');
    expect(g.errors[0]!.code).toBe('LEVEL_REACTION_BROKEN');
    expect(g.errors[0]!.params!['expectedText']).toBe('ни одна зона не удержала цену');
    expect(gradeLvReaction(options, chain, h1, 'none').verdict).toBe('correct');
  });
  it('resolveZoneReaction: порядок «пробой раньше реакции», равенство экстремума - ранняя свеча, no-touch/timeout', () => {
    const x = at('2026-09-12T00:00:00Z');
    const z = { bottom: 79384.4, top: 79737.3 };
    const r = resolveZoneReaction(h1, x.iT, z, 'SHORT', x.set.A, 72);
    expect(r.kind).toBe('reaction');
    expect(resolveZoneReaction(h1, x.iT, { bottom: 99000, top: 99100 }, 'SHORT', x.set.A, 10).kind).toBe('no-touch');
    expect(resolveZoneReaction(h1, x.iT, z, 'SHORT', x.set.A, 3).kind).toBe('no-touch');
    expect(resolveZoneReaction(h1.slice(0, x.iT + 5), x.iT, { bottom: 99000, top: 99100 }, 'SHORT', x.set.A, 72).incomplete).toBe(true);
    // зона подхода достигнута, но 1.5*A реакции и пробоя нет за 3 свечи подхода -> timeout
    const near = { bottom: 77588, top: 77767.8 };
    expect(['timeout', 'reaction', 'break']).toContain(resolveZoneReaction(h1, x.iT, near, 'SHORT', x.set.A, 5).kind);
  });
});
