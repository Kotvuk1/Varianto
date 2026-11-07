// Mark эталонных сеток Fibonacci (FIBONACCI.md §9.1): идентификаторы algo:fib-*:-:<dir>:<a.time>.
import type { Mark } from '../types';
import { FIB_EXTENSION_INFO, FIB_EXTENSION_TARGETS, FIB_OTE, FIB_RETRACEMENT_LEVELS, fibExtensionPrice, fibLevelPrice } from './levels';
import type { FibDirection, Impulse } from './types';

export const fibGridId = (dir: FibDirection, aTime: number): string => `algo:fib-retracement:-:${dir}:${aTime}`;
export const fibExtensionId = (dir: FibDirection, aTime: number): string => `algo:fib-extension:-:${dir}:${aTime}`;

/** Эталонная сетка retracement: anchors = [начало (уровень 1), конец (уровень 0)]. */
export function gridMark(imp: Pick<Impulse, 'direction' | 'a' | 'b' | 'event'>): Mark {
  const A = imp.a.price;
  const B = imp.b.price;
  return {
    id: fibGridId(imp.direction, imp.a.time),
    kind: 'fib-retracement',
    anchors: [
      { time: imp.a.time, price: A },
      { time: imp.b.time, price: B },
    ],
    scope: null,
    direction: imp.direction,
    meta: {
      levels: FIB_RETRACEMENT_LEVELS.map((ratio) => ({ ratio, price: fibLevelPrice(A, B, ratio) })),
      ote: { from: fibLevelPrice(A, B, FIB_OTE.from), to: fibLevelPrice(A, B, FIB_OTE.to) },
      eq: fibLevelPrice(A, B, 0.5),
      eventKind: imp.event.kind,
      eventTime: imp.event.breakTime,
    },
    author: 'algo',
  };
}

/** Эталонный extension A-B-C: цели 1.0/1.272/1.618 и справочно 2.0. */
export function extensionMark(imp: Pick<Impulse, 'direction' | 'a' | 'b'>, c: { time: number; price: number }): Mark {
  const [A, B, C] = [imp.a.price, imp.b.price, c.price];
  return {
    id: fibExtensionId(imp.direction, imp.a.time),
    kind: 'fib-extension',
    anchors: [
      { time: imp.a.time, price: A },
      { time: imp.b.time, price: B },
      { time: c.time, price: C },
    ],
    scope: null,
    direction: imp.direction,
    meta: {
      targets: FIB_EXTENSION_TARGETS.map((ratio) => ({ ratio, price: fibExtensionPrice(A, B, C, ratio) })),
      info: { ratio: FIB_EXTENSION_INFO[0], price: fibExtensionPrice(A, B, C, FIB_EXTENSION_INFO[0]) },
    },
    author: 'algo',
  };
}

/**
 * Подсказки easy для «Где реакция?»: EQ (hline, meta.role 'eq'), зона OTE и заливка premium/discount (kind 'level',
 * 2 якоря - прямоугольник [from..to] по времени, meta.role + границы цен).
 */
export function reactionHints(imp: Pick<Impulse, 'direction' | 'a' | 'b'>, toTime: number): Mark[] {
  const [A, B] = [imp.a.price, imp.b.price];
  const eq = fibLevelPrice(A, B, 0.5);
  const o1 = fibLevelPrice(A, B, FIB_OTE.from);
  const o2 = fibLevelPrice(A, B, FIB_OTE.to);
  const hi = Math.max(A, B);
  const lo = Math.min(A, B);
  const zone = (id: string, role: string, top: number, bottom: number): Mark => ({
    id,
    kind: 'level',
    anchors: [
      { time: imp.a.time, price: top },
      { time: toTime, price: bottom },
    ],
    scope: null,
    direction: null,
    meta: { role, top, bottom },
    author: 'algo',
  });
  return [
    { id: 'hint:eq', kind: 'hline', anchors: [{ time: imp.b.time, price: eq }], scope: null, direction: null, meta: { role: 'eq', price: eq }, author: 'algo' },
    zone('hint:ote', 'ote', Math.max(o1, o2), Math.min(o1, o2)),
    zone('hint:premium', 'premium', hi, eq),
    zone('hint:discount', 'discount', eq, lo),
  ];
}
