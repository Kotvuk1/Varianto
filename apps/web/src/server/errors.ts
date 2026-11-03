// Единая модель ошибок серверных API (API_CONTRACTS §1.1).
import { ArchiveError } from '@tl/market-data';

export type ApiErrorCode =
  | 'validation_failed'
  | 'invalid_token_signature'
  | 'token_expired'
  | 'not_found'
  | 'payload_too_large'
  | 'rate_limited'
  | 'internal_error'
  | 'archive_unavailable';

export interface ValidationIssue {
  path: string;
  code: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiErrorCode,
    message: string,
    readonly details?: { issues?: ValidationIssue[]; retryAfterSec?: number },
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const validationError = (code: string, path: string, message = code): ApiError =>
  new ApiError(400, 'validation_failed', 'Invalid request', { issues: [{ path, code, message }] });

/** Ошибка конфигурации сервера (например, нет секрета в production): 500 без деталей наружу. */
export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export function errorResponse(e: ApiError, extraHeaders: Record<string, string> = {}): Response {
  return Response.json(
    { error: { code: e.code, message: e.message, ...(e.details ? { details: e.details } : {}) } },
    { status: e.status, headers: { 'Cache-Control': 'no-store', ...extraHeaders } },
  );
}

/** Любое исключение -> ApiError (ARCHIVE -> 404/502, прочее -> 500 без деталей). */
export function toApiError(e: unknown): ApiError {
  if (e instanceof ApiError) return e;
  if (e instanceof ArchiveError) {
    return e.code === 'not_found'
      ? new ApiError(404, 'not_found', 'Archive data not found')
      : new ApiError(502, 'archive_unavailable', `Archive error: ${e.code}`);
  }
  console.error('[api] unhandled error', e instanceof Error ? `${e.name}: ${e.message}` : 'unknown');
  return new ApiError(500, 'internal_error', 'Internal error');
}
