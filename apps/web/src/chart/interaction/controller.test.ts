import { describe, expect, it } from 'vitest';
import type { Candle, Mark } from '@tl/core';
import { TimeIndex } from '../geometry/timeIndex';
import type { Projection } from '../drawing/projection';
import type { ToolId } from '../drawing/tools';
import { DrawingController } from './controller';

const H = 3_600_000;
const T0 = Date.UTC(2025, 0, 1);
// SYNTHETIC: минимальный ряд для проверки жестов, не рыночные данные
const synthetic_candles: Candle[] = Array.from({ length: 50 }, (_, i) => ({
  openTime: T0 + i * H,
  closeTime: T0 + (i + 1) * H - 1,
  open: 300 + i,
  high: 310 + i,
  low: 290 + i,
  close: 305 + i,
  volume: 1,
  quoteVolume: 1,
  trades: 1,
  closed: true,
}));
const index = new TimeIndex(
  synthetic_candles.map((c) => c.openTime),
  H,
);
const proj: Projection = {
  timeToX: (t) => index.timeToLogical(t) * 10,
  xToTime: (x) => index.logicalToTime(x / 10),
  priceToY: (p) => 600 - p,
  yToPrice: (y) => 600 - y,
  width: 500,
  height: 400,
};

function setup(tool: ToolId | null, initial: Mark[] = [], snap = true) {
  let marks = initial;
  let selected: string | null = null;
  let n = 0;
  const commits: Mark[][] = [];
  const c = new DrawingController({
    proj: () => proj,
    index: () => index,
    candles: () => synthetic_candles,
    marks: () => marks,
    commit: (m) => {
      marks = m;
      commits.push(m);
    },
    tool: () => tool,
    snap: () => snap,
    selectedId: () => selected,
    select: (id) => {
      selected = id;
    },
    newId: () => `id${++n}`,
  });
  return { c, get marks() { return marks; }, get selected() { return selected; }, commits };
}
const pt = (x: number, y: number) => ({ x, y, pointer: 'mouse' as const });
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

describe('рисование', () => {
  it('swing-high: тап создаёт метку, время снапится к openTime, цена - к OHLC (high)', () => {
    const s = setup('swing-high');
    // свеча 10: high=320; тап около x=101 (между центрами), y -> цена ~319
    expect(s.c.pointerDown(pt(101, 600 - 319))).toBe(true);
    s.c.pointerUp(pt(101, 600 - 319));
    expect(s.marks).toHaveLength(1);
    expect(s.marks[0]).toMatchObject({ kind: 'swing-high', author: 'user', id: 'id1' });
    expect(s.marks[0]!.anchors[0]).toEqual({ time: T0 + 10 * H, price: 320 });
  });

  it('без снапа цена остаётся как в точке касания', () => {
    const s = setup('swing-high', [], false);
    tap(s.c, 100, 600 - 317.5);
    expect(s.marks[0]!.anchors[0]!.price).toBeCloseTo(317.5, 6);
  });

  it('BOS протяжкой: свинг -> свеча пробоя, линия горизонтальна на цене свинга', () => {
    const s = setup('bos');
    drag(s.c, 100, 600 - 320, 200, 600 - 335);
    expect(s.marks).toHaveLength(1);
    const [a0, a1] = s.marks[0]!.anchors;
    expect(a0).toEqual({ time: T0 + 10 * H, price: 320 });
    expect(a1!.time).toBe(T0 + 20 * H);
    expect(a1!.price).toBe(a0!.price);
  });

  it('BOS двумя тапами: после первого - ожидание, превью следует за курсором', () => {
    const s = setup('bos');
    tap(s.c, 100, 600 - 320);
    expect(s.marks).toHaveLength(0);
    expect(s.c.hasPending()).toBe(true);
    s.c.hover(pt(150, 600 - 330));
    expect(s.c.preview?.kind).toBe('bos');
    tap(s.c, 200, 600 - 330);
    expect(s.marks).toHaveLength(1);
    expect(s.c.hasPending()).toBe(false);
    expect(s.c.preview).toBeNull();
  });

  it('position: три тапа; время SL/TP равно времени входа', () => {
    const s = setup('position');
    tap(s.c, 100, 600 - 320);
    tap(s.c, 130, 600 - 300);
    expect(s.marks).toHaveLength(0);
    tap(s.c, 160, 600 - 360);
    expect(s.marks).toHaveLength(1);
    const a = s.marks[0]!.anchors;
    expect(a).toHaveLength(3);
    expect(new Set(a.map((x) => x.time)).size).toBe(1);
    expect(a.map((x) => x.price)).toEqual([320, 300, 360]);
  });

  it('cancel/reset сбрасывает незавершённую метку', () => {
    const s = setup('fvg');
    tap(s.c, 100, 200);
    s.c.reset();
    expect(s.c.hasPending()).toBe(false);
    expect(s.marks).toHaveLength(0);
  });

  it('во время рисования pointerDown обработан (график не скроллит)', () => {
    const s = setup('order-block');
    expect(s.c.pointerDown(pt(50, 50))).toBe(true);
  });
});

const lvl: Mark = {
  id: 'L',
  kind: 'level',
  anchors: [{ time: T0 + 10 * H, price: 350 }],
  scope: null,
  direction: null,
  author: 'user',
};
const bosMark: Mark = {
  id: 'B',
  kind: 'bos',
  anchors: [
    { time: T0 + 10 * H, price: 320 },
    { time: T0 + 20 * H, price: 320 },
  ],
  scope: null,
  direction: null,
  author: 'user',
};

describe('выбор и перемещение', () => {
  it('тап по метке выбирает её; мимо - снимает выбор и жест уходит графику', () => {
    const s = setup('select', [lvl]);
    expect(s.c.pointerDown(pt(300, 600 - 350))).toBe(true);
    s.c.pointerUp(pt(300, 600 - 350));
    expect(s.selected).toBe('L');
    expect(s.c.pointerDown(pt(300, 20))).toBe(false);
    expect(s.selected).toBeNull();
  });

  it('перетаскивание якоря BOS меняет время конца и сохраняет горизонтальность', () => {
    const s = setup('select', [bosMark]);
    tap(s.c, 150, 600 - 320); // выбрать
    expect(s.selected).toBe('B');
    drag(s.c, 200, 600 - 320, 300, 600 - 340);
    const a = s.marks[0]!.anchors;
    expect(a[1]!.time).toBe(T0 + 30 * H);
    expect(a[1]!.price).toBe(a[0]!.price);
    expect(a[0]).toEqual({ time: T0 + 10 * H, price: 320 });
  });

  it('перемещение тела сдвигает все якоря на целое число свечей и на разницу цены', () => {
    const s = setup('select', [bosMark]);
    drag(s.c, 150, 600 - 320, 180, 600 - 330); // +3 свечи, +10 цены
    const a = s.marks[0]!.anchors;
    expect(a[0]).toEqual({ time: T0 + 13 * H, price: 330 });
    expect(a[1]).toEqual({ time: T0 + 23 * H, price: 330 });
  });

  it('во время перетаскивания рабочая копия в override, commit - только на отпускании', () => {
    const s = setup('select', [lvl]);
    s.c.pointerDown(pt(300, 600 - 350));
    s.c.pointerMove(pt(300, 600 - 360));
    expect(s.c.override?.anchors[0]!.price).toBe(360);
    expect(s.commits).toHaveLength(0);
    s.c.pointerUp(pt(300, 600 - 360));
    expect(s.commits).toHaveLength(1);
    expect(s.c.override).toBeNull();
  });

  it('метки алгоритма не редактируются (не входят в marks контроллера)', () => {
    const s = setup('select', []);
    expect(s.c.pointerDown(pt(300, 600 - 350))).toBe(false);
  });
});

describe('ластик', () => {
  it('удаляет метку под указателем', () => {
    const s = setup('eraser', [lvl, bosMark]);
    expect(s.c.pointerDown(pt(300, 600 - 350))).toBe(true);
    expect(s.marks.map((m) => m.id)).toEqual(['B']);
  });
  it('мимо метки жест уходит графику', () => {
    const s = setup('eraser', [lvl]);
    expect(s.c.pointerDown(pt(300, 20))).toBe(false);
    expect(s.marks).toHaveLength(1);
  });
});

describe('удаление выбранной', () => {
  it('deleteSelected удаляет выбранную метку', () => {
    const s = setup('select', [lvl]);
    tap(s.c, 300, 600 - 350);
    s.c.deleteSelected();
    expect(s.marks).toHaveLength(0);
    expect(s.selected).toBeNull();
  });
});
