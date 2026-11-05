// Чистая логика экрана «Прогресс» и главной: слабые места, группировка, тренд, журнал ошибок, рекомендация.
import {
  MIN_SAMPLE,
  generatorForSkill,
  rankWeakSkills,
  shouldSuggestHarder,
  type SkillId,
  type SkillStat as CoreSkillStat,
} from '@tl/core';
import type { Attempt, ModuleId, SkillStat } from '@/storage';

export { MIN_SAMPLE };
export type Trend = 'up' | 'flat' | 'down';

const MODULE_ORDER: ModuleId[] = ['market-structure', 'price-action', 'challenge', 'fibonacci'];
const asCore = (s: SkillStat) => s as unknown as CoreSkillStat;

export function moduleOfSkill(skill: string): ModuleId {
  return generatorForSkill(skill as SkillId).module;
}

export const hasEnoughData = (s: SkillStat): boolean => s.recent.length >= MIN_SAMPLE && s.accuracy !== null;

/** Слабые места: только навыки с окном >= MIN_SAMPLE, по возрастанию точности. */
export function selectWeak(stats: readonly SkillStat[], limit?: number): SkillStat[] {
  const ranked = rankWeakSkills(stats.map(asCore)).filter((s) => s.recent.length >= MIN_SAMPLE);
  const bySkill = new Map(stats.map((s) => [s.skill, s]));
  const out = ranked.map((s) => bySkill.get(s.skill) as SkillStat);
  return limit === undefined ? out : out.slice(0, limit);
}

/** Навыки с попытками, но без достаточного окна («Мало данных: n из 5»). */
export function selectFewData(stats: readonly SkillStat[]): SkillStat[] {
  return stats.filter((s) => s.recent.length > 0 && s.recent.length < MIN_SAMPLE).sort((a, b) => a.skill.localeCompare(b.skill));
}

export interface ModuleGroup {
  module: ModuleId;
  skills: SkillStat[];
}

/** Группировка по модулям в порядке MS / PA / Challenge; внутри — по возрастанию точности, «мало данных» в конце. */
export function groupByModule(stats: readonly SkillStat[]): ModuleGroup[] {
  return MODULE_ORDER.map((module) => {
    const own = stats.filter((s) => moduleOfSkill(s.skill) === module);
    const ranked = rankWeakSkills(own.map(asCore)).map((s) => own.find((o) => o.skill === s.skill) as SkillStat);
    return { module, skills: ranked };
  }).filter((g) => g.skills.length > 0);
}

/** Тренд: точность второй половины окна против первой. null — окно меньше MIN_SAMPLE. */
export function trendOf(recent: readonly { ok: boolean }[]): Trend | null {
  if (recent.length < MIN_SAMPLE) return null;
  const mid = Math.floor(recent.length / 2);
  const rate = (xs: readonly { ok: boolean }[]) => xs.filter((x) => x.ok).length / xs.length;
  const d = rate(recent.slice(mid)) - rate(recent.slice(0, mid));
  return d > 0.1 ? 'up' : d < -0.1 ? 'down' : 'flat';
}

export interface TrainTarget {
  href: string;
  module: ModuleId;
}

/** Ссылка на сессию с focus на навык; модуль и режим — из генератора ядра, сложность растёт при точности >= 0.8 на полном окне. */
export function trainTarget(stat: Pick<SkillStat, 'skill' | 'recent' | 'accuracy' | 'attempts' | 'correct' | 'updatedAt'>): TrainTarget {
  const gen = generatorForSkill(stat.skill as SkillId);
  const difficulty = shouldSuggestHarder(stat as unknown as CoreSkillStat) ? 'medium' : 'easy';
  const q = new URLSearchParams();
  if (gen.module === 'market-structure') {
    q.set('mode', 'mark');
    q.set('difficulty', difficulty);
    q.set('focus', stat.skill);
    return { module: gen.module, href: `/learn/market-structure/session?${q}` };
  }
  if (gen.module === 'price-action') {
    q.set('type', gen.taskType);
    q.set('difficulty', difficulty);
    q.set('focus', stat.skill);
    return { module: gen.module, href: `/learn/price-action/session?${q}` };
  }
  q.set('difficulty', difficulty);
  q.set('focus', stat.skill);
  return { module: 'challenge', href: `/learn/challenge/session?${q}` };
}

/** Рекомендация «Продолжить»: самый слабый навык; без данных о слабых — навык с наименьшей точностью среди всех; иначе null. */
export function recommend(stats: readonly SkillStat[]): { skill: SkillStat; target: TrainTarget } | null {
  const pick = selectWeak(stats)[0] ?? [...stats].filter((s) => s.recent.length > 0).sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0) || a.skill.localeCompare(b.skill))[0];
  return pick ? { skill: pick, target: trainTarget(pick) } : null;
}

export interface ModuleAccuracy {
  module: ModuleId;
  attempts: number;
  correct: number;
  accuracy: number;
  /** Ни у одного навыка модуля нет окна >= MIN_SAMPLE: показываем только итог по модулю. */
  skillsFew: boolean;
  /** Наибольшее число попыток среди навыков модуля (для «n из 5»). */
  maxSkillAttempts: number;
}

/** Точность модуля целиком (F-11): пока по навыкам мало данных, это единственный вывод для пользователя. */
export function moduleAccuracies(stats: readonly SkillStat[]): ModuleAccuracy[] {
  return MODULE_ORDER.flatMap((module) => {
    const own = stats.filter((s) => moduleOfSkill(s.skill) === module && s.attempts > 0);
    const attempts = own.reduce((n, s) => n + s.attempts, 0);
    if (attempts === 0) return [];
    const correct = own.reduce((n, s) => n + s.correct, 0);
    return [
      {
        module,
        attempts,
        correct,
        accuracy: correct / attempts,
        skillsFew: !own.some(hasEnoughData),
        maxSkillAttempts: Math.max(...own.map((s) => s.recent.length)),
      },
    ];
  });
}

/** Показывать «Тренировать»: окно достаточно или уже есть ошибки. */
export const canTrain = (s: Pick<SkillStat, 'attempts' | 'correct' | 'recent' | 'accuracy'>): boolean =>
  (s.recent.length >= MIN_SAMPLE && s.accuracy !== null) || s.correct < s.attempts;

// ---- Журнал ошибок ----

export interface ErrorExample {
  attempt: Attempt;
  /** Блок mistakes, соответствующий коду (для текста). */
  templateKey: string;
  params?: Record<string, string | number>;
}

export interface ErrorGroup {
  code: string;
  count: number;
  /** Новые первыми. */
  examples: ErrorExample[];
  lastAt: number;
}

interface StoredBlock {
  templateKey?: string;
  code?: string | null;
  params?: Record<string, string | number>;
}

/** Группы по коду ошибки из grade.errors сохранённых попыток; по убыванию числа случаев, затем по давности. */
export function buildErrorLog(attempts: readonly Attempt[], examplesPerGroup = 3): ErrorGroup[] {
  const groups = new Map<string, ErrorGroup>();
  const sorted = [...attempts].sort((a, b) => b.createdAt - a.createdAt);
  for (const a of sorted) {
    const errors = (a.grade.errors as { code: string; params?: Record<string, string | number> }[] | undefined) ?? [];
    const mistakes = ((a.grade.feedback as { mistakes?: StoredBlock[] } | undefined)?.mistakes ?? []).filter((b) => b.code);
    for (const e of errors) {
      const g = groups.get(e.code) ?? { code: e.code, count: 0, examples: [], lastAt: a.createdAt };
      g.count += 1;
      if (g.examples.length < examplesPerGroup) {
        const block = mistakes.find((b) => b.code === e.code);
        g.examples.push({
          attempt: a,
          templateKey: block?.templateKey ?? `feedback.${e.code}.mistake`,
          params: block?.params ?? e.params,
        });
      }
      groups.set(e.code, g);
    }
  }
  return [...groups.values()].sort((a, b) => b.count - a.count || b.lastAt - a.lastAt || a.code.localeCompare(b.code));
}

/** Средняя оценка качества решений Challenge (0..100) по попыткам, где она сохранена. */
export function avgQuality(attempts: readonly Attempt[]): number | null {
  const qs = attempts
    .filter((a) => a.module === 'challenge')
    .map((a) => (a.grade as { quality?: unknown }).quality)
    .filter((q): q is number => typeof q === 'number');
  return qs.length ? qs.reduce((s, q) => s + q, 0) / qs.length : null;
}
