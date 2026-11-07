'use client';
import Link from 'next/link';
import { ss } from '@/i18n/ru/session';
import { Button, buttonClass } from '@/ui';

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main role="alert" data-testid="app-error" className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 px-4 py-12">
      <h1 className="text-2xl font-semibold">{ss.appError.title}</h1>
      <p className="text-base text-text-2">{ss.appError.text}</p>
      <div className="flex flex-wrap gap-2 pt-2">
        <Button variant="primary" size="lg" onClick={reset}>
          {ss.appError.retry}
        </Button>
        <Link href="/" className={buttonClass('secondary', 'lg')}>
          {ss.toHome}
        </Link>
        <Link href="/terminal" className={buttonClass('secondary', 'lg')}>
          {ss.toTerminal}
        </Link>
      </div>
    </main>
  );
}
