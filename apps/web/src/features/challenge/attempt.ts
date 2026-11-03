// Сборка Attempt для LocalRepository. Навыки, дневная активность и статистика обновляются в saveAttempt.
import type { Attempt } from '@/storage';
import { localDay } from '@/i18n/format';
import type { ChallengeAnswerBody } from './position';
import type { ChallengeGradeResult, ChallengeTaskEnvelope } from './types';

export function buildAttempt(
  task: ChallengeTaskEnvelope,
  answer: ChallengeAnswerBody,
  result: ChallengeGradeResult,
  now: number,
  durationMs: number | null,
  id: string,
): Attempt {
  const d = result.detail.challenge;
  // Свечи проигрывания не хранятся (API_CONTRACTS §5.1: Attempt.grade = Omit<GradeResult, 'replay'>).
  const { replay: _replay, ...grade } = result;
  void _replay;
  return {
    id,
    module: 'challenge',
    taskId: task.taskId,
    task: {
      difficulty: task.difficulty,
      symbol: task.symbol,
      defaultTf: task.payload.defaultTf,
      entryPrice: task.payload.entryPrice,
      reveal: result.task.reveal,
    },
    answer,
    grade: { ...grade, quality: d.quality?.score ?? null, verdict: result.verdict, skillOutcomes: result.skillOutcomes },
    algoVersion: result.algoVersion,
    skills: [...new Set(result.skillOutcomes.map((o) => o.skill))],
    correct: d.decisionCorrect,
    rMultiple: d.outcome ? d.outcome.rMultiple : null,
    localDay: localDay(now),
    durationMs,
    createdAt: now,
    updatedAt: now,
  };
}
