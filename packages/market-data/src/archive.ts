// ArchiveSource - ТОЛЬКО сервер (data.binance.vision без CORS). Использует node:crypto и fflate.
import { createHash } from 'node:crypto';
import { Unzip, UnzipInflate, UnzipPassThrough, strFromU8, unzipSync } from 'fflate';
import type { Candle, Symbol, Timeframe, UtcMs } from '@tl/core';
import { ArchiveError } from './errors';
import { mergeCandles, parseArchiveCsv } from './normalize';

export const ARCHIVE_BASE_URL = 'https://data.binance.vision/data/futures/um';
export const AGG_TRADES_HEADER =
  'agg_trade_id,price,quantity,first_trade_id,last_trade_id,transact_time,is_buyer_maker';

const DAY_MS = 86_400_000;

export type ArchiveFileSpec =
  | { kind: 'klines'; period: 'monthly' | 'daily'; symbol: Symbol; tf: Timeframe; date: string }
  | { kind: 'aggTrades'; period: 'monthly' | 'daily'; symbol: Symbol; date: string };

/** date: 'YYYY-MM' для monthly, 'YYYY-MM-DD' для daily. */
export function archiveUrl(spec: ArchiveFileSpec, base: string = ARCHIVE_BASE_URL): string {
  if (spec.kind === 'klines') {
    return `${base}/${spec.period}/klines/${spec.symbol}/${spec.tf}/${spec.symbol}-${spec.tf}-${spec.date}.zip`;
  }
  return `${base}/${spec.period}/aggTrades/${spec.symbol}/${spec.symbol}-aggTrades-${spec.date}.zip`;
}

export interface AggTrade {
  id: number;
  price: number;
  quantity: number;
  firstTradeId: number;
  lastTradeId: number;
  /** transact_time, мс UTC. */
  time: UtcMs;
  isBuyerMaker: boolean;
}

export type ArchiveFetch = (url: string, init?: { signal?: AbortSignal }) => Promise<Response>;

export interface ArchiveSourceOptions {
  /** Инъецируемый fetch (в тестах - фикстуры). По умолчанию globalThis.fetch. */
  fetch?: ArchiveFetch;
  baseUrl?: string;
  now?: () => UtcMs;
  /** Сверять SHA-256 zip с `.CHECKSUM` (доп. запрос на файл). По умолчанию false. */
  verifyChecksum?: boolean;
  /** Закрытый месяц, где нужно <= N суток, читается daily-файлами (с откатом на monthly). По умолчанию 3. */
  dailyMaxDays?: number;
  timeoutMs?: number;
}

const pad = (n: number) => String(n).padStart(2, '0');
const monthKey = (t: UtcMs) => {
  const d = new Date(t);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
};
const dayKey = (t: UtcMs) => `${monthKey(t)}-${pad(new Date(t).getUTCDate())}`;
const monthStart = (t: UtcMs) => {
  const d = new Date(t);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
};
const nextMonth = (t: UtcMs) => {
  const d = new Date(t);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1);
};

export class ArchiveSource {
  private readonly fetchFn: ArchiveFetch;
  private readonly base: string;
  private readonly now: () => UtcMs;
  private readonly verify: boolean;
  private readonly dailyMaxDays: number;
  private readonly timeoutMs: number;

  constructor(opts: ArchiveSourceOptions = {}) {
    this.fetchFn = opts.fetch ?? ((url, init) => globalThis.fetch(url, init));
    this.base = opts.baseUrl ?? ARCHIVE_BASE_URL;
    this.now = opts.now ?? (() => Date.now());
    this.verify = opts.verifyChecksum ?? false;
    this.dailyMaxDays = opts.dailyMaxDays ?? 3;
    this.timeoutMs = opts.timeoutMs ?? 60_000;
  }

  /** Свечи [fromMs, toMs) из минимального набора файлов. Пропуски не заполняются. */
  async get(symbol: Symbol, tf: Timeframe, fromMs: UtcMs, toMs: UtcMs): Promise<Candle[]> {
    if (toMs <= fromMs) return [];
    const currentMonthStart = monthStart(this.now());
    let all: Candle[] = [];
    for (let m = monthStart(fromMs); m < toMs; m = nextMonth(m)) {
      const mEnd = nextMonth(m);
      const lo = Math.max(fromMs, m);
      const hi = Math.min(toMs, mEnd);
      const days = Math.ceil((hi - lo) / DAY_MS);
      const closedMonth = mEnd <= currentMonthStart;
      const useDaily = !closedMonth || days <= this.dailyMaxDays;
      let chunk: Candle[] | undefined;
      if (useDaily) {
        try {
          chunk = await this.getDaily(symbol, tf, lo, hi);
        } catch (e) {
          if (!(closedMonth && e instanceof ArchiveError && e.code === 'not_found')) throw e;
        }
      }
      chunk ??= await this.getMonthly(symbol, tf, m);
      all = mergeCandles(all, chunk);
    }
    return all.filter((c) => c.openTime >= fromMs && c.openTime < toMs);
  }

  private async getDaily(symbol: Symbol, tf: Timeframe, lo: UtcMs, hi: UtcMs): Promise<Candle[]> {
    let out: Candle[] = [];
    const first = Math.floor(lo / DAY_MS) * DAY_MS;
    for (let d = first; d < hi; d += DAY_MS) {
      const url = archiveUrl({ kind: 'klines', period: 'daily', symbol, tf, date: dayKey(d) }, this.base);
      out = mergeCandles(out, await this.loadKlines(url));
    }
    return out;
  }

  private getMonthly(symbol: Symbol, tf: Timeframe, m: UtcMs): Promise<Candle[]> {
    const url = archiveUrl({ kind: 'klines', period: 'monthly', symbol, tf, date: monthKey(m) }, this.base);
    return this.loadKlines(url);
  }

  private async loadKlines(url: string): Promise<Candle[]> {
    const zip = await this.download(url);
    if (this.verify) await this.checkChecksum(url, zip);
    return parseArchiveCsv(this.extractCsv(zip, url));
  }

  private extractCsv(zip: Uint8Array, url: string): string {
    try {
      const files = unzipSync(zip, { filter: (f) => f.name.toLowerCase().endsWith('.csv') });
      const first = Object.values(files)[0];
      if (!first) throw new ArchiveError('bad_format', 'No CSV file inside archive', url);
      return strFromU8(first);
    } catch (e) {
      if (e instanceof ArchiveError) throw e;
      throw new ArchiveError('bad_format', `Cannot unzip archive: ${(e as Error).message}`, url);
    }
  }

  private async request(url: string): Promise<Response> {
    let res: Response;
    try {
      res = await this.fetchFn(url, { signal: AbortSignal.timeout(this.timeoutMs) });
    } catch (e) {
      throw new ArchiveError('unavailable', `Archive request failed: ${(e as Error).message}`, url);
    }
    if (res.status === 404) throw new ArchiveError('not_found', 'Archive file not found', url);
    if (!res.ok) throw new ArchiveError('unavailable', `Archive responded ${res.status}`, url);
    return res;
  }

  private async download(url: string): Promise<Uint8Array> {
    const res = await this.request(url);
    try {
      return new Uint8Array(await res.arrayBuffer());
    } catch (e) {
      throw new ArchiveError('unavailable', `Archive download failed: ${(e as Error).message}`, url);
    }
  }

  private async checkChecksum(url: string, zip: Uint8Array): Promise<void> {
    const res = await this.request(`${url}.CHECKSUM`);
    const expected = (await res.text()).trim().split(/\s+/)[0]?.toLowerCase();
    const actual = createHash('sha256').update(zip).digest('hex');
    if (expected !== actual) throw new ArchiveError('bad_format', 'Checksum mismatch', url);
  }

  /** Сделки aggTrades с transact_time в [fromMs, toMs). Потоковая распаковка, остановка после toMs. */
  async getAggTrades(symbol: Symbol, fromMs: UtcMs, toMs: UtcMs): Promise<AggTrade[]> {
    const out: AggTrade[] = [];
    if (toMs <= fromMs) return out;
    for (let d = Math.floor(fromMs / DAY_MS) * DAY_MS; d < toMs; d += DAY_MS) {
      const url = archiveUrl({ kind: 'aggTrades', period: 'daily', symbol, date: dayKey(d) }, this.base);
      await this.streamAggTrades(url, fromMs, toMs, out);
    }
    return out;
  }

  private async streamAggTrades(url: string, fromMs: UtcMs, toMs: UtcMs, out: AggTrade[]): Promise<void> {
    const res = await this.request(url);
    if (!res.body) throw new ArchiveError('bad_format', 'Empty response body', url);
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let carry = '';
    let headerChecked = false;
    let stop = false;
    let failure: ArchiveError | undefined;
    let sawCsv = false;

    const fail = (msg: string) => {
      failure = new ArchiveError('bad_format', msg, url);
      stop = true;
    };
    const handleLine = (raw: string) => {
      const line = raw.replace(/\r$/, '');
      if (line === '') return;
      if (!headerChecked) {
        headerChecked = true;
        if (/^[A-Za-z_]/.test(line)) {
          if (line.trim() !== AGG_TRADES_HEADER) fail(`Unexpected aggTrades header: ${line.slice(0, 120)}`);
          return;
        }
      }
      const f = line.split(',');
      const time = Number(f[5]);
      if (f.length < 7 || !Number.isFinite(time)) return fail(`Invalid aggTrades row: ${line.slice(0, 120)}`);
      if (time >= toMs) {
        stop = true;
        return;
      }
      if (time < fromMs) return;
      out.push({
        id: Number(f[0]),
        price: Number(f[1]),
        quantity: Number(f[2]),
        firstTradeId: Number(f[3]),
        lastTradeId: Number(f[4]),
        time,
        isBuyerMaker: f[6] === 'true',
      });
    };
    const handleText = (text: string, final: boolean) => {
      carry += text;
      const lines = carry.split('\n');
      carry = lines.pop() ?? '';
      for (const l of lines) {
        if (stop) return;
        handleLine(l);
      }
      if (final && !stop && carry !== '') handleLine(carry);
    };

    const unzip = new Unzip((file) => {
      if (!file.name.toLowerCase().endsWith('.csv') || sawCsv) return;
      sawCsv = true;
      file.ondata = (err, chunk, final) => {
        if (stop) return;
        if (err) return fail(`Cannot unzip archive: ${err.message}`);
        handleText(decoder.decode(chunk, { stream: !final }), final);
      };
      file.start();
    });
    unzip.register(UnzipInflate);
    unzip.register(UnzipPassThrough);

    try {
      for (;;) {
        let r: ReadableStreamReadResult<Uint8Array>;
        try {
          r = await reader.read();
        } catch (e) {
          throw new ArchiveError('unavailable', `Archive stream failed: ${(e as Error).message}`, url);
        }
        try {
          if (r.value) unzip.push(r.value, r.done);
          else if (r.done) unzip.push(new Uint8Array(0), true);
        } catch (e) {
          throw new ArchiveError('bad_format', `Cannot unzip archive: ${(e as Error).message}`, url);
        }
        if (failure) throw failure;
        if (stop) break;
        if (r.done) break;
      }
    } finally {
      if (stop) await reader.cancel().catch(() => undefined);
    }
    if (!sawCsv) throw new ArchiveError('bad_format', 'No CSV file inside archive', url);
  }
}
