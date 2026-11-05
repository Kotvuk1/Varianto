// buildFeedback: 6-частный разбор (ALGORITHMS §17.1, API_CONTRACTS §5.2). Возвращает ключи шаблонов и параметры;
// строки подставляет UI (templates.ru.ts — данные).
import type { ErrorCode, GradeError, OkCode, SkillId, SkillOutcome } from '../types';
import { normalizeParams } from './format';
import { PATTERN_NAMES_RU } from './templates.ru';
import type { Feedback, FeedbackBlock, FeedbackInput, OkItem } from './types';

const OK_BY_SKILL: Partial<Record<SkillId, OkCode>> = {
  swing: 'OK_SWING',
  'structure-labels': 'OK_LABEL',
  bos: 'OK_BOS',
  choch: 'OK_CHOCH',
  sweep: 'OK_SWEEP',
  'order-block': 'OK_OB',
  fvg: 'OK_FVG',
  'internal-external': 'OK_SCOPE',
  'pa-engulfing': 'OK_PATTERN',
  'pa-pin-bar': 'OK_PATTERN',
  'pa-inside-bar': 'OK_PATTERN',
  'pa-doji': 'OK_PATTERN',
  'pa-star': 'OK_PATTERN',
};

/** OkCode из исходов навыков разметки: по блоку на каждый навык с хотя бы одной верной меткой. */
export function okFromOutcomes(outcomes: readonly SkillOutcome[], toleranceCandles = 2): OkItem[] {
  const out: OkItem[] = [];
  for (const o of outcomes) {
    const code = OK_BY_SKILL[o.skill];
    if (!code || o.correct <= 0) continue;
    if (code === 'OK_SCOPE') {
      if (o.correct === o.total) out.push({ code });
      continue;
    }
    const params: Record<string, string | number> = { count: o.correct, total: o.total };
    if (code === 'OK_SWING') params.tol = toleranceCandles;
    if (code === 'OK_PATTERN') params.pattern = PATTERN_NAMES_RU[o.skill] ?? o.skill;
    out.push({ code, params });
  }
  return out;
}

const MISSING = /_(MISSED|MISSING)$/;

function glyphOf(code: ErrorCode): FeedbackBlock['glyph'] {
  return MISSING.test(code) ? 'miss' : 'extra';
}

function block(e: GradeError, part: 'mistake' | 'why' | 'howTo', tickSize?: number): FeedbackBlock {
  const b: FeedbackBlock = {
    templateKey: `feedback.${e.code}.${part}`,
    code: e.code,
    glyph: part === 'mistake' ? glyphOf(e.code) : 'info',
  };
  if (e.params) b.params = normalizeParams(e.params, tickSize);
  if (part === 'mistake' && e.markIds) b.markIds = e.markIds;
  return b;
}

/** «N из M»: M — число эталонных меток (лишние метки пользователя в знаменатель не входят, D-01); сумма исходов навыков (internal-external - производный счёт по тем же меткам, не суммируется). */
function matchedOf(outcomes: readonly SkillOutcome[] | undefined): { matched: number; total: number } | null {
  let matched = 0;
  let total = 0;
  for (const o of outcomes ?? []) {
    if (o.skill === 'internal-external') continue;
    matched += o.correct;
    total += o.total - (o.extra ?? 0);
  }
  return total > 0 ? { matched, total } : null;
}

export function buildFeedback(input: FeedbackInput): Feedback {
  const ok = input.ok ?? okFromOutcomes(input.skillOutcomes ?? [], input.toleranceCandles ?? 2);
  const errors = [...input.errors];
  const worst = errors.find((e) => e.severity === 'major') ?? errors[0];
  const score = Math.round(input.score * 100);
  // challenge, fibonacci и elliott оценивают не «совпадение меток», а качество решения: вердикт plain (FIBONACCI.md §11.1)
  const mt = input.module === 'challenge' || input.module === 'fibonacci' || input.module === 'elliott' ? null : matchedOf(input.skillOutcomes);
  const elliottOutcome = input.module === 'elliott' && input.verdictParams?.outcomeText !== undefined;
  const verdict: FeedbackBlock = elliottOutcome
    ? { templateKey: `feedback.verdict.elliott.${input.verdict}`, code: null, params: { score, ...input.verdictParams }, glyph: 'info' }
    : input.module === 'challenge'
    ? { templateKey: `feedback.verdict.challenge.${input.verdict}`, code: null, params: { score }, glyph: 'info' }
    : mt
      ? { templateKey: `feedback.verdict.${input.verdict}`, code: null, params: { matched: mt.matched, total: mt.total, score }, glyph: 'info' }
      : { templateKey: `feedback.verdict.plain.${input.verdict}`, code: null, params: { score }, glyph: 'info' };
  return {
    verdict,
    understood: ok.map((o) => {
      const b: FeedbackBlock = { templateKey: `feedback.ok.${o.code}`, code: o.code, glyph: 'match' };
      if (o.params) b.params = normalizeParams(o.params, input.tickSize);
      if (o.markIds) b.markIds = o.markIds;
      return b;
    }),
    mistakes: errors.map((e) => block(e, 'mistake', input.tickSize)),
    why: errors.map((e) => block(e, 'why', input.tickSize)),
    howTo: errors.map((e) => block(e, 'howTo', input.tickSize)),
    principle: worst
      ? { templateKey: `feedback.${worst.code}.principle`, code: worst.code, ...(worst.params ? { params: normalizeParams(worst.params, input.tickSize) } : {}), glyph: 'info' }
      : { templateKey: `feedback.principle.${input.module}`, code: null, glyph: 'info' },
  };
}
