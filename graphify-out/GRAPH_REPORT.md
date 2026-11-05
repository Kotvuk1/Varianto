# Graph Report - Varianto  (2026-11-05)

## Corpus Check
- 542 files · ~323,503 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 49 file(s) not represented in the graph (top: .csv 43, (none) 4, .example 1)

## Summary
- 3816 nodes · 11627 edges · 154 communities (144 shown, 10 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 358 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2848d478`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- market-structure.ts
- LocalRepository
- terminal.helpers.ts
- API Contracts — Trading Lab
- elliott/adapters.ts
- with
- Architecture — Trading Lab
- PaContextBody.tsx
- progressLogic.ts
- market-data/package.json
- UtcMs
- TerminalScreen.tsx
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
- layout.ts
- market-data-engineer.md
- qa-engineer.md
- technical-analyst.md
- uiux-designer.md
- DECISIONS/README.md
- elliott/check.ts
- golden.ew.test.ts
- HomeBlocks.tsx
- fetch-fixtures.mjs
- Trading Lab
- token.ts
- session/types.ts
- .prettierrc.json
- e2e/tsconfig.json
- core/tsconfig.json
- market-data/tsconfig.json
- src/types.ts
- postcss.config.mjs
- CLAUDE.md
- .claude/CLAUDE.md
- pnpm-workspace.yaml
- MsMarkBody.tsx
- LAYOUTS — Trading Lab
- 2. Компоненты
- DESIGN — Trading Lab
- COPY — микрокопия Trading Lab
- check_tokens.py
- web/package.json
- DrawingController
- rules.ts
- PaContextBody.tsx
- schemas.ts
- GradeError
- TradingChart.tsx
- fib/index.ts
- feedback/placeholders.test.ts
- TaskTimeframe
- sources.ts
- runCheck.ts
- grading/grade.ts
- MarkSession.tsx
- FakeWs
- core/src/index.ts
- README.md
- importLocal.ts
- Команда агентов — Trading Lab
- fib/index.ts
- history/route.ts
- fib/generate.test.ts
- localDay
- elliott.helpers.ts
- Находки
- useMarketData.ts
- archive.ts
- screens.test.tsx
- 6. Liquidity sweep
- Roadmap — Trading Lab
- core/src/index.ts
- fib/generate.ts
- i18n/format.ts
- PRD — Trading Lab
- TaskSession.tsx
- ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`
- progressData.ts
- ew.controller.test.ts
- 5. Тренд, BOS и CHoCH
- grading/grade.test.ts
- ToolPalette.tsx
- package.json
- fib/grade.test.ts
- 6. Внешние API Binance
- terminal.fib.spec.ts
- web/AGENTS.md
- reveal.ts
- model.ts
- src/feedback/index.ts
- AUDIT — финальный дизайн-аудит Trading Lab (M8-UI)
- sessionStore.ts
- Стратегия тестирования — Trading Lab
- features/feedback/index.ts
- fib.helpers.ts
- ref_vitest
- challenge/resolve.ts
- patterns.ts
- health/route.ts
- fib.controller.test.ts
- serialize.ts
- fibonacci/adapters.ts
- pa/index.ts
- Query
- ThemeProvider.tsx
- @playwright/test
- challenge.helpers.ts
- progress/streak.ts
- 3. Внешняя и внутренняя структура
- criteria.ts
- src/feedback/format.ts
- handlers.test.ts
- DrawingPrimitive.ts
- 7. User Flows
- ProgressScreen.tsx
- QA Report — финальная приёмка MVP Trading Lab (M8)
- useReplay.ts
- Mark
- fixtures
- elliott/placeholders.test.ts
- handlers.ts
- AuthProvider.tsx
- 4. Функциональные требования
- Подключение Supabase и Vercel (с телефона)
- 14. Challenge: эталон, оценка качества, WAIT, лимиты
- high
- vercel.json
- ELLIOTT — спецификация модуля Elliott Wave Lab (v1.2) для `@tl/core`
- terminal.countdown.spec.ts
- 12. `gradeMarks` — сравнение разметки
- 3. Область продукта
- 9. Генерация заданий
- fib/types.ts
- 14. Коды и шаблоны разбора (источник `src/i18n/ru/feedback`)
- elliott/index.ts
- 1. Общие соглашения
- 4. Нерушимые правила (обязательны)
- FIBONACCI — спецификация модуля Fibonacci Playground (v1.1) для `@tl/core`
- playwright.config.ts
- 6. Задание «Где реакция?» (`fib-reaction`)
- buildFeedback
- Candle
- fibonacci/reveal.ts

## God Nodes (most connected - your core abstractions)
1. `Candle` - 150 edges
2. `Mark` - 125 edges
3. `UtcMs` - 108 edges
4. `react` - 86 edges
5. `TaskTimeframe` - 82 edges
6. `analyzeStructure()` - 51 edges
7. `cn()` - 49 edges
8. `Button()` - 46 edges
9. `Difficulty` - 44 edges
10. `ElliottBody()` - 40 edges

## Surprising Connections (you probably didn't know these)
- `1. HIGH: open redirect в /auth/callback (исправлено)` --references--> `safeNextPath()`  [INFERRED]
  docs/SECURITY_REVIEW.md → apps/web/src/auth/config.ts
- `3.1 Определение (решение)` --references--> `low()`  [INFERRED]
  docs/specs/FIBONACCI.md → apps/web/src/chart/interaction/ew.controller.test.ts
- `P2` --references--> `GradeLegend()`  [INFERRED]
  docs/design/AUDIT.md → apps/web/src/features/feedback/GradeLegend.tsx
- `5.2 Ответ и проверка` --references--> `ok()`  [INFERRED]
  docs/specs/FIBONACCI.md → apps/web/src/features/progress/progressLogic.test.ts
- `4.2 Типы ответа (`Answer`)` --references--> `Answer`  [INFERRED]
  docs/API_CONTRACTS.md → apps/web/src/server/schemas.ts

## Import Cycles
- 2-file cycle: `packages/core/src/candles/aggregate.ts -> packages/core/src/index.ts -> packages/core/src/candles/aggregate.ts`

## Communities (154 total, 10 thin omitted)

### Community 0 - "market-structure.ts"
Cohesion: 0.06
Nodes (67): ElliottParamsSchema, ARCHIVE_START, CHALLENGE_FUTURE_MS, futureProviderFor(), buildMs(), ChReq, FIB_EXTRA, FibParamsT (+59 more)

### Community 1 - "LocalRepository"
Cohesion: 0.05
Nodes (29): Repository, graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила, graphify (+21 more)

### Community 2 - "terminal.helpers.ts"
Cohesion: 0.14
Nodes (25): alternating(), isPivot(), Pt, Box, candlePoint(), chartCandles(), coreLevels(), coreMarks() (+17 more)

### Community 3 - "API Contracts — Trading Lab"
Cohesion: 0.10
Nodes (19): 1.1 Формат ошибки, 1.2 Заголовки кэша, 1. Общие соглашения, 2.2 Расширения контрактов (предложение — фиксируются при реализации в `@tl/core`), 2. Типы `@tl/core`, используемые в контрактах, 3.1 `GET /api/health`, 3.2 `GET /api/history`, 3.3 `POST /api/tasks/{module}/next` (+11 more)

### Community 4 - "elliott/adapters.ts"
Cohesion: 0.08
Nodes (36): Page(), allowedAlternatives(), EW_INTRO, EW_KIND, EW_TFS, ewAnswer(), EwAnswerOrError, EwUserMarks (+28 more)

### Community 5 - "with"
Cohesion: 0.08
Nodes (26): runs-on, steps, GITHUB_TOKEN, jobs, check, secrets-scan, name, on (+18 more)

### Community 6 - "Architecture — Trading Lab"
Cohesion: 0.11
Nodes (19): 10. Развёртывание, 11. Риски, 1. Ключевые ограничения, определяющие архитектуру, 2. Обзор, 3. Репозиторий (pnpm monorepo), 4.1 Синхронизация таймфреймов, 4.2 Разметка (общая модель для пользователя и алгоритма), 4.3 Алгоритмы (детерминированные, версионируемые) (+11 more)

### Community 7 - "PaContextBody.tsx"
Cohesion: 0.11
Nodes (29): Page(), CONTEXT_FIELD_IDS, CONTEXT_HTF, ContextFieldId, viewForField(), PaContextBody(), Row(), YN (+21 more)

### Community 8 - "progressLogic.ts"
Cohesion: 0.09
Nodes (38): asCore(), canTrain(), ErrorGroup, groupByModule(), MODULE_ORDER, ModuleAccuracy, ModuleGroup, moduleOfSkill() (+30 more)

### Community 9 - "market-data/package.json"
Cohesion: 0.11
Nodes (20): dependencies, fflate@^0.8.3, @tl/core@workspace:*, devDependencies, vitest@^4.1.12, @vitest/coverage-v8@^4.1.12, exports, ./archive (+12 more)

### Community 10 - "UtcMs"
Cohesion: 0.11
Nodes (27): ErrorExample, DailyActivityRow, SkillStatRow, TerminalMarksRow, TradingLabDB, defaultSettings(), LocalRepository, LocalSnapshot (+19 more)

### Community 11 - "TerminalScreen.tsx"
Cohesion: 0.17
Nodes (22): TerminalPage(), ARCHIVE_MIN_AGE_MS, ARCHIVE_SYMBOLS, archiveAllowed(), archiveHref(), archivePageSize(), archiveWindow(), normalizeSymbolInput() (+14 more)

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
Cohesion: 0.06
Nodes (67): ChallengeSessionPage(), NotFound(), csp, nextConfig, buildAttempt(), ChallengeSession(), FOCUS_SKILLS, SHEET_PAD (+59 more)

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
Nodes (60): age(), CHALLENGE_STRUCTURE, ChallengeFacts, computeChallengeFacts(), FactsInput, HTF, intersects(), lastEventSince() (+52 more)

### Community 20 - "chart-developer.md"
Cohesion: 0.29
Nodes (6): graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 21 - "devops-security.md"
Cohesion: 0.29
Nodes (6): graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 22 - "documentation-engineer.md"
Cohesion: 0.29
Nodes (6): graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 23 - "layout.ts"
Cohesion: 0.05
Nodes (49): distToRectEdge(), distToSegment(), Hit, hitLevel(), hitTest(), inside(), partScore(), geos() (+41 more)

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
Nodes (32): ADR-0001: Next.js 16 + TypeScript strict, pnpm monorepo, Vercel, Контекст, Последствия, Рассмотренные альтернативы, Решение, ADR-0003: Живые данные грузит браузер напрямую (REST + WS), fallback — REST-polling, Контекст, Последствия (+24 more)

### Community 29 - "elliott/check.ts"
Cohesion: 0.13
Nodes (48): 7.1 `enumerateCounts` — все допустимые разметки до текущей точки, 7.2 `findWaveCandidates` — участки для easy/medium, 7. Детекторы, findWaveCandidates(), zigzagPivots(), atrCache, atrOf(), checkCount() (+40 more)

### Community 30 - "golden.ew.test.ts"
Cohesion: 0.08
Nodes (31): EASY, MEDIUM, btc4, run(), sol, SOL_IMP, scan(), anchors() (+23 more)

### Community 31 - "HomeBlocks.tsx"
Cohesion: 0.15
Nodes (26): Page(), Stats(), EmptyState(), ErrorState(), LoadingRows(), useAsync(), ContinueBlock(), HomeWeakSpots() (+18 more)

### Community 32 - "fetch-fixtures.mjs"
Cohesion: 0.09
Nodes (12): dynamic, GET(), safeEqual(), downloadedAt, items, m1, rec, root (+4 more)

### Community 33 - "Trading Lab"
Cohesion: 0.33
Nodes (6): Trading Lab, Быстрый старт, Документация, Команды, Ограничения, Структура

### Community 34 - "token.ts"
Cohesion: 0.09
Nodes (33): ApiError, ApiErrorCode, ConfigError, validationError(), gradeChallengeTask(), gradeMsQuestionTask(), gradeTask(), mismatch() (+25 more)

### Community 35 - "session/types.ts"
Cohesion: 0.07
Nodes (56): Page(), Page(), Page(), Page(), Page(), ElliottSetup(), SHORT, FibSessionScreen() (+48 more)

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
Cohesion: 0.09
Nodes (49): 2.1 Из `ARCHITECTURE.md` §4 (дословно), Решение, 18.2 Участки, 1.2 Переиспользуемые соглашения (без изменений), 1.2 Переиспользуемые соглашения (без изменений), 3.4 Граничные случаи (проверены на реальных свечах), 6.5 Конфлюэнс (через SMC-движок, только данные до T), golden/ - эталонные участки SMC (ALGORITHMS §18) (+41 more)

### Community 45 - "MsMarkBody.tsx"
Cohesion: 0.18
Nodes (19): Page(), MsMarkBody(), highlightMarks(), MsQuestionBody(), MsSessionScreen(), msQuestionAnswer(), AnswerList(), msBody() (+11 more)

### Community 46 - "LAYOUTS — Trading Lab"
Cohesion: 0.07
Nodes (29): 0.1 Навигация и уровни, 0.2 Зоны экрана 390x844, 0.3 Жесты и разметка (мобильный), 0. Общие правила, 1.1 Мобильный 390x844 (прокручивается; график не нужен), 1.2 Десктоп 1440x900, 1. Главная (раздел «Обучение»), 2.1 Мобильный 390x844 (+21 more)

### Community 47 - "2. Компоненты"
Cohesion: 0.11
Nodes (18): 0. Общее, 2.10 ProgressBar, 2.11 Toast, 2.12 Tooltip / Hint, 2.13 FeedbackBlock (разбор), 2.14 Прочие (по необходимости, не расширять без решения), 2.1 Button, 2.2 IconButton (+10 more)

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

### Community 52 - "DrawingController"
Cohesion: 0.10
Nodes (21): constrainAnchors(), createMark(), DrawKind, firstSideOf(), other(), sideAt(), snapExtreme(), DrawingController (+13 more)

### Community 53 - "rules.ts"
Cohesion: 0.08
Nodes (49): SWING_SIDE, EW_CORRECTION_LABELS, EW_IMPULSE_LABELS, EW_IMPULSE_SIZES, EW_INVALIDATION_ROLE, EW_KINDS, ewDirection(), EwKind (+41 more)

### Community 54 - "PaContextBody.tsx"
Cohesion: 0.13
Nodes (25): Choice(), ChoiceProps, COLS, ReactionForm(), TargetPicker(), dismissIntro(), isIntroDismissed(), key() (+17 more)

### Community 55 - "schemas.ts"
Cohesion: 0.06
Nodes (32): zod@^4.0.0, ValidationIssue, AnchorSchema, AnswerSchema, BUSINESS_CODES, ChallengeAnswer, difficulty, ElliottAnswerApi (+24 more)

### Community 56 - "GradeError"
Cohesion: 0.23
Nodes (20): Core, GradeResultApi, 17.1 Структура и ключи, 17.2 Верность и общие принципы, 17.3 Что понято верно (`OkCode`; новые помечены *), 17.4 Ошибки (части 3–6), 17. Шаблоны разбора (источник `src/i18n/ru/feedback`), ChallengeGrade (+12 more)

### Community 57 - "TradingChart.tsx"
Cohesion: 0.06
Nodes (42): CandleCountdown, formatCountdown(), pad2(), remainingMs(), CountdownBadge(), CountdownBadgeProps, View, DrawingPrimitive (+34 more)

### Community 58 - "fib/index.ts"
Cohesion: 0.09
Nodes (46): ReactionFormProps, bandOf(), ConfluenceCtx, FIB_CONFLUENCE_KEYS, FIB_LEVEL_LOOKBACK, FibConfluence, overlaps(), PriceBand (+38 more)

### Community 59 - "feedback/placeholders.test.ts"
Cohesion: 0.10
Nodes (29): algo, ALL, bad, candles, FIB_ERROR_CODES, FIB_OK_CODES, flat, FLIP (+21 more)

### Community 60 - "TaskTimeframe"
Cohesion: 0.10
Nodes (45): archiveMonths(), buildElliott(), catalogCache, ElliottParams, EW_MAX_SEGMENTS, EwReq, gradeElliottTask(), key() (+37 more)

### Community 61 - "sources.ts"
Cohesion: 0.15
Nodes (21): ArchiveLoaderOptions, ChallengeZone, Chunk, countClosedBefore(), cutoffOf(), DAY_MS, depthOf(), floorTo() (+13 more)

### Community 62 - "runCheck.ts"
Cohesion: 0.12
Nodes (21): TaskPayload, CheckOutcome, CheckResult, CheckState, CONCEPT_OF, conceptsFor(), RANGE_TAIL_CANDLES, runCheck() (+13 more)

### Community 63 - "grading/grade.ts"
Cohesion: 0.23
Nodes (13): Entry, gradeMarks(), Group, groupEvaluated(), groupOf(), iou(), MAJOR, patternSkill() (+5 more)

### Community 64 - "MarkSession.tsx"
Cohesion: 0.11
Nodes (55): AppError(), decimalsForTick(), makePriceFormatter(), TICK_TABLE, tickSizeFor(), fmtOf(), ReplayBar(), AXIS_H (+47 more)

### Community 66 - "core/src/index.ts"
Cohesion: 0.06
Nodes (44): Frontend Developer, load(), klinesZip(), NOW, Served, zipOf(), ArchiveErrorCode, BINANCE_REST_BASE (+36 more)

### Community 67 - "README.md"
Cohesion: 0.20
Nodes (3): Known Issues — Trading Lab, Не проверено вообще (среда), Открыто

### Community 68 - "importLocal.ts"
Cohesion: 0.16
Nodes (16): chunks(), IMPORTED_USER_META, ImportOutcome, importSnapshot(), must(), recomputeDerived(), Row, runFirstSignInImport() (+8 more)

### Community 69 - "Команда агентов — Trading Lab"
Cohesion: 0.25
Nodes (7): 1. Сводка, 3. Правила оркестрации, 4. Формат отчёта агента (до 15 строк), 5. Шаблон задания агенту, 6. Уроки оркестрации, Команда агентов — Trading Lab, Правило graphify (включается в каждый промпт агента, исследующего код)

### Community 70 - "fib/index.ts"
Cohesion: 0.11
Nodes (36): gradeFibTask(), 12.1 Формат и процесс, 12.2 Участки, 12.3 Покрытие граничных случаев golden-участками, 12. Golden-участки, 13. Тест-план для реализации (TDD, `packages/core/src/fib/`), checkFibMarks(), dirOf() (+28 more)

### Community 71 - "history/route.ts"
Cohesion: 0.09
Nodes (21): ARCHIVE_START_MS, dynamic, errorResponse(), GET(), ISSUE_CODES, querySchema, runtime, SYMBOLS (+13 more)

### Community 72 - "fib/generate.test.ts"
Cohesion: 0.13
Nodes (15): buildFib(), h1, fibExtensionTask(), fibGridTask(), fibReactionTask(), C, idx(), pick() (+7 more)

### Community 73 - "localDay"
Cohesion: 0.14
Nodes (17): localDay(), ImportReport, 1. Принципы, 2. Локальная схема: IndexedDB (Dexie), 3.1 RLS, 3. Схема Supabase Postgres (M7), 4.2 Правила по таблицам (идемпотентность по `id`, конфликты по `updated_at`), 4.3 Пересчёт производных данных (+9 more)

### Community 74 - "elliott.helpers.ts"
Cohesion: 0.19
Nodes (17): bodyText(), closePanel(), countsFor(), DATE_LEAK, drawCount(), EW_STORAGE, EwEnvelope, openEw() (+9 more)

### Community 75 - "Находки"
Cohesion: 0.20
Nodes (10): 1. HIGH: open redirect в /auth/callback (исправлено), 2. MEDIUM: обход rate limit через X-Forwarded-For (исправлено частично), 3. MEDIUM: /api/history без лимита запросов (открыто), 4. LOW: /api/cron/keepalive (открыто), 5. LOW: Supabase (повторное чтение 0001_init.sql), 6. LOW: заголовки/CSP (фактически curl на production-сборке), 7. LOW: токены (src/server/token.ts) - корректно, 8. Утечка даты Challenge (+2 more)

### Community 76 - "useMarketData.ts"
Cohesion: 0.11
Nodes (19): ClockOffsetEstimator, ClockSync, eventTimeOf(), sniffingFetch(), sniffingWebSocket(), HISTORY_PAGE, SourceMode, appendCandle() (+11 more)

### Community 77 - "archive.ts"
Cohesion: 0.11
Nodes (17): ArchiveLoader, mapLimit(), Timeframe, AGG_TRADES_HEADER, AggTrade, ARCHIVE_BASE_URL, ArchiveFetch, ArchiveFileSpec (+9 more)

### Community 78 - "screens.test.tsx"
Cohesion: 0.22
Nodes (14): metadata, plexMono, plexSans, RootLayout(), viewport, AppShell(), BottomTabs(), DesktopTabs() (+6 more)

### Community 79 - "6. Liquidity sweep"
Cohesion: 0.40
Nodes (5): 6.1 Определение (решение), 6.2 Несколько уровней за одну свечу, 6.3 Граничные случаи, 6.4 Сигнатура, 6. Liquidity sweep

### Community 80 - "Roadmap — Trading Lab"
Cohesion: 0.29
Nodes (6): MVP, Roadmap — Trading Lab, v1.1 — Fibonacci Playground и Premium/Discount, v1.2 — Elliott Wave Lab, v2, Правила корректировки

### Community 81 - "core/src/index.ts"
Cohesion: 0.11
Nodes (16): cs, index, synthetic_rows, T0, external(), selectHints(), time(), fmt (+8 more)

### Community 82 - "fib/generate.ts"
Cohesion: 0.13
Nodes (24): ExtensionOutcome, Ctx, desiredClass(), EXT_TARGETS, extremesOk(), FIB_IMPULSE_RULES, FIB_NEXT, FibTaskType (+16 more)

### Community 83 - "i18n/format.ts"
Cohesion: 0.13
Nodes (30): DIR, formatParam(), FORMATTERS(), formatWhen(), KIND_KEYS, placeOf(), ErrorLog(), errorName() (+22 more)

### Community 84 - "PRD — Trading Lab"
Cohesion: 0.12
Nodes (17): 10. Приоритизация функций (MoSCoW), 11. План MVP, 12. Открытые вопросы, 1.1 Что это, 1.2 Цель, 1.3 Целевой пользователь, 1.4 Модули, 1. Обзор и цель продукта (+9 more)

### Community 85 - "TaskSession.tsx"
Cohesion: 0.13
Nodes (28): AnswerSessionProps, createTaskApi(), kindOf(), post(), TaskApi, buildAttempt(), BuildAttemptInput, saveTaskAttempt() (+20 more)

### Community 86 - "ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`"
Cohesion: 0.07
Nodes (29): 11.1 Формат ответа (ответ на OQ-16), 11.2 Задание, 11.3 Факторы (детерминированно, для бычьей модели; медвежья — зеркально), 11.4 Значимость (решение), 11.5 Оценка, 11.6 Генерация, 11. Контекст для PA «Контекст», 13.1 Общие правила (+21 more)

### Community 87 - "progressData.ts"
Cohesion: 0.19
Nodes (12): DayStat, prevDay(), softStreak(), done, AsyncState, DailyProgress, useAttempts(), useDailyProgress() (+4 more)

### Community 88 - "ew.controller.test.ts"
Cohesion: 0.24
Nodes (9): candles, index, proj, pt(), setup(), T0, tap(), TAPS (+1 more)

### Community 89 - "5. Тренд, BOS и CHoCH"
Cohesion: 0.33
Nodes (6): 5.1 Общие правила, 5.2 Внешний слой — машина состояний с защищёнными уровнями, 5.3 Внутренний слой — «последний подтверждённый swing», 5.4 Что происходит после CHoCH, 5.5 Граничные случаи (проверены на реальных свечах), 5. Тренд, BOS и CHoCH

### Community 90 - "grading/grade.test.ts"
Cohesion: 0.10
Nodes (23): algoOf(), ALL, at(), candles, findAlgo(), P, r, window (+15 more)

### Community 91 - "ToolPalette.tsx"
Cohesion: 0.12
Nodes (20): base, base, instructionText(), GroupId, groupOf(), GROUPS, HOTKEY_OF, HOTKEYS (+12 more)

### Community 92 - "package.json"
Cohesion: 0.08
Nodes (31): devDependencies, eslint@^9.39.0, eslint-config-next@^16.0.0, @eslint/js@^9.39.0, @playwright/test@1.63.0, prettier@^3.6.0, @types/node@^22.0.0, typescript@~5.9.3 (+23 more)

### Community 93 - "fib/grade.test.ts"
Cohesion: 0.07
Nodes (39): 4.1 Шкала задания, 1.1 Инструменты разметки, 1.2 Остальные иконки, 1. Набор иконок: lucide-react, imp(), C, pt(), series() (+31 more)

### Community 94 - "6. Внешние API Binance"
Cohesion: 0.40
Nodes (5): status(), 6.1 REST: `GET https://fapi.binance.com/fapi/v1/klines` (браузер), 6.2 WebSocket: kline stream (браузер), 6.3 Архив data.binance.vision (сервер), 6. Внешние API Binance

### Community 95 - "terminal.fib.spec.ts"
Cohesion: 0.28
Nodes (7): P, Fib, findFib(), openFibTool(), pivot(), Pt, RealCandle

### Community 97 - "reveal.ts"
Cohesion: 0.15
Nodes (16): AxisTick, axisTicks(), relativeDuration(), relativeLabel(), STEPS, T, DIR_RU, localizeParam() (+8 more)

### Community 98 - "model.ts"
Cohesion: 0.18
Nodes (24): extensionLevels(), FIB_KINDS, FibKind, FibLevel, labelPriority(), oteRange(), retracementLevels(), thinLabels() (+16 more)

### Community 99 - "src/feedback/index.ts"
Cohesion: 0.09
Nodes (42): PARAM_KINDS, CHALLENGE_VERDICT_TEMPLATES_RU, ELLIOTT_VERDICT_TEMPLATES_RU, ERROR_SKILLS, ERROR_TEMPLATES_RU, ErrorTemplate, EW_ALT_REASON_RU, EW_ALT_TRIGGER_RU (+34 more)

### Community 100 - "AUDIT — финальный дизайн-аудит Trading Lab (M8-UI)"
Cohesion: 0.33
Nodes (5): 1. Итог, 3. Impeccable detect (по URL production-сборки), 4. Что проверено и ограничения, 5. Порядок исправления, AUDIT — финальный дизайн-аудит Trading Lab (M8-UI)

### Community 101 - "sessionStore.ts"
Cohesion: 0.06
Nodes (40): ChallengeApiError, ChallengeErrorKind, fetchNext(), gradeChallenge(), kindOf(), post(), AnswerInput, buildAnswer() (+32 more)

### Community 102 - "Стратегия тестирования — Trading Lab"
Cohesion: 0.12
Nodes (16): 10. Производительность, 1. Принципы, 2. Пирамида, 3. Фикстуры, 4.3 Нормализация (`market-data`), 4.4 Golden-тесты SMC/PA, 4.5 `resolveTrade`, 4.6 Интеграционные тесты API (+8 more)

### Community 103 - "features/feedback/index.ts"
Cohesion: 0.16
Nodes (20): partMax(), ResultView(), revealFeedback(), errors, feedback, defaultFmt, FeedbackView(), FeedbackViewProps (+12 more)

### Community 104 - "fib.helpers.ts"
Cohesion: 0.27
Nodes (11): bodyText(), DATE_LEAK, drawFib(), FIB_STORAGE, fibPoints(), openFib(), PORT, Pt (+3 more)

### Community 105 - "ref_vitest"
Cohesion: 0.21
Nodes (7): contractAttempt(), contractMark, runRepositoryContract(), FakeSupabase, Row, UNIQUE, seedLocal()

### Community 106 - "challenge/resolve.ts"
Cohesion: 0.07
Nodes (31): 10.1 Алгоритм, 10.2 Эталон для «Проведи уровень», 10. `findLevels` — уровни поддержки/сопротивления, AggTrade, done(), Hit, Position, priceHits() (+23 more)

### Community 107 - "patterns.ts"
Cohesion: 0.23
Nodes (17): 9.1 Состав (ответ на OQ-11), 9.3 Выход, 9.4 Проверенные примеры (BTCUSDT 4h 2026-09, GS-5), 9. Свечные модели Price Action (`detectPatterns`), body(), bodyBottom(), bodyTop(), detectPatterns() (+9 more)

### Community 109 - "fib.controller.test.ts"
Cohesion: 0.20
Nodes (11): A_TAP, B_TAP, C_TAP, candles, index, proj, pt(), setup() (+3 more)

### Community 110 - "serialize.ts"
Cohesion: 0.24
Nodes (9): anchor, KINDS, MARKS_FORMAT_VERSION, markSchema, parseMarks(), serializeMarks(), m, validateMarks() (+1 more)

### Community 111 - "fibonacci/adapters.ts"
Cohesion: 0.27
Nodes (9): ANCHORS, fibExtensionAnswer(), fibGridAnswer(), FibKind, fibReactionAnswer(), keepLastFib(), optionFromLevel(), optionRatio() (+1 more)

### Community 112 - "pa/index.ts"
Cohesion: 0.08
Nodes (61): buildPa(), gradePaContext(), gradePaLevel(), reconstructContext(), computeContext(), CONTEXT_STRUCTURE, ContextAnswer, ContextEvidence (+53 more)

### Community 114 - "ThemeProvider.tsx"
Cohesion: 0.12
Nodes (25): Page(), @testing-library/user-event@^14.6.8, wrap(), SettingsScreen(), getDefaultRepository(), RepositoryContext, RepositoryProvider(), useRepository() (+17 more)

### Community 115 - "@playwright/test"
Cohesion: 0.38
Nodes (7): checkAndSeeResult(), nextThenHomeShowsDone(), openSession(), shot(), tapCandle(), solveOne(), selectTool()

### Community 116 - "challenge.helpers.ts"
Cohesion: 0.19
Nodes (11): DATE_LEAK, expandResult(), lastCandleTime(), num(), openReasons(), projectPoint(), SESSION_URL(), startSession() (+3 more)

### Community 117 - "progress/streak.ts"
Cohesion: 0.18
Nodes (17): ChallengeAttemptStat, challengeStats(), dailyProgress(), DayMap, DayRecord, GOAL_DEFAULT, GOAL_MAX, GOAL_MIN (+9 more)

### Community 118 - "3. Внешняя и внутренняя структура"
Cohesion: 0.50
Nodes (4): 3.1 Правило (решение), 3.2 Дедупликация, 3.3 Сигнатура `analyzeStructure`, 3. Внешняя и внутренняя структура

### Community 119 - "criteria.ts"
Cohesion: 0.24
Nodes (17): body(), bottom(), dojiItems(), engulfItems(), finish(), insideItems(), Item, patternCheck() (+9 more)

### Community 120 - "src/feedback/format.ts"
Cohesion: 0.21
Nodes (12): decimalsOf(), DIRECTION_RU, displayValue(), formatFeedbackParams(), ParamFormatters, ParamKind, ParamValue, round2() (+4 more)

### Community 121 - "handlers.test.ts"
Cohesion: 0.09
Nodes (21): FIX, FixtureLoader, CH, challengeDeps(), grade(), Json, loader, mkDeps() (+13 more)

### Community 122 - "DrawingPrimitive.ts"
Cohesion: 0.12
Nodes (25): OpenCandleInfo, PrimitiveState, ZONE_KINDS, dimSpans(), HighlightColumn, highlightColumns(), HighlightRange, labelTop() (+17 more)

### Community 123 - "7. User Flows"
Cohesion: 0.25
Nodes (8): 7.1 Первый вход, 7.2 Сессия Market Structure (режим «Разметка»), 7.3 Trading Challenge: от выбора до разбора, 7.4 Price Action «Контекст», 7.5 Терминал с проверкой разметки, 7.6 Просмотр «Слабых мест», 7.7 Продолжение на другом устройстве, 7. User Flows

### Community 124 - "ProgressScreen.tsx"
Cohesion: 0.14
Nodes (22): ChallengePage(), Page(), ChallengeHome(), DIFFS, recentLine(), StartTf, TF_OPTIONS, RCurve() (+14 more)

### Community 125 - "QA Report — финальная приёмка MVP Trading Lab (M8)"
Cohesion: 0.25
Nodes (7): 1. Сводка, 2. Таблица AC, 3. Ключевые инварианты, 4. Производительность (headless Chromium, software rendering, CPU throttling 4x), 6. Бэклог оркестратора, 7. Не удалось проверить, QA Report — финальная приёмка MVP Trading Lab (M8)

### Community 126 - "useReplay.ts"
Cohesion: 0.43
Nodes (5): BASE_TICK_MS, REPLAY_SPEEDS, ReplaySpeed, stepPlayed(), useReplay()

### Community 127 - "Mark"
Cohesion: 0.07
Nodes (37): CandleHighlight, drawKindOf(), FULL_WIDTH_KINDS, isDrawTool(), isScopedKind(), MarkExtra, RAY_RIGHT_KINDS, TOOL_DEFS (+29 more)

### Community 128 - "fixtures"
Cohesion: 0.50
Nodes (3): fixtures, recorded/ - записанные форматы API (fapi/fstream недоступны из облака, 451), Архивные CSV

### Community 129 - "elliott/placeholders.test.ts"
Cohesion: 0.10
Nodes (19): round3, ALL_ALT, btc3, btc4, COR3, EW_ERRORS, EW_OK, flat (+11 more)

### Community 130 - "handlers.ts"
Cohesion: 0.06
Nodes (49): dynamic, maxDuration, POST(), runtime, dynamic, maxDuration, POST(), runtime (+41 more)

### Community 131 - "AuthProvider.tsx"
Cohesion: 0.14
Nodes (24): dynamic, GET(), dynamic, Page(), AuthContext, AuthRepositoryProvider(), AuthState, DISABLED (+16 more)

### Community 132 - "4. Функциональные требования"
Cohesion: 0.17
Nodes (12): 4.10 Авторизация (FR-AUTH), 4.11 Интерфейс (FR-UI), 4.1 Данные (FR-DATA), 4.2 График (FR-CHART), 4.3 Слой разметки (FR-DRAW), 4.4 Market Structure Analyzer (FR-MS), 4.5 Trading Challenge (FR-TC), 4.6 Price Action Trainer (FR-PA) (+4 more)

### Community 133 - "Подключение Supabase и Vercel (с телефона)"
Cohesion: 0.18
Nodes (10): 1. Проект Supabase, 2. Применить миграцию (создать таблицы), 3. Ключи Supabase, 4. Вход через Google, 5. Redirect URL в Supabase, 6. Vercel, 7. Проверка на телефоне, Если что-то не работает (+2 more)

### Community 135 - "14. Challenge: эталон, оценка качества, WAIT, лимиты"
Cohesion: 0.29
Nodes (7): 14.1 Факты на момент T (`ChallengeFacts`), 14.2 Эталонная сторона `refSide`, 14.3 Оценка качества 0–100 (ответ на OQ-08), независимо от исхода, 14.4 Правильность, вердикт, лимиты, 14.5 Предикаты причин (`ReasonCode`, состав без изменений), 14.6 Подсказки (easy), 14. Challenge: эталон, оценка качества, WAIT, лимиты

### Community 136 - "high"
Cohesion: 0.09
Nodes (25): high(), low(), ADR-0006: Синхронизация таймфреймов — нативные ТФ, инвариант агрегации, sliceAt, Контекст, Последствия, Рассмотренные альтернативы, Решение, 2.1 Сигнатура (+17 more)

### Community 139 - "ELLIOTT — спецификация модуля Elliott Wave Lab (v1.2) для `@tl/core`"
Cohesion: 0.07
Nodes (29): ok(), 10. Проигрывание — `resolveScenario`, 11.1 Части, 11.2 Вердикт, 11.3 Пример (EW-1, easy, разметка 0 = 08-06 23:00 … 5 = 08-09 22:00, `abc-next`, invalidation 77.88, без альтернативы), 11.4 Исход не входит в счёт (решение), 11. Оценка (рубрика 0–100), 12.1 Типы (+21 more)

### Community 140 - "terminal.countdown.spec.ts"
Cohesion: 0.25
Nodes (4): CORS, OPEN, REST_1H, openTerminal()

### Community 141 - "12. `gradeMarks` — сравнение разметки"
Cohesion: 0.25
Nodes (8): 12.1 Сигнатура (расширение `API_CONTRACTS.md`), 12.2 Ключевая свеча метки, 12.3 Группы сопоставления, 12.5 Матчинг (решение: DP по времени вместо венгерского), 12.6 Классификация после матчинга, 12.7 Счёт, вердикт, навыки, 12.8 Пример AC-07 на реальных данных (GS-1), 12. `gradeMarks` — сравнение разметки

### Community 145 - "3. Область продукта"
Cohesion: 0.40
Nodes (5): 3.1 В MVP, 3.2 Вне MVP, 3.3 Требует исследования, 3.4 Технические риски, 3. Область продукта

### Community 147 - "9. Генерация заданий"
Cohesion: 0.33
Nodes (6): 9.1 Общие правила (решение), 9.2 easy — `ew-impulse`, 9.3 medium — `ew-impulse-correction`, 9.4 hard — `ew-scenario`, 9.5 Payload и токен, 9. Генерация заданий

### Community 148 - "fib/types.ts"
Cohesion: 0.22
Nodes (10): ExtensionInput, FibDirection, ReactionInput, FibExtensionAnswer, FibExtensionTask, FibGridAnswer, FibGridTask, FibReactionAnswer (+2 more)

### Community 149 - "14. Коды и шаблоны разбора (источник `src/i18n/ru/feedback`)"
Cohesion: 0.40
Nodes (5): 14.1 Общие блоки, 14.2 Что понято верно (`OkCode`, новые), 14.3 Ошибки (части 3–6), 14.4 Словари текстовых параметров, 14. Коды и шаблоны разбора (источник `src/i18n/ru/feedback`)

### Community 150 - "elliott/index.ts"
Cohesion: 0.08
Nodes (51): EwFormState, ScenarioPanelProps, 15.1 Формат и процесс, 15.2 Участки, 15.3 Покрытие, 15. Golden-участки, bcSupported(), corrTypeOf() (+43 more)

### Community 151 - "1. Общие соглашения"
Cohesion: 0.17
Nodes (12): c(), 1.1 Входные свечи, 1.2 Термины свечи, 1.3 ATR, 1.4 Детерминизм и числа, 1.5 ALGO_VERSION, 1.6 Параметры по сложностям (сводка), 1. Общие соглашения (+4 more)

### Community 154 - "4. Нерушимые правила (обязательны)"
Cohesion: 0.50
Nodes (4): 4.1 Импульс (без диагоналей), 4.2 Коррекции (на уровне цен, подволн нет), 4.3 Граничные случаи (проверены на реальных свечах), 4. Нерушимые правила (обязательны)

### Community 155 - "FIBONACCI — спецификация модуля Fibonacci Playground (v1.1) для `@tl/core`"
Cohesion: 0.07
Nodes (27): 10. Навыки и прогресс, 11.1 Общие блоки, 11.2 Что понято верно (`OkCode`, новые), 11.3 Ошибки (части 3–6), 11. Коды и шаблоны разбора (источник `src/i18n/ru/feedback`), 15. Спорные места и вопросы оркестратору, 2.1 Retracement, 2.2 Extension (Trend-Based Fib Extension A–B–C) (+19 more)

### Community 156 - "playwright.config.ts"
Cohesion: 0.50
Nodes (3): INTRO_DISMISSED, INTRO_KEYS, PORT

### Community 157 - "6. Задание «Где реакция?» (`fib-reaction`)"
Cohesion: 0.33
Nodes (6): 6.1 Момент задания и варианты, 6.2 Генерация с балансировкой ответа (решение), 6.4 Вопрос Premium/Discount, 6.6 Оценка, 6.7 Проигрывание, 6. Задание «Где реакция?» (`fib-reaction`)

### Community 161 - "buildFeedback"
Cohesion: 0.20
Nodes (14): attempt(), 5. Дефекты, inspect(), block(), buildFeedback(), glyphOf(), matchedOf(), OK_BY_SKILL (+6 more)

### Community 162 - "Candle"
Cohesion: 0.15
Nodes (22): TaskReplay, Segment, Draft, GradeCtx, ServerDeps, TaskEnvelope, TaskReplay, ChallengeSource (+14 more)

### Community 167 - "fibonacci/reveal.ts"
Cohesion: 0.22
Nodes (12): outcomeLine(), storableElliott(), block(), Params, plainVerdict(), revealErrors(), revealFeedback(), shiftTimeParams() (+4 more)

## Knowledge Gaps
- **14 isolated node(s):** `ADR-0008`, `ADR-0007`, `ADR-0005`, `ADR-0006`, `ADR-0005` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1251 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Candle` connect `Candle` to `market-structure.ts`, `elliott/placeholders.test.ts`, `handlers.ts`, `elliott/adapters.ts`, `facts.ts`, `fib/types.ts`, `elliott/index.ts`, `elliott/check.ts`, `golden.ew.test.ts`, `session/types.ts`, `src/types.ts`, `DrawingController`, `rules.ts`, `GradeError`, `TradingChart.tsx`, `fib/index.ts`, `TaskTimeframe`, `sources.ts`, `runCheck.ts`, `MarkSession.tsx`, `core/src/index.ts`, `fib/index.ts`, `fib/generate.test.ts`, `elliott.helpers.ts`, `useMarketData.ts`, `archive.ts`, `core/src/index.ts`, `fib/generate.ts`, `TaskSession.tsx`, `ew.controller.test.ts`, `grading/grade.test.ts`, `fib/grade.test.ts`, `6. Внешние API Binance`, `model.ts`, `sessionStore.ts`, `challenge/resolve.ts`, `patterns.ts`, `fib.controller.test.ts`, `pa/index.ts`, `criteria.ts`, `handlers.test.ts`, `Mark`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Mark` (e.g. with `Контекст` and `Последствия`) actually correct?**
  _`Mark` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0008`, `ADR-0007`, `ADR-0005` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `market-structure.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.058496853017400964 - nodes in this community are weakly interconnected._
- **Why does `Mark` connect `Mark` to `market-structure.ts`, `LocalRepository`, `handlers.ts`, `terminal.helpers.ts`, `elliott/adapters.ts`, `elliott/placeholders.test.ts`, `PaContextBody.tsx`, `UtcMs`, `TerminalScreen.tsx`, `ui/index.ts`, `facts.ts`, `fib/types.ts`, `elliott/index.ts`, `layout.ts`, `1. Общие соглашения`, `golden.ew.test.ts`, `session/types.ts`, `src/types.ts`, `MsMarkBody.tsx`, `DrawingController`, `rules.ts`, `GradeError`, `TradingChart.tsx`, `fib/index.ts`, `feedback/placeholders.test.ts`, `TaskTimeframe`, `runCheck.ts`, `grading/grade.ts`, `MarkSession.tsx`, `importLocal.ts`, `fib/index.ts`, `core/src/index.ts`, `fib/generate.ts`, `TaskSession.tsx`, `ew.controller.test.ts`, `grading/grade.test.ts`, `fib/grade.test.ts`, `model.ts`, `sessionStore.ts`, `ref_vitest`, `fib.controller.test.ts`, `serialize.ts`, `fibonacci/adapters.ts`, `pa/index.ts`, `handlers.test.ts`, `DrawingPrimitive.ts`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `UtcMs` (e.g. with `1. Общие соглашения` and `4.1 Шкала задания`) actually correct?**
  _`UtcMs` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `LocalRepository` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._