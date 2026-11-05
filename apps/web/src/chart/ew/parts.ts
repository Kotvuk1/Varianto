// Части отрисовки разметки Elliott: ломаная через точки, подписи 0-5 / A-B-C у точек (над максимумом, под минимумом).
// Тип различается формой: импульс - сплошная, зигзаг - штрих, плоская - точки (плюс подпись типа у A).
import type { Anchor } from '@tl/core';
import type { Part } from '../drawing/layout';
import { ewLabels, type EwKind } from './model';

export interface EwPartsInput {
  kind: EwKind;
  anchors: readonly Anchor[];
  pts: readonly { x: number; y: number }[];
  meta?: Record<string, unknown> | undefined;
  /** Превью: сколько точек уже поставлено. */
  draft?: number;
  pillH: number;
}

const TYPE_TAG: Partial<Record<EwKind, string>> = { 'ew-zigzag': 'zigzag', 'ew-flat': 'flat' };

export function ewParts(i: EwPartsInput): Part[] {
  const n = Math.min(i.pts.length, i.draft ?? i.pts.length);
  const pts = i.pts.slice(0, n);
  const labels = ewLabels(i.kind, n, i.meta);
  const dash = i.kind === 'ew-impulse' ? 'solid' : i.kind === 'ew-zigzag' ? 'dashed' : 'dotted';
  const parts: Part[] = [];
  for (let k = 1; k < n; k++) parts.push({ t: 'seg', x1: pts[k - 1]!.x, y1: pts[k - 1]!.y, x2: pts[k]!.x, y2: pts[k]!.y, dash });
  const gap = i.pillH / 2 + 8;
  pts.forEach((p, k) => {
    // экстремум-максимум: подпись над точкой, минимум - под ней (соседи определяют сторону)
    const prev = pts[k - 1];
    const next = pts[k + 1];
    const neighbor = next ?? prev;
    const high = neighbor ? p.y < neighbor.y : k % 2 === 1;
    parts.push({ t: 'glyph', g: 'dot', x: p.x, y: p.y });
    const tag = k === 0 ? TYPE_TAG[i.kind] : undefined;
    parts.push({ t: 'text', text: tag ? `${labels[k]} · ${tag}` : labels[k]!, x: p.x, y: p.y + (high ? -gap : gap) });
  });
  return parts;
}
