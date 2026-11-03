# Graph Report - Varianto  (2026-11-03)

## Corpus Check
- 269 files · ~154,972 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 32 file(s) not represented in the graph (top: .csv 26, (none) 4, .example 1)

## Summary
- 2044 nodes · 4915 edges · 118 communities (112 shown, 6 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 173 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `eca913b9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- market-structure.ts
- PRD — Trading Lab
- package.json
- API Contracts — Trading Lab
- ProgressScreen.tsx
- with
- Architecture — Trading Lab
- 2. Карточки
- TerminalScreen.tsx
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
- resolve.ts
- chart-developer.md
- devops-security.md
- documentation-engineer.md
- hit.ts
- market-data-engineer.md
- qa-engineer.md
- technical-analyst.md
- uiux-designer.md
- DECISIONS/README.md
- react
- Candle
- grade.ts
- fetch-fixtures.mjs
- grade.test.ts
- token.ts
- findLevels
- .prettierrc.json
- e2e/tsconfig.json
- core/tsconfig.json
- market-data/tsconfig.json
- src/types.ts
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
- rules.ts
- controller.ts
- DrawingPrimitive.ts
- pa/generate.ts
- TimeIndex
- TradingChart
- marks.ts
- useMarketData.ts
- Mark
- tasks.ts
- ToolPalette.tsx
- TradingChart.tsx
- archive.ts
- core/src/index.ts
- README.md
- Repository
- DrawingPrimitive
- schemas.ts
- 5. Потоки данных
- 13. Генерация заданий
- Settings
- normalize.ts
- 8. FVG (Fair Value Gap)
- handlers.ts
- handlers.test.ts
- screens.test.tsx
- ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`
- src/types.ts
- handleGrade
- facts.ts
- patterns.ts
- 4. Функциональные требования
- Команда агентов — Trading Lab
- 11. Контекст для PA «Контекст»
- 14. Challenge: эталон, оценка качества, WAIT, лимиты
- 1. Общие соглашения
- 5. Тренд, BOS и CHoCH
- ApiError
- 3. Внешняя и внутренняя структура
- grade
- backend-developer.md
- Roadmap — Trading Lab
- 7. Order Block
- web/AGENTS.md
- UtcMs
- history/route.ts
- format.ts
- 12. `gradeMarks` — сравнение разметки
- 7. User Flows
- Стратегия тестирования — Trading Lab
- data/streak.test.ts
- server/errors.ts
- ADR-0008: Local-first хранилище за интерфейсом Repository; Supabase в M7
- mulberry32
- context.test.ts
- ADR-0001: Next.js 16 + TypeScript strict, pnpm monorepo, Vercel
- 1. Обзор и цель продукта
- 6. Liquidity sweep
- ADR-0003: Живые данные грузит браузер напрямую (REST + WS), fallback — REST-polling
- ADR-0004: История для заданий — сервер читает архив data.binance.vision
- ADR-0006: Синхронизация таймфреймов — нативные ТФ, инвариант агрегации, sliceAt
- Answer
- 3. Область продукта
- fixtures
- 16. Навыки и прогресс

## God Nodes (most connected - your core abstractions)
1. `UtcMs` - 79 edges
2. `Candle` - 75 edges
3. `Mark` - 53 edges
4. `analyzeStructure()` - 38 edges
5. `react` - 35 edges
6. `cn()` - 35 edges
7. `Timeframe` - 29 edges
8. `TradingChart()` - 28 edges
9. `ArchiveSource` - 28 edges
10. `DrawingController` - 26 edges

## Surprising Connections (you probably didn't know these)
- `Правила` --references--> `grade()`  [INFERRED]
  .claude/agents/backend-developer.md → apps/web/src/server/handlers.test.ts
- `5.3 Задания (stateless, без БД до M7)` --references--> `grade()`  [INFERRED]
  docs/ARCHITECTURE.md → apps/web/src/server/handlers.test.ts
- `Решение` --references--> `grade()`  [INFERRED]
  docs/DECISIONS/0007-trade-resolution-drilldown.md → apps/web/src/server/handlers.test.ts
- `Контекст` --references--> `grade()`  [INFERRED]
  docs/DECISIONS/0009-deterministic-core-engine.md → apps/web/src/server/handlers.test.ts
- `3.4 Технические риски` --references--> `grade()`  [INFERRED]
  docs/PRD.md → apps/web/src/server/handlers.test.ts

## Import Cycles
- 2-file cycle: `packages/core/src/candles/aggregate.ts -> packages/core/src/index.ts -> packages/core/src/candles/aggregate.ts`

## Communities (118 total, 6 thin omitted)

### Community 0 - "market-structure.ts"
Cohesion: 0.12
Nodes (29): buildMs(), gradeMsMark(), atrAt(), Candidate, CONCEPTS, drawCandidate(), meetsMsCriteria(), MS_DEPTH (+21 more)

### Community 1 - "PRD — Trading Lab"
Cohesion: 0.17
Nodes (12): 10. Приоритизация функций (MoSCoW), 11. План MVP, 12. Открытые вопросы, 2. Принципы продукта, 5. Нефункциональные требования, 6. User Stories, 8.1 Сценарии Given/When/Then, 8.2 Сквозные критерии (+4 more)

### Community 2 - "package.json"
Cohesion: 0.06
Nodes (50): PORT, candlePoint(), chartBox(), chartCandles(), drawTwoPoint(), findVisibleBos(), findVisibleFvg(), inBox() (+42 more)

### Community 3 - "API Contracts — Trading Lab"
Cohesion: 0.12
Nodes (17): 1.1 Формат ошибки, 1.2 Заголовки кэша, 1. Общие соглашения, 2.2 Расширения контрактов (предложение — фиксируются при реализации в `@tl/core`), 2. Типы `@tl/core`, используемые в контрактах, 3.1 `GET /api/health`, 3.2 `GET /api/history`, 3.3 `POST /api/tasks/{module}/next` (+9 more)

### Community 4 - "ProgressScreen.tsx"
Cohesion: 0.16
Nodes (27): Page(), Page(), EmptyState(), ErrorState(), LoadingRows(), useAsync(), LearnScreen(), MODULES (+19 more)

### Community 5 - "with"
Cohesion: 0.08
Nodes (26): runs-on, steps, GITHUB_TOKEN, jobs, check, secrets-scan, name, on (+18 more)

### Community 6 - "Architecture — Trading Lab"
Cohesion: 0.15
Nodes (13): 10. Развёртывание, 11. Риски, 1. Ключевые ограничения, определяющие архитектуру, 2. Обзор, 3. Репозиторий (pnpm monorepo), 4.1 Синхронизация таймфреймов, 4.2 Разметка (общая модель для пользователя и алгоритма), 4.3 Алгоритмы (детерминированные, версионируемые) (+5 more)

### Community 7 - "2. Карточки"
Cohesion: 0.20
Nodes (10): 2. Карточки, Backend Developer, Chart Developer, DevOps/Security Engineer, Documentation Engineer, Market Data Engineer, Orchestrator, QA Engineer (+2 more)

### Community 8 - "TerminalScreen.tsx"
Cohesion: 0.17
Nodes (22): TerminalPage(), validateMarks(), NoticeCode, normalizeSymbolInput(), InstructionBar(), InstructionBarProps, instructionText(), MarksSheet() (+14 more)

### Community 9 - "market-data/package.json"
Cohesion: 0.11
Nodes (20): dependencies, fflate@^0.8.3, @tl/core@workspace:*, devDependencies, vitest@^4.1.12, @vitest/coverage-v8@^4.1.12, exports, ./archive (+12 more)

### Community 10 - "UtcMs"
Cohesion: 0.14
Nodes (16): DailyActivityRow, SkillStatRow, TerminalMarksRow, TradingLabDB, defaultSettings(), LocalRepository, mark, Attempt (+8 more)

### Community 11 - "live.ts"
Cohesion: 0.06
Nodes (29): Frontend Developer, BINANCE_REST_BASE, BINANCE_WS_BASE, binanceInterval(), FetchKlinesOptions, LiveErrorCode, LiveFeed, LiveFeedError (+21 more)

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
Cohesion: 0.11
Nodes (30): Badge(), BadgeProps, BottomSheetProps, HEIGHT, SheetHeight, Button(), buttonClass(), ButtonProps (+22 more)

### Community 16 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, allowJs, incremental, jsx, lib, paths, plugins, exclude (+3 more)

### Community 17 - "Project Status — Trading Lab"
Cohesion: 0.25
Nodes (7): Project Status — Trading Lab, Блокирующие проблемы, Доступность рыночных данных из контейнера (проверено curl), Завершённые этапы, Окружение (облачный контейнер Claude Code), Следующие действия, Текущие задачи

### Community 18 - "Skills Registry — Trading Lab"
Cohesion: 0.25
Nodes (7): Skills Registry — Trading Lab, Кандидаты — отложены до утверждения архитектуры, Отклонённые, Справочник: Public APIs, Уже доступные навыки окружения (не требуют установки), Установка в новом контейнере, Установленные инструменты

### Community 19 - "resolve.ts"
Cohesion: 0.05
Nodes (39): status(), ADR-0007, 6.1 REST: `GET https://fapi.binance.com/fapi/v1/klines` (браузер), 6.2 WebSocket: kline stream (браузер), 6.3 Архив data.binance.vision (сервер), 6. Внешние API Binance, ADR-0007: Правила исхода сделки Challenge (drill-down), Контекст (+31 more)

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
Cohesion: 0.07
Nodes (33): distToRectEdge(), distToSegment(), Hit, hitTest(), inside(), partScore(), geos(), synthetic_proj (+25 more)

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
Cohesion: 0.22
Nodes (5): ADR-0009: Детерминированное общее ядро @tl/core; разборы по шаблонам; ИИ позже, Контекст, Последствия, Рассмотренные альтернативы, Architecture Decision Records — Trading Lab

### Community 29 - "react"
Cohesion: 0.10
Nodes (23): Page(), AsyncState, wrap(), CANDLE_OPTIONS, DAILY_GOAL_MAX, DAILY_GOAL_MIN, SettingsScreen(), THEME_OPTIONS (+15 more)

### Community 30 - "Candle"
Cohesion: 0.12
Nodes (24): Draft, GradeCtx, TaskEnvelope, FactsInput, buildHints(), ChallengePickInput, DEFAULT_TFS, HTF (+16 more)

### Community 31 - "grade.ts"
Cohesion: 0.08
Nodes (53): Core, GradeResultApi, 5.2 `Feedback` (6 частей, FR-FB-02), 17.1 Структура и ключи, 17.2 Верность и общие принципы, 17.3 Что понято верно (`OkCode`; новые помечены *), 17.4 Ошибки (части 3–6), 17. Шаблоны разбора (источник `src/i18n/ru/feedback`) (+45 more)

### Community 32 - "fetch-fixtures.mjs"
Cohesion: 0.10
Nodes (33): accuracyOf(), applyOutcome(), FOCUS_SIZE, generatorForSkill(), isEnoughData(), isOutcomeOk(), MIN_SAMPLE, MIN_WEIGHT (+25 more)

### Community 33 - "grade.test.ts"
Cohesion: 0.10
Nodes (24): algoOf(), ALL, at(), candles, findAlgo(), P, r, window (+16 more)

### Community 34 - "token.ts"
Cohesion: 0.11
Nodes (25): zod@^4.0.0, ConfigError, nextTask(), toSeed(), b64(), derive(), getSigningSecret(), HeaderSchema (+17 more)

### Community 35 - "findLevels"
Cohesion: 0.19
Nodes (13): 2.1 Из `ARCHITECTURE.md` §4 (дословно), Решение, 14.5 Предикаты причин (`ReasonCode`, состав без изменений), 18.2 Участки, 2.1 Сигнатура, 2.2 Определение, 2.3 Граничные случаи, 2.4 Кандидаты у правого края (`pendingSwings`) (+5 more)

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

### Community 40 - "src/types.ts"
Cohesion: 0.17
Nodes (27): golden/ - эталонные участки SMC (ALGORITHMS §18), allSwingsMap, AnalyzeOptions, analyzeStructure(), EMPTY_LAYER, scopeOrder(), typeOrder(), detectFvgs() (+19 more)

### Community 45 - "history/route.ts"
Cohesion: 0.07
Nodes (15): FIX, c4h, FIX, downloadedAt, items, m1, rec, root (+7 more)

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
Nodes (40): dependencies, dexie@^4.0.0, lightweight-charts@~5.2.1, lucide-react@^1.66.0, react@^19.0.0, react-dom@^19.0.0, @tl/core@workspace:*, @tl/market-data@workspace:* (+32 more)

### Community 52 - "AppShell.tsx"
Cohesion: 0.16
Nodes (17): metadata, plexMono, plexSans, RootLayout(), viewport, csp, nextConfig, next@^16.0.0 (+9 more)

### Community 53 - "rules.ts"
Cohesion: 0.16
Nodes (24): normalizeMark(), better(), BreakResult, clampIdx(), Direction, extreme(), FvgResult, isPivot() (+16 more)

### Community 54 - "controller.ts"
Cohesion: 0.17
Nodes (17): PointerKind, constrainAnchors(), createMark(), DrawKind, FULL_WIDTH_KINDS, isDrawKind(), MarkExtra, RAY_RIGHT_KINDS (+9 more)

### Community 55 - "DrawingPrimitive.ts"
Cohesion: 0.14
Nodes (18): OpenCandleInfo, PrimitiveState, ZONE_KINDS, RenderStyle, limitCandles(), OPEN_CANDLE_ALPHA, pricePrecision(), T0 (+10 more)

### Community 56 - "pa/generate.ts"
Cohesion: 0.12
Nodes (28): CONTEXT_STRUCTURE, ContextAnswer, ContextReference, HTF_OF, HtfTrend, CONTEXT_TYPES, ContextTaskPick, FIND_RULES (+20 more)

### Community 57 - "TimeIndex"
Cohesion: 0.10
Nodes (19): lwcProjection(), snapAnchor(), SnapOptions, snapPriceToCandle(), synthetic_candles, T0, T0, TimeIndex (+11 more)

### Community 58 - "TradingChart"
Cohesion: 0.14
Nodes (14): DrawingController, bosMark, breakIdx, drag(), index, lvl, proj, pt() (+6 more)

### Community 59 - "marks.ts"
Cohesion: 0.24
Nodes (16): allLayerSwings(), buildAlgoMarkSet(), conceptOf(), endTimeOf(), eventMark(), fvgMark(), IndexWindow, KIND_CONCEPT (+8 more)

### Community 60 - "useMarketData.ts"
Cohesion: 0.13
Nodes (22): ARCHIVE_MIN_AGE_MS, ARCHIVE_SYMBOLS, archiveAllowed(), archivePageSize(), archiveWindow(), HISTORY_PAGE, PRESET_SYMBOLS, resolveSourceMode() (+14 more)

### Community 61 - "Mark"
Cohesion: 0.13
Nodes (14): anchor, KINDS, MARKS_FORMAT_VERSION, markSchema, parseMarks(), serializeMarks(), m, ADR-0002: Lightweight Charts v5 + собственный слой разметки на Series Primitives (+6 more)

### Community 62 - "tasks.ts"
Cohesion: 0.11
Nodes (29): cutoffOf(), loadClosedBefore(), buildChallenge(), ChReq, gradeMsQuestionTask(), gradePaFind(), gradePaLevel(), HTF_TF (+21 more)

### Community 63 - "ToolPalette.tsx"
Cohesion: 0.18
Nodes (18): ToolId, GroupId, groupOf(), GROUPS, HOTKEY_OF, HOTKEYS, ic, MOBILE_GROUPS (+10 more)

### Community 64 - "TradingChart.tsx"
Cohesion: 0.15
Nodes (15): ControllerNotice, decimalsForTick(), makePriceFormatter(), TICK_TABLE, tickSizeFor(), TimeWindow, chartColors(), crosshairTimeFormatter() (+7 more)

### Community 65 - "archive.ts"
Cohesion: 0.16
Nodes (14): Symbol, AGG_TRADES_HEADER, AggTrade, ARCHIVE_BASE_URL, ArchiveFetch, ArchiveFileSpec, ArchiveSource, archiveUrl() (+6 more)

### Community 66 - "core/src/index.ts"
Cohesion: 0.20
Nodes (8): dynamic, GET(), aggregate(), SeriesByTf, sliceAt(), synthetic_hour(), synthetic_m1(), ALGO_VERSION

### Community 67 - "README.md"
Cohesion: 0.20
Nodes (4): Trading Lab, Документация, Запуск, Структура

### Community 68 - "Repository"
Cohesion: 0.13
Nodes (7): Repository, graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 70 - "schemas.ts"
Cohesion: 0.10
Nodes (21): AnchorSchema, AnswerSchema, BUSINESS_CODES, ChallengeAnswer, ChallengeAnswerSchema, difficulty, GradeRequest, MARK_KINDS (+13 more)

### Community 71 - "5. Потоки данных"
Cohesion: 0.40
Nodes (5): 5.1 Живые данные (терминал), 5.2 История для заданий (сервер), 5.3 Задания (stateless, без БД до M7), 5.4 Хранение (Repository), 5. Потоки данных

### Community 72 - "13. Генерация заданий"
Cohesion: 0.33
Nodes (6): 13.1 Общие правила, 13.2 Market Structure «Разметка», 13.3 Market Structure «Вопрос», 13.4 Price Action, 13.5 Challenge, 13. Генерация заданий

### Community 73 - "Settings"
Cohesion: 0.13
Nodes (18): localDay(), Settings, 1. Принципы, 2. Локальная схема: IndexedDB (Dexie), 3.1 RLS, 3. Схема Supabase Postgres (M7), 4.1 Порядок, 4.2 Правила по таблицам (идемпотентность по `id`, конфликты по `updated_at`) (+10 more)

### Community 74 - "normalize.ts"
Cohesion: 0.14
Nodes (20): TIMEFRAME_MS, load(), klinesZip(), NOW, Served, zipOf(), ArchiveErrorCode, ARCHIVE_KLINE_HEADER (+12 more)

### Community 75 - "8. FVG (Fair Value Gap)"
Cohesion: 0.50
Nodes (4): 8.1 Определение, 8.2 Заполнение, 8.3 Сигнатура, 8. FVG (Fair Value Gap)

### Community 76 - "handlers.ts"
Cohesion: 0.20
Nodes (11): guard(), HandlerDeps, clientKey(), RateDecision, RateLimiter, RateLimiterOptions, GradeSchema, MODULES (+3 more)

### Community 77 - "handlers.test.ts"
Cohesion: 0.15
Nodes (11): CH, challengeDeps(), Json, loader, mkDeps(), MS_MARK, MS_Q, next() (+3 more)

### Community 78 - "screens.test.tsx"
Cohesion: 0.19
Nodes (17): getDefaultRepository(), RepositoryContext, RepositoryProvider(), useRepository(), APPEARANCE_STORAGE_KEY, themeInitScript, applyToDom(), CandleStyle (+9 more)

### Community 79 - "ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`"
Cohesion: 0.20
Nodes (9): 15. `resolveTrade` (ADR-0007, уточнения), 18.1 Формат и процесс, 18.3 Что ещё размечается после утверждения (M4/M5), 18. Golden-тесты, 20. Спорные места и вопросы оркестратору, 4.1 Правило, 4.2 Граничные случаи, 4. Метки HH / HL / LH / LL (+1 more)

### Community 80 - "src/types.ts"
Cohesion: 0.21
Nodes (17): computeContext(), ContextEvidence, externalSwings(), isSignificant(), obContainsExtreme(), ADR-0006, Level, MarkItem (+9 more)

### Community 81 - "handleGrade"
Cohesion: 0.19
Nodes (11): dynamic, maxDuration, POST(), runtime, dynamic, maxDuration, POST(), runtime (+3 more)

### Community 82 - "facts.ts"
Cohesion: 0.08
Nodes (45): age(), CHALLENGE_STRUCTURE, ChallengeFacts, computeChallengeFacts(), HTF, intersects(), lastEventSince(), poiFor() (+37 more)

### Community 83 - "patterns.ts"
Cohesion: 0.19
Nodes (20): c(), 1.2 Термины свечи, 9.1 Состав (ответ на OQ-11), 9.2 Критерии (ATR = ATR14 последней свечи модели, если не сказано иное; модель не ищется при ATR = null или `range == 0`), 9.3 Выход, 9.4 Проверенные примеры (BTCUSDT 4h 2026-09, GS-5), 9. Свечные модели Price Action (`detectPatterns`), body() (+12 more)

### Community 84 - "4. Функциональные требования"
Cohesion: 0.17
Nodes (12): 4.10 Авторизация (FR-AUTH), 4.11 Интерфейс (FR-UI), 4.1 Данные (FR-DATA), 4.2 График (FR-CHART), 4.3 Слой разметки (FR-DRAW), 4.4 Market Structure Analyzer (FR-MS), 4.5 Trading Challenge (FR-TC), 4.6 Price Action Trainer (FR-PA) (+4 more)

### Community 85 - "Команда агентов — Trading Lab"
Cohesion: 0.29
Nodes (6): 1. Сводка, 3. Правила оркестрации, 4. Формат отчёта агента (до 15 строк), 5. Шаблон задания агенту, Команда агентов — Trading Lab, Правило graphify (включается в каждый промпт агента, исследующего код)

### Community 86 - "11. Контекст для PA «Контекст»"
Cohesion: 0.29
Nodes (7): 11.1 Формат ответа (ответ на OQ-16), 11.2 Задание, 11.3 Факторы (детерминированно, для бычьей модели; медвежья — зеркально), 11.4 Значимость (решение), 11.5 Оценка, 11.6 Генерация, 11. Контекст для PA «Контекст»

### Community 87 - "14. Challenge: эталон, оценка качества, WAIT, лимиты"
Cohesion: 0.33
Nodes (6): 14.1 Факты на момент T (`ChallengeFacts`), 14.2 Эталонная сторона `refSide`, 14.3 Оценка качества 0–100 (ответ на OQ-08), независимо от исхода, 14.4 Правильность, вердикт, лимиты, 14.6 Подсказки (easy), 14. Challenge: эталон, оценка качества, WAIT, лимиты

### Community 88 - "1. Общие соглашения"
Cohesion: 0.33
Nodes (6): 1.1 Входные свечи, 1.3 ATR, 1.4 Детерминизм и числа, 1.5 ALGO_VERSION, 1.6 Параметры по сложностям (сводка), 1. Общие соглашения

### Community 89 - "5. Тренд, BOS и CHoCH"
Cohesion: 0.33
Nodes (6): 5.1 Общие правила, 5.2 Внешний слой — машина состояний с защищёнными уровнями, 5.3 Внутренний слой — «последний подтверждённый swing», 5.4 Что происходит после CHoCH, 5.5 Граничные случаи (проверены на реальных свечах), 5. Тренд, BOS и CHoCH

### Community 90 - "ApiError"
Cohesion: 0.31
Nodes (10): ApiError, validationError(), handleNext(), readJsonBody(), futureProviderFor(), gradeChallengeTask(), gradeTask(), mismatch() (+2 more)

### Community 91 - "3. Внешняя и внутренняя структура"
Cohesion: 0.40
Nodes (5): 3.1 Правило (решение), 3.2 Дедупликация, 3.3 Сигнатура `analyzeStructure`, 3.4 Отображение в `Mark` (общая модель `ARCHITECTURE.md` §4.2), 3. Внешняя и внутренняя структура

### Community 92 - "grade"
Cohesion: 0.32
Nodes (8): grade(), 7. Безопасность, ADR-0005: Stateless-задания с подписанными токенами; будущее только на сервере, Контекст, Открытые вопросы, Последствия, Рассмотренные альтернативы, Решение

### Community 93 - "backend-developer.md"
Cohesion: 0.29
Nodes (6): graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 94 - "Roadmap — Trading Lab"
Cohesion: 0.29
Nodes (6): MVP, Roadmap — Trading Lab, v1.1 — Fibonacci Playground и Premium/Discount, v1.2 — Elliott Wave Lab, v2, Правила корректировки

### Community 95 - "7. Order Block"
Cohesion: 0.50
Nodes (4): 7.1 Определение (решение, ICT: «последняя противоположная свеча перед импульсом, сломавшим структуру»), 7.2 Статус (после свечи события `k`, по закрытым свечам), 7.3 Сигнатура, 7. Order Block

### Community 97 - "UtcMs"
Cohesion: 0.08
Nodes (30): FixtureLoader, ARCHIVE_START, ArchiveLoader, ArchiveLoaderOptions, CandleLoader, CHALLENGE_FUTURE_MS, ChallengeZone, Chunk (+22 more)

### Community 98 - "history/route.ts"
Cohesion: 0.13
Nodes (14): dynamic, errorResponse(), GET(), ISSUE_CODES, querySchema, runtime, SYMBOLS, call() (+6 more)

### Community 99 - "format.ts"
Cohesion: 0.36
Nodes (5): formatInt(), formatPercent(), formatPrice(), formatR(), MONTHS_SHORT

### Community 100 - "12. `gradeMarks` — сравнение разметки"
Cohesion: 0.22
Nodes (9): 12.1 Сигнатура (расширение `API_CONTRACTS.md`), 12.2 Ключевая свеча метки, 12.3 Группы сопоставления, 12.4 Совместимость и стоимость пары, 12.5 Матчинг (решение: DP по времени вместо венгерского), 12.6 Классификация после матчинга, 12.7 Счёт, вердикт, навыки, 12.8 Пример AC-07 на реальных данных (GS-1) (+1 more)

### Community 101 - "7. User Flows"
Cohesion: 0.25
Nodes (8): 7.1 Первый вход, 7.2 Сессия Market Structure (режим «Разметка»), 7.3 Trading Challenge: от выбора до разбора, 7.4 Price Action «Контекст», 7.5 Терминал с проверкой разметки, 7.6 Просмотр «Слабых мест», 7.7 Продолжение на другом устройстве, 7. User Flows

### Community 102 - "Стратегия тестирования — Trading Lab"
Cohesion: 0.11
Nodes (18): 10. Производительность, 1. Принципы, 2. Пирамида, 3. Фикстуры, 4.1 Инвариант агрегации таймфреймов, 4.2 `sliceAt(series, T)`, 4.3 Нормализация (`market-data`), 4.4 Golden-тесты SMC/PA (+10 more)

### Community 103 - "data/streak.test.ts"
Cohesion: 0.43
Nodes (4): DayStat, prevDay(), softStreak(), done

### Community 104 - "server/errors.ts"
Cohesion: 0.40
Nodes (5): ApiErrorCode, errorResponse(), toApiError(), ValidationIssue, run()

### Community 105 - "ADR-0008: Local-first хранилище за интерфейсом Repository; Supabase в M7"
Cohesion: 0.29
Nodes (6): ADR-0008: Local-first хранилище за интерфейсом Repository; Supabase в M7, Контекст, Открытые вопросы, Последствия, Рассмотренные альтернативы, Решение

### Community 106 - "mulberry32"
Cohesion: 0.28
Nodes (13): depthOf(), endCandidates(), pickContextTask(), pickFindPattern(), pickLevelTask(), relaxation(), usable(), visibleCount() (+5 more)

### Community 107 - "context.test.ts"
Cohesion: 0.20
Nodes (12): buildPa(), gradePaContext(), reconstructContext(), gradeContext(), htfClosedAt(), patternToMark(), c15, c4h (+4 more)

### Community 108 - "ADR-0001: Next.js 16 + TypeScript strict, pnpm monorepo, Vercel"
Cohesion: 0.33
Nodes (5): ADR-0001: Next.js 16 + TypeScript strict, pnpm monorepo, Vercel, Контекст, Последствия, Рассмотренные альтернативы, Решение

### Community 109 - "1. Обзор и цель продукта"
Cohesion: 0.40
Nodes (5): 1.1 Что это, 1.2 Цель, 1.3 Целевой пользователь, 1.4 Модули, 1. Обзор и цель продукта

### Community 110 - "6. Liquidity sweep"
Cohesion: 0.40
Nodes (5): 6.1 Определение (решение), 6.2 Несколько уровней за одну свечу, 6.3 Граничные случаи, 6.4 Сигнатура, 6. Liquidity sweep

### Community 111 - "ADR-0003: Живые данные грузит браузер напрямую (REST + WS), fallback — REST-polling"
Cohesion: 0.33
Nodes (5): ADR-0003: Живые данные грузит браузер напрямую (REST + WS), fallback — REST-polling, Контекст, Последствия, Рассмотренные альтернативы, Решение

### Community 112 - "ADR-0004: История для заданий — сервер читает архив data.binance.vision"
Cohesion: 0.33
Nodes (5): ADR-0004: История для заданий — сервер читает архив data.binance.vision, Контекст, Последствия, Рассмотренные альтернативы, Решение

### Community 113 - "ADR-0006: Синхронизация таймфреймов — нативные ТФ, инвариант агрегации, sliceAt"
Cohesion: 0.33
Nodes (5): ADR-0006: Синхронизация таймфреймов — нативные ТФ, инвариант агрегации, sliceAt, Контекст, Последствия, Рассмотренные альтернативы, Решение

### Community 114 - "Answer"
Cohesion: 0.50
Nodes (4): Answer, 4.1 Шкала задания, 4.2 Типы ответа (`Answer`), 4. Шкала времени заданий и ответы

### Community 115 - "3. Область продукта"
Cohesion: 0.40
Nodes (5): 3.1 В MVP, 3.2 Вне MVP, 3.3 Требует исследования, 3.4 Технические риски, 3. Область продукта

### Community 116 - "fixtures"
Cohesion: 0.50
Nodes (3): fixtures, recorded/ - записанные форматы API (fapi/fstream недоступны из облака, 451), Архивные CSV

### Community 117 - "16. Навыки и прогресс"
Cohesion: 0.50
Nodes (4): 16.1 Навыки, 16.2 Обновление точности, 16.3 Адаптивная подборка, 16. Навыки и прогресс

## Knowledge Gaps
- **11 isolated node(s):** `ADR-0006`, `ADR-0005`, `ADR-0005`, `../../tsconfig.base.json`, `../tsconfig.base.json` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 803 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Mark` connect `Mark` to `TerminalScreen.tsx`, `UtcMs`, `hit.ts`, `Candle`, `grade.ts`, `grade.test.ts`, `rules.ts`, `controller.ts`, `DrawingPrimitive.ts`, `TimeIndex`, `TradingChart`, `marks.ts`, `tasks.ts`, `TradingChart.tsx`, `Repository`, `handlers.test.ts`, `src/types.ts`, `facts.ts`, `1. Общие соглашения`, `3. Внешняя и внутренняя структура`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `UtcMs` (e.g. with `1. Общие соглашения` and `4.1 Шкала задания`) actually correct?**
  _`UtcMs` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0006`, `ADR-0005`, `ADR-0005` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `market-structure.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12096774193548387 - nodes in this community are weakly interconnected._
- **Why does `Candle` connect `Candle` to `market-structure.ts`, `live.ts`, `resolve.ts`, `hit.ts`, `grade.ts`, `grade.test.ts`, `src/types.ts`, `history/route.ts`, `rules.ts`, `controller.ts`, `DrawingPrimitive.ts`, `pa/generate.ts`, `TimeIndex`, `TradingChart`, `useMarketData.ts`, `tasks.ts`, `TradingChart.tsx`, `archive.ts`, `core/src/index.ts`, `normalize.ts`, `handlers.test.ts`, `src/types.ts`, `facts.ts`, `patterns.ts`, `UtcMs`, `context.test.ts`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Mark` (e.g. with `Контекст` and `Последствия`) actually correct?**
  _`Mark` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.0576271186440678 - nodes in this community are weakly interconnected._