# Graph Report - Varianto  (2026-11-03)

## Corpus Check
- 88 files · ~51,793 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 26 file(s) not represented in the graph (top: .csv 16, (none) 8, .example 1)

## Summary
- 783 nodes · 1025 edges · 57 communities (51 shown, 6 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `685a604d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- web/package.json
- PRD — Trading Lab
- package.json
- API Contracts — Trading Lab
- core/src/index.ts
- with
- Architecture — Trading Lab
- 2. Карточки
- Стратегия тестирования — Trading Lab
- market-data/package.json
- Database Schema — Trading Lab
- archive.ts
- core/package.json
- compilerOptions
- Interview Summary — Trading Lab
- layout.tsx
- compilerOptions
- Project Status — Trading Lab
- Skills Registry — Trading Lab
- backend-developer.md
- chart-developer.md
- devops-security.md
- documentation-engineer.md
- frontend-developer.md
- market-data-engineer.md
- qa-engineer.md
- technical-analyst.md
- uiux-designer.md
- ADR-0005: Stateless-задания с подписанными токенами; будущее только на сервере
- ADR-0007: Правила исхода сделки Challenge (drill-down)
- ADR-0001: Next.js 16 + TypeScript strict, pnpm monorepo, Vercel
- ADR-0003: Живые данные грузит браузер напрямую (REST + WS), fallback — REST-polling
- ADR-0004: История для заданий — сервер читает архив data.binance.vision
- ADR-0006: Синхронизация таймфреймов — нативные ТФ, инвариант агрегации, sliceAt
- ADR-0008: Local-first хранилище за интерфейсом Repository; Supabase в M7
- ADR-0009: Детерминированное общее ядро @tl/core; разборы по шаблонам; ИИ позже
- .prettierrc.json
- e2e/tsconfig.json
- core/tsconfig.json
- market-data/tsconfig.json
- DECISIONS/README.md
- postcss.config.mjs
- CLAUDE.md
- .claude/CLAUDE.md
- pnpm-workspace.yaml
- history/route.ts
- LAYOUTS — Trading Lab
- 2. Компоненты
- DESIGN — Trading Lab
- COPY — микрокопия Trading Lab
- check_tokens.py
- devDependencies
- layout.tsx
- FakeWs
- scripts
- ADR-0002: Lightweight Charts v5 + собственный слой разметки на Series Primitives
- fixtures

## God Nodes (most connected - your core abstractions)
1. `ArchiveSource` - 23 edges
2. `UtcMs` - 20 edges
3. `Candle` - 15 edges
4. `2. Компоненты` - 15 edges
5. `ArchiveError` - 14 edges
6. `compilerOptions` - 14 edges
7. `PRD — Trading Lab` - 13 edges
8. `Timeframe` - 12 edges
9. `parseArchiveCsv()` - 12 edges
10. `Architecture — Trading Lab` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Backend Developer` --references--> `sliceAt()`  [INFERRED]
  docs/AGENTS.md → packages/core/src/candles/aggregate.ts
- `Решение` --references--> `sliceAt()`  [INFERRED]
  docs/DECISIONS/0005-stateless-signed-task-tokens.md → packages/core/src/candles/aggregate.ts
- `Решение` --references--> `sliceAt()`  [INFERRED]
  docs/DECISIONS/0009-deterministic-core-engine.md → packages/core/src/candles/aggregate.ts
- `2. Пирамида` --references--> `sliceAt()`  [INFERRED]
  docs/TESTING_STRATEGY.md → packages/core/src/candles/aggregate.ts
- `4.1 Шкала задания` --references--> `UtcMs`  [INFERRED]
  docs/API_CONTRACTS.md → packages/core/src/index.ts

## Import Cycles
- 2-file cycle: `packages/core/src/candles/aggregate.ts -> packages/core/src/index.ts -> packages/core/src/candles/aggregate.ts`

## Communities (57 total, 6 thin omitted)

### Community 0 - "web/package.json"
Cohesion: 0.15
Nodes (18): dependencies, dexie@^4.0.0, lightweight-charts@~5.2.1, react-dom@^19.0.0, @tl/core@workspace:*, @tl/market-data@workspace:*, zod@^4.0.0, zustand@^5.0.0 (+10 more)

### Community 1 - "PRD — Trading Lab"
Cohesion: 0.05
Nodes (41): 10. Приоритизация функций (MoSCoW), 11. План MVP, 12. Открытые вопросы, 1.1 Что это, 1.2 Цель, 1.3 Целевой пользователь, 1.4 Модули, 1. Обзор и цель продукта (+33 more)

### Community 2 - "package.json"
Cohesion: 0.08
Nodes (30): devDependencies, eslint@^9.39.0, eslint-config-next@^16.0.0, @eslint/js@^9.39.0, @playwright/test@1.63.0, prettier@^3.6.0, @types/node@^22.0.0, typescript@~5.9.3 (+22 more)

### Community 3 - "API Contracts — Trading Lab"
Cohesion: 0.07
Nodes (26): 1.1 Формат ошибки, 1.2 Заголовки кэша, 1. Общие соглашения, 2.1 Из `ARCHITECTURE.md` §4 (дословно), 2.2 Расширения контрактов (предложение — фиксируются при реализации в `@tl/core`), 2. Типы `@tl/core`, используемые в контрактах, 3.1 `GET /api/health`, 3.2 `GET /api/history` (+18 more)

### Community 4 - "core/src/index.ts"
Cohesion: 0.07
Nodes (39): dynamic, GET(), aggregate(), SeriesByTf, sliceAt(), synthetic_hour(), synthetic_m1(), ALGO_VERSION (+31 more)

### Community 5 - "with"
Cohesion: 0.08
Nodes (26): runs-on, steps, GITHUB_TOKEN, jobs, check, secrets-scan, name, on (+18 more)

### Community 6 - "Architecture — Trading Lab"
Cohesion: 0.11
Nodes (19): 10. Развёртывание, 11. Риски, 1. Ключевые ограничения, определяющие архитектуру, 2. Обзор, 3. Репозиторий (pnpm monorepo), 4.1 Синхронизация таймфреймов, 4.2 Разметка (общая модель для пользователя и алгоритма), 4.3 Алгоритмы (детерминированные, версионируемые) (+11 more)

### Community 7 - "2. Карточки"
Cohesion: 0.12
Nodes (16): 1. Сводка, 2. Карточки, 3. Правила оркестрации, 4. Формат отчёта агента (до 15 строк), 5. Шаблон задания агенту, Backend Developer, Chart Developer, DevOps/Security Engineer (+8 more)

### Community 8 - "Стратегия тестирования — Trading Lab"
Cohesion: 0.06
Nodes (28): MVP, Roadmap — Trading Lab, v1.1 — Fibonacci Playground и Premium/Discount, v1.2 — Elliott Wave Lab, v2, Правила корректировки, 10. Производительность, 1. Принципы (+20 more)

### Community 9 - "market-data/package.json"
Cohesion: 0.11
Nodes (20): dependencies, fflate@^0.8.3, @tl/core@workspace:*, devDependencies, vitest@^4.1.12, @vitest/coverage-v8@^4.1.12, exports, ./archive (+12 more)

### Community 10 - "Database Schema — Trading Lab"
Cohesion: 0.12
Nodes (16): 1. Принципы, 2. Локальная схема: IndexedDB (Dexie), 3.1 RLS, 3. Схема Supabase Postgres (M7), 4.1 Порядок, 4.2 Правила по таблицам (идемпотентность по `id`, конфликты по `updated_at`), 4.3 Пересчёт производных данных, 4.4 Ошибки и откат (+8 more)

### Community 11 - "archive.ts"
Cohesion: 0.08
Nodes (37): Frontend Developer, Candle, Symbol, Timeframe, UtcMs, AGG_TRADES_HEADER, AggTrade, ARCHIVE_BASE_URL (+29 more)

### Community 12 - "core/package.json"
Cohesion: 0.15
Nodes (14): devDependencies, vitest@^4.1.12, @vitest/coverage-v8@^4.1.12, exports, vitest, @vitest/coverage-v8, name, private (+6 more)

### Community 13 - "compilerOptions"
Cohesion: 0.13
Nodes (14): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, lib, module, moduleResolution, noEmit (+6 more)

### Community 14 - "Interview Summary — Trading Lab"
Cohesion: 0.14
Nodes (13): 1. Продукт и пользователь, 2. Модули и приоритеты, 3. Обратная связь и прогресс, 4. Интерфейс, 5. Рыночные данные, 6. Стек и инфраструктура, 7. Процесс, Interview Summary — Trading Lab (+5 more)

### Community 15 - "layout.tsx"
Cohesion: 0.33
Nodes (5): Page(), @testing-library/react@^16.0.0, Home(), ru, @testing-library/react

### Community 16 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, allowJs, incremental, jsx, lib, paths, plugins, exclude (+3 more)

### Community 17 - "Project Status — Trading Lab"
Cohesion: 0.25
Nodes (7): Project Status — Trading Lab, Блокирующие проблемы, Доступность рыночных данных из контейнера (проверено curl), Завершённые этапы, Окружение (облачный контейнер Claude Code), Следующие действия, Текущие задачи

### Community 18 - "Skills Registry — Trading Lab"
Cohesion: 0.25
Nodes (7): Skills Registry — Trading Lab, Кандидаты — отложены до утверждения архитектуры, Отклонённые, Справочник: Public APIs, Уже доступные навыки окружения (не требуют установки), Установка в новом контейнере, Установленные инструменты

### Community 19 - "backend-developer.md"
Cohesion: 0.29
Nodes (6): graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 20 - "chart-developer.md"
Cohesion: 0.29
Nodes (6): graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 21 - "devops-security.md"
Cohesion: 0.29
Nodes (6): graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 22 - "documentation-engineer.md"
Cohesion: 0.29
Nodes (6): graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 23 - "frontend-developer.md"
Cohesion: 0.29
Nodes (6): graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 24 - "market-data-engineer.md"
Cohesion: 0.29
Nodes (6): graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 25 - "qa-engineer.md"
Cohesion: 0.29
Nodes (6): graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 26 - "technical-analyst.md"
Cohesion: 0.29
Nodes (6): graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 27 - "uiux-designer.md"
Cohesion: 0.29
Nodes (6): graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 28 - "ADR-0005: Stateless-задания с подписанными токенами; будущее только на сервере"
Cohesion: 0.29
Nodes (6): ADR-0005: Stateless-задания с подписанными токенами; будущее только на сервере, Контекст, Открытые вопросы, Последствия, Рассмотренные альтернативы, Решение

### Community 29 - "ADR-0007: Правила исхода сделки Challenge (drill-down)"
Cohesion: 0.29
Nodes (6): ADR-0007: Правила исхода сделки Challenge (drill-down), Контекст, Открытые вопросы, Последствия, Рассмотренные альтернативы, Решение

### Community 30 - "ADR-0001: Next.js 16 + TypeScript strict, pnpm monorepo, Vercel"
Cohesion: 0.33
Nodes (5): ADR-0001: Next.js 16 + TypeScript strict, pnpm monorepo, Vercel, Контекст, Последствия, Рассмотренные альтернативы, Решение

### Community 31 - "ADR-0003: Живые данные грузит браузер напрямую (REST + WS), fallback — REST-polling"
Cohesion: 0.33
Nodes (5): ADR-0003: Живые данные грузит браузер напрямую (REST + WS), fallback — REST-polling, Контекст, Последствия, Рассмотренные альтернативы, Решение

### Community 32 - "ADR-0004: История для заданий — сервер читает архив data.binance.vision"
Cohesion: 0.33
Nodes (5): ADR-0004: История для заданий — сервер читает архив data.binance.vision, Контекст, Последствия, Рассмотренные альтернативы, Решение

### Community 33 - "ADR-0006: Синхронизация таймфреймов — нативные ТФ, инвариант агрегации, sliceAt"
Cohesion: 0.33
Nodes (5): ADR-0006: Синхронизация таймфреймов — нативные ТФ, инвариант агрегации, sliceAt, Контекст, Последствия, Рассмотренные альтернативы, Решение

### Community 34 - "ADR-0008: Local-first хранилище за интерфейсом Repository; Supabase в M7"
Cohesion: 0.29
Nodes (6): ADR-0008: Local-first хранилище за интерфейсом Repository; Supabase в M7, Контекст, Открытые вопросы, Последствия, Рассмотренные альтернативы, Решение

### Community 35 - "ADR-0009: Детерминированное общее ядро @tl/core; разборы по шаблонам; ИИ позже"
Cohesion: 0.33
Nodes (5): ADR-0009: Детерминированное общее ядро @tl/core; разборы по шаблонам; ИИ позже, Контекст, Последствия, Рассмотренные альтернативы, Решение

### Community 36 - ".prettierrc.json"
Cohesion: 0.40
Nodes (4): printWidth, semi, singleQuote, trailingComma

### Community 37 - "e2e/tsconfig.json"
Cohesion: 0.50
Nodes (3): extends, include, ../tsconfig.base.json

### Community 38 - "core/tsconfig.json"
Cohesion: 0.50
Nodes (3): extends, include, ../../tsconfig.base.json

### Community 39 - "market-data/tsconfig.json"
Cohesion: 0.50
Nodes (3): extends, include, ../../tsconfig.base.json

### Community 45 - "history/route.ts"
Cohesion: 0.06
Nodes (25): dynamic, errorResponse(), GET(), ISSUE_CODES, querySchema, runtime, SYMBOLS, call() (+17 more)

### Community 46 - "LAYOUTS — Trading Lab"
Cohesion: 0.07
Nodes (29): 0.1 Навигация и уровни, 0.2 Зоны экрана 390x844, 0.3 Жесты и разметка (мобильный), 0. Общие правила, 1.1 Мобильный 390x844 (прокручивается; график не нужен), 1.2 Десктоп 1440x900, 1. Главная (раздел «Обучение»), 2.1 Мобильный 390x844 (+21 more)

### Community 47 - "2. Компоненты"
Cohesion: 0.09
Nodes (21): 0. Общее, 1.1 Инструменты разметки, 1.2 Остальные иконки, 1. Набор иконок: lucide-react, 2.10 ProgressBar, 2.11 Toast, 2.12 Tooltip / Hint, 2.13 FeedbackBlock (разбор) (+13 more)

### Community 48 - "DESIGN — Trading Lab"
Cohesion: 0.11
Nodes (17): 1. Принципы, 2.1 Токены, 2.2 Контраст текста (WCAG AA, порог 4.5:1), 2.3 Метки пользователя и алгоритма, 2.4 Проверка при дальтонизме, 2. Цвет, 3.1 Шрифт, 3.2 Шкала (+9 more)

### Community 49 - "COPY — микрокопия Trading Lab"
Cohesion: 0.12
Nodes (15): 10. Спецификации длины, 1. Навигация и разделы, 2. Кнопки и действия, 3. Заголовки, подписи, статусы, 4. Подсказки инструментов (Tooltip, десктоп; строка контекста, мобильный), 5.1 Пустые состояния, 5.2 Ошибки загрузки (блок на месте графика), 5.3 Офлайн и живые данные (+7 more)

### Community 50 - "check_tokens.py"
Cohesion: 0.20
Nodes (7): cr(), de(), lab(), lin(), lum(), rgb(), sim()

### Community 51 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, jsdom@^26.0.0, tailwindcss@^4.0.0, @tailwindcss/postcss@^4.0.0, @types/react@^19.0.0, @types/react-dom@^19.0.0, vitest@^4.1.12, vitest (+5 more)

### Community 52 - "layout.tsx"
Cohesion: 0.18
Nodes (7): metadata, csp, nextConfig, next@^16.0.0, react@^19.0.0, next, react

### Community 54 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, start, test, typecheck

### Community 55 - "ADR-0002: Lightweight Charts v5 + собственный слой разметки на Series Primitives"
Cohesion: 0.47
Nodes (6): ADR-0002: Lightweight Charts v5 + собственный слой разметки на Series Primitives, Контекст, Последствия, Рассмотренные альтернативы, Решение, Mark

### Community 56 - "fixtures"
Cohesion: 0.50
Nodes (3): fixtures, recorded/ - записанные форматы API (fapi/fstream недоступны из облака, 451), Архивные CSV

## Knowledge Gaps
- **4 isolated node(s):** `../../tsconfig.base.json`, `../tsconfig.base.json`, `../../tsconfig.base.json`, `../../tsconfig.base.json`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 474 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ArchiveSource` connect `archive.ts` to `PRD — Trading Lab`, `core/src/index.ts`, `2. Карточки`, `Стратегия тестирования — Trading Lab`, `history/route.ts`, `ADR-0001: Next.js 16 + TypeScript strict, pnpm monorepo, Vercel`?**
  _High betweenness centrality (0.125) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `ArchiveSource` (e.g. with `Market Data Engineer` and `Решение`) actually correct?**
  _`ArchiveSource` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `../../tsconfig.base.json`, `../tsconfig.base.json`, `../../tsconfig.base.json` to the rest of the system?**
  _4 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `web/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.14619883040935672 - nodes in this community are weakly interconnected._
- **Why does `PRD — Trading Lab` connect `PRD — Trading Lab` to `Стратегия тестирования — Trading Lab`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `UtcMs` (e.g. with `1. Общие соглашения` and `4.1 Шкала задания`) actually correct?**
  _`UtcMs` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `PRD — Trading Lab` be split into smaller, more focused modules?**
  _Cohesion score 0.04878048780487805 - nodes in this community are weakly interconnected._