// Рубрика §11, навыки §13, вердикт, альтернатива и invalidation (§6). Реальные свечи; ссылки EW-1 (easy), EW-3 (medium), EW-4 (hard).
import { describe, expect, it } from 'vitest';
import { buildFeedback, flattenTemplates, fillTemplate } from '../feedback';
import { ewCandles } from '../testing/elliott';
import { evaluateInvalidation, EW_WEIGHTS, gradeElliott, type EwGradeOutput } from './grade';
import type { ElliottAnswer, EwScenarioId, EwPrimaryScenario } from './types';
import { makeRef, userMark, type Pt } from './test-helpers';

const sol = ewCandles('EW-1');
const IMP1: Pt[] = [['2026-08-06T23:00', 'low'], ['2026-08-07T13:00', 'high'], ['2026-08-07T17:00', 'low'], ['2026-08-08T15:00', 'high'], ['2026-08-09T01:00', 'low'], ['2026-08-09T22:00', 'high']];
const easy = makeRef(sol, '1h', { kind: 'ew-impulse', nPivot: 7, T: '2026-08-10T05:00', windowFrom: '2026-08-06T10:00', dir: 'bull', points: IMP1 });
const gradeEasy = (over: Partial<{ imp: Pt[]; primary: EwPrimaryScenario; alt: EwScenarioId | null; inv: number | null; corr: Pt[] | null }> = {}): EwGradeOutput => {
  const a: ElliottAnswer = {
    kind: 'ew-impulse', impulse: userMark(sol, 'ew-impulse', over.imp ?? IMP1),
    correction: over.corr ? userMark(sol, 'ew-zigzag', over.corr) : null,
    primary: over.primary ?? 'abc-next', alternative: over.alt === undefined ? null : over.alt, invalidation: over.inv === undefined ? 77.88 : over.inv,
  };
  return gradeElliott(easy.ref, { candles: easy.visible, tf: '1h' }, easy.future, a, { tickSize: 0.01 });
};

const btc = ewCandles('EW-4');
const X: Pt[] = [['2026-08-01T16:00', 'low'], ['2026-08-09T20:00', 'high'], ['2026-08-14T12:00', 'low'], ['2026-08-25T00:00', 'high'], ['2026-08-26T12:00', 'low']];
const Y: Pt[] = [['2026-08-01T16:00', 'low'], ['2026-08-09T20:00', 'high'], ['2026-08-14T12:00', 'low'], ['2026-08-21T08:00', 'high'], ['2026-08-23T04:00', 'low'], ['2026-08-25T00:00', 'high']];
const hard = makeRef(btc, '4h', { kind: 'ew-scenario', nPivot: 5, T: '2026-08-27T08:00', windowFrom: 180, dir: 'bull', points: X });
const gradeHard = (imp: Pt[], primary: EwPrimaryScenario, alt: EwScenarioId | null, inv: number | null): EwGradeOutput =>
  gradeElliott(hard.ref, { candles: hard.visible, tf: '4h' }, hard.future, { kind: 'ew-scenario', impulse: userMark(btc, 'ew-impulse', imp), correction: null, primary, alternative: alt, invalidation: inv });

describe('рубрика §11', () => {
  it('веса каждой сложности дают 100', () => {
    for (const w of Object.values(EW_WEIGHTS)) expect(Object.values<number>(w).reduce((s, x) => s + x, 0)).toBe(100);
  });
  it('EW-1 easy: все части 1, quality 100, correct, score 1', () => {
    const g = gradeEasy();
    expect(g.verdict).toBe('correct');
    expect(g.score).toBe(1);
    expect(g.detail.quality.parts.map((p) => [p.key, p.score])).toEqual([['points', 1], ['rules', 1], ['guides', 1], ['scenario', 1], ['invalidation', 1], ['alternative', 0]]);
    expect(g.errors).toEqual([]);
    expect(g.detail.scenario.altStatus).toBe('optional-empty');
    expect(g.detail.extended3).toBe(true);
    expect(g.detail.outcome).toMatchObject({ kind: 'primary', basis: 'user' });
  });
  it('ok-блоки EW-1: точки, правила, рекомендации, удлинённая 3-я, invalidation', () => {
    const codes = gradeEasy().ok.map((o) => o.code);
    expect(codes).toEqual(['OK_EW_POINTS', 'OK_EW_RULES', 'OK_EW_GUIDES', 'OK_EW_EXTENDED3', 'OK_EW_INVALIDATION']);
  });
  it('навыки EW-1: ew-impulse 6+5, ew-rules 4, ew-invalidation 2 (сложность easy без альтернативы)', () => {
    const o = Object.fromEntries(gradeEasy().skillOutcomes.map((s) => [s.skill, s]));
    expect(o['ew-impulse']).toMatchObject({ correct: 11, total: 11 });
    expect(o['ew-rules']).toMatchObject({ correct: 4, total: 4 });
    expect(o['ew-invalidation']).toMatchObject({ correct: 2, total: 2 });
    expect(o['ew-correction']).toBeUndefined();
  });
  it('гарантии формы: total >= 1 у каждого навыка, correct <= total', () => {
    for (const g of [gradeEasy(), gradeHard(Y, 'abc-next', 'impulse-extends', 81270.5)]) {
      for (const s of g.skillOutcomes) {
        expect(s.total).toBeGreaterThanOrEqual(1);
        expect(s.correct).toBeLessThanOrEqual(s.total);
      }
    }
  });
});

describe('полнота и текущая точка (§3)', () => {
  it('easy: 5 точек - EW_COUNT_INCOMPLETE (блокирует), 3 точки - тоже', () => {
    const g = gradeEasy({ imp: IMP1.slice(0, 5), primary: 'w5-next', inv: 74.33 });
    expect(g.errors.map((e) => e.code)).toContain('EW_COUNT_INCOMPLETE');
    expect(g.errors.map((e) => e.code)).toContain('EW_COUNT_NOT_CURRENT');
    expect(g.verdict).toBe('incorrect');
    expect(g.score).toBeLessThanOrEqual(0.4);
    const inc = g.errors.find((e) => e.code === 'EW_COUNT_INCOMPLETE')!;
    expect(inc.params).toMatchObject({ shapeText: 'impulse 0–5', givenText: '5 точек impulse' });
  });
  it('easy: коррекция сверх импульса - EW_COUNT_INCOMPLETE (shapeRule для easy)', () => {
    const g = gradeEasy({ corr: [['2026-08-10T01:00', 'low'], ['2026-08-10T02:00', 'high'], ['2026-08-10T03:00', 'low']], primary: 'trend-next' });
    expect(g.errors.find((e) => e.code === 'EW_COUNT_INCOMPLETE')!.params!.givenText).toBe('impulse и коррекцию');
  });
  it('разметка заканчивается не на текущей точке: EW_COUNT_NOT_CURRENT (hard, Y до 08-25)', () => {
    const g = gradeHard(Y, 'abc-next', 'impulse-extends', 81270.5);
    const e = g.errors.find((x) => x.code === 'EW_COUNT_NOT_CURRENT')!;
    expect(e.params).toMatchObject({ lastPrice: 77600 });
    expect(g.verdict).toBe('incorrect');
  });
});

describe('сценарий и альтернатива (§6.2)', () => {
  it('EW_SCENARIO_MISMATCH: 6 точек, но сценарий w5-next; invalidation оценивается по выводимому (abc-next)', () => {
    const g = gradeEasy({ primary: 'w5-next' });
    expect(g.errors.map((e) => e.code)).toContain('EW_SCENARIO_MISMATCH');
    expect(g.detail.scenario.implied).toBe('abc-next');
    expect(g.detail.invalidation.ruleRef).toBe('P5');
    expect(g.detail.quality.parts.find((p) => p.key === 'scenario')!.score).toBe(0);
  });
  it('hard EW-4: bc-next поддержан (ok), correction-extends ok, abc-next к w5-next - not-allowed, same, unsupported - на другой точке', () => {
    expect(gradeHard(X, 'w5-next', 'bc-next', 65482.7).detail.scenario.altStatus).toBe('ok');
    expect(gradeHard(X, 'w5-next', 'correction-extends', 65482.7).detail.scenario.altStatus).toBe('ok');
    const na = gradeHard(X, 'w5-next', 'impulse-extends', 65482.7);
    expect(na.detail.scenario.altStatus).toBe('not-allowed');
    expect(na.errors.find((e) => e.code === 'EW_ALT_INCONSISTENT')).toMatchObject({ severity: 'minor' });
    const same = gradeHard(X, 'w5-next', 'w5-next', 65482.7);
    expect(same.detail.scenario.altStatus).toBe('same');
    expect(same.errors.find((e) => e.code === 'EW_ALT_SAME')!.severity).toBe('major');
    const miss = gradeHard(X, 'w5-next', null, 65482.7);
    expect(miss.detail.scenario.altStatus).toBe('missing');
    expect(miss.errors.find((e) => e.code === 'EW_ALT_MISSING')!.params!.altCountsText).toContain('Wave 4 завершена');
    expect(miss.detail.validCounts).toEqual({ 'w3-next': 5, 'w5-next': 2, 'bc-next': 2 });
  });
  it('альтернативы дают баллы: ok 1 / unsupported 0.5 / иначе 0', () => {
    const part = (g: EwGradeOutput) => g.detail.quality.parts.find((p) => p.key === 'alternative')!.score;
    expect(part(gradeHard(X, 'w5-next', 'bc-next', 65482.7))).toBe(1);
    expect(part(gradeHard(X, 'w5-next', null, 65482.7))).toBe(0);
    expect(part(gradeHard(X, 'w5-next', 'w5-next', 65482.7))).toBe(0);
  });
});

describe('invalidation (§6.3) - EW-4, w5-next, T=08-27 08:00, close 79440.1, invTol 254.1625', () => {
  it('ok / tight / wrong too-wide / wrong-side / missing', () => {
    const t = (u: number | null) => gradeHard(X, 'w5-next', 'bc-next', u).detail.invalidation;
    expect(hard.ref.invTol).toBeCloseTo(254.1625, 3);
    expect(t(65400)).toMatchObject({ status: 'ok', reason: null, ruleLevel: 65482.7, ruleRef: 'P1' });
    expect(t(77600)).toMatchObject({ status: 'tight', reason: null });
    expect(t(62228.8)).toMatchObject({ status: 'wrong', reason: 'too-wide' });
    expect(t(80000)).toMatchObject({ status: 'wrong', reason: 'wrong-side' });
    expect(t(null)).toMatchObject({ status: 'missing', reason: 'missing' });
  });
  it('баллы: ok 1, tight 0.5, wrong/missing 0; tight - minor, wrong - major', () => {
    const p = (u: number | null) => gradeHard(X, 'w5-next', 'bc-next', u).detail.quality.parts.find((x) => x.key === 'invalidation')!.score;
    expect([p(65400), p(77600), p(62228.8), p(null)]).toEqual([1, 0.5, 0, 0]);
    expect(gradeHard(X, 'w5-next', 'bc-next', 77600).errors.find((e) => e.code === 'EW_INVALIDATION_TOO_TIGHT')!.severity).toBe('minor');
    expect(gradeHard(X, 'w5-next', 'bc-next', 80000).errors.find((e) => e.code === 'EW_INVALIDATION_WRONG')!.severity).toBe('major');
  });
  it('evaluateInvalidation: чистая функция, граница допуска включительно, ruleLevel == close -> tight', () => {
    expect(evaluateInvalidation(100.5, 100, 90, 0.5).status).toBe('ok');
    expect(evaluateInvalidation(100.51, 100, 90, 0.5).status).toBe('wrong'); // дальше правила
    expect(evaluateInvalidation(95, 100, 100, 0.5).status).toBe('tight');
  });
});

describe('блокировка правил и ошибки точек', () => {
  it('нарушение W4 в hard (EW-4): incorrect, score <= 0.4, ошибка с точными параметрами', () => {
    const bad: Pt[] = [['2026-08-14T12:00', 'low'], ['2026-08-21T08:00', 'high'], ['2026-08-23T04:00', 'low'], ['2026-08-25T00:00', 'high'], ['2026-08-26T12:00', 'low']];
    const g = gradeHard(bad, 'w5-next', 'correction-extends', 79555.5);
    expect(g.verdict).toBe('incorrect');
    expect(g.score).toBeLessThanOrEqual(0.4);
    expect(g.errors[0]).toMatchObject({ code: 'EW_RULE_W4_OVERLAP', severity: 'major', skill: 'ew-rules', params: { pFour: 77600, pOne: 79555.5 } });
    expect(g.detail.quality.parts.find((p) => p.key === 'rules')!.score).toBe(0);
  });
  it('EW_WRONG_ORDER: все навыки correct = 0, points/rules/guides = 0, проигрывается эталон (basis reference)', () => {
    // равные цены первых двух якорей: направление не определено
    const a = (t: string, price: number) => ({ time: btc[btc.findIndex((x) => new Date(x.openTime).toISOString().startsWith(t))]!.openTime, price });
    const mark = { id: 'u', kind: 'ew-impulse' as const, anchors: [a('2026-08-01T16:00', 62228.8), a('2026-08-03T08:00', 62228.8), a('2026-08-04T08:00', 62000)], scope: null, direction: null, author: 'user' as const };
    const g = gradeElliott(hard.ref, { candles: hard.visible, tf: '4h' }, hard.future, { kind: 'ew-scenario', impulse: mark, correction: null, primary: 'w3-next', alternative: 'correction-extends', invalidation: 62228.8 });
    expect(g.errors.map((e) => e.code)).toContain('EW_WRONG_ORDER');
    for (const s of g.skillOutcomes) expect(s.correct).toBe(0);
    expect(g.detail.quality.parts.slice(0, 3).map((p) => p.score)).toEqual([0, 0, 0]);
    expect(g.detail.outcome.basis).toBe('reference');
    expect(g.verdict).toBe('incorrect');
    expect(g.score).toBeLessThanOrEqual(0.4);
  });
  it('точка не экстремум сегмента: проигрывается эталон, points < 1, вердикт не блокируется только этим', () => {
    const bad: Pt[] = [['2026-08-01T16:00', 'low'], ['2026-08-09T20:00', 'high'], ['2026-08-14T12:00', 'low'], ['2026-08-21T08:00', 'high'], ['2026-08-26T12:00', 'low']];
    const g = gradeHard(bad, 'w5-next', 'bc-next', 65482.7);
    expect(g.errors.map((e) => e.code)).toContain('EW_POINT_NOT_EXTREME');
    expect(g.detail.outcome.basis).toBe('reference');
    expect(g.detail.quality.parts[0]!.score).toBeLessThan(1);
  });
});

describe('проигрывание и разбор', () => {
  it('replay: свечи после T, exitIndex = индекс свечи события, хвост не длиннее 10; нет данных до T', () => {
    const g = gradeEasy();
    const r = g.replay!;
    expect(r.candles[0]!.openTime).toBe(easy.future[0]!.openTime);
    expect(r.exitIndex).toBe(g.detail.outcome.index - (easy.visible.length));
    expect(r.candles.length).toBe(r.exitIndex! + 1 + 10);
  });
  it('hard: invalidated + alt той же свечой - replay доходит до свечи альтернативы', () => {
    const g = gradeHard(X, 'w5-next', 'bc-next', 65482.7);
    expect(g.detail.outcome.kind).toBe('alternative');
    expect(g.replay!.exitIndex).not.toBeNull();
  });
  it('эталон: до 3 разметок с разными сценариями, hline invalidation с role', () => {
    const g = gradeHard(X, 'w5-next', 'bc-next', 65482.7);
    const imps = g.reference.filter((m) => m.kind === 'ew-impulse');
    expect(imps.length).toBeGreaterThanOrEqual(2);
    expect(imps.length).toBeLessThanOrEqual(3);
    expect(new Set(imps.map((m) => m.meta!.scenario)).size).toBe(imps.length);
    const h = g.reference.find((m) => m.kind === 'hline')!;
    expect(h.meta).toMatchObject({ role: 'ew-invalidation', price: 65482.7 });
    expect(h.author).toBe('algo');
  });
  it('verdictParams + buildFeedback: шаблон feedback.verdict.elliott.* подставляется без остатков', () => {
    const g = gradeEasy();
    const fb = buildFeedback({ module: 'elliott', verdict: g.verdict, score: g.score, errors: g.errors, ok: g.ok, skillOutcomes: g.skillOutcomes, tickSize: 0.01, verdictParams: g.verdictParams });
    expect(fb.verdict.templateKey).toBe('feedback.verdict.elliott.correct');
    const text = fillTemplate(flattenTemplates()[fb.verdict.templateKey]!, { ...fb.verdict.params, outcomeTime: '10.08 16:00' });
    expect(text).toBe('Верно: оценка 100%. Дальше сработал основной сценарий: закрытие за 75.71, свеча 10.08 16:00.');
    expect(fb.principle.templateKey).toBe('feedback.principle.elliott');
  });
  it('без verdictParams (терминал) вердикт простой', () => {
    const fb = buildFeedback({ module: 'elliott', verdict: 'partial', score: 0.6, errors: [], ok: [] });
    expect(fb.verdict.templateKey).toBe('feedback.verdict.plain.partial');
  });
});

describe('medium: коррекция (EW-3)', () => {
  const c = ewCandles('EW-3');
  const IMP: Pt[] = [['2026-06-08T15:00', 'high'], ['2026-06-09T00:00', 'low'], ['2026-06-09T05:00', 'high'], ['2026-06-09T16:00', 'low'], ['2026-06-09T20:00', 'high'], ['2026-06-10T09:00', 'low']];
  const COR: Pt[] = [['2026-06-10T15:00', 'high'], ['2026-06-10T22:00', 'low'], ['2026-06-11T11:00', 'high']];
  const med = makeRef(c, '1h', { kind: 'ew-impulse-correction', nPivot: 5, T: '2026-06-11T16:00', windowFrom: '2026-06-08T00:00', dir: 'bear', type: 'zigzag', points: [...IMP, ...COR] });
  const run = (type: 'ew-zigzag' | 'ew-flat', alt: EwScenarioId | null, inv: number | null = 63235.9) =>
    gradeElliott(med.ref, { candles: med.visible, tf: '1h' }, med.future, { kind: 'ew-impulse-correction', impulse: userMark(c, 'ew-impulse', IMP), correction: userMark(c, type, COR), primary: 'trend-next', alternative: alt, invalidation: inv });
  it('zigzag верный: correction ok, навык ew-correction (3+2+2), invalidation = точка C (§19)', () => {
    const g = run('ew-zigzag', 'correction-extends');
    expect(g.verdict).toBe('correct');
    expect(g.detail.quality.score).toBeCloseTo(15 + 35 + 15 * (4 / 7) + 5 + 15 + 15, 6); // рекомендации: 2 из 5 импульса и 2 из 2 zigzag
    expect(g.detail.invalidation).toMatchObject({ ruleRef: 'C', ruleLevel: 63235.9, status: 'ok' });
    const corr = g.skillOutcomes.find((s) => s.skill === 'ew-correction')!;
    expect(corr).toMatchObject({ total: 7, correct: 7 });
    expect(g.ok.map((o) => o.code)).toContain('OK_EW_CORRECTION');
    expect(g.detail.correction).toEqual({ given: 'zigzag', validTypes: ['zigzag'] });
    expect(g.detail.outcome).toMatchObject({ kind: 'invalidated', basis: 'user' });
    const inv = g.skillOutcomes.find((s) => s.skill === 'ew-invalidation')!;
    expect(inv).toMatchObject({ total: 3, correct: 3 });
  });
  it('flat вместо zigzag: EW_FLAT_B_TOO_SHALLOW блокирует (incorrect)', () => {
    const g = run('ew-flat', 'correction-extends');
    expect(g.errors.map((e) => e.code)).toContain('EW_FLAT_B_TOO_SHALLOW');
    expect(g.verdict).toBe('incorrect');
    const rules = g.skillOutcomes.find((s) => s.skill === 'ew-rules')!;
    expect(rules.correct).toBeLessThan(rules.total);
  });
  it('invalidation на точке 0 (старое правило) - too-wide', () => {
    const g = run('ew-zigzag', 'correction-extends', 64179.5);
    expect(g.detail.invalidation).toMatchObject({ status: 'wrong', reason: 'too-wide' });
  });
  it('medium без коррекции: EW_COUNT_INCOMPLETE', () => {
    const g = gradeElliott(med.ref, { candles: med.visible, tf: '1h' }, med.future, { kind: 'ew-impulse-correction', impulse: userMark(c, 'ew-impulse', IMP), correction: null, primary: 'abc-next', alternative: 'impulse-extends', invalidation: 60691.9 });
    expect(g.errors.map((e) => e.code)).toContain('EW_COUNT_INCOMPLETE');
    expect(g.errors.map((e) => e.code)).toContain('EW_COUNT_NOT_CURRENT');
  });
});
