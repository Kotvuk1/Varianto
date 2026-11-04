# Graph Report - Varianto  (2026-11-04)

## Corpus Check
- 415 files · ~220,650 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 32 file(s) not represented in the graph (top: .csv 26, (none) 4, .example 1)

## Summary
- 2852 nodes · 7922 edges · 152 communities (141 shown, 11 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 227 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0e344edc`
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
- ADR-0005: Stateless-задания с подписанными токенами; будущее только на сервере
- PaFindBody.tsx
- TaskTimeframe
- 4. Обязательные наборы тестов
- fetch-fixtures.mjs
- Trading Lab
- token.ts
- Segmented
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
- TradingChart.tsx
- build.ts
- TradingChart.tsx
- TradingChart
- src/types.ts
- Mark
- session/types.ts
- placeholders.test.ts
- HomeBlocks.tsx
- MarkSession.tsx
- archive.ts
- core/src/index.ts
- README.md
- SupabaseRepository.ts
- grade.ts
- schemas.ts
- next-resilience.test.ts
- 13. Генерация заданий
- Settings
- SettingsScreen.tsx
- Находки
- live.test.ts
- sources.ts
- screens.test.tsx
- ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`
- ChallengeSession.tsx
- AUDIT — финальный дизайн-аудит Trading Lab (M8-UI)
- placeholders.test.ts
- i18n/format.ts
- PRD — Trading Lab
- TaskSession.tsx
- 11. Контекст для PA «Контекст»
- 14. Challenge: эталон, оценка качества, WAIT, лимиты
- position.ts
- 5. Тренд, BOS и CHoCH
- golden.pa-challenge.test.ts
- lucide-react
- package.json
- ArchiveSource
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
- runCheck.ts
- ref_vitest
- MarksSheet.tsx
- toolGroups.tsx
- @playwright/test
- Roadmap — Trading Lab
- 2. Карточки
- core/src/index.ts
- pa/index.ts
- Query
- ref_vitest
- useMarketData.ts
- scripts
- progressLogic.ts
- axis.ts
- criteria.ts
- ms.helpers.ts
- handlers.test.ts
- context.ts
- challenge/api.ts
- ProgressScreen.tsx
- QA Report — финальная приёмка MVP Trading Lab (M8)
- useRepository
- 12. `gradeMarks` — сравнение разметки
- fixtures
- resolve.ts
- challenge/types.ts
- storage/index.ts
- DrawingPrimitive
- Подключение Supabase и Vercel (с телефона)
- TimeIndex
- Команда агентов — Trading Lab
- playwright.config.ts
- vercel.json
- 3. Внутренние HTTP API
- ADR-0001: Next.js 16 + TypeScript strict, pnpm monorepo, Vercel
- ADR-0003: Живые данные грузит браузер напрямую (REST + WS), fallback — REST-polling
- ADR-0004: История для заданий — сервер читает архив data.binance.vision
- ADR-0006: Синхронизация таймфреймов — нативные ТФ, инвариант агрегации, sliceAt
- ADR-0007: Правила исхода сделки Challenge (drill-down)
- ADR-0008: Local-first хранилище за интерфейсом Repository; Supabase в M7
- 6. Внешние API Binance
- 8. FVG (Fair Value Gap)
- ADR-0009: Детерминированное общее ядро @tl/core; разборы по шаблонам; ИИ позже
- 6. Liquidity sweep
- 3. Внешняя и внутренняя структура
- DECISIONS/README.md

## God Nodes (most connected - your core abstractions)
1. `Candle` - 92 edges
2. `Mark` - 86 edges
3. `UtcMs` - 79 edges
4. `react` - 75 edges
5. `TaskTimeframe` - 51 edges
6. `cn()` - 46 edges
7. `analyzeStructure()` - 45 edges
8. `Button()` - 40 edges
9. `TradingChart()` - 36 edges
10. `LocalRepository` - 33 edges

## Surprising Connections (you probably didn't know these)
- `1. HIGH: open redirect в /auth/callback (исправлено)` --references--> `safeNextPath()`  [INFERRED]
  docs/SECURITY_REVIEW.md → apps/web/src/auth/config.ts
- `P2` --references--> `GradeLegend()`  [INFERRED]
  docs/design/AUDIT.md → apps/web/src/features/feedback/GradeLegend.tsx
- `14.3 Оценка качества 0–100 (ответ на OQ-08), независимо от исхода` --references--> `key()`  [INFERRED]
  docs/specs/ALGORITHMS.md → apps/web/src/features/guide/introStore.ts
- `P1` --references--> `fmtPrice()`  [INFERRED]
  docs/design/AUDIT.md → apps/web/src/features/progress/ErrorLog.tsx
- `1. Принципы` --references--> `localDay()`  [INFERRED]
  docs/DATABASE_SCHEMA.md → apps/web/src/i18n/format.ts

## Import Cycles
- 2-file cycle: `packages/core/src/candles/aggregate.ts -> packages/core/src/index.ts -> packages/core/src/candles/aggregate.ts`

## Communities (152 total, 11 thin omitted)

### Community 0 - "market-structure.ts"
Cohesion: 0.10
Nodes (41): mutate(), mulberry32(), randInt(), atrAt(), buildMsQuestion(), Candidate, checkMsWindow(), CORE_CONCEPTS (+33 more)

### Community 1 - "Repository"
Cohesion: 0.07
Nodes (21): SupabaseRepository, Repository, graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила (+13 more)

### Community 2 - "terminal.helpers.ts"
Cohesion: 0.15
Nodes (24): Box, candlePoint(), chartCandles(), coreLevels(), coreMarks(), drawAlgoMark(), drawTwoPoint(), findVisibleBos() (+16 more)

### Community 3 - "API Contracts — Trading Lab"
Cohesion: 0.13
Nodes (14): 1.1 Формат ошибки, 1.2 Заголовки кэша, 1. Общие соглашения, 2.2 Расширения контрактов (предложение — фиксируются при реализации в `@tl/core`), 2. Типы `@tl/core`, используемые в контрактах, 4.1 Шкала задания, 4.2 Типы ответа (`Answer`), 4. Шкала времени заданий и ответы (+6 more)

### Community 4 - "features/feedback/index.ts"
Cohesion: 0.16
Nodes (22): errors, feedback, defaultFmt, FeedbackView(), FeedbackViewProps, Section(), DIR, formatParam() (+14 more)

### Community 5 - "with"
Cohesion: 0.08
Nodes (26): runs-on, steps, GITHUB_TOKEN, jobs, check, secrets-scan, name, on (+18 more)

### Community 6 - "Architecture — Trading Lab"
Cohesion: 0.14
Nodes (14): 10. Развёртывание, 11. Риски, 1. Ключевые ограничения, определяющие архитектуру, 2. Обзор, 3. Репозиторий (pnpm monorepo), 4.1 Синхронизация таймфреймов, 4.2 Разметка (общая модель для пользователя и алгоритма), 4.3 Алгоритмы (детерминированные, версионируемые) (+6 more)

### Community 7 - "MsMarkBody.tsx"
Cohesion: 0.13
Nodes (27): Page(), MsMarkBody(), highlightMarks(), MsQuestionBody(), MsSessionScreen(), msMarkAnswer(), msQuestionAnswer(), userOnly() (+19 more)

### Community 8 - "tools.ts"
Cohesion: 0.19
Nodes (16): GroupId, groupOf(), GROUPS, HOTKEY_OF, HOTKEYS, ic, MOBILE_GROUPS, TerminalTool (+8 more)

### Community 9 - "market-data/package.json"
Cohesion: 0.11
Nodes (20): dependencies, fflate@^0.8.3, @tl/core@workspace:*, devDependencies, vitest@^4.1.12, @vitest/coverage-v8@^4.1.12, exports, ./archive (+12 more)

### Community 10 - "UtcMs"
Cohesion: 0.15
Nodes (16): Draft, DailyActivityRow, SkillStatRow, TerminalMarksRow, TradingLabDB, defaultSettings(), LocalSnapshot, mark (+8 more)

### Community 11 - "core/src/index.ts"
Cohesion: 0.17
Nodes (21): TerminalPage(), ARCHIVE_MIN_AGE_MS, ARCHIVE_SYMBOLS, archiveAllowed(), archiveHref(), archivePageSize(), archiveWindow(), normalizeSymbolInput() (+13 more)

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
Nodes (34): SetupFieldProps, Badge(), BadgeProps, BottomSheetProps, HEIGHT, SheetHeight, ButtonProps, ButtonSize (+26 more)

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
Cohesion: 0.06
Nodes (57): age(), CHALLENGE_STRUCTURE, ChallengeFacts, computeChallengeFacts(), HTF, intersects(), lastEventSince(), poiFor() (+49 more)

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

### Community 28 - "ADR-0005: Stateless-задания с подписанными токенами; будущее только на сервере"
Cohesion: 0.29
Nodes (6): ADR-0005: Stateless-задания с подписанными токенами; будущее только на сервере, Контекст, Открытые вопросы, Последствия, Рассмотренные альтернативы, Решение

### Community 29 - "PaFindBody.tsx"
Cohesion: 0.15
Nodes (21): Page(), PaFindBody(), PaLevelBody(), INTRO, PaSessionScreen(), ContextFactors, impliedDirection(), keepSingleLevel() (+13 more)

### Community 30 - "TaskTimeframe"
Cohesion: 0.15
Nodes (14): Side, atrOf(), createSessionStore(), INITIAL, Phase, SessionState, SessionStore, Speed (+6 more)

### Community 31 - "4. Обязательные наборы тестов"
Cohesion: 0.29
Nodes (7): 4.1 Инвариант агрегации таймфреймов, 4.2 `sliceAt(series, T)`, 4.3 Нормализация (`market-data`), 4.4 Golden-тесты SMC/PA, 4.5 `resolveTrade`, 4.6 Интеграционные тесты API, 4. Обязательные наборы тестов

### Community 32 - "fetch-fixtures.mjs"
Cohesion: 0.07
Nodes (29): dynamic, GET(), safeEqual(), ChallengeAttemptStat, challengeStats(), dailyProgress(), DayMap, DayRecord (+21 more)

### Community 33 - "Trading Lab"
Cohesion: 0.33
Nodes (6): Trading Lab, Быстрый старт, Документация, Команды, Ограничения, Структура

### Community 34 - "token.ts"
Cohesion: 0.11
Nodes (27): zod@^4.0.0, ApiError, ConfigError, b64(), derive(), getSigningSecret(), HeaderSchema, invalid() (+19 more)

### Community 35 - "Segmented"
Cohesion: 0.13
Nodes (20): Page(), Page(), csp, nextConfig, MsSetup(), PaSetup(), CommonFields(), msQuery() (+12 more)

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
Nodes (35): 2.1 Из `ARCHITECTURE.md` §4 (дословно), Решение, 2.1 Сигнатура, 2.2 Определение, 2.3 Граничные случаи, 2.4 Кандидаты у правого края (`pendingSwings`), 2.5 Псевдокод, 2. `detectSwings` — фрактальные swing (+27 more)

### Community 45 - "tasks.ts"
Cohesion: 0.10
Nodes (40): cutoffOf(), futureProviderFor(), loadClosedBefore(), loadMinutes(), buildChallenge(), buildMs(), ChReq, gradeChallengeTask() (+32 more)

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
Nodes (42): dependencies, dexie@^4.0.0, lightweight-charts@~5.2.1, lucide-react@^1.66.0, next@^16.0.0, react@^19.0.0, react-dom@^19.0.0, @supabase/ssr@^0.12.7 (+34 more)

### Community 52 - "patterns.ts"
Cohesion: 0.19
Nodes (20): c(), 1.2 Термины свечи, 9.1 Состав (ответ на OQ-11), 9.2 Критерии (ATR = ATR14 последней свечи модели, если не сказано иное; модель не ищется при ATR = null или `range == 0`), 9.3 Выход, 9.4 Проверенные примеры (BTCUSDT 4h 2026-09, GS-5), 9. Свечные модели Price Action (`detectPatterns`), body() (+12 more)

### Community 53 - "rules.ts"
Cohesion: 0.11
Nodes (39): constrainAnchors(), createMark(), FULL_WIDTH_KINDS, isDrawKind(), MarkExtra, RAY_RIGHT_KINDS, SWING_SIDE, TOOL_DEFS (+31 more)

### Community 54 - "terms.tsx"
Cohesion: 0.14
Nodes (21): dismissIntro(), isIntroDismissed(), key(), TaskIntro(), TaskIntroProps, Host(), byAlias, pattern (+13 more)

### Community 55 - "TradingChart.tsx"
Cohesion: 0.18
Nodes (14): limitCandles(), OPEN_CANDLE_ALPHA, pricePrecision(), T0, tokens, toCandleData(), toVolumeData(), VOLUME_ALPHA (+6 more)

### Community 56 - "build.ts"
Cohesion: 0.16
Nodes (27): Core, GradeResultApi, 5.2 `Feedback` (6 частей, FR-FB-02), 17.1 Структура и ключи, 17.2 Верность и общие принципы, 17.3 Что понято верно (`OkCode`; новые помечены *), 17.4 Ошибки (части 3–6), 17. Шаблоны разбора (источник `src/i18n/ru/feedback`) (+19 more)

### Community 57 - "TradingChart.tsx"
Cohesion: 0.14
Nodes (20): PointerKind, PointerInput, centeredLogicalRange(), defaultLogicalRange(), LogicalRange, logicalRangeFromWindow(), padRangeForMarks(), T0 (+12 more)

### Community 58 - "TradingChart"
Cohesion: 0.13
Nodes (15): DrawKind, DrawingController, bosMark, breakIdx, drag(), index, lvl, proj (+7 more)

### Community 59 - "src/types.ts"
Cohesion: 0.12
Nodes (31): PoiInfo, allLayerSwings(), endTimeOf(), eventMark(), fvgMark(), IndexWindow, KIND_CONCEPT, MarkClass (+23 more)

### Community 60 - "Mark"
Cohesion: 0.10
Nodes (16): anchor, KINDS, MARKS_FORMAT_VERSION, markSchema, parseMarks(), serializeMarks(), m, validateMarks() (+8 more)

### Community 61 - "session/types.ts"
Cohesion: 0.15
Nodes (28): SHORT, common(), CommonParams, Get, MsParams, PaParams, parseMsParams(), parsePaParams() (+20 more)

### Community 62 - "placeholders.test.ts"
Cohesion: 0.10
Nodes (24): algoOf(), ALL, at(), candles, findAlgo(), P, r, window (+16 more)

### Community 63 - "HomeBlocks.tsx"
Cohesion: 0.26
Nodes (18): ContinueBlock(), HomeWeakSpots(), ModuleAccuracy(), canTrain(), moduleAccuracies(), recommend(), selectWeak(), trendOf() (+10 more)

### Community 64 - "MarkSession.tsx"
Cohesion: 0.10
Nodes (37): ControllerNotice, decimalsForTick(), makePriceFormatter(), TICK_TABLE, tickSizeFor(), TradingChartHandle, fmtOf(), Annotated() (+29 more)

### Community 65 - "archive.ts"
Cohesion: 0.21
Nodes (11): AGG_TRADES_HEADER, AggTrade, ARCHIVE_BASE_URL, ArchiveFetch, ArchiveFileSpec, ArchiveSourceOptions, dayKey(), monthKey() (+3 more)

### Community 66 - "core/src/index.ts"
Cohesion: 0.14
Nodes (19): load(), klinesZip(), NOW, Served, zipOf(), ArchiveErrorCode, ARCHIVE_KLINE_HEADER, Gap (+11 more)

### Community 67 - "README.md"
Cohesion: 0.20
Nodes (3): Known Issues — Trading Lab, Не проверено вообще (среда), Открыто

### Community 68 - "SupabaseRepository.ts"
Cohesion: 0.14
Nodes (24): chunks(), IMPORTED_USER_META, ImportOutcome, importSnapshot(), must(), recomputeDerived(), Row, runFirstSignInImport() (+16 more)

### Community 69 - "grade.ts"
Cohesion: 0.20
Nodes (16): kindName(), Entry, gradeMarks(), Group, groupEvaluated(), groupOf(), iou(), MAJOR (+8 more)

### Community 70 - "schemas.ts"
Cohesion: 0.07
Nodes (43): dynamic, maxDuration, POST(), runtime, dynamic, maxDuration, POST(), runtime (+35 more)

### Community 71 - "next-resilience.test.ts"
Cohesion: 0.10
Nodes (22): getDeps(), getHistoryLimiter(), rateFromEnv(), guard(), HandlerDeps, deps(), fixtures, NOW (+14 more)

### Community 72 - "13. Генерация заданий"
Cohesion: 0.33
Nodes (6): 13.1 Общие правила, 13.2 Market Structure «Разметка» (поправка v1.1, `ALGO_VERSION 1.1.0`), 13.3 Market Structure «Вопрос», 13.4 Price Action, 13.5 Challenge, 13. Генерация заданий

### Community 73 - "Settings"
Cohesion: 0.09
Nodes (18): ImportReport, DailyActivity, 1. Принципы, 2. Локальная схема: IndexedDB (Dexie), 3.1 RLS, 3. Схема Supabase Postgres (M7), 4.1 Порядок, 4.2 Правила по таблицам (идемпотентность по `id`, конфликты по `updated_at`) (+10 more)

### Community 74 - "SettingsScreen.tsx"
Cohesion: 0.18
Nodes (15): Page(), Page(), ErrorState(), LoadingRows(), useAsync(), LearnScreen(), MODULES, DailyGoal() (+7 more)

### Community 75 - "Находки"
Cohesion: 0.22
Nodes (9): 1. HIGH: open redirect в /auth/callback (исправлено), 2. MEDIUM: обход rate limit через X-Forwarded-For (исправлено частично), 4. LOW: /api/cron/keepalive (открыто), 5. LOW: Supabase (повторное чтение 0001_init.sql), 6. LOW: заголовки/CSP (фактически curl на production-сборке), 7. LOW: токены (src/server/token.ts) - корректно, 8. Утечка даты Challenge, 9. Ввод, лимиты, XSS, хранилища (+1 more)

### Community 76 - "live.test.ts"
Cohesion: 0.06
Nodes (29): Frontend Developer, BINANCE_REST_BASE, BINANCE_WS_BASE, binanceInterval(), FetchKlinesOptions, LiveErrorCode, LiveFeed, LiveFeedError (+21 more)

### Community 77 - "sources.ts"
Cohesion: 0.13
Nodes (18): ARCHIVE_START, ArchiveLoaderOptions, CHALLENGE_FUTURE_MS, ChallengeZone, Chunk, countClosedBefore(), DAY_MS, depthOf() (+10 more)

### Community 78 - "screens.test.tsx"
Cohesion: 0.45
Nodes (8): AppShell(), BottomTabs(), DesktopTabs(), ICONS, activeNav(), isChartRoute(), NAV_ITEMS, NavId

### Community 79 - "ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`"
Cohesion: 0.17
Nodes (12): 16.1 Навыки, 16.2 Обновление точности, 16.3 Адаптивная подборка, 16. Навыки и прогресс, 18.1 Формат и процесс, 18.3 Что ещё размечается после утверждения (M4/M5), 18. Golden-тесты, 20. Спорные места и вопросы оркестратору (+4 more)

### Community 80 - "ChallengeSession.tsx"
Cohesion: 0.17
Nodes (18): AppError(), ChallengeSessionPage(), NotFound(), buildAttempt(), ChallengeSession(), FOCUS_SKILLS, SHEET_PAD, toError() (+10 more)

### Community 81 - "AUDIT — финальный дизайн-аудит Trading Lab (M8-UI)"
Cohesion: 0.20
Nodes (9): 1. Итог, 2. Находки, 3. Impeccable detect (по URL production-сборки), 4. Что проверено и ограничения, 5. Порядок исправления, AUDIT — финальный дизайн-аудит Trading Lab (M8-UI), P1, P2 (+1 more)

### Community 82 - "placeholders.test.ts"
Cohesion: 0.11
Nodes (18): attempt(), 5. Дефекты, buildFeedback(), matchedOf(), okFromOutcomes(), algo, ALL, assertFilled() (+10 more)

### Community 83 - "i18n/format.ts"
Cohesion: 0.18
Nodes (20): EmptyState(), FORMATTERS(), ErrorLog(), errorName(), fmtPrice(), Review(), textOf(), buildErrorLog() (+12 more)

### Community 84 - "PRD — Trading Lab"
Cohesion: 0.05
Nodes (42): 10. Приоритизация функций (MoSCoW), 11. План MVP, 12. Открытые вопросы, 1.1 Что это, 1.2 Цель, 1.3 Целевой пользователь, 1.4 Модули, 1. Обзор и цель продукта (+34 more)

### Community 85 - "TaskSession.tsx"
Cohesion: 0.17
Nodes (22): AnswerSessionProps, createTaskApi(), kindOf(), post(), TaskApi, buildAttempt(), BuildAttemptInput, saveTaskAttempt() (+14 more)

### Community 86 - "11. Контекст для PA «Контекст»"
Cohesion: 0.29
Nodes (7): 11.1 Формат ответа (ответ на OQ-16), 11.2 Задание, 11.3 Факторы (детерминированно, для бычьей модели; медвежья — зеркально), 11.4 Значимость (решение), 11.5 Оценка, 11.6 Генерация, 11. Контекст для PA «Контекст»

### Community 87 - "14. Challenge: эталон, оценка качества, WAIT, лимиты"
Cohesion: 0.29
Nodes (7): 14.1 Факты на момент T (`ChallengeFacts`), 14.2 Эталонная сторона `refSide`, 14.3 Оценка качества 0–100 (ответ на OQ-08), независимо от исхода, 14.4 Правильность, вердикт, лимиты, 14.5 Предикаты причин (`ReasonCode`, состав без изменений), 14.6 Подсказки (easy), 14. Challenge: эталон, оценка качества, WAIT, лимиты

### Community 88 - "position.ts"
Cohesion: 0.28
Nodes (14): blockerKey(), DecisionPanel(), errorCopy(), PriceField(), buildAnswer(), defaultLevels(), formatRR(), parsePrice() (+6 more)

### Community 89 - "5. Тренд, BOS и CHoCH"
Cohesion: 0.33
Nodes (6): 5.1 Общие правила, 5.2 Внешний слой — машина состояний с защищёнными уровнями, 5.3 Внутренний слой — «последний подтверждённый swing», 5.4 Что происходит после CHoCH, 5.5 Граничные случаи (проверены на реальных свечах), 5. Тренд, BOS и CHoCH

### Community 90 - "golden.pa-challenge.test.ts"
Cohesion: 0.10
Nodes (14): c4h, FIX, all, at(), c4h, idx(), ts(), loadAggTrades() (+6 more)

### Community 91 - "lucide-react"
Cohesion: 0.18
Nodes (16): isScopedKind(), NoticeCode, ORDER, ResultSheet(), ResultSheetHeight, ResultSheetProps, SHEET_CLASS, SHEET_PAD (+8 more)

### Community 92 - "package.json"
Cohesion: 0.12
Nodes (21): devDependencies, eslint@^9.39.0, eslint-config-next@^16.0.0, @eslint/js@^9.39.0, @playwright/test@1.63.0, prettier@^3.6.0, @types/node@^22.0.0, typescript@~5.9.3 (+13 more)

### Community 93 - "ArchiveSource"
Cohesion: 0.19
Nodes (6): FIX, FixtureLoader, flaky(), RawAggTrade, ArchiveSource, ArchiveError

### Community 94 - "1. Общие соглашения"
Cohesion: 0.33
Nodes (6): 1.1 Входные свечи, 1.3 ATR, 1.4 Детерминизм и числа, 1.5 ALGO_VERSION, 1.6 Параметры по сложностям (сводка), 1. Общие соглашения

### Community 95 - "7. Order Block"
Cohesion: 0.50
Nodes (4): 7.1 Определение (решение, ICT: «последняя противоположная свеча перед импульсом, сломавшим структуру»), 7.2 Статус (после свечи события `k`, по закрытым свечам), 7.3 Сигнатура, 7. Order Block

### Community 97 - "reveal.ts"
Cohesion: 0.16
Nodes (14): partMax(), ResultView(), DIR_RU, formatScenarioDate(), localizeParam(), POI_RU, resolutionNote(), revealFeedback() (+6 more)

### Community 98 - "history/route.ts"
Cohesion: 0.11
Nodes (16): ARCHIVE_START_MS, dynamic, errorResponse(), GET(), ISSUE_CODES, querySchema, runtime, SYMBOLS (+8 more)

### Community 99 - "src/feedback/index.ts"
Cohesion: 0.14
Nodes (27): decimalsOf(), DIRECTION_RU, displayValue(), formatFeedbackParams(), normalizeParams(), PARAM_KINDS, ParamFormatters, ParamKind (+19 more)

### Community 100 - "hints.ts"
Cohesion: 0.36
Nodes (5): external(), selectHints(), time(), 12.4 Совместимость и стоимость пары, 3.4 Отображение в `Mark` (общая модель `ARCHITECTURE.md` §4.2)

### Community 102 - "Стратегия тестирования — Trading Lab"
Cohesion: 0.20
Nodes (10): 10. Производительность, 1. Принципы, 2. Пирамида, 3. Фикстуры, 5. E2E (Playwright), 6. Визуальная проверка и доступность, 7. Критерии «готово» для вехи, 8. CI (GitHub Actions) (+2 more)

### Community 103 - "DrawingPrimitive.ts"
Cohesion: 0.27
Nodes (11): OpenCandleInfo, PrimitiveState, ZONE_KINDS, CandleHighlight, dimSpans(), HighlightColumn, highlightColumns(), HighlightRange (+3 more)

### Community 104 - "runCheck.ts"
Cohesion: 0.15
Nodes (15): CheckPanelProps, CheckOutcome, CheckResult, CheckState, CONCEPT_OF, conceptsFor(), RANGE_TAIL_CANDLES, runCheck() (+7 more)

### Community 105 - "ref_vitest"
Cohesion: 0.14
Nodes (8): contractAttempt(), contractMark, runRepositoryContract(), FakeSupabase, Row, UNIQUE, seedLocal(), @supabase/supabase-js

### Community 106 - "MarksSheet.tsx"
Cohesion: 0.20
Nodes (10): MarksSheet(), MarksSheetProps, describeMark(), formatWhen, markName(), fmt, t, cx (+2 more)

### Community 107 - "toolGroups.tsx"
Cohesion: 0.24
Nodes (13): ToolId, MarkSessionProps, SessionBase, Cell(), groupOf(), TaskToolbarBar(), TaskToolbarProps, TaskToolRail() (+5 more)

### Community 108 - "@playwright/test"
Cohesion: 0.19
Nodes (11): DATE_LEAK, expandResult(), lastCandleTime(), num(), openReasons(), projectPoint(), SESSION_URL(), startSession() (+3 more)

### Community 109 - "Roadmap — Trading Lab"
Cohesion: 0.29
Nodes (6): MVP, Roadmap — Trading Lab, v1.1 — Fibonacci Playground и Premium/Discount, v1.2 — Elliott Wave Lab, v2, Правила корректировки

### Community 110 - "2. Карточки"
Cohesion: 0.22
Nodes (9): 2. Карточки, Chart Developer, DevOps/Security Engineer, Documentation Engineer, Market Data Engineer, Orchestrator, QA Engineer, Technical Analyst (+1 more)

### Community 111 - "core/src/index.ts"
Cohesion: 0.21
Nodes (10): dynamic, GET(), Backend Developer, aggregate(), SeriesByTf, sliceAt(), synthetic_hour(), synthetic_m1() (+2 more)

### Community 112 - "pa/index.ts"
Cohesion: 0.11
Nodes (37): buildPa(), CONTEXT_STRUCTURE, ContextAnswer, ContextReference, HTF_OF, htfClosedAt(), HtfTrend, patternToMark() (+29 more)

### Community 114 - "ref_vitest"
Cohesion: 0.10
Nodes (34): metadata, plexMono, plexSans, RootLayout(), viewport, AuthContext, AuthRepositoryProvider(), DISABLED (+26 more)

### Community 115 - "useMarketData.ts"
Cohesion: 0.22
Nodes (12): HISTORY_PAGE, SourceMode, appendCandle(), ArchiveHttpError, DataStatus, fetchArchive(), LoadError, MarketState (+4 more)

### Community 116 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, check:tokens, dev, format, lint, sync:tokens, test (+2 more)

### Community 117 - "progressLogic.ts"
Cohesion: 0.10
Nodes (31): asCore(), avgQuality(), ErrorExample, ErrorGroup, groupByModule(), hasEnoughData(), MODULE_ORDER, ModuleAccuracy (+23 more)

### Community 118 - "axis.ts"
Cohesion: 0.27
Nodes (9): AxisTick, axisTicks(), relativeDuration(), relativeLabel(), STEPS, T, AXIS_H, PRICE_SCALE_W (+1 more)

### Community 119 - "criteria.ts"
Cohesion: 0.24
Nodes (17): body(), bottom(), dojiItems(), engulfItems(), finish(), insideItems(), Item, patternCheck() (+9 more)

### Community 120 - "ms.helpers.ts"
Cohesion: 0.35
Nodes (8): checkAndSeeResult(), nextThenHomeShowsDone(), openSession(), shot(), tapCandle(), solveOne(), chartBox(), selectTool()

### Community 121 - "handlers.test.ts"
Cohesion: 0.16
Nodes (12): CH, challengeDeps(), grade(), Json, loader, mkDeps(), MS_MARK, MS_Q (+4 more)

### Community 122 - "context.ts"
Cohesion: 0.16
Nodes (17): 18.2 Участки, computeContext(), ContextEvidence, externalSwings(), isSignificant(), obContainsExtreme(), c15, c4h (+9 more)

### Community 123 - "challenge/api.ts"
Cohesion: 0.29
Nodes (6): ChallengeApiError, ChallengeErrorKind, fetchNext(), gradeChallenge(), kindOf(), post()

### Community 124 - "ProgressScreen.tsx"
Cohesion: 0.16
Nodes (22): ChallengePage(), Page(), ChallengeHome(), DIFFS, recentLine(), StartTf, Stats(), TF_OPTIONS (+14 more)

### Community 125 - "QA Report — финальная приёмка MVP Trading Lab (M8)"
Cohesion: 0.25
Nodes (7): 1. Сводка, 2. Таблица AC, 3. Ключевые инварианты, 4. Производительность (headless Chromium, software rendering, CPU throttling 4x), 6. Бэклог оркестратора, 7. Не удалось проверить, QA Report — финальная приёмка MVP Trading Lab (M8)

### Community 126 - "useRepository"
Cohesion: 0.20
Nodes (13): DayStat, prevDay(), softStreak(), done, AsyncState, DailyProgress, useAttempts(), useDailyProgress() (+5 more)

### Community 127 - "12. `gradeMarks` — сравнение разметки"
Cohesion: 0.25
Nodes (8): 12.1 Сигнатура (расширение `API_CONTRACTS.md`), 12.2 Ключевая свеча метки, 12.3 Группы сопоставления, 12.5 Матчинг (решение: DP по времени вместо венгерского), 12.6 Классификация после матчинга, 12.7 Счёт, вердикт, навыки, 12.8 Пример AC-07 на реальных данных (GS-1), 12. `gradeMarks` — сравнение разметки

### Community 128 - "fixtures"
Cohesion: 0.50
Nodes (3): fixtures, recorded/ - записанные форматы API (fapi/fstream недоступны из облака, 451), Архивные CSV

### Community 129 - "resolve.ts"
Cohesion: 0.10
Nodes (24): ControllerDeps, 10.1 Алгоритм, 10.2 Эталон для «Проведи уровень», 10. `findLevels` — уровни поддержки/сопротивления, FactsInput, AggTrade, done(), FutureProvider (+16 more)

### Community 130 - "challenge/types.ts"
Cohesion: 0.24
Nodes (7): AnswerInput, ChallengeAnswerBody, ChallengeDetailDto, ChallengeOutcomeDto, ChallengePayload, QualityPart, ReasonCode

### Community 131 - "storage/index.ts"
Cohesion: 0.18
Nodes (16): dynamic, GET(), dynamic, Page(), AuthState, getBrowserSupabase(), isSupabaseConfigured(), safeNextPath() (+8 more)

### Community 133 - "Подключение Supabase и Vercel (с телефона)"
Cohesion: 0.20
Nodes (10): 1. Проект Supabase, 2. Применить миграцию (создать таблицы), 3. Ключи Supabase, 4. Вход через Google, 5. Redirect URL в Supabase, 6. Vercel, 7. Проверка на телефоне, Если что-то не работает (+2 more)

### Community 134 - "TimeIndex"
Cohesion: 0.11
Nodes (13): lwcProjection(), snapAnchor(), SnapOptions, snapPriceToCandle(), synthetic_candles, T0, T0, TimeIndex (+5 more)

### Community 135 - "Команда агентов — Trading Lab"
Cohesion: 0.25
Nodes (7): 1. Сводка, 3. Правила оркестрации, 4. Формат отчёта агента (до 15 строк), 5. Шаблон задания агенту, 6. Уроки оркестрации, Команда агентов — Trading Lab, Правило graphify (включается в каждый промпт агента, исследующего код)

### Community 136 - "playwright.config.ts"
Cohesion: 0.50
Nodes (3): INTRO_DISMISSED, INTRO_KEYS, PORT

### Community 139 - "3. Внутренние HTTP API"
Cohesion: 0.33
Nodes (6): 3.1 `GET /api/health`, 3.2 `GET /api/history`, 3.3 `POST /api/tasks/{module}/next`, 3.4 `POST /api/tasks/{module}/grade`, 3.5 Токен задания (`taskToken`), 3. Внутренние HTTP API

### Community 140 - "ADR-0001: Next.js 16 + TypeScript strict, pnpm monorepo, Vercel"
Cohesion: 0.33
Nodes (5): ADR-0001: Next.js 16 + TypeScript strict, pnpm monorepo, Vercel, Контекст, Последствия, Рассмотренные альтернативы, Решение

### Community 141 - "ADR-0003: Живые данные грузит браузер напрямую (REST + WS), fallback — REST-polling"
Cohesion: 0.33
Nodes (5): ADR-0003: Живые данные грузит браузер напрямую (REST + WS), fallback — REST-polling, Контекст, Последствия, Рассмотренные альтернативы, Решение

### Community 142 - "ADR-0004: История для заданий — сервер читает архив data.binance.vision"
Cohesion: 0.33
Nodes (5): ADR-0004: История для заданий — сервер читает архив data.binance.vision, Контекст, Последствия, Рассмотренные альтернативы, Решение

### Community 143 - "ADR-0006: Синхронизация таймфреймов — нативные ТФ, инвариант агрегации, sliceAt"
Cohesion: 0.33
Nodes (5): ADR-0006: Синхронизация таймфреймов — нативные ТФ, инвариант агрегации, sliceAt, Контекст, Последствия, Рассмотренные альтернативы, Решение

### Community 144 - "ADR-0007: Правила исхода сделки Challenge (drill-down)"
Cohesion: 0.33
Nodes (6): ADR-0007: Правила исхода сделки Challenge (drill-down), Контекст, Открытые вопросы (закрыты: `docs/specs/ALGORITHMS.md`), Последствия, Рассмотренные альтернативы, Решение

### Community 145 - "ADR-0008: Local-first хранилище за интерфейсом Repository; Supabase в M7"
Cohesion: 0.33
Nodes (5): ADR-0008: Local-first хранилище за интерфейсом Repository; Supabase в M7, Контекст, Открытые вопросы, Последствия, Рассмотренные альтернативы

### Community 146 - "6. Внешние API Binance"
Cohesion: 0.40
Nodes (5): status(), 6.1 REST: `GET https://fapi.binance.com/fapi/v1/klines` (браузер), 6.2 WebSocket: kline stream (браузер), 6.3 Архив data.binance.vision (сервер), 6. Внешние API Binance

### Community 147 - "8. FVG (Fair Value Gap)"
Cohesion: 0.50
Nodes (4): 8.1 Определение, 8.2 Заполнение, 8.3 Сигнатура, 8. FVG (Fair Value Gap)

### Community 148 - "ADR-0009: Детерминированное общее ядро @tl/core; разборы по шаблонам; ИИ позже"
Cohesion: 0.40
Nodes (4): ADR-0009: Детерминированное общее ядро @tl/core; разборы по шаблонам; ИИ позже, Контекст, Последствия, Рассмотренные альтернативы

### Community 149 - "6. Liquidity sweep"
Cohesion: 0.40
Nodes (5): 6.1 Определение (решение), 6.2 Несколько уровней за одну свечу, 6.3 Граничные случаи, 6.4 Сигнатура, 6. Liquidity sweep

### Community 150 - "3. Внешняя и внутренняя структура"
Cohesion: 0.50
Nodes (4): 3.1 Правило (решение), 3.2 Дедупликация, 3.3 Сигнатура `analyzeStructure`, 3. Внешняя и внутренняя структура

## Knowledge Gaps
- **13 isolated node(s):** `ADR-0008`, `ADR-0007`, `ADR-0006`, `ADR-0005`, `ADR-0005` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1000 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Mark` connect `Mark` to `resolve.ts`, `challenge/types.ts`, `terminal.helpers.ts`, `TimeIndex`, `MsMarkBody.tsx`, `UtcMs`, `core/src/index.ts`, `facts.ts`, `hit.ts`, `PaFindBody.tsx`, `TaskTimeframe`, `tasks.ts`, `rules.ts`, `build.ts`, `TradingChart.tsx`, `TradingChart`, `src/types.ts`, `session/types.ts`, `placeholders.test.ts`, `MarkSession.tsx`, `SupabaseRepository.ts`, `grade.ts`, `ChallengeSession.tsx`, `placeholders.test.ts`, `TaskSession.tsx`, `lucide-react`, `1. Общие соглашения`, `hints.ts`, `DrawingPrimitive.ts`, `runCheck.ts`, `ref_vitest`, `MarksSheet.tsx`, `toolGroups.tsx`, `handlers.test.ts`, `context.ts`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Mark` (e.g. with `Контекст` and `Последствия`) actually correct?**
  _`Mark` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0008`, `ADR-0007`, `ADR-0006` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `market-structure.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10144927536231885 - nodes in this community are weakly interconnected._
- **Why does `Candle` connect `resolve.ts` to `market-structure.ts`, `challenge/types.ts`, `TimeIndex`, `UtcMs`, `6. Внешние API Binance`, `facts.ts`, `TaskTimeframe`, `src/types.ts`, `tasks.ts`, `patterns.ts`, `rules.ts`, `TradingChart.tsx`, `build.ts`, `TradingChart.tsx`, `TradingChart`, `src/types.ts`, `Mark`, `session/types.ts`, `placeholders.test.ts`, `MarkSession.tsx`, `archive.ts`, `core/src/index.ts`, `next-resilience.test.ts`, `live.test.ts`, `sources.ts`, `TaskSession.tsx`, `golden.pa-challenge.test.ts`, `ArchiveSource`, `runCheck.ts`, `toolGroups.tsx`, `core/src/index.ts`, `pa/index.ts`, `useMarketData.ts`, `criteria.ts`, `handlers.test.ts`, `context.ts`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `UtcMs` (e.g. with `1. Общие соглашения` and `4.1 Шкала задания`) actually correct?**
  _`UtcMs` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Repository` be split into smaller, more focused modules?**
  _Cohesion score 0.0735632183908046 - nodes in this community are weakly interconnected._