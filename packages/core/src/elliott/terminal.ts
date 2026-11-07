// Проверка разметки Elliott в свободном терминале (решение оркестратора §19): правила §3-§5 без сценария, без будущего и без прогресса.
import { buildFeedback, type Feedback } from '../feedback';
import { candleIndexAt, closedOnly } from '../smc/series';
import { TIMEFRAME_MS } from '../types';
import type { Candle, GradeError, Mark, Timeframe, Verdict } from '../types';
import { checkCount, type EwCheck } from './check';
import { EW_RULE_NAME_RU } from '../feedback/templates.ru';
import type { OkItem } from '../feedback/types';
import { round3 } from './measure';
import type { EwCorrectionType } from './types';

export interface EwMarkCheck {
  markId: string;
  correctionId: string | null;
  check: EwCheck;
  errors: GradeError[];
}

/** Терминал: правила и рекомендации по черновику; текущей точки нет (ELLIOTT.md §19). */
export function checkEwMarks(candles: readonly Candle[], tf: Timeframe, marks: readonly Mark[]): { results: EwMarkCheck[]; feedback: Feedback } {
  const closed = closedOnly(candles);
  const step = TIMEFRAME_MS[tf];
  const results: EwMarkCheck[] = [];
  const allErrors: GradeError[] = [];
  const ok: OkItem[] = [];
  if (tf === '1m') return { results, feedback: buildFeedback({ module: 'elliott', verdict: 'incorrect', score: 0, errors: [], ok: [] }) };
  const impulses = marks.filter((m) => m.kind === 'ew-impulse' && [3, 5, 6].includes(m.anchors.length));
  const corrections = marks.filter((m) => (m.kind === 'ew-zigzag' || m.kind === 'ew-flat') && m.anchors.length === 3);
  const used = new Set<string>();
  for (const m of impulses) {
    if (m.anchors.some((a) => candleIndexAt(closed, a.time, step) < 0)) continue;
    let corr: Mark | undefined;
    if (m.anchors.length === 6) {
      const end = m.anchors[5]!.time;
      corr = corrections.find((c) => !used.has(c.id) && c.anchors[0]!.time >= end && c.anchors.every((a) => candleIndexAt(closed, a.time, step) >= 0));
      if (corr) used.add(corr.id);
    }
    const check = checkCount({
      candles: closed, tf, impulse: m.anchors, impulseId: m.id,
      correction: corr ? { type: (corr.kind === 'ew-zigzag' ? 'zigzag' : 'flat') as EwCorrectionType, anchors: corr.anchors, id: corr.id } : null,
    });
    results.push({ markId: m.id, correctionId: corr?.id ?? null, check, errors: check.errors });
    allErrors.push(...check.errors);
    if (!check.orderBroken) {
      const good = check.points.filter((p) => p.extreme && p.swing).length;
      if (good > 0) ok.push({ code: 'OK_EW_POINTS', params: { count: good, total: check.points.length } });
      if (check.rules.length && check.rules.every((r) => r.ok)) ok.push({ code: 'OK_EW_RULES', params: { rulesText: check.rules.map((r) => EW_RULE_NAME_RU[r.rule]).join('; ') } });
      const g = check.guides.filter((x) => x.ok).length;
      if (g > 0) ok.push({ code: 'OK_EW_GUIDES', params: { count: g, total: check.guides.length } });
      if (check.correction && check.correction.validTypes.includes(check.correction.given)) {
        ok.push({ code: 'OK_EW_CORRECTION', params: { type: check.correction.given, retrB: round3(check.ratios.retrB!), cBeyond: round3(check.ratios.cBeyond!) } });
      }
    }
  }
  const rated = results.length;
  const bad = results.filter((r) => r.errors.some((e) => e.severity === 'major')).length;
  const verdict: Verdict = bad === 0 ? 'correct' : bad < rated ? 'partial' : 'incorrect';
  const score = rated === 0 ? 0 : (rated - bad) / rated;
  const feedback = buildFeedback({ module: 'elliott', verdict, score, errors: allErrors, ok, skillOutcomes: [] });
  return { results, feedback };
}
