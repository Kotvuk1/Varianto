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

/** Подсветка свечи (модели) колонкой за свечой. focus - основная свеча модели, ref - опорная. */
export interface CandleHighlight {
  time: number;
  tone: 'focus' | 'ref';
  /** Подпись над high свечи (например, «Pin bar»). */
  label?: string;
}

export interface HighlightColumn {
  x1: number;
  x2: number;
  /** Центр свечи по X. */
  cx: number;
  tone: CandleHighlight['tone'];
  time: number;
  label?: string;
}

/** Колонки подсветки в CSS px панели: ширина = шаг свечей (не уже 6 px), невидимые отбрасываются. */
export function highlightColumns(
  items: readonly CandleHighlight[],
  timeToX: (t: number) => number,
  spacing: number,
  width: number,
): HighlightColumn[] {
  const out: HighlightColumn[] = [];
  const half = Math.max(3, spacing / 2);
  for (const it of items) {
    const cx = timeToX(it.time);
    if (!Number.isFinite(cx) || cx + half < 0 || cx - half > width) continue;
    out.push({ x1: cx - half, x2: cx + half, cx, tone: it.tone, time: it.time, ...(it.label ? { label: it.label } : {}) });
  }
  return out;
}

/**
 * Положение подписи (верх, px): над high; если места сверху нет - под low. Подпись не перекрывает тело/фитиль.
 * yHigh/yLow - координаты в px (yHigh < yLow).
 */
export function labelTop(yHigh: number, yLow: number, boxH: number, height: number, gap = 6): number {
  const above = yHigh - gap - boxH;
  if (above >= 2) return above;
  return Math.min(yLow + gap, Math.max(2, height - boxH - 2));
}
