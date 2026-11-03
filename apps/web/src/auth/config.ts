// Авторизация и облако выключены, пока не заданы обе переменные. Обращения к process.env — буквальные,
// чтобы Next подставил значения в клиентский бандл.
export function supabaseConfig(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return url && anonKey ? { url, anonKey } : null;
}

export const isSupabaseConfigured = (): boolean => supabaseConfig() !== null;

/** Защита от open redirect: только путь внутри сайта. */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.includes('\\')) return '/';
  return next;
}
