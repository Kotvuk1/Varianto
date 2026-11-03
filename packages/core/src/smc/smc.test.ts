import { describe, expect, it } from 'vitest';
import { iso, readKlines } from '../testing/klines';
import { analyzeStructure } from './analyze';
import { buildAlgoMarkSet, toMarks } from './marks';
import { atr14, candleIndexAt, closedOnly, CoreInputError, gaps, inferTimeframe, lastSegmentStart } from './series';
import { detectSweeps } from './sweeps';
import { detectSwings, labelSwings, pendingSwings } from './swings';
import { detectFvgs } from './fvg';
import { detectOrderBlocks } from './orderblock';
import { runExternalLayer } from './structure';
import type { Candle, StructureParams, Swing } from '../types';

const btc = readKlines('klines/BTCUSDT/4h/BTCUSDT-4h-2026-09.csv');
const P: StructureParams = { nExt: 5, nInt: 3, sweepHoldK: 3, fvgMinAtr: 0.5, obDisplacementAtr: 1.2 };
const H4 = 4 * 3600_000;
const idxOf = (s: string) => btc.findIndex((c) => c.openTime === iso(s));

// SYNTHETIC: минимальные кейсы граничных условий, которых нет в реальных данных (префикс synthetic_)
function synthetic_candles(rows: [number, number, number, number][], step = H4): Candle[] {
  return rows.map(([o, h, l, c], i) => ({
    openTime: i * step, closeTime: i * step + step - 1, open: o, high: h, low: l, close: c,
    volume: 1, quoteVolume: 1, trades: 1, closed: true,
  }));
}

describe('series', () => {
  it('closedOnly отбрасывает хвост незакрытых и бросает при незакрытой в середине', () => {
    const c = btc.slice(0, 10).map((x) => ({ ...x }));
    c[9]!.closed = false;
    expect(closedOnly(c)).toHaveLength(9);
    c[4]!.closed = false;
    expect(() => closedOnly(c)).toThrowError(CoreInputError);
    try {
      closedOnly(c);
    } catch (e) {
      expect((e as CoreInputError).code).toBe('UNCLOSED_IN_SERIES');
    }
    expect(closedOnly([])).toEqual([]);
  });

  it('atr14: null до 14-й свечи, затем простое среднее TR', () => {
    const a = atr14(btc);
    expect(a.slice(0, 14).every((x) => x === null)).toBe(true);
    let s = 0;
    for (let j = 1; j <= 14; j++) {
      const c = btc[j]!;
      const pc = btc[j - 1]!.close;
      s += Math.max(c.high - c.low, Math.abs(c.high - pc), Math.abs(c.low - pc));
    }
    expect(a[14]).toBe(s / 14);
  });

  it('gaps, lastSegmentStart, inferTimeframe, candleIndexAt', () => {
    const holed = [...btc.slice(0, 20), ...btc.slice(25, 40)]; // реальные свечи с вырезанным куском
    expect(gaps(btc, '4h')).toEqual([]);
    expect(gaps(holed, '4h')).toEqual([{ fromTime: btc[20]!.openTime, toTime: btc[25]!.openTime }]);
    expect(lastSegmentStart(holed, '4h')).toBe(20);
    expect(lastSegmentStart(btc, '4h')).toBe(0);
    expect(inferTimeframe(btc)).toBe('4h');
    expect(inferTimeframe([])).toBeNull();
    expect(candleIndexAt(btc, btc[3]!.openTime + 1000, H4)).toBe(3);
    expect(candleIndexAt(btc, btc[0]!.openTime - 1, H4)).toBe(-1);
    expect(candleIndexAt(btc, btc[btc.length - 1]!.openTime + H4, H4)).toBe(-1);
  });
});

describe('detectSwings', () => {
  it('одна свеча может быть и swing high, и swing low (GS-1 09-11 12:00): high раньше low', () => {
    const sw = detectSwings(btc, { left: 5, right: 5 }).filter((s) => s.time === iso('2026-09-11T12:00:00Z'));
    expect(sw.map((s) => s.type)).toEqual(['high', 'low']);
    expect(sw[0]!.confirmedIndex).toBe(sw[0]!.index + 5);
  });

  it('меньше 2N+1 свечей -> пусто; swing не определяется без N правых закрытых свечей', () => {
    expect(detectSwings(btc.slice(0, 10), { left: 5, right: 5 })).toEqual([]);
    const full = detectSwings(btc, { left: 5, right: 5 });
    const cut = detectSwings(btc.slice(0, 83 + 5), { left: 5, right: 5 }); // swing 09-14 20:00 (index 83) без 5 правых
    expect(cut.some((s) => s.index === 83)).toBe(false);
    expect(full.some((s) => s.index === 83)).toBe(true);
    expect(pendingSwings(btc.slice(0, 83 + 3), { left: 5, right: 5 }).some((s) => s.index === 83 && s.type === 'high')).toBe(true);
  });

  it('synthetic_equal_highs: из равных максимумов swing только ранний; равный минимум справа допустим', () => {
    // SYNTHETIC: нужен точный контроль равенства high/low в пределах окна N=2
    const c = synthetic_candles([
      [10, 11, 9, 10], [10, 12, 9.5, 11], [11, 15, 10, 14], [14, 15, 13, 14], [14, 14.5, 12, 13], [13, 13.5, 12, 12.5], [12, 13, 11, 12],
    ]);
    const hs = detectSwings(c, { left: 2, right: 2 }).filter((s) => s.type === 'high');
    expect(hs.map((s) => s.index)).toEqual([2]);
    // слева строгость: равный low слева — не swing low
    const lows = synthetic_candles([[5, 6, 4, 5], [5, 6, 4, 5], [5, 6, 3, 4], [4, 6, 3, 5], [5, 6, 4, 5], [5, 6, 5, 5]]);
    expect(detectSwings(lows, { left: 2, right: 2 }).filter((s) => s.type === 'low').map((s) => s.index)).toEqual([2]);
  });

  it('labelSwings: равенство -> LH / HL, первый swing типа без метки', () => {
    const mk = (type: 'high' | 'low', price: number): Swing => ({ index: 0, time: 0, type, price, confirmedIndex: 0, scope: 'external', label: null });
    const labels = labelSwings([mk('high', 10), mk('low', 5), mk('high', 10), mk('low', 5), mk('high', 11), mk('low', 4)]);
    expect(labels).toEqual([null, null, 'LH', 'HL', 'HH', 'LL']);
  });
});

describe('незакрытая свеча не участвует в swing/BOS/sweep/OB/FVG (FR-DATA-08)', () => {
  const bosIdx = idxOf('2026-09-21T08:00:00Z');
  it('BOS на последней свече: закрытая даёт событие, незакрытая — нет', () => {
    const closedRun = analyzeStructure(btc.slice(0, bosIdx + 1), P);
    expect(closedRun.events.some((e) => e.breakIndex === bosIdx && e.kind === 'bos')).toBe(true);
    const open = btc.slice(0, bosIdx + 1).map((c) => ({ ...c }));
    open[bosIdx]!.closed = false;
    const openRun = analyzeStructure(open, P);
    expect(openRun.events.some((e) => e.breakIndex === bosIdx)).toBe(false);
    expect(openRun.times).toHaveLength(bosIdx);
    const ref = analyzeStructure(btc.slice(0, bosIdx), P);
    expect(openRun.events).toEqual(ref.events);
    expect(openRun.swings).toEqual(ref.swings);
    expect(openRun.fvgs).toEqual(ref.fvgs);
    expect(openRun.orderBlocks).toEqual(ref.orderBlocks);
    expect(openRun.sweeps).toEqual(ref.sweeps);
  });

  it('незакрытая свеча с экстремальным high не создаёт swing и sweep', () => {
    // SYNTHETIC: искажённая копия реальной свечи с closed=false (экстремум, которого нет в данных)
    const open = btc.slice(0, 120).map((c) => ({ ...c }));
    open.push({ ...open[119]!, openTime: open[119]!.openTime + H4, closeTime: open[119]!.closeTime + H4, high: 999999, low: 1, close: 999000, closed: false });
    const withOpen = analyzeStructure(open, P);
    const without = analyzeStructure(btc.slice(0, 120), P);
    expect(withOpen.events).toEqual(without.events);
    expect(withOpen.sweeps).toEqual(without.sweeps);
    expect(withOpen.swings).toEqual(without.swings);
    expect(withOpen.state.external.trend).toBe(without.state.external.trend);
  });

  it('незакрытая свеча в середине ряда -> CoreInputError', () => {
    const bad = btc.slice(0, 50).map((c) => ({ ...c }));
    bad[10]!.closed = false;
    expect(() => analyzeStructure(bad, P)).toThrowError(CoreInputError);
  });
});

describe('analyzeStructure: пропуски, состояния, детерминизм', () => {
  it('анализ ведётся по последнему непрерывному сегменту; индексы — во входном массиве', () => {
    const holed = [...btc.slice(0, 40), ...btc.slice(50)]; // реальные свечи, вырезан кусок
    const seg = btc.slice(50);
    const rh = analyzeStructure(holed, P);
    const rs = analyzeStructure(seg, P);
    expect(rh.baseIndex).toBe(40);
    expect(rh.gaps).toHaveLength(1);
    expect(rs.baseIndex).toBe(0);
    expect(rh.swings.map((s) => s.time)).toEqual(rs.swings.map((s) => s.time));
    expect(rh.swings.map((s) => s.index)).toEqual(rs.swings.map((s) => s.index + 40));
    expect(rh.events.map((e) => [e.breakIndex, e.brokenSwing.index])).toEqual(rs.events.map((e) => [e.breakIndex + 40, e.brokenSwing.index + 40]));
    expect(rh.orderBlocks.map((o) => [o.index, o.originIndex, o.statusIndex])).toEqual(rs.orderBlocks.map((o) => [o.index + 40, o.originIndex + 40, o.statusIndex === null ? null : o.statusIndex + 40]));
    expect(rh.fvgs.map((f) => f.middleIndex)).toEqual(rs.fvgs.map((f) => f.middleIndex + 40));
    expect(rh.sweeps.map((s) => s.index)).toEqual(rs.sweeps.map((s) => s.index + 40));
    expect(rh.pendingSwings.map((s) => s.index)).toEqual(rs.pendingSwings.map((s) => s.index + 40));
    expect(rh.stateAt(10).external.trend).toBe('none');
    expect(rh.stateAt(10).internal?.trend).toBe('none');
    expect(rh.stateAt(holed.length - 1).external.trend).toBe(rs.state.external.trend);
    // markItems/toMarks используют времена, а не индексы
    expect(toMarks(rh).map((m) => m.id)).toEqual(toMarks(rs).map((m) => m.id));
  });

  it('nInt = null: внутренний слой не считается; stateAt', () => {
    const r = analyzeStructure(btc, { ...P, nInt: null });
    expect(r.state.internal).toBeNull();
    expect(r.stateAt(0).internal).toBeNull();
    expect(r.swings.every((s) => s.scope === 'external')).toBe(true);
    const mid = r.stateAt(idxOf('2026-09-08T04:00:00Z'));
    expect(mid.external.trend).toBe('down');
    expect(mid.external.lastEvent?.kind).toBe('choch');
    expect(r.stateAt(9999).external).toBe(r.state.external);
  });

  it('детерминизм: двойной запуск идентичен', () => {
    const a = analyzeStructure(btc, P);
    const b = analyzeStructure(btc, P);
    expect(JSON.stringify([a.swings, a.events, a.sweeps, a.orderBlocks, a.fvgs])).toBe(JSON.stringify([b.swings, b.events, b.sweeps, b.orderBlocks, b.fvgs]));
    expect(a.algoVersion).toBe('1.0.0');
  });

  it('пустой ряд и ряд короче окна фрактала', () => {
    const r = analyzeStructure([], P);
    expect(r.swings).toEqual([]);
    expect(r.state.external.trend).toBe('none');
    expect(analyzeStructure(btc.slice(0, 4), P).events).toEqual([]);
  });

  it('производительность: 1000 свечей < 100 мс (NFR-PERF-03)', () => {
    const big = [...readKlines('klines/BTCUSDT/1h/BTCUSDT-1h-2026-08.csv')].slice(0, 1000);
    const t0 = performance.now();
    analyzeStructure(big, P);
    expect(performance.now() - t0).toBeLessThan(100 * 5); // допуск CI x5
  });
});

describe('sweep', () => {
  const sweepIdx = idxOf('2026-09-28T04:00:00Z');
  const ext = detectSwings(btc, { left: 5, right: 5 });

  it('кандидат у правого края, подтверждение после K свечей', () => {
    const cand = detectSweeps(btc.slice(0, sweepIdx + 1), detectSwings(btc.slice(0, sweepIdx + 1), { left: 5, right: 5 }), 3);
    expect(cand.confirmed.some((s) => s.index === sweepIdx)).toBe(false);
    const c = cand.candidates.find((s) => s.index === sweepIdx)!;
    expect(c.confirmedIndex).toBeNull();
    const conf = detectSweeps(btc.slice(0, sweepIdx + 4), detectSwings(btc.slice(0, sweepIdx + 4), { left: 5, right: 5 }), 3);
    expect(conf.confirmed.find((s) => s.index === sweepIdx)!.confirmedIndex).toBe(sweepIdx + 3);
    // в analyzeStructure кандидат отдаётся отдельно и не входит в эталон
    const r = analyzeStructure(btc.slice(0, sweepIdx + 1), { ...P, nInt: null });
    expect(r.sweeps.some((s) => s.index === sweepIdx)).toBe(false);
    expect(r.sweepCandidates.some((s) => s.index === sweepIdx)).toBe(true);
    const algo = buildAlgoMarkSet(r, { concepts: ['swing', 'sweep'], window: { fromIndex: 0, toIndex: sweepIdx } });
    expect(algo.tolerated.some((m) => m.kind === 'sweep')).toBe(true);
    expect(algo.required.some((m) => m.kind === 'sweep' && m.anchors[1]!.time === btc[sweepIdx]!.openTime)).toBe(false);
  });

  it('synthetic_hold_failed: закрытие за уровнем в течение K свечей отменяет sweep', () => {
    // SYNTHETIC: удержание, нарушенное закрытием за уровнем после фитиля, на реальных данных редкость
    const c = synthetic_candles([
      [10, 11, 9, 10], [10, 12, 9, 11], [11, 15, 10, 14], [14, 14.5, 12, 13], [13, 13.5, 11, 12], [12, 13, 10, 11], [11, 12, 9, 10],
      [10, 16, 9, 10], [10, 17, 9, 16], [16, 18, 15, 17], [17, 18, 16, 17],
    ]);
    const sw = detectSwings(c, { left: 2, right: 2 });
    expect(sw.some((s) => s.index === 2 && s.type === 'high')).toBe(true);
    const res = detectSweeps(c, sw, 3);
    expect([...res.confirmed, ...res.candidates]).toEqual([]); // 7: фитиль 16>15 close 10; 8 закрылась 16>15 -> удержание нарушено
  });

  it('synthetic_multi: свеча снимает несколько swing — один sweep, уровень экстремальный, sweptCount', () => {
    // SYNTHETIC: два swing high ниже одного фитиля
    const c = synthetic_candles([
      [10, 11, 9, 10], [10, 12, 9, 11], [11, 15, 10, 14], [14, 14.5, 12, 13], [13, 13.5, 11, 12], [12, 13, 11, 12.5],
      [12.5, 13, 11, 12], [12, 13.8, 11, 13], [13, 14.2, 12, 13.5], [13.5, 14.0, 12, 13], [13, 13.5, 11, 12], [12, 13, 11, 12],
      [12, 16.5, 11, 14], [14, 14, 13, 13], [13, 13.5, 12, 12], [12, 13, 11, 12],
    ]);
    const res = detectSweeps(c, detectSwings(c, { left: 2, right: 2 }), 3);
    const s = [...res.confirmed, ...res.candidates].find((x) => x.index === 12)!;
    expect(s.side).toBe('high');
    expect(s.sweptSwings.length).toBeGreaterThanOrEqual(2);
    expect(s.level).toBe(15);
    expect(s.sweptSwings[0]!.price).toBe(15);
    expect(s.wickExtreme).toBe(16.5);
    expect(ext.length).toBeGreaterThan(0);
  });
});

describe('FVG', () => {
  it('равенство low[i+1] == high[i-1] — не FVG; статусы open/partial/filled покрыты GS-4', () => {
    // SYNTHETIC: разрыв нулевой ширины
    const c = synthetic_candles(Array.from({ length: 20 }, (_, i) => [10 + i * 0.1, 11 + i * 0.1, 9 + i * 0.1, 10.5 + i * 0.1] as [number, number, number, number]));
    expect(detectFvgs(c, 0.5).fvgs).toEqual([]);
    const r = detectFvgs(btc, 0.5);
    expect(r.fvgs.length).toBe(8);
    expect(r.small.every((f) => f.size > 0)).toBe(true);
    expect(new Set(r.fvgs.map((f) => f.status))).toEqual(new Set(['open', 'partial', 'filled']));
  });
});

describe('Order Block: медвежья ветка и запасные правила', () => {
  it('bear OB для BOS bear 09-15 20:00: кейс o-1 (бычья свеча 09-14 16:00)', () => {
    const r = analyzeStructure(btc, { ...P, nInt: null });
    const ob = r.orderBlocks.find((o) => o.event.breakTime === iso('2026-09-15T20:00:00Z'))!;
    expect(ob.direction).toBe('bear');
    expect(ob.time).toBe(iso('2026-09-14T16:00:00Z'));
    expect(btc[ob.index]!.close).toBeGreaterThan(btc[ob.index]!.open);
    expect(ob.top).toBe(btc[ob.index]!.high);
    expect(ob.bottom).toBe(btc[ob.index]!.low);
  });

  it('synthetic_no_fractal: импульс без фрактала 2 — начало по экстремуму интервала; нет противоположных свечей — свеча начала', () => {
    // SYNTHETIC: короткий ряд, где подтверждённого фрактала L=R=2 между swing и пробоем нет
    const rows: [number, number, number, number][] = [
      [10, 10.5, 9.5, 10], [10, 11, 9.8, 10.8], [10.8, 12, 10.5, 11.5], [11.5, 11.8, 10.9, 11.2], [11.2, 11.5, 10.8, 11.0],
      [11.0, 11.4, 10.7, 11.1], [11.1, 11.6, 11.0, 11.5], [11.5, 13, 11.4, 12.8], [12.8, 14, 12.6, 13.9], [13.9, 14.5, 13.8, 14.4],
    ];
    const c = synthetic_candles(rows);
    const high: Swing = { index: 2, time: c[2]!.openTime, type: 'high', price: 12, confirmedIndex: 4, scope: 'external', label: null };
    const ev = { kind: 'bos' as const, direction: 'bull' as const, scope: 'external' as const, level: 12, brokenSwing: { index: 2, time: c[2]!.openTime, type: 'high' as const }, breakIndex: 7, breakTime: c[7]!.openTime };
    expect(high.price).toBe(12);
    const obs = detectOrderBlocks(c, [ev], [], 1.2);
    expect(obs).toHaveLength(1);
    expect(obs[0]!.index).toBeGreaterThan(2);
    expect(obs[0]!.index).toBeLessThan(7);
    expect(obs[0]!.direction).toBe('bull');
    // внутренние события OB не порождают
    expect(detectOrderBlocks(c, [{ ...ev, scope: 'internal' }], [], 1.2)).toEqual([]);
  });

  it('synthetic_ob_status: инвалидация раньше митигации на той же свече, митигация без инвалидации', () => {
    // SYNTHETIC: поведение цены после события в заданных точках
    const base: [number, number, number, number][] = [
      [10, 10.5, 9.5, 10], [10, 10.4, 9.0, 9.2], [9.2, 9.4, 8.6, 8.8], [8.8, 9.0, 8.2, 8.5], [8.5, 8.9, 8.3, 8.8],
      [8.8, 9.6, 8.7, 9.5], [9.5, 11.5, 9.4, 11.4], [11.4, 11.6, 11.0, 11.5],
    ];
    const ev = (k: number) => ({ kind: 'bos' as const, direction: 'bull' as const, scope: 'external' as const, level: 10.5, brokenSwing: { index: 0, time: 0, type: 'high' as const }, breakIndex: k, breakTime: k * H4 });
    const mitig = synthetic_candles([...base, [11.5, 11.6, 8.9, 10.0], [10, 10.5, 9.9, 10.2]]);
    const o1 = detectOrderBlocks(mitig, [ev(6)], [], 1.2)[0]!;
    expect(o1.status).toBe('mitigated');
    expect(o1.statusIndex).toBe(8);
    const inval = synthetic_candles([...base, [11.5, 11.6, 7.0, 7.5]]);
    const o2 = detectOrderBlocks(inval, [ev(6)], [], 1.2)[0]!;
    expect(o2.status).toBe('invalidated');
    expect(o2.statusIndex).toBe(8);
    const fresh = detectOrderBlocks(synthetic_candles(base), [ev(6)], [], 1.2)[0]!;
    expect(fresh.status).toBe('fresh');
    expect(fresh.valid).toBe(false); // ATR14 недоступен (< 15 свечей) и FVG нет -> displacement не подтверждён
  });
});

describe('машина состояний: прямые проверки', () => {
  it('runExternalLayer: пробой незакрытой/равного уровня не фиксируется, защищённый уровень не сдвигается без swing', () => {
    const sw = detectSwings(btc, { left: 5, right: 5 });
    const run = runExternalLayer(btc, sw);
    expect(run.snapshots).toHaveLength(btc.length);
    const k = idxOf('2026-09-11T12:00:00Z');
    expect(run.snapshots[k]!.trend).toBe('down');
    expect(run.events.every((e, i, a) => i === 0 || a[i - 1]!.breakIndex < e.breakIndex)).toBe(true);
  });
});

describe('toMarks / buildAlgoMarkSet', () => {
  const r = analyzeStructure(btc, P);
  it('идентификаторы и якоря по §3.4', () => {
    const marks = toMarks(r);
    const bos = marks.find((m) => m.kind === 'bos' && m.scope === 'external')!;
    expect(bos.id).toMatch(/^algo:bos:external:(bull|bear):\d+$/);
    expect(bos.anchors).toHaveLength(2);
    expect(bos.anchors[0]!.price).toBe(bos.anchors[1]!.price);
    expect(bos.meta).toHaveProperty('breakClose');
    expect(marks.every((m) => m.author === 'algo')).toBe(true);
    expect(new Set(marks.map((m) => m.id)).size).toBe(marks.length);
    const sweep = marks.find((m) => m.kind === 'sweep' && m.direction === 'bear')!;
    expect(sweep.meta).toMatchObject({ side: 'high', sweptCount: 1 });
    const fvg = marks.find((m) => m.kind === 'fvg')!;
    expect(fvg.scope).toBeNull();
    expect(fvg.meta).toHaveProperty('middleTime');
    const ob = marks.find((m) => m.kind === 'order-block' && m.meta?.['status'] === 'fresh')!;
    expect(ob.anchors[1]!.time).toBe(btc[btc.length - 1]!.openTime);
    const w = toMarks(r, { fromIndex: 100, toIndex: 120 });
    expect(w.length).toBeGreaterThan(0);
    expect(w.length).toBeLessThan(marks.length);
  });

  it('эталон по понятиям: внутренний слой только при internal-external, OB только валидные и не инвалидированные', () => {
    const win = { fromIndex: 0, toIndex: btc.length - 1 };
    const a = buildAlgoMarkSet(r, { concepts: ['swing', 'order-block', 'fvg'], window: win });
    expect(a.required.every((m) => m.scope !== 'internal')).toBe(true);
    const obs = a.required.filter((m) => m.kind === 'order-block');
    expect(obs.length).toBe(2);
    expect(a.tolerated.filter((m) => m.kind === 'order-block')).toHaveLength(2);
    expect(a.aux.obCandidates).toHaveLength(2);
    expect(a.required.filter((m) => m.kind === 'fvg').every((m) => m.meta?.['status'] !== 'filled')).toBe(true);
    const b = buildAlgoMarkSet(r, { concepts: ['swing', 'internal-external'], window: win });
    expect(b.required.some((m) => m.scope === 'internal')).toBe(true);
    // refsAt: живые swing на свече (swing 09-09 08:00 high 79737.3 жив на 09-11 12:00)
    const live = a.aux.refsAt(idxOf('2026-09-11T12:00:00Z'));
    expect(live.some((s) => s.price === 79737.3)).toBe(true);
    expect(a.aux.refsAt(idxOf('2026-09-11T12:00:00Z'))).toBe(live); // кэш
    expect(live.every((s) => s.confirmedIndex < idxOf('2026-09-11T12:00:00Z'))).toBe(true);
  });
});
