// Чистая геометрия меток: Mark + Projection -> набор пиксельных частей (для рендера и хит-теста).
import type { Mark } from '@tl/core';
import type { Projection } from './projection';
import { makePriceFormatter } from '../priceFormat';
import { TOOL_DEFS, type DrawKind } from './tools';

export type Dash = 'solid' | 'dashed' | 'dotted';
export type GlyphKind = 'tri-up' | 'tri-down' | 'dot' | 'arrow-up' | 'arrow-down';

export type Part =
  | { t: 'seg'; x1: number; y1: number; x2: number; y2: number; dash: Dash }
  | { t: 'rect'; x1: number; y1: number; x2: number; y2: number; dash: Dash; hatch: boolean }
  | { t: 'glyph'; g: GlyphKind; x: number; y: number }
  /** Подпись-плашка (залитая у user, контурная у algo). (x, y) - центр. */
  | { t: 'text'; text: string; x: number; y: number };

export interface Handle {
  x: number;
  y: number;
  index: number;
}

export interface MarkGeometry {
  mark: Mark;
  parts: Part[];
  handles: Handle[];
}

export const GLYPH_OFFSET = 14;
export const CHAR_W = 6.6;
export const PILL_H = 18;

/** Форматер по умолчанию (если tickSize неизвестен): 2 знака, пробел-разделитель, запятая. */
export const formatPrice = makePriceFormatter(0.01);

export interface GeometryOptions {
  /** Единый форматер цен символа (priceFormat.ts). */
  fmt?: (price: number) => string;
}

export const textWidth = (text: string): number => text.length * CHAR_W + 12;

/** Грубая проверка видимости до построения геометрии (дёшево, O(anchors)). */
export function isMarkVisible(mark: Mark, proj: Projection, margin = 60): boolean {
  if (mark.anchors.length === 0) return false;
  const xs = mark.anchors.map((a) => proj.timeToX(a.time));
  const ys = mark.anchors.map((a) => proj.priceToY(a.price));
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const yOk = maxY >= -margin && minY <= proj.height + margin;
  if (!yOk) return false;
  if (mark.kind === 'level') return true;
  if (mark.kind === 'hline' || mark.kind === 'position') return minX <= proj.width + margin;
  return maxX >= -margin && minX <= proj.width + margin;
}

const norm = (x1: number, y1: number, x2: number, y2: number) => ({
  x1: Math.min(x1, x2),
  x2: Math.max(x1, x2),
  y1: Math.min(y1, y2),
  y2: Math.max(y1, y2),
});

export function buildGeometry(mark: Mark, proj: Projection, opts: GeometryOptions = {}): MarkGeometry {
  const fmt = opts.fmt ?? formatPrice;
  const kind = mark.kind;
  const pts = mark.anchors.map((a) => ({ x: proj.timeToX(a.time), y: proj.priceToY(a.price) }));
  // Зоны и sweep имеют вычисляемую форму: двигается только «опорный» якорь, остальное пересчитывается по правилам.
  const editable = kind === 'fvg' || kind === 'order-block' ? [0] : kind === 'sweep' ? [1] : null;
  const handles: Handle[] = pts.map((p, index) => ({ x: p.x, y: p.y, index })).filter((h) => !editable || editable.includes(h.index));
  const parts: Part[] = [];
  const p0 = pts[0];
  const p1 = pts[1];
  const label = kind in TOOL_DEFS ? TOOL_DEFS[kind as DrawKind].label : (String(mark.meta?.patternType ?? 'Pattern'));

  if (!p0) return { mark, parts, handles };

  switch (kind) {
    case 'swing-high':
    case 'hh':
    case 'lh':
      // маркер над high, подпись ещё выше: свечи не перекрываются
      parts.push({ t: 'glyph', g: 'tri-down', x: p0.x, y: p0.y - GLYPH_OFFSET });
      parts.push({ t: 'text', text: label, x: p0.x, y: p0.y - GLYPH_OFFSET - 16 });
      break;
    case 'swing-low':
    case 'hl':
    case 'll':
      parts.push({ t: 'glyph', g: 'tri-up', x: p0.x, y: p0.y + GLYPH_OFFSET });
      parts.push({ t: 'text', text: label, x: p0.x, y: p0.y + GLYPH_OFFSET + 16 });
      break;
    case 'bos':
    case 'choch': {
      if (!p1) break;
      const dash: Dash = kind === 'bos' ? 'solid' : 'dashed';
      const below = mark.direction === 'bear';
      parts.push({ t: 'seg', x1: p0.x, y1: p0.y, x2: p1.x, y2: p0.y, dash });
      parts.push({ t: 'text', text: label, x: (p0.x + p1.x) / 2, y: p0.y + (below ? 12 : -12) });
      break;
    }
    case 'sweep': {
      if (!p1) break;
      parts.push({ t: 'seg', x1: p0.x, y1: p0.y, x2: p1.x, y2: p0.y, dash: 'solid' });
      const up = mark.direction ? mark.direction === 'bear' : p1.y <= p0.y;
      parts.push({ t: 'glyph', g: up ? 'arrow-up' : 'arrow-down', x: p1.x, y: p1.y + (up ? -GLYPH_OFFSET : GLYPH_OFFSET) });
      parts.push({ t: 'text', text: label, x: p1.x, y: p1.y + (up ? -GLYPH_OFFSET - 18 : GLYPH_OFFSET + 18) });
      break;
    }
    case 'order-block':
    case 'fvg': {
      if (!p1) break;
      const r = norm(p0.x, p0.y, p1.x, p1.y);
      parts.push({ t: 'rect', ...r, dash: kind === 'fvg' ? 'dashed' : 'solid', hatch: kind === 'fvg' });
      // подпись над верхней границей зоны, у левого края
      parts.push({ t: 'text', text: label, x: r.x1 + textWidth(label) / 2, y: r.y1 - PILL_H / 2 - 2 });
      break;
    }
    case 'level':
      parts.push({ t: 'seg', x1: 0, y1: p0.y, x2: proj.width, y2: p0.y, dash: 'solid' });
      parts.push({ t: 'text', text: fmt(mark.anchors[0]!.price), x: proj.width - textWidth(fmt(mark.anchors[0]!.price)) / 2 - 6, y: p0.y - 12 });
      break;
    case 'hline':
      parts.push({ t: 'seg', x1: p0.x, y1: p0.y, x2: proj.width, y2: p0.y, dash: 'solid' });
      parts.push({ t: 'glyph', g: 'dot', x: p0.x, y: p0.y });
      parts.push({ t: 'text', text: fmt(mark.anchors[0]!.price), x: p0.x + textWidth(fmt(mark.anchors[0]!.price)) / 2 + 8, y: p0.y - 12 });
      break;
    case 'trendline':
      if (p1) parts.push({ t: 'seg', x1: p0.x, y1: p0.y, x2: p1.x, y2: p1.y, dash: 'solid' });
      break;
    case 'position': {
      const names: [string, Dash][] = [
        ['Вход', 'dotted'],
        ['SL', 'dashed'],
        ['TP', 'solid'],
      ];
      pts.forEach((p, i) => {
        const [name, dash] = names[i] ?? ['', 'solid'];
        parts.push({ t: 'seg', x1: p0.x, y1: p.y, x2: proj.width, y2: p.y, dash });
        parts.push({ t: 'text', text: name, x: p0.x + textWidth(name) / 2 + 6, y: p.y - 12 });
      });
      break;
    }
    default:
      parts.push({ t: 'text', text: label, x: p0.x, y: p0.y - GLYPH_OFFSET });
  }
  return { mark, parts, handles };
}
