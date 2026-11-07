// Зона уровня, сила и ранжирование (CURRICULUM_STAGES.md §3.1-§3.3). Чистые функции, без DOM/Node API.
import { findLevels, inLevelZone, type Level } from '../pa/levels';
import { atr14, closedOnly } from '../smc/series';
import type { Candle, UtcMs } from '../types';

export type LevelRole = 'support' | 'resistance';
import type { Side } from '../challenge/facts';
export type { Side };

/** Роль уровня по стороне сделки: LONG - от поддержки, SHORT - от сопротивления. */
export const roleOfSide = (side: Side): LevelRole => (side === 'LONG' ? 'support' : 'resistance');
export const sideOfRole = (role: LevelRole): Side => (role === 'support' ? 'LONG' : 'SHORT');

export interface Zone {
  bottom: number;
  top: number;
}

/** §3.1: разброс экстремумов swing кластера, не ниже 0.2*A (минимальная высота). */
export function levelZone(l: Pick<Level, 'low' | 'high' | 'center'>, A: number): Zone {
  const hMin = 0.2 * A;
  if (l.high - l.low >= hMin) return { bottom: l.low, top: l.high };
  return { bottom: Math.min(l.low, l.center - hMin / 2), top: Math.max(l.high, l.center + hMin / 2) };
}

/** Ближний/дальний край зоны для стороны сделки (§1.3). */
export const nearEdge = (z: Zone, side: Side): number => (side === 'LONG' ? z.top : z.bottom);
export const farEdge = (z: Zone, side: Side): number => (side === 'LONG' ? z.bottom : z.top);

export interface ZoneInfo extends Zone {
  role: LevelRole | 'inside';
  center: number;
  touches: number;
  reactions: number;
  strength: number;
  flip: boolean;
  lastTouchTime: UtcMs;
}

export interface ZoneCand extends ZoneInfo {
  level: Level;
  lastTouchIndex: number;
  /** Расстояние от цены до ближнего края в ATR: (P - Zt)/A для поддержки, (Zb - P)/A для сопротивления; Infinity для inside. */
  dist: number;
  recency: number;
  htf: number;
}

export interface ZoneSet {
  zones: ZoneCand[];
  A: number;
  P: number;
  /** Индекс последней видимой свечи. */
  last: number;
}

/** Порог реакции касания и окно, §3.2. */
const REACTION_ATR = 2;
const REACTION_WINDOW = 10;

function recencyOf(age: number): number {
  return age <= 50 ? 1 : age <= 150 ? 0.5 : 0;
}

/**
 * Зоны всех уровней `findLevels` видимого ряда с силой (§3.2). `htf` - закрытые к T свечи старшего ТФ (null для 1d).
 * null - ATR14 не определён или равен 0.
 */
export function computeZones(input: readonly Candle[], htf: readonly Candle[] | null): ZoneSet | null {
  const candles = closedOnly(input);
  const n = candles.length;
  if (n === 0) return null;
  const atr = atr14(candles);
  const A = atr[n - 1];
  if (A === null || A === undefined || !(A > 0)) return null;
  const P = candles[n - 1]!.close;
  const htfLevels = htf && htf.length > 0 ? findLevels(closedOnly(htf)).levels : [];
  const zones: ZoneCand[] = findLevels(candles).levels.map((l) => {
    let reactions = 0;
    for (const s of l.swings) {
      const a = atr[s.index];
      if (a === null || a === undefined) continue;
      const end = Math.min(s.index + REACTION_WINDOW, n - 1);
      let move = 0;
      for (let j = s.index + 1; j <= end; j++) {
        const c = candles[j]!;
        move = Math.max(move, s.type === 'low' ? c.high - s.price : s.price - c.low);
      }
      if (s.index < end && move >= REACTION_ATR * a) reactions++;
    }
    const recency = recencyOf(n - 1 - l.lastTouchIndex);
    const htfHit = htfLevels.some((h) => inLevelZone(l.center, h)) ? 1 : 0;
    const z = levelZone(l, A);
    const dist = l.type === 'support' ? (P - z.top) / A : l.type === 'resistance' ? (z.bottom - P) / A : Number.POSITIVE_INFINITY;
    return {
      ...z,
      role: l.type,
      center: l.center,
      touches: l.touches,
      reactions,
      strength: l.touches + 0.5 * reactions + recency + htfHit,
      flip: l.swings.some((s) => s.type === 'high') && l.swings.some((s) => s.type === 'low'),
      lastTouchTime: candles[l.lastTouchIndex]!.openTime,
      level: l,
      lastTouchIndex: l.lastTouchIndex,
      dist,
      recency,
      htf: htfHit,
    };
  });
  return { zones, A, P, last: n - 1 };
}

/** §3.2: сила по убыванию, затем касания, свежесть последнего касания, близость к цене. */
export function rankStrength<T extends ZoneCand>(zones: readonly T[], P: number): T[] {
  return [...zones].sort(
    (a, b) =>
      b.strength - a.strength ||
      b.touches - a.touches ||
      b.lastTouchIndex - a.lastTouchIndex ||
      Math.abs(a.center - P) - Math.abs(b.center - P),
  );
}

/** Кандидаты задания: роль `role` (null - обе), 0 <= dist <= maxDist, по рангу силы. */
export function candidateZones(set: ZoneSet, role: LevelRole | null, maxDist: number): ZoneCand[] {
  return rankStrength(
    set.zones.filter((z) => z.role !== 'inside' && (role === null || z.role === role) && z.dist >= 0 && z.dist <= maxDist),
    set.P,
  );
}

export interface ZoneReference {
  ref: ZoneCand;
  second: ZoneCand | null;
}

/** §3.3: однозначный эталон - касаний не меньше `minTouches` и отрыв силы от второго не меньше 1. */
export function pickZoneReference(cands: readonly ZoneCand[], minTouches: number): ZoneReference | null {
  const ref = cands[0];
  if (!ref || ref.touches < minTouches) return null;
  const second = cands[1] ?? null;
  if (second && !(ref.strength >= second.strength + 1)) return null;
  return { ref, second };
}

export function zoneInfo(z: ZoneCand): ZoneInfo {
  return {
    bottom: z.bottom,
    top: z.top,
    role: z.role,
    center: z.center,
    touches: z.touches,
    reactions: z.reactions,
    strength: z.strength,
    flip: z.flip,
    lastTouchTime: z.lastTouchTime,
  };
}

/** Доля зоны `l`, перекрытая интервалом [ub, ut]. */
export function zoneShare(ub: number, ut: number, z: Zone): number {
  const h = z.top - z.bottom;
  if (!(h > 0)) return 0;
  return Math.max(0, Math.min(ut, z.top) - Math.max(ub, z.bottom)) / h;
}
