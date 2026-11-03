import { describe, expect, it } from 'vitest';
import { TimeIndex } from './timeIndex';

const H = 3_600_000;
const T0 = Date.UTC(2025, 0, 1);
const hourly = (n: number) => Array.from({ length: n }, (_, i) => T0 + i * H);

describe('TimeIndex', () => {
  it('открытие свечи попадает в целый логический индекс', () => {
    const idx = new TimeIndex(hourly(10), H);
    expect(idx.timeToLogical(T0 + 3 * H)).toBe(3);
    expect(idx.logicalToTime(3)).toBe(T0 + 3 * H);
  });

  it('время внутри свечи интерполируется линейно', () => {
    const idx = new TimeIndex(hourly(10), H);
    expect(idx.timeToLogical(T0 + 3 * H + H / 4)).toBeCloseTo(3.25, 10);
    expect(idx.logicalToTime(3.25)).toBe(T0 + 3 * H + H / 4);
  });

  it('справа от последней свечи и слева от первой - экстраполяция по шагу ТФ', () => {
    const idx = new TimeIndex(hourly(10), H);
    expect(idx.timeToLogical(T0 + 12 * H)).toBe(12);
    expect(idx.timeToLogical(T0 - 2 * H)).toBe(-2);
    expect(idx.logicalToTime(11)).toBe(T0 + 11 * H);
    expect(idx.logicalToTime(-1)).toBe(T0 - H);
  });

  it('пропуск данных (gap) не заполняется: интерполяция по соседним свечам', () => {
    const times = [T0, T0 + H, T0 + 5 * H]; // свечей 2..4 нет
    const idx = new TimeIndex(times, H);
    expect(idx.timeToLogical(T0 + 5 * H)).toBe(2);
    expect(idx.timeToLogical(T0 + 3 * H)).toBe(1.5);
    expect(idx.logicalToTime(1.5)).toBe(T0 + 3 * H);
  });

  it('timeToLogical и logicalToTime взаимно обратны', () => {
    const idx = new TimeIndex([T0, T0 + H, T0 + 5 * H, T0 + 6 * H], H);
    for (const t of [T0 - H, T0, T0 + 0.5 * H, T0 + 3 * H, T0 + 6 * H, T0 + 9 * H]) {
      expect(idx.logicalToTime(idx.timeToLogical(t))).toBeCloseTo(t, 3);
    }
  });

  it('snapTime выбирает ближайшую свечу и не выходит за границы данных', () => {
    const idx = new TimeIndex(hourly(10), H);
    expect(idx.snapTime(T0 + 3 * H + 0.4 * H)).toBe(T0 + 3 * H);
    expect(idx.snapTime(T0 + 3 * H + 0.6 * H)).toBe(T0 + 4 * H);
    expect(idx.snapTime(T0 + 99 * H)).toBe(T0 + 9 * H);
    expect(idx.snapTime(T0 - 99 * H)).toBe(T0);
  });

  it('пустой ряд: snapTime возвращает вход, индексы конечны', () => {
    const idx = new TimeIndex([], H);
    expect(idx.snapTime(123)).toBe(123);
    expect(Number.isFinite(idx.timeToLogical(123))).toBe(true);
  });
});
