// Чистая математика Fibonacci (docs/specs/FIBONACCI.md §2). Цены не округляются: округление - только при показе.
// TODO(core): когда packages/core экспортирует fibLevelPrice/fibDepth/fibExtensionPrice/pdZone - реэкспортировать оттуда.

export type FibDirection = 'bull' | 'bear';

export const FIB_RETRACEMENT_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.705, 0.786, 1] as const;
export const FIB_OTE = { from: 0.62, to: 0.79 } as const;
export const FIB_EXTENSION_TARGETS = [1, 1.272, 1.618] as const;
export const FIB_EXTENSION_INFO = [2] as const;

/** B + r*(A-B): уровень 0 на B (конец импульса), уровень 1 на A (начало). */
export const fibLevelPrice = (A: number, B: number, r: number): number => B + r * (A - B);
/** (B-price)/(B-A): глубина коррекции в долях импульса. */
export const fibDepth = (A: number, B: number, price: number): number => (B - price) / (B - A);
/** C + x*(B-A): для bear (B-A)<0, цели ниже C. */
export const fibExtensionPrice = (A: number, B: number, C: number, x: number): number => C + x * (B - A);

export function pdZone(A: number, B: number, price: number): 'premium' | 'discount' | 'equilibrium' {
  const eq = fibLevelPrice(A, B, 0.5);
  return price > eq ? 'premium' : price < eq ? 'discount' : 'equilibrium';
}

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
