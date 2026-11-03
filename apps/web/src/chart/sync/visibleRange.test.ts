import { describe, expect, it } from 'vitest';
import { TimeIndex } from '../geometry/timeIndex';
import { defaultLogicalRange, logicalRangeFromWindow, windowFromLogicalRange } from './visibleRange';

const T0 = Date.UTC(2025, 0, 1);
const grid = (n: number, step: number) => new TimeIndex(Array.from({ length: n }, (_, i) => T0 + i * step), step);
const M15 = 15 * 60_000;
const H = 4 * M15;
const H4 = 4 * H;

describe('сохранение области времени при смене ТФ (FR-CHART-05)', () => {
  it('центр и ширина в мс сохраняются при 15m -> 4H -> 15m', () => {
    const idx15 = grid(4000, M15);
    const idx4h = grid(1000, H4); // те же 250 суток
    const w0 = windowFromLogicalRange(idx15, { from: 1000, to: 1400 });
    const r4 = logicalRangeFromWindow(idx4h, w0);
    const w1 = windowFromLogicalRange(idx4h, r4);
    expect(w1.center).toBeCloseTo(w0.center, 3);
    expect(w1.width).toBeCloseTo(w0.width, 3);
    const back = logicalRangeFromWindow(idx15, w1);
    expect(back.from).toBeCloseTo(1000, 6);
    expect(back.to).toBeCloseTo(1400, 6);
  });

  it('ширина в барах пересчитывается по шагу нового ТФ', () => {
    const w = { center: T0 + 100 * H, width: 40 * H };
    const r = logicalRangeFromWindow(grid(500, H4), w);
    expect(r.to - r.from).toBeCloseTo(10, 6);
  });

  it('defaultLogicalRange показывает последние N баров с запасом справа', () => {
    const r = defaultLogicalRange(grid(1000, H), 100, 5);
    expect(r).toEqual({ from: 1000 - 100, to: 999 + 5 });
  });
});
