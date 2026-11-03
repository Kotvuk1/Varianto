# Graph Report - Varianto  (2026-11-03)

## Corpus Check
- 348 files · ~181,566 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 32 file(s) not represented in the graph (top: .csv 26, (none) 4, .example 1)

## Summary
- 2446 nodes · 6533 edges · 120 communities (114 shown, 6 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 172 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bae2aef4`
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
- ChallengeSession.tsx
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
- handlers.test.ts
- LAYOUTS — Trading Lab
- 2. Компоненты
- DESIGN — Trading Lab
- COPY — микрокопия Trading Lab
- check_tokens.py
- web/package.json
- AppShell.tsx
- rules.ts
- reveal.ts
- DrawingPrimitive.ts
- pa/generate.ts
- TimeIndex
- TradingChart
- marks.ts
- useMarketData.ts
- params.ts
- tasks.ts
- Mark
- react
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
- Candle
- screens.test.tsx
- ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`
- sessionStore.ts
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
- challenge/api.ts
- patterns.ts
- 7. Order Block
- web/AGENTS.md
- ChallengeSession
- history/route.ts
- 6. Внешние API Binance
- 12. `gradeMarks` — сравнение разметки
- sessionStore.ts
- Стратегия тестирования — Trading Lab
- data/streak.test.ts
- 10. `findLevels` — уровни поддержки/сопротивления
- ADR-0008: Local-first хранилище за интерфейсом Repository; Supabase в M7
- templates.ru.ts
- @playwright/test
- adapters.ts
- 6. Liquidity sweep
- runCheck.ts
- MsMarkBody.tsx
- States.tsx
- scripts
- 16. Навыки и прогресс
- challenge/generate.ts
- ms.helpers.ts
- placeholders.test.ts
- ChallengeHome.tsx
- fixtures

## God Nodes (most connected - your core abstractions)
1. `Candle` - 89 edges
2. `UtcMs` - 79 edges
3. `Mark` - 79 edges
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
- `14.1 Факты на момент T (`ChallengeFacts`)` --references--> `ChallengeFacts`  [INFERRED]
  docs/specs/ALGORITHMS.md → packages/core/src/challenge/facts.ts

## Import Cycles
- 2-file cycle: `packages/core/src/candles/aggregate.ts -> packages/core/src/index.ts -> packages/core/src/candles/aggregate.ts`

## Communities (120 total, 6 thin omitted)

### Community 0 - "market-structure.ts"
Cohesion: 0.13
Nodes (29): gradeMsMark(), markGradeOf(), atrAt(), buildMsQuestion(), CONCEPTS, generateMsQuestion(), gradeMsQuestion(), meetsMsCriteria() (+21 more)

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
Cohesion: 0.19
Nodes (22): Page(), Page(), EmptyState(), ErrorState(), LoadingRows(), LearnScreen(), MODULES, WeakSpots() (+14 more)

### Community 5 - "with"
Cohesion: 0.08
Nodes (26): runs-on, steps, GITHUB_TOKEN, jobs, check, secrets-scan, name, on (+18 more)

### Community 6 - "Architecture — Trading Lab"
Cohesion: 0.11
Nodes (19): 10. Развёртывание, 11. Риски, 1. Ключевые ограничения, определяющие архитектуру, 2. Обзор, 3. Репозиторий (pnpm monorepo), 4.1 Синхронизация таймфреймов, 4.2 Разметка (общая модель для пользователя и алгоритма), 4.3 Алгоритмы (детерминированные, версионируемые) (+11 more)

### Community 7 - "2. Карточки"
Cohesion: 0.11
Nodes (17): 1. Сводка, 2. Карточки, 3. Правила оркестрации, 4. Формат отчёта агента (до 15 строк), 5. Шаблон задания агенту, Backend Developer, Chart Developer, DevOps/Security Engineer (+9 more)

### Community 8 - "TerminalScreen.tsx"
Cohesion: 0.07
Nodes (51): TerminalPage(), anchor, KINDS, MARKS_FORMAT_VERSION, markSchema, parseMarks(), serializeMarks(), m (+43 more)

### Community 9 - "market-data/package.json"
Cohesion: 0.11
Nodes (20): dependencies, fflate@^0.8.3, @tl/core@workspace:*, devDependencies, vitest@^4.1.12, @vitest/coverage-v8@^4.1.12, exports, ./archive (+12 more)

### Community 10 - "UtcMs"
Cohesion: 0.13
Nodes (18): DailyActivityRow, SkillStatRow, TerminalMarksRow, TradingLabDB, defaultSettings(), LocalRepository, mark, Attempt (+10 more)

### Community 11 - "ChallengeSession.tsx"
Cohesion: 0.15
Nodes (10): decimalsForTick(), makePriceFormatter(), TICK_TABLE, tickSizeFor(), external(), selectHints(), time(), fmtOf() (+2 more)

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
Cohesion: 0.10
Nodes (32): ReasonsSheet(), Badge(), BadgeProps, BottomSheet(), BottomSheetProps, HEIGHT, SheetHeight, Harness() (+24 more)

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
Cohesion: 0.15
Nodes (16): AggTrade, done(), FutureProvider, Hit, Position, priceHits(), resolveTrade(), rOf() (+8 more)

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
Nodes (34): distToRectEdge(), distToSegment(), Hit, hitTest(), inside(), partScore(), geos(), synthetic_proj (+26 more)

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
Nodes (37): ADR-0001: Next.js 16 + TypeScript strict, pnpm monorepo, Vercel, Контекст, Последствия, Рассмотренные альтернативы, Решение, ADR-0003: Живые данные грузит браузер напрямую (REST + WS), fallback — REST-polling, Контекст, Последствия (+29 more)

### Community 29 - "misc.test.tsx"
Cohesion: 0.15
Nodes (13): @testing-library/react@^16.0.0, @testing-library/user-event@^14.6.8, SetupFieldProps, Trigger(), USED, Segmented(), SegmentedOption, SegmentedProps (+5 more)

### Community 30 - "Candle"
Cohesion: 0.20
Nodes (18): AnswerInput, ChallengeAnswerBody, SessionState, ChallengeDetailDto, ChallengeGradeResult, ChallengeOutcomeDto, ChallengePayload, ChallengeTaskEnvelope (+10 more)

### Community 31 - "features/feedback/index.ts"
Cohesion: 0.17
Nodes (19): errors, feedback, defaultFmt, FeedbackView(), FeedbackViewProps, Section(), DIR, formatParam() (+11 more)

### Community 32 - "fetch-fixtures.mjs"
Cohesion: 0.06
Nodes (42): accuracyOf(), applyOutcome(), FOCUS_SIZE, generatorForSkill(), isEnoughData(), isOutcomeOk(), MIN_SAMPLE, MIN_WEIGHT (+34 more)

### Community 33 - "grade.test.ts"
Cohesion: 0.09
Nodes (24): algoOf(), ALL, at(), candles, findAlgo(), P, r, window (+16 more)

### Community 34 - "token.ts"
Cohesion: 0.11
Nodes (25): ApiErrorCode, ConfigError, ValidationIssue, b64(), derive(), getSigningSecret(), HeaderSchema, keyCache (+17 more)

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
Cohesion: 0.11
Nodes (45): 2.1 Из `ARCHITECTURE.md` §4 (дословно), Решение, 18.2 Участки, golden/ - эталонные участки SMC (ALGORITHMS §18), PoiInfo, findLevels(), allSwingsMap, AnalyzeOptions (+37 more)

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
Nodes (39): dependencies, dexie@^4.0.0, lightweight-charts@~5.2.1, lucide-react@^1.66.0, next@^16.0.0, react@^19.0.0, react-dom@^19.0.0, @tl/core@workspace:* (+31 more)

### Community 52 - "AppShell.tsx"
Cohesion: 0.23
Nodes (13): metadata, plexMono, plexSans, RootLayout(), viewport, AppShell(), BottomTabs(), DesktopTabs() (+5 more)

### Community 53 - "rules.ts"
Cohesion: 0.16
Nodes (24): normalizeMark(), better(), BreakResult, clampIdx(), Direction, extreme(), FvgResult, isPivot() (+16 more)

### Community 54 - "reveal.ts"
Cohesion: 0.14
Nodes (18): AxisTick, axisTicks(), relativeDuration(), relativeLabel(), STEPS, T, partMax(), ResultView() (+10 more)

### Community 55 - "DrawingPrimitive.ts"
Cohesion: 0.09
Nodes (27): DrawingPrimitive, OpenCandleInfo, PrimitiveState, ZONE_KINDS, PointerKind, MarkState, lwcProjection(), PointerInput (+19 more)

### Community 56 - "pa/generate.ts"
Cohesion: 0.09
Nodes (53): buildPa(), reconstructContext(), computeContext(), CONTEXT_STRUCTURE, ContextAnswer, ContextEvidence, ContextFactorAnswer, ContextReference (+45 more)

### Community 57 - "TimeIndex"
Cohesion: 0.13
Nodes (13): snapAnchor(), SnapOptions, snapPriceToCandle(), synthetic_candles, T0, T0, TimeIndex, defaultLogicalRange() (+5 more)

### Community 58 - "TradingChart"
Cohesion: 0.12
Nodes (16): DrawingController, bosMark, breakIdx, drag(), index, lvl, proj, pt() (+8 more)

### Community 59 - "marks.ts"
Cohesion: 0.24
Nodes (16): allLayerSwings(), buildAlgoMarkSet(), conceptOf(), endTimeOf(), eventMark(), fvgMark(), IndexWindow, KIND_CONCEPT (+8 more)

### Community 60 - "useMarketData.ts"
Cohesion: 0.24
Nodes (12): archiveWindow(), appendCandle(), ArchiveHttpError, DataStatus, fetchArchive(), LoadError, MarketState, toLoadError() (+4 more)

### Community 61 - "params.ts"
Cohesion: 0.13
Nodes (30): Page(), Page(), MsSetup(), PaSetup(), CommonFields(), SHORT, CommonParams, Get (+22 more)

### Community 62 - "tasks.ts"
Cohesion: 0.10
Nodes (41): ApiError, validationError(), readJsonBody(), cutoffOf(), floorTo(), futureProviderFor(), loadClosedBefore(), buildChallenge() (+33 more)

### Community 63 - "Mark"
Cohesion: 0.10
Nodes (33): constrainAnchors(), createMark(), DrawKind, FULL_WIDTH_KINDS, isDrawKind(), MarkExtra, RAY_RIGHT_KINDS, SWING_SIDE (+25 more)

### Community 64 - "react"
Cohesion: 0.16
Nodes (27): countsFromGrade(), AsideSection(), InputMessage(), RadioOption, SubmitButton(), AnswerSession(), MarkSession(), ResultBody() (+19 more)

### Community 65 - "archive.ts"
Cohesion: 0.15
Nodes (14): AGG_TRADES_HEADER, AggTrade, ARCHIVE_BASE_URL, ArchiveFetch, ArchiveFileSpec, ArchiveSource, ArchiveSourceOptions, archiveUrl() (+6 more)

### Community 66 - "core/src/index.ts"
Cohesion: 0.13
Nodes (12): dynamic, GET(), cs, index, synthetic_rows, T0, aggregate(), SeriesByTf (+4 more)

### Community 67 - "README.md"
Cohesion: 0.12
Nodes (10): MVP, Roadmap — Trading Lab, v1.1 — Fibonacci Playground и Premium/Discount, v1.2 — Elliott Wave Lab, v2, Правила корректировки, Trading Lab, Документация (+2 more)

### Community 68 - "frontend-developer.md"
Cohesion: 0.29
Nodes (6): graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 69 - "grade.ts"
Cohesion: 0.21
Nodes (15): Entry, gradeMarks(), Group, groupEvaluated(), groupOf(), iou(), MAJOR, patternSkill() (+7 more)

### Community 70 - "schemas.ts"
Cohesion: 0.10
Nodes (21): AnchorSchema, AnswerSchema, BUSINESS_CODES, ChallengeAnswer, difficulty, GradeRequest, MARK_KINDS, marksField (+13 more)

### Community 72 - "13. Генерация заданий"
Cohesion: 0.33
Nodes (6): 13.1 Общие правила, 13.2 Market Structure «Разметка», 13.3 Market Structure «Вопрос», 13.4 Price Action, 13.5 Challenge, 13. Генерация заданий

### Community 73 - "Settings"
Cohesion: 0.13
Nodes (18): buildAttempt(), localDay(), 1. Принципы, 2. Локальная схема: IndexedDB (Dexie), 3.1 RLS, 3. Схема Supabase Postgres (M7), 4.1 Порядок, 4.2 Правила по таблицам (идемпотентность по `id`, конфликты по `updated_at`) (+10 more)

### Community 74 - "normalize.ts"
Cohesion: 0.16
Nodes (18): TIMEFRAME_MS, load(), klinesZip(), NOW, Served, zipOf(), ARCHIVE_KLINE_HEADER, num() (+10 more)

### Community 75 - "8. FVG (Fair Value Gap)"
Cohesion: 0.50
Nodes (4): 8.1 Определение, 8.2 Заполнение, 8.3 Сигнатура, 8. FVG (Fair Value Gap)

### Community 76 - "live.test.ts"
Cohesion: 0.07
Nodes (28): BINANCE_REST_BASE, BINANCE_WS_BASE, binanceInterval(), FetchKlinesOptions, LiveErrorCode, LiveFeed, LiveFeedError, LiveFeedOptions (+20 more)

### Community 77 - "Candle"
Cohesion: 0.09
Nodes (29): FixtureLoader, ARCHIVE_START, ArchiveLoader, ArchiveLoaderOptions, CandleLoader, CHALLENGE_FUTURE_MS, ChallengeZone, Chunk (+21 more)

### Community 78 - "screens.test.tsx"
Cohesion: 0.13
Nodes (26): Page(), wrap(), CANDLE_OPTIONS, DAILY_GOAL_MAX, DAILY_GOAL_MIN, SettingsScreen(), THEME_OPTIONS, Providers() (+18 more)

### Community 79 - "ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`"
Cohesion: 0.20
Nodes (9): 15. `resolveTrade` (ADR-0007, уточнения), 18.1 Формат и процесс, 18.3 Что ещё размечается после утверждения (M4/M5), 18. Golden-тесты, 20. Спорные места и вопросы оркестратору, 4.1 Правило, 4.2 Граничные случаи, 4. Метки HH / HL / LH / LL (+1 more)

### Community 80 - "sessionStore.ts"
Cohesion: 0.21
Nodes (10): atrOf(), createSessionStore(), INITIAL, Phase, SessionStore, Speed, SPEEDS, candle() (+2 more)

### Community 81 - "handlers.test.ts"
Cohesion: 0.11
Nodes (25): dynamic, maxDuration, POST(), runtime, dynamic, maxDuration, POST(), runtime (+17 more)

### Community 82 - "facts.ts"
Cohesion: 0.08
Nodes (43): age(), CHALLENGE_STRUCTURE, ChallengeFacts, computeChallengeFacts(), FactsInput, HTF, intersects(), lastEventSince() (+35 more)

### Community 83 - "patterns.ts"
Cohesion: 0.12
Nodes (12): c4h, FIX, c4h, all, at(), c4h, idx(), ts() (+4 more)

### Community 84 - "PRD — Trading Lab"
Cohesion: 0.05
Nodes (41): 10. Приоритизация функций (MoSCoW), 11. План MVP, 12. Открытые вопросы, 1.1 Что это, 1.2 Цель, 1.3 Целевой пользователь, 1.4 Модули, 1. Обзор и цель продукта (+33 more)

### Community 85 - "TaskSession.tsx"
Cohesion: 0.16
Nodes (24): AnswerSessionProps, createTaskApi(), kindOf(), post(), TaskApi, buildAttempt(), BuildAttemptInput, saveTaskAttempt() (+16 more)

### Community 86 - "11. Контекст для PA «Контекст»"
Cohesion: 0.29
Nodes (7): 11.1 Формат ответа (ответ на OQ-16), 11.2 Задание, 11.3 Факторы (детерминированно, для бычьей модели; медвежья — зеркально), 11.4 Значимость (решение), 11.5 Оценка, 11.6 Генерация, 11. Контекст для PA «Контекст»

### Community 87 - "14. Challenge: эталон, оценка качества, WAIT, лимиты"
Cohesion: 0.29
Nodes (7): 14.1 Факты на момент T (`ChallengeFacts`), 14.2 Эталонная сторона `refSide`, 14.3 Оценка качества 0–100 (ответ на OQ-08), независимо от исхода, 14.4 Правильность, вердикт, лимиты, 14.5 Предикаты причин (`ReasonCode`, состав без изменений), 14.6 Подсказки (easy), 14. Challenge: эталон, оценка качества, WAIT, лимиты

### Community 88 - "1. Общие соглашения"
Cohesion: 0.22
Nodes (9): c(), 1.1 Входные свечи, 1.2 Термины свечи, 1.3 ATR, 1.4 Детерминизм и числа, 1.5 ALGO_VERSION, 1.6 Параметры по сложностям (сводка), 1. Общие соглашения (+1 more)

### Community 89 - "5. Тренд, BOS и CHoCH"
Cohesion: 0.33
Nodes (6): 5.1 Общие правила, 5.2 Внешний слой — машина состояний с защищёнными уровнями, 5.3 Внутренний слой — «последний подтверждённый swing», 5.4 Что происходит после CHoCH, 5.5 Граничные случаи (проверены на реальных свечах), 5. Тренд, BOS и CHoCH

### Community 90 - "src/types.ts"
Cohesion: 0.21
Nodes (20): Core, GradeResultApi, 5.2 `Feedback` (6 частей, FR-FB-02), 17.1 Структура и ключи, 17.2 Верность и общие принципы, 17.3 Что понято верно (`OkCode`; новые помечены *), 17.4 Ошибки (части 3–6), 17. Шаблоны разбора (источник `src/i18n/ru/feedback`) (+12 more)

### Community 91 - "3. Внешняя и внутренняя структура"
Cohesion: 0.40
Nodes (5): 3.1 Правило (решение), 3.2 Дедупликация, 3.3 Сигнатура `analyzeStructure`, 3.4 Отображение в `Mark` (общая модель `ARCHITECTURE.md` §4.2), 3. Внешняя и внутренняя структура

### Community 92 - "package.json"
Cohesion: 0.12
Nodes (21): devDependencies, eslint@^9.39.0, eslint-config-next@^16.0.0, @eslint/js@^9.39.0, @playwright/test@1.63.0, prettier@^3.6.0, @types/node@^22.0.0, typescript@~5.9.3 (+13 more)

### Community 93 - "challenge/api.ts"
Cohesion: 0.25
Nodes (7): ChallengeApiError, ChallengeErrorKind, fetchNext(), gradeChallenge(), kindOf(), post(), toError()

### Community 94 - "patterns.ts"
Cohesion: 0.21
Nodes (18): 9.1 Состав (ответ на OQ-11), 9.3 Выход, 9.4 Проверенные примеры (BTCUSDT 4h 2026-09, GS-5), 9. Свечные модели Price Action (`detectPatterns`), body(), bodyBottom(), bodyTop(), detectPatterns() (+10 more)

### Community 95 - "7. Order Block"
Cohesion: 0.50
Nodes (4): 7.1 Определение (решение, ICT: «последняя противоположная свеча перед импульсом, сломавшим структуру»), 7.2 Статус (после свечи события `k`, по закрытым свечам), 7.3 Сигнатура, 7. Order Block

### Community 97 - "ChallengeSession"
Cohesion: 0.22
Nodes (8): ChallengeSessionPage(), ChallengeSession(), useDesktop(), hitText(), ReplayBar(), isTaskTf(), TASK_TFS, TF_LABEL

### Community 98 - "history/route.ts"
Cohesion: 0.09
Nodes (19): dynamic, errorResponse(), GET(), ISSUE_CODES, querySchema, runtime, SYMBOLS, call() (+11 more)

### Community 99 - "6. Внешние API Binance"
Cohesion: 0.40
Nodes (5): status(), 6.1 REST: `GET https://fapi.binance.com/fapi/v1/klines` (браузер), 6.2 WebSocket: kline stream (браузер), 6.3 Архив data.binance.vision (сервер), 6. Внешние API Binance

### Community 100 - "12. `gradeMarks` — сравнение разметки"
Cohesion: 0.22
Nodes (9): 12.1 Сигнатура (расширение `API_CONTRACTS.md`), 12.2 Ключевая свеча метки, 12.3 Группы сопоставления, 12.4 Совместимость и стоимость пары, 12.5 Матчинг (решение: DP по времени вместо венгерского), 12.6 Классификация после матчинга, 12.7 Счёт, вердикт, навыки, 12.8 Пример AC-07 на реальных данных (GS-1) (+1 more)

### Community 101 - "sessionStore.ts"
Cohesion: 0.24
Nodes (16): blockerKey(), DecisionPanel(), ErrorBlock(), errorCopy(), PriceField(), buildAnswer(), defaultLevels(), formatRR() (+8 more)

### Community 102 - "Стратегия тестирования — Trading Lab"
Cohesion: 0.11
Nodes (18): 10. Производительность, 1. Принципы, 2. Пирамида, 3. Фикстуры, 4.1 Инвариант агрегации таймфреймов, 4.2 `sliceAt(series, T)`, 4.3 Нормализация (`market-data`), 4.4 Golden-тесты SMC/PA (+10 more)

### Community 103 - "data/streak.test.ts"
Cohesion: 0.29
Nodes (6): DayStat, prevDay(), softStreak(), done, DailyProgress, MIN_SAMPLE

### Community 104 - "10. `findLevels` — уровни поддержки/сопротивления"
Cohesion: 0.67
Nodes (4): 10.1 Алгоритм, 10.2 Эталон для «Проведи уровень», 10. `findLevels` — уровни поддержки/сопротивления, touches()

### Community 105 - "ADR-0008: Local-first хранилище за интерфейсом Repository; Supabase в M7"
Cohesion: 0.29
Nodes (6): ADR-0008: Local-first хранилище за интерфейсом Repository; Supabase в M7, Контекст, Открытые вопросы, Последствия, Рассмотренные альтернативы, Решение

### Community 107 - "templates.ru.ts"
Cohesion: 0.18
Nodes (21): block(), buildFeedback(), glyphOf(), OK_BY_SKILL, okFromOutcomes(), CHALLENGE_VERDICT_TEMPLATES_RU, ERROR_SKILLS, ERROR_TEMPLATES_RU (+13 more)

### Community 108 - "@playwright/test"
Cohesion: 0.19
Nodes (11): DATE_LEAK, lastCandleTime(), num(), openReasons(), projectPoint(), SESSION_URL(), startSession(), submitDecision() (+3 more)

### Community 109 - "adapters.ts"
Cohesion: 0.11
Nodes (33): Page(), HTF, PaContextBody(), Row(), YN, yn, PaFindBody(), PaLevelBody() (+25 more)

### Community 110 - "6. Liquidity sweep"
Cohesion: 0.40
Nodes (5): 6.1 Определение (решение), 6.2 Несколько уровней за одну свечу, 6.3 Граничные случаи, 6.4 Сигнатура, 6. Liquidity sweep

### Community 111 - "runCheck.ts"
Cohesion: 0.14
Nodes (16): CheckPanel(), CheckPanelProps, subscribe(), useDesktop(), CheckOutcome, CheckResult, CheckState, CONCEPT_OF (+8 more)

### Community 113 - "MsMarkBody.tsx"
Cohesion: 0.16
Nodes (20): Page(), MsMarkBody(), highlightMarks(), MsQuestionBody(), MsSessionScreen(), msQuestionAnswer(), AnswerList(), msBody() (+12 more)

### Community 115 - "States.tsx"
Cohesion: 0.24
Nodes (8): csp, nextConfig, ChartSkeleton(), copyFor(), TaskError(), TaskErrorProps, TaskSession(), next

### Community 116 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, check:tokens, dev, format, lint, sync:tokens, test (+2 more)

### Community 117 - "16. Навыки и прогресс"
Cohesion: 0.50
Nodes (4): 16.1 Навыки, 16.2 Обновление точности, 16.3 Адаптивная подборка, 16. Навыки и прогресс

### Community 118 - "challenge/generate.ts"
Cohesion: 0.15
Nodes (16): buildHints(), DEFAULT_TFS, HTF, meetsDifficulty(), pickChallengeScenario(), tail(), c15, c4h (+8 more)

### Community 120 - "ms.helpers.ts"
Cohesion: 0.53
Nodes (6): checkAndSeeResult(), nextThenHomeShowsDone(), openSession(), shot(), tapCandle(), chartBox()

### Community 122 - "placeholders.test.ts"
Cohesion: 0.22
Nodes (8): algo, ALL, candles, FLIP, mutate(), P, r, window

### Community 124 - "ChallengeHome.tsx"
Cohesion: 0.12
Nodes (23): ChallengePage(), ChallengeHome(), DIFFS, recentLine(), StartTf, Stats(), TF_OPTIONS, RCurve() (+15 more)

### Community 128 - "fixtures"
Cohesion: 0.50
Nodes (3): fixtures, recorded/ - записанные форматы API (fapi/fstream недоступны из облака, 451), Архивные CSV

## Knowledge Gaps
- **12 isolated node(s):** `ADR-0007`, `ADR-0006`, `ADR-0005`, `ADR-0005`, `../../tsconfig.base.json` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 891 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Mark` connect `Mark` to `Repository`, `terminal.helpers.ts`, `TerminalScreen.tsx`, `UtcMs`, `ChallengeSession.tsx`, `hit.ts`, `Candle`, `grade.test.ts`, `src/types.ts`, `handlers.test.ts`, `rules.ts`, `DrawingPrimitive.ts`, `pa/generate.ts`, `TradingChart`, `marks.ts`, `params.ts`, `tasks.ts`, `react`, `core/src/index.ts`, `grade.ts`, `facts.ts`, `TaskSession.tsx`, `1. Общие соглашения`, `src/types.ts`, `3. Внешняя и внутренняя структура`, `adapters.ts`, `runCheck.ts`, `MsMarkBody.tsx`, `challenge/generate.ts`, `placeholders.test.ts`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `UtcMs` (e.g. with `1. Общие соглашения` and `4.1 Шкала задания`) actually correct?**
  _`UtcMs` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0007`, `ADR-0006`, `ADR-0005` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `market-structure.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1310483870967742 - nodes in this community are weakly interconnected._
- **Why does `Candle` connect `Candle` to `market-structure.ts`, `resolve.ts`, `Candle`, `grade.test.ts`, `src/types.ts`, `handlers.test.ts`, `rules.ts`, `DrawingPrimitive.ts`, `pa/generate.ts`, `TimeIndex`, `TradingChart`, `useMarketData.ts`, `params.ts`, `tasks.ts`, `Mark`, `react`, `archive.ts`, `core/src/index.ts`, `normalize.ts`, `live.test.ts`, `sessionStore.ts`, `facts.ts`, `patterns.ts`, `TaskSession.tsx`, `src/types.ts`, `patterns.ts`, `history/route.ts`, `6. Внешние API Binance`, `runCheck.ts`, `challenge/generate.ts`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Mark` (e.g. with `Контекст` and `Последствия`) actually correct?**
  _`Mark` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Should `Repository` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._