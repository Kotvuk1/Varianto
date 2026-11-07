import { TIMEFRAME_MS, type Mark, type TaskTimeframe } from '@tl/core';
import type { CandleHighlight } from '@/chart/TradingChart';

/** Колонки подсветки для свечей модели (метка pattern: от первой до последней свечи по якорям). */
export function patternHighlights(marks: readonly Mark[], tf: TaskTimeframe, tone: CandleHighlight['tone'], label?: string): CandleHighlight[] {
  const step = TIMEFRAME_MS[tf];
  const out: CandleHighlight[] = [];
  for (const m of marks) {
    if (m.kind !== 'pattern' || m.anchors.length === 0) continue;
    const times = m.anchors.map((a) => a.time);
    const from = Math.floor(Math.min(...times) / step) * step;
    const to = Math.floor(Math.max(...times) / step) * step;
    for (let t = from; t <= to; t += step) out.push({ time: t, tone, ...(label && t === to ? { label } : {}) });
  }
  return out;
}
