import type { Anchor, Mark, MarkKind, Scope } from '@tl/core';

/** Вид метки «зона уровня» (CURRICULUM_STAGES §3.5). */
export const ZONE_KIND = 'zone' satisfies MarkKind;
/** Виды меток, которые пользователь может рисовать (pattern - только алгоритм). */
export type DrawKind = Exclude<MarkKind, 'pattern'>;
/**
 * 'ew-invalidation' - горизонталь invalidation (hline с meta.role = 'ew-invalidation');
 * 'limit' - лимитный ордер (hline с meta.role = 'limit', meta.side = 'buy' | 'sell').
 */
export type ToolId = 'select' | 'eraser' | 'ew-invalidation' | 'limit' | DrawKind;

export interface ToolDef {
  /** Сколько якорей хранит метка. */
  anchors: 1 | 2 | 3 | 6;
  /** Сколько касаний нужно для создания (FVG/OB/Sweep - одно касание, якорей два). */
  taps: 1 | 2 | 3 | 6;
  /** Снап цены к фитилю включён по умолчанию (линии; для SMC-типов снап обязателен всегда). */
  snapPrice: boolean;
  /** Короткая подпись на графике (SMC-термин, не локализуется). */
  label: string;
}

export const TOOL_DEFS: Readonly<Record<DrawKind, ToolDef>> = {
  'swing-high': { anchors: 1, taps: 1, snapPrice: true, label: 'SwH' },
  'swing-low': { anchors: 1, taps: 1, snapPrice: true, label: 'SwL' },
  hh: { anchors: 1, taps: 1, snapPrice: true, label: 'HH' },
  hl: { anchors: 1, taps: 1, snapPrice: true, label: 'HL' },
  lh: { anchors: 1, taps: 1, snapPrice: true, label: 'LH' },
  ll: { anchors: 1, taps: 1, snapPrice: true, label: 'LL' },
  bos: { anchors: 2, taps: 2, snapPrice: true, label: 'BOS' },
  choch: { anchors: 2, taps: 2, snapPrice: true, label: 'CHoCH' },
  sweep: { anchors: 2, taps: 1, snapPrice: true, label: 'Sweep' },
  'order-block': { anchors: 2, taps: 1, snapPrice: true, label: 'OB' },
  fvg: { anchors: 2, taps: 1, snapPrice: true, label: 'FVG' },
  level: { anchors: 1, taps: 1, snapPrice: true, label: '' },
  hline: { anchors: 1, taps: 1, snapPrice: true, label: '' },
  trendline: { anchors: 2, taps: 2, snapPrice: true, label: '' },
  /** Зона уровня: 2 якоря (верх, низ цены), общее время начала; тянется вправо. */
  zone: { anchors: 2, taps: 2, snapPrice: true, label: '' },
  position: { anchors: 3, taps: 3, snapPrice: false, label: '' },
  'fib-retracement': { anchors: 2, taps: 2, snapPrice: true, label: 'Fib' },
  'fib-extension': { anchors: 3, taps: 3, snapPrice: true, label: 'Fib ext' },
  /** Импульс 0..5; до 6 касаний, неполную разметку (3 или 5 точек) завершает «Готово». */
  'ew-impulse': { anchors: 6, taps: 6, snapPrice: true, label: 'EW' },
  'ew-zigzag': { anchors: 3, taps: 3, snapPrice: true, label: 'ZZ' },
  'ew-flat': { anchors: 3, taps: 3, snapPrice: true, label: 'Flat' },
};

/** Инструмент -> вид создаваемой метки. */
export const drawKindOf = (t: ToolId): DrawKind | null => (t === 'select' || t === 'eraser' ? null : t === 'ew-invalidation' || t === 'limit' ? 'hline' : t);

/** Инструменты, которым нужен выбор слоя (Внешняя / Внутренняя). */
export const isScopedKind = (t: ToolId | null): boolean => t === 'bos' || t === 'choch';

export const isDrawKind = (t: ToolId | null): t is DrawKind => t !== null && t !== 'select' && t !== 'eraser' && t !== 'ew-invalidation' && t !== 'limit';
/** Любой инструмент рисования (включая «Инвалидацию»). */
export const isDrawTool = (t: ToolId | null): t is Exclude<ToolId, 'select' | 'eraser'> => t !== null && t !== 'select' && t !== 'eraser';

/**
 * Инварианты формы метки по типу. Вызывается при создании и при каждом перетаскивании якоря.
 * - BOS/CHoCH: линия горизонтальна на цене свинга (anchors[0]); второй якорь задаёт только свечу пробоя.
 * - position: вход/SL/TP делят одно время (anchors[0].time); различаются ценой.
 */
export function constrainAnchors(kind: MarkKind, anchors: readonly Anchor[]): Anchor[] {
  const a = anchors.map((x) => ({ ...x }));
  if ((kind === 'bos' || kind === 'choch') && a.length >= 2) a[1]!.price = a[0]!.price;
  if (kind === ZONE_KIND && a.length >= 2) {
    // верх/низ упорядочены по цене, время начала общее (время первого касания)
    const hi = Math.max(a[0]!.price, a[1]!.price);
    const lo = Math.min(a[0]!.price, a[1]!.price);
    a[0]!.price = hi;
    a[1]!.price = lo;
    a[1]!.time = a[0]!.time;
  }
  if (kind === 'position') for (let i = 1; i < a.length; i++) a[i]!.time = a[0]!.time;
  return a;
}

/** Сторона свечи, к которой прикреплён swing-подобный тип (HH/LH - к high, HL/LL - к low). */
export const SWING_SIDE: Readonly<Partial<Record<MarkKind, 'high' | 'low'>>> = {
  'swing-high': 'high',
  hh: 'high',
  lh: 'high',
  'swing-low': 'low',
  hl: 'low',
  ll: 'low',
};

export interface MarkExtra {
  direction?: 'bull' | 'bear' | null;
  /** Слой структуры (только BOS/CHoCH): internal/external; иначе null. */
  scope?: Scope | null;
  meta?: Record<string, unknown>;
}

export function createMark(kind: DrawKind, anchors: readonly Anchor[], id: string, extra: MarkExtra = {}): Mark {
  const a = constrainAnchors(kind, anchors);
  return {
    id,
    kind,
    anchors: a,
    scope: extra.scope ?? null,
    direction: extra.direction ?? null,
    author: 'user',
    ...(extra.meta ? { meta: extra.meta } : {}),
    ...(kind === 'position' ? { meta: { entry: a[0]?.price, sl: a[1]?.price, tp: a[2]?.price } } : {}),
  };
}

/** Для горизонтали/уровня время не важно визуально, но хранится (привязка к свече). */
export const FULL_WIDTH_KINDS: ReadonlySet<MarkKind> = new Set(['level']);
export const RAY_RIGHT_KINDS: ReadonlySet<MarkKind> = new Set([ZONE_KIND, 'hline', 'position']);
