// Отображение реального времени на скрытую шкалу задания (relative-режим): сдвиг свечей, меток и числовых полей-времён.
import { isTimeParam, type Candle, type Mark } from '@tl/core';

export function shiftCandle(c: Candle, shift: number): Candle {
  return { ...c, openTime: c.openTime - shift, closeTime: c.closeTime - shift };
}

const TIME_META = ['confirmedTime', 'eventTime', 'middleTime', 'originTime'];
/** Метка на шкале задания; id заменяется (исходные id содержат реальное время). */
export function shiftMark(m: Mark, shift: number, id: string): Mark {
  const meta = m.meta ? { ...m.meta } : undefined;
  if (meta) for (const k of TIME_META) if (typeof meta[k] === 'number') meta[k] = (meta[k] as number) - shift;
  return { ...m, id, anchors: m.anchors.map((a) => ({ ...a, time: a.time - shift })), ...(meta ? { meta } : {}) };
}

/** Сдвигает числовые поля-времена (`time`, `*Time`) на -shift: отображение на шкалу задания. */
export function shiftTimes<T>(x: T, shift: number): T {
  if (shift === 0) return x;
  if (Array.isArray(x)) return x.map((v) => shiftTimes(v, shift)) as T;
  if (x && typeof x === 'object') {
    return Object.fromEntries(
      Object.entries(x).map(([k, v]) => [k, typeof v === 'number' && isTimeParam(k) ? v - shift : shiftTimes(v, shift)]),
    ) as T;
  }
  return x;
}

