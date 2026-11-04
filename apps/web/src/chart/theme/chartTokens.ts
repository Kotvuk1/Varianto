// Токены графика из CSS-переменных (docs/design/tokens.css). Значения читаются через getComputedStyle,
// поэтому тема (data-theme) и режим свечей (data-candles) подхватываются без пересборки.

export interface ChartTokens {
  bg: string;
  grid: string;
  axisText: string;
  crosshair: string;
  lastPriceBg: string;
  lastPriceText: string;
  text1: string;
  candleBull: string;
  candleBullFill: string;
  candleBear: string;
  candleBearFill: string;
  wickBull: string;
  wickBear: string;
  volumeBull: string;
  volumeBear: string;
  markUser: string;
  markUserOn: string;
  markAlgo: string;
  markAlgoOn: string;
  zoneFillUser: string;
  zoneFillAlgo: string;
  fontSans: string;
  fontMono: string;
}

/** Тёмная тема по умолчанию (копия значений tokens.css) - на случай, если токены не подключены. */
const FALLBACK: Record<string, string> = {
  '--bg': '#0e1116',
  '--surface-1': '#151a21',
  '--text-1': '#e6eaf0',
  '--chart-grid': '#1a2029',
  '--chart-axis-text': '#8793a1',
  '--chart-crosshair': '#6b7789',
  '--chart-last-price-bg': '#e6eaf0',
  '--chart-last-price-text': '#0e1116',
  '--candle-bull': '#3a86ff',
  '--candle-bull-fill': '#3a86ff',
  '--candle-bear': '#ffb45e',
  '--candle-bear-fill': '#ffb45e',
  '--candle-wick-bull': '#3a86ff',
  '--candle-wick-bear': '#ffb45e',
  '--volume-bull': 'rgb(58 134 255 / 0.35)',
  '--volume-bear': 'rgb(255 180 94 / 0.35)',
  '--mark-user': '#e6eaf0',
  '--mark-user-on': '#0e1116',
  '--mark-algo': '#f2509a',
  '--mark-algo-on': '#f2509a',
  '--mark-zone-fill-user': 'rgb(230 234 240 / 0.12)',
  '--mark-zone-fill-algo': 'rgb(242 80 154 / 0.14)',
  '--ff-sans': 'system-ui, sans-serif',
  '--ff-mono': 'ui-monospace, monospace',
};

let probe: CanvasRenderingContext2D | null | undefined;

/**
 * Приводит любой CSS-цвет (в т.ч. `rgb(58 134 255 / 0.35)`, `var()`-результат, `transparent`) к виду,
 * который понимает парсер цветов LWC (#rrggbb или rgba(r, g, b, a)).
 */
export function normalizeColor(value: string): string {
  if (probe === undefined) {
    try {
      probe = document.createElement('canvas').getContext('2d');
    } catch {
      probe = null;
    }
  }
  if (!probe) return value;
  probe.fillStyle = '#000';
  probe.fillStyle = value;
  return String(probe.fillStyle);
}

export function readChartTokens(root: HTMLElement = document.documentElement): ChartTokens {
  const cs = getComputedStyle(root);
  const v = (name: string): string => cs.getPropertyValue(name).trim() || FALLBACK[name] || '#888';
  const c = (name: string) => normalizeColor(v(name));
  const light = root.getAttribute('data-theme') === 'light';
  return {
    bg: c(light ? '--surface-1' : '--bg'),
    grid: c('--chart-grid'),
    axisText: c('--chart-axis-text'),
    crosshair: c('--chart-crosshair'),
    lastPriceBg: c('--chart-last-price-bg'),
    lastPriceText: c('--chart-last-price-text'),
    text1: c('--text-1'),
    candleBull: c('--candle-bull'),
    candleBullFill: c('--candle-bull-fill'),
    candleBear: c('--candle-bear'),
    candleBearFill: c('--candle-bear-fill'),
    wickBull: c('--candle-wick-bull'),
    wickBear: c('--candle-wick-bear'),
    // светлая тема: объём при альфе 0.3 почти не виден (F-19) - усиливаем в 2.4 раза (поверх VOLUME_ALPHA 0.7 итог около 0.5)
    volumeBull: light ? withAlpha(c('--volume-bull'), 2.4) : c('--volume-bull'),
    volumeBear: light ? withAlpha(c('--volume-bear'), 2.4) : c('--volume-bear'),
    markUser: c('--mark-user'),
    markUserOn: c('--mark-user-on'),
    markAlgo: c('--mark-algo'),
    markAlgoOn: c('--mark-algo-on'),
    zoneFillUser: c('--mark-zone-fill-user'),
    zoneFillAlgo: c('--mark-zone-fill-algo'),
    fontSans: v('--ff-sans'),
    fontMono: v('--ff-mono'),
  };
}

/** Умножает альфу нормализованного цвета на factor (для «незакрытой» свечи). Полностью прозрачный остаётся прозрачным. */
export function withAlpha(color: string, factor: number): string {
  const hex = /^#([0-9a-f]{6})$/i.exec(color);
  if (hex) {
    const n = parseInt(hex[1]!, 16);
    return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${factor})`;
  }
  const r = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/.exec(color);
  if (r) {
    const a = r[4] === undefined ? 1 : Number(r[4]);
    return `rgba(${r[1]}, ${r[2]}, ${r[3]}, ${Math.round(a * factor * 1000) / 1000})`;
  }
  return color;
}
