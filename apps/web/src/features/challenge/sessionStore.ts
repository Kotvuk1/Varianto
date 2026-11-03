// Состояние сессии Challenge (zustand, vanilla-store на экран): фаза, решение, проигрывание.
import { createStore } from 'zustand/vanilla';
import { atr14, type ReasonCode, type TaskTimeframe } from '@tl/core';
import { tickSizeFor } from '@/chart/priceFormat';
import type { ChallengeApiError } from './api';
import { defaultLevels, roundToTick, type Side } from './position';
import type { ChallengeGradeResult, ChallengeTaskEnvelope } from './types';

export type Phase = 'loading' | 'error' | 'decide' | 'grading' | 'replay' | 'result';
export const SPEEDS = [1, 4, 16] as const;
export type Speed = (typeof SPEEDS)[number];

export interface SessionState {
  phase: Phase;
  error: ChallengeApiError | null;
  gradeError: ChallengeApiError | null;
  task: ChallengeTaskEnvelope | null;
  tf: TaskTimeframe;
  side: Side | null;
  sl: number | null;
  tp: number | null;
  reasons: ReasonCode[];
  note: string;
  reasonsOpen: boolean;
  grade: ChallengeGradeResult | null;
  /** Сколько свечей проигрывания показано. */
  played: number;
  paused: boolean;
  speed: Speed;
  resultOpen: boolean;
  saveFailed: boolean;
}

export interface SessionActions {
  start(): void;
  loaded(task: ChallengeTaskEnvelope, startTf: TaskTimeframe | 'auto'): void;
  failed(e: ChallengeApiError): void;
  setTf(tf: TaskTimeframe): void;
  setSide(side: Side): void;
  setLevels(sl: number, tp: number): void;
  toggleReason(r: ReasonCode): void;
  setNote(n: string): void;
  setReasonsOpen(o: boolean): void;
  grading(): void;
  gradeFailed(e: ChallengeApiError): void;
  graded(g: ChallengeGradeResult): void;
  tick(): void;
  skip(): void;
  setPaused(p: boolean): void;
  setSpeed(s: Speed): void;
  setResultOpen(o: boolean): void;
  setSaveFailed(f: boolean): void;
}

const INITIAL: SessionState = {
  phase: 'loading',
  error: null,
  gradeError: null,
  task: null,
  tf: '1h',
  side: null,
  sl: null,
  tp: null,
  reasons: [],
  note: '',
  reasonsOpen: false,
  grade: null,
  played: 0,
  paused: false,
  speed: 4,
  resultOpen: false,
  saveFailed: false,
};

/** ATR14 последней закрытой свечи ряда; если рядов мало - 0.5% входа. */
export function atrOf(task: ChallengeTaskEnvelope, tf: TaskTimeframe): number {
  const candles = (task.series[tf] ?? []).filter((c) => c.closed);
  const a = atr14(candles);
  const last = a[a.length - 1];
  return typeof last === 'number' && last > 0 ? last : task.payload.entryPrice * 0.005;
}

export function createSessionStore() {
  return createStore<SessionState & SessionActions>()((set, get) => ({
    ...INITIAL,
    start: () => set({ ...INITIAL, speed: get().speed }),
    loaded: (task, startTf) =>
      set({ ...INITIAL, speed: get().speed, phase: 'decide', task, tf: startTf === 'auto' ? task.payload.defaultTf : startTf }),
    failed: (error) => set({ phase: 'error', error }),
    setTf: (tf) => set({ tf }),
    setSide: (side) => {
      const { task, tf, side: prev, sl, tp, reasons } = get();
      if (!task || side === prev) return;
      const next: Partial<SessionState> = { side };
      // Причины зависят от стороны: при WAIT доступны только две.
      next.reasons = side === 'WAIT' ? reasons.filter((r) => r === 'range-no-edge' || r === 'unclear-structure') : reasons;
      if (side === 'WAIT') {
        next.sl = null;
        next.tp = null;
      } else if (sl === null || tp === null || prev === 'WAIT' || prev === null || prev !== side) {
        const lv = defaultLevels(side, task.payload.entryPrice, atrOf(task, tf), tickSizeFor(task.symbol));
        next.sl = lv.sl;
        next.tp = lv.tp;
      }
      set(next);
    },
    setLevels: (sl, tp) => {
      const task = get().task;
      if (!task) return;
      const tick = tickSizeFor(task.symbol);
      set({ sl: roundToTick(sl, tick), tp: roundToTick(tp, tick) });
    },
    toggleReason: (r) => {
      const { reasons } = get();
      set({ reasons: reasons.includes(r) ? reasons.filter((x) => x !== r) : [...reasons, r].slice(0, 8) });
    },
    setNote: (note) => set({ note: note.slice(0, 500) }),
    setReasonsOpen: (reasonsOpen) => set({ reasonsOpen }),
    grading: () => set({ phase: 'grading', gradeError: null }),
    gradeFailed: (gradeError) => set({ phase: 'decide', gradeError }),
    graded: (grade) =>
      set({
        phase: 'replay',
        grade,
        tf: grade.replay.tf,
        played: 0,
        paused: false,
        reasonsOpen: false,
        gradeError: null,
      }),
    tick: () => {
      const { grade, played, phase } = get();
      if (phase !== 'replay' || !grade) return;
      const total = grade.replay.candles.length;
      if (played >= total) set({ phase: 'result', resultOpen: true });
      else set({ played: played + 1 });
    },
    skip: () => {
      const { grade, phase } = get();
      if (phase !== 'replay' || !grade) return;
      set({ played: grade.replay.candles.length, phase: 'result', resultOpen: true });
    },
    setPaused: (paused) => set({ paused }),
    setSpeed: (speed) => set({ speed }),
    setResultOpen: (resultOpen) => set({ resultOpen }),
    setSaveFailed: (saveFailed) => set({ saveFailed }),
  }));
}

export type SessionStore = ReturnType<typeof createSessionStore>;
