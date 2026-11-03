import { describe, expect, it } from 'vitest';
import type { Mark } from '@tl/core';
import type { Projection } from './projection';
import { buildGeometry, isMarkVisible, keepTextsInside, textWidth } from './layout';

const T0 = Date.UTC(2025, 0, 1);
const H = 3_600_000;
// SYNTHETIC: линейная проекция для проверки геометрии, не рыночные данные
const synthetic_proj: Projection = {
  timeToX: (t) => ((t - T0) / H) * 10,
  xToTime: (x) => T0 + (x / 10) * H,
  priceToY: (p) => 500 - p,
  yToPrice: (y) => 500 - y,
  width: 400,
  height: 300,
};
const mk = (kind: Mark['kind'], anchors: Mark['anchors'], extra: Partial<Mark> = {}): Mark => ({
  id: 'm1',
  kind,
  anchors,
  scope: null,
  direction: null,
  author: 'user',
  ...extra,
});
const a = (i: number, price: number) => ({ time: T0 + i * H, price });

describe('buildGeometry', () => {
  it('BOS: горизонтальная линия на цене свинга от свинга до свечи пробоя + подпись', () => {
    const g = buildGeometry(mk('bos', [a(5, 300), a(15, 300)]), synthetic_proj);
    const seg = g.parts.find((p) => p.t === 'seg');
    expect(seg).toMatchObject({ x1: 50, y1: 200, x2: 150, y2: 200, dash: 'solid' });
    expect(g.parts.some((p) => p.t === 'text' && p.text === 'BOS')).toBe(true);
    expect(g.handles).toEqual([
      { x: 50, y: 200, index: 0 },
      { x: 150, y: 200, index: 1 },
    ]);
  });

  it('BOS вниз: подпись по центру линии под ней; BOS вверх - над ней', () => {
    const down = buildGeometry(mk('bos', [a(5, 300), a(15, 300)], { direction: 'bear' }), synthetic_proj);
    const up = buildGeometry(mk('bos', [a(5, 300), a(15, 300)], { direction: 'bull' }), synthetic_proj);
    const y = (g: typeof down) => (g.parts.find((p) => p.t === 'text') as { y: number; x: number }).y;
    const x = (g: typeof down) => (g.parts.find((p) => p.t === 'text') as { y: number; x: number }).x;
    expect(y(down)).toBeGreaterThan(200); // ниже линии (экранный y растёт вниз)
    expect(y(up)).toBeLessThan(200);
    expect(x(down)).toBe(100); // центр между x=50 и x=150
  });

  it('swing-high: маркер и подпись над high, swing-low - под low (не перекрывают свечу)', () => {
    const hi = buildGeometry(mk('swing-high', [a(5, 300)]), synthetic_proj);
    const lo = buildGeometry(mk('swing-low', [a(5, 300)]), synthetic_proj);
    for (const p of hi.parts) expect((p as { y: number }).y).toBeLessThan(200);
    for (const p of lo.parts) expect((p as { y: number }).y).toBeGreaterThan(200);
  });

  it('FVG/OB: подпись над верхней границей зоны, редактируется только опорный якорь', () => {
    const f = buildGeometry(mk('fvg', [a(10, 320), a(20, 300)]), synthetic_proj);
    const t = f.parts.find((p) => p.t === 'text') as { y: number };
    expect(t.y).toBeLessThan(180);
    expect(f.handles.map((h) => h.index)).toEqual([0]);
  });

  it('CHoCH штриховой, BOS сплошной (различие формой)', () => {
    const c = buildGeometry(mk('choch', [a(5, 300), a(15, 300)]), synthetic_proj);
    expect(c.parts.find((p) => p.t === 'seg')).toMatchObject({ dash: 'dashed' });
  });

  it('OB: прямоугольник со сплошной границей, FVG: пунктирной со штриховкой', () => {
    const ob = buildGeometry(mk('order-block', [a(10, 320), a(20, 300)]), synthetic_proj);
    expect(ob.parts.find((p) => p.t === 'rect')).toMatchObject({ x1: 100, x2: 200, y1: 180, y2: 200, dash: 'solid', hatch: false });
    const fvg = buildGeometry(mk('fvg', [a(20, 300), a(10, 320)]), synthetic_proj);
    expect(fvg.parts.find((p) => p.t === 'rect')).toMatchObject({ x1: 100, x2: 200, dash: 'dashed', hatch: true });
  });

  it('level - на всю ширину, hline - луч вправо от точки с маркером', () => {
    const lv = buildGeometry(mk('level', [a(5, 250)]), synthetic_proj);
    expect(lv.parts.find((p) => p.t === 'seg')).toMatchObject({ x1: 0, x2: 400, y1: 250, y2: 250 });
    const hl = buildGeometry(mk('hline', [a(5, 250)]), synthetic_proj);
    expect(hl.parts.find((p) => p.t === 'seg')).toMatchObject({ x1: 50, x2: 400 });
    expect(hl.parts.some((p) => p.t === 'glyph' && p.g === 'dot')).toBe(true);
  });

  it('swing-high: треугольник вниз над экстремумом, swing-low: вверх под ним', () => {
    const h = buildGeometry(mk('swing-high', [a(5, 300)]), synthetic_proj);
    const gh = h.parts.find((p) => p.t === 'glyph');
    expect(gh).toMatchObject({ g: 'tri-down' });
    expect(gh!.t === 'glyph' && gh!.y).toBeLessThan(200);
    const l = buildGeometry(mk('swing-low', [a(5, 300)]), synthetic_proj);
    const gl = l.parts.find((p) => p.t === 'glyph');
    expect(gl).toMatchObject({ g: 'tri-up' });
    expect(gl!.t === 'glyph' && gl!.y).toBeGreaterThan(200);
  });

  it('position: три горизонтали, SL штриховая, TP сплошная, вход точечная', () => {
    const g = buildGeometry(mk('position', [a(5, 300), a(5, 280), a(5, 340)]), synthetic_proj);
    const segs = g.parts.filter((p) => p.t === 'seg');
    expect(segs.map((s) => (s.t === 'seg' ? s.dash : ''))).toEqual(['dotted', 'dashed', 'solid']);
    expect(g.parts.filter((p) => p.t === 'text').map((p) => (p.t === 'text' ? p.text : ''))).toEqual(
      expect.arrayContaining(['SL', 'TP']),
    );
  });

  it('метка хранит (время, цена): смена проекции сдвигает пиксели, но не якоря', () => {
    const m = mk('level', [a(5, 250)]);
    const before = JSON.stringify(m);
    buildGeometry(m, { ...synthetic_proj, timeToX: (t) => ((t - T0) / H) * 25 });
    expect(JSON.stringify(m)).toBe(before);
  });
});

describe('isMarkVisible (рисуем только видимое)', () => {
  it('метка далеко слева/справа не видна; зона, перекрывающая экран, видна', () => {
    expect(isMarkVisible(mk('swing-high', [a(-100, 300)]), synthetic_proj)).toBe(false);
    expect(isMarkVisible(mk('swing-high', [a(500, 300)]), synthetic_proj)).toBe(false);
    expect(isMarkVisible(mk('swing-high', [a(10, 300)]), synthetic_proj)).toBe(true);
    expect(isMarkVisible(mk('order-block', [a(-100, 300), a(500, 250)]), synthetic_proj)).toBe(true);
  });
  it('уровень виден, если цена в окне; hline - если точка левее правого края', () => {
    expect(isMarkVisible(mk('level', [a(-500, 250)]), synthetic_proj)).toBe(true);
    expect(isMarkVisible(mk('level', [a(0, 2000)]), synthetic_proj)).toBe(false);
    expect(isMarkVisible(mk('hline', [a(-500, 250)]), synthetic_proj)).toBe(true);
    expect(isMarkVisible(mk('hline', [a(500, 250)]), synthetic_proj)).toBe(false);
  });
});

describe('подписи метки', () => {
  it('internal BOS/CHoCH подписываются iBOS / iCHoCH', () => {
    const t = (kind: 'bos' | 'choch') => buildGeometry(mk(kind, [a(5, 300), a(15, 300)], { scope: 'internal' }), synthetic_proj).parts.find((p) => p.t === 'text');
    expect(t('bos')).toMatchObject({ text: 'iBOS' });
    expect(t('choch')).toMatchObject({ text: 'iCHoCH' });
    const ext = buildGeometry(mk('bos', [a(5, 300), a(15, 300)], { scope: 'external' }), synthetic_proj).parts.find((p) => p.t === 'text');
    expect(ext).toMatchObject({ text: 'BOS' });
  });

  it('подпись у правого края сдвигается влево от якоря и не выходит за область графика', () => {
    // позиция у самого правого края: x = 395 при ширине 400
    const g = buildGeometry(mk('position', [a(39.5, 300), a(39.5, 280), a(39.5, 340)]), synthetic_proj);
    const texts = g.parts.filter((p) => p.t === 'text');
    expect(texts.length).toBe(3);
    for (const p of texts) if (p.t === 'text') expect(p.x + textWidth(p.text) / 2).toBeLessThanOrEqual(synthetic_proj.width);
    expect(keepTextsInside([{ t: 'text', text: 'TP', x: 5, y: 0 }], 400)[0]).toMatchObject({ x: textWidth('TP') / 2 + 2 });
  });
});
