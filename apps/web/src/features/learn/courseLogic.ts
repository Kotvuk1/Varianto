// Логика списка «Обучение»: прогресс ступеней, открытие комбо (вариант C), рекомендация. Замок только в UI (CURRICULUM_STAGES §20 п. 8).
import {
  COMBO_REQUIREMENTS,
  STAGE_IDS,
  STAGE_MIN_ACCURACY,
  STAGE_MIN_ATTEMPTS,
  comboUnlock,
  computeStageProgress,
  recommendedStep,
  type ComboModule,
  type RecommendedStep,
  type StageAttempt,
  type StageId,
  type StageProgress,
} from '@tl/core';

export const STAGE_HREF: Readonly<Record<StageId, string>> = {
  1: '/learn/stage-swings',
  2: '/learn/levels',
  3: '/learn/limit-entry',
  4: '/learn/stop-take',
  5: '/learn/market-structure',
  6: '/learn/price-action',
  7: '/learn/fibonacci',
  8: '/learn/elliott',
};
export const COMBO_HREF: Readonly<Record<ComboModule, string>> = {
  'combo-level-trade': '/learn/combo-level-trade',
  'combo-smc-entry': '/learn/combo-smc-entry',
  challenge: '/learn/challenge',
};
export const COMBO_ORDER: readonly ComboModule[] = ['combo-level-trade', 'combo-smc-entry', 'challenge'];

/** Что осталось до «пройдено» одной составной ступени. */
export interface Remaining {
  stage: StageId;
  attemptsLeft: number;
  accuracy: number | null;
  /** Точность ниже порога или данных мало. */
  needAccuracy: boolean;
}

export interface StageView {
  id: StageId;
  href: string;
  progress: StageProgress;
  recommended: boolean;
}
export interface ComboView {
  module: ComboModule;
  href: string;
  open: boolean;
  legacy: boolean;
  remaining: Remaining[];
  recommended: boolean;
}
export interface CourseView {
  stages: StageView[];
  combos: ComboView[];
  recommended: RecommendedStep;
}

export function remainingOf(progress: Record<StageId, StageProgress>, required: readonly StageId[]): Remaining[] {
  return required
    .filter((id) => progress[id].status !== 'passed')
    .map((id) => {
      const p = progress[id];
      return {
        stage: id,
        attemptsLeft: Math.max(0, STAGE_MIN_ATTEMPTS - p.attempts),
        accuracy: p.accuracy,
        needAccuracy: p.fewData || p.accuracy === null || p.accuracy < STAGE_MIN_ACCURACY,
      };
    });
}

/** Попытки в любом порядке -> представление курса. */
export function buildCourse(attempts: readonly StageAttempt[]): CourseView {
  const asc = [...attempts].sort((a, b) => a.createdAt - b.createdAt);
  const progress = computeStageProgress(asc);
  const rec = recommendedStep(progress, asc);
  return {
    stages: STAGE_IDS.map((id) => ({
      id,
      href: STAGE_HREF[id],
      progress: progress[id],
      recommended: rec?.kind === 'stage' && rec.id === id,
    })),
    combos: COMBO_ORDER.map((module) => {
      const u = comboUnlock(module, progress, asc);
      return {
        module,
        href: COMBO_HREF[module],
        open: u.open,
        legacy: u.legacy && u.passed.length !== u.required.length,
        remaining: u.open ? [] : remainingOf(progress, COMBO_REQUIREMENTS[module]),
        recommended: rec?.kind === 'combo' && rec.module === module,
      };
    }),
    recommended: rec,
  };
}
