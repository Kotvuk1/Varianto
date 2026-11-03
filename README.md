# Trading Lab

Русскоязычный тренажёр рыночной структуры (SMC) и price action на реальных данных Binance Futures. Без синтетических данных, без ключей Binance, только бесплатные тарифы (Vercel Hobby, Supabase Free).

## Запуск

Требуется Node.js >= 22 и pnpm 10 (`corepack enable`).

```
pnpm i
pnpm dev          # http://localhost:3000
pnpm lint && pnpm typecheck && pnpm test
pnpm build
pnpm test:e2e     # Playwright, порт 3100, проекты mobile и desktop
```

Скопируйте `.env.example` в `.env.local` и заполните `TASK_SIGNING_SECRET` (`openssl rand -base64 32`). Секреты хранятся только в env Vercel / GitHub Actions.

## Структура

- `apps/web` - Next.js 16 (App Router), Tailwind v4: `app/`, `src/features`, `src/chart`, `src/data`, `src/storage`, `src/i18n/ru`
- `packages/core` - `@tl/core`: чистый TS, домен и алгоритмы (потребляется исходниками)
- `packages/market-data` - `@tl/market-data`: Binance, нормализация, источники данных
- `e2e/` - Playwright
- `fixtures/` - реальные свечи data.binance.vision для тестов
- `docs/` - документация

## Документация

[Архитектура](docs/ARCHITECTURE.md) · [PRD](docs/PRD.md) · [Тестирование](docs/TESTING_STRATEGY.md) · [Агенты](docs/AGENTS.md) · [Roadmap](docs/ROADMAP.md) · [API](docs/API_CONTRACTS.md) · [БД](docs/DATABASE_SCHEMA.md)
