import { describe, expect, it } from 'vitest';
import type { Candle, Mark } from '@tl/core';
import { TimeIndex } from '../geometry/timeIndex';
import type { Projection } from '../drawing/projection';
import type { ToolId } from '../drawing/tools';
import { DrawingController, type ControllerNotice } from './controller';

const H = 3_600_000;
const T0 = Date.UTC(2025, 0, 1);
// SYNTHETIC: треугольная волна с растущим трендом (пики на 10, 30; впадины на 0, 20, 40), не рыночные данные
const tri = (i: number) => Math.abs(((i + 10) % 20) - 10);
const synthetic_candles: Candle[] = Array.from({ length: 50 }, (_, i) => {
  const high = 300 + 4 * tri(i) + 2 * i + 10;
  return {
    openTime: T0 + i * H,
    closeTime: T0 + (i + 1) * H - 1,
    open: high - 8,
    high,
    low: high - 10,
    close: high - 1,
    volume: 1,
    quoteVolume: 1,
    trades: 1,
    closed: true,
  };
});
const peak = synthetic_candles[10]!; // swing high
const breakIdx = synthetic_candles.findIndex((c, i) => i > 10 && c.close > peak.high);
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

function setup(tool: ToolId | null, initial: Mark[] = [], snap = true, cs: Candle[] = synthetic_candles, notices: ControllerNotice[] = [], scope: Mark['scope'] = null) {
  let marks = initial;
  let selected: string | null = null;
  let n = 0;
  const commits: Mark[][] = [];
  const c = new DrawingController({
    proj: () => proj,
    index: () => index,
    candles: () => cs,
    notify: (n) => notices.push(n),
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
    scope: () => scope,
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

describe('слой BOS/CHoCH', () => {
  it.each(['internal', 'external'] as const)('BOS получает scope %s из текущего выбора', (scope) => {
    const s = setup('bos', [], true, synthetic_candles, [], scope);
    drag(s.c, 100, 600 - peak.high, breakIdx * 10, 600 - 330);
    expect(s.marks[0]!.scope).toBe(scope);
  });
  it('без слоя scope остаётся null', () => {
    const s = setup('bos');
    drag(s.c, 100, 600 - peak.high, breakIdx * 10, 600 - 330);
    expect(s.marks[0]!.scope).toBeNull();
  });
});

describe('рисование', () => {
  it('swing-high: тап рядом со свингом снапится к high локального максимума (в радиусе 3 свечей)', () => {
    const s = setup('swing-high');
    // касание у свечи 12, ниже high: экстремум в радиусе ±3 - свеча 10 (пик)
    expect(s.c.pointerDown(pt(121, 600 - 340))).toBe(true);
    s.c.pointerUp(pt(121, 600 - 340));
    expect(s.marks).toHaveLength(1);
    expect(s.marks[0]).toMatchObject({ kind: 'swing-high', author: 'user', id: 'id1' });
    expect(s.marks[0]!.anchors[0]).toEqual({ time: T0 + 10 * H, price: peak.high });
  });

  it('swing-low снапится к low впадины; HH - к high, HL - к low', () => {
    const lo = setup('swing-low');
    tap(lo.c, 190, 600 - 330);
    expect(lo.marks[0]!.anchors[0]).toEqual({ time: T0 + 20 * H, price: synthetic_candles[20]!.low });
    const hh = setup('hh');
    tap(hh.c, 300, 600 - 400);
    expect(hh.marks[0]!.anchors[0]!.price).toBe(synthetic_candles[30]!.high);
    const hl = setup('hl');
    tap(hl.c, 400, 600 - 300);
    expect(hl.marks[0]!.anchors[0]!.price).toBe(synthetic_candles[40]!.low);
  });

  it('BOS протяжкой: свинг -> свеча пробоя, линия горизонтальна на цене свинга, направление bull', () => {
    const s = setup('bos');
    drag(s.c, 100, 600 - peak.high, breakIdx * 10, 600 - 330);
    expect(s.marks).toHaveLength(1);
    const [a0, a1] = s.marks[0]!.anchors;
    expect(a0).toEqual({ time: T0 + 10 * H, price: peak.high });
    expect(a1!.time).toBe(T0 + breakIdx * H);
    expect(a1!.price).toBe(a0!.price);
    expect(s.marks[0]!.direction).toBe('bull');
  });

  it('BOS двумя тапами: после первого - ожидание, превью следует за курсором', () => {
    const s = setup('bos');
    tap(s.c, 100, 600 - peak.high);
    expect(s.marks).toHaveLength(0);
    expect(s.c.hasPending()).toBe(true);
    s.c.hover(pt(150, 600 - 330));
    expect(s.c.preview?.kind).toBe('bos');
    tap(s.c, breakIdx * 10, 600 - 330);
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

  it('BOS: свеча пробоя левее свинга отклоняется с подсказкой, ожидание сохраняется', () => {
    const notices: ControllerNotice[] = [];
    const s = setup('bos', [], true, synthetic_candles, notices);
    tap(s.c, 100, 600 - peak.high);
    tap(s.c, 50, 600 - 330);
    expect(s.marks).toHaveLength(0);
    expect(s.c.hasPending()).toBe(true);
    expect(notices.at(-1)).toEqual({ step: 1, code: 'before-swing' });
  });

  it('BOS: тело не закрылось за уровнем - метка ставится, подсказка bos-wick-only', () => {
    const notices: ControllerNotice[] = [];
    // SYNTHETIC: свеча пробоя с фитилём за уровнем и закрытием под ним
    const synthetic_wick = synthetic_candles.map((c, i) => (i === 14 ? { ...c, high: peak.high + 5, close: peak.high - 3 } : c));
    const s = setup('bos', [], true, synthetic_wick, notices);
    tap(s.c, 100, 600 - peak.high);
    tap(s.c, 140, 600 - peak.high);
    expect(s.marks).toHaveLength(1);
    expect(notices.at(-1)).toEqual({ step: 0, code: 'bos-wick-only' });
  });

  it('BOS: первый шаг приоритетно берёт существующую swing-метку', () => {
    const existing: Mark = { id: 'S', kind: 'swing-high', anchors: [{ time: T0 + 10 * H, price: peak.high }], scope: null, direction: null, author: 'user' };
    const s = setup('bos', [existing]);
    // касание в районе метки-маркера над high (смещён вверх на GLYPH_OFFSET)
    tap(s.c, 100, 600 - peak.high - 14);
    tap(s.c, breakIdx * 10, 600 - 330);
    expect(s.marks.find((m) => m.kind === 'bos')!.anchors[0]).toEqual({ time: T0 + 10 * H, price: peak.high });
  });

  it('FVG: одно касание средней свечи создаёт зону по разрыву; без разрыва - подсказка и нет метки', () => {
    // SYNTHETIC: три свечи с разрывом (low[i+1] > high[i-1]) и без
    const mkc = (i: number, o: number, h: number, l: number, c: number): Candle => ({
      openTime: T0 + i * H, closeTime: T0 + (i + 1) * H - 1, open: o, high: h, low: l, close: c, volume: 1, quoteVolume: 1, trades: 1, closed: true,
    });
    const synthetic_gap = [mkc(0, 100, 101, 99, 100.5), mkc(1, 100.5, 108, 100, 107), mkc(2, 107, 112, 105, 111), mkc(3, 111, 113, 110, 112)];
    const notices: ControllerNotice[] = [];
    const s = setup('fvg', [], true, synthetic_gap, notices);
    tap(s.c, 10, 300);
    expect(s.marks).toHaveLength(1);
    expect(s.marks[0]).toMatchObject({ kind: 'fvg', direction: 'bull' });
    expect(s.marks[0]!.anchors.map((a) => a.price)).toEqual([105, 101]);
    const synthetic_overlap = [mkc(0, 100, 105, 99, 104), mkc(1, 104, 108, 103, 107), mkc(2, 107, 109, 104, 108), mkc(3, 108, 110, 107, 109)];
    const n2: ControllerNotice[] = [];
    const s2 = setup('fvg', [], true, synthetic_overlap, n2);
    tap(s2.c, 10, 300);
    expect(s2.marks).toHaveLength(0);
    expect(n2.at(-1)).toEqual({ step: 0, code: 'no-fvg' });
  });

  it('OB: одно касание свечи создаёт зону high-low этой свечи вправо до правого края', () => {
    const s = setup('order-block');
    tap(s.c, 100, 600 - 330);
    const m = s.marks[0]!;
    expect(m.anchors[0]).toEqual({ time: T0 + 10 * H, price: peak.high });
    expect(m.anchors[1]).toEqual({ time: T0 + 49 * H, price: peak.low });
  });

  it('cancel/reset сбрасывает незавершённую метку', () => {
    const s = setup('bos');
    tap(s.c, 100, 600 - peak.high);
    expect(s.c.hasPending()).toBe(true);
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
    { time: T0 + 10 * H, price: peak.high },
    { time: T0 + breakIdx * H, price: peak.high },
  ],
  scope: null,
  direction: 'bull',
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

  it('перетаскивание якоря BOS меняет свечу пробоя и сохраняет горизонтальность и цену свинга', () => {
    const s = setup('select', [bosMark]);
    tap(s.c, (100 + breakIdx * 10) / 2, 600 - peak.high); // выбрать
    expect(s.selected).toBe('B');
    drag(s.c, breakIdx * 10, 600 - peak.high, (breakIdx + 3) * 10, 600 - peak.high + 40);
    const a = s.marks[0]!.anchors;
    expect(a[1]!.time).toBe(T0 + (breakIdx + 3) * H);
    expect(a[1]!.price).toBe(peak.high);
    expect(a[0]).toEqual({ time: T0 + 10 * H, price: peak.high });
  });

  it('перемещение тела уровня сдвигает якорь на целое число свечей и на разницу цены', () => {
    const s = setup('select', [lvl]);
    drag(s.c, 150, 600 - 350, 180, 600 - 360); // +3 свечи, +10 цены
    expect(s.marks[0]!.anchors[0]).toEqual({ time: T0 + 13 * H, price: 360 });
  });

  it('перемещение swing-метки снова прижимает её к high локального максимума', () => {
    const sw: Mark = { id: 'S', kind: 'swing-high', anchors: [{ time: T0 + 10 * H, price: peak.high }], scope: null, direction: null, author: 'user' };
    const s = setup('select', [sw]);
    drag(s.c, 100, 600 - peak.high, 130, 600 - peak.high - 30);
    expect(s.marks[0]!.anchors[0]).toEqual({ time: T0 + 10 * H, price: peak.high });
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
