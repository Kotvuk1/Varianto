// Подсказки easy: только последние 2 внешних swing high, 2 swing low и последний внешний BOS/CHoCH.
import type { Mark } from '@tl/core';

const time = (m: Mark) => m.anchors[m.anchors.length - 1]?.time ?? 0;
const external = (m: Mark) => m.scope === null || m.scope === 'external';

export function selectHints(hints: readonly Mark[] | undefined): Mark[] {
  if (!hints) return [];
  const latest = (pred: (m: Mark) => boolean, n: number) =>
    hints
      .filter((m) => pred(m) && external(m))
      .sort((a, b) => time(b) - time(a))
      .slice(0, n);
  return [
    ...latest((m) => m.kind === 'swing-high', 2),
    ...latest((m) => m.kind === 'swing-low', 2),
    ...latest((m) => m.kind === 'bos' || m.kind === 'choch', 1),
  ];
}
