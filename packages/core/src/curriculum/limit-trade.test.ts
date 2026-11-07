import { describe, expect, it } from 'vitest';
import { candleProvider } from '../testing/provider';
import { readKlines } from '../testing/klines';
import { btc1h, btc4h, isoOf, visibleAt } from '../testing/cur';
import type { AggTrade, FutureProvider } from '../challenge/resolve';
import { TIMEFRAME_MS, type Candle } from '../types';
import { resolveLimitTrade, type PendingOrder } from './limit-trade';
import { gradeComboLevel, gradeComboSmc, playCombo, smcContext, type ComboAnswer } from './combo';
import { htfClosedBefore, levelsContext } from './generate';
import { computeZones } from './zone';

// SYNTHETIC: минимальные последовательности для логики автомата ожидание -> позиция (в реальных фикстурах нет нужных пар 1m/aggTrades).
const H = TIMEFRAME_MS['1h'];
const M = TIMEFRAME_MS['1m'];
const cd = (tf: number, i: number, o: number, h: number, l: number, c: number): Candle => ({ openTime: i * tf, closeTime: i * tf + tf - 1, open: o, high: h, low: l, close: c, volume: 1, quoteVolume: 1, trades: 1, closed: true });
const hc = (i: number, o: number, h: number, l: number, c: number) => cd(H, i, o, h, l, c);
const mc = (i: number, o: number, h: number, l: number, c: number) => cd(M, i, o, h, l, c);

const LONG: PendingOrder = { side: 'LONG', limit: 100, sl: 90, tp: 120, T: 0, tf: '1h', limitCandles: 10, zone: { near: 105, far: 98 }, A: 10, P: 108, tick: 0.1 };
const flatMinutes = (hour: number, price: number, over: Record<number, [number, number]> = {}): Candle[] =>
  Array.from({ length: 60 }, (_, k) => {
    const [h, l] = over[k] ?? [price, price];
    return mc(hour * 60 + k, price, h, l, price);
  });
const provider = (hours: Candle[], minutes: Candle[] = [], trades?: (minuteOpen: number) => AggTrade[] | null): FutureProvider => ({
  ...candleProvider({ '1h': hours }, minutes),
  aggTrades: async (m) => (trades ? trades(m) : null),
});
const tr = (t: number, price: number, id = t): AggTrade => ({ aggTradeId: id, price, transactTime: t });

describe('resolveLimitTrade: ожидание (synthetic)', () => {
  it('касание лимитной цены ровно - не исполнение; проход на тик - исполнение; затем TP по свечам', async () => {
    const hours = [hc(0, 108, 109, 100, 105), hc(1, 105, 106, 99.9, 101), hc(2, 101, 121, 100.5, 120)];
    const r = await resolveLimitTrade(LONG, provider(hours));
    expect(r).toMatchObject({ kind: 'tp', fillTime: H, fillMethod: 'candle', rMultiple: 2, exitTime: 2 * H, entry: 100 });
  });
  it('цель достигнута без входа - cancelled-target, 0R', async () => {
    const r = await resolveLimitTrade(LONG, provider([hc(0, 108, 121, 101, 119), hc(1, 119, 120, 99, 100)]));
    expect(r).toEqual({ kind: 'cancelled-target', time: 0, rMultiple: 0 });
  });
  it('реакция зоны прошла без исполнения - cancelled-reaction на свече подтверждения', async () => {
    const o = { ...LONG, tp: 150 };
    const r = await resolveLimitTrade(o, provider([hc(0, 112, 112, 109, 109), hc(1, 109, 126, 108, 125), hc(2, 125, 126, 99, 100)]));
    expect(r).toEqual({ kind: 'cancelled-reaction', time: H, rMultiple: 0 });
  });
  it('экстремум зоны подхода обновляется (m): реакция считается от нового минимума', async () => {
    const o = { ...LONG, tp: 150 };
    // c0 вход m=109; c1 low 106 -> m=106; close 120 < 106+15=121: не реакция; c2 close 122 -> реакция
    const r = await resolveLimitTrade(o, provider([hc(0, 112, 112, 109, 111), hc(1, 111, 121, 106, 120), hc(2, 120, 123, 107, 122)]));
    expect(r).toEqual({ kind: 'cancelled-reaction', time: 2 * H, rMultiple: 0 });
  });
  it('окно исчерпано - not-filled (время = конец окна)', async () => {
    const r = await resolveLimitTrade({ ...LONG, limitCandles: 2 }, provider([hc(0, 108, 109, 104, 105), hc(1, 105, 106, 103, 104), hc(2, 104, 105, 50, 60)]));
    expect(r).toEqual({ kind: 'not-filled', time: 2 * H - 1, rMultiple: 0 });
  });
  it('SHORT зеркально: цель снизу без входа и исполнение выше на тик', async () => {
    const S: PendingOrder = { side: 'SHORT', limit: 100, sl: 110, tp: 80, T: 0, tf: '1h', limitCandles: 10, zone: { near: 95, far: 102 }, A: 10, P: 92, tick: 0.1 };
    expect(await resolveLimitTrade(S, provider([hc(0, 92, 98, 79, 85)]))).toMatchObject({ kind: 'cancelled-target' });
    const r = await resolveLimitTrade(S, provider([hc(0, 92, 100, 90, 95), hc(1, 95, 100.1, 94, 99), hc(2, 99, 100, 79, 80)]));
    expect(r).toMatchObject({ kind: 'tp', fillTime: H, rMultiple: 2 });
  });
});

describe('resolveLimitTrade: исполнение и SL/TP на одной свече (synthetic_fill_and_sl_same_candle)', () => {
  it('drill-down 1m: исполнение минутой раньше SL -> исполнение, затем SL (-1R)', async () => {
    const hours = [hc(0, 105, 106, 89, 95)];
    const minutes = flatMinutes(0, 105, { 5: [105, 99], 6: [99, 89] });
    const r = await resolveLimitTrade(LONG, provider(hours, minutes));
    expect(r).toMatchObject({ kind: 'sl', fillMethod: 'drill-1m', method: 'drill-1m', rMultiple: -1, fillTime: 5 * M, exitTime: 6 * M });
  });
  it('drill-down 1m: цель раньше исполнения -> cancelled-target', async () => {
    const hours = [hc(0, 105, 121, 99, 110)];
    const minutes = flatMinutes(0, 105, { 3: [121, 105], 8: [105, 99] });
    expect(await resolveLimitTrade(LONG, provider(hours, minutes))).toEqual({ kind: 'cancelled-target', time: 3 * M, rMultiple: 0 });
  });
  it('drill-down 1m: исполнение, затем TP в другой минуте', async () => {
    const hours = [hc(0, 105, 121, 99, 110)];
    const minutes = flatMinutes(0, 105, { 3: [105, 99], 8: [121, 105] });
    const r = await resolveLimitTrade(LONG, provider(hours, minutes));
    expect(r).toMatchObject({ kind: 'tp', fillMethod: 'drill-1m', rMultiple: 2, exitTime: 8 * M });
  });
  it('неоднозначная минута: порядок сделок aggTrades решает', async () => {
    const hours = [hc(0, 105, 106, 89, 95)];
    const minutes = flatMinutes(0, 105, { 5: [105, 89] });
    const t0 = 5 * M;
    const fillThenSl = provider(hours, minutes, () => [tr(t0 + 1, 101), tr(t0 + 2, 99.8), tr(t0 + 3, 89.9)]);
    expect(await resolveLimitTrade(LONG, fillThenSl)).toMatchObject({ kind: 'sl', fillMethod: 'drill-aggtrades', method: 'drill-aggtrades', exitTime: t0 + 3, fillTime: t0 + 2 });
    const hours2 = [hc(0, 105, 121, 99, 110)];
    const minutes2 = flatMinutes(0, 105, { 5: [121, 99] });
    const tpFirst = provider(hours2, minutes2, () => [tr(t0 + 1, 121), tr(t0 + 2, 99.8)]);
    expect(await resolveLimitTrade(LONG, tpFirst)).toEqual({ kind: 'cancelled-target', time: t0 + 1, rMultiple: 0 });
    const fillFirst = provider(hours2, minutes2, () => [tr(t0 + 1, 99.8), tr(t0 + 2, 121)]);
    expect(await resolveLimitTrade(LONG, fillFirst)).toMatchObject({ kind: 'tp', fillMethod: 'drill-aggtrades', exitTime: t0 + 2 });
  });
  it('в открытой позиции sl и tp в одной минуте: aggTrades или консервативный SL', async () => {
    const hours = [hc(0, 105, 125, 85, 110)];
    const minutes = flatMinutes(0, 105, { 2: [105, 99], 4: [125, 85] });
    const t4 = 4 * M;
    const viaTrades = provider(hours, minutes, () => [tr(t4 + 1, 121), tr(t4 + 2, 89)]);
    expect(await resolveLimitTrade(LONG, viaTrades)).toMatchObject({ kind: 'tp', method: 'drill-aggtrades', exitTime: t4 + 1 });
    expect(await resolveLimitTrade(LONG, provider(hours, minutes))).toMatchObject({ kind: 'sl', method: 'conservative-sl', rMultiple: -1 });
  });
  it('нет 1m / aggTrades -> консервативно: sl затронут - исполнение и SL; иначе - цель до входа', async () => {
    const slCase = await resolveLimitTrade(LONG, provider([hc(0, 105, 106, 89, 95)]));
    expect(slCase).toMatchObject({ kind: 'sl', fillMethod: 'conservative', method: 'conservative-sl', rMultiple: -1 });
    expect(await resolveLimitTrade(LONG, provider([hc(0, 105, 121, 99, 110)]))).toEqual({ kind: 'cancelled-target', time: 0, rMultiple: 0 });
    // 1m неполные (59 минут) - тоже консервативно
    expect(await resolveLimitTrade(LONG, provider([hc(0, 105, 106, 89, 95)], flatMinutes(0, 105).slice(1)))).toMatchObject({ fillMethod: 'conservative' });
  });
  it('исполнение на последней свече окна без касаний - timeout по закрытию; aggTrades без решения - консервативно', async () => {
    const r = await resolveLimitTrade({ ...LONG, limitCandles: 1 }, provider([hc(0, 105, 106, 99, 104)]));
    expect(r).toMatchObject({ kind: 'timeout', exitPrice: 104, rMultiple: 0.4, fillMethod: 'candle' });
    const hours = [hc(0, 105, 106, 89, 95)];
    const minutes = flatMinutes(0, 105, { 5: [105, 89] });
    expect(await resolveLimitTrade(LONG, provider(hours, minutes, () => [tr(1, 105)]))).toMatchObject({ kind: 'sl', fillMethod: 'conservative' });
  });
  it('неверный ордер и пустое будущее - ошибки', async () => {
    await expect(resolveLimitTrade({ ...LONG, sl: 101 }, provider([hc(0, 1, 1, 1, 1)]))).rejects.toThrow('INVALID_ORDER');
    await expect(resolveLimitTrade({ ...LONG, tick: 0 }, provider([hc(0, 1, 1, 1, 1)]))).rejects.toThrow('INVALID_ORDER');
    await expect(resolveLimitTrade(LONG, provider([]))).rejects.toThrow('NO_FUTURE_CANDLES');
  });
});

describe('resolveLimitTrade на реальных данных (CB-3, CB-S2)', () => {
  const h1 = btc1h();
  const h4 = btc4h();
  it('CB-3: ордер у 77291.2 не взял реакцию 09-17 - снят 14:00, а без снятия исполнился бы позже на пробое', async () => {
    const { visible, T, iT } = visibleAt(h1, '2026-09-16T12:00:00Z');
    const set = computeZones(visible, htfClosedBefore(h4, T, 500))!;
    const base = { side: 'SHORT' as const, T, tf: '1h' as const, limitCandles: 72, zone: { near: 77291.2, far: 77469.3 }, A: set.A, P: set.P, tick: 0.1 };
    const p = candleProvider({ '1h': h1 });
    const r = await resolveLimitTrade({ ...base, limit: 77291.2, sl: 77600, tp: 76458.9 }, p);
    expect(r).toEqual({ kind: 'cancelled-reaction', time: Date.parse('2026-09-17T14:00:00Z'), rMultiple: 0 });
    // чистый resolveTrade-подобный сценарий: зона вне поля реакции - ордер исполняется 09-18 03:00 и закрывается
    const late = await resolveLimitTrade({ ...base, zone: { near: 1_000_000, far: 1_000_100 }, limit: 77291.2, sl: 77600, tp: 76458.9 }, p);
    expect(late.kind === 'sl' || late.kind === 'tp' || late.kind === 'timeout').toBe(true);
    expect(isoOf((late as { fillTime: number }).fillTime)).toBe('2026-09-18T03:00:00Z');
    expect(iT).toBeGreaterThan(0);
  });
  it('CB-S2 (4h): цель 84901.6 достигнута до исполнения - cancelled-target 10-01 16:00', async () => {
    const { visible, T } = visibleAt(h4, '2026-09-30T20:00:00Z');
    const c = smcContext(visible)!;
    const r = await resolveLimitTrade({ side: 'LONG', limit: 81295, sl: 79800, tp: 84901.6, T, tf: '4h', limitCandles: 60, zone: { near: 81295, far: 80095.9 }, A: c.A, P: c.P, tick: 0.1 }, candleProvider({ '4h': h4 }));
    expect(r).toEqual({ kind: 'cancelled-target', time: Date.parse('2026-10-01T16:00:00Z'), rMultiple: 0 });
  });
});

describe('инвариант: 15m и 1h с drill-down на реальных 1m дают один исход (BTCUSDT 2026-10-20/21)', () => {
  const m1 = [...readKlines('klines/BTCUSDT/1m/BTCUSDT-1m-2026-10-20.csv'), ...readKlines('klines/BTCUSDT/1m/BTCUSDT-1m-2026-10-21.csv')];
  const m15 = [...readKlines('klines/BTCUSDT/15m/BTCUSDT-15m-2026-10-20.csv'), ...readKlines('klines/BTCUSDT/15m/BTCUSDT-15m-2026-10-21.csv')];
  const h = [...readKlines('klines/BTCUSDT/1h/BTCUSDT-1h-2026-10-20.csv'), ...readKlines('klines/BTCUSDT/1h/BTCUSDT-1h-2026-10-21.csv')];
  it('вне зоны реакции: тот же kind и R для обоих ТФ', async () => {
    let compared = 0;
    for (let i = 2; i < 30; i += 2) {
      const T = h[i]!.openTime;
      const P = h[i - 1]!.close;
      for (const side of ['LONG', 'SHORT'] as const) {
        const long = side === 'LONG';
        const limit = Math.round(long ? P - 40 : P + 40);
        const o = { side, limit, sl: long ? limit - 120 : limit + 120, tp: long ? limit + 200 : limit - 200, T, limitCandles: 12, A: 100, P, tick: 0.1, zone: side === 'LONG' ? { near: 1000, far: 900 } : { near: 1_000_000, far: 1_000_100 } };
        const a = await resolveLimitTrade({ ...o, tf: '1h' }, candleProvider({ '1h': h }, m1));
        const b = await resolveLimitTrade({ ...o, tf: '15m', limitCandles: 48 }, candleProvider({ '15m': m15 }, m1));
        const key = (x: typeof a) => ({ kind: x.kind, r: Math.round(x.rMultiple * 1e6) / 1e6 });
        expect(key(a)).toEqual(key(b));
        compared++;
      }
    }
    expect(compared).toBeGreaterThanOrEqual(20);
  });
});

describe('playCombo: stop hunt и блоки (combo-level-trade, реальные данные)', () => {
  it('исход SL без выноса: нет блоков', async () => {
    const h1 = btc1h();
    const h4 = btc4h();
    const v = visibleAt(h1, '2026-09-15T00:00:00Z');
    const set = computeZones(v.visible, htfClosedBefore(h4, v.T, 500))!;
    const ctx = levelsContext(v.visible, htfClosedBefore(h4, v.T, 500), 'support', 'medium')!;
    const answer: ComboAnswer = { zone: { id: 'z', kind: 'zone', anchors: [{ time: 0, price: 77430 }, { time: 0, price: 77200 }], scope: null, direction: null, author: 'user' }, limit: { price: 77427.4, type: 'near-edge', frontK: null }, sl: 77050, tp: 78343.8 };
    const g = gradeComboLevel(ctx, v.visible, answer, 'LONG');
    const play = await playCombo(g, { side: 'LONG', T: v.T, tf: '1h', limitCandles: 72, zone: { near: g.zone.top, far: g.zone.bottom }, A: set.A, P: set.P, tick: 0.1 }, answer, candleProvider({ '1h': h1 }));
    expect(play.outcome).toMatchObject({ kind: 'sl', rMultiple: -1 });
    expect(play.hunt.hunted).toBe(false);
    expect(play.blocks).toEqual({ errors: [], ok: [] });
    expect(typeof gradeComboSmc).toBe('function');
  });
});
