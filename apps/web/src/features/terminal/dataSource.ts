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

/** Архивный источник доступен везде, включая production: запасной вариант, когда живой поток недоступен. Всегда помечается «не live». */
export function archiveAllowed(): boolean {
  return true;
}

export function resolveSourceMode(param: string | null | undefined): SourceMode {
  return param === 'archive' && archiveAllowed() ? 'archive' : 'live';
}

/** Предлагать ли «Посмотреть на архивных данных» при ошибке живого режима (кроме 400 - неверная пара, и архивных ошибок). */
export function offerArchive(code: number | string | undefined, mode: SourceMode): boolean {
  return mode === 'live' && code !== 400 && code !== 'archive';
}

/** Ссылка на тот же экран в архивном режиме. */
export function archiveHref(symbol: Symbol, tf: Timeframe): string {
  return `/terminal?source=archive&symbol=${encodeURIComponent(symbol)}&tf=${tf}`;
}

export const ARCHIVE_SYMBOLS: readonly string[] = PRESET_SYMBOLS;
const DAY = 86_400_000;
/** /api/history отдаёт только данные старше 2 суток (API_CONTRACTS §3.2). */
export const ARCHIVE_MIN_AGE_MS = 2 * DAY;
export const HISTORY_PAGE = 1500;

/** Размер страницы архива: ~3 месяца, чтобы холодный запрос (monthly zip) был быстрым. */
export function archivePageSize(tf: Timeframe): number {
  return Math.min(HISTORY_PAGE, Math.ceil((92 * DAY) / TIMEFRAME_MS[tf]));
}

/**
 * Окно запроса к /api/history. `before` - openTime самой старой имеющейся свечи (исключительно); без него -
 * последние `count` свечей, доступные в архиве на момент `now`. Границы выровнены по шагу ТФ.
 */
export function archiveWindow(tf: Timeframe, now: number, count = archivePageSize(tf), before?: number) {
  const step = TIMEFRAME_MS[tf];
  const latest = Math.floor((now - ARCHIVE_MIN_AGE_MS - step) / step) * step;
  const to = before !== undefined ? Math.min(before, latest) : latest;
  return { from: to - count * step, to };
}
