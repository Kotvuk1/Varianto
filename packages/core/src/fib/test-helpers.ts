// Помощники тестов Fibonacci. Только для тестов.
import type { Candle } from '../types';

/** Незакрытая копия свечи (формат хвоста live-ряда): копирует реальные OHLC, ставит closed=false. // SYNTHETIC: проверка отбрасывания незакрытой свечи, данные не выдаются за рыночные */
export function UNCLOSED(base: Candle, bump: number): Candle {
  return { ...base, openTime: base.openTime + (base.closeTime - base.openTime + 1), closeTime: base.closeTime + (base.closeTime - base.openTime + 1), high: base.high + bump, closed: false };
}
