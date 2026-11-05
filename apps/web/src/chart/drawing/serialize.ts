import { z } from 'zod';
import type { Mark } from '@tl/core';

const KINDS = [
  'swing-high', 'swing-low', 'hh', 'hl', 'lh', 'll', 'bos', 'choch', 'sweep',
  'order-block', 'fvg', 'level', 'hline', 'trendline', 'pattern', 'position',
  'fib-retracement', 'fib-extension', 'ew-impulse', 'ew-zigzag', 'ew-flat',
] as const;

const anchor = z.object({ time: z.number().finite(), price: z.number().finite() });
const markSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(KINDS),
  anchors: z.array(anchor).min(1).max(6),
  scope: z.enum(['internal', 'external']).nullable(),
  direction: z.enum(['bull', 'bear']).nullable(),
  meta: z.record(z.string(), z.unknown()).optional(),
  author: z.enum(['user', 'algo']),
});

export const MARKS_FORMAT_VERSION = 1;

export function serializeMarks(marks: readonly Mark[]): string {
  return JSON.stringify({ v: MARKS_FORMAT_VERSION, marks });
}

export function validateMarks(input: unknown): { marks: Mark[]; dropped: number } {
  if (!Array.isArray(input)) return { marks: [], dropped: 0 };
  const marks: Mark[] = [];
  let dropped = 0;
  for (const raw of input) {
    const r = markSchema.safeParse(raw);
    if (r.success) marks.push(r.data as Mark);
    else dropped++;
  }
  return { marks, dropped };
}

export function parseMarks(json: string): { marks: Mark[]; dropped: number } {
  try {
    const o = JSON.parse(json) as { marks?: unknown };
    return validateMarks(o?.marks);
  } catch {
    return { marks: [], dropped: 0 };
  }
}
