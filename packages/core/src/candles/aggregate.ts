import { TIMEFRAME_MS, type Candle, type Timeframe, type UtcMs } from '../index';

const M1 = 60_000; // не из TIMEFRAME_MS: циклический импорт index <-> aggregate

/**
 * Агрегирует 1m свечи в целевой ТФ (ARCHITECTURE §4.1). Чистая функция, без сети.
 * Корзина считается закрытой (closed=true) только если в ней есть все 1m свечи и все они закрыты;
 * иначе closed=false. Пропущенные минуты не выдумываются.
 */
export function aggregate(candles1m: readonly Candle[], targetTf: Timeframe): Candle[] {
  if (targetTf === '1m') return [...candles1m].sort((a, b) => a.openTime - b.openTime);
  const step = TIMEFRAME_MS[targetTf];
  const sorted = [...candles1m].sort((a, b) => a.openTime - b.openTime);
  const out: Candle[] = [];
  let cur: Candle | null = null;
  let count = 0;
  let allClosed = true;
  const flush = () => {
    if (cur) {
      cur.closed = allClosed && count === step / M1;
      out.push(cur);
    }
  };
  for (const m of sorted) {
    const bucket = Math.floor(m.openTime / step) * step;
    if (!cur || cur.openTime !== bucket) {
      flush();
      cur = {
        openTime: bucket,
        closeTime: bucket + step - 1,
        open: m.open,
        high: m.high,
        low: m.low,
        close: m.close,
        volume: m.volume,
        quoteVolume: m.quoteVolume,
        trades: m.trades,
        closed: false,
      };
      count = 1;
      allClosed = m.closed;
      continue;
    }
    cur.high = Math.max(cur.high, m.high);
    cur.low = Math.min(cur.low, m.low);
    cur.close = m.close;
    cur.volume += m.volume;
    cur.quoteVolume += m.quoteVolume;
    cur.trades += m.trades;
    count++;
    allClosed = allClosed && m.closed;
  }
  flush();
  return out;
}

export type SeriesByTf = Partial<Record<Timeframe, readonly Candle[]>>;

/**
 * Срез на момент T (ARCHITECTURE §4.1): свечи с closeTime < T; для старших ТФ добавляется
 * частичная свеча из 1m в [openTime, T) с closed=false. Без 1m частичная свеча не строится.
 */
export function sliceAt(seriesByTf: SeriesByTf, T: UtcMs): Partial<Record<Timeframe, Candle[]>> {
  const out: Partial<Record<Timeframe, Candle[]>> = {};
  const m1 = seriesByTf['1m'];
  for (const tf of Object.keys(seriesByTf) as Timeframe[]) {
    const candles = seriesByTf[tf] ?? [];
    const past = candles.filter((c) => c.closeTime < T);
    if (tf !== '1m' && m1) {
      const step = TIMEFRAME_MS[tf];
      const bucket = Math.floor(T / step) * step;
      if (bucket < T) {
        const inBucket = m1.filter((c) => c.openTime >= bucket && c.closeTime < T);
        const [partial] = aggregate(inBucket, tf);
        if (partial && !past.some((c) => c.openTime === partial.openTime)) {
          past.push({ ...partial, closed: false });
        }
      }
    }
    out[tf] = past;
  }
  return out;
}
