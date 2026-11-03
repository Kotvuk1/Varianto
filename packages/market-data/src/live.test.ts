import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Candle } from '@tl/core';
import { LiveFeed, LiveFeedError, type LiveStatus, type WebSocketLike } from './live';
import { parseArchiveCsv } from './normalize';
import { fixtureJson, fixtureText, klinesCsvPath } from './testing/fixtures';

const restH1 = fixtureJson<unknown[][]>('recorded/rest-klines-BTCUSDT-1h-2026-10-20.json');
const restM1 = fixtureJson<unknown[][]>('recorded/rest-klines-BTCUSDT-1m-2026-10-20-first120.json');
const wsEvents = fixtureJson<unknown[]>('recorded/ws-kline-BTCUSDT-1m-2026-10-20.json');
const archiveH1 = parseArchiveCsv(fixtureText(klinesCsvPath('BTCUSDT', '1h', '2026-10-20')));
const archiveM1 = parseArchiveCsv(fixtureText(klinesCsvPath('BTCUSDT', '1m', '2026-10-20')));
const NOW = Date.UTC(2026, 9, 21);

class FakeWs implements WebSocketLike {
  static all: FakeWs[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((e: { data: unknown }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  closed = false;
  constructor(readonly url: string) {
    FakeWs.all.push(this);
  }
  close() {
    this.closed = true;
  }
  open() {
    this.onopen?.();
  }
  send(obj: unknown) {
    this.onmessage?.({ data: typeof obj === 'string' ? obj : JSON.stringify(obj) });
  }
  drop() {
    this.onerror?.();
    this.onclose?.();
  }
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

function setup(fetchImpl?: (url: string) => Promise<Response> | Response) {
  const urls: string[] = [];
  const fetchFn = vi.fn(async (url: string) => {
    urls.push(url);
    return fetchImpl ? fetchImpl(url) : json(restH1);
  });
  const feed = new LiveFeed({ fetch: fetchFn, WebSocket: FakeWs, now: () => NOW });
  return { feed, urls, fetchFn };
}

describe('LiveFeed.fetchKlines', () => {
  it('строит URL и разбирает ответ в Candle[] (эквивалентно архиву)', async () => {
    const { feed, urls } = setup();
    const c = await feed.fetchKlines('BTCUSDT', '1h', { limit: 1500, endTime: 123 });
    expect(urls[0]).toBe('https://fapi.binance.com/fapi/v1/klines?symbol=BTCUSDT&interval=1h&limit=1500&endTime=123');
    expect(c).toEqual(archiveH1);
  });

  it('startTime и limit по умолчанию (500); последняя свеча незакрыта, если closeTime >= now', async () => {
    const { feed, urls } = setup();
    const c = await feed.fetchKlines('BTCUSDT', '1h', { startTime: 5 });
    expect(urls[0]).toContain('limit=500');
    expect(urls[0]).toContain('startTime=5');
    const feed2 = new LiveFeed({
      fetch: async () => json(restH1),
      WebSocket: FakeWs,
      now: () => (restH1.at(-1)![6] as number),
    });
    const c2 = await feed2.fetchKlines('BTCUSDT', '1h');
    expect(c.at(-1)?.closed).toBe(true);
    expect(c2.at(-1)?.closed).toBe(false);
  });

  it('limit вне 1..1500 -> RangeError', async () => {
    const { feed } = setup();
    await expect(feed.fetchKlines('BTCUSDT', '1h', { limit: 1501 })).rejects.toThrowError(RangeError);
    await expect(feed.fetchKlines('BTCUSDT', '1h', { limit: 0 })).rejects.toThrowError(RangeError);
  });

  it('451 -> LiveFeedError code 451 без подстановки данных', async () => {
    const { feed } = setup(() => new Response('Service unavailable from a restricted location', { status: 451 }));
    const err = await feed.fetchKlines('BTCUSDT', '1h').catch((e) => e);
    expect(err).toBeInstanceOf(LiveFeedError);
    expect(err.code).toBe(451);
  });

  it('ошибка Binance с телом {code,msg}', async () => {
    const { feed } = setup(() => json({ code: -1121, msg: 'Invalid symbol.' }, 400));
    const err = await feed.fetchKlines('XXX', '1h').catch((e) => e);
    expect(err.code).toBe(400);
    expect(err.message).toContain('Invalid symbol');
  });

  it('сеть недоступна -> network; кривой ответ -> bad_response', async () => {
    const feed = new LiveFeed({
      fetch: async () => {
        throw new TypeError('Failed to fetch');
      },
      WebSocket: FakeWs,
    });
    await expect(feed.fetchKlines('BTCUSDT', '1h')).rejects.toMatchObject({ code: 'network' });
    const bad = setup(() => json({ not: 'array' }));
    await expect(bad.feed.fetchKlines('BTCUSDT', '1h')).rejects.toMatchObject({ code: 'bad_response' });
    const bad2 = setup(() => new Response('<html>', { status: 200 }));
    await expect(bad2.feed.fetchKlines('BTCUSDT', '1h')).rejects.toMatchObject({ code: 'bad_response' });
    const bad3 = setup(() => json([[1, 2]]));
    await expect(bad3.feed.fetchKlines('BTCUSDT', '1h')).rejects.toMatchObject({ code: 'bad_response' });
  });
});

describe('LiveFeed.subscribe', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    FakeWs.all = [];
  });
  afterEach(() => vi.useRealTimers());

  function run(fetchImpl?: (url: string) => Promise<Response> | Response, since?: number) {
    const s = setup(fetchImpl);
    const candles: Candle[] = [];
    const statuses: LiveStatus[] = [];
    const unsub = s.feed.subscribe('BTCUSDT', '1m', (c) => candles.push(c), {
      onStatus: (st) => statuses.push(st),
      since,
    });
    return { ...s, candles, statuses, unsub, states: () => statuses.map((x) => x.state) };
  }

  it('подключается к одиночному потоку, переходит в live и отдаёт свечи', () => {
    const r = run();
    expect(FakeWs.all[0]?.url).toBe('wss://fstream.binance.com/ws/btcusdt@kline_1m');
    expect(r.states()).toEqual(['connecting']);
    FakeWs.all[0]!.open();
    for (const e of wsEvents) FakeWs.all[0]!.send(e);
    expect(r.states()).toEqual(['connecting', 'live']);
    expect(r.candles).toHaveLength(4);
    expect(r.candles.map((c) => c.closed)).toEqual([true, true, true, false]);
    expect(r.candles.slice(0, 3)).toEqual(archiveM1.slice(0, 3));
  });

  it('игнорирует непарсящиеся и посторонние сообщения', () => {
    const r = run();
    FakeWs.all[0]!.open();
    FakeWs.all[0]!.send('not json');
    FakeWs.all[0]!.send({ e: 'ping' });
    expect(r.candles).toEqual([]);
  });

  it('переподключение с экспоненциальной задержкой 1,2,4... cap 30 с; успешный open сбрасывает счётчик', () => {
    run();
    const delays: number[] = [];
    for (let i = 0; i < 7; i++) {
      const before = FakeWs.all.length;
      FakeWs.all[before - 1]!.drop();
      let waited = 0;
      while (FakeWs.all.length === before) {
        vi.advanceTimersByTime(500);
        waited += 500;
      }
      delays.push(waited);
    }
    expect(delays).toEqual([1000, 2000, 4000, 8000, 16000, 30000, 30000]);
    FakeWs.all.at(-1)!.open();
    FakeWs.all.at(-1)!.drop();
    const n = FakeWs.all.length;
    vi.advanceTimersByTime(999);
    expect(FakeWs.all.length).toBe(n);
    vi.advanceTimersByTime(1);
    expect(FakeWs.all.length).toBe(n + 1);
  });

  it('после переподключения REST-догрузка с последнего openTime', async () => {
    const r = run((url) => json(restM1.slice(0, 10)));
    const ws = FakeWs.all[0]!;
    ws.open();
    ws.send(wsEvents[0]);
    const lastOpen = (wsEvents[0] as { k: { t: number } }).k.t;
    ws.drop();
    expect(r.states().at(-1)).toBe('connecting');
    vi.advanceTimersByTime(1000);
    expect(r.urls).toHaveLength(0);
    FakeWs.all[1]!.open();
    await vi.advanceTimersByTimeAsync(0);
    expect(r.urls).toHaveLength(1);
    expect(r.urls[0]).toContain(`startTime=${lastOpen}`);
    expect(r.urls[0]).toContain('limit=1500');
    expect(r.candles.length).toBe(1 + 10);
    expect(r.states().at(-1)).toBe('live');
  });

  it('ошибка догрузки -> статус error с кодом, следующее WS-сообщение возвращает live', async () => {
    const r = run(() => new Response('', { status: 451 }), restM1[0]![0] as number);
    FakeWs.all[0]!.open();
    await vi.advanceTimersByTimeAsync(0);
    expect(r.statuses.at(-1)).toMatchObject({ state: 'error', code: 451 });
    FakeWs.all[0]!.send(wsEvents[1]);
    expect(r.states().at(-1)).toBe('live');
  });

  it('WS не открылся за 8 с -> polling каждые 3 с, затем WS открылся -> polling остановлен', async () => {
    const r = run(() => json(restM1.slice(0, 3)));
    await vi.advanceTimersByTimeAsync(7999);
    expect(r.states()).toEqual(['connecting']);
    await vi.advanceTimersByTimeAsync(1);
    expect(r.states()).toEqual(['connecting', 'polling']);
    expect(r.urls).toHaveLength(1);
    expect(r.urls[0]).toContain('limit=2');
    await vi.advanceTimersByTimeAsync(3000);
    expect(r.urls).toHaveLength(2);
    expect(r.urls[1]).toContain('startTime='); // дальше - от последнего openTime
    expect(r.candles.length).toBeGreaterThan(0);
    // попытка WS висела; теперь открылась
    FakeWs.all[0]!.open();
    await vi.advanceTimersByTimeAsync(0);
    const n = r.urls.length; // + одна догрузка при open
    expect(r.states().at(-1)).toBe('live');
    await vi.advanceTimersByTimeAsync(9000);
    expect(r.urls.length).toBe(n);
  });

  it('polling: ошибка 451 -> статус error(451), polling продолжается и восстанавливается', async () => {
    let fail = true;
    const r = run(() => (fail ? new Response('', { status: 451 }) : json(restM1.slice(0, 2))));
    await vi.advanceTimersByTimeAsync(8000);
    expect(r.statuses.at(-1)).toMatchObject({ state: 'error', code: 451 });
    fail = false;
    await vi.advanceTimersByTimeAsync(3000);
    expect(r.states().at(-1)).toBe('polling');
    expect(r.candles).toHaveLength(2);
  });

  it('polling: сетевая ошибка -> code network', async () => {
    const r = run(() => {
      throw new TypeError('offline');
    });
    await vi.advanceTimersByTimeAsync(8000);
    expect(r.statuses.at(-1)).toMatchObject({ state: 'error', code: 'network' });
  });

  it('потеря live -> снова 8-секундный таймер до polling', async () => {
    const r = run(() => json(restM1.slice(0, 2)));
    FakeWs.all[0]!.open();
    FakeWs.all[0]!.drop();
    // все переподключения «зависают» (не открываются)
    await vi.advanceTimersByTimeAsync(8000);
    expect(r.states()).toContain('polling');
  });

  it('unsubscribe закрывает сокет, гасит таймеры и события', async () => {
    const r = run();
    const ws = FakeWs.all[0]!;
    ws.open();
    r.unsub();
    expect(ws.closed).toBe(true);
    const count = r.statuses.length;
    ws.send(wsEvents[0]);
    ws.drop();
    await vi.advanceTimersByTimeAsync(60_000);
    expect(FakeWs.all).toHaveLength(1);
    expect(r.statuses).toHaveLength(count);
    expect(r.candles).toEqual([]);
    expect(r.fetchFn).not.toHaveBeenCalled();
  });

  it('unsubscribe во время polling останавливает опрос', async () => {
    const r = run(() => json(restM1.slice(0, 2)));
    await vi.advanceTimersByTimeAsync(8000);
    const n = r.urls.length;
    r.unsub();
    await vi.advanceTimersByTimeAsync(30_000);
    expect(r.urls.length).toBe(n);
  });
});
