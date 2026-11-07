// Генерация заданий ступеней 2-4 и комбо (CURRICULUM_STAGES.md §3.3, §3.6, §5.1, §6.1, §8): чистые функции, случайность - mulberry32.
import { TIME_LIMIT_CANDLES } from '../challenge/facts';
import { mulberry32, randInt } from '../rng';
import { atr14, gaps } from '../smc/series';
import { drawMsCandidate, MS_DEPTH, MS_MAX_ATTEMPTS } from '../tasks/market-structure';
import { TIMEFRAME_MS, type Candle, type Difficulty, type TaskTimeframe, type UtcMs } from '../types';
import { HTF_OF } from '../pa/context';
import { smcContext, type SmcContext } from './combo';
import type { LevelsRefCtx, ReactionOption } from './levels-grade';
import { resolveZoneChain, resolveZoneReaction, type ZoneChainResult, type ZoneReaction } from './reaction';
import { limitFilled, structurePoint, buildTargets } from './rubric';
import { buildStopTakeRef, type StopTakeRef } from './stoptake';
import {
  candidateZones,
  computeZones,
  farEdge,
  nearEdge,
  pickZoneReference,
  rankStrength,
  roleOfSide,
  sideOfRole,
  type LevelRole,
  type Side,
  type Zone,
  type ZoneCand,
  type ZoneSet,
} from './zone';

/** ТФ по ступеням и сложностям (§3.3, §5.1, §6.1, §8, §11.1). */
export const CUR_TFS = {
  levels: { easy: ['1h', '4h'], medium: ['15m', '1h', '4h', '1d'], hard: ['15m', '1h', '4h', '1d'] },
  reaction: { easy: ['1h', '4h'], medium: ['15m', '1h', '4h'], hard: ['15m', '1h', '4h'] },
  trade: { easy: ['1h', '4h'], medium: ['15m', '1h', '4h'], hard: ['15m', '1h', '4h'] },
} as const satisfies Record<string, Record<Difficulty, readonly TaskTimeframe[]>>;

export type CurTaskGroup = keyof typeof CUR_TFS;

export interface ZonePickInput {
  /** Архивный ряд ТФ задания (закрытые свечи по возрастанию) с будущим. */
  candles: readonly Candle[];
  /** Архивный ряд старшего ТФ (для силы уровня); пусто для 1d. */
  htf: readonly Candle[];
  tf: TaskTimeframe;
  difficulty: Difficulty;
  seed: number;
  /** Шаг цены символа (правило исполнения лимитки, §20). */
  tick: number;
  isExcluded?: (T: UtcMs) => boolean;
  maxT?: UtcMs;
  maxAttempts?: number;
}

/** Закрытые к T свечи старшего ТФ, последние `depth`. */
export function htfClosedBefore(htf: readonly Candle[], T: UtcMs, depth: number): Candle[] {
  let hi = htf.length;
  let lo = 0;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (htf[mid]!.closeTime < T) lo = mid + 1;
    else hi = mid;
  }
  return htf.slice(Math.max(0, lo - depth), lo) as Candle[];
}

interface Draw {
  T: UtcMs;
  visible: Candle[];
  visibleFrom: number;
  /** Индекс последней видимой свечи в `candles`. */
  iT: number;
  htfVisible: Candle[] | null;
  set: ZoneSet;
}

const limitOf = (tf: TaskTimeframe) => TIME_LIMIT_CANDLES[tf];
export const depthOfTf = (tf: TaskTimeframe): number => MS_DEPTH[tf];

/** T на сетке 15m, видимый ряд, зоны уровней; `future` - сколько свечей после T обязано быть без пропусков. */
function draw(inp: ZonePickInput, rng: () => number, future: number): Draw | null {
  const { candles, tf } = inp;
  const depth = depthOfTf(tf);
  let maxT = inp.maxT;
  if (future > 0) {
    const lastOk = candles[candles.length - 1 - future];
    if (!lastOk) return null;
    maxT = Math.min(maxT ?? Infinity, lastOk.closeTime + 1);
  }
  const cand = drawMsCandidate({ candles, tf, ...(maxT !== undefined ? { maxT } : {}), ...(inp.isExcluded ? { isExcluded: inp.isExcluded } : {}) }, rng, depth);
  if (!cand) return null;
  const iT = cand.visibleFrom + cand.visible.length - 1;
  if (future > 0) {
    const tail = candles.slice(iT, iT + future + 1);
    if (tail.length !== future + 1 || gaps(tail, tf).length > 0) return null;
  }
  const htfTf = HTF_OF[tf];
  const htfVisible = htfTf === tf || inp.htf.length === 0 ? null : htfClosedBefore(inp.htf, cand.T, depthOfTf(htfTf));
  const set = computeZones(cand.visible, htfVisible);
  if (!set) return null;
  return { T: cand.T, visible: cand.visible, visibleFrom: cand.visibleFrom, iT, htfVisible, set };
}

// ------------------------------------------------------------------ lv-strongest, lv-zone

export interface LevelsPick {
  T: UtcMs;
  visible: Candle[];
  htfVisible: Candle[] | null;
  role: LevelRole | null;
  ctx: LevelsRefCtx;
  attempts: number;
}

/** Максимальное расстояние зоны от цены, ATR (§1.4). */
export const MAX_DIST_LEVELS = 5;

/** §3.3: видимая история, роль (hard - null), однозначный эталон (касаний >= 3, easy >= 2; отрыв силы >= 1). */
export function pickLevelsTask(inp: ZonePickInput): LevelsPick | null {
  const rng = mulberry32(inp.seed);
  const role: LevelRole | null = inp.difficulty === 'hard' ? null : rng() < 0.5 ? 'support' : 'resistance';
  const max = inp.maxAttempts ?? MS_MAX_ATTEMPTS;
  for (let a = 1; a <= max; a++) {
    const d = draw(inp, rng, 0);
    if (!d) continue;
    const r = pickZoneReference(candidateZones(d.set, role, MAX_DIST_LEVELS), inp.difficulty === 'easy' ? 2 : 3);
    if (!r) continue;
    return { T: d.T, visible: d.visible, htfVisible: d.htfVisible, role, ctx: { set: d.set, role, ref: r.ref, second: r.second }, attempts: a };
  }
  return null;
}

/** Эталон ступени 2 по видимому ряду (grade): тот же выбор, что в генерации. */
export function levelsContext(visible: readonly Candle[], htfVisible: readonly Candle[] | null, role: LevelRole | null, difficulty: Difficulty): LevelsRefCtx | null {
  const set = computeZones(visible, htfVisible);
  if (!set) return null;
  const r = pickZoneReference(candidateZones(set, role, MAX_DIST_LEVELS), difficulty === 'easy' ? 2 : 3);
  return r ? { set, role, ref: r.ref, second: r.second } : null;
}

// ------------------------------------------------------------------ lv-reaction

export const REACTION_K: Record<Difficulty, number> = { easy: 2, medium: 2, hard: 3 };

/** §3.6: варианты - уровни роли с 1 <= dist <= 6, touches >= 3; зоны подхода не перекрываются (зазор >= 0.5*A). */
export function reactionOptions(set: ZoneSet, side: Side, difficulty: Difficulty): ReactionOption[] {
  const role = roleOfSide(side);
  const pool = rankStrength(set.zones.filter((z) => z.role === role && z.dist >= 1 && z.dist <= 6 && z.touches >= 3), set.P);
  const chosen: ZoneCand[] = [];
  const K = REACTION_K[difficulty];
  const separated = (a: ZoneCand, b: ZoneCand): boolean => {
    const [near, far] = a.dist <= b.dist ? [a, b] : [b, a];
    return side === 'LONG' ? near.bottom - far.top >= 0.5 * set.A : far.bottom - near.top >= 0.5 * set.A;
  };
  for (const z of pool) {
    if (chosen.length >= K) break;
    if (chosen.every((c) => separated(c, z))) chosen.push(z);
  }
  return chosen
    .sort((a, b) => a.dist - b.dist)
    .map((zone, i) => ({ id: `z${i + 1}`, zone }));
}

export interface LvReactionPick {
  T: UtcMs;
  visible: Candle[];
  htfVisible: Candle[] | null;
  side: Side;
  set: ZoneSet;
  options: ReactionOption[];
  allowNone: boolean;
  chain: ZoneChainResult;
  /** Свечи после T до лимита (с будущим). */
  iT: number;
  limit: number;
  attempts: number;
}

export function pickLvReactionTask(inp: ZonePickInput): LvReactionPick | null {
  const rng = mulberry32(inp.seed);
  const side: Side = rng() < 0.5 ? 'LONG' : 'SHORT';
  const hard = inp.difficulty === 'hard';
  const limit = limitOf(inp.tf);
  const max = inp.maxAttempts ?? MS_MAX_ATTEMPTS;
  for (let a = 1; a <= max; a++) {
    const d = draw(inp, rng, limit);
    if (!d) continue;
    const options = reactionOptions(d.set, side, inp.difficulty);
    if (options.length < 2) continue;
    const slots = options.length + (hard ? 1 : 0);
    const want = randInt(rng, slots); // индекс желаемого ответа; options.length - `none`
    const zones = options.map((o) => o.zone);
    const chain = resolveZoneChain(inp.candles, d.iT, zones, side, d.set.A, limit);
    const ok = want < options.length ? chain.kind === 'reaction' && chain.k === want : chain.kind === 'none';
    if (!ok || chain.incomplete) continue;
    return { T: d.T, visible: d.visible, htfVisible: d.htfVisible, side, set: d.set, options, allowNone: hard, chain, iT: d.iT, limit, attempts: a };
  }
  return null;
}

// ------------------------------------------------------------------ limit-entry

export interface LimitPick {
  T: UtcMs;
  visible: Candle[];
  htfVisible: Candle[] | null;
  side: Side;
  set: ZoneSet;
  ref: ZoneCand;
  reaction: ZoneReaction;
  iT: number;
  limit: number;
  attempts: number;
}

export const MAX_DIST_TRADE = 4;

/** Зона сделки: эталон §3.3 (роль задана), 1 <= dist <= 4. */
function tradeRef(set: ZoneSet, role: LevelRole | null, difficulty: Difficulty): ZoneCand | null {
  const r = pickZoneReference(candidateZones(set, role, MAX_DIST_TRADE), difficulty === 'easy' ? 2 : 3);
  return r && r.ref.dist >= 1 ? r.ref : null;
}

/** Условие hard ступени 3: реакция до ближнего края или фитиль за дальний край. */
export function specialReaction(side: Side, zone: Zone, m: number): boolean {
  const long = side === 'LONG';
  const beforeNear = long ? m > zone.top : m < zone.bottom;
  const beyondFar = long ? m < zone.bottom : m > zone.top;
  return beforeNear || beyondFar;
}

export function pickLimitEntryTask(inp: ZonePickInput): LimitPick | null {
  const rng = mulberry32(inp.seed);
  const side: Side = rng() < 0.5 ? 'LONG' : 'SHORT';
  const needSpecial = inp.difficulty === 'hard' && rng() < 0.5;
  const limit = limitOf(inp.tf);
  const max = inp.maxAttempts ?? MS_MAX_ATTEMPTS;
  for (let a = 1; a <= max; a++) {
    const d = draw(inp, rng, limit);
    if (!d) continue;
    const ref = tradeRef(d.set, roleOfSide(side), inp.difficulty);
    if (!ref) continue;
    const reaction = resolveZoneReaction(inp.candles, d.iT, ref, side, d.set.A, limit);
    if (reaction.kind !== 'reaction' || reaction.incomplete) continue;
    if (needSpecial && !specialReaction(side, ref, reaction.m)) continue;
    return { T: d.T, visible: d.visible, htfVisible: d.htfVisible, side, set: d.set, ref, reaction, iT: d.iT, limit, attempts: a };
  }
  return null;
}

// ------------------------------------------------------------------ stop-take

export interface StopTakePick {
  /** Момент T0, на котором выбрана зона (не раскрывается). */
  T0: UtcMs;
  /** Момент решения: закрытие свечи исполнения. */
  T: UtcMs;
  side: Side;
  /** Зона и сила на T0. */
  zone: ZoneCand;
  /** Видимый ряд задания: заканчивается свечой исполнения. */
  visible: Candle[];
  ref: StopTakeRef;
  /** Индекс свечи исполнения в `candles`. */
  fIndex: number;
  limit: number;
  attempts: number;
}

export function pickStopTakeTask(inp: ZonePickInput): StopTakePick | null {
  const rng = mulberry32(inp.seed);
  const side: Side = rng() < 0.5 ? 'LONG' : 'SHORT';
  const needSpecial = inp.difficulty === 'hard' && rng() < 0.5;
  const limit = limitOf(inp.tf);
  const depth = depthOfTf(inp.tf);
  const step = TIMEFRAME_MS[inp.tf];
  const max = inp.maxAttempts ?? MS_MAX_ATTEMPTS;
  const long = side === 'LONG';
  for (let a = 1; a <= max; a++) {
    // после свечи исполнения нужно ещё `limit` свечей: запас = 2 * limit
    const d = draw(inp, rng, 2 * limit);
    if (!d) continue;
    const zone = tradeRef(d.set, roleOfSide(side), inp.difficulty);
    if (!zone) continue;
    const E = nearEdge(zone, side);
    let f = -1;
    for (let j = d.iT + 1; j <= d.iT + limit; j++) {
      if (limitFilled(inp.candles[j]!, side, E, inp.tick)) {
        f = j;
        break;
      }
    }
    if (f < 0) continue;
    const cf = inp.candles[f]!;
    if (long ? cf.close < zone.bottom : cf.close > zone.top) continue;
    const A = d.set.A;
    const Af = atr14(inp.candles.slice(Math.max(0, f - depth + 1), f + 1))[Math.min(depth, f + 1) - 1];
    if (Af === null || Af === undefined || !(Af > 0)) continue;
    if (long ? cf.close >= cf.low + 1.5 * Af : cf.close <= cf.high - 1.5 * Af) continue;
    const from = f - depth + 1;
    if (from < 0) continue;
    const visible = inp.candles.slice(from, f + 1) as Candle[];
    if (visible.length !== depth || gaps(visible, inp.tf).length > 0) continue;
    const ref = buildStopTakeRef(visible, side, zone, E);
    if (!ref) continue;
    if (needSpecial) {
      const wick = long ? cf.low < zone.bottom : cf.high > zone.top;
      const close1 = ref.targets.targets[0]!.rrRef < 1.5;
      if (!wick && !close1) continue;
    }
    // будущее после f: limit свечей без пропусков
    const tail = inp.candles.slice(f, f + limit + 1);
    if (tail.length !== limit + 1 || gaps(tail, inp.tf).length > 0) continue;
    void A;
    return { T0: d.T, T: cf.closeTime + 1, side, zone, visible, ref, fIndex: f, limit, attempts: a };
  }
  void step;
  return null;
}

// ------------------------------------------------------------------ combo-level-trade

export interface ComboLevelPick {
  T: UtcMs;
  visible: Candle[];
  htfVisible: Candle[] | null;
  /** Сторона эталона; пользователю раскрывается, кроме hard. */
  refSide: Side;
  sideShown: Side | null;
  role: LevelRole | null;
  ctx: LevelsRefCtx;
  outcome: 'reaction' | 'break';
  iT: number;
  limit: number;
  attempts: number;
}

export function pickComboLevelTask(inp: ZonePickInput): ComboLevelPick | null {
  const rng = mulberry32(inp.seed);
  const hard = inp.difficulty === 'hard';
  const side: Side = rng() < 0.5 ? 'LONG' : 'SHORT';
  const want: 'reaction' | 'break' = rng() < 0.5 ? 'reaction' : 'break';
  const role: LevelRole | null = hard ? null : roleOfSide(side);
  const limit = limitOf(inp.tf);
  const max = inp.maxAttempts ?? MS_MAX_ATTEMPTS;
  for (let a = 1; a <= max; a++) {
    const d = draw(inp, rng, limit);
    if (!d) continue;
    const r = pickZoneReference(candidateZones(d.set, role, MAX_DIST_TRADE), inp.difficulty === 'easy' ? 2 : 3);
    if (!r || r.ref.dist < 1 || r.ref.role === 'inside') continue;
    const refSide = sideOfRole(r.ref.role as LevelRole);
    const res = resolveZoneReaction(inp.candles, d.iT, r.ref, refSide, d.set.A, limit);
    if (res.kind !== want || res.incomplete) continue;
    return {
      T: d.T, visible: d.visible, htfVisible: d.htfVisible, refSide, sideShown: hard ? null : refSide, role,
      ctx: { set: d.set, role, ref: r.ref, second: r.second }, outcome: want, iT: d.iT, limit, attempts: a,
    };
  }
  return null;
}

// ------------------------------------------------------------------ combo-smc-entry

export interface ComboSmcPick {
  T: UtcMs;
  visible: Candle[];
  ctx: SmcContext;
  outcome: 'reaction' | 'break';
  iT: number;
  limit: number;
  attempts: number;
}

export function pickComboSmcTask(inp: ZonePickInput): ComboSmcPick | null {
  const rng = mulberry32(inp.seed);
  const want: 'reaction' | 'break' = rng() < 0.5 ? 'reaction' : 'break';
  const limit = limitOf(inp.tf);
  const max = inp.maxAttempts ?? MS_MAX_ATTEMPTS;
  for (let a = 1; a <= max; a++) {
    // зоны уровней здесь не нужны, но draw их строит; допустимо (ATR != 0 проверяется там же)
    const d = draw({ ...inp, htf: [] }, rng, limit);
    if (!d) continue;
    const ctx = smcContext(d.visible);
    if (!ctx) continue;
    const poi = ctx.candidates.find((p) => p.dist >= 1 && p.dist <= 6);
    if (!poi || ctx.candidates[0] !== poi) continue; // ближайший POI должен лежать в 1..6 ATR
    const res = resolveZoneReaction(inp.candles, d.iT, poi, ctx.side, ctx.A, limit);
    if (res.kind !== want || res.incomplete) continue;
    return { T: d.T, visible: d.visible, ctx, outcome: want, iT: d.iT, limit, attempts: a };
  }
  return null;
}

export { buildTargets, structurePoint, farEdge };
