import { act, render } from '@testing-library/react';
import { createRef } from 'react';
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

import { FLASH_MS, TradingChart, type TradingChartHandle } from './TradingChart';

const H = 3_600_000;
const T0 = 1_700_000_000_000 - (1_700_000_000_000 % H);
// SYNTHETIC: минимальный ряд для проверки логики handle (форма свечей не важна)
const series: CandleSeries = {
  symbol: 'BTCUSDT',
  tf: '1h',
  source: 'binance-archive',
  candles: Array.from({ length: 100 }, (_, i) => ({
    openTime: T0 + i * H,
    open: 100,
    high: 101,
    low: 99,
    close: 100.5,
    volume: 1,
    closeTime: T0 + i * H + H - 1,
    quoteVolume: 100,
    trades: 1,
    closed: true,
  })),
};
const mark: Mark = {
  id: 'synthetic_m1',
  kind: 'swing-high',
  origin: 'user',
  anchors: [{ time: T0 + 50 * H, price: 101 }],
} as unknown as Mark;

describe('TradingChart handle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setRange.mockClear();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null); // jsdom: без canvas
  });
  afterEach(() => vi.useRealTimers());

  const mount = () => {
    const ref = createRef<TradingChartHandle>();
    const utils = render(<TradingChart series={series} marks={[mark]} tool={null} onMarksChange={() => undefined} handleRef={ref} />);
    return { ref, ...utils };
  };

  it('centerOn центрирует область на времени, ширина сохраняется', () => {
    const { ref } = mount();
    act(() => ref.current!.centerOn(T0 + 50 * H));
    const r = setRange.mock.calls.at(-1)![0] as { from: number; to: number };
    expect(r.to - r.from).toBe(40);
    expect((r.from + r.to) / 2).toBeCloseTo(50, 5);
  });

  it('focusMark центрирует на метке и снимает подсветку через 1.2 с', () => {
    const { ref, getByTestId } = mount();
    let ok = false;
    act(() => {
      ok = ref.current!.focusMark('synthetic_m1');
    });
    expect(ok).toBe(true);
    expect(getByTestId('chart').getAttribute('data-flash-id')).toBe('synthetic_m1');
    act(() => {
      vi.advanceTimersByTime(FLASH_MS - 1);
    });
    expect(getByTestId('chart').getAttribute('data-flash-id')).toBe('synthetic_m1');
    act(() => {
      vi.advanceTimersByTime(2);
    });
    expect(getByTestId('chart').getAttribute('data-flash-id')).toBe('');
  });

  it('focusMark неизвестной метки: false, без подсветки', () => {
    const { ref, getByTestId } = mount();
    let ok = true;
    act(() => {
      ok = ref.current!.focusMark('nope');
    });
    expect(ok).toBe(false);
    expect(getByTestId('chart').getAttribute('data-flash-id')).toBe('');
  });
});
