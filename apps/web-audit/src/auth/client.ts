import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig } from './config';

let browser: SupabaseClient | null = null;

/** Браузерный клиент (только anon-ключ). null, если облако не настроено. */
export function getBrowserSupabase(): SupabaseClient | null {
  const cfg = supabaseConfig();
  if (!cfg) return null;
  browser ??= createBrowserClient(cfg.url, cfg.anonKey);
  return browser;
}
