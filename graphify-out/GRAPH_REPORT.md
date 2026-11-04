# Graph Report - Varianto  (2026-11-04)

## Corpus Check
- 421 files · ~222,573 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 32 file(s) not represented in the graph (top: .csv 26, (none) 4, .example 1)

## Summary
- 2884 nodes · 8006 edges · 148 communities (136 shown, 12 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 231 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4c166186`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- market-structure.ts
- Repository
- terminal.helpers.ts
- API Contracts — Trading Lab
- features/feedback/index.ts
- with
- Architecture — Trading Lab
- MsMarkBody.tsx
- tools.ts
- market-data/package.json
- UtcMs
- core/src/index.ts
- core/package.json
- compilerOptions
- Interview Summary — Trading Lab
- ui/index.ts
- compilerOptions
- Project Status — Trading Lab
- Skills Registry — Trading Lab
- facts.ts
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
- TaskTimeframe
- 4. Обязательные наборы тестов
- fetch-fixtures.mjs
- Trading Lab
- token.ts
- react
- .prettierrc.json
- e2e/tsconfig.json
- core/tsconfig.json
- market-data/tsconfig.json
- src/types.ts
- postcss.config.mjs
- CLAUDE.md
- .claude/CLAUDE.md
- pnpm-workspace.yaml
- tasks.ts
- LAYOUTS — Trading Lab
- 2. Компоненты
- DESIGN — Trading Lab
- COPY — микрокопия Trading Lab
- check_tokens.py
- web/package.json
- patterns.ts
- rules.ts
- terms.tsx
- schemas.ts
- build.ts
- TradingChart.tsx
- TradingChart
- src/types.ts
- Mark
- ref_vitest
- placeholders.test.ts
- ProgressScreen.tsx
- MarkSession.tsx
- archive.ts
- core/src/index.ts
- README.md
- SupabaseRepository.ts
- grade.ts
- handlers.ts
- next-resilience.test.ts
- 13. Генерация заданий
- Settings
- SettingsScreen.tsx
- Находки
- live.test.ts
- Candle
- screens.test.tsx
- ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`
- ChallengeSession.tsx
- AUDIT — финальный дизайн-аудит Trading Lab (M8-UI)
- placeholders.test.ts
- ErrorLog.tsx
- PRD — Trading Lab
- TaskSession.tsx
- 11. Контекст для PA «Контекст»
- challenge/generate.ts
- position.ts
- 5. Тренд, BOS и CHoCH
- golden.pa-challenge.test.ts
- session.ts
- package.json
- SignInForm.tsx
- 1. Общие соглашения
- 7. Order Block
- web/AGENTS.md
- reveal.ts
- SupabaseRepository
- src/feedback/index.ts
- features/feedback/format.ts
- SessionActions
- Стратегия тестирования — Trading Lab
- DrawingPrimitive.ts
- runCheck.ts
- ref_vitest
- MarksSheet.tsx
- toolGroups.tsx
- 4. Функциональные требования
- CountdownBadge.tsx
- 2. Карточки
- core/src/index.ts
- pa/index.ts
- Query
- ThemeProvider.tsx
- useMarketData.ts
- ClockOffsetEstimator
- progressLogic.ts
- axis.ts
- criteria.ts
- build.ts
- handlers.test.ts
- 18. Golden-тесты
- challenge/api.ts
- ProgressScreen.tsx
- QA Report — финальная приёмка MVP Trading Lab (M8)
- useRepository
- 12. `gradeMarks` — сравнение разметки
- fixtures
- resolve.ts
- keepalive/route.ts
- storage/index.ts
- frontend-developer.md
- Подключение Supabase и Vercel (с телефона)
- TimeIndex
- scripts
- 2. `detectSwings` — фрактальные swing
- vercel.json
- 5. Потоки данных
- 1. Обзор и цель продукта
- 3. Область продукта
- 16. Навыки и прогресс
- InstructionBar
- server/errors.ts
- 8. FVG (Fair Value Gap)
- 6. Liquidity sweep
- 3. Внешняя и внутренняя структура

## God Nodes (most connected - your core abstractions)
1. `Candle` - 94 edges
2. `Mark` - 86 edges
3. `UtcMs` - 79 edges
4. `react` - 76 edges
5. `TaskTimeframe` - 51 edges
6. `cn()` - 46 edges
7. `analyzeStructure()` - 45 edges
8. `Button()` - 40 edges
9. `TradingChart()` - 37 edges
10. `Timeframe` - 34 edges

## Surprising Connections (you probably didn't know these)
- `P2` --references--> `GradeLegend()`  [INFERRED]
  docs/design/AUDIT.md → apps/web/src/features/feedback/GradeLegend.tsx
- `14.3 Оценка качества 0–100 (ответ на OQ-08), независимо от исхода` --references--> `key()`  [INFERRED]
  docs/specs/ALGORITHMS.md → apps/web/src/features/guide/introStore.ts
- `P1` --references--> `fmtPrice()`  [INFERRED]
  docs/design/AUDIT.md → apps/web/src/features/progress/ErrorLog.tsx
- `1. Принципы` --references--> `localDay()`  [INFERRED]
  docs/DATABASE_SCHEMA.md → apps/web/src/i18n/format.ts
- `6. Открытые вопросы` --references--> `localDay()`  [INFERRED]
  docs/DATABASE_SCHEMA.md → apps/web/src/i18n/format.ts

## Import Cycles
- 2-file cycle: `packages/core/src/candles/aggregate.ts -> packages/core/src/index.ts -> packages/core/src/candles/aggregate.ts`

## Communities (148 total, 12 thin omitted)

### Community 0 - "market-structure.ts"
Cohesion: 0.11
Nodes (37): atrAt(), buildMsQuestion(), checkMsWindow(), CORE_CONCEPTS, drawCandidate(), generateMsQuestion(), gradeMsQuestion(), isBodyBreak() (+29 more)

### Community 1 - "Repository"
Cohesion: 0.09
Nodes (13): Repository, graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила, ADR-0008: Local-first хранилище за интерфейсом Repository; Supabase в M7 (+5 more)

### Community 2 - "terminal.helpers.ts"
Cohesion: 0.06
Nodes (49): DATE_LEAK, expandResult(), lastCandleTime(), num(), openReasons(), projectPoint(), SESSION_URL(), startSession() (+41 more)

### Community 3 - "API Contracts — Trading Lab"
Cohesion: 0.10
Nodes (20): 1.1 Формат ошибки, 1.2 Заголовки кэша, 1. Общие соглашения, 2.2 Расширения контрактов (предложение — фиксируются при реализации в `@tl/core`), 2. Типы `@tl/core`, используемые в контрактах, 3.1 `GET /api/health`, 3.2 `GET /api/history`, 3.3 `POST /api/tasks/{module}/next` (+12 more)

### Community 4 - "features/feedback/index.ts"
Cohesion: 0.19
Nodes (19): errors, feedback, defaultFmt, FeedbackView(), FeedbackViewProps, Section(), renderBlock(), GlyphKind (+11 more)

### Community 5 - "with"
Cohesion: 0.08
Nodes (26): runs-on, steps, GITHUB_TOKEN, jobs, check, secrets-scan, name, on (+18 more)

### Community 6 - "Architecture — Trading Lab"
Cohesion: 0.14
Nodes (14): 10. Развёртывание, 11. Риски, 1. Ключевые ограничения, определяющие архитектуру, 2. Обзор, 3. Репозиторий (pnpm monorepo), 4.1 Синхронизация таймфреймов, 4.2 Разметка (общая модель для пользователя и алгоритма), 4.3 Алгоритмы (детерминированные, версионируемые) (+6 more)

### Community 7 - "MsMarkBody.tsx"
Cohesion: 0.15
Nodes (23): Page(), MsMarkBody(), highlightMarks(), MsQuestionBody(), MsSessionScreen(), msQuestionAnswer(), AnswerList(), msBody() (+15 more)

### Community 8 - "tools.ts"
Cohesion: 0.19
Nodes (16): GroupId, groupOf(), GROUPS, HOTKEY_OF, HOTKEYS, ic, MOBILE_GROUPS, TerminalTool (+8 more)

### Community 9 - "market-data/package.json"
Cohesion: 0.12
Nodes (19): dependencies, fflate@^0.8.3, @tl/core@workspace:*, devDependencies, vitest@^4.1.12, @vitest/coverage-v8@^4.1.12, exports, ./archive (+11 more)

### Community 10 - "UtcMs"
Cohesion: 0.13
Nodes (17): DailyActivityRow, SkillStatRow, TerminalMarksRow, TradingLabDB, defaultSettings(), LocalRepository, LocalSnapshot, mark (+9 more)

### Community 11 - "core/src/index.ts"
Cohesion: 0.17
Nodes (21): TerminalPage(), ARCHIVE_MIN_AGE_MS, ARCHIVE_SYMBOLS, archiveAllowed(), archiveHref(), archivePageSize(), HISTORY_PAGE, normalizeSymbolInput() (+13 more)

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
Cohesion: 0.09
Nodes (38): ResultSheet(), SetupFieldProps, Badge(), BadgeProps, BottomSheet(), BottomSheetProps, HEIGHT, SheetHeight (+30 more)

### Community 16 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, allowJs, incremental, jsx, lib, paths, plugins, exclude (+3 more)

### Community 17 - "Project Status — Trading Lab"
Cohesion: 0.22
Nodes (8): Project Status — Trading Lab, Блокеры, Готовность по частям, Окружение разработки (облачный контейнер), Следующие действия, Что НЕ проверено, Что реально работает (проверено 2026-11-04), Этапы

### Community 18 - "Skills Registry — Trading Lab"
Cohesion: 0.25
Nodes (7): Skills Registry — Trading Lab, Кандидаты — отложены до утверждения архитектуры, Отклонённые, Справочник: Public APIs, Уже доступные навыки окружения (не требуют установки), Установка в новом контейнере, Установленные инструменты

### Community 19 - "facts.ts"
Cohesion: 0.08
Nodes (42): age(), CHALLENGE_STRUCTURE, computeChallengeFacts(), FactsInput, HTF, intersects(), lastEventSince(), poiFor() (+34 more)

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
Nodes (40): distToRectEdge(), distToSegment(), Hit, hitTest(), inside(), partScore(), geos(), synthetic_proj (+32 more)

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
Nodes (36): ADR-0001: Next.js 16 + TypeScript strict, pnpm monorepo, Vercel, Контекст, Последствия, Рассмотренные альтернативы, Решение, ADR-0003: Живые данные грузит браузер напрямую (REST + WS), fallback — REST-polling, Контекст, Последствия (+28 more)

### Community 29 - "PaFindBody.tsx"
Cohesion: 0.11
Nodes (32): Page(), CONTEXT_FIELD_IDS, CONTEXT_HTF, ContextFieldId, viewForField(), PaContextBody(), Row(), YN (+24 more)

### Community 30 - "TaskTimeframe"
Cohesion: 0.12
Nodes (24): buildAttempt(), AnswerInput, ChallengeAnswerBody, atrOf(), createSessionStore(), INITIAL, Phase, SessionState (+16 more)

### Community 31 - "4. Обязательные наборы тестов"
Cohesion: 0.25
Nodes (8): 4.1 Инвариант агрегации таймфреймов, 4.2 `sliceAt(series, T)`, 4.3 Нормализация (`market-data`), 4.4 Golden-тесты SMC/PA, 4.5 `resolveTrade`, 4.6 Интеграционные тесты API, 4.7 Прочие unit-тесты, 4. Обязательные наборы тестов

### Community 32 - "fetch-fixtures.mjs"
Cohesion: 0.08
Nodes (26): ChallengeAttemptStat, challengeStats(), dailyProgress(), DayMap, DayRecord, GOAL_DEFAULT, GOAL_MAX, GOAL_MIN (+18 more)

### Community 33 - "Trading Lab"
Cohesion: 0.33
Nodes (6): Trading Lab, Быстрый старт, Документация, Команды, Ограничения, Структура

### Community 34 - "token.ts"
Cohesion: 0.12
Nodes (25): ApiError, ConfigError, b64(), derive(), getSigningSecret(), HeaderSchema, invalid(), keyCache (+17 more)

### Community 35 - "react"
Cohesion: 0.14
Nodes (28): Page(), Page(), MsSetup(), PaSetup(), CommonFields(), SHORT, common(), CommonParams (+20 more)

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
Cohesion: 0.15
Nodes (28): 2.1 Из `ARCHITECTURE.md` §4 (дословно), Решение, golden/ - эталонные участки SMC (ALGORITHMS §18), allSwingsMap, AnalyzeOptions, analyzeStructure(), EMPTY_LAYER, scopeOrder() (+20 more)

### Community 45 - "tasks.ts"
Cohesion: 0.10
Nodes (44): ChallengeZone, cutoffOf(), depthOf(), floorTo(), futureProviderFor(), loadClosedBefore(), buildChallenge(), buildMs() (+36 more)

### Community 46 - "LAYOUTS — Trading Lab"
Cohesion: 0.07
Nodes (29): 0.1 Навигация и уровни, 0.2 Зоны экрана 390x844, 0.3 Жесты и разметка (мобильный), 0. Общие правила, 1.1 Мобильный 390x844 (прокручивается; график не нужен), 1.2 Десктоп 1440x900, 1. Главная (раздел «Обучение»), 2.1 Мобильный 390x844 (+21 more)

### Community 47 - "2. Компоненты"
Cohesion: 0.10
Nodes (20): 0. Общее, 1.1 Инструменты разметки, 1.2 Остальные иконки, 1. Набор иконок: lucide-react, 2.10 ProgressBar, 2.11 Toast, 2.12 Tooltip / Hint, 2.13 FeedbackBlock (разбор) (+12 more)

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
Cohesion: 0.08
Nodes (33): dependencies, dexie@^4.0.0, lightweight-charts@~5.2.1, lucide-react@^1.66.0, next@^16.0.0, react@^19.0.0, react-dom@^19.0.0, @supabase/supabase-js@^2.118.0 (+25 more)

### Community 52 - "patterns.ts"
Cohesion: 0.19
Nodes (20): c(), 1.2 Термины свечи, 9.1 Состав (ответ на OQ-11), 9.2 Критерии (ATR = ATR14 последней свечи модели, если не сказано иное; модель не ищется при ATR = null или `range == 0`), 9.3 Выход, 9.4 Проверенные примеры (BTCUSDT 4h 2026-09, GS-5), 9. Свечные модели Price Action (`detectPatterns`), body() (+12 more)

### Community 53 - "rules.ts"
Cohesion: 0.14
Nodes (27): Pending, normalizeMark(), better(), BreakResult, clampIdx(), Direction, extreme(), FvgResult (+19 more)

### Community 54 - "terms.tsx"
Cohesion: 0.18
Nodes (19): dismissIntro(), isIntroDismissed(), key(), TaskIntro(), TaskIntroProps, Host(), Annotated(), byAlias (+11 more)

### Community 55 - "schemas.ts"
Cohesion: 0.09
Nodes (21): zod@^4.0.0, AnchorSchema, AnswerSchema, BUSINESS_CODES, ChallengeAnswer, ChallengeAnswerSchema, difficulty, GradeRequest (+13 more)

### Community 56 - "build.ts"
Cohesion: 0.21
Nodes (20): Core, GradeResultApi, 5.2 `Feedback` (6 частей, FR-FB-02), 17.1 Структура и ключи, 17.2 Верность и общие принципы, 17.3 Что понято верно (`OkCode`; новые помечены *), 17.4 Ошибки (части 3–6), 17. Шаблоны разбора (источник `src/i18n/ru/feedback`) (+12 more)

### Community 57 - "TradingChart.tsx"
Cohesion: 0.10
Nodes (31): PointerKind, lwcProjection(), PointerInput, limitCandles(), OPEN_CANDLE_ALPHA, pricePrecision(), T0, tokens (+23 more)

### Community 58 - "TradingChart"
Cohesion: 0.12
Nodes (16): constrainAnchors(), createMark(), DrawKind, DrawingController, bosMark, breakIdx, drag(), index (+8 more)

### Community 59 - "src/types.ts"
Cohesion: 0.13
Nodes (27): 19. Расхождения с документами, endTimeOf(), eventMark(), fvgMark(), IndexWindow, KIND_CONCEPT, MarkClass, MarkItem (+19 more)

### Community 60 - "Mark"
Cohesion: 0.13
Nodes (30): CandleHighlight, FULL_WIDTH_KINDS, isDrawKind(), isScopedKind(), MarkExtra, RAY_RIGHT_KINDS, SWING_SIDE, TOOL_DEFS (+22 more)

### Community 61 - "ref_vitest"
Cohesion: 0.17
Nodes (8): fake-indexeddb@^6.2.7, terms(), Harness(), Harness(), OPTIONS, fake-indexeddb, @testing-library/react, @testing-library/user-event

### Community 62 - "placeholders.test.ts"
Cohesion: 0.09
Nodes (25): 2.7 Chip, algoOf(), ALL, at(), candles, findAlgo(), P, r (+17 more)

### Community 63 - "ProgressScreen.tsx"
Cohesion: 0.17
Nodes (31): Page(), Page(), EmptyState(), ErrorState(), LoadingRows(), ContinueBlock(), HomeWeakSpots(), LearnScreen() (+23 more)

### Community 64 - "MarkSession.tsx"
Cohesion: 0.16
Nodes (23): decimalsForTick(), makePriceFormatter(), TICK_TABLE, tickSizeFor(), fmtOf(), countsFromGrade(), statesFromGrade(), AsideSection() (+15 more)

### Community 65 - "archive.ts"
Cohesion: 0.15
Nodes (14): AGG_TRADES_HEADER, AggTrade, ARCHIVE_BASE_URL, ArchiveFetch, ArchiveFileSpec, ArchiveSource, ArchiveSourceOptions, archiveUrl() (+6 more)

### Community 66 - "core/src/index.ts"
Cohesion: 0.13
Nodes (22): TIMEFRAME_MS, load(), klinesZip(), NOW, Served, zipOf(), ArchiveErrorCode, ARCHIVE_KLINE_HEADER (+14 more)

### Community 67 - "README.md"
Cohesion: 0.12
Nodes (9): Known Issues — Trading Lab, Не проверено вообще (среда), Открыто, MVP, Roadmap — Trading Lab, v1.1 — Fibonacci Playground и Premium/Discount, v1.2 — Elliott Wave Lab, v2 (+1 more)

### Community 68 - "SupabaseRepository.ts"
Cohesion: 0.23
Nodes (21): chunks(), IMPORTED_USER_META, ImportOutcome, importSnapshot(), must(), recomputeDerived(), Row, runFirstSignInImport() (+13 more)

### Community 69 - "grade.ts"
Cohesion: 0.19
Nodes (16): Entry, gradeMarks(), Group, groupEvaluated(), groupOf(), iou(), MAJOR, patternSkill() (+8 more)

### Community 70 - "handlers.ts"
Cohesion: 0.16
Nodes (20): dynamic, maxDuration, POST(), runtime, errorResponse(), toApiError(), validationError(), guard() (+12 more)

### Community 71 - "next-resilience.test.ts"
Cohesion: 0.07
Nodes (30): ARCHIVE_START_MS, dynamic, errorResponse(), GET(), ISSUE_CODES, querySchema, runtime, SYMBOLS (+22 more)

### Community 72 - "13. Генерация заданий"
Cohesion: 0.33
Nodes (6): 13.1 Общие правила, 13.2 Market Structure «Разметка» (поправка v1.1, `ALGO_VERSION 1.1.0`), 13.3 Market Structure «Вопрос», 13.4 Price Action, 13.5 Challenge, 13. Генерация заданий

### Community 73 - "Settings"
Cohesion: 0.11
Nodes (17): ImportReport, 1. Принципы, 2. Локальная схема: IndexedDB (Dexie), 3.1 RLS, 3. Схема Supabase Postgres (M7), 4.1 Порядок, 4.2 Правила по таблицам (идемпотентность по `id`, конфликты по `updated_at`), 4.3 Пересчёт производных данных (+9 more)

### Community 74 - "SettingsScreen.tsx"
Cohesion: 0.27
Nodes (7): Page(), CANDLE_OPTIONS, DAILY_GOAL_MAX, DAILY_GOAL_MIN, DailyGoalStepper(), SettingsScreen(), THEME_OPTIONS

### Community 75 - "Находки"
Cohesion: 0.14
Nodes (14): dynamic, maxDuration, POST(), runtime, getDeps(), 2. MEDIUM: обход rate limit через X-Forwarded-For (исправлено частично), 3. MEDIUM: /api/history без лимита запросов (открыто), 4. LOW: /api/cron/keepalive (открыто) (+6 more)

### Community 76 - "live.test.ts"
Cohesion: 0.06
Nodes (29): Frontend Developer, BINANCE_REST_BASE, BINANCE_WS_BASE, binanceInterval(), FetchKlinesOptions, LiveErrorCode, LiveFeed, LiveFeedError (+21 more)

### Community 77 - "Candle"
Cohesion: 0.09
Nodes (31): FIX, FixtureLoader, flaky(), ARCHIVE_START, ArchiveLoader, ArchiveLoaderOptions, CandleLoader, CHALLENGE_FUTURE_MS (+23 more)

### Community 78 - "screens.test.tsx"
Cohesion: 0.23
Nodes (13): metadata, plexMono, plexSans, RootLayout(), viewport, AppShell(), BottomTabs(), DesktopTabs() (+5 more)

### Community 79 - "ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`"
Cohesion: 0.25
Nodes (8): 10.2 Эталон для «Проведи уровень», 10. `findLevels` — уровни поддержки/сопротивления, 15. `resolveTrade` (ADR-0007, уточнения), 20. Спорные места и вопросы оркестратору, 4.1 Правило, 4.2 Граничные случаи, 4. Метки HH / HL / LH / LL, ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`

### Community 80 - "ChallengeSession.tsx"
Cohesion: 0.15
Nodes (16): ChallengeSessionPage(), ChallengeSession(), FOCUS_SKILLS, SHEET_PAD, useDesktop(), selectHints(), time(), ErrorBlock() (+8 more)

### Community 81 - "AUDIT — финальный дизайн-аудит Trading Lab (M8-UI)"
Cohesion: 0.20
Nodes (9): 1. Итог, 2. Находки, 3. Impeccable detect (по URL production-сборки), 4. Что проверено и ограничения, 5. Порядок исправления, AUDIT — финальный дизайн-аудит Trading Lab (M8-UI), P1, P2 (+1 more)

### Community 82 - "placeholders.test.ts"
Cohesion: 0.12
Nodes (16): algo, ALL, assertFilled(), bad, candles, flat, FLIP, MS_PA_CODES (+8 more)

### Community 83 - "ErrorLog.tsx"
Cohesion: 0.39
Nodes (8): ErrorLog(), errorName(), fmtPrice(), Review(), textOf(), buildErrorLog(), formatTime(), ERROR_NAMES_RU

### Community 84 - "PRD — Trading Lab"
Cohesion: 0.11
Nodes (19): 10. Приоритизация функций (MoSCoW), 11. План MVP, 12. Открытые вопросы, 2. Принципы продукта, 5. Нефункциональные требования, 6. User Stories, 7.1 Первый вход, 7.2 Сессия Market Structure (режим «Разметка») (+11 more)

### Community 85 - "TaskSession.tsx"
Cohesion: 0.13
Nodes (32): AnswerSessionProps, createTaskApi(), kindOf(), post(), TaskApi, buildAttempt(), BuildAttemptInput, saveTaskAttempt() (+24 more)

### Community 86 - "11. Контекст для PA «Контекст»"
Cohesion: 0.29
Nodes (7): 11.1 Формат ответа (ответ на OQ-16), 11.2 Задание, 11.3 Факторы (детерминированно, для бычьей модели; медвежья — зеркально), 11.4 Значимость (решение), 11.5 Оценка, 11.6 Генерация, 11. Контекст для PA «Контекст»

### Community 87 - "challenge/generate.ts"
Cohesion: 0.08
Nodes (34): 14.1 Факты на момент T (`ChallengeFacts`), 14.2 Эталонная сторона `refSide`, 14.3 Оценка качества 0–100 (ответ на OQ-08), независимо от исхода, 14.4 Правильность, вердикт, лимиты, 14.5 Предикаты причин (`ReasonCode`, состав без изменений), 14.6 Подсказки (easy), 14. Challenge: эталон, оценка качества, WAIT, лимиты, ChallengeFacts (+26 more)

### Community 88 - "position.ts"
Cohesion: 0.31
Nodes (13): blockerKey(), DecisionPanel(), PriceField(), buildAnswer(), defaultLevels(), formatRR(), parsePrice(), PositionIssue (+5 more)

### Community 89 - "5. Тренд, BOS и CHoCH"
Cohesion: 0.33
Nodes (6): 5.1 Общие правила, 5.2 Внешний слой — машина состояний с защищёнными уровнями, 5.3 Внутренний слой — «последний подтверждённый swing», 5.4 Что происходит после CHoCH, 5.5 Граничные случаи (проверены на реальных свечах), 5. Тренд, BOS и CHoCH

### Community 90 - "golden.pa-challenge.test.ts"
Cohesion: 0.11
Nodes (14): c4h, FIX, all, at(), c4h, idx(), ts(), loadAggTrades() (+6 more)

### Community 91 - "session.ts"
Cohesion: 0.14
Nodes (17): AppError(), NotFound(), csp, nextConfig, ORDER, ResultSheetHeight, ResultSheetProps, SHEET_CLASS (+9 more)

### Community 92 - "package.json"
Cohesion: 0.08
Nodes (31): devDependencies, eslint@^9.39.0, eslint-config-next@^16.0.0, @eslint/js@^9.39.0, @playwright/test@1.63.0, prettier@^3.6.0, @types/node@^22.0.0, typescript@~5.9.3 (+23 more)

### Community 93 - "SignInForm.tsx"
Cohesion: 0.25
Nodes (10): dynamic, Page(), Probe(), useAuth(), callbackUrl(), SignInForm(), google(), magic() (+2 more)

### Community 94 - "1. Общие соглашения"
Cohesion: 0.33
Nodes (6): 1.1 Входные свечи, 1.3 ATR, 1.4 Детерминизм и числа, 1.5 ALGO_VERSION, 1.6 Параметры по сложностям (сводка), 1. Общие соглашения

### Community 95 - "7. Order Block"
Cohesion: 0.50
Nodes (4): 7.1 Определение (решение, ICT: «последняя противоположная свеча перед импульсом, сломавшим структуру»), 7.2 Статус (после свечи события `k`, по закрытым свечам), 7.3 Сигнатура, 7. Order Block

### Community 97 - "reveal.ts"
Cohesion: 0.16
Nodes (14): partMax(), ResultView(), DIR_RU, formatScenarioDate(), localizeParam(), POI_RU, resolutionNote(), revealFeedback() (+6 more)

### Community 99 - "src/feedback/index.ts"
Cohesion: 0.14
Nodes (27): decimalsOf(), DIRECTION_RU, displayValue(), formatFeedbackParams(), normalizeParams(), PARAM_KINDS, ParamFormatters, ParamKind (+19 more)

### Community 100 - "features/feedback/format.ts"
Cohesion: 0.30
Nodes (11): DIR, formatParam(), FORMATTERS(), formatWhen(), KIND_KEYS, placeOf(), TIME_KEYS, formatDecimal() (+3 more)

### Community 102 - "Стратегия тестирования — Trading Lab"
Cohesion: 0.18
Nodes (10): 10. Производительность, 1. Принципы, 2. Пирамида, 3. Фикстуры, 5. E2E (Playwright), 6. Визуальная проверка и доступность, 7. Критерии «готово» для вехи, 8. CI (GitHub Actions) (+2 more)

### Community 103 - "DrawingPrimitive.ts"
Cohesion: 0.12
Nodes (15): DrawingPrimitive, OpenCandleInfo, PrimitiveState, ZONE_KINDS, dimSpans(), HighlightColumn, highlightColumns(), HighlightRange (+7 more)

### Community 104 - "runCheck.ts"
Cohesion: 0.18
Nodes (13): CheckOutcome, CheckState, CONCEPT_OF, conceptsFor(), RANGE_TAIL_CANDLES, runCheck(), algoMarks, candles (+5 more)

### Community 105 - "ref_vitest"
Cohesion: 0.21
Nodes (8): contractAttempt(), contractMark, runRepositoryContract(), FakeSupabase, Row, UNIQUE, seedLocal(), @supabase/supabase-js

### Community 106 - "MarksSheet.tsx"
Cohesion: 0.20
Nodes (10): MarksSheet(), MarksSheetProps, describeMark(), formatWhen, markName(), fmt, t, cx (+2 more)

### Community 107 - "toolGroups.tsx"
Cohesion: 0.43
Nodes (7): Cell(), groupOf(), TaskToolbarBar(), TaskToolbarProps, TaskToolRail(), ERASER, ToolGroupDef

### Community 108 - "4. Функциональные требования"
Cohesion: 0.17
Nodes (12): 4.10 Авторизация (FR-AUTH), 4.11 Интерфейс (FR-UI), 4.1 Данные (FR-DATA), 4.2 График (FR-CHART), 4.3 Слой разметки (FR-DRAW), 4.4 Market Structure Analyzer (FR-MS), 4.5 Trading Challenge (FR-TC), 4.6 Price Action Trainer (FR-PA) (+4 more)

### Community 109 - "CountdownBadge.tsx"
Cohesion: 0.40
Nodes (7): CandleCountdown, formatCountdown(), pad2(), remainingMs(), CountdownBadge(), CountdownBadgeProps, View

### Community 110 - "2. Карточки"
Cohesion: 0.11
Nodes (17): 1. Сводка, 2. Карточки, 3. Правила оркестрации, 4. Формат отчёта агента (до 15 строк), 5. Шаблон задания агенту, 6. Уроки оркестрации, Backend Developer, Chart Developer (+9 more)

### Community 111 - "core/src/index.ts"
Cohesion: 0.12
Nodes (18): dynamic, GET(), anchor, KINDS, MARKS_FORMAT_VERSION, markSchema, parseMarks(), serializeMarks() (+10 more)

### Community 112 - "pa/index.ts"
Cohesion: 0.09
Nodes (50): GradeCtx, ChallengePickInput, computeContext(), CONTEXT_STRUCTURE, ContextAnswer, ContextEvidence, ContextFactorAnswer, ContextReference (+42 more)

### Community 114 - "ThemeProvider.tsx"
Cohesion: 0.19
Nodes (16): wrap(), Providers(), APPEARANCE_STORAGE_KEY, themeInitScript, applyToDom(), CandleStyle, fromStoredCandle(), Probe() (+8 more)

### Community 115 - "useMarketData.ts"
Cohesion: 0.19
Nodes (14): ClockSync, eventTimeOf(), sniffingFetch(), sniffingWebSocket(), archiveWindow(), appendCandle(), ArchiveHttpError, DataStatus (+6 more)

### Community 117 - "progressLogic.ts"
Cohesion: 0.09
Nodes (34): asCore(), avgQuality(), ErrorExample, ErrorGroup, groupByModule(), hasEnoughData(), MODULE_ORDER, ModuleAccuracy (+26 more)

### Community 118 - "axis.ts"
Cohesion: 0.27
Nodes (9): AxisTick, axisTicks(), relativeDuration(), relativeLabel(), STEPS, T, AXIS_H, PRICE_SCALE_W (+1 more)

### Community 119 - "criteria.ts"
Cohesion: 0.24
Nodes (17): body(), bottom(), dojiItems(), engulfItems(), finish(), insideItems(), Item, patternCheck() (+9 more)

### Community 120 - "build.ts"
Cohesion: 0.39
Nodes (7): attempt(), block(), buildFeedback(), glyphOf(), matchedOf(), OK_BY_SKILL, okFromOutcomes()

### Community 121 - "handlers.test.ts"
Cohesion: 0.16
Nodes (12): CH, challengeDeps(), grade(), Json, loader, mkDeps(), MS_MARK, MS_Q (+4 more)

### Community 122 - "18. Golden-тесты"
Cohesion: 0.50
Nodes (4): 18.1 Формат и процесс, 18.2 Участки, 18.3 Что ещё размечается после утверждения (M4/M5), 18. Golden-тесты

### Community 123 - "challenge/api.ts"
Cohesion: 0.25
Nodes (7): ChallengeApiError, ChallengeErrorKind, fetchNext(), gradeChallenge(), kindOf(), post(), toError()

### Community 124 - "ProgressScreen.tsx"
Cohesion: 0.12
Nodes (24): ChallengePage(), ChallengeHome(), DIFFS, recentLine(), StartTf, Stats(), TF_OPTIONS, RCurve() (+16 more)

### Community 125 - "QA Report — финальная приёмка MVP Trading Lab (M8)"
Cohesion: 0.22
Nodes (8): 1. Сводка, 2. Таблица AC, 3. Ключевые инварианты, 4. Производительность (headless Chromium, software rendering, CPU throttling 4x), 5. Дефекты, 6. Бэклог оркестратора, 7. Не удалось проверить, QA Report — финальная приёмка MVP Trading Lab (M8)

### Community 126 - "useRepository"
Cohesion: 0.19
Nodes (13): DayStat, prevDay(), softStreak(), done, AsyncState, DailyProgress, useAttempts(), useDailyProgress() (+5 more)

### Community 127 - "12. `gradeMarks` — сравнение разметки"
Cohesion: 0.25
Nodes (8): 12.1 Сигнатура (расширение `API_CONTRACTS.md`), 12.2 Ключевая свеча метки, 12.3 Группы сопоставления, 12.5 Матчинг (решение: DP по времени вместо венгерского), 12.6 Классификация после матчинга, 12.7 Счёт, вердикт, навыки, 12.8 Пример AC-07 на реальных данных (GS-1), 12. `gradeMarks` — сравнение разметки

### Community 128 - "fixtures"
Cohesion: 0.50
Nodes (3): fixtures, recorded/ - записанные форматы API (fapi/fstream недоступны из облака, 451), Архивные CSV

### Community 129 - "resolve.ts"
Cohesion: 0.11
Nodes (21): status(), 6.1 REST: `GET https://fapi.binance.com/fapi/v1/klines` (браузер), 6.2 WebSocket: kline stream (браузер), 6.3 Архив data.binance.vision (сервер), 6. Внешние API Binance, AggTrade, done(), FutureProvider (+13 more)

### Community 130 - "keepalive/route.ts"
Cohesion: 0.38
Nodes (3): dynamic, GET(), safeEqual()

### Community 131 - "storage/index.ts"
Cohesion: 0.19
Nodes (17): dynamic, GET(), @supabase/ssr@^0.12.7, AuthContext, AuthRepositoryProvider(), AuthState, DISABLED, SupabaseAuthRepositoryProvider() (+9 more)

### Community 132 - "frontend-developer.md"
Cohesion: 0.29
Nodes (6): graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 133 - "Подключение Supabase и Vercel (с телефона)"
Cohesion: 0.20
Nodes (10): 1. Проект Supabase, 2. Применить миграцию (создать таблицы), 3. Ключи Supabase, 4. Вход через Google, 5. Redirect URL в Supabase, 6. Vercel, 7. Проверка на телефоне, Если что-то не работает (+2 more)

### Community 134 - "TimeIndex"
Cohesion: 0.12
Nodes (12): snapAnchor(), SnapOptions, snapPriceToCandle(), synthetic_candles, T0, T0, TimeIndex, cs (+4 more)

### Community 135 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, start, test, typecheck

### Community 136 - "2. `detectSwings` — фрактальные swing"
Cohesion: 0.33
Nodes (6): 2.1 Сигнатура, 2.2 Определение, 2.3 Граничные случаи, 2.4 Кандидаты у правого края (`pendingSwings`), 2.5 Псевдокод, 2. `detectSwings` — фрактальные swing

### Community 139 - "5. Потоки данных"
Cohesion: 0.40
Nodes (5): 5.1 Живые данные (терминал), 5.2 История для заданий (сервер), 5.3 Задания (stateless, без БД до M7), 5.4 Хранение (Repository), 5. Потоки данных

### Community 140 - "1. Обзор и цель продукта"
Cohesion: 0.40
Nodes (5): 1.1 Что это, 1.2 Цель, 1.3 Целевой пользователь, 1.4 Модули, 1. Обзор и цель продукта

### Community 141 - "3. Область продукта"
Cohesion: 0.40
Nodes (5): 3.1 В MVP, 3.2 Вне MVP, 3.3 Требует исследования, 3.4 Технические риски, 3. Область продукта

### Community 142 - "16. Навыки и прогресс"
Cohesion: 0.50
Nodes (4): 16.1 Навыки, 16.2 Обновление точности, 16.3 Адаптивная подборка, 16. Навыки и прогресс

### Community 143 - "InstructionBar"
Cohesion: 1.00
Nodes (3): InstructionBar(), instructionText(), P0

### Community 147 - "8. FVG (Fair Value Gap)"
Cohesion: 0.50
Nodes (4): 8.1 Определение, 8.2 Заполнение, 8.3 Сигнатура, 8. FVG (Fair Value Gap)

### Community 149 - "6. Liquidity sweep"
Cohesion: 0.40
Nodes (5): 6.1 Определение (решение), 6.2 Несколько уровней за одну свечу, 6.3 Граничные случаи, 6.4 Сигнатура, 6. Liquidity sweep

### Community 150 - "3. Внешняя и внутренняя структура"
Cohesion: 0.29
Nodes (7): external(), 12.4 Совместимость и стоимость пары, 3.1 Правило (решение), 3.2 Дедупликация, 3.3 Сигнатура `analyzeStructure`, 3.4 Отображение в `Mark` (общая модель `ARCHITECTURE.md` §4.2), 3. Внешняя и внутренняя структура

## Knowledge Gaps
- **13 isolated node(s):** `ADR-0008`, `ADR-0007`, `ADR-0006`, `ADR-0005`, `ADR-0005` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1006 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Mark` connect `Mark` to `Repository`, `terminal.helpers.ts`, `features/feedback/index.ts`, `TimeIndex`, `MsMarkBody.tsx`, `UtcMs`, `core/src/index.ts`, `3. Внешняя и внутренняя структура`, `hit.ts`, `PaFindBody.tsx`, `TaskTimeframe`, `tasks.ts`, `rules.ts`, `build.ts`, `TradingChart.tsx`, `TradingChart`, `src/types.ts`, `placeholders.test.ts`, `MarkSession.tsx`, `SupabaseRepository.ts`, `grade.ts`, `ChallengeSession.tsx`, `placeholders.test.ts`, `TaskSession.tsx`, `challenge/generate.ts`, `1. Общие соглашения`, `SupabaseRepository`, `DrawingPrimitive.ts`, `runCheck.ts`, `ref_vitest`, `MarksSheet.tsx`, `core/src/index.ts`, `pa/index.ts`, `handlers.test.ts`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Mark` (e.g. with `Контекст` and `Последствия`) actually correct?**
  _`Mark` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0008`, `ADR-0007`, `ADR-0006` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `market-structure.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10661268556005399 - nodes in this community are weakly interconnected._
- **Why does `Candle` connect `Candle` to `market-structure.ts`, `resolve.ts`, `TimeIndex`, `facts.ts`, `TaskTimeframe`, `src/types.ts`, `tasks.ts`, `patterns.ts`, `rules.ts`, `build.ts`, `TradingChart.tsx`, `TradingChart`, `src/types.ts`, `Mark`, `placeholders.test.ts`, `MarkSession.tsx`, `archive.ts`, `core/src/index.ts`, `grade.ts`, `next-resilience.test.ts`, `live.test.ts`, `TaskSession.tsx`, `challenge/generate.ts`, `golden.pa-challenge.test.ts`, `runCheck.ts`, `CountdownBadge.tsx`, `core/src/index.ts`, `pa/index.ts`, `useMarketData.ts`, `criteria.ts`, `handlers.test.ts`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `UtcMs` (e.g. with `1. Общие соглашения` and `4.1 Шкала задания`) actually correct?**
  _`UtcMs` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Repository` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._