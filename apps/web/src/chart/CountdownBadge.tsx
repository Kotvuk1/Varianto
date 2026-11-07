'use client';
// Плашка обратного отсчёта до закрытия свечи под меткой последней цены на правой шкале.
import { useEffect, useState, type RefObject } from 'react';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';
import type { Candle, Timeframe } from '@tl/core';
import { formatCountdown, remainingMs, type CandleCountdown } from './countdown';

const TICK_MS = 250; // позиция следит за автомасштабом цены; текст меняется раз в секунду
const LABEL_HALF = 10; // половина высоты метки цены LWC (11px шрифт + отступы)
const BADGE_H = 18;
const MIN_W = 44;
const BOTTOM_RESERVE = 30; // шкала времени

export interface CountdownBadgeProps {
  countdown: CandleCountdown;
  tf: Timeframe;
  label?: string;
  chartRef: RefObject<IChartApi | null>;
  candleRef: RefObject<ISeriesApi<'Candlestick'> | null>;
  candlesRef: RefObject<readonly Candle[]>;
  containerRef: RefObject<HTMLDivElement | null>;
}

interface View {
  text: string;
  top: number;
  width: number;
}

export function CountdownBadge(p: CountdownBadgeProps) {
  const [view, setView] = useState<View | null>(null);
  const { closeTime, offsetMs } = p.countdown;

  useEffect(() => {
    const compute = () => {
      const chart = p.chartRef.current;
      const series = p.candleRef.current;
      const el = p.containerRef.current;
      const last = p.candlesRef.current?.[p.candlesRef.current.length - 1];
      if (!chart || !series || !el || !last) return setView(null);
      const y = series.priceToCoordinate(last.close);
      if (y === null) return setView(null);
      const top = Math.round(y + LABEL_HALF);
      if (top < 0 || top + BADGE_H > el.clientHeight - BOTTOM_RESERVE) return setView(null);
      const text = formatCountdown(remainingMs(closeTime, Date.now(), offsetMs), p.tf);
      const width = Math.max(MIN_W, chart.priceScale('right').width());
      setView((v) => (v && v.text === text && v.top === top && v.width === width ? v : { text, top, width }));
    };
    let timer: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      compute();
      if (timer === undefined) timer = setInterval(compute, TICK_MS);
    };
    const stop = () => {
      if (timer !== undefined) clearInterval(timer);
      timer = undefined;
    };
    // скрытая вкладка: таймер на паузе, при возврате пересчёт по часам
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);
    if (!document.hidden) start();
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      stop();
    };
  }, [p.tf, closeTime, offsetMs, p.chartRef, p.candleRef, p.candlesRef, p.containerRef]);

  if (!view) return null;
  return (
    <div
      data-testid="candle-countdown"
      role="timer"
      aria-label={p.label ?? 'До закрытия свечи'}
      className="tnum"
      style={{
        position: 'absolute',
        right: 0,
        top: view.top,
        width: view.width,
        height: BADGE_H,
        zIndex: 9,
        pointerEvents: 'none',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        font: '500 11px/14px var(--font-mono, ui-monospace, monospace)',
        fontVariantNumeric: 'tabular-nums',
        color: 'var(--text-2)',
        background: 'var(--surface-2)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {view.text}
    </div>
  );
}
