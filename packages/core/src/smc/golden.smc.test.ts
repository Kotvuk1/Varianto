import { describe, expect, it } from 'vitest';
import { analyzeStructure } from './analyze';
import { detectSweeps } from './sweeps';
import { detectSwings, pendingSwings } from './swings';
import { iso, readGolden, readKlines } from '../testing/klines';
import type { StructureParams } from '../types';

interface GEv { kind: string; direction: string; breakTime: string; level: number }
const evView = (e: { kind: string; direction: string; breakTime: number; level: number }) => ({
  kind: e.kind, direction: e.direction, breakTime: e.breakTime, level: e.level,
});
const gEv = (e: GEv) => ({ kind: e.kind, direction: e.direction, breakTime: iso(e.breakTime), level: e.level });
const btc4h = readKlines('klines/BTCUSDT/4h/BTCUSDT-4h-2026-09.csv');

describe('GS-3 внутренняя структура', () => {
  interface G {
    cases: {
      name: string;
      params: StructureParams;
      expected: {
        internalSwings?: { time: string; type: string; price: number; label: string | null }[];
        internalEvents: GEv[];
        suppressed?: { time: string; direction: string }[];
      };
    }[];
  }
  const g = readGolden<G>('GS-3.BTCUSDT-4h-2026-09.internal.golden.json');
  for (const c of g.cases) {
    it(`${c.name}: внутренние swing и события после подавления`, () => {
      const r = analyzeStructure(btc4h, c.params);
      expect(r.events.filter((e) => e.scope === 'internal').map(evView)).toEqual(c.expected.internalEvents.map(gEv));
      if (c.expected.internalSwings) {
        expect(
          r.swings.filter((s) => s.scope === 'internal').map((s) => ({ time: s.time, type: s.type, price: s.price, label: s.label })),
        ).toEqual(c.expected.internalSwings.map((s) => ({ time: iso(s.time), type: s.type, price: s.price, label: s.label })));
      }
      for (const sp of c.expected.suppressed ?? []) {
        const at = r.events.filter((e) => e.breakTime === iso(sp.time) && e.direction === sp.direction);
        expect(at.map((e) => e.scope)).toEqual(['external']);
      }
    });
  }
});

describe('GS-4 sweep, OB, FVG', () => {
  interface G {
    params: StructureParams;
    expected: {
      sweeps: { side: string; direction: string; time: string; level: number; sweptSwingTime: string }[];
      orderBlocks: { direction: string; eventKind: string; eventTime: string; time: string; bottom: number; top: number; valid: boolean; status: string | null; statusTime: string | null }[];
      fvgs: { direction: string; middleTime: string; bottom: number; top: number; status: string; fillTime: string | null }[];
    };
  }
  const g = readGolden<G>('GS-4.BTCUSDT-4h-2026-09.sweep-ob-fvg.golden.json');
  const r = analyzeStructure(btc4h, g.params);

  it('sweep', () => {
    expect(r.sweeps.map((s) => ({ side: s.side, time: s.time, level: s.level, sw: s.sweptSwings[0]!.time }))).toEqual(
      g.expected.sweeps.map((s) => ({ side: s.side, time: iso(s.time), level: s.level, sw: iso(s.sweptSwingTime) })),
    );
  });

  it('Order Block: свеча, зона, валидность, статус', () => {
    expect(r.orderBlocks).toHaveLength(g.expected.orderBlocks.length);
    g.expected.orderBlocks.forEach((e, i) => {
      const o = r.orderBlocks[i]!;
      expect({ d: o.direction, ek: o.event.kind, et: o.event.breakTime, t: o.time, b: o.bottom, top: o.top, v: o.valid }).toEqual({
        d: e.direction, ek: e.eventKind, et: iso(e.eventTime), t: iso(e.time), b: e.bottom, top: e.top, v: e.valid,
      });
      if (e.status) {
        expect(o.status).toBe(e.status);
        if (e.statusTime) expect(r.times[o.statusIndex!]).toBe(iso(e.statusTime));
      }
    });
  });

  it('FVG >= 0.5 ATR: зона и статус', () => {
    expect(r.fvgs.map((f) => ({ d: f.direction, m: f.middleTime, b: f.bottom, t: f.top, s: f.status }))).toEqual(
      g.expected.fvgs.map((f) => ({ d: f.direction, m: iso(f.middleTime), b: f.bottom, t: f.top, s: f.status })),
    );
    g.expected.fvgs.forEach((e, i) => {
      if (e.status === 'filled') expect(r.times[r.fvgs[i]!.statusIndex!]).toBe(iso(e.fillTime!));
    });
  });
});

describe('GS-7 явный тренд BTCUSDT 15m 2026-10-20/21', () => {
  interface G {
    params: StructureParams;
    expected: {
      externalEvents: GEv[];
      internalEvents: GEv[];
      suppressedInternal: { time: string; kind: string; direction: string }[];
      finalState: { trend: string; refHigh: { time: string; price: number }; refLow: { time: string; price: number } };
      orderBlock: { eventTime: string; time: string; bottom: number; top: number; valid: boolean; status: string };
    };
  }
  const g = readGolden<G>('GS-7.BTCUSDT-15m-2026-10-20_21.trend.golden.json');
  const candles = [
    ...readKlines('klines/BTCUSDT/15m/BTCUSDT-15m-2026-10-20.csv'),
    ...readKlines('klines/BTCUSDT/15m/BTCUSDT-15m-2026-10-21.csv'),
  ];
  const r = analyzeStructure(candles, g.params);

  it('внешние и внутренние события, подавление, итоговое состояние', () => {
    expect(candles).toHaveLength(192);
    expect(r.events.filter((e) => e.scope === 'external').map(evView)).toEqual(g.expected.externalEvents.map(gEv));
    expect(r.events.filter((e) => e.scope === 'internal').map(evView)).toEqual(g.expected.internalEvents.map(gEv));
    for (const s of g.expected.suppressedInternal) {
      expect(r.events.filter((e) => e.breakTime === iso(s.time) && e.direction === s.direction).map((e) => e.scope)).toEqual(['external']);
    }
    const fs = g.expected.finalState;
    expect(r.state.external.trend).toBe(fs.trend);
    expect(r.state.external.refHigh).toMatchObject({ time: iso(fs.refHigh.time), price: fs.refHigh.price });
    expect(r.state.external.refLow).toMatchObject({ time: iso(fs.refLow.time), price: fs.refLow.price });
  });

  it('OB для BOS 10-21 09:00', () => {
    const e = g.expected.orderBlock;
    const o = r.orderBlocks.find((x) => x.event.breakTime === iso(e.eventTime))!;
    expect({ t: o.time, b: o.bottom, top: o.top, v: o.valid, s: o.status }).toEqual({
      t: iso(e.time), b: e.bottom, top: e.top, v: e.valid, s: e.status,
    });
  });
});

describe('GS-8 равенство close и уровня SOLUSDT 15m 2026-08-09', () => {
  interface G {
    params: StructureParams;
    expected: {
      events: GEv[];
      noEventAt: string;
      sweep: { side: string; time: string; level: number; sweptSwingTime: string; close: number };
      pendingNotInReference: { time: string; type: string; price: number };
    };
  }
  const g = readGolden<G>('GS-8.SOLUSDT-15m-2026-08-09.close-equals-level.golden.json');
  const candles = readKlines('klines/SOLUSDT/15m/SOLUSDT-15m-2026-08-09.csv');
  const r = analyzeStructure(candles, g.params);

  it('close == защищённый low не пробой; CHoCH bear на следующей свече', () => {
    expect(r.events.map(evView)).toEqual(g.expected.events.map(gEv));
    expect(r.events.some((e) => e.breakTime === iso(g.expected.noEventAt))).toBe(false);
    const c = candles.find((x) => x.openTime === iso(g.expected.noEventAt))!;
    expect(c.close).toBe(77.04);
  });

  it('sweep при close == уровню', () => {
    const e = g.expected.sweep;
    const s = r.sweeps.find((x) => x.time === iso(e.time))!;
    expect(s.side).toBe(e.side);
    expect(s.level).toBe(e.level);
    expect(s.sweptSwings[0]!.time).toBe(iso(e.sweptSwingTime));
    expect(candles.find((x) => x.openTime === iso(e.time))!.close).toBe(e.close);
  });

  it('swing у правого края — кандидат, не в эталоне', () => {
    const p = g.expected.pendingNotInReference;
    expect(r.swings.some((s) => s.time === iso(p.time))).toBe(false);
    expect(r.pendingSwings.some((s) => s.time === iso(p.time) && s.type === p.type && s.price === p.price)).toBe(true);
  });
});

describe('GS-9 равные максимумы', () => {
  interface G {
    cases: {
      csv: string;
      n: number | number[];
      swingHigh: { time: string; price: number };
      notSwingHigh: string;
      sweepN3?: { side: string; time: string; level: number; high: number; close: number };
      prevHighTime?: string;
      prevHighPrice?: number;
    }[];
  }
  const g = readGolden<G>('GS-9.BTCUSDT-15m-2026-08-24_04.equal-highs.golden.json');
  for (const c of g.cases) {
    const candles = readKlines(c.csv);
    for (const n of Array.isArray(c.n) ? c.n : [c.n]) {
      it(`${c.csv.split('/').pop()} N=${n}: swing только более ранняя из равных вершин`, () => {
        const highs = detectSwings(candles, { left: n, right: n }).filter((s) => s.type === 'high');
        expect(highs.some((s) => s.time === iso(c.swingHigh.time) && s.price === c.swingHigh.price)).toBe(true);
        expect(highs.some((s) => s.time === iso(c.notSwingHigh))).toBe(false);
        expect(candles.find((x) => x.openTime === iso(c.notSwingHigh))!.high).toBe(c.swingHigh.price);
      });
    }
    if (c.sweepN3) {
      it('detectSweeps по swing N=3 снимает EQH', () => {
        const sw = detectSwings(candles, { left: 3, right: 3 });
        const { confirmed, candidates } = detectSweeps(candles, sw, 3);
        const e = c.sweepN3!;
        const s = [...confirmed, ...candidates].find((x) => x.time === iso(e.time))!;
        expect(s.side).toBe(e.side);
        expect(s.level).toBe(e.level);
        expect(s.wickExtreme).toBe(e.high);
        expect(candles.find((x) => x.openTime === iso(e.time))!.close).toBe(e.close);
      });
    }
    if (c.prevHighTime) {
      it('метка LH к предыдущему swing high', () => {
        const r = analyzeStructure(candles, { nExt: 5, nInt: null, sweepHoldK: 3, fvgMinAtr: 0.5, obDisplacementAtr: 1.2 });
        const s = r.swings.find((x) => x.time === iso(c.swingHigh.time) && x.type === 'high')!;
        expect(s.label).toBe('LH');
        const prev = r.swings.filter((x) => x.type === 'high' && x.index < s.index).pop()!;
        expect(prev.time).toBe(iso(c.prevHighTime!));
        expect(prev.price).toBe(c.prevHighPrice);
      });
    }
  }
  it('pendingSwings не входят в detectSwings', () => {
    const candles = readKlines('klines/BTCUSDT/15m/BTCUSDT-15m-2026-08-24.csv');
    const full = detectSwings(candles, { left: 5, right: 5 });
    const pend = pendingSwings(candles, { left: 5, right: 5 });
    for (const p of pend) expect(full.some((s) => s.index === p.index && s.type === p.type)).toBe(false);
  });
});

describe('GS-4b кросс-месячный ряд BTCUSDT 4h 2026-07 + 2026-08', () => {
  interface G {
    params: StructureParams;
    expected: {
      events: (GEv & { brokenSwingTime: string; close?: number })[];
      sweep: { side: string; time: string; level: number; low: number; close: number };
      orderBlock: { eventTime: string; time: string; direction: string };
    };
  }
  const g = readGolden<G>('GS-4b.BTCUSDT-4h-2026-07_08.cross-month.golden.json');
  const candles = [...readKlines('klines/BTCUSDT/4h/BTCUSDT-4h-2026-07.csv'), ...readKlines('klines/BTCUSDT/4h/BTCUSDT-4h-2026-08.csv')];
  const r = analyzeStructure(candles, g.params);

  it('пробой на 3.0 USDT закрытием тела, CHoCH и sweep на одной свече', () => {
    const from = iso('2026-08-01T00:00:00Z');
    const to = iso('2026-08-25T00:00:00Z');
    const ev = r.events.filter((e) => e.breakTime >= from && e.breakTime < to);
    expect(ev.map(evView)).toEqual(g.expected.events.map(gEv));
    ev.forEach((e, i) => expect(e.brokenSwing.time).toBe(iso(g.expected.events[i]!.brokenSwingTime)));
    const c = candles.find((x) => x.openTime === iso(g.expected.sweep.time))!;
    expect(c.close).toBe(g.expected.events[0]!.close);
    expect(g.expected.events[0]!.level - c.close).toBeCloseTo(3.0, 6);
    const s = r.sweeps.find((x) => x.time === iso(g.expected.sweep.time))!;
    expect({ side: s.side, level: s.level, wick: s.wickExtreme }).toEqual({ side: g.expected.sweep.side, level: g.expected.sweep.level, wick: g.expected.sweep.low });
  });

  it('OB для CHoCH 08-19 12:00 — свеча 08-19 04:00', () => {
    const o = r.orderBlocks.find((x) => x.event.breakTime === iso(g.expected.orderBlock.eventTime))!;
    expect(o.time).toBe(iso(g.expected.orderBlock.time));
    expect(o.direction).toBe(g.expected.orderBlock.direction);
    expect(o.valid).toBe(true);
  });
});
