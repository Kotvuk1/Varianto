// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ALGO_VERSION } from '@tl/core';
import { ApiError, ConfigError } from './errors';
import { getSigningSecret, open, seal, taskIdFor, TOKEN_TTL_MS } from './token';

const SECRET = 'unit-test-secret-0123456789abcdef';
const NOW = Date.UTC(2026, 10, 3, 12);
const header = { module: 'challenge', symbol: 'BTCUSDT', difficulty: 'easy' } as const;
const sealed = { T: Date.UTC(2026, 9, 20), seed: 12345, shiftMs: 86_400_000 * 100, params: { kind: 'challenge', entry: 81903.3 } };
const make = () => seal({ header, sealed, now: NOW, secret: SECRET }).token;
const status = (fn: () => unknown) => {
  try {
    fn();
  } catch (e) {
    expect(e).toBeInstanceOf(ApiError);
    return { status: (e as ApiError).status, code: (e as ApiError).code };
  }
  throw new Error('no throw');
};

afterEach(() => vi.restoreAllMocks());

describe('token: seal/open', () => {
  it('круговой обход: header открыт, sealed восстановлен', () => {
    const { token, header: h } = seal({ header, sealed, now: NOW, secret: SECRET });
    expect(token.startsWith('v1.')).toBe(true);
    expect(h).toMatchObject({ ...header, algoVersion: ALGO_VERSION, iat: NOW, exp: NOW + TOKEN_TTL_MS });
    const o = open(token, NOW + 1000, SECRET);
    expect(o.header).toEqual(h);
    expect(o.sealed).toEqual(sealed);
  });

  it('T не читается из токена без ключа (нет в base64-сегментах)', () => {
    const token = make();
    const decoded = token.split('.').slice(1, 3).map((p) => Buffer.from(p, 'base64url').toString('latin1')).join('|');
    expect(decoded).not.toContain(String(sealed.T));
    expect(decoded).not.toContain('shiftMs');
  });

  it('подмена любого байта в header, sealed, mac -> 401 invalid_token_signature', () => {
    const parts = make().split('.');
    for (const idx of [1, 2, 3]) {
      const p = [...parts];
      const buf = Buffer.from(p[idx]!, 'base64url');
      buf[Math.floor(buf.length / 2)]! ^= 0x01;
      p[idx] = buf.toString('base64url');
      expect(status(() => open(p.join('.'), NOW, SECRET)), `сегмент ${idx}`).toEqual({ status: 401, code: 'invalid_token_signature' });
    }
  });

  it('мусор, неизвестная версия, чужой секрет -> 401 invalid_token_signature', () => {
    const t = make();
    for (const bad of ['', 'abc', 'v2.a.b.c', t.replace(/^v1/, 'v2'), `${t}.x`]) {
      expect(status(() => open(bad, NOW, SECRET))).toEqual({ status: 401, code: 'invalid_token_signature' });
    }
    expect(status(() => open(t, NOW, 'another-secret-0123456789abcdef'))).toEqual({ status: 401, code: 'invalid_token_signature' });
  });

  it('просрочка (exp = iat + 24 ч) -> 401 token_expired', () => {
    const t = make();
    expect(() => open(t, NOW + TOKEN_TTL_MS - 1, SECRET)).not.toThrow();
    expect(status(() => open(t, NOW + TOKEN_TTL_MS, SECRET))).toEqual({ status: 401, code: 'token_expired' });
  });

  it('другая версия алгоритма -> 401 token_expired', () => {
    const t = seal({ header: { ...header, algoVersion: '0.0.1' }, sealed, now: NOW, secret: SECRET }).token;
    expect(status(() => open(t, NOW, SECRET))).toEqual({ status: 401, code: 'token_expired' });
  });

  it('два токена с одним содержимым различаются (случайный iv)', () => {
    expect(make()).not.toBe(make());
  });
});

describe('taskId', () => {
  it('детерминирован, зависит от секрета и T, не содержит T', () => {
    const a = taskIdFor('challenge', 'BTCUSDT', 1_000_000, SECRET);
    expect(taskIdFor('challenge', 'BTCUSDT', 1_000_000, SECRET)).toBe(a);
    expect(taskIdFor('challenge', 'BTCUSDT', 1_000_900, SECRET)).not.toBe(a);
    expect(taskIdFor('challenge', 'BTCUSDT', 1_000_000, 'another-secret-0123456789abcdef')).not.toBe(a);
    expect(a).not.toContain('1000000');
  });
});

describe('getSigningSecret', () => {
  it('берёт секрет из env', () => {
    expect(getSigningSecret({ TASK_SIGNING_SECRET: SECRET, NODE_ENV: 'production' } as NodeJS.ProcessEnv)).toBe(SECRET);
  });
  it('production без секрета (или короткий) -> ConfigError, не молча', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => getSigningSecret({ NODE_ENV: 'production' } as NodeJS.ProcessEnv)).toThrow(ConfigError);
    expect(() => getSigningSecret({ NODE_ENV: 'production', TASK_SIGNING_SECRET: 'short' } as NodeJS.ProcessEnv)).toThrow(ConfigError);
    expect(err).toHaveBeenCalled();
  });
  it('на Vercel без секрета или с коротким (<32) падает независимо от NODE_ENV', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => getSigningSecret({ VERCEL: '1', NODE_ENV: 'development' } as NodeJS.ProcessEnv)).toThrow(ConfigError);
    expect(() => getSigningSecret({ VERCEL: '1', NODE_ENV: 'test', TASK_SIGNING_SECRET: 'x'.repeat(31) } as NodeJS.ProcessEnv)).toThrow(ConfigError);
    expect(getSigningSecret({ VERCEL: '1', TASK_SIGNING_SECRET: 'x'.repeat(32) } as unknown as NodeJS.ProcessEnv)).toBe('x'.repeat(32));
  });
  it('development без секрета -> dev-ключ с предупреждением', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const k = getSigningSecret({ NODE_ENV: 'development' } as NodeJS.ProcessEnv);
    expect(k).toContain('DEV-ONLY');
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
