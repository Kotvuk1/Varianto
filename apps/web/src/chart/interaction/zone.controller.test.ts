import { describe, expect, it } from 'vitest';
import type { Candle, Mark } from '@tl/core';
import { TimeIndex } from '../geometry/timeIndex';
import type { Projection } from '../drawing/projection';
import { ZONE_KIND, type ToolId } from '../drawing/tools';
import { DrawingController, type ControllerNotice } from './controller';

const H = 3_600_000;
const T0 = Date.UTC(2025, 0, 1);
// SYNTHETIC: треугольная волна с растущим трендом (пики на 10, 30; впадины на 0, 20, 40), не рыночные данные
const tri = (i: number) => Math.abs(((i + 10) % 20) - 10);
const synthetic_candles: Candle[] = Array.from({ length: 50 }, (_, i) => {
  const high = 300 + 4 * tri(i) + 2 * i + 10;
  return { openTime: T0 + i * H, closeTime: T0 + (i + 1) * H - 1, open: high - 8, high, low: high - 10, close: high - 1, volume: 1, quoteVolume: 1, trades: 1, closed: true };
});
const index = new TimeIndex(synthetic_candles.map((c) => c.openTime), H);
const proj: Projection = {
  timeToX: (t) => index.timeToLogical(t) * 10,
  xToTime: (x) => index.logicalToTime(x / 10),
  priceToY: (p) => 600 - p,
  yToPrice: (y) => 600 - y,
  width: 500,
  height: 400,
};
const pt = (x: number, y: number) => ({ x, y, pointer: 'mouse' as const });

function setup(tool: ToolId | null, initial: Mark[] = [], selectedInit: string | null = null, notices: ControllerNotice[] = []) {
  let marks = initial;
  let selected = selectedInit;
  let n = 0;
  const c = new DrawingController({
    proj: () => proj,
    index: () => index,
    candles: () => synthetic_candles,
    notify: (x) => notices.push(x),
    marks: () => marks,
    commit: (m) => {
      marks = m;
    },
    tool: () => tool,
    snap: () => true,
    selectedId: () => selected,
    select: (id) => {
      selected = id;
    },
    newId: () => `id${++n}`,
  });
  return { c, get marks() { return marks; } };
}
const tap = (c: DrawingController, x: number, y: number) => {
  c.pointerDown(pt(x, y));
  c.pointerUp(pt(x, y));
};
const drag = (c: DrawingController, x1: number, y1: number, x2: number, y2: number) => {
  c.pointerDown(pt(x1, y1));
  c.pointerMove(pt((x1 + x2) / 2, (y1 + y2) / 2));
  c.pointerMove(pt(x2, y2));
  c.pointerUp(pt(x2, y2));
};
const Y = (price: number) => 600 - price;
// свинг high на свече 10: high 370, верх тела 369; свинг low на свече 20: low 340, низ тела 342

describe('инструмент «Зона»', () => {
  it('протяжка по вертикали: края прилипают к фитилю/телу свингов, время общее', () => {
    const s = setup('zone');
    drag(s.c, 100, Y(372), 100, Y(344));
    expect(s.marks).toHaveLength(1);
    expect(s.marks[0]).toMatchObject({ kind: ZONE_KIND, author: 'user' });
    expect(s.marks[0]!.anchors).toEqual([
      { time: T0 + 10 * H, price: 370 },
      { time: T0 + 10 * H, price: 342 },
    ]);
  });
  it('два касания дают ту же зону, порядок касаний не важен (верх всегда первый якорь)', () => {
    const s = setup('zone');
    tap(s.c, 100, Y(344));
    expect(s.marks).toHaveLength(0);
    expect(s.c.hasPending()).toBe(true);
    tap(s.c, 100, Y(372));
    expect(s.marks[0]!.anchors.map((a) => a.price)).toEqual([370, 342]);
  });
  it('края на одной цене: зона не создаётся, предупреждение zone-flat', () => {
    const notices: ControllerNotice[] = [];
    const s = setup('zone', [], null, notices);
    tap(s.c, 100, Y(371));
    tap(s.c, 100, Y(369.5));
    expect(s.marks).toHaveLength(0);
    expect(notices.some((n) => n.code === 'zone-flat')).toBe(true);
  });
  it('перетаскивание края: меняется только цена выбранного края, время не меняется', () => {
    const zone: Mark = { id: 'z', kind: ZONE_KIND, anchors: [{ time: T0 + 10 * H, price: 370 }, { time: T0 + 10 * H, price: 342 }], scope: null, direction: null, author: 'user' };
    const s = setup('select', [zone], 'z');
    // ручка нижнего края (индекс 1) у левой границы зоны; уводим вправо и вниз - время остаётся прежним
    drag(s.c, 100, Y(342), 180, Y(300));
    const [a0, a1] = s.marks[0]!.anchors;
    expect(a0).toEqual({ time: T0 + 10 * H, price: 370 });
    expect(a1!.time).toBe(T0 + 10 * H);
    expect(a1!.price).toBeLessThan(342);
  });
  it('край, перетянутый выше противоположного, переупорядочивается (верх >= низ)', () => {
    const zone: Mark = { id: 'z', kind: ZONE_KIND, anchors: [{ time: T0 + 10 * H, price: 370 }, { time: T0 + 10 * H, price: 342 }], scope: null, direction: null, author: 'user' };
    const s = setup('select', [zone], 'z');
    drag(s.c, 100, Y(342), 100, Y(420));
    const [a0, a1] = s.marks[0]!.anchors;
    expect(a0!.price).toBeGreaterThan(a1!.price);
    expect(a1!.price).toBe(370);
  });
});

describe('инструмент «Лимитный ордер»', () => {
  it('тап: горизонталь без снапа на точной цене, сторона по последней цене (ниже - buy)', () => {
    const s = setup('limit');
    tap(s.c, 200, Y(400));
    expect(s.marks).toHaveLength(1);
    expect(s.marks[0]).toMatchObject({ kind: 'hline', meta: { role: 'limit', side: 'buy' } });
    expect(s.marks[0]!.anchors[0]!.price).toBe(400);
  });
  it('лимитка одна: новая заменяет прежнюю; выше последней цены - sell', () => {
    const s = setup('limit');
    tap(s.c, 200, Y(400));
    tap(s.c, 200, Y(480));
    expect(s.marks).toHaveLength(1);
    expect(s.marks[0]!.meta).toMatchObject({ role: 'limit', side: 'sell' });
  });
  it('перетаскивание за линию: меняется цена и сторона, время якоря не меняется', () => {
    const s = setup('limit');
    tap(s.c, 200, Y(400));
    const t = s.marks[0]!.anchors[0]!.time;
    const sel = setup('select', s.marks, s.marks[0]!.id);
    drag(sel.c, 300, Y(400), 360, Y(470));
    expect(sel.marks[0]!.anchors[0]!.price).toBeCloseTo(470, 5);
    expect(sel.marks[0]!.anchors[0]!.time).toBe(t);
    expect(sel.marks[0]!.meta).toMatchObject({ role: 'limit', side: 'sell' });
  });
});

describe('позиция ступени 4: вход зафиксирован', () => {
  const pos = (): Mark => ({
    id: 'p',
    kind: 'position',
    anchors: [
      { time: T0 + 30 * H, price: 410 },
      { time: T0 + 30 * H, price: 390 },
      { time: T0 + 30 * H, price: 450 },
    ],
    scope: null,
    direction: null,
    author: 'user',
    meta: { entry: 410, sl: 390, tp: 450, entryLocked: true },
  });
  it('вход не двигается ни за ручку, ни за линию; SL и TP перетаскиваются, meta обновляется', () => {
    const s = setup('select', [pos()], 'p');
    drag(s.c, 300, Y(410), 300, Y(430));
    expect(s.marks[0]!.anchors[0]!.price).toBe(410);
    drag(s.c, 300, Y(390), 300, Y(380));
    expect(s.marks[0]!.anchors[1]!.price).toBeCloseTo(380, 5);
    expect(s.marks[0]!.anchors[0]!.price).toBe(410);
    expect(s.marks[0]!.meta).toMatchObject({ entry: 410, sl: s.marks[0]!.anchors[1]!.price, tp: 450, entryLocked: true });
    drag(s.c, 300, Y(450), 300, Y(470));
    expect(s.marks[0]!.anchors[2]!.price).toBeCloseTo(470, 5);
  });
});
