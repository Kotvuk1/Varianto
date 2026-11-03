# Graph Report - Varianto  (2026-11-03)

## Corpus Check
- 346 files · ~181,103 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 32 file(s) not represented in the graph (top: .csv 26, (none) 4, .example 1)

## Summary
- 2438 nodes · 6510 edges · 129 communities (123 shown, 6 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 170 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6631f797`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- market-structure.ts
- Repository
- terminal.helpers.ts
- API Contracts — Trading Lab
- ProgressScreen.tsx
- with
- Architecture — Trading Lab
- 2. Карточки
- TerminalScreen.tsx
- market-data/package.json
- UtcMs
- UtcMs
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
- misc.test.tsx
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
- fetch-fixtures.mjs
- LAYOUTS — Trading Lab
- 2. Компоненты
- DESIGN — Trading Lab
- COPY — микрокопия Trading Lab
- check_tokens.py
- web/package.json
- AppShell.tsx
- rules.ts
- panels.tsx
- DrawingPrimitive.ts
- pa/generate.ts
- TimeIndex
- TradingChart
- marks.ts
- useMarketData.ts
- params.ts
- tasks.ts
- ToolPalette.tsx
- MarkSession.tsx
- archive.ts
- core/src/index.ts
- README.md
- frontend-developer.md
- grade.ts
- schemas.ts
- SessionActions
- 13. Генерация заданий
- Settings
- normalize.ts
- 8. FVG (Fair Value Gap)
- live.test.ts
- sources.ts
- screens.test.tsx
- ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`
- Swing
- handlers.test.ts
- facts.ts
- patterns.ts
- PRD — Trading Lab
- TaskSession.tsx
- 11. Контекст для PA «Контекст»
- 14. Challenge: эталон, оценка качества, WAIT, лимиты
- 1. Общие соглашения
- 5. Тренд, BOS и CHoCH
- src/types.ts
- 3. Внешняя и внутренняя структура
- package.json
- quality.ts
- patterns.ts
- 7. Order Block
- web/AGENTS.md
- pa/index.ts
- history/route.ts
- 6. Внешние API Binance
- 12. `gradeMarks` — сравнение разметки
- sessionStore.ts
- Стратегия тестирования — Trading Lab
- data/streak.test.ts
- adapters.ts
- ADR-0008: Local-first хранилище за интерфейсом Repository; Supabase в M7
- context.ts
- templates.ru.ts
- @playwright/test
- PaContextBody.tsx
- 6. Liquidity sweep
- runCheck.ts
- ArchiveSource
- MsQuestionBody.tsx
- grade.test.ts
- SessionLayout.tsx
- scripts
- 16. Навыки и прогресс
- challenge/generate.ts
- session/types.ts
- ms.helpers.ts
- challenge/generate.test.ts
- placeholders.test.ts
- DrawingPrimitive
- stats.ts
- aggregate.ts
- 17. Шаблоны разбора (источник `src/i18n/ru/feedback`)
- 18. Golden-тесты
- fixtures

## God Nodes (most connected - your core abstractions)
1. `Candle` - 89 edges
2. `UtcMs` - 79 edges
3. `Mark` - 77 edges
4. `react` - 66 edges
5. `TaskTimeframe` - 50 edges
6. `cn()` - 44 edges
7. `analyzeStructure()` - 44 edges
8. `TradingChart()` - 32 edges
9. `Button()` - 32 edges
10. `Timeframe` - 30 edges

## Surprising Connections (you probably didn't know these)
- `4.2 Типы ответа (`Answer`)` --references--> `Answer`  [INFERRED]
  docs/API_CONTRACTS.md → apps/web/src/server/schemas.ts
- `5.4 Хранение (Repository)` --references--> `LocalRepository`  [INFERRED]
  docs/ARCHITECTURE.md → apps/web/src/storage/LocalRepository.ts
- `7. Интерфейс `Repository` (`ARCHITECTURE.md` §5.4)` --references--> `Repository`  [INFERRED]
  docs/API_CONTRACTS.md → apps/web/src/storage/types.ts
- `Решение` --references--> `sliceAt()`  [INFERRED]
  docs/DECISIONS/0005-stateless-signed-task-tokens.md → packages/core/src/candles/aggregate.ts
- `6.3 Архив data.binance.vision (сервер)` --references--> `resolveTrade()`  [INFERRED]
  docs/API_CONTRACTS.md → packages/core/src/challenge/resolve.ts

## Import Cycles
- 2-file cycle: `packages/core/src/candles/aggregate.ts -> packages/core/src/index.ts -> packages/core/src/candles/aggregate.ts`

## Communities (129 total, 6 thin omitted)

### Community 0 - "market-structure.ts"
Cohesion: 0.15
Nodes (26): mulberry32(), randInt(), atrAt(), buildMsQuestion(), CONCEPTS, drawCandidate(), generateMsQuestion(), gradeMsQuestion() (+18 more)

### Community 1 - "Repository"
Cohesion: 0.12
Nodes (7): Repository, graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 2 - "terminal.helpers.ts"
Cohesion: 0.17
Nodes (24): Box, candlePoint(), chartCandles(), coreLevels(), coreMarks(), drawAlgoMark(), drawTwoPoint(), findVisibleBos() (+16 more)

### Community 3 - "API Contracts — Trading Lab"
Cohesion: 0.10
Nodes (20): 1.1 Формат ошибки, 1.2 Заголовки кэша, 1. Общие соглашения, 2.2 Расширения контрактов (предложение — фиксируются при реализации в `@tl/core`), 2. Типы `@tl/core`, используемые в контрактах, 3.1 `GET /api/health`, 3.2 `GET /api/history`, 3.3 `POST /api/tasks/{module}/next` (+12 more)

### Community 4 - "ProgressScreen.tsx"
Cohesion: 0.10
Nodes (40): Page(), Page(), recentLine(), Stats(), EmptyState(), ErrorState(), LoadingRows(), AsyncState (+32 more)

### Community 5 - "with"
Cohesion: 0.08
Nodes (26): runs-on, steps, GITHUB_TOKEN, jobs, check, secrets-scan, name, on (+18 more)

### Community 6 - "Architecture — Trading Lab"
Cohesion: 0.11
Nodes (19): 10. Развёртывание, 11. Риски, 1. Ключевые ограничения, определяющие архитектуру, 2. Обзор, 3. Репозиторий (pnpm monorepo), 4.1 Синхронизация таймфреймов, 4.2 Разметка (общая модель для пользователя и алгоритма), 4.3 Алгоритмы (детерминированные, версионируемые) (+11 more)

### Community 7 - "2. Карточки"
Cohesion: 0.12
Nodes (16): 1. Сводка, 2. Карточки, 3. Правила оркестрации, 4. Формат отчёта агента (до 15 строк), 5. Шаблон задания агенту, Backend Developer, Chart Developer, DevOps/Security Engineer (+8 more)

### Community 8 - "TerminalScreen.tsx"
Cohesion: 0.19
Nodes (22): TerminalPage(), NoticeCode, CheckPanel(), subscribe(), useDesktop(), normalizeSymbolInput(), InstructionBar(), InstructionBarProps (+14 more)

### Community 9 - "market-data/package.json"
Cohesion: 0.11
Nodes (20): dependencies, fflate@^0.8.3, @tl/core@workspace:*, devDependencies, vitest@^4.1.12, @vitest/coverage-v8@^4.1.12, exports, ./archive (+12 more)

### Community 10 - "UtcMs"
Cohesion: 0.11
Nodes (17): DailyActivityRow, SkillStatRow, TerminalMarksRow, TradingLabDB, defaultSettings(), LocalRepository, mark, Attempt (+9 more)

### Community 11 - "UtcMs"
Cohesion: 0.19
Nodes (9): FIX, FixtureLoader, CandleLoader, RawAggTrade, GradeCtx, ChallengeSource, Candidate, UtcMs (+1 more)

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
Nodes (31): Badge(), BadgeProps, BottomSheetProps, HEIGHT, SheetHeight, buttonClass(), ButtonProps, ButtonSize (+23 more)

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
Cohesion: 0.09
Nodes (25): ADR-0007: Правила исхода сделки Challenge (drill-down), Контекст, Открытые вопросы (закрыты: `docs/specs/ALGORITHMS.md`), Последствия, Рассмотренные альтернативы, Решение, 10.1 Алгоритм, 10.2 Эталон для «Проведи уровень» (+17 more)

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
Cohesion: 0.06
Nodes (40): OpenCandleInfo, PrimitiveState, ZONE_KINDS, distToRectEdge(), distToSegment(), Hit, hitTest(), inside() (+32 more)

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

### Community 29 - "misc.test.tsx"
Cohesion: 0.24
Nodes (8): Harness(), Trigger(), USED, Harness(), OPTIONS, useToast(), @testing-library/react, @testing-library/user-event

### Community 30 - "Candle"
Cohesion: 0.16
Nodes (21): AnswerInput, ChallengeAnswerBody, SessionState, candle(), series, task, ChallengeDetailDto, ChallengeGradeResult (+13 more)

### Community 31 - "features/feedback/index.ts"
Cohesion: 0.17
Nodes (19): errors, feedback, defaultFmt, FeedbackView(), FeedbackViewProps, Section(), DIR, formatParam() (+11 more)

### Community 32 - "fetch-fixtures.mjs"
Cohesion: 0.10
Nodes (33): accuracyOf(), applyOutcome(), FOCUS_SIZE, generatorForSkill(), isEnoughData(), isOutcomeOk(), MIN_SAMPLE, MIN_WEIGHT (+25 more)

### Community 33 - "grade.test.ts"
Cohesion: 0.15
Nodes (17): candles, check(), Gold, GoldEvent, GoldSwing, btc4h, G, GEv (+9 more)

### Community 34 - "token.ts"
Cohesion: 0.11
Nodes (27): ApiError, ApiErrorCode, ConfigError, ValidationIssue, b64(), derive(), getSigningSecret(), HeaderSchema (+19 more)

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
Cohesion: 0.19
Nodes (22): 2.1 Из `ARCHITECTURE.md` §4 (дословно), Решение, golden/ - эталонные участки SMC (ALGORITHMS §18), allSwingsMap, AnalyzeOptions, analyzeStructure(), EMPTY_LAYER, scopeOrder() (+14 more)

### Community 45 - "fetch-fixtures.mjs"
Cohesion: 0.12
Nodes (9): downloadedAt, items, m1, rec, root, rows, scratch, table (+1 more)

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
Nodes (39): dependencies, dexie@^4.0.0, lightweight-charts@~5.2.1, lucide-react@^1.66.0, next@^16.0.0, react@^19.0.0, react-dom@^19.0.0, @tl/core@workspace:* (+31 more)

### Community 52 - "AppShell.tsx"
Cohesion: 0.23
Nodes (13): metadata, plexMono, plexSans, RootLayout(), viewport, AppShell(), BottomTabs(), DesktopTabs() (+5 more)

### Community 53 - "rules.ts"
Cohesion: 0.10
Nodes (38): FULL_WIDTH_KINDS, isDrawKind(), MarkExtra, RAY_RIGHT_KINDS, SWING_SIDE, TOOL_DEFS, ToolDef, Built (+30 more)

### Community 54 - "panels.tsx"
Cohesion: 0.08
Nodes (43): ChallengePage(), ChallengeSessionPage(), buildAttempt(), AxisTick, axisTicks(), relativeDuration(), relativeLabel(), STEPS (+35 more)

### Community 55 - "DrawingPrimitive.ts"
Cohesion: 0.13
Nodes (24): PointerKind, PointerInput, limitCandles(), OPEN_CANDLE_ALPHA, pricePrecision(), T0, tokens, toCandleData() (+16 more)

### Community 56 - "pa/generate.ts"
Cohesion: 0.18
Nodes (22): depthOf(), buildPa(), patternToMark(), buildPatternAlgoMarkSet(), CONTEXT_TYPES, endCandidates(), FIND_RULES, FIND_WINDOW (+14 more)

### Community 57 - "TimeIndex"
Cohesion: 0.13
Nodes (14): lwcProjection(), snapAnchor(), SnapOptions, snapPriceToCandle(), synthetic_candles, T0, T0, TimeIndex (+6 more)

### Community 58 - "TradingChart"
Cohesion: 0.13
Nodes (17): constrainAnchors(), createMark(), DrawKind, DrawingController, bosMark, breakIdx, drag(), index (+9 more)

### Community 59 - "marks.ts"
Cohesion: 0.20
Nodes (17): allLayerSwings(), buildAlgoMarkSet(), conceptOf(), endTimeOf(), eventMark(), fvgMark(), IndexWindow, KIND_CONCEPT (+9 more)

### Community 60 - "useMarketData.ts"
Cohesion: 0.13
Nodes (21): ARCHIVE_MIN_AGE_MS, ARCHIVE_SYMBOLS, archiveAllowed(), archivePageSize(), archiveWindow(), HISTORY_PAGE, PRESET_SYMBOLS, resolveSourceMode() (+13 more)

### Community 61 - "params.ts"
Cohesion: 0.09
Nodes (40): Page(), Page(), Page(), MsSessionScreen(), MsSetup(), PaSetup(), countsFromGrade(), MarkState (+32 more)

### Community 62 - "tasks.ts"
Cohesion: 0.10
Nodes (39): cutoffOf(), futureProviderFor(), loadMinutes(), buildChallenge(), buildMs(), ChReq, gradeChallengeTask(), gradeMsMark() (+31 more)

### Community 63 - "ToolPalette.tsx"
Cohesion: 0.13
Nodes (26): ToolId, Cell(), groupOf(), TaskToolbarBar(), TaskToolbarProps, TaskToolRail(), ERASER, SELECT (+18 more)

### Community 64 - "MarkSession.tsx"
Cohesion: 0.27
Nodes (16): decimalsForTick(), makePriceFormatter(), TICK_TABLE, tickSizeFor(), fmtOf(), AsideSection(), InputMessage(), RadioOption (+8 more)

### Community 65 - "archive.ts"
Cohesion: 0.13
Nodes (17): mapLimit(), Symbol, Timeframe, AGG_TRADES_HEADER, AggTrade, ARCHIVE_BASE_URL, ArchiveFetch, ArchiveFileSpec (+9 more)

### Community 66 - "core/src/index.ts"
Cohesion: 0.07
Nodes (23): dynamic, GET(), anchor, KINDS, MARKS_FORMAT_VERSION, markSchema, parseMarks(), serializeMarks() (+15 more)

### Community 67 - "README.md"
Cohesion: 0.12
Nodes (10): MVP, Roadmap — Trading Lab, v1.1 — Fibonacci Playground и Premium/Discount, v1.2 — Elliott Wave Lab, v2, Правила корректировки, Trading Lab, Документация (+2 more)

### Community 68 - "frontend-developer.md"
Cohesion: 0.29
Nodes (6): graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 69 - "grade.ts"
Cohesion: 0.20
Nodes (16): kindName(), Entry, gradeMarks(), Group, groupEvaluated(), groupOf(), iou(), MAJOR (+8 more)

### Community 70 - "schemas.ts"
Cohesion: 0.10
Nodes (20): zod@^4.0.0, AnchorSchema, AnswerSchema, BUSINESS_CODES, ChallengeAnswer, difficulty, GradeRequest, MARK_KINDS (+12 more)

### Community 71 - "SessionActions"
Cohesion: 0.10
Nodes (7): ChallengeApiError, ChallengeErrorKind, fetchNext(), gradeChallenge(), kindOf(), post(), SessionActions

### Community 72 - "13. Генерация заданий"
Cohesion: 0.33
Nodes (6): 13.1 Общие правила, 13.2 Market Structure «Разметка», 13.3 Market Structure «Вопрос», 13.4 Price Action, 13.5 Challenge, 13. Генерация заданий

### Community 73 - "Settings"
Cohesion: 0.14
Nodes (18): localDay(), Settings, 1. Принципы, 2. Локальная схема: IndexedDB (Dexie), 3.1 RLS, 3. Схема Supabase Postgres (M7), 4.1 Порядок, 4.2 Правила по таблицам (идемпотентность по `id`, конфликты по `updated_at`) (+10 more)

### Community 74 - "normalize.ts"
Cohesion: 0.15
Nodes (19): TIMEFRAME_MS, load(), klinesZip(), NOW, Served, zipOf(), ArchiveErrorCode, ARCHIVE_KLINE_HEADER (+11 more)

### Community 75 - "8. FVG (Fair Value Gap)"
Cohesion: 0.50
Nodes (4): 8.1 Определение, 8.2 Заполнение, 8.3 Сигнатура, 8. FVG (Fair Value Gap)

### Community 76 - "live.test.ts"
Cohesion: 0.07
Nodes (27): Frontend Developer, BINANCE_REST_BASE, BINANCE_WS_BASE, FetchKlinesOptions, LiveErrorCode, LiveFeed, LiveFeedOptions, LiveFetch (+19 more)

### Community 77 - "sources.ts"
Cohesion: 0.15
Nodes (17): ARCHIVE_START, ArchiveLoaderOptions, CHALLENGE_FUTURE_MS, ChallengeZone, Chunk, countClosedBefore(), DAY_MS, floorTo() (+9 more)

### Community 78 - "screens.test.tsx"
Cohesion: 0.14
Nodes (24): Page(), validateMarks(), wrap(), SettingsScreen(), useTerminalMarks(), Providers(), getDefaultRepository(), RepositoryContext (+16 more)

### Community 79 - "ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`"
Cohesion: 0.29
Nodes (6): 15. `resolveTrade` (ADR-0007, уточнения), 20. Спорные места и вопросы оркестратору, 4.1 Правило, 4.2 Граничные случаи, 4. Метки HH / HL / LH / LL, ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`

### Community 80 - "Swing"
Cohesion: 0.26
Nodes (10): MarkItem, LayerRun, makeEvent(), Range, runExternalLayer(), LayerState, Scope, StructureEvent (+2 more)

### Community 81 - "handlers.test.ts"
Cohesion: 0.07
Nodes (42): dynamic, maxDuration, POST(), runtime, dynamic, maxDuration, POST(), runtime (+34 more)

### Community 82 - "facts.ts"
Cohesion: 0.12
Nodes (28): 14.1 Факты на момент T (`ChallengeFacts`), age(), CHALLENGE_STRUCTURE, ChallengeFacts, computeChallengeFacts(), FactsInput, HTF, intersects() (+20 more)

### Community 83 - "patterns.ts"
Cohesion: 0.11
Nodes (14): c4h, FIX, all, at(), c4h, idx(), ts(), loadAggTrades() (+6 more)

### Community 84 - "PRD — Trading Lab"
Cohesion: 0.05
Nodes (41): 10. Приоритизация функций (MoSCoW), 11. План MVP, 12. Открытые вопросы, 1.1 Что это, 1.2 Цель, 1.3 Целевой пользователь, 1.4 Модули, 1. Обзор и цель продукта (+33 more)

### Community 85 - "TaskSession.tsx"
Cohesion: 0.13
Nodes (29): AnswerSessionProps, createTaskApi(), kindOf(), post(), TaskApi, buildAttempt(), BuildAttemptInput, saveTaskAttempt() (+21 more)

### Community 86 - "11. Контекст для PA «Контекст»"
Cohesion: 0.29
Nodes (7): 11.1 Формат ответа (ответ на OQ-16), 11.2 Задание, 11.3 Факторы (детерминированно, для бычьей модели; медвежья — зеркально), 11.4 Значимость (решение), 11.5 Оценка, 11.6 Генерация, 11. Контекст для PA «Контекст»

### Community 87 - "14. Challenge: эталон, оценка качества, WAIT, лимиты"
Cohesion: 0.33
Nodes (6): 14.2 Эталонная сторона `refSide`, 14.3 Оценка качества 0–100 (ответ на OQ-08), независимо от исхода, 14.4 Правильность, вердикт, лимиты, 14.5 Предикаты причин (`ReasonCode`, состав без изменений), 14.6 Подсказки (easy), 14. Challenge: эталон, оценка качества, WAIT, лимиты

### Community 88 - "1. Общие соглашения"
Cohesion: 0.33
Nodes (6): 1.1 Входные свечи, 1.3 ATR, 1.4 Детерминизм и числа, 1.5 ALGO_VERSION, 1.6 Параметры по сложностям (сводка), 1. Общие соглашения

### Community 89 - "5. Тренд, BOS и CHoCH"
Cohesion: 0.33
Nodes (6): 5.1 Общие правила, 5.2 Внешний слой — машина состояний с защищёнными уровнями, 5.3 Внутренний слой — «последний подтверждённый swing», 5.4 Что происходит после CHoCH, 5.5 Граничные случаи (проверены на реальных свечах), 5. Тренд, BOS и CHoCH

### Community 90 - "src/types.ts"
Cohesion: 0.21
Nodes (21): Core, GradeResultApi, 19. Расхождения с документами, ChallengeGrade, FeedbackBlock, FeedbackInput, OkItem, ContextGrade (+13 more)

### Community 91 - "3. Внешняя и внутренняя структура"
Cohesion: 0.40
Nodes (5): 3.1 Правило (решение), 3.2 Дедупликация, 3.3 Сигнатура `analyzeStructure`, 3.4 Отображение в `Mark` (общая модель `ARCHITECTURE.md` §4.2), 3. Внешняя и внутренняя структура

### Community 92 - "package.json"
Cohesion: 0.12
Nodes (21): devDependencies, eslint@^9.39.0, eslint-config-next@^16.0.0, @eslint/js@^9.39.0, @playwright/test@1.63.0, prettier@^3.6.0, @types/node@^22.0.0, typescript@~5.9.3 (+13 more)

### Community 93 - "quality.ts"
Cohesion: 0.14
Nodes (18): Side, ChallengeAnswerInput, dirOf(), gradeChallenge(), lastEventText(), lastInternal(), protectedLevel(), reasonScore() (+10 more)

### Community 94 - "patterns.ts"
Cohesion: 0.17
Nodes (21): c(), 1.2 Термины свечи, 9.1 Состав (ответ на OQ-11), 9.2 Критерии (ATR = ATR14 последней свечи модели, если не сказано иное; модель не ищется при ATR = null или `range == 0`), 9.3 Выход, 9.4 Проверенные примеры (BTCUSDT 4h 2026-09, GS-5), 9. Свечные модели Price Action (`detectPatterns`), body() (+13 more)

### Community 95 - "7. Order Block"
Cohesion: 0.50
Nodes (4): 7.1 Определение (решение, ICT: «последняя противоположная свеча перед импульсом, сломавшим структуру»), 7.2 Статус (после свечи события `k`, по закрытым свечам), 7.3 Сигнатура, 7. Order Block

### Community 97 - "pa/index.ts"
Cohesion: 0.19
Nodes (18): ContextAnswer, ContextReference, ContextTaskPick, FindPatternPick, LevelTaskPick, DEFAULT_LEVEL_PARAMS, findLevels(), gradeLevel() (+10 more)

### Community 98 - "history/route.ts"
Cohesion: 0.13
Nodes (15): dynamic, errorResponse(), GET(), ISSUE_CODES, querySchema, runtime, SYMBOLS, call() (+7 more)

### Community 99 - "6. Внешние API Binance"
Cohesion: 0.40
Nodes (5): status(), 6.1 REST: `GET https://fapi.binance.com/fapi/v1/klines` (браузер), 6.2 WebSocket: kline stream (браузер), 6.3 Архив data.binance.vision (сервер), 6. Внешние API Binance

### Community 100 - "12. `gradeMarks` — сравнение разметки"
Cohesion: 0.22
Nodes (9): 12.1 Сигнатура (расширение `API_CONTRACTS.md`), 12.2 Ключевая свеча метки, 12.3 Группы сопоставления, 12.4 Совместимость и стоимость пары, 12.5 Матчинг (решение: DP по времени вместо венгерского), 12.6 Классификация после матчинга, 12.7 Счёт, вердикт, навыки, 12.8 Пример AC-07 на реальных данных (GS-1) (+1 more)

### Community 101 - "sessionStore.ts"
Cohesion: 0.16
Nodes (18): buildAnswer(), defaultLevels(), formatRR(), PositionIssue, reasonsFor(), RiskReward, riskReward(), roundToTick() (+10 more)

### Community 102 - "Стратегия тестирования — Trading Lab"
Cohesion: 0.11
Nodes (18): 10. Производительность, 1. Принципы, 2. Пирамида, 3. Фикстуры, 4.1 Инвариант агрегации таймфреймов, 4.2 `sliceAt(series, T)`, 4.3 Нормализация (`market-data`), 4.4 Golden-тесты SMC/PA (+10 more)

### Community 103 - "data/streak.test.ts"
Cohesion: 0.43
Nodes (4): DayStat, prevDay(), softStreak(), done

### Community 104 - "adapters.ts"
Cohesion: 0.19
Nodes (17): MsMarkBody(), PaFindBody(), impliedDirection(), keepSingleLevel(), levelPrice(), msMarkAnswer(), paFindAnswer(), paLevelAnswer() (+9 more)

### Community 105 - "ADR-0008: Local-first хранилище за интерфейсом Repository; Supabase в M7"
Cohesion: 0.29
Nodes (6): ADR-0008: Local-first хранилище за интерфейсом Repository; Supabase в M7, Контекст, Открытые вопросы, Последствия, Рассмотренные альтернативы, Решение

### Community 106 - "context.ts"
Cohesion: 0.14
Nodes (19): reconstructContext(), computeContext(), CONTEXT_STRUCTURE, ContextEvidence, ContextFactorAnswer, externalSwings(), gradeContext(), HTF_OF (+11 more)

### Community 107 - "templates.ru.ts"
Cohesion: 0.22
Nodes (17): block(), buildFeedback(), glyphOf(), OK_BY_SKILL, okFromOutcomes(), ERROR_SKILLS, ERROR_TEMPLATES_RU, ErrorTemplate (+9 more)

### Community 108 - "@playwright/test"
Cohesion: 0.19
Nodes (11): DATE_LEAK, lastCandleTime(), num(), openReasons(), projectPoint(), SESSION_URL(), startSession(), submitDecision() (+3 more)

### Community 109 - "PaContextBody.tsx"
Cohesion: 0.21
Nodes (13): Page(), HTF, PaContextBody(), Row(), YN, yn, PaLevelBody(), PaSessionScreen() (+5 more)

### Community 110 - "6. Liquidity sweep"
Cohesion: 0.40
Nodes (5): 6.1 Определение (решение), 6.2 Несколько уровней за одну свечу, 6.3 Граничные случаи, 6.4 Сигнатура, 6. Liquidity sweep

### Community 111 - "runCheck.ts"
Cohesion: 0.15
Nodes (14): CheckPanelProps, CheckOutcome, CheckResult, CheckState, CONCEPT_OF, conceptsFor(), runCheck(), algoMarks (+6 more)

### Community 112 - "ArchiveSource"
Cohesion: 0.23
Nodes (3): ArchiveLoader, ArchiveSource, ArchiveError

### Community 113 - "MsQuestionBody.tsx"
Cohesion: 0.26
Nodes (11): highlightMarks(), MsQuestionBody(), msQuestionAnswer(), AnswerList(), fmtNum(), fmtTime(), msConceptTask, msQuestionText() (+3 more)

### Community 114 - "grade.test.ts"
Cohesion: 0.18
Nodes (8): algoOf(), ALL, at(), candles, findAlgo(), P, r, window

### Community 115 - "SessionLayout.tsx"
Cohesion: 0.22
Nodes (8): csp, nextConfig, SessionLayoutProps, SHEET_PAD, TaskHintProps, subscribe(), useIsDesktop(), next

### Community 116 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, check:tokens, dev, format, lint, sync:tokens, test (+2 more)

### Community 117 - "16. Навыки и прогресс"
Cohesion: 0.50
Nodes (4): 16.1 Навыки, 16.2 Обновление точности, 16.3 Адаптивная подборка, 16. Навыки и прогресс

### Community 118 - "challenge/generate.ts"
Cohesion: 0.31
Nodes (9): buildHints(), DEFAULT_TFS, HTF, meetsDifficulty(), pickChallengeScenario(), tail(), ADR-0006, gaps() (+1 more)

### Community 119 - "session/types.ts"
Cohesion: 0.36
Nodes (8): MsMarkPayload, MsQuestionPayload, PaContextPayload, PaFindPayload, PaLevelPayload, TaskErrorKind, TaskPayload, TaskPayloadBase

### Community 120 - "ms.helpers.ts"
Cohesion: 0.53
Nodes (6): checkAndSeeResult(), nextThenHomeShowsDone(), openSession(), shot(), tapCandle(), chartBox()

### Community 121 - "challenge/generate.test.ts"
Cohesion: 0.22
Nodes (7): TIME_LIMIT_CANDLES, c15, c4h, h1, MIN, src15, src4h

### Community 122 - "placeholders.test.ts"
Cohesion: 0.22
Nodes (8): algo, ALL, candles, FLIP, mutate(), P, r, window

### Community 124 - "stats.ts"
Cohesion: 0.43
Nodes (4): ChallengeStats, computeChallengeStats(), sideOf(), waitCorrectOf()

### Community 125 - "aggregate.ts"
Cohesion: 0.47
Nodes (4): aggregate(), SeriesByTf, synthetic_hour(), synthetic_m1()

### Community 126 - "17. Шаблоны разбора (источник `src/i18n/ru/feedback`)"
Cohesion: 0.40
Nodes (5): 17.1 Структура и ключи, 17.2 Верность и общие принципы, 17.3 Что понято верно (`OkCode`; новые помечены *), 17.4 Ошибки (части 3–6), 17. Шаблоны разбора (источник `src/i18n/ru/feedback`)

### Community 127 - "18. Golden-тесты"
Cohesion: 0.50
Nodes (4): 18.1 Формат и процесс, 18.2 Участки, 18.3 Что ещё размечается после утверждения (M4/M5), 18. Golden-тесты

### Community 128 - "fixtures"
Cohesion: 0.50
Nodes (3): fixtures, recorded/ - записанные форматы API (fapi/fstream недоступны из облака, 451), Архивные CSV

## Knowledge Gaps
- **12 isolated node(s):** `ADR-0007`, `ADR-0006`, `ADR-0005`, `ADR-0005`, `../../tsconfig.base.json` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 890 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Mark` connect `core/src/index.ts` to `Repository`, `terminal.helpers.ts`, `TerminalScreen.tsx`, `UtcMs`, `hit.ts`, `Candle`, `rules.ts`, `panels.tsx`, `DrawingPrimitive.ts`, `TradingChart`, `marks.ts`, `params.ts`, `tasks.ts`, `MarkSession.tsx`, `grade.ts`, `screens.test.tsx`, `Swing`, `handlers.test.ts`, `facts.ts`, `TaskSession.tsx`, `1. Общие соглашения`, `src/types.ts`, `3. Внешняя и внутренняя структура`, `pa/index.ts`, `adapters.ts`, `context.ts`, `runCheck.ts`, `MsQuestionBody.tsx`, `grade.test.ts`, `challenge/generate.ts`, `session/types.ts`, `placeholders.test.ts`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `UtcMs` (e.g. with `1. Общие соглашения` and `4.1 Шкала задания`) actually correct?**
  _`UtcMs` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0007`, `ADR-0006`, `ADR-0005` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `market-structure.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14919354838709678 - nodes in this community are weakly interconnected._
- **Why does `Candle` connect `Candle` to `market-structure.ts`, `UtcMs`, `resolve.ts`, `hit.ts`, `grade.test.ts`, `src/types.ts`, `rules.ts`, `DrawingPrimitive.ts`, `pa/generate.ts`, `TimeIndex`, `TradingChart`, `useMarketData.ts`, `params.ts`, `tasks.ts`, `MarkSession.tsx`, `archive.ts`, `core/src/index.ts`, `normalize.ts`, `live.test.ts`, `sources.ts`, `Swing`, `handlers.test.ts`, `facts.ts`, `patterns.ts`, `TaskSession.tsx`, `src/types.ts`, `patterns.ts`, `pa/index.ts`, `6. Внешние API Binance`, `context.ts`, `runCheck.ts`, `ArchiveSource`, `challenge/generate.ts`, `session/types.ts`, `challenge/generate.test.ts`, `aggregate.ts`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Mark` (e.g. with `Контекст` and `Последствия`) actually correct?**
  _`Mark` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Should `Repository` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._