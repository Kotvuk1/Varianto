// Контроллер жестов разметки: чистая логика без DOM и LWC (зависимости инъецируются).
// Pointer Events приходят из TradingChart; возвращаемое true из pointerDown = жест принадлежит разметке
// (график в это время не скроллится).
import type { Anchor, Candle, Mark, Scope } from '@tl/core';
import type { TimeIndex } from '../geometry/timeIndex';
import { buildGeometry } from '../drawing/layout';
import { hitLevel, hitTest, toleranceFor, type Hit, type PointerKind } from '../drawing/hit';
import type { Projection } from '../drawing/projection';
import {
  constrainAnchors,
  createMark,
  drawKindOf,
  isDrawTool,
  isScopedKind,
  SWING_SIDE,
  TOOL_DEFS,
  ZONE_KIND,
  type DrawKind,
  type MarkExtra,
  type ToolId,
} from '../drawing/tools';
import { ewDirection, ewLabels, EW_IMPULSE_SIZES, firstSideOf, isEwKind, sideAt, snapExtreme } from '../ew/model';
import { fibDirection, isFibKind } from '../fib/model';
import { snapFibAnchor } from '../fib/snap';
import { normalizeMark } from '../smc/normalize';
import { isEntryLocked, isLimitMark, isZoneMark, limitSideOf, nearestEdge, withDerivedMeta } from '../zone/model';
import { snapZoneEdge } from '../zone/snap';
import {
  localExtremeIndex,
  resolveBreak,
  resolveFvg,
  resolveOb,
  resolveSwing,
  resolveSweep,
  resolveWick,
  sideByPrice,
  type SwingRef,
} from '../smc/rules';

export interface PointerInput {
  x: number;
  y: number;
  pointer: PointerKind;
}

/** Подсказки обучения: контроллер не знает текстов, UI сопоставляет коды со строками. */
export type NoticeCode = 'bos-wick-only' | 'no-fvg' | 'fvg-unclosed' | 'before-swing' | 'no-sweep' | 'sweep-is-break' | 'fib-same-point' | 'ew-order' | 'zone-flat';

export interface ControllerNotice {
  /** Сколько касаний уже сделано в текущей метке (0 - ничего не ожидается). */
  step: number;
  code: NoticeCode | null;
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
  /** Шаг мастера и мягкие предупреждения (строка-инструкция). */
  notify?: (n: ControllerNotice) => void;
  fmt?: (price: number) => string;
  /** Структура и ATR для подписи «запас стопа» (геометрия должна совпадать с рисуемой). */
  slHint?: () => { structure: number; atr: number } | undefined;
  /** Текущий слой для BOS/CHoCH (null - не задан). */
  scope?: () => Scope | null;
  /** Метки алгоритма (только чтение): нужны для выбора уровня сетки Fibonacci. */
  readOnlyMarks?: () => readonly Mark[];
  /** Выбор уровня сетки касанием (если не задан - выбор отключён). */
  onLevelPick?: (pick: { markId: string; level: number }) => void;
  /** Выбор уровня включён (подписчик есть): без него касание сеток не перехватывается. По умолчанию - если задан onLevelPick. */
  levelPickEnabled?: () => boolean;
}

type Gesture =
  | { mode: 'draw'; kind: DrawKind; start: PointerInput; dragged: boolean }
  | { mode: 'anchor'; original: Mark; index: number; moved: boolean }
  | { mode: 'move'; original: Mark; start: PointerInput; moved: boolean }
  | { mode: 'pick'; start: PointerInput; markId: string; level: number; moved: boolean };

interface Pending {
  kind: DrawKind;
  anchors: Anchor[];
  swing?: SwingRef;
}

type Built =
  | { t: 'mark'; anchors: Anchor[]; extra: MarkExtra; notice?: NoticeCode }
  | { t: 'pending'; anchors: Anchor[]; swing?: SwingRef }
  | { t: 'reject'; code: NoticeCode }
  | { t: 'none' };

const DRAG_THRESHOLD = 8;
export const PREVIEW_ID = '__preview__';

function ewExtra(kind: DrawKind, anchors: readonly Anchor[]): MarkExtra {
  return { direction: ewDirection(anchors), meta: { labels: ewLabels(kind as 'ew-impulse', anchors.length) } };
}

export class DrawingController {
  /** Рабочая копия перетаскиваемой метки (рисуется вместо оригинала). */
  override: Mark | null = null;
  /** Превью создаваемой метки. */
  preview: Mark | null = null;

  private pending: Pending | null = null;
  private gesture: Gesture | null = null;

  constructor(private readonly d: ControllerDeps) {}

  hasPending(): boolean {
    return this.pending !== null;
  }

  private emit(code: NoticeCode | null) {
    this.d.notify?.({ step: this.pending ? this.pending.anchors.length : 0, code });
  }

  /** Свеча под точкой касания и сырая цена. null - точка вне шкал. */
  private touch(p: PointerInput): { i: number; price: number } | null {
    const proj = this.d.proj();
    const idx = this.d.index();
    const l = idx.timeToLogical(proj.xToTime(p.x));
    const price = proj.yToPrice(p.y);
    if (!Number.isFinite(l) || !Number.isFinite(price) || this.d.candles().length === 0) return null;
    return { i: idx.snapIndex(l), price };
  }

  /** Радиус снапа цены к фитилю в единицах цены (в пикселях зависит от указателя). */
  private priceRadius(p: PointerInput): number {
    const proj = this.d.proj();
    const px = p.pointer === 'touch' ? 24 : p.pointer === 'pen' ? 16 : 12;
    const r = Math.abs(proj.yToPrice(p.y - px) - proj.yToPrice(p.y));
    return Number.isFinite(r) ? r : 0;
  }

  /** Последняя цена ряда: сторона лимитного ордера определяется относительно неё. */
  private lastPrice(): number {
    const c = this.d.candles();
    return c[c.length - 1]?.close ?? 0;
  }

  private lineAnchor(p: PointerInput, t: { i: number; price: number }): Anchor {
    const c = this.d.candles();
    if (!this.d.snap()) return { time: c[t.i]!.openTime, price: t.price };
    return resolveWick(c, t.i, t.price, this.priceRadius(p));
  }

  private geometries() {
    const proj = this.d.proj();
    const fmt = this.d.fmt;
    const slHint = this.d.slHint?.();
    return this.d.marks().map((m) => buildGeometry(m, proj, { ...(fmt ? { fmt } : {}), ...(slHint ? { slHint } : {}) }));
  }

  private hit(p: PointerInput): Hit | null {
    return hitTest(this.geometries(), p.x, p.y, toleranceFor(p.pointer), this.d.selectedId());
  }

  /** Первый шаг BOS/CHoCH: существующая swing-метка приоритетнее, иначе локальный экстремум у касания. */
  private swingFromTouch(p: PointerInput, t: { i: number; price: number }): { anchor: Anchor; ref: SwingRef } {
    const c = this.d.candles();
    const h = this.hit(p);
    if (h) {
      const m = this.d.marks().find((x) => x.id === h.markId);
      const side = m && SWING_SIDE[m.kind];
      if (m && side && m.anchors[0]) {
        const idx = this.d.index();
        const i = idx.snapIndex(idx.timeToLogical(m.anchors[0].time));
        return { anchor: m.anchors[0], ref: { index: i, side } };
      }
    }
    const side = sideByPrice(c[t.i]!, t.price);
    const k = localExtremeIndex(c, t.i, side);
    return { anchor: resolveSwing(c, t.i, side), ref: { index: k, side } };
  }

  /** Результат касания p для инструмента kind при текущем ожидающем состоянии (без побочных эффектов). */
  private build(kind: DrawKind, p: PointerInput, pending: Pending | null): Built {
    const t = this.touch(p);
    if (!t) return { t: 'none' };
    const c = this.d.candles();
    const side = SWING_SIDE[kind];
    if (side) return { t: 'mark', anchors: [resolveSwing(c, t.i, side)], extra: {} };
    switch (kind) {
      case 'bos':
      case 'choch': {
        if (!pending?.swing) {
          const s = this.swingFromTouch(p, t);
          return { t: 'pending', anchors: [s.anchor], swing: s.ref };
        }
        const r = resolveBreak(c, pending.swing, t.i);
        if (!r.ok) return { t: 'reject', code: 'before-swing' };
        return { t: 'mark', anchors: r.anchors, extra: { direction: r.direction, scope: this.d.scope?.() ?? null }, ...(r.bodyClosed ? {} : { notice: 'bos-wick-only' as const }) };
      }
      case 'fvg': {
        const r = resolveFvg(c, t.i);
        if (!r.ok) return { t: 'reject', code: r.reason === 'unclosed' ? 'fvg-unclosed' : 'no-fvg' };
        return { t: 'mark', anchors: r.anchors, extra: { direction: r.direction, meta: { middleTime: r.middleTime } } };
      }
      case 'order-block': {
        const r = resolveOb(c, t.i);
        return { t: 'mark', anchors: r.anchors, extra: { direction: r.direction } };
      }
      case 'sweep': {
        const r = resolveSweep(c, t.i, sideByPrice(c[t.i]!, t.price));
        if (!r.ok) return { t: 'reject', code: r.reason === 'is-break' ? 'sweep-is-break' : 'no-sweep' };
        return { t: 'mark', anchors: r.anchors, extra: { direction: r.direction } };
      }
      case 'ew-impulse':
      case 'ew-zigzag':
      case 'ew-flat': {
        const prev = pending?.anchors ?? [];
        // стороны чередуются от первой точки; вторая точка выбирает сторону по движению цены
        const first = prev.length >= 2 ? firstSideOf(prev[0]!, prev[1]!) : sideByPrice(c[t.i]!, t.price);
        const side = prev.length === 0 ? first : prev.length === 1 ? (t.price >= prev[0]!.price ? 'high' : 'low') : sideAt(first, prev.length);
        const a = this.d.snap() ? snapExtreme(c, t.i, side) : { time: c[t.i]!.openTime, price: t.price };
        if (prev.length > 0 && a.time <= prev[prev.length - 1]!.time) return { t: 'reject', code: 'ew-order' };
        const anchors = [...prev, a];
        if (anchors.length < TOOL_DEFS[kind].taps) return { t: 'pending', anchors };
        return { t: 'mark', anchors, extra: ewExtra(kind, anchors) };
      }
      case 'fib-retracement':
      case 'fib-extension': {
        const a = this.d.snap() ? snapFibAnchor(c, t.i, t.price) : { time: c[t.i]!.openTime, price: t.price };
        const prev = pending?.anchors ?? [];
        // вторая точка на той же цене, что и первая: сетка вырождена
        if (prev.length === 1 && prev[0]!.price === a.price) return { t: 'reject', code: 'fib-same-point' };
        const anchors = [...prev, a];
        if (anchors.length < TOOL_DEFS[kind].taps) return { t: 'pending', anchors };
        const direction = fibDirection(anchors[0]!.price, anchors[1]!.price);
        return { t: 'mark', anchors, extra: { direction } };
      }
      case ZONE_KIND: {
        const a = this.d.snap()
          ? { time: c[t.i]!.openTime, price: snapZoneEdge(c, t.i, t.price, this.priceRadius(p)) }
          : { time: c[t.i]!.openTime, price: t.price };
        const prev = pending?.anchors ?? [];
        // оба края на одной цене: зона вырождена
        if (prev.length === 1 && prev[0]!.price === a.price) return { t: 'reject', code: 'zone-flat' };
        const anchors = [...prev, a];
        return anchors.length >= TOOL_DEFS[kind].taps ? { t: 'mark', anchors, extra: {} } : { t: 'pending', anchors };
      }
      default: {
        if (kind === 'hline' && this.d.tool() === 'limit') {
          // лимитка: точная цена касания (без снапа), одна на график
          const price = t.price;
          return { t: 'mark', anchors: [{ time: c[t.i]!.openTime, price }], extra: { meta: { role: 'limit', side: limitSideOf(price, this.lastPrice()) } } };
        }
        const a = kind === 'position' ? { time: c[t.i]!.openTime, price: t.price } : this.lineAnchor(p, t);
        const anchors = [...(pending?.anchors ?? []), a];
        const extra: MarkExtra = kind === 'hline' && this.d.tool() === 'ew-invalidation' ? { meta: { role: 'ew-invalidation' } } : {};
        return anchors.length >= TOOL_DEFS[kind].taps ? { t: 'mark', anchors, extra } : { t: 'pending', anchors };
      }
    }
  }

  private showPreview(kind: DrawKind, b: Built) {
    if (b.t === 'mark') this.preview = createMark(kind, b.anchors, PREVIEW_ID, b.extra);
    else if (b.t === 'pending' || (b.t === 'reject' && this.pending)) {
      const anchors = (b.t === 'pending' ? b.anchors : this.pending!.anchors).slice();
      while (anchors.length < TOOL_DEFS[kind].anchors) anchors.push(anchors[anchors.length - 1]!);
      const real = b.t === 'pending' ? b.anchors.length : this.pending!.anchors.length;
      const fibMeta = isEwKind(kind)
        ? { meta: { draft: real }, direction: ewDirection(anchors) }
        : isFibKind(kind) ? { meta: { draft: real }, direction: fibDirection(anchors[0]!.price, anchors[1]!.price) } : {};
      this.preview = createMark(kind, anchors, PREVIEW_ID, isScopedKind(kind) ? { scope: this.d.scope?.() ?? null } : fibMeta);
    } else this.preview = null;
    this.d.invalidate?.();
  }

  private clearPreview() {
    this.preview = null;
    this.d.invalidate?.();
  }

  /** Применяет касание: мутирует pending / коммитит метку / выдаёт предупреждение. */
  private advance(kind: DrawKind, b: Built) {
    if (b.t === 'pending') {
      this.pending = { kind, anchors: b.anchors, ...(b.swing ? { swing: b.swing } : {}) };
      this.showPreview(kind, b);
      this.emit(null);
    } else if (b.t === 'mark') {
      this.pending = null;
      this.clearPreview();
      const created = createMark(kind, b.anchors, this.d.newId(), b.extra);
      // лимитный ордер один: новый заменяет прежний
      const rest = isLimitMark(created) ? this.d.marks().filter((m) => !isLimitMark(m)) : this.d.marks();
      this.d.commit([...rest, created]);
      this.emit(b.notice ?? null);
    } else if (b.t === 'reject') {
      this.showPreview(kind, b);
      this.emit(b.code);
    }
  }

  pointerDown(p: PointerInput): boolean {
    const tool = this.d.tool();
    if (isDrawTool(tool)) {
      const kind = drawKindOf(tool)!;
      if (this.pending && this.pending.kind !== kind) this.reset();
      this.gesture = { mode: 'draw', kind, start: p, dragged: false };
      this.showPreview(kind, this.build(kind, p, this.pending));
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
        return this.startPick(p);
      }
      const mark = this.d.marks().find((m) => m.id === hit.markId)!;
      this.d.select(hit.markId);
      if (hit.part === 'anchor') {
        this.gesture = { mode: 'anchor', original: mark, index: hit.anchorIndex, moved: false };
        return true;
      }
      const axis = this.axisGrab(mark, p);
      if (axis !== undefined) {
        // null - захват запрещён (вход позиции зафиксирован), число - перетаскивание цены выбранной линии/края
        this.gesture = axis === null ? null : { mode: 'anchor', original: mark, index: axis, moved: false };
        return true;
      }
      this.gesture = { mode: 'move', original: mark, start: p, moved: false };
      return true;
    }
    return this.startPick(p);
  }

  /**
   * Метки с ценовой осью: захват за линию двигает только цену. undefined - обычное перемещение метки;
   * null - захват запрещён (вход позиции ступени 4); число - индекс якоря, чья цена двигается.
   */
  private axisGrab(mark: Mark, p: PointerInput): number | null | undefined {
    const proj = this.d.proj();
    const tol = toleranceFor(p.pointer).body;
    if (isLimitMark(mark)) return 0;
    if (isEntryLocked(mark)) {
      const i = nearestEdge(mark.anchors.map((a) => proj.priceToY(a.price)), p.y, Number.POSITIVE_INFINITY);
      return i === null || i === 0 ? null : i;
    }
    if (isZoneMark(mark)) {
      const e = nearestEdge(mark.anchors.map((a) => proj.priceToY(a.price)), p.y, tol);
      return e === null ? undefined : e;
    }
    return undefined;
  }

  /** Касание линии/подписи уровня сетки алгоритма: выбор уровня (если подписка задана), срабатывает на отпускание без сдвига. */
  private startPick(p: PointerInput): boolean {
    if (!this.d.onLevelPick || !this.d.readOnlyMarks || (this.d.levelPickEnabled && !this.d.levelPickEnabled())) return false;
    const proj = this.d.proj();
    const fmt = this.d.fmt;
    const geos = this.d
      .readOnlyMarks()
      .filter((m) => isFibKind(m.kind))
      .map((m) => buildGeometry(m, proj, fmt ? { fmt } : {}));
    const h = hitLevel(geos, p.x, p.y, toleranceFor(p.pointer));
    if (!h) return false;
    this.gesture = { mode: 'pick', start: p, markId: h.markId, level: h.level, moved: false };
    return true;
  }

  /** Движение при нажатом указателе. */
  pointerMove(p: PointerInput): void {
    const g = this.gesture;
    if (!g) return;
    if (g.mode === 'pick') {
      if (Math.hypot(p.x - g.start.x, p.y - g.start.y) > DRAG_THRESHOLD) g.moved = true;
      return;
    }
    if (g.mode === 'draw') {
      if (!g.dragged && Math.hypot(p.x - g.start.x, p.y - g.start.y) > DRAG_THRESHOLD) g.dragged = true;
      if (g.dragged && !this.pending && TOOL_DEFS[g.kind].taps >= 2) {
        const first = this.build(g.kind, g.start, null);
        const second = first.t === 'pending' ? this.build(g.kind, p, { kind: g.kind, anchors: first.anchors, ...(first.swing ? { swing: first.swing } : {}) }) : first;
        this.showPreview(g.kind, second);
      } else this.showPreview(g.kind, this.build(g.kind, p, this.pending));
      return;
    }
    const proj = this.d.proj();
    const idx = this.d.index();
    const candles = this.d.candles();
    let next: Mark;
    if (g.mode === 'anchor') {
      const t = this.touch(p);
      if (!t) return;
      const anchors = g.original.anchors.map((a) => ({ ...a }));
      const priceOnly = isZoneMark(g.original) || isLimitMark(g.original) || isEntryLocked(g.original);
      const line = !(g.original.kind in SWING_SIDE) && ['level', 'hline', 'trendline', 'position'].includes(g.original.kind);
      anchors[g.index] = priceOnly
        ? {
            time: g.original.anchors[g.index]!.time,
            price: isZoneMark(g.original) && this.d.snap() ? snapZoneEdge(candles, t.i, t.price, this.priceRadius(p)) : t.price,
          }
        : isEwKind(g.original.kind)
        ? this.d.snap()
          ? snapExtreme(candles, t.i, sideAt(firstSideOf(g.original.anchors[0]!, g.original.anchors[1] ?? g.original.anchors[0]!), g.index))
          : { time: candles[t.i]!.openTime, price: t.price }
        : isFibKind(g.original.kind)
        ? this.d.snap()
          ? snapFibAnchor(candles, t.i, t.price)
          : { time: candles[t.i]!.openTime, price: t.price }
        : line && g.original.kind !== 'position'
          ? this.lineAnchor(p, t)
          : { time: candles[t.i]!.openTime, price: t.price };
      next = { ...g.original, anchors: constrainAnchors(g.original.kind, anchors) };
      g.moved = true;
    } else {
      const dL = idx.timeToLogical(proj.xToTime(p.x)) - idx.timeToLogical(proj.xToTime(g.start.x));
      const k = Math.round(dL);
      const dP = proj.yToPrice(p.y) - proj.yToPrice(g.start.y);
      if (!Number.isFinite(k) || !Number.isFinite(dP)) return;
      const anchors = g.original.anchors.map((a) => ({
        time: idx.logicalToTime(idx.timeToLogical(a.time) + k),
        price: a.price + dP,
      }));
      next = { ...g.original, anchors: constrainAnchors(g.original.kind, anchors) };
      g.moved = true;
    }
    // Правила формы действуют и при правке: недопустимое место - метка остаётся на прежнем.
    const normalized = normalizeMark(next, candles, idx);
    this.override = normalized ? withDerivedMeta(normalized, this.lastPrice()) : g.original;
    this.d.invalidate?.();
  }

  /** Движение мыши без нажатия: превью следующего касания. */
  hover(p: PointerInput): void {
    if (this.pending && !this.gesture) this.showPreview(this.pending.kind, this.build(this.pending.kind, p, this.pending));
  }

  pointerUp(p: PointerInput): void {
    const g = this.gesture;
    this.gesture = null;
    if (!g) return;
    if (g.mode === 'pick') {
      if (!g.moved && Math.hypot(p.x - g.start.x, p.y - g.start.y) <= DRAG_THRESHOLD) this.d.onLevelPick?.({ markId: g.markId, level: g.level });
      return;
    }
    if (g.mode === 'draw') {
      if (g.dragged && !this.pending && TOOL_DEFS[g.kind].taps >= 2) {
        const first = this.build(g.kind, g.start, null);
        if (first.t === 'pending') {
          this.pending = { kind: g.kind, anchors: first.anchors, ...(first.swing ? { swing: first.swing } : {}) };
        }
      }
      this.advance(g.kind, this.build(g.kind, p, this.pending));
      return;
    }
    const over = this.override;
    this.override = null;
    this.d.invalidate?.();
    if (over && g.moved && over !== g.original) {
      this.d.commit(this.d.marks().map((m) => (m.id === over.id ? over : m)));
    }
  }

  /** Можно ли завершить неполную разметку Elliott кнопкой «Готово» (импульс из 3 или 5 точек). */
  canFinish(): boolean {
    const p = this.pending;
    return !!p && p.kind === 'ew-impulse' && p.anchors.length < 6 && (EW_IMPULSE_SIZES as readonly number[]).includes(p.anchors.length);
  }

  /** «Готово»: фиксирует неполный импульс (3 или 5 точек) как метку. */
  finish(): boolean {
    const p = this.pending;
    if (!p || !this.canFinish()) return false;
    this.pending = null;
    this.gesture = null;
    this.clearPreview();
    this.d.commit([...this.d.marks(), createMark(p.kind, p.anchors, this.d.newId(), ewExtra(p.kind, p.anchors))]);
    this.emit(null);
    return true;
  }

  /** Прерывает активный жест (например, второй палец), не трогая уже поставленные якоря. */
  cancelGesture(): void {
    this.gesture = null;
    this.override = null;
    if (this.pending) this.showPreview(this.pending.kind, { t: 'pending', anchors: this.pending.anchors });
    else this.clearPreview();
  }

  /** Полный сброс: жест, ожидающие якоря, превью (смена инструмента, Esc). */
  reset(): void {
    this.gesture = null;
    this.pending = null;
    this.override = null;
    this.clearPreview();
    this.emit(null);
  }

  deleteSelected(): void {
    const id = this.d.selectedId();
    if (!id) return;
    this.d.commit(this.d.marks().filter((m) => m.id !== id));
    this.d.select(null);
  }
}
