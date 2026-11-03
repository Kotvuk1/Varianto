# Graph Report - Varianto  (2026-11-03)

## Corpus Check
- 64 files · ~31,226 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 8, .example 1, .css 1)

## Summary
- 534 nodes · 559 edges · 45 communities (40 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `645601c8`
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
- README.md
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

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 14 edges
2. `PRD — Trading Lab` - 13 edges
3. `Architecture — Trading Lab` - 12 edges
4. `4. Функциональные требования` - 12 edges
5. `2. Карточки` - 11 edges
6. `Стратегия тестирования — Trading Lab` - 11 edges
7. `API Contracts — Trading Lab` - 9 edges
8. `Interview Summary — Trading Lab` - 9 edges
9. `with` - 8 edges
10. `scripts` - 8 edges

## Surprising Connections (you probably didn't know these)
- `1. Общие соглашения` --references--> `UtcMs`  [INFERRED]
  docs/API_CONTRACTS.md → packages/core/src/index.ts
- `4.1 Шкала задания` --references--> `UtcMs`  [INFERRED]
  docs/API_CONTRACTS.md → packages/core/src/index.ts
- `6.1 REST: `GET https://fapi.binance.com/fapi/v1/klines` (браузер)` --references--> `Candle`  [INFERRED]
  docs/API_CONTRACTS.md → packages/core/src/index.ts
- `Контекст` --references--> `Mark`  [INFERRED]
  docs/DECISIONS/0002-lightweight-charts-custom-drawing-layer.md → packages/core/src/index.ts
- `Последствия` --references--> `Mark`  [INFERRED]
  docs/DECISIONS/0002-lightweight-charts-custom-drawing-layer.md → packages/core/src/index.ts

## Import Cycles
- None detected.

## Communities (45 total, 5 thin omitted)

### Community 0 - "web/package.json"
Cohesion: 0.06
Nodes (43): csp, nextConfig, dependencies, dexie@^4.0.0, lightweight-charts@~5.2.1, next@^16.0.0, react@^19.0.0, react-dom@^19.0.0 (+35 more)

### Community 1 - "PRD — Trading Lab"
Cohesion: 0.05
Nodes (41): 10. Приоритизация функций (MoSCoW), 11. План MVP, 12. Открытые вопросы, 1.1 Что это, 1.2 Цель, 1.3 Целевой пользователь, 1.4 Модули, 1. Обзор и цель продукта (+33 more)

### Community 2 - "package.json"
Cohesion: 0.08
Nodes (30): devDependencies, eslint@^9.39.0, eslint-config-next@^16.0.0, @eslint/js@^9.39.0, @playwright/test@1.63.0, prettier@^3.6.0, @types/node@^22.0.0, typescript@~5.9.3 (+22 more)

### Community 3 - "API Contracts — Trading Lab"
Cohesion: 0.07
Nodes (28): 1.1 Формат ошибки, 1.2 Заголовки кэша, 1. Общие соглашения, 2.1 Из `ARCHITECTURE.md` §4 (дословно), 2.2 Расширения контрактов (предложение — фиксируются при реализации в `@tl/core`), 2. Типы `@tl/core`, используемые в контрактах, 3.1 `GET /api/health`, 3.2 `GET /api/history` (+20 more)

### Community 4 - "core/src/index.ts"
Cohesion: 0.10
Nodes (15): dynamic, GET(), ADR-0002: Lightweight Charts v5 + собственный слой разметки на Series Primitives, Контекст, Последствия, Рассмотренные альтернативы, Решение, ALGO_VERSION (+7 more)

### Community 5 - "with"
Cohesion: 0.08
Nodes (26): runs-on, steps, GITHUB_TOKEN, jobs, check, secrets-scan, name, on (+18 more)

### Community 6 - "Architecture — Trading Lab"
Cohesion: 0.11
Nodes (19): 10. Развёртывание, 11. Риски, 1. Ключевые ограничения, определяющие архитектуру, 2. Обзор, 3. Репозиторий (pnpm monorepo), 4.1 Синхронизация таймфреймов, 4.2 Разметка (общая модель для пользователя и алгоритма), 4.3 Алгоритмы (детерминированные, версионируемые) (+11 more)

### Community 7 - "2. Карточки"
Cohesion: 0.11
Nodes (17): 1. Сводка, 2. Карточки, 3. Правила оркестрации, 4. Формат отчёта агента (до 15 строк), 5. Шаблон задания агенту, Backend Developer, Chart Developer, DevOps/Security Engineer (+9 more)

### Community 8 - "Стратегия тестирования — Trading Lab"
Cohesion: 0.11
Nodes (18): 10. Производительность, 1. Принципы, 2. Пирамида, 3. Фикстуры, 4.1 Инвариант агрегации таймфреймов, 4.2 `sliceAt(series, T)`, 4.3 Нормализация (`market-data`), 4.4 Golden-тесты SMC/PA (+10 more)

### Community 9 - "market-data/package.json"
Cohesion: 0.13
Nodes (17): dependencies, @tl/core@workspace:*, devDependencies, vitest@^4.1.12, @vitest/coverage-v8@^4.1.12, exports, @tl/core, vitest (+9 more)

### Community 10 - "Database Schema — Trading Lab"
Cohesion: 0.12
Nodes (16): 1. Принципы, 2. Локальная схема: IndexedDB (Dexie), 3.1 RLS, 3. Схема Supabase Postgres (M7), 4.1 Порядок, 4.2 Правила по таблицам (идемпотентность по `id`, конфликты по `updated_at`), 4.3 Пересчёт производных данных, 4.4 Ошибки и откат (+8 more)

### Community 11 - "README.md"
Cohesion: 0.13
Nodes (10): MVP, Roadmap — Trading Lab, v1.1 — Fibonacci Playground и Premium/Discount, v1.2 — Elliott Wave Lab, v2, Правила корректировки, Trading Lab, Документация (+2 more)

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
Cohesion: 0.22
Nodes (6): metadata, Page(), @testing-library/react@^16.0.0, Home(), ru, @testing-library/react

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
Cohesion: 0.33
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

## Knowledge Gaps
- **4 isolated node(s):** `../../tsconfig.base.json`, `../tsconfig.base.json`, `../../tsconfig.base.json`, `../../tsconfig.base.json`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 345 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `UtcMs` connect `API Contracts — Trading Lab` to `core/src/index.ts`?**
  _High betweenness centrality (0.147) - this node is a cross-community bridge._
- **What connects `../../tsconfig.base.json`, `../tsconfig.base.json`, `../../tsconfig.base.json` to the rest of the system?**
  _4 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `web/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.0595959595959596 - nodes in this community are weakly interconnected._
- **Should `PRD — Trading Lab` be split into smaller, more focused modules?**
  _Cohesion score 0.04878048780487805 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.0766488413547237 - nodes in this community are weakly interconnected._
- **Should `API Contracts — Trading Lab` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Should `core/src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10256410256410256 - nodes in this community are weakly interconnected._