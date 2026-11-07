// Общие части рубрик ступеней 3-4 и комбо: глубина лимитки, исполнение, SL за структурой, цели TP, R:R
// (CURRICULUM_STAGES.md §5.3, §6.2-§6.4, §20). Все пороги - цены (сначала цена порога, затем сравнение).
import { findLevels } from '../pa/levels';
import { analyzeStructure } from '../smc/analyze';
import type { Candle, StructureParams } from '../types';
import { levelZone, type Side, type Zone } from './zone';
import { nearEdge } from './zone';

export type LimitType = 'near-edge' | 'middle' | 'far-edge' | 'front-run';
export const LIMIT_TYPES: readonly LimitType[] = ['near-edge', 'middle', 'far-edge', 'front-run'];
export const FRONT_K_MIN = 0.05;
export const FRONT_K_MAX = 0.5;

/** Запас стопа за структурной точкой, ATR (§6.2, §20: и в Challenge). */
export const SL_BUFFER_MIN = 0.25;
export const SL_BUFFER_MAX = 1.5;
/** Полоса цели перед уровнем, ATR; слияние целей (§6.3). */
export const TP_BAND_K = 0.5;
export const TP_MERGE_K = 0.5;

/** Параметры структуры для целей TP: внешний слой N = 5 (OB/FVG - из того же анализа). */
export const TARGET_STRUCTURE: StructureParams = { nExt: 5, nInt: null, sweepHoldK: 3, fvgMinAtr: 0.5, obDisplacementAtr: 1.2 };

const EPS_REL = 1e-6;

/** Цена прошла лимитную цену не менее чем на 1 тик (§20): касание ровно экстремумом не исполняет. */
export function limitFilled(c: Pick<Candle, 'high' | 'low'>, side: Side, limit: number, tick: number): boolean {
  return side === 'LONG' ? c.low <= limit - tick + tick * EPS_REL : c.high >= limit + tick - tick * EPS_REL;
}

/** То же для цены сделки (aggTrade). */
export function limitFilledByPrice(price: number, side: Side, limit: number, tick: number): boolean {
  return side === 'LONG' ? price <= limit - tick + tick * EPS_REL : price >= limit + tick - tick * EPS_REL;
}

// ------------------------------------------------------------------ лимитка

export type PlacementCode = 'LIMIT_FRONT_TOO_FAR' | 'LIMIT_DEEP_IN_ZONE' | 'LIMIT_AT_FAR_EDGE' | 'LIMIT_BEYOND_ZONE' | 'LIMIT_FAR_FROM_ZONE';

export interface Placement {
  /** Доля баллов: 1 - полный, 0.625 - 25 из 40, 0.25 - 10 из 40, 0. */
  level: 'full' | 'mid' | 'low' | 'zero';
  code: PlacementCode | null;
  /** Глубина в ATR: положительная внутрь зоны, отрицательная - опережение. */
  depth: number;
}

/** §5.3: полосы глубины лимитки dL относительно ближнего края; `h` - высота зоны в ATR. */
export function placementOf(side: Side, zone: Zone, A: number, L: number): Placement {
  const zn = nearEdge(zone, side);
  const long = side === 'LONG';
  const h = (zone.top - zone.bottom) / A;
  const at = (k: number) => (long ? zn - k * A : zn + k * A); // цена на глубине k
  const ge = (k: number) => (long ? L <= at(k) : L >= at(k)); // dL >= k
  const le = (k: number) => (long ? L >= at(k) : L <= at(k)); // dL <= k
  const depth = long ? (zn - L) / A : (L - zn) / A;
  if (ge(-0.3) && le(0.1)) return { level: 'full', code: null, depth };
  if (ge(-0.5) && !ge(-0.3)) return { level: 'mid', code: 'LIMIT_FRONT_TOO_FAR', depth };
  if (!le(0.1) && le(h / 2 + 0.1)) return { level: 'mid', code: 'LIMIT_DEEP_IN_ZONE', depth };
  if (!le(h / 2 + 0.1) && le(h + 0.1)) return { level: 'low', code: 'LIMIT_AT_FAR_EDGE', depth };
  if (!le(h + 0.1)) return { level: 'zero', code: 'LIMIT_BEYOND_ZONE', depth };
  return { level: 'zero', code: 'LIMIT_FAR_FROM_ZONE', depth };
}

/** Доля баллов placement по уровню. */
export const PLACEMENT_SHARE: Readonly<Record<Placement['level'], number>> = { full: 1, mid: 25 / 40, low: 10 / 40, zero: 0 };

/** Ожидаемая цена по заявленному типу (§5.3). */
export function expectedLimitPrice(side: Side, zone: Zone, A: number, type: LimitType, frontK: number | null): number {
  const zn = nearEdge(zone, side);
  if (type === 'near-edge') return zn;
  if (type === 'middle') return (zone.bottom + zone.top) / 2;
  if (type === 'far-edge') return side === 'LONG' ? zone.bottom : zone.top;
  const k = frontK ?? 0;
  return side === 'LONG' ? zn + k * A : zn - k * A;
}

export function limitTypeOk(side: Side, zone: Zone, A: number, L: number, type: LimitType, frontK: number | null): boolean {
  return Math.abs(L - expectedLimitPrice(side, zone, A, type, frontK)) <= 0.1 * A;
}

// ------------------------------------------------------------------ SL

export type SlCode = 'OK_SL_PLACEMENT' | 'SL_NO_BUFFER' | 'SL_TOO_WIDE' | 'SL_INSIDE_STRUCTURE';

/** Структурная точка Pl: LONG - min(Zf, low входа), SHORT - max(Zf, high входа). */
export function structurePoint(side: Side, zone: Zone, entryCandle?: Pick<Candle, 'high' | 'low'>): number {
  if (side === 'LONG') return entryCandle ? Math.min(zone.bottom, entryCandle.low) : zone.bottom;
  return entryCandle ? Math.max(zone.top, entryCandle.high) : zone.top;
}

/** Полоса SL, допустимая правилом: [Pl - 1.5A, Pl - 0.25A] (LONG) / [Pl + 0.25A, Pl + 1.5A] (SHORT). */
export function slBand(side: Side, Pl: number, A: number): [number, number] {
  return side === 'LONG' ? [Pl - SL_BUFFER_MAX * A, Pl - SL_BUFFER_MIN * A] : [Pl + SL_BUFFER_MIN * A, Pl + SL_BUFFER_MAX * A];
}

/** §6.2 (и §20 для Challenge): класс стопа относительно структурной точки. */
export function slClass(side: Side, sl: number, Pl: number, A: number): SlCode {
  const [lo, hi] = slBand(side, Pl, A);
  if (sl >= lo && sl <= hi) return 'OK_SL_PLACEMENT';
  if (side === 'LONG') {
    if (sl >= Pl) return 'SL_INSIDE_STRUCTURE';
    return sl > hi ? 'SL_NO_BUFFER' : 'SL_TOO_WIDE';
  }
  if (sl <= Pl) return 'SL_INSIDE_STRUCTURE';
  return sl < lo ? 'SL_NO_BUFFER' : 'SL_TOO_WIDE';
}

// ------------------------------------------------------------------ цели TP

export type TargetSource = 'level' | 'swing' | 'order-block' | 'fvg';
const SOURCE_ORDER: Record<TargetSource, number> = { level: 0, swing: 1, 'order-block': 2, fvg: 3 };

export interface Target {
  price: number;
  source: TargetSource;
  rrRef: number;
  allowed: boolean;
}

export interface TargetSet {
  targets: Target[];
  /** Индекс первой цели с RRref >= 2 (-1 - нет). */
  kStar: number;
  slRef: number;
  /** Цена структурной точки. */
  Pl: number;
}

/**
 * §6.3 + §20: цели за `Estar` (LONG - выше): ближний край встречных уровней `findLevels` (любой роли), живые внешние swing
 * (ликвидность), встречные fresh OB и open FVG; сортировка по удалённости от E, слияние 0.5*A; допустимы C1..C(k*+1).
 */
export function buildTargets(visible: readonly Candle[], side: Side, E: number, Estar: number, A: number, Pl: number): TargetSet {
  const long = side === 'LONG';
  const ahead = (p: number) => (long ? p > Estar : p < Estar);
  const raw: { price: number; source: TargetSource }[] = [];
  for (const l of findLevels(visible).levels) {
    const z = levelZone(l, A);
    const p = long ? z.bottom : z.top;
    if (ahead(p)) raw.push({ price: p, source: 'level' });
  }
  const st = analyzeStructure(visible, TARGET_STRUCTURE);
  const n = visible.length;
  for (const s of st.swings) {
    if (s.scope !== 'external' || s.type !== (long ? 'high' : 'low') || !ahead(s.price)) continue;
    let broken = false;
    for (let i = s.confirmedIndex + 1; i < n; i++) {
      if (long ? visible[i]!.close > s.price : visible[i]!.close < s.price) {
        broken = true;
        break;
      }
    }
    if (!broken) raw.push({ price: s.price, source: 'swing' });
  }
  for (const o of st.orderBlocks) {
    if (o.direction !== (long ? 'bear' : 'bull') || !o.valid || o.status !== 'fresh') continue;
    const p = long ? o.bottom : o.top;
    if (ahead(p)) raw.push({ price: p, source: 'order-block' });
  }
  for (const f of st.fvgs) {
    if (f.direction !== (long ? 'bear' : 'bull') || f.status !== 'open') continue;
    const p = long ? f.bottom : f.top;
    if (ahead(p)) raw.push({ price: p, source: 'fvg' });
  }
  const dist = (p: number) => (long ? p - E : E - p);
  raw.sort((a, b) => dist(a.price) - dist(b.price) || SOURCE_ORDER[a.source] - SOURCE_ORDER[b.source]);
  const kept: { price: number; source: TargetSource }[] = [];
  for (const c of raw) {
    const last = kept[kept.length - 1];
    if (last && Math.abs(c.price - last.price) < TP_MERGE_K * A) continue;
    kept.push(c);
  }
  const slRef = long ? Pl - SL_BUFFER_MIN * A : Pl + SL_BUFFER_MIN * A;
  const risk = Math.abs(E - slRef);
  const targets: Target[] = kept.map((c) => ({ price: c.price, source: c.source, rrRef: Math.abs(c.price - E) / risk, allowed: false }));
  const kStar = targets.findIndex((t) => t.rrRef >= 2);
  // нет цели на 2R (комбо: стоп и вход задаёт пользователь) - допустимы все цели; stop-take такие задания отбраковывает
  targets.forEach((t, i) => (t.allowed = kStar < 0 || i <= kStar + 1));
  return { targets, kStar, slRef, Pl };
}

export type TpCode = 'OK_TP_LEVEL' | 'TP_NOT_AT_LEVEL' | 'TP_BEYOND_TARGETS';

export interface TpClass {
  code: TpCode;
  /** Ближайшая допустимая цель к tp (для разбора) и последняя допустимая. */
  nearest: Target;
  last: Target;
  first: Target;
}

/** §6.3: tp в полосе допустимой цели - полный балл; вне полос, не дальше последней допустимой - частичный; дальше - 0. */
export function tpClass(side: Side, tp: number, set: TargetSet, A: number): TpClass | null {
  if (set.targets.length === 0) return null;
  const long = side === 'LONG';
  const allowed = set.targets.filter((t) => t.allowed);
  const first = set.kStar >= 0 ? set.targets[set.kStar]! : allowed[allowed.length - 1]!;
  const last = allowed[allowed.length - 1]!;
  const inBand = (t: Target) => (long ? tp >= t.price - TP_BAND_K * A && tp <= t.price : tp <= t.price + TP_BAND_K * A && tp >= t.price);
  let nearest = allowed[0]!;
  for (const t of allowed) if (Math.abs(t.price - tp) < Math.abs(nearest.price - tp)) nearest = t;
  if (allowed.some(inBand)) return { code: 'OK_TP_LEVEL', nearest: allowed.find(inBand)!, last, first };
  const beyond = long ? tp > last.price : tp < last.price;
  return { code: beyond ? 'TP_BEYOND_TARGETS' : 'TP_NOT_AT_LEVEL', nearest, last, first };
}

/** §6.4: RR = |tp - E| / |E - sl|. */
export const rrOf = (E: number, sl: number, tp: number): number => Math.abs(tp - E) / Math.abs(E - sl);
