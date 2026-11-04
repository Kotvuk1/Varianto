import { formatDateTime, formatDecimal, formatPercentValue, formatRValue } from '@/i18n/format';
import { fillTemplate, flattenTemplates, kindName } from '@tl/core';

const TIME_KEYS = new Set(['time', 'refTime', 'eventTime', 'fromTime', 'toTime']);
const PRICE_KEYS = new Set(['price', 'level', 'top', 'bottom', 'low', 'high', 'close', 'prevPrice', 'protected', 'sl', 'tp', 'entry', 'ref', 'extreme']);
const KIND_KEYS = new Set(['kind', 'given', 'expected', 'eventKind', 'kindName']);
const DIR: Record<string, string> = { bull: 'бычий', bear: 'медвежий', none: 'не задано' };

let templates: Record<string, string> | null = null;

export function formatWhen(t: number): string {
  return formatDateTime(t);
}

const PCT_KEYS = new Set(['devPct', 'tolPct', 'pct', 'tolerancePct', 'deviationPct']);
const R_KEYS = new Set(['rr', 'r', 'rMultiple']);
const TREND: Record<string, string> = { up: 'восходящий', down: 'нисходящий', range: 'боковик', bull: 'бычий', bear: 'медвежий', none: 'не задано' };
const TF_KEYS = new Set(['htfTf', 'trendTf', 'tf', 'htf']);
const TREND_KEYS = new Set(['trend', 'htfTrend', 'trendTf', 'given', 'expected', 'dir']);
const SIDE: Record<string, string> = { LONG: 'лонг', SHORT: 'шорт', long: 'лонг', short: 'шорт' };

/**
 * Значение параметра для текста. Временный адаптер на месте `formatFeedbackParams` ядра
 * (там же словари enum и округление): время локальное, цены - форматером графика, % и R с запятой.
 */
export function formatParam(key: string, v: string | number, fmtPrice: (p: number) => string): string | number {
  if (typeof v === 'number') {
    if (TIME_KEYS.has(key)) return formatWhen(v);
    if (PCT_KEYS.has(key)) return formatPercentValue(v);
    if (R_KEYS.has(key)) return formatRValue(v);
    if (PRICE_KEYS.has(key) || (KIND_KEYS.has(key) && v > 1)) return fmtPrice(v);
    return Number.isInteger(v) ? v : formatDecimal(v);
  }
  if (KIND_KEYS.has(key) && TREND_KEYS.has(key) && TREND[v]) return TREND[v]!;
  if (KIND_KEYS.has(key)) return DIR[v] ?? kindName(v);
  if (TF_KEYS.has(key) && /^\d+[mhdw]$/i.test(v)) return v.toUpperCase();
  if (TREND_KEYS.has(key) && TREND[v]) return TREND[v]!;
  if (key === 'side' && SIDE[v]) return SIDE[v]!;
  return v;
}

/** Текст блока: шаблон ядра, время, цены и типы форматирует UI. */
export function renderBlock(templateKey: string, params: Record<string, string | number> | undefined, fmtPrice: (p: number) => string): string {
  templates ??= flattenTemplates();
  const tpl = templates[templateKey];
  if (tpl === undefined) return templateKey;
  const p: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(params ?? {})) p[k] = formatParam(k, v, fmtPrice);
  return fillTemplate(tpl, p);
}

/** «Где»: времена мест, к которым относится блок (по params.time / refTime). */
export function placeOf(params: Record<string, string | number> | undefined): string | null {
  const t = params?.time;
  return typeof t === 'number' ? formatWhen(t) : null;
}
