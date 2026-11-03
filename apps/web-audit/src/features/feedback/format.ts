import { fillTemplate, flattenTemplates, kindName } from '@tl/core';

const TIME_KEYS = new Set(['time', 'refTime', 'eventTime', 'fromTime', 'toTime']);
const PRICE_KEYS = new Set(['price', 'level', 'top', 'bottom', 'low', 'high', 'close', 'prevPrice', 'protected', 'sl', 'tp', 'entry', 'ref', 'extreme']);
const KIND_KEYS = new Set(['kind', 'given', 'expected', 'eventKind', 'kindName']);
const DIR: Record<string, string> = { bull: 'бычий', bear: 'медвежий', none: 'не задано' };

let templates: Record<string, string> | null = null;

export function formatWhen(t: number): string {
  const d = new Date(t);
  const mon = d.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '');
  return `${d.getDate()} ${mon} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Значение параметра для текста: время - локальное, цены - единым форматером, типы меток - через словарь имён. */
export function formatParam(key: string, v: string | number, fmtPrice: (p: number) => string): string | number {
  if (typeof v === 'number') {
    if (TIME_KEYS.has(key)) return formatWhen(v);
    if (PRICE_KEYS.has(key) || (KIND_KEYS.has(key) && v > 1)) return fmtPrice(v);
    return v;
  }
  if (KIND_KEYS.has(key)) return DIR[v] ?? kindName(v);
  if (key === 'dir') return DIR[v] ?? v;
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
