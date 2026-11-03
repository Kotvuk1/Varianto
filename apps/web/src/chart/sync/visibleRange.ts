import type { TimeIndex } from '../geometry/timeIndex';

/** Область времени: центр и ширина в мс (UTC). Не зависит от ТФ. */
export interface TimeWindow {
  center: number;
  width: number;
}
export interface LogicalRange {
  from: number;
  to: number;
}

export function windowFromLogicalRange(index: TimeIndex, r: LogicalRange): TimeWindow {
  const a = index.logicalToTime(r.from);
  const b = index.logicalToTime(r.to);
  return { center: (a + b) / 2, width: b - a };
}

export function logicalRangeFromWindow(index: TimeIndex, w: TimeWindow): LogicalRange {
  return {
    from: index.timeToLogical(w.center - w.width / 2),
    to: index.timeToLogical(w.center + w.width / 2),
  };
}

/** Последние `bars` свечей + `rightPad` пустых баров справа. */
export function defaultLogicalRange(index: TimeIndex, bars = 120, rightPad = 5): LogicalRange {
  const n = index.length;
  return { from: Math.max(0, n - bars), to: n - 1 + rightPad };
}
