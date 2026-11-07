// Маркеры проигрывания отложенного ордера (CURRICULUM_STAGES §5.3, §6.5, §7) и подсветка зоны «полный балл».
// Чистая геометрия: время/цена -> Part (отрисовывается тем же рендером, что и метки).
import type { Candle } from '@tl/core';
import type { Part } from '../drawing/layout';
import type { Projection } from '../drawing/projection';
import { GUIDE_BAND_LABEL, REPLAY_LABEL } from '../zone/labels';

export type ReplayMarkerKind = 'fill' | 'cancelled' | 'stop-hunt';

export interface ReplayMarker {
  kind: ReplayMarkerKind;
  /** openTime свечи, на которой стоит маркер. */
  time: number;
  price: number;
}

export interface ReplayMarkersInput {
  /** Свечи проигрывания (replay.candles); индексы - позиции в этом массиве. */
  candles: readonly Candle[];
  /** replay.fillIndex: свеча исполнения; null - ордер не исполнился. */
  fillIndex: number | null;
  /** Цена лимитки. */
  limitPrice: number;
  /** replay.exitIndex: свеча выхода/снятия; для неисполненного ордера - где показать «ордер снят» (по умолчанию последняя). */
  exitIndex?: number | null;
  /** Стоп выбит фитилём и цена вернулась (stopHunted): индекс свечи выноса и цена стопа. */
  stopHunt?: { index: number; sl: number } | null;
}

export function replayMarkers(i: ReplayMarkersInput): ReplayMarker[] {
  const out: ReplayMarker[] = [];
  const at = (k: number) => (Number.isInteger(k) ? i.candles[k] : undefined);
  if (i.fillIndex !== null) {
    const c = at(i.fillIndex);
    if (c) out.push({ kind: 'fill', time: c.openTime, price: i.limitPrice });
  } else {
    const c = at(i.exitIndex ?? i.candles.length - 1);
    if (c) out.push({ kind: 'cancelled', time: c.openTime, price: i.limitPrice });
  }
  if (i.stopHunt) {
    const c = at(i.stopHunt.index);
    if (c) out.push({ kind: 'stop-hunt', time: c.openTime, price: i.stopHunt.sl });
  }
  return out;
}

const GLYPH = { fill: 'diamond', cancelled: 'cross', 'stop-hunt': 'arrow-down' } as const;

/** Глиф и подпись над точкой (форма и текст различают вид, не цвет). Вне видимой области - пусто. */
export function replayMarkerParts(markers: readonly ReplayMarker[], proj: Projection, fmt: (p: number) => string): Part[] {
  const parts: Part[] = [];
  for (const m of markers) {
    const x = proj.timeToX(m.time);
    const y = proj.priceToY(m.price);
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < -20 || x > proj.width + 20 || y < -20 || y > proj.height + 20) continue;
    const text = m.kind === 'fill' ? `${REPLAY_LABEL.fill} · ${fmt(m.price)}` : REPLAY_LABEL[m.kind];
    const above = m.kind !== 'stop-hunt';
    parts.push({ t: 'glyph', g: GLYPH[m.kind], x, y });
    parts.push({ t: 'text', text, x, y: y + (above ? -20 : 24) });
  }
  return parts;
}

/** Полоса цен на всю ширину панели (зона «полный балл» лимитного входа). */
export function guideBandParts(band: { from: number; to: number }, proj: Projection, label = GUIDE_BAND_LABEL): Part[] {
  const ya = proj.priceToY(band.from);
  const yb = proj.priceToY(band.to);
  if (!Number.isFinite(ya) || !Number.isFinite(yb)) return [];
  const y1 = Math.min(ya, yb);
  const y2 = Math.max(ya, yb);
  if (y2 < 0 || y1 > proj.height) return [];
  return [
    { t: 'rect', x1: 0, x2: proj.width, y1, y2, dash: 'dotted', hatch: true },
    { t: 'text', text: label, x: 66 + (label.length * 6.6 + 12) / 2, y: Math.min(Math.max(y1 + 11, 11), proj.height - 11) },
  ];
}
