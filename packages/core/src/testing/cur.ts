// Вычисление golden-участков курса (fixtures/golden/cur_*.golden.json, CURRICULUM_STAGES.md §14): реальные свечи
// data.binance.vision, ответы пользователя - тестовые входы. Только для тестов (node:fs через readKlines).
import { candleProvider } from './provider';
import { readKlines } from './klines';
import { gradeComboLevel, gradeComboSmc, playCombo, smcContext, type ComboAnswer } from '../curriculum/combo';
import { htfClosedBefore, levelsContext, reactionOptions } from '../curriculum/generate';
import { correctReactionId, gradeLvReaction, gradeLvStrongest, gradeLvZone } from '../curriculum/levels-grade';
import { gradeLimitEntry, type LimitOrder } from '../curriculum/limit';
import { limitFilled } from '../curriculum/rubric';
import { resolveZoneChain, resolveZoneReaction } from '../curriculum/reaction';
import { huntBlocks, playStopTake, buildStopTakeRef, scoreStopTake } from '../curriculum/stoptake';
import { swingTrend } from '../curriculum/swings';
import { computeZones, type LevelRole, type Side, type ZoneCand } from '../curriculum/zone';
import type { Candle, Difficulty, TaskTimeframe } from '../types';
import { TIME_LIMIT_CANDLES } from '../challenge/facts';

const iso = (t: number): string => new Date(t).toISOString().replace('.000Z', 'Z');
const r4 = (x: number): number => Math.round(x * 1e4) / 1e4;
/** Рекурсивное округление чисел до 4 знаков (golden сравниваются после округления). */
export function round4<T>(x: T): T {
  if (typeof x === 'number') return (Number.isFinite(x) ? r4(x) : null) as T;
  if (Array.isArray(x)) return x.map(round4) as T;
  if (x && typeof x === 'object') return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, round4(v)])) as T;
  return x;
}

export interface CurGoldenParams {
  id: string;
  kind: 'sw-trend' | 'lv-strongest' | 'lv-zone' | 'lv-reaction' | 'limit-entry' | 'stop-take' | 'combo-level-trade' | 'combo-smc-entry';
  symbol: string;
  tf: TaskTimeframe;
  /** openTime последней видимой свечи (в нотации спецификации «T»). */
  lastVisible: string;
  tick: number;
  files: string[];
  htfFiles?: string[];
  htfTf?: TaskTimeframe;
  difficulty?: Difficulty;
  side?: Side;
  role?: LevelRole | null;
  /** Эталонная зона [bottom, top] (limit-entry, stop-take). */
  zone?: [number, number];
  /** Вход ступени 4 (ближний край зоны). */
  entry?: number;
  nExt?: number[];
}

export interface CurGolden {
  algoVersion: string;
  params: CurGoldenParams;
  inputs: Record<string, unknown>[];
  expected: Record<string, unknown>;
}

const cache = new Map<string, Candle[]>();
function series(files: string[]): Candle[] {
  const key = files.join('|');
  let c = cache.get(key);
  if (!c) {
    c = files.flatMap((f) => readKlines(f)).sort((a, b) => a.openTime - b.openTime);
    cache.set(key, c);
  }
  return c;
}

const mark = (a: number, b: number) => ({ id: 'u-zone', kind: 'zone' as const, anchors: [{ time: 0, price: a }, { time: 0, price: b }], scope: null, direction: null, author: 'user' as const });

export interface CurSetup {
  candles: Candle[];
  iT: number;
  visible: Candle[];
  htf: Candle[] | null;
  /** Реальный момент решения: закрытие последней видимой свечи. */
  T: number;
  limit: number;
}

export function curSetup(p: CurGoldenParams): CurSetup {
  const candles = series(p.files);
  const iT = candles.findIndex((c) => c.openTime === Date.parse(p.lastVisible));
  if (iT < 0) throw new Error(`no candle ${p.lastVisible}`);
  const depth = p.tf === '1d' ? 365 : 500;
  const visible = candles.slice(Math.max(0, iT - depth + 1), iT + 1);
  const T = candles[iT]!.closeTime + 1;
  const htf = p.htfFiles ? htfClosedBefore(series(p.htfFiles), T, 500) : null;
  return { candles, iT, visible, htf, T, limit: TIME_LIMIT_CANDLES[p.tf] };
}

const zoneBrief = (z: ZoneCand) => ({ bottom: z.bottom, top: z.top, touches: z.touches, reactions: z.reactions, strength: z.strength, recency: z.recency, htf: z.htf, flip: z.flip, dist: z.dist, role: z.role });
const errCodes = (e: { code: string }[]) => e.map((x) => x.code);

function findZone(zones: ZoneCand[], b: number, t: number): ZoneCand {
  const z = zones.find((x) => Math.abs(x.bottom - b) < 0.05 && Math.abs(x.top - t) < 0.05);
  if (!z) throw new Error(`zone ${b}-${t} not found`);
  return z;
}

/** Вычисляет `expected` golden-участка по params и inputs (одна функция для генерации файла и проверки). */
export async function evalCurGolden(g: Pick<CurGolden, 'params' | 'inputs'>): Promise<Record<string, unknown>> {
  const p = g.params;
  const s = curSetup(p);
  const provider = candleProvider({ [p.tf]: s.candles });
  const out: Record<string, unknown> = {};

  if (p.kind === 'sw-trend') {
    for (const n of p.nExt ?? [5, 7]) {
      const r = swingTrend(s.visible, n)!;
      const ref = (x: { time: number; price: number; label: string | null }) => ({ time: iso(x.time), price: x.price, label: x.label });
      out[`n${n}`] = { trend: r.trend, bosTrend: r.bosTrend, lastHigh: ref(r.lastHigh), prevHigh: ref(r.prevHigh), lastLow: ref(r.lastLow), prevLow: ref(r.prevLow) };
    }
    return round4(out);
  }

  const set = computeZones(s.visible, s.htf)!;
  out['A'] = set.A;
  out['P'] = set.P;

  if (p.kind === 'lv-strongest' || p.kind === 'lv-zone') {
    const ctx = levelsContext(s.visible, s.htf, p.role ?? null, p.difficulty ?? 'medium')!;
    out['reference'] = zoneBrief(ctx.ref);
    out['second'] = ctx.second ? zoneBrief(ctx.second) : null;
    out['cases'] = g.inputs.map((i) => {
      if (p.kind === 'lv-strongest') {
        const r = gradeLvStrongest(ctx, i['price'] as number);
        return { verdict: r.verdict, score: r.score, codes: errCodes(r.errors), deviationPct: r.detail.deviationPct, hitStrength: r.detail.hit?.strength ?? null };
      }
      const [ub, ut] = i['zone'] as [number, number];
      const r = gradeLvZone(ctx, ub, ut);
      return { verdict: r.verdict, score: r.score, codes: errCodes(r.errors), sharePct: r.detail.sharePct, coversCore: r.detail.coversCore, heightAtr: r.detail.heightAtr };
    });
    return round4(out);
  }

  if (p.kind === 'lv-reaction') {
    const options = reactionOptions(set, p.side!, p.difficulty ?? 'hard');
    const chain = resolveZoneChain(s.candles, s.iT, options.map((o) => o.zone), p.side!, set.A, s.limit);
    out['options'] = options.map((o) => ({ id: o.id, ...zoneBrief(o.zone) }));
    out['chain'] = {
      kind: chain.kind,
      correct: correctReactionId(chain),
      eventTime: iso(s.candles[chain.e]!.openTime),
      extreme: chain.mIndex >= 0 ? chain.m : null,
      extremeTime: chain.mIndex >= 0 ? iso(s.candles[chain.mIndex]!.openTime) : null,
      broken: chain.broken.map((b) => ({ zone: `z${b.k + 1}`, time: iso(s.candles[b.index]!.openTime) })),
    };
    out['cases'] = g.inputs.map((i) => {
      const r = gradeLvReaction(options, chain, s.candles, i['optionId'] as string);
      return { verdict: r.verdict, codes: errCodes(r.errors) };
    });
    return round4(out);
  }

  const side = p.side!;
  if (p.kind === 'limit-entry') {
    const zone = findZone(set.zones, p.zone![0], p.zone![1]);
    const reaction = resolveZoneReaction(s.candles, s.iT, zone, side, set.A, s.limit);
    out['zone'] = zoneBrief(zone);
    out['reaction'] = { kind: reaction.kind, t0: iso(s.candles[reaction.t0]!.openTime), extreme: reaction.m, extremeTime: iso(s.candles[reaction.mIndex]!.openTime), confirmTime: iso(s.candles[reaction.e]!.openTime) };
    out['cases'] = g.inputs.map((i) => {
      const gr = gradeLimitEntry({ side, zone, A: set.A, tick: p.tick, candles: s.candles, T: s.iT, limitCandles: s.limit, order: i as unknown as LimitOrder, reaction });
      return {
        parts: gr.parts.map((x) => `${x.key}:${r4(x.score)}`),
        quality: gr.quality,
        verdict: gr.verdict,
        codes: errCodes(gr.errors),
        fill: gr.detail.fill ? { time: iso(gr.detail.fill.time), candles: gr.detail.fill.candles } : null,
        maeAtr: gr.detail.maeAtr,
        mfeAtr: gr.detail.mfeAtr,
        gapAtr: gr.detail.gapAtr,
      };
    });
    return round4(out);
  }

  if (p.kind === 'stop-take') {
    const zone = findZone(set.zones, p.zone![0], p.zone![1]);
    let f = -1;
    for (let j = s.iT + 1; j <= s.iT + s.limit; j++) {
      if (limitFilled(s.candles[j]!, side, p.entry!, p.tick)) {
        f = j;
        break;
      }
    }
    const visible = s.candles.slice(f - 499, f + 1);
    const ref = buildStopTakeRef(visible, side, zone, p.entry!)!;
    out['zone'] = zoneBrief(zone);
    out['fill'] = { time: iso(s.candles[f]!.openTime), candles: f - s.iT };
    out['ref'] = { A: ref.A, Pl: ref.Pl, Estar: ref.Estar, slRef: ref.targets.slRef, kStar: ref.targets.kStar, targets: ref.targets.targets.slice(0, ref.targets.kStar + 3).map((t) => ({ price: t.price, source: t.source, rrRef: t.rrRef, allowed: t.allowed })) };
    const T = s.candles[f]!.closeTime + 1;
    const prov = candleProvider({ [p.tf]: s.candles });
    const cases = [];
    for (const i of g.inputs) {
      const sc = scoreStopTake(ref, i['sl'] as number, i['tp'] as number);
      const play = await playStopTake(ref, i['sl'] as number, i['tp'] as number, T, p.tf, s.limit, prov);
      const blk = huntBlocks(side, i['sl'] as number, sc.slFull, play.hunt, ref);
      cases.push({
        parts: sc.parts.map((x) => `${x.key}:${x.score}`),
        quality: sc.quality,
        verdict: sc.verdict,
        rr: sc.rr,
        codes: errCodes(sc.errors),
        outcome: { result: play.outcome.result, exitTime: iso(play.outcome.exitTime), r: play.outcome.rMultiple, method: play.outcome.method },
        referenceOutcome: { sl: play.referencePlan.sl, tp: play.referencePlan.tp, result: play.referencePlan.outcome.result, exitTime: iso(play.referencePlan.outcome.exitTime) },
        stopHunted: play.hunt.hunted,
        huntBlocks: [...blk.ok.map((x) => x.code), ...errCodes(blk.errors)],
      });
    }
    out['cases'] = cases;
    return round4(out);
  }

  // combo
  const cases = [];
  if (p.kind === 'combo-level-trade') {
    const ctx = levelsContext(s.visible, s.htf, p.role ?? null, p.difficulty ?? 'medium')!;
    out['reference'] = zoneBrief(ctx.ref);
    for (const i of g.inputs) {
      const [ub, ut] = i['zone'] as [number, number];
      const ans: ComboAnswer = { zone: mark(ub, ut), limit: i['limit'] as LimitOrder, sl: i['sl'] as number, tp: i['tp'] as number };
      const gr = gradeComboLevel(ctx, s.visible, ans, p.role === null ? null : side);
      const play = await playCombo(gr, { side: gr.side, T: s.T, tf: p.tf, limitCandles: s.limit, zone: { near: gr.side === 'LONG' ? gr.zone.top : gr.zone.bottom, far: gr.side === 'LONG' ? gr.zone.bottom : gr.zone.top }, A: set.A, P: set.P, tick: p.tick }, ans, provider);
      cases.push(comboCase(gr, play));
    }
  } else {
    const ctx = smcContext(s.visible)!;
    out['trend'] = ctx.trend;
    out['poi'] = ctx.candidates.slice(0, 2).map((c) => ({ kind: c.kind, bottom: c.bottom, top: c.top, status: c.status, dist: c.dist }));
    for (const i of g.inputs) {
      const [ub, ut] = i['zone'] as [number, number];
      const ans: ComboAnswer = { zone: mark(ub, ut), limit: i['limit'] as LimitOrder, sl: i['sl'] as number, tp: i['tp'] as number };
      const gr = gradeComboSmc(ctx, s.visible, ans);
      const play = await playCombo(gr, { side: ctx.side, T: s.T, tf: p.tf, limitCandles: s.limit, zone: { near: gr.zone.top, far: gr.zone.bottom }, A: ctx.A, P: ctx.P, tick: p.tick }, ans, provider);
      cases.push(comboCase(gr, play));
    }
  }
  out['cases'] = cases;
  return round4(out);
}

function comboCase(gr: { parts: { key: string; score: number }[]; quality: number; verdict: string; rr: number; errors: { code: string }[]; targets: { price: number; source: string; rrRef: number; allowed: boolean }[] }, play: Awaited<ReturnType<typeof playCombo>>) {
  const o = play.outcome;
  return {
    parts: gr.parts.map((x) => `${x.key}:${x.score}`),
    quality: gr.quality,
    verdict: gr.verdict,
    rr: gr.rr,
    codes: errCodes(gr.errors),
    targets: gr.targets.filter((t) => t.allowed).map((t) => ({ price: t.price, source: t.source, rrRef: t.rrRef })),
    outcome:
      o.kind === 'tp' || o.kind === 'sl' || o.kind === 'timeout'
        ? { kind: o.kind, fillTime: iso(o.fillTime), exitTime: iso(o.exitTime), r: o.rMultiple, fillMethod: o.fillMethod }
        : { kind: o.kind, time: iso((o as { time: number }).time), r: 0 },
    stopHunted: play.hunt.hunted,
  };
}
