import { ru } from '@/i18n/ru';

export function Home() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold">{ru.appName}</h1>
      <p>{ru.home.tagline}</p>
      <p>{ru.home.status}</p>
    </main>
  );
}
