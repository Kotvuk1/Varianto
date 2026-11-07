import { describe, expect, it } from 'vitest';
import type { Mark } from '@tl/core';
import { patternHighlights } from './highlights';

const H = 3_600_000;
// SYNTHETIC: минимальная метка pattern, проверяется только арифметика времени
const mark = (a: number, b: number): Mark => ({ id: 'p', kind: 'pattern', anchors: [{ time: a, price: 1 }, { time: b, price: 2 }], scope: null, direction: 'bull', author: 'algo' }) as Mark;

describe('patternHighlights', () => {
  it('колонка на каждую свечу модели, подпись на последней', () => {
    const r = patternHighlights([mark(10 * H, 12 * H + 5)], '1h', 'focus', 'Pin bar');
    expect(r.map((x) => x.time)).toEqual([10 * H, 11 * H, 12 * H]);
    expect(r.map((x) => x.label)).toEqual([undefined, undefined, 'Pin bar']);
    expect(r.every((x) => x.tone === 'focus')).toBe(true);
  });
  it('не-pattern метки игнорируются', () => {
    expect(patternHighlights([{ ...mark(0, H), kind: 'swing-high' } as Mark], '1h', 'ref')).toEqual([]);
  });
});
