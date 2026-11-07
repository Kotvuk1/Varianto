// Golden EW-1..EW-6 (ELLIOTT.md §15): реальные свечи data.binance.vision, значения перенесены из спецификации
// (Technical Analyst, вручную по OHLC) с поправками §19 (invalidation после ABC = точка C).
import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { EW_ALGO_VERSION } from '../version';
import { ewCandles, ewIndexAt, type EwSeriesId } from '../testing/elliott';
import { FIXTURES_ROOT, readGolden } from '../testing/klines';
import { resolve } from 'node:path';
import type { Candle, Anchor } from '../types';
import { TIMEFRAME_MS } from '../types';
import { atrOf, checkCount } from './check';
import { enumerateCounts } from './enumerate';
import { findWaveCandidates } from './candidates';
import { gradeElliott } from './grade';
import { buildEwRef, ewLimit, type EwRefParams } from './ref';
import { resolveScenario } from './resolve';
import { contiguousRuns } from './generate';
import type { EwCorrectionType, EwDirection, EwPrimaryScenario, EwScenarioId, EwTaskKind, WaveCount } from './types';
import type { TaskTimeframe } from '../types';

type Pt = [string, 'low' | 'high'];
interface Case {
  function: string;
  name: string;
  params: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  expected: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}
interface Golden {
  algoVersion: string;
  cases: Case[];
}

const ms = (iso: string) => Date.parse(iso.endsWith('Z') ? iso : `${iso}:00Z`);
const iso = (t: number) => new Date(t).toISOString().slice(0, 16);
const close = (a: number, b: number, d: number) => expect(Math.abs(a - b)).toBeLessThanOrEqual(0.5 * 10 ** -d + 1e-12);
const files = readdirSync(resolve(FIXTURES_ROOT, 'golden')).filter((f) => f.startsWith('ew_')).sort();

function anchors(c: Candle[], list: Pt[]): Anchor[] {
  return list.map(([t, s]) => {
    const i = ewIndexAt(c, t);
    return { time: c[i]!.openTime, price: c[i]![s] };
  });
}

function countOf(c: Candle[], tf: TaskTimeframe, p: Case['params'], iT: number): WaveCount {
  const r = checkCount({
    candles: c.slice(0, iT + 1), tf, toleranceCandles: 0, impulse: anchors(c, p.impulse),
    correction: p.correction ? { type: p.correction.type as EwCorrectionType, anchors: anchors(c, p.correction.anchors) } : null,
  });
  expect(r.count).not.toBeNull();
  return r.count!;
}

describe('golden EW: версия и состав', () => {
  it('шесть файлов EW-1..EW-6, algoVersion = EW_ALGO_VERSION', () => {
    expect(files).toHaveLength(6);
    for (const f of files) expect(readGolden<Golden>(f).algoVersion).toBe(EW_ALGO_VERSION);
  });
});

for (const f of files) {
  describe(`golden ${f}`, () => {
    const g = readGolden<Golden>(f);
    for (const cs of g.cases) {
      it(`${cs.function}: ${cs.name}`, () => {
        const p = cs.params;
        const e = cs.expected;
        const id = p.series as EwSeriesId;
        const c = ewCandles(id);
        const tf = p.tf as TaskTimeframe;
        const step = TIMEFRAME_MS[tf];

        if (cs.function === 'checkCount') {
          const iT = ewIndexAt(c, p.upTo);
          const r = checkCount({
            candles: c.slice(0, iT + 1), tf, toleranceCandles: p.tol ?? 2, impulse: anchors(c, p.impulse),
            correction: p.correction ? { type: p.correction.type as EwCorrectionType, anchors: anchors(c, p.correction.anchors) } : null,
          });
          const codes = r.errors.map((x) => x.code);
          if (e.errors) expect(codes).toEqual(e.errors);
          if (e.blockingErrors) expect(codes.filter((x) => x !== 'EW_GUIDE_MISS' && x !== 'EW_POINT_NOT_SWING')).toEqual(e.blockingErrors);
          if (e.hasCode) expect(codes).toContain(e.hasCode);
          for (const [k, v] of Object.entries((e.ratios ?? {}) as Record<string, number>)) close(r.ratios[k]!, v, 4);
          if (e.size) close(r.ratios.size!, e.size, 3);
          if (e.lengths) (e.lengths as (number | null)[]).forEach((v, i) => v !== null && close(r.lengths[i]!, v, 2));
          if (e.extended3 !== undefined) expect(r.extended3).toBe(e.extended3);
          if (e.failedGuides) expect(r.guides.filter((x) => !x.ok).map((x) => x.guide)).toEqual(e.failedGuides);
          if (e.rulesOk) expect(r.rules.every((x) => x.ok)).toBe(true);
          if (e.validTypes) expect(r.correction?.validTypes).toEqual(e.validTypes);
          if (e.notExtreme) {
            const er = r.errors.find((x) => x.code === 'EW_POINT_NOT_EXTREME' && x.params!.label === e.notExtreme.label);
            expect(er).toBeDefined();
            expect(iso(er!.params!.extremeTime as number)).toBe(e.notExtreme.extremeTime);
            expect(er!.params!.extremePrice).toBe(e.notExtreme.extremePrice);
          }
          if (e.snapped) {
            const pt = r.points.find((x) => x.label === e.snapped.label)!;
            expect(iso(pt.time)).toBe(e.snapped.time);
            expect(pt.price).toBe(e.snapped.price);
            expect(Math.abs(pt.offsetCandles)).toBe(e.snapped.offset);
          }
        } else if (cs.function === 'enumerateCounts') {
          const last = ewIndexAt(c, p.lastIso);
          const upTo = p.upTo ? ewIndexAt(c, p.upTo) : last + p.nPoint;
          const from = p.fromIndex ?? ewIndexAt(c, p.fromIso);
          const s = enumerateCounts(c.slice(0, upTo + 1), { nPoint: p.nPoint, fromIndex: from, lastIndex: last, maxCounts: 5000 });
          expect(s.byScenario).toEqual(e.byScenario);
          expect(s.truncated).toBe(e.truncated);
          if (e.abcStarts) expect(s.counts.filter((x) => x.scenario === 'abc-next').map((x) => iso(x.impulse[0]!.time)).sort()).toEqual(e.abcStarts);
        } else if (cs.function === 'findWaveCandidates') {
          const iT = ewIndexAt(c, p.upTo);
          const list = findWaveCandidates(c.slice(0, iT + 1), p as never);
          const pts = (x: (typeof list)[number]) => [...x.count.impulse, ...(x.count.correction?.points ?? [])];
          if (e.count !== undefined) expect(list).toHaveLength(e.count);
          const want = e.first ?? e.contains;
          const hit = e.first ? list[0]! : list.find((x) => iso(x.count.impulse[0]!.time) === want.p0);
          expect(hit).toBeDefined();
          expect(iso(hit!.count.impulse[0]!.time)).toBe(want.p0);
          expect(iso(pts(hit!).at(-1)!.time)).toBe(want.last);
          close(hit!.size, want.size, 3);
          if (want.guides !== undefined) expect(hit!.guides).toBe(want.guides);
          if (want.corrRetr !== undefined) close(hit!.corrRetr!, want.corrRetr, 4);
          if (want.type) expect(hit!.count.correction?.type).toBe(want.type);
        } else if (cs.function === 'resolveScenario') {
          const iT = ewIndexAt(c, p.T);
          const count = countOf(c, tf, p, iT);
          const out = resolveScenario(c, iT, count, p.primary as EwPrimaryScenario, p.alternative as EwScenarioId | null, p.limit)!;
          expect(out.kind).toBe(e.kind);
          expect(iso(out.time)).toBe(e.time);
          if (e.altAfterInvalidation) expect(iso(out.altAfterInvalidation!)).toBe(e.altAfterInvalidation);
          else if (e.kind !== 'invalidated') expect(out.altAfterInvalidation).toBeNull();
          for (const [k, v] of Object.entries((e.levels ?? {}) as Record<string, number>)) expect((out.levels as Record<string, number | null>)[k]).toBe(v);
          if (e.maxAfterT) expect(Math.max(...c.slice(iT + 1, out.index + 1).map((x) => x.high))).toBeLessThan(out.levels.invalidation);
          if (e.wickNotConfirm) {
            const w = c[ewIndexAt(c, e.wickNotConfirm)]!;
            expect(w.high).toBeGreaterThan(out.levels.confirm);
            expect(w.close).toBeLessThanOrEqual(out.levels.confirm);
            expect(out.index).toBeGreaterThan(ewIndexAt(c, e.wickNotConfirm));
          }
        } else if (cs.function === 'gapInLimit') {
          const iT = ewIndexAt(c, p.T);
          const tail = c.slice(iT, iT + ewLimit(tf) + 1);
          const runs = contiguousRuns(tail, step);
          expect(runs.length > 1).toBe(e.hasGapInLimit);
          const gapAt = tail[runs[0]![1] - 1]!.openTime + step;
          expect(iso(gapAt)).toBe(e.gapFrom);
          expect(iso(tail[runs[1]![0]]!.openTime)).toBe(e.gapTo);
        } else if (cs.function === 'gradeElliott') {
          const iT = ewIndexAt(c, p.T);
          const visible = c.slice(0, iT + 1);
          const future = c.slice(iT + 1, iT + 1 + ewLimit(tf));
          const r = p.ref;
          const times = (r.refPoints as string[]).map(ms);
          const nImp = r.corrType ? times.length - 3 : times.length;
          const fromIdx = r.windowFromIndex ?? c.findIndex((x) => x.openTime >= ms(r.windowFrom));
          const last = times[times.length - 1]!;
          const atr = atrOf(visible)[iT]!;
          void nImp;
          const params: EwRefParams = {
            kind: r.kind as EwTaskKind, tf, nPivot: r.nPivot, nPoint: 5,
            window: { fromTime: visible[fromIdx]!.openTime, toTime: visible[iT]!.openTime },
            lastPivot: { index: ewIndexAt(visible, iso(last)), time: last },
            refCount: { times, type: r.corrType as EwCorrectionType | null, dir: r.dir as EwDirection },
            invTol: 0.25 * atr,
          };
          const ref = buildEwRef(visible, params);
          expect(ref).not.toBeNull();
          const a = p.answer;
          const mk = (kind: 'ew-impulse' | 'ew-zigzag' | 'ew-flat', list: Pt[]) => ({ id: `u-${kind}`, kind, anchors: anchors(c, list), scope: null, direction: null, author: 'user' as const });
          const out = gradeElliott(
            ref!, { candles: visible, tf }, future,
            {
              kind: r.kind, impulse: mk('ew-impulse', a.impulse),
              correction: a.correction ? mk(a.correction.type === 'zigzag' ? 'ew-zigzag' : 'ew-flat', a.correction.anchors) : null,
              primary: a.primary, alternative: a.alternative, invalidation: a.invalidation,
            },
          );
          const codes = out.errors.map((x) => x.code);
          if (e.verdict) expect(out.verdict).toBe(e.verdict);
          if (e.quality !== undefined) close(out.detail.quality.score, e.quality, 6);
          if (e.scoreMax !== undefined) expect(out.score).toBeLessThanOrEqual(e.scoreMax);
          if (e.errors) expect(codes).toEqual(e.errors);
          if (e.errorsInclude) for (const x of e.errorsInclude) expect(codes).toContain(x);
          if (e.errorsExclude) for (const x of e.errorsExclude) expect(codes).not.toContain(x);
          if (e.invalidation) expect(out.detail.invalidation.status).toBe(e.invalidation);
          if (e.reason) expect(out.detail.invalidation.reason).toBe(e.reason);
          if (e.altStatus) expect(out.detail.scenario.altStatus).toBe(e.altStatus);
          if (e.invTol) close(ref!.invTol, e.invTol, 3);
          if (e.invTol && id === 'EW-4') expect(ref!.invTol).toBeCloseTo(254.1625, 3);
          if (e.outcome) expect(out.detail.outcome.kind).toBe(e.outcome);
        } else {
          throw new Error(`unknown function ${cs.function}`);
        }
      });
    }
  });
}
