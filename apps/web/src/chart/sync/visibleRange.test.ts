import { describe, expect, it } from 'vitest';
import { TimeIndex } from '../geometry/timeIndex';
import { centeredLogicalRange, defaultLogicalRange, padRangeForMarks, logicalRangeFromWindow, windowFromLogicalRange } from './visibleRange';

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

describe('запас у краёв (F-13, F-22)', () => {
  const idx = grid(500, H);
  const mark = (i: number) => ({ anchors: [{ time: T0 + i * H }] });
  it('метка у левого края сдвигает окно, ширина сохраняется', () => {
    const r = padRangeForMarks(idx, { from: 100, to: 200 }, [mark(101)], 5);
    expect(r).toEqual({ from: 96, to: 196 });
  });
  it('метка у правого края сдвигает окно вправо', () => {
    const r = padRangeForMarks(idx, { from: 100, to: 200 }, [mark(199)], 5);
    expect(r).toEqual({ from: 104, to: 204 });
  });
  it('метка в середине и метка далеко вне окна окно не меняют', () => {
    expect(padRangeForMarks(idx, { from: 100, to: 200 }, [mark(150), mark(400)], 5)).toEqual({ from: 100, to: 200 });
  });
});

describe('centeredLogicalRange', () => {
  it('сохраняет ширину и центрирует на координате', () => {
    expect(centeredLogicalRange({ from: 10, to: 50 }, 200)).toEqual({ from: 180, to: 220 });
  });
});
