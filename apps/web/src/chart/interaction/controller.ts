// Контроллер жестов разметки: чистая логика без DOM и LWC (зависимости инъецируются).
// Pointer Events приходят из TradingChart; возвращаемое true из pointerDown = жест принадлежит разметке
// (график в это время не скроллится).
import type { Anchor, Candle, Mark } from '@tl/core';
import { snapAnchor } from '../geometry/snap';
import type { TimeIndex } from '../geometry/timeIndex';
import { buildGeometry } from '../drawing/layout';
import { hitTest, toleranceFor, type Hit, type PointerKind } from '../drawing/hit';
import type { Projection } from '../drawing/projection';
import { constrainAnchors, createMark, isDrawKind, TOOL_DEFS, type DrawKind, type ToolId } from '../drawing/tools';

export interface PointerInput {
  x: number;
  y: number;
  pointer: PointerKind;
}

export interface ControllerDeps {
  proj: () => Projection;
  index: () => TimeIndex;
  candles: () => readonly Candle[];
  /** Редактируемые (пользовательские) метки. */
  marks: () => readonly Mark[];
  commit: (marks: Mark[]) => void;
  tool: () => ToolId | null;
  snap: () => boolean;
  selectedId: () => string | null;
  select: (id: string | null) => void;
  newId: () => string;
  /** Запрос перерисовки (превью / рабочая копия изменились). */
  invalidate?: () => void;
}

type Gesture =
  | { mode: 'draw'; kind: DrawKind; start: PointerInput; dragged: boolean }
  | { mode: 'anchor'; original: Mark; index: number; moved: boolean }
  | { mode: 'move'; original: Mark; start: PointerInput; moved: boolean };

const DRAG_THRESHOLD = 8;
export const PREVIEW_ID = '__preview__';

export class DrawingController {
  /** Рабочая копия перетаскиваемой метки (рисуется вместо оригинала). */
  override: Mark | null = null;
  /** Превью создаваемой метки. */
  preview: Mark | null = null;

  private pending: { kind: DrawKind; anchors: Anchor[] } | null = null;
  private gesture: Gesture | null = null;

  constructor(private readonly d: ControllerDeps) {}

  hasPending(): boolean {
    return this.pending !== null;
  }

  private anchorAt(x: number, y: number, kind: DrawKind | Mark['kind']): Anchor {
    const proj = this.d.proj();
    const idx = this.d.index();
    const raw = { time: proj.xToTime(x), price: proj.yToPrice(y) };
    const snapPrice = this.d.snap() && kind in TOOL_DEFS && TOOL_DEFS[kind as DrawKind].snapPrice;
    return snapAnchor(this.d.candles(), idx, raw, { price: snapPrice });
  }

  private geometries() {
    const proj = this.d.proj();
    return this.d.marks().map((m) => buildGeometry(m, proj));
  }

  private hit(p: PointerInput): Hit | null {
    return hitTest(this.geometries(), p.x, p.y, toleranceFor(p.pointer), this.d.selectedId());
  }

  private setPreview(kind: DrawKind, anchors: Anchor[]) {
    const need = TOOL_DEFS[kind].anchors;
    const filled = anchors.slice();
    while (filled.length < need) filled.push(filled[filled.length - 1]!);
    this.preview = createMark(kind, filled, PREVIEW_ID);
    this.d.invalidate?.();
  }

  private clearPreview() {
    this.preview = null;
    this.d.invalidate?.();
  }

  pointerDown(p: PointerInput): boolean {
    const tool = this.d.tool();
    if (isDrawKind(tool)) {
      if (this.pending && this.pending.kind !== tool) this.reset();
      this.gesture = { mode: 'draw', kind: tool, start: p, dragged: false };
      this.setPreview(tool, [...(this.pending?.anchors ?? []), this.anchorAt(p.x, p.y, tool)]);
      return true;
    }
    if (tool === 'eraser') {
      const hit = this.hit(p);
      if (!hit) return false;
      this.d.commit(this.d.marks().filter((m) => m.id !== hit.markId));
      if (this.d.selectedId() === hit.markId) this.d.select(null);
      return true;
    }
    if (tool === 'select') {
      const hit = this.hit(p);
      if (!hit) {
        this.d.select(null);
        return false;
      }
      const mark = this.d.marks().find((m) => m.id === hit.markId)!;
      this.d.select(hit.markId);
      this.gesture =
        hit.part === 'anchor'
          ? { mode: 'anchor', original: mark, index: hit.anchorIndex, moved: false }
          : { mode: 'move', original: mark, start: p, moved: false };
      return true;
    }
    return false;
  }

  /** Движение при нажатом указателе. */
  pointerMove(p: PointerInput): void {
    const g = this.gesture;
    if (!g) return;
    if (g.mode === 'draw') {
      const base = this.pending?.anchors ?? [];
      if (!g.dragged && Math.hypot(p.x - g.start.x, p.y - g.start.y) > DRAG_THRESHOLD) g.dragged = true;
      const first = base.length === 0 && g.dragged ? this.anchorAt(g.start.x, g.start.y, g.kind) : null;
      this.setPreview(g.kind, [...base, ...(first ? [first] : []), this.anchorAt(p.x, p.y, g.kind)]);
      return;
    }
    const proj = this.d.proj();
    if (g.mode === 'anchor') {
      const anchors = g.original.anchors.map((a) => ({ ...a }));
      anchors[g.index] = this.anchorAt(p.x, p.y, g.original.kind);
      this.override = { ...g.original, anchors: constrainAnchors(g.original.kind, anchors) };
      g.moved = true;
    } else {
      const idx = this.d.index();
      const dL = idx.timeToLogical(proj.xToTime(p.x)) - idx.timeToLogical(proj.xToTime(g.start.x));
      const k = Math.round(dL);
      const dP = proj.yToPrice(p.y) - proj.yToPrice(g.start.y);
      const anchors = g.original.anchors.map((a) => ({
        time: idx.logicalToTime(idx.timeToLogical(a.time) + k),
        price: a.price + dP,
      }));
      this.override = { ...g.original, anchors: constrainAnchors(g.original.kind, anchors) };
      g.moved = true;
    }
    this.d.invalidate?.();
  }

  /** Движение мыши без нажатия: превью второго/третьего якоря. */
  hover(p: PointerInput): void {
    if (this.pending && !this.gesture) {
      this.setPreview(this.pending.kind, [...this.pending.anchors, this.anchorAt(p.x, p.y, this.pending.kind)]);
    }
  }

  pointerUp(p: PointerInput): void {
    const g = this.gesture;
    this.gesture = null;
    if (!g) return;
    if (g.mode === 'draw') {
      const need = TOOL_DEFS[g.kind].anchors;
      const anchors = this.pending?.anchors.slice() ?? [];
      if (anchors.length === 0 && g.dragged && need >= 2) anchors.push(this.anchorAt(g.start.x, g.start.y, g.kind));
      anchors.push(this.anchorAt(p.x, p.y, g.kind));
      if (anchors.length >= need) {
        this.pending = null;
        this.clearPreview();
        this.d.commit([...this.d.marks(), createMark(g.kind, anchors.slice(0, need), this.d.newId())]);
      } else {
        this.pending = { kind: g.kind, anchors };
        this.setPreview(g.kind, anchors);
      }
      return;
    }
    const over = this.override;
    this.override = null;
    this.d.invalidate?.();
    if (over && g.moved) {
      this.d.commit(this.d.marks().map((m) => (m.id === over.id ? over : m)));
    }
  }

  /** Прерывает активный жест (например, второй палец), не трогая уже поставленные якоря. */
  cancelGesture(): void {
    this.gesture = null;
    this.override = null;
    if (this.pending) this.setPreview(this.pending.kind, this.pending.anchors);
    else this.clearPreview();
  }

  /** Полный сброс: жест, ожидающие якоря, превью (смена инструмента, Esc). */
  reset(): void {
    this.gesture = null;
    this.pending = null;
    this.override = null;
    this.clearPreview();
  }

  deleteSelected(): void {
    const id = this.d.selectedId();
    if (!id) return;
    this.d.commit(this.d.marks().filter((m) => m.id !== id));
    this.d.select(null);
  }
}
