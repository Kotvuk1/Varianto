import type { Mark } from '@tl/core';
import { patternLabel } from '@/chart/drawing/layout';
import { formatDateTime } from '@/i18n/format';
import { tx } from './strings';

/** «29 октября, 08:00» (родительный падеж, локальный пояс). */
export const formatWhen = formatDateTime;

export function markName(m: Mark): string {
  const d = tx.dir;
  switch (m.kind) {
    case 'bos':
    case 'choch':
      return `${tx.tools_[m.kind]} ${m.direction === 'bear' ? d.down : d.up}`;
    case 'fvg':
    case 'order-block':
      return m.direction ? `${tx.tools_[m.kind]} ${m.direction === 'bear' ? d.bear : d.bull}` : tx.tools_[m.kind];
    case 'sweep':
      return m.direction ? `${tx.tools_.sweep} ${m.direction === 'bear' ? d.sweepHigh : d.sweepLow}` : tx.tools_.sweep;
    case 'pattern':
      return patternLabel(m.meta?.['patternType']);
    default:
      return tx.tools_[m.kind];
  }
}

/** Человеческое описание метки: «BOS вверх · 29 окт 08:00 · 81 950,0». */
export function describeMark(m: Mark, fmt: (p: number) => string): string {
  const a = m.anchors;
  const key = m.kind === 'bos' || m.kind === 'choch' || m.kind === 'sweep' ? a[a.length - 1] : a[0];
  const price =
    m.kind === 'fvg' || m.kind === 'order-block'
      ? `${fmt(a[0]!.price)} – ${fmt(a[1]!.price)}`
      : a[0]
        ? fmt(a[0].price)
        : '';
  return [markName(m), key ? formatWhen(key.time) : '', price].filter(Boolean).join(' · ');
}
