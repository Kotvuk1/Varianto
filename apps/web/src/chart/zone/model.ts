// Модель инструментов уровней: зона уровня, лимитный ордер, позиция ступени 4 (CURRICULUM_STAGES §3, §5, §6).
import type { Anchor, Mark } from '@tl/core';

export type LimitSide = 'buy' | 'sell';
export type ZoneType = 'support' | 'resistance' | 'flip';

export const isLimitMark = (m: Pick<Mark, 'kind' | 'meta'>): boolean => m.kind === 'hline' && m.meta?.['role'] === 'limit';
export const isZoneMark = (m: Pick<Mark, 'kind'>): boolean => (m.kind as string) === 'zone';
/** Позиция, у которой вход зафиксирован заданием (двигаются только SL и TP). */
export const isEntryLocked = (m: Pick<Mark, 'kind' | 'meta'>): boolean => m.kind === 'position' && m.meta?.['entryLocked'] === true;

/** Лимитка ниже последней цены - покупка, выше - продажа. */
export const limitSideOf = (price: number, lastPrice: number): LimitSide => (price < lastPrice ? 'buy' : 'sell');

export const limitPrice = (marks: readonly Mark[]): number | null => marks.find(isLimitMark)?.anchors[0]?.price ?? null;

/** Цена из якорей в производных полях меты (position: entry/sl/tp). Остальные поля меты сохраняются. */
export function withDerivedMeta(m: Mark, lastPrice: number | null): Mark {
  if (m.kind === 'position') {
    const [e, s, t] = m.anchors;
    return { ...m, meta: { ...m.meta, entry: e?.price, sl: s?.price, tp: t?.price } };
  }
  if (isLimitMark(m) && lastPrice !== null && m.anchors[0]) {
    return { ...m, meta: { ...m.meta, side: limitSideOf(m.anchors[0].price, lastPrice) } };
  }
  return m;
}

/** Индекс якоря-края (0 верх, 1 низ), ближайшего по вертикали, если он в допуске tol пикселей; иначе null. */
export function nearestEdge(ys: readonly number[], y: number, tol: number): number | null {
  let best: number | null = null;
  let bestD = tol;
  ys.forEach((v, i) => {
    const d = Math.abs(v - y);
    if (d <= bestD) {
      bestD = d;
      best = i;
    }
  });
  return best;
}

export const sameTimeAnchors = (a: readonly Anchor[]): boolean => a.every((x) => x.time === a[0]?.time);

/** Риск и R:R позиции. long: tp > entry > sl; short: tp < entry < sl. null - позиция вырождена или противоречива. */
export function positionRisk(entry: number, sl: number, tp: number): { side: 'long' | 'short'; rr: number; riskR: 1; rewardR: number } | null {
  const risk = Math.abs(entry - sl);
  if (risk === 0 || entry === tp) return null;
  const long = sl < entry && tp > entry;
  const short = sl > entry && tp < entry;
  if (!long && !short) return null;
  const rewardR = Math.abs(tp - entry) / risk;
  return { side: long ? 'long' : 'short', rr: rewardR, riskR: 1, rewardR };
}

/** Запас стопа за структурой (фитиль/дальний край зоны) в ATR: >0 - стоп за структурой. long: structure - sl; short: sl - structure. */
export function slBufferAtr(side: 'long' | 'short', sl: number, structure: number, atr: number): number | null {
  if (!(atr > 0)) return null;
  return (side === 'long' ? structure - sl : sl - structure) / atr;
}
