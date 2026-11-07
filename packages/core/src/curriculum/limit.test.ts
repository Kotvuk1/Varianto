import { describe, expect, it } from 'vitest';
import { btc1h, btc4h, visibleAt } from '../testing/cur';
import { CurValidationError, findFill, gradeLimitEntry, priceQuality, validateLimitOrder, type LimitOrder } from './limit';
import { htfClosedBefore } from './generate';
import { resolveZoneReaction } from './reaction';
import { expectedLimitPrice, limitFilled, limitFilledByPrice, limitTypeOk, placementOf } from './rubric';
import { computeZones } from './zone';
import type { Candle } from '../types';

const h1 = btc1h();
const h4 = btc4h();
const prep = (iso: string, side: 'LONG' | 'SHORT', b: number, t: number) => {
  const v = visibleAt(h1, iso);
  const set = computeZones(v.visible, htfClosedBefore(h4, v.T, 500))!;
  const zone = set.zones.find((z) => z.bottom === b && z.top === t)!;
  const reaction = resolveZoneReaction(h1, v.iT, zone, side, set.A, 72);
  const grade = (o: LimitOrder, tick = 0.1) => gradeLimitEntry({ side, zone, A: set.A, tick, candles: h1, T: v.iT, limitCandles: 72, order: o, reaction });
  return { v, set, zone, reaction, grade };
};
const lim = (price: number, type: LimitOrder['type'], frontK: number | null = null): LimitOrder => ({ price, type, frontK });
const near = (a: number, b: number, d = 1e-2) => expect(Math.abs(a - b)).toBeLessThanOrEqual(d);

describe('gradeLimitEntry (§5.3): LE-1..LE-3', () => {
  it('LE-1 SHORT: quality 91.90 / 86.06 / 84.53 / 10, MAE и MFE', () => {
    const { grade, reaction, set } = prep('2026-09-12T00:00:00Z', 'SHORT', 79384.4, 79737.3);
    expect([reaction.kind, reaction.m]).toEqual(['reaction', 79570.9]);
    const a = grade(lim(79384.4, 'near-edge'));
    near(a.quality, 91.9);
    expect(a.verdict).toBe('correct');
    expect(a.detail.fill!.candles).toBe(68);
    near(a.detail.maeAtr!, 0.2398, 1e-4);
    near(a.detail.mfeAtr!, 1.9015, 1e-4);
    expect(a.skillOutcomes).toEqual([{ skill: 'limit-placement', correct: 1, total: 1 }, { skill: 'limit-fill', correct: 1, total: 1 }]);
    expect(a.ok.map((o) => o.code)).toEqual(['OK_LIMIT_PLACEMENT', 'OK_LIMIT_FILLED']);
    near(grade(lim(79250, 'front-run', 0.2)).quality, 86.06);
    const deep = grade(lim(79560, 'middle'));
    near(deep.quality, 84.53);
    expect(deep.errors.map((e) => e.code)).toEqual(['LIMIT_DEEP_IN_ZONE']);
    expect(deep.skillOutcomes[0]!.correct).toBe(0);
    const far = grade(lim(79700, 'middle'));
    near(far.quality, 10);
    expect([far.verdict, far.errors.map((e) => e.code)]).toEqual(['incorrect', ['LIMIT_AT_FAR_EDGE', 'LIMIT_TYPE_MISMATCH', 'LIMIT_NOT_FILLED']]);
    expect(far.detail.gapAtr).toBeCloseTo((79700 - 79570.9) / set.A, 6);
    expect(far.verdictParams.outcomeText).toBe('missed');
    expect(far.errors.find((e) => e.code === 'LIMIT_NOT_FILLED')!.severity).toBe('major');
  });

  it('LE-2 SHORT: реакция до ближнего края - не исполнилась (недобор 0.382 ATR), partial 50; опережение 0.4 - 79.39', () => {
    const { grade } = prep('2026-09-16T12:00:00Z', 'SHORT', 77291.2, 77469.3);
    const miss = grade(lim(77291.2, 'near-edge'));
    expect([miss.quality, miss.verdict]).toEqual([50, 'partial']);
    expect(miss.detail.gapAtr).toBeCloseTo(0.382, 3);
    expect(miss.detail.lateFillTime).toBe(Date.parse('2026-09-18T03:00:00Z')); // CB-3: без снятия ордер исполнился бы на пробое
    const front = grade(lim(77140, 'front-run', 0.4));
    near(front.quality, 79.39);
    expect(front.errors.map((e) => e.code)).toEqual(['LIMIT_FRONT_TOO_FAR']);
    expect(front.detail.fill!.candles).toBe(24);
    expect(front.verdict).toBe('correct');
  });

  it('LE-3 LONG: фитиль за дальний край: 85.25 / 64.35 (partial) / 80.99', () => {
    const { grade, reaction } = prep('2026-09-09T12:00:00Z', 'LONG', 78133, 78314.9);
    expect(reaction.m).toBe(78020);
    near(grade(lim(78314.9, 'near-edge')).quality, 85.25);
    const far = grade(lim(78133, 'far-edge'));
    near(far.quality, 64.35);
    expect(far.verdict).toBe('partial');
    near(grade(lim(78400, 'front-run', 0.2)).quality, 80.99);
  });

  it('§20: касание ровно экстремумом не исполняет; проход на 1 тик - исполняет (участок LE-1, high 79570.9)', () => {
    const { grade } = prep('2026-09-12T00:00:00Z', 'SHORT', 79384.4, 79737.3);
    // лимит 79570.9 = high свечи 09-14 20:00: равенство - не исполнение
    const eq = grade(lim(79570.9, 'middle'));
    expect(eq.detail.fill).toBeNull();
    expect(eq.errors.map((e) => e.code)).toContain('LIMIT_NOT_FILLED');
    const tick = grade(lim(79570.8, 'middle'));
    expect(tick.detail.fill).not.toBeNull();
  });

  it('исполнение после подтверждения реакции не засчитывается, но показывается (lateFillTime)', () => {
    const { v, grade, reaction } = prep('2026-09-12T00:00:00Z', 'SHORT', 79384.4, 79737.3);
    const late = findFill(h1, reaction.e + 1, v.iT + 72, 'SHORT', 79700, 0.1);
    if (late !== null) expect(grade(lim(79700, 'far-edge')).detail.lateFillTime).toBe(h1[late]!.openTime);
    else expect(grade(lim(79700, 'far-edge')).detail.lateFillTime).toBeNull();
  });
});

describe('placementOf: границы полос проверяются ценами (§5.3)', () => {
  const z = { bottom: 100, top: 110 }; // LONG: Zn = 110, h = 1 ATR при A = 10
  const A = 10;
  const p = (L: number) => placementOf('LONG', z, A, L);
  it('полный балл: от опережения 0.3 ATR до 0.1 ATR внутрь', () => {
    expect(p(113).level).toBe('full'); // dL = -0.3
    expect(p(111)).toMatchObject({ level: 'full', code: null }); // -0.1
    expect(p(110).level).toBe('full');
    expect(p(109).level).toBe('full'); // dL = 0.1
  });
  it('mid: опережение 0.3-0.5 (FRONT_TOO_FAR) и вглубь до h/2+0.1 (DEEP)', () => {
    expect(p(113.5)).toMatchObject({ level: 'mid', code: 'LIMIT_FRONT_TOO_FAR' });
    expect(p(115)).toMatchObject({ level: 'mid', code: 'LIMIT_FRONT_TOO_FAR' }); // dL = -0.5
    expect(p(108.9)).toMatchObject({ level: 'mid', code: 'LIMIT_DEEP_IN_ZONE' });
    expect(p(104)).toMatchObject({ level: 'mid', code: 'LIMIT_DEEP_IN_ZONE' }); // dL = 0.6 = h/2+0.1
  });
  it('low: h/2+0.1 < dL <= h+0.1; zero: за зоной и дальше 0.5 ATR от края', () => {
    expect(p(103.9)).toMatchObject({ level: 'low', code: 'LIMIT_AT_FAR_EDGE' });
    expect(p(99)).toMatchObject({ level: 'low', code: 'LIMIT_AT_FAR_EDGE' }); // dL = 1.1 = h+0.1
    expect(p(98.9)).toMatchObject({ level: 'zero', code: 'LIMIT_BEYOND_ZONE' });
    expect(p(115.1)).toMatchObject({ level: 'zero', code: 'LIMIT_FAR_FROM_ZONE' });
  });
  it('SHORT зеркально', () => {
    const s = (L: number) => placementOf('SHORT', z, A, L);
    expect(s(101).level).toBe('full'); // Zn = 100, dL = 0.1 -> L = 101
    expect(s(97).level).toBe('full');
    expect(s(100)).toMatchObject({ level: 'full', depth: 0 });
    expect(s(95)).toMatchObject({ code: 'LIMIT_FRONT_TOO_FAR' });
    expect(s(105)).toMatchObject({ code: 'LIMIT_DEEP_IN_ZONE' });
    expect(s(111)).toMatchObject({ code: 'LIMIT_AT_FAR_EDGE' });
    expect(s(120)).toMatchObject({ code: 'LIMIT_BEYOND_ZONE' });
    expect(s(90)).toMatchObject({ code: 'LIMIT_FAR_FROM_ZONE' });
  });
});

describe('тип входа, исполнение и валидация', () => {
  const z = { bottom: 100, top: 110 };
  it('expectedLimitPrice / limitTypeOk (допуск 0.1 ATR)', () => {
    expect(expectedLimitPrice('LONG', z, 10, 'near-edge', null)).toBe(110);
    expect(expectedLimitPrice('LONG', z, 10, 'middle', null)).toBe(105);
    expect(expectedLimitPrice('LONG', z, 10, 'far-edge', null)).toBe(100);
    expect(expectedLimitPrice('LONG', z, 10, 'front-run', 0.2)).toBe(112);
    expect(expectedLimitPrice('SHORT', z, 10, 'front-run', 0.2)).toBe(98);
    expect(expectedLimitPrice('SHORT', z, 10, 'far-edge', null)).toBe(110);
    expect(limitTypeOk('LONG', z, 10, 111, 'near-edge', null)).toBe(true); // ровно 0.1 ATR
    expect(limitTypeOk('LONG', z, 10, 111.01, 'near-edge', null)).toBe(false);
  });
  it('limitFilled: проход на тик, не касание', () => {
    const c = { high: 101, low: 99 };
    expect(limitFilled(c, 'LONG', 99, 0.1)).toBe(false);
    expect(limitFilled(c, 'LONG', 99.1, 0.1)).toBe(true);
    expect(limitFilled(c, 'SHORT', 101, 0.1)).toBe(false);
    expect(limitFilled(c, 'SHORT', 100.9, 0.1)).toBe(true);
    expect(limitFilledByPrice(98.9, 'LONG', 99, 0.1)).toBe(true);
    expect(limitFilledByPrice(99, 'LONG', 99, 0.1)).toBe(false);
    expect(limitFilledByPrice(101.1, 'SHORT', 101, 0.1)).toBe(true);
    // дробная погрешность: 79384.4 - 0.1 против low 79384.3
    expect(limitFilled({ high: 1, low: 79384.3 }, 'LONG', 79384.4, 0.1)).toBe(true);
  });
  it('priceQuality: граничные значения; вырожденный знаменатель', () => {
    const zone = { bottom: 100, top: 110 };
    expect(priceQuality('LONG', zone, 10, 115, 95)).toBe(0); // L = B -> 0... B = 115
    expect(priceQuality('LONG', zone, 10, 110, 105)).toBeCloseTo(0.5, 9);
    expect(priceQuality('LONG', zone, 10, 100, 100)).toBe(1);
    expect(priceQuality('LONG', zone, 10, 120, 115)).toBe(0); // B = m, L выше B
    expect(priceQuality('LONG', zone, 10, 110, 115)).toBe(1); // B - m <= 0, L ниже B
  });
  it('validateLimitOrder: LIMIT_WRONG_SIDE, LIMIT_TYPE_INVALID', () => {
    const code = (f: () => void): string => {
      try {
        f();
      } catch (e) {
        return (e as CurValidationError).code;
      }
      return 'ok';
    };
    expect(code(() => validateLimitOrder('LONG', 100, lim(100, 'near-edge')))).toBe('LIMIT_WRONG_SIDE');
    expect(code(() => validateLimitOrder('SHORT', 100, lim(99, 'near-edge')))).toBe('LIMIT_WRONG_SIDE');
    expect(code(() => validateLimitOrder('LONG', 100, lim(99, 'front-run')))).toBe('LIMIT_TYPE_INVALID');
    expect(code(() => validateLimitOrder('LONG', 100, lim(99, 'front-run', 0.04)))).toBe('LIMIT_TYPE_INVALID');
    expect(code(() => validateLimitOrder('LONG', 100, lim(99, 'front-run', 0.51)))).toBe('LIMIT_TYPE_INVALID');
    expect(code(() => validateLimitOrder('LONG', 100, lim(99, 'near-edge', 0.2)))).toBe('LIMIT_TYPE_INVALID');
    expect(code(() => validateLimitOrder('LONG', 100, lim(99, 'front-run', 0.5)))).toBe('ok');
    expect(code(() => validateLimitOrder('LONG', 100, lim(-1, 'near-edge')))).toBe('INVALID_TYPE');
  });
  it('findFill: пустой диапазон', () => {
    expect(findFill([] as Candle[], 0, 5, 'LONG', 1, 0.1)).toBeNull();
  });
});
