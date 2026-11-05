import { describe, expect, it } from 'vitest';
import type { Mark } from '@tl/core';
import type { Projection } from '../drawing/projection';
import { buildGeometry, isMarkVisible, textWidth, type Part } from '../drawing/layout';
import { hitLevel } from '../drawing/hit';
import { toleranceFor } from '../drawing/hit';

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
  ({ id: 'f1', kind, anchors, scope: null, direction: null, author: 'algo', ...extra }) as Mark; // эталон: подписи у правого края
const fmt = (p: number) => p.toFixed(1);
const segs = (parts: Part[]) => parts.filter((p): p is Extract<Part, { t: 'seg' }> => p.t === 'seg');
const texts = (parts: Part[]) => parts.filter((p): p is Extract<Part, { t: 'text' }> => p.t === 'text');

describe('fib-retracement: геометрия', () => {
  // импульс вверх A=100 (низ), B=200 (верх): y(r) = 1000 - (200 + r*(100-200))
  const g = buildGeometry(mk('fib-retracement', [a(10, 100), a(30, 200)], { direction: 'bull' }), proj, { fmt });

  it('8 горизонтальных уровней от левого якоря до правого края; уровень 0 на B, 1 на A', () => {
    const levels = segs(g.parts).filter((s) => s.level !== undefined);
    expect(levels.map((s) => s.level)).toEqual([0, 0.236, 0.382, 0.5, 0.618, 0.705, 0.786, 1]);
    for (const s of levels) {
      expect(s.x1).toBe(100);
      expect(s.x2).toBe(600);
      expect(s.y1).toBe(s.y2);
    }
    expect(levels[0]!.y1).toBe(800); // B=200
    expect(levels[7]!.y1).toBe(900); // A=100
    expect(levels[4]!.y1).toBeCloseTo(1000 - (200 - 0.618 * 100), 9);
  });

  it('подписи «ratio · цена» у правого края', () => {
    // диапазон 500 px: подписи не слипаются
    const big = buildGeometry(mk('fib-retracement', [a(10, 100), a(30, 600)]), proj, { fmt });
    const t = texts(big.parts).find((p) => p.level === 0.618)!;
    expect(t.text).toBe(`0.618 · ${fmt(600 - 0.618 * 500)}`);
    expect(t.x + textWidth(t.text) / 2).toBeLessThanOrEqual(600);
    expect(t.x + textWidth(t.text) / 2).toBeGreaterThan(590);
  });

  it('OTE: полупрозрачная зона между 0.62 и 0.79 без контура', () => {
    const r = g.parts.find((p) => p.t === 'rect') as Extract<Part, { t: 'rect' }>;
    expect(r.noStroke).toBe(true);
    expect(r.y1).toBeCloseTo(1000 - (200 - 0.62 * 100), 9);
    expect(r.y2).toBeCloseTo(1000 - (200 - 0.79 * 100), 9);
    expect(r.x1).toBe(100);
    expect(r.x2).toBe(600);
  });

  it('линия 0.5 выделена толщиной; Premium над 0.5, Discount под', () => {
    const w = (lv: number) => segs(g.parts).find((s) => s.level === lv)!.w ?? 1.5;
    expect(w(0.5)).toBeGreaterThan(w(0.382));
    const eqY = 1000 - 150;
    const prem = texts(g.parts).find((p) => p.text === 'Premium')!;
    const disc = texts(g.parts).find((p) => p.text === 'Discount')!;
    expect(prem.y).toBeLessThan(eqY);
    expect(disc.y).toBeGreaterThan(eqY);
  });

  it('импульс вниз: Premium всё так же выше EQ (абсолютное определение §2.3)', () => {
    const d = buildGeometry(mk('fib-retracement', [a(10, 200), a(30, 100)], { direction: 'bear' }), proj, { fmt });
    const eqY = 1000 - 150;
    expect(texts(d.parts).find((p) => p.text === 'Premium')!.y).toBeLessThan(eqY);
    expect(texts(d.parts).find((p) => p.text === 'Discount')!.y).toBeGreaterThan(eqY);
    expect(segs(d.parts).find((s) => s.level === 1)!.y1).toBe(800); // A=200 вверху
  });

  it('в узкой сетке слипающиеся подписи прореживаются, 0.5 остаётся', () => {
    const lv = texts(g.parts).filter((p) => p.level !== undefined);
    expect(lv.length).toBeLessThan(8);
    expect(lv.some((p) => p.level === 0.5)).toBe(true);
  });

  it('ручки на обоих якорях', () => {
    expect(g.handles).toEqual([
      { x: 100, y: 900, index: 0 },
      { x: 300, y: 800, index: 1 },
    ]);
  });

  it('вырожденная сетка (A == B по цене) не даёт уровней и NaN', () => {
    const d = buildGeometry(mk('fib-retracement', [a(10, 100), a(30, 100)]), proj, { fmt });
    expect(segs(d.parts).some((s) => s.level !== undefined)).toBe(false);
  });

  it('черновик (не все касания) рисует только ножки', () => {
    const d = buildGeometry(mk('fib-extension', [a(10, 100), a(30, 200), a(30, 200)], { meta: { draft: 2 } }), proj, { fmt });
    expect(segs(d.parts).some((s) => s.level !== undefined)).toBe(false);
    expect(segs(d.parts).length).toBeGreaterThan(0);
  });

  it('подсветка выбранного уровня: толще и с маркером', () => {
    const h = buildGeometry(mk('fib-retracement', [a(10, 100), a(30, 200)]), proj, { fmt, level: 0.382 });
    const w = (lv: number) => segs(h.parts).find((s) => s.level === lv)!.w ?? 1.5;
    expect(w(0.382)).toBeGreaterThan(w(0.5));
    expect(h.parts.some((p) => p.t === 'glyph')).toBe(true);
  });
});

describe('fib-extension: геометрия', () => {
  // A=100, B=200, C=160: цели 260, 287.2, 321.8, 360 (2.0)
  const g = buildGeometry(mk('fib-extension', [a(10, 100), a(30, 200), a(40, 160)], { direction: 'bull' }), proj, { fmt });

  it('уровни 1, 1.272, 1.618 и справочный 2 от C вправо', () => {
    const levels = segs(g.parts).filter((s) => s.level !== undefined);
    expect(levels.map((s) => s.level)).toEqual([1, 1.272, 1.618, 2]);
    expect(levels[0]!.y1).toBe(1000 - 260);
    expect(levels[1]!.y1).toBeCloseTo(1000 - 287.2, 9);
    expect(levels[2]!.y1).toBeCloseTo(1000 - 321.8, 9);
    expect(levels[3]!.y1).toBe(1000 - 360);
    expect(levels[0]!.x1).toBe(400); // от C
    expect(levels[3]!.w).toBeLessThan(levels[0]!.w ?? 1.5);
  });

  it('три ручки; видимость учитывает уровень 2.0 выше экрана', () => {
    expect(g.handles.map((h) => h.index)).toEqual([0, 1, 2]);
    const m = mk('fib-extension', [a(10, 100), a(30, 200), a(40, 160)]);
    expect(isMarkVisible(m, { ...proj, height: 700 }, 0)).toBe(true);
  });

  it('extension вниз: цели ниже C', () => {
    const d = buildGeometry(mk('fib-extension', [a(10, 200), a(30, 100), a(40, 140)]), proj, { fmt });
    const l = segs(d.parts).filter((s) => s.level !== undefined);
    expect(l[0]!.y1).toBe(1000 - 40);
  });
});

describe('hitLevel', () => {
  const g = buildGeometry(mk('fib-retracement', [a(10, 100), a(30, 200)]), proj, { fmt });
  it('касание у линии уровня возвращает ближайший уровень', () => {
    const y = 1000 - (200 - 0.382 * 100);
    expect(hitLevel([g], 400, y + 3, toleranceFor('touch'))).toEqual({ markId: 'f1', level: 0.382 });
  });
  it('вдали от линий - null', () => {
    expect(hitLevel([g], 400, 100, toleranceFor('touch'))).toBeNull();
  });
});
