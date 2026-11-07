// Общий детектор реакции у зоны (CURRICULUM_STAGES.md §4): resolveZoneReaction и resolveZoneChain.
import type { Candle } from '../types';
import { farEdge, nearEdge, type Side, type Zone } from './zone';

/** Зона подхода перед ближним краем и порог реакции от экстремума, в ATR (§4.1). */
export const BAND_K = 0.5;
export const THR_K = 1.5;

export interface ZoneReaction {
  kind: 'reaction' | 'break' | 'no-touch' | 'timeout';
  /** Индекс первой свечи в зоне подхода (-1 - не было). */
  t0: number;
  /** Экстремум захода (LONG - минимум low, SHORT - максимум high). */
  m: number;
  mIndex: number;
  /** Индекс свечи исхода (для timeout/no-touch - T + limit). */
  e: number;
  /** Ряд короче T + limit и исход не наступил. */
  incomplete: boolean;
}

/**
 * §4.1. `c` - ряд с будущим, `T` - индекс последней видимой свечи. На свече: вход в зону подхода -> экстремум -> пробой
 * (закрытие за дальним краем) -> реакция (закрытие не менее чем на 1.5*A от экстремума).
 */
export function resolveZoneReaction(c: readonly Candle[], T: number, z: Zone, side: Side, A: number, limit: number): ZoneReaction {
  const long = side === 'LONG';
  const zn = nearEdge(z, side);
  const zf = farEdge(z, side);
  const band = long ? zn + BAND_K * A : zn - BAND_K * A;
  const thr = THR_K * A;
  let t0 = -1;
  let m = long ? Infinity : -Infinity;
  let mIndex = -1;
  const end = Math.min(T + limit, c.length - 1);
  for (let j = T + 1; j <= end; j++) {
    const x = c[j]!;
    if (t0 < 0) {
      if (long ? x.low <= band : x.high >= band) {
        t0 = j;
        m = long ? x.low : x.high;
        mIndex = j;
      } else continue;
    } else if (long ? x.low < m : x.high > m) {
      m = long ? x.low : x.high;
      mIndex = j;
    }
    if (long ? x.close < zf : x.close > zf) return { kind: 'break', t0, m, mIndex, e: j, incomplete: false };
    if (long ? x.close >= m + thr : x.close <= m - thr) return { kind: 'reaction', t0, m, mIndex, e: j, incomplete: false };
  }
  return { kind: t0 < 0 ? 'no-touch' : 'timeout', t0, m, mIndex, e: T + limit, incomplete: end < T + limit };
}

export interface ZoneChainResult {
  /** reaction - реакция зоны `k`; none - пробиты все зоны; no-touch/timeout - отбраковка. */
  kind: 'reaction' | 'none' | 'no-touch' | 'timeout';
  /** Индекс зоны с реакцией; K при `none`; индекс текущей зоны при отбраковке. */
  k: number;
  t0: number;
  m: number;
  mIndex: number;
  e: number;
  broken: { k: number; index: number }[];
  incomplete: boolean;
}

/** §4.2: несколько зон по близости к цене (первая - ближайшая); одна свеча может пробить несколько зон. */
export function resolveZoneChain(c: readonly Candle[], T: number, zones: readonly Zone[], side: Side, A: number, limit: number): ZoneChainResult {
  const long = side === 'LONG';
  const thr = THR_K * A;
  const broken: { k: number; index: number }[] = [];
  let k = 0;
  let t0 = -1;
  let m = long ? Infinity : -Infinity;
  let mIndex = -1;
  const end = Math.min(T + limit, c.length - 1);
  for (let j = T + 1; j <= end; j++) {
    const x = c[j]!;
    while (k < zones.length) {
      const z = zones[k]!;
      const band = long ? nearEdge(z, side) + BAND_K * A : nearEdge(z, side) - BAND_K * A;
      if (t0 < 0) {
        if (long ? x.low <= band : x.high >= band) {
          t0 = j;
          m = long ? x.low : x.high;
          mIndex = j;
        } else break;
      } else if (long ? x.low < m : x.high > m) {
        m = long ? x.low : x.high;
        mIndex = j;
      }
      if (long ? x.close < farEdge(z, side) : x.close > farEdge(z, side)) {
        broken.push({ k, index: j });
        k++;
        t0 = -1;
        m = long ? Infinity : -Infinity;
        mIndex = -1;
        continue; // та же свеча проверяется для следующей зоны
      }
      if (long ? x.close >= m + thr : x.close <= m - thr) {
        return { kind: 'reaction', k, t0, m, mIndex, e: j, broken, incomplete: false };
      }
      break;
    }
    if (k >= zones.length) {
      return { kind: 'none', k, t0: -1, m, mIndex, e: broken[broken.length - 1]!.index, broken, incomplete: false };
    }
  }
  return { kind: t0 < 0 ? 'no-touch' : 'timeout', k, t0, m, mIndex, e: T + limit, broken, incomplete: end < T + limit };
}
