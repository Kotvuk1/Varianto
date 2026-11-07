import { createHash, timingSafeEqual } from 'node:crypto';

export const dynamic = 'force-dynamic';

/**
 * Суточный пинг Supabase Free (проект засыпает после недели без запросов). Вызывает Vercel Cron
 * с заголовком Authorization: Bearer <CRON_SECRET>. Без env ничего не делает (204).
 */
function safeEqual(a: string, b: string): boolean {
  const h = (x: string) => createHash('sha256').update(x).digest();
  return timingSafeEqual(h(a), h(b));
}

export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const secret = process.env.CRON_SECRET?.trim();
  if (!url || !anonKey || !secret) return new Response(null, { status: 204 });

  if (!safeEqual(request.headers.get('authorization') ?? '', `Bearer ${secret}`)) {
    return new Response('Unauthorized', { status: 401 });
  }
  try {
    // RPC public.keepalive() (миграция 0002, execute для anon): реальный запрос к БД, работает при revoke anon на таблицах.
    const res = await fetch(`${url.replace(/\/$/, '')}/rest/v1/rpc/keepalive`, {
      method: 'POST',
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, 'Content-Type': 'application/json' },
      body: '{}',
      cache: 'no-store',
    });
    return Response.json({ ok: res.ok, status: res.status }, { status: res.ok ? 200 : 502 });
  } catch {
    return Response.json({ ok: false }, { status: 502 });
  }
}
