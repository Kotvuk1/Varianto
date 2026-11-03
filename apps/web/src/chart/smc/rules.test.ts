import { describe, expect, it } from 'vitest';
import type { Candle } from '@tl/core';
import {
  localExtremeIndex,
  resolveBreak,
  resolveFvg,
  resolveOb,
  resolveSwing,
  resolveSweep,
  resolveWick,
  sideByPrice,
} from './rules';

const H = 3_600_000;
const T0 = Date.UTC(2025, 0, 1);
// SYNTHETIC: минимальные ряды для проверки правил формы разметки, не рыночные данные
const synthetic_c = (i: number, o: number, h: number, l: number, c: number, closed = true): Candle => ({
  openTime: T0 + i * H,
  closeTime: T0 + (i + 1) * H - 1,
  open: o,
  high: h,
  low: l,
  close: c,
  volume: 1,
  quoteVolume: 1,
  trades: 1,
  closed,
});
// [o,h,l,c]
const build = (rows: [number, number, number, number][]) => rows.map((r, i) => synthetic_c(i, ...r));

describe('локальный экстремум и swing', () => {
  // максимум high на индексе 5 (110), минимум low на индексе 9 (80)
  const rows: [number, number, number, number][] = [
    [100, 102, 98, 101],
    [101, 104, 100, 103],
    [103, 106, 102, 105],
    [105, 108, 104, 107],
    [107, 109, 106, 108],
    [108, 110, 107, 109],
    [109, 109, 100, 101],
    [101, 102, 95, 96],
    [96, 97, 88, 89],
    [89, 90, 80, 85],
    [85, 92, 84, 91],
    [91, 95, 90, 94],
  ];
  const cs = build(rows);

  it('swing-high снапится к high локального максимума в радиусе 3', () => {
    expect(localExtremeIndex(cs, 3, 'high')).toBe(5);
    expect(localExtremeIndex(cs, 7, 'high')).toBe(5); // 7-3=4..10 → максимум high на 5? (5 вне окна 4..10? нет, 5 внутри)
    expect(resolveSwing(cs, 3, 'high')).toEqual({ time: T0 + 5 * H, price: 110 });
  });

  it('swing-low снапится к low локального минимума', () => {
    expect(localExtremeIndex(cs, 7, 'low')).toBe(9);
    expect(resolveSwing(cs, 8, 'low')).toEqual({ time: T0 + 9 * H, price: 80 });
  });

  it('окно обрезается по границам массива', () => {
    expect(localExtremeIndex(cs, 0, 'high')).toBe(3);
    expect(localExtremeIndex(cs, 11, 'low')).toBe(9);
  });

  it('при равных экстремумах берётся ближайшая к касанию свеча', () => {
    const eq = build([
      [10, 20, 9, 11],
      [11, 15, 10, 12],
      [12, 20, 11, 13],
    ]);
    expect(localExtremeIndex(eq, 2, 'high')).toBe(2);
    expect(localExtremeIndex(eq, 0, 'high')).toBe(0);
  });

  it('сторона по цене касания: выше середины свечи - high, ниже - low', () => {
    expect(sideByPrice(cs[5]!, 109.5)).toBe('high');
    expect(sideByPrice(cs[5]!, 100)).toBe('low');
  });
});

describe('FVG: одно касание средней свечи', () => {
  it('бычий: зона от high[i-1] до low[i+1], от свечи i-1 вправо', () => {
    const cs = build([
      [100, 101, 99, 100.5],
      [100.5, 108, 100, 107], // i=1 импульс
      [107, 112, 105, 111],
      [111, 113, 110, 112],
    ]);
    const r = resolveFvg(cs, 1);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.direction).toBe('bull');
    expect(r.anchors[0]).toEqual({ time: T0, price: 105 }); // top = low[i+1]
    expect(r.anchors[1]!.price).toBe(101); // bottom = high[i-1]
    expect(r.anchors[1]!.time).toBe(T0 + 3 * H); // до правого края
    expect(r.middleTime).toBe(T0 + H);
  });

  it('медвежий: зона от low[i-1] до high[i+1]', () => {
    const cs = build([
      [100, 101, 99, 99.5],
      [99.5, 99.8, 92, 93],
      [93, 97, 90, 91],
    ]);
    const r = resolveFvg(cs, 1);
    expect(r.ok && r.direction).toBe('bear');
    if (r.ok) {
      expect(r.anchors[0]).toEqual({ time: T0, price: 99 });
      expect(r.anchors[1]!.price).toBe(97);
    }
  });

  it('перекрытие фитилей - метка не создаётся', () => {
    const cs = build([
      [100, 105, 99, 104],
      [104, 108, 103, 107],
      [107, 109, 104, 108], // low[i+1]=104 < high[i-1]=105
    ]);
    expect(resolveFvg(cs, 1)).toEqual({ ok: false, reason: 'no-gap' });
  });

  it('первая/последняя свеча не могут быть средними; незакрытая i+1 отклоняется', () => {
    const cs = build([
      [100, 101, 99, 100],
      [100, 108, 100, 107],
      [107, 112, 105, 111],
    ]);
    expect(resolveFvg(cs, 0)).toEqual({ ok: false, reason: 'edge' });
    expect(resolveFvg(cs, 2)).toEqual({ ok: false, reason: 'edge' });
    const open = [...cs.slice(0, 2), { ...cs[2]!, closed: false }];
    expect(resolveFvg(open, 1)).toEqual({ ok: false, reason: 'unclosed' });
  });

  it('зона заканчивается на свече, заполнившей разрыв', () => {
    const cs = build([
      [100, 101, 99, 100.5],
      [100.5, 108, 100, 107],
      [107, 112, 105, 111],
      [111, 112, 100.5, 101], // low <= bottom(101) - заполнение
      [101, 103, 100, 102],
    ]);
    const r = resolveFvg(cs, 1);
    expect(r.ok && r.anchors[1]!.time).toBe(T0 + 3 * H);
  });
});

describe('Order Block: одно касание', () => {
  const cs = build([
    [100, 101, 99, 100],
    [100, 102, 96, 97], // медвежья свеча
    [97, 110, 97, 109], // бычья
  ]);
  it('зона = high-low свечи, вправо до правого края; направление по цвету свечи', () => {
    const bear = resolveOb(cs, 1);
    expect(bear.anchors).toEqual([
      { time: T0 + H, price: 102 },
      { time: T0 + 2 * H, price: 96 },
    ]);
    expect(bear.direction).toBe('bull'); // последняя медвежья перед бычьим импульсом
    expect(resolveOb(cs, 2).direction).toBe('bear');
  });
});

describe('BOS/CHoCH: два шага', () => {
  const cs = build([
    [100, 100, 95, 98],
    [98, 110, 97, 105], // swing high 110 (idx 1)
    [105, 106, 100, 101],
    [101, 108, 100, 107],
    [107, 112, 106, 111], // закрытие 111 > 110 (idx 4)
    [111, 115, 109, 110], // idx 5: high>110, close=110 - не закрылась за уровнем
  ]);
  it('пробой вверх через high: bull, линия на цене свинга', () => {
    const r = resolveBreak(cs, { index: 1, side: 'high' }, 4);
    expect(r).toMatchObject({ ok: true, direction: 'bull', bodyClosed: true });
    if (r.ok) {
      expect(r.anchors).toEqual([
        { time: T0 + H, price: 110 },
        { time: T0 + 4 * H, price: 110 },
      ]);
    }
  });
  it('пробой low вниз - bear', () => {
    const low = build([
      [100, 101, 90, 95], // swing low 90
      [95, 96, 92, 93],
      [93, 94, 85, 88],
    ]);
    const r = resolveBreak(low, { index: 0, side: 'low' }, 2);
    expect(r).toMatchObject({ ok: true, direction: 'bear', bodyClosed: true });
  });
  it('тело не закрылось за уровнем (close == level) - метка ставится, bodyClosed=false', () => {
    const r = resolveBreak(cs, { index: 1, side: 'high' }, 5);
    expect(r).toMatchObject({ ok: true, bodyClosed: false });
  });
  it('свеча не позже свинга отклоняется', () => {
    expect(resolveBreak(cs, { index: 3, side: 'high' }, 3)).toEqual({ ok: false, reason: 'not-after' });
    expect(resolveBreak(cs, { index: 3, side: 'high' }, 1)).toEqual({ ok: false, reason: 'not-after' });
  });
});

describe('Sweep', () => {
  const cs = build([
    [100, 101, 99, 100],
    [100, 103, 99, 102],
    [102, 110, 101, 105], // pivot high 110 (idx 2)
    [105, 106, 100, 101],
    [101, 102, 99, 100],
    [100, 101, 98, 99],
    [99, 100, 97, 98],
    [98, 112, 97, 108], // идx 7: high 112 > 110, close 108 <= 110 - sweep
    [108, 115, 107, 114], // idx 8: close 114 > 110 - пробой
  ]);
  it('фитиль выше ближайшего swing при закрытии под ним: bear, якорь на фитиле', () => {
    const r = resolveSweep(cs, 7, 'high');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.direction).toBe('bear');
      expect(r.anchors).toEqual([
        { time: T0 + 2 * H, price: 110 },
        { time: T0 + 7 * H, price: 112 },
      ]);
    }
  });
  it('закрытие за уровнем - это пробой, не sweep', () => {
    expect(resolveSweep(cs, 8, 'high')).toEqual({ ok: false, reason: 'is-break' });
  });
  it('нет пробитого swing - отказ', () => {
    expect(resolveSweep(cs, 5, 'high')).toEqual({ ok: false, reason: 'no-swing' });
  });
});

describe('Level/hline/trendline: снап к ближайшему фитилю', () => {
  const cs = build([
    [100, 101, 99, 100],
    [100, 105, 98, 104],
    [104, 106, 103, 105],
  ]);
  it('к high/low свечи в радиусе по цене', () => {
    expect(resolveWick(cs, 1, 104.6, 1)).toEqual({ time: T0 + H, price: 105 });
    expect(resolveWick(cs, 1, 98.4, 1)).toEqual({ time: T0 + H, price: 98 });
  });
  it('соседняя свеча, если её фитиль ближе', () => {
    expect(resolveWick(cs, 1, 106.2, 1)).toEqual({ time: T0 + 2 * H, price: 106 });
  });
  it('дальше радиуса - цена не меняется, время к openTime', () => {
    expect(resolveWick(cs, 1, 101.6, 0.5)).toEqual({ time: T0 + H, price: 101.6 });
  });
});
