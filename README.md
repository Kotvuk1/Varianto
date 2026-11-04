# Trading Lab

Русскоязычный тренажёр рыночной структуры (SMC) и price action на реальных данных Binance Futures (USDⓈ-M). Модули: Market Structure Analyzer, Price Action Trainer, Trading Challenge, свободный терминал с проверкой разметки, прогресс и «Слабые места». Проверка ответов детерминированная (`@tl/core`, ALGO_VERSION 1.1.0). Без синтетических данных, без ключей Binance, только бесплатные тарифы (Vercel Hobby, Supabase Free).

Статус: MVP (M0–M8) реализован и проверен в контейнере; облако и живые данные ждут действий пользователя. Подробности: [PROJECT_STATUS](docs/PROJECT_STATUS.md).

## Быстрый старт

Требуется Node.js >= 22 и pnpm 10 (`corepack enable`).

```
pnpm i
cp .env.example .env.local     # затем задайте TASK_SIGNING_SECRET (>= 32 символов: openssl rand -base64 48)
NEXT_PUBLIC_ENABLE_ARCHIVE_SOURCE=1 pnpm dev     # http://localhost:3000
```

`NEXT_PUBLIC_ENABLE_ARCHIVE_SOURCE=1` разрешает архивный источник терминала (`?source=archive`, data.binance.vision) в production-сборке; в dev он доступен и без флага. Задания всегда берутся с сервера из архива. `TASK_SIGNING_SECRET` обязателен для API заданий; на Vercel без него сервер не стартует. Секреты хранятся только в env Vercel / GitHub Actions, не коммитятся.

## Команды

```
pnpm lint
pnpm typecheck
pnpm test                       # unit: core, market-data, web (Vitest)
pnpm build                      # production-сборка apps/web
pnpm test:e2e                   # Playwright, production-сборка, проекты mobile и desktop
pnpm --filter ./apps/web dev    # то же, что pnpm dev
```

Для e2e берите свой порт и каталог результатов (`--output`), чтобы параллельные запуски не конфликтовали; скриншотные сценарии (`*.shots.spec.ts`) требуют `SHOTS_DIR`.

## Структура

- `apps/web` - Next.js 16 (App Router), Tailwind v4: `app/`, `src/features`, `src/chart`, `src/data`, `src/storage`, `src/server`, `src/i18n/ru`
- `packages/core` - `@tl/core`: чистый TS, домен и алгоритмы (потребляется исходниками)
- `packages/market-data` - `@tl/market-data`: Binance, нормализация, источники данных
- `supabase/` - миграции и SQL-тесты RLS
- `e2e/` - Playwright
- `fixtures/` - реальные свечи data.binance.vision для тестов
- `docs/` - документация

## Ограничения

- Архивный режим (`NEXT_PUBLIC_ENABLE_ARCHIVE_SOURCE=1`) предназначен для разработки: данные из data.binance.vision, не live; в терминале помечены плашкой «Архив Binance · не live».
- Живые данные (REST и WebSocket Binance) работают только из браузера пользователя: из облачных контейнеров и ряда регионов `fapi.binance.com` отдаёт 451. Автор проверял live только на записанных реальных ответах.
- Вход (Google, magic link) и синхронизация работают только при заданных `NEXT_PUBLIC_SUPABASE_*`; без них данные хранятся локально (IndexedDB). Не проверено на реальном Supabase/Vercel: [SETUP_SUPABASE_VERCEL](docs/SETUP_SUPABASE_VERCEL.md).
- Реальный телефон не проверялся. Известные дефекты: [KNOWN_ISSUES](docs/KNOWN_ISSUES.md).

## Документация

[Статус](docs/PROJECT_STATUS.md) · [Roadmap](docs/ROADMAP.md) · [PRD](docs/PRD.md) · [Архитектура](docs/ARCHITECTURE.md) · [Алгоритмы](docs/specs/ALGORITHMS.md) · [API](docs/API_CONTRACTS.md) · [БД](docs/DATABASE_SCHEMA.md) · [Тестирование](docs/TESTING_STRATEGY.md) · [QA](docs/QA_REPORT.md) · [Security](docs/SECURITY_REVIEW.md) · [Дизайн-аудит](docs/design/AUDIT.md) · [Настройка Supabase/Vercel](docs/SETUP_SUPABASE_VERCEL.md) · [Известные проблемы](docs/KNOWN_ISSUES.md) · [Агенты](docs/AGENTS.md)
