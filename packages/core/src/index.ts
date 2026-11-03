// Домен @tl/core (ARCHITECTURE §4). Чистый TS: без DOM/Node API.

export const ALGO_VERSION = '0.1.0';

export type Symbol = 'BTCUSDT' | 'ETHUSDT' | 'SOLUSDT' | (string & {});
export type Timeframe = '1m' | '15m' | '1h' | '4h' | '1d';
/** Всё время — UTC, миллисекунды. */
export type UtcMs = number;

export const TIMEFRAME_MS: Readonly<Record<Timeframe, number>> = {
  '1m': 60_000,
  '15m': 15 * 60_000,
  '1h': 60 * 60_000,
  '4h': 4 * 60 * 60_000,
  '1d': 24 * 60 * 60_000,
};

export interface Candle {
  openTime: UtcMs;
  closeTime: UtcMs;
  open: number;
  high: number;
  low: number;
  close: number;
  /** Объём в базовом активе. */
  volume: number;
  quoteVolume: number;
  trades: number;
  /** false = незакрытая свеча. */
  closed: boolean;
}

export interface CandleSeries {
  symbol: Symbol;
  tf: Timeframe;
  source: 'binance-live' | 'binance-archive';
  candles: Candle[];
}

export interface Anchor {
  time: UtcMs;
  price: number;
}

export type MarkKind =
  | 'swing-high'
  | 'swing-low'
  | 'hh'
  | 'hl'
  | 'lh'
  | 'll'
  | 'bos'
  | 'choch'
  | 'sweep'
  | 'order-block'
  | 'fvg'
  | 'level'
  | 'hline'
  | 'trendline'
  | 'pattern'
  | 'position';

export interface Mark {
  id: string;
  kind: MarkKind;
  /** 1..3 точки по типу. */
  anchors: Anchor[];
  scope: 'internal' | 'external' | null;
  direction: 'bull' | 'bear' | null;
  /** Например patternType, sl/tp. */
  meta?: Record<string, unknown>;
  author: 'user' | 'algo';
}
