import { describe, expect, it } from 'vitest';
import { axisTicks, relativeDuration, relativeLabel } from './axis';

const H = 3_600_000;
const D = 24 * H;
// Сдвинутая шкала задания выглядит как реальная дата (2014 г.): она не должна попадать в подписи.
const T = Date.UTC(2014, 2, 14, 14, 0);

describe('относительная ось времени', () => {
  it('подписи относительно момента решения', () => {
    expect(relativeLabel(T, T, 'сейчас')).toBe('сейчас');
    expect(relativeLabel(T - 12 * H, T, 'сейчас')).toBe('−12ч');
    expect(relativeLabel(T + 4 * H + 37 * 60_000, T, 'сейчас')).toBe('+4ч 37м');
    expect(relativeLabel(T - 5 * D, T, 'сейчас')).toBe('−5д');
    expect(relativeDuration(40 * 60_000)).toBe('40м');
  });

  it('метки оси не содержат абсолютных дат, годов и месяцев', () => {
    for (const widthDays of [0.5, 3, 20, 120]) {
      const ticks = axisTicks({ center: T - (widthDays * D) / 2, width: widthDays * D }, T, 330, 'сейчас');
      expect(ticks.length).toBeGreaterThan(0);
      for (const t of ticks) {
        expect(t.label).not.toMatch(/\d{4}/);
        expect(t.label).not.toMatch(/\d{1,2}[./:-]\d{1,2}/);
        expect(t.label).not.toMatch(/янв|фев|мар|апр|мая|июн|июл|авг|сен|окт|ноя|дек/);
        expect(t.label).toMatch(/^(сейчас|[−+]\d+(ч|м|д)( \d+м)?)$/);
        expect(t.x).toBeGreaterThanOrEqual(0);
        expect(t.x).toBeLessThanOrEqual(330);
      }
    }
  });

  it('пустое окно -> нет меток', () => {
    expect(axisTicks({ center: T, width: 0 }, T, 300, 'сейчас')).toEqual([]);
  });
});
