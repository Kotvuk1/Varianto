// resolveScenario (ELLIOTT.md §10): проигрывание будущего. Порядок на свече: invalidation (касание) -> основной -> альтернатива (закрытие).
import type { Candle } from '../types';
import { scenarioRule } from './scenarios';
import type { EwOutcome, EwPrimaryScenario, EwScenarioId, WaveCount } from './types';

/** `candles` - полный ряд (видимые + будущее), T - индекс последней видимой свечи. Null - сценарий нельзя построить из разметки. */
export function resolveScenario(
  candles: readonly Candle[],
  T: number,
  count: WaveCount,
  primary: EwPrimaryScenario,
  alternative: EwScenarioId | null,
  limit: number,
  basis: EwOutcome['basis'] = 'reference',
): EwOutcome | null {
  const rule = scenarioRule(count, primary, alternative);
  if (!rule) return null;
  const sg = rule.sg;
  const end = Math.min(T + limit, candles.length - 1);
  let kind: EwOutcome['kind'] | null = null;
  let index = end;
  let altAfter: number | null = null;
  let hi = -Infinity;
  let lo = Infinity;
  const finish = (k: EwOutcome['kind'], at: number): EwOutcome => ({
    basis, primary, alternative,
    levels: { invalidation: rule.invalidation, confirm: rule.confirm, altConfirm: rule.altConfirm },
    kind: k, index: at, time: candles[at]!.openTime, altAfterInvalidation: altAfter,
    extreme: { high: hi, low: lo },
  });
  for (let j = T + 1; j <= end; j++) {
    const c = candles[j]!;
    hi = Math.max(hi, c.high);
    lo = Math.min(lo, c.low);
    const vLow = sg > 0 ? c.low : -c.high;
    const vHigh = sg > 0 ? c.high : -c.low;
    const vClose = sg * c.close;
    if (kind === null) {
      if (rule.invalidatedBy(vLow, vHigh)) {
        kind = 'invalidated';
        index = j;
      } else if (rule.primaryClosed(vClose)) return finish('primary', j);
      else if (rule.altClosed && rule.altClosed(vClose)) return finish('alternative', j);
    }
    if (kind === 'invalidated' && rule.altClosed && rule.altClosed(vClose)) {
      altAfter = c.openTime;
      break;
    }
  }
  if (kind === 'invalidated') {
    // экстремум - до свечи события включительно (дальше - справочно, см. altAfterInvalidation)
    let h = -Infinity;
    let l = Infinity;
    for (let j = T + 1; j <= index; j++) {
      h = Math.max(h, candles[j]!.high);
      l = Math.min(l, candles[j]!.low);
    }
    hi = h;
    lo = l;
    return finish('invalidated', index);
  }
  return finish('timeout', end);
}
