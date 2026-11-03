import { afterEach, describe, expect, it, vi } from 'vitest';
import { isSupabaseConfigured, safeNextPath, supabaseConfig } from './config';

afterEach(() => vi.unstubAllEnvs());

describe('supabaseConfig', () => {
  it('выключено без env', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');
    expect(isSupabaseConfigured()).toBe(false);
  });
  it('выключено, если задана только одна переменная', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://x.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');
    expect(supabaseConfig()).toBeNull();
  });
  it('включено при обеих', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://x.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon');
    expect(supabaseConfig()).toEqual({ url: 'https://x.supabase.co', anonKey: 'anon' });
  });
});

describe('safeNextPath', () => {
  it.each([
    ['/progress', '/progress'],
    ['/a?b=1', '/a?b=1'],
    ['//evil.com', '/'],
    ['https://evil.com', '/'],
    ['/\\evil.com', '/'],
    ['', '/'],
    [null, '/'],
  ])('%s -> %s', (input, out) => expect(safeNextPath(input)).toBe(out));
});
