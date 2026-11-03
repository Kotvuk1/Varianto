// Жизненный цикл задания: next -> ответ -> grade -> сохранение попытки (PRD 7.2, 7.4). Состояние - zustand (vanilla).
import { createStore, type StoreApi } from 'zustand/vanilla';
import type { Repository } from '@/storage';
import { saveTaskAttempt } from './attempt';
import type { TaskApi } from './api';
import { TaskApiError, type Answer, type GradeResultDto, type NextBody, type TaskEnvelope, type TaskModule } from './types';

export type FlowPhase = 'loading' | 'ready' | 'grading' | 'graded' | 'failed';

export interface FlowState {
  phase: FlowPhase;
  envelope: TaskEnvelope | null;
  result: GradeResultDto | null;
  /** Ошибка получения задания (phase = failed). */
  error: TaskApiError | null;
  /** Ошибка проверки: задание остаётся на экране, ответ не потерян. */
  gradeError: TaskApiError | null;
  saveFailed: boolean;
  /** Решено в этой сессии (для номера задания). */
  solved: number;
  load(): Promise<void>;
  submit(answer: Answer): Promise<void>;
}

export interface FlowDeps {
  api: TaskApi;
  repo: Repository;
  module: TaskModule;
  body: () => NextBody;
  now?: () => number;
}

const MAX_EXCLUDE = 200;

export function createTaskFlow(deps: FlowDeps): StoreApi<FlowState> {
  const now = deps.now ?? (() => Date.now());
  let seen: string[] = [];
  let startedAt = 0;
  let ticket = 0;
  const toError = (e: unknown) => (e instanceof TaskApiError ? e : new TaskApiError('generic', 0));

  return createStore<FlowState>((set, get) => ({
    phase: 'loading',
    envelope: null,
    result: null,
    error: null,
    gradeError: null,
    saveFailed: false,
    solved: 0,

    async load() {
      const mine = ++ticket;
      set({ phase: 'loading', envelope: null, result: null, error: null, gradeError: null, saveFailed: false });
      try {
        const body = deps.body();
        const envelope = await deps.api.next(deps.module, seen.length ? { ...body, exclude: seen.slice(-MAX_EXCLUDE) } : body);
        if (mine !== ticket) return;
        seen = [...seen, envelope.taskId];
        startedAt = now();
        set({ phase: 'ready', envelope });
      } catch (e) {
        if (mine !== ticket) return;
        set({ phase: 'failed', error: toError(e) });
      }
    },

    async submit(answer) {
      const { envelope, phase } = get();
      if (!envelope || phase !== 'ready') return;
      const mine = ticket;
      set({ phase: 'grading', gradeError: null });
      let result: GradeResultDto;
      try {
        result = await deps.api.grade(deps.module, envelope.taskToken, answer);
      } catch (e) {
        if (mine !== ticket) return;
        set({ phase: 'ready', gradeError: toError(e) });
        return;
      }
      if (mine !== ticket) return;
      let saveFailed = false;
      try {
        await saveTaskAttempt(deps.repo, { envelope, answer, grade: result, startedAt, now: now() });
      } catch {
        saveFailed = true;
      }
      if (mine !== ticket) return;
      set((s) => ({ phase: 'graded', result, saveFailed, solved: s.solved + 1 }));
    },
  }));
}
