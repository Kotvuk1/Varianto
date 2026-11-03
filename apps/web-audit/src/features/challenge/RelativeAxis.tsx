'use client';
// Подписи оси времени вместо абсолютных дат: полоса поверх штатной оси графика (она скрыта под полосой).
import { useEffect, useRef, useState } from 'react';
import { ch } from '@/i18n/ru/challenge';
import { axisTicks } from './axis';

/** Высота штатной оси времени Lightweight Charts с запасом; ширина шкалы цен справа. */
export const AXIS_H = 30;
export const PRICE_SCALE_W = 64;

export function RelativeAxis({ win, decisionTime }: { win: { center: number; width: number } | null; decisionTime: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e?.contentRect.width ?? 0));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const pane = Math.max(0, w - PRICE_SCALE_W);
  const ticks = win ? axisTicks(win, decisionTime, pane, ch.session.axisNow) : [];
  return (
    <div
      ref={ref}
      data-testid="relative-axis"
      aria-hidden="true"
      style={{ height: AXIS_H }}
      className="pointer-events-none absolute inset-x-0 bottom-0 z-10 border-t border-border bg-bg"
    >
      {ticks.map((t) => (
        <span
          key={t.x}
          style={{ left: t.x }}
          className="tnum absolute top-1.5 -translate-x-1/2 font-mono text-[11px] leading-4 whitespace-nowrap text-text-3"
        >
          {t.label}
        </span>
      ))}
    </div>
  );
}
