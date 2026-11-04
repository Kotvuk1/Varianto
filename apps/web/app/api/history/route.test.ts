import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArchiveError, parseArchiveCsv } from '@tl/market-data';

const getMock = vi.hoisted(() => vi.fn());
vi.mock('@tl/market-data/archive', () => ({
  ArchiveSource: class {
    get = getMock;
  },
}));

import { GET } from './route';

const fx = (rel: string) =>
  readFileSync(resolve(process.cwd(), '../../fixtures', rel), 'utf8'); // cwd = apps/web
const h1 = parseArchiveCsv(fx('klines/BTCUSDT/1h/BTCUSDT-1h-2026-10-20.csv'));

const FROM = Date.UTC(2026, 9, 20);
const TO = FROM + 86_400_000;
const call = (q: Record<string, string>) =>
  GET(new Request(`http://localhost/api/history?${new URLSearchParams(q)}`));
const ok = { symbol: 'BTCUSDT', tf: '1h', from: String(FROM), to: String(TO) };

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(Date.UTC(2026, 10, 3, 3));
  getMock.mockReset();
  getMock.mockResolvedValue(h1);
});
afterEach(() => vi.useRealTimers());

describe('GET /api/history: успех', () => {
  it('200 с серией из архива, без пропусков, immutable', async () => {
    const res = await call(ok);
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=31536000, s-maxage=31536000, immutable');
    const body = await res.json();
    expect(body.series).toMatchObject({ symbol: 'BTCUSDT', tf: '1h', source: 'binance-archive' });
    expect(body.series.candles).toEqual(h1);
    expect(body.gaps).toEqual([]);
    expect(getMock).toHaveBeenCalledWith('BTCUSDT', '1h', FROM, TO);
  });

  it('пропуски возвращаются в gaps, свечи не выдумываются, кэш короткий', async () => {
    getMock.mockResolvedValue(h1.filter((_, i) => i !== 5 && i !== 6));
    const res = await call(ok);
    const body = await res.json();
    expect(body.series.candles).toHaveLength(22);
    expect(body.gaps).toEqual([{ fromTime: h1[5]!.openTime, toTime: h1[7]!.openTime }]);
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=300, s-maxage=300');
  });
});

describe('GET /api/history: валидация (400)', () => {
  const codes = async (q: Record<string, string>) => {
    const res = await call(q);
    expect(res.status).toBe(400);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    const body = await res.json();
    expect(body.error.code).toBe('validation_failed');
    return body.error.details.issues.map((i: { code: string }) => i.code) as string[];
  };

  it('неизвестный символ (только whitelist)', async () => {
    expect(await codes({ ...ok, symbol: 'DOGEUSDT' })).toContain('UNKNOWN_SYMBOL');
  });
  it('неизвестный ТФ', async () => {
    expect(await codes({ ...ok, tf: '5m' })).toContain('UNKNOWN_TIMEFRAME');
  });
  it('отсутствующие и нечисловые параметры', async () => {
    expect(await codes({ symbol: 'BTCUSDT', tf: '1h' })).toContain('INVALID_TYPE');
    expect(await codes({ ...ok, from: 'abc' })).toContain('INVALID_TYPE');
    expect(await codes({ ...ok, from: '-5' })).toContain('INVALID_TYPE');
  });
  it('лишний параметр запрещён (strict)', async () => {
    expect(await codes({ ...ok, extra: '1' })).toContain('INVALID_TYPE');
  });
  it('to <= from', async () => {
    expect(await codes({ ...ok, to: String(FROM) })).toContain('OUT_OF_RANGE');
  });
  it('не на границе ТФ', async () => {
    expect(await codes({ ...ok, from: String(FROM + 1) })).toContain('RANGE_NOT_ALIGNED');
  });
  it('больше 5000 свечей', async () => {
    expect(await codes({ ...ok, tf: '1m', to: String(FROM + 5001 * 60_000) })).toContain('RANGE_TOO_LARGE');
    const res = await call({ ...ok, tf: '1m', to: String(FROM + 5000 * 60_000) });
    expect(res.status).toBe(200);
  });
  it('данные младше 2 суток', async () => {
    const to = Date.UTC(2026, 10, 2, 4); // now = 11-03 03:00, порог 11-01 03:00
    expect(await codes({ ...ok, from: String(to - 3_600_000), to: String(to) })).toContain('RANGE_TOO_RECENT');
    const edge = Date.UTC(2026, 10, 1, 3);
    const res = await call({ ...ok, from: String(edge - 3_600_000), to: String(edge) });
    expect(res.status).toBe(200);
  });
  it('архив не вызывается при ошибке валидации', async () => {
    await call({ ...ok, symbol: 'X' });
    expect(getMock).not.toHaveBeenCalled();
  });
});

describe('GET /api/history: ошибки архива', () => {
  const errBody = async (res: Response) => (await res.json()).error;

  it('not_found -> 404', async () => {
    getMock.mockRejectedValue(new ArchiveError('not_found', 'nope'));
    const res = await call(ok);
    expect(res.status).toBe(404);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    expect((await errBody(res)).code).toBe('not_found');
  });
  it('пустой результат -> 404', async () => {
    getMock.mockResolvedValue([]);
    expect((await call(ok)).status).toBe(404);
  });
  it('unavailable и bad_format -> 502 archive_unavailable', async () => {
    for (const code of ['unavailable', 'bad_format'] as const) {
      getMock.mockRejectedValue(new ArchiveError(code, 'x'));
      const res = await call(ok);
      expect(res.status).toBe(502);
      expect((await errBody(res)).code).toBe('archive_unavailable');
    }
  });
  it('неожиданная ошибка -> 500 без деталей', async () => {
    getMock.mockRejectedValue(new Error('secret internals'));
    const res = await call(ok);
    expect(res.status).toBe(500);
    const e = await errBody(res);
    expect(e.code).toBe('internal_error');
    expect(JSON.stringify(e)).not.toContain('secret');
  });
});

describe('GET /api/history: безопасность', () => {
  it('from раньше 2019-09-01: 400 OUT_OF_RANGE, архив не трогаем', async () => {
    const res = await call({ ...ok, from: '0', to: String(86_400_000) });
    expect(res.status).toBe(400);
    expect(getMock).not.toHaveBeenCalled();
  });
  it('rate limit: 120 запросов проходят, 121-й получает 429 с Retry-After', async () => {
    const hdr = { 'x-real-ip': '9.9.9.9' };
    const go = () => GET(new Request(`http://localhost/api/history?${new URLSearchParams(ok)}`, { headers: hdr }));
    for (let i = 0; i < 120; i++) expect((await go()).status).toBe(200);
    const res = await go();
    expect(res.status).toBe(429);
    expect(Number(res.headers.get('Retry-After'))).toBeGreaterThan(0);
  });
});
