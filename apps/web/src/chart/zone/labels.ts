// Подписи инструментов уровней на графике (термины ступеней 2-4 курса; как SwH/BOS - короткие подписи самой метки).
import type { ZoneType } from './model';

export const ZONE_TYPE_LABEL: Readonly<Record<ZoneType, string>> = { support: 'Поддержка', resistance: 'Сопротивление', flip: 'Флип' };
export const ZONE_LABEL = 'Зона';
export const ENTRY_LOCKED_SUFFIX = 'фикс.';

/** Число с запятой, без хвостового «,0»: 4,5 / 5. */
export const num1 = (n: number): string => n.toFixed(1).replace(/\.0$/, '').replace('.', ',');

/** Число с одним знаком после запятой: 2,0. */
export const dec1 = (n: number): string => n.toFixed(1).replace('.', ',');

export function zoneLabel(meta: Record<string, unknown> | undefined): string {
  const type = meta?.['zoneType'];
  const base = typeof type === 'string' && type in ZONE_TYPE_LABEL ? ZONE_TYPE_LABEL[type as ZoneType] : ZONE_LABEL;
  const strength = meta?.['strength'];
  return typeof strength === 'number' && Number.isFinite(strength) ? `${base} · сила ${num1(strength)}` : base;
}

export const limitLabel = (side: 'buy' | 'sell', price: string): string => `Limit ${side === 'buy' ? 'BUY' : 'SELL'} · ${price}`;

export const REPLAY_LABEL = { fill: 'Исполнен', cancelled: 'Ордер снят', 'stop-hunt': 'Stop hunt' } as const;
export const GUIDE_BAND_LABEL = 'Полный балл';
