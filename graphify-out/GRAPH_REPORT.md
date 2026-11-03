# Graph Report - Varianto  (2026-11-03)

## Corpus Check
- 387 files · ~199,140 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 32 file(s) not represented in the graph (top: .csv 26, (none) 4, .example 1)

## Summary
- 2684 nodes · 7352 edges · 146 communities (136 shown, 10 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 191 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ac4331a2`
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
- progressLogic.ts
- market-data/package.json
- UtcMs
- toolGroups.tsx
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
- adapters.ts
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
- tasks.ts
- controller.ts
- MarkSession.tsx
- archive.ts
- core/src/index.ts
- README.md
- SupabaseRepository.ts
- grade.ts
- schemas.ts
- SessionActions
- 13. Генерация заданий
- Settings
- normalize.ts
- fetch-fixtures.mjs
- live.test.ts
- Candle
- screens.test.tsx
- ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`
- quality.ts
- handlers.test.ts
- facts.ts
- golden.pa-challenge.test.ts
- PRD — Trading Lab
- TaskSession.tsx
- 11. Контекст для PA «Контекст»
- 14. Challenge: эталон, оценка качества, WAIT, лимиты
- UtcMs
- 5. Тренд, BOS и CHoCH
- patterns.ts
- 3. Внешняя и внутренняя структура
- package.json
- ChallengeSession.tsx
- 1. Общие соглашения
- 7. Order Block
- web/AGENTS.md
- reveal.ts
- history/route.ts
- templates.ru.ts
- 12. `gradeMarks` — сравнение разметки
- sessionStore.ts
- Стратегия тестирования — Trading Lab
- DrawingPrimitive.ts
- SignInForm.tsx
- ref_vitest
- serialize.ts
- ApiError
- @playwright/test
- PaContextBody.tsx
- 6. Liquidity sweep
- TerminalScreen.tsx
- SessionLayout.tsx
- Query
- Команда агентов — Trading Lab
- Roadmap — Trading Lab
- scripts
- 16. Навыки и прогресс
- dependencies
- criteria.ts
- ms.helpers.ts
- SupabaseRepository
- data/streak.test.ts
- 4. Миграция локальных данных в Supabase при первом входе
- ChallengeHome.tsx
- runCheck.ts
- SettingsScreen.tsx
- InstructionBar.tsx
- fixtures
- buildFeedback
- 4. Функциональные требования
- AuthProvider.tsx
- 7. User Flows
- Подключение Supabase и Vercel (с телефона)
- @testing-library/react
- scripts
- lucide-react
- Mark
- FakeWs
- frontend-developer.md
- keepalive/route.test.ts
- ALGO_VERSION
- 3. Область продукта
- 8. FVG (Fair Value Gap)
- 1. Обзор и цель продукта
- vercel.json

## God Nodes (most connected - your core abstractions)
1. `Candle` - 91 edges
2. `Mark` - 83 edges
3. `UtcMs` - 79 edges
4. `react` - 71 edges
5. `TaskTimeframe` - 50 edges
6. `cn()` - 44 edges
7. `analyzeStructure()` - 44 edges
8. `Button()` - 36 edges
9. `LocalRepository` - 33 edges
10. `TradingChart()` - 32 edges

## Surprising Connections (you probably didn't know these)
- `4.2 Типы ответа (`Answer`)` --references--> `Answer`  [INFERRED]
  docs/API_CONTRACTS.md → apps/web/src/server/schemas.ts
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

## Communities (146 total, 10 thin omitted)

### Community 0 - "market-structure.ts"
Cohesion: 0.07
Nodes (56): pickSegment(), rngOf(), symbolFor(), algo, ALL, bad, candles, flat (+48 more)

### Community 1 - "Repository"
Cohesion: 0.07
Nodes (21): Repository, graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила, ADR-0008: Local-first хранилище за интерфейсом Repository; Supabase в M7 (+13 more)

### Community 2 - "terminal.helpers.ts"
Cohesion: 0.17
Nodes (23): Box, candlePoint(), chartCandles(), coreLevels(), coreMarks(), drawAlgoMark(), drawTwoPoint(), findVisibleBos() (+15 more)

### Community 3 - "API Contracts — Trading Lab"
Cohesion: 0.08
Nodes (26): status(), 1.1 Формат ошибки, 1.2 Заголовки кэша, 1. Общие соглашения, 2.2 Расширения контрактов (предложение — фиксируются при реализации в `@tl/core`), 2. Типы `@tl/core`, используемые в контрактах, 3.1 `GET /api/health`, 3.2 `GET /api/history` (+18 more)

### Community 4 - "ProgressScreen.tsx"
Cohesion: 0.16
Nodes (31): Page(), Page(), ErrorState(), LoadingRows(), ContinueBlock(), HomeWeakSpots(), LearnScreen(), MODULES (+23 more)

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
Cohesion: 0.09
Nodes (34): asCore(), avgQuality(), ErrorGroup, groupByModule(), MODULE_ORDER, ModuleGroup, moduleOfSkill(), selectFewData() (+26 more)

### Community 9 - "market-data/package.json"
Cohesion: 0.11
Nodes (20): dependencies, fflate@^0.8.3, @tl/core@workspace:*, devDependencies, vitest@^4.1.12, @vitest/coverage-v8@^4.1.12, exports, ./archive (+12 more)

### Community 10 - "UtcMs"
Cohesion: 0.13
Nodes (11): DailyActivityRow, SkillStatRow, TerminalMarksRow, TradingLabDB, defaultSettings(), LocalRepository, LocalSnapshot, mark (+3 more)

### Community 11 - "toolGroups.tsx"
Cohesion: 0.19
Nodes (16): GroupId, groupOf(), GROUPS, HOTKEY_OF, HOTKEYS, ic, MOBILE_GROUPS, TerminalTool (+8 more)

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
Nodes (30): SetupFieldProps, Badge(), BadgeProps, BottomSheet(), BottomSheetProps, HEIGHT, SheetHeight, buttonClass() (+22 more)

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
Cohesion: 0.13
Nodes (20): ADR-0007: Правила исхода сделки Challenge (drill-down), Контекст, Открытые вопросы (закрыты: `docs/specs/ALGORITHMS.md`), Последствия, Рассмотренные альтернативы, 10.1 Алгоритм, 10.2 Эталон для «Проведи уровень», 10. `findLevels` — уровни поддержки/сопротивления (+12 more)

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
Nodes (35): distToRectEdge(), distToSegment(), Hit, hitTest(), inside(), partScore(), geos(), synthetic_proj (+27 more)

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

### Community 29 - "adapters.ts"
Cohesion: 0.15
Nodes (22): Page(), MsMarkBody(), highlightMarks(), MsQuestionBody(), MsSessionScreen(), msQuestionAnswer(), AnswerList(), msBody() (+14 more)

### Community 30 - "Candle"
Cohesion: 0.18
Nodes (18): AnswerInput, ChallengeAnswerBody, SessionState, candle(), series, task, ChallengeDetailDto, ChallengeGradeResult (+10 more)

### Community 31 - "features/feedback/index.ts"
Cohesion: 0.16
Nodes (20): errors, feedback, defaultFmt, FeedbackView(), FeedbackViewProps, Section(), DIR, formatParam() (+12 more)

### Community 32 - "fetch-fixtures.mjs"
Cohesion: 0.18
Nodes (17): ChallengeAttemptStat, challengeStats(), dailyProgress(), DayMap, DayRecord, GOAL_DEFAULT, GOAL_MAX, GOAL_MIN (+9 more)

### Community 33 - "grade.test.ts"
Cohesion: 0.10
Nodes (24): algoOf(), ALL, at(), candles, findAlgo(), P, r, window (+16 more)

### Community 34 - "token.ts"
Cohesion: 0.11
Nodes (24): ApiErrorCode, ConfigError, ValidationIssue, b64(), derive(), getSigningSecret(), HeaderSchema, keyCache (+16 more)

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
Cohesion: 0.13
Nodes (39): 2.1 Из `ARCHITECTURE.md` §4 (дословно), Решение, golden/ - эталонные участки SMC (ALGORITHMS §18), allSwingsMap, AnalyzeOptions, analyzeStructure(), EMPTY_LAYER, scopeOrder() (+31 more)

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
Cohesion: 0.14
Nodes (18): devDependencies, fake-indexeddb@^6.2.7, jsdom@^26.0.0, tailwindcss@^4.0.0, @tailwindcss/postcss@^4.0.0, @types/react@^19.0.0, @types/react-dom@^19.0.0, vitest@^4.1.12 (+10 more)

### Community 52 - "AppShell.tsx"
Cohesion: 0.45
Nodes (8): AppShell(), BottomTabs(), DesktopTabs(), ICONS, activeNav(), isChartRoute(), NAV_ITEMS, NavId

### Community 53 - "rules.ts"
Cohesion: 0.17
Nodes (23): normalizeMark(), better(), BreakResult, clampIdx(), Direction, extreme(), FvgResult, isPivot() (+15 more)

### Community 54 - "build.ts"
Cohesion: 0.24
Nodes (18): Core, GradeResultApi, 19. Расхождения с документами, ChallengeGrade, OK_BY_SKILL, Feedback, FeedbackBlock, FeedbackInput (+10 more)

### Community 55 - "TradingChart.tsx"
Cohesion: 0.13
Nodes (23): lightweight-charts@~5.2.1, limitCandles(), OPEN_CANDLE_ALPHA, pricePrecision(), T0, tokens, toCandleData(), toVolumeData() (+15 more)

### Community 56 - "pa/index.ts"
Cohesion: 0.08
Nodes (58): buildPa(), reconstructContext(), 18.2 Участки, computeContext(), CONTEXT_STRUCTURE, ContextAnswer, ContextEvidence, ContextReference (+50 more)

### Community 57 - "TimeIndex"
Cohesion: 0.10
Nodes (18): lwcProjection(), snapAnchor(), SnapOptions, snapPriceToCandle(), synthetic_candles, T0, T0, TimeIndex (+10 more)

### Community 58 - "TradingChart"
Cohesion: 0.14
Nodes (14): DrawingController, bosMark, breakIdx, drag(), index, lvl, proj, pt() (+6 more)

### Community 59 - "marks.ts"
Cohesion: 0.24
Nodes (16): allLayerSwings(), buildAlgoMarkSet(), conceptOf(), endTimeOf(), eventMark(), fvgMark(), IndexWindow, KIND_CONCEPT (+8 more)

### Community 60 - "useMarketData.ts"
Cohesion: 0.13
Nodes (22): ARCHIVE_MIN_AGE_MS, ARCHIVE_SYMBOLS, archiveAllowed(), archivePageSize(), archiveWindow(), HISTORY_PAGE, PRESET_SYMBOLS, resolveSourceMode() (+14 more)

### Community 61 - "params.ts"
Cohesion: 0.11
Nodes (36): Page(), Page(), MsSetup(), PaSetup(), CommonFields(), SHORT, common(), CommonParams (+28 more)

### Community 62 - "tasks.ts"
Cohesion: 0.11
Nodes (25): ARCHIVE_START, CHALLENGE_FUTURE_MS, cutoffOf(), futureProviderFor(), buildChallenge(), ChReq, gradeChallengeTask(), GradeCtx (+17 more)

### Community 63 - "controller.ts"
Cohesion: 0.15
Nodes (20): PointerKind, constrainAnchors(), createMark(), DrawKind, FULL_WIDTH_KINDS, isDrawKind(), isScopedKind(), MarkExtra (+12 more)

### Community 64 - "MarkSession.tsx"
Cohesion: 0.16
Nodes (25): decimalsForTick(), makePriceFormatter(), TICK_TABLE, tickSizeFor(), fmtOf(), PaContextBody(), countsFromGrade(), AsideSection() (+17 more)

### Community 65 - "archive.ts"
Cohesion: 0.15
Nodes (14): AGG_TRADES_HEADER, AggTrade, ARCHIVE_BASE_URL, ArchiveFetch, ArchiveFileSpec, ArchiveSource, ArchiveSourceOptions, archiveUrl() (+6 more)

### Community 66 - "core/src/index.ts"
Cohesion: 0.36
Nodes (6): aggregate(), SeriesByTf, sliceAt(), synthetic_hour(), synthetic_m1(), TIMEFRAME_MS

### Community 67 - "README.md"
Cohesion: 0.20
Nodes (4): Trading Lab, Документация, Запуск, Структура

### Community 68 - "SupabaseRepository.ts"
Cohesion: 0.20
Nodes (22): chunks(), IMPORTED_USER_META, ImportOutcome, importSnapshot(), must(), recomputeDerived(), Row, runFirstSignInImport() (+14 more)

### Community 69 - "grade.ts"
Cohesion: 0.18
Nodes (17): 12. Открытые вопросы, Entry, gradeMarks(), Group, groupEvaluated(), groupOf(), iou(), MAJOR (+9 more)

### Community 70 - "schemas.ts"
Cohesion: 0.09
Nodes (23): zod@^4.0.0, AnchorSchema, AnswerSchema, BUSINESS_CODES, ChallengeAnswer, ChallengeAnswerSchema, difficulty, GradeRequest (+15 more)

### Community 72 - "13. Генерация заданий"
Cohesion: 0.33
Nodes (6): 13.1 Общие правила, 13.2 Market Structure «Разметка» (поправка v1.1, `ALGO_VERSION 1.1.0`), 13.3 Market Structure «Вопрос», 13.4 Price Action, 13.5 Challenge, 13. Генерация заданий

### Community 73 - "Settings"
Cohesion: 0.21
Nodes (12): localDay(), 1. Принципы, 2. Локальная схема: IndexedDB (Dexie), 3.1 RLS, 3. Схема Supabase Postgres (M7), 5.1 Точность навыка, 5.2 Дневная цель, 5.3 Мягкая серия дней (+4 more)

### Community 74 - "normalize.ts"
Cohesion: 0.10
Nodes (28): load(), klinesZip(), NOW, Served, zipOf(), LiveStatus, archiveH1, archiveM1 (+20 more)

### Community 75 - "fetch-fixtures.mjs"
Cohesion: 0.08
Nodes (15): algoMarks, candles, r, downloadedAt, items, m1, rec, root (+7 more)

### Community 76 - "live.test.ts"
Cohesion: 0.11
Nodes (17): Frontend Developer, BINANCE_REST_BASE, BINANCE_WS_BASE, binanceInterval(), FetchKlinesOptions, LiveErrorCode, LiveFeed, LiveFeedError (+9 more)

### Community 77 - "Candle"
Cohesion: 0.14
Nodes (19): ArchiveLoaderOptions, ChallengeZone, Chunk, countClosedBefore(), DAY_MS, depthOf(), floorTo(), loadClosedBefore() (+11 more)

### Community 78 - "screens.test.tsx"
Cohesion: 0.12
Nodes (26): metadata, plexMono, plexSans, RootLayout(), viewport, AuthRepositoryProvider(), SupabaseAuthRepositoryProvider(), wrap() (+18 more)

### Community 79 - "ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`"
Cohesion: 0.22
Nodes (8): 18.1 Формат и процесс, 18.3 Что ещё размечается после утверждения (M4/M5), 18. Golden-тесты, 20. Спорные места и вопросы оркестратору, 4.1 Правило, 4.2 Граничные случаи, 4. Метки HH / HL / LH / LL, ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`

### Community 80 - "quality.ts"
Cohesion: 0.14
Nodes (17): dirOf(), gradeChallenge(), lastEventText(), lastInternal(), protectedLevel(), QualityPart, reasonScore(), slScore() (+9 more)

### Community 81 - "handlers.test.ts"
Cohesion: 0.11
Nodes (28): dynamic, maxDuration, POST(), runtime, dynamic, maxDuration, POST(), runtime (+20 more)

### Community 82 - "facts.ts"
Cohesion: 0.10
Nodes (37): age(), CHALLENGE_STRUCTURE, ChallengeFacts, computeChallengeFacts(), FactsInput, HTF, intersects(), lastEventSince() (+29 more)

### Community 83 - "golden.pa-challenge.test.ts"
Cohesion: 0.13
Nodes (12): c4h, FIX, all, at(), c4h, idx(), ts(), loadAggTrades() (+4 more)

### Community 84 - "PRD — Trading Lab"
Cohesion: 0.20
Nodes (10): 10. Приоритизация функций (MoSCoW), 11. План MVP, 2. Принципы продукта, 5. Нефункциональные требования, 6. User Stories, 8.1 Сценарии Given/When/Then, 8.2 Сквозные критерии, 8. Критерии приёмки MVP (+2 more)

### Community 85 - "TaskSession.tsx"
Cohesion: 0.15
Nodes (24): AnswerSessionProps, createTaskApi(), kindOf(), post(), TaskApi, buildAttempt(), BuildAttemptInput, saveTaskAttempt() (+16 more)

### Community 86 - "11. Контекст для PA «Контекст»"
Cohesion: 0.29
Nodes (7): 11.1 Формат ответа (ответ на OQ-16), 11.2 Задание, 11.3 Факторы (детерминированно, для бычьей модели; медвежья — зеркально), 11.4 Значимость (решение), 11.5 Оценка, 11.6 Генерация, 11. Контекст для PA «Контекст»

### Community 87 - "14. Challenge: эталон, оценка качества, WAIT, лимиты"
Cohesion: 0.29
Nodes (7): 14.1 Факты на момент T (`ChallengeFacts`), 14.2 Эталонная сторона `refSide`, 14.3 Оценка качества 0–100 (ответ на OQ-08), независимо от исхода, 14.4 Правильность, вердикт, лимиты, 14.5 Предикаты причин (`ReasonCode`, состав без изменений), 14.6 Подсказки (easy), 14. Challenge: эталон, оценка качества, WAIT, лимиты

### Community 88 - "UtcMs"
Cohesion: 0.09
Nodes (22): FIX, FixtureLoader, ArchiveLoader, CandleLoader, mapLimit(), RawAggTrade, Draft, TaskEnvelope (+14 more)

### Community 89 - "5. Тренд, BOS и CHoCH"
Cohesion: 0.33
Nodes (6): 5.1 Общие правила, 5.2 Внешний слой — машина состояний с защищёнными уровнями, 5.3 Внутренний слой — «последний подтверждённый swing», 5.4 Что происходит после CHoCH, 5.5 Граничные случаи (проверены на реальных свечах), 5. Тренд, BOS и CHoCH

### Community 90 - "patterns.ts"
Cohesion: 0.23
Nodes (17): 9.1 Состав (ответ на OQ-11), 9.3 Выход, 9.4 Проверенные примеры (BTCUSDT 4h 2026-09, GS-5), 9. Свечные модели Price Action (`detectPatterns`), body(), bodyBottom(), bodyTop(), detectPatterns() (+9 more)

### Community 91 - "3. Внешняя и внутренняя структура"
Cohesion: 0.29
Nodes (7): external(), 12.4 Совместимость и стоимость пары, 3.1 Правило (решение), 3.2 Дедупликация, 3.3 Сигнатура `analyzeStructure`, 3.4 Отображение в `Mark` (общая модель `ARCHITECTURE.md` §4.2), 3. Внешняя и внутренняя структура

### Community 92 - "package.json"
Cohesion: 0.12
Nodes (21): devDependencies, eslint@^9.39.0, eslint-config-next@^16.0.0, @eslint/js@^9.39.0, @playwright/test@1.63.0, prettier@^3.6.0, @types/node@^22.0.0, typescript@~5.9.3 (+13 more)

### Community 93 - "ChallengeSession.tsx"
Cohesion: 0.12
Nodes (20): ChallengeSessionPage(), ChallengeApiError, ChallengeErrorKind, fetchNext(), gradeChallenge(), kindOf(), post(), buildAttempt() (+12 more)

### Community 94 - "1. Общие соглашения"
Cohesion: 0.22
Nodes (9): c(), 1.1 Входные свечи, 1.2 Термины свечи, 1.3 ATR, 1.4 Детерминизм и числа, 1.5 ALGO_VERSION, 1.6 Параметры по сложностям (сводка), 1. Общие соглашения (+1 more)

### Community 95 - "7. Order Block"
Cohesion: 0.50
Nodes (4): 7.1 Определение (решение, ICT: «последняя противоположная свеча перед импульсом, сломавшим структуру»), 7.2 Статус (после свечи события `k`, по закрытым свечам), 7.3 Сигнатура, 7. Order Block

### Community 97 - "reveal.ts"
Cohesion: 0.11
Nodes (23): AxisTick, axisTicks(), relativeDuration(), relativeLabel(), STEPS, T, partMax(), ResultView() (+15 more)

### Community 98 - "history/route.ts"
Cohesion: 0.11
Nodes (15): dynamic, errorResponse(), GET(), ISSUE_CODES, querySchema, runtime, SYMBOLS, call() (+7 more)

### Community 99 - "templates.ru.ts"
Cohesion: 0.23
Nodes (15): okFromOutcomes(), CHALLENGE_VERDICT_TEMPLATES_RU, ERROR_SKILLS, ERROR_TEMPLATES_RU, ErrorTemplate, fillTemplate(), flattenTemplates(), KIND_NAMES_RU (+7 more)

### Community 100 - "12. `gradeMarks` — сравнение разметки"
Cohesion: 0.25
Nodes (8): 12.1 Сигнатура (расширение `API_CONTRACTS.md`), 12.2 Ключевая свеча метки, 12.3 Группы сопоставления, 12.5 Матчинг (решение: DP по времени вместо венгерского), 12.6 Классификация после матчинга, 12.7 Счёт, вердикт, навыки, 12.8 Пример AC-07 на реальных данных (GS-1), 12. `gradeMarks` — сравнение разметки

### Community 101 - "sessionStore.ts"
Cohesion: 0.15
Nodes (23): blockerKey(), DecisionPanel(), PriceField(), ReplayBar(), buildAnswer(), defaultLevels(), formatRR(), parsePrice() (+15 more)

### Community 102 - "Стратегия тестирования — Trading Lab"
Cohesion: 0.20
Nodes (10): 10. Производительность, 1. Принципы, 2. Пирамида, 3. Фикстуры, 5. E2E (Playwright), 6. Визуальная проверка и доступность, 7. Критерии «готово» для вехи, 8. CI (GitHub Actions) (+2 more)

### Community 103 - "DrawingPrimitive.ts"
Cohesion: 0.17
Nodes (7): DrawingPrimitive, OpenCandleInfo, PrimitiveState, ZONE_KINDS, dimSpans(), HighlightRange, MarkState

### Community 104 - "SignInForm.tsx"
Cohesion: 0.25
Nodes (10): dynamic, Page(), Probe(), useAuth(), callbackUrl(), SignInForm(), google(), magic() (+2 more)

### Community 105 - "ref_vitest"
Cohesion: 0.18
Nodes (7): contractAttempt(), contractMark, runRepositoryContract(), FakeSupabase, Row, UNIQUE, seedLocal()

### Community 106 - "serialize.ts"
Cohesion: 0.24
Nodes (9): anchor, KINDS, MARKS_FORMAT_VERSION, markSchema, parseMarks(), serializeMarks(), m, validateMarks() (+1 more)

### Community 107 - "ApiError"
Cohesion: 0.29
Nodes (12): ApiError, gradeMsMark(), gradeMsQuestionTask(), gradePaContext(), gradePaFind(), gradePaLevel(), gradeTask(), markGradeOf() (+4 more)

### Community 108 - "@playwright/test"
Cohesion: 0.19
Nodes (11): DATE_LEAK, lastCandleTime(), num(), openReasons(), projectPoint(), SESSION_URL(), startSession(), submitDecision() (+3 more)

### Community 109 - "PaContextBody.tsx"
Cohesion: 0.13
Nodes (29): Page(), HTF, Row(), YN, yn, PaFindBody(), PaLevelBody(), PaSessionScreen() (+21 more)

### Community 110 - "6. Liquidity sweep"
Cohesion: 0.40
Nodes (5): 6.1 Определение (решение), 6.2 Несколько уровней за одну свечу, 6.3 Граничные случаи, 6.4 Сигнатура, 6. Liquidity sweep

### Community 111 - "TerminalScreen.tsx"
Cohesion: 0.31
Nodes (10): TerminalPage(), normalizeSymbolInput(), PairPicker(), env, ErrorBlock(), TerminalScreen(), otherScope(), useScope() (+2 more)

### Community 112 - "SessionLayout.tsx"
Cohesion: 0.16
Nodes (14): csp, nextConfig, SessionLayoutProps, SHEET_PAD, TaskHint(), TaskHintProps, ChartSkeleton(), copyFor() (+6 more)

### Community 114 - "Команда агентов — Trading Lab"
Cohesion: 0.29
Nodes (6): 1. Сводка, 3. Правила оркестрации, 4. Формат отчёта агента (до 15 строк), 5. Шаблон задания агенту, Команда агентов — Trading Lab, Правило graphify (включается в каждый промпт агента, исследующего код)

### Community 115 - "Roadmap — Trading Lab"
Cohesion: 0.29
Nodes (6): MVP, Roadmap — Trading Lab, v1.1 — Fibonacci Playground и Premium/Discount, v1.2 — Elliott Wave Lab, v2, Правила корректировки

### Community 116 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, check:tokens, dev, format, lint, sync:tokens, test (+2 more)

### Community 117 - "16. Навыки и прогресс"
Cohesion: 0.50
Nodes (4): 16.1 Навыки, 16.2 Обновление точности, 16.3 Адаптивная подборка, 16. Навыки и прогресс

### Community 118 - "dependencies"
Cohesion: 0.12
Nodes (16): dependencies, dexie@^4.0.0, lucide-react@^1.66.0, next@^16.0.0, react@^19.0.0, react-dom@^19.0.0, @supabase/ssr@^0.12.7, @supabase/supabase-js@^2.118.0 (+8 more)

### Community 119 - "criteria.ts"
Cohesion: 0.24
Nodes (17): body(), bottom(), dojiItems(), engulfItems(), finish(), insideItems(), Item, PatternCheck (+9 more)

### Community 120 - "ms.helpers.ts"
Cohesion: 0.35
Nodes (8): checkAndSeeResult(), nextThenHomeShowsDone(), openSession(), shot(), tapCandle(), solveOne(), chartBox(), selectTool()

### Community 121 - "SupabaseRepository"
Cohesion: 0.13
Nodes (10): SkillStatRow, must(), SupabaseRepository, AttemptFilter, DailyActivity, 5.1 Живые данные (терминал), 5.2 История для заданий (сервер), 5.3 Задания (stateless, без БД до M7) (+2 more)

### Community 122 - "data/streak.test.ts"
Cohesion: 0.43
Nodes (4): DayStat, prevDay(), softStreak(), done

### Community 123 - "4. Миграция локальных данных в Supabase при первом входе"
Cohesion: 0.29
Nodes (6): ImportReport, 4.1 Порядок, 4.2 Правила по таблицам (идемпотентность по `id`, конфликты по `updated_at`), 4.3 Пересчёт производных данных, 4.4 Ошибки и откат, 4. Миграция локальных данных в Supabase при первом входе

### Community 124 - "ChallengeHome.tsx"
Cohesion: 0.11
Nodes (32): ChallengePage(), ChallengeHome(), DIFFS, recentLine(), StartTf, Stats(), TF_OPTIONS, RCurve() (+24 more)

### Community 125 - "runCheck.ts"
Cohesion: 0.23
Nodes (11): CheckPanel(), CheckPanelProps, subscribe(), useDesktop(), CheckOutcome, CheckResult, CheckState, CONCEPT_OF (+3 more)

### Community 126 - "SettingsScreen.tsx"
Cohesion: 0.21
Nodes (8): Page(), AsyncState, CANDLE_OPTIONS, DAILY_GOAL_MAX, DAILY_GOAL_MIN, DailyGoalStepper(), SettingsScreen(), THEME_OPTIONS

### Community 127 - "InstructionBar.tsx"
Cohesion: 0.19
Nodes (13): NoticeCode, InstructionBar(), instructionText(), MarksSheet(), MarksSheetProps, describeMark(), formatWhen(), markName() (+5 more)

### Community 128 - "fixtures"
Cohesion: 0.50
Nodes (3): fixtures, recorded/ - записанные форматы API (fapi/fstream недоступны из облака, 451), Архивные CSV

### Community 129 - "buildFeedback"
Cohesion: 0.18
Nodes (11): attempt(), 17.1 Структура и ключи, 17.2 Верность и общие принципы, 17.3 Что понято верно (`OkCode`; новые помечены *), 17.4 Ошибки (части 3–6), 17. Шаблоны разбора (источник `src/i18n/ru/feedback`), block(), buildFeedback() (+3 more)

### Community 130 - "4. Функциональные требования"
Cohesion: 0.17
Nodes (12): 4.10 Авторизация (FR-AUTH), 4.11 Интерфейс (FR-UI), 4.1 Данные (FR-DATA), 4.2 График (FR-CHART), 4.3 Слой разметки (FR-DRAW), 4.4 Market Structure Analyzer (FR-MS), 4.5 Trading Challenge (FR-TC), 4.6 Price Action Trainer (FR-PA) (+4 more)

### Community 131 - "AuthProvider.tsx"
Cohesion: 0.26
Nodes (11): dynamic, GET(), AuthContext, AuthState, DISABLED, getBrowserSupabase(), isSupabaseConfigured(), safeNextPath() (+3 more)

### Community 132 - "7. User Flows"
Cohesion: 0.25
Nodes (8): 7.1 Первый вход, 7.2 Сессия Market Structure (режим «Разметка»), 7.3 Trading Challenge: от выбора до разбора, 7.4 Price Action «Контекст», 7.5 Терминал с проверкой разметки, 7.6 Просмотр «Слабых мест», 7.7 Продолжение на другом устройстве, 7. User Flows

### Community 133 - "Подключение Supabase и Vercel (с телефона)"
Cohesion: 0.18
Nodes (10): 1. Проект Supabase, 2. Применить миграцию (создать таблицы), 3. Ключи Supabase, 4. Вход через Google, 5. Redirect URL в Supabase, 6. Vercel, 7. Проверка на телефоне, Если что-то не работает (+2 more)

### Community 134 - "@testing-library/react"
Cohesion: 0.25
Nodes (7): @testing-library/react@^16.0.0, @testing-library/user-event@^14.6.8, Harness(), Harness(), OPTIONS, @testing-library/react, @testing-library/user-event

### Community 135 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, start, test, typecheck

### Community 136 - "lucide-react"
Cohesion: 0.25
Nodes (7): Trigger(), USED, ToastApi, ToastContext, ToastOptions, useToast(), lucide-react

### Community 137 - "Mark"
Cohesion: 0.19
Nodes (18): ToolId, ControllerDeps, ControllerNotice, TimeWindow, TradingChartProps, MarkState, tailRange(), TaskChart() (+10 more)

### Community 139 - "frontend-developer.md"
Cohesion: 0.29
Nodes (6): graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 141 - "ALGO_VERSION"
Cohesion: 0.50
Nodes (3): dynamic, GET(), ALGO_VERSION

### Community 142 - "3. Область продукта"
Cohesion: 0.40
Nodes (5): 3.1 В MVP, 3.2 Вне MVP, 3.3 Требует исследования, 3.4 Технические риски, 3. Область продукта

### Community 143 - "8. FVG (Fair Value Gap)"
Cohesion: 0.50
Nodes (4): 8.1 Определение, 8.2 Заполнение, 8.3 Сигнатура, 8. FVG (Fair Value Gap)

### Community 144 - "1. Обзор и цель продукта"
Cohesion: 0.40
Nodes (5): 1.1 Что это, 1.2 Цель, 1.3 Целевой пользователь, 1.4 Модули, 1. Обзор и цель продукта

## Knowledge Gaps
- **13 isolated node(s):** `ADR-0008`, `ADR-0007`, `ADR-0006`, `ADR-0005`, `ADR-0005` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 958 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Mark` connect `Mark` to `market-structure.ts`, `terminal.helpers.ts`, `UtcMs`, `hit.ts`, `adapters.ts`, `Candle`, `grade.test.ts`, `src/types.ts`, `handlers.test.ts`, `rules.ts`, `build.ts`, `TradingChart.tsx`, `pa/index.ts`, `TimeIndex`, `TradingChart`, `marks.ts`, `params.ts`, `tasks.ts`, `controller.ts`, `MarkSession.tsx`, `SupabaseRepository.ts`, `grade.ts`, `fetch-fixtures.mjs`, `facts.ts`, `TaskSession.tsx`, `3. Внешняя и внутренняя структура`, `ChallengeSession.tsx`, `1. Общие соглашения`, `DrawingPrimitive.ts`, `ref_vitest`, `serialize.ts`, `PaContextBody.tsx`, `TerminalScreen.tsx`, `SupabaseRepository`, `runCheck.ts`, `InstructionBar.tsx`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Mark` (e.g. with `Контекст` and `Последствия`) actually correct?**
  _`Mark` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0008`, `ADR-0007`, `ADR-0006` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `market-structure.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06810035842293907 - nodes in this community are weakly interconnected._
- **Why does `Candle` connect `UtcMs` to `market-structure.ts`, `API Contracts — Trading Lab`, `Mark`, `resolve.ts`, `Candle`, `grade.test.ts`, `src/types.ts`, `handlers.test.ts`, `rules.ts`, `build.ts`, `TradingChart.tsx`, `pa/index.ts`, `TimeIndex`, `TradingChart`, `useMarketData.ts`, `params.ts`, `tasks.ts`, `controller.ts`, `MarkSession.tsx`, `archive.ts`, `core/src/index.ts`, `normalize.ts`, `fetch-fixtures.mjs`, `live.test.ts`, `Candle`, `facts.ts`, `golden.pa-challenge.test.ts`, `TaskSession.tsx`, `patterns.ts`, `criteria.ts`, `runCheck.ts`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `UtcMs` (e.g. with `1. Общие соглашения` and `4.1 Шкала задания`) actually correct?**
  _`UtcMs` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Repository` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._