import { describe, expect, it } from 'vitest';
import type { Mark } from '@tl/core';
import { selectHints } from './hints';

// SYNTHETIC: минимальные метки для проверки отбора, не данные рынка
const m = (id: string, kind: Mark['kind'], t: number, scope: Mark['scope'] = 'external'): Mark => ({
  id, kind, anchors: [{ time: t, price: 1 }], scope, direction: null, author: 'algo',
});

describe('selectHints', () => {
  it('2+2 последних внешних swing и один последний BOS/CHoCH', () => {
    const src = [
      ...[1, 2, 3, 4].map((t) => m(`h${t}`, 'swing-high', t)),
      ...[1, 2, 3].map((t) => m(`l${t}`, 'swing-low', t)),
      m('hi', 'swing-high', 9, 'internal'),
      m('b1', 'bos', 5), m('c1', 'choch', 7), m('lv', 'level', 8),
    ];
    expect(selectHints(src).map((x) => x.id)).toEqual(['h4', 'h3', 'l3', 'l2', 'c1']);
  });
  it('пусто', () => expect(selectHints(undefined)).toEqual([]));
});
