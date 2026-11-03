// Приведение метки к допустимой форме после перемещения/перетаскивания якоря: тот же набор правил, что при создании.
// Возвращает null, если в новом месте метка недопустима (например, нет разрыва для FVG) - правка отклоняется.
import type { Candle, Mark } from '@tl/core';
import type { TimeIndex } from '../geometry/timeIndex';
import { SWING_SIDE } from '../drawing/tools';
import { localExtremeIndex, resolveBreak, resolveFvg, resolveOb, resolveSweep } from './rules';

export function normalizeMark(mark: Mark, candles: readonly Candle[], index: TimeIndex): Mark | null {
  if (candles.length === 0) return mark;
  const idxOf = (t: number) => index.snapIndex(index.timeToLogical(t));
  const a = mark.anchors;
  const side = SWING_SIDE[mark.kind];
  if (side && a[0]) {
    const k = localExtremeIndex(candles, idxOf(a[0].time), side);
    const c = candles[k]!;
    return { ...mark, anchors: [{ time: c.openTime, price: side === 'high' ? c.high : c.low }] };
  }
  switch (mark.kind) {
    case 'bos':
    case 'choch': {
      if (a.length < 2) return mark;
      const s = mark.direction === 'bear' ? 'low' : 'high';
      const si = localExtremeIndex(candles, idxOf(a[0]!.time), s);
      const r = resolveBreak(candles, { index: si, side: s }, idxOf(a[1]!.time));
      return r.ok ? { ...mark, anchors: r.anchors, direction: r.direction } : null;
    }
    case 'fvg': {
      if (!a[0]) return mark;
      const r = resolveFvg(candles, idxOf(a[0].time) + 1);
      return r.ok ? { ...mark, anchors: r.anchors, direction: r.direction } : null;
    }
    case 'order-block': {
      if (!a[0]) return mark;
      const r = resolveOb(candles, idxOf(a[0].time));
      return { ...mark, anchors: r.anchors, direction: r.direction };
    }
    case 'sweep': {
      if (a.length < 2) return mark;
      const r = resolveSweep(candles, idxOf(a[1]!.time), mark.direction === 'bull' ? 'low' : 'high');
      return r.ok ? { ...mark, anchors: r.anchors, direction: r.direction } : null;
    }
    default:
      return mark;
  }
}
