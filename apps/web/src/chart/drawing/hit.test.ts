import { describe, expect, it } from 'vitest';
import type { Mark } from '@tl/core';
import { buildGeometry } from './layout';
import { distToSegment, hitTest, toleranceFor } from './hit';
import type { Projection } from './projection';

const T0 = Date.UTC(2025, 0, 1);
const H = 3_600_000;
// SYNTHETIC: линейная проекция для проверки хит-теста
const synthetic_proj: Projection = {
  timeToX: (t) => ((t - T0) / H) * 10,
  xToTime: (x) => T0 + (x / 10) * H,
  priceToY: (p) => 500 - p,
  yToPrice: (y) => 500 - y,
  width: 400,
  height: 300,
};
const a = (i: number, price: number) => ({ time: T0 + i * H, price });
const mk = (id: string, kind: Mark['kind'], anchors: Mark['anchors']): Mark => ({
  id,
  kind,
  anchors,
  scope: null,
  direction: null,
  author: 'user',
});
const geos = (marks: Mark[]) => marks.map((m) => buildGeometry(m, synthetic_proj));

describe('distToSegment', () => {
  it('расстояние до отрезка, включая концы', () => {
    expect(distToSegment(5, 3, 0, 0, 10, 0)).toBe(3);
    expect(distToSegment(-4, 3, 0, 0, 10, 0)).toBe(5);
    expect(distToSegment(1, 1, 2, 2, 2, 2)).toBeCloseTo(Math.SQRT2, 10);
  });
});

describe('toleranceFor', () => {
  it('на касании радиус не меньше 24 px (44x44 зона), у мыши меньше', () => {
    expect(toleranceFor('touch').handle).toBeGreaterThanOrEqual(24);
    expect(toleranceFor('mouse').handle).toBeLessThan(toleranceFor('touch').handle);
  });
});

describe('hitTest', () => {
  const bos = mk('bos1', 'bos', [a(5, 300), a(15, 300)]); // линия y=200, x 50..150
  const ob = mk('ob1', 'order-block', [a(30, 320), a(40, 300)]); // x 300..400, y 180..200

  it('попадает по линии в пределах допуска и промахивается дальше', () => {
    const tol = toleranceFor('mouse');
    expect(hitTest(geos([bos]), 100, 200 + tol.body - 1, tol)).toMatchObject({ markId: 'bos1', part: 'body' });
    expect(hitTest(geos([bos]), 100, 200 + tol.body + 6, tol)).toBeNull();
  });

  it('на касании палец в 20 px от линии попадает', () => {
    expect(hitTest(geos([bos]), 100, 220, toleranceFor('touch'))).toMatchObject({ markId: 'bos1' });
  });

  it('якорь определяется как ручка с индексом (приоритет у выбранной метки)', () => {
    const tol = toleranceFor('touch');
    const hit = hitTest(geos([bos]), 148, 203, tol, 'bos1');
    expect(hit).toEqual({ markId: 'bos1', part: 'anchor', anchorIndex: 1 });
  });

  it('ручки невыбранной метки не перехватывают, тело - да', () => {
    const tol = toleranceFor('touch');
    expect(hitTest(geos([bos]), 52, 200, tol)).toMatchObject({ part: 'body' });
  });

  it('внутри зоны - попадание в тело; линия/точка рядом выигрывают у зоны', () => {
    const tol = toleranceFor('mouse');
    expect(hitTest(geos([ob]), 350, 190, tol)).toMatchObject({ markId: 'ob1', part: 'body' });
    const trend = mk('t1', 'trendline', [a(30, 260), a(40, 260)]); // y=240, не пересекает OB
    const level = mk('l1', 'level', [a(0, 310)]); // y=190 через OB
    expect(hitTest(geos([ob, level, trend]), 350, 191, tol)).toMatchObject({ markId: 'l1' });
  });

  it('при равенстве побеждает верхняя (последняя) метка', () => {
    const l1 = mk('l1', 'level', [a(0, 250)]);
    const l2 = mk('l2', 'level', [a(0, 250)]);
    expect(hitTest(geos([l1, l2]), 100, 250, toleranceFor('mouse'))?.markId).toBe('l2');
  });

  it('пустое место - null', () => {
    expect(hitTest(geos([bos, ob]), 10, 10, toleranceFor('touch'))).toBeNull();
  });
});

describe('производительность (цель 200 объектов)', () => {
  it('геометрия + хит-тест 200 меток укладывается в бюджет кадра', () => {
    const marks = Array.from({ length: 200 }, (_, i) =>
      mk(`p${i}`, i % 2 ? 'order-block' : 'bos', [a(i, 300 + (i % 20)), a(i + 10, 290 + (i % 20))]),
    );
    const t0 = performance.now();
    const g = geos(marks);
    for (let i = 0; i < 20; i++) hitTest(g, 123, 456, toleranceFor('touch'), 'p5');
    expect(performance.now() - t0).toBeLessThan(100);
  });
});
