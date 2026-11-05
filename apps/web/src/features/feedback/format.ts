import { formatDateTime, formatDecimal, formatPercentValue, formatRValue } from '@/i18n/format';
import { fillTemplate, flattenTemplates, formatFeedbackParams, isTimeParam, kindName } from '@tl/core';

const KIND_KEYS = new Set(['kind', 'given', 'expected', 'eventKind', 'kindName']);
const DIR: Record<string, string> = { bull: 'бычий', bear: 'медвежий', none: 'не задано' };

let templates: Record<string, string> | null = null;

export function formatWhen(t: number): string {
  return formatDateTime(t);
}

/**
 * Значение параметра для текста: форматирование числа/enum - `formatFeedbackParams` ядра
 * (цены - форматером графика, % и R по-русски), время и типы меток - слой UI.
 */
export function formatParam(key: string, v: string | number, fmtPrice: (p: number) => string): string | number {
  if (typeof v === 'number' && isTimeParam(key)) return formatWhen(v);
  if (typeof v === 'number' && KIND_KEYS.has(key) && v > 1) return fmtPrice(v);
  const out = formatFeedbackParams({ [key]: v }, FORMATTERS(fmtPrice))[key]!;
  if (typeof v === 'string' && KIND_KEYS.has(key) && out === v) return DIR[v] ?? kindName(v);
  return out;
}

const FORMATTERS = (formatPrice: (p: number) => string) => ({
  formatPrice,
  formatPercent: formatPercentValue,
  formatR: formatRValue,
  formatNumber: formatDecimal,
});

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
