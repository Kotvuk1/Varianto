import type { Mark } from '@tl/core';
import { isEwKind } from '@/chart/ew/model';
import { isFibKind } from '@/chart/fib/model';
import { patternLabel } from '@/chart/drawing/layout';
import { ZONE_TYPE_LABEL } from '@/chart/zone/labels';
import { isLimitMark, type ZoneType } from '@/chart/zone/model';
import { formatDateTime } from '@/i18n/format';
import { tx } from './strings';

/** «29 октября, 08:00» (родительный падеж, локальный пояс). */
export const formatWhen = formatDateTime;

export function markName(m: Mark): string {
  const d = tx.dir;
  if (isLimitMark(m)) return `${tx.tools_.limit} ${m.meta?.['side'] === 'sell' ? 'SELL' : 'BUY'}`;
  if (m.kind === 'zone') {
    const t = m.meta?.['zoneType'] as ZoneType | undefined;
    return t && t in ZONE_TYPE_LABEL ? `${tx.tools_.zone}: ${ZONE_TYPE_LABEL[t].toLowerCase()}` : tx.tools_.zone;
  }
  if (isFibKind(m.kind)) return `${tx.tools_[m.kind]}${m.direction ? ` ${m.direction === 'bear' ? d.down : d.up}` : ''}`;
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
    case 'ew-impulse':
    case 'ew-zigzag':
    case 'ew-flat':
      return tx.ewMarks[m.kind];
    default:
      return tx.tools_[m.kind];
  }
}

/** Человеческое описание метки: «BOS вверх · 29 окт 08:00 · 81 950,0». */
export function describeMark(m: Mark, fmt: (p: number) => string): string {
  const a = m.anchors;
  const key = m.kind === 'bos' || m.kind === 'choch' || m.kind === 'sweep' ? a[a.length - 1] : a[0];
  const price = isEwKind(m.kind)
    ? [a[0], a[a.length - 1]].filter(Boolean).map((x) => fmt(x!.price)).join(' → ')
    : isFibKind(m.kind)
    ? a.map((x) => fmt(x.price)).join(' → ')
    : m.kind === 'fvg' || m.kind === 'order-block' || m.kind === 'zone'
      ? `${fmt(a[0]!.price)} – ${fmt(a[1]!.price)}`
      : a[0]
        ? fmt(a[0].price)
        : '';
  return [markName(m), key ? formatWhen(key.time) : '', price].filter(Boolean).join(' · ');
}
