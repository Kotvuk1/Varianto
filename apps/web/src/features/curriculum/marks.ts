// Построение меток и расчёты ступеней 3-4 и комбо на клиенте (только отображение и проверка сторон; оценка - на сервере).
import type { Mark } from '@tl/core';
import type { ReplayMarker } from '@/chart/replay/markers';
import type { TradeSide, ZoneInfoDto } from '../session/types';

export const POS_ID = 'cur-position';

export function zoneMarkOf(z: { top: number; bottom: number }, time: number, id: string, meta?: Record<string, unknown>): Mark {
  return { id, kind: 'zone', anchors: [{ time, price: z.top }, { time, price: z.bottom }], scope: null, direction: null, author: 'algo', ...(meta ? { meta } : {}) };
}

export const zoneInfoMarkOf = (z: ZoneInfoDto, id = 'given-zone'): Mark =>
  zoneMarkOf(z, z.lastTouchTime, id, { zoneType: z.role === 'inside' ? 'flip' : z.role, strength: z.strength });

/** Позиция со входом, зафиксированным заданием: двигаются только SL и TP. */
export function positionOf(time: number, entry: number, sl: number, tp: number): Mark {
  return { id: POS_ID, kind: 'position', anchors: [{ time, price: entry }, { time, price: sl }, { time, price: tp }], scope: null, direction: null, author: 'user', meta: { entry, sl, tp, entryLocked: true } };
}

/** SL/TP по умолчанию: 1 ATR против и 2 ATR по направлению сделки (как в Challenge). */
export function defaultSlTp(side: TradeSide, entry: number, atr: number): { sl: number; tp: number } {
  const d = side === 'LONG' ? 1 : -1;
  return { sl: entry - d * atr, tp: entry + d * 2 * atr };
}

/** Сторона по положению зоны относительно цены (hard комбо: сторону задаёт зона). */
export const sideOfZone = (zone: { top: number; bottom: number }, price: number): TradeSide => ((zone.top + zone.bottom) / 2 < price ? 'LONG' : 'SHORT');

export type PlanIssue = 'limit-side' | 'sl-side' | 'tp-side';

/**
 * Те же правила сторон, что LIMIT_WRONG_SIDE / SL_WRONG_SIDE / TP_WRONG_SIDE на сервере.
 * slBound/tpBound: LONG - sl строго ниже slBound, tp строго выше tpBound (лимитка/вход или min/max входа и закрытия).
 */
export function planIssue(side: TradeSide, last: number, limit: number | null, slBound: number, tpBound: number, sl: number, tp: number): PlanIssue | null {
  const long = side === 'LONG';
  if (limit !== null && (long ? limit >= last : limit <= last)) return 'limit-side';
  if (long ? sl >= slBound : sl <= slBound) return 'sl-side';
  if (long ? tp <= tpBound : tp >= tpBound) return 'tp-side';
  return null;
}

/** Полоса цен «полный балл» лимитки (§5.3): от 0,3 ATR перед ближним краем до 0,1 ATR внутрь зоны. */
export function fullScoreBand(zone: { top: number; bottom: number }, side: TradeSide, atr: number): { from: number; to: number } {
  return side === 'LONG' ? { from: zone.top - 0.1 * atr, to: zone.top + 0.3 * atr } : { from: zone.bottom - 0.3 * atr, to: zone.bottom + 0.1 * atr };
}

/** Структурная точка стопа (§6.2): дальний край зоны или фитиль свечи входа, если он глубже. */
export function structurePoint(zone: { top: number; bottom: number }, side: TradeSide, last: { high: number; low: number }): number {
  return side === 'LONG' ? Math.min(zone.bottom, last.low) : Math.max(zone.top, last.high);
}

export const hasMarker = (m: ReplayMarker[], kind: ReplayMarker['kind']) => m.some((x) => x.kind === kind);
