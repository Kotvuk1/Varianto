// Источники данных для заданий: адаптеры ArchiveSource -> ряды для генераторов ядра, ChallengeSource, FutureProvider.
// Только серверный код. Данные только старше 2 суток (ARCHITECTURE §5.2): граница `cutoff` задаётся вызывающим.
import {
  TIMEFRAME_MS,
  visibleCount,
  type AggTrade as CoreAggTrade,
  type Candle,
  type ChallengeSource,
  type FutureProvider,
  type TaskTimeframe,
  type Timeframe,
  type UtcMs,
} from '@tl/core';
import { ArchiveSource } from '@tl/market-data/archive';
import { ArchiveError } from '@tl/market-data';

export const DAY_MS = 86_400_000;
export const MIN_AGE_MS = 2 * DAY_MS;
/** Начало используемого архива (фьючерсы UM: BTC/ETH/SOL торгуются с 2020 г.). */
export const ARCHIVE_START: UtcMs = Date.UTC(2021, 0, 1);

export interface RawAggTrade {
  id: number;
  price: number;
  time: UtcMs;
}

/** Низкоуровневый загрузчик: свечи [from, to) по openTime и сделки по transact_time. */
export interface CandleLoader {
  candles(symbol: string, tf: Timeframe, from: UtcMs, to: UtcMs): Promise<Candle[]>;
  aggTrades(symbol: string, from: UtcMs, to: UtcMs): Promise<RawAggTrade[]>;
}

/** Граница доступных данных: «сейчас» минус 2 суток, по границе суток (стабильные ключи кэша). */
export const cutoffOf = (now: UtcMs): UtcMs => Math.floor((now - MIN_AGE_MS) / DAY_MS) * DAY_MS;

export const depthOf = (tf: TaskTimeframe): number => visibleCount(tf);
export const floorTo = (t: UtcMs, step: number): UtcMs => Math.floor(t / step) * step;

/** Число свечей с closeTime < T в отсортированном ряду (бинарный поиск). */
export function countClosedBefore(candles: readonly Candle[], T: UtcMs): number {
  let lo = 0;
  let hi = candles.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (candles[mid]!.closeTime < T) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** Последние `depth` закрытых свечей ряда с closeTime < T. */
export function tailBefore(candles: readonly Candle[], T: UtcMs, depth: number): Candle[] {
  const end = countClosedBefore(candles, T);
  return candles.slice(Math.max(0, end - depth), end).filter((c) => c.closed);
}

/** Закрытые свечи tf до T глубиной `depth` (по умолчанию как в заданиях). Одинаково для next и grade. */
export async function loadClosedBefore(
  loader: CandleLoader,
  symbol: string,
  tf: TaskTimeframe,
  T: UtcMs,
  depth: number = depthOf(tf),
): Promise<Candle[]> {
  const step = TIMEFRAME_MS[tf];
  const bucket = floorTo(T, step);
  const raw = await loader.candles(symbol, tf, bucket - depth * step, bucket);
  return tailBefore(raw, T, depth);
}

/** 1m-свечи [from, to); null, если есть пропуски (ADR-0006 п.5: сценарий отбраковывается). */
export async function loadMinutes(loader: CandleLoader, symbol: string, from: UtcMs, to: UtcMs): Promise<Candle[] | null> {
  if (to <= from) return [];
  const m = (await loader.candles(symbol, '1m', from, to)).filter((c) => c.openTime >= from && c.openTime < to);
  return m.length === (to - from) / 60_000 ? m : null;
}

// ------------------------------------------------------------ Challenge

/** Зона кандидатов T для Challenge: предзагруженные ряды всех ТФ (история на `depth` до первой T). */
export class ChallengeZone {
  constructor(
    readonly series: Record<TaskTimeframe, readonly Candle[]>,
    readonly candidates: readonly UtcMs[],
    readonly cutoff: UtcMs,
  ) {}

  static async load(loader: CandleLoader, symbol: string, zoneFrom: UtcMs, zoneTo: UtcMs, cutoff: UtcMs): Promise<ChallengeZone> {
    const tfs: TaskTimeframe[] = ['15m', '1h', '4h', '1d'];
    const loaded = await Promise.all(
      tfs.map((tf) => {
        const step = TIMEFRAME_MS[tf];
        return loader.candles(symbol, tf, floorTo(zoneFrom, step) - depthOf(tf) * step, floorTo(zoneTo, step) + step);
      }),
    );
    const series = Object.fromEntries(tfs.map((tf, i) => [tf, loaded[i]!])) as unknown as Record<TaskTimeframe, readonly Candle[]>;
    const grid = TIMEFRAME_MS['15m'];
    const candidates: UtcMs[] = [];
    for (let t = Math.ceil(zoneFrom / grid) * grid; t < zoneTo; t += grid) candidates.push(t);
    return new ChallengeZone(series, candidates, cutoff);
  }

  /** Фильтр сетки кандидатов (например, шаг 1 сутки в тестах без 1m). */
  withStep(stepMs: number): ChallengeZone {
    return new ChallengeZone(this.series, this.candidates.filter((t) => t % stepMs === 0), this.cutoff);
  }

  asSource(): ChallengeSource {
    // Вход - close последней видимой свечи, общий для всех ТФ (ADR-0006 п.4): берём любой ТФ с границей в T.
    const entryAt = (T: UtcMs): number => {
      for (const tf of ['15m', '1h', '4h', '1d'] as const) {
        if (T % TIMEFRAME_MS[tf] !== 0) continue;
        const arr = this.series[tf];
        const c = arr[countClosedBefore(arr, T) - 1];
        if (c && c.closeTime === T - 1) return c.close;
      }
      return Number.NaN;
    };
    return {
      candidates: this.candidates,
      closedAt: (tf, T) => tailBefore(this.series[tf], T, depthOf(tf)),
      entryAt,
      // Будущее на любой ТФ ответа (до 30 суток для 1d) должно лежать за границей 2 суток; история - ровно та, что загрузится при grade (зона покрывает depth до первой T).
      feasible: (T) => T + CHALLENGE_FUTURE_MS <= this.cutoff && Number.isFinite(entryAt(T)),
    };
  }
}

export const CHALLENGE_FUTURE_MS = 30 * DAY_MS;

/** FutureProvider для resolveTrade: свечи после T, 1m для drill-down, aggTrades минуты (ошибка -> null -> conservative-sl). */
export function futureProviderFor(
  loader: CandleLoader,
  symbol: string,
  cutoff: UtcMs,
  opts: { aggTradesTimeoutMs?: number } = {},
): FutureProvider {
  const timeout = opts.aggTradesTimeoutMs ?? 25_000;
  return {
    async candles(tf, from, count) {
      const to = Math.min(from + count * TIMEFRAME_MS[tf], cutoff);
      const got = await loader.candles(symbol, tf, from, to);
      return got.filter((c) => c.closed && c.openTime >= from).slice(0, count);
    },
    async minute1(from, to) {
      return loader.candles(symbol, '1m', from, Math.min(to, cutoff));
    },
    async aggTrades(minuteOpen): Promise<CoreAggTrade[] | null> {
      try {
        const trades = await Promise.race([
          loader.aggTrades(symbol, minuteOpen, minuteOpen + 60_000),
          new Promise<never>((_, rej) => setTimeout(() => rej(new Error('aggTrades timeout')), timeout).unref?.()),
        ]);
        return trades.length === 0 ? null : trades.map((t) => ({ aggTradeId: t.id, price: t.price, transactTime: t.time }));
      } catch {
        return null;
      }
    },
  };
}

// ------------------------------------------------------------ ArchiveLoader (LRU)

export interface ArchiveLoaderOptions {
  archive?: ArchiveSource;
  now?: () => UtcMs;
  /** Предельный суммарный вес кэша в свечах (по умолчанию 250k, около 40 МБ). */
  maxWeight?: number;
  concurrency?: number;
  /** Число повторов загрузки файла при временной ошибке источника (по умолчанию 2). */
  retries?: number;
  /** База экспоненциальной паузы между повторами, мс (по умолчанию 300). */
  backoffMs?: number;
  sleep?: (ms: number) => Promise<void>;
}

interface Chunk {
  from: UtcMs;
  to: UtcMs;
}

const monthStart = (t: UtcMs) => {
  const d = new Date(t);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
};
const nextMonth = (t: UtcMs) => {
  const d = new Date(t);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1);
};

/** Разбиение диапазона на кэшируемые куски: 1m и текущий месяц - по суткам, закрытые месяцы - целиком. */
export function planChunks(tf: Timeframe, from: UtcMs, to: UtcMs, now: UtcMs): Chunk[] {
  const out: Chunk[] = [];
  if (to <= from) return out;
  if (tf === '1m') {
    for (let d = floorTo(from, DAY_MS); d < to; d += DAY_MS) out.push({ from: d, to: d + DAY_MS });
    return out;
  }
  const currentMonth = monthStart(now);
  for (let m = monthStart(from); m < to; m = nextMonth(m)) {
    const mEnd = nextMonth(m);
    if (mEnd <= currentMonth) out.push({ from: m, to: mEnd });
    else for (let d = Math.max(m, floorTo(from, DAY_MS)); d < Math.min(mEnd, to); d += DAY_MS) out.push({ from: d, to: d + DAY_MS });
  }
  return out;
}

async function mapLimit<T, R>(items: readonly T[], limit: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  const worker = async () => {
    for (let i = next++; i < items.length; i = next++) out[i] = await fn(items[i]!);
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

/** Загрузчик поверх ArchiveSource: параллельные куски, дедупликация запросов, LRU-кэш ограниченного веса. */
export class ArchiveLoader implements CandleLoader {
  private readonly archive: ArchiveSource;
  private readonly now: () => UtcMs;
  private readonly maxWeight: number;
  private readonly concurrency: number;
  private readonly retries: number;
  private readonly backoffMs: number;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly cache = new Map<string, Candle[]>();
  private readonly inflight = new Map<string, Promise<Candle[]>>();
  private weight = 0;

  constructor(opts: ArchiveLoaderOptions = {}) {
    this.archive = opts.archive ?? new ArchiveSource();
    this.now = opts.now ?? (() => Date.now());
    this.maxWeight = opts.maxWeight ?? 250_000;
    this.concurrency = opts.concurrency ?? 8;
    this.retries = opts.retries ?? 2;
    this.backoffMs = opts.backoffMs ?? 300;
    this.sleep = opts.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)));
  }

  get cacheWeight(): number {
    return this.weight;
  }

  async candles(symbol: string, tf: Timeframe, from: UtcMs, to: UtcMs): Promise<Candle[]> {
    const chunks = planChunks(tf, from, to, this.now());
    const parts = await mapLimit(chunks, this.concurrency, (c) => this.chunk(symbol, tf, c));
    const out: Candle[] = [];
    for (const p of parts) for (const c of p) if (c.openTime >= from && c.openTime < to) out.push(c);
    return out;
  }

  async aggTrades(symbol: string, from: UtcMs, to: UtcMs): Promise<RawAggTrade[]> {
    const t = await this.archive.getAggTrades(symbol, from, to);
    return t.map((x) => ({ id: x.id, price: x.price, time: x.time }));
  }

  private chunk(symbol: string, tf: Timeframe, c: Chunk): Promise<Candle[]> {
    const key = `${symbol}|${tf}|${c.from}|${c.to}`;
    const hit = this.cache.get(key);
    if (hit) {
      this.cache.delete(key);
      this.cache.set(key, hit);
      return Promise.resolve(hit);
    }
    const pending = this.inflight.get(key);
    if (pending) return pending;
    const p = this.fetchWithRetry(symbol, tf, c)
      .then((rows) => {
        this.store(key, rows);
        return rows;
      })
      .finally(() => this.inflight.delete(key));
    this.inflight.set(key, p);
    return p;
  }

  /** Временные сбои источника (сеть/таймаут/5xx) повторяются с backoff; not_found и bad_format - нет. */
  private async fetchWithRetry(symbol: string, tf: Timeframe, c: Chunk): Promise<Candle[]> {
    for (let i = 0; ; i++) {
      try {
        return await this.archive.get(symbol, tf, c.from, c.to);
      } catch (e) {
        if (!(e instanceof ArchiveError && e.code === 'unavailable') || i >= this.retries) throw e;
        await this.sleep(this.backoffMs * 2 ** i);
      }
    }
  }

  private store(key: string, rows: Candle[]): void {
    if (rows.length > this.maxWeight) return;
    this.cache.set(key, rows);
    this.weight += rows.length;
    while (this.weight > this.maxWeight) {
      const oldest = this.cache.keys().next().value as string;
      this.weight -= this.cache.get(oldest)!.length;
      this.cache.delete(oldest);
    }
  }
}
