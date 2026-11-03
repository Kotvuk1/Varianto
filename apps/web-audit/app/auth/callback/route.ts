import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { safeNextPath, supabaseConfig } from '@/auth/config';

export const dynamic = 'force-dynamic';

/** Обмен кода OAuth/magic link на сессию (PKCE). Без настроенного Supabase просто ведёт на главную. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const cfg = supabaseConfig();
  if (!cfg) return NextResponse.redirect(new URL('/', url.origin));

  const code = url.searchParams.get('code');
  const next = safeNextPath(url.searchParams.get('next'));
  if (code) {
    const store = await cookies();
    const supabase = createServerClient(cfg.url, cfg.anonKey, {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (list) => list.forEach(({ name, value, options }) => store.set(name, value, options)),
      },
    });
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  return NextResponse.redirect(new URL('/auth/sign-in?error=1', url.origin));
}
