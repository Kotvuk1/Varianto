// Ступень 1 «Свинги»: тренд по свингам (swingTrend) и задание sw-trend (CURRICULUM_STAGES.md §2.3).
import { mulberry32, randInt } from '../rng';
import { analyzeStructure } from '../smc/analyze';
import { atr14 } from '../smc/series';
import { detectSwings, labelSwings } from '../smc/swings';
import { drawMsCandidate, MS_MAX_ATTEMPTS, MS_MIN_WARMUP, type MsSelectInput } from '../tasks/market-structure';
import type { Candle, Difficulty, GradeError, Mark, OkCode, SkillOutcome, Swing, SwingLabel, TaskTimeframe, UtcMs, Verdict } from '../types';

export type SwTrend = 'up' | 'down' | 'range';
export const SW_TREND_OPTIONS: readonly SwTrend[] = ['up', 'down', 'range'];
/** Окно вопроса sw-trend, свечей (§2.3). */
export const SW_TREND_WINDOW = 120;
/** ТФ sw-trend по сложности (§2.3). */
export const SW_TREND_TFS: Readonly<Record<Difficulty, readonly TaskTimeframe[]>> = {
  easy: ['1h', '4h'],
  medium: ['15m', '1h', '4h', '1d'],
  hard: ['15m', '1h', '4h', '1d'],
};
/** ТФ sw-mark по сложности (§2.2). */
export const SW_MARK_TFS: Readonly<Record<Difficulty, readonly TaskTimeframe[]>> = {
  easy: ['1h', '4h', '1d'],
  medium: ['15m', '1h', '4h', '1d'],
  hard: ['15m', '1h', '4h', '1d'],
};

export interface SwingRefInfo {
  time: UtcMs;
  price: number;
  label: SwingLabel | null;
  index: number;
}

export interface SwingTrendResult {
  trend: SwTrend;
  lastHigh: SwingRefInfo;
  prevHigh: SwingRefInfo;
  lastLow: SwingRefInfo;
  prevLow: SwingRefInfo;
  /** Тренд машины BOS/CHoCH (none -> range) на том же ряду и N. */
  bosTrend: SwTrend;
}

const ref = (s: Swing, labels: Map<Swing, SwingLabel | null>): SwingRefInfo => ({ time: s.time, price: s.price, label: labels.get(s) ?? null, index: s.index });

/**
 * §2.3: тренд по двум последним внешним swing high и low (метки §4 ALGORITHMS): HH+HL - up, LH+LL - down, иначе range.
 * null - не хватает swing или у последнего максимума/минимума нет метки.
 */
export function swingTrend(candles: readonly Candle[], nExt: number): SwingTrendResult | null {
  const sw = detectSwings(candles, { left: nExt, right: nExt }, 'external');
  const labels = new Map<Swing, SwingLabel | null>();
  labelSwings(sw).forEach((l, i) => labels.set(sw[i]!, l));
  const highs = sw.filter((s) => s.type === 'high');
  const lows = sw.filter((s) => s.type === 'low');
  const h1 = highs[highs.length - 1];
  const l1 = lows[lows.length - 1];
  const h0 = highs[highs.length - 2];
  const l0 = lows[lows.length - 2];
  if (!h1 || !l1 || !h0 || !l0) return null;
  const hl = labels.get(h1);
  const ll = labels.get(l1);
  if (!hl || !ll) return null;
  const trend: SwTrend = hl === 'HH' && ll === 'HL' ? 'up' : hl === 'LH' && ll === 'LL' ? 'down' : 'range';
  const st = analyzeStructure(candles, { nExt, nInt: null, sweepHoldK: 3, fvgMinAtr: 0.5, obDisplacementAtr: 1.2 }).state.external.trend;
  return { trend, lastHigh: ref(h1, labels), prevHigh: ref(h0, labels), lastLow: ref(l1, labels), prevLow: ref(l0, labels), bosTrend: st === 'none' ? 'range' : st };
}

export interface SwTrendSelection {
  T: UtcMs;
  visible: Candle[];
  visibleFrom: number;
  nExt: number;
  result: SwingTrendResult;
  attempts: number;
}

export const swTrendN = (difficulty: Difficulty): number => (difficulty === 'hard' ? 5 : 7);

const inWindow = (r: SwingTrendResult, n: number): boolean =>
  [r.lastHigh, r.prevHigh, r.lastLow, r.prevLow].every((s) => s.index >= n - SW_TREND_WINDOW);

/**
 * Выбор T для sw-trend (§2.3): желаемый ответ равновероятно из up/down/range (по seed, до 200 попыток), затем любой;
 * hard - не менее половины заданий, где тренд по свингам отличается от тренда BOS.
 */
export function selectSwTrendTask(inp: MsSelectInput): SwTrendSelection | null {
  const rng = mulberry32(inp.seed);
  const nExt = swTrendN(inp.difficulty);
  const desired = SW_TREND_OPTIONS[randInt(rng, 3)]!;
  const needDiffer = inp.difficulty === 'hard' && rng() < 0.5;
  const max = inp.maxAttempts ?? MS_MAX_ATTEMPTS;
  const minVisible = SW_TREND_WINDOW + MS_MIN_WARMUP;
  for (const phase of [0, 1]) {
    for (let a = 1; a <= max; a++) {
      const cand = drawMsCandidate(inp, rng, minVisible);
      if (!cand) continue;
      const atr = atr14(cand.visible)[cand.visible.length - 1];
      if (atr === null || atr === undefined || !(atr > 0)) continue;
      const r = swingTrend(cand.visible, nExt);
      if (!r || !inWindow(r, cand.visible.length)) continue;
      if (phase === 0 && (r.trend !== desired || (needDiffer && r.trend === r.bosTrend))) continue;
      return { T: cand.T, visible: cand.visible, visibleFrom: cand.visibleFrom, nExt, result: r, attempts: phase * max + a };
    }
  }
  return null;
}

/** Подсказки easy: алгоритмические swing окна без подписей. */
export function swTrendHints(visible: readonly Candle[], nExt: number): Mark[] {
  const from = visible.length - SW_TREND_WINDOW;
  return detectSwings(visible, { left: nExt, right: nExt }, 'external')
    .filter((s) => s.index >= from)
    .map((s) => ({
      id: `algo:swing:${s.type}:${s.time}`,
      kind: s.type === 'high' ? ('swing-high' as const) : ('swing-low' as const),
      anchors: [{ time: s.time, price: s.price }],
      scope: 'external' as const,
      direction: null,
      author: 'algo' as const,
    }));
}


export const SW_TREND_TEXT_RU: Record<SwTrend, string> = { up: 'восходящий', down: 'нисходящий', range: 'диапазон' };

export interface SwTrendGrade {
  verdict: Verdict;
  score: number;
  errors: GradeError[];
  ok: { code: OkCode; params?: Record<string, string | number> }[];
  skillOutcomes: SkillOutcome[];
  detail: {
    chosen: SwTrend;
    correct: SwTrend;
    lastHigh: SwingRefInfo;
    prevHigh: SwingRefInfo;
    lastLow: SwingRefInfo;
    prevLow: SwingRefInfo;
    bosTrend: SwTrend;
  };
}

/** Оценка sw-trend (§2.3): correct/incorrect, score 1/0, ошибка SWING_TREND_WRONG (major), навык `swing-trend`. */
export function gradeSwTrend(r: SwingTrendResult, chosen: SwTrend): SwTrendGrade {
  const ok = chosen === r.trend;
  const labels = { lastHighLabel: r.lastHigh.label ?? '', lastLowLabel: r.lastLow.label ?? '' };
  return {
    verdict: ok ? 'correct' : 'incorrect',
    score: ok ? 1 : 0,
    errors: ok
      ? []
      : [
          {
            code: 'SWING_TREND_WRONG',
            skill: 'swing-trend',
            severity: 'major',
            params: {
              given: SW_TREND_TEXT_RU[chosen],
              expected: SW_TREND_TEXT_RU[r.trend],
              lastHigh: r.lastHigh.price,
              prevHigh: r.prevHigh.price,
              lastLow: r.lastLow.price,
              prevLow: r.prevLow.price,
              ...labels,
            },
          },
        ],
    ok: ok ? [{ code: 'OK_SWING_TREND', params: labels }] : [],
    skillOutcomes: [{ skill: 'swing-trend', correct: ok ? 1 : 0, total: 1 }],
    detail: { chosen, correct: r.trend, lastHigh: r.lastHigh, prevHigh: r.prevHigh, lastLow: r.lastLow, prevLow: r.prevLow, bosTrend: r.bosTrend },
  };
}
