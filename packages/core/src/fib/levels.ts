// Формулы Fibonacci (FIBONACCI.md §2). Без округления: цены - по формулам в указанном порядке операций.

export type FibDirection = 'bull' | 'bear';

export const FIB_RETRACEMENT_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.705, 0.786, 1] as const;
/** Optimal trade entry: глубина коррекции [0.62, 0.79], границы включительно. */
export const FIB_OTE = { from: 0.62, to: 0.79 } as const;
export const FIB_EXTENSION_TARGETS = [1, 1.272, 1.618] as const;
/** Справочный уровень extension: не вариант ответа и не оценивается. */
export const FIB_EXTENSION_INFO = [2] as const;

/** Цена уровня r: уровень 0 на B (конец импульса), уровень 1 на A (начало). */
export function fibLevelPrice(A: number, B: number, r: number): number {
  return B + r * (A - B);
}

/** Глубина коррекции в долях импульса: 0 = B, 1 = A, > 1 - за точкой A. */
export function fibDepth(A: number, B: number, price: number): number {
  return (B - price) / (B - A);
}

/** Цель extension x от точки C: C + x*(B - A); для импульса вниз (B - A) < 0, цели ниже C. */
export function fibExtensionPrice(A: number, B: number, C: number, x: number): number {
  return C + x * (B - A);
}

/** Premium выше equilibrium (уровень 0.5), discount ниже - абсолютно, независимо от направления импульса. */
export function pdZone(A: number, B: number, price: number): 'premium' | 'discount' | 'equilibrium' {
  const eq = fibLevelPrice(A, B, 0.5);
  return price > eq ? 'premium' : price < eq ? 'discount' : 'equilibrium';
}
