'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { auth } from '@/i18n/ru/auth';
import { Button, buttonClass } from '@/ui';
import { useAuth } from './AuthProvider';
import { getBrowserSupabase } from './client';

type Status = 'idle' | 'sending' | 'sent' | 'error';

const callbackUrl = () => `${window.location.origin}/auth/callback?next=/`;

export function SignInForm({ initialError = false }: { initialError?: boolean }) {
  const { user, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>(initialError ? 'error' : 'idle');
  const client = getBrowserSupabase();

  if (!client) return null;

  if (user) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-text-2">{auth.signedInAs(user.email ?? '')}</p>
        <Button onClick={() => void signOut()}>{auth.signOut}</Button>
        <Link href="/" className={buttonClass('ghost')}>
          {auth.skip}
        </Link>
      </div>
    );
  }

  async function google() {
    setStatus('sending');
    const { error } = await client!.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl() },
    });
    if (error) setStatus('error');
  }

  async function magic(e: FormEvent) {
    e.preventDefault();
    setStatus('sending');
    const { error } = await client!.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: callbackUrl() },
    });
    setStatus(error ? 'error' : 'sent');
  }

  const busy = status === 'sending';
  return (
    <div className="flex flex-col gap-4">
      <Button variant="primary" size="lg" loading={busy} onClick={() => void google()}>
        {auth.google}
      </Button>
      <p className="text-center text-sm text-text-3">{auth.or}</p>
      <form onSubmit={(e) => void magic(e)} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium">
          {auth.emailLabel}
          <input
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={auth.emailPlaceholder}
            className="h-12 rounded-md border border-border-strong bg-surface-1 px-3 text-base text-text-1"
          />
        </label>
        <Button type="submit" size="lg" loading={busy}>
          {busy ? auth.sending : auth.sendLink}
        </Button>
      </form>
      <div role="status" aria-live="polite" className="text-sm">
        {status === 'sent' && <p className="text-text-2">{auth.linkSent(email.trim())}</p>}
        {status === 'error' && (
          <p className="rounded-md border border-border-strong p-3 text-text-1">
            <strong>{auth.errorTitle}.</strong> {initialError && email === '' ? auth.callbackError : auth.errorText}
          </p>
        )}
      </div>
      <Link href="/" className={buttonClass('ghost')}>
        {auth.skip}
      </Link>
    </div>
  );
}
