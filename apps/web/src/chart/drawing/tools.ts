import type { Anchor, Mark, MarkKind } from '@tl/core';

/** Виды меток, которые пользователь может рисовать (pattern - только алгоритм). */
export type DrawKind = Exclude<MarkKind, 'pattern'>;
export type ToolId = 'select' | 'eraser' | DrawKind;

export interface ToolDef {
  /** Сколько якорей нужно для метки. */
  anchors: 1 | 2 | 3;
  /** Снап цены к OHLC включён по умолчанию (swing/HH../BOS/CHoCH/Sweep). */
  snapPrice: boolean;
  /** Короткая подпись на графике (SMC-термин, не локализуется). */
  label: string;
}

export const TOOL_DEFS: Readonly<Record<DrawKind, ToolDef>> = {
  'swing-high': { anchors: 1, snapPrice: true, label: 'SwH' },
  'swing-low': { anchors: 1, snapPrice: true, label: 'SwL' },
  hh: { anchors: 1, snapPrice: true, label: 'HH' },
  hl: { anchors: 1, snapPrice: true, label: 'HL' },
  lh: { anchors: 1, snapPrice: true, label: 'LH' },
  ll: { anchors: 1, snapPrice: true, label: 'LL' },
  bos: { anchors: 2, snapPrice: true, label: 'BOS' },
  choch: { anchors: 2, snapPrice: true, label: 'CHoCH' },
  sweep: { anchors: 2, snapPrice: true, label: 'Sweep' },
  'order-block': { anchors: 2, snapPrice: false, label: 'OB' },
  fvg: { anchors: 2, snapPrice: false, label: 'FVG' },
  level: { anchors: 1, snapPrice: false, label: '' },
  hline: { anchors: 1, snapPrice: false, label: '' },
  trendline: { anchors: 2, snapPrice: false, label: '' },
  position: { anchors: 3, snapPrice: false, label: '' },
};

export const isDrawKind = (t: ToolId | null): t is DrawKind => t !== null && t !== 'select' && t !== 'eraser';

/**
 * Инварианты формы метки по типу. Вызывается при создании и при каждом перетаскивании якоря.
 * - BOS/CHoCH: линия горизонтальна на цене свинга (anchors[0]); второй якорь задаёт только свечу пробоя.
 * - position: вход/SL/TP делят одно время (anchors[0].time); различаются ценой.
 */
export function constrainAnchors(kind: MarkKind, anchors: readonly Anchor[]): Anchor[] {
  const a = anchors.map((x) => ({ ...x }));
  if ((kind === 'bos' || kind === 'choch') && a.length >= 2) a[1]!.price = a[0]!.price;
  if (kind === 'position') for (let i = 1; i < a.length; i++) a[i]!.time = a[0]!.time;
  return a;
}

export function createMark(kind: DrawKind, anchors: readonly Anchor[], id: string): Mark {
  const a = constrainAnchors(kind, anchors);
  return {
    id,
    kind,
    anchors: a,
    scope: null,
    direction: null,
    author: 'user',
    ...(kind === 'position' ? { meta: { entry: a[0]?.price, sl: a[1]?.price, tp: a[2]?.price } } : {}),
  };
}

/** Для горизонтали/уровня время не важно визуально, но хранится (привязка к свече). */
export const FULL_WIDTH_KINDS: ReadonlySet<MarkKind> = new Set(['level']);
export const RAY_RIGHT_KINDS: ReadonlySet<MarkKind> = new Set(['hline', 'position']);
