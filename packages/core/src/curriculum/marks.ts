// Метки-подсказки и метки эталона ступеней 2-4 и комбо (CURRICULUM_STAGES.md §11.4): zone, hline, position.
import { detectSwings } from '../smc/swings';
import type { Candle, Mark, UtcMs } from '../types';
import type { Side, Zone, ZoneInfo } from './zone';

export function zoneMark(z: Zone, from: UtcMs, to: UtcMs, id: string, meta: Record<string, unknown> = {}): Mark {
  return {
    id,
    kind: 'zone',
    anchors: [
      { time: from, price: z.top },
      { time: to, price: z.bottom },
    ],
    scope: null,
    direction: null,
    meta,
    author: 'algo',
  };
}

export function zoneInfoMark(z: ZoneInfo, from: UtcMs, to: UtcMs, id: string, extra: Record<string, unknown> = {}): Mark {
  return zoneMark(z, from, to, id, { role: z.role, touches: z.touches, reactions: z.reactions, strength: z.strength, flip: z.flip, ...extra });
}

export function hlineMark(price: number, time: UtcMs, id: string, meta: Record<string, unknown>): Mark {
  return { id, kind: 'hline', anchors: [{ time, price }], scope: null, direction: null, meta, author: 'algo' };
}

export function positionMark(side: Side, time: UtcMs, entry: number, sl: number, tp: number, id: string, meta: Record<string, unknown> = {}): Mark {
  return {
    id,
    kind: 'position',
    anchors: [
      { time, price: entry },
      { time, price: sl },
      { time, price: tp },
    ],
    scope: null,
    direction: side === 'LONG' ? 'bull' : 'bear',
    meta: { side, sl, tp, ...meta },
    author: 'algo',
  };
}

/** Подсказки easy (ступень 2): swing N = 3 последних 300 свечей (§3.3). */
export function levelHints(visible: readonly Candle[]): Mark[] {
  const from = Math.max(0, visible.length - 300);
  return detectSwings(visible, { left: 3, right: 3 })
    .filter((s) => s.index >= from)
    .map((s) => ({
      id: `algo:swing:${s.type}:${s.time}`,
      kind: s.type === 'high' ? ('swing-high' as const) : ('swing-low' as const),
      anchors: [{ time: s.time, price: s.price }],
      scope: 'external' as const,
      direction: null,
      author: 'algo' as const,
    }));
}
