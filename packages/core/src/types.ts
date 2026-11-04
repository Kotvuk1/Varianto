// Общие типы домена @tl/core (ARCHITECTURE §4, API_CONTRACTS §2, ALGORITHMS). Чистый TS: без DOM/Node API.

export type Symbol = 'BTCUSDT' | 'ETHUSDT' | 'SOLUSDT' | (string & {});
export type Timeframe = '1m' | '15m' | '1h' | '4h' | '1d';
/** Всё время — UTC, миллисекунды. */
export type UtcMs = number;

export const TIMEFRAME_MS: Readonly<Record<Timeframe, number>> = {
  '1m': 60_000,
  '15m': 15 * 60_000,
  '1h': 60 * 60_000,
  '4h': 4 * 60 * 60_000,
  '1d': 24 * 60 * 60_000,
};

export interface Candle {
  openTime: UtcMs;
  closeTime: UtcMs;
  open: number;
  high: number;
  low: number;
  close: number;
  /** Объём в базовом активе. */
  volume: number;
  quoteVolume: number;
  trades: number;
  /** false = незакрытая свеча. */
  closed: boolean;
}

export interface CandleSeries {
  symbol: Symbol;
  tf: Timeframe;
  source: 'binance-live' | 'binance-archive';
  candles: Candle[];
}

export interface Anchor {
  time: UtcMs;
  price: number;
}

export type MarkKind =
  | 'swing-high'
  | 'swing-low'
  | 'hh'
  | 'hl'
  | 'lh'
  | 'll'
  | 'bos'
  | 'choch'
  | 'sweep'
  | 'order-block'
  | 'fvg'
  | 'level'
  | 'hline'
  | 'trendline'
  | 'pattern'
  | 'position';

export interface Mark {
  id: string;
  kind: MarkKind;
  /** 1..3 точки по типу. */
  anchors: Anchor[];
  scope: 'internal' | 'external' | null;
  direction: 'bull' | 'bear' | null;
  /** Например patternType, sl/tp. */
  meta?: Record<string, unknown>;
  author: 'user' | 'algo';
}

// ---- Расширения контрактов (API_CONTRACTS §2.2) ----
export type ModuleId = 'market-structure' | 'price-action' | 'challenge';
export type TaskTimeframe = '15m' | '1h' | '4h' | '1d';
export type TaskSymbol = 'BTCUSDT' | 'ETHUSDT' | 'SOLUSDT';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type PatternType = 'engulfing' | 'pin-bar' | 'inside-bar' | 'doji' | 'morning-star' | 'evening-star';
export type SkillId =
  | 'swing'
  | 'structure-labels'
  | 'bos'
  | 'choch'
  | 'internal-external'
  | 'sweep'
  | 'order-block'
  | 'fvg'
  | 'pa-engulfing'
  | 'pa-pin-bar'
  | 'pa-inside-bar'
  | 'pa-doji'
  | 'pa-star'
  | 'pa-level'
  | 'pa-context'
  | 'challenge-entry'
  | 'challenge-risk'
  | 'challenge-wait';
export type Verdict = 'correct' | 'partial' | 'incorrect';

/** Полный список кодов ошибок (API_CONTRACTS §5.3 + новые из ALGORITHMS §17.4). */
export type ErrorCode =
  // Market Structure
  | 'SWING_MISSED'
  | 'SWING_EXTRA'
  | 'SWING_OFF_TOLERANCE'
  | 'SWING_UNCONFIRMED'
  | 'STRUCTURE_LABEL_WRONG'
  | 'STRUCTURE_LABEL_MISSED'
  | 'STRUCTURE_LABEL_EXTRA'
  | 'BOS_WICK_ONLY'
  | 'BOS_MISSING'
  | 'BOS_WRONG_LEVEL'
  | 'BOS_EXTRA'
  | 'BOS_WRONG_DIRECTION'
  | 'BOS_CHOCH_CONFUSED'
  | 'CHOCH_MISSING'
  | 'CHOCH_WRONG_DIRECTION'
  | 'CHOCH_EXTRA'
  | 'INTERNAL_AS_EXTERNAL'
  | 'EXTERNAL_AS_INTERNAL'
  | 'SWEEP_MISSED'
  | 'SWEEP_IS_BREAK'
  | 'SWEEP_EXTRA'
  | 'MARK_WRONG_DIRECTION'
  | 'OB_WRONG_CANDLE'
  | 'OB_NO_DISPLACEMENT'
  | 'OB_WRONG_BOUNDS'
  | 'OB_MISSED'
  | 'OB_EXTRA'
  | 'FVG_NOT_GAP'
  | 'FVG_WRONG_BOUNDS'
  | 'FVG_MISSED'
  | 'FVG_EXTRA'
  | 'QUESTION_WRONG'
  // Price Action
  | 'PATTERN_WRONG_TYPE'
  | 'PATTERN_MISSED'
  | 'PATTERN_EXTRA'
  | 'PATTERN_WRONG_DIRECTION'
  | 'LEVEL_OFF_TOLERANCE'
  | 'LEVEL_NOT_STRONGEST'
  | 'LEVEL_WRONG_TYPE'
  | 'CONTEXT_IGNORED_HTF'
  | 'CONTEXT_MISSED_SWEEP'
  | 'CONTEXT_MISSED_OB'
  | 'CONTEXT_MISSED_LEVEL'
  | 'CONTEXT_PHANTOM_FACTOR'
  | 'CONTEXT_FALSE_POSITIVE'
  | 'CONTEXT_FALSE_NEGATIVE'
  // Challenge
  | 'SL_WRONG_SIDE'
  | 'TP_WRONG_SIDE'
  | 'SL_INSIDE_STRUCTURE'
  | 'SL_TOO_WIDE'
  | 'RR_TOO_LOW'
  | 'TRADE_AGAINST_HTF'
  | 'TRADE_AGAINST_STRUCTURE'
  | 'TRADE_IN_RANGE'
  | 'ENTRY_NO_POI'
  | 'WAIT_MISSED_SETUP'
  | 'REASON_MISMATCH';

export type OkCode =
  | 'OK_SWING'
  | 'OK_LABEL'
  | 'OK_BOS'
  | 'OK_CHOCH'
  | 'OK_SCOPE'
  | 'OK_SWEEP'
  | 'OK_OB'
  | 'OK_FVG'
  | 'OK_PATTERN'
  | 'OK_LEVEL'
  | 'OK_CONTEXT'
  | 'OK_HTF'
  | 'OK_SL_PLACEMENT'
  | 'OK_RR'
  | 'OK_WAIT';

export interface SkillOutcome {
  skill: SkillId;
  correct: number;
  /** >= 1. Включает лишние метки пользователя (для точности навыка). */
  total: number;
  /** Сколько из `total` — лишние метки пользователя без пары в эталоне (D-01: знаменатель вердикта = total - extra). */
  extra?: number;
}

export interface GradeError {
  code: ErrorCode;
  skill: SkillId;
  severity: 'minor' | 'major';
  /** id меток пользователя/эталона, к которым относится ошибка. */
  markIds?: string[];
  params?: Record<string, string | number>;
}

export interface MarkGrade {
  matched: { userMarkId: string; algoMarkId: string; timeOffsetCandles: number; priceOffsetPct: number }[];
  /** Эталонные, которых нет у пользователя. */
  missed: Mark[];
  /** Лишние метки пользователя. */
  extra: Mark[];
  /** Допуск по времени (±2 по умолчанию). */
  toleranceCandles: number;
  /** id меток пользователя, совпавших с допустимыми эталонами или вне окна/оцениваемых понятий (ALGORITHMS §19 п.2). */
  ignored: string[];
}

export interface MarkGradeResult extends MarkGrade {
  errors: GradeError[];
  skillOutcomes: SkillOutcome[];
  score: number;
  verdict: Verdict;
  /** id совпавших без штрафов пар (пользователь -> эталон) — вход для OkCode в buildFeedback. */
  okPairs: { userMarkId: string; algoMarkId: string; skill: SkillId }[];
}

// ---- SMC (ALGORITHMS §2-§8) ----
export type SwingType = 'high' | 'low';
export type SwingLabel = 'HH' | 'HL' | 'LH' | 'LL';
export type Scope = 'external' | 'internal';
export type Trend = 'up' | 'down' | 'none';

export interface Swing {
  index: number;
  time: UtcMs;
  type: SwingType;
  price: number;
  confirmedIndex: number;
  scope: Scope;
  label: SwingLabel | null;
}
export interface SwingParams {
  left: number;
  right: number;
}

export interface StructureParams {
  nExt: number;
  nInt: number | null;
  sweepHoldK: number;
  fvgMinAtr: number;
  obDisplacementAtr: number;
}
export interface StructureEvent {
  kind: 'bos' | 'choch';
  direction: 'bull' | 'bear';
  scope: Scope;
  level: number;
  brokenSwing: { index: number; time: UtcMs; type: SwingType };
  breakIndex: number;
  breakTime: UtcMs;
}
export interface LayerState {
  trend: Trend;
  refHigh: Swing | null;
  refLow: Swing | null;
  lastEvent: StructureEvent | null;
}
export interface Sweep {
  side: 'high' | 'low';
  index: number;
  time: UtcMs;
  level: number;
  sweptSwings: Swing[];
  wickExtreme: number;
  /** null = кандидат (справа не хватает свечей удержания). */
  confirmedIndex: number | null;
}
export interface OrderBlock {
  direction: 'bull' | 'bear';
  index: number;
  time: UtcMs;
  top: number;
  bottom: number;
  event: StructureEvent;
  originIndex: number;
  valid: boolean;
  status: 'fresh' | 'mitigated' | 'invalidated';
  statusIndex: number | null;
}
export interface Fvg {
  direction: 'bull' | 'bear';
  middleIndex: number;
  firstTime: UtcMs;
  middleTime: UtcMs;
  top: number;
  bottom: number;
  size: number;
  status: 'open' | 'partial' | 'filled';
  statusIndex: number | null;
}
export interface StructureResult {
  algoVersion: string;
  params: StructureParams;
  swings: Swing[];
  events: StructureEvent[];
  sweeps: Sweep[];
  /** Кандидаты sweep у правого края (не эталон). */
  sweepCandidates: Sweep[];
  orderBlocks: OrderBlock[];
  fvgs: Fvg[];
  /** Малые FVG: 0 < size < fvgMinAtr * ATR (не эталон). */
  smallFvgs: Fvg[];
  /** Кандидаты swing у правого края (оба слоя). */
  pendingSwings: Swing[];
  state: { external: LayerState; internal: LayerState | null };
  stateAt(index: number): { external: LayerState; internal: LayerState | null };
  gaps: { fromTime: UtcMs; toTime: UtcMs }[];
  /** Индекс первой свечи последнего непрерывного сегмента во входном массиве (индексы результата — во входном массиве). */
  baseIndex: number;
  /** openTime закрытых свечей входного массива по индексу (для расчёта endTime меток). */
  times: UtcMs[];
  /** close закрытых свечей входного массива по индексу. */
  closes: number[];
}

// ---- gradeMarks (ALGORITHMS §12) ----
export interface AlgoMarkSet {
  required: Mark[];
  tolerated: Mark[];
  aux: {
    sweepsCandidates: Sweep[];
    obCandidates: OrderBlock[];
    pending: Swing[];
    smallFvgs: Fvg[];
    /** Живые (ещё не пробитые закрытием) подтверждённые swing на свече k обоих слоёв. */
    refsAt: (k: number) => Swing[];
  };
  /** Параметры структуры (для подстановок {n}); расширение спецификации. */
  params?: StructureParams;
}
export interface GradeContext {
  candles: Candle[];
  window: { fromIndex: number; toIndex: number };
  concepts: SkillId[];
  toleranceCandles: number;
  iouMin: number;
  levelPricePct: number;
  scoped: boolean;
  /** Ограничение эталона по времени ключевой свечи (openTime, мс, включительно): свободная разметка в терминале. */
  range?: { from: number; to: number };
  /** Ограничение эталона типами меток (подмножество, например те, что поставил пользователь). */
  kinds?: readonly MarkKind[];
  /** Шаг цены символа: params ошибок округляются по нему (по умолчанию 2 знака). */
  tickSize?: number;
}
