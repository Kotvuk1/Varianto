import { describe, expect, it } from 'vitest';
import type { Mark } from '@tl/core';
import { makePriceFormatter } from '@/chart/priceFormat';
import { describeMark } from './markText';

const fmt = makePriceFormatter(0.1);
const plain = (s: string) => s.replace(new RegExp('[\\u00a0\\u202f]', 'g'), ' ');
// 29 окт 2026 08:00 локального времени (форматирование использует часовой пояс браузера)
const t = new Date(2026, 9, 29, 8, 0).getTime();
const mk = (kind: Mark['kind'], anchors: Mark['anchors'], direction: Mark['direction'] = null): Mark => ({
  id: 'x', kind, anchors, scope: null, direction, author: 'user',
});

describe('describeMark', () => {
  it('BOS: название с направлением, время свечи пробоя, цена уровня', () => {
    const m = mk('bos', [{ time: t - 3_600_000, price: 81950 }, { time: t, price: 81950 }], 'bull');
    expect(plain(describeMark(m, fmt))).toBe('BOS вверх · 29 октября, 08:00 · 81 950,0');
    expect(plain(describeMark({ ...m, kind: 'choch', direction: 'bear' }, fmt))).toBe('CHoCH вниз · 29 октября, 08:00 · 81 950,0');
  });
  it('FVG и OB: направление и диапазон цен', () => {
    const f = mk('fvg', [{ time: t, price: 82000 }, { time: t + 1, price: 81900 }], 'bull');
    expect(plain(describeMark(f, fmt))).toBe('FVG бычий · 29 октября, 08:00 · 82 000,0 – 81 900,0');
    expect(plain(describeMark({ ...f, kind: 'order-block', direction: 'bear' }, fmt))).toBe('Order Block медвежий · 29 октября, 08:00 · 82 000,0 – 81 900,0');
  });
  it('swing и уровень: одна цена', () => {
    expect(plain(describeMark(mk('swing-high', [{ time: t, price: 100.25 }]), fmt))).toBe('Swing High · 29 октября, 08:00 · 100,3');
    expect(plain(describeMark(mk('level', [{ time: t, price: 5 }]), fmt))).toBe('Уровень · 29 октября, 08:00 · 5,0');
  });
  it('Фибо: название с направлением и цены якорей A → B', () => {
    const g = { id: 'x', kind: 'fib-retracement', anchors: [{ time: t, price: 80095.9 }, { time: t + 3_600_000, price: 87385.1 }], scope: null, direction: 'bull', author: 'user' } as unknown as Mark;
    expect(plain(describeMark(g, fmt))).toBe('Фибо: коррекция вверх · 29 октября, 08:00 · 80 095,9 → 87 385,1');
  });
});
