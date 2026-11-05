// enumerateCounts (ELLIOTT.md §7.1): все допустимые разметки, заканчивающиеся на lastIndex.
import { detectSwings } from '../smc/swings';
import type { Candle } from '../types';
import { EW_ALGO_VERSION } from '../version';
import {
  LABELS,
  correctionRules,
  impulseRules,
  measure,
  normSeries,
  segmentViolation,
  sgOf,
  sideAt,
  validCorrectionTypes,
  vAt,
} from './measure';
import type { CountScan, EwCorrectionType, EwDirection, WaveCount, WavePoint } from './types';

export const EW_MAX_COUNTS = 5000;

export interface EnumerateParams {
  nPoint: number;
  fromIndex: number;
  lastIndex: number;
  maxCounts: number;
}

/** Правила, применимые к префиксу из pos+1 точек (последняя - pos). */
function prefixOk(v: readonly number[]): boolean {
  const pos = v.length - 1;
  if (pos >= 1 && !(pos % 2 === 1 ? v[pos]! > v[pos - 1]! : v[pos - 1]! > v[pos]!)) return false;
  if (pos === 2) return !(v[2]! < v[0]!);
  if (pos === 3) return v[3]! > v[1]!;
  if (pos === 4) return v[4]! > v[1]!;
  if (pos === 5) return impulseRules(v, 1).every((r) => r.ok);
  return true;
}

export function enumerateCounts(candles: readonly Candle[], p: EnumerateParams): CountScan {
  const swings = detectSwings(candles, { left: p.nPoint, right: p.nPoint }).filter((s) => s.index >= p.fromIndex && s.index <= p.lastIndex);
  const byIndex: { high: number[]; low: number[] } = { high: [], low: [] };
  for (const s of swings) byIndex[s.type].push(s.index);
  const counts: WaveCount[] = [];
  let truncated = false;

  for (const dir of ['bull', 'bear'] as EwDirection[]) {
    const sg = sgOf(dir);
    const ns = normSeries(candles, sg);
    const idx: number[] = [];
    const v: number[] = [];
    const mkPoints = (from: number, to: number): WavePoint[] => {
      const out: WavePoint[] = [];
      for (let k = from; k < to; k++) out.push({ index: idx[k]!, time: candles[idx[k]!]!.openTime, price: sg * v[k]!, label: LABELS[k]! });
      return out;
    };
    const emit = (scenario: WaveCount['scenario'], type: EwCorrectionType | null) => {
      const total = idx.length;
      const impulseLen = scenario === 'w3-next' ? 3 : scenario === 'w5-next' ? 5 : 6;
      counts.push({
        direction: dir,
        impulse: mkPoints(0, impulseLen),
        correction: scenario === 'trend-next' ? { type: type!, points: mkPoints(6, 9) } : scenario === 'bc-next' ? { type: 'zigzag', points: mkPoints(6, 7) } : null,
        scenario,
        amplitude: Math.max(...v.slice(0, total)) - Math.min(...v.slice(0, total)),
      });
    };

    const dfs = (pos: number): void => {
      if (truncated) return;
      const side = sideAt(sg, pos);
      const list = byIndex[side];
      const prev = pos === 0 ? -1 : idx[pos - 1]!;
      for (const i of list) {
        if (i <= prev) continue;
        if (truncated) return;
        const val = vAt(ns, pos, i);
        idx.push(i);
        v.push(val);
        let ok = prefixOk(v);
        if (ok && pos >= 1 && segmentViolation(ns, pos - 1, idx[pos - 1]!, i).length > 0) ok = false;
        if (ok) {
          const last = i === p.lastIndex;
          if (last) {
            if (pos === 2) emit('w3-next', null);
            else if (pos === 4) emit('w5-next', null);
            else if (pos === 5) emit('abc-next', null);
            else if (pos === 6) emit('bc-next', null);
            else if (pos === 8) {
              const m = measure(v);
              const t = validCorrectionTypes(m)[0];
              if (t && correctionRules(t, m).every((r) => r.ok)) emit('trend-next', t);
            }
            if (counts.length > p.maxCounts) truncated = true;
          } else if (pos < 8) {
            dfs(pos + 1);
          }
        }
        idx.pop();
        v.pop();
      }
    };
    dfs(0);
  }

  counts.sort((a, b) => b.amplitude - a.amplitude || a.impulse[0]!.time - b.impulse[0]!.time || a.scenario.localeCompare(b.scenario) || a.direction.localeCompare(b.direction));
  if (counts.length > p.maxCounts) counts.length = p.maxCounts;
  const byScenario: Record<string, number> = {};
  for (const c of counts) byScenario[c.scenario] = (byScenario[c.scenario] ?? 0) + 1;
  return { algoVersion: EW_ALGO_VERSION, counts, truncated, byScenario };
}

