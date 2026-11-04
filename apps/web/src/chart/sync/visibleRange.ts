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
export function defaultLogicalRange(index: TimeIndex, bars = 120, rightPad = 8): LogicalRange {
  const n = index.length;
  return { from: Math.max(0, n - bars), to: n - 1 + rightPad };
}

/**
 * Сдвигает область (ширина сохраняется), чтобы метки у краёв не прилипали к границе графика:
 * от крайнего якоря до края остаётся не меньше `pad` свечей. Если метки шире окна, приоритет у левого края.
 */
export function padRangeForMarks(
  index: TimeIndex,
  r: LogicalRange,
  marks: readonly { anchors: readonly { time: number }[] }[],
  pad = 5,
): LogicalRange {
  const ls: number[] = [];
  for (const m of marks) for (const a of m.anchors) ls.push(index.timeToLogical(a.time));
  const finite = ls.filter((v) => Number.isFinite(v));
  if (finite.length === 0) return r;
  // метки вне окна не двигают его (окно задано снаружи осознанно): учитываем только попавшие в него или у самого края
  const near = finite.filter((v) => v >= r.from - pad && v <= r.to + pad);
  if (near.length === 0) return r;
  const nlo = Math.min(...near);
  const nhi = Math.max(...near);
  if (nlo < r.from + pad) {
    const d = r.from + pad - nlo;
    return { from: r.from - d, to: r.to - d };
  }
  if (nhi > r.to - pad) {
    const d = nhi - (r.to - pad);
    return { from: r.from + d, to: r.to + d };
  }
  return r;
}

/** Область той же ширины с центром в логической координате `center` (центрирование на времени/метке). */
export function centeredLogicalRange(r: LogicalRange, center: number): LogicalRange {
  const half = (r.to - r.from) / 2;
  return { from: center - half, to: center + half };
}
