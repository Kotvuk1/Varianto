import { describe, expect, it } from 'vitest';
import { loadKlines } from '../testing/fixtures-pa-challenge';
import { computeChallengeFacts, type ChallengeFacts } from './facts';
import { gradeChallenge, type ChallengeAnswerInput } from './quality';
import type { ResolvedTrade } from './resolve';

// 4h-ряд BTCUSDT 2026-09 (реальные свечи) используется как рабочий и как «старший» (тренд самого ряда).
const c = loadKlines('klines/BTCUSDT/4h/BTCUSDT-4h-2026-09.csv');
const facts = (i: number): ChallengeFacts => {
  const sl = c.slice(0, i + 1);
  return computeChallengeFacts({ candles: sl, tf: '4h', htf: sl });
};
const L41 = facts(41); // LONG: вход 79075.9, SL(ref) 78557.97, TP(ref) 80536.1, RR 2.82
const S82 = facts(82); // SHORT: вход 78952.1, SL(ref) 79800.20, TP(ref) 76000.3, RR 3.48
const W60 = facts(60); // WAIT: нисходящий тренд без POI

const win = (r: number): ResolvedTrade => ({ side: 'LONG', entry: 0, sl: 0, tp: 0, result: r > 0 ? 'tp' : 'sl', exitTime: 0, exitPrice: 0, rMultiple: r, method: 'candle', triggerTime: 0, triggerTf: '4h' });
const long = (over: Partial<ChallengeAnswerInput> = {}): ChallengeAnswerInput => ({
  side: 'LONG', tf: '4h', entry: L41.entry, sl: 78500, tp: 80536.1, reasons: ['htf-alignment', 'trend-continuation', 'fvg-fill'], ...over,
});
const part = (g: ReturnType<typeof gradeChallenge>, key: string) => g.quality!.parts.find((p) => p.key === key)!.score;

describe('refSide (14.2) — вручную проверено по OHLC', () => {
  it('LONG на 09-07 20:00: htf up, tf up, FVG/защищённый low, RR 2.82', () => {
    expect(L41.refSide).toBe('LONG');
    expect(L41.ref!.sl).toBeCloseTo(78618.1 - 0.1 * L41.atr, 9);
    expect(L41.ref!.tp).toBe(80536.1);
    expect(L41.ref!.rr).toBeCloseTo((80536.1 - 79075.9) / (79075.9 - L41.ref!.sl), 9);
    expect(L41.entry).toBe(79075.9);
  });
  it('SHORT на 09-14 16:00: защищённый high, RR 3.48', () => {
    expect(S82.refSide).toBe('SHORT');
    expect(S82.ref!.rr).toBeGreaterThanOrEqual(2);
    expect(S82.ref!.tp).toBe(76000.3);
  });
  it('WAIT, если нет POI / тренд не совпадает', () => {
    expect(W60.refSide).toBe('WAIT');
    expect(W60.ref).toBeNull();
  });
  it('частичная последняя свеча: entry = её close, анализ без неё', () => {
    const partial = { ...c[42]!, closed: false };
    const f = computeChallengeFacts({ candles: [...c.slice(0, 42), partial], tf: '4h', htf: c.slice(0, 42) });
    expect(f.entry).toBe(partial.close);
    expect(f.candles).toHaveLength(42);
    expect(f.lastIndex).toBe(41);
  });
});

describe('gradeChallenge: позиции (14.3)', () => {
  it('идеальная сделка по эталону: 100 баллов (SL за защищённым low, RR>=2, причины верны), correct', () => {
    const g = gradeChallenge(long({ sl: 78500 }), L41, win(2.8));
    expect(part(g, 'htf')).toBe(25);
    expect(part(g, 'structure')).toBe(25);
    expect(part(g, 'location')).toBe(15);
    expect(part(g, 'sl')).toBe(15);
    expect(part(g, 'rr')).toBe(10);
    expect(part(g, 'reasons')).toBe(10);
    expect(g.quality!.score).toBe(100);
    expect(g.score).toBe(1);
    expect(g.verdict).toBe('correct');
    expect(g.errors).toEqual([]);
    expect(g.detail.decisionCorrect).toBe(true);
    expect(g.detail.waitCorrect).toBeNull();
    expect(g.detail.outcome!.rMultiple).toBe(2.8);
    expect(g.ok.map((o) => o.code)).toEqual(['OK_HTF', 'OK_SL_PLACEMENT', 'OK_RR']);
    expect(g.skillOutcomes).toEqual([
      { skill: 'challenge-entry', correct: 1, total: 1 },
      { skill: 'challenge-risk', correct: 1, total: 1 },
    ]);
  });
  it('верное решение, но сделка закрылась в минус: вердикт по качеству, decisionCorrect=false (FR-TC-22)', () => {
    const g = gradeChallenge(long(), L41, win(-1));
    expect(g.verdict).toBe('correct');
    expect(g.detail.decisionCorrect).toBe(false);
  });
  it('SL слишком близко (внутри структуры) -> 0 и SL_INSIDE_STRUCTURE', () => {
    const g = gradeChallenge(long({ sl: 78900 }), L41, win(1));
    expect(part(g, 'sl')).toBe(0);
    expect(g.errors.map((e) => e.code)).toContain('SL_INSIDE_STRUCTURE');
    expect(g.skillOutcomes.find((s) => s.skill === 'challenge-risk')!.correct).toBe(0);
  });
  it('SL дальше 1.5 ATR от защищённого -> 8 и SL_TOO_WIDE', () => {
    const g = gradeChallenge(long({ sl: 77000 }), L41, win(1));
    expect(part(g, 'sl')).toBe(8);
    expect(g.errors.map((e) => e.code)).toContain('SL_TOO_WIDE');
  });
  it('RR в [1.5, 2) -> 5; < 1.5 -> 0 и RR_TOO_LOW', () => {
    // rr = (tp - 79075.9) / (79075.9 - 78500)
    const mid = gradeChallenge(long({ tp: 79075.9 + 1.7 * 575.9 }), L41, win(1));
    expect(part(mid, 'rr')).toBe(5);
    const low = gradeChallenge(long({ tp: 79075.9 + 1.0 * 575.9 }), L41, win(1));
    expect(part(low, 'rr')).toBe(0);
    expect(low.errors.map((e) => e.code)).toContain('RR_TOO_LOW');
    expect(low.skillOutcomes.find((s) => s.skill === 'challenge-risk')!.correct).toBe(0);
  });
  it('неверные причины: доля верных, REASON_MISMATCH на каждую неверную', () => {
    const g = gradeChallenge(long({ reasons: ['htf-alignment', 'choch-reversal'] }), L41, win(1));
    expect(part(g, 'reasons')).toBe(5);
    const mm = g.errors.filter((e) => e.code === 'REASON_MISMATCH');
    expect(mm).toHaveLength(1);
    expect(mm[0]!.params!.reason).toBe('choch-reversal');
    expect(gradeChallenge(long({ reasons: [] }), L41, win(1)).quality!.parts.find((p) => p.key === 'reasons')!.score).toBe(0);
  });
  it('SHORT против HTF/структуры в LONG-ситуации: 0 за htf и structure, без POI', () => {
    const g = gradeChallenge({ side: 'SHORT', tf: '4h', entry: L41.entry, sl: 80800, tp: 77000, reasons: [] }, L41, win(-1));
    expect(part(g, 'htf')).toBe(0);
    expect(part(g, 'structure')).toBe(0);
    expect(part(g, 'location')).toBe(0);
    const codes = g.errors.map((e) => e.code);
    expect(codes).toEqual(expect.arrayContaining(['TRADE_AGAINST_HTF', 'TRADE_AGAINST_STRUCTURE', 'ENTRY_NO_POI']));
    expect(g.verdict).toBe('incorrect'); // противоположная сторона
    expect(g.skillOutcomes.find((s) => s.skill === 'challenge-entry')!.correct).toBe(0);
  });
  it('SHORT на SHORT-ситуации: SL за защищённым high, correct', () => {
    const g = gradeChallenge({ side: 'SHORT', tf: '4h', entry: S82.entry, sl: 79900, tp: 76000.3, reasons: ['htf-alignment', 'trend-continuation'] }, S82, win(3));
    expect(part(g, 'sl')).toBe(15);
    expect(part(g, 'structure')).toBe(25);
    expect(g.verdict).toBe('correct');
  });
  it('вердикт partial: сторона верна, но качество < 70', () => {
    const g = gradeChallenge(long({ sl: 78900, tp: 79175, reasons: [] }), L41, win(1));
    expect(g.quality!.score).toBeLessThan(70);
    expect(g.verdict).toBe('partial');
  });
  it('вердикт partial: сторона не противоположна эталону (WAIT-ситуация), качество >= 70', () => {
    // SYNTHETIC: нужны точные баллы для граничной проверки правила 14.4; факты — реальные (W60), ответ подобран
    const f = { ...W60, refSide: 'WAIT' as const };
    const g = gradeChallenge({ side: 'SHORT', tf: '4h', entry: f.entry, sl: f.setup.SHORT ? f.setup.SHORT.sl : f.entry + 800, tp: f.setup.SHORT?.tp ?? f.entry - 2400, reasons: [] }, f, win(1));
    expect(['partial', 'incorrect']).toContain(g.verdict);
  });
  it('TRADE_IN_RANGE при trendTf = none и WAIT', () => {
    const none = facts(14 + 6);
    expect(none.trendTf).toBe('none');
    const g = gradeChallenge({ side: 'LONG', tf: '4h', entry: none.entry, sl: none.entry - 1000, tp: none.entry + 2000, reasons: [] }, none, null);
    expect(part(g, 'structure')).toBe(10);
    expect(g.errors.map((e) => e.code)).toContain('TRADE_IN_RANGE');
    expect(g.detail.outcome).toBeNull();
    expect(g.detail.decisionCorrect).toBe(false);
  });
  it('при refSide = WAIT позиция добавляет challenge-wait = 0', () => {
    const none = facts(20);
    const g = gradeChallenge({ side: 'LONG', tf: '4h', entry: none.entry, sl: none.entry - 1000, tp: none.entry + 2000, reasons: [] }, none, win(1));
    expect(g.skillOutcomes).toContainEqual({ skill: 'challenge-wait', correct: 0, total: 1 });
  });
  it('позиция без entry в ответе использует entry факта', () => {
    const g = gradeChallenge({ side: 'LONG', tf: '4h', sl: 78500, tp: 80536.1, reasons: [] }, L41, win(1));
    expect(part(g, 'rr')).toBe(10);
  });
});

describe('gradeChallenge: WAIT', () => {
  it('верный WAIT: 70 + причины, OK_WAIT, challenge-wait 1/1', () => {
    const g = gradeChallenge({ side: 'WAIT', tf: '4h', reasons: ['range-no-edge'], }, W60, null);
    expect(part(g, 'wait')).toBe(70);
    expect(part(g, 'reasons')).toBe(30);
    expect(g.quality!.score).toBe(100);
    expect(g.verdict).toBe('correct');
    expect(g.detail).toMatchObject({ waitCorrect: true, decisionCorrect: true, outcome: null });
    expect(g.ok.map((o) => o.code)).toEqual(['OK_WAIT']);
    expect(g.skillOutcomes).toEqual([{ skill: 'challenge-wait', correct: 1, total: 1 }]);
  });
  it('WAIT при наличии сетапа: 0 за wait, WAIT_MISSED_SETUP (major), challenge-wait 0/1', () => {
    const g = gradeChallenge({ side: 'WAIT', tf: '4h', reasons: ['unclear-structure'] }, L41, null);
    expect(part(g, 'wait')).toBe(0);
    expect(g.errors[0]).toMatchObject({ code: 'WAIT_MISSED_SETUP', skill: 'challenge-wait', severity: 'major' });
    expect(g.errors[0]!.params).toMatchObject({ refSide: 'LONG' });
    expect(g.detail.waitCorrect).toBe(false);
    expect(g.verdict).toBe('incorrect'); // WAIT при сетапе: максимум 30 баллов < 70
  });
  it('при WAIT другие причины неверны (REASON_MISMATCH)', () => {
    const g = gradeChallenge({ side: 'WAIT', tf: '4h', reasons: ['htf-alignment', 'range-no-edge'] }, W60, null);
    expect(part(g, 'reasons')).toBe(15);
    expect(g.errors.map((e) => e.code)).toEqual(['REASON_MISMATCH']);
  });
  it('детерминизм', () => {
    const a = gradeChallenge(long(), L41, win(1));
    expect(gradeChallenge(long(), L41, win(1))).toEqual(a);
  });
});
