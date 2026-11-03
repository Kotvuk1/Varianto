/** Область времени, оцениваемая в задании: свечи с openTime в [fromTime, toTime]. */
export interface HighlightRange {
  fromTime: number;
  toTime: number;
}

/**
 * Полосы затемнения вне окна по оси X (CSS px панели). x1/x2 - центры первой и последней свечи окна,
 * spacing - расстояние между свечами. Пустой результат - окно занимает всю панель.
 */
export function dimSpans(x1: number, x2: number, spacing: number, width: number): { x1: number; x2: number }[] {
  const left = x1 - spacing / 2;
  const right = x2 + spacing / 2;
  const out: { x1: number; x2: number }[] = [];
  if (left > 0) out.push({ x1: 0, x2: Math.min(left, width) });
  if (right < width) out.push({ x1: Math.max(right, 0), x2: width });
  return out;
}
