// Точность навыков, слабые места и адаптивная подборка (ALGORITHMS §16, DATABASE_SCHEMA §5.1).
import type { UtcMs } from '../index';
import type { PatternType } from '../pa/types';
import { mulberry32 } from '../rng';
import type { SkillId, SkillOutcome } from '../types';

/** Окно последних исходов навыка. */
export const WINDOW_N = 20;
/** Минимум исходов в окне для показа точности. */
export const MIN_SAMPLE = 5;
/** Порог ok для исхода навыка в попытке и для предложения повысить сложность. */
export const OK_THRESHOLD = 0.8;
/** Минимальный вес навыка в адаптивной подборке. */
export const MIN_WEIGHT = 0.05;
/** Максимум навыков в `focus` одного задания. */
export const FOCUS_SIZE = 3;

export interface SkillStat {
  skill: SkillId;
  attempts: number;
  correct: number;
  recent: { t: UtcMs; ok: boolean }[];
  accuracy: number | null;
  updatedAt: UtcMs;
}

export function isOutcomeOk(o: SkillOutcome): boolean {
  return o.total > 0 && o.correct / o.total >= OK_THRESHOLD;
}

export function accuracyOf(recent: readonly { ok: boolean }[]): number | null {
  if (recent.length === 0) return null;
  let ok = 0;
  for (const r of recent) if (r.ok) ok++;
  return ok / recent.length;
}

/** Добавляет исход попытки в статистику навыка; входной объект не изменяется. */
export function applyOutcome(prev: SkillStat | undefined, o: SkillOutcome, t: UtcMs): SkillStat {
  if (prev && prev.skill !== o.skill) throw new Error('SKILL_MISMATCH');
  const ok = isOutcomeOk(o);
  const recent = [...(prev?.recent ?? []), { t, ok }].slice(-WINDOW_N);
  return {
    skill: o.skill,
    attempts: (prev?.attempts ?? 0) + 1,
    correct: (prev?.correct ?? 0) + (ok ? 1 : 0),
    recent,
    accuracy: accuracyOf(recent),
    updatedAt: t,
  };
}

/** Точность считается по окну; при `recent.length < MIN_SAMPLE` значение «мало данных». */
export function isEnoughData(s: SkillStat | undefined): boolean {
  return !!s && s.recent.length >= MIN_SAMPLE;
}

/** «Слабые места»: по возрастанию accuracy; равенство — меньшее окно раньше; «мало данных» — в конце. */
export function rankWeakSkills(stats: readonly SkillStat[]): SkillStat[] {
  const enough = stats.filter(isEnoughData);
  const few = stats.filter((s) => !isEnoughData(s));
  const cmp = (a: SkillStat, b: SkillStat) =>
    (accuracyOf(a.recent) ?? 0) - (accuracyOf(b.recent) ?? 0) || a.recent.length - b.recent.length || a.skill.localeCompare(b.skill);
  return [...enough.sort(cmp), ...few.sort((a, b) => a.skill.localeCompare(b.skill))];
}

/** Вес навыка в подборке: max(0.05, 1 - accuracy); «мало данных» -> accuracy = 0.5. */
export function skillWeight(s: SkillStat | undefined): number {
  const acc = isEnoughData(s) ? (accuracyOf(s!.recent) as number) : 0.5;
  return Math.max(MIN_WEIGHT, 1 - acc);
}

/** Выборка без возвращения до `size` навыков из `candidates` пропорционально весам (PRNG от seed клиента). */
export function pickFocus(
  stats: readonly SkillStat[],
  candidates: readonly SkillId[],
  seed: number,
  size: number = FOCUS_SIZE,
): SkillId[] {
  const rng = mulberry32(seed);
  const pool = [...new Set(candidates)].map((skill) => ({ skill, w: skillWeight(stats.find((s) => s.skill === skill)) }));
  const out: SkillId[] = [];
  while (out.length < size && pool.length > 0) {
    const total = pool.reduce((a, p) => a + p.w, 0);
    let x = rng() * total;
    let idx = 0;
    for (; idx < pool.length - 1; idx++) {
      x -= pool[idx]!.w;
      if (x < 0) break;
    }
    out.push(pool[idx]!.skill);
    pool.splice(idx, 1);
  }
  return out;
}

/** Предложение повысить сложность: accuracy >= 0.8 при полном окне (DATABASE_SCHEMA §5.1). */
export function shouldSuggestHarder(s: SkillStat): boolean {
  return s.recent.length >= WINDOW_N && (accuracyOf(s.recent) as number) >= OK_THRESHOLD;
}

export type SkillGenerator =
  | { module: 'market-structure'; kind: 'ms' }
  | { module: 'price-action'; taskType: 'find-pattern'; targets: PatternType[] }
  | { module: 'price-action'; taskType: 'draw-level' | 'context' }
  | { module: 'challenge'; waitShare?: number }
  | { module: 'fibonacci'; taskType: 'grid' | 'reaction' | 'extension' }
  /** Elliott: тип задания определяется сложностью (kind), `focus` генератор не меняет (ELLIOTT.md §13, §19). */
  | { module: 'elliott' };

/** Навык -> генератор заданий (§16.3). `seed` выбирает между grid и extension для fib-anchor (50/50). */
export function generatorForSkill(skill: SkillId, seed = 0): SkillGenerator {
  switch (skill) {
    case 'ew-impulse':
    case 'ew-correction':
    case 'ew-rules':
    case 'ew-invalidation':
      return { module: 'elliott' };
    case 'fib-anchor':
      return { module: 'fibonacci', taskType: mulberry32(seed)() < 0.5 ? 'grid' : 'extension' };
    case 'fib-reaction':
    case 'premium-discount':
      return { module: 'fibonacci', taskType: 'reaction' };
    case 'fib-extension':
      return { module: 'fibonacci', taskType: 'extension' };
    case 'pa-engulfing':
      return { module: 'price-action', taskType: 'find-pattern', targets: ['engulfing'] };
    case 'pa-pin-bar':
      return { module: 'price-action', taskType: 'find-pattern', targets: ['pin-bar'] };
    case 'pa-inside-bar':
      return { module: 'price-action', taskType: 'find-pattern', targets: ['inside-bar'] };
    case 'pa-doji':
      return { module: 'price-action', taskType: 'find-pattern', targets: ['doji'] };
    case 'pa-star':
      return { module: 'price-action', taskType: 'find-pattern', targets: ['morning-star', 'evening-star'] };
    case 'pa-level':
      return { module: 'price-action', taskType: 'draw-level' };
    case 'pa-context':
      return { module: 'price-action', taskType: 'context' };
    case 'challenge-wait':
      return { module: 'challenge', waitShare: 0.6 };
    case 'challenge-entry':
    case 'challenge-risk':
      return { module: 'challenge' };
    default:
      return { module: 'market-structure', kind: 'ms' };
  }
}
