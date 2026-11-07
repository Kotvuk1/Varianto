import { describe, expect, it } from 'vitest';
import { decimalsForTick, makePriceFormatter, tickSizeFor } from './priceFormat';

const plain = (s: string) => s.replace(new RegExp('[\\u00a0\\u202f]', 'g'), ' ');

describe('формат цен', () => {
  it('знаки по tickSize', () => {
    expect(decimalsForTick(0.1)).toBe(1);
    expect(decimalsForTick(0.01)).toBe(2);
    expect(decimalsForTick(0.001)).toBe(3);
    expect(decimalsForTick(1)).toBe(0);
  });
  it('таблица для трёх пар, по умолчанию 2 знака', () => {
    expect(tickSizeFor('BTCUSDT')).toBe(0.1);
    expect(tickSizeFor('ETHUSDT')).toBe(0.01);
    expect(tickSizeFor('SOLUSDT')).toBe(0.01);
    expect(tickSizeFor('XRPUSDT')).toBe(0.01);
    expect(tickSizeFor('BTCUSDT', 0.5)).toBe(0.5);
  });
  it('пробел-разделитель тысяч и десятичная запятая', () => {
    const f = makePriceFormatter(0.1);
    expect(plain(f(81950))).toBe('81 950,0');
    expect(plain(f(1234567.25))).toBe('1 234 567,3');
    expect(plain(makePriceFormatter(0.001)(172.456))).toBe('172,456');
  });
});
