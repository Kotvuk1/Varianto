import { describe, expect, it } from 'vitest';
import { ChallengeAnswerSchema } from '@/server/schemas';
import { buildAnswer, defaultLevels, formatRR, reasonsFor, riskReward, roundToTick, validatePosition } from './position';

describe('validatePosition (SL_WRONG_SIDE до отправки)', () => {
  it('LONG: SL ниже, TP выше входа', () => {
    expect(validatePosition('LONG', 100, 95, 110)).toEqual([]);
    expect(validatePosition('LONG', 100, 105, 110)).toEqual(['sl-wrong-side']);
    expect(validatePosition('LONG', 100, 95, 90)).toEqual(['tp-wrong-side']);
    expect(validatePosition('LONG', 100, 100, 100)).toEqual(['sl-wrong-side', 'tp-wrong-side']);
  });
  it('SHORT: зеркально', () => {
    expect(validatePosition('SHORT', 100, 105, 90)).toEqual([]);
    expect(validatePosition('SHORT', 100, 95, 90)).toEqual(['sl-wrong-side']);
    expect(validatePosition('SHORT', 100, 105, 110)).toEqual(['tp-wrong-side']);
  });
});

describe('riskReward', () => {
  it('1R = |вход - SL|, RR = |TP - вход| / 1R', () => {
    const r = riskReward(64380, 63870, 65400)!;
    expect(r.risk).toBe(510);
    expect(r.rr).toBeCloseTo(2, 10);
    expect(r.riskPct).toBeCloseTo(510 / 64380, 10);
    expect(formatRR(r.rr)).toBe('1:2');
    expect(formatRR(2.54)).toBe('1:2.5');
  });
  it('нулевой риск -> null', () => {
    expect(riskReward(100, 100, 110)).toBeNull();
  });
});

describe('defaultLevels / roundToTick', () => {
  it('1 ATR и 2 ATR в сторону сделки, по шагу тика', () => {
    expect(defaultLevels('LONG', 100, 5, 0.01)).toEqual({ sl: 95, tp: 110 });
    expect(defaultLevels('SHORT', 100, 5, 0.01)).toEqual({ sl: 105, tp: 90 });
    expect(roundToTick(64380.07, 0.1)).toBe(64380.1);
  });
});

describe('buildAnswer: адаптер решения -> Answer', () => {
  const base = { tf: '1h' as const, entry: 100, reasons: ['bos-confirmed' as const], note: '  ' };
  it('LONG содержит entry/sl/tp и проходит схему сервера', () => {
    const a = buildAnswer({ ...base, side: 'LONG', sl: 95, tp: 110, note: ' причина ' });
    expect(a).toMatchObject({ kind: 'challenge', side: 'LONG', entry: 100, sl: 95, tp: 110, note: 'причина' });
    expect(ChallengeAnswerSchema.safeParse(a).success).toBe(true);
  });
  it('WAIT не содержит позиции и проходит схему', () => {
    const a = buildAnswer({ ...base, side: 'WAIT', sl: 95, tp: 110, reasons: ['range-no-edge'] });
    expect(a).not.toHaveProperty('entry');
    expect(a).not.toHaveProperty('sl');
    expect(a).not.toHaveProperty('note');
    expect(ChallengeAnswerSchema.safeParse(a).success).toBe(true);
  });
  it('позиция без SL/TP не собирается', () => {
    expect(() => buildAnswer({ ...base, side: 'SHORT', sl: null, tp: 90 })).toThrow();
  });
  it('неверная сторона отвергается схемой сервера', () => {
    const a = buildAnswer({ ...base, side: 'LONG', sl: 105, tp: 110 });
    expect(ChallengeAnswerSchema.safeParse(a).success).toBe(false);
  });
});

describe('reasonsFor', () => {
  const all = ['trend-continuation', 'range-no-edge', 'unclear-structure', 'fvg-fill'] as const;
  it('для WAIT только две причины', () => {
    expect(reasonsFor('WAIT', all)).toEqual(['range-no-edge', 'unclear-structure']);
    expect(reasonsFor('LONG', all)).toHaveLength(4);
  });
});
