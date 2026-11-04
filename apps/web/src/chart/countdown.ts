// Таймер до закрытия свечи: форматирование, остаток с поправкой на часы устройства, оценка смещения часов.
import type { Timeframe } from '@tl/core';

export interface CandleCountdown {
  /** Конец текущей свечи, мс UTC (openTime + длительность ТФ). */
  closeTime: number;
  /** serverNow - Date.now(), мс. */
  offsetMs: number;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/** mm:ss (до часа) или h:mm:ss (от часа и для 1d). Секунды округляются вверх; ниже нуля - нулевой отсчёт. */
export function formatCountdown(ms: number, tf: Timeframe): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0 || tf === '1d' ? `${h}:${pad2(m)}:${pad2(s)}` : `${pad2(m)}:${pad2(s)}`;
}

/** Остаток до closeTime по скорректированным часам; не меньше 0. */
export function remainingMs(closeTime: number, localNow: number, offsetMs: number): number {
  return Math.max(0, closeTime - (localNow + offsetMs));
}

/** Смещение серверных часов относительно локальных: медиана последних N наблюдений. */
export class ClockOffsetEstimator {
  private samples: number[] = [];
  constructor(private readonly size = 15) {}

  private push(v: number) {
    if (!Number.isFinite(v)) return;
    this.samples.push(v);
    if (this.samples.length > this.size) this.samples.shift();
  }
  /** E - event time из WS-сообщения kline. */
  addEvent(eventTime: number, localNow: number) {
    this.push(eventTime - localNow);
  }
  /** serverTime или заголовок Date ответа REST. */
  addServerTime(serverTime: number, localNow: number) {
    this.push(serverTime - localNow);
  }
  offset(): number {
    const n = this.samples.length;
    if (n === 0) return 0;
    const s = [...this.samples].sort((a, b) => a - b);
    const mid = n >> 1;
    return n % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
  }
}
