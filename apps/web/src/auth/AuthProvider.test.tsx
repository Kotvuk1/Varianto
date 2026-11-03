import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LocalRepository, useRepository } from '@/storage';
import { AuthRepositoryProvider, useAuth } from './AuthProvider';
import { SignInForm } from './SignInForm';

afterEach(() => vi.unstubAllEnvs());

function Probe() {
  const repo = useRepository();
  const { enabled } = useAuth();
  return <p>{`${repo instanceof LocalRepository ? 'local' : 'other'}:${enabled ? 'auth' : 'noauth'}`}</p>;
}

describe('без NEXT_PUBLIC_SUPABASE_*', () => {
  it('работает на LocalRepository, вход выключен', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');
    render(
      <AuthRepositoryProvider>
        <Probe />
        <SignInForm />
      </AuthRepositoryProvider>,
    );
    expect(screen.getByText('local:noauth')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });
});
