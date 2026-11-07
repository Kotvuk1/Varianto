// Клиент /api/tasks/challenge/{next,grade}. Ошибки сводятся к видам, у каждого свой текст COPY.md §5.2.
import type { Difficulty } from '@tl/core';
import type { ChallengeAnswerBody } from './position';
import type { ChallengeGradeResult, ChallengeTaskEnvelope } from './types';

export type ChallengeErrorKind = 'not-found' | 'rate' | 'archive' | 'offline' | 'expired' | 'invalid' | 'generic';

export class ChallengeApiError extends Error {
  constructor(
    readonly kind: ChallengeErrorKind,
    readonly status: number,
    readonly retryAfterSec?: number,
  ) {
    super(`${kind}:${status}`);
    this.name = 'ChallengeApiError';
  }
}

export function kindOf(status: number, code: string | undefined): ChallengeErrorKind {
  if (status === 404) return 'not-found';
  if (status === 429) return 'rate';
  if (status === 502 || code === 'archive_unavailable') return 'archive';
  if (code === 'token_expired') return 'expired';
  if (status === 400 || status === 413) return 'invalid';
  return 'generic';
}

async function post<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
      ...(signal ? { signal } : {}),
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e;
    throw new ChallengeApiError('offline', 0);
  }
  if (!res.ok) {
    let code: string | undefined;
    let retry: number | undefined;
    try {
      const j = (await res.json()) as { error?: { code?: string; details?: { retryAfterSec?: number } } };
      code = j.error?.code;
      retry = j.error?.details?.retryAfterSec;
    } catch {
      /* тело не JSON */
    }
    throw new ChallengeApiError(kindOf(res.status, code), res.status, retry);
  }
  return (await res.json()) as T;
}

export function fetchNext(difficulty: Difficulty, exclude: string[] = [], signal?: AbortSignal, focus: string[] = []): Promise<ChallengeTaskEnvelope> {
  return post(
    '/api/tasks/challenge/next',
    { difficulty, ...(exclude.length ? { exclude: exclude.slice(-200) } : {}), ...(focus.length ? { focus } : {}) },
    signal,
  );
}

export function gradeChallenge(taskToken: string, answer: ChallengeAnswerBody): Promise<ChallengeGradeResult> {
  return post('/api/tasks/challenge/grade', { taskToken, answer });
}
