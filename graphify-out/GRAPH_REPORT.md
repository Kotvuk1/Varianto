# Graph Report - Varianto  (2026-11-03)

## Corpus Check
- 200 files · ~104,487 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 28 file(s) not represented in the graph (top: .csv 22, (none) 4, .example 1)

## Summary
- 1484 nodes · 2875 edges · 97 communities (91 shown, 6 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 113 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ef4af2f8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- skills.ts
- PRD — Trading Lab
- package.json
- API Contracts — Trading Lab
- archive.test.ts
- with
- Architecture — Trading Lab
- 2. Карточки
- Стратегия тестирования — Trading Lab
- market-data/package.json
- UtcMs
- live.ts
- core/package.json
- compilerOptions
- Interview Summary — Trading Lab
- ui/index.ts
- compilerOptions
- Project Status — Trading Lab
- Skills Registry — Trading Lab
- Repository
- chart-developer.md
- devops-security.md
- documentation-engineer.md
- hit.ts
- market-data-engineer.md
- qa-engineer.md
- technical-analyst.md
- uiux-designer.md
- DECISIONS/README.md
- resolve.ts
- src/types.ts
- templates.ru.ts
- progress/streak.ts
- layout.ts
- ADR-0008: Local-first хранилище за интерфейсом Repository; Supabase в M7
- analyzeStructure
- .prettierrc.json
- e2e/tsconfig.json
- core/tsconfig.json
- market-data/tsconfig.json
- Candle
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
- web/package.json
- AppShell.tsx
- live.test.ts
- controller.ts
- TradingChart.tsx
- fixtures
- TimeIndex
- TradingChart
- data/streak.test.ts
- fetch-fixtures.mjs
- controller.test.ts
- archive.ts
- TerminalScreen.tsx
- serialize.ts
- ArchiveSource
- core/src/index.ts
- README.md
- 4. Обязательные наборы тестов
- DrawingPrimitive
- Roadmap — Trading Lab
- 5. Потоки данных
- 4. Домен и общие типы (`@tl/core`)
- Settings
- normalize.ts
- Mark
- fixtures-pa-challenge.ts
- 4. Функциональные требования
- LocalRepository
- ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`
- 12. `gradeMarks` — сравнение разметки
- 7. User Flows
- structure.ts
- 9. Свечные модели Price Action (`detectPatterns`)
- frontend-developer.md
- Команда агентов — Trading Lab
- 11. Контекст для PA «Контекст»
- 14. Challenge: эталон, оценка качества, WAIT, лимиты
- 1. Общие соглашения
- 5. Тренд, BOS и CHoCH
- 4. Миграция локальных данных в Supabase при первом входе
- 3. Внешняя и внутренняя структура
- 6. Liquidity sweep
- 16. Навыки и прогресс
- 18. Golden-тесты
- 7. Order Block
- web/AGENTS.md

## God Nodes (most connected - your core abstractions)
1. `UtcMs` - 41 edges
2. `Candle` - 36 edges
3. `react` - 34 edges
4. `Mark` - 33 edges
5. `cn()` - 30 edges
6. `TradingChart()` - 26 edges
7. `LocalRepository` - 23 edges
8. `Symbol` - 23 edges
9. `ArchiveSource` - 23 edges
10. `TimeIndex` - 22 edges

## Surprising Connections (you probably didn't know these)
- `5.4 Хранение (Repository)` --references--> `LocalRepository`  [INFERRED]
  docs/ARCHITECTURE.md → apps/web/src/storage/LocalRepository.ts
- `8. Открытые вопросы` --references--> `Attempt`  [INFERRED]
  docs/API_CONTRACTS.md → apps/web/src/storage/types.ts
- `7. Интерфейс `Repository` (`ARCHITECTURE.md` §5.4)` --references--> `Repository`  [INFERRED]
  docs/API_CONTRACTS.md → apps/web/src/storage/types.ts
- `Решение` --references--> `sliceAt()`  [INFERRED]
  docs/DECISIONS/0005-stateless-signed-task-tokens.md → packages/core/src/candles/aggregate.ts
- `6.3 Архив data.binance.vision (сервер)` --references--> `resolveTrade()`  [INFERRED]
  docs/API_CONTRACTS.md → packages/core/src/challenge/resolve.ts

## Import Cycles
- 2-file cycle: `packages/core/src/candles/aggregate.ts -> packages/core/src/index.ts -> packages/core/src/candles/aggregate.ts`

## Communities (97 total, 6 thin omitted)

### Community 0 - "skills.ts"
Cohesion: 0.11
Nodes (27): 13.1 Общие правила, 13.2 Market Structure «Разметка», 13.3 Market Structure «Вопрос», 13.4 Price Action, 13.5 Challenge, 13. Генерация заданий, PatternInstance, PatternType (+19 more)

### Community 1 - "PRD — Trading Lab"
Cohesion: 0.10
Nodes (21): 10. Приоритизация функций (MoSCoW), 11. План MVP, 12. Открытые вопросы, 1.1 Что это, 1.2 Цель, 1.3 Целевой пользователь, 1.4 Модули, 1. Обзор и цель продукта (+13 more)

### Community 2 - "package.json"
Cohesion: 0.06
Nodes (41): PORT, chartBox(), drawTwoPoint(), isMobile(), markPoints(), openTerminal(), selectTool(), tapAt() (+33 more)

### Community 3 - "API Contracts — Trading Lab"
Cohesion: 0.07
Nodes (26): 1.1 Формат ошибки, 1.2 Заголовки кэша, 1. Общие соглашения, 2.2 Расширения контрактов (предложение — фиксируются при реализации в `@tl/core`), 2. Типы `@tl/core`, используемые в контрактах, 3.1 `GET /api/health`, 3.2 `GET /api/history`, 3.3 `POST /api/tasks/{module}/next` (+18 more)

### Community 4 - "archive.test.ts"
Cohesion: 0.22
Nodes (9): load(), klinesZip(), NOW, Served, zipOf(), fixtureJson(), fixtureText(), klinesCsvPath() (+1 more)

### Community 5 - "with"
Cohesion: 0.08
Nodes (26): runs-on, steps, GITHUB_TOKEN, jobs, check, secrets-scan, name, on (+18 more)

### Community 6 - "Architecture — Trading Lab"
Cohesion: 0.20
Nodes (10): 10. Развёртывание, 11. Риски, 1. Ключевые ограничения, определяющие архитектуру, 2. Обзор, 3. Репозиторий (pnpm monorepo), 6. Авторизация (M7), 7. Безопасность, 8. Фронтенд (+2 more)

### Community 7 - "2. Карточки"
Cohesion: 0.22
Nodes (9): 2. Карточки, Chart Developer, DevOps/Security Engineer, Documentation Engineer, Market Data Engineer, Orchestrator, QA Engineer, Technical Analyst (+1 more)

### Community 8 - "Стратегия тестирования — Trading Lab"
Cohesion: 0.22
Nodes (9): 10. Производительность, 1. Принципы, 3. Фикстуры, 5. E2E (Playwright), 6. Визуальная проверка и доступность, 7. Критерии «готово» для вехи, 8. CI (GitHub Actions), 9. Покрытие (+1 more)

### Community 9 - "market-data/package.json"
Cohesion: 0.11
Nodes (20): dependencies, fflate@^0.8.3, @tl/core@workspace:*, devDependencies, vitest@^4.1.12, @vitest/coverage-v8@^4.1.12, exports, ./archive (+12 more)

### Community 10 - "UtcMs"
Cohesion: 0.20
Nodes (13): DailyActivityRow, SkillStatRow, TradingLabDB, mark, Attempt, AttemptFilter, DEFAULT_DAILY_GOAL, ModuleId (+5 more)

### Community 11 - "live.ts"
Cohesion: 0.11
Nodes (19): Frontend Developer, AnalyzeOptions, Timeframe, BINANCE_REST_BASE, BINANCE_WS_BASE, binanceInterval(), FetchKlinesOptions, LiveErrorCode (+11 more)

### Community 12 - "core/package.json"
Cohesion: 0.15
Nodes (14): devDependencies, vitest@^4.1.12, @vitest/coverage-v8@^4.1.12, exports, vitest, @vitest/coverage-v8, name, private (+6 more)

### Community 13 - "compilerOptions"
Cohesion: 0.13
Nodes (14): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, lib, module, moduleResolution, noEmit (+6 more)

### Community 14 - "Interview Summary — Trading Lab"
Cohesion: 0.14
Nodes (13): 1. Продукт и пользователь, 2. Модули и приоритеты, 3. Обратная связь и прогресс, 4. Интерфейс, 5. Рыночные данные, 6. Стек и инфраструктура, 7. Процесс, Interview Summary — Trading Lab (+5 more)

### Community 15 - "ui/index.ts"
Cohesion: 0.05
Nodes (85): Page(), Page(), Page(), EmptyState(), ErrorState(), LoadingRows(), AsyncState, useAsync() (+77 more)

### Community 16 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, allowJs, incremental, jsx, lib, paths, plugins, exclude (+3 more)

### Community 17 - "Project Status — Trading Lab"
Cohesion: 0.25
Nodes (7): Project Status — Trading Lab, Блокирующие проблемы, Доступность рыночных данных из контейнера (проверено curl), Завершённые этапы, Окружение (облачный контейнер Claude Code), Следующие действия, Текущие задачи

### Community 18 - "Skills Registry — Trading Lab"
Cohesion: 0.25
Nodes (7): Skills Registry — Trading Lab, Кандидаты — отложены до утверждения архитектуры, Отклонённые, Справочник: Public APIs, Уже доступные навыки окружения (не требуют установки), Установка в новом контейнере, Установленные инструменты

### Community 19 - "Repository"
Cohesion: 0.14
Nodes (7): Repository, graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 20 - "chart-developer.md"
Cohesion: 0.29
Nodes (6): graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 21 - "devops-security.md"
Cohesion: 0.29
Nodes (6): graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 22 - "documentation-engineer.md"
Cohesion: 0.29
Nodes (6): graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 23 - "hit.ts"
Cohesion: 0.17
Nodes (14): distToRectEdge(), distToSegment(), Hit, hitTest(), inside(), partScore(), geos(), synthetic_proj (+6 more)

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

### Community 28 - "DECISIONS/README.md"
Cohesion: 0.05
Nodes (31): ADR-0001: Next.js 16 + TypeScript strict, pnpm monorepo, Vercel, Контекст, Последствия, Рассмотренные альтернативы, Решение, ADR-0003: Живые данные грузит браузер напрямую (REST + WS), fallback — REST-polling, Контекст, Последствия (+23 more)

### Community 29 - "resolve.ts"
Cohesion: 0.08
Nodes (28): ADR-0007, ADR-0007: Правила исхода сделки Challenge (drill-down), Контекст, Открытые вопросы (закрыты: `docs/specs/ALGORITHMS.md`), Последствия, Рассмотренные альтернативы, Решение, 10.1 Алгоритм (+20 more)

### Community 30 - "src/types.ts"
Cohesion: 0.13
Nodes (19): detectSweeps(), labelSwings(), AlgoMarkSet, Difficulty, GradeContext, MarkGrade, MarkGradeResult, PatternType (+11 more)

### Community 31 - "templates.ru.ts"
Cohesion: 0.11
Nodes (16): 17.1 Структура и ключи, 17.2 Верность и общие принципы, 17.3 Что понято верно (`OkCode`; новые помечены *), 17.4 Ошибки (части 3–6), 17. Шаблоны разбора (источник `src/i18n/ru/feedback`), 19. Расхождения с документами, ERROR_SKILLS, ERROR_TEMPLATES_RU (+8 more)

### Community 32 - "progress/streak.ts"
Cohesion: 0.18
Nodes (17): ChallengeAttemptStat, challengeStats(), dailyProgress(), DayMap, DayRecord, GOAL_DEFAULT, GOAL_MAX, GOAL_MIN (+9 more)

### Community 33 - "layout.ts"
Cohesion: 0.16
Nodes (16): OpenCandleInfo, PrimitiveState, ZONE_KINDS, CHAR_W, Dash, GLYPH_OFFSET, GlyphKind, Handle (+8 more)

### Community 34 - "ADR-0008: Local-first хранилище за интерфейсом Repository; Supabase в M7"
Cohesion: 0.29
Nodes (6): ADR-0008: Local-first хранилище за интерфейсом Repository; Supabase в M7, Контекст, Открытые вопросы, Последствия, Рассмотренные альтернативы, Решение

### Community 35 - "analyzeStructure"
Cohesion: 0.16
Nodes (16): 2.1 Из `ARCHITECTURE.md` §4 (дословно), Решение, 2.1 Сигнатура, 2.2 Определение, 2.3 Граничные случаи, 2.4 Кандидаты у правого края (`pendingSwings`), 2.5 Псевдокод, 2. `detectSwings` — фрактальные swing (+8 more)

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

### Community 40 - "Candle"
Cohesion: 0.19
Nodes (12): allSwingsMap, EMPTY_LAYER, detectFvgs(), atr14(), closedOnly(), CoreInputError, gaps(), inferTimeframe() (+4 more)

### Community 45 - "history/route.ts"
Cohesion: 0.13
Nodes (14): dynamic, errorResponse(), GET(), ISSUE_CODES, querySchema, runtime, SYMBOLS, call() (+6 more)

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

### Community 51 - "web/package.json"
Cohesion: 0.06
Nodes (42): dependencies, dexie@^4.0.0, lightweight-charts@~5.2.1, lucide-react@^1.66.0, react@^19.0.0, react-dom@^19.0.0, @tl/core@workspace:*, @tl/market-data@workspace:* (+34 more)

### Community 52 - "AppShell.tsx"
Cohesion: 0.09
Nodes (32): metadata, plexMono, plexSans, RootLayout(), viewport, csp, nextConfig, next@^16.0.0 (+24 more)

### Community 53 - "live.test.ts"
Cohesion: 0.12
Nodes (12): LiveStatus, archiveH1, archiveM1, FakeWs, json(), NOW, restH1, restM1 (+4 more)

### Community 54 - "controller.ts"
Cohesion: 0.19
Nodes (14): PointerKind, constrainAnchors(), createMark(), FULL_WIDTH_KINDS, isDrawKind(), RAY_RIGHT_KINDS, TOOL_DEFS, ToolDef (+6 more)

### Community 55 - "TradingChart.tsx"
Cohesion: 0.14
Nodes (23): limitCandles(), OPEN_CANDLE_ALPHA, pricePrecision(), T0, tokens, toCandleData(), toVolumeData(), TimeWindow (+15 more)

### Community 56 - "fixtures"
Cohesion: 0.50
Nodes (3): fixtures, recorded/ - записанные форматы API (fapi/fstream недоступны из облака, 451), Архивные CSV

### Community 57 - "TimeIndex"
Cohesion: 0.13
Nodes (14): lwcProjection(), snapAnchor(), SnapOptions, snapPriceToCandle(), synthetic_candles, T0, T0, TimeIndex (+6 more)

### Community 58 - "TradingChart"
Cohesion: 0.17
Nodes (14): DrawKind, DrawingController, bosMark, drag(), index, lvl, proj, pt() (+6 more)

### Community 59 - "data/streak.test.ts"
Cohesion: 0.43
Nodes (4): DayStat, prevDay(), softStreak(), done

### Community 60 - "fetch-fixtures.mjs"
Cohesion: 0.13
Nodes (9): downloadedAt, items, m1, rec, root, rows, scratch, table (+1 more)

### Community 61 - "controller.test.ts"
Cohesion: 0.21
Nodes (4): isMarkVisible(), synthetic_proj, T0, Projection

### Community 62 - "archive.ts"
Cohesion: 0.21
Nodes (11): AGG_TRADES_HEADER, AggTrade, ARCHIVE_BASE_URL, ArchiveFetch, ArchiveFileSpec, ArchiveSourceOptions, dayKey(), monthKey() (+3 more)

### Community 63 - "TerminalScreen.tsx"
Cohesion: 0.07
Nodes (50): TerminalPage(), formatPrice(), ARCHIVE_MIN_AGE_MS, ARCHIVE_SYMBOLS, archiveAllowed(), archivePageSize(), archiveWindow(), HISTORY_PAGE (+42 more)

### Community 64 - "serialize.ts"
Cohesion: 0.24
Nodes (9): anchor, KINDS, MARKS_FORMAT_VERSION, markSchema, parseMarks(), serializeMarks(), m, validateMarks() (+1 more)

### Community 65 - "ArchiveSource"
Cohesion: 0.31
Nodes (3): ArchiveSource, archiveUrl(), ArchiveError

### Community 66 - "core/src/index.ts"
Cohesion: 0.16
Nodes (10): dynamic, GET(), Backend Developer, 2. Пирамида, aggregate(), SeriesByTf, sliceAt(), synthetic_hour() (+2 more)

### Community 67 - "README.md"
Cohesion: 0.22
Nodes (4): Trading Lab, Документация, Запуск, Структура

### Community 68 - "4. Обязательные наборы тестов"
Cohesion: 0.25
Nodes (8): 4.1 Инвариант агрегации таймфреймов, 4.2 `sliceAt(series, T)`, 4.3 Нормализация (`market-data`), 4.4 Golden-тесты SMC/PA, 4.5 `resolveTrade`, 4.6 Интеграционные тесты API, 4.7 Прочие unit-тесты, 4. Обязательные наборы тестов

### Community 70 - "Roadmap — Trading Lab"
Cohesion: 0.29
Nodes (6): MVP, Roadmap — Trading Lab, v1.1 — Fibonacci Playground и Premium/Discount, v1.2 — Elliott Wave Lab, v2, Правила корректировки

### Community 71 - "5. Потоки данных"
Cohesion: 0.40
Nodes (5): 5.1 Живые данные (терминал), 5.2 История для заданий (сервер), 5.3 Задания (stateless, без БД до M7), 5.4 Хранение (Repository), 5. Потоки данных

### Community 72 - "4. Домен и общие типы (`@tl/core`)"
Cohesion: 0.50
Nodes (4): 4.1 Синхронизация таймфреймов, 4.2 Разметка (общая модель для пользователя и алгоритма), 4.3 Алгоритмы (детерминированные, версионируемые), 4. Домен и общие типы (`@tl/core`)

### Community 73 - "Settings"
Cohesion: 0.16
Nodes (14): localDay(), defaultSettings(), Settings, 1. Принципы, 2. Локальная схема: IndexedDB (Dexie), 3.1 RLS, 3. Схема Supabase Postgres (M7), 5.1 Точность навыка (+6 more)

### Community 74 - "normalize.ts"
Cohesion: 0.25
Nodes (10): ArchiveErrorCode, ARCHIVE_KLINE_HEADER, Gap, num(), parseArchiveCsv(), ParseArchiveOptions, parseRestKline(), parseWsKline() (+2 more)

### Community 75 - "Mark"
Cohesion: 0.23
Nodes (8): TerminalMarksRow, ADR-0002: Lightweight Charts v5 + собственный слой разметки на Series Primitives, Контекст, Последствия, Рассмотренные альтернативы, Решение, Mark, Symbol

### Community 76 - "fixtures-pa-challenge.ts"
Cohesion: 0.18
Nodes (7): loadAggTrades(), loadKlines(), ROOT, TestAggTrade, dst, root, src

### Community 77 - "4. Функциональные требования"
Cohesion: 0.17
Nodes (12): 4.10 Авторизация (FR-AUTH), 4.11 Интерфейс (FR-UI), 4.1 Данные (FR-DATA), 4.2 График (FR-CHART), 4.3 Слой разметки (FR-DRAW), 4.4 Market Structure Analyzer (FR-MS), 4.5 Trading Challenge (FR-TC), 4.6 Price Action Trainer (FR-PA) (+4 more)

### Community 78 - "LocalRepository"
Cohesion: 0.31
Nodes (5): LocalRepository, DailyActivity, getDefaultRepository(), RepositoryContext, RepositoryProvider()

### Community 79 - "ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`"
Cohesion: 0.20
Nodes (9): 20. Спорные места и вопросы оркестратору, 4.1 Правило, 4.2 Граничные случаи, 4. Метки HH / HL / LH / LL, 8.1 Определение, 8.2 Заполнение, 8.3 Сигнатура, 8. FVG (Fair Value Gap) (+1 more)

### Community 80 - "12. `gradeMarks` — сравнение разметки"
Cohesion: 0.22
Nodes (9): 12.1 Сигнатура (расширение `API_CONTRACTS.md`), 12.2 Ключевая свеча метки, 12.3 Группы сопоставления, 12.4 Совместимость и стоимость пары, 12.5 Матчинг (решение: DP по времени вместо венгерского), 12.6 Классификация после матчинга, 12.7 Счёт, вердикт, навыки, 12.8 Пример AC-07 на реальных данных (GS-1) (+1 more)

### Community 81 - "7. User Flows"
Cohesion: 0.25
Nodes (8): 7.1 Первый вход, 7.2 Сессия Market Structure (режим «Разметка»), 7.3 Trading Challenge: от выбора до разбора, 7.4 Price Action «Контекст», 7.5 Терминал с проверкой разметки, 7.6 Просмотр «Слабых мест», 7.7 Продолжение на другом устройстве, 7. User Flows

### Community 82 - "structure.ts"
Cohesion: 0.39
Nodes (7): LayerRun, makeEvent(), Range, runExternalLayer(), runInternalLayer(), LayerState, StructureEvent

### Community 83 - "9. Свечные модели Price Action (`detectPatterns`)"
Cohesion: 0.29
Nodes (7): c(), 1.2 Термины свечи, 9.1 Состав (ответ на OQ-11), 9.2 Критерии (ATR = ATR14 последней свечи модели, если не сказано иное; модель не ищется при ATR = null или `range == 0`), 9.3 Выход, 9.4 Проверенные примеры (BTCUSDT 4h 2026-09, GS-5), 9. Свечные модели Price Action (`detectPatterns`)

### Community 84 - "frontend-developer.md"
Cohesion: 0.29
Nodes (6): graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 85 - "Команда агентов — Trading Lab"
Cohesion: 0.29
Nodes (6): 1. Сводка, 3. Правила оркестрации, 4. Формат отчёта агента (до 15 строк), 5. Шаблон задания агенту, Команда агентов — Trading Lab, Правило graphify (включается в каждый промпт агента, исследующего код)

### Community 86 - "11. Контекст для PA «Контекст»"
Cohesion: 0.29
Nodes (7): 11.1 Формат ответа (ответ на OQ-16), 11.2 Задание, 11.3 Факторы (детерминированно, для бычьей модели; медвежья — зеркально), 11.4 Значимость (решение), 11.5 Оценка, 11.6 Генерация, 11. Контекст для PA «Контекст»

### Community 87 - "14. Challenge: эталон, оценка качества, WAIT, лимиты"
Cohesion: 0.29
Nodes (7): 14.1 Факты на момент T (`ChallengeFacts`), 14.2 Эталонная сторона `refSide`, 14.3 Оценка качества 0–100 (ответ на OQ-08), независимо от исхода, 14.4 Правильность, вердикт, лимиты, 14.5 Предикаты причин (`ReasonCode`, состав без изменений), 14.6 Подсказки (easy), 14. Challenge: эталон, оценка качества, WAIT, лимиты

### Community 88 - "1. Общие соглашения"
Cohesion: 0.33
Nodes (6): 1.1 Входные свечи, 1.3 ATR, 1.4 Детерминизм и числа, 1.5 ALGO_VERSION, 1.6 Параметры по сложностям (сводка), 1. Общие соглашения

### Community 89 - "5. Тренд, BOS и CHoCH"
Cohesion: 0.33
Nodes (6): 5.1 Общие правила, 5.2 Внешний слой — машина состояний с защищёнными уровнями, 5.3 Внутренний слой — «последний подтверждённый swing», 5.4 Что происходит после CHoCH, 5.5 Граничные случаи (проверены на реальных свечах), 5. Тренд, BOS и CHoCH

### Community 90 - "4. Миграция локальных данных в Supabase при первом входе"
Cohesion: 0.40
Nodes (5): 4.1 Порядок, 4.2 Правила по таблицам (идемпотентность по `id`, конфликты по `updated_at`), 4.3 Пересчёт производных данных, 4.4 Ошибки и откат, 4. Миграция локальных данных в Supabase при первом входе

### Community 91 - "3. Внешняя и внутренняя структура"
Cohesion: 0.40
Nodes (5): 3.1 Правило (решение), 3.2 Дедупликация, 3.3 Сигнатура `analyzeStructure`, 3.4 Отображение в `Mark` (общая модель `ARCHITECTURE.md` §4.2), 3. Внешняя и внутренняя структура

### Community 92 - "6. Liquidity sweep"
Cohesion: 0.40
Nodes (5): 6.1 Определение (решение), 6.2 Несколько уровней за одну свечу, 6.3 Граничные случаи, 6.4 Сигнатура, 6. Liquidity sweep

### Community 93 - "16. Навыки и прогресс"
Cohesion: 0.50
Nodes (4): 16.1 Навыки, 16.2 Обновление точности, 16.3 Адаптивная подборка, 16. Навыки и прогресс

### Community 94 - "18. Golden-тесты"
Cohesion: 0.50
Nodes (4): 18.1 Формат и процесс, 18.2 Участки, 18.3 Что ещё размечается после утверждения (M4/M5), 18. Golden-тесты

### Community 95 - "7. Order Block"
Cohesion: 0.50
Nodes (4): 7.1 Определение (решение, ICT: «последняя противоположная свеча перед импульсом, сломавшим структуру»), 7.2 Статус (после свечи события `k`, по закрытым свечам), 7.3 Сигнатура, 7. Order Block

## Knowledge Gaps
- **5 isolated node(s):** `../../tsconfig.base.json`, `../tsconfig.base.json`, `ADR-0007`, `../../tsconfig.base.json`, `../../tsconfig.base.json`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 670 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`` connect `ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`` to `skills.ts`, `analyzeStructure`, `12. `gradeMarks` — сравнение разметки`, `9. Свечные модели Price Action (`detectPatterns`)`, `16. Навыки и прогресс`, `TradingChart.tsx`, `11. Контекст для PA «Контекст»`, `14. Challenge: эталон, оценка качества, WAIT, лимиты`, `1. Общие соглашения`, `5. Тренд, BOS и CHoCH`, `7. Order Block`, `3. Внешняя и внутренняя структура`, `6. Liquidity sweep`, `resolve.ts`, `18. Golden-тесты`, `templates.ru.ts`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `UtcMs` (e.g. with `1. Общие соглашения` and `4.1 Шкала задания`) actually correct?**
  _`UtcMs` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `../../tsconfig.base.json`, `../tsconfig.base.json`, `ADR-0007` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `skills.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10695187165775401 - nodes in this community are weakly interconnected._
- **Why does `Mark` connect `Mark` to `serialize.ts`, `layout.ts`, `UtcMs`, `TradingChart.tsx`, `controller.ts`, `hit.ts`, `1. Общие соглашения`, `TradingChart`, `3. Внешняя и внутренняя структура`, `controller.test.ts`, `src/types.ts`, `TerminalScreen.tsx`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Mark` (e.g. with `Контекст` and `Последствия`) actually correct?**
  _`Mark` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Should `PRD — Trading Lab` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._