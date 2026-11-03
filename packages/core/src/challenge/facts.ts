// Факты на момент T, эталонная сторона refSide и предикаты причин Challenge (ALGORITHMS §14.1, §14.2, §14.5).
import { analyzeStructure } from '../smc/analyze';
import { atr14, closedOnly } from '../smc/series';
import type {
  Candle,
  Fvg,
  OrderBlock,
  StructureEvent,
  StructureParams,
  StructureResult,
  Swing,
  TaskTimeframe,
  Trend,
} from '../types';
import { findLevels, type Level } from '../pa/levels';

/** N = 5 внешний слой, N = 2 внутренний (для оценки SL «за внутренним swing»). */
export const CHALLENGE_STRUCTURE: StructureParams = { nExt: 5, nInt: 2, sweepHoldK: 3, fvgMinAtr: 0.5, obDisplacementAtr: 1.2 };

export type Side = 'LONG' | 'SHORT';
export type RefSide = Side | 'WAIT';

export type ReasonCode =
  | 'trend-continuation'
  | 'choch-reversal'
  | 'bos-confirmed'
  | 'sweep-reversal'
  | 'order-block-reaction'
  | 'fvg-fill'
  | 'level-reaction'
  | 'htf-alignment'
  | 'range-no-edge'
  | 'unclear-structure';

export const REASON_CODES: readonly ReasonCode[] = [
  'trend-continuation',
  'choch-reversal',
  'bos-confirmed',
  'sweep-reversal',
  'order-block-reaction',
  'fvg-fill',
  'level-reaction',
  'htf-alignment',
  'range-no-edge',
  'unclear-structure',
];

/** Лимит проигрывания, свечей выбранного ТФ (14.4, OQ-09); одинаков для всех сложностей. */
export const TIME_LIMIT_CANDLES: Readonly<Record<TaskTimeframe, number>> = { '15m': 96, '1h': 72, '4h': 60, '1d': 30 };

/** Минимально допустимый RR эталона и полный балл. */
export const RR_FULL = 2;
export const RR_MIN = 1.5;

export interface PoiInfo {
  ob: OrderBlock | null;
  fvg: Fvg | null;
  nearProtected: boolean;
  any: boolean;
}

export interface ChallengeFacts {
  tf: TaskTimeframe;
  htfTf: TaskTimeframe;
  /** Закрытая последняя свеча рабочего ТФ. */
  last: Candle;
  lastIndex: number;
  /** Цена входа: close последней видимой свечи (может быть частичной, ADR-0006 п.4). */
  entry: number;
  atr: number;
  trendTf: Trend;
  trendHtf: Trend;
  refHigh: Swing | null;
  refLow: Swing | null;
  lastEvent: StructureEvent | null;
  /** Предыдущее внешнее событие (для «два последних противоположны»). */
  prevEvent: StructureEvent | null;
  structure: StructureResult;
  htfStructure: StructureResult;
  candles: Candle[];
  levels: Level[];
  poi: Record<'bull' | 'bear', PoiInfo>;
  refSide: RefSide;
  /** Расчёты эталонных SL/TP/RR для refSide (для разбора), если refSide != WAIT. */
  ref: { sl: number; tp: number; rr: number } | null;
  /** Расчёты по каждой стороне (для объяснения WAIT_MISSED_SETUP и т.п.). */
  setup: Record<Side, { sl: number; tp: number; rr: number } | null>;
}

const HTF: Record<TaskTimeframe, TaskTimeframe> = { '15m': '1h', '1h': '4h', '4h': '1d', '1d': '1d' };

function intersects(lo1: number, hi1: number, lo2: number, hi2: number): boolean {
  return lo1 <= hi2 && lo2 <= hi1;
}

function poiFor(dir: 'bull' | 'bear', r: StructureResult, last: Candle, A: number, protectedRef: Swing | null): PoiInfo {
  const ob =
    r.orderBlocks.find(
      (o) =>
        o.direction === dir &&
        o.valid &&
        o.status !== 'invalidated' &&
        (dir === 'bull'
          ? intersects(last.low, last.high, o.bottom, o.top + 0.25 * A)
          : intersects(last.low, last.high, o.bottom - 0.25 * A, o.top)),
    ) ?? null;
  const fvg =
    r.fvgs.find((f) => f.direction === dir && (f.status === 'open' || f.status === 'partial') && intersects(last.low, last.high, f.bottom, f.top)) ??
    null;
  const nearProtected = protectedRef !== null && (dir === 'bull' ? last.low <= protectedRef.price + 1.0 * A : last.high >= protectedRef.price - 1.0 * A);
  return { ob, fvg, nearProtected, any: ob !== null || fvg !== null || nearProtected };
}

function lastEventSince(r: StructureResult, dir: 'bull' | 'bear'): StructureEvent | null {
  let found: StructureEvent | null = null;
  for (const e of r.events) if (e.scope === 'external' && e.direction === dir) found = e;
  return found;
}

function setupFor(side: Side, f: { entry: number; atr: number; refHigh: Swing | null; refLow: Swing | null; structure: StructureResult; candles: Candle[] }) {
  const bull = side === 'LONG';
  const prot = bull ? f.refLow : f.refHigh;
  if (!prot) return null;
  const sl = bull ? prot.price - 0.1 * f.atr : prot.price + 0.1 * f.atr;
  const target = bull ? f.refHigh : f.refLow;
  let tp: number;
  if (target && (bull ? target.price > f.entry : target.price < f.entry)) tp = target.price;
  else {
    const ev = lastEventSince(f.structure, bull ? 'bull' : 'bear');
    const from = ev ? ev.breakIndex : 0;
    let ext = bull ? -Infinity : Infinity;
    for (let i = from; i < f.candles.length; i++) {
      const c = f.candles[i]!;
      ext = bull ? Math.max(ext, c.high) : Math.min(ext, c.low);
    }
    tp = ext;
  }
  const risk = bull ? f.entry - sl : sl - f.entry;
  const reward = bull ? tp - f.entry : f.entry - tp;
  if (!(risk > 0) || !(reward > 0)) return null;
  return { sl, tp, rr: reward / risk };
}

export interface FactsInput {
  /** Ряд рабочего ТФ: закрытые свечи до T; хвост может быть частичной свечой (closed=false). */
  candles: readonly Candle[];
  tf: TaskTimeframe;
  /** Ряд старшего ТФ: закрытые к T (частичная свеча не участвует). */
  htf: readonly Candle[];
  /** Цена входа; по умолчанию close последней переданной свечи рабочего ТФ. */
  entry?: number;
}

export function computeChallengeFacts(input: FactsInput): ChallengeFacts {
  const candles = closedOnly(input.candles);
  if (candles.length === 0) throw new Error('NO_CANDLES');
  const lastIndex = candles.length - 1;
  const last = candles[lastIndex]!;
  const A = atr14(candles)[lastIndex];
  if (A === null || A === undefined || !(A > 0)) throw new Error('NO_ATR');
  const entry = input.entry ?? input.candles[input.candles.length - 1]!.close;
  const structure = analyzeStructure(candles, CHALLENGE_STRUCTURE);
  const htfStructure = analyzeStructure(closedOnly(input.htf), CHALLENGE_STRUCTURE);
  const ext = structure.state.external;
  const extEvents = structure.events.filter((e) => e.scope === 'external');
  const lastEvent = extEvents[extEvents.length - 1] ?? null;
  const prevEvent = extEvents[extEvents.length - 2] ?? null;
  const trendTf = ext.trend;
  const trendHtf = htfStructure.state.external.trend;

  const poi = {
    bull: poiFor('bull', structure, last, A, ext.refLow),
    bear: poiFor('bear', structure, last, A, ext.refHigh),
  };
  const base = { entry, atr: A, refHigh: ext.refHigh, refLow: ext.refLow, structure, candles };
  const setup = { LONG: setupFor('LONG', base), SHORT: setupFor('SHORT', base) };

  let refSide: RefSide = 'WAIT';
  if (trendHtf === 'up' && trendTf === 'up' && poi.bull.any && setup.LONG && setup.LONG.rr >= RR_FULL) refSide = 'LONG';
  else if (trendHtf === 'down' && trendTf === 'down' && poi.bear.any && setup.SHORT && setup.SHORT.rr >= RR_FULL) refSide = 'SHORT';

  return {
    tf: input.tf,
    htfTf: HTF[input.tf],
    last,
    lastIndex,
    entry,
    atr: A,
    trendTf,
    trendHtf,
    refHigh: ext.refHigh,
    refLow: ext.refLow,
    lastEvent,
    prevEvent,
    structure,
    htfStructure,
    candles,
    levels: findLevels(candles).levels,
    poi,
    refSide,
    ref: refSide === 'WAIT' ? null : setup[refSide],
    setup,
  };
}

const age = (f: ChallengeFacts, e: StructureEvent | null) => (e ? f.lastIndex - e.breakIndex : Infinity);

/** Предикаты причин (14.5). `dir` — направление позиции; для WAIT верны только range-no-edge и unclear-structure. */
export function reasonValid(code: ReasonCode, f: ChallengeFacts, side: RefSide): boolean {
  const isWait = side === 'WAIT';
  const unclear =
    f.trendTf === 'none' ||
    f.trendTf !== f.trendHtf ||
    (f.lastEvent !== null && f.prevEvent !== null && f.lastEvent.direction !== f.prevEvent.direction && age(f, f.lastEvent) <= 30);
  const noPoi = !f.poi.bull.any && !f.poi.bear.any;
  if (code === 'range-no-edge') return f.trendHtf === 'none' || f.trendTf === 'none' || noPoi;
  if (code === 'unclear-structure') return unclear;
  if (isWait) return false;

  const dir: 'bull' | 'bear' = side === 'LONG' ? 'bull' : 'bear';
  const trend: Trend = side === 'LONG' ? 'up' : 'down';
  const ev = f.lastEvent;
  switch (code) {
    case 'trend-continuation':
      return f.trendTf === trend && ev !== null && ev.kind === 'bos' && ev.direction === dir;
    case 'choch-reversal':
      return ev !== null && ev.kind === 'choch' && ev.direction === dir && age(f, ev) <= 30;
    case 'bos-confirmed':
      return ev !== null && ev.kind === 'bos' && ev.direction === dir && age(f, ev) <= 30;
    case 'sweep-reversal': {
      const want = side === 'LONG' ? 'low' : 'high';
      const from = f.lastIndex - 9;
      return [...f.structure.sweeps, ...f.structure.sweepCandidates].some((s) => s.side === want && s.index >= from);
    }
    case 'order-block-reaction':
      return f.poi[dir].ob !== null;
    case 'fvg-fill':
      return f.poi[dir].fvg !== null;
    case 'level-reaction': {
      const need = side === 'LONG' ? 'support' : 'resistance';
      return f.levels.some((l) => l.type === need && intersects(f.last.low, f.last.high, l.low * (1 - 0.003), l.high * (1 + 0.003)));
    }
    case 'htf-alignment':
      return f.trendHtf === trend;
  }
}
