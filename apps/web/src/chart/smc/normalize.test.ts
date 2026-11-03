import { describe, expect, it } from 'vitest';
import type { Candle, Mark } from '@tl/core';
import { TimeIndex } from '../geometry/timeIndex';
import { normalizeMark } from './normalize';

const H = 3_600_000;
const T0 = Date.UTC(2025, 0, 1);
// SYNTHETIC: минимальный ряд для проверки нормализации правок, не рыночные данные
const synthetic_rows: [number, number, number, number][] = [
  [100, 101, 99, 100.5],
  [100.5, 108, 100, 107],
  [107, 112, 105, 111],
  [111, 113, 110, 112],
  [112, 112.5, 108, 109],
  [109, 110, 104, 105],
  [105, 106, 100, 101],
];
const cs: Candle[] = synthetic_rows.map((r, i) => ({
  openTime: T0 + i * H,
  closeTime: T0 + (i + 1) * H - 1,
  open: r[0],
  high: r[1],
  low: r[2],
  close: r[3],
  volume: 1,
  quoteVolume: 1,
  trades: 1,
  closed: true,
}));
const index = new TimeIndex(cs.map((c) => c.openTime), H);
const mk = (kind: Mark['kind'], anchors: Mark['anchors'], direction: Mark['direction'] = null): Mark => ({
  id: 'm',
  kind,
  anchors,
  scope: null,
  direction,
  author: 'user',
});

describe('normalizeMark', () => {
  it('swing-high после сдвига снова встаёт на high локального максимума', () => {
    const m = normalizeMark(mk('swing-high', [{ time: T0 + 4 * H, price: 50 }]), cs, index)!;
    expect(m.anchors[0]).toEqual({ time: T0 + 3 * H, price: 113 });
  });
  it('FVG без разрыва в новом месте отклоняется, с разрывом - пересчитывается', () => {
    expect(normalizeMark(mk('fvg', [{ time: T0 + 3 * H, price: 1 }, { time: T0 + 6 * H, price: 0 }], 'bull'), cs, index)).toBeNull();
    const ok = normalizeMark(mk('fvg', [{ time: T0, price: 1 }, { time: T0 + 6 * H, price: 0 }], 'bull'), cs, index)!;
    expect(ok.anchors[0]).toEqual({ time: T0, price: 105 });
    expect(ok.anchors[1]!.price).toBe(101);
  });
  it('BOS: свеча пробоя левее свинга отклоняется; цена конца равна цене свинга', () => {
    const bad = mk('bos', [{ time: T0 + 3 * H, price: 113 }, { time: T0 + 2 * H, price: 113 }], 'bull');
    expect(normalizeMark(bad, cs, index)).toBeNull();
    const ok = normalizeMark(mk('bos', [{ time: T0 + 3 * H, price: 0 }, { time: T0 + 6 * H, price: 5 }], 'bull'), cs, index)!;
    expect(ok.anchors).toEqual([
      { time: T0 + 3 * H, price: 113 },
      { time: T0 + 6 * H, price: 113 },
    ]);
  });
  it('OB пересчитывается по свече', () => {
    const m = normalizeMark(mk('order-block', [{ time: T0 + 5 * H, price: 0 }, { time: T0, price: 0 }]), cs, index)!;
    expect(m.anchors).toEqual([
      { time: T0 + 5 * H, price: 110 },
      { time: T0 + 6 * H, price: 104 },
    ]);
    expect(m.direction).toBe('bull');
  });
});
