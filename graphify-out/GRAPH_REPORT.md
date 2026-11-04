# Graph Report - Varianto  (2026-11-04)

## Corpus Check
- 398 files · ~212,283 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 32 file(s) not represented in the graph (top: .csv 26, (none) 4, .example 1)

## Summary
- 2774 nodes · 7642 edges · 144 communities (137 shown, 7 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 214 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7c1a54f1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- market-structure.ts
- Repository
- terminal.helpers.ts
- API Contracts — Trading Lab
- i18n/format.ts
- with
- Architecture — Trading Lab
- 2. Карточки
- progressLogic.ts
- market-data/package.json
- UtcMs
- Mark
- core/package.json
- compilerOptions
- Interview Summary — Trading Lab
- ui/index.ts
- compilerOptions
- Project Status — Trading Lab
- Skills Registry — Trading Lab
- touches
- chart-developer.md
- devops-security.md
- documentation-engineer.md
- hit.ts
- market-data-engineer.md
- qa-engineer.md
- technical-analyst.md
- uiux-designer.md
- DECISIONS/README.md
- PaFindBody.tsx
- Candle
- features/feedback/index.ts
- fetch-fixtures.mjs
- grade.test.ts
- token.ts
- 2. `detectSwings` — фрактальные swing
- .prettierrc.json
- e2e/tsconfig.json
- core/tsconfig.json
- market-data/tsconfig.json
- src/types.ts
- postcss.config.mjs
- CLAUDE.md
- .claude/CLAUDE.md
- pnpm-workspace.yaml
- handlers.test.ts
- LAYOUTS — Trading Lab
- 2. Компоненты
- DESIGN — Trading Lab
- COPY — микрокопия Trading Lab
- check_tokens.py
- web/package.json
- AppShell.tsx
- rules.ts
- build.ts
- TradingChart.tsx
- pa/index.ts
- TimeIndex
- TradingChart
- marks.ts
- useMarketData.ts
- params.ts
- placeholders.test.ts
- lucide-react
- MarkSession.tsx
- archive.ts
- core/src/index.ts
- README.md
- SupabaseRepository.ts
- grade.ts
- schemas.ts
- src/types.ts
- 13. Генерация заданий
- Settings
- normalize.ts
- Находки
- live.test.ts
- tasks.ts
- screens.test.tsx
- ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`
- panels.tsx
- deps.ts
- facts.ts
- smc/normalize.test.ts
- PRD — Trading Lab
- TaskSession.tsx
- 11. Контекст для PA «Контекст»
- 14. Challenge: эталон, оценка качества, WAIT, лимиты
- resolve.ts
- 5. Тренд, BOS и CHoCH
- patterns.ts
- handlers.ts
- package.json
- 3. Внутренние HTTP API
- 1. Общие соглашения
- 7. Order Block
- web/AGENTS.md
- reveal.ts
- history/route.ts
- src/feedback/index.ts
- hints.ts
- SessionActions
- Стратегия тестирования — Trading Lab
- DrawingPrimitive.ts
- 6. Внешние API Binance
- ref_vitest
- serialize.ts
- 5. Потоки данных
- @playwright/test
- TaskSession.tsx
- 6. Liquidity sweep
- golden.pa-challenge.test.ts
- pa/generate.ts
- Query
- SettingsScreen.tsx
- PaLevelBody.tsx
- scripts
- HomeBlocks.tsx
- ChallengeSession.tsx
- criteria.ts
- ms.helpers.ts
- Timeframe
- runCheck.ts
- build.ts
- ProgressScreen.tsx
- QA Report — финальная приёмка MVP Trading Lab (M8)
- useRepository
- 12. `gradeMarks` — сравнение разметки
- fixtures
- resolve.test.ts
- 4. Функциональные требования
- storage/index.ts
- 7. User Flows
- Подключение Supabase и Vercel (с телефона)
- snap.test.ts
- Команда агентов — Trading Lab
- handleGrade
- tools.ts
- ADR-0007: Правила исхода сделки Challenge (drill-down)
- 3. Область продукта
- 16. Навыки и прогресс
- 18. Golden-тесты
- 1. Обзор и цель продукта
- vercel.json

## God Nodes (most connected - your core abstractions)
1. `Candle` - 90 edges
2. `Mark` - 83 edges
3. `UtcMs` - 79 edges
4. `react` - 72 edges
5. `TaskTimeframe` - 50 edges
6. `cn()` - 46 edges
7. `analyzeStructure()` - 45 edges
8. `Button()` - 36 edges
9. `TradingChart()` - 33 edges
10. `LocalRepository` - 33 edges

## Surprising Connections (you probably didn't know these)
- `1. HIGH: open redirect в /auth/callback (исправлено)` --references--> `safeNextPath()`  [INFERRED]
  docs/SECURITY_REVIEW.md → apps/web/src/auth/config.ts
- `P1` --references--> `fmtPrice()`  [INFERRED]
  docs/design/AUDIT.md → apps/web/src/features/progress/ErrorLog.tsx
- `4.2 Типы ответа (`Answer`)` --references--> `Answer`  [INFERRED]
  docs/API_CONTRACTS.md → apps/web/src/server/schemas.ts
- `7. Интерфейс `Repository` (`ARCHITECTURE.md` §5.4)` --references--> `Repository`  [INFERRED]
  docs/API_CONTRACTS.md → apps/web/src/storage/types.ts
- `Решение` --references--> `sliceAt()`  [INFERRED]
  docs/DECISIONS/0005-stateless-signed-task-tokens.md → packages/core/src/candles/aggregate.ts

## Import Cycles
- 2-file cycle: `packages/core/src/candles/aggregate.ts -> packages/core/src/index.ts -> packages/core/src/candles/aggregate.ts`

## Communities (144 total, 7 thin omitted)

### Community 0 - "market-structure.ts"
Cohesion: 0.10
Nodes (40): buildMs(), gradeMsMark(), atrAt(), buildMsQuestion(), checkMsWindow(), CORE_CONCEPTS, drawCandidate(), generateMsQuestion() (+32 more)

### Community 1 - "Repository"
Cohesion: 0.07
Nodes (19): Repository, graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила, graphify (+11 more)

### Community 2 - "terminal.helpers.ts"
Cohesion: 0.17
Nodes (24): Box, candlePoint(), chartBox(), chartCandles(), coreLevels(), coreMarks(), drawAlgoMark(), drawTwoPoint() (+16 more)

### Community 3 - "API Contracts — Trading Lab"
Cohesion: 0.12
Nodes (15): 1.1 Формат ошибки, 1.2 Заголовки кэша, 1. Общие соглашения, 2.2 Расширения контрактов (предложение — фиксируются при реализации в `@tl/core`), 2. Типы `@tl/core`, используемые в контрактах, 4.1 Шкала задания, 4.2 Типы ответа (`Answer`), 4. Шкала времени заданий и ответы (+7 more)

### Community 4 - "i18n/format.ts"
Cohesion: 0.13
Nodes (29): EmptyState(), DIR, formatParam(), FORMATTERS(), formatWhen(), KIND_KEYS, placeOf(), TIME_KEYS (+21 more)

### Community 5 - "with"
Cohesion: 0.08
Nodes (26): runs-on, steps, GITHUB_TOKEN, jobs, check, secrets-scan, name, on (+18 more)

### Community 6 - "Architecture — Trading Lab"
Cohesion: 0.14
Nodes (14): 10. Развёртывание, 11. Риски, 1. Ключевые ограничения, определяющие архитектуру, 2. Обзор, 3. Репозиторий (pnpm monorepo), 4.1 Синхронизация таймфреймов, 4.2 Разметка (общая модель для пользователя и алгоритма), 4.3 Алгоритмы (детерминированные, версионируемые) (+6 more)

### Community 7 - "2. Карточки"
Cohesion: 0.20
Nodes (10): 2. Карточки, Backend Developer, Chart Developer, DevOps/Security Engineer, Documentation Engineer, Market Data Engineer, Orchestrator, QA Engineer (+2 more)

### Community 8 - "progressLogic.ts"
Cohesion: 0.10
Nodes (33): asCore(), avgQuality(), ErrorGroup, groupByModule(), hasEnoughData(), MODULE_ORDER, moduleAccuracies(), ModuleAccuracy (+25 more)

### Community 9 - "market-data/package.json"
Cohesion: 0.11
Nodes (20): dependencies, fflate@^0.8.3, @tl/core@workspace:*, devDependencies, vitest@^4.1.12, @vitest/coverage-v8@^4.1.12, exports, ./archive (+12 more)

### Community 10 - "UtcMs"
Cohesion: 0.13
Nodes (16): DailyActivityRow, SkillStatRow, TerminalMarksRow, TradingLabDB, defaultSettings(), LocalRepository, LocalSnapshot, mark (+8 more)

### Community 11 - "Mark"
Cohesion: 0.10
Nodes (38): TerminalPage(), patternLabel(), ControllerDeps, NoticeCode, ARCHIVE_MIN_AGE_MS, ARCHIVE_SYMBOLS, archiveAllowed(), archivePageSize() (+30 more)

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
Cohesion: 0.08
Nodes (43): ORDER, ResultSheet(), ResultSheetHeight, ResultSheetProps, SHEET_CLASS, SHEET_PAD, SessionLayoutProps, TaskHintProps (+35 more)

### Community 16 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, allowJs, incremental, jsx, lib, paths, plugins, exclude (+3 more)

### Community 17 - "Project Status — Trading Lab"
Cohesion: 0.25
Nodes (7): Project Status — Trading Lab, Блокирующие проблемы, Доступность рыночных данных из контейнера (проверено curl), Завершённые этапы, Окружение (облачный контейнер Claude Code), Следующие действия, Текущие задачи

### Community 18 - "Skills Registry — Trading Lab"
Cohesion: 0.25
Nodes (7): Skills Registry — Trading Lab, Кандидаты — отложены до утверждения архитектуры, Отклонённые, Справочник: Public APIs, Уже доступные навыки окружения (не требуют установки), Установка в новом контейнере, Установленные инструменты

### Community 19 - "touches"
Cohesion: 0.50
Nodes (5): inside(), 10.1 Алгоритм, 10.2 Эталон для «Проведи уровень», 10. `findLevels` — уровни поддержки/сопротивления, touches()

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
Nodes (36): distToRectEdge(), distToSegment(), Hit, hitTest(), partScore(), geos(), synthetic_proj, T0 (+28 more)

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
Cohesion: 0.04
Nodes (36): ADR-0001: Next.js 16 + TypeScript strict, pnpm monorepo, Vercel, Контекст, Последствия, Рассмотренные альтернативы, Решение, ADR-0002: Lightweight Charts v5 + собственный слой разметки на Series Primitives, Контекст, Последствия (+28 more)

### Community 29 - "PaFindBody.tsx"
Cohesion: 0.11
Nodes (29): MsMarkBody(), PaFindBody(), impliedDirection(), keepSingleLevel(), msMarkAnswer(), paContextAnswer(), paFindAnswer(), PATTERN_CANDLES (+21 more)

### Community 30 - "Candle"
Cohesion: 0.13
Nodes (28): AnswerInput, ChallengeAnswerBody, SessionState, candle(), series, task, ChallengeDetailDto, ChallengeGradeResult (+20 more)

### Community 31 - "features/feedback/index.ts"
Cohesion: 0.12
Nodes (25): errors, feedback, defaultFmt, FeedbackView(), FeedbackViewProps, Section(), renderBlock(), GlyphKind (+17 more)

### Community 32 - "fetch-fixtures.mjs"
Cohesion: 0.07
Nodes (29): dynamic, GET(), safeEqual(), ChallengeAttemptStat, challengeStats(), dailyProgress(), DayMap, DayRecord (+21 more)

### Community 33 - "grade.test.ts"
Cohesion: 0.10
Nodes (24): algoOf(), ALL, at(), candles, findAlgo(), P, r, window (+16 more)

### Community 34 - "token.ts"
Cohesion: 0.12
Nodes (24): ConfigError, b64(), derive(), getSigningSecret(), HeaderSchema, invalid(), keyCache, Keys (+16 more)

### Community 35 - "2. `detectSwings` — фрактальные swing"
Cohesion: 0.33
Nodes (6): 2.1 Сигнатура, 2.2 Определение, 2.3 Граничные случаи, 2.4 Кандидаты у правого края (`pendingSwings`), 2.5 Псевдокод, 2. `detectSwings` — фрактальные swing

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
Nodes (26): 2.1 Из `ARCHITECTURE.md` §4 (дословно), Решение, golden/ - эталонные участки SMC (ALGORITHMS §18), allSwingsMap, AnalyzeOptions, analyzeStructure(), EMPTY_LAYER, scopeOrder() (+18 more)

### Community 45 - "handlers.test.ts"
Cohesion: 0.16
Nodes (12): CH, challengeDeps(), grade(), Json, loader, mkDeps(), MS_MARK, MS_Q (+4 more)

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
Nodes (41): dependencies, dexie@^4.0.0, lightweight-charts@~5.2.1, lucide-react@^1.66.0, next@^16.0.0, react@^19.0.0, react-dom@^19.0.0, @supabase/supabase-js@^2.118.0 (+33 more)

### Community 52 - "AppShell.tsx"
Cohesion: 0.23
Nodes (13): metadata, plexMono, plexSans, RootLayout(), viewport, AppShell(), BottomTabs(), DesktopTabs() (+5 more)

### Community 53 - "rules.ts"
Cohesion: 0.13
Nodes (33): PointerKind, SWING_SIDE, Built, Gesture, Pending, PointerInput, PREVIEW_ID, normalizeMark() (+25 more)

### Community 54 - "build.ts"
Cohesion: 0.21
Nodes (19): Core, 17.1 Структура и ключи, 17.2 Верность и общие принципы, 17.3 Что понято верно (`OkCode`; новые помечены *), 17.4 Ошибки (части 3–6), 17. Шаблоны разбора (источник `src/i18n/ru/feedback`), 19. Расхождения с документами, ChallengeGrade (+11 more)

### Community 55 - "TradingChart.tsx"
Cohesion: 0.20
Nodes (13): OPEN_CANDLE_ALPHA, pricePrecision(), T0, tokens, toCandleData(), toVolumeData(), VOLUME_ALPHA, ChartTokens (+5 more)

### Community 56 - "pa/index.ts"
Cohesion: 0.14
Nodes (31): gradePaLevel(), computeContext(), CONTEXT_STRUCTURE, ContextAnswer, ContextEvidence, ContextFactorAnswer, ContextReference, externalSwings() (+23 more)

### Community 57 - "TimeIndex"
Cohesion: 0.11
Nodes (26): lwcProjection(), T0, TimeIndex, ControllerNotice, limitCandles(), defaultLogicalRange(), LogicalRange, logicalRangeFromWindow() (+18 more)

### Community 58 - "TradingChart"
Cohesion: 0.12
Nodes (16): constrainAnchors(), createMark(), DrawKind, DrawingController, bosMark, breakIdx, drag(), index (+8 more)

### Community 59 - "marks.ts"
Cohesion: 0.26
Nodes (15): allLayerSwings(), buildAlgoMarkSet(), conceptOf(), endTimeOf(), eventMark(), fvgMark(), IndexWindow, KIND_CONCEPT (+7 more)

### Community 60 - "useMarketData.ts"
Cohesion: 0.21
Nodes (12): archiveWindow(), appendCandle(), ArchiveHttpError, DataStatus, fetchArchive(), LoadError, MarketState, toLoadError() (+4 more)

### Community 61 - "params.ts"
Cohesion: 0.15
Nodes (26): Page(), Page(), MsSetup(), PaSetup(), CommonFields(), SHORT, common(), CommonParams (+18 more)

### Community 62 - "placeholders.test.ts"
Cohesion: 0.09
Nodes (22): gradePaContext(), reconstructContext(), algo, ALL, bad, candles, flat, FLIP (+14 more)

### Community 63 - "lucide-react"
Cohesion: 0.14
Nodes (26): ToolId, Cell(), groupOf(), TaskToolbarBar(), TaskToolbarProps, TaskToolRail(), ERASER, SELECT (+18 more)

### Community 64 - "MarkSession.tsx"
Cohesion: 0.16
Nodes (25): HTF, PaContextBody(), Row(), YN, yn, ContextFactors, countsFromGrade(), AsideSection() (+17 more)

### Community 65 - "archive.ts"
Cohesion: 0.15
Nodes (14): AGG_TRADES_HEADER, AggTrade, ARCHIVE_BASE_URL, ArchiveFetch, ArchiveFileSpec, ArchiveSource, ArchiveSourceOptions, archiveUrl() (+6 more)

### Community 66 - "core/src/index.ts"
Cohesion: 0.21
Nodes (9): dynamic, GET(), aggregate(), SeriesByTf, sliceAt(), synthetic_hour(), synthetic_m1(), ALGO_VERSION (+1 more)

### Community 67 - "README.md"
Cohesion: 0.12
Nodes (10): MVP, Roadmap — Trading Lab, v1.1 — Fibonacci Playground и Premium/Discount, v1.2 — Elliott Wave Lab, v2, Правила корректировки, Trading Lab, Документация (+2 more)

### Community 68 - "SupabaseRepository.ts"
Cohesion: 0.15
Nodes (24): chunks(), IMPORTED_USER_META, ImportOutcome, importSnapshot(), must(), recomputeDerived(), Row, runFirstSignInImport() (+16 more)

### Community 69 - "grade.ts"
Cohesion: 0.21
Nodes (15): Entry, gradeMarks(), Group, groupEvaluated(), groupOf(), iou(), MAJOR, patternSkill() (+7 more)

### Community 70 - "schemas.ts"
Cohesion: 0.09
Nodes (23): zod@^4.0.0, AnchorSchema, AnswerSchema, BUSINESS_CODES, ChallengeAnswer, ChallengeAnswerSchema, difficulty, GradeRequest (+15 more)

### Community 71 - "src/types.ts"
Cohesion: 0.12
Nodes (25): CHALLENGE_STRUCTURE, FactsInput, HTF, intersects(), lastEventSince(), poiFor(), PoiInfo, setupFor() (+17 more)

### Community 72 - "13. Генерация заданий"
Cohesion: 0.33
Nodes (6): 13.1 Общие правила, 13.2 Market Structure «Разметка» (поправка v1.1, `ALGO_VERSION 1.1.0`), 13.3 Market Structure «Вопрос», 13.4 Price Action, 13.5 Challenge, 13. Генерация заданий

### Community 73 - "Settings"
Cohesion: 0.12
Nodes (19): buildAttempt(), localDay(), ImportReport, 1. Принципы, 2. Локальная схема: IndexedDB (Dexie), 3.1 RLS, 3. Схема Supabase Postgres (M7), 4.1 Порядок (+11 more)

### Community 74 - "normalize.ts"
Cohesion: 0.15
Nodes (19): load(), klinesZip(), NOW, Served, zipOf(), ArchiveErrorCode, ARCHIVE_KLINE_HEADER, Gap (+11 more)

### Community 75 - "Находки"
Cohesion: 0.13
Nodes (15): clientKey(), 1. HIGH: open redirect в /auth/callback (исправлено), 2. MEDIUM: обход rate limit через X-Forwarded-For (исправлено частично), 4. LOW: /api/cron/keepalive (открыто), 5. LOW: Supabase (повторное чтение 0001_init.sql), 6. LOW: заголовки/CSP (фактически curl на production-сборке), 7. LOW: токены (src/server/token.ts) - корректно, 8. Утечка даты Challenge (+7 more)

### Community 76 - "live.test.ts"
Cohesion: 0.07
Nodes (28): Frontend Developer, BINANCE_REST_BASE, BINANCE_WS_BASE, binanceInterval(), FetchKlinesOptions, LiveErrorCode, LiveFeed, LiveFeedError (+20 more)

### Community 77 - "tasks.ts"
Cohesion: 0.07
Nodes (49): ARCHIVE_START, ArchiveLoaderOptions, CandleLoader, CHALLENGE_FUTURE_MS, ChallengeZone, Chunk, countClosedBefore(), cutoffOf() (+41 more)

### Community 78 - "screens.test.tsx"
Cohesion: 0.11
Nodes (28): Page(), AuthRepositoryProvider(), SupabaseAuthRepositoryProvider(), wrap(), SettingsScreen(), Providers(), getDefaultRepository(), RepositoryContext (+20 more)

### Community 79 - "ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`"
Cohesion: 0.18
Nodes (10): 15. `resolveTrade` (ADR-0007, уточнения), 20. Спорные места и вопросы оркестратору, 4.1 Правило, 4.2 Граничные случаи, 4. Метки HH / HL / LH / LL, 8.1 Определение, 8.2 Заполнение, 8.3 Сигнатура (+2 more)

### Community 80 - "panels.tsx"
Cohesion: 0.16
Nodes (23): blockerKey(), errorCopy(), partMax(), ResultView(), buildAnswer(), defaultLevels(), formatRR(), parsePrice() (+15 more)

### Community 81 - "deps.ts"
Cohesion: 0.21
Nodes (12): dynamic, maxDuration, POST(), runtime, getDeps(), getHistoryLimiter(), rateFromEnv(), HandlerDeps (+4 more)

### Community 82 - "facts.ts"
Cohesion: 0.07
Nodes (47): age(), ChallengeFacts, computeChallengeFacts(), REASON_CODES, reasonValid(), RefSide, RR_FULL, RR_MIN (+39 more)

### Community 83 - "smc/normalize.test.ts"
Cohesion: 0.33
Nodes (4): cs, index, synthetic_rows, T0

### Community 84 - "PRD — Trading Lab"
Cohesion: 0.18
Nodes (11): 10. Приоритизация функций (MoSCoW), 11. План MVP, 12. Открытые вопросы, 2. Принципы продукта, 5. Нефункциональные требования, 6. User Stories, 8.1 Сценарии Given/When/Then, 8.2 Сквозные критерии (+3 more)

### Community 85 - "TaskSession.tsx"
Cohesion: 0.12
Nodes (31): AnswerSessionProps, createTaskApi(), kindOf(), post(), TaskApi, buildAttempt(), BuildAttemptInput, saveTaskAttempt() (+23 more)

### Community 86 - "11. Контекст для PA «Контекст»"
Cohesion: 0.29
Nodes (7): 11.1 Формат ответа (ответ на OQ-16), 11.2 Задание, 11.3 Факторы (детерминированно, для бычьей модели; медвежья — зеркально), 11.4 Значимость (решение), 11.5 Оценка, 11.6 Генерация, 11. Контекст для PA «Контекст»

### Community 87 - "14. Challenge: эталон, оценка качества, WAIT, лимиты"
Cohesion: 0.29
Nodes (7): 14.1 Факты на момент T (`ChallengeFacts`), 14.2 Эталонная сторона `refSide`, 14.3 Оценка качества 0–100 (ответ на OQ-08), независимо от исхода, 14.4 Правильность, вердикт, лимиты, 14.5 Предикаты причин (`ReasonCode`, состав без изменений), 14.6 Подсказки (easy), 14. Challenge: эталон, оценка качества, WAIT, лимиты

### Community 88 - "resolve.ts"
Cohesion: 0.21
Nodes (11): AggTrade, done(), FutureProvider, Hit, Position, priceHits(), ResolutionMethod, resolveTrade() (+3 more)

### Community 89 - "5. Тренд, BOS и CHoCH"
Cohesion: 0.33
Nodes (6): 5.1 Общие правила, 5.2 Внешний слой — машина состояний с защищёнными уровнями, 5.3 Внутренний слой — «последний подтверждённый swing», 5.4 Что происходит после CHoCH, 5.5 Граничные случаи (проверены на реальных свечах), 5. Тренд, BOS и CHoCH

### Community 90 - "patterns.ts"
Cohesion: 0.16
Nodes (23): c(), 1.2 Термины свечи, 9.1 Состав (ответ на OQ-11), 9.2 Критерии (ATR = ATR14 последней свечи модели, если не сказано иное; модель не ищется при ATR = null или `range == 0`), 9.3 Выход, 9.4 Проверенные примеры (BTCUSDT 4h 2026-09, GS-5), 9. Свечные модели Price Action (`detectPatterns`), FindPatternPick (+15 more)

### Community 91 - "handlers.ts"
Cohesion: 0.16
Nodes (21): ApiError, ApiErrorCode, errorResponse(), toApiError(), validationError(), ValidationIssue, guard(), handleNext() (+13 more)

### Community 92 - "package.json"
Cohesion: 0.12
Nodes (21): devDependencies, eslint@^9.39.0, eslint-config-next@^16.0.0, @eslint/js@^9.39.0, @playwright/test@1.63.0, prettier@^3.6.0, @types/node@^22.0.0, typescript@~5.9.3 (+13 more)

### Community 93 - "3. Внутренние HTTP API"
Cohesion: 0.33
Nodes (6): 3.1 `GET /api/health`, 3.2 `GET /api/history`, 3.3 `POST /api/tasks/{module}/next`, 3.4 `POST /api/tasks/{module}/grade`, 3.5 Токен задания (`taskToken`), 3. Внутренние HTTP API

### Community 94 - "1. Общие соглашения"
Cohesion: 0.33
Nodes (6): 1.1 Входные свечи, 1.3 ATR, 1.4 Детерминизм и числа, 1.5 ALGO_VERSION, 1.6 Параметры по сложностям (сводка), 1. Общие соглашения

### Community 95 - "7. Order Block"
Cohesion: 0.50
Nodes (4): 7.1 Определение (решение, ICT: «последняя противоположная свеча перед импульсом, сломавшим структуру»), 7.2 Статус (после свечи события `k`, по закрытым свечам), 7.3 Сигнатура, 7. Order Block

### Community 97 - "reveal.ts"
Cohesion: 0.11
Nodes (21): AxisTick, axisTicks(), relativeDuration(), relativeLabel(), STEPS, T, hitText(), AXIS_H (+13 more)

### Community 98 - "history/route.ts"
Cohesion: 0.11
Nodes (15): ARCHIVE_START_MS, dynamic, errorResponse(), GET(), ISSUE_CODES, querySchema, runtime, SYMBOLS (+7 more)

### Community 99 - "src/feedback/index.ts"
Cohesion: 0.14
Nodes (27): decimalsOf(), DIRECTION_RU, displayValue(), formatFeedbackParams(), normalizeParams(), PARAM_KINDS, ParamFormatters, ParamKind (+19 more)

### Community 100 - "hints.ts"
Cohesion: 0.21
Nodes (9): external(), selectHints(), time(), 12.4 Совместимость и стоимость пары, 3.1 Правило (решение), 3.2 Дедупликация, 3.3 Сигнатура `analyzeStructure`, 3.4 Отображение в `Mark` (общая модель `ARCHITECTURE.md` §4.2) (+1 more)

### Community 101 - "SessionActions"
Cohesion: 0.09
Nodes (8): ChallengeApiError, ChallengeErrorKind, fetchNext(), gradeChallenge(), kindOf(), post(), toError(), SessionActions

### Community 102 - "Стратегия тестирования — Trading Lab"
Cohesion: 0.11
Nodes (18): 10. Производительность, 1. Принципы, 2. Пирамида, 3. Фикстуры, 4.1 Инвариант агрегации таймфреймов, 4.2 `sliceAt(series, T)`, 4.3 Нормализация (`market-data`), 4.4 Golden-тесты SMC/PA (+10 more)

### Community 103 - "DrawingPrimitive.ts"
Cohesion: 0.17
Nodes (7): DrawingPrimitive, OpenCandleInfo, PrimitiveState, ZONE_KINDS, dimSpans(), HighlightRange, MarkState

### Community 104 - "6. Внешние API Binance"
Cohesion: 0.40
Nodes (5): status(), 6.1 REST: `GET https://fapi.binance.com/fapi/v1/klines` (браузер), 6.2 WebSocket: kline stream (браузер), 6.3 Архив data.binance.vision (сервер), 6. Внешние API Binance

### Community 105 - "ref_vitest"
Cohesion: 0.16
Nodes (8): contractAttempt(), contractMark, runRepositoryContract(), FakeSupabase, Row, UNIQUE, seedLocal(), @supabase/supabase-js

### Community 106 - "serialize.ts"
Cohesion: 0.24
Nodes (9): anchor, KINDS, MARKS_FORMAT_VERSION, markSchema, parseMarks(), serializeMarks(), m, validateMarks() (+1 more)

### Community 107 - "5. Потоки данных"
Cohesion: 0.40
Nodes (5): 5.1 Живые данные (терминал), 5.2 История для заданий (сервер), 5.3 Задания (stateless, без БД до M7), 5.4 Хранение (Repository), 5. Потоки данных

### Community 108 - "@playwright/test"
Cohesion: 0.18
Nodes (12): DATE_LEAK, expandResult(), lastCandleTime(), num(), openReasons(), projectPoint(), SESSION_URL(), startSession() (+4 more)

### Community 109 - "TaskSession.tsx"
Cohesion: 0.13
Nodes (23): AppError(), Page(), Page(), NotFound(), csp, nextConfig, highlightMarks(), MsQuestionBody() (+15 more)

### Community 110 - "6. Liquidity sweep"
Cohesion: 0.40
Nodes (5): 6.1 Определение (решение), 6.2 Несколько уровней за одну свечу, 6.3 Граничные случаи, 6.4 Сигнатура, 6. Liquidity sweep

### Community 111 - "golden.pa-challenge.test.ts"
Cohesion: 0.11
Nodes (14): c4h, FIX, all, at(), c4h, idx(), ts(), loadAggTrades() (+6 more)

### Community 112 - "pa/generate.ts"
Cohesion: 0.19
Nodes (19): depthOf(), buildPa(), CONTEXT_TYPES, endCandidates(), FIND_RULES, FIND_WINDOW, LADDER, MAX_ATTEMPTS (+11 more)

### Community 114 - "SettingsScreen.tsx"
Cohesion: 0.20
Nodes (14): Page(), ErrorState(), LoadingRows(), useAsync(), HomeWeakSpots(), LearnScreen(), MODULES, DailyGoal() (+6 more)

### Community 115 - "PaLevelBody.tsx"
Cohesion: 0.17
Nodes (12): decimalsForTick(), makePriceFormatter(), TICK_TABLE, tickSizeFor(), fmtOf(), PaLevelBody(), levelPrice(), paLevelAnswer() (+4 more)

### Community 116 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, check:tokens, dev, format, lint, sync:tokens, test (+2 more)

### Community 117 - "HomeBlocks.tsx"
Cohesion: 0.31
Nodes (14): ContinueBlock(), ModuleAccuracy(), canTrain(), trendOf(), SkillsTab(), WeakBody(), skillName(), WeakSkillList() (+6 more)

### Community 118 - "ChallengeSession.tsx"
Cohesion: 0.21
Nodes (13): ChallengeSessionPage(), ChallengeSession(), FOCUS_SKILLS, SHEET_PAD, useDesktop(), DecisionPanel(), ErrorBlock(), PriceField() (+5 more)

### Community 119 - "criteria.ts"
Cohesion: 0.24
Nodes (17): body(), bottom(), dojiItems(), engulfItems(), finish(), insideItems(), Item, patternCheck() (+9 more)

### Community 120 - "ms.helpers.ts"
Cohesion: 0.38
Nodes (7): checkAndSeeResult(), nextThenHomeShowsDone(), openSession(), shot(), tapCandle(), solveOne(), selectTool()

### Community 121 - "Timeframe"
Cohesion: 0.18
Nodes (6): FIX, FixtureLoader, ArchiveLoader, mapLimit(), RawAggTrade, Timeframe

### Community 122 - "runCheck.ts"
Cohesion: 0.18
Nodes (12): CheckPanelProps, CheckOutcome, CheckResult, CheckState, CONCEPT_OF, conceptsFor(), RANGE_TAIL_CANDLES, runCheck() (+4 more)

### Community 123 - "build.ts"
Cohesion: 0.29
Nodes (9): attempt(), block(), buildFeedback(), glyphOf(), matchedOf(), OK_BY_SKILL, okFromOutcomes(), assertFilled() (+1 more)

### Community 124 - "ProgressScreen.tsx"
Cohesion: 0.15
Nodes (22): ChallengePage(), Page(), ChallengeHome(), DIFFS, recentLine(), StartTf, Stats(), TF_OPTIONS (+14 more)

### Community 125 - "QA Report — финальная приёмка MVP Trading Lab (M8)"
Cohesion: 0.22
Nodes (8): 1. Сводка, 2. Таблица AC, 3. Ключевые инварианты, 4. Производительность (headless Chromium, software rendering, CPU throttling 4x), 5. Дефекты, 6. Бэклог оркестратора, 7. Не удалось проверить, QA Report — финальная приёмка MVP Trading Lab (M8)

### Community 126 - "useRepository"
Cohesion: 0.20
Nodes (13): DayStat, prevDay(), softStreak(), done, AsyncState, DailyProgress, useAttempts(), useDailyProgress() (+5 more)

### Community 127 - "12. `gradeMarks` — сравнение разметки"
Cohesion: 0.25
Nodes (8): 12.1 Сигнатура (расширение `API_CONTRACTS.md`), 12.2 Ключевая свеча метки, 12.3 Группы сопоставления, 12.5 Матчинг (решение: DP по времени вместо венгерского), 12.6 Классификация после матчинга, 12.7 Счёт, вердикт, навыки, 12.8 Пример AC-07 на реальных данных (GS-1), 12. `gradeMarks` — сравнение разметки

### Community 128 - "fixtures"
Cohesion: 0.50
Nodes (3): fixtures, recorded/ - записанные форматы API (fapi/fstream недоступны из облака, 451), Архивные CSV

### Community 129 - "resolve.test.ts"
Cohesion: 0.25
Nodes (5): agg, c1, c15, T0, T1

### Community 130 - "4. Функциональные требования"
Cohesion: 0.17
Nodes (12): 4.10 Авторизация (FR-AUTH), 4.11 Интерфейс (FR-UI), 4.1 Данные (FR-DATA), 4.2 График (FR-CHART), 4.3 Слой разметки (FR-DRAW), 4.4 Market Structure Analyzer (FR-MS), 4.5 Trading Challenge (FR-TC), 4.6 Price Action Trainer (FR-PA) (+4 more)

### Community 131 - "storage/index.ts"
Cohesion: 0.14
Nodes (22): dynamic, GET(), dynamic, Page(), @supabase/ssr@^0.12.7, AuthContext, AuthState, DISABLED (+14 more)

### Community 132 - "7. User Flows"
Cohesion: 0.25
Nodes (8): 7.1 Первый вход, 7.2 Сессия Market Structure (режим «Разметка»), 7.3 Trading Challenge: от выбора до разбора, 7.4 Price Action «Контекст», 7.5 Терминал с проверкой разметки, 7.6 Просмотр «Слабых мест», 7.7 Продолжение на другом устройстве, 7. User Flows

### Community 133 - "Подключение Supabase и Vercel (с телефона)"
Cohesion: 0.18
Nodes (10): 1. Проект Supabase, 2. Применить миграцию (создать таблицы), 3. Ключи Supabase, 4. Вход через Google, 5. Redirect URL в Supabase, 6. Vercel, 7. Проверка на телефоне, Если что-то не работает (+2 more)

### Community 134 - "snap.test.ts"
Cohesion: 0.43
Nodes (5): snapAnchor(), SnapOptions, snapPriceToCandle(), synthetic_candles, T0

### Community 135 - "Команда агентов — Trading Lab"
Cohesion: 0.29
Nodes (6): 1. Сводка, 3. Правила оркестрации, 4. Формат отчёта агента (до 15 строк), 5. Шаблон задания агенту, Команда агентов — Trading Lab, Правило graphify (включается в каждый промпт агента, исследующего код)

### Community 136 - "handleGrade"
Cohesion: 0.40
Nodes (5): dynamic, maxDuration, POST(), runtime, handleGrade()

### Community 137 - "tools.ts"
Cohesion: 0.25
Nodes (7): FULL_WIDTH_KINDS, isDrawKind(), isScopedKind(), MarkExtra, RAY_RIGHT_KINDS, TOOL_DEFS, ToolDef

### Community 138 - "ADR-0007: Правила исхода сделки Challenge (drill-down)"
Cohesion: 0.33
Nodes (5): ADR-0007: Правила исхода сделки Challenge (drill-down), Контекст, Открытые вопросы (закрыты: `docs/specs/ALGORITHMS.md`), Последствия, Рассмотренные альтернативы

### Community 139 - "3. Область продукта"
Cohesion: 0.40
Nodes (5): 3.1 В MVP, 3.2 Вне MVP, 3.3 Требует исследования, 3.4 Технические риски, 3. Область продукта

### Community 140 - "16. Навыки и прогресс"
Cohesion: 0.50
Nodes (4): 16.1 Навыки, 16.2 Обновление точности, 16.3 Адаптивная подборка, 16. Навыки и прогресс

### Community 141 - "18. Golden-тесты"
Cohesion: 0.50
Nodes (4): 18.1 Формат и процесс, 18.2 Участки, 18.3 Что ещё размечается после утверждения (M4/M5), 18. Golden-тесты

### Community 144 - "1. Обзор и цель продукта"
Cohesion: 0.40
Nodes (5): 1.1 Что это, 1.2 Цель, 1.3 Целевой пользователь, 1.4 Модули, 1. Обзор и цель продукта

## Knowledge Gaps
- **13 isolated node(s):** `ADR-0008`, `ADR-0007`, `ADR-0006`, `ADR-0005`, `ADR-0005` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 985 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Mark` connect `Mark` to `terminal.helpers.ts`, `tools.ts`, `UtcMs`, `hit.ts`, `DECISIONS/README.md`, `PaFindBody.tsx`, `Candle`, `grade.test.ts`, `handlers.test.ts`, `rules.ts`, `build.ts`, `pa/index.ts`, `TimeIndex`, `TradingChart`, `marks.ts`, `placeholders.test.ts`, `MarkSession.tsx`, `SupabaseRepository.ts`, `grade.ts`, `src/types.ts`, `tasks.ts`, `facts.ts`, `smc/normalize.test.ts`, `TaskSession.tsx`, `1. Общие соглашения`, `hints.ts`, `DrawingPrimitive.ts`, `ref_vitest`, `serialize.ts`, `TaskSession.tsx`, `PaLevelBody.tsx`, `ChallengeSession.tsx`, `runCheck.ts`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Mark` (e.g. with `Контекст` and `Последствия`) actually correct?**
  _`Mark` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0008`, `ADR-0007`, `ADR-0006` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `market-structure.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10220673635307782 - nodes in this community are weakly interconnected._
- **Why does `Candle` connect `Candle` to `market-structure.ts`, `resolve.test.ts`, `snap.test.ts`, `Mark`, `grade.test.ts`, `src/types.ts`, `handlers.test.ts`, `rules.ts`, `TradingChart.tsx`, `pa/index.ts`, `TimeIndex`, `TradingChart`, `useMarketData.ts`, `placeholders.test.ts`, `MarkSession.tsx`, `archive.ts`, `core/src/index.ts`, `src/types.ts`, `normalize.ts`, `live.test.ts`, `tasks.ts`, `facts.ts`, `smc/normalize.test.ts`, `TaskSession.tsx`, `resolve.ts`, `patterns.ts`, `6. Внешние API Binance`, `golden.pa-challenge.test.ts`, `pa/generate.ts`, `criteria.ts`, `Timeframe`, `runCheck.ts`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `UtcMs` (e.g. with `1. Общие соглашения` and `4.1 Шкала задания`) actually correct?**
  _`UtcMs` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Repository` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._