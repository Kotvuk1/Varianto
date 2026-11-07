import { describe, expect, it } from 'vitest';
import { ewCandles, ewIndexAt } from '../testing/elliott';
import { checkCount } from './check';
import { resolveScenario } from './resolve';
import { scenarioRule, EW_ALT_ALLOWED, defaultAlternative, impliedScenario } from './scenarios';
import { anchorsAt, type Pt } from './test-helpers';

const c1 = ewCandles('EW-1');
const IMP1: Pt[] = [['2026-08-06T23:00', 'low'], ['2026-08-07T13:00', 'high'], ['2026-08-07T17:00', 'low'], ['2026-08-08T15:00', 'high'], ['2026-08-09T01:00', 'low'], ['2026-08-09T22:00', 'high']];
const countOf = (c: typeof c1, tf: '1h' | '4h', imp: Pt[], T: string, corr?: Pt[]) =>
  checkCount({
    candles: c.slice(0, ewIndexAt(c, T) + 1), tf, toleranceCandles: 0, impulse: anchorsAt(c, imp),
    correction: corr ? { type: 'zigzag', anchors: anchorsAt(c, corr) } : null,
  }).count!;

describe('resolveScenario (§10)', () => {
  const T = ewIndexAt(c1, '2026-08-10T05:00');
  const count = countOf(c1, '1h', IMP1, '2026-08-10T05:00');
  it('EW-1: основной сценарий abc-next - закрытие ниже точки 4 на 08-10 16:00, replay-экстремумы на (T, index]', () => {
    const o = resolveScenario(c1, T, count, 'abc-next', null, 72)!;
    expect(o).toMatchObject({ kind: 'primary', basis: 'reference', primary: 'abc-next', alternative: null, altAfterInvalidation: null });
    expect(new Date(o.time).toISOString().slice(0, 16)).toBe('2026-08-10T16:00');
    expect(o.index).toBe(ewIndexAt(c1, '2026-08-10T16:00'));
    expect(o.extreme.high).toBeLessThan(77.88);
    expect(o.extreme.low).toBe(Math.min(...c1.slice(T + 1, o.index + 1).map((x) => x.low)));
  });
  it('таймаут: лимит меньше, чем нужно до события; time = T + limit', () => {
    const o = resolveScenario(c1, T, count, 'abc-next', null, 5)!;
    expect(o.kind).toBe('timeout');
    expect(o.index).toBe(T + 5);
    expect(o.time).toBe(c1[T + 5]!.openTime);
  });
  it('базис user/reference передаётся в результат', () => {
    expect(resolveScenario(c1, T, count, 'abc-next', null, 72, 'user')!.basis).toBe('user');
  });
  it('invalidation касанием: порядок на одной свече invalidation -> основной -> альтернатива (EW-3: касание C и закрытие за C на одной свече)', () => {
    const c = ewCandles('EW-3');
    const IMP: Pt[] = [['2026-06-08T15:00', 'high'], ['2026-06-09T00:00', 'low'], ['2026-06-09T05:00', 'high'], ['2026-06-09T16:00', 'low'], ['2026-06-09T20:00', 'high'], ['2026-06-10T09:00', 'low']];
    const cnt = countOf(c, '1h', IMP, '2026-06-11T16:00', [['2026-06-10T15:00', 'high'], ['2026-06-10T22:00', 'low'], ['2026-06-11T11:00', 'high']]);
    const o = resolveScenario(c, ewIndexAt(c, '2026-06-11T16:00'), cnt, 'trend-next', 'correction-extends', 72)!;
    expect(o.kind).toBe('invalidated');
    expect(o.altAfterInvalidation).toBe(o.time);
    expect(o.levels.invalidation).toBe(63235.9); // §19: точка C, а не точка 0
    // без альтернативы - тот же исход, но altAfterInvalidation пуст
    expect(resolveScenario(c, ewIndexAt(c, '2026-06-11T16:00'), cnt, 'trend-next', null, 72)!.altAfterInvalidation).toBeNull();
  });
  it('нельзя построить сценарий из недостаточного числа точек -> null', () => {
    expect(resolveScenario(c1, T, countOf(c1, '1h', IMP1.slice(0, 3), '2026-08-10T05:00'), 'abc-next', null, 72)).toBeNull();
  });
});

describe('сценарии и альтернативы (§6)', () => {
  it('таблица допустимых альтернатив и вывод сценария из разметки', () => {
    expect(EW_ALT_ALLOWED['w5-next']).toEqual(['bc-next', 'correction-extends']);
    expect(impliedScenario(3, false)).toBe('w3-next');
    expect(impliedScenario(5, false)).toBe('w5-next');
    expect(impliedScenario(6, false)).toBe('abc-next');
    expect(impliedScenario(6, true)).toBe('trend-next');
    expect(impliedScenario(4, false)).toBeNull();
    expect(defaultAlternative('w5-next', true)).toBe('bc-next');
    expect(defaultAlternative('w5-next', false)).toBe('correction-extends');
    expect(defaultAlternative('abc-next', true)).toBe('impulse-extends');
  });
  it('уровни invalidation: P0 / P1 / P5 / C', () => {
    const base = countOf(c1, '1h', IMP1, '2026-08-10T05:00');
    expect(scenarioRule({ ...base, impulse: base.impulse.slice(0, 3) }, 'w3-next', null)!.invalidation).toBe(72.29);
    expect(scenarioRule({ ...base, impulse: base.impulse.slice(0, 5) }, 'w5-next', null)!.invalidation).toBe(74.33);
    expect(scenarioRule(base, 'abc-next', null)!.invalidation).toBe(77.88);
  });
  it('bear зеркален: invalidation abc-next - ниже точки 5', () => {
    const c = ewCandles('EW-2');
    const T = '2026-10-22T12:00';
    const cnt = countOf(c, '4h', [['2026-10-02T08:00', 'high'], ['2026-10-02T16:00', 'low'], ['2026-10-04T20:00', 'high'], ['2026-10-08T16:00', 'low'], ['2026-10-12T04:00', 'high'], ['2026-10-15T00:00', 'low']], T);
    const r = scenarioRule(cnt, 'abc-next', 'impulse-extends')!;
    expect(r.invalidation).toBe(2313.39);
    expect(r.invalidatedBy(-2300, -2300)).toBe(true); // нормированный v-high выше v5 = -2313.39
    expect(r.invalidatedBy(-2400, -2320)).toBe(false);
    expect(r.altClosed!(-2300)).toBe(true);
  });
});
