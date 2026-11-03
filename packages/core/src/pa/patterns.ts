// Свечные модели Price Action (ALGORITHMS §9): engulfing, pin-bar, inside-bar, doji, morning-star, evening-star.
import { atr14, closedOnly } from '../smc/series';
import type { Candle } from '../types';
import type { PatternInstance, PatternType } from './types';

const body = (c: Candle) => Math.abs(c.close - c.open);
const range = (c: Candle) => c.high - c.low;
const bodyTop = (c: Candle) => Math.max(c.open, c.close);
const bodyBottom = (c: Candle) => Math.min(c.open, c.close);
const upperWick = (c: Candle) => c.high - bodyTop(c);
const lowerWick = (c: Candle) => bodyBottom(c) - c.low;
const isBull = (c: Candle) => c.close > c.open;
const isBear = (c: Candle) => c.close < c.open;

/** Порядок типов в таблице 9.2 — определяет порядок при равном lastIndex. */
export const PATTERN_ORDER: readonly PatternType[] = ['pin-bar', 'doji', 'inside-bar', 'engulfing', 'morning-star', 'evening-star'];

/** pin-bar: направление по длинной тени (null — не пин-бар). */
export function pinBarDirection(c: Candle, atr: number): 'bull' | 'bear' | null {
  const r = range(c);
  if (r === 0 || !(r >= 0.8 * atr) || !(body(c) <= r / 3)) return null;
  if (lowerWick(c) >= 0.6 * r && upperWick(c) <= 0.15 * r) return 'bull';
  if (upperWick(c) >= 0.6 * r && lowerWick(c) <= 0.15 * r) return 'bear';
  return null;
}

function isDoji(c: Candle, atr: number): boolean {
  const r = range(c);
  return r !== 0 && pinBarDirection(c, atr) === null && body(c) <= 0.1 * r && r >= 0.5 * atr;
}

function isInside(m: Candle, c: Candle, atr: number): boolean {
  return range(m) !== 0 && range(c) !== 0 && c.high <= m.high && c.low >= m.low && range(c) < range(m) && range(m) >= 1.0 * atr;
}

function engulfing(p: Candle, c: Candle, atr: number): 'bull' | 'bear' | null {
  if (range(p) === 0 || range(c) === 0) return null;
  if (!(body(c) > body(p) && body(p) > 0 && body(c) >= 0.5 * atr)) return null;
  if (isBear(p) && isBull(c) && c.open <= p.close && c.close >= p.open) return 'bull';
  if (isBull(p) && isBear(c) && c.open >= p.close && c.close <= p.open) return 'bear';
  return null;
}

function star(a: Candle, b: Candle, c: Candle, atrA: number, dir: 'bull' | 'bear'): boolean {
  if (range(a) === 0 || range(b) === 0 || range(c) === 0) return false;
  if (!(body(a) >= 0.6 * atrA) || !(body(b) <= 0.3 * body(a))) return false;
  const mid = (a.open + a.close) / 2;
  if (dir === 'bull') {
    return isBear(a) && bodyTop(b) <= a.close + 0.1 * body(a) && isBull(c) && body(c) >= 0.5 * body(a) && c.close >= mid;
  }
  return isBull(a) && bodyBottom(b) >= a.close - 0.1 * body(a) && isBear(c) && body(c) >= 0.5 * body(a) && c.close <= mid;
}

/** Все экземпляры моделей на закрытых свечах; по lastIndex, затем по порядку таблицы 9.2. */
export function detectPatterns(input: readonly Candle[]): PatternInstance[] {
  const candles = closedOnly(input);
  const atr = atr14(candles);
  const out: PatternInstance[] = [];
  const push = (type: PatternType, direction: 'bull' | 'bear' | null, first: number, last: number) =>
    out.push({ type, direction, firstIndex: first, lastIndex: last, time: candles[last]!.openTime });

  for (let i = 1; i < candles.length; i++) {
    const c = candles[i]!;
    const a = atr[i];
    if (a === null || a === undefined) continue;
    const pin = pinBarDirection(c, a);
    if (pin) push('pin-bar', pin, i, i);
    if (isDoji(c, a)) push('doji', null, i, i);
    const prev = candles[i - 1]!;
    if (isInside(prev, c, a)) push('inside-bar', null, i - 1, i);
    const eng = engulfing(prev, c, a);
    if (eng) push('engulfing', eng, i - 1, i);
    if (i >= 2) {
      const first = candles[i - 2]!;
      const atrA = atr[i - 2];
      if (atrA !== null && atrA !== undefined) {
        if (star(first, prev, c, atrA, 'bull')) push('morning-star', 'bull', i - 2, i);
        if (star(first, prev, c, atrA, 'bear')) push('evening-star', 'bear', i - 2, i);
      }
    }
  }
  return out;
}
