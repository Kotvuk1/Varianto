import { TaskApiError, type Answer, type GradeResultDto, type NextBody, type TaskEnvelope, type TaskModule } from './types';

export interface TaskApi {
  next(module: TaskModule, body: NextBody): Promise<TaskEnvelope>;
  grade(module: TaskModule, taskToken: string, answer: Answer): Promise<GradeResultDto>;
}

function kindOf(status: number, code: string | undefined): TaskApiError['kind'] {
  if (status === 404) return 'no-situation';
  if (status === 429) return 'rate-limited';
  if (status === 502) return 'archive';
  if (status === 401 && code === 'token_expired') return 'expired';
  return 'generic';
}

async function post<T>(url: string, body: unknown, fetcher: typeof fetch): Promise<T> {
  let res: Response;
  try {
    res = await fetcher(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  } catch {
    throw new TaskApiError('network', 0);
  }
  if (!res.ok) {
    let code: string | undefined;
    let retry: number | null = null;
    try {
      const j = (await res.json()) as { error?: { code?: string; details?: { retryAfterSec?: number } } };
      code = j.error?.code;
      retry = j.error?.details?.retryAfterSec ?? null;
    } catch {
      /* тело не JSON */
    }
    throw new TaskApiError(kindOf(res.status, code), res.status, retry ?? (Number(res.headers.get('Retry-After')) || null));
  }
  try {
    return (await res.json()) as T;
  } catch {
    throw new TaskApiError('generic', res.status);
  }
}

/** Клиент внутренних API заданий (API_CONTRACTS §3.3-3.4). Токен задания непрозрачен. */
export function createTaskApi(fetcher: typeof fetch = (...a) => fetch(...a)): TaskApi {
  return {
    next: (module, body) => post<TaskEnvelope>(`/api/tasks/${module}/next`, body, fetcher),
    grade: (module, taskToken, answer) => post<GradeResultDto>(`/api/tasks/${module}/grade`, { taskToken, answer }, fetcher),
  };
}
