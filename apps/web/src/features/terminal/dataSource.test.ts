import { describe, expect, it } from 'vitest';
import { TIMEFRAME_MS } from '@tl/core';
import { archiveAllowed, archiveHref, archivePageSize, archiveWindow, normalizeSymbolInput, offerArchive, resolveSourceMode } from './dataSource';
import { errorCopy } from './strings';

describe('normalizeSymbolInput', () => {
  it('принимает USDⓈ-M тикеры в любом регистре', () => {
    expect(normalizeSymbolInput(' btcusdt ')).toBe('BTCUSDT');
    expect(normalizeSymbolInput('1000PEPEUSDT')).toBe('1000PEPEUSDT');
    expect(normalizeSymbolInput('ETHUSDC')).toBe('ETHUSDC');
  });
  it('отклоняет мусор', () => {
    for (const s of ['', 'BTC', 'BTC-USDT', 'BTCUSD', 'BTCUSDT; DROP', 'X'.repeat(30) + 'USDT'])
      expect(normalizeSymbolInput(s)).toBeNull();
  });
});

describe('режим источника данных', () => {
  it('архив доступен и в production (запасной вариант)', () => {
    expect(archiveAllowed()).toBe(true);
  });
  it('?source=archive включает архив, иначе live', () => {
    expect(resolveSourceMode('archive')).toBe('archive');
    expect(resolveSourceMode(null)).toBe('live');
    expect(resolveSourceMode('other')).toBe('live');
  });
  it('архив предлагается при сбое live (451, сеть, 5xx), но не при неверной паре и не в самом архиве', () => {
    for (const c of [451, 'network', 503, 429, 'bad_response']) expect(offerArchive(c, 'live')).toBe(true);
    expect(offerArchive(400, 'live')).toBe(false);
    expect(offerArchive('archive', 'archive')).toBe(false);
    expect(offerArchive(451, 'archive')).toBe(false);
  });
  it('ссылка на архив сохраняет пару и ТФ', () => {
    expect(archiveHref('ETHUSDT', '4h')).toBe('/terminal?source=archive&symbol=ETHUSDT&tf=4h');
  });
});

describe('archiveWindow', () => {
  const now = Date.UTC(2026, 10, 3, 12, 34, 56);
  it('границы выровнены, to старше 2 суток, шаг ТФ', () => {
    for (const tf of ['15m', '1h', '4h', '1d'] as const) {
      const step = TIMEFRAME_MS[tf];
      const w = archiveWindow(tf, now, 1500);
      expect(w.from % step).toBe(0);
      expect(w.to % step).toBe(0);
      expect(w.to).toBeLessThanOrEqual(now - 2 * 86_400_000);
      expect((w.to - w.from) / step).toBe(1500);
    }
  });
  it('before сдвигает окно в прошлое, не превышая доступный максимум', () => {
    const step = TIMEFRAME_MS['1h'];
    const first = archiveWindow('1h', now, 100);
    const older = archiveWindow('1h', now, 100, first.from);
    expect(older.to).toBe(first.from);
    expect(archiveWindow('1h', now, 100, now).to).toBe(first.to);
    expect(step).toBeGreaterThan(0);
  });
});

describe('archivePageSize', () => {
  it('15m и 1h - полные 1500 свечей, старшие ТФ - около 3 месяцев', () => {
    expect(archivePageSize('15m')).toBe(1500);
    expect(archivePageSize('1h')).toBe(1500);
    expect(archivePageSize('4h')).toBe(552);
    expect(archivePageSize('1d')).toBe(92);
  });
});

describe('errorCopy (COPY.md 5.2)', () => {
  it('451 - сообщение про регион, без подстановки данных', () => {
    expect(errorCopy(451).title).toBe('Binance недоступен из вашей сети');
    expect(errorCopy(451).text).toBe('Binance недоступен из вашего региона/сети (ограничение Binance). Попробуйте другую сеть или VPN.');
  });
  it('разные причины - разные заголовки', () => {
    const titles = new Set([451, 'network', 429, 503, 'archive', 'bad_response', undefined].map((c) => errorCopy(c).title));
    expect(titles.size).toBe(7);
  });
});
