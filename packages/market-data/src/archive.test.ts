import { createHash } from 'node:crypto';
import { strToU8, zipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { TIMEFRAME_MS } from '@tl/core';
import { ArchiveSource, archiveUrl } from './archive';
import { ArchiveError } from './errors';
import { parseArchiveCsv } from './normalize';
import { fixtureText, klinesCsvPath } from './testing/fixtures';

const BASE = 'https://data.binance.vision/data/futures/um';
const NOW = Date.UTC(2026, 9, 25, 12); // октябрь 2026 - текущий месяц, сентябрь закрыт

function zipOf(name: string, csv: string): Uint8Array {
  return zipSync({ [name]: strToU8(csv) });
}

interface Served {
  [url: string]: Uint8Array | number | string;
}
/** Фейковый fetch: url -> байты zip (200), число (HTTP-статус) или строка 'throw'. */
function makeFetch(served: Served) {
  const calls: string[] = [];
  const fn = async (url: string): Promise<Response> => {
    calls.push(url);
    const v = served[url];
    if (v === undefined) return new Response('nf', { status: 404 });
    if (v === 'throw') throw new TypeError('network down');
    if (typeof v === 'number') return new Response('err', { status: v });
    if (typeof v === 'string') return new Response(v, { status: 200 });
    return new Response(v as unknown as ConstructorParameters<typeof Response>[0], { status: 200 });
  };
  return { fn, calls };
}

const klinesZip = (symbol: string, tf: string, date: string) =>
  zipOf(`${symbol}-${tf}-${date}.csv`, fixtureText(klinesCsvPath(symbol, tf, date)));

describe('archiveUrl', () => {
  it('строит monthly/daily klines и aggTrades URL', () => {
    expect(archiveUrl({ kind: 'klines', period: 'monthly', symbol: 'BTCUSDT', tf: '4h', date: '2026-09' })).toBe(
      `${BASE}/monthly/klines/BTCUSDT/4h/BTCUSDT-4h-2026-09.zip`,
    );
    expect(archiveUrl({ kind: 'klines', period: 'daily', symbol: 'ETHUSDT', tf: '1m', date: '2026-10-20' })).toBe(
      `${BASE}/daily/klines/ETHUSDT/1m/ETHUSDT-1m-2026-10-20.zip`,
    );
    expect(archiveUrl({ kind: 'aggTrades', period: 'daily', symbol: 'BTCUSDT', date: '2026-10-20' })).toBe(
      `${BASE}/daily/aggTrades/BTCUSDT/BTCUSDT-aggTrades-2026-10-20.zip`,
    );
    expect(archiveUrl({ kind: 'aggTrades', period: 'monthly', symbol: 'BTCUSDT', date: '2026-09' }, 'http://x')).toBe(
      'http://x/monthly/aggTrades/BTCUSDT/BTCUSDT-aggTrades-2026-09.zip',
    );
  });
});

describe('ArchiveSource.get (klines)', () => {
  const sep = `${BASE}/monthly/klines/BTCUSDT/4h/BTCUSDT-4h-2026-09.zip`;
  const h1 = (d: string) => `${BASE}/daily/klines/BTCUSDT/1h/BTCUSDT-1h-${d}.zip`;
  const make = (served: Served, extra = {}) => {
    const f = makeFetch(served);
    return { ...f, src: new ArchiveSource({ fetch: f.fn, now: () => NOW, ...extra }) };
  };

  it('закрытый месяц: один monthly-файл, диапазон [from,to) режется точно', async () => {
    const { src, calls } = make({ [sep]: klinesZip('BTCUSDT', '4h', '2026-09') });
    const from = Date.UTC(2026, 8, 10);
    const to = Date.UTC(2026, 8, 20);
    const c = await src.get('BTCUSDT', '4h', from, to);
    expect(calls).toEqual([sep]);
    expect(c).toHaveLength(10 * 6);
    expect(c[0]?.openTime).toBe(from);
    expect(c.at(-1)?.openTime).toBe(to - TIMEFRAME_MS['4h']);
    expect(c.every((x) => x.closed)).toBe(true);
  });

  it('текущий месяц: daily-файлы по дням', async () => {
    const { src, calls } = make({
      [h1('2026-10-20')]: klinesZip('BTCUSDT', '1h', '2026-10-20'),
      [h1('2026-10-21')]: klinesZip('BTCUSDT', '1h', '2026-10-21'),
    });
    const c = await src.get('BTCUSDT', '1h', Date.UTC(2026, 9, 20, 22), Date.UTC(2026, 9, 21, 2));
    expect(calls).toEqual([h1('2026-10-20'), h1('2026-10-21')]);
    expect(c.map((x) => new Date(x.openTime).getUTCHours())).toEqual([22, 23, 0, 1]);
  });

  it('несколько месяцев: monthly для закрытого + daily для текущего, результат отсортирован', async () => {
    const served: Served = {
      [sep]: klinesZip('BTCUSDT', '4h', '2026-09'),
    };
    for (const d of ['01', '02']) {
      const csv = fixtureText(klinesCsvPath('BTCUSDT', '4h', '2026-10-20'));
      served[`${BASE}/daily/klines/BTCUSDT/4h/BTCUSDT-4h-2026-10-${d}.zip`] = zipOf(`x-${d}.csv`, csv);
    }
    const { src } = make(served, { dailyMaxDays: 1 });
    // файлы 10-01/10-02 содержат свечи 10-20, поэтому отфильтруются по диапазону: проверяем только план и сортировку
    const c = await src.get('BTCUSDT', '4h', Date.UTC(2026, 8, 29), Date.UTC(2026, 9, 1, 8));
    expect(c.map((x) => x.openTime)).toEqual([...c.map((x) => x.openTime)].sort((a, b) => a - b));
    expect(c[0]?.openTime).toBe(Date.UTC(2026, 8, 29));
  });

  it('закрытый месяц с малым числом дней: daily, при 404 - откат на monthly', async () => {
    const day = `${BASE}/daily/klines/BTCUSDT/4h/BTCUSDT-4h-2026-09-10.zip`;
    const a = make({ [day]: zipOf('d.csv', fixtureText(klinesCsvPath('BTCUSDT', '4h', '2026-10-20'))) }, {});
    await a.src.get('BTCUSDT', '4h', Date.UTC(2026, 8, 10), Date.UTC(2026, 8, 11));
    expect(a.calls).toEqual([day]);

    const b = make({ [sep]: klinesZip('BTCUSDT', '4h', '2026-09') });
    const c = await b.src.get('BTCUSDT', '4h', Date.UTC(2026, 8, 10), Date.UTC(2026, 8, 11));
    expect(b.calls).toEqual([day, sep]);
    expect(c).toHaveLength(6);
  });

  it('старый месяц без заголовка (2020-01) читается', async () => {
    const url = `${BASE}/monthly/klines/BTCUSDT/1d/BTCUSDT-1d-2020-01.zip`;
    const { src } = make({ [url]: zipOf('x.csv', fixtureText('klines/BTCUSDT/1d/BTCUSDT-1d-2020-01.csv')) });
    const c = await src.get('BTCUSDT', '1d', Date.UTC(2020, 0, 1), Date.UTC(2020, 1, 1));
    expect(c).toHaveLength(31);
  });

  it('404 -> not_found', async () => {
    const { src } = make({});
    await expect(src.get('BTCUSDT', '4h', Date.UTC(2026, 7, 1), Date.UTC(2026, 8, 1))).rejects.toMatchObject({
      code: 'not_found',
    });
  });

  it('5xx, иные 4xx и сетевая ошибка -> unavailable', async () => {
    for (const v of [503, 403, 'throw'] as const) {
      const { src } = make({ [sep]: v });
      await expect(src.get('BTCUSDT', '4h', Date.UTC(2026, 8, 1), Date.UTC(2026, 9, 1))).rejects.toMatchObject({
        code: 'unavailable',
      });
    }
  });

  it('битый zip и zip без csv -> bad_format', async () => {
    for (const bytes of [strToU8('not a zip at all'), zipSync({ 'readme.txt': strToU8('x') })]) {
      const { src } = make({ [sep]: bytes });
      await expect(src.get('BTCUSDT', '4h', Date.UTC(2026, 8, 1), Date.UTC(2026, 9, 1))).rejects.toMatchObject({
        code: 'bad_format',
      });
    }
  });

  it('смена заголовка CSV -> bad_format с понятным сообщением', async () => {
    const csv = fixtureText(klinesCsvPath('BTCUSDT', '4h', '2026-09')).replace('open_time', 'openTime');
    const { src } = make({ [sep]: zipOf('x.csv', csv) });
    const err = await src.get('BTCUSDT', '4h', Date.UTC(2026, 8, 1), Date.UTC(2026, 9, 1)).catch((e) => e);
    expect(err).toBeInstanceOf(ArchiveError);
    expect(err.code).toBe('bad_format');
    expect(err.message).toMatch(/header/i);
  });

  it('проверка контрольной суммы: совпала / не совпала / нет .CHECKSUM', async () => {
    const zip = klinesZip('BTCUSDT', '4h', '2026-09');
    const sha = createHash('sha256').update(zip).digest('hex');
    const args = ['BTCUSDT', '4h', Date.UTC(2026, 8, 1), Date.UTC(2026, 9, 1)] as const;
    const ok = make({ [sep]: zip, [`${sep}.CHECKSUM`]: `${sha}  x.zip\n` }, { verifyChecksum: true });
    expect(await ok.src.get(...args)).toHaveLength(180);
    const bad = make({ [sep]: zip, [`${sep}.CHECKSUM`]: `${'0'.repeat(64)}  x.zip\n` }, { verifyChecksum: true });
    await expect(bad.src.get(...args)).rejects.toMatchObject({ code: 'bad_format' });
    const none = make({ [sep]: zip }, { verifyChecksum: true });
    await expect(none.src.get(...args)).rejects.toMatchObject({ code: 'not_found' });
  });

  it('пустой диапазон -> []', async () => {
    const { src, calls } = make({});
    expect(await src.get('BTCUSDT', '4h', 100, 100)).toEqual([]);
    expect(calls).toEqual([]);
  });
});

describe('ArchiveSource.getAggTrades (потоковая распаковка)', () => {
  const csv = fixtureText('aggTrades/BTCUSDT-aggTrades-2026-10-20.csv');
  const rows = csv.trim().split('\n').slice(1).map((l) => l.split(','));
  const zip = zipOf('BTCUSDT-aggTrades-2026-10-20.csv', csv);

  /** Ответ с телом, отдаваемым кусками; считает, сколько кусков вычитано, и факт cancel. */
  function chunked(bytes: Uint8Array, size: number) {
    const state = { pulled: 0, cancelled: false, total: Math.ceil(bytes.length / size) };
    const body = new ReadableStream<Uint8Array>({
      pull(ctrl) {
        const start = state.pulled * size;
        if (start >= bytes.length) return ctrl.close();
        ctrl.enqueue(bytes.slice(start, start + size));
        state.pulled++;
      },
      cancel() {
        state.cancelled = true;
      },
    });
    return { state, res: new Response(body, { status: 200 }) };
  }

  it('читает сделки [from,to) и останавливается после нужной минуты', async () => {
    const t0 = Number(rows[0]![5]);
    const from = t0;
    const to = Number(rows[500]![5]) + 1; // первые ~500 строк
    const { state, res } = chunked(zip, 512);
    const src = new ArchiveSource({ fetch: async () => res, now: () => NOW });
    const trades = await src.getAggTrades('BTCUSDT', from, to);
    const expected = rows.filter((r) => Number(r[5]) >= from && Number(r[5]) < to);
    expect(trades).toHaveLength(expected.length);
    expect(trades[0]).toEqual({
      id: Number(rows[0]![0]),
      price: Number(rows[0]![1]),
      quantity: Number(rows[0]![2]),
      firstTradeId: Number(rows[0]![3]),
      lastTradeId: Number(rows[0]![4]),
      time: Number(rows[0]![5]),
      isBuyerMaker: rows[0]![6] === 'true',
    });
    expect(state.cancelled).toBe(true);
    expect(state.pulled).toBeLessThan(state.total);
  });

  it('пропускает сделки до from', async () => {
    const from = Number(rows[1000]![5]);
    const to = Number(rows[1010]![5]) + 1;
    const src = new ArchiveSource({ fetch: async () => chunked(zip, 4096).res, now: () => NOW });
    const trades = await src.getAggTrades('BTCUSDT', from, to);
    expect(trades.length).toBeGreaterThan(0);
    expect(trades.every((t) => t.time >= from && t.time < to)).toBe(true);
  });

  it('неверный заголовок -> bad_format; 404 -> not_found; битый zip -> bad_format', async () => {
    const t = Number(rows[0]![5]);
    const badCsv = csv.replace('agg_trade_id', 'id');
    const mk = (f: () => Promise<Response>) => new ArchiveSource({ fetch: f, now: () => NOW });
    await expect(
      mk(async () => new Response(zipOf('x.csv', badCsv))).getAggTrades('BTCUSDT', t, t + 1000),
    ).rejects.toMatchObject({ code: 'bad_format' });
    await expect(mk(async () => new Response('', { status: 404 })).getAggTrades('BTCUSDT', t, t + 1)).rejects.toMatchObject({
      code: 'not_found',
    });
    await expect(
      mk(async () => new Response(strToU8('garbage garbage garbage'))).getAggTrades('BTCUSDT', t, t + 1),
    ).rejects.toMatchObject({ code: 'bad_format' });
    await expect(
      mk(async () => {
        throw new Error('boom');
      }).getAggTrades('BTCUSDT', t, t + 1),
    ).rejects.toMatchObject({ code: 'unavailable' });
  });

  it('диапазон через несколько суток читает несколько daily-файлов', async () => {
    const calls: string[] = [];
    const src = new ArchiveSource({
      fetch: async (u: string) => {
        calls.push(u);
        return new Response(zip);
      },
      now: () => NOW,
    });
    const day = Date.UTC(2026, 9, 20);
    const trades = await src.getAggTrades('BTCUSDT', day + 86_400_000 - 1000, day + 86_400_000 + 1000);
    expect(calls).toHaveLength(2);
    expect(trades.every((t) => t.time >= day + 86_400_000 - 1000)).toBe(true);
  });

  it('tail без завершающего перевода строки обрабатывается', async () => {
    const lines = csv.split('\n');
    const short = lines.slice(0, 5).join('\n'); // без финального \n
    const src = new ArchiveSource({ fetch: async () => new Response(zipOf('x.csv', short)), now: () => NOW });
    const t = Number(rows[0]![5]);
    expect(await src.getAggTrades("BTCUSDT", t, t + 3_600_000)).toHaveLength(4);
  });
});

describe('parseArchiveCsv integration', () => {
  it('фикстуры 4h за сентябрь: 180 свечей без пропусков', () => {
    expect(parseArchiveCsv(fixtureText(klinesCsvPath('BTCUSDT', '4h', '2026-09')))).toHaveLength(180);
  });
});
