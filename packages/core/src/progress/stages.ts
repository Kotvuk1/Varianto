// Прогресс курса из ступеней, правило «пройдено» и открытие комбинированных модулей (CURRICULUM_STAGES.md §10).
// Чистые функции: клиент вычисляет прогресс из `Repository.listAttempts` (хронологически), новых таблиц нет.
import type { ModuleId, SkillId, SkillOutcome, UtcMs } from '../types';
import { MIN_SAMPLE, WINDOW_N, generatorForSkill, isOutcomeOk, rankWeakSkills, shouldSuggestHarder, type SkillGenerator, type SkillStat } from './skills';

export const STAGE_MIN_ATTEMPTS = 10;
export const STAGE_MIN_ACCURACY = 0.7;
export const SKILL_FLOOR = 0.5;

export type StageId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export const STAGE_IDS: readonly StageId[] = [1, 2, 3, 4, 5, 6, 7, 8];

export interface StageDef {
  id: StageId;
  /** Модули попыток, относящихся к ступени (включая старые попытки до перестройки). */
  modules: readonly ModuleId[];
  /** Ключевые навыки: критерий «пройдено». */
  core: readonly SkillId[];
  /** Информационные навыки (вероятностные): в критерий не входят. */
  info: readonly SkillId[];
}

/** §10.2. */
export const STAGES: Readonly<Record<StageId, StageDef>> = {
  1: { id: 1, modules: ['stage-swings', 'market-structure'], core: ['swing', 'structure-labels', 'swing-trend'], info: [] },
  2: { id: 2, modules: ['levels', 'price-action'], core: ['pa-level', 'level-zone'], info: ['level-reaction'] },
  3: { id: 3, modules: ['limit-entry'], core: ['limit-placement'], info: ['limit-fill'] },
  4: { id: 4, modules: ['stop-take'], core: ['stop-placement', 'take-profit', 'risk-reward'], info: [] },
  5: { id: 5, modules: ['market-structure'], core: ['bos', 'choch', 'internal-external', 'sweep', 'order-block', 'fvg'], info: [] },
  6: { id: 6, modules: ['price-action'], core: ['pa-engulfing', 'pa-pin-bar', 'pa-inside-bar', 'pa-doji', 'pa-star', 'pa-context'], info: [] },
  7: { id: 7, modules: ['fibonacci'], core: ['fib-anchor', 'fib-extension', 'premium-discount'], info: ['fib-reaction'] },
  8: { id: 8, modules: ['elliott'], core: ['ew-impulse', 'ew-correction', 'ew-rules', 'ew-invalidation'], info: [] },
};

export type ComboModule = 'combo-level-trade' | 'combo-smc-entry' | 'challenge';
/** §10.3 (с учётом решения оркестратора §20 п. 8): ступени, нужные для открытия комбо. */
export const COMBO_REQUIREMENTS: Readonly<Record<ComboModule, readonly StageId[]>> = {
  'combo-level-trade': [2, 3, 4],
  'combo-smc-entry': [3, 4, 5],
  challenge: [1, 2, 3, 4, 5],
};

/** Минимальная форма попытки для расчёта (совместима с `Attempt` хранилища). */
export interface StageAttempt {
  module: string;
  createdAt: UtcMs;
  grade?: { skillOutcomes?: readonly { skill: string; correct: number; total: number }[] | undefined } | null;
}

export type StageStatus = 'not-started' | 'in-progress' | 'passed';

export interface StageProgress {
  id: StageId;
  /** Попытки, засчитанные ступени (модуль из списка + ключевой навык среди исходов). */
  attempts: number;
  /** Число исходов в пуле точности. */
  sample: number;
  /** Доля верных исходов пула ключевых навыков (окно последних 20 на навык); null — исходов нет. */
  accuracy: number | null;
  passedAt: UtcMs | null;
  status: StageStatus;
  /** Шкала 0..1 для полосы прогресса. */
  progress: number;
  /** «Мало данных»: в пуле меньше 10 исходов. */
  fewData: boolean;
}

function stagesOf(a: StageAttempt): StageDef[] {
  const outcomes = a.grade?.skillOutcomes ?? [];
  return STAGE_IDS.map((id) => STAGES[id]).filter((s) => s.modules.includes(a.module as ModuleId) && outcomes.some((o) => (s.core as readonly string[]).includes(o.skill)));
}

/**
 * §10.3: попытки по возрастанию `createdAt`. «Пройдено» (`passedAt`) необратимо: ≥ 10 засчитанных попыток, ≥ 10 исходов,
 * точность пула ≥ 70% и ни один ключевой навык с ≥ 5 исходами не ниже 50%.
 */
export function computeStageProgress(attemptsAsc: readonly StageAttempt[]): Record<StageId, StageProgress> {
  const st = Object.fromEntries(
    STAGE_IDS.map((id) => [id, { id, attempts: 0, sample: 0, accuracy: null, passedAt: null, status: 'not-started', progress: 0, fewData: true } as StageProgress]),
  ) as Record<StageId, StageProgress>;
  const win = Object.fromEntries(STAGE_IDS.map((id) => [id, {} as Record<string, boolean[]>])) as Record<StageId, Record<string, boolean[]>>;
  for (const a of attemptsAsc) {
    for (const def of stagesOf(a)) {
      const s = st[def.id];
      s.attempts++;
      for (const o of a.grade?.skillOutcomes ?? []) {
        if (!(def.core as readonly string[]).includes(o.skill)) continue;
        win[def.id][o.skill] = [...(win[def.id][o.skill] ?? []), isOutcomeOk(o as SkillOutcome)].slice(-WINDOW_N);
      }
      const windows = Object.values(win[def.id]);
      const all = windows.flat();
      s.sample = all.length;
      s.accuracy = all.length > 0 ? all.filter(Boolean).length / all.length : null;
      const floorOk = windows.every((w) => w.length < MIN_SAMPLE || w.filter(Boolean).length / w.length >= SKILL_FLOOR);
      if (s.passedAt === null && s.attempts >= STAGE_MIN_ATTEMPTS && all.length >= 10 && (s.accuracy ?? 0) >= STAGE_MIN_ACCURACY && floorOk) {
        s.passedAt = a.createdAt;
      }
    }
  }
  for (const id of STAGE_IDS) {
    const s = st[id];
    s.fewData = s.sample < 10;
    s.status = s.passedAt !== null ? 'passed' : s.attempts === 0 ? 'not-started' : 'in-progress';
    s.progress =
      s.passedAt !== null
        ? 1
        : 0.5 * Math.min(1, s.attempts / STAGE_MIN_ATTEMPTS) + 0.5 * Math.min(1, (s.accuracy ?? 0) / STAGE_MIN_ACCURACY);
  }
  return st;
}

export interface ComboUnlock {
  module: ComboModule;
  open: boolean;
  required: readonly StageId[];
  /** Пройденные из required. */
  passed: readonly StageId[];
  /** Открыт по сохранению доступа (challenge: попытки до релиза курса). */
  legacy: boolean;
}

/** §10.3: комбо открыто, когда пройдены все составные ступени; Challenge сохраняется у тех, кто уже торговал в нём. */
export function comboUnlock(
  module: ComboModule,
  progress: Record<StageId, StageProgress>,
  attempts: readonly StageAttempt[] = [],
  courseReleaseAt?: UtcMs,
): ComboUnlock {
  const required = COMBO_REQUIREMENTS[module];
  const passed = required.filter((id) => progress[id].status === 'passed');
  const legacy = module === 'challenge' && attempts.some((a) => a.module === 'challenge' && (courseReleaseAt === undefined || a.createdAt < courseReleaseAt));
  return { module, open: passed.length === required.length || legacy, required, passed, legacy };
}

export type RecommendedStep = { kind: 'stage'; id: StageId } | { kind: 'combo'; module: ComboModule } | null;

/** §10.3: первая по номеру ступень 1-8, не «пройдено»; если все пройдены - первое открытое комбо с < 10 попыток. */
export function recommendedStep(
  progress: Record<StageId, StageProgress>,
  attempts: readonly StageAttempt[] = [],
  courseReleaseAt?: UtcMs,
): RecommendedStep {
  const next = STAGE_IDS.find((id) => progress[id].status !== 'passed');
  if (next !== undefined) return { kind: 'stage', id: next };
  for (const module of ['combo-level-trade', 'combo-smc-entry', 'challenge'] as const) {
    const n = attempts.filter((a) => a.module === module).length;
    if (comboUnlock(module, progress, attempts, courseReleaseAt).open && n < STAGE_MIN_ATTEMPTS) return { kind: 'combo', module };
  }
  return null;
}

export interface StageNextTask {
  skill: SkillId;
  generator: SkillGenerator;
  /** Предложить повышение сложности (точность ≥ 0.8 на полном окне). */
  harder: boolean;
}

/** §10.3: внутри ступени - генератор самого слабого ключевого навыка (rankWeakSkills), иначе первый ключевой. */
export function stageNextTask(id: StageId, stats: readonly SkillStat[], seed = 0): StageNextTask {
  const core = STAGES[id].core;
  const own = stats.filter((s) => core.includes(s.skill));
  const weakest = rankWeakSkills(own)[0];
  const skill = weakest?.skill ?? core.find((c) => !own.some((o) => o.skill === c)) ?? core[0]!;
  return { skill, generator: generatorForSkill(skill, seed), harder: weakest ? shouldSuggestHarder(weakest) : false };
}
