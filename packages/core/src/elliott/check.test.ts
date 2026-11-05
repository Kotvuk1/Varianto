// Точки разметки (§2.2, §3): снап ±2, порядок, экстремум сегмента, swing. Реальные свечи data.binance.vision.
import { describe, expect, it } from 'vitest';
import { ewCandles, ewIndexAt } from '../testing/elliott';
import { checkCount, snapIndex } from './check';
import { normSeries } from './measure';
import { anchorsAt, type Pt } from './test-helpers';

const iso = (t: number) => new Date(t).toISOString().slice(0, 16);
const sol = ewCandles('EW-1');
const btc4 = ewCandles('EW-4');
const SOL_IMP: Pt[] = [['2026-08-06T23:00', 'low'], ['2026-08-07T13:00', 'high'], ['2026-08-07T17:00', 'low']];
const run = (c: typeof sol, tf: '1h' | '4h', imp: Pt[], upTo: string, extra: { tol?: number } = {}) =>
  checkCount({ candles: c.slice(0, ewIndexAt(c, upTo) + 1), tf, impulse: anchorsAt(c, imp), toleranceCandles: extra.tol ?? 2 });

describe('снап и допуск по времени (§2.2)', () => {
  it('точка 4 на 08-26 08:00 притягивается к экстремуму окна ±2: 08-26 12:00, 77600.0 (EW-4)', () => {
    const imp: Pt[] = [['2026-08-01T16:00', 'low'], ['2026-08-09T20:00', 'high'], ['2026-08-14T12:00', 'low'], ['2026-08-25T00:00', 'high'], ['2026-08-26T08:00', 'low']];
    const r = run(btc4, '4h', imp, '2026-08-27T08:00');
    const p4 = r.points[4]!;
    expect([iso(p4.time), p4.price, p4.offsetCandles, iso(p4.userTime)]).toEqual(['2026-08-26T12:00', 77600, 1, '2026-08-26T08:00']);
    expect(r.errors.filter((e) => e.severity === 'major')).toEqual([]);
  });
  it('если свеча якоря сама достигает экстремума окна - остаётся на ней; при равенстве - более ранняя', () => {
    const ns = normSeries(sol, 1);
    const i = ewIndexAt(sol, '2026-08-07T17:00'); // low 73.15 - минимум окна
    expect(snapIndex(ns, 0, i, 2, sol.length)).toBe(i);
    expect(snapIndex(ns, 0, i + 1, 2, sol.length)).toBe(i);
    expect(snapIndex(ns, 0, i - 2, 2, sol.length)).toBe(i);
    expect(snapIndex(ns, 0, i + 3, 2, sol.length)).not.toBe(i); // за пределами допуска
  });
  it('окно у границ ряда обрезается; якорь вне ряда - исключение', () => {
    const ns = normSeries(sol, 1);
    expect(snapIndex(ns, 0, 0, 2, sol.length)).toBeGreaterThanOrEqual(0);
    expect(snapIndex(ns, 0, sol.length - 1, 2, sol.length)).toBeLessThan(sol.length);
    expect(() => checkCount({ candles: sol.slice(0, 100), tf: '1h', impulse: anchorsAt(sol, SOL_IMP) })).toThrow('EW_ANCHOR_OUT_OF_RANGE');
  });
  it('tol=0: снап отключён, цена - экстремум свечи якоря по роли', () => {
    const r = run(sol, '1h', SOL_IMP, '2026-08-10T05:00', { tol: 0 });
    expect(r.points.map((p) => p.offsetCandles)).toEqual([0, 0, 0]);
    expect(r.points.map((p) => p.price)).toEqual([72.29, 74.33, 73.15]);
  });
});

describe('порядок (§3 п.1)', () => {
  it('равные цены первых двух якорей - направление не определено: EW_WRONG_ORDER для 0 и 1', () => {
    const i = ewIndexAt(sol, '2026-08-07T13:00');
    const a = { time: sol[i]!.openTime, price: 74.33 };
    const r = checkCount({ candles: sol.slice(0, 260), tf: '1h', impulse: [a, { ...a, time: sol[i + 1]!.openTime }, { ...a, time: sol[i + 5]!.openTime }] });
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0]).toMatchObject({ code: 'EW_WRONG_ORDER', severity: 'major', skill: 'ew-impulse', params: { pointA: '0', pointB: '1' } });
    expect(r.direction).toBeNull();
    expect(r.orderBroken).toBe(true);
  });
  it('две точки на одной свече - EW_WRONG_ORDER (после снапа индексы не возрастают)', () => {
    const imp: Pt[] = [['2026-08-06T23:00', 'low'], ['2026-08-07T13:00', 'high'], ['2026-08-07T13:00', 'low']];
    const r = run(sol, '1h', imp, '2026-08-10T05:00', { tol: 0 });
    expect(r.errors.map((e) => e.code)).toEqual(['EW_WRONG_ORDER']);
    expect(r.errors[0]!.params).toMatchObject({ pointA: '1', pointB: '2' });
  });
  it('точка 2 выше точки 1 (L2 <= 0) - EW_WRONG_ORDER; правила и рекомендации не вычисляются', () => {
    // high 08-07 05:00 = 72.92, low 08-07 10:00 = 73.46 (выше)
    const imp: Pt[] = [['2026-08-06T23:00', 'low'], ['2026-08-07T05:00', 'high'], ['2026-08-07T10:00', 'low']];
    const r = run(sol, '1h', imp, '2026-08-10T05:00', { tol: 0 });
    expect(r.errors.map((e) => e.code)).toEqual(['EW_WRONG_ORDER']);
    expect(r.errors[0]!.params).toMatchObject({ pointA: '1', pointB: '2', priceA: 72.92, priceB: 73.46 });
    expect(r.rules).toEqual([]);
    expect(r.guides).toEqual([]);
    expect(r.count).toBeNull();
  });
});

describe('экстремум сегмента и swing (§3 п.2-3)', () => {
  it('точка 3 на 08-21 08:00 при точке 4 на 08-26 12:00: экстремум сегмента 3-4 - 81270.5 на 08-25 00:00 (EW-4)', () => {
    const imp: Pt[] = [['2026-08-01T16:00', 'low'], ['2026-08-09T20:00', 'high'], ['2026-08-14T12:00', 'low'], ['2026-08-21T08:00', 'high'], ['2026-08-26T12:00', 'low']];
    const r = run(btc4, '4h', imp, '2026-08-27T08:00', { tol: 0 });
    const e = r.errors.find((x) => x.code === 'EW_POINT_NOT_EXTREME')!;
    expect(e.params).toMatchObject({ label: '3', prevLabel: '3', nextLabel: '4', extremePrice: 81270.5, sideName: 'high' });
    expect(iso(e.params!.extremeTime as number)).toBe('2026-08-25T00:00');
    expect(r.points[3]!.extreme).toBe(false);
    expect(r.pointErrors.notExtreme).toBeGreaterThanOrEqual(1);
  });
  it('не более одной ошибки EW_POINT_* на точку', () => {
    const imp: Pt[] = [['2026-08-01T16:00', 'low'], ['2026-08-09T20:00', 'high'], ['2026-08-14T12:00', 'low'], ['2026-08-21T08:00', 'high'], ['2026-08-26T12:00', 'low']];
    const r = run(btc4, '4h', imp, '2026-08-27T08:00', { tol: 0 });
    const labels = r.errors.filter((e) => e.code.startsWith('EW_POINT_')).map((e) => e.params!.label);
    expect(new Set(labels).size).toBe(labels.length);
  });
  it('точка - экстремум сегмента, но не swing N=5: EW_POINT_NOT_SWING (minor), вердикт точек не major', () => {
    // SOL 1h: точка 2 на 08-07 14:00 (low 73.52): ниже в ближайших 5 свечах будет 73.15 (17:00)
    const imp: Pt[] = [['2026-08-06T23:00', 'low'], ['2026-08-07T13:00', 'high'], ['2026-08-07T14:00', 'low']];
    const r = run(sol, '1h', imp, '2026-08-10T05:00', { tol: 0 });
    const e = r.errors.filter((x) => x.code === 'EW_POINT_NOT_SWING');
    expect(e).toHaveLength(1);
    expect(e[0]).toMatchObject({ severity: 'minor', params: { label: '2', n: 5, sideName: 'low' } });
    expect(r.pointErrors).toEqual({ notExtreme: 0, notSwing: 1 });
    expect(r.points.map((p) => p.swing)).toEqual([true, true, false]);
  });
  it('ошибки точек коррекции относятся к навыку ew-correction', () => {
    const imp: Pt[] = [['2026-08-06T23:00', 'low'], ['2026-08-07T13:00', 'high'], ['2026-08-07T17:00', 'low'], ['2026-08-08T15:00', 'high'], ['2026-08-09T01:00', 'low'], ['2026-08-09T22:00', 'high']];
    const r = checkCount({
      candles: sol.slice(0, ewIndexAt(sol, '2026-08-11T20:00') + 1), tf: '1h', toleranceCandles: 0, impulse: anchorsAt(sol, imp),
      correction: { type: 'zigzag', anchors: anchorsAt(sol, [['2026-08-10T16:00', 'low'], ['2026-08-11T11:00', 'high'], ['2026-08-11T15:00', 'low']]) },
    });
    const a = r.errors.find((e) => e.code === 'EW_POINT_NOT_EXTREME' && e.params!.label === 'A')!;
    expect(a.skill).toBe('ew-correction');
    expect(iso(a.params!.extremeTime as number)).toBe('2026-08-11T07:00');
  });
  it('коррекция при импульсе не из 6 точек игнорируется', () => {
    const r = checkCount({
      candles: sol.slice(0, 260), tf: '1h', toleranceCandles: 0, impulse: anchorsAt(sol, SOL_IMP),
      correction: { type: 'zigzag', anchors: anchorsAt(sol, [['2026-08-11T07:00', 'low'], ['2026-08-11T11:00', 'high'], ['2026-08-11T15:00', 'low']]) },
    });
    expect(r.points).toHaveLength(3);
    expect(r.correction).toBeNull();
    expect(r.count!.scenario).toBe('w3-next');
  });
  it('детерминизм: повторный вызов даёт тот же результат', () => {
    const a = run(sol, '1h', SOL_IMP, '2026-08-10T05:00');
    const b = run(sol, '1h', SOL_IMP, '2026-08-10T05:00');
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});
