// LiveFeed - браузерный клиент Binance USDⓈ-M (REST klines + WS kline). Без Node-API.
import type { Candle, Symbol, Timeframe, UtcMs } from '@tl/core';
import { parseRestKline, parseWsKline } from './normalize';

export const BINANCE_REST_BASE = 'https://fapi.binance.com';
export const BINANCE_WS_BASE = 'wss://fstream.binance.com';

export const MAX_KLINES_LIMIT = 1500;
export const WS_OPEN_TIMEOUT_MS = 8000;
export const POLL_INTERVAL_MS = 3000;
export const RECONNECT_BASE_MS = 1000;
export const RECONNECT_MAX_MS = 30_000;

/** Обозначения интервалов Binance совпадают с Timeframe (1m, 15m, 1h, 4h, 1d). */
export const binanceInterval = (tf: Timeframe): string => tf;

export type LiveErrorCode = number | 'network' | 'bad_response';

export class LiveFeedError extends Error {
  constructor(
    readonly code: LiveErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'LiveFeedError';
  }
}

export interface LiveStatus {
  state: 'connecting' | 'live' | 'polling' | 'error';
  /** 451 (гео-блок), HTTP-код, 'network' или 'bad_response'. Только при state='error'. */
  code?: LiveErrorCode;
  message?: string;
}

export interface WebSocketLike {
  onopen: (() => void) | null;
  onmessage: ((e: { data: unknown }) => void) | null;
  onclose: (() => void) | null;
  onerror: (() => void) | null;
  close(): void;
}
export type WebSocketCtor = new (url: string) => WebSocketLike;
export type LiveFetch = (url: string) => Promise<Response>;

export interface LiveFeedOptions {
  fetch?: LiveFetch;
  WebSocket?: WebSocketCtor;
  now?: () => UtcMs;
  restBase?: string;
  wsBase?: string;
}

export interface FetchKlinesOptions {
  limit?: number;
  startTime?: UtcMs;
  endTime?: UtcMs;
}

export interface SubscribeOptions {
  onStatus?: (s: LiveStatus) => void;
  /** openTime последней известной свечи: после (пере)подключения догружается REST-ом начиная с него. */
  since?: UtcMs;
}

export class LiveFeed {
  private readonly fetchFn: LiveFetch;
  private readonly WS: WebSocketCtor | undefined;
  private readonly now: () => UtcMs;
  private readonly rest: string;
  private readonly wsBase: string;

  constructor(opts: LiveFeedOptions = {}) {
    this.fetchFn = opts.fetch ?? ((url) => globalThis.fetch(url));
    this.WS = opts.WebSocket ?? (globalThis as { WebSocket?: WebSocketCtor }).WebSocket;
    this.now = opts.now ?? (() => Date.now());
    this.rest = opts.restBase ?? BINANCE_REST_BASE;
    this.wsBase = opts.wsBase ?? BINANCE_WS_BASE;
  }

  async fetchKlines(symbol: Symbol, tf: Timeframe, opts: FetchKlinesOptions = {}): Promise<Candle[]> {
    const limit = opts.limit ?? 500;
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_KLINES_LIMIT) {
      throw new RangeError(`limit must be an integer in 1..${MAX_KLINES_LIMIT}`);
    }
    const q = new URLSearchParams({ symbol, interval: binanceInterval(tf), limit: String(limit) });
    if (opts.startTime !== undefined) q.set('startTime', String(opts.startTime));
    if (opts.endTime !== undefined) q.set('endTime', String(opts.endTime));

    let res: Response;
    try {
      res = await this.fetchFn(`${this.rest}/fapi/v1/klines?${q.toString()}`);
    } catch (e) {
      throw new LiveFeedError('network', `Network error: ${(e as Error).message}`);
    }
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const body = (await res.json()) as { msg?: string };
        if (body?.msg) msg = `${msg}: ${body.msg}`;
      } catch {
        /* тело не JSON (например, 451) */
      }
      throw new LiveFeedError(res.status, msg);
    }
    try {
      const rows = (await res.json()) as unknown;
      if (!Array.isArray(rows)) throw new Error('response is not an array');
      const now = this.now();
      return rows.map((r) => parseRestKline(r as unknown[], now));
    } catch (e) {
      throw new LiveFeedError('bad_response', `Bad klines response: ${(e as Error).message}`);
    }
  }

  /** Подписка на свечи. Возвращает функцию отписки. Дубликаты одного openTime заменяются потребителем (mergeCandles). */
  subscribe(
    symbol: Symbol,
    tf: Timeframe,
    onCandle: (c: Candle) => void,
    opts: SubscribeOptions = {},
  ): () => void {
    const WS = this.WS;
    if (!WS) throw new Error('WebSocket is not available');
    const url = `${this.wsBase}/ws/${symbol.toLowerCase()}@kline_${binanceInterval(tf)}`;

    let stopped = false;
    let ws: WebSocketLike | null = null;
    let live = false;
    let polling = false;
    let attempt = 0;
    let lastOpenTime: UtcMs | undefined = opts.since;
    let status: LiveStatus['state'] = 'connecting';
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let pollTimer: ReturnType<typeof setTimeout> | undefined;

    const setStatus = (s: LiveStatus) => {
      if (stopped) return;
      status = s.state;
      opts.onStatus?.(s);
    };
    const emit = (c: Candle) => {
      if (stopped) return;
      if (lastOpenTime === undefined || c.openTime > lastOpenTime) lastOpenTime = c.openTime;
      onCandle(c);
    };
    const reportError = (e: unknown) => {
      const err = e instanceof LiveFeedError ? e : new LiveFeedError('network', String(e));
      setStatus({ state: 'error', code: err.code, message: err.message });
    };

    const armFallback = () => {
      if (fallbackTimer !== undefined || polling) return;
      fallbackTimer = setTimeout(() => {
        fallbackTimer = undefined;
        if (!live && !stopped) startPolling();
      }, WS_OPEN_TIMEOUT_MS);
    };

    const poll = async () => {
      pollTimer = undefined;
      try {
        const candles =
          lastOpenTime === undefined
            ? await this.fetchKlines(symbol, tf, { limit: 2 })
            : await this.fetchKlines(symbol, tf, { startTime: lastOpenTime, limit: MAX_KLINES_LIMIT });
        if (stopped || !polling) return;
        candles.forEach(emit);
        if (status !== 'polling') setStatus({ state: 'polling' });
      } catch (e) {
        if (stopped || !polling) return;
        reportError(e);
      }
      if (!stopped && polling) pollTimer = setTimeout(poll, POLL_INTERVAL_MS);
    };
    const startPolling = () => {
      polling = true;
      setStatus({ state: 'polling' });
      void poll();
    };
    const stopPolling = () => {
      polling = false;
      if (pollTimer !== undefined) clearTimeout(pollTimer);
      pollTimer = undefined;
    };

    const backfill = async () => {
      if (lastOpenTime === undefined) return;
      try {
        const candles = await this.fetchKlines(symbol, tf, { startTime: lastOpenTime, limit: MAX_KLINES_LIMIT });
        candles.forEach(emit);
      } catch (e) {
        reportError(e);
      }
    };

    const connect = () => {
      reconnectTimer = undefined;
      if (stopped) return;
      const sock = new WS(url);
      ws = sock;
      sock.onopen = () => {
        if (stopped || ws !== sock) return;
        live = true;
        attempt = 0;
        if (fallbackTimer !== undefined) clearTimeout(fallbackTimer);
        fallbackTimer = undefined;
        stopPolling();
        setStatus({ state: 'live' });
        void backfill();
      };
      sock.onmessage = (e) => {
        if (stopped || ws !== sock) return;
        let candle: Candle;
        try {
          candle = parseWsKline(JSON.parse(String(e.data)));
        } catch {
          return;
        }
        if (status === 'error') setStatus({ state: 'live' });
        emit(candle);
      };
      sock.onerror = () => undefined; // за ошибкой всегда следует close
      sock.onclose = () => {
        if (stopped || ws !== sock) return;
        ws = null;
        if (live) {
          live = false;
          if (!polling) setStatus({ state: 'connecting' });
        }
        armFallback();
        const delay = Math.min(RECONNECT_BASE_MS * 2 ** attempt, RECONNECT_MAX_MS);
        attempt++;
        reconnectTimer = setTimeout(connect, delay);
      };
    };

    setStatus({ state: 'connecting' });
    armFallback();
    connect();

    return () => {
      stopped = true;
      stopPolling();
      if (fallbackTimer !== undefined) clearTimeout(fallbackTimer);
      if (reconnectTimer !== undefined) clearTimeout(reconnectTimer);
      const s = ws as WebSocketLike | null;
      ws = null;
      s?.close();
    };
  }
}
