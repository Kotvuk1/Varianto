// Проверка сеток Fibonacci в свободном терминале (FIBONACCI.md §8): «сетка по реальному импульсу?». Без будущего и без прогресса.
import { buildFeedback, type Feedback } from '../feedback';
import { candleIndexAt, closedOnly } from '../smc/series';
import { TIMEFRAME_MS, type Candle, type GradeError, type Mark, type Timeframe, type Verdict } from '../types';
import { evaluateExtensionPoints, gradeFibGrid } from './grade';
import { findImpulses } from './impulses';
import { FIB_TOLERANCE_CANDLES } from './ref';
import { correctionExtreme } from './reaction';
import type { FibAnchorCheck, FibDetail, FibDirection, Impulse } from './types';

export interface FibMarkCheck {
  markId: string;
  impulse: Impulse | null;
  detail: FibDetail;
  errors: GradeError[];
}

/** Внешняя структура терминала (nExt) и максимальное расстояние до ближайшего импульса, свечей. */
export const FIB_TERMINAL_NEXT = 5;
export const FIB_TERMINAL_MAX_DISTANCE = 10;

const omitSnap = <T extends { snapIndex: number }>(k: T): Omit<T, 'snapIndex'> => {
  const { snapIndex, ...rest } = k;
  void snapIndex;
  return rest;
};
const dirOf = (a: number, b: number): FibDirection | null => (b > a ? 'bull' : b < a ? 'bear' : null);

/** Ближайший импульс того же направления: min |i0 - a| + |i1 - b|, при равенстве - с более поздним B. */
function nearest(cands: Impulse[], dir: FibDirection, i0: number, i1: number): { imp: Impulse; pending: boolean } | null {
  let best: { imp: Impulse; pending: boolean; d: number } | null = null;
  for (const imp of cands) {
    if (imp.direction !== dir) continue;
    const d = Math.abs(i0 - imp.a.index) + Math.abs(i1 - imp.b.index);
    if (!best || d < best.d || (d === best.d && imp.b.index > best.imp.b.index)) best = { imp, pending: false, d };
  }
  return best && best.d <= FIB_TERMINAL_MAX_DISTANCE ? { imp: best.imp, pending: best.pending } : null;
}

const emptyDetail = (user: FibDirection | null, anchors: FibAnchorCheck[] = []): FibDetail => ({
  direction: { user, ref: user ?? 'bull' },
  anchors,
  gridShift: null,
});

export function checkFibMarks(candles: readonly Candle[], tf: Timeframe, marks: readonly Mark[]): { results: FibMarkCheck[]; feedback: Feedback } {
  const closed = closedOnly(candles);
  const step = TIMEFRAME_MS[tf];
  const n = closed.length;
  const scan = findImpulses(closed, { nExt: FIB_TERMINAL_NEXT });
  // pending: B ещё не подтверждён -> confirmedIndex за правым краем
  const pendingImps: Impulse[] = scan.pending.map((p) => ({ ...p, confirmedIndex: p.b.index + FIB_TERMINAL_NEXT }));
  const all = [...scan.impulses, ...pendingImps];
  const pendingSet = new Set(pendingImps);
  const results: FibMarkCheck[] = [];
  const allErrors: GradeError[] = [];
  const allOk: { code: never; params?: Record<string, string | number> }[] = [];
  const snap = { candles: closed, tf: tf as Exclude<Timeframe, '1m'> };
  const tfOk = tf !== '1m';

  for (const m of marks) {
    if (m.kind !== 'fib-retracement' && m.kind !== 'fib-extension') continue;
    const need = m.kind === 'fib-retracement' ? 2 : 3;
    if (!tfOk || m.anchors.length !== need) continue;
    const idx = m.anchors.map((a) => candleIndexAt(closed, a.time, step));
    if (idx.some((i) => i < 0)) continue; // якорь вне ряда: нечего проверять
    const dir = dirOf(m.anchors[0]!.price, m.anchors[1]!.price);
    const match = dir ? nearest(all, dir, idx[0]!, idx[1]!) : null;
    if (!match) {
      const userStart = closed[idx[0]!]!.openTime;
      const userEnd = closed[idx[1]!]!.openTime;
      const errors: GradeError[] = [
        {
          code: 'FIB_NOT_IMPULSE', skill: 'fib-anchor', severity: 'major',
          params: { legText: 'участке, который не является импульсом задания', userStartTime: userStart, userEndTime: userEnd, eventKind: 'BOS', eventTime: userEnd, refStartTime: userStart, refStartPrice: m.anchors[0]!.price, refEndTime: userEnd, refEndPrice: m.anchors[1]!.price },
        },
      ];
      results.push({ markId: m.id, impulse: null, detail: emptyDetail(dir), errors });
      allErrors.push(...errors);
      continue;
    }
    const imp = match.imp;
    const pending = pendingSet.has(imp);
    if (m.kind === 'fib-retracement') {
      const g = gradeFibGrid({ impulse: imp, T: n - 1, nExt: FIB_TERMINAL_NEXT, pending }, snap, { kind: 'fib-grid', mark: m });
      results.push({ markId: m.id, impulse: imp, detail: g.detail, errors: g.errors });
      allErrors.push(...g.errors);
      allOk.push(...(g.ok as never[]));
    } else {
      const iC = idx[2]!;
      const ext = correctionExtreme(closed, imp.direction, imp.b.index, Math.min(iC + FIB_TOLERANCE_CANDLES, n - 1));
      const c = ext ?? { index: imp.b.index, price: imp.b.price };
      const r = evaluateExtensionPoints(imp, { index: c.index, time: closed[c.index]!.openTime, price: c.price }, n - 1, snap, m);
      const errors = r.errors.map((e) => e);
      if (pending && r.checks[1]!.ok) {
        errors.push({ code: 'FIB_IMPULSE_UNCONFIRMED', skill: 'fib-anchor', severity: 'minor', params: { userTime: r.checks[1]!.userTime, n: FIB_TERMINAL_NEXT } });
      }
      results.push({
        markId: m.id,
        impulse: imp,
        detail: { direction: { user: r.userDir, ref: imp.direction }, anchors: r.checks.map((k) => omitSnap(k)), gridShift: null },
        errors,
      });
      allErrors.push(...errors);
      allOk.push(...(r.ok as never[]));
    }
  }

  const rated = results.length;
  const bad = allErrors.filter((e) => e.severity === 'major').length;
  const verdict: Verdict = bad === 0 ? 'correct' : bad < rated ? 'partial' : 'incorrect';
  const score = rated === 0 ? 0 : (rated - Math.min(bad, rated)) / rated;
  const feedback = buildFeedback({ module: 'fibonacci', verdict, score, errors: allErrors, ok: allOk as never, skillOutcomes: [], toleranceCandles: FIB_TOLERANCE_CANDLES });
  return { results, feedback };
}
