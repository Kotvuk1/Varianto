// Типы Elliott Wave Lab (ELLIOTT.md §6-§12). Контракты API: payload next, answer grade, detail.
import type { Anchor, Mark, TaskTimeframe, UtcMs } from '../types';

export type EwDirection = 'bull' | 'bear';
export type EwLabel = '0' | '1' | '2' | '3' | '4' | '5' | 'A' | 'B' | 'C';
export type EwCorrectionType = 'zigzag' | 'flat';

export type EwTaskKind = 'ew-impulse' | 'ew-impulse-correction' | 'ew-scenario';
export type EwPrimaryScenario = 'w3-next' | 'w5-next' | 'abc-next' | 'trend-next';
export type EwScenarioId = EwPrimaryScenario | 'bc-next' | 'correction-extends' | 'impulse-extends';
export type EwShape = 'impulse-3' | 'impulse-5' | 'impulse-6' | 'impulse-6+correction';

export interface WavePoint {
  index: number;
  time: UtcMs;
  price: number;
  label: EwLabel;
}

export interface WaveCount {
  direction: EwDirection;
  /** 3, 5 или 6 точек. */
  impulse: WavePoint[];
  /** type - первый допустимый: zigzag, затем flat. */
  correction: { type: EwCorrectionType; points: WavePoint[] } | null;
  scenario: 'w3-next' | 'w5-next' | 'abc-next' | 'trend-next' | 'bc-next';
  /** max(v) - min(v) по точкам. */
  amplitude: number;
}

export interface CountScan {
  algoVersion: string;
  counts: WaveCount[];
  truncated: boolean;
  byScenario: Record<string, number>;
}

export interface WaveCandidate {
  count: WaveCount;
  size: number;
  guides: number;
  corrRetr: number | null;
  confirmedIndex: number;
}

// ---- payload next (ELLIOTT.md §9.5) ----
export interface ElliottTask {
  kind: EwTaskKind;
  tf: TaskTimeframe;
  window: { fromTime: UtcMs; toTime: UtcMs };
  lastPivot: { time: UtcMs; type: 'high' | 'low'; price: number };
  directionHint: EwDirection | null;
  shapes: EwShape[];
  primaryOptions: EwPrimaryScenario[];
  alternativeOptions: EwScenarioId[];
  alternativeRequired: boolean;
  nPoint: number;
  toleranceCandles: number;
  invalidationTolerance: number;
  limitCandles: number;
  tools: ['ew-impulse', 'ew-zigzag', 'ew-flat', 'hline'];
  hints?: { liveRules: true };
}

// ---- answer grade (ELLIOTT.md §12.3) ----
export interface ElliottAnswer {
  kind: EwTaskKind;
  impulse: Mark;
  correction: Mark | null;
  primary: EwPrimaryScenario;
  alternative: EwScenarioId | null;
  invalidation: number | null;
}

// ---- detail (ELLIOTT.md §12.3) ----
export interface EwPointCheck {
  label: EwLabel;
  userTime: UtcMs;
  time: UtcMs;
  price: number;
  offsetCandles: number;
  extreme: boolean;
  swing: boolean;
}
export interface EwRuleCheck {
  rule: 'w2' | 'w3-beyond-w1' | 'w3-shortest' | 'w4-overlap' | 'zigzag-b' | 'zigzag-c' | 'flat-b' | 'flat-c';
  ok: boolean;
  actual: number;
  limit: number;
}
export type EwGuideId = 'w2-depth' | 'w3-ratio' | 'w4-depth' | 'w5-ratio' | 'alternation' | 'zigzag-b' | 'zigzag-c' | 'flat-b' | 'flat-c';
export interface EwGuideCheck {
  guide: EwGuideId;
  ok: boolean;
  actual: number;
  expected: string;
}
export type EwAltStatus = 'ok' | 'missing' | 'same' | 'not-allowed' | 'unsupported' | 'optional-empty';
export type EwInvalidationStatus = 'ok' | 'tight' | 'wrong' | 'missing';

export interface EwOutcome {
  basis: 'user' | 'reference';
  primary: EwPrimaryScenario;
  alternative: EwScenarioId | null;
  levels: { invalidation: number; confirm: number; altConfirm: number | null };
  kind: 'primary' | 'alternative' | 'invalidated' | 'timeout';
  /** Индекс свечи события в ряду «видимые + будущее» (или T + limit). */
  index: number;
  time: UtcMs;
  /** Только при kind = 'invalidated': время свечи, закрывшейся за уровнем альтернативы. */
  altAfterInvalidation: UtcMs | null;
  extreme: { high: number; low: number };
}

export interface ElliottDetail {
  direction: EwDirection | null;
  points: EwPointCheck[];
  lengths: number[];
  ratios: Record<string, number>;
  extended3: boolean | null;
  rules: EwRuleCheck[];
  guides: EwGuideCheck[];
  correction: { given: EwCorrectionType; validTypes: EwCorrectionType[] } | null;
  scenario: {
    primary: EwPrimaryScenario;
    implied: EwPrimaryScenario | null;
    alternative: EwScenarioId | null;
    altStatus: EwAltStatus;
    secondaryLimit: number | null;
  };
  invalidation: {
    given: number | null;
    ruleLevel: number;
    ruleRef: 'P0' | 'P1' | 'P5' | 'C';
    tolerance: number;
    status: EwInvalidationStatus;
    reason: 'missing' | 'wrong-side' | 'too-wide' | null;
  };
  validCounts: Record<string, number>;
  quality: { score: number; parts: { key: string; score: number; weight: number }[] };
  outcome: EwOutcome;
}

export type { Anchor };
