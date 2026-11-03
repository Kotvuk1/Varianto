// Единый слой форматирования (COPY.md): время хранится в UTC, показывается в локальном поясе.

const NBSP = ' ';

/** Русское склонение: [1 попытка, 2–4 попытки, 5+ попыток]. */
export function plural(n: number, forms: readonly [string, string, string]): string {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b > 1 && b < 5) return forms[1];
  if (b === 1) return forms[0];
  return forms[2];
}

/** 64380 -> «64 380» (неразрывный пробел). */
export function formatInt(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
}

/** Цена с заданным числом знаков и пробелом-разделителем тысяч. */
export function formatPrice(price: number, decimals = 2): string {
  const [int = '', frac] = price.toFixed(decimals).split('.');
  const sign = int.startsWith('-') ? '-' : '';
  const body = formatInt(Number(int.replace('-', '')));
  return frac === undefined ? sign + body : `${sign}${body}.${frac}`;
}

/** 0.82 -> «82%» (без пробела). */
export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

/** R со знаком: «+2.0 R», «-1.0 R», «0.0 R». */
export function formatR(r: number): string {
  const sign = r > 0 ? '+' : r < 0 ? '-' : '';
  return `${sign}${Math.abs(r).toFixed(1)}${NBSP}R`;
}

const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

/** «3 ноя» в локальном поясе. */
export function formatDayShort(utcMs: number): string {
  const d = new Date(utcMs);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

/** «14:00», 24 ч, локальный пояс. */
export function formatTime(utcMs: number): string {
  const d = new Date(utcMs);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** 'YYYY-MM-DD' в локальном поясе (для localDay). */
export function localDay(utcMs: number): string {
  const d = new Date(utcMs);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
