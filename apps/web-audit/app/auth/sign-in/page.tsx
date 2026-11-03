import { notFound } from 'next/navigation';
import { SignInForm, isSupabaseConfigured } from '@/auth';
import { auth } from '@/i18n/ru/auth';

export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  // Без настроенного Supabase страницы входа не существует.
  if (!isSupabaseConfigured()) notFound();
  const { error } = await searchParams;
  return (
    <div className="mx-auto w-full max-w-[480px] px-4 pb-6 lg:pt-4">
      <h1 className="py-3 text-xl font-semibold">{auth.title}</h1>
      <p className="pb-4 text-sm text-text-2">{auth.subtitle}</p>
      <SignInForm initialError={error !== undefined} />
    </div>
  );
}
