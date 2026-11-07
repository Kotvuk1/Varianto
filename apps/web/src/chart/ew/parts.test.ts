import { describe, expect, it } from 'vitest';
import type { Mark } from '@tl/core';
import type { Projection } from '../drawing/projection';
import { buildGeometry, type Part } from '../drawing/layout';
import { ewLabels, firstSideOf, sideAt, snapExtreme, timesAscending, ewDirection } from './model';

const T0 = Date.UTC(2025, 0, 1);
const H = 3_600_000;
// SYNTHETIC: линейная проекция для проверки геометрии, не рыночные данные
const proj: Projection = {
  timeToX: (t) => ((t - T0) / H) * 10,
  xToTime: (x) => T0 + (x / 10) * H,
  priceToY: (p) => 1000 - p,
  yToPrice: (y) => 1000 - y,
  width: 600,
  height: 900,
};
const a = (i: number, price: number) => ({ time: T0 + i * H, price });
const mk = (kind: string, anchors: Mark['anchors'], extra: Partial<Mark> = {}): Mark =>
  ({ id: 'w1', kind, anchors, scope: null, direction: 'bull', author: 'user', ...extra }) as Mark;
const imp = [a(0, 100), a(10, 200), a(15, 150), a(30, 400), a(38, 330), a(50, 450)];
const texts = (ps: Part[]) => ps.filter((p): p is Extract<Part, { t: 'text' }> => p.t === 'text');
const segs = (ps: Part[]) => ps.filter((p) => p.t === 'seg');

describe('модель Elliott', () => {
  it('подписи: 0-5 у импульса, A-B-C у коррекции, meta.labels приоритетнее', () => {
    expect(ewLabels('ew-impulse', 6)).toEqual(['0', '1', '2', '3', '4', '5']);
    expect(ewLabels('ew-zigzag', 3)).toEqual(['A', 'B', 'C']);
    expect(ewLabels('ew-impulse', 3, { labels: ['x', 'y', 'z'] })).toEqual(['x', 'y', 'z']);
  });
  it('стороны чередуются: вверх 0 low, 1 high, 2 low...', () => {
    expect(firstSideOf(a(0, 1), a(1, 2))).toBe('low');
    expect(firstSideOf(a(0, 2), a(1, 1))).toBe('high');
    expect([0, 1, 2, 3].map((k) => sideAt('low', k))).toEqual(['low', 'high', 'low', 'high']);
  });
  it('направление по первым двум точкам; порядок времени', () => {
    expect(ewDirection(imp)).toBe('bull');
    expect(ewDirection([a(0, 5), a(1, 3)])).toBe('bear');
    expect(timesAscending(imp)).toBe(true);
    expect(timesAscending([a(2, 1), a(1, 2)])).toBe(false);
  });
  it('снап к экстремуму нужной стороны в радиусе', () => {
    // SYNTHETIC: 7 свечей, минимум на 5-й
    const cs = [10, 9, 8, 7, 6, 3, 8].map((low, i) => ({ openTime: i, closeTime: i, open: low + 1, high: low + 5, low, close: low + 2, volume: 1, quoteVolume: 1, trades: 1, closed: true }));
    expect(snapExtreme(cs, 4, 'low')).toEqual({ time: 5, price: 3 });
    expect(snapExtreme(cs, 4, 'high')).toEqual({ time: 1, price: 14 });
  });
});

describe('геометрия ew-impulse', () => {
  const g = buildGeometry(mk('ew-impulse', imp), proj);
  it('ломаная через 6 точек, 6 ручек, подписи 0-5', () => {
    expect(segs(g.parts)).toHaveLength(5);
    expect(g.handles.map((h) => h.index)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(texts(g.parts).map((t) => t.text)).toEqual(['0', '1', '2', '3', '4', '5']);
  });
  it('максимумы - подпись над точкой, минимумы - под', () => {
    const t = texts(g.parts);
    expect(t[1]!.y).toBeLessThan(proj.priceToY(200)); // high
    expect(t[2]!.y).toBeGreaterThan(proj.priceToY(150)); // low
    expect(t[0]!.y).toBeGreaterThan(proj.priceToY(100));
  });
  it('неполная разметка (3 точки) и черновик рисуют только поставленные', () => {
    expect(texts(buildGeometry(mk('ew-impulse', imp.slice(0, 3)), proj).parts)).toHaveLength(3);
    const d = buildGeometry(mk('ew-impulse', [...imp.slice(0, 2), imp[1]!, imp[1]!, imp[1]!, imp[1]!], { meta: { draft: 2 } }), proj);
    expect(texts(d.parts).map((t) => t.text)).toEqual(['0', '1']);
  });
});

describe('геометрия коррекций', () => {
  const abc = [a(50, 450), a(58, 380), a(66, 420)];
  it('зигзаг - штрих, плоская - точки; подпись типа у A', () => {
    const z = buildGeometry(mk('ew-zigzag', abc), proj);
    const f = buildGeometry(mk('ew-flat', abc), proj);
    expect(segs(z.parts).every((s) => s.t === 'seg' && s.dash === 'dashed')).toBe(true);
    expect(segs(f.parts).every((s) => s.t === 'seg' && s.dash === 'dotted')).toBe(true);
    expect(texts(z.parts).map((t) => t.text)).toEqual(['A · zigzag', 'B', 'C']);
    expect(texts(f.parts)[0]!.text).toBe('A · flat');
  });
  it('эталон: подписи из meta.labels', () => {
    const g = buildGeometry(mk('ew-zigzag', abc, { author: 'algo', meta: { labels: ['A', 'B', 'C'] } }), proj);
    expect(texts(g.parts)).toHaveLength(3);
  });
});
