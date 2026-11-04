// Единый формат цен графика, подписей меток и списка: пробел между разрядами, запятая, точность по tickSize.
const TICK_TABLE: Readonly<Record<string, number>> = { BTCUSDT: 0.1, ETHUSDT: 0.01, SOLUSDT: 0.01 };
const DEFAULT_TICK = 0.01;

/** tickSize символа: из exchangeInfo (если передан), иначе таблица для трёх пар, иначе 0.01. */
export function tickSizeFor(symbol: string, fromExchangeInfo?: number): number {
  if (fromExchangeInfo !== undefined && fromExchangeInfo > 0) return fromExchangeInfo;
  return TICK_TABLE[symbol] ?? DEFAULT_TICK;
}

export function decimalsForTick(tick: number): number {
  const s = tick.toString();
  if (s.includes('e-')) return Number(s.split('e-')[1]);
  const dot = s.indexOf('.');
  return dot < 0 ? 0 : s.length - dot - 1;
}

export function makePriceFormatter(tick: number): (price: number) => string {
  const d = decimalsForTick(tick);
  const nf = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: d, maximumFractionDigits: d });
  return (p) => nf.format(p);
}
