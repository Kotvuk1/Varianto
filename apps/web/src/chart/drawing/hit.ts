// Хит-тест по пиксельной геометрии меток. Допуски: на касании >= 24 px радиус (цель >= 44x44, FR-DRAW-14).
import { CHAR_W, PILL_H, textWidth, type MarkGeometry, type Part } from './layout';

export interface Tolerance {
  /** Радиус ручки-якоря. */
  handle: number;
  /** Допуск до линии/контура/глифа. */
  body: number;
}

export type PointerKind = 'touch' | 'pen' | 'mouse';

export function toleranceFor(pointer: PointerKind): Tolerance {
  if (pointer === 'touch') return { handle: 24, body: 22 };
  if (pointer === 'pen') return { handle: 16, body: 14 };
  return { handle: 12, body: 8 };
}

export type Hit =
  | { markId: string; part: 'anchor'; anchorIndex: number }
  | { markId: string; part: 'body' };

export function distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

/** Расстояние от точки до границы прямоугольника; 0 внутри не возвращаем (внутри - отдельный случай). */
function distToRectEdge(px: number, py: number, r: { x1: number; y1: number; x2: number; y2: number }): number {
  return Math.min(
    distToSegment(px, py, r.x1, r.y1, r.x2, r.y1),
    distToSegment(px, py, r.x2, r.y1, r.x2, r.y2),
    distToSegment(px, py, r.x2, r.y2, r.x1, r.y2),
    distToSegment(px, py, r.x1, r.y2, r.x1, r.y1),
  );
}

const inside = (px: number, py: number, r: { x1: number; y1: number; x2: number; y2: number }) =>
  px >= r.x1 && px <= r.x2 && py >= r.y1 && py <= r.y2;

/** Оценка близости к части: расстояние (меньше - лучше) либо null, если вне допуска. Внутренность зоны хуже линий. */
function partScore(p: Part, x: number, y: number, tol: number): number | null {
  switch (p.t) {
    case 'seg': {
      const d = distToSegment(x, y, p.x1, p.y1, p.x2, p.y2);
      return d <= tol ? d : null;
    }
    case 'rect': {
      if (p.noStroke) return null; // заливка без контура (OTE) не перехватывает касания: выбирается по линиям уровней
      const d = distToRectEdge(x, y, p);
      if (d <= tol) return d;
      return inside(x, y, p) ? tol + 0.5 : null;
    }
    case 'glyph': {
      const d = Math.hypot(x - p.x, y - p.y);
      return d <= tol ? d : null;
    }
    case 'text': {
      const w = textWidth(p.text, p.state) || CHAR_W;
      const r = { x1: p.x - w / 2, x2: p.x + w / 2, y1: p.y - PILL_H / 2, y2: p.y + PILL_H / 2 };
      if (inside(x, y, r)) return 0;
      const d = distToRectEdge(x, y, r);
      return d <= tol ? d : null;
    }
  }
}

/**
 * Находит объект под указателем. Порядок: ручки выбранной метки, затем лучшая по близости часть любой метки
 * (при равенстве - верхняя, т.е. позднее в массиве).
 */
export function hitTest(
  geometries: readonly MarkGeometry[],
  x: number,
  y: number,
  tol: Tolerance,
  selectedId?: string | null,
): Hit | null {
  if (selectedId) {
    const g = geometries.find((m) => m.mark.id === selectedId);
    if (g) {
      let best: { index: number; d: number } | null = null;
      for (const h of g.handles) {
        const d = Math.hypot(x - h.x, y - h.y);
        if (d <= tol.handle && (!best || d < best.d)) best = { index: h.index, d };
      }
      if (best) return { markId: selectedId, part: 'anchor', anchorIndex: best.index };
    }
  }
  let bestId: string | null = null;
  let bestScore = Infinity;
  for (let i = geometries.length - 1; i >= 0; i--) {
    const g = geometries[i]!;
    for (const p of g.parts) {
      const s = partScore(p, x, y, tol.body);
      if (s !== null && s < bestScore) {
        bestScore = s;
        bestId = g.mark.id;
      }
    }
  }
  return bestId ? { markId: bestId, part: 'body' } : null;
}

/**
 * Уровень сетки Fibonacci под указателем (для выбора уровня в заданиях): ближайшая линия/подпись с `level`
 * в допуске тела. Область касания на тач-устройстве - полоса +-22 px (44 px).
 */
export function hitLevel(geometries: readonly MarkGeometry[], x: number, y: number, tol: Tolerance): { markId: string; level: number } | null {
  let best: { markId: string; level: number; d: number } | null = null;
  for (const g of geometries) {
    for (const p of g.parts) {
      if ((p.t !== 'seg' && p.t !== 'text') || p.level === undefined) continue;
      const d = p.t === 'seg' ? distToSegment(x, y, p.x1, p.y1, p.x2, p.y2) : partScore(p, x, y, tol.body);
      if (d !== null && d <= tol.body && (!best || d < best.d)) best = { markId: g.mark.id, level: p.level, d };
    }
  }
  return best ? { markId: best.markId, level: best.level } : null;
}
