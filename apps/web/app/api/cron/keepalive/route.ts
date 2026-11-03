export const dynamic = 'force-dynamic';

/**
 * Суточный пинг Supabase Free (проект засыпает после недели без запросов). Вызывает Vercel Cron
 * с заголовком Authorization: Bearer <CRON_SECRET>. Без env ничего не делает (204).
 */
export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const secret = process.env.CRON_SECRET?.trim();
  if (!url || !anonKey || !secret) return new Response(null, { status: 204 });

  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  try {
    // Лёгкий запрос к таблице с anon-ключом: RLS вернёт пустой список, но база «просыпается».
    const res = await fetch(`${url.replace(/\/$/, '')}/rest/v1/profiles?select=id&limit=1`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
      cache: 'no-store',
    });
    return Response.json({ ok: res.ok, status: res.status }, { status: res.ok ? 200 : 502 });
  } catch {
    return Response.json({ ok: false }, { status: 502 });
  }
}
