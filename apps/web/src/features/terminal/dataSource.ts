import { TIMEFRAME_MS, type Symbol, type Timeframe } from '@tl/core';

export const PRESET_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'] as const;
export const TERMINAL_TIMEFRAMES: readonly Timeframe[] = ['15m', '1h', '4h', '1d'];
export const TF_LABEL: Readonly<Record<Timeframe, string>> = { '1m': '1m', '15m': '15m', '1h': '1H', '4h': '4H', '1d': '1D' };

/** USDⓈ-M: пары к USDT и USDC. */
export const SYMBOL_RE = /^[A-Z0-9]{2,20}(USDT|USDC)$/;

export function normalizeSymbolInput(raw: string): Symbol | null {
  const s = raw.trim().toUpperCase();
  return SYMBOL_RE.test(s) ? s : null;
}

export type SourceMode = 'live' | 'archive';

/** Режим архива доступен вне production или при явном флаге сборки. */
export function archiveAllowed(env: { NODE_ENV?: string; NEXT_PUBLIC_ENABLE_ARCHIVE_SOURCE?: string }): boolean {
  return env.NODE_ENV !== 'production' || env.NEXT_PUBLIC_ENABLE_ARCHIVE_SOURCE === '1';
}

export function resolveSourceMode(
  param: string | null | undefined,
  env: { NODE_ENV?: string; NEXT_PUBLIC_ENABLE_ARCHIVE_SOURCE?: string },
): SourceMode {
  return param === 'archive' && archiveAllowed(env) ? 'archive' : 'live';
}

export const ARCHIVE_SYMBOLS: readonly string[] = PRESET_SYMBOLS;
const DAY = 86_400_000;
/** /api/history отдаёт только данные старше 2 суток (API_CONTRACTS §3.2). */
export const ARCHIVE_MIN_AGE_MS = 2 * DAY;
export const HISTORY_PAGE = 1500;

/**
 * Окно запроса к /api/history. `before` - openTime самой старой имеющейся свечи (исключительно); без него -
 * последние `count` свечей, доступные в архиве на момент `now`. Границы выровнены по шагу ТФ.
 */
export function archiveWindow(tf: Timeframe, now: number, count = HISTORY_PAGE, before?: number) {
  const step = TIMEFRAME_MS[tf];
  const latest = Math.floor((now - ARCHIVE_MIN_AGE_MS - step) / step) * step;
  const to = before !== undefined ? Math.min(before, latest) : latest;
  return { from: to - count * step, to };
}
