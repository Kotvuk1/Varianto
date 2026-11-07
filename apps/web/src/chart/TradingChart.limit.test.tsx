import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CandleSeries, Mark } from '@tl/core';

// lightweight-charts заменён лёгкой заглушкой: проверяется логика handle, а не отрисовка (её проверяет e2e).
const setRange = vi.fn();
vi.mock('lightweight-charts', () => {
  const series = () => ({
    applyOptions: vi.fn(),
    priceScale: () => ({ applyOptions: vi.fn() }),
    attachPrimitive: vi.fn(),
    setData: vi.fn(),
    update: vi.fn(),
    priceToCoordinate: () => 0,
    coordinateToPrice: () => 0,
  });
  return {
    CandlestickSeries: 'c',
    HistogramSeries: 'h',
    ColorType: { Solid: 'solid' },
    CrosshairMode: { Normal: 0 },
    TickMarkType: { Year: 0, Month: 1, DayOfMonth: 2, Time: 3, TimeWithSeconds: 4 },
    createChart: () => ({
      applyOptions: vi.fn(),
      addSeries: series,
      paneSize: () => ({ width: 800, height: 400 }),
      remove: vi.fn(),
      subscribeCrosshairMove: vi.fn(),
      timeScale: () => ({
        subscribeVisibleLogicalRangeChange: vi.fn(),
        unsubscribeVisibleLogicalRangeChange: vi.fn(),
        getVisibleLogicalRange: () => ({ from: 0, to: 40 }),
        setVisibleLogicalRange: setRange,
        logicalToCoordinate: () => 0,
        coordinateToLogical: () => 0,
        options: () => ({ barSpacing: 6 }),
      }),
    }),
  };
});

import { TradingChart } from './TradingChart';

const H = 3_600_000;
const T0 = 1_700_000_000_000 - (1_700_000_000_000 % H);
// SYNTHETIC: минимальный ряд для проверки onLimitChange (форма свечей не важна)
const series: CandleSeries = {
  symbol: 'BTCUSDT',
  tf: '1h',
  source: 'binance-archive',
  candles: Array.from({ length: 100 }, (_, i) => ({ openTime: T0 + i * H, open: 100, high: 101, low: 99, close: 100.5, volume: 1, closeTime: T0 + i * H + H - 1, quoteVolume: 100, trades: 1, closed: true })),
};
const limit = (price: number): Mark => ({ id: 'synthetic_l', kind: 'hline', anchors: [{ time: T0 + 50 * H, price }], scope: null, direction: null, author: 'user', meta: { role: 'limit', side: 'buy' } });

describe('TradingChart: onLimitChange', () => {
  beforeEach(() => vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null));
  afterEach(() => vi.restoreAllMocks());

  it('сообщает цену лимитки при изменении и null после удаления; без лимитки на старте - молчит', () => {
    const calls: (number | null)[] = [];
    const onLimitChange = (p: number | null) => calls.push(p);
    const r = render(<TradingChart series={series} marks={[]} tool={null} onMarksChange={() => undefined} onLimitChange={onLimitChange} />);
    expect(calls).toEqual([]);
    r.rerender(<TradingChart series={series} marks={[limit(98)]} tool={null} onMarksChange={() => undefined} onLimitChange={onLimitChange} />);
    r.rerender(<TradingChart series={series} marks={[limit(97.5)]} tool={null} onMarksChange={() => undefined} onLimitChange={onLimitChange} />);
    r.rerender(<TradingChart series={series} marks={[limit(97.5)]} tool={null} onMarksChange={() => undefined} onLimitChange={onLimitChange} />);
    r.rerender(<TradingChart series={series} marks={[]} tool={null} onMarksChange={() => undefined} onLimitChange={onLimitChange} />);
    expect(calls).toEqual([98, 97.5, null]);
  });

  it('загруженная разметка с лимиткой сообщается сразу', () => {
    const calls: (number | null)[] = [];
    render(<TradingChart series={series} marks={[limit(99)]} tool={null} onMarksChange={() => undefined} onLimitChange={(p) => calls.push(p)} />);
    expect(calls).toEqual([99]);
  });
});
