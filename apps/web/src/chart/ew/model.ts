// Разметка Elliott на графике: типы меток, подписи точек, чередование сторон экстремумов (ELLIOTT.md §2.1).
import type { Anchor, Candle } from '@tl/core';
import { localExtremeIndex } from '../smc/rules';

export const EW_KINDS = ['ew-impulse', 'ew-zigzag', 'ew-flat'] as const;
export type EwKind = (typeof EW_KINDS)[number];
export const isEwKind = (k: string): k is EwKind => (EW_KINDS as readonly string[]).includes(k);

export const EW_IMPULSE_LABELS = ['0', '1', '2', '3', '4', '5'] as const;
export const EW_CORRECTION_LABELS = ['A', 'B', 'C'] as const;
/** Допустимое число точек готового импульса (3 - 0..2, 5 - 0..4, 6 - 0..5). */
export const EW_IMPULSE_SIZES = [3, 5, 6] as const;
export const EW_INVALIDATION_ROLE = 'ew-invalidation';

export const ewLabels = (kind: EwKind, n: number, meta?: Record<string, unknown>): string[] => {
  const given = meta?.['labels'];
  const base: readonly string[] = kind === 'ew-impulse' ? EW_IMPULSE_LABELS : EW_CORRECTION_LABELS;
  const fromMeta = Array.isArray(given) ? given.map(String) : [];
  return Array.from({ length: n }, (_, i) => fromMeta[i] ?? base[i] ?? String(i));
};

export type Side = 'high' | 'low';
const other = (s: Side): Side => (s === 'high' ? 'low' : 'high');
/** Сторона точки k: чередуется от стороны точки 0 (для импульса вверх: 0 low, 1 high, 2 low ...). */
export const sideAt = (first: Side, k: number): Side => (k % 2 === 0 ? first : other(first));

/** Сторона первой точки по двум первым: вторая выше первой - первая low. */
export const firstSideOf = (a0: Anchor, a1: Anchor): Side => (a1.price >= a0.price ? 'low' : 'high');

/** Привязка к экстремуму нужной стороны в радиусе swing-снапа. */
export function snapExtreme(candles: readonly Candle[], i: number, side: Side): Anchor {
  const k = localExtremeIndex(candles, i, side);
  const c = candles[k]!;
  return { time: c.openTime, price: side === 'high' ? c.high : c.low };
}

export const ewDirection = (anchors: readonly Anchor[]): 'bull' | 'bear' | null =>
  anchors.length < 2 ? null : anchors[1]!.price > anchors[0]!.price ? 'bull' : anchors[1]!.price < anchors[0]!.price ? 'bear' : null;

/** Время строго возрастает. */
export const timesAscending = (anchors: readonly Anchor[]): boolean => anchors.every((a, i) => i === 0 || a.time > anchors[i - 1]!.time);
