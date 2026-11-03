# Команда агентов — Trading Lab

Версия 0.1, 2026-11-03. Основание: `docs/ARCHITECTURE.md` §3 (владение директориями), `docs/SKILLS_REGISTRY.md` (навыки), `CLAUDE.md` (правило graphify). Определения субагентов Claude Code: `.claude/agents/<name>.md`. Тесты и критерии «готово»: `docs/TESTING_STRATEGY.md`.

## 1. Сводка

| Агент | Файл определения | Модель | Зона владения |
|---|---|---|---|
| Orchestrator | основная сессия | opus | `docs/DECISIONS/`, `docs/API_CONTRACTS.md`, `docs/DATABASE_SCHEMA.md`, `docs/ARCHITECTURE.md`; контракты, интеграция, приёмка |
| Technical Analyst | `technical-analyst` | opus | `docs/specs/`, golden-разметка (`fixtures/**/*.golden.json`); спецификация для `packages/core` |
| Market Data Engineer | `market-data-engineer` | sonnet | `packages/market-data/`, `fixtures/` (кроме golden) |
| Backend Developer | `backend-developer` | sonnet | `packages/core/` (реализация, вместе с Technical Analyst), `apps/web/app/api/` |
| Chart Developer | `chart-developer` | sonnet | `apps/web/src/chart/` |
| Frontend Developer | `frontend-developer` | sonnet | `apps/web/` кроме `src/chart/` и `app/api/`: `app/`, `src/features/`, `src/data/`, `src/storage/`, `src/i18n/` |
| UI/UX Designer | `uiux-designer` | sonnet | `docs/design/` (токены, компоненты, экраны, DESIGN.md); ревью UI |
| QA Engineer | `qa-engineer` | sonnet | `e2e/`, `docs/qa/`; независимая проверка |
| DevOps/Security Engineer | `devops-security` | sonnet | `.github/`, корневые конфиги, `vercel.json`, `.env.example`, аудит секретов |
| Documentation Engineer | `documentation-engineer` | sonnet (haiku для механических правок) | `README.md`, `docs/` кроме зон Orchestrator, Technical Analyst, UI/UX, QA |

Изменение в чужой зоне выполняется только через Orchestrator.

## 2. Карточки

### Orchestrator
- Ответственность: архитектура, ADR, контракты (API, схема БД, типы `@tl/core`), декомпозиция вех, интеграция результатов, приёмка.
- Модель: opus.
- Навыки: `superpowers:brainstorming`, `superpowers:writing-plans`, `superpowers:subagent-driven-development`, `superpowers:dispatching-parallel-agents`, `superpowers:verification-before-completion`, `engineering:architecture`, `engineering:system-design`, `anthropic-skills:grilling`, `graphify`.
- Вход: PRD, ROADMAP, решения пользователя. Выход: контракты, задачи агентам, решение о приёмке.

### Technical Analyst
- Ответственность: спецификация алгоритмов SMC, Price Action и Challenge (`docs/specs/ALGORITHMS.md`: параметры фрактала, допуски, правила BOS/CHoCH, internal/external, sweep, OB, FVG, шесть моделей PA, оценка качества решения, лимиты проигрывания); ручная golden-разметка реальных участков; изменение `ALGO_VERSION`.
- Модель: opus (ошибка в определении ломает оценки всего продукта).
- Навыки: `superpowers:test-driven-development` (golden как тест), `superpowers:verification-before-completion`, `engineering:documentation`, `graphify`.
- Вход: PRD (FR-MS, FR-PA, FR-TC), фикстуры, первоисточники по SMC. Выход: `docs/specs/*`, `*.golden.json`, список допущений и спорных мест.

### Market Data Engineer
- Ответственность: Binance — нормализация kline, `ArchiveSource` (zip/CSV data.binance.vision), REST/WS для браузера, переподключение, фикстуры и их README, запись реальных ответов для E2E.
- Модель: sonnet.
- Навыки: `superpowers:test-driven-development`, `superpowers:systematic-debugging`, `superpowers:verification-before-completion`, `graphify`.
- Вход: `ARCHITECTURE.md` §4, §5.1–5.2, контракты типов. Выход: `packages/market-data`, `fixtures/`, тесты нормализации.

### Backend Developer
- Ответственность: чистое ядро `packages/core` по спецификации Technical Analyst (candles, `sliceAt`, агрегация, SMC, PA, `gradeMarks`, `resolveTrade`, `buildFeedback`); route handlers `/api/*`, `taskToken`, валидация `zod`, rate limit; `Repository` — контракт и `SupabaseRepository` (M7).
- Модель: sonnet.
- Навыки: `superpowers:test-driven-development` (обязательно), `anthropic-skills:senior-backend`, `security-review`, `superpowers:verification-before-completion`, `graphify`.
- Вход: `docs/specs/ALGORITHMS.md`, `API_CONTRACTS.md`, `DATABASE_SCHEMA.md`. Выход: код, unit/integration-тесты, покрытие core.

### Chart Developer
- Ответственность: обёртка Lightweight Charts v5, Series Primitives, `DrawingLayer`, инструменты разметки, касания (Pointer Events), привязка время/цена, синхронизация области времени при смене ТФ, производительность.
- Модель: sonnet.
- Навыки: `superpowers:test-driven-development` (преобразования координат), `dataviz`, `design:accessibility-review`, `anthropic-skills:playwright-pro`, `graphify`.
- Вход: `ARCHITECTURE.md` §4.2, FR-CHART, FR-DRAW, дизайн-токены. Выход: `apps/web/src/chart`, unit-тесты, скриншоты с подписью источника.

### Frontend Developer
- Ответственность: маршруты и экраны модулей, состояние (`zustand`), `LiveFeed`-клиент, клиент `/api`, `LocalRepository` (IndexedDB), i18n, адаптивность.
- Модель: sonnet.
- Навыки: `superpowers:test-driven-development`, `anthropic-skills:senior-frontend`, `impeccable:impeccable`, `graphify`.
- Вход: дизайн UI/UX, контракты API, chart-компонент. Выход: `apps/web` (кроме chart и api), тесты.

### UI/UX Designer
- Ответственность: дизайн-система (токены, тёмная/светлая темы, свечи синие/оранжевые, монохром), mobile-first раскладки, bottom sheet разбора, состояния (загрузка/пусто/ошибка), копирайт на русском, ревью UI через Impeccable `critique`/`audit`.
- Модель: sonnet.
- Навыки: `impeccable:impeccable`, `design:accessibility-review`, `design:design-critique`, `design:ux-copy`, `graphify`.
- Вход: PRD §2, FR-UI, NFR-A11Y. Выход: `docs/design/*`, отчёты critique/audit с приоритетами.

### QA Engineer
- Ответственность: независимая проверка AC вехи, E2E Playwright (390x844, 1440x900), review тестов, поиск нарушений (будущее в Challenge, синтетика, красный/зелёный, секреты). Не проверяет собственный код.
- Модель: sonnet.
- Навыки: `engineering:testing-strategy`, `anthropic-skills:playwright-pro`, `engineering:code-review`, `superpowers:verification-before-completion`, `superpowers:systematic-debugging`, `impeccable:impeccable` (audit), `graphify`.
- Вход: AC вехи, `TESTING_STRATEGY.md`. Выход: `e2e/`, отчёт приёмки (прошло/не прошло по каждому AC, с выводом команд).

### DevOps/Security Engineer
- Ответственность: pnpm workspace, tsconfig/eslint базовые конфиги, GitHub Actions (lint, typecheck, unit, build, e2e), сканирование секретов, CSP, env, подключение Vercel (ближе к концу), Supabase-окружение (перед M7).
- Модель: sonnet.
- Навыки: `security-review`, `engineering:deploy-checklist`, `superpowers:verification-before-completion`, `graphify`.
- Вход: `ARCHITECTURE.md` §7, §10. Выход: CI, конфиги, отчёт безопасности.

### Documentation Engineer
- Ответственность: README, согласованность PRD/ROADMAP/ARCHITECTURE/TESTING_STRATEGY/AGENTS, журнал изменений, актуализация после решений.
- Модель: sonnet; haiku для механических правок (ссылки, опечатки, таблицы).
- Навыки: `engineering:documentation`, `graphify`.
- Вход: решения Orchestrator и пользователя. Выход: обновлённые документы, список расхождений.

## 3. Правила оркестрации

1. Контракты до параллельной работы: типы `@tl/core`, API (`API_CONTRACTS.md`), схема БД (`DATABASE_SCHEMA.md`) утверждаются Orchestrator до того, как агенты начинают работать параллельно.
2. Одна зона — один владелец. Совместное владение `packages/core` фиксировано: Technical Analyst пишет спецификацию и golden, Backend реализует.
3. Технический анализ раньше кода: `ALGORITHMS.md` готова до реализации алгоритмов (M2).
4. QA не проверяет собственный код. Автор кода и проверяющий — разные агенты.
5. Ничто не считается готовым без запуска тестов; отчёт содержит команду и итог запуска.
6. Параллельно запускаются только независимые задачи в разных зонах; зависимые — последовательно.
7. Агенты не коммитят и не пушат без указания Orchestrator; PR создаёт Orchestrator; слияние в `main` — только пользователь.
8. Данные только реальные: mock не выдаётся за реальные данные; синтетика только с префиксом `synthetic_` и пометкой (см. `TESTING_STRATEGY.md` §3).
9. Решения вне компетенции агента возвращаются Orchestrator как вопрос, а не принимаются молча.
10. После изменения кода выполняется `graphify update .`.
11. Приёмка вехи по критериям `TESTING_STRATEGY.md` §7; результат этапа до подключения Vercel подтверждается скриншотами/видео Playwright с подписью источника данных.

### Правило graphify (включается в каждый промпт агента, исследующего код)
> Когда `graphify-out/graph.json` существует, перед первым grep, поиском или чтением исходников по вопросу о кодовой базе выполни `graphify query "<вопрос>"`. Читай сырые файлы только по строкам, которые указал граф или предыдущее чтение. Для связей используй `graphify path "<A>" "<B>"`, для понятий — `graphify explain "<концепт>"`. `graphify-out/GRAPH_REPORT.md` читай только для обзора архитектуры, если query/path/explain не дали контекста. После изменения кода выполни `graphify update .`.

## 4. Формат отчёта агента (до 15 строк)

1. Что сделано.
2. Файлы (абсолютные пути).
3. Принятые решения и допущения.
4. Тесты: команда и результат.
5. Проблемы и риски.
6. Зависимости и что нужно от других агентов или пользователя.
7. Следующий шаг (если нужен).

## 5. Шаблон задания агенту

Orchestrator включает в каждое задание: цель и критерий готовности; список файлов и зон; ссылки на документы и контракты; правило graphify (если агент исследует код); требование TDD для кода; формат отчёта (раздел 4); запреты (чужие зоны, коммиты, mock как реальные данные).
