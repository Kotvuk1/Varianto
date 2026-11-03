// Контекст для PA «Контекст» (ALGORITHMS §11): факторы sweep / orderBlock / keyLevel / htfTrend и значимость модели.
import { analyzeStructure } from '../smc/analyze';
import { atr14, closedOnly } from '../smc/series';
import { detectSweeps } from '../smc/sweeps';
import type {
  Candle,
  GradeError,
  Mark,
  OkCode,
  OrderBlock,
  SkillOutcome,
  StructureParams,
  StructureResult,
  Swing,
  TaskTimeframe,
  UtcMs,
  Verdict,
} from '../types';
import { findLevels, type Level } from './levels';
import type { PatternInstance } from './types';

/** Параметры структуры «Контекста»: N = 5 для всех сложностей (11.3). */
export const CONTEXT_STRUCTURE: StructureParams = { nExt: 5, nInt: null, sweepHoldK: 3, fvgMinAtr: 0.5, obDisplacementAtr: 1.2 };

/** Старший ТФ (11.2). Для 1d старший тренд — тренд самого 1d. */
export const HTF_OF: Readonly<Record<TaskTimeframe, TaskTimeframe>> = { '15m': '1h', '1h': '4h', '4h': '1d', '1d': '1d' };

export type HtfTrend = 'up' | 'down' | 'range';

export interface ContextFactorAnswer {
  sweep: boolean;
  orderBlock: boolean;
  keyLevel: boolean;
  htfTrend: HtfTrend;
}
export type ContextAnswer = ContextFactorAnswer & { significant: boolean };

export interface ContextEvidence {
  sweep: { side: 'high' | 'low'; index: number; time: UtcMs; level: number; wickExtreme: number } | null;
  orderBlock: OrderBlock | null;
  level: Level | null;
  htfLastEvent: { kind: 'bos' | 'choch'; direction: 'bull' | 'bear' } | null;
}

export interface ContextReference extends ContextAnswer {
  direction: 'bull' | 'bear';
  patternIndex: { first: number; last: number };
  evidence: ContextEvidence;
}

/** Закрытые свечи старшего ТФ к моменту T (частичная старшая свеча не участвует, ADR-0006 п.7). */
export function htfClosedAt(htf: readonly Candle[], T: UtcMs): Candle[] {
  return htf.filter((c) => c.closed && c.closeTime < T);
}

export function isSignificant(direction: 'bull' | 'bear', f: ContextFactorAnswer): boolean {
  const location = f.sweep || f.orderBlock || f.keyLevel;
  const aligned = (direction === 'bull' && f.htfTrend === 'up') || (direction === 'bear' && f.htfTrend === 'down');
  const count = Number(f.sweep) + Number(f.orderBlock) + Number(f.keyLevel);
  return (aligned && location) || (f.htfTrend === 'range' && count >= 2);
}

function externalSwings(r: StructureResult): Swing[] {
  return r.swings.filter((s) => s.scope === 'external');
}

/** Экстремум модели в зоне OB: бычий — `bottom - 0.25A <= low <= top`, медвежий — `bottom <= high <= top + 0.25A` (11.3). */
export function obContainsExtreme(ob: Pick<OrderBlock, 'direction' | 'top' | 'bottom'>, extreme: number, atr: number): boolean {
  return ob.direction === 'bull'
    ? ob.bottom - 0.25 * atr <= extreme && extreme <= ob.top
    : ob.bottom <= extreme && extreme <= ob.top + 0.25 * atr;
}

/**
 * Эталон «Контекста» для направленной модели `pattern` на рабочем ряду `candles` (последняя свеча модели — последняя нужная;
 * свечи после неё игнорируются) и закрытом к T ряду старшего ТФ `htf`.
 */
export function computeContext(
  candlesIn: readonly Candle[],
  pattern: PatternInstance,
  htf: readonly Candle[],
): ContextReference {
  if (pattern.direction === null) throw new Error('CONTEXT_NEEDS_DIRECTIONAL_PATTERN');
  const dir = pattern.direction;
  const bull = dir === 'bull';
  const F = pattern.firstIndex;
  const L = pattern.lastIndex;
  const candles = closedOnly(candlesIn).slice(0, L + 1);
  const A = atr14(candles)[L];
  if (A === null || A === undefined) throw new Error('CONTEXT_NO_ATR');

  let patLow = Infinity;
  let patHigh = -Infinity;
  for (let i = F; i <= L; i++) {
    patLow = Math.min(patLow, candles[i]!.low);
    patHigh = Math.max(patHigh, candles[i]!.high);
  }
  const extreme = bull ? patLow : patHigh;

  // sweep: кандидат (без удержания) по внешнему swing любой свечой из [F-2, L]
  const full = analyzeStructure(candles, CONTEXT_STRUCTURE);
  const sweepsNoHold = detectSweeps(candles, externalSwings(full), 0).confirmed;
  const side = bull ? 'low' : 'high';
  const sw = sweepsNoHold.filter((s) => s.side === side && s.index >= Math.max(0, F - 2) && s.index <= L).pop() ?? null;

  // orderBlock: валидный внешний OB нужного направления на свече F-1, не invalidated, в зоне модели
  let ob: OrderBlock | null = null;
  if (F >= 1) {
    const before = analyzeStructure(candles.slice(0, F), CONTEXT_STRUCTURE);
    ob =
      before.orderBlocks.find(
        (o) =>
          o.direction === dir &&
          o.valid &&
          o.status !== 'invalidated' &&
          obContainsExtreme(o, extreme, A),
      ) ?? null;
  }

  // keyLevel: уровень (touches >= 2) на ряду до модели с экстремумом в зоне ±0.3%
  let level: Level | null = null;
  if (F >= 1) {
    level =
      findLevels(candles.slice(0, F)).levels.find(
        (l) => l.touches >= 2 && l.low * (1 - 0.003) <= extreme && extreme <= l.high * (1 + 0.003),
      ) ?? null;
  }

  // htfTrend: внешний слой N=5 по закрытому ряду старшего ТФ
  const htfClosed = closedOnly(htf);
  const htfRes = analyzeStructure(htfClosed, CONTEXT_STRUCTURE);
  const trend = htfRes.state.external.trend;
  const htfTrend: HtfTrend = trend === 'none' ? 'range' : trend;
  const le = htfRes.state.external.lastEvent;

  const factors: ContextFactorAnswer = { sweep: sw !== null, orderBlock: ob !== null, keyLevel: level !== null, htfTrend };
  return {
    ...factors,
    significant: isSignificant(dir, factors),
    direction: dir,
    patternIndex: { first: F, last: L },
    evidence: {
      sweep: sw && { side: sw.side, index: sw.index, time: sw.time, level: sw.level, wickExtreme: sw.wickExtreme },
      orderBlock: ob,
      level,
      htfLastEvent: le ? { kind: le.kind, direction: le.direction } : null,
    },
  };
}

export interface ContextGrade {
  verdict: Verdict;
  score: number;
  errors: GradeError[];
  skillOutcomes: SkillOutcome[];
  ok: { code: OkCode; params?: Record<string, string | number> }[];
  detail: { kind: 'pa-context'; expected: ContextAnswer; given: ContextAnswer };
}

/** Оценка (11.5): 5 пунктов, score = совпавших / 5. */
export function gradeContext(ref: ContextReference, given: ContextAnswer, htfTf: TaskTimeframe = '1h'): ContextGrade {
  const expected: ContextAnswer = {
    sweep: ref.sweep,
    orderBlock: ref.orderBlock,
    keyLevel: ref.keyLevel,
    htfTrend: ref.htfTrend,
    significant: ref.significant,
  };
  const errors: GradeError[] = [];
  const err = (code: GradeError['code'], params: Record<string, string | number>) =>
    errors.push({ code, skill: 'pa-context', severity: 'minor', params });
  const ev = ref.evidence;
  const bull = ref.direction === 'bull';

  if (given.sweep !== ref.sweep) {
    if (ref.sweep && ev.sweep) err('CONTEXT_MISSED_SWEEP', { side: ev.sweep.side, time: ev.sweep.time, level: ev.sweep.level });
    else err('CONTEXT_PHANTOM_FACTOR', { factor: 'sweep', reason: 'За фитилём модели нет снятия живого внешнего swing' });
  }
  if (given.orderBlock !== ref.orderBlock) {
    if (ref.orderBlock && ev.orderBlock) {
      err('CONTEXT_MISSED_OB', { dir: ref.direction, low: ev.orderBlock.bottom, high: ev.orderBlock.top, time: ev.orderBlock.time });
    } else err('CONTEXT_PHANTOM_FACTOR', { factor: 'order-block', reason: 'Экстремум модели не лежит в валидном незакрытом за зоной OB' });
  }
  if (given.keyLevel !== ref.keyLevel) {
    if (ref.keyLevel && ev.level) err('CONTEXT_MISSED_LEVEL', { level: ev.level.center, touches: ev.level.touches });
    else err('CONTEXT_PHANTOM_FACTOR', { factor: 'key-level', reason: 'Рядом с экстремумом модели нет кластера из двух и более swing' });
  }
  if (given.htfTrend !== ref.htfTrend) {
    err('CONTEXT_IGNORED_HTF', {
      given: given.htfTrend,
      expected: ref.htfTrend,
      htfTf,
      lastEvent: ev.htfLastEvent ? `${ev.htfLastEvent.kind === 'bos' ? 'BOS' : 'CHoCH'} (${ev.htfLastEvent.direction === 'bull' ? 'бычий' : 'медвежий'})` : 'событий нет',
    });
  }
  if (given.significant !== ref.significant) {
    if (given.significant) {
      err('CONTEXT_FALSE_POSITIVE', {
        why: ref.htfTrend === (bull ? 'down' : 'up') ? 'Модель направлена против старшего тренда' : 'Нет подтверждающего контекста',
        htfTf,
      });
    } else {
      const f = [ref.sweep && 'sweep', ref.orderBlock && 'Order Block', ref.keyLevel && 'уровень'].filter(Boolean).join(', ');
      err('CONTEXT_FALSE_NEGATIVE', { factors: f || 'зона интереса' });
    }
  }

  const matched = 5 - errors.length;
  const significantOk = given.significant === ref.significant;
  const verdict: Verdict = errors.length === 0 ? 'correct' : significantOk ? 'partial' : 'incorrect';
  return {
    verdict,
    score: matched / 5,
    errors,
    skillOutcomes: [{ skill: 'pa-context', correct: matched, total: 5 }],
    ok: matched > 0 ? [{ code: 'OK_CONTEXT', params: { count: matched, total: 5 } }] : [],
    detail: { kind: 'pa-context', expected, given },
  };
}

/** Метка модели PA (ALGORITHMS §3.4): по якорю на свечу, `{time: openTime, price: close}`. */
export function patternToMark(candles: readonly Candle[], p: PatternInstance): Mark {
  return {
    id: `algo:pattern:${p.type}:${p.direction ?? '-'}:${p.time}`,
    kind: 'pattern',
    anchors: candles.slice(p.firstIndex, p.lastIndex + 1).map((c) => ({ time: c.openTime, price: c.close })),
    scope: null,
    direction: p.direction,
    meta: { patternType: p.type },
    author: 'algo',
  };
}
