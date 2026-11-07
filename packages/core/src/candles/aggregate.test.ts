import { describe, expect, it } from 'vitest';
import type { Candle } from '../index';
import { aggregate, sliceAt } from './aggregate';

// SYNTHETIC: минимальные ручные кейсы логики агрегации; реальный инвариант (1m -> старшие ТФ
// против нативных архивных свечей) проверяется в packages/market-data на фикстурах Binance.
const MIN = 60_000;
function synthetic_m1(openTime: number, o: number, h: number, l: number, c: number): Candle {
  return {
    openTime,
    closeTime: openTime + MIN - 1,
    open: o,
    high: h,
    low: l,
    close: c,
    volume: 1,
    quoteVolume: 10,
    trades: 2,
    closed: true,
  };
}
const H = 60 * MIN;

function synthetic_hour(start: number, minutes: number): Candle[] {
  return Array.from({ length: minutes }, (_, i) =>
    synthetic_m1(start + i * MIN, 100 + i, 110 + i, 90 + i, 101 + i),
  );
}

describe('aggregate', () => {
  it('собирает полный час из 60 минут', () => {
    const [h] = aggregate(synthetic_hour(H, 60), '1h');
    expect(h).toMatchObject({
      openTime: H,
      closeTime: 2 * H - 1,
      open: 100,
      close: 160,
      high: 169,
      low: 90,
      volume: 60,
      quoteVolume: 600,
      trades: 120,
      closed: true,
    });
  });

  it('неполный час - closed=false', () => {
    const [h] = aggregate(synthetic_hour(H, 30), '1h');
    expect(h?.closed).toBe(false);
    expect(h?.close).toBe(130);
  });

  it('час с пропущенной минутой не считается закрытым и не выдумывает минуту', () => {
    const m = synthetic_hour(H, 60).filter((_, i) => i !== 10);
    const [h] = aggregate(m, '1h');
    expect(h?.closed).toBe(false);
    expect(h?.volume).toBe(59);
  });

  it('несортированный вход, несколько корзин, 1m возвращается копией', () => {
    const m = [...synthetic_hour(H, 60), ...synthetic_hour(2 * H, 60)].reverse();
    expect(aggregate(m, '1h').map((c) => c.openTime)).toEqual([H, 2 * H]);
    expect(aggregate(m, '1m')).toHaveLength(120);
  });

  it('пустой вход', () => {
    expect(aggregate([], '1h')).toEqual([]);
  });
});

describe('sliceAt', () => {
  const m1 = synthetic_hour(H, 120);
  const hourNative = aggregate(m1, '1h');
  const series = { '1m': m1, '1h': hourNative };

  it('оставляет только свечи с closeTime < T и добавляет частичную старшую из 1m', () => {
    const T = H + 90 * MIN;
    const out = sliceAt(series, T);
    expect(out['1m']?.at(-1)?.openTime).toBe(H + 89 * MIN);
    expect(out['1h']).toHaveLength(2);
    expect(out['1h']?.[0]?.closed).toBe(true);
    const part = out['1h']?.[1];
    expect(part).toMatchObject({ openTime: 2 * H, closed: false, open: 160, close: 190 });
  });

  it('на границе ТФ частичной свечи нет', () => {
    const out = sliceAt(series, 2 * H);
    expect(out['1h']).toHaveLength(1);
    expect(out['1h']?.[0]?.closed).toBe(true);
  });

  it('без 1m частичная свеча не строится', () => {
    const out = sliceAt({ '1h': hourNative }, H + 90 * MIN);
    expect(out['1h']).toHaveLength(1);
    expect(out['1m']).toBeUndefined();
  });
});
