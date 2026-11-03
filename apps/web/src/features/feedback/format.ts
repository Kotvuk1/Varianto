import { fillTemplate, flattenTemplates } from '@tl/core';

const TIME_KEYS = new Set(['time', 'refTime', 'eventTime', 'fromTime', 'toTime']);
const PRICE_KEYS = new Set(['price', 'level', 'top', 'bottom', 'low', 'high']);

let templates: Record<string, string> | null = null;

export function formatWhen(t: number): string {
  const d = new Date(t);
  const mon = d.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '');
  return `${d.getDate()} ${mon} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Текст блока: шаблон ядра, время и цены форматирует UI (локальный пояс, точность тика символа). */
export function renderBlock(templateKey: string, params: Record<string, string | number> | undefined, fmtPrice: (p: number) => string): string {
  templates ??= flattenTemplates();
  const tpl = templates[templateKey];
  if (tpl === undefined) return templateKey;
  const p: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(params ?? {})) {
    if (typeof v === 'number' && TIME_KEYS.has(k)) p[k] = formatWhen(v);
    else if (typeof v === 'number' && PRICE_KEYS.has(k)) p[k] = fmtPrice(v);
    else p[k] = v;
  }
  return fillTemplate(tpl, p);
}
