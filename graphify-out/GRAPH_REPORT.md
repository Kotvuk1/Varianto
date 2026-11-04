# Graph Report - Varianto  (2026-11-04)

## Corpus Check
- 413 files · ~220,244 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 32 file(s) not represented in the graph (top: .csv 26, (none) 4, .example 1)

## Summary
- 2848 nodes · 7895 edges · 141 communities (132 shown, 9 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 227 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `00bf5272`
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
- Settings
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
- LocalRepository
- skills.ts
- Trading Lab
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
- tasks.ts
- LAYOUTS — Trading Lab
- 2. Компоненты
- DESIGN — Trading Lab
- COPY — микрокопия Trading Lab
- check_tokens.py
- web/package.json
- challenge/generate.ts
- rules.ts
- terms.tsx
- TradingChart.tsx
- build.ts
- TradingChart.tsx
- TradingChart
- src/types.ts
- Candle
- session/types.ts
- placeholders.test.ts
- fetch-fixtures.mjs
- MarkSession.tsx
- Timeframe
- core/src/index.ts
- README.md
- SupabaseRepository.ts
- grade.ts
- schemas.ts
- deps.ts
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
- quality.ts
- i18n/format.ts
- PRD — Trading Lab
- TaskSession.tsx
- 11. Контекст для PA «Контекст»
- 14. Challenge: эталон, оценка качества, WAIT, лимиты
- position.ts
- 5. Тренд, BOS и CHoCH
- patterns.ts
- features/feedback/format.ts
- package.json
- next-resilience.test.ts
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
- 4. Функциональные требования
- ref_vitest
- Mark
- controller.test.ts
- @playwright/test
- Roadmap — Trading Lab
- 2. Карточки
- sliceAt
- pa/index.ts
- Query
- ref_vitest
- ref_node_crypto
- scripts
- ProgressScreen.tsx
- 7. User Flows
- criteria.ts
- ms.helpers.ts
- handlers.test.ts
- src/types.ts
- 4. Миграция локальных данных в Supabase при первом входе
- ProgressScreen.tsx
- QA Report — финальная приёмка MVP Trading Lab (M8)
- useRepository
- 12. `gradeMarks` — сравнение разметки
- fixtures
- resolve.ts
- 1. Обзор и цель продукта
- storage/index.ts
- health/route.ts
- Подключение Supabase и Vercel (с телефона)
- TimeIndex
- Команда агентов — Trading Lab
- playwright.config.ts
- vercel.json
- 16. Навыки и прогресс
- 8. FVG (Fair Value Gap)

## God Nodes (most connected - your core abstractions)
1. `Candle` - 92 edges
2. `Mark` - 84 edges
3. `UtcMs` - 79 edges
4. `react` - 75 edges
5. `TaskTimeframe` - 50 edges
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
- `4.2 Типы ответа (`Answer`)` --references--> `Answer`  [INFERRED]
  docs/API_CONTRACTS.md → apps/web/src/server/schemas.ts

## Import Cycles
- 2-file cycle: `packages/core/src/candles/aggregate.ts -> packages/core/src/index.ts -> packages/core/src/candles/aggregate.ts`

## Communities (141 total, 9 thin omitted)

### Community 0 - "market-structure.ts"
Cohesion: 0.10
Nodes (39): gradeMsMark(), atrAt(), buildMsQuestion(), checkMsWindow(), CORE_CONCEPTS, drawCandidate(), generateMsQuestion(), gradeMsQuestion() (+31 more)

### Community 1 - "Repository"
Cohesion: 0.07
Nodes (19): Repository, graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила, graphify (+11 more)

### Community 2 - "terminal.helpers.ts"
Cohesion: 0.15
Nodes (24): Box, candlePoint(), chartCandles(), coreLevels(), coreMarks(), drawAlgoMark(), drawTwoPoint(), findVisibleBos() (+16 more)

### Community 3 - "API Contracts — Trading Lab"
Cohesion: 0.07
Nodes (26): status(), 1.1 Формат ошибки, 1.2 Заголовки кэша, 1. Общие соглашения, 2.2 Расширения контрактов (предложение — фиксируются при реализации в `@tl/core`), 2. Типы `@tl/core`, используемые в контрактах, 3.1 `GET /api/health`, 3.2 `GET /api/history` (+18 more)

### Community 4 - "features/feedback/index.ts"
Cohesion: 0.24
Nodes (14): defaultFmt, FeedbackView(), Section(), GlyphKind, GradeGlyph(), LABEL, GradeLegend(), GradeLegendToggle() (+6 more)

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
Cohesion: 0.12
Nodes (28): FULL_WIDTH_KINDS, RAY_RIGHT_KINDS, ToolDef, ToolId, Cell(), groupOf(), TaskToolbarBar(), TaskToolbarProps (+20 more)

### Community 9 - "market-data/package.json"
Cohesion: 0.11
Nodes (20): dependencies, fflate@^0.8.3, @tl/core@workspace:*, devDependencies, vitest@^4.1.12, @vitest/coverage-v8@^4.1.12, exports, ./archive (+12 more)

### Community 10 - "Settings"
Cohesion: 0.27
Nodes (7): DailyActivityRow, SkillStatRow, TerminalMarksRow, TradingLabDB, LocalSnapshot, Settings, SkillId

### Community 11 - "core/src/index.ts"
Cohesion: 0.10
Nodes (33): TerminalPage(), ARCHIVE_MIN_AGE_MS, ARCHIVE_SYMBOLS, archiveAllowed(), archiveHref(), archivePageSize(), archiveWindow(), HISTORY_PAGE (+25 more)

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
Nodes (38): ChoiceOption, SetupField(), SetupFieldProps, Badge(), BadgeProps, BottomSheet(), BottomSheetProps, HEIGHT (+30 more)

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
Cohesion: 0.12
Nodes (27): 14.1 Факты на момент T (`ChallengeFacts`), age(), CHALLENGE_STRUCTURE, ChallengeFacts, FactsInput, HTF, intersects(), lastEventSince() (+19 more)

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
Nodes (40): lightweight-charts@~5.2.1, distToRectEdge(), distToSegment(), Hit, hitTest(), inside(), partScore(), geos() (+32 more)

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
Cohesion: 0.15
Nodes (22): Page(), PaFindBody(), PaLevelBody(), INTRO, PaSessionScreen(), ContextFactors, impliedDirection(), keepSingleLevel() (+14 more)

### Community 30 - "TaskTimeframe"
Cohesion: 0.11
Nodes (24): AnswerInput, ChallengeAnswerBody, Side, atrOf(), createSessionStore(), INITIAL, Phase, SessionState (+16 more)

### Community 31 - "LocalRepository"
Cohesion: 0.09
Nodes (16): defaultSettings(), LocalRepository, mark, 5.1 Живые данные (терминал), 5.2 История для заданий (сервер), 5.3 Задания (stateless, без БД до M7), 5.4 Хранение (Repository), 5. Потоки данных (+8 more)

### Community 32 - "skills.ts"
Cohesion: 0.10
Nodes (31): accuracyOf(), applyOutcome(), FOCUS_SIZE, isEnoughData(), isOutcomeOk(), MIN_WEIGHT, OK_THRESHOLD, pickFocus() (+23 more)

### Community 33 - "Trading Lab"
Cohesion: 0.33
Nodes (6): Trading Lab, Быстрый старт, Документация, Команды, Ограничения, Структура

### Community 34 - "token.ts"
Cohesion: 0.11
Nodes (27): ConfigError, nextTask(), toSeed(), b64(), derive(), getSigningSecret(), HeaderSchema, invalid() (+19 more)

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
Nodes (39): 2.1 Из `ARCHITECTURE.md` §4 (дословно), Решение, 18.2 Участки, golden/ - эталонные участки SMC (ALGORITHMS §18), computeChallengeFacts(), PatternCheck, findLevels(), allSwingsMap (+31 more)

### Community 45 - "tasks.ts"
Cohesion: 0.11
Nodes (26): cutoffOf(), buildChallenge(), ChReq, GradeCtx, gradePaFind(), gradePaLevel(), HTF_TF, isoOf() (+18 more)

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
Nodes (40): dependencies, dexie@^4.0.0, lucide-react@^1.66.0, next@^16.0.0, react@^19.0.0, react-dom@^19.0.0, @supabase/ssr@^0.12.7, @tl/core@workspace:* (+32 more)

### Community 52 - "challenge/generate.ts"
Cohesion: 0.15
Nodes (21): buildHints(), DEFAULT_TFS, HTF, meetsDifficulty(), pickChallengeScenario(), tail(), c15, c4h (+13 more)

### Community 53 - "rules.ts"
Cohesion: 0.13
Nodes (30): PointerKind, isDrawKind(), SWING_SIDE, Built, Gesture, PointerInput, PREVIEW_ID, normalizeMark() (+22 more)

### Community 54 - "terms.tsx"
Cohesion: 0.17
Nodes (18): dismissIntro(), isIntroDismissed(), key(), TaskIntro(), TaskIntroProps, Host(), byAlias, pattern (+10 more)

### Community 55 - "TradingChart.tsx"
Cohesion: 0.18
Nodes (15): limitCandles(), OPEN_CANDLE_ALPHA, pricePrecision(), T0, tokens, toCandleData(), toVolumeData(), VOLUME_ALPHA (+7 more)

### Community 56 - "build.ts"
Cohesion: 0.14
Nodes (23): FeedbackViewProps, attempt(), 5. Дефекты, 17.1 Структура и ключи, 17.2 Верность и общие принципы, 17.3 Что понято верно (`OkCode`; новые помечены *), 17.4 Ошибки (части 3–6), 17. Шаблоны разбора (источник `src/i18n/ru/feedback`) (+15 more)

### Community 57 - "TradingChart.tsx"
Cohesion: 0.12
Nodes (16): decimalsForTick(), makePriceFormatter(), TICK_TABLE, tickSizeFor(), crosshairTimeFormatter(), FLASH_MS, mark, series (+8 more)

### Community 58 - "TradingChart"
Cohesion: 0.14
Nodes (14): constrainAnchors(), createMark(), DrawKind, DrawingController, Pending, drag(), pt(), tap() (+6 more)

### Community 59 - "src/types.ts"
Cohesion: 0.12
Nodes (24): algoOf(), ALL, candles, findAlgo(), P, r, window, allLayerSwings() (+16 more)

### Community 60 - "Candle"
Cohesion: 0.15
Nodes (13): ArchiveLoader, mapLimit(), Draft, TaskEnvelope, ChallengeSource, FutureProvider, Candidate, MsMarkSelection (+5 more)

### Community 61 - "session/types.ts"
Cohesion: 0.12
Nodes (33): Page(), Page(), MsSetup(), PaSetup(), CommonFields(), SHORT, common(), CommonParams (+25 more)

### Community 62 - "placeholders.test.ts"
Cohesion: 0.09
Nodes (28): algo, ALL, bad, candles, flat, FLIP, MS_PA_CODES, mutate() (+20 more)

### Community 63 - "fetch-fixtures.mjs"
Cohesion: 0.10
Nodes (12): downloadedAt, items, m1, rec, root, rows, scratch, table (+4 more)

### Community 64 - "MarkSession.tsx"
Cohesion: 0.12
Nodes (36): AppError(), Annotated(), Term(), CONTEXT_FIELD_IDS, CONTEXT_HTF, ContextFieldId, viewForField(), PaContextBody() (+28 more)

### Community 65 - "Timeframe"
Cohesion: 0.14
Nodes (15): Symbol, AGG_TRADES_HEADER, AggTrade, ARCHIVE_BASE_URL, ArchiveFetch, ArchiveFileSpec, ArchiveSource, ArchiveSourceOptions (+7 more)

### Community 66 - "core/src/index.ts"
Cohesion: 0.13
Nodes (19): load(), klinesZip(), NOW, Served, zipOf(), ArchiveErrorCode, ARCHIVE_KLINE_HEADER, mergeCandles() (+11 more)

### Community 67 - "README.md"
Cohesion: 0.20
Nodes (4): Known Issues — Trading Lab, Закрыто (по коду), не требует действий, Не проверено вообще (среда), Открыто

### Community 68 - "SupabaseRepository.ts"
Cohesion: 0.13
Nodes (28): chunks(), IMPORTED_USER_META, ImportOutcome, importSnapshot(), must(), recomputeDerived(), Row, runFirstSignInImport() (+20 more)

### Community 69 - "grade.ts"
Cohesion: 0.11
Nodes (26): CheckOutcome, CheckState, CONCEPT_OF, conceptsFor(), RANGE_TAIL_CANDLES, runCheck(), algoMarks, candles (+18 more)

### Community 70 - "schemas.ts"
Cohesion: 0.07
Nodes (44): dynamic, maxDuration, POST(), runtime, ApiError, ApiErrorCode, errorResponse(), toApiError() (+36 more)

### Community 71 - "deps.ts"
Cohesion: 0.17
Nodes (15): dynamic, maxDuration, POST(), runtime, getDeps(), getHistoryLimiter(), rateFromEnv(), handleNext() (+7 more)

### Community 72 - "13. Генерация заданий"
Cohesion: 0.33
Nodes (6): 13.1 Общие правила, 13.2 Market Structure «Разметка» (поправка v1.1, `ALGO_VERSION 1.1.0`), 13.3 Market Structure «Вопрос», 13.4 Price Action, 13.5 Challenge, 13. Генерация заданий

### Community 73 - "Settings"
Cohesion: 0.19
Nodes (12): localDay(), 1. Принципы, 2. Локальная схема: IndexedDB (Dexie), 3.1 RLS, 3. Схема Supabase Postgres (M7), 5.1 Точность навыка, 5.2 Дневная цель, 5.3 Мягкая серия дней (+4 more)

### Community 74 - "SettingsScreen.tsx"
Cohesion: 0.16
Nodes (12): NotFound(), Page(), csp, nextConfig, CANDLE_OPTIONS, DAILY_GOAL_MAX, DAILY_GOAL_MIN, SettingsScreen() (+4 more)

### Community 75 - "Находки"
Cohesion: 0.13
Nodes (15): clientKey(), 1. HIGH: open redirect в /auth/callback (исправлено), 2. MEDIUM: обход rate limit через X-Forwarded-For (исправлено частично), 4. LOW: /api/cron/keepalive (открыто), 5. LOW: Supabase (повторное чтение 0001_init.sql), 6. LOW: заголовки/CSP (фактически curl на production-сборке), 7. LOW: токены (src/server/token.ts) - корректно, 8. Утечка даты Challenge (+7 more)

### Community 76 - "live.test.ts"
Cohesion: 0.06
Nodes (29): Frontend Developer, BINANCE_REST_BASE, BINANCE_WS_BASE, binanceInterval(), FetchKlinesOptions, LiveErrorCode, LiveFeed, LiveFeedError (+21 more)

### Community 77 - "sources.ts"
Cohesion: 0.12
Nodes (22): ARCHIVE_START, ArchiveLoaderOptions, CHALLENGE_FUTURE_MS, ChallengeZone, Chunk, countClosedBefore(), DAY_MS, depthOf() (+14 more)

### Community 78 - "screens.test.tsx"
Cohesion: 0.22
Nodes (14): metadata, plexMono, plexSans, RootLayout(), viewport, AppShell(), BottomTabs(), DesktopTabs() (+6 more)

### Community 79 - "ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`"
Cohesion: 0.15
Nodes (13): 18.1 Формат и процесс, 18.3 Что ещё размечается после утверждения (M4/M5), 18. Golden-тесты, 20. Спорные места и вопросы оркестратору, 4.1 Правило, 4.2 Граничные случаи, 4. Метки HH / HL / LH / LL, 6.1 Определение (решение) (+5 more)

### Community 80 - "ChallengeSession.tsx"
Cohesion: 0.11
Nodes (30): ChallengeSessionPage(), buildAttempt(), AxisTick, axisTicks(), relativeDuration(), relativeLabel(), STEPS, T (+22 more)

### Community 81 - "AUDIT — финальный дизайн-аудит Trading Lab (M8-UI)"
Cohesion: 0.20
Nodes (9): 1. Итог, 2. Находки, 3. Impeccable detect (по URL production-сборки), 4. Что проверено и ограничения, 5. Порядок исправления, AUDIT — финальный дизайн-аудит Trading Lab (M8-UI), P1, P2 (+1 more)

### Community 82 - "quality.ts"
Cohesion: 0.13
Nodes (19): ChallengeDetail, dirOf(), gradeChallenge(), lastEventText(), lastInternal(), protectedLevel(), QualityPart, reasonScore() (+11 more)

### Community 83 - "i18n/format.ts"
Cohesion: 0.25
Nodes (13): ErrorLog(), errorName(), fmtPrice(), Review(), textOf(), buildErrorLog(), formatInt(), formatPrice() (+5 more)

### Community 84 - "PRD — Trading Lab"
Cohesion: 0.12
Nodes (16): 10. Приоритизация функций (MoSCoW), 11. План MVP, 12. Открытые вопросы, 2. Принципы продукта, 3.1 В MVP, 3.2 Вне MVP, 3.3 Требует исследования, 3.4 Технические риски (+8 more)

### Community 85 - "TaskSession.tsx"
Cohesion: 0.13
Nodes (29): AnswerSessionProps, createTaskApi(), kindOf(), post(), TaskApi, buildAttempt(), BuildAttemptInput, saveTaskAttempt() (+21 more)

### Community 86 - "11. Контекст для PA «Контекст»"
Cohesion: 0.29
Nodes (7): 11.1 Формат ответа (ответ на OQ-16), 11.2 Задание, 11.3 Факторы (детерминированно, для бычьей модели; медвежья — зеркально), 11.4 Значимость (решение), 11.5 Оценка, 11.6 Генерация, 11. Контекст для PA «Контекст»

### Community 87 - "14. Challenge: эталон, оценка качества, WAIT, лимиты"
Cohesion: 0.33
Nodes (6): 14.2 Эталонная сторона `refSide`, 14.3 Оценка качества 0–100 (ответ на OQ-08), независимо от исхода, 14.4 Правильность, вердикт, лимиты, 14.5 Предикаты причин (`ReasonCode`, состав без изменений), 14.6 Подсказки (easy), 14. Challenge: эталон, оценка качества, WAIT, лимиты

### Community 88 - "position.ts"
Cohesion: 0.26
Nodes (13): blockerKey(), DecisionPanel(), PriceField(), buildAnswer(), defaultLevels(), formatRR(), parsePrice(), PositionIssue (+5 more)

### Community 89 - "5. Тренд, BOS и CHoCH"
Cohesion: 0.33
Nodes (6): 5.1 Общие правила, 5.2 Внешний слой — машина состояний с защищёнными уровнями, 5.3 Внутренний слой — «последний подтверждённый swing», 5.4 Что происходит после CHoCH, 5.5 Граничные случаи (проверены на реальных свечах), 5. Тренд, BOS и CHoCH

### Community 90 - "patterns.ts"
Cohesion: 0.08
Nodes (32): 9.1 Состав (ответ на OQ-11), 9.3 Выход, 9.4 Проверенные примеры (BTCUSDT 4h 2026-09, GS-5), 9. Свечные модели Price Action (`detectPatterns`), c4h, FIX, c4h, found (+24 more)

### Community 91 - "features/feedback/format.ts"
Cohesion: 0.25
Nodes (14): DIR, formatParam(), FORMATTERS(), formatWhen(), KIND_KEYS, placeOf(), renderBlock(), TIME_KEYS (+6 more)

### Community 92 - "package.json"
Cohesion: 0.12
Nodes (21): devDependencies, eslint@^9.39.0, eslint-config-next@^16.0.0, @eslint/js@^9.39.0, @playwright/test@1.63.0, prettier@^3.6.0, @types/node@^22.0.0, typescript@~5.9.3 (+13 more)

### Community 93 - "next-resilience.test.ts"
Cohesion: 0.23
Nodes (8): FIX, FixtureLoader, fixtures, flaky(), NOW, post(), CandleLoader, RawAggTrade

### Community 94 - "1. Общие соглашения"
Cohesion: 0.22
Nodes (9): c(), 1.1 Входные свечи, 1.2 Термины свечи, 1.3 ATR, 1.4 Детерминизм и числа, 1.5 ALGO_VERSION, 1.6 Параметры по сложностям (сводка), 1. Общие соглашения (+1 more)

### Community 95 - "7. Order Block"
Cohesion: 0.50
Nodes (4): 7.1 Определение (решение, ICT: «последняя противоположная свеча перед импульсом, сломавшим структуру»), 7.2 Статус (после свечи события `k`, по закрытым свечам), 7.3 Сигнатура, 7. Order Block

### Community 97 - "reveal.ts"
Cohesion: 0.21
Nodes (10): DIR_RU, localizeParam(), POI_RU, revealFeedback(), shiftBlock(), TF_RU, TIME_KEYS, TREND_KEYS (+2 more)

### Community 98 - "history/route.ts"
Cohesion: 0.11
Nodes (18): ARCHIVE_START_MS, dynamic, errorResponse(), GET(), ISSUE_CODES, querySchema, runtime, SYMBOLS (+10 more)

### Community 99 - "src/feedback/index.ts"
Cohesion: 0.14
Nodes (26): decimalsOf(), DIRECTION_RU, displayValue(), formatFeedbackParams(), normalizeParams(), PARAM_KINDS, ParamFormatters, ParamKind (+18 more)

### Community 100 - "hints.ts"
Cohesion: 0.21
Nodes (9): external(), selectHints(), time(), 12.4 Совместимость и стоимость пары, 3.1 Правило (решение), 3.2 Дедупликация, 3.3 Сигнатура `analyzeStructure`, 3.4 Отображение в `Mark` (общая модель `ARCHITECTURE.md` §4.2) (+1 more)

### Community 101 - "SessionActions"
Cohesion: 0.11
Nodes (7): ChallengeApiError, ChallengeErrorKind, fetchNext(), gradeChallenge(), kindOf(), post(), SessionActions

### Community 102 - "Стратегия тестирования — Trading Lab"
Cohesion: 0.20
Nodes (10): 10. Производительность, 1. Принципы, 2. Пирамида, 3. Фикстуры, 5. E2E (Playwright), 6. Визуальная проверка и доступность, 7. Критерии «готово» для вехи, 8. CI (GitHub Actions) (+2 more)

### Community 103 - "DrawingPrimitive.ts"
Cohesion: 0.16
Nodes (11): DrawingPrimitive, OpenCandleInfo, PrimitiveState, ZONE_KINDS, CandleHighlight, dimSpans(), HighlightColumn, highlightColumns() (+3 more)

### Community 104 - "4. Функциональные требования"
Cohesion: 0.17
Nodes (12): 4.10 Авторизация (FR-AUTH), 4.11 Интерфейс (FR-UI), 4.1 Данные (FR-DATA), 4.2 График (FR-CHART), 4.3 Слой разметки (FR-DRAW), 4.4 Market Structure Analyzer (FR-MS), 4.5 Trading Challenge (FR-TC), 4.6 Price Action Trainer (FR-PA) (+4 more)

### Community 105 - "ref_vitest"
Cohesion: 0.23
Nodes (7): contractAttempt(), contractMark, runRepositoryContract(), FakeSupabase, Row, UNIQUE, seedLocal()

### Community 106 - "Mark"
Cohesion: 0.09
Nodes (35): patternLabel(), anchor, KINDS, MARKS_FORMAT_VERSION, markSchema, parseMarks(), serializeMarks(), m (+27 more)

### Community 107 - "controller.test.ts"
Cohesion: 0.22
Nodes (9): bosMark, breakIdx, index, lvl, proj, setup(), synthetic_candles, T0 (+1 more)

### Community 108 - "@playwright/test"
Cohesion: 0.19
Nodes (11): DATE_LEAK, expandResult(), lastCandleTime(), num(), openReasons(), projectPoint(), SESSION_URL(), startSession() (+3 more)

### Community 109 - "Roadmap — Trading Lab"
Cohesion: 0.29
Nodes (6): MVP, Roadmap — Trading Lab, v1.1 — Fibonacci Playground и Premium/Discount, v1.2 — Elliott Wave Lab, v2, Правила корректировки

### Community 110 - "2. Карточки"
Cohesion: 0.20
Nodes (10): 2. Карточки, Backend Developer, Chart Developer, DevOps/Security Engineer, Documentation Engineer, Market Data Engineer, Orchestrator, QA Engineer (+2 more)

### Community 111 - "sliceAt"
Cohesion: 0.36
Nodes (5): aggregate(), SeriesByTf, sliceAt(), synthetic_hour(), synthetic_m1()

### Community 112 - "pa/index.ts"
Cohesion: 0.10
Nodes (45): buildPa(), gradePaContext(), reconstructContext(), computeContext(), CONTEXT_STRUCTURE, ContextAnswer, ContextEvidence, ContextFactorAnswer (+37 more)

### Community 114 - "ref_vitest"
Cohesion: 0.10
Nodes (24): errors, feedback, wrap(), APPEARANCE_STORAGE_KEY, themeInitScript, applyToDom(), CandleStyle, fromStoredCandle() (+16 more)

### Community 115 - "ref_node_crypto"
Cohesion: 0.32
Nodes (3): dynamic, GET(), safeEqual()

### Community 116 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, check:tokens, dev, format, lint, sync:tokens, test (+2 more)

### Community 117 - "ProgressScreen.tsx"
Cohesion: 0.11
Nodes (35): Page(), ContinueBlock(), HomeWeakSpots(), LearnScreen(), MODULES, ModuleAccuracy(), asCore(), canTrain() (+27 more)

### Community 118 - "7. User Flows"
Cohesion: 0.25
Nodes (8): 7.1 Первый вход, 7.2 Сессия Market Structure (режим «Разметка»), 7.3 Trading Challenge: от выбора до разбора, 7.4 Price Action «Контекст», 7.5 Терминал с проверкой разметки, 7.6 Просмотр «Слабых мест», 7.7 Продолжение на другом устройстве, 7. User Flows

### Community 119 - "criteria.ts"
Cohesion: 0.36
Nodes (13): body(), bottom(), dojiItems(), engulfItems(), finish(), insideItems(), Item, patternCheck() (+5 more)

### Community 120 - "ms.helpers.ts"
Cohesion: 0.35
Nodes (8): checkAndSeeResult(), nextThenHomeShowsDone(), openSession(), shot(), tapCandle(), solveOne(), chartBox(), selectTool()

### Community 121 - "handlers.test.ts"
Cohesion: 0.16
Nodes (12): CH, challengeDeps(), grade(), Json, loader, mkDeps(), MS_MARK, MS_Q (+4 more)

### Community 122 - "src/types.ts"
Cohesion: 0.15
Nodes (21): Core, GradeResultApi, ContextGrade, DEFAULT_LEVEL_PARAMS, gradeLevel(), inLevelZone(), LevelGrade, LevelParams (+13 more)

### Community 123 - "4. Миграция локальных данных в Supabase при первом входе"
Cohesion: 0.29
Nodes (6): ImportReport, 4.1 Порядок, 4.2 Правила по таблицам (идемпотентность по `id`, конфликты по `updated_at`), 4.3 Пересчёт производных данных, 4.4 Ошибки и откат, 4. Миграция локальных данных в Supabase при первом входе

### Community 124 - "ProgressScreen.tsx"
Cohesion: 0.12
Nodes (33): ChallengePage(), Page(), ChallengeHome(), DIFFS, recentLine(), StartTf, Stats(), TF_OPTIONS (+25 more)

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
Nodes (24): ADR-0007: Правила исхода сделки Challenge (drill-down), Контекст, Открытые вопросы (закрыты: `docs/specs/ALGORITHMS.md`), Последствия, Рассмотренные альтернативы, 10.1 Алгоритм, 10.2 Эталон для «Проведи уровень», 10. `findLevels` — уровни поддержки/сопротивления (+16 more)

### Community 130 - "1. Обзор и цель продукта"
Cohesion: 0.40
Nodes (5): 1.1 Что это, 1.2 Цель, 1.3 Целевой пользователь, 1.4 Модули, 1. Обзор и цель продукта

### Community 131 - "storage/index.ts"
Cohesion: 0.13
Nodes (27): dynamic, GET(), dynamic, Page(), @supabase/supabase-js@^2.118.0, AuthContext, AuthRepositoryProvider(), AuthState (+19 more)

### Community 133 - "Подключение Supabase и Vercel (с телефона)"
Cohesion: 0.18
Nodes (10): 1. Проект Supabase, 2. Применить миграцию (создать таблицы), 3. Ключи Supabase, 4. Вход через Google, 5. Redirect URL в Supabase, 6. Vercel, 7. Проверка на телефоне, Если что-то не работает (+2 more)

### Community 134 - "TimeIndex"
Cohesion: 0.10
Nodes (20): lwcProjection(), snapAnchor(), SnapOptions, snapPriceToCandle(), synthetic_candles, T0, T0, TimeIndex (+12 more)

### Community 135 - "Команда агентов — Trading Lab"
Cohesion: 0.25
Nodes (7): 1. Сводка, 3. Правила оркестрации, 4. Формат отчёта агента (до 15 строк), 5. Шаблон задания агенту, 6. Уроки оркестрации, Команда агентов — Trading Lab, Правило graphify (включается в каждый промпт агента, исследующего код)

### Community 136 - "playwright.config.ts"
Cohesion: 0.50
Nodes (3): INTRO_DISMISSED, INTRO_KEYS, PORT

### Community 140 - "16. Навыки и прогресс"
Cohesion: 0.50
Nodes (4): 16.1 Навыки, 16.2 Обновление точности, 16.3 Адаптивная подборка, 16. Навыки и прогресс

### Community 147 - "8. FVG (Fair Value Gap)"
Cohesion: 0.50
Nodes (4): 8.1 Определение, 8.2 Заполнение, 8.3 Сигнатура, 8. FVG (Fair Value Gap)

## Knowledge Gaps
- **13 isolated node(s):** `ADR-0008`, `ADR-0007`, `ADR-0006`, `ADR-0005`, `ADR-0005` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 999 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Mark` connect `Mark` to `Repository`, `terminal.helpers.ts`, `features/feedback/index.ts`, `TimeIndex`, `MsMarkBody.tsx`, `tools.ts`, `Settings`, `core/src/index.ts`, `facts.ts`, `hit.ts`, `DECISIONS/README.md`, `PaFindBody.tsx`, `TaskTimeframe`, `LocalRepository`, `src/types.ts`, `tasks.ts`, `challenge/generate.ts`, `rules.ts`, `TradingChart.tsx`, `TradingChart`, `src/types.ts`, `session/types.ts`, `placeholders.test.ts`, `MarkSession.tsx`, `Timeframe`, `SupabaseRepository.ts`, `grade.ts`, `ChallengeSession.tsx`, `TaskSession.tsx`, `1. Общие соглашения`, `hints.ts`, `DrawingPrimitive.ts`, `ref_vitest`, `controller.test.ts`, `pa/index.ts`, `handlers.test.ts`, `src/types.ts`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Mark` (e.g. with `Контекст` and `Последствия`) actually correct?**
  _`Mark` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0008`, `ADR-0007`, `ADR-0006` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `market-structure.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1048780487804878 - nodes in this community are weakly interconnected._
- **Why does `@playwright/test` connect `@playwright/test` to `ms.helpers.ts`, `terminal.helpers.ts`, `package.json`, `playwright.config.ts`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `UtcMs` (e.g. with `1. Общие соглашения` and `4.1 Шкала задания`) actually correct?**
  _`UtcMs` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Repository` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._