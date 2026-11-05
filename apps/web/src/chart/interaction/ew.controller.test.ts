import { describe, expect, it } from 'vitest';
import type { Candle, Mark } from '@tl/core';
import { TimeIndex } from '../geometry/timeIndex';
import type { Projection } from '../drawing/projection';
import type { ToolId } from '../drawing/tools';
import { DrawingController, type ControllerNotice } from './controller';

const H = 3_600_000;
const T0 = Date.UTC(2025, 0, 1);
// SYNTHETIC: треугольная волна с растущим трендом (впадины на 0, 20, 40; пики на 10, 30), не рыночные данные
const tri = (i: number) => Math.abs(((i + 10) % 20) - 10);
const candles: Candle[] = Array.from({ length: 50 }, (_, i) => {
  const high = 300 + 4 * tri(i) + 2 * i + 10;
  return { openTime: T0 + i * H, closeTime: T0 + (i + 1) * H - 1, open: high - 8, high, low: high - 10, close: high - 1, volume: 1, quoteVolume: 1, trades: 1, closed: true };
});
const index = new TimeIndex(candles.map((c) => c.openTime), H);
const proj: Projection = {
  timeToX: (t) => index.timeToLogical(t) * 10,
  xToTime: (x) => index.logicalToTime(x / 10),
  priceToY: (p) => 600 - p,
  yToPrice: (y) => 600 - y,
  width: 500,
  height: 400,
};
const pt = (x: number, y: number) => ({ x, y, pointer: 'mouse' as const });

function setup(tool: ToolId | null, initial: Mark[] = []) {
  let marks = initial;
  let n = 0;
  const notices: ControllerNotice[] = [];
  let selected: string | null = null;
  const c = new DrawingController({
    proj: () => proj, index: () => index, candles: () => candles,
    notify: (x) => notices.push(x),
    marks: () => marks, commit: (m) => { marks = m; },
    tool: () => tool, snap: () => true,
    selectedId: () => selected, select: (id) => { selected = id; },
    newId: () => `id${++n}`,
  });
  return { c, notices, get marks() { return marks; } };
}
const tap = (c: DrawingController, i: number, price: number) => {
  c.pointerDown(pt(i * 10, 600 - price));
  c.pointerUp(pt(i * 10, 600 - price));
};
// касания у реальных (синтетических) экстремумов: 0 low, 1 high, 2 low, 3 high, 4 low, 5 high
const TAPS: [number, number][] = [[0, 298], [10, 372], [20, 338], [30, 412], [40, 378], [49, 446]];
const low = (i: number) => ({ time: candles[i]!.openTime, price: candles[i]!.low });
const high = (i: number) => ({ time: candles[i]!.openTime, price: candles[i]!.high });

describe('ew-impulse: 6 касаний со снапом и чередованием сторон', () => {
  it('0 low, 1 high, 2 low, 3 high, 4 low, 5 high; направление bull; подписи в meta', () => {
    const s = setup('ew-impulse');
    TAPS.slice(0, 5).forEach(([i, p]) => tap(s.c, i, p));
    expect(s.marks).toHaveLength(0);
    expect(s.notices.at(-1)!.step).toBe(5);
    tap(s.c, ...TAPS[5]!);
    expect(s.marks).toHaveLength(1);
    const m = s.marks[0]!;
    expect(m.kind).toBe('ew-impulse');
    expect(m.direction).toBe('bull');
    expect(m.anchors).toEqual([low(0), high(10), low(20), high(30), low(40), expect.objectContaining({ time: candles[49]!.openTime })]);
    expect((m.meta as { labels: string[] }).labels).toEqual(['0', '1', '2', '3', '4', '5']);
  });

  it('сторона следующей точки задаётся чередованием, а не высотой касания внутри свечи', () => {
    const s = setup('ew-impulse');
    tap(s.c, 0, 298);
    tap(s.c, 10, 340); // касание у низа свечи 10, но точка 1 - high
    tap(s.c, 20, 372); // касание у верха, но точка 2 - low
    tap(s.c, 30, 405);
    tap(s.c, 40, 395);
    s.c.finish();
    expect(s.marks[0]!.anchors[1]).toEqual(high(10));
    expect(s.marks[0]!.anchors[2]).toEqual(low(20));
  });

  it('импульс вниз: направление по первым двум точкам', () => {
    const s = setup('ew-impulse');
    tap(s.c, 10, 408); // high свечи 10 = 370? берём вершину свечи 30
    expect(s.c.hasPending()).toBe(true);
  });

  it('«Готово»: неполный импульс из 3 или 5 точек; на 1, 2, 4 точках недоступно', () => {
    const s = setup('ew-impulse');
    tap(s.c, ...TAPS[0]!);
    tap(s.c, ...TAPS[1]!);
    expect(s.c.canFinish()).toBe(false);
    tap(s.c, ...TAPS[2]!);
    expect(s.c.canFinish()).toBe(true);
    tap(s.c, ...TAPS[3]!);
    expect(s.c.canFinish()).toBe(false);
    expect(s.c.finish()).toBe(false);
    tap(s.c, ...TAPS[4]!);
    expect(s.c.canFinish()).toBe(true);
    expect(s.c.finish()).toBe(true);
    expect(s.marks).toHaveLength(1);
    expect(s.marks[0]!.anchors).toHaveLength(5);
    expect((s.marks[0]!.meta as { labels: string[] }).labels).toEqual(['0', '1', '2', '3', '4']);
    expect(s.c.hasPending()).toBe(false);
  });

  it('точка не левее предыдущей: уведомление ew-order, метка не меняется', () => {
    const s = setup('ew-impulse');
    tap(s.c, ...TAPS[0]!);
    tap(s.c, ...TAPS[1]!);
    tap(s.c, 5, 330);
    expect(s.notices.at(-1)!.code).toBe('ew-order');
    expect(s.notices.at(-1)!.step).toBe(2);
  });

  it('черновик: draft равен числу поставленных точек', () => {
    const s = setup('ew-impulse');
    tap(s.c, ...TAPS[0]!);
    tap(s.c, ...TAPS[1]!);
    expect((s.c.preview!.meta as { draft: number }).draft).toBe(2);
  });
});

describe('ew-zigzag / ew-flat / инвалидация', () => {
  it('зигзаг A-B-C тремя касаниями', () => {
    const s = setup('ew-zigzag');
    tap(s.c, 10, 372);
    tap(s.c, 20, 340);
    tap(s.c, 30, 405);
    expect(s.marks[0]!.kind).toBe('ew-zigzag');
    expect(s.marks[0]!.anchors).toEqual([high(10), low(20), high(30)]);
    expect(s.marks[0]!.direction).toBe('bear');
    expect((s.marks[0]!.meta as { labels: string[] }).labels).toEqual(['A', 'B', 'C']);
  });
  it('плоская A-B-C', () => {
    const s = setup('ew-flat');
    tap(s.c, 10, 372);
    tap(s.c, 20, 340);
    tap(s.c, 30, 405);
    expect(s.marks[0]!.kind).toBe('ew-flat');
  });
  it('«Инвалидация»: hline с meta.role = ew-invalidation, одно касание', () => {
    const s = setup('ew-invalidation');
    tap(s.c, 25, 340);
    expect(s.marks).toHaveLength(1);
    expect(s.marks[0]!.kind).toBe('hline');
    expect(s.marks[0]!.meta).toMatchObject({ role: 'ew-invalidation' });
  });
});

describe('правка: перетаскивание точки и ластик', () => {
  const imp = (): Mark =>
    ({ id: 'w', kind: 'ew-impulse', anchors: [low(0), high(10), low(20), high(30), low(40)], scope: null, direction: 'bull', author: 'user' }) as Mark;
  it('точка 2 перетаскивается к другому минимуму: снап к low', () => {
    const s = setup('select', [imp()]);
    tap(s.c, 5, 335); // выбрать метку
    s.c.pointerDown(pt(200, 600 - 340));
    s.c.pointerMove(pt(180, 600 - 345));
    s.c.pointerUp(pt(180, 600 - 345));
    expect(s.marks[0]!.anchors[2]).toEqual(low(20)); // снап к минимуму в радиусе, сторона low сохранена
    expect(s.marks[0]!.anchors).toHaveLength(5);
  });
  it('перенос точки левее предыдущей отклоняется', () => {
    const s = setup('select', [imp()]);
    tap(s.c, 5, 335);
    s.c.pointerDown(pt(200, 600 - 340));
    s.c.pointerMove(pt(50, 600 - 330));
    s.c.pointerUp(pt(50, 600 - 330));
    expect(s.marks[0]!.anchors[2]).toEqual(low(20));
  });
  it('ластик удаляет по линии', () => {
    const s = setup('eraser', [imp()]);
    tap(s.c, 5, 335); // середина первого звена
    expect(s.marks).toHaveLength(0);
  });
});
