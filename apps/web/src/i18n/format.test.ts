import { describe, expect, it } from 'vitest';
import { formatInt, formatPercent, formatPrice, formatR, localDay, plural } from './format';

describe('format', () => {
  it('склоняет', () => {
    const f = ['попытка', 'попытки', 'попыток'] as const;
    expect([1, 2, 5, 11, 12, 21, 24, 0].map((n) => plural(n, f))).toEqual([
      'попытка', 'попытки', 'попыток', 'попыток', 'попыток', 'попытка', 'попытки', 'попыток',
    ]);
  });
  it('числа', () => {
    expect(formatInt(64380)).toBe('64 380');
    expect(formatPrice(64380.5, 1)).toBe('64 380.5');
    expect(formatPercent(0.82)).toBe('82%');
    expect(formatR(2)).toBe('+2.0 R');
    expect(formatR(-1)).toBe('-1.0 R');
  });
  it('localDay использует локальный пояс', () => {
    const d = new Date(2026, 10, 3, 1, 0, 0);
    expect(localDay(d.getTime())).toBe('2026-11-03');
  });
});

describe('даты и числа в разборе', () => {
  it('родительный падеж: «5 марта, 17:00»', async () => {
    const { formatDateTime, formatDecimal, formatPercentValue, formatRValue } = await import('./format');
    expect(formatDateTime(new Date(2026, 2, 5, 17, 0).getTime())).toBe('5 марта, 17:00');
    expect(formatDecimal(0.20344834672530776)).toBe('0,2');
    expect(formatPercentValue(0.2)).toBe('0,2%');
    expect(formatRValue(2.0000000000000338)).toBe('2 R');
    expect(formatRValue(-1.5)).toBe('−1,5 R');
  });
});
