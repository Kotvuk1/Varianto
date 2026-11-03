// Генерация заданий Market Structure (ALGORITHMS §13.1-§13.3): «Разметка» и «Вопрос». Чистые функции, случайность — только из seed.
import { mulberry32, randInt } from '../rng';
import { analyzeStructure } from '../smc/analyze';
import { buildAlgoMarkSet } from '../smc/marks';
import { candleIndexAt, gaps } from '../smc/series';
import {
  TIMEFRAME_MS,
  type Anchor,
  type Candle,
  type Difficulty,
  type GradeError,
  type MarkKind,
  type SkillId,
  type SkillOutcome,
  type StructureParams,
  type StructureResult,
  type TaskTimeframe,
  type UtcMs,
  type Verdict,
} from '../types';

const GRID_15M = TIMEFRAME_MS['15m'];

/** Глубина видимой истории, свечей (ALGORITHMS §13.1). */
export const MS_DEPTH: Readonly<Record<TaskTimeframe, number>> = { '15m': 500, '1h': 500, '4h': 500, '1d': 365 };
/** Минимум закрытых свечей до окна оценки (прогрев машины состояний). */
export const MS_MIN_WARMUP = 300;
export const MS_MAX_ATTEMPTS = 200;

/** Параметры структуры по сложности (§1.6). */
export function msParamsFor(difficulty: Difficulty): StructureParams {
  const nExt = difficulty === 'easy' ? 7 : 5;
  const nInt = difficulty === 'easy' ? null : difficulty === 'medium' ? 3 : 2;
  return { nExt, nInt, sweepHoldK: 3, fvgMinAtr: 0.5, obDisplacementAtr: 1.2 };
}

/** Окно оценки «Разметки»: границы, свечей (§13.2, v1.1). Фактическое окно подбирается в [MIN, max(difficulty)]. */
export const MS_WINDOW_MIN = 40;
export const MS_WINDOW_MAX = 80;
/** Допустимое число обязательных эталонных меток в окне (§13.2, v1.1). */
export const MS_REQUIRED_MIN = 4;
export const MS_REQUIRED_MAX = 12;
const MS_WINDOW_STEP = 4;

/** Максимальное окно оценки «Разметки» по сложности, свечей. */
export function msWindowSize(difficulty: Difficulty): number {
  return difficulty === 'easy' ? 60 : difficulty === 'medium' ? 70 : MS_WINDOW_MAX;
}

/** Окно вопросов режима «Вопрос» (§13.3) — не менялось в v1.1. */
export function msQuestionWindow(difficulty: Difficulty): number {
  return difficulty === 'easy' ? 120 : 150;
}

/** Базовые (внешние) понятия medium/hard. */
const CORE_CONCEPTS: SkillId[] = ['swing', 'structure-labels', 'bos', 'choch'];
/** Дополнительные понятия hard; по focus выбирается подмножество. */
export const MS_HARD_EXTRAS: readonly SkillId[] = ['internal-external', 'sweep', 'order-block', 'fvg'];

/**
 * Focus задания «Разметка» (что именно отметить сверх базы). Только hard: понятия из MS_HARD_EXTRAS в `focus`;
 * если их нет — один по seed. easy/medium -> [] (набор понятий фиксирован сложностью).
 */
export function msResolveFocus(difficulty: Difficulty, focus: readonly SkillId[] | undefined, seed: number): SkillId[] {
  if (difficulty !== 'hard') return [];
  const picked = MS_HARD_EXTRAS.filter((c) => focus?.includes(c));
  if (picked.length > 0) return picked;
  return [MS_HARD_EXTRAS[randInt(mulberry32(seed ^ 0x5bd1e995), MS_HARD_EXTRAS.length)]!];
}

/**
 * Понятия задания (§13.2, v1.1): easy - swing (внешний слой); medium - внешняя структура (swing, HH/HL/LH/LL, BOS/CHoCH);
 * hard - внешняя структура + понятия focus (без focus - все дополнительные); при internal-external без HH/HL/LH/LL.
 */
export function msConceptsFor(difficulty: Difficulty, focus?: readonly SkillId[]): SkillId[] {
  if (difficulty === 'easy') return ['swing'];
  if (difficulty === 'medium') return [...CORE_CONCEPTS];
  const extras = MS_HARD_EXTRAS.filter((c) => focus?.includes(c));
  const chosen = extras.length > 0 ? extras : MS_HARD_EXTRAS;
  // внутренний слой удваивает число swing: при focus на нём подписи HH/HL/LH/LL не требуются (укладываемся в 12 меток)
  const core = chosen.includes('internal-external') ? CORE_CONCEPTS.filter((c) => c !== 'structure-labels') : CORE_CONCEPTS;
  return [...core, ...chosen];
}

/** Инструменты рисования, нужные для понятий. */
export function msToolsFor(concepts: readonly SkillId[]): MarkKind[] {
  const map: [SkillId, MarkKind[]][] = [
    ['swing', ['swing-high', 'swing-low']],
    ['structure-labels', ['hh', 'hl', 'lh', 'll']],
    ['bos', ['bos']],
    ['choch', ['choch']],
    ['sweep', ['sweep']],
    ['fvg', ['fvg']],
    ['order-block', ['order-block']],
  ];
  const out: MarkKind[] = [];
  for (const [skill, kinds] of map) if (concepts.includes(skill)) out.push(...kinds);
  return out;
}

const ORDER: Difficulty[] = ['hard', 'medium', 'easy'];

/**
 * Пригодность ситуации по критерию сложности `level` (§13.1-§13.2, v1.1): ATR14 != 0, обязательных эталонных меток
 * в окне 4-12; medium - есть BOS/CHoCH; hard - каждое понятие focus представлено хотя бы одной меткой.
 */
export function meetsMsCriteria(
  r: StructureResult,
  candles: readonly Candle[],
  window: { fromIndex: number; toIndex: number },
  level: Difficulty,
  concepts: readonly SkillId[],
): boolean {
  const c = checkMsWindow(r, candles, window, level, concepts);
  return c.ok;
}

interface WindowCheck {
  ok: boolean;
  required: number;
  /** true — обязательных меток больше MS_REQUIRED_MAX (окно можно сузить). */
  tooMany: boolean;
}

function checkMsWindow(
  r: StructureResult,
  candles: readonly Candle[],
  window: { fromIndex: number; toIndex: number },
  level: Difficulty,
  concepts: readonly SkillId[],
): WindowCheck {
  const last = candles[window.toIndex];
  const atr = last ? atrAt(candles, window.toIndex) : null;
  if (!last || atr === null || atr === 0) return { ok: false, required: 0, tooMany: false };
  const required = buildAlgoMarkSet(r, { concepts: [...concepts], window }).required;
  const count = required.length;
  if (count > MS_REQUIRED_MAX) return { ok: false, required: count, tooMany: true };
  if (count < MS_REQUIRED_MIN) return { ok: false, required: count, tooMany: false };
  let ok = true;
  if (level !== 'easy') ok = required.some((m) => m.kind === 'bos' || m.kind === 'choch');
  if (ok && level === 'hard') {
    for (const c of concepts) {
      if (!MS_HARD_EXTRAS.includes(c)) continue;
      const has =
        c === 'internal-external'
          ? required.some((m) => m.scope === 'internal' && (m.kind === 'bos' || m.kind === 'choch'))
          : required.some((m) => m.kind === c);
      if (!has) ok = false;
    }
  }
  return { ok, required: count, tooMany: false };
}

function atrAt(candles: readonly Candle[], i: number): number | null {
  if (i < 14) return null;
  let s = 0;
  for (let j = i - 13; j <= i; j++) {
    const c = candles[j]!;
    const pc = candles[j - 1]!.close;
    s += Math.max(c.high - c.low, Math.abs(c.high - pc), Math.abs(c.low - pc));
  }
  return s / 14;
}

export interface MsSelectInput {
  /** Архивный ряд ТФ задания (закрытые свечи по возрастанию). */
  candles: readonly Candle[];
  tf: TaskTimeframe;
  difficulty: Difficulty;
  seed: number;
  focus?: readonly SkillId[];
  /** Исключения (ранее выданные задания): true — момент T не использовать. */
  isExcluded?: (T: UtcMs) => boolean;
  /** Верхняя граница T (например now - 2 суток). */
  maxT?: UtcMs;
  maxAttempts?: number;
}

export interface MsMarkSelection {
  /** Момент решения на сетке 15m. */
  T: UtcMs;
  /** Видимые закрытые свечи (<= MS_DEPTH, closeTime < T). */
  visible: Candle[];
  /** Индекс первой видимой свечи в архивном ряду. */
  visibleFrom: number;
  /** Окно оценки в индексах `visible`. */
  window: { fromIndex: number; toIndex: number };
  params: StructureParams;
  concepts: SkillId[];
  /** Что именно отметить сверх базы (hard); [] для easy/medium. Сохраняется в params задания для grade. */
  focus: SkillId[];
  tools: MarkKind[];
  scoped: boolean;
  /** Размер окна оценки, свечей (40-80). */
  windowSize: number;
  /** Число обязательных эталонных меток в окне (4-12). */
  requiredCount: number;
  /** Критерий, по которому задание отобрано (ниже `difficulty` — результат ослабления). */
  criteria: Difficulty;
  attempts: number;
}

interface Candidate {
  T: UtcMs;
  visible: Candle[];
  visibleFrom: number;
}

/** Случайный T на сетке 15m и видимый ряд для него; null, если ряд непригоден (мало истории, пропуски, исключение). */
function drawCandidate(inp: MsSelectInput, rng: () => number, minVisible: number): Candidate | null {
  const { candles, tf } = inp;
  const step = TIMEFRAME_MS[tf];
  if (candles.length < minVisible) return null;
  const tMin = candles[minVisible - 1]!.closeTime + 1;
  let tMax = candles[candles.length - 1]!.closeTime + 1;
  if (inp.maxT !== undefined) tMax = Math.min(tMax, Math.floor(inp.maxT / GRID_15M) * GRID_15M);
  if (tMax < tMin) return null;
  const count = Math.floor((tMax - tMin) / GRID_15M) + 1;
  const T = tMin + randInt(rng, count) * GRID_15M;
  if (inp.isExcluded?.(T)) return null;
  let e = candleIndexAt(candles, T - 1, step);
  if (e < 0) return null;
  if (candles[e]!.closeTime + 1 > T) e -= 1; // свеча ещё формируется: в видимый ряд не входит
  const from = Math.max(0, e - MS_DEPTH[tf] + 1);
  if (e - from + 1 < minVisible) return null;
  const visible = candles.slice(from, e + 1) as Candle[];
  if (gaps(visible, tf).length > 0) return null;
  return { T, visible, visibleFrom: from };
}

/**
 * Выбор задания «Разметка»: до 200 попыток на уровень критерия, затем ослабление hard -> medium -> easy (§13.1).
 * Детерминирован по seed. null — подходящей ситуации в ряду нет.
 */
export function selectMsMarkTask(inp: MsSelectInput): MsMarkSelection | null {
  const rng = mulberry32(inp.seed);
  const maxW = msWindowSize(inp.difficulty);
  const params = msParamsFor(inp.difficulty);
  const focus = msResolveFocus(inp.difficulty, inp.focus, inp.seed);
  const concepts = msConceptsFor(inp.difficulty, focus);
  const max = inp.maxAttempts ?? MS_MAX_ATTEMPTS;
  let attempts = 0;
  for (const level of ORDER.slice(ORDER.indexOf(inp.difficulty))) {
    for (let a = 0; a < max; a++) {
      attempts++;
      const cand = drawCandidate(inp, rng, maxW + MS_MIN_WARMUP);
      if (!cand) continue;
      const n = cand.visible.length;
      const r = analyzeStructure(cand.visible, params, { tf: inp.tf });
      // окно заканчивается на последней видимой свече; при избытке меток сужается, при нехватке - другое T
      for (let W = maxW; W >= MS_WINDOW_MIN; W = W === MS_WINDOW_MIN ? 0 : Math.max(MS_WINDOW_MIN, W - MS_WINDOW_STEP)) {
        const window = { fromIndex: n - W, toIndex: n - 1 };
        const chk = checkMsWindow(r, cand.visible, window, level, concepts);
        if (chk.ok) {
          return {
            T: cand.T,
            visible: cand.visible,
            visibleFrom: cand.visibleFrom,
            window,
            params,
            concepts,
            focus,
            tools: msToolsFor(concepts),
            scoped: concepts.includes('internal-external'),
            windowSize: W,
            requiredCount: chk.required,
            criteria: level,
            attempts,
          };
        }
        if (!chk.tooMany) break;
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------- «Вопрос» (§13.3)

export type MsQuestionTemplate = 'trend' | 'break-type' | 'wick-or-body' | 'protected';
export const MS_QUESTION_TEMPLATES: readonly MsQuestionTemplate[] = ['trend', 'break-type', 'wick-or-body', 'protected'];

export interface MsQuestion {
  questionId: string;
  template: MsQuestionTemplate;
  promptKey: string;
  promptParams: Record<string, string | number>;
  options: { id: string; labelKey: string; labelParams?: Record<string, string | number> }[];
  highlight?: Anchor[];
  correctOptionId: string;
  skill: SkillId;
  /** Подстановки для разбора (не отдаются клиенту до grade). */
  explain: Record<string, string | number>;
}

const TEMPLATE_BY_SKILL: Partial<Record<SkillId, MsQuestionTemplate[]>> = {
  bos: ['trend', 'wick-or-body'],
  choch: ['protected', 'break-type'],
  sweep: ['break-type'],
};

function templatesFor(focus?: readonly SkillId[]): MsQuestionTemplate[] {
  if (focus && focus.length > 0) {
    const set = new Set<MsQuestionTemplate>();
    for (const f of focus) for (const t of TEMPLATE_BY_SKILL[f] ?? []) set.add(t);
    if (set.size > 0) return orderFilter(set);
  }
  return [...MS_QUESTION_TEMPLATES];
}
function orderFilter(set: Set<MsQuestionTemplate>): MsQuestionTemplate[] {
  return MS_QUESTION_TEMPLATES.filter((t) => set.has(t));
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(rng, i + 1);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Строит вопрос заданного шаблона на видимом ряду; null — шаблон неприменим к ситуации. */
export function buildMsQuestion(
  visible: readonly Candle[],
  difficulty: Difficulty,
  tf: TaskTimeframe,
  template: MsQuestionTemplate,
  seed: number,
): MsQuestion | null {
  const params = msParamsFor(difficulty);
  const r = analyzeStructure(visible, params, { tf });
  const n = visible.length;
  const from = Math.max(0, n - msQuestionWindow(difficulty));
  const rng = mulberry32((Math.imul(seed | 0, 31) + MS_QUESTION_TEMPLATES.indexOf(template) * 0x9e3779b1) | 0);
  const questionId = `${template}:${seed}`;
  const ext = r.events.filter((e) => e.scope === 'external' && e.breakIndex >= from);
  const sweeps = r.sweeps.filter((s) => s.index >= from);
  const base = { questionId, template };

  if (template === 'trend') {
    const trend = r.state.external.trend;
    const correct = trend === 'none' ? 'range' : trend;
    return {
      ...base,
      promptKey: 'ms.q.trend.prompt',
      promptParams: {},
      options: ['up', 'down', 'range'].map((id) => ({ id, labelKey: `ms.q.trend.${id}` })),
      correctOptionId: correct,
      skill: 'bos',
      explain: { trend: correct, lastEvent: r.state.external.lastEvent?.kind ?? 'none' },
    };
  }

  if (template === 'break-type') {
    const sweepIdx = new Set(sweeps.map((s) => s.index));
    const evIdx = new Set(ext.map((e) => e.breakIndex));
    const pool: { index: number; answer: 'bos' | 'choch' | 'sweep'; level: number }[] = [];
    for (const e of ext) if (!sweepIdx.has(e.breakIndex)) pool.push({ index: e.breakIndex, answer: e.kind, level: e.level });
    for (const s of sweeps) if (!evIdx.has(s.index)) pool.push({ index: s.index, answer: 'sweep', level: s.level });
    pool.sort((a, b) => a.index - b.index);
    if (pool.length === 0) return null;
    const pick = pool[randInt(rng, pool.length)]!;
    const c = visible[pick.index]!;
    return {
      ...base,
      promptKey: 'ms.q.breakType.prompt',
      promptParams: { time: c.openTime },
      options: ['bos', 'choch', 'sweep'].map((id) => ({ id, labelKey: `ms.q.breakType.${id}` })),
      highlight: [{ time: c.openTime, price: c.close }],
      correctOptionId: pick.answer,
      skill: pick.answer,
      explain: { kind: pick.answer, level: pick.level, close: c.close, time: c.openTime },
    };
  }

  if (template === 'wick-or-body') {
    const breaks = ext.map((e) => ({ index: e.breakIndex, swingTime: e.brokenSwing.time, level: e.level, body: true }));
    const wicks = sweeps.map((s) => ({ index: s.index, swingTime: s.sweptSwings[0]!.time, level: s.level, body: false }));
    const wantBody = rng() < 0.5;
    const first = wantBody ? breaks : wicks;
    const pool = first.length > 0 ? first : wantBody ? wicks : breaks;
    if (pool.length === 0) return null;
    const pick = pool[randInt(rng, pool.length)]!;
    const c = visible[pick.index]!;
    return {
      ...base,
      promptKey: 'ms.q.wickOrBody.prompt',
      promptParams: { time: c.openTime, level: pick.level },
      options: ['body', 'wick'].map((id) => ({ id, labelKey: `ms.q.wickOrBody.${id}` })),
      highlight: [
        { time: pick.swingTime, price: pick.level },
        { time: c.openTime, price: pick.level },
      ],
      correctOptionId: pick.body ? 'body' : 'wick',
      skill: 'bos',
      explain: { level: pick.level, close: c.close, time: c.openTime, high: c.high, low: c.low },
    };
  }

  // protected
  const st = r.state.external;
  if (st.trend === 'none') return null;
  const prot = st.trend === 'up' ? st.refLow : st.refHigh;
  if (!prot) return null;
  const type = st.trend === 'up' ? 'low' : 'high';
  const prices: number[] = [];
  for (const s of r.swings) {
    if (s.scope === 'external' && s.type === type && s.index >= from && s.price !== prot.price && !prices.includes(s.price)) {
      prices.push(s.price);
    }
  }
  if (prices.length < 2) return null;
  const others = shuffle(prices, rng).slice(0, 2);
  const opts = shuffle([prot.price, ...others], rng);
  return {
    ...base,
    promptKey: 'ms.q.protected.prompt',
    promptParams: { trend: st.trend },
    options: opts.map((price, i) => ({ id: `o${i + 1}`, labelKey: 'ms.q.protected.option', labelParams: { price } })),
    correctOptionId: `o${opts.indexOf(prot.price) + 1}`,
    skill: 'choch',
    explain: { trend: st.trend, level: prot.price, time: prot.time },
  };
}

/** Генерирует вопрос для видимого ряда: шаблон выбирается по seed (и focus); при неприменимости — следующий. */
export function generateMsQuestion(
  visible: readonly Candle[],
  difficulty: Difficulty,
  tf: TaskTimeframe,
  seed: number,
  focus?: readonly SkillId[],
): MsQuestion | null {
  const list = templatesFor(focus);
  const start = randInt(mulberry32(seed), list.length);
  for (let i = 0; i < list.length; i++) {
    const q = buildMsQuestion(visible, difficulty, tf, list[(start + i) % list.length]!, seed);
    if (q) return q;
  }
  return null;
}

/** Восстановление вопроса при grade по `questionId` (`<template>:<seed>`). */
export function rebuildMsQuestion(
  visible: readonly Candle[],
  difficulty: Difficulty,
  tf: TaskTimeframe,
  questionId: string,
): MsQuestion | null {
  const m = /^([a-z-]+):(-?\d+)$/.exec(questionId);
  if (!m || !(MS_QUESTION_TEMPLATES as readonly string[]).includes(m[1]!)) return null;
  return buildMsQuestion(visible, difficulty, tf, m[1] as MsQuestionTemplate, Number(m[2]));
}

export interface MsQuestionGrade {
  verdict: Verdict;
  score: number;
  skillOutcomes: SkillOutcome[];
  errors: GradeError[];
  detail: { kind: 'ms-question'; chosenOptionId: string; correctOptionId: string };
}

/** Пояснения к `QUESTION_WRONG` (why/howTo/principle) по шаблону вопроса; без чисел и времён (их форматирует UI). */
export function msQuestionTexts(q: Pick<MsQuestion, 'template' | 'explain'>): { explain: string; howTo: string; principle: string } {
  switch (q.template) {
    case 'trend':
      return {
        explain: 'Внешний тренд задаёт последнее событие внешней структуры: после бычьего BOS/CHoCH тренд восходящий, после медвежьего нисходящий, без событий - диапазон.',
        howTo: 'Найдите последний пробой внешнего swing по закрытию тела и определите его направление.',
        principle: 'Тренд определяется последним подтверждённым пробоем структуры, а не наклоном графика.',
      };
    case 'break-type': {
      const kind = String(q.explain['kind']);
      const explain =
        kind === 'bos'
          ? 'Тело свечи закрылось за целевым swing по направлению тренда - это BOS, продолжение структуры.'
          : kind === 'choch'
            ? 'Тело свечи закрылось за защищённым уровнем против тренда - это CHoCH, смена характера структуры.'
            : 'Фитиль вышел за swing, а тело осталось по эту сторону уровня - это Liquidity sweep, а не пробой.';
      return {
        explain,
        howTo: 'Сравните закрытие свечи с уровнем: закрытие за уровнем по тренду - BOS, против тренда - CHoCH, только фитиль - sweep.',
        principle: 'Тело решает, фитиль проверяет.',
      };
    }
    case 'wick-or-body':
      return {
        explain: isBodyBreak(q)
          ? 'Тело свечи закрылось за уровнем - уровень пробит.'
          : 'Уровень пробит только фитилём: закрытие осталось по эту сторону уровня.',
        howTo: 'Смотрите на закрытие свечи, а не на экстремум: пробой засчитывается только по закрытию тела.',
        principle: 'BOS и CHoCH - только по закрытию тела.',
      };
    default:
      return {
        explain: 'Тренд защищает ближайший swing, пробой которого сменит тренд: swing low в восходящем и swing high в нисходящем.',
        howTo: 'Найдите последний swing против тренда, с которого начался текущий импульс.',
        principle: 'Тренд жив, пока стоит защищённый уровень.',
      };
  }
}

const isBodyBreak = (q: Pick<MsQuestion, 'explain'>): boolean => {
  const { close, level, high, low } = q.explain as Record<string, number>;
  return !((high! > level! && close! <= level!) || (low! < level! && close! >= level!));
};

const OPTION_TEXT_RU: Record<string, string> = {
  up: 'восходящий тренд',
  down: 'нисходящий тренд',
  range: 'диапазон (тренда нет)',
  bos: 'BOS',
  choch: 'CHoCH',
  sweep: 'Liquidity sweep',
  body: 'пробит по закрытию тела',
  wick: 'пробит только фитилём',
};

/** Отображаемое значение варианта: цена (UI форматирует число) или название ответа. */
function optionDisplay(q: MsQuestion, id: string): string | number {
  const o = q.options.find((x) => x.id === id);
  const price = o?.labelParams?.['price'];
  if (typeof price === 'number') return price;
  return OPTION_TEXT_RU[id] ?? id;
}

export function gradeMsQuestion(q: MsQuestion, chosenOptionId: string): MsQuestionGrade {
  const ok = chosenOptionId === q.correctOptionId;
  const errors: GradeError[] = ok
    ? []
    : [
        {
          code: 'QUESTION_WRONG',
          skill: q.skill,
          severity: 'major',
          params: {
            ...q.explain,
            template: q.template,
            givenId: chosenOptionId,
            expectedId: q.correctOptionId,
            given: optionDisplay(q, chosenOptionId),
            expected: optionDisplay(q, q.correctOptionId),
            ...msQuestionTexts(q),
          },
        },
      ];
  return {
    verdict: ok ? 'correct' : 'incorrect',
    score: ok ? 1 : 0,
    skillOutcomes: [{ skill: q.skill, correct: ok ? 1 : 0, total: 1 }],
    errors,
    detail: { kind: 'ms-question', chosenOptionId, correctOptionId: q.correctOptionId },
  };
}

/** Выбор T для «Вопроса»: ситуации, где вопрос строится (минимум структуры в окне, ATR != 0). */
export function selectMsQuestionTask(inp: MsSelectInput):
  | { T: UtcMs; visible: Candle[]; visibleFrom: number; question: MsQuestion; attempts: number }
  | null {
  const rng = mulberry32(inp.seed);
  const W = msQuestionWindow(inp.difficulty);
  const max = inp.maxAttempts ?? MS_MAX_ATTEMPTS;
  const params = msParamsFor(inp.difficulty);
  for (let a = 1; a <= max; a++) {
    const cand = drawCandidate(inp, rng, W + MS_MIN_WARMUP);
    if (!cand) continue;
    const n = cand.visible.length;
    const r = analyzeStructure(cand.visible, params, { tf: inp.tf });
    const atr = atrAt(cand.visible, n - 1);
    const swingsInW = r.swings.filter((s) => s.scope === 'external' && s.index >= n - W).length;
    if (atr === null || atr === 0 || swingsInW < 4) continue;
    const q = generateMsQuestion(cand.visible, inp.difficulty, inp.tf, inp.seed, inp.focus);
    if (!q) continue;
    return { T: cand.T, visible: cand.visible, visibleFrom: cand.visibleFrom, question: q, attempts: a };
  }
  return null;
}
