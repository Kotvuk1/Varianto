// HTTP-слой заданий: rate limit -> модуль (404) -> тело (413/400) -> zod (400) -> сервис -> ответ (no-store).
import type { ModuleId } from '@tl/core';
import { ApiError, errorResponse, toApiError, validationError } from './errors';
import { clientKey, type RateLimiter } from './rate-limit';
import { GradeSchema, MODULES, NextSchemas, parseWith, readJsonBody, type NextRequest } from './schemas';
import { gradeTask, nextTask, type ServerDeps } from './tasks';

export interface HandlerDeps extends ServerDeps {
  limiter: RateLimiter;
}

function moduleOf(param: string): ModuleId {
  const m = MODULES.find((x) => x === param);
  if (!m) throw new ApiError(404, 'not_found', 'Unknown module');
  return m;
}

function guard(request: Request, limiter: RateLimiter): void {
  const d = limiter.take(clientKey(request.headers));
  if (!d.ok) throw new ApiError(429, 'rate_limited', 'Too many requests', { retryAfterSec: d.retryAfterSec });
}

async function run(request: Request, deps: HandlerDeps, work: () => Promise<unknown>): Promise<Response> {
  try {
    guard(request, deps.limiter);
    return Response.json(await work(), { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    const err = toApiError(e);
    return errorResponse(err, err.details?.retryAfterSec ? { 'Retry-After': String(err.details.retryAfterSec) } : {});
  }
}

export function handleNext(request: Request, moduleParam: string, deps: HandlerDeps): Promise<Response> {
  return run(request, deps, async () => {
    const mod = moduleOf(moduleParam);
    const body = parseWith(NextSchemas[mod], await readJsonBody(request));
    if (body.module !== undefined && body.module !== mod) throw validationError('INVALID_TYPE', 'module', 'Body module differs from path');
    return nextTask(mod, { ...body, module: mod } as NextRequest, deps);
  });
}

export function handleGrade(request: Request, moduleParam: string, deps: HandlerDeps): Promise<Response> {
  return run(request, deps, async () => {
    const mod = moduleOf(moduleParam);
    const body = parseWith(GradeSchema, await readJsonBody(request));
    return gradeTask(mod, body, deps);
  });
}
