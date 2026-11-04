// Боевые зависимости сервера заданий (singleton на инстанс): загрузчик архива с LRU, rate limit, seed из randomUUID.
import { randomUUID } from 'node:crypto';
import type { HandlerDeps } from './handlers';
import { RateLimiter } from './rate-limit';
import { ArchiveLoader } from './sources';

/** Положительное целое из env, иначе дефолт (production-значения: 30 и 120 в минуту). */
export function rateFromEnv(name: string, def: number, env: NodeJS.ProcessEnv = process.env): number {
  const n = Number(env[name]);
  return Number.isInteger(n) && n > 0 ? n : def;
}

let deps: HandlerDeps | undefined;

export function getDeps(): HandlerDeps {
  const tasks = rateFromEnv('RATE_LIMIT_TASKS_PER_MIN', 30);
  deps ??= {
    loader: new ArchiveLoader(),
    now: () => Date.now(),
    newSeed: () => parseInt(randomUUID().replace(/-/g, '').slice(0, 8), 16),
    limiter: new RateLimiter({ capacity: tasks, refillPerMin: tasks }),
  };
  return deps;
}

// /api/history: 120 запросов/мин на клиента (SECURITY_REVIEW п. 3).
let historyLimiter: RateLimiter | undefined;
export function getHistoryLimiter(): RateLimiter {
  historyLimiter ??= new RateLimiter({
    capacity: rateFromEnv('RATE_LIMIT_HISTORY_PER_MIN', 120),
    refillPerMin: rateFromEnv('RATE_LIMIT_HISTORY_PER_MIN', 120),
  });
  return historyLimiter;
}
