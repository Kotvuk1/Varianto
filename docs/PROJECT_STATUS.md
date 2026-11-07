# Project Status — Trading Lab

Обновлено: 2026-11-04. Ветка `claude/trading-lab-master-prompt-y4oxbf`, последний коммит на момент записи: `050bfd2`.

## Этапы

| Этап | Статус | Итог |
|---|---|---|
| 0 — окружение | завершён | `docs/SKILLS_REGISTRY.md` |
| 1 — интервью | завершён | `docs/INTERVIEW_SUMMARY.md`, подтверждено пользователем |
| 2 — PRD и ROADMAP | завершён | `docs/PRD.md`, `docs/ROADMAP.md`; решения по OQ в PRD §12 |
| 3 — архитектура | завершён | ARCHITECTURE, ADR-0001…0009, API_CONTRACTS, DATABASE_SCHEMA, TESTING_STRATEGY, AGENTS |
| M0 — каркас и данные | завершён | monorepo, market-data, `/api/history`, дизайн-система, `docs/specs/ALGORITHMS.md` |
| M1 — график и слой разметки | завершён | LWC v5, drawing layer, синхронизация ТФ, терминал |
| M2 — SMC-алгоритмы | завершён | `@tl/core` ALGO_VERSION 1.1.0: swings, структура, BOS/CHoCH, sweep, OB, FVG, свечные модели, `gradeMarks` |
| M3 — Market Structure | завершён | режимы «Разметка» и «Вопрос», разбор из 6 частей |
| M4 — Price Action | завершён | find-pattern, draw-level, context |
| M5 — Trading Challenge | завершён | скрытое будущее, SL/TP обязательны, R и качество раздельно |
| M6 — свободный терминал | завершён | «Проверить мою разметку» на закрытых свечах |
| M7 — авторизация и прогресс | завершён (код); не проверен на реальном Supabase | SupabaseRepository за env-флагом, RLS на Postgres 16, прогресс, журнал ошибок, дневная цель, серия |
| M8 — интеграция и QA | выполнен в контейнере; приёмка пользователем ожидается | QA_REPORT (P0/P1 нет), SECURITY_REVIEW, design/AUDIT, раунды исправлений |

## Что реально работает (проверено 2026-11-04)

Проверки оркестратора на текущем коммите:
- `pnpm lint`, `pnpm typecheck` — без ошибок.
- Unit: core 300, market-data 67 (+2 сетевых skipped), web 360 — все зелёные.
- `pnpm build` (production) — успешен.
- E2E на production-сборке (итоговый прогон 2026-11-04, после полировки): **85 passed, 0 failed**, 7 skipped (скриншотные, нужен `SHOTS_DIR`), mobile 390x844 + desktop 1440x900. Ранее наблюдавшийся 404 «нет сценариев» на холодном сервере исправлен в `050bfd2`.
- RLS (AC-16, уровень БД): `supabase/tests/rls.test.sql` на Postgres 16 — `RLS TESTS PASSED` (QA_REPORT).
- Security: open redirect, rate limit `/api/history`, keepalive, лимиты jsonb, HSTS, строгий секрет — закрыты (`docs/SECURITY_REVIEW.md`).

Данные: все задания и терминал в контейнере работают на реальном архиве data.binance.vision (серверный `ArchiveSource`); живой режим проверен только на записанных реальных ответах Binance (fixture).

## Что НЕ проверено

- Живой REST и WebSocket Binance USDⓈ-M с устройства пользователя: из облачного контейнера fapi даёт 451, fstream — таймаут. Переподключения, rate limit Binance, потери пакетов не проверены.
- Supabase (вход, RLS через PostgREST с настоящим JWT, синхронизация между устройствами AC-13), Google OAuth, magic link, Vercel Hobby (лимиты функций, холодный старт, cron keepalive): нужен аккаунт пользователя. Инструкция: `docs/SETUP_SUPABASE_VERCEL.md`.
- Реальный телефон: FPS и касания на устройстве (в headless: 60 FPS на 1404 свечах, без GPU), жесты браузера, OQ-01.
- Симуляция дальтонизма, монохром свечей, 360x640, состояния загрузки/офлайна, фокус-кольца и клавиатура (design/AUDIT §4).

## Готовность по частям

| Часть | Готовность |
|---|---|
| MVP в целом (после полировки UI) | ~90% |
| Данные и график (M0–M1) | ~95% (минус живой режим с устройства) |
| Алгоритмы и разбор (M2) | ~95% |
| Модули MS / PA / Challenge (M3–M5) | ~90% |
| Терминал (M6) | ~90% |
| Прогресс и авторизация (M7) | ~80% (облачная часть не проверена) |
| Деплой Vercel / Supabase | ~30% (конфиги и инструкция готовы, проекты не созданы) |
| Fibonacci / Premium-Discount (v1.1) | 0% |
| Elliott Wave (v1.2) | 0% |
| «Спросить ИИ» (v2) | 0% |

## Блокеры

Только действия пользователя: создать проекты Vercel и Supabase, задать env, настроить Google OAuth (`docs/SETUP_SUPABASE_VERCEL.md`); проверить живые данные и ощущение прокрутки на своём телефоне.

## Следующие действия

1. Подключить Vercel и Supabase по `docs/SETUP_SUPABASE_VERCEL.md` и проверить живые данные Binance на телефоне (единственное, что нельзя проверить из облака разработки).
2. Пользователь: Supabase и Vercel по инструкции, затем проверка на телефоне (OQ-01, AC-02 вживую, AC-13, AC-16 end-to-end).
3. Закрыть открытые P2/P3: `docs/KNOWN_ISSUES.md`.
4. Приёмка MVP пользователем, слияние PR в `main`.
5. Интервью по Fibonacci и старт v1.1 (`docs/ROADMAP.md`).

## Окружение разработки (облачный контейнер)

Node 22, pnpm 10.28.0, Chromium + Playwright предустановлены. Доступность Binance из контейнера: `fapi`/`fstream` недоступны (451/таймаут), `data.binance.vision` — 200, `testnet.binancefuture.com` — только тестнет (не реальные данные), `data-api.binance.vision` — только Spot.
