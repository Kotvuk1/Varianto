// Сохранение попытки (API_CONTRACTS §7, DATABASE_SCHEMA): только публичные поля, без taskToken и расшифрованного состояния.
import { localDay } from '@/i18n/format';
import type { Attempt, Repository } from '@/storage';
import type { Answer, GradeResultDto, TaskEnvelope } from './types';

export interface BuildAttemptInput {
  envelope: TaskEnvelope;
  answer: Answer;
  grade: GradeResultDto;
  startedAt: number;
  now: number;
  id?: string;
}

export function buildAttempt({ envelope, answer, grade, startedAt, now, id }: BuildAttemptInput): Attempt {
  const skills = [...new Set(grade.skillOutcomes.map((o) => o.skill))];
  return {
    id: id ?? globalThis.crypto.randomUUID(),
    module: envelope.module,
    taskId: envelope.taskId,
    task: {
      kind: envelope.payload.kind,
      difficulty: envelope.difficulty,
      symbol: envelope.symbol,
      tf: envelope.payload.tf,
      decisionTime: envelope.decisionTime,
    },
    answer,
    grade: grade as unknown as Attempt['grade'],
    algoVersion: grade.algoVersion,
    skills,
    correct: grade.verdict === 'correct',
    rMultiple: null,
    localDay: localDay(now),
    durationMs: Math.max(0, now - startedAt),
    createdAt: now,
    updatedAt: now,
  };
}

/** Сохраняет попытку; навыки и дневная активность обновляются транзакцией LocalRepository.saveAttempt. */
export async function saveTaskAttempt(repo: Repository, input: BuildAttemptInput): Promise<Attempt> {
  const attempt = buildAttempt(input);
  await repo.saveAttempt(attempt);
  return attempt;
}
