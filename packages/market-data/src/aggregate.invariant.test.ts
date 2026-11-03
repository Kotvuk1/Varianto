import { describe, expect, it } from 'vitest';
import { aggregate, sliceAt, TIMEFRAME_MS, type Timeframe } from '@tl/core';
import { parseArchiveCsv } from './normalize';
import { fixtureText, klinesCsvPath } from './testing/fixtures';

const load = (symbol: string, tf: string, date: string) =>
  parseArchiveCsv(fixtureText(klinesCsvPath(symbol, tf, date)));

const near = (a: number, b: number, rel = 1e-6) => Math.abs(a - b) <= rel * Math.max(1, Math.abs(b));

describe('инвариант ARCHITECTURE §4.1: 1m -> старшие ТФ == нативные архивные', () => {
  const cases: [string, string][] = [
    ['BTCUSDT', '2026-10-20'],
    ['BTCUSDT', '2026-10-21'],
  ];
  for (const [symbol, date] of cases) {
    const m1 = load(symbol, '1m', date);
    it(`${symbol} ${date}: 1440 минут`, () => expect(m1).toHaveLength(1440));
    for (const tf of ['15m', '1h', '4h'] as const) {
      it(`${symbol} ${date}: ${tf}`, () => {
        const native = load(symbol, tf, date);
        const agg = aggregate(m1, tf);
        expect(agg).toHaveLength(native.length);
        agg.forEach((a, i) => {
          const n = native[i]!;
          expect([a.openTime, a.closeTime, a.open, a.high, a.low, a.close]).toEqual([
            n.openTime,
            n.closeTime,
            n.open,
            n.high,
            n.low,
            n.close,
          ]);
          expect(near(a.volume, n.volume)).toBe(true);
          expect(near(a.quoteVolume, n.quoteVolume)).toBe(true);
          expect(a.trades).toBe(n.trades);
          expect(a.closed).toBe(true);
        });
      });
    }
  }

  it('BTCUSDT 1d: 1m за сутки == нативная дневная свеча из monthly 1d', () => {
    const native = load('BTCUSDT', '1d', '2026-10');
    for (const date of ['2026-10-20', '2026-10-21']) {
      const [a] = aggregate(load('BTCUSDT', '1m', date), '1d');
      const n = native.find((c) => c.openTime === a!.openTime)!;
      expect([a!.open, a!.high, a!.low, a!.close]).toEqual([n.open, n.high, n.low, n.close]);
      expect(near(a!.volume, n.volume)).toBe(true);
      expect(a!.closed).toBe(true);
    }
  });

  it('sliceAt на реальных данных: частичная свеча совпадает с нативной по open и не заглядывает в будущее', () => {
    const date = '2026-10-20';
    const series: Partial<Record<Timeframe, ReturnType<typeof load>>> = {
      '1m': load('BTCUSDT', '1m', date),
      '15m': load('BTCUSDT', '15m', date),
      '1h': load('BTCUSDT', '1h', date),
      '4h': load('BTCUSDT', '4h', date),
    };
    const T = Date.UTC(2026, 9, 20, 10, 37);
    const out = sliceAt(series, T);
    for (const tf of ['15m', '1h', '4h'] as const) {
      const last = out[tf]!.at(-1)!;
      const native = series[tf]!.find((c) => c.openTime === last.openTime)!;
      expect(last.closed).toBe(false);
      expect(last.open).toBe(native.open);
      expect(last.openTime + TIMEFRAME_MS[tf]).toBeGreaterThan(T);
      // закрытые свечи строго в прошлом
      expect(out[tf]!.slice(0, -1).every((c) => c.closeTime < T && c.closed)).toBe(true);
    }
    expect(out['1h']!.at(-1)!.close).toBe(series['1m']!.find((c) => c.openTime === T - 60_000)!.close);
    expect(out['1m']!.at(-1)!.openTime).toBe(T - 60_000);
  });
});
