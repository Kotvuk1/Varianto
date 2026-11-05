import { describe, expect, it } from 'vitest';
import type { Mark } from '@tl/core';
import type { Projection } from '../drawing/projection';
import { buildGeometry, PILL_H, textWidth, type Part } from '../drawing/layout';
import { resolveLabelCollisions } from './labels';

const T0 = Date.UTC(2025, 0, 1);
const H = 3_600_000;
// SYNTHETIC: линейная проекция для проверки раскладки подписей, не рыночные данные
const mkProj = (width: number): Projection => ({
  timeToX: (t) => ((t - T0) / H) * 10,
  xToTime: (x) => T0 + (x / 10) * H,
  priceToY: (p) => 1000 - p,
  yToPrice: (y) => 1000 - y,
  width,
  height: 900,
});
const a = (i: number, price: number) => ({ time: T0 + i * H, price });
const mk = (id: string, anchors: Mark['anchors'], author: 'user' | 'algo'): Mark =>
  ({ id, kind: 'fib-retracement', anchors, scope: null, direction: 'bull', author }) as Mark;
const fmt = (p: number) => p.toFixed(1);
type T = Extract<Part, { t: 'text' }>;
const rects = (g: { parts: Part[] }) =>
  g.parts.filter((p): p is T => p.t === 'text').map((p) => ({ text: p.text, level: p.level, x1: p.x - textWidth(p.text) / 2, x2: p.x + textWidth(p.text) / 2, y1: p.y - PILL_H / 2, y2: p.y + PILL_H / 2 }));
const overlap = (r: ReturnType<typeof rects>) => {
  const bad: string[] = [];
  for (let i = 0; i < r.length; i++)
    for (let j = i + 1; j < r.length; j++) {
      const p = r[i]!;
      const q = r[j]!;
      if (p.x1 < q.x2 && q.x1 < p.x2 && p.y1 < q.y2 && q.y1 < p.y2) bad.push(`${p.text} x ${q.text}`);
    }
  return bad;
};

describe.each([
  ['desktop', 800],
  ['mobile', 360],
])('раскладка подписей (%s)', (_n, width) => {
  const proj = mkProj(width);
  // плотные сетки: диапазон 100 px, уровни ближе высоты плашки; user и algo на тех же ценах
  const user = mk('u', [a(5, 100), a(20, 200)], 'user');
  const algo = mk('e', [a(8, 100), a(24, 200)], 'algo');

  it('подписи одной сетки не пересекаются; 0, 0.5, 0.618, 1 остаются', () => {
    const g = resolveLabelCollisions([buildGeometry(algo, proj, { fmt })], PILL_H, (p) => textWidth(p.text))[0]!;
    const r = rects(g);
    expect(overlap(r)).toEqual([]);
    for (const lv of [0, 0.5, 0.618, 1]) expect(r.some((x) => x.level === lv)).toBe(true);
  });

  it('две сетки: подписи не пересекаются, эталон справа, пользователь слева от якоря', () => {
    const gs = resolveLabelCollisions([buildGeometry(user, proj, { fmt }), buildGeometry(algo, proj, { fmt })], PILL_H, (p) => textWidth(p.text));
    const all = gs.flatMap((g) => rects(g));
    expect(overlap(all)).toEqual([]);
    const lv = (g: (typeof gs)[number]) => rects(g).filter((x) => x.level !== undefined);
    const ux = lv(gs[0]!).map((x) => x.x1);
    const ax = lv(gs[1]!).map((x) => x.x2);
    expect(Math.min(...ux)).toBeLessThan(120); // у левого якоря (x=50)
    expect(Math.max(...ax)).toBeGreaterThan(width - 10); // у правого края
  });

  it('выбранный уровень остаётся всегда, менее важные уступают', () => {
    const g = resolveLabelCollisions([buildGeometry(algo, proj, { fmt, level: 0.705 })], PILL_H, (p) => textWidth(p.text))[0]!;
    expect(rects(g).some((x) => x.level === 0.705)).toBe(true);
    expect(overlap(rects(g))).toEqual([]);
  });

  it('Premium/Discount: на узкой панели одна пометка «P/D»', () => {
    const g = buildGeometry(algo, proj, { fmt });
    const names = rects(g).map((x) => x.text);
    if (width < 520) expect(names.filter((n) => n === 'P/D')).toHaveLength(1);
    else expect(names).toEqual(expect.arrayContaining(['Premium', 'Discount']));
    expect(names.includes('P/D') && names.includes('Premium')).toBe(false);
  });

  it('каждая подпись уровня встречается один раз', () => {
    const g = resolveLabelCollisions([buildGeometry(algo, proj, { fmt })], PILL_H, (p) => textWidth(p.text))[0]!;
    const lv = rects(g).map((x) => x.level).filter((x) => x !== undefined);
    expect(new Set(lv).size).toBe(lv.length);
  });
});
