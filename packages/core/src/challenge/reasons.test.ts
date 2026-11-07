import { describe, expect, it } from 'vitest';
import { loadKlines } from '../testing/fixtures-pa-challenge';
import { computeChallengeFacts, reasonValid, REASON_CODES, type RefSide } from './facts';

const c = loadKlines('klines/BTCUSDT/4h/BTCUSDT-4h-2026-09.csv');
const facts = (i: number) => {
  const s = c.slice(0, i + 1);
  return computeChallengeFacts({ candles: s, tf: '4h', htf: s });
};
const valid = (i: number, side: RefSide) => {
  const f = facts(i);
  return REASON_CODES.filter((r) => reasonValid(r, f, side));
};

describe('предикаты причин (14.5), реальный BTCUSDT 4h 2026-09', () => {
  it('09-07 20:00 LONG: BOS bull 09-06 20:00 в силе (возраст 9), FVG, старший up', () => {
    const v = valid(41, 'LONG');
    expect(v).toEqual(expect.arrayContaining(['trend-continuation', 'bos-confirmed', 'fvg-fill', 'htf-alignment']));
    expect(v).not.toContain('choch-reversal');
    expect(v).not.toContain('order-block-reaction'); // OB 09-06 12:00 invalidated/valid=false
  });
  it('09-10 12:00 SHORT: CHoCH bear 09-08 04:00 не старше 30, OB bear 09-06 20:00 [79600-80536.1]', () => {
    const v = valid(51, 'SHORT');
    expect(v).toEqual(expect.arrayContaining(['choch-reversal', 'order-block-reaction']));
    expect(v).not.toContain('bos-confirmed');
  });
  it('09-12 04:00 LONG: sweep low 09-11 12:00 в последних 10 свечах (GS-4)', () => {
    expect(valid(65, 'LONG')).toContain('sweep-reversal');
    expect(valid(65, 'SHORT')).toContain('sweep-reversal'); // та же свеча сняла и high 79737.3 (GS-4)
  });
  it('09-18 20:00 LONG: CHoCH bull 09-18 12:00 (возраст 1-7)', () => {
    expect(valid(107, 'LONG')).toContain('choch-reversal');
  });
  it('level-reaction: тип уровня задаёт сторону (support для LONG)', () => {
    const f = facts(42);
    expect(reasonValid('level-reaction', f, 'LONG')).toBe(true);
    expect(reasonValid('level-reaction', f, 'SHORT')).toBe(false);
  });
  it('WAIT: верны только range-no-edge и unclear-structure', () => {
    for (const i of [41, 51, 65, 107]) {
      const f = facts(i);
      for (const r of REASON_CODES) {
        if (r !== 'range-no-edge' && r !== 'unclear-structure') expect(reasonValid(r, f, 'WAIT')).toBe(false);
      }
    }
    expect(valid(51, 'WAIT')).toContain('unclear-structure');
    expect(valid(20, 'WAIT')).toEqual(expect.arrayContaining(['range-no-edge', 'unclear-structure'])); // trend none
  });
});
