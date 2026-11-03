import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

const req = (auth?: string) => new Request('http://x/api/cron/keepalive', { headers: auth ? { authorization: auth } : {} });

function env(on: boolean) {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', on ? 'https://p.supabase.co' : '');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', on ? 'anon' : '');
  vi.stubEnv('CRON_SECRET', on ? 's3cret' : '');
}
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('GET /api/cron/keepalive', () => {
  it('без env: 204 и никаких запросов', async () => {
    env(false);
    const f = vi.fn();
    vi.stubGlobal('fetch', f);
    expect((await GET(req())).status).toBe(204);
    expect(f).not.toHaveBeenCalled();
  });
  it('неверный секрет: 401, запросов нет', async () => {
    env(true);
    const f = vi.fn();
    vi.stubGlobal('fetch', f);
    expect((await GET(req('Bearer wrong'))).status).toBe(401);
    expect((await GET(req())).status).toBe(401);
    expect(f).not.toHaveBeenCalled();
  });
  it('верный секрет: пингует REST с anon-ключом', async () => {
    env(true);
    const f = vi.fn().mockResolvedValue(new Response('[]', { status: 200 }));
    vi.stubGlobal('fetch', f);
    expect((await GET(req('Bearer s3cret'))).status).toBe(200);
    expect(f.mock.calls[0]![0]).toBe('https://p.supabase.co/rest/v1/profiles?select=id&limit=1');
    expect(f.mock.calls[0]![1].headers.apikey).toBe('anon');
  });
  it('ошибка Supabase: 502', async () => {
    env(true);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('net')));
    expect((await GET(req('Bearer s3cret'))).status).toBe(502);
  });
});
