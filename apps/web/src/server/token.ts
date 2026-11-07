// Токен задания (API_CONTRACTS §3.5, ADR-0005): v1.<header>.<sealed>.<mac>.
// header - открытый JSON; sealed - AES-256-GCM (iv|ct|tag) от секретной части, header как AAD; mac - HMAC-SHA256.
// Ключи выводятся из TASK_SIGNING_SECRET через HKDF-SHA256 с разными метками. Только сервер (node:crypto).
import { createCipheriv, createDecipheriv, createHmac, hkdfSync, randomBytes, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { ALGO_VERSION } from '@tl/core';
import { ApiError, ConfigError } from './errors';

export const TOKEN_VERSION = 'v1';
export const TOKEN_TTL_MS = 24 * 3_600_000;
const MIN_SECRET_LENGTH = 32;
const DEV_SECRET = 'trading-lab-DEV-ONLY-signing-secret-do-not-use-in-production';

const HeaderSchema = z
  .object({
    module: z.enum([
      'market-structure', 'price-action', 'challenge', 'fibonacci', 'elliott',
      'stage-swings', 'levels', 'limit-entry', 'stop-take', 'combo-level-trade', 'combo-smc-entry',
    ]),
    symbol: z.enum(['BTCUSDT', 'ETHUSDT', 'SOLUSDT']),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    algoVersion: z.string(),
    iat: z.number().int(),
    exp: z.number().int(),
  })
  .strict();
export type TokenHeader = z.infer<typeof HeaderSchema>;

const SealedSchema = z
  .object({
    T: z.number().int(),
    seed: z.number().int(),
    shiftMs: z.number().int(),
    tf: z.enum(['15m', '1h', '4h', '1d']).optional(),
    params: z.record(z.string(), z.unknown()),
  })
  .strict();
export type SealedPayload = z.infer<typeof SealedSchema>;

export interface OpenedToken {
  header: TokenHeader;
  sealed: SealedPayload;
}

let devWarned = false;

/** Секрет из env. production без секрета -> ConfigError (500, не молча); dev/test -> явный dev-ключ с предупреждением. */
export function getSigningSecret(env: NodeJS.ProcessEnv = process.env): string {
  const s = env.TASK_SIGNING_SECRET;
  if (s && s.length >= MIN_SECRET_LENGTH) return s;
  // На Vercel (любой NODE_ENV/VERCEL_ENV) и в production dev-ключ недопустим.
  if (env.NODE_ENV === 'production' || env.VERCEL || env.VERCEL_ENV) {
    console.error(`[token] TASK_SIGNING_SECRET is missing or shorter than ${MIN_SECRET_LENGTH} chars in production/Vercel`);
    throw new ConfigError('TASK_SIGNING_SECRET is not configured');
  }
  if (!devWarned && env.NODE_ENV !== 'test') {
    devWarned = true;
    console.warn('[token] TASK_SIGNING_SECRET not set: using INSECURE dev key (development only)');
  }
  return DEV_SECRET;
}

interface Keys {
  enc: Buffer;
  mac: Buffer;
  id: Buffer;
}
const keyCache = new Map<string, Keys>();

function derive(secret: string, info: string): Buffer {
  return Buffer.from(hkdfSync('sha256', secret, 'trading-lab/task-token/v1', info, 32));
}
function keysFor(secret: string): Keys {
  let k = keyCache.get(secret);
  if (!k) {
    k = { enc: derive(secret, 'aes-256-gcm'), mac: derive(secret, 'hmac-sha256'), id: derive(secret, 'task-id') };
    if (keyCache.size > 8) keyCache.clear();
    keyCache.set(secret, k);
  }
  return k;
}

const b64 = (b: Buffer | string) => Buffer.from(b).toString('base64url');
const invalid = () => new ApiError(401, 'invalid_token_signature', 'Invalid task token');

export interface SealInput {
  header: Omit<TokenHeader, 'algoVersion' | 'iat' | 'exp'> & Partial<Pick<TokenHeader, 'algoVersion'>>;
  sealed: SealedPayload;
  now: number;
  secret?: string;
  /** Для тестов: фиксированный iv. */
  iv?: Buffer;
}

export function seal(input: SealInput): { token: string; header: TokenHeader } {
  const keys = keysFor(input.secret ?? getSigningSecret());
  const header: TokenHeader = {
    ...input.header,
    algoVersion: input.header.algoVersion ?? ALGO_VERSION,
    iat: input.now,
    exp: input.now + TOKEN_TTL_MS,
  };
  const h = b64(JSON.stringify(header));
  const iv = input.iv ?? randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', keys.enc, iv);
  cipher.setAAD(Buffer.from(`${TOKEN_VERSION}.${h}`));
  const ct = Buffer.concat([cipher.update(JSON.stringify(input.sealed), 'utf8'), cipher.final()]);
  const s = b64(Buffer.concat([iv, ct, cipher.getAuthTag()]));
  const mac = b64(createHmac('sha256', keys.mac).update(`${TOKEN_VERSION}.${h}.${s}`).digest());
  return { token: `${TOKEN_VERSION}.${h}.${s}.${mac}`, header };
}

/** Проверяет MAC, расшифровывает, сверяет срок и версию алгоритма. Ошибки -> ApiError 401. */
export function open(token: string, now: number, secret?: string): OpenedToken {
  const parts = token.split('.');
  if (parts.length !== 4 || parts[0] !== TOKEN_VERSION) throw invalid();
  const [, h, s, m] = parts as [string, string, string, string];
  const keys = keysFor(secret ?? getSigningSecret());
  const expected = createHmac('sha256', keys.mac).update(`${TOKEN_VERSION}.${h}.${s}`).digest();
  const given = Buffer.from(m, 'base64url');
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) throw invalid();

  let header: TokenHeader;
  let sealed: SealedPayload;
  try {
    header = HeaderSchema.parse(JSON.parse(Buffer.from(h, 'base64url').toString('utf8')));
    const raw = Buffer.from(s, 'base64url');
    if (raw.length < 12 + 16) throw invalid();
    const decipher = createDecipheriv('aes-256-gcm', keys.enc, raw.subarray(0, 12));
    decipher.setAAD(Buffer.from(`${TOKEN_VERSION}.${h}`));
    decipher.setAuthTag(raw.subarray(raw.length - 16));
    const pt = Buffer.concat([decipher.update(raw.subarray(12, raw.length - 16)), decipher.final()]);
    sealed = SealedSchema.parse(JSON.parse(pt.toString('utf8')));
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw invalid();
  }
  if (header.exp <= now) throw new ApiError(401, 'token_expired', 'Task token expired');
  // Политика ADR-0005: эталон другой версии алгоритма не пересчитываем - токен считается просроченным.
  if (header.algoVersion !== ALGO_VERSION) throw new ApiError(401, 'token_expired', 'Task token was issued for another algorithm version');
  return { header, sealed };
}

/** Непрозрачный taskId: HMAC(module|symbol|T). Не раскрывает T (в отличие от открытого хэша: сетка T перебирается). */
export function taskIdFor(module: string, symbol: string, T: number, secret?: string): string {
  const keys = keysFor(secret ?? getSigningSecret());
  return createHmac('sha256', keys.id).update(`${module}|${symbol}|${T}`).digest().subarray(0, 12).toString('base64url');
}
