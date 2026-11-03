// Уровни поддержки/сопротивления и задание «Проведи уровень» (ALGORITHMS §10).
import { atr14, closedOnly } from '../smc/series';
import { detectSwings } from '../smc/swings';
import type { Anchor, Candle, Difficulty, GradeError, Mark, OkCode, SkillOutcome, Swing, UtcMs, Verdict } from '../types';

export interface LevelParams {
  n: number;
  lookback: number;
  minTouches: number;
}
export const DEFAULT_LEVEL_PARAMS: LevelParams = { n: 3, lookback: 300, minTouches: 2 };

/** Допуск цены уровня, % (FR-PA-03, для всех ТФ и сложностей). */
export const LEVEL_TOLERANCE_PCT = 0.3;

export interface Level {
  center: number;
  low: number;
  high: number;
  touches: number;
  swings: Swing[];
  lastTouchIndex: number;
  type: 'support' | 'resistance' | 'inside';
}

export function findLevels(input: readonly Candle[], p: LevelParams = DEFAULT_LEVEL_PARAMS): { levels: Level[]; width: number } {
  const candles = closedOnly(input);
  const n = candles.length;
  if (n === 0) return { levels: [], width: 0 };
  const swings = detectSwings(candles, { left: p.n, right: p.n }).filter((s) => s.index >= n - p.lookback);
  const P = candles[n - 1]!.close;
  const A = atr14(candles)[n - 1] ?? 0; // нет ATR (< 15 свечей) -> ширина по 0.2% цены
  const W = Math.min(Math.max(0.5 * A, 0.002 * P), 0.01 * P);

  const sorted = [...swings].sort((a, b) => a.price - b.price || a.index - b.index);
  const clusters: Swing[][] = [];
  for (const s of sorted) {
    const cur = clusters[clusters.length - 1];
    if (cur && s.price - cur[0]!.price <= W) cur.push(s);
    else clusters.push([s]);
  }
  const levels: Level[] = [];
  for (const cl of clusters) {
    if (cl.length < p.minTouches) continue;
    let sum = 0;
    for (const s of cl) sum += s.price;
    const low = cl[0]!.price; // кластер отсортирован по цене
    const high = cl[cl.length - 1]!.price;
    levels.push({
      center: sum / cl.length,
      low,
      high,
      touches: cl.length,
      swings: cl,
      lastTouchIndex: Math.max(...cl.map((s) => s.index)),
      type: high < P ? 'support' : low > P ? 'resistance' : 'inside',
    });
  }
  levels.sort(
    (a, b) =>
      b.touches - a.touches || b.lastTouchIndex - a.lastTouchIndex || Math.abs(a.center - P) - Math.abs(b.center - P),
  );
  return { levels, width: W };
}

/** Попадание цены в зону уровня с допуском pct (%): [low*(1-t), high*(1+t)] или |u-center|/center <= t. */
export function inLevelZone(u: number, l: Level, pct: number = LEVEL_TOLERANCE_PCT): boolean {
  const t = pct / 100;
  return (l.low * (1 - t) <= u && u <= l.high * (1 + t)) || Math.abs(u - l.center) / l.center <= t;
}

export interface LevelReference {
  ref: Level;
  /** Второй кандидат того же типа (для проверки однозначности) или null. */
  second: Level | null;
  P: number;
  atr: number;
}

/**
 * Эталон «Проведи уровень» (10.2): кандидаты нужного типа в пределах 5 ATR от цены, первый по ранжированию;
 * null, если эталон неоднозначен (touches не строго больше второго) или касаний мало
 * (>= 3 на medium/hard, >= 2 на easy).
 */
export function pickLevelReference(
  input: readonly Candle[],
  levelType: 'support' | 'resistance',
  difficulty: Difficulty,
): LevelReference | null {
  const candles = closedOnly(input);
  const n = candles.length;
  if (n === 0) return null;
  const A = atr14(candles)[n - 1];
  if (A === null || A === undefined) return null;
  const P = candles[n - 1]!.close;
  const { levels } = findLevels(candles);
  const cands = levels.filter((l) => l.type === levelType && Math.abs(l.center - P) <= 5 * A);
  const ref = cands[0];
  if (!ref) return null;
  const second = cands[1] ?? null;
  const minTouches = difficulty === 'easy' ? 2 : 3;
  if (ref.touches < minTouches || (second && ref.touches <= second.touches)) return null;
  return { ref, second, P, atr: A };
}

export interface LevelGrade {
  verdict: Verdict;
  score: number;
  errors: GradeError[];
  skillOutcomes: SkillOutcome[];
  ok: { code: OkCode; params?: Record<string, string | number>; markIds?: string[] }[];
  detail: { kind: 'pa-level'; userPrice: number; referencePrice: number; deviationPct: number; tolerancePct: number };
  reference: Level;
}

/** Оценка ответа «Проведи уровень» (10.2). score: correct 1, partial 0.5, incorrect 0. */
export function gradeLevel(
  candles: readonly Candle[],
  levelType: 'support' | 'resistance',
  userPrice: number,
  difficulty: Difficulty,
): LevelGrade {
  const r = pickLevelReference(candles, levelType, difficulty);
  if (!r) throw new Error('NO_LEVEL_REFERENCE');
  const { ref } = r;
  const all = findLevels(candles).levels;
  const dev = (Math.abs(userPrice - ref.center) / ref.center) * 100;
  const detail = { kind: 'pa-level' as const, userPrice, referencePrice: ref.center, deviationPct: dev, tolerancePct: LEVEL_TOLERANCE_PCT };
  const outcome = (correct: number): SkillOutcome[] => [{ skill: 'pa-level', correct, total: 1 }];
  const P = r.P;

  if (inLevelZone(userPrice, ref)) {
    return {
      verdict: 'correct',
      score: 1,
      errors: [],
      skillOutcomes: outcome(1),
      ok: [{ code: 'OK_LEVEL', params: { tolPct: LEVEL_TOLERANCE_PCT, devPct: dev } }],
      detail,
      reference: ref,
    };
  }
  const hits = all.filter((l) => l !== ref && l.touches >= 2 && inLevelZone(userPrice, l));
  const sameType = hits.find((l) => l.type === levelType);
  const err = (code: GradeError['code'], params: Record<string, string | number>): GradeError => ({
    code,
    skill: 'pa-level',
    severity: 'minor',
    params,
  });
  if (sameType) {
    return {
      verdict: 'partial',
      score: 0.5,
      errors: [err('LEVEL_NOT_STRONGEST', { user: userPrice, ref: ref.center, touches: ref.touches })],
      skillOutcomes: outcome(0),
      ok: [],
      detail,
      reference: ref,
    };
  }
  const other = hits[0];
  if (other) {
    return {
      verdict: 'incorrect',
      score: 0,
      errors: [
        err('LEVEL_WRONG_TYPE', { user: userPrice, given: other.type, expected: levelType, close: P }),
      ],
      skillOutcomes: outcome(0),
      ok: [],
      detail,
      reference: ref,
    };
  }
  return {
    verdict: 'incorrect',
    score: 0,
    errors: [
      err('LEVEL_OFF_TOLERANCE', {
        user: userPrice,
        ref: ref.center,
        devPct: dev,
        tolPct: LEVEL_TOLERANCE_PCT,
        touches: ref.touches,
        low: ref.low,
        high: ref.high,
      }),
    ],
    skillOutcomes: outcome(0),
    ok: [],
    detail,
    reference: ref,
  };
}

/** Метка-эталон уровня (ALGORITHMS §3.4). */
export function levelToMark(l: Level, candles: readonly Candle[], id?: string): Mark {
  const last = candles[l.lastTouchIndex]!;
  const anchor: Anchor = { time: last.openTime as UtcMs, price: l.center };
  return {
    id: id ?? `algo:level:-:-:${last.openTime}`,
    kind: 'level',
    anchors: [anchor],
    scope: null,
    direction: null,
    meta: { low: l.low, high: l.high, touches: l.touches, type: l.type },
    author: 'algo',
  };
}
