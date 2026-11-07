// Liquidity sweep (ALGORITHMS §6).
import type { Candle, Swing, Sweep } from '../types';

/**
 * Свеча k снимает живые внешние swing: фитиль за уровнем, close не за ним, затем K свечей close не за уровнем.
 * swings — внешние swing (оба типа). Возвращает подтверждённые sweep и кандидатов у правого края.
 */
export function detectSweeps(
  candles: readonly Candle[],
  swings: readonly Swing[],
  K: number,
): { confirmed: Sweep[]; candidates: Sweep[] } {
  const n = candles.length;
  const confirmed: Sweep[] = [];
  const candidates: Sweep[] = [];
  const dead = new Set<Swing>(); // пробиты закрытием или уже сняты
  const byConfirmed = [...swings].sort((a, b) => a.confirmedIndex - b.confirmedIndex || a.index - b.index);

  for (let k = 0; k < n; k++) {
    const c = candles[k]!;
    const live = byConfirmed.filter((s) => s.confirmedIndex < k && !dead.has(s));
    for (const side of ['high', 'low'] as const) {
      const hit = live.filter((s) =>
        side === 'high'
          ? s.type === 'high' && c.high > s.price && c.close <= s.price
          : s.type === 'low' && c.low < s.price && c.close >= s.price,
      );
      if (hit.length === 0) continue;
      // самый экстремальный уровень, при равенстве — более ранний swing
      let top = hit[0]!;
      for (const s of hit) {
        const better = side === 'high' ? s.price > top.price : s.price < top.price;
        if (better || (s.price === top.price && s.index < top.index)) top = s;
      }
      for (const s of hit) dead.add(s);
      let held = true;
      const last = Math.min(k + K, n - 1);
      for (let j = k + 1; j <= last; j++) {
        const cl = candles[j]!.close;
        if (side === 'high' ? cl > top.price : cl < top.price) {
          held = false;
          break;
        }
      }
      if (!held) continue;
      const sorted = [...hit].sort((a, b) => a.index - b.index);
      const sw: Sweep = {
        side,
        index: k,
        time: c.openTime,
        level: top.price,
        sweptSwings: [top, ...sorted.filter((s) => s !== top)],
        wickExtreme: side === 'high' ? c.high : c.low,
        confirmedIndex: k + K <= n - 1 ? k + K : null,
      };
      (sw.confirmedIndex === null ? candidates : confirmed).push(sw);
    }
    // swing, пробитые закрытием этой свечи, больше не живы
    for (const s of live) {
      if (s.type === 'high' ? c.close > s.price : c.close < s.price) dead.add(s);
    }
  }
  return { confirmed, candidates };
}
