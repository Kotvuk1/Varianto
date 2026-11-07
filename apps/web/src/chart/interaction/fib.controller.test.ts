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
const pt = (x: number, y: number, pointer: 'mouse' | 'touch' = 'mouse') => ({ x, y, pointer });

function setup(tool: ToolId | null, initial: Mark[] = [], readOnly: Mark[] = []) {
  let marks = initial;
  let selected: string | null = null;
  let n = 0;
  const notices: ControllerNotice[] = [];
  const picks: { markId: string; level: number }[] = [];
  const c = new DrawingController({
    proj: () => proj,
    index: () => index,
    candles: () => candles,
    notify: (x) => notices.push(x),
    marks: () => marks,
    readOnlyMarks: () => readOnly,
    onLevelPick: (p) => picks.push(p),
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
  return { c, notices, picks, get marks() { return marks; }, get selected() { return selected; } };
}
const tap = (c: DrawingController, x: number, y: number, kind: 'mouse' | 'touch' = 'mouse') => {
  c.pointerDown(pt(x, y, kind));
  c.pointerUp(pt(x, y, kind));
};
const A_TAP = [200, 262] as const; // впадина свечи 20: low 340 (касание чуть ниже)
const B_TAP = [300, 192] as const; // вершина свечи 30: high 410
const C_TAP = [400, 258] as const; // впадина свечи 40: low 342 + ... см. ниже
const algo = (kind: string, anchors: Mark['anchors']): Mark => ({ id: 'algo1', kind, anchors, scope: null, direction: 'bull', author: 'algo' }) as Mark;

describe('fib-retracement: построение двумя касаниями', () => {
  it('A затем B: снап к low/high экстремумов, направление по цене, одна метка', () => {
    const s = setup('fib-retracement');
    tap(s.c, ...A_TAP);
    expect(s.marks).toHaveLength(0);
    expect(s.notices.at(-1)!.step).toBe(1);
    expect(s.c.preview).not.toBeNull();
    tap(s.c, ...B_TAP);
    expect(s.marks).toHaveLength(1);
    const m = s.marks[0]!;
    expect(m.kind).toBe('fib-retracement');
    expect(m.author).toBe('user');
    expect(m.direction).toBe('bull');
    expect(m.anchors).toEqual([
      { time: candles[20]!.openTime, price: candles[20]!.low },
      { time: candles[30]!.openTime, price: candles[30]!.high },
    ]);
    expect(s.c.preview).toBeNull();
  });

  it('протяжка пальцем от A к B (drag) тоже строит сетку', () => {
    const s = setup('fib-retracement');
    s.c.pointerDown(pt(...A_TAP, 'touch'));
    s.c.pointerMove(pt(250, 230, 'touch'));
    s.c.pointerMove(pt(...B_TAP, 'touch'));
    s.c.pointerUp(pt(...B_TAP, 'touch'));
    expect(s.marks).toHaveLength(1);
  });

  it('импульс вниз: начало на вершине, конец на впадине - direction bear', () => {
    const s = setup('fib-retracement');
    tap(s.c, ...B_TAP);
    tap(s.c, 400, 262);
    expect(s.marks[0]!.direction).toBe('bear');
    expect(s.marks[0]!.anchors[0]!.price).toBe(candles[30]!.high);
  });
});

describe('fib-extension: три касания', () => {
  it('A, B, C: три якоря, шаги 1 и 2 в уведомлениях, превью-черновик между касаниями', () => {
    const s = setup('fib-extension');
    tap(s.c, ...A_TAP);
    expect(s.notices.at(-1)!.step).toBe(1);
    expect((s.c.preview!.meta as { draft?: number }).draft).toBe(1);
    tap(s.c, ...B_TAP);
    expect(s.marks).toHaveLength(0);
    expect(s.notices.at(-1)!.step).toBe(2);
    tap(s.c, ...C_TAP);
    expect(s.marks).toHaveLength(1);
    const m = s.marks[0]!;
    expect(m.kind).toBe('fib-extension');
    expect(m.anchors).toHaveLength(3);
    expect(m.direction).toBe('bull');
    expect(m.anchors[2]!.time).toBe(candles[40]!.openTime);
  });

  it('смена инструмента посреди построения сбрасывает ожидающие якоря', () => {
    const s = setup('fib-extension');
    tap(s.c, ...A_TAP);
    s.c.reset();
    expect(s.c.hasPending()).toBe(false);
  });
});

describe('перетаскивание якорей и ластик', () => {
  const grid = (): Mark =>
    ({ id: 'g1', kind: 'fib-retracement', anchors: [{ time: candles[20]!.openTime, price: 340 }, { time: candles[30]!.openTime, price: 410 }], scope: null, direction: 'bull', author: 'user' }) as Mark;

  it('якорь B переносится; направление пересчитывается по цене', () => {
    const s = setup('select', [grid()]);
    tap(s.c, 250, 230); // выбрать метку по линии уровня
    expect(s.selected).toBe('g1');
    s.c.pointerDown(pt(...B_TAP));
    s.c.pointerMove(pt(2, 302)); // у впадины свечи 0 (low 300), ниже A: снап к её low
    s.c.pointerUp(pt(2, 302));
    const m = s.marks[0]!;
    expect(m.anchors[1]).toEqual({ time: candles[0]!.openTime, price: candles[0]!.low });
    expect(m.direction).toBe('bear');
  });

  it('ластик удаляет сетку касанием по линии уровня', () => {
    const s = setup('eraser', [grid()]);
    tap(s.c, 300, 600 - (410 + 0.5 * (340 - 410)));
    expect(s.marks).toHaveLength(0);
  });
});

describe('выбор уровня (readonly сетка, onLevelPick)', () => {
  // широкая сетка (400 px по высоте), чтобы уровни разделялись больше чем на радиус касания
  const g = algo('fib-retracement', [{ time: candles[20]!.openTime, price: 100 }, { time: candles[30]!.openTime, price: 500 }]);
  const yOf = (r: number) => 600 - (500 + r * (100 - 500));

  it('касание по линии уровня вызывает onLevelPick с долей; область касания >= 44 px', () => {
    const s = setup(null, [], [g]);
    tap(s.c, 420, yOf(0.618) + 15, 'touch');
    expect(s.picks).toEqual([{ markId: 'algo1', level: 0.618 }]);
  });

  it('работает и в режиме «Выбор»; касание вдали от линий - не выбирает', () => {
    const s = setup('select', [], [g]);
    tap(s.c, 420, yOf(0.382));
    tap(s.c, 420, 20);
    expect(s.picks).toEqual([{ markId: 'algo1', level: 0.382 }]);
  });

  it('жест-протяжка по линии (прокрутка) не считается выбором', () => {
    const s = setup(null, [], [g]);
    s.c.pointerDown(pt(420, yOf(0.5)));
    s.c.pointerMove(pt(300, yOf(0.5)));
    s.c.pointerUp(pt(300, yOf(0.5)));
    expect(s.picks).toEqual([]);
  });

  it('при активном инструменте рисования выбор уровня отключён', () => {
    const s = setup('fib-retracement', [], [g]);
    tap(s.c, 420, yOf(0.5));
    expect(s.picks).toEqual([]);
  });
});
