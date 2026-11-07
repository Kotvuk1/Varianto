import Link from 'next/link';
import { ru } from '@/i18n/ru';
import { ss } from '@/i18n/ru/session';
import { buttonClass } from '@/ui';

export default function NotFound() {
  return (
    <main data-testid="not-found" className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 px-4 py-12">
      <p className="tnum text-sm text-text-2">404</p>
      <h1 className="text-2xl font-semibold">{ss.notFound.title}</h1>
      <p className="text-base text-text-2">{ss.notFound.text}</p>
      <div className="flex flex-wrap gap-2 pt-2">
        <Link href="/" className={buttonClass('primary', 'lg')}>
          {ss.toHome}
        </Link>
        <Link href="/terminal" className={buttonClass('secondary', 'lg')}>
          {ru.nav.terminal}
        </Link>
      </div>
    </main>
  );
}
