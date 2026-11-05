// Помощники тестов Elliott. Только для тестов.
import type { Anchor, Candle, Mark, TaskTimeframe } from '../types';
import { ewIndexAt } from '../testing/elliott';
import { atrOf } from './check';
import { buildEwRef, ewLimit, type EwRef } from './ref';
import type { EwCorrectionType, EwDirection, EwTaskKind } from './types';

export type Pt = [string, 'low' | 'high'];

/** Якоря по ISO-времени свечи и стороне (реальные цены свечей). */
export function anchorsAt(c: readonly Candle[], list: readonly Pt[]): Anchor[] {
  return list.map(([t, s]) => {
    const i = ewIndexAt(c as Candle[], t);
    return { time: c[i]!.openTime, price: c[i]![s] };
  });
}

export const userMark = (c: readonly Candle[], kind: 'ew-impulse' | 'ew-zigzag' | 'ew-flat', list: readonly Pt[], id = `u-${kind}`): Mark => ({
  id, kind, anchors: anchorsAt(c, list), scope: null, direction: null, author: 'user',
});

export function makeRef(
  c: Candle[],
  tf: TaskTimeframe,
  p: { kind: EwTaskKind; nPivot: number; T: string; windowFrom: number | string; dir: EwDirection; type?: EwCorrectionType | null; points: readonly Pt[] },
): { ref: EwRef; visible: Candle[]; future: Candle[] } {
  const iT = ewIndexAt(c, p.T);
  const visible = c.slice(0, iT + 1);
  const future = c.slice(iT + 1, iT + 1 + ewLimit(tf));
  const times = anchorsAt(c, p.points).map((a) => a.time);
  const fromIdx = typeof p.windowFrom === 'number' ? p.windowFrom : ewIndexAt(c, p.windowFrom);
  const last = times[times.length - 1]!;
  const ref = buildEwRef(visible, {
    kind: p.kind, tf, nPivot: p.nPivot, nPoint: 5,
    window: { fromTime: visible[fromIdx]!.openTime, toTime: visible[iT]!.openTime },
    lastPivot: { index: visible.findIndex((x) => x.openTime === last), time: last },
    refCount: { times, type: p.type ?? null, dir: p.dir },
    invTol: 0.25 * atrOf(visible)[iT]!,
  });
  if (!ref) throw new Error('makeRef: эталон не построен');
  return { ref, visible, future };
}
