'use client';

import type { SupabaseClient, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { LocalRepository, RepositoryProvider, getDefaultRepository } from '@/storage';
import { runFirstSignInImport } from '@/storage/supabase/importLocal';
import { SupabaseRepository } from '@/storage/supabase/SupabaseRepository';
import { getBrowserSupabase } from './client';
import { isSupabaseConfigured } from './config';

export interface AuthState {
  /** false, пока Supabase не настроен: UI входа не показывается. */
  enabled: boolean;
  user: User | null;
  signOut: () => Promise<void>;
}

const DISABLED: AuthState = { enabled: false, user: null, signOut: async () => {} };
const AuthContext = createContext<AuthState>(DISABLED);

export const useAuth = (): AuthState => useContext(AuthContext);

/**
 * Выбор реализации Repository (ADR-0008). Без env — ровно прежнее поведение (LocalRepository).
 * С env и сессией — после однократного импорта IndexedDB переключается на SupabaseRepository.
 */
export function AuthRepositoryProvider({ children }: { children: ReactNode }) {
  if (!isSupabaseConfigured()) return <RepositoryProvider>{children}</RepositoryProvider>;
  return <SupabaseAuthRepositoryProvider>{children}</SupabaseAuthRepositoryProvider>;
}

function SupabaseAuthRepositoryProvider({ children }: { children: ReactNode }) {
  const client = useMemo<SupabaseClient | null>(() => getBrowserSupabase(), []);
  const [user, setUser] = useState<User | null>(null);
  const [cloudReadyFor, setCloudReadyFor] = useState<string | null>(null);

  useEffect(() => {
    if (!client) return;
    let alive = true;
    void client.auth.getSession().then(({ data }) => alive && setUser(data.session?.user ?? null));
    const { data } = client.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, [client]);

  const userId = user?.id ?? null;
  useEffect(() => {
    if (!client || !userId) return; // устаревший cloudReadyFor безвреден: сверяется с userId ниже
    let alive = true;
    const local = getDefaultRepository();
    const run =
      local instanceof LocalRepository
        ? runFirstSignInImport(local, client, userId).then(() => true)
        : Promise.resolve(true);
    // Сбой импорта: остаёмся на локальных данных, повтор при следующем входе (флаг не поставлен).
    run.then(
      () => alive && setCloudReadyFor(userId),
      () => undefined,
    );
    return () => {
      alive = false;
    };
  }, [client, userId]);

  const repository = useMemo(
    () => (client && userId && cloudReadyFor === userId ? new SupabaseRepository(client, userId) : undefined),
    [client, userId, cloudReadyFor],
  );
  const state = useMemo<AuthState>(
    () => ({
      enabled: true,
      user,
      signOut: async () => {
        await client?.auth.signOut();
        setUser(null);
      },
    }),
    [client, user],
  );

  return (
    <AuthContext.Provider value={state}>
      <RepositoryProvider repository={repository}>{children}</RepositoryProvider>
    </AuthContext.Provider>
  );
}
