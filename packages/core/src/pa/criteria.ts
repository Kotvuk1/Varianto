// Человекочитаемые критерии свечных моделей (ALGORITHMS §9) для разбора: подстановка {criterion} в PATTERN_* ошибках.
// Пороги дублируют patterns.ts (источник истины); здесь только пояснение с измеренными значениями.
import { atr14, closedOnly } from '../smc/series';
import type { Candle } from '../types';
import type { PatternType } from './types';

export interface PatternCheck {
  ok: boolean;
  /** Все проверки с измеренными значениями. */
  facts: string[];
  /** Не выполненные проверки. */
  failed: string[];
}

const body = (c: Candle) => Math.abs(c.close - c.open);
const range = (c: Candle) => c.high - c.low;
const top = (c: Candle) => Math.max(c.open, c.close);
const bottom = (c: Candle) => Math.min(c.open, c.close);
const pct = (x: number) => `${Math.round(x * 100)}%`;
const x1 = (x: number) => (Math.round(x * 10) / 10).toString();

interface Item {
  text: string;
  ok: boolean;
}

function finish(items: Item[]): PatternCheck {
  return { ok: items.every((i) => i.ok), facts: items.map((i) => i.text), failed: items.filter((i) => !i.ok).map((i) => i.text) };
}

function pinItems(c: Candle, atr: number): Item[] {
  const r = range(c);
  if (r === 0) return [{ text: 'у свечи нет диапазона', ok: false }];
  const lower = (bottom(c) - c.low) / r;
  const upper = (c.high - top(c)) / r;
  const long = Math.max(lower, upper);
  const short = Math.min(lower, upper);
  return [
    { text: `диапазон ${x1(r / atr)}×ATR (нужно не менее 0.8)`, ok: r >= 0.8 * atr },
    { text: `тело ${pct(body(c) / r)} диапазона (нужно не более 33%)`, ok: body(c) <= r / 3 },
    { text: `длинная тень ${pct(long)} диапазона (нужно не менее 60%)`, ok: long >= 0.6 },
    { text: `противоположная тень ${pct(short)} (нужно не более 15%)`, ok: short <= 0.15 },
  ];
}

function dojiItems(c: Candle, atr: number): Item[] {
  const r = range(c);
  if (r === 0) return [{ text: 'у свечи нет диапазона', ok: false }];
  const lower = (bottom(c) - c.low) / r;
  const upper = (c.high - top(c)) / r;
  const pin = body(c) <= r / 3 && r >= 0.8 * atr && ((lower >= 0.6 && upper <= 0.15) || (upper >= 0.6 && lower <= 0.15));
  return [
    { text: `тело ${pct(body(c) / r)} диапазона (нужно не более 10%)`, ok: body(c) <= 0.1 * r },
    { text: `диапазон ${x1(r / atr)}×ATR (нужно не менее 0.5)`, ok: r >= 0.5 * atr },
    { text: 'с одной длинной тенью это уже пин-бар', ok: !pin },
  ];
}

function insideItems(m: Candle, c: Candle, atr: number): Item[] {
  return [
    { text: `свеча внутри диапазона предыдущей (high ${c.high} против ${m.high}, low ${c.low} против ${m.low})`, ok: c.high <= m.high && c.low >= m.low },
    { text: 'диапазон меньше, чем у предыдущей свечи', ok: range(c) < range(m) && range(m) > 0 },
    { text: `предыдущая свеча крупная: ${x1(range(m) / atr)}×ATR (нужно не менее 1.0)`, ok: range(m) >= atr },
  ];
}

function engulfItems(p: Candle, c: Candle, atr: number): Item[] {
  const opposite = (p.close < p.open && c.close > c.open) || (p.close > p.open && c.close < c.open);
  const covers = bottom(c) <= bottom(p) && top(c) >= top(p);
  return [
    { text: 'цвета свечей противоположны', ok: opposite },
    { text: 'тело второй свечи перекрывает тело первой', ok: opposite && covers },
    { text: 'тело второй свечи больше тела первой', ok: body(c) > body(p) && body(p) > 0 },
    { text: `тело второй свечи ${x1(body(c) / atr)}×ATR (нужно не менее 0.5)`, ok: body(c) >= 0.5 * atr },
  ];
}

function starItems(a: Candle, b: Candle, c: Candle, atrA: number, bull: boolean): Item[] {
  const mid = (a.open + a.close) / 2;
  const colorA = bull ? a.close < a.open : a.close > a.open;
  const colorC = bull ? c.close > c.open : c.close < c.open;
  const beyondMid = bull ? c.close >= mid : c.close <= mid;
  return [
    { text: `первая свеча ${bull ? 'медвежья' : 'бычья'}`, ok: colorA },
    { text: `тело первой свечи ${x1(body(a) / atrA)}×ATR (нужно не менее 0.6)`, ok: body(a) >= 0.6 * atrA },
    { text: `тело средней свечи ${body(a) > 0 ? pct(body(b) / body(a)) : '—'} от первой (нужно не более 30%)`, ok: body(a) > 0 && body(b) <= 0.3 * body(a) },
    { text: `третья свеча ${bull ? 'бычья' : 'медвежья'} с телом не менее половины первой`, ok: colorC && body(c) >= 0.5 * body(a) },
    { text: `закрытие третьей свечи ${bull ? 'выше' : 'ниже'} середины первой`, ok: beyondMid },
  ];
}

/** Проверки критериев модели `type`, последняя свеча модели — `last` (индекс в закрытом ряду). */
export function patternCheck(type: PatternType, candlesIn: readonly Candle[], last: number): PatternCheck {
  const candles = closedOnly(candlesIn);
  const atr = atr14(candles);
  const c = candles[last];
  const a = atr[last];
  if (!c || a === null || a === undefined || a === 0) return { ok: false, facts: ['недостаточно свечей для расчёта ATR'], failed: ['недостаточно свечей для расчёта ATR'] };
  const need = type === 'morning-star' || type === 'evening-star' ? 2 : type === 'inside-bar' || type === 'engulfing' ? 1 : 0;
  if (last < need) return { ok: false, facts: ['недостаточно свечей слева'], failed: ['недостаточно свечей слева'] };
  switch (type) {
    case 'pin-bar':
      return finish(pinItems(c, a));
    case 'doji':
      return finish(dojiItems(c, a));
    case 'inside-bar':
      return finish(insideItems(candles[last - 1]!, c, a));
    case 'engulfing':
      return finish(engulfItems(candles[last - 1]!, c, a));
    default: {
      const first = candles[last - 2]!;
      const atrA = atr[last - 2];
      if (atrA === null || atrA === undefined || atrA === 0) return { ok: false, facts: ['недостаточно свечей для расчёта ATR'], failed: ['недостаточно свечей для расчёта ATR'] };
      return finish(starItems(first, candles[last - 1]!, c, atrA, type === 'morning-star'));
    }
  }
}

/** Текст критерия для {criterion}: met - что выполнено (пропущенная модель), иначе что не выполнено (лишняя/не та модель). */
export function patternCriterion(type: PatternType, candles: readonly Candle[], last: number, met: boolean): string {
  const r = patternCheck(type, candles, last);
  const list = met ? r.facts : r.failed.length > 0 ? r.failed : r.facts;
  return list.join('; ');
}
