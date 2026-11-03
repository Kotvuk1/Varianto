'use client';
// React-обёртка Lightweight Charts v5: свечи + объём, слой разметки на Series Primitive, Pointer Events.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  TickMarkType,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type LogicalRange as LwcLogicalRange,
  type Time,
} from 'lightweight-charts';
import { TIMEFRAME_MS, type Candle, type CandleSeries, type Mark } from '@tl/core';
import { DrawingController, type ControllerNotice, type PointerInput } from './interaction/controller';
import { DrawingPrimitive } from './drawing/DrawingPrimitive';
import type { HighlightRange } from './drawing/highlight';
import { lwcProjection } from './drawing/lwcProjection';
import type { PointerKind } from './drawing/hit';
import type { ToolId } from './drawing/tools';
import { TimeIndex } from './geometry/timeIndex';
import { decimalsForTick, makePriceFormatter, tickSizeFor } from './priceFormat';
import { limitCandles, toCandleData, toVolumeData } from './seriesData';
import {
  defaultLogicalRange,
  logicalRangeFromWindow,
  windowFromLogicalRange,
  type TimeWindow,
} from './sync/visibleRange';
import { type ChartTokens } from './theme/chartTokens';
import { useChartTokens } from './useChartTokens';

export type { TimeWindow } from './sync/visibleRange';

export interface TradingChartProps {
  series: CandleSeries;
  /** Метки пользователя (редактируемые). */
  marks: Mark[];
  tool: ToolId | null;
  onMarksChange: (marks: Mark[]) => void;
  /** Пользователь прокрутил к началу загруженной истории: нужна история до beforeTime (openTime первой свечи). */
  onRequestMoreHistory?: (beforeTime: number) => void;
  /** Область времени, применяемая при смене пары/ТФ (FR-CHART-05). Если не задана - берётся последняя область для той же пары. */
  visibleRange?: TimeWindow;
  onVisibleRangeChange?: (w: TimeWindow) => void;
  /** Метки алгоритма: только отображение. */
  readOnlyMarks?: Mark[];
  selectedId?: string | null;
  onSelectedChange?: (id: string | null) => void;
  /** Снап цены к OHLC (по умолчанию включён; для типов, где он задан). */
  snap?: boolean;
  /** Единая точка «сейчас» (Challenge): свечи, открывшиеся в момент now или позже, не отображаются. */
  now?: number;
  /** Подпись бейджа у незакрытой свечи. */
  openCandleLabel?: string;
  ariaLabel?: string;
  className?: string;
  /** tickSize символа из exchangeInfo, если известен; иначе таблица для BTC/ETH/SOL и 2 знака по умолчанию. */
  tickSize?: number;
  /** Шаг мастера и предупреждения инструмента (строка-инструкция). */
  onNotice?: (n: ControllerNotice) => void;
  /** Центрировать график по времени на метке (nonce меняется при каждом запросе). */
  focus?: { time: number; nonce: number } | null;
  /** Состояния меток после проверки (id -> match/missed/extra): значок в подписи. */
  markStates?: Record<string, 'match' | 'missed' | 'extra'>;
  /** Окно оценки задания: вне него свечи затемнены, граница окна пунктиром. */
  highlightRange?: HighlightRange;
}

const LOCALE = 'ru-RU';
const pad = (n: number) => String(n).padStart(2, '0');
const toDate = (t: Time) => new Date((t as number) * 1000);

function tickFormatter(time: Time, type: TickMarkType): string {
  const d = toDate(time);
  switch (type) {
    case TickMarkType.Year:
      return String(d.getFullYear());
    case TickMarkType.Month:
      return d.toLocaleDateString(LOCALE, { month: 'short' });
    case TickMarkType.DayOfMonth:
      return String(d.getDate());
    default:
      return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}

function crosshairTimeFormatter(time: Time): string {
  const d = toDate(time);
  return `${d.getDate()} ${d.toLocaleDateString(LOCALE, { month: 'short' }).replace('.', '')} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function chartColors(t: ChartTokens) {
  return {
    layout: {
      background: { type: ColorType.Solid, color: t.bg },
      textColor: t.axisText,
      fontFamily: t.fontMono,
      fontSize: 11,
    },
    grid: { vertLines: { color: t.grid }, horzLines: { color: t.grid } },
    crosshair: {
      vertLine: { color: t.crosshair, labelBackgroundColor: t.lastPriceBg },
      horzLine: { color: t.crosshair, labelBackgroundColor: t.lastPriceBg },
    },
    rightPriceScale: { borderColor: t.grid },
    timeScale: { borderColor: t.grid },
  };
}

const fmtVol = (n: number) => Math.round(n).toLocaleString(LOCALE);

export function TradingChart(props: TradingChartProps) {
  const tokens = useChartTokens();
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const primitiveRef = useRef<DrawingPrimitive | null>(null);
  const controllerRef = useRef<DrawingController | null>(null);
  const indexRef = useRef<TimeIndex>(new TimeIndex([], 1));
  const candlesRef = useRef<readonly Candle[]>([]);
  const prevRef = useRef<{ key: string; symbol: string; candles: readonly Candle[]; tokens: ChartTokens } | null>(null);
  const suppressRange = useRef(false);
  const lastWindow = useRef<TimeWindow | null>(null);
  const requestedBefore = useRef<number | null>(null);
  const [legend, setLegend] = useState<Candle | null>(null);
  const [ready, setReady] = useState(false);

  // Актуальные props для обработчиков (без пересоздания графика).
  const propsRef = useRef(props);
  const tokensRef = useRef(tokens);
  const fmt = useMemo(() => makePriceFormatter(tickSizeFor(props.series.symbol, props.tickSize)), [props.series.symbol, props.tickSize]);
  const fmtRef = useRef(fmt);

  const candles = useMemo(() => limitCandles(props.series.candles, props.now), [props.series.candles, props.now]);

  const pushState = () => {
    const p = propsRef.current;
    const t = tokensRef.current;
    const prim = primitiveRef.current;
    const ctl = controllerRef.current;
    if (!prim || !t || !ctl) return;
    const last = candlesRef.current[candlesRef.current.length - 1];
    prim.setState({
      userMarks: p.marks,
      algoMarks: p.readOnlyMarks ?? [],
      selectedId: p.selectedId ?? null,
      override: ctl.override,
      preview: ctl.preview,
      tokens: t,
      openCandle: last && !last.closed ? { openTime: last.openTime, high: last.high, low: last.low } : null,
      openBadge: p.openCandleLabel ?? 'Идёт',
      fmt: fmtRef.current,
      ...(p.markStates ? { states: p.markStates } : {}),
      ...(p.highlightRange ? { highlightRange: p.highlightRange } : {}),
    });
  };
  const pushStateRef = useRef(pushState);
  // Запись ref - в layout-эффекте (до остальных эффектов), не во время рендера.
  useLayoutEffect(() => {
    propsRef.current = props;
    tokensRef.current = tokens;
    pushStateRef.current = pushState;
    fmtRef.current = fmt;
  });

  // --- Создание графика (один раз, когда известны токены) ---
  const haveTokens = tokens !== null;
  useEffect(() => {
    const el = containerRef.current;
    const t = tokensRef.current;
    if (!el || !t) return;

    const chart = createChart(el, {
      autoSize: true,
      ...chartColors(t),
      crosshair: { mode: CrosshairMode.Normal, ...chartColors(t).crosshair },
      localization: { locale: LOCALE, timeFormatter: crosshairTimeFormatter, priceFormatter: fmtRef.current },
      timeScale: {
        ...chartColors(t).timeScale,
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 5,
        minBarSpacing: 0.4,
        tickMarkFormatter: tickFormatter,
      },
      handleScroll: true,
      handleScale: true,
    });
    const candle = chart.addSeries(CandlestickSeries, {
      upColor: t.candleBullFill,
      downColor: t.candleBearFill,
      borderUpColor: t.candleBull,
      borderDownColor: t.candleBear,
      wickUpColor: t.wickBull,
      wickDownColor: t.wickBear,
      priceLineColor: t.lastPriceBg,
    });
    candle.priceScale().applyOptions({ scaleMargins: { top: 0.08, bottom: 0.16 } });
    const volume = chart.addSeries(HistogramSeries, {
      priceScaleId: '',
      priceFormat: { type: 'volume' },
      lastValueVisible: false,
      priceLineVisible: false,
    });
    volume.priceScale().applyOptions({ scaleMargins: { top: 0.88, bottom: 0 } });

    const primitive = new DrawingPrimitive(() => indexRef.current);
    candle.attachPrimitive(primitive);

    const paneSize = () => {
      const s = chart.paneSize();
      return { w: s.width, h: s.height };
    };
    const controller = new DrawingController({
      proj: () => {
        const { w, h } = paneSize();
        return lwcProjection(chart, candle, indexRef.current, w, h);
      },
      index: () => indexRef.current,
      candles: () => candlesRef.current,
      marks: () => propsRef.current.marks,
      commit: (m) => propsRef.current.onMarksChange(m),
      tool: () => propsRef.current.tool,
      snap: () => propsRef.current.snap ?? true,
      selectedId: () => propsRef.current.selectedId ?? null,
      select: (id) => propsRef.current.onSelectedChange?.(id),
      newId: () => (globalThis.crypto?.randomUUID?.() ?? `m${Date.now()}${Math.random().toString(36).slice(2, 8)}`),
      invalidate: () => pushStateRef.current(),
      notify: (n) => propsRef.current.onNotice?.(n),
      fmt: (v) => fmtRef.current(v),
    });

    chartRef.current = chart;
    candleRef.current = candle;
    volumeRef.current = volume;
    primitiveRef.current = primitive;
    controllerRef.current = controller;

    // Видимый диапазон -> область времени; догрузка истории слева.
    const onRange = (r: LwcLogicalRange | null) => {
      if (!r || suppressRange.current || indexRef.current.length === 0) return;
      const w = windowFromLogicalRange(indexRef.current, r);
      lastWindow.current = w;
      propsRef.current.onVisibleRangeChange?.(w);
      const first = candlesRef.current[0]?.openTime;
      if (r.from < 30 && first !== undefined && requestedBefore.current !== first) {
        requestedBefore.current = first;
        propsRef.current.onRequestMoreHistory?.(first);
      }
    };
    chart.timeScale().subscribeVisibleLogicalRangeChange(onRange);

    // Перекрестие -> легенда OHLCV.
    chart.subscribeCrosshairMove((param) => {
      if (!param.time) {
        setLegend((cur) => (cur ? null : cur));
        return;
      }
      const ms = (param.time as number) * 1000;
      const arr = candlesRef.current;
      let lo = 0;
      let hi = arr.length - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const ot = arr[mid]!.openTime;
        if (ot === ms) {
          const c = arr[mid]!;
          setLegend((cur) => (cur === c ? cur : c));
          return;
        }
        if (ot < ms) lo = mid + 1;
        else hi = mid - 1;
      }
      setLegend(null);
    });

    // --- Pointer Events: единый код для касания и мыши ---
    const active = new Set<number>();
    let owning = false;
    const setNav = (on: boolean) => chart.applyOptions({ handleScroll: on, handleScale: on });
    const toInput = (e: PointerEvent): PointerInput => {
      const r = el.getBoundingClientRect();
      const pointer: PointerKind = e.pointerType === 'touch' ? 'touch' : e.pointerType === 'pen' ? 'pen' : 'mouse';
      return { x: e.clientX - r.left, y: e.clientY - r.top, pointer };
    };
    const release = () => {
      if (owning) {
        owning = false;
        setNav(true);
      }
    };
    const onDown = (e: PointerEvent) => {
      active.add(e.pointerId);
      if (active.size > 1) {
        // второй палец: щипок/прокрутка двумя пальцами принадлежит графику
        controller.cancelGesture();
        release();
        return;
      }
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (controller.pointerDown(toInput(e))) {
        owning = true;
        setNav(false);
        try {
          el.setPointerCapture(e.pointerId);
        } catch {
          /* указатель уже неактивен */
        }
        e.preventDefault();
      }
    };
    const onMove = (e: PointerEvent) => {
      if (owning) {
        controller.pointerMove(toInput(e));
        e.preventDefault();
      } else if (e.pointerType === 'mouse') controller.hover(toInput(e));
    };
    const onUp = (e: PointerEvent) => {
      active.delete(e.pointerId);
      if (owning) {
        controller.pointerUp(toInput(e));
        release();
      }
    };
    const onCancel = (e: PointerEvent) => {
      active.delete(e.pointerId);
      if (owning) {
        controller.cancelGesture();
        release();
      }
    };
    // Пока жест принадлежит разметке, события не должны доходить до обработчиков LWC (touch/mouse).
    const swallow = (e: Event) => {
      if (owning) {
        e.stopPropagation();
        if (e.cancelable && e.type.startsWith('touch')) e.preventDefault();
      }
    };
    const swallowTypes = ['touchstart', 'touchmove', 'touchend', 'mousedown', 'mousemove', 'mouseup'];
    el.addEventListener('pointerdown', onDown, { capture: true });
    el.addEventListener('pointermove', onMove, { capture: true });
    el.addEventListener('pointerup', onUp, { capture: true });
    el.addEventListener('pointercancel', onCancel, { capture: true });
    for (const type of swallowTypes) el.addEventListener(type, swallow, { capture: true, passive: false });

    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'Escape') {
        controller.reset();
        propsRef.current.onSelectedChange?.(null);
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && propsRef.current.selectedId) {
        controller.deleteSelected();
      }
    };
    window.addEventListener('keydown', onKey);

    // Отладочный хук для e2e (только вне production или при явном флаге).
    const hooks = process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_ENABLE_ARCHIVE_SOURCE === '1';
    if (hooks) {
      (window as unknown as Record<string, unknown>).__tlMarkPoints = () => {
        const r = el.getBoundingClientRect();
        return primitive.lastCenters.map((c) => ({ id: c.id, x: r.left + c.x, y: r.top + c.y }));
      };
    }

    if (hooks) {
      const w = window as unknown as Record<string, unknown>;
      w.__tlCandles = () => candlesRef.current;
      w.__tlProject = (time: number, price: number) => {
        const r = el.getBoundingClientRect();
        const x = chart.timeScale().logicalToCoordinate(indexRef.current.timeToLogical(time) as never);
        const y = candle.priceToCoordinate(price);
        return x === null || y === null ? null : { x: r.left + x, y: r.top + y };
      };
    }

    setReady(true);
    return () => {
      window.removeEventListener('keydown', onKey);
      el.removeEventListener('pointerdown', onDown, { capture: true });
      el.removeEventListener('pointermove', onMove, { capture: true });
      el.removeEventListener('pointerup', onUp, { capture: true });
      el.removeEventListener('pointercancel', onCancel, { capture: true });
      for (const type of swallowTypes) el.removeEventListener(type, swallow, { capture: true });
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(onRange);
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
      volumeRef.current = null;
      primitiveRef.current = null;
      controllerRef.current = null;
      prevRef.current = null;
      setReady(false);
    };
    // график создаётся один раз при появлении токенов
  }, [haveTokens]);

  // --- Тема / режим свечей ---
  useEffect(() => {
    const chart = chartRef.current;
    const candle = candleRef.current;
    if (!chart || !candle || !tokens) return;
    chart.applyOptions(chartColors(tokens));
    candle.applyOptions({
      upColor: tokens.candleBullFill,
      downColor: tokens.candleBearFill,
      borderUpColor: tokens.candleBull,
      borderDownColor: tokens.candleBear,
      wickUpColor: tokens.wickBull,
      wickDownColor: tokens.wickBear,
      priceLineColor: tokens.lastPriceBg,
    });
  }, [tokens, ready]);

  // --- Единый формат цен: шкала, перекрестие, метки ---
  useEffect(() => {
    const chart = chartRef.current;
    const candle = candleRef.current;
    if (!chart || !candle) return;
    const tick = tickSizeFor(props.series.symbol, props.tickSize);
    chart.applyOptions({ localization: { priceFormatter: fmt } });
    candle.applyOptions({ priceFormat: { type: 'price', precision: decimalsForTick(tick), minMove: tick } });
    pushStateRef.current();
  }, [fmt, props.series.symbol, props.tickSize, ready]);

  // --- Центрирование на метке по запросу списка ---
  const focusNonce = props.focus?.nonce;
  useEffect(() => {
    const f = propsRef.current.focus;
    const chart = chartRef.current;
    if (!f || !chart || indexRef.current.length === 0) return;
    const ts = chart.timeScale();
    const lr = ts.getVisibleLogicalRange();
    if (!lr) return;
    const w = lr.to - lr.from;
    const l = indexRef.current.timeToLogical(f.time);
    ts.setVisibleLogicalRange({ from: l - w / 2, to: l + w / 2 });
  }, [focusNonce]);

  // --- Данные: смена пары/ТФ, догрузка истории, обновление хвоста ---
  useEffect(() => {
    const chart = chartRef.current;
    const candle = candleRef.current;
    const volume = volumeRef.current;
    if (!chart || !candle || !volume || !tokens || !ready) return;
    const { symbol, tf } = props.series;
    const key = `${symbol}|${tf}`;
    const prev = prevRef.current;
    const ts = chart.timeScale();

    candlesRef.current = candles;
    const newIndex = new TimeIndex(
      candles.map((c) => c.openTime),
      TIMEFRAME_MS[tf],
    );
    const oldIndex = indexRef.current;

    const tailUpdate =
      prev !== null &&
      prev.key === key &&
      prev.tokens === tokens &&
      prev.candles.length > 0 &&
      candles.length >= prev.candles.length &&
      prev.candles[0]!.openTime === candles[0]?.openTime;

    if (tailUpdate) {
      indexRef.current = newIndex;
      // LWC update() accepts only the last bar or a newer one; start from the
      // previous last bar (it may have changed while unclosed), then append.
      const from = Math.max(0, prev.candles.length - 1);
      for (let i = from; i < candles.length; i++) {
        candle.update(toCandleData(candles[i]!, tokens));
        volume.update(toVolumeData(candles[i]!, tokens));
      }
    } else {
      const lr = ts.getVisibleLogicalRange();
      const oldWindow: TimeWindow | null = lr && oldIndex.length > 0 ? windowFromLogicalRange(oldIndex, lr) : null;
      suppressRange.current = true;
      try {
        indexRef.current = newIndex;
        if (candles.length > 0) {
          // шкала и перекрестие используют единый форматер (localization.priceFormatter)
        }
        candle.setData(candles.map((c) => toCandleData(c, tokens)));
        volume.setData(candles.map((c) => toVolumeData(c, tokens)));
        if (candles.length > 0) {
          const sameSymbol = prev?.symbol === symbol;
          const target =
            prev === null || prev.key !== key
              ? (props.visibleRange ?? (sameSymbol ? (lastWindow.current ?? oldWindow) : null))
              : oldWindow;
          const range = target ? logicalRangeFromWindow(newIndex, target) : defaultLogicalRange(newIndex);
          ts.setVisibleLogicalRange(range);
          lastWindow.current = windowFromLogicalRange(newIndex, ts.getVisibleLogicalRange() ?? range);
        }
      } finally {
        suppressRange.current = false;
      }
      if (prev?.key !== key) requestedBefore.current = null;
      if (lastWindow.current) propsRef.current.onVisibleRangeChange?.(lastWindow.current);
    }
    prevRef.current = { key, symbol, candles, tokens };
    pushStateRef.current();
    // props.visibleRange намеренно не в зависимостях: применяется только при смене пары/ТФ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candles, props.series.symbol, props.series.tf, tokens, ready]);

  // --- Метки, выбор, инструмент ---
  useEffect(() => {
    pushStateRef.current();
  }, [props.marks, props.readOnlyMarks, props.markStates, props.highlightRange, props.selectedId, props.openCandleLabel, tokens, ready]);

  useEffect(() => {
    controllerRef.current?.reset();
    const el = containerRef.current;
    if (el) el.style.cursor = props.tool && props.tool !== 'select' ? 'crosshair' : '';
  }, [props.tool, props.series.symbol, ready]);

  const last = candles[candles.length - 1];
  const shown = legend ?? null;
  return (
    <div
      className={props.className}
      style={{ position: 'relative', width: '100%', height: '100%', minHeight: 0 }}
      data-testid="chart"
      data-candle-count={candles.length}
      data-mark-count={props.marks.length}
      data-tool={props.tool ?? ''}
      data-selected={props.selectedId ?? ''}
      data-last-closed={last ? String(last.closed) : ''}
      data-ready={ready ? 'true' : 'false'}
    >
      <div
        ref={containerRef}
        role="img"
        aria-label={props.ariaLabel ?? `${props.series.symbol} ${props.series.tf}`}
        style={{ position: 'absolute', inset: 0, touchAction: 'none', userSelect: 'none' }}
      />
      {shown && (
        <div
          data-testid="chart-legend"
          className="tnum"
          style={{
            position: 'absolute',
            top: 6,
            left: 8,
            zIndex: 10,
            pointerEvents: 'none',
            font: `500 12px/16px ${tokens?.fontMono ?? 'monospace'}`,
            color: tokens?.text1,
            background: tokens ? tokens.bg : undefined,
            opacity: 0.92,
            padding: '2px 6px',
            borderRadius: 4,
          }}
        >
          O {fmt(shown.open)} H {fmt(shown.high)} L {fmt(shown.low)} C {fmt(shown.close)} Об {fmtVol(shown.volume)}
        </div>
      )}
    </div>
  );
}
