import { TIMEFRAME_MS, type Candle, type Timeframe, type UtcMs } from '@tl/core';
import { ArchiveError } from './errors';

export const ARCHIVE_KLINE_HEADER =
  'open_time,open,high,low,close,volume,close_time,quote_volume,count,taker_buy_volume,taker_buy_quote_volume,ignore';

function num(v: unknown, what: string): number {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN;
  if (!Number.isFinite(n)) throw new Error(`Invalid kline: ${what}=${String(v)}`);
  return n;
}

/** REST /fapi/v1/klines: массив из 12 элементов. closed = closeTime < now. */
export function parseRestKline(arr: readonly unknown[], now: UtcMs = Date.now()): Candle {
  if (!Array.isArray(arr) || arr.length < 9) throw new Error('Invalid kline: expected array of >= 9 items');
  const closeTime = num(arr[6], 'closeTime');
  return {
    openTime: num(arr[0], 'openTime'),
    closeTime,
    open: num(arr[1], 'open'),
    high: num(arr[2], 'high'),
    low: num(arr[3], 'low'),
    close: num(arr[4], 'close'),
    volume: num(arr[5], 'volume'),
    quoteVolume: num(arr[7], 'quoteVolume'),
    trades: num(arr[8], 'trades'),
    closed: closeTime < now,
  };
}

/** WS kline-событие (одиночное или обёрнутое {stream, data}). closed = k.x. */
export function parseWsKline(evt: unknown): Candle {
  let e = evt as { data?: unknown; e?: unknown; k?: Record<string, unknown> } | null;
  if (e && typeof e === 'object' && 'data' in e && e.data && typeof e.data === 'object') {
    e = e.data as typeof e;
  }
  if (!e || typeof e !== 'object' || e.e !== 'kline' || !e.k || typeof e.k !== 'object') {
    throw new Error('Invalid kline event');
  }
  const k = e.k;
  return {
    openTime: num(k.t, 't'),
    closeTime: num(k.T, 'T'),
    open: num(k.o, 'o'),
    high: num(k.h, 'h'),
    low: num(k.l, 'l'),
    close: num(k.c, 'c'),
    volume: num(k.v, 'v'),
    quoteVolume: num(k.q, 'q'),
    trades: num(k.n, 'n'),
    closed: k.x === true,
  };
}

export interface ParseArchiveOptions {
  /**
   * true - заголовок обязателен и должен совпасть; false - заголовка быть не должно;
   * 'auto' (по умолчанию) - допускаются оба варианта (старые месяцы архива без заголовка).
   */
  expectHeader?: boolean | 'auto';
}

/** Время в архиве - мс; значения >= 1e14 считаются микросекундами и приводятся к мс. */
function toMs(v: number): number {
  return v >= 1e14 ? Math.floor(v / 1000) : v;
}

export function parseArchiveCsv(text: string, opts: ParseArchiveOptions = {}): Candle[] {
  const expectHeader = opts.expectHeader ?? 'auto';
  const lines = text.split('\n').map((l) => l.replace(/\r$/, ''));
  while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
  if (lines.length === 0) return [];

  const first = lines[0]!;
  const hasHeader = /^[A-Za-z_]/.test(first);
  if (hasHeader) {
    if (expectHeader === false) {
      throw new ArchiveError('bad_format', 'Unexpected CSV header in archive file');
    }
    if (first.trim() !== ARCHIVE_KLINE_HEADER) {
      throw new ArchiveError('bad_format', `Unexpected CSV header: ${first.slice(0, 120)}`);
    }
    lines.shift();
  } else if (expectHeader === true) {
    throw new ArchiveError('bad_format', 'CSV header is missing');
  }

  const offset = hasHeader ? 2 : 1;
  return lines.map((line, i) => {
    const f = line.split(',');
    if (f.length < 9) {
      throw new ArchiveError('bad_format', `Invalid CSV row at line ${i + offset}: ${f.length} columns`);
    }
    try {
      return {
        openTime: toMs(num(f[0], 'open_time')),
        closeTime: toMs(num(f[6], 'close_time')),
        open: num(f[1], 'open'),
        high: num(f[2], 'high'),
        low: num(f[3], 'low'),
        close: num(f[4], 'close'),
        volume: num(f[5], 'volume'),
        quoteVolume: num(f[7], 'quote_volume'),
        trades: num(f[8], 'count'),
        closed: true,
      };
    } catch (e) {
      throw new ArchiveError('bad_format', `Invalid CSV row at line ${i + offset}: ${(e as Error).message}`);
    }
  });
}

/**
 * Сортировка по openTime и дедуп. Закрытая свеча побеждает незакрытую;
 * при равном статусе побеждает пришедшая позже (incoming после existing).
 */
export function mergeCandles(existing: readonly Candle[], incoming: readonly Candle[]): Candle[] {
  const byTime = new Map<number, Candle>();
  for (const c of [...existing, ...incoming]) {
    const prev = byTime.get(c.openTime);
    if (!prev || c.closed || !prev.closed) byTime.set(c.openTime, c);
  }
  return [...byTime.values()].sort((a, b) => a.openTime - b.openTime);
}

export interface Gap {
  /** openTime первой отсутствующей свечи. */
  fromTime: UtcMs;
  /** openTime следующей имеющейся свечи (или конец диапазона), исключительно. */
  toTime: UtcMs;
}

/** Пропуски в отсортированной серии. range = [from, to) дополнительно проверяет края. */
export function findGaps(
  candles: readonly Candle[],
  tf: Timeframe,
  range?: { from: UtcMs; to: UtcMs },
): Gap[] {
  const step = TIMEFRAME_MS[tf];
  const gaps: Gap[] = [];
  if (candles.length === 0) {
    return range && range.to > range.from ? [{ fromTime: range.from, toTime: range.to }] : [];
  }
  const sorted = [...candles].sort((a, b) => a.openTime - b.openTime);
  const firstT = sorted[0]!.openTime;
  if (range && firstT > range.from) gaps.push({ fromTime: range.from, toTime: firstT });
  for (let i = 1; i < sorted.length; i++) {
    const prevNext = sorted[i - 1]!.openTime + step;
    const t = sorted[i]!.openTime;
    if (t > prevNext) gaps.push({ fromTime: prevNext, toTime: t });
  }
  const lastEnd = sorted[sorted.length - 1]!.openTime + step;
  if (range && lastEnd < range.to) gaps.push({ fromTime: lastEnd, toTime: range.to });
  return gaps;
}
