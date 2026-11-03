# Graph Report - Varianto  (2026-11-03)

## Corpus Check
- 244 files · ~135,024 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 32 file(s) not represented in the graph (top: .csv 26, (none) 4, .example 1)

## Summary
- 1765 nodes · 4021 edges · 111 communities (105 shown, 6 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 150 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bc3ed21a`
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
- golden.pa-challenge.test.ts
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
- facts.ts
- grade.ts
- fetch-fixtures.mjs
- grade.test.ts
- SettingsScreen.tsx
- analyzeStructure
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
- live.test.ts
- controller.ts
- TradingChart.tsx
- context.ts
- TimeIndex
- TradingChart
- marks.ts
- useMarketData.ts
- controller.test.ts
- pa/generate.ts
- TerminalScreen.tsx
- grade.ts
- archive.ts
- core/src/index.ts
- README.md
- Repository
- DrawingPrimitive
- pa/index.ts
- 5. Потоки данных
- 13. Генерация заданий
- Settings
- normalize.ts
- 8. FVG (Fair Value Gap)
- skills.ts
- dependencies
- screens.test.tsx
- ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`
- serialize.ts
- challenge/generate.test.ts
- quality.ts
- patterns.ts
- 4. Функциональные требования
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
- UtcMs
- quality.test.ts
- format.ts
- 12. `gradeMarks` — сравнение разметки
- 7. User Flows
- 4. Обязательные наборы тестов
- data/streak.test.ts
- frontend-developer.md
- ADR-0008: Local-first хранилище за интерфейсом Repository; Supabase в M7
- scripts
- ADR-0007: Правила исхода сделки Challenge (drill-down)
- @testing-library/react
- 1. Обзор и цель продукта
- 10. `findLevels` — уровни поддержки/сопротивления

## God Nodes (most connected - your core abstractions)
1. `UtcMs` - 59 edges
2. `Candle` - 56 edges
3. `Mark` - 42 edges
4. `analyzeStructure()` - 36 edges
5. `react` - 34 edges
6. `cn()` - 30 edges
7. `TradingChart()` - 26 edges
8. `LocalRepository` - 23 edges
9. `Symbol` - 23 edges
10. `ArchiveSource` - 23 edges

## Surprising Connections (you probably didn't know these)
- `5.4 Хранение (Repository)` --references--> `LocalRepository`  [INFERRED]
  docs/ARCHITECTURE.md → apps/web/src/storage/LocalRepository.ts
- `7. Интерфейс `Repository` (`ARCHITECTURE.md` §5.4)` --references--> `Repository`  [INFERRED]
  docs/API_CONTRACTS.md → apps/web/src/storage/types.ts
- `Решение` --references--> `sliceAt()`  [INFERRED]
  docs/DECISIONS/0005-stateless-signed-task-tokens.md → packages/core/src/candles/aggregate.ts
- `14.1 Факты на момент T (`ChallengeFacts`)` --references--> `ChallengeFacts`  [INFERRED]
  docs/specs/ALGORITHMS.md → packages/core/src/challenge/facts.ts
- `6.3 Архив data.binance.vision (сервер)` --references--> `resolveTrade()`  [INFERRED]
  docs/API_CONTRACTS.md → packages/core/src/challenge/resolve.ts

## Import Cycles
- 2-file cycle: `packages/core/src/candles/aggregate.ts -> packages/core/src/index.ts -> packages/core/src/candles/aggregate.ts`

## Communities (111 total, 6 thin omitted)

### Community 0 - "market-structure.ts"
Cohesion: 0.13
Nodes (29): atrAt(), buildMsQuestion(), Candidate, CONCEPTS, generateMsQuestion(), gradeMsQuestion(), meetsMsCriteria(), MS_DEPTH (+21 more)

### Community 1 - "PRD — Trading Lab"
Cohesion: 0.12
Nodes (16): 10. Приоритизация функций (MoSCoW), 11. План MVP, 12. Открытые вопросы, 2. Принципы продукта, 3.1 В MVP, 3.2 Вне MVP, 3.3 Требует исследования, 3.4 Технические риски (+8 more)

### Community 2 - "package.json"
Cohesion: 0.06
Nodes (41): PORT, chartBox(), drawTwoPoint(), isMobile(), markPoints(), openTerminal(), selectTool(), tapAt() (+33 more)

### Community 3 - "API Contracts — Trading Lab"
Cohesion: 0.08
Nodes (24): 1.1 Формат ошибки, 1.2 Заголовки кэша, 1. Общие соглашения, 2.2 Расширения контрактов (предложение — фиксируются при реализации в `@tl/core`), 2. Типы `@tl/core`, используемые в контрактах, 3.1 `GET /api/health`, 3.2 `GET /api/history`, 3.3 `POST /api/tasks/{module}/next` (+16 more)

### Community 4 - "ProgressScreen.tsx"
Cohesion: 0.13
Nodes (33): Page(), Page(), EmptyState(), ErrorState(), LoadingRows(), AsyncState, useAsync(), LearnScreen() (+25 more)

### Community 5 - "with"
Cohesion: 0.08
Nodes (26): runs-on, steps, GITHUB_TOKEN, jobs, check, secrets-scan, name, on (+18 more)

### Community 6 - "Architecture — Trading Lab"
Cohesion: 0.14
Nodes (14): 10. Развёртывание, 11. Риски, 1. Ключевые ограничения, определяющие архитектуру, 2. Обзор, 3. Репозиторий (pnpm monorepo), 4.1 Синхронизация таймфреймов, 4.2 Разметка (общая модель для пользователя и алгоритма), 4.3 Алгоритмы (детерминированные, версионируемые) (+6 more)

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
Cohesion: 0.14
Nodes (12): TradingLabDB, defaultSettings(), LocalRepository, mark, Attempt, AttemptFilter, DailyActivity, DEFAULT_DAILY_GOAL (+4 more)

### Community 11 - "live.ts"
Cohesion: 0.11
Nodes (18): Frontend Developer, Timeframe, BINANCE_REST_BASE, BINANCE_WS_BASE, binanceInterval(), FetchKlinesOptions, LiveErrorCode, LiveFeed (+10 more)

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
Nodes (35): Badge(), BadgeProps, BottomSheet(), BottomSheetProps, HEIGHT, SheetHeight, Harness(), Button() (+27 more)

### Community 16 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, allowJs, incremental, jsx, lib, paths, plugins, exclude (+3 more)

### Community 17 - "Project Status — Trading Lab"
Cohesion: 0.25
Nodes (7): Project Status — Trading Lab, Блокирующие проблемы, Доступность рыночных данных из контейнера (проверено curl), Завершённые этапы, Окружение (облачный контейнер Claude Code), Следующие действия, Текущие задачи

### Community 18 - "Skills Registry — Trading Lab"
Cohesion: 0.25
Nodes (7): Skills Registry — Trading Lab, Кандидаты — отложены до утверждения архитектуры, Отклонённые, Справочник: Public APIs, Уже доступные навыки окружения (не требуют установки), Установка в новом контейнере, Установленные инструменты

### Community 19 - "golden.pa-challenge.test.ts"
Cohesion: 0.10
Nodes (15): c4h, FIX, c4h, all, at(), c4h, idx(), ts() (+7 more)

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
Cohesion: 0.11
Nodes (26): distToRectEdge(), distToSegment(), Hit, hitTest(), inside(), partScore(), geos(), synthetic_proj (+18 more)

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
Cohesion: 0.13
Nodes (16): ADR-0007, AggTrade, done(), FutureProvider, Hit, Position, priceHits(), ResolutionMethod (+8 more)

### Community 30 - "facts.ts"
Cohesion: 0.15
Nodes (22): age(), CHALLENGE_STRUCTURE, FactsInput, HTF, intersects(), lastEventSince(), poiFor(), PoiInfo (+14 more)

### Community 31 - "grade.ts"
Cohesion: 0.12
Nodes (37): 5.2 `Feedback` (6 частей, FR-FB-02), 17.1 Структура и ключи, 17.2 Верность и общие принципы, 17.3 Что понято верно (`OkCode`; новые помечены *), 17.4 Ошибки (части 3–6), 17. Шаблоны разбора (источник `src/i18n/ru/feedback`), 19. Расхождения с документами, ChallengeGrade (+29 more)

### Community 32 - "fetch-fixtures.mjs"
Cohesion: 0.08
Nodes (26): ChallengeAttemptStat, challengeStats(), dailyProgress(), DayMap, DayRecord, GOAL_DEFAULT, GOAL_MAX, GOAL_MIN (+18 more)

### Community 33 - "grade.test.ts"
Cohesion: 0.10
Nodes (24): algoOf(), ALL, at(), candles, findAlgo(), P, r, window (+16 more)

### Community 34 - "SettingsScreen.tsx"
Cohesion: 0.18
Nodes (10): Page(), @testing-library/user-event@^14.6.8, SettingsScreen(), Trigger(), USED, Segmented(), Harness(), OPTIONS (+2 more)

### Community 35 - "analyzeStructure"
Cohesion: 0.14
Nodes (17): 2.1 Из `ARCHITECTURE.md` §4 (дословно), Решение, 2.1 Сигнатура, 2.2 Определение, 2.3 Граничные случаи, 2.4 Кандидаты у правого края (`pendingSwings`), 2.5 Псевдокод, 2. `detectSwings` — фрактальные swing (+9 more)

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
Cohesion: 0.13
Nodes (36): ChallengeFacts, allSwingsMap, AnalyzeOptions, EMPTY_LAYER, detectFvgs(), MarkItem, detectOrderBlocks(), candleIndexAt() (+28 more)

### Community 45 - "history/route.ts"
Cohesion: 0.11
Nodes (15): dynamic, errorResponse(), GET(), ISSUE_CODES, querySchema, runtime, SYMBOLS, call() (+7 more)

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
Cohesion: 0.16
Nodes (16): devDependencies, jsdom@^26.0.0, tailwindcss@^4.0.0, @tailwindcss/postcss@^4.0.0, @types/react@^19.0.0, @types/react-dom@^19.0.0, vitest@^4.1.12, vitest (+8 more)

### Community 52 - "AppShell.tsx"
Cohesion: 0.16
Nodes (17): metadata, plexMono, plexSans, RootLayout(), viewport, csp, nextConfig, next@^16.0.0 (+9 more)

### Community 53 - "live.test.ts"
Cohesion: 0.12
Nodes (12): LiveStatus, archiveH1, archiveM1, FakeWs, json(), NOW, restH1, restM1 (+4 more)

### Community 54 - "controller.ts"
Cohesion: 0.23
Nodes (11): PointerKind, constrainAnchors(), createMark(), FULL_WIDTH_KINDS, isDrawKind(), RAY_RIGHT_KINDS, TOOL_DEFS, ToolDef (+3 more)

### Community 55 - "TradingChart.tsx"
Cohesion: 0.12
Nodes (29): RenderStyle, ToolId, limitCandles(), OPEN_CANDLE_ALPHA, pricePrecision(), T0, tokens, toCandleData() (+21 more)

### Community 56 - "context.ts"
Cohesion: 0.12
Nodes (23): computeContext(), CONTEXT_STRUCTURE, ContextAnswer, ContextFactorAnswer, ContextReference, externalSwings(), gradeContext(), HTF_OF (+15 more)

### Community 57 - "TimeIndex"
Cohesion: 0.15
Nodes (9): lwcProjection(), snapAnchor(), SnapOptions, snapPriceToCandle(), synthetic_candles, T0, T0, TimeIndex (+1 more)

### Community 58 - "TradingChart"
Cohesion: 0.15
Nodes (13): DrawKind, DrawingController, bosMark, drag(), index, lvl, proj, pt() (+5 more)

### Community 59 - "marks.ts"
Cohesion: 0.26
Nodes (15): allLayerSwings(), buildAlgoMarkSet(), conceptOf(), endTimeOf(), eventMark(), fvgMark(), IndexWindow, KIND_CONCEPT (+7 more)

### Community 60 - "useMarketData.ts"
Cohesion: 0.24
Nodes (12): archiveWindow(), appendCandle(), ArchiveHttpError, DataStatus, fetchArchive(), LoadError, MarketState, toLoadError() (+4 more)

### Community 61 - "controller.test.ts"
Cohesion: 0.11
Nodes (15): OpenCandleInfo, PrimitiveState, ZONE_KINDS, isMarkVisible(), synthetic_proj, T0, Projection, ControllerDeps (+7 more)

### Community 62 - "pa/generate.ts"
Cohesion: 0.19
Nodes (21): buildHints(), DEFAULT_TFS, HTF, meetsDifficulty(), pickChallengeScenario(), tail(), ADR-0006, CONTEXT_TYPES (+13 more)

### Community 63 - "TerminalScreen.tsx"
Cohesion: 0.10
Nodes (38): TerminalPage(), formatPrice(), ARCHIVE_MIN_AGE_MS, ARCHIVE_SYMBOLS, archiveAllowed(), archivePageSize(), HISTORY_PAGE, normalizeSymbolInput() (+30 more)

### Community 64 - "grade.ts"
Cohesion: 0.16
Nodes (19): Entry, gradeMarks(), Group, groupEvaluated(), groupOf(), iou(), MAJOR, patternSkill() (+11 more)

### Community 65 - "archive.ts"
Cohesion: 0.15
Nodes (14): AGG_TRADES_HEADER, AggTrade, ARCHIVE_BASE_URL, ArchiveFetch, ArchiveFileSpec, ArchiveSource, ArchiveSourceOptions, archiveUrl() (+6 more)

### Community 66 - "core/src/index.ts"
Cohesion: 0.14
Nodes (10): dynamic, GET(), Backend Developer, 2. Пирамида, aggregate(), SeriesByTf, sliceAt(), synthetic_hour() (+2 more)

### Community 67 - "README.md"
Cohesion: 0.12
Nodes (10): MVP, Roadmap — Trading Lab, v1.1 — Fibonacci Playground и Premium/Discount, v1.2 — Elliott Wave Lab, v2, Правила корректировки, Trading Lab, Документация (+2 more)

### Community 68 - "Repository"
Cohesion: 0.12
Nodes (7): Repository, graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 70 - "pa/index.ts"
Cohesion: 0.23
Nodes (18): computeChallengeFacts(), ContextEvidence, LevelTaskPick, patternGradeContext(), skillOfPattern(), DEFAULT_LEVEL_PARAMS, findLevels(), gradeLevel() (+10 more)

### Community 71 - "5. Потоки данных"
Cohesion: 0.40
Nodes (5): 5.1 Живые данные (терминал), 5.2 История для заданий (сервер), 5.3 Задания (stateless, без БД до M7), 5.4 Хранение (Repository), 5. Потоки данных

### Community 72 - "13. Генерация заданий"
Cohesion: 0.33
Nodes (6): 13.1 Общие правила, 13.2 Market Structure «Разметка», 13.3 Market Structure «Вопрос», 13.4 Price Action, 13.5 Challenge, 13. Генерация заданий

### Community 73 - "Settings"
Cohesion: 0.21
Nodes (13): localDay(), Settings, 1. Принципы, 2. Локальная схема: IndexedDB (Dexie), 3.1 RLS, 3. Схема Supabase Postgres (M7), 5.1 Точность навыка, 5.2 Дневная цель (+5 more)

### Community 74 - "normalize.ts"
Cohesion: 0.15
Nodes (18): load(), klinesZip(), NOW, Served, zipOf(), ARCHIVE_KLINE_HEADER, Gap, num() (+10 more)

### Community 75 - "8. FVG (Fair Value Gap)"
Cohesion: 0.50
Nodes (4): 8.1 Определение, 8.2 Заполнение, 8.3 Сигнатура, 8. FVG (Fair Value Gap)

### Community 76 - "skills.ts"
Cohesion: 0.22
Nodes (16): accuracyOf(), applyOutcome(), FOCUS_SIZE, generatorForSkill(), isEnoughData(), isOutcomeOk(), MIN_SAMPLE, MIN_WEIGHT (+8 more)

### Community 77 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, dexie@^4.0.0, lightweight-charts@~5.2.1, lucide-react@^1.66.0, react@^19.0.0, react-dom@^19.0.0, @tl/core@workspace:*, @tl/market-data@workspace:* (+6 more)

### Community 78 - "screens.test.tsx"
Cohesion: 0.17
Nodes (19): wrap(), Providers(), getDefaultRepository(), RepositoryContext, RepositoryProvider(), APPEARANCE_STORAGE_KEY, themeInitScript, applyToDom() (+11 more)

### Community 79 - "ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`"
Cohesion: 0.29
Nodes (6): 15. `resolveTrade` (ADR-0007, уточнения), 20. Спорные места и вопросы оркестратору, 4.1 Правило, 4.2 Граничные случаи, 4. Метки HH / HL / LH / LL, ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`

### Community 80 - "serialize.ts"
Cohesion: 0.20
Nodes (11): zod@^4.0.0, anchor, KINDS, MARKS_FORMAT_VERSION, markSchema, parseMarks(), serializeMarks(), m (+3 more)

### Community 81 - "challenge/generate.test.ts"
Cohesion: 0.18
Nodes (12): ChallengePick, ChallengePickInput, c15, c4h, h1, MIN, src15, src4h (+4 more)

### Community 82 - "quality.ts"
Cohesion: 0.25
Nodes (13): ChallengeDetail, dirOf(), gradeChallenge(), lastEventText(), lastInternal(), protectedLevel(), QualityPart, reasonScore() (+5 more)

### Community 83 - "patterns.ts"
Cohesion: 0.15
Nodes (24): c(), 1.2 Термины свечи, 9.1 Состав (ответ на OQ-11), 9.2 Критерии (ATR = ATR14 последней свечи модели, если не сказано иное; модель не ищется при ATR = null или `range == 0`), 9.3 Выход, 9.4 Проверенные примеры (BTCUSDT 4h 2026-09, GS-5), 9. Свечные модели Price Action (`detectPatterns`), ContextTaskPick (+16 more)

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

### Community 97 - "UtcMs"
Cohesion: 0.33
Nodes (7): DailyActivityRow, SkillStatRow, TerminalMarksRow, SkillId, ChallengeSource, Symbol, UtcMs

### Community 98 - "quality.test.ts"
Cohesion: 0.20
Nodes (6): c, facts(), L41, S82, W60, ResolvedTrade

### Community 99 - "format.ts"
Cohesion: 0.36
Nodes (5): formatInt(), formatPercent(), formatPrice(), formatR(), MONTHS_SHORT

### Community 100 - "12. `gradeMarks` — сравнение разметки"
Cohesion: 0.22
Nodes (9): 12.1 Сигнатура (расширение `API_CONTRACTS.md`), 12.2 Ключевая свеча метки, 12.3 Группы сопоставления, 12.4 Совместимость и стоимость пары, 12.5 Матчинг (решение: DP по времени вместо венгерского), 12.6 Классификация после матчинга, 12.7 Счёт, вердикт, навыки, 12.8 Пример AC-07 на реальных данных (GS-1) (+1 more)

### Community 101 - "7. User Flows"
Cohesion: 0.25
Nodes (8): 7.1 Первый вход, 7.2 Сессия Market Structure (режим «Разметка»), 7.3 Trading Challenge: от выбора до разбора, 7.4 Price Action «Контекст», 7.5 Терминал с проверкой разметки, 7.6 Просмотр «Слабых мест», 7.7 Продолжение на другом устройстве, 7. User Flows

### Community 102 - "4. Обязательные наборы тестов"
Cohesion: 0.25
Nodes (8): 4.1 Инвариант агрегации таймфреймов, 4.2 `sliceAt(series, T)`, 4.3 Нормализация (`market-data`), 4.4 Golden-тесты SMC/PA, 4.5 `resolveTrade`, 4.6 Интеграционные тесты API, 4.7 Прочие unit-тесты, 4. Обязательные наборы тестов

### Community 103 - "data/streak.test.ts"
Cohesion: 0.43
Nodes (4): DayStat, prevDay(), softStreak(), done

### Community 104 - "frontend-developer.md"
Cohesion: 0.29
Nodes (6): graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 105 - "ADR-0008: Local-first хранилище за интерфейсом Repository; Supabase в M7"
Cohesion: 0.29
Nodes (6): ADR-0008: Local-first хранилище за интерфейсом Repository; Supabase в M7, Контекст, Открытые вопросы, Последствия, Рассмотренные альтернативы, Решение

### Community 106 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, start, test, typecheck

### Community 107 - "ADR-0007: Правила исхода сделки Challenge (drill-down)"
Cohesion: 0.33
Nodes (6): ADR-0007: Правила исхода сделки Challenge (drill-down), Контекст, Открытые вопросы (закрыты: `docs/specs/ALGORITHMS.md`), Последствия, Рассмотренные альтернативы, Решение

### Community 108 - "@testing-library/react"
Cohesion: 0.40
Nodes (4): fake-indexeddb@^6.2.7, @testing-library/react@^16.0.0, fake-indexeddb, @testing-library/react

### Community 109 - "1. Обзор и цель продукта"
Cohesion: 0.40
Nodes (5): 1.1 Что это, 1.2 Цель, 1.3 Целевой пользователь, 1.4 Модули, 1. Обзор и цель продукта

### Community 110 - "10. `findLevels` — уровни поддержки/сопротивления"
Cohesion: 0.67
Nodes (4): 10.1 Алгоритм, 10.2 Эталон для «Проведи уровень», 10. `findLevels` — уровни поддержки/сопротивления, touches()

## Knowledge Gaps
- **8 isolated node(s):** `../../tsconfig.base.json`, `../tsconfig.base.json`, `ADR-0006`, `ADR-0006`, `ADR-0007` (+3 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 718 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Mark` connect `controller.test.ts` to `UtcMs`, `hit.ts`, `grade.test.ts`, `src/types.ts`, `controller.ts`, `TradingChart.tsx`, `context.ts`, `TradingChart`, `marks.ts`, `pa/generate.ts`, `TerminalScreen.tsx`, `grade.ts`, `Repository`, `pa/index.ts`, `serialize.ts`, `challenge/generate.test.ts`, `1. Общие соглашения`, `3. Внешняя и внутренняя структура`, `UtcMs`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `UtcMs` (e.g. with `1. Общие соглашения` and `4.1 Шкала задания`) actually correct?**
  _`UtcMs` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `../../tsconfig.base.json`, `../tsconfig.base.json`, `ADR-0006` to the rest of the system?**
  _8 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `market-structure.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12903225806451613 - nodes in this community are weakly interconnected._
- **Why does `PRD — Trading Lab` connect `PRD — Trading Lab` to `7. User Flows`, `README.md`, `4. Функциональные требования`, `1. Обзор и цель продукта`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Mark` (e.g. with `Контекст` and `Последствия`) actually correct?**
  _`Mark` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Should `PRD — Trading Lab` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._