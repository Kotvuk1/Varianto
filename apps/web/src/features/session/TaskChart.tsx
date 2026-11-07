'use client';
import { useMemo, type Ref } from 'react';
import { TIMEFRAME_MS, type Candle, type CandleSeries, type Mark, type Scope, type TaskSymbol, type TaskTimeframe } from '@tl/core';
import type { ControllerNotice } from '@/chart/interaction/controller';
import type { ToolId } from '@/chart/drawing/tools';
import type { CandleHighlight, TimeWindow, TradingChartHandle } from '@/chart/TradingChart';
import type { ReplayMarker } from '@/chart/replay/markers';
import { TradingChart } from '@/chart/TradingChart';
import { TF_LABEL } from '@/features/terminal/dataSource';
import { tx } from '@/features/terminal/strings';
import { ss } from '@/i18n/ru/session';
import type { MarkState } from './adapters';

/** Область «последние `bars` свечей» плюс запас справа; применяется один раз при создании графика. */
export function tailRange(candles: readonly Candle[], tf: TaskTimeframe, bars: number): TimeWindow | undefined {
  const last = candles[candles.length - 1];
  if (!last) return undefined;
  const step = TIMEFRAME_MS[tf];
  const n = Math.min(bars, candles.length);
  const width = (n + 6) * step;
  return { center: last.openTime + 6 * step - width / 2, width };
}

export interface TaskChartProps {
  symbol: TaskSymbol;
  tf: TaskTimeframe;
  candles: Candle[];
  marks: Mark[];
  tool: ToolId | null;
  onMarksChange: (m: Mark[]) => void;
  /** Сколько последних свечей показать при открытии. */
  bars: number;
  highlightRange?: { fromTime: number; toTime: number };
  readOnlyMarks?: Mark[];
  markStates?: Record<string, MarkState>;
  selectedId?: string | null;
  onSelectedChange?: (id: string | null) => void;
  onNotice?: (n: ControllerNotice) => void;
  focus?: { time: number; nonce: number } | null;
  scope?: Scope | null;
  /** Колонки подсветки свечей модели (PA). */
  highlightCandles?: readonly CandleHighlight[];
  /** Fibonacci: выбор уровня сетки касанием; подсветка выбранного уровня. */
  onLevelPick?: (level: number, markId: string) => void;
  highlightLevel?: number | null;
  onVisibleRangeChange?: (w: TimeWindow) => void;
  /** Ступени 3-4 и комбо: лимитка, полоса «полный балл», маркеры проигрывания, подсказка запаса стопа. */
  onLimitChange?: (price: number | null) => void;
  guideBand?: { from: number; to: number } | null;
  replayMarkers?: readonly ReplayMarker[];
  slHint?: { structure: number; atr: number } | null;
  /** centerOn / focusMark для разбора. */
  handleRef?: Ref<TradingChartHandle>;
}

/** График задания: только прошлое (ряд приходит с сервера), без догрузки истории. */
export function TaskChart(p: TaskChartProps) {
  const series = useMemo<CandleSeries>(() => ({ symbol: p.symbol, tf: p.tf, source: 'binance-archive', candles: p.candles }), [p.symbol, p.tf, p.candles]);
  const hf = p.highlightRange?.fromTime;
  const ht = p.highlightRange?.toTime;
  const hr = useMemo(() => (hf !== undefined && ht !== undefined ? { fromTime: hf, toTime: ht } : undefined), [hf, ht]);
  const visibleRange = useMemo(() => tailRange(p.candles, p.tf, p.bars), [p.candles, p.tf, p.bars]);
  return (
    <TradingChart
      series={series}
      marks={p.marks}
      tool={p.tool}
      onMarksChange={p.onMarksChange}
      {...(visibleRange ? { visibleRange } : {})}
      {...(hr ? { highlightRange: hr } : {})}
      windowLabel={ss.windowLabel}
      scope={p.scope ?? null}
      {...(p.readOnlyMarks ? { readOnlyMarks: p.readOnlyMarks } : {})}
      {...(p.markStates ? { markStates: p.markStates } : {})}
      selectedId={p.selectedId ?? null}
      {...(p.onSelectedChange ? { onSelectedChange: p.onSelectedChange } : {})}
      {...(p.onNotice ? { onNotice: p.onNotice } : {})}
      focus={p.focus ?? null}
      {...(p.highlightCandles ? { highlightCandles: p.highlightCandles } : {})}
      {...(p.handleRef ? { handleRef: p.handleRef } : {})}
      {...(p.onLevelPick ? { onLevelPick: p.onLevelPick } : {})}
      {...(p.highlightLevel !== undefined ? { highlightLevel: p.highlightLevel } : {})}
      {...(p.onLimitChange ? { onLimitChange: p.onLimitChange } : {})}
      {...(p.guideBand ? { guideBand: p.guideBand } : {})}
      {...(p.replayMarkers ? { replayMarkers: p.replayMarkers } : {})}
      {...(p.slHint ? { slHint: p.slHint } : {})}
      {...(p.onVisibleRangeChange ? { onVisibleRangeChange: p.onVisibleRangeChange } : {})}
      openCandleLabel={tx.openCandle}
      ariaLabel={ss.chartLabel(p.symbol, TF_LABEL[p.tf])}
    />
  );
}
