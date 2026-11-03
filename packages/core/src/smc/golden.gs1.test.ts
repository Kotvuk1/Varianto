import { describe, expect, it } from 'vitest';
import { analyzeStructure } from './analyze';
import { iso, readGolden, readKlines } from '../testing/klines';
import type { StructureParams } from '../types';

interface GoldSwing { time: string; type: 'high' | 'low'; price: number; label: string | null }
interface GoldEvent { kind: string; direction: string; breakTime: string; level: number; brokenSwingTime: string | null }
interface Gold {
  algoVersion: string;
  params: StructureParams;
  expected: {
    externalSwings: GoldSwing[];
    externalEvents: GoldEvent[];
    finalState?: { trend: string; refHigh: { time: string; price: number }; refLow: { time: string; price: number } };
    ac06?: { candle: string; noChochOn: string; chochOn: string };
  };
}

const candles = readKlines('klines/BTCUSDT/4h/BTCUSDT-4h-2026-09.csv');

function check(name: string) {
  const g = readGolden<Gold>(name);
  const r = analyzeStructure(candles, g.params);
  const ext = r.swings.filter((s) => s.scope === 'external');
  expect(ext.map((s) => ({ time: s.time, type: s.type, price: s.price, label: s.label }))).toEqual(
    g.expected.externalSwings.map((s) => ({ time: iso(s.time), type: s.type, price: s.price, label: s.label })),
  );
  const ev = r.events.filter((e) => e.scope === 'external');
  expect(ev.map((e) => ({ kind: e.kind, direction: e.direction, breakTime: e.breakTime, level: e.level }))).toEqual(
    g.expected.externalEvents.map((e) => ({ kind: e.kind, direction: e.direction, breakTime: iso(e.breakTime), level: e.level })),
  );
  g.expected.externalEvents.forEach((e, i) => {
    if (e.brokenSwingTime) expect(ev[i]!.brokenSwing.time).toBe(iso(e.brokenSwingTime));
  });
  return { g, r };
}

describe('GS-1 внешняя структура BTCUSDT 4h 2026-09 (N=5)', () => {
  it('swing, метки и события совпадают с golden', () => {
    expect(candles).toHaveLength(180);
    const { g, r } = check('GS-1.BTCUSDT-4h-2026-09.external-n5.golden.json');
    const fs = g.expected.finalState!;
    expect(r.state.external.trend).toBe(fs.trend);
    expect(r.state.external.refHigh).toMatchObject({ time: iso(fs.refHigh.time), price: fs.refHigh.price });
    expect(r.state.external.refLow).toMatchObject({ time: iso(fs.refLow.time), price: fs.refLow.price });
  });

  it('AC-06: фитиль за защищённым high без закрытия тела не даёт CHoCH', () => {
    const { g, r } = check('GS-1.BTCUSDT-4h-2026-09.external-n5.golden.json');
    const a = g.expected.ac06!;
    const c = candles.find((x) => x.openTime === iso(a.candle))!;
    expect(c.high).toBe(79859.8);
    expect(c.close).toBe(77682.9);
    expect(r.events.some((e) => e.breakTime === iso(a.noChochOn))).toBe(false);
    expect(r.events.find((e) => e.kind === 'choch' && e.direction === 'bull')!.breakTime).toBe(iso(a.chochOn));
  });
});

describe('GS-2 внешняя структура easy (N=7)', () => {
  it('swing и события совпадают с golden', () => {
    check('GS-2.BTCUSDT-4h-2026-09.external-n7.golden.json');
  });
});
