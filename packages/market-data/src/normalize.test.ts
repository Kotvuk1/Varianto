import { describe, expect, it } from 'vitest';
import { TIMEFRAME_MS, type Candle } from '@tl/core';
import { ArchiveError } from './errors';
import {
  ARCHIVE_KLINE_HEADER,
  findGaps,
  mergeCandles,
  parseArchiveCsv,
  parseRestKline,
  parseWsKline,
} from './normalize';
import { fixtureJson, fixtureText, klinesCsvPath } from './testing/fixtures';

const REST_NOW = Date.UTC(2030, 0, 1);

describe('parseArchiveCsv', () => {
  const csv = fixtureText(klinesCsvPath('BTCUSDT', '1h', '2026-10-20'));

  it('разбирает реальный часовой файл с заголовком', () => {
    const c = parseArchiveCsv(csv, { expectHeader: true });
    expect(c).toHaveLength(24);
    expect(c[0]).toMatchObject({
      openTime: Date.UTC(2026, 9, 20),
      closeTime: Date.UTC(2026, 9, 20, 1) - 1,
      closed: true,
    });
    expect(typeof c[0]?.open).toBe('number');
    expect(c.every((x) => x.closed)).toBe(true);
  });

  it('значения совпадают со строкой CSV', () => {
    const line = csv.split('\n')[1]!.split(',');
    const c = parseArchiveCsv(csv)[0]!;
    expect([c.open, c.high, c.low, c.close, c.volume, c.quoteVolume, c.trades]).toEqual([
      Number(line[1]),
      Number(line[2]),
      Number(line[3]),
      Number(line[4]),
      Number(line[5]),
      Number(line[7]),
      Number(line[8]),
    ]);
  });

  it('старый месяц без заголовка (2020-01) разбирается при auto', () => {
    const old = fixtureText('klines/BTCUSDT/1d/BTCUSDT-1d-2020-01.csv');
    expect(old.startsWith('open_time')).toBe(false);
    const c = parseArchiveCsv(old);
    expect(c).toHaveLength(31);
    expect(c[0]?.openTime).toBe(Date.UTC(2020, 0, 1));
  });

  it('expectHeader=true отвергает файл без заголовка, false - с заголовком', () => {
    const old = fixtureText('klines/BTCUSDT/1d/BTCUSDT-1d-2020-01.csv');
    expect(() => parseArchiveCsv(old, { expectHeader: true })).toThrowError(ArchiveError);
    expect(() => parseArchiveCsv(csv, { expectHeader: false })).toThrowError(/header/i);
  });

  it('смена формата: другой заголовок -> bad_format', () => {
    const bad = csv.replace('open_time,open', 'ts,open');
    try {
      parseArchiveCsv(bad);
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(ArchiveError);
      expect((e as ArchiveError).code).toBe('bad_format');
    }
  });

  it('мусор в строке данных -> bad_format', () => {
    const lines = csv.split('\n');
    lines[2] = 'a,b,c';
    expect(() => parseArchiveCsv(lines.join('\n'))).toThrowError(/line 3/);
    lines[2] = lines[3]!.replace(/^[^,]+/, 'x');
    expect(() => parseArchiveCsv(lines.join('\n'))).toThrowError(ArchiveError);
  });

  it('микросекунды приводятся к мс', () => {
    const row = `${1_792_454_400_000 * 1000},1,2,0.5,1.5,10,${1_792_454_459_999 * 1000},5,3,1,1,0`;
    const [c] = parseArchiveCsv(`${ARCHIVE_KLINE_HEADER}\n${row}\n`);
    expect(c?.openTime).toBe(1_792_454_400_000);
    expect(c?.closeTime).toBe(1_792_454_459_999);
  });

  it('пустой файл и CRLF', () => {
    expect(parseArchiveCsv('')).toEqual([]);
    const crlf = csv.replace(/\n/g, '\r\n');
    expect(parseArchiveCsv(crlf)).toHaveLength(24);
  });
});

describe('parseRestKline', () => {
  const rows = fixtureJson<unknown[][]>('recorded/rest-klines-BTCUSDT-1h-2026-10-20.json');
  const csv = parseArchiveCsv(fixtureText(klinesCsvPath('BTCUSDT', '1h', '2026-10-20')));

  it('REST-массив эквивалентен строке архива', () => {
    expect(rows.map((r) => parseRestKline(r, REST_NOW))).toEqual(csv);
  });

  it('closed определяется по closeTime < now', () => {
    const last = rows.at(-1)!;
    expect(parseRestKline(last, (last[6] as number) + 1).closed).toBe(true);
    expect(parseRestKline(last, last[6] as number).closed).toBe(false);
  });

  it('некорректный массив -> ошибка', () => {
    expect(() => parseRestKline([1, 2], REST_NOW)).toThrowError(/kline/);
    expect(() => parseRestKline(['x', ...rows[0]!.slice(1)], REST_NOW)).toThrowError(/kline/);
  });
});

describe('parseWsKline', () => {
  const events = fixtureJson<{ k: { x: boolean }; s: string }[]>('recorded/ws-kline-BTCUSDT-1m-2026-10-20.json');
  const csv = parseArchiveCsv(fixtureText(klinesCsvPath('BTCUSDT', '1m', '2026-10-20')));

  it('closed = k.x, значения совпадают с архивом', () => {
    const parsed = events.map((e) => parseWsKline(e));
    expect(parsed.map((c) => c.closed)).toEqual([true, true, true, false]);
    expect(parsed.slice(0, 3)).toEqual(csv.slice(0, 3));
    expect({ ...parsed[3]!, closed: true }).toEqual(csv[3]);
  });

  it('поддерживает комбинированный поток {stream, data}', () => {
    expect(parseWsKline({ stream: 'btcusdt@kline_1m', data: events[0] })).toEqual(csv[0]);
  });

  it('не kline-событие -> ошибка', () => {
    expect(() => parseWsKline({ e: 'trade' })).toThrowError(/kline/);
    expect(() => parseWsKline(null)).toThrowError(/kline/);
  });
});

describe('mergeCandles', () => {
  const base = parseArchiveCsv(fixtureText(klinesCsvPath('BTCUSDT', '1h', '2026-10-20')));
  const at = (i: number): Candle => base[i]!;

  it('сортирует по openTime', () => {
    expect(mergeCandles([at(3), at(1)], [at(2), at(0)]).map((c) => c.openTime)).toEqual(
      base.slice(0, 4).map((c) => c.openTime),
    );
  });

  it('закрытая побеждает незакрытую (в любом порядке)', () => {
    const open = { ...at(1), close: at(1).close + 1, closed: false };
    expect(mergeCandles([at(1)], [open])[0]).toEqual(at(1));
    expect(mergeCandles([open], [at(1)])[0]).toEqual(at(1));
  });

  it('при равном статусе побеждает пришедшая позже', () => {
    const a = { ...at(1), close: 1, closed: false };
    const b = { ...at(1), close: 2, closed: false };
    expect(mergeCandles([a], [b])).toEqual([b]);
    const c1 = { ...at(1), close: 5 };
    expect(mergeCandles([at(1)], [c1])).toEqual([c1]);
  });

  it('не мутирует вход и убирает дубли внутри одного массива', () => {
    const input = [at(0), at(0)];
    expect(mergeCandles(input, [])).toHaveLength(1);
    expect(input).toHaveLength(2);
  });
});

describe('findGaps', () => {
  const tf = '1h' as const;
  const step = TIMEFRAME_MS[tf];
  const base = parseArchiveCsv(fixtureText(klinesCsvPath('BTCUSDT', tf, '2026-10-20')));

  it('без пропусков - пусто', () => {
    expect(findGaps(base, tf)).toEqual([]);
    expect(findGaps([], tf)).toEqual([]);
  });

  it('находит интервалы пропусков [fromTime, toTime)', () => {
    const holey = base.filter((_, i) => ![5, 6, 7, 12].includes(i));
    expect(findGaps(holey, tf)).toEqual([
      { fromTime: base[5]!.openTime, toTime: base[8]!.openTime },
      { fromTime: base[12]!.openTime, toTime: base[13]!.openTime },
    ]);
  });

  it('учитывает границы запрошенного диапазона', () => {
    const range = { from: base[0]!.openTime - 2 * step, to: base[23]!.openTime + 3 * step };
    expect(findGaps(base, tf, range)).toEqual([
      { fromTime: range.from, toTime: base[0]!.openTime },
      { fromTime: base[23]!.openTime + step, toTime: range.to },
    ]);
    expect(findGaps([], tf, range)).toEqual([{ fromTime: range.from, toTime: range.to }]);
  });
});
