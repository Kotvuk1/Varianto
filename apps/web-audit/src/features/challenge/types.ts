// Клиентские типы ответов /api/tasks/challenge/* (факт. схемы: server/schemas.ts, server/tasks.ts).
import type { Candle, Difficulty, Feedback, Mark, ReasonCode, SkillOutcome, TaskSymbol, TaskTimeframe } from '@tl/core';

export interface ChallengePayload {
  kind: 'challenge';
  defaultTf: TaskTimeframe;
  entryPrice: number;
  reasonOptions: ReasonCode[];
  timeLimitCandles: Record<TaskTimeframe, number>;
  hints?: Mark[];
}

export interface ChallengeTaskEnvelope {
  taskId: string;
  taskToken: string;
  difficulty: Difficulty;
  symbol: TaskSymbol;
  algoVersion: string;
  expiresAt: number;
  timeline: { mode: 'relative' | 'absolute' };
  decisionTime: number;
  series: Partial<Record<TaskTimeframe, Candle[]>>;
  payload: ChallengePayload;
}

export interface QualityPart {
  key: string;
  score: number;
}

export interface ChallengeOutcomeDto {
  side: 'LONG' | 'SHORT';
  entry: number;
  sl: number;
  tp: number;
  result: 'tp' | 'sl' | 'timeout';
  exitTime: number;
  exitPrice: number;
  rMultiple: number;
  method: 'candle' | 'drill-1m' | 'drill-aggtrades' | 'conservative-sl' | 'timeout';
}

export interface ChallengeDetailDto {
  decisionCorrect: boolean;
  waitCorrect: boolean | null;
  quality: { score: number; parts: QualityPart[] } | null;
  outcome: ChallengeOutcomeDto | null;
}

export interface ChallengeGradeResult {
  taskId: string;
  algoVersion: string;
  verdict: 'correct' | 'partial' | 'incorrect';
  score: number;
  task: {
    difficulty: Difficulty;
    symbol: TaskSymbol;
    tf: TaskTimeframe | null;
    reveal: { decisionTime: number; shiftMs: number };
  };
  skillOutcomes: SkillOutcome[];
  reference: Mark[];
  detail: { kind: 'challenge'; challenge: ChallengeDetailDto };
  feedback: Feedback;
  replay: { tf: TaskTimeframe; candles: Candle[]; exitIndex: number | null };
  resolution?: { method: ChallengeOutcomeDto['method']; triggerTime: number; triggerTf: string };
}
