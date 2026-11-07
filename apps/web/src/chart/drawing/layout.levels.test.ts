import { describe, expect, it } from 'vitest';
import type { Mark } from '@tl/core';
import type { Projection } from './projection';
import { buildGeometry, isMarkVisible } from './layout';
import { hitTest, toleranceFor } from './hit';

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
const mk = (kind: Mark['kind'], prices: number[], extra: Partial<Mark> = {}, t = 10): Mark => ({
  id: 'm1',
  kind,
  anchors: prices.map((price) => ({ time: T0 + t * H, price })),
  scope: null,
  direction: null,
  author: 'user',
  ...extra,
});

describe('зона уровня', () => {
  it('прямоугольник от времени начала до правого края, верх/низ по ценам', () => {
    const g = buildGeometry(mk('zone', [300, 280]), synthetic_proj);
    const r = g.parts.find((p) => p.t === 'rect');
    expect(r).toMatchObject({ x1: 100, x2: 400, y1: 200, y2: 220 });
  });
  it('пользовательская зона: сплошной контур без штриховки; эталон (algo): пунктир со штриховкой', () => {
    const u = buildGeometry(mk('zone', [300, 280]), synthetic_proj).parts.find((p) => p.t === 'rect');
    const a = buildGeometry(mk('zone', [300, 280], { author: 'algo' }), synthetic_proj).parts.find((p) => p.t === 'rect');
    expect(u).toMatchObject({ dash: 'solid', hatch: false });
    expect(a).toMatchObject({ dash: 'dashed', hatch: true });
  });
  it('подпись эталона: тип и сила; флип отличается и глифом, и текстом', () => {
    const sup = buildGeometry(mk('zone', [300, 280], { author: 'algo', meta: { zoneType: 'support', strength: 4.5 } }), synthetic_proj);
    expect(sup.parts.find((p) => p.t === 'text')).toMatchObject({ text: 'Поддержка · сила 4,5' });
    const flip = buildGeometry(mk('zone', [300, 280], { author: 'algo', meta: { zoneType: 'flip', strength: 5 } }), synthetic_proj);
    expect(flip.parts.find((p) => p.t === 'text')).toMatchObject({ text: 'Флип · сила 5' });
    const glyphs = [sup, flip].map((g) => g.parts.find((p) => p.t === 'glyph')?.t === 'glyph' ? (g.parts.find((p) => p.t === 'glyph') as { g: string }).g : null);
    expect(glyphs[0]).not.toBe(glyphs[1]);
    expect(glyphs.every(Boolean)).toBe(true);
  });
  it('без типа - подпись «Зона»; две ручки (верх и низ) на левой границе в видимой области', () => {
    const g = buildGeometry(mk('zone', [300, 280]), synthetic_proj);
    expect(g.parts.find((p) => p.t === 'text')).toMatchObject({ text: 'Зона' });
    expect(g.handles).toEqual([
      { x: 100, y: 200, index: 0 },
      { x: 100, y: 220, index: 1 },
    ]);
  });
  it('левая граница за экраном: ручки остаются в видимой области', () => {
    const g = buildGeometry(mk('zone', [300, 280], {}, -30), synthetic_proj);
    expect(g.handles.every((h) => h.x >= 0)).toBe(true);
  });
  it('видима, пока левая граница левее правого края панели, даже если сама зона начата давно', () => {
    expect(isMarkVisible(mk('zone', [300, 280], {}, -500), synthetic_proj)).toBe(true);
    expect(isMarkVisible(mk('zone', [300, 280], {}, 100), synthetic_proj)).toBe(false);
  });
  it('хит-тест по краю и по телу зоны; касание 44 px вокруг края', () => {
    const g = buildGeometry(mk('zone', [300, 280]), synthetic_proj);
    expect(hitTest([g], 250, 200 - 20, toleranceFor('touch'))).toEqual({ markId: 'm1', part: 'body' });
    expect(hitTest([g], 250, 210, toleranceFor('mouse'))).toEqual({ markId: 'm1', part: 'body' });
  });
});

describe('лимитный ордер', () => {
  const lim = (price: number, side: 'buy' | 'sell') => mk('hline', [price], { meta: { role: 'limit', side } });
  it('линия во всю ширину и плашка «Limit BUY · цена»', () => {
    const g = buildGeometry(lim(300, 'buy'), synthetic_proj, { fmt: (p) => String(p) });
    expect(g.parts.find((p) => p.t === 'seg')).toMatchObject({ x1: 0, x2: 400, y1: 200, y2: 200 });
    expect(g.parts.find((p) => p.t === 'text')).toMatchObject({ text: 'Limit BUY · 300' });
  });
  it('сторона различается подписью и формой (стрелка вверх/вниз)', () => {
    const b = buildGeometry(lim(300, 'buy'), synthetic_proj, { fmt: String });
    const s = buildGeometry(lim(300, 'sell'), synthetic_proj, { fmt: String });
    expect(s.parts.find((p) => p.t === 'text')).toMatchObject({ text: 'Limit SELL · 300' });
    expect(b.parts.find((p) => p.t === 'glyph')).toMatchObject({ g: 'arrow-up' });
    expect(s.parts.find((p) => p.t === 'glyph')).toMatchObject({ g: 'arrow-down' });
  });
  it('ручка слева от плашки внутри панели', () => {
    const g = buildGeometry(lim(300, 'buy'), synthetic_proj, { fmt: String });
    expect(g.handles).toHaveLength(1);
    expect(g.handles[0]!.x).toBeLessThan(400);
    expect(g.handles[0]!.y).toBe(200);
  });
});

describe('позиция: R:R и риск', () => {
  const pos = (prices: number[], meta: Record<string, unknown> = {}) => mk('position', prices, { meta });
  const texts = (m: Mark, o = {}) => buildGeometry(m, synthetic_proj, { fmt: String, ...o }).parts.flatMap((p) => (p.t === 'text' ? [p.text] : []));
  it('long: риск −1R у SL, +2,0R у TP, R:R в подписи входа', () => {
    expect(texts(pos([300, 290, 320]))).toEqual(['Вход · R:R 1:2,0', 'SL · −1R', 'TP · +2,0R']);
  });
  it('вырожденная позиция: подписи без R', () => {
    expect(texts(pos([300, 300, 320]))).toEqual(['Вход', 'SL', 'TP']);
  });
  it('вход зафиксирован: пометка и нет ручки входа', () => {
    const g = buildGeometry(pos([300, 290, 320], { entryLocked: true }), synthetic_proj, { fmt: String });
    expect(g.parts.filter((p) => p.t === 'text').map((p) => (p as { text: string }).text)[0]).toBe('Вход (фикс.) · R:R 1:2,0');
    expect(g.handles.map((h) => h.index)).toEqual([1, 2]);
  });
  it('подсказка запаса от фитиля в ATR на подписи SL', () => {
    // структура 292, SL 290, ATR 4 -> запас 0,5 ATR
    expect(texts(pos([300, 290, 320]), { slHint: { structure: 292, atr: 4 } })[1]).toBe('SL · −1R · запас 0,5 ATR');
  });
});
