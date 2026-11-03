import { describe, expect, it } from 'vitest';
import { analyzeStructure } from '../smc/analyze';
import { buildAlgoMarkSet, toMarks } from '../smc/marks';
import { iso, readKlines } from '../testing/klines';
import { gradeMarks } from './grade';
import type { GradeContext, Mark, SkillId, StructureParams } from '../types';

const candles = readKlines('klines/BTCUSDT/4h/BTCUSDT-4h-2026-09.csv');
const P: StructureParams = { nExt: 5, nInt: 3, sweepHoldK: 3, fvgMinAtr: 0.5, obDisplacementAtr: 1.2 };
const r = analyzeStructure(candles, P);
const window = { fromIndex: 30, toIndex: candles.length - 1 };
const ALL: SkillId[] = ['swing', 'structure-labels', 'bos', 'choch', 'internal-external', 'sweep', 'fvg', 'order-block'];
const ctxOf = (concepts: SkillId[], scoped = true): GradeContext => ({
  candles, window, concepts, toleranceCandles: 2, iouMin: 0.5, levelPricePct: 0.1, scoped,
});
const algoOf = (concepts: SkillId[]) => buildAlgoMarkSet(r, { concepts, window });
const asUser = (m: Mark, patch: Partial<Mark> = {}): Mark => ({ ...m, ...patch, id: patch.id ?? `u-${m.id}`, author: 'user' });
const findAlgo = (concepts: SkillId[], pred: (m: Mark) => boolean) => algoOf(concepts).required.find(pred)!;
const at = (iso8: string) => iso(`2026-${iso8}:00Z`);
const shiftTime = (m: Mark, candlesShift: number): Mark => ({
  ...m,
  anchors: m.anchors.map((a) => ({ ...a, time: a.time + candlesShift * 4 * 3600_000 })),
});

describe('gradeMarks: идеальная разметка', () => {
  it('копия эталона даёт score 1, verdict correct и ноль ошибок', () => {
    const algo = algoOf(ALL);
    expect(algo.required.length).toBeGreaterThan(30);
    const res = gradeMarks(algo.required.map((m) => asUser(m)), algo, ctxOf(ALL));
    expect(res.errors).toEqual([]);
    expect(res.score).toBe(1);
    expect(res.verdict).toBe('correct');
    expect(res.missed).toEqual([]);
    expect(res.extra).toEqual([]);
    expect(res.okPairs).toHaveLength(algo.required.length);
    for (const o of res.skillOutcomes) expect(o.correct).toBe(o.total);
    expect(res.skillOutcomes.find((o) => o.skill === 'internal-external')!.total).toBeGreaterThan(0);
  });

  it('пустая разметка при пустом эталоне даёт score 1', () => {
    const res = gradeMarks([], { required: [], tolerated: [], aux: algoOf([]).aux }, ctxOf(['swing']));
    expect(res.score).toBe(1);
    expect(res.skillOutcomes).toEqual([]);
  });

  it('пользователь ничего не отметил: всё missed, incorrect', () => {
    const algo = algoOf(['swing', 'bos', 'choch']);
    const res = gradeMarks([], algo, ctxOf(['swing', 'bos', 'choch'], false));
    expect(res.score).toBe(0);
    expect(res.verdict).toBe('incorrect');
    expect(res.errors.map((e) => e.code)).toContain('SWING_MISSED');
    expect(res.errors.map((e) => e.code)).toContain('BOS_MISSING');
    expect(res.errors.map((e) => e.code)).toContain('CHOCH_MISSING');
    expect(res.errors.every((e) => e.severity === 'major')).toBe(true);
  });
});

describe('gradeMarks: swing и допуск ±2 (AC-07, §12.8)', () => {
  const swing = findAlgo(['swing'], (m) => m.kind === 'swing-high' && m.anchors[0]!.time === at('09-14T20:00'));
  const concepts: SkillId[] = ['swing'];
  const ctx = ctxOf(concepts, false);

  it('метка со смещением 2 свечи совпала', () => {
    const algo = algoOf(concepts);
    const res = gradeMarks([asUser(shiftTime(swing, 2))], algo, ctx);
    const m = res.matched.find((x) => x.algoMarkId === swing.id)!;
    expect(m.timeOffsetCandles).toBe(2);
    expect(res.errors.find((e) => e.markIds?.includes(swing.id) && e.code === 'SWING_MISSED')).toBeUndefined();
  });

  it('метка со смещением 3: extra + missed и одна ошибка SWING_OFF_TOLERANCE', () => {
    const algo = algoOf(concepts);
    const u = asUser(shiftTime(swing, 3));
    const res = gradeMarks([u], algo, ctx);
    expect(res.matched.find((x) => x.algoMarkId === swing.id)).toBeUndefined();
    expect(res.extra.map((m) => m.id)).toContain(u.id);
    expect(res.missed.map((m) => m.id)).toContain(swing.id);
    const off = res.errors.filter((e) => e.code === 'SWING_OFF_TOLERANCE');
    expect(off).toHaveLength(1);
    expect(off[0]!.params).toMatchObject({ offset: 3, tol: 2 });
    expect(res.errors.filter((e) => e.markIds?.includes(u.id))).toHaveLength(1);
    expect(res.errors.some((e) => e.code === 'SWING_EXTRA' && e.markIds?.includes(u.id))).toBe(false);
  });

  it('метка далеко от эталона: SWING_EXTRA, эталон SWING_MISSED', () => {
    const algo = algoOf(concepts);
    const res = gradeMarks([asUser(shiftTime(swing, 9))], algo, ctx);
    expect(res.errors.some((e) => e.code === 'SWING_EXTRA')).toBe(true);
    expect(res.errors.some((e) => e.code === 'SWING_MISSED' && e.markIds?.includes(swing.id))).toBe(true);
  });

  it('DP: из двух меток рядом с одним эталоном совпадает точная, вторая лишняя', () => {
    const algo = algoOf(concepts);
    const exact = asUser(swing, { id: 'exact' });
    const near = asUser(shiftTime(swing, -1), { id: 'near' });
    const res = gradeMarks([near, exact], algo, ctx);
    const m = res.matched.find((x) => x.algoMarkId === swing.id)!;
    expect(m.userMarkId).toBe('exact');
    expect(m.timeOffsetCandles).toBe(0);
    expect(res.extra.map((x) => x.id)).toContain('near');
  });

  it('метка вне окна или вне ряда или непонятого вида попадает в ignored', () => {
    const algo = algoOf(concepts);
    const early = asUser(shiftTime(swing, -70), { id: 'early' });
    const far = asUser(shiftTime(swing, 1000), { id: 'far' });
    const line: Mark = { id: 'hl', kind: 'hline', anchors: [{ time: swing.anchors[0]!.time, price: 1 }], scope: null, direction: null, author: 'user' };
    const noPt: Mark = { id: 'np', kind: 'pattern', anchors: [{ time: swing.anchors[0]!.time, price: 1 }], scope: null, direction: null, author: 'user' };
    const res = gradeMarks([early, far, line, noPt], algo, ctx);
    expect(res.ignored.sort()).toEqual(['early', 'far', 'hl', 'np']);
  });

  it('метка типа, чьё понятие не оценивается, игнорируется', () => {
    const algo = algoOf(concepts);
    const choch = findAlgo(['choch'], (m) => m.kind === 'choch');
    const res = gradeMarks([asUser(choch)], algo, ctx);
    expect(res.ignored).toContain(`u-${choch.id}`);
    expect(res.errors.some((e) => e.markIds?.includes(`u-${choch.id}`))).toBe(false);
  });

  it('SWING_UNCONFIRMED: лишняя метка на кандидате у правого края', () => {
    const algo = algoOf(concepts);
    const pend = algo.aux.pending.find((s) => s.type === 'high' || s.type === 'low')!;
    const m: Mark = {
      id: 'pend',
      kind: pend.type === 'high' ? 'swing-high' : 'swing-low',
      anchors: [{ time: pend.time, price: pend.price }],
      scope: 'external', direction: null, author: 'user',
    };
    const res = gradeMarks([m], algo, ctx);
    expect(res.errors.some((e) => e.code === 'SWING_UNCONFIRMED' && e.markIds?.includes('pend'))).toBe(true);
  });
});

describe('gradeMarks: BOS / CHoCH / sweep', () => {
  const concepts: SkillId[] = ['swing', 'bos', 'choch', 'sweep'];
  const ctx = ctxOf(concepts, false);
  const algo = algoOf(concepts);
  const chochBull = findAlgo(concepts, (m) => m.kind === 'choch' && m.direction === 'bull' && m.scope === 'external');

  it('BOS_WICK_ONLY: пробой фитилём (AC-06, 09-11 12:00)', () => {
    const wickTime = at('09-11T12:00');
    const u: Mark = { id: 'w', kind: 'choch', anchors: [{ time: at('09-09T08:00'), price: 79737.3 }, { time: wickTime, price: 79737.3 }], scope: 'external', direction: 'bull', author: 'user' };
    const res = gradeMarks([u], algo, ctx);
    const e = res.errors.find((x) => x.code === 'BOS_WICK_ONLY')!;
    expect(e).toBeDefined();
    expect(e.params).toMatchObject({ kind: 'choch', level: 79737.3, close: 77682.9 });
    expect(e.severity).toBe('major');
    // sweep на этой же свече не считается пропущенным
    expect(res.errors.some((x) => x.code === 'SWEEP_MISSED' && x.params?.['time'] === wickTime)).toBe(false);
  });

  it('BOS_EXTRA / CHOCH_EXTRA: нет пробоя закрытием', () => {
    const mk = (kind: 'bos' | 'choch', t: string): Mark => ({ id: kind, kind, anchors: [{ time: at('09-02T08:00'), price: 76151.9 }, { time: at(t), price: 76151.9 }], scope: 'external', direction: 'bull', author: 'user' });
    const res = gradeMarks([mk('bos', '09-12T00:00'), mk('choch', '09-13T00:00')], algo, ctx);
    expect(res.errors.map((e) => e.code)).toEqual(expect.arrayContaining(['BOS_EXTRA', 'CHOCH_EXTRA']));
  });

  it('BOS_CHOCH_CONFUSED и BOS_WRONG_DIRECTION: штрафы на совпавшей паре', () => {
    const u = asUser(chochBull, { kind: 'bos', direction: 'bear' });
    const res = gradeMarks([u], algo, ctx);
    const codes = res.errors.map((e) => e.code);
    expect(codes).toContain('BOS_CHOCH_CONFUSED');
    expect(codes).toContain('CHOCH_WRONG_DIRECTION');
    expect(res.matched.some((m) => m.algoMarkId === chochBull.id)).toBe(true);
    const sw = res.skillOutcomes.find((o) => o.skill === 'choch')!;
    expect(sw.correct).toBe(0);
  });

  it('BOS_WRONG_LEVEL: уровень привязан к другому swing', () => {
    const u = asUser(chochBull, {
      anchors: [{ time: at('09-03T20:00'), price: 82282.8 }, chochBull.anchors[1]!],
    });
    const res = gradeMarks([u], algo, ctx);
    const e = res.errors.find((x) => x.code === 'BOS_WRONG_LEVEL')!;
    expect(e.params).toMatchObject({ kind: 'choch', given: 82282.8, level: 79570.9 });
    expect(res.score).toBeCloseTo(0.5 / (algo.required.length + 0) , 3);
  });

  it('SWEEP_IS_BREAK: sweep на свече BOS/CHoCH, а BOS_MISSING не дублируется', () => {
    const t = chochBull.anchors[1]!.time;
    const u: Mark = { id: 'sw', kind: 'sweep', anchors: [{ time: chochBull.anchors[0]!.time, price: chochBull.anchors[0]!.price }, { time: t, price: chochBull.anchors[1]!.price + 10 }], scope: 'external', direction: 'bear', author: 'user' };
    const res = gradeMarks([u], algo, ctx);
    const e = res.errors.find((x) => x.code === 'SWEEP_IS_BREAK')!;
    expect(e).toBeDefined();
    expect(res.errors.some((x) => x.code === 'CHOCH_MISSING' && x.markIds?.includes(chochBull.id))).toBe(false);
  });

  it('SWEEP_EXTRA и SWEEP_MISSED', () => {
    const u: Mark = { id: 'sx', kind: 'sweep', anchors: [{ time: at('09-02T08:00'), price: 76151.9 }, { time: at('09-12T04:00'), price: 76100 }], scope: 'external', direction: 'bull', author: 'user' };
    const res = gradeMarks([u], algo, ctx);
    expect(res.errors.some((e) => e.code === 'SWEEP_EXTRA')).toBe(true);
    expect(res.errors.filter((e) => e.code === 'SWEEP_MISSED').length).toBe(3);
  });

  it('направление sweep: MARK_WRONG_DIRECTION', () => {
    const sw = findAlgo(concepts, (m) => m.kind === 'sweep' && m.anchors[1]!.time === at('09-28T04:00'));
    const res = gradeMarks([asUser(sw, { direction: 'bear' })], algo, ctx);
    expect(res.errors.find((e) => e.code === 'MARK_WRONG_DIRECTION')!.params).toMatchObject({ kind: 'sweep' });
  });
});

describe('gradeMarks: scope и метки структуры', () => {
  it('INTERNAL_AS_EXTERNAL / EXTERNAL_AS_INTERNAL только при scoped', () => {
    const concepts: SkillId[] = ['swing', 'internal-external'];
    const algo = algoOf(concepts);
    const intSw = algo.required.find((m) => m.scope === 'internal' && m.kind === 'swing-low')!;
    const extSw = algo.required.find((m) => m.scope === 'external' && m.kind === 'swing-high')!;
    const res = gradeMarks([asUser(intSw, { scope: 'external' }), asUser(extSw, { scope: 'internal' })], algo, ctxOf(concepts, true));
    expect(res.errors.map((e) => e.code)).toEqual(expect.arrayContaining(['INTERNAL_AS_EXTERNAL', 'EXTERNAL_AS_INTERNAL']));
    const ie = res.skillOutcomes.find((o) => o.skill === 'internal-external')!;
    expect(ie).toEqual({ skill: 'internal-external', correct: 0, total: 2 });
    const res2 = gradeMarks([asUser(intSw, { scope: 'external' })], algo, ctxOf(concepts, false));
    expect(res2.errors.some((e) => e.code === 'INTERNAL_AS_EXTERNAL')).toBe(false);
    // null scope у пользователя трактуется как external
    const res3 = gradeMarks([asUser(intSw, { scope: null })], algo, ctxOf(concepts, true));
    expect(res3.errors.some((e) => e.code === 'INTERNAL_AS_EXTERNAL')).toBe(true);
  });

  it('STRUCTURE_LABEL_WRONG / MISSED / EXTRA', () => {
    const concepts: SkillId[] = ['structure-labels'];
    const algo = algoOf(concepts);
    const hh = algo.required.find((m) => m.kind === 'hh')!;
    const hl = algo.required.find((m) => m.kind === 'hl')!;
    const wrong = asUser(hh, { kind: 'lh' });
    const extra: Mark = { id: 'ex', kind: 'll', anchors: [{ time: at('09-12T00:00'), price: 76151.9 }], scope: 'external', direction: null, author: 'user' };
    const res = gradeMarks([wrong, extra, asUser(hl)], algo, ctxOf(concepts, false));
    const codes = res.errors.map((e) => e.code);
    expect(codes).toContain('STRUCTURE_LABEL_WRONG');
    expect(codes).toContain('STRUCTURE_LABEL_MISSED');
    expect(codes).toContain('STRUCTURE_LABEL_EXTRA');
    expect(res.errors.find((e) => e.code === 'STRUCTURE_LABEL_WRONG')!.params).toMatchObject({ given: 'LH', expected: 'HH' });
  });
});

describe('gradeMarks: Order Block', () => {
  const concepts: SkillId[] = ['order-block'];
  const algo = algoOf(concepts);
  const ctx = ctxOf(concepts, false);
  const ob = algo.required.find((m) => m.direction === 'bull' && m.meta?.['status'] === 'fresh')!;

  it('OB_WRONG_CANDLE и OB_WRONG_BOUNDS', () => {
    const wrongCandle = gradeMarks([asUser(shiftTime(ob, 4))], algo, ctx);
    expect(wrongCandle.errors.filter((e) => e.code === 'OB_WRONG_CANDLE')).toHaveLength(1);
    expect(wrongCandle.extra).toHaveLength(1);
    const lo = ob.anchors[1]!.price;
    const bounds = gradeMarks([asUser(ob, { anchors: [{ ...ob.anchors[0]!, price: lo + 5 }, { ...ob.anchors[1]!, price: lo }] })], algo, ctx);
    expect(bounds.errors.map((e) => e.code)).toContain('OB_WRONG_BOUNDS');
  });

  it('OB_NO_DISPLACEMENT на кандидате без импульса; OB_EXTRA и OB_MISSED иначе', () => {
    const cand = algo.aux.obCandidates[algo.aux.obCandidates.length - 1]!;
    const u: Mark = { id: 'nd', kind: 'order-block', anchors: [{ time: cand.time, price: cand.top }, { time: cand.time + 3 * 4 * 3600_000, price: cand.bottom }], scope: 'external', direction: cand.direction, author: 'user' };
    const res = gradeMarks([u], algo, ctx);
    expect(res.errors.some((e) => e.code === 'OB_NO_DISPLACEMENT')).toBe(true);
    expect(res.errors.some((e) => e.code === 'OB_MISSED')).toBe(true);
    const far: Mark = { ...u, id: 'far', anchors: [{ time: at('09-26T00:00'), price: 80000 }, { time: at('09-26T08:00'), price: 79000 }] };
    expect(gradeMarks([far], algo, ctx).errors.some((e) => e.code === 'OB_EXTRA')).toBe(true);
  });

  it('инвалидированный OB допустим и не штрафуется', () => {
    const inv = algo.tolerated.find((m) => m.meta?.['status'] === 'invalidated')!;
    expect(inv).toBeDefined();
    const res = gradeMarks([asUser(inv)], algo, ctx);
    expect(res.ignored).toContain(`u-${inv.id}`);
    expect(res.extra).toEqual([]);
    expect(res.errors.some((e) => e.markIds?.includes(`u-${inv.id}`))).toBe(false);
  });
});

describe('gradeMarks: FVG', () => {
  const concepts: SkillId[] = ['fvg'];
  const algo = algoOf(concepts);
  const ctx = ctxOf(concepts, false);
  const fvg = algo.required.find((m) => m.direction === 'bull')!;

  it('FVG_NOT_GAP, FVG_EXTRA, FVG_MISSED, FVG_WRONG_BOUNDS', () => {
    const notGap: Mark = { id: 'ng', kind: 'fvg', anchors: [{ time: at('09-13T00:00'), price: 76500 }, { time: at('09-13T08:00'), price: 76300 }], scope: null, direction: 'bull', author: 'user' };
    const res = gradeMarks([notGap], algo, ctx);
    expect(res.errors.some((e) => e.code === 'FVG_NOT_GAP')).toBe(true);
    expect(res.errors.some((e) => e.code === 'FVG_MISSED')).toBe(true);
    const bounds = gradeMarks([asUser(fvg, { anchors: [{ ...fvg.anchors[0]!, price: fvg.anchors[0]!.price + 5000 }, { ...fvg.anchors[1]!, price: fvg.anchors[0]!.price + 4000 }] })], algo, ctx);
    expect(bounds.errors.some((e) => e.code === 'FVG_WRONG_BOUNDS')).toBe(true);
  });

  it('заполненный FVG допустим; существующий разрыв вне эталона даёт FVG_EXTRA', () => {
    const filled = r.fvgs.find((f) => f.status === 'filled')!;
    const um: Mark = { id: 'fl', kind: 'fvg', anchors: [{ time: filled.firstTime, price: filled.top }, { time: filled.firstTime + 3 * 4 * 3600_000, price: filled.bottom }], scope: null, direction: filled.direction, author: 'user' };
    const tol = buildAlgoMarkSet(r, { concepts, window });
    expect(tol.tolerated.length).toBeGreaterThan(0);
    const res = gradeMarks([um], tol, ctx);
    expect(res.ignored).toContain('fl');
    // малый FVG тоже допустим; разрыв без допуска -> FVG_EXTRA
    const small = r.smallFvgs[0]!;
    const sm: Mark = { ...um, id: 'sm', direction: small.direction, anchors: [{ time: small.firstTime, price: small.top }, { time: small.firstTime + 3 * 4 * 3600_000, price: small.bottom }] };
    expect(gradeMarks([sm], tol, ctx).ignored).toContain('sm');
    const noTol = { ...tol, tolerated: [] };
    expect(gradeMarks([sm], noTol, ctx).errors.some((e) => e.code === 'FVG_EXTRA')).toBe(true);
  });
});

describe('gradeMarks: модели PA (метки вида pattern)', () => {
  const pat = (id: string, type: string, times: number[], dir: 'bull' | 'bear' | null, author: 'user' | 'algo'): Mark => ({
    id, kind: 'pattern', anchors: times.map((t) => ({ time: t, price: 1 })), scope: null, direction: dir, meta: { patternType: type }, author,
  });
  const h = 4 * 3600_000;
  const t0 = candles[100]!.openTime;
  const concepts: SkillId[] = ['pa-engulfing', 'pa-star'];
  const base = { required: [], tolerated: [] as Mark[], aux: algoOf([]).aux };
  const ctx = ctxOf(concepts, false);

  it('совпадение по пересечению интервалов, направление, неверный тип, лишняя и пропущенная', () => {
    const algo = { ...base, required: [pat('a1', 'engulfing', [t0, t0 + h], 'bull', 'algo'), pat('a2', 'morning-star', [t0 + 10 * h, t0 + 12 * h], 'bull', 'algo')] };
    const res = gradeMarks([pat('u1', 'engulfing', [t0 + h], 'bear', 'user'), pat('u2', 'engulfing', [t0 + 11 * h], 'bull', 'user'), pat('u3', 'engulfing', [t0 + 30 * h], 'bull', 'user')], algo, ctx);
    const codes = res.errors.map((e) => e.code);
    expect(codes).toContain('PATTERN_WRONG_DIRECTION');
    expect(codes).toContain('PATTERN_WRONG_TYPE');
    expect(codes).toContain('PATTERN_EXTRA');
    expect(res.matched).toHaveLength(1);
    expect(res.skillOutcomes.map((o) => o.skill)).toEqual(['pa-engulfing', 'pa-star']);
    const miss = gradeMarks([], algo, ctx);
    expect(miss.errors.filter((e) => e.code === 'PATTERN_MISSED')).toHaveLength(2);
  });

  it('doji/inside-bar направление не проверяют', () => {
    const algo = { ...base, required: [pat('a', 'doji', [t0], null, 'algo')] };
    const res = gradeMarks([pat('u', 'doji', [t0], 'bull', 'user')], algo, ctxOf(['pa-doji'], false));
    expect(res.errors).toEqual([]);
  });
});

describe('gradeMarks: вердикт и детерминизм', () => {
  it('partial при score >= 0.5, детерминированный повтор', () => {
    const concepts: SkillId[] = ['swing'];
    const algo = algoOf(concepts);
    const half = algo.required.filter((_, i) => i % 4 !== 0).map((m) => asUser(m));
    const a = gradeMarks(half, algo, ctxOf(concepts, false));
    const b = gradeMarks(half, algo, ctxOf(concepts, false));
    expect(a).toEqual(b);
    expect(a.verdict).toBe('partial');
    expect(a.score).toBeGreaterThan(0.5);
  });

  it('correct требует отсутствия major-ошибок', () => {
    const concepts: SkillId[] = ['swing'];
    const algo = algoOf(concepts);
    const res = gradeMarks(algo.required.map((m) => asUser(m)).slice(1), algo, ctxOf(concepts, false));
    expect(res.score).toBeGreaterThan(0.85);
    expect(res.verdict).toBe('partial');
  });

  it('toMarks отдаёт ту же разметку, что algo.required при полном наборе понятий', () => {
    const ids = new Set(toMarks(r, window).map((m) => m.id));
    for (const m of algoOf(ALL).required) expect(ids.has(m.id)).toBe(true);
  });
});
