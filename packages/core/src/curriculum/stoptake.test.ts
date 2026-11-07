import { describe, expect, it } from 'vitest';
import { btc1h, btc4h, isoOf, visibleAt } from '../testing/cur';
import { candleProvider } from '../testing/provider';
import { htfClosedBefore } from './generate';
import { buildTargets, limitFilled, rrOf, slBand, slClass, structurePoint, tpClass } from './rubric';
import { buildStopTakeRef, detectStopHunt, huntBlocks, playStopTake, scoreStopTake, validateStopTake } from './stoptake';
import { computeZones, type Side } from './zone';
import type { Candle } from '../types';

const h1 = btc1h();
const h4 = btc4h();
const prep = (iso: string, side: Side, b: number, t: number, E: number) => {
  const v = visibleAt(h1, iso);
  const set = computeZones(v.visible, htfClosedBefore(h4, v.T, 500))!;
  const zone = set.zones.find((z) => z.bottom === b && z.top === t)!;
  let f = -1;
  for (let j = v.iT + 1; j <= v.iT + 72; j++) if (limitFilled(h1[j]!, side, E, 0.1)) { f = j; break; }
  const ref = buildStopTakeRef(h1.slice(f - 499, f + 1), side, zone, E)!;
  const play = (sl: number, tp: number) => playStopTake(ref, sl, tp, h1[f]!.closeTime + 1, '1h', 72, candleProvider({ '1h': h1 }));
  return { v, f, ref, zone, play };
};
const close = (a: number, b: number, d = 1e-3) => expect(Math.abs(a - b)).toBeLessThanOrEqual(d);

describe('ступень 4: эталон и рубрика (§6, ST-1)', () => {
  const x = prep('2026-09-12T00:00:00Z', 'SHORT', 79384.4, 79737.3, 79384.4);
  it('ST-1: исполнение 09-14 20:00 (+68), A = 484.2071, Pl = 79737.3, полоса SL, E*, цели и k*', () => {
    expect(isoOf(h1[x.f]!.openTime)).toBe('2026-09-14T20:00:00Z');
    expect(x.f - x.v.iT).toBe(68);
    close(x.ref.A, 484.2071, 1e-4);
    expect(x.ref.Pl).toBe(79737.3);
    expect(x.ref.Estar).toBe(79065.5);
    const [lo, hi] = slBand('SHORT', x.ref.Pl, x.ref.A);
    close(lo, 79858.3518, 1e-3);
    close(hi, 80463.6107, 1e-3);
    const t = x.ref.targets;
    expect(t.targets.slice(0, 3).map((c) => c.price)).toEqual([78737.9, 78343.8, 78020]);
    expect(t.targets.slice(0, 3).map((c) => +c.rrRef.toFixed(4))).toEqual([1.3641, 2.1956, 2.8788]);
    expect(t.kStar).toBe(1);
    expect(t.targets.map((c) => c.allowed).slice(0, 4)).toEqual([true, true, true, false]);
  });
  it('ответы: 87 correct / 80 SL_NO_BUFFER partial / 75 RR_TOO_LOW partial; исходы TP', async () => {
    const a = scoreStopTake(x.ref, 79950, 78343.8);
    expect([a.quality, a.verdict, a.parts.map((p) => p.score)]).toEqual([87, 'correct', [40, 35, 12]]);
    close(a.rr, 1.8398, 1e-4);
    expect(a.skillOutcomes.map((o) => o.correct)).toEqual([1, 1, 1]);
    const b = scoreStopTake(x.ref, 79800, 78343.8);
    expect([b.quality, b.verdict, b.errors.map((e) => e.code)]).toEqual([80, 'partial', ['SL_NO_BUFFER']]);
    expect(b.errors[0]!.severity).toBe('minor');
    const c = scoreStopTake(x.ref, 80000, 78737.9);
    expect([c.quality, c.verdict, c.errors.map((e) => e.code)]).toEqual([75, 'partial', ['RR_TOO_LOW']]);
    close(c.rr, 1.0502, 1e-4);
    const pa = await x.play(79950, 78343.8);
    expect([pa.outcome.result, isoOf(pa.outcome.exitTime), pa.hunt.hunted]).toEqual(['tp', '2026-09-14T23:00:00Z', false]);
    expect([pa.referencePlan.tp, pa.referencePlan.outcome.result]).toEqual([78343.8, 'tp']);
    close(pa.referencePlan.sl, 79858.3518, 1e-3);
    expect(isoOf((await x.play(80000, 78737.9)).outcome.exitTime)).toBe('2026-09-14T21:00:00Z');
  });
  it('SL внутри структуры - 0 баллов и major', () => {
    const r = scoreStopTake(x.ref, 79700, 78343.8);
    expect(r.parts[0]!.score).toBe(0);
    expect(r.errors.find((e) => e.code === 'SL_INSIDE_STRUCTURE')!.severity).toBe('major');
    const wide = scoreStopTake(x.ref, 81000, 78343.8);
    expect(wide.errors.map((e) => e.code)).toContain('SL_TOO_WIDE');
  });
  it('TP: у допустимой цели 35, между уровнями 15, дальше k*+1 - 0 и major', () => {
    const near = scoreStopTake(x.ref, 79950, 78400); // между C2 78343.8 и C1 78737.9, в полосе C2? 78343.8..78343.8+242.1 -> да
    expect(near.parts[1]!.score).toBe(35);
    const between = scoreStopTake(x.ref, 79950, 78600);
    expect(between.parts[1]!.score).toBe(15);
    expect(between.errors.find((e) => e.code === 'TP_NOT_AT_LEVEL')!.severity).toBe('minor');
    const beyond = scoreStopTake(x.ref, 79950, 77000);
    expect(beyond.parts[1]!.score).toBe(0);
    expect(beyond.errors.find((e) => e.code === 'TP_BEYOND_TARGETS')!.severity).toBe('major');
    expect(beyond.verdict).not.toBe('correct');
  });
  it('validate: SL/TP с неверной стороны', () => {
    const code = (sl: number, tp: number) => {
      try {
        validateStopTake(x.ref, sl, tp);
      } catch (e) {
        return (e as { code: string }).code;
      }
      return 'ok';
    };
    expect(code(79000, 78343.8)).toBe('SL_WRONG_SIDE');
    expect(code(79950, 79100)).toBe('TP_WRONG_SIDE');
    expect(code(79950, 78343.8)).toBe('ok');
  });
});

describe('§20: исполнение проходом на тик (ST-2) и stop hunt', () => {
  const x = prep('2026-09-26T00:00:00Z', 'SHORT', 84855, 85080, 84855);
  it('ST-2: свеча 09-27 08:00 касается 84855.0 ровно - не исполнение; исполнение 09-27 09:00 (+33), A пересчитан', () => {
    const eq = h1.find((c) => isoOf(c.openTime) === '2026-09-27T08:00:00Z')!;
    expect(eq.high).toBe(84855);
    expect(limitFilled(eq, 'SHORT', 84855, 0.1)).toBe(false);
    expect(isoOf(h1[x.f]!.openTime)).toBe('2026-09-27T09:00:00Z');
    expect(x.f - x.v.iT).toBe(33);
    close(x.ref.A, 242.5143, 1e-3);
    expect(x.ref.Pl).toBe(85080);
  });
  it('стоп по правилам, снятый выносом - блок OK_STOP_HUNT_RULES; без запаса - STOP_HUNTED; оба не меняют оценку', async () => {
    const ok = await x.play(85142, 84160);
    expect([ok.outcome.result, isoOf(ok.outcome.exitTime), ok.hunt.hunted, ok.hunt.candle!.close]).toEqual(['sl', '2026-09-27T13:00:00Z', true, 84991.8]);
    const sc = scoreStopTake(x.ref, 85142, 84160);
    expect([sc.quality, sc.verdict]).toEqual([100, 'correct']);
    const blk = huntBlocks('SHORT', 85142, sc.slFull, ok.hunt, x.ref);
    expect(blk.ok.map((o) => o.code)).toEqual(['OK_STOP_HUNT_RULES']);
    expect(blk.ok[0]!.params).toMatchObject({ sl: 85142, wick: 85146.4 });
    expect(blk.errors).toEqual([]);

    const bad = await x.play(85100, 84160);
    const sc2 = scoreStopTake(x.ref, 85100, 84160);
    expect(sc2.errors.map((e) => e.code)).toEqual(['SL_NO_BUFFER']);
    const blk2 = huntBlocks('SHORT', 85100, sc2.slFull, bad.hunt, x.ref);
    expect(blk2.errors.map((e) => e.code)).toEqual(['STOP_HUNTED']);
    expect(blk2.errors[0]).toMatchObject({ severity: 'minor', skill: 'stop-placement' });
    expect(sc2.skillOutcomes[0]!.correct).toBe(0);

    const tp = await x.play(85300, 84160);
    expect([tp.outcome.result, isoOf(tp.outcome.exitTime), tp.hunt.hunted]).toEqual(['tp', '2026-09-27T22:00:00Z', false]);
    close(tp.outcome.rMultiple, 1.5618, 1e-3);
    expect(huntBlocks('SHORT', 85300, true, tp.hunt, x.ref)).toEqual({ errors: [], ok: [] });
  });
  it('detectStopHunt: закрытие за экстремумом выноса до цели - не вынос; sl с закрытием за стопом - не вынос; не SL - нет', () => {
    const mk = (o: number, h: number, l: number, c: number, i: number): Candle => ({ openTime: i * 3600_000, closeTime: i * 3600_000 + 3599_999, open: o, high: h, low: l, close: c, volume: 1, quoteVolume: 1, trades: 1, closed: true }); // SYNTHETIC: логика детектора на минимальной последовательности, не рыночные данные
    // SHORT, sl 100: свеча 0 вынос (high 101, close 99); далее закрытие 102 > high 101 раньше цели -> не вынос
    const trig = { result: 'sl' as const, triggerTime: 10 };
    expect(detectStopHunt('SHORT', 100, 90, trig, [mk(99, 101, 98, 99, 0), mk(99, 100, 95, 95, 1), mk(95, 96, 80, 85, 2)]).hunted).toBe(true);
    expect(detectStopHunt('SHORT', 100, 90, trig, [mk(99, 101, 98, 99, 0), mk(99, 103, 98, 102, 1), mk(95, 96, 80, 85, 2)]).hunted).toBe(false);
    expect(detectStopHunt('SHORT', 100, 90, trig, [mk(99, 101, 98, 102, 0), mk(99, 100, 80, 85, 1)]).hunted).toBe(false); // закрытие за стопом
    expect(detectStopHunt('SHORT', 100, 90, { result: 'tp', triggerTime: 10 }, [mk(99, 101, 98, 99, 0)]).hunted).toBe(false);
    expect(detectStopHunt('SHORT', 100, 90, { result: 'sl', triggerTime: 99_999_999 }, [mk(99, 101, 98, 99, 0)]).hunted).toBe(false);
    // LONG зеркально: sl 100, вынос low 99 close 101, затем tp 110 до закрытия ниже 99
    expect(detectStopHunt('LONG', 100, 110, trig, [mk(101, 102, 99, 101, 0), mk(101, 111, 100, 110, 1)]).hunted).toBe(true);
    expect(detectStopHunt('LONG', 100, 110, trig, [mk(101, 102, 99, 101, 0), mk(101, 102, 90, 95, 1), mk(95, 111, 90, 110, 2)]).hunted).toBe(false);
    // нет цели в остатке окна
    expect(detectStopHunt('LONG', 100, 110, trig, [mk(101, 102, 99, 101, 0), mk(101, 105, 100, 104, 1)]).hunted).toBe(false);
  });
});

describe('ST-3: пробой по закрытию - не stop hunt; цели включают встречные OB/FVG (§20)', () => {
  const x = prep('2026-09-15T00:00:00Z', 'LONG', 77208, 77427.4, 77427.4);
  it('исполнение 09-15 05:00 (+5); A = 373.8786; полоса SL; FVG 78223.3 в списке целей', async () => {
    expect([isoOf(h1[x.f]!.openTime), x.f - x.v.iT]).toEqual(['2026-09-15T05:00:00Z', 5]);
    close(x.ref.A, 373.8786, 1e-4);
    const [lo, hi] = slBand('LONG', x.ref.Pl, x.ref.A);
    close(lo, 76647.1821, 1e-3);
    close(hi, 77114.5304, 1e-3);
    expect(x.ref.targets.targets.slice(0, 2).map((c) => c.price)).toEqual([77706.1, 78020]);
    const fvg = x.ref.targets.targets.find((c) => c.source === 'fvg')!;
    expect(fvg.price).toBe(78223.3);
    expect(x.ref.targets.targets[x.ref.targets.kStar]).toBe(fvg);
    const good = scoreStopTake(x.ref, 77050, 78200);
    expect([good.quality, good.verdict]).toEqual([100, 'correct']);
    const old = scoreStopTake(x.ref, 77050, 78230.5);
    expect([old.quality, old.errors.map((e) => e.code)]).toEqual([80, ['TP_NOT_AT_LEVEL']]);
    const pl = await x.play(77050, 78200);
    expect([pl.outcome.result, isoOf(pl.outcome.exitTime), pl.outcome.rMultiple, pl.hunt.hunted]).toEqual(['sl', '2026-09-15T07:00:00Z', -1, false]);
    expect(pl.hunt.candle).not.toBeNull();
    expect(pl.hunt.candle!.close).toBeLessThan(77050); // закрытие за стопом
  });
});

describe('rubric helpers', () => {
  it('slClass: границы и SHORT', () => {
    const A = 100;
    expect(slClass('LONG', 875, 900, A)).toBe('OK_SL_PLACEMENT'); // Pl - 0.25A
    expect(slClass('LONG', 750, 900, A)).toBe('OK_SL_PLACEMENT'); // Pl - 1.5A
    expect(slClass('LONG', 880, 900, A)).toBe('SL_NO_BUFFER');
    expect(slClass('LONG', 749.9, 900, A)).toBe('SL_TOO_WIDE');
    expect(slClass('LONG', 900, 900, A)).toBe('SL_INSIDE_STRUCTURE');
    expect(slClass('LONG', 950, 900, A)).toBe('SL_INSIDE_STRUCTURE');
    expect(slClass('SHORT', 925, 900, A)).toBe('OK_SL_PLACEMENT');
    expect(slClass('SHORT', 1050, 900, A)).toBe('OK_SL_PLACEMENT');
    expect(slClass('SHORT', 920, 900, A)).toBe('SL_NO_BUFFER');
    expect(slClass('SHORT', 1050.1, 900, A)).toBe('SL_TOO_WIDE');
    expect(slClass('SHORT', 900, 900, A)).toBe('SL_INSIDE_STRUCTURE');
  });
  it('structurePoint, rrOf, tpClass без целей', () => {
    expect(structurePoint('LONG', { bottom: 100, top: 110 })).toBe(100);
    expect(structurePoint('LONG', { bottom: 100, top: 110 }, { high: 120, low: 95 })).toBe(95);
    expect(structurePoint('SHORT', { bottom: 100, top: 110 }, { high: 115, low: 100 })).toBe(115);
    expect(rrOf(100, 90, 120)).toBe(2);
    expect(tpClass('LONG', 120, { targets: [], kStar: -1, slRef: 0, Pl: 0 }, 10)).toBeNull();
  });
  it('цели: слияние ближе 0.5*A, E*, SHORT зеркально; нет цели на 2R -> kStar = -1 и допустимы все', () => {
    const { visible } = visibleAt(h1, '2026-09-12T00:00:00Z');
    const long = buildTargets(visible, 'LONG', 77000, 77000, 500, 76000);
    for (let i = 1; i < long.targets.length; i++) expect(long.targets[i]!.price - long.targets[i - 1]!.price).toBeGreaterThanOrEqual(250);
    const short = buildTargets(visible, 'SHORT', 79000, 79000, 500, 80000);
    for (const t of short.targets) expect(t.price).toBeLessThan(79000);
    const tight = buildTargets(visible, 'LONG', 77000, 77000, 500, 70000); // риск 6750: ни одна цель не даёт 2R близко
    if (tight.kStar < 0) expect(tight.targets.every((t) => t.allowed)).toBe(true);
  });
});
