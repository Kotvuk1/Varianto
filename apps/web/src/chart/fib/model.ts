// Формулы Fibonacci живут в @tl/core (FIBONACCI.md §2); здесь только отрисовочные надстройки.
import { FIB_EXTENSION_INFO, FIB_EXTENSION_TARGETS, FIB_OTE, FIB_RETRACEMENT_LEVELS, fibDepth, fibExtensionPrice, fibLevelPrice, pdZone, type FibDirection } from '@tl/core';

export { FIB_EXTENSION_INFO, FIB_EXTENSION_TARGETS, FIB_OTE, FIB_RETRACEMENT_LEVELS, fibDepth, fibExtensionPrice, fibLevelPrice, pdZone, type FibDirection };

export const fibDirection = (A: number, B: number): FibDirection | null => (B > A ? 'bull' : B < A ? 'bear' : null);

export interface FibLevel {
  ratio: number;
  price: number;
  /** Справочный уровень (Extension 2.0): тонкий, не вариант ответа. */
  info: boolean;
}

export const retracementLevels = (A: number, B: number): FibLevel[] =>
  FIB_RETRACEMENT_LEVELS.map((ratio) => ({ ratio, price: fibLevelPrice(A, B, ratio), info: false }));

export const extensionLevels = (A: number, B: number, C: number): FibLevel[] => [
  ...FIB_EXTENSION_TARGETS.map((ratio) => ({ ratio, price: fibExtensionPrice(A, B, C, ratio), info: false })),
  ...FIB_EXTENSION_INFO.map((ratio) => ({ ratio, price: fibExtensionPrice(A, B, C, ratio), info: true })),
];

/** Границы зоны OTE в ценах (from - у уровня 0.62, to - у 0.79). */
export const oteRange = (A: number, B: number): { from: number; to: number } => ({
  from: fibLevelPrice(A, B, FIB_OTE.from),
  to: fibLevelPrice(A, B, FIB_OTE.to),
});

/** Приоритет подписи при нехватке места: ключевые уровни остаются. */
export const labelPriority = (ratio: number): number =>
  ratio === 0.5 ? 0 : ratio === 0 || ratio === 1 ? 1 : ratio === 0.618 ? 2 : ratio === 0.786 || ratio === 0.382 ? 3 : 4;

/** Какие подписи оставить, чтобы они не слипались по вертикали (меньший priority побеждает). */
export function thinLabels(items: readonly { key: string; y: number; priority: number }[], minGap: number): Set<string> {
  const kept: { y: number }[] = [];
  const out = new Set<string>();
  for (const it of [...items].sort((a, b) => a.priority - b.priority)) {
    if (kept.every((k) => Math.abs(k.y - it.y) >= minGap)) {
      kept.push(it);
      out.add(it.key);
    }
  }
  return out;
}

export const FIB_KINDS = ['fib-retracement', 'fib-extension'] as const;
export type FibKind = (typeof FIB_KINDS)[number];
export const isFibKind = (k: string): k is FibKind => k === 'fib-retracement' || k === 'fib-extension';
