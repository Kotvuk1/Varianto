// Части отрисовки сетки Fibonacci (чистая геометрия: Mark + функции проекции -> Part[]). Без красно-зелёной семантики:
// уровни различаются толщиной, штрихом и подписью, зона OTE - заливкой токена.
import type { Anchor } from '@tl/core';
import type { Part } from '../drawing/layout';
import { layoutLabels, type LabelItem } from './labels';
import { extensionLevels, fibLevelPrice, labelPriority, oteRange, retracementLevels, type FibKind, type FibLevel } from './model';

export interface FibPartsInput {
  kind: FibKind;
  anchors: readonly Anchor[];
  /** Пиксельные координаты якорей (по порядку). */
  pts: readonly { x: number; y: number }[];
  priceToY: (p: number) => number;
  width: number;
  fmt: (p: number) => string;
  /** Ширина плашки подписи. */
  tw: (text: string) => number;
  pillH: number;
  /** Выбранный уровень (подсветка). */
  highlight?: number | null;
  /** Сторона подписей уровней: эталон - справа, пользователь - у левого якоря. */
  side?: 'left' | 'right';
  /** Узкая панель: Premium/Discount сворачиваются в одну пометку «P/D». */
  compact?: boolean;
  /** Сколько касаний уже сделано (превью): меньше нужного - только ножки. */
  draft?: number;
}

export const FIB_ANCHORS: Readonly<Record<FibKind, number>> = { 'fib-retracement': 2, 'fib-extension': 3 };
const LABEL_PAD = 4;

/** Цены, которые определяют вертикальный охват сетки (для проверки видимости). */
export function fibExtentPrices(kind: FibKind, anchors: readonly Anchor[]): number[] {
  const p = anchors.map((a) => a.price);
  if (kind === 'fib-extension' && anchors.length >= 3) {
    for (const l of extensionLevels(anchors[0]!.price, anchors[1]!.price, anchors[2]!.price)) p.push(l.price);
  }
  return p;
}

const levelWidth = (kind: FibKind, l: FibLevel, hi: boolean): number => {
  if (hi) return 3.5;
  if (l.info) return 0.75;
  if (kind === 'fib-retracement') return l.ratio === 0.5 ? 2.5 : l.ratio === 0 || l.ratio === 1 ? 1.5 : 1;
  return l.ratio === 1 ? 1.75 : 1.25;
};

export function fibParts(i: FibPartsInput): Part[] {
  const parts: Part[] = [];
  const { pts, anchors } = i;
  const need = FIB_ANCHORS[i.kind];
  const leg = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    parts.push({ t: 'seg', x1: a.x, y1: a.y, x2: b.x, y2: b.y, dash: 'dotted', w: 1 });

  // ножки A-B (-C): тонкий пунктир, показывает протянутый импульс
  for (let k = 1; k < pts.length; k++) leg(pts[k - 1]!, pts[k]!);
  if (anchors.length < need || (i.draft !== undefined && i.draft < need)) return parts;

  const A = anchors[0]!.price;
  const B = anchors[1]!.price;
  if (A === B) return parts;
  const retr = i.kind === 'fib-retracement';
  const C = anchors[2]?.price ?? B;
  const levels = retr ? retracementLevels(A, B) : extensionLevels(A, B, C);
  const x0 = retr ? Math.min(pts[0]!.x, pts[1]!.x) : pts[2]!.x;
  const x1 = Math.max(x0, i.width);
  const rows = levels.map((l) => ({ l, y: i.priceToY(l.price) }));
  if (rows.some((r) => !Number.isFinite(r.y))) return parts;

  if (retr) {
    // OTE под линиями: полупрозрачная заливка токена, контур не нужен (границы - линии 0.618/0.786 рядом)
    const o = oteRange(A, B);
    const ya = i.priceToY(o.from);
    const yb = i.priceToY(o.to);
    parts.unshift({ t: 'rect', x1: x0, x2: x1, y1: Math.min(ya, yb), y2: Math.max(ya, yb), dash: 'solid', hatch: false, noStroke: true });
  }

  for (const { l, y } of rows) {
    const hi = i.highlight === l.ratio;
    parts.push({
      t: 'seg',
      x1: x0,
      y1: y,
      x2: x1,
      y2: y,
      dash: l.info ? 'dashed' : retr && l.ratio === 0.5 ? 'dashed' : 'solid',
      w: levelWidth(i.kind, l, hi),
      level: l.ratio,
    });
    if (hi) parts.push({ t: 'glyph', g: 'dot', x: x0, y });
  }

  // Подписи: эталон (algo) - у правого края, пользователь - у левого якоря; P/D - с противоположной стороны.
  // Раскладка без наложений: важные (0, 0.5, 0.618, 1, выбранный) сдвигаются по вертикали, остальные скрываются.
  const left = i.side === 'left';
  const items: LabelItem[] = [];
  const texts = new Map<string, { text: string; level?: number; prio: number; w: number }>();
  const add = (key: string, text: string, x: number, y: number, prio: number, level?: number) => {
    const w = i.tw(text);
    texts.set(key, { text, prio, w, ...(level !== undefined ? { level } : {}) });
    items.push({ key, x, y, w, prio });
  };
  for (const { l, y } of rows) {
    const text = `${l.ratio} · ${i.fmt(l.price)}`;
    const w = i.tw(text);
    const prio = i.highlight === l.ratio ? -1 : labelPriority(l.ratio);
    add(`l${l.ratio}`, text, left ? x0 + w / 2 + LABEL_PAD + 8 : x1 - w / 2 - LABEL_PAD, y, prio, l.ratio);
  }
  if (retr) {
    // Premium / Discount - абсолютно (FIBONACCI §2.3): выше EQ - Premium, ниже - Discount, при любом направлении импульса
    const eqY = i.priceToY(fibLevelPrice(A, B, 0.5));
    const gap = i.pillH / 2 + 3;
    const px = (t: string) => (left ? x1 - i.tw(t) / 2 - LABEL_PAD : x0 + i.tw(t) / 2 + 6);
    if (i.compact) add('pd', 'P/D', px('P/D'), eqY - gap, 2.5);
    else {
      add('pdp', 'Premium', px('Premium'), eqY - gap, 2.5);
      add('pdd', 'Discount', px('Discount'), eqY + gap, 2.5);
    }
  }
  const placed = layoutLabels(items, i.pillH);
  for (const it of items) {
    const pos = placed.get(it.key);
    const t = texts.get(it.key)!;
    if (pos) parts.push({ t: 'text', text: t.text, x: pos.x, y: pos.y, prio: t.prio, ...(t.level !== undefined ? { level: t.level } : {}) });
  }
  return parts;
}
