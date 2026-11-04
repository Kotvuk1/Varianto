'use client';
// Данные терминала: LiveFeed (REST история + WS, fallback - опрос) или архив Binance (?source=archive, не live).
// Свечи не подставляются: при ошибке остаётся состояние error без данных.
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { TIMEFRAME_MS, type Candle, type CandleSeries, type Symbol, type Timeframe } from '@tl/core';
import { LiveFeed, LiveFeedError, findGaps, mergeCandles, type LiveStatus } from '@tl/market-data';
import { ClockSync, sniffingFetch, sniffingWebSocket } from './clockSync';
import { archiveWindow, HISTORY_PAGE, type SourceMode } from './dataSource';

export interface LoadError {
  code: number | string;
  message: string;
  at: number;
}

export type DataStatus = LiveStatus['state'] | 'archive';

export interface MarketState {
  /** Последний успешно загруженный ряд (остаётся на экране, пока грузится следующий). */
  series: CandleSeries | null;
  loading: boolean;
  loadingMore: boolean;
  status: DataStatus;
  error: LoadError | null;
  hasMore: boolean;
}

/** Добавляет свечу: быстрый путь для хвоста, иначе полное слияние (дубликаты - побеждает закрытая/последняя). */
export function appendCandle(candles: readonly Candle[], c: Candle): Candle[] {
  const last = candles[candles.length - 1];
  if (!last || c.openTime > last.openTime) return [...candles, c];
  if (c.openTime === last.openTime) return [...candles.slice(0, -1), c.closed || !last.closed ? c : last];
  return mergeCandles(candles, [c]);
}

class ArchiveHttpError extends Error {
  constructor(readonly status: number) {
    super(`archive HTTP ${status}`);
  }
}

async function fetchArchive(symbol: Symbol, tf: Timeframe, before?: number): Promise<Candle[]> {
  const { from, to } = archiveWindow(tf, Date.now(), undefined, before);
  const q = new URLSearchParams({ symbol, tf, from: String(from), to: String(to) });
  const res = await fetch(`/api/history?${q.toString()}`);
  if (!res.ok) throw new ArchiveHttpError(res.status);
  const body = (await res.json()) as { series?: { candles?: Candle[] } };
  return body.series?.candles ?? [];
}

const toLoadError = (e: unknown, mode: SourceMode): LoadError => {
  const at = Date.now();
  if (e instanceof LiveFeedError) return { code: e.code, message: e.message, at };
  if (e instanceof ArchiveHttpError) return { code: 'archive', message: e.message, at };
  return { code: mode === 'archive' ? 'archive' : 'network', message: String(e), at };
};

export function useMarketData(symbol: Symbol, tf: Timeframe, mode: SourceMode) {
  const clock = useMemo(() => new ClockSync(), []);
  const feed = useMemo(() => {
    const WebSocket = sniffingWebSocket(clock);
    return new LiveFeed({ fetch: sniffingFetch(clock), ...(WebSocket ? { WebSocket } : {}) });
  }, [clock]);
  const [clockOffsetMs, setClockOffsetMs] = useState(0);
  useEffect(() => {
    // смещение обновляется состоянием, только если сдвинулось заметно (не перерисовываем на каждом сообщении)
    clock.onChange = () => setClockOffsetMs((prev) => (Math.abs(clock.offset() - prev) > 250 ? clock.offset() : prev));
    return () => {
      clock.onChange = null;
    };
  }, [clock]);
  const [state, setState] = useState<MarketState>({
    series: null,
    loading: true,
    loadingMore: false,
    status: mode === 'archive' ? 'archive' : 'connecting',
    error: null,
    hasMore: true,
  });
  const [reloadKey, setReloadKey] = useState(0);
  const moreBusy = useRef(false);
  const current = useRef({ symbol, tf, mode });
  useLayoutEffect(() => {
    current.current = { symbol, tf, mode };
  });

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    const source: CandleSeries['source'] = mode === 'archive' ? 'binance-archive' : 'binance-live';
    setState((s) => ({
      ...s,
      loading: true,
      error: null,
      hasMore: true,
      status: mode === 'archive' ? 'archive' : 'connecting',
    }));

    (async () => {
      try {
        let candles =
          mode === 'archive' ? await fetchArchive(symbol, tf) : await feed.fetchKlines(symbol, tf, { limit: HISTORY_PAGE });
        if (cancelled) return;
        if (mode === 'live') {
          // Пропуски дозапрашиваются; не дозапрошенные остаются пропусками (свечи не выдумываются).
          for (const gap of findGaps(candles, tf).slice(0, 3)) {
            const fill = await feed.fetchKlines(symbol, tf, { startTime: gap.fromTime, endTime: gap.toTime - 1, limit: 1500 });
            if (cancelled) return;
            candles = mergeCandles(candles, fill);
          }
        }
        setState((s) => ({
          ...s,
          series: { symbol, tf, source, candles },
          loading: false,
          error: null,
          status: mode === 'archive' ? 'archive' : s.status,
        }));
        if (mode === 'live') {
          const last = candles[candles.length - 1];
          unsubscribe = feed.subscribe(
            symbol,
            tf,
            (c) =>
              setState((s) =>
                s.series && s.series.symbol === symbol && s.series.tf === tf
                  ? { ...s, series: { ...s.series, candles: appendCandle(s.series.candles, c) } }
                  : s,
              ),
            {
              since: last?.openTime,
              onStatus: (st) =>
                setState((s) => ({
                  ...s,
                  status: st.state,
                  error:
                    st.state === 'error' && !s.series?.candles.length
                      ? { code: st.code ?? 'network', message: st.message ?? '', at: Date.now() }
                      : s.error,
                })),
            },
          );
        }
      } catch (e) {
        if (cancelled) return;
        setState((s) => ({ ...s, loading: false, error: toLoadError(e, mode), status: mode === 'archive' ? 'archive' : 'error' }));
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [symbol, tf, mode, feed, reloadKey]);

  const loadMore = useCallback(
    async (before: number) => {
      const { symbol: sym, tf: curTf, mode: m } = current.current;
      if (moreBusy.current) return;
      moreBusy.current = true;
      setState((s) => ({ ...s, loadingMore: true }));
      try {
        const older =
          m === 'archive'
            ? await fetchArchive(sym, curTf, before)
            : await feed.fetchKlines(sym, curTf, { endTime: before - 1, limit: HISTORY_PAGE });
        setState((s) => {
          if (!s.series || s.series.symbol !== sym || s.series.tf !== curTf) return { ...s, loadingMore: false };
          const have = new Set(s.series.candles.map((c) => c.openTime));
          const fresh = older.filter((c) => !have.has(c.openTime));
          return {
            ...s,
            loadingMore: false,
            hasMore: fresh.length > 0,
            series: fresh.length ? { ...s.series, candles: mergeCandles(s.series.candles, fresh) } : s.series,
          };
        });
      } catch (e) {
        // архив: 404 = дальше данных нет; остальное - временная ошибка, повторим при следующей прокрутке
        setState((s) => ({ ...s, loadingMore: false, hasMore: e instanceof ArchiveHttpError && e.status === 404 ? false : s.hasMore }));
      } finally {
        moreBusy.current = false;
      }
    },
    [feed],
  );

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);
  return { ...state, clockOffsetMs, loadMore, reload, stepMs: TIMEFRAME_MS[tf] };
}
