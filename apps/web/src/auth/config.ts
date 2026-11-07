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
  // URL-парсер удаляет TAB/CR/LF, поэтому '/\t/evil.com' превращается в '//evil.com' (open redirect): управляющие символы запрещены.
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(next)) return '/';
  // Страховка: итоговый адрес обязан остаться на том же origin.
  try {
    if (new URL(next, 'https://origin.invalid').origin !== 'https://origin.invalid') return '/';
  } catch {
    return '/';
  }
  return next;
}
