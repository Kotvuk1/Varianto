// Боевые зависимости сервера заданий (singleton на инстанс): загрузчик архива с LRU, rate limit, seed из randomUUID.
import { randomUUID } from 'node:crypto';
import type { HandlerDeps } from './handlers';
import { RateLimiter } from './rate-limit';
import { ArchiveLoader } from './sources';

let deps: HandlerDeps | undefined;

export function getDeps(): HandlerDeps {
  deps ??= {
    loader: new ArchiveLoader(),
    now: () => Date.now(),
    newSeed: () => parseInt(randomUUID().replace(/-/g, '').slice(0, 8), 16),
    limiter: new RateLimiter({ capacity: 30, refillPerMin: 30 }),
  };
  return deps;
}
