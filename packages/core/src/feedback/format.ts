// Форматирование params разбора (F-02, F-07): ядро округляет числа и даёт словарь отображаемых значений;
// UI может подменить форматеры (запятая, группировка). Время ядро не форматирует (локальный пояс — задача UI).
export type ParamValue = string | number;

/** Параметр - момент времени (мс UTC): ключ `time` либо оканчивается на `Time`. Форматирует UI (локальный пояс). */
export const isTimeParam = (key: string): boolean => key === 'time' || /Time$/.test(key);
export type ParamKind = 'price' | 'percent' | 'r' | 'number';

/** Тип числового параметра по имени ключа; остальные ключи (count, total, time, ...) не трогаются. */
export const PARAM_KINDS: Readonly<Record<string, ParamKind>> = {
  price: 'price', prevPrice: 'price', close: 'price', level: 'price', wick: 'price', low: 'price', high: 'price',
  user: 'price', ref: 'price', sl: 'price', tp: 'price', entry: 'price', protected: 'price', size: 'price',
  given: 'price', expected: 'price', // числовые given/expected — цены (BOS_WRONG_LEVEL); строки не затрагиваются
  // Fibonacci (FIBONACCI.md §11): цены уровней, экстремумов и эталонных точек
  cPrice: 'price', userPrice: 'price', refPrice: 'price', refStartPrice: 'price', refEndPrice: 'price',
  refAPrice: 'price', refBPrice: 'price', refCPrice: 'price', maxPrice: 'price', targetPrice: 'price', eq: 'price', thr: 'price',
  devPct: 'percent', tolPct: 'percent', iou: 'percent',
  rr: 'r', r: 'r',
  k: 'number', atr: 'number',
};

const DECIMALS_CAP = 8;
function decimalsOf(tick: number): number {
  if (!(tick > 0)) return 2;
  let d = 0;
  while (d < DECIMALS_CAP && Math.abs(Math.round(tick * 10 ** d) / 10 ** d - tick) > 1e-12) d++;
  return d;
}

/** Округление цены до шага tickSize (по умолчанию 0.01). */
export function roundByTick(n: number, tickSize = 0.01): number {
  if (!Number.isFinite(n)) return n;
  const tick = tickSize > 0 ? tickSize : 0.01;
  return Number((Math.round(n / tick) * tick).toFixed(decimalsOf(tick)));
}
const round2 = (n: number): number => (Number.isFinite(n) ? Number(n.toFixed(2)) : n);

/** Округляет числовые параметры по типу ключа: цены по tickSize, проценты/R/ATR-множители до 2 знаков, touches — целое. */
export function normalizeParams<T extends Record<string, ParamValue>>(params: T, tickSize?: number): T {
  const out: Record<string, ParamValue> = {};
  for (const [k, v] of Object.entries(params)) {
    const kind = PARAM_KINDS[k];
    if (typeof v !== 'number' || !kind) out[k] = typeof v === 'number' && k === 'touches' ? Math.round(v) : v;
    else out[k] = kind === 'price' ? roundByTick(v, tickSize) : round2(v);
  }
  return out as T;
}

/** Отображаемые значения enum: тренды, стороны, направления, ТФ (никаких up/down/4h в тексте). */
export const TREND_RU: Record<string, string> = { up: 'восходящий', down: 'нисходящий', none: 'нет', range: 'боковой' };
export const DIRECTION_RU: Record<string, string> = { bull: 'бычий', bear: 'медвежий', none: 'нет' };
export const SIDE_RU: Record<string, string> = { LONG: 'лонг', SHORT: 'шорт', WAIT: 'ожидание' };
export const TIMEFRAME_RU: Record<string, string> = { '1m': '1M', '15m': '15M', '1h': '1H', '4h': '4H', '1d': '1D' };

export function displayValue(key: string, v: string): string {
  if (key === 'htfTf' || key === 'tf') return TIMEFRAME_RU[v] ?? v;
  if (key === 'dir') return DIRECTION_RU[v] ?? v;
  if (key === 'side') return SIDE_RU[v] ?? v;
  if (key === 'lastEvent') return v.replace(/\b(bull|bear)\b/g, (m) => DIRECTION_RU[m]!);
  if (key === 'given' || key === 'expected' || key === 'htfTrend' || key === 'trendTf' || key === 'trend') {
    return TREND_RU[v] ?? DIRECTION_RU[v] ?? SIDE_RU[v] ?? v;
  }
  return v;
}

export interface ParamFormatters {
  formatPrice?: (n: number) => string;
  formatPercent?: (n: number) => string;
  formatR?: (n: number) => string;
  /** Для ключей типа 'number' (ATR-множители); по умолчанию — 2 знака. */
  formatNumber?: (n: number) => string;
  /** Шаг цены символа для форматера по умолчанию. */
  tickSize?: number;
}

/** Готовые к подстановке строки: числа форматируются по типу ключа, enum — через словарь отображаемых значений. */
export function formatFeedbackParams(
  params: Record<string, ParamValue> | undefined,
  fmt: ParamFormatters = {},
): Record<string, string> {
  const price = fmt.formatPrice ?? ((n: number) => String(roundByTick(n, fmt.tickSize)));
  const pct = fmt.formatPercent ?? ((n: number) => String(round2(n)));
  const r = fmt.formatR ?? ((n: number) => String(round2(n)));
  const num = fmt.formatNumber ?? ((n: number) => String(round2(n)));
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(params ?? {})) {
    const kind = PARAM_KINDS[k];
    if (typeof v === 'number' && kind) {
      out[k] = kind === 'price' ? price(v) : kind === 'percent' ? pct(v) : kind === 'r' ? r(v) : num(v);
    } else if (typeof v === 'string') out[k] = displayValue(k, v);
    else out[k] = String(v);
  }
  return out;
}
