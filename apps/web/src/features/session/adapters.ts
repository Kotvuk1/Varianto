// Адаптеры «состояние UI -> Answer» и «GradeResult -> состояния меток» (API_CONTRACTS §4.2, §5.1).
import { TIMEFRAME_MS, type Mark, type PatternType, type TaskTimeframe } from '@tl/core';
import type { Answer, GradeResultDto } from './types';

const userOnly = (marks: readonly Mark[]): Mark[] => marks.filter((m) => m.author === 'user');

export function msMarkAnswer(marks: readonly Mark[]): Extract<Answer, { kind: 'ms-mark' }> {
  return { kind: 'ms-mark', marks: userOnly(marks) as never };
}

export function msQuestionAnswer(questionId: string, optionId: string): Extract<Answer, { kind: 'ms-question' }> {
  return { kind: 'ms-question', questionId, optionId };
}

export type ContextFactors = { sweep: boolean; orderBlock: boolean; keyLevel: boolean; htfTrend: 'up' | 'down' | 'range' };

export function paContextAnswer(factors: ContextFactors, significant: boolean): Extract<Answer, { kind: 'pa-context' }> {
  return { kind: 'pa-context', factors: { ...factors }, significant };
}

/** Горизонтальный уровень: цена последней метки `level`; null, если уровня нет. */
export function levelPrice(marks: readonly Mark[]): number | null {
  const last = [...marks].reverse().find((m) => m.kind === 'level' && m.anchors[0]);
  return last ? last.anchors[0]!.price : null;
}

export function lvStrongestAnswer(marks: readonly Mark[]): Extract<Answer, { kind: 'lv-strongest' }> | null {
  const price = levelPrice(marks);
  return price === null ? null : { kind: 'lv-strongest', price };
}

/** Уровень в задании один: новый заменяет прежний. */
export function keepSingleLevel(next: readonly Mark[]): Mark[] {
  const levels = next.filter((m) => m.kind === 'level');
  const last = levels[levels.length - 1];
  return next.filter((m) => m.kind !== 'level' || m === last);
}

/** Сколько свечей составляют модель (максимум якорей метки). */
export const PATTERN_CANDLES: Readonly<Record<PatternType, 1 | 2 | 3>> = {
  engulfing: 2,
  'pin-bar': 1,
  'inside-bar': 2,
  doji: 1,
  'morning-star': 3,
  'evening-star': 3,
};

/** Направление, которое известно из названия модели; null - выбирает пользователь или направления нет. */
export function impliedDirection(target: PatternType): 'bull' | 'bear' | null | 'choice' {
  if (target === 'morning-star') return 'bull';
  if (target === 'evening-star') return 'bear';
  if (target === 'doji' || target === 'inside-bar') return null;
  return 'choice';
}

/**
 * «Найди модель»: касание свечи инструментом выбора создаёт метку-одиночку; здесь она превращается
 * в метку `pattern` с типом из задания. Касание соседней свечи к уже отмеченной многосвечной модели
 * дополняет её якорями (модель = 2-3 свечи), а не создаёт лишнюю. Повторное касание той же свечи игнорируется.
 */
export function toPatternMarks(next: readonly Mark[], target: PatternType, tf: TaskTimeframe): Mark[] {
  const step = TIMEFRAME_MS[tf];
  const max = PATTERN_CANDLES[target];
  const out: Mark[] = [];
  for (const m of next) {
    if (m.kind === 'pattern') {
      out.push(m);
      continue;
    }
    const a = m.anchors[0];
    if (!a) continue;
    if (out.some((p) => p.anchors.some((x) => x.time === a.time))) continue;
    const host = max > 1 ? out.find((p) => p.anchors.length < max && p.anchors.some((x) => Math.abs(x.time - a.time) === step)) : undefined;
    if (host) {
      const i = out.indexOf(host);
      out[i] = { ...host, anchors: [...host.anchors, { time: a.time, price: a.price }].sort((x, y) => x.time - y.time) };
      continue;
    }
    out.push({
      id: m.id,
      kind: 'pattern',
      anchors: [{ time: a.time, price: a.price }],
      scope: null,
      direction: null,
      meta: { patternType: target },
      author: 'user',
    });
  }
  return out;
}

export function paFindAnswer(marks: readonly Mark[], target: PatternType, choice: 'bull' | 'bear'): Extract<Answer, { kind: 'pa-find' }> {
  const implied = impliedDirection(target);
  const direction = implied === 'choice' ? choice : implied;
  const list = userOnly(marks)
    .filter((m) => m.kind === 'pattern')
    .map((m) => ({ ...m, direction, meta: { patternType: target } }));
  return { kind: 'pa-find', marks: list as never };
}

export type MarkState = 'match' | 'missed' | 'extra';

/** id метки (пользователя или эталона) -> состояние для подписи на графике. */
export function statesFromGrade(grade: Pick<GradeResultDto, 'detail'>): Record<string, MarkState> {
  const d = grade.detail;
  if (d.kind !== 'ms-mark' && d.kind !== 'pa-find' && d.kind !== 'sw-mark') return {};
  const out: Record<string, MarkState> = {};
  for (const p of d.marks.matched) {
    out[p.userMarkId] = 'match';
    out[p.algoMarkId] = 'match';
  }
  for (const m of d.marks.missed) out[m.id] = 'missed';
  for (const m of d.marks.extra) out[m.id] = 'extra';
  return out;
}

export function countsFromGrade(grade: Pick<GradeResultDto, 'detail'>): { match: number; missed: number; extra: number } | null {
  const d = grade.detail;
  if (d.kind !== 'ms-mark' && d.kind !== 'pa-find' && d.kind !== 'sw-mark') return null;
  return { match: d.marks.matched.length, missed: d.marks.missed.length, extra: d.marks.extra.length };
}
