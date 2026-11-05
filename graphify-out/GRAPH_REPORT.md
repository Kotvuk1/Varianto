# Graph Report - Varianto  (2026-11-05)

## Corpus Check
- 516 files · ~310,161 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 49 file(s) not represented in the graph (top: .csv 43, (none) 4, .example 1)

## Summary
- 3653 nodes · 10967 edges · 175 communities (167 shown, 8 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 351 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ef640fcc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- market-structure.ts
- LocalRepository
- terminal.helpers.ts
- API Contracts — Trading Lab
- impulses.ts
- with
- Architecture — Trading Lab
- react
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
- seriesData.ts
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
- tasks.ts
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
- smc/marks.ts
- TaskTimeframe
- UtcMs
- handlers.ts
- grading/grade.ts
- MarkSession.tsx
- live.ts
- core/src/index.ts
- README.md
- importLocal.ts
- Команда агентов — Trading Lab
- fib/index.ts
- history/route.ts
- fib/ref.ts
- 4. Миграция локальных данных в Supabase при первом входе
- challenge/types.ts
- Находки
- useMarketData.ts
- archive.ts
- screens.test.tsx
- ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`
- Roadmap — Trading Lab
- core/src/index.ts
- fib/generate.ts
- i18n/format.ts
- PRD — Trading Lab
- TaskSession.tsx
- T
- elliott/check.ts
- ChallengeSession.tsx
- 5. Тренд, BOS и CHoCH
- golden.pa-challenge.test.ts
- ToolPalette.tsx
- package.json
- fib/grade.test.ts
- 6. Внешние API Binance
- markText.ts
- web/AGENTS.md
- reveal.ts
- model.ts
- src/feedback/index.ts
- SignInForm.tsx
- SessionActions
- Стратегия тестирования — Trading Lab
- features/feedback/index.ts
- fib.helpers.ts
- ref_vitest
- challenge/resolve.ts
- patterns.ts
- placeholders.test.ts
- fib.controller.test.ts
- serialize.ts
- fibonacci/adapters.ts
- pa/index.ts
- Query
- ThemeProvider.tsx
- @playwright/test
- challenge.helpers.ts
- skills.ts
- CountdownBadge.tsx
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
- RateLimiter
- AuthProvider.tsx
- 4. Функциональные требования
- Подключение Supabase и Vercel (с телефона)
- scripts
- 14. Challenge: эталон, оценка качества, WAIT, лимиты
- 2. `detectSwings` — фрактальные swing
- vercel.json
- ELLIOTT — спецификация модуля Elliott Wave Lab (v1.2) для `@tl/core`
- terminal.countdown.spec.ts
- 12. `gradeMarks` — сравнение разметки
- panels.tsx
- ok
- ADR-0001: Next.js 16 + TypeScript strict, pnpm monorepo, Vercel
- 3. Область продукта
- ADR-0003: Живые данные грузит браузер напрямую (REST + WS), fallback — REST-polling
- 9. Генерация заданий
- fib/types.ts
- 14. Коды и шаблоны разбора (источник `src/i18n/ru/feedback`)
- elliott/index.ts
- 1. Общие соглашения
- 12. Контракты API (расширение `API_CONTRACTS.md`)
- 2. Разметка: Mark-типы, якоря, снап
- 4. Нерушимые правила (обязательны)
- FIBONACCI — спецификация модуля Fibonacci Playground (v1.1) для `@tl/core`
- playwright.config.ts
- 6. Задание «Где реакция?» (`fib-reaction`)
- sessionStore.ts
- elliott.test.ts
- ADR-0004: История для заданий — сервер читает архив data.binance.vision
- buildFeedback
- golden.ew.test.ts
- RelativeAxis.tsx
- 11. Коды и шаблоны разбора (источник `src/i18n/ru/feedback`)
- 2. Уровни, зоны и формулы
- 3. `findImpulses` — импульс для задания и эталон сетки
- fibonacci/reveal.ts
- fib.test.ts
- ReactionForm.tsx
- 2. Карточки
- smc/normalize.test.ts
- 5. Определения метрик прогресса
- 8. FVG (Fair Value Gap)
- 11. Оценка (рубрика 0–100)

## God Nodes (most connected - your core abstractions)
1. `Candle` - 145 edges
2. `Mark` - 117 edges
3. `UtcMs` - 108 edges
4. `react` - 81 edges
5. `TaskTimeframe` - 78 edges
6. `analyzeStructure()` - 51 edges
7. `cn()` - 49 edges
8. `Button()` - 42 edges
9. `Difficulty` - 39 edges
10. `TradingChart()` - 37 edges

## Surprising Connections (you probably didn't know these)
- `1. HIGH: open redirect в /auth/callback (исправлено)` --references--> `safeNextPath()`  [INFERRED]
  docs/SECURITY_REVIEW.md → apps/web/src/auth/config.ts
- `P1` --references--> `fmtPrice()`  [INFERRED]
  docs/design/AUDIT.md → apps/web/src/features/progress/ErrorLog.tsx
- `7.3 Ответ и проверка` --references--> `ok()`  [INFERRED]
  docs/specs/FIBONACCI.md → apps/web/src/features/progress/progressLogic.test.ts
- `4.2 Типы ответа (`Answer`)` --references--> `Answer`  [INFERRED]
  docs/API_CONTRACTS.md → apps/web/src/server/schemas.ts
- `7. Интерфейс `Repository` (`ARCHITECTURE.md` §5.4)` --references--> `Repository`  [INFERRED]
  docs/API_CONTRACTS.md → apps/web/src/storage/types.ts

## Import Cycles
- 2-file cycle: `packages/core/src/candles/aggregate.ts -> packages/core/src/index.ts -> packages/core/src/candles/aggregate.ts`

## Communities (175 total, 8 thin omitted)

### Community 0 - "market-structure.ts"
Cohesion: 0.10
Nodes (41): buildMs(), atrAt(), buildMsQuestion(), checkMsWindow(), CORE_CONCEPTS, drawCandidate(), generateMsQuestion(), gradeMsQuestion() (+33 more)

### Community 1 - "LocalRepository"
Cohesion: 0.07
Nodes (21): LocalRepository, must(), SupabaseRepository, DailyActivity, Repository, graphify, Зона владения, Навыки (+13 more)

### Community 2 - "terminal.helpers.ts"
Cohesion: 0.13
Nodes (28): Fib, findFib(), openFibTool(), pivot(), Pt, Box, candlePoint(), chartCandles() (+20 more)

### Community 3 - "API Contracts — Trading Lab"
Cohesion: 0.10
Nodes (19): 1.1 Формат ошибки, 1.2 Заголовки кэша, 1. Общие соглашения, 2.2 Расширения контрактов (предложение — фиксируются при реализации в `@tl/core`), 2. Типы `@tl/core`, используемые в контрактах, 3.1 `GET /api/health`, 3.2 `GET /api/history`, 3.3 `POST /api/tasks/{module}/next` (+11 more)

### Community 4 - "impulses.ts"
Cohesion: 0.23
Nodes (11): 12.1 Формат и процесс, 12.2 Участки, 12.3 Покрытие граничных случаев golden-участками, 12. Golden-участки, argExtreme(), findImpulses(), ImpulseParams, maxHigh() (+3 more)

### Community 5 - "with"
Cohesion: 0.08
Nodes (26): runs-on, steps, GITHUB_TOKEN, jobs, check, secrets-scan, name, on (+18 more)

### Community 6 - "Architecture — Trading Lab"
Cohesion: 0.11
Nodes (18): 10. Развёртывание, 11. Риски, 1. Ключевые ограничения, определяющие архитектуру, 2. Обзор, 3. Репозиторий (pnpm monorepo), 4.1 Синхронизация таймфреймов, 4.2 Разметка (общая модель для пользователя и алгоритма), 4.3 Алгоритмы (детерминированные, версионируемые) (+10 more)

### Community 7 - "react"
Cohesion: 0.08
Nodes (47): AppError(), Page(), Page(), MsMarkBody(), highlightMarks(), MsQuestionBody(), MsSessionScreen(), PaFindBody() (+39 more)

### Community 8 - "progressLogic.ts"
Cohesion: 0.12
Nodes (32): Page(), ContinueBlock(), HomeWeakSpots(), LearnScreen(), MODULES, ModuleAccuracy(), asCore(), canTrain() (+24 more)

### Community 9 - "market-data/package.json"
Cohesion: 0.11
Nodes (20): dependencies, fflate@^0.8.3, @tl/core@workspace:*, devDependencies, vitest@^4.1.12, @vitest/coverage-v8@^4.1.12, exports, ./archive (+12 more)

### Community 10 - "UtcMs"
Cohesion: 0.13
Nodes (19): DailyActivityRow, SkillStatRow, TerminalMarksRow, TradingLabDB, defaultSettings(), LocalSnapshot, mark, Attempt (+11 more)

### Community 11 - "TerminalScreen.tsx"
Cohesion: 0.19
Nodes (19): TerminalPage(), ARCHIVE_MIN_AGE_MS, ARCHIVE_SYMBOLS, archiveAllowed(), archiveHref(), archivePageSize(), normalizeSymbolInput(), offerArchive() (+11 more)

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
Cohesion: 0.07
Nodes (48): isScopedKind(), ORDER, ResultSheet(), ResultSheetHeight, ResultSheetProps, SHEET_CLASS, SHEET_PAD, ChoiceOption (+40 more)

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
Nodes (61): age(), CHALLENGE_STRUCTURE, ChallengeFacts, computeChallengeFacts(), FactsInput, HTF, intersects(), lastEventSince() (+53 more)

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
Cohesion: 0.06
Nodes (40): distToRectEdge(), distToSegment(), Hit, hitLevel(), hitTest(), inside(), partScore(), geos() (+32 more)

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
Cohesion: 0.13
Nodes (10): ADR-0008: Local-first хранилище за интерфейсом Repository; Supabase в M7, Контекст, Открытые вопросы, Последствия, Рассмотренные альтернативы, ADR-0009: Детерминированное общее ядро @tl/core; разборы по шаблонам; ИИ позже, Контекст, Последствия (+2 more)

### Community 29 - "elliott/check.ts"
Cohesion: 0.15
Nodes (34): 7.1 `enumerateCounts` — все допустимые разметки до текущей точки, 7.2 `findWaveCandidates` — участки для easy/medium, 7. Детекторы, findWaveCandidates(), Pivot, zigzagPivots(), atrOf(), enumerateCounts() (+26 more)

### Community 30 - "golden.ew.test.ts"
Cohesion: 0.09
Nodes (34): EASY, MEDIUM, btc4, run(), sol, SOL_IMP, scan(), EW_WEIGHTS (+26 more)

### Community 31 - "seriesData.ts"
Cohesion: 0.18
Nodes (15): limitCandles(), OPEN_CANDLE_ALPHA, pricePrecision(), T0, tokens, toCandleData(), toVolumeData(), VOLUME_ALPHA (+7 more)

### Community 32 - "fetch-fixtures.mjs"
Cohesion: 0.07
Nodes (29): dynamic, GET(), safeEqual(), ChallengeAttemptStat, challengeStats(), dailyProgress(), DayMap, DayRecord (+21 more)

### Community 33 - "Trading Lab"
Cohesion: 0.33
Nodes (6): Trading Lab, Быстрый старт, Документация, Команды, Ограничения, Структура

### Community 34 - "token.ts"
Cohesion: 0.11
Nodes (27): ApiError, ApiErrorCode, ConfigError, ValidationIssue, b64(), derive(), getSigningSecret(), HeaderSchema (+19 more)

### Community 35 - "session/types.ts"
Cohesion: 0.08
Nodes (47): Page(), Page(), Page(), Page(), FibSessionScreen(), INTRO, FibSetup(), FIB_TYPES (+39 more)

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
Cohesion: 0.08
Nodes (56): 2.1 Из `ARCHITECTURE.md` §4 (дословно), Решение, 1.2 Переиспользуемые соглашения (без изменений), 1.2 Переиспользуемые соглашения (без изменений), 3.4 Граничные случаи (проверены на реальных свечах), golden/ - эталонные участки SMC (ALGORITHMS §18), at(), allSwingsMap (+48 more)

### Community 45 - "tasks.ts"
Cohesion: 0.09
Nodes (33): ElliottParamsSchema, buildChallenge(), ChReq, FIB_EXTRA, FibParamsT, FibReq, GradeCtx, gradeMsMark() (+25 more)

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
Cohesion: 0.05
Nodes (49): dependencies, dexie@^4.0.0, lightweight-charts@~5.2.1, lucide-react@^1.66.0, next@^16.0.0, react@^19.0.0, react-dom@^19.0.0, @supabase/ssr@^0.12.7 (+41 more)

### Community 52 - "DrawingController"
Cohesion: 0.09
Nodes (23): constrainAnchors(), createMark(), DrawKind, FULL_WIDTH_KINDS, isDrawKind(), MarkExtra, RAY_RIGHT_KINDS, TOOL_DEFS (+15 more)

### Community 53 - "rules.ts"
Cohesion: 0.12
Nodes (37): PointerKind, SWING_SIDE, fibDirection(), snapFibAnchor(), Built, Gesture, NoticeCode, Pending (+29 more)

### Community 54 - "PaContextBody.tsx"
Cohesion: 0.11
Nodes (30): dismissIntro(), isIntroDismissed(), key(), TaskIntro(), TaskIntroProps, Host(), Annotated(), byAlias (+22 more)

### Community 55 - "schemas.ts"
Cohesion: 0.07
Nodes (26): AnchorSchema, AnswerSchema, BUSINESS_CODES, ChallengeAnswer, ChallengeAnswerSchema, difficulty, ElliottAnswerApi, ElliottAnswerSchema (+18 more)

### Community 56 - "GradeError"
Cohesion: 0.18
Nodes (27): ChallengeGradeResult, TaskPayload, NextRequest, Core, GradeResultApi, 5.2 `Feedback` (6 частей, FR-FB-02), 19. Расхождения с документами, 17. Расхождения с документами (+19 more)

### Community 57 - "TradingChart.tsx"
Cohesion: 0.11
Nodes (19): lwcProjection(), snapAnchor(), SnapOptions, snapPriceToCandle(), synthetic_candles, T0, T0, TimeIndex (+11 more)

### Community 58 - "fib/index.ts"
Cohesion: 0.09
Nodes (26): 7.1 Момент задания и точка C, 7.2 Исход — `resolveExtension` (решение), 7.3 Ответ и проверка, 7. Задание «Цель по Extension» (`fib-extension`), idx(), FILES, STEP, classifyReaction() (+18 more)

### Community 59 - "smc/marks.ts"
Cohesion: 0.08
Nodes (33): CheckOutcome, CheckState, CONCEPT_OF, conceptsFor(), RANGE_TAIL_CANDLES, runCheck(), algoMarks, candles (+25 more)

### Community 60 - "TaskTimeframe"
Cohesion: 0.09
Nodes (41): archiveMonths(), buildElliott(), catalogCache, ElliottParams, EW_MAX_SEGMENTS, EwReq, gradeElliottTask(), key() (+33 more)

### Community 61 - "UtcMs"
Cohesion: 0.07
Nodes (38): FIX, FixtureLoader, deps(), fixtures, flaky(), NOW, post(), ARCHIVE_START (+30 more)

### Community 62 - "handlers.ts"
Cohesion: 0.17
Nodes (17): dynamic, maxDuration, POST(), runtime, errorResponse(), toApiError(), guard(), handleGrade() (+9 more)

### Community 63 - "grading/grade.ts"
Cohesion: 0.20
Nodes (16): normalizeParams(), kindName(), Entry, gradeMarks(), Group, groupEvaluated(), groupOf(), iou() (+8 more)

### Community 64 - "MarkSession.tsx"
Cohesion: 0.14
Nodes (36): decimalsForTick(), makePriceFormatter(), TICK_TABLE, tickSizeFor(), TradingChartHandle, fmtOf(), FibBody(), Kind (+28 more)

### Community 65 - "live.ts"
Cohesion: 0.08
Nodes (20): Frontend Developer, BINANCE_REST_BASE, BINANCE_WS_BASE, binanceInterval(), FetchKlinesOptions, LiveErrorCode, LiveFeed, LiveFeedError (+12 more)

### Community 66 - "core/src/index.ts"
Cohesion: 0.10
Nodes (27): load(), klinesZip(), NOW, Served, zipOf(), ArchiveErrorCode, LiveStatus, archiveH1 (+19 more)

### Community 67 - "README.md"
Cohesion: 0.13
Nodes (7): 1. Итог, 3. Impeccable detect (по URL production-сборки), 4. Что проверено и ограничения, 5. Порядок исправления, AUDIT — финальный дизайн-аудит Trading Lab (M8-UI), Known Issues — Trading Lab, Не проверено вообще (среда)

### Community 68 - "importLocal.ts"
Cohesion: 0.19
Nodes (21): chunks(), IMPORTED_USER_META, ImportOutcome, importSnapshot(), must(), recomputeDerived(), Row, runFirstSignInImport() (+13 more)

### Community 69 - "Команда агентов — Trading Lab"
Cohesion: 0.25
Nodes (7): 1. Сводка, 3. Правила оркестрации, 4. Формат отчёта агента (до 15 строк), 5. Шаблон задания агенту, 6. Уроки оркестрации, Команда агентов — Trading Lab, Правило graphify (включается в каждый промпт агента, исследующего код)

### Community 70 - "fib/index.ts"
Cohesion: 0.10
Nodes (43): 13. Тест-план для реализации (TDD, `packages/core/src/fib/`), checkFibMarks(), dirOf(), emptyDetail(), FIB_TERMINAL_MAX_DISTANCE, FIB_TERMINAL_NEXT, FibMarkCheck, nearest() (+35 more)

### Community 71 - "history/route.ts"
Cohesion: 0.12
Nodes (15): ARCHIVE_START_MS, dynamic, errorResponse(), GET(), ISSUE_CODES, querySchema, runtime, SYMBOLS (+7 more)

### Community 72 - "fib/ref.ts"
Cohesion: 0.11
Nodes (27): ReactionFormProps, buildFib(), gradeFibTask(), FibConfluence, overlaps(), fibExtensionTask(), fibGridTask(), C (+19 more)

### Community 73 - "4. Миграция локальных данных в Supabase при первом входе"
Cohesion: 0.29
Nodes (6): ImportReport, 4.1 Порядок, 4.2 Правила по таблицам (идемпотентность по `id`, конфликты по `updated_at`), 4.3 Пересчёт производных данных, 4.4 Ошибки и откат, 4. Миграция локальных данных в Supabase при первом входе

### Community 74 - "challenge/types.ts"
Cohesion: 0.16
Nodes (12): buildAttempt(), AnswerInput, ChallengeAnswerBody, ChallengeDetailDto, ChallengeOutcomeDto, ChallengePayload, ChallengeTaskEnvelope, QualityPart (+4 more)

### Community 75 - "Находки"
Cohesion: 0.13
Nodes (15): clientKey(), 1. HIGH: open redirect в /auth/callback (исправлено), 2. MEDIUM: обход rate limit через X-Forwarded-For (исправлено частично), 4. LOW: /api/cron/keepalive (открыто), 5. LOW: Supabase (повторное чтение 0001_init.sql), 6. LOW: заголовки/CSP (фактически curl на production-сборке), 7. LOW: токены (src/server/token.ts) - корректно, 8. Утечка даты Challenge (+7 more)

### Community 76 - "useMarketData.ts"
Cohesion: 0.14
Nodes (18): ClockSync, eventTimeOf(), sniffingFetch(), sniffingWebSocket(), archiveWindow(), HISTORY_PAGE, SourceMode, appendCandle() (+10 more)

### Community 77 - "archive.ts"
Cohesion: 0.15
Nodes (14): AGG_TRADES_HEADER, AggTrade, ARCHIVE_BASE_URL, ArchiveFetch, ArchiveFileSpec, ArchiveSource, ArchiveSourceOptions, archiveUrl() (+6 more)

### Community 78 - "screens.test.tsx"
Cohesion: 0.22
Nodes (14): metadata, plexMono, plexSans, RootLayout(), viewport, AppShell(), BottomTabs(), DesktopTabs() (+6 more)

### Community 79 - "ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`"
Cohesion: 0.10
Nodes (21): 16.1 Навыки, 16.2 Обновление точности, 16.3 Адаптивная подборка, 16. Навыки и прогресс, 18.1 Формат и процесс, 18.3 Что ещё размечается после утверждения (M4/M5), 18. Golden-тесты, 20. Спорные места и вопросы оркестратору (+13 more)

### Community 80 - "Roadmap — Trading Lab"
Cohesion: 0.29
Nodes (6): MVP, Roadmap — Trading Lab, v1.1 — Fibonacci Playground и Premium/Discount, v1.2 — Elliott Wave Lab, v2, Правила корректировки

### Community 81 - "core/src/index.ts"
Cohesion: 0.13
Nodes (11): dynamic, GET(), candles, selectHints(), time(), aggregate(), SeriesByTf, sliceAt() (+3 more)

### Community 82 - "fib/generate.ts"
Cohesion: 0.14
Nodes (23): Ctx, desiredClass(), EXT_TARGETS, extremesOk(), FibPick, FibPickInput, hasTrap(), pickExtension() (+15 more)

### Community 83 - "i18n/format.ts"
Cohesion: 0.15
Nodes (25): DIR, formatParam(), FORMATTERS(), formatWhen(), KIND_KEYS, placeOf(), ErrorLog(), errorName() (+17 more)

### Community 84 - "PRD — Trading Lab"
Cohesion: 0.12
Nodes (16): 10. Приоритизация функций (MoSCoW), 11. План MVP, 12. Открытые вопросы, 1.1 Что это, 1.2 Цель, 1.3 Целевой пользователь, 1.4 Модули, 1. Обзор и цель продукта (+8 more)

### Community 85 - "TaskSession.tsx"
Cohesion: 0.13
Nodes (29): AnswerSessionProps, createTaskApi(), kindOf(), post(), TaskApi, buildAttempt(), BuildAttemptInput, saveTaskAttempt() (+21 more)

### Community 86 - "T"
Cohesion: 0.10
Nodes (25): ADR-0005: Stateless-задания с подписанными токенами; будущее только на сервере, Контекст, Открытые вопросы, Последствия, Рассмотренные альтернативы, Решение, ADR-0006: Синхронизация таймфреймов — нативные ТФ, инвариант агрегации, sliceAt, Контекст (+17 more)

### Community 87 - "elliott/check.ts"
Cohesion: 0.16
Nodes (23): atrCache, checkCount(), EW_N_POINT, EW_TOLERANCE_CANDLES, EwCheck, GUIDE_SKILL(), snapIndex(), swingCache (+15 more)

### Community 88 - "ChallengeSession.tsx"
Cohesion: 0.18
Nodes (15): ChallengeSessionPage(), ChallengeErrorKind, fetchNext(), gradeChallenge(), kindOf(), post(), ChallengeSession(), FOCUS_SKILLS (+7 more)

### Community 89 - "5. Тренд, BOS и CHoCH"
Cohesion: 0.33
Nodes (6): 5.1 Общие правила, 5.2 Внешний слой — машина состояний с защищёнными уровнями, 5.3 Внутренний слой — «последний подтверждённый swing», 5.4 Что происходит после CHoCH, 5.5 Граничные случаи (проверены на реальных свечах), 5. Тренд, BOS и CHoCH

### Community 90 - "golden.pa-challenge.test.ts"
Cohesion: 0.15
Nodes (9): c4h, FIX, loadAggTrades(), ROOT, TestAggTrade, ANALYSIS_ALGO_VERSION, dst, root (+1 more)

### Community 91 - "ToolPalette.tsx"
Cohesion: 0.16
Nodes (18): base, GroupId, groupOf(), GROUPS, HOTKEY_OF, HOTKEYS, ic, MOBILE_GROUPS (+10 more)

### Community 92 - "package.json"
Cohesion: 0.12
Nodes (21): devDependencies, eslint@^9.39.0, eslint-config-next@^16.0.0, @eslint/js@^9.39.0, @playwright/test@1.63.0, prettier@^3.6.0, @types/node@^22.0.0, typescript@~5.9.3 (+13 more)

### Community 93 - "fib/grade.test.ts"
Cohesion: 0.08
Nodes (35): 4.1 Шкала задания, h1, imp(), C, pt(), series(), upTo(), FG1 (+27 more)

### Community 94 - "6. Внешние API Binance"
Cohesion: 0.40
Nodes (5): status(), 6.1 REST: `GET https://fapi.binance.com/fapi/v1/klines` (браузер), 6.2 WebSocket: kline stream (браузер), 6.3 Архив data.binance.vision (сервер), 6. Внешние API Binance

### Community 95 - "markText.ts"
Cohesion: 0.18
Nodes (12): patternLabel(), isFibKind(), MarksSheet(), MarksSheetProps, describeMark(), formatWhen, markName(), fmt (+4 more)

### Community 97 - "reveal.ts"
Cohesion: 0.16
Nodes (14): partMax(), ResultView(), DIR_RU, formatScenarioDate(), localizeParam(), POI_RU, resolutionNote(), revealFeedback() (+6 more)

### Community 98 - "model.ts"
Cohesion: 0.23
Nodes (21): extensionLevels(), FIB_KINDS, FibKind, FibLevel, labelPriority(), oteRange(), retracementLevels(), thinLabels() (+13 more)

### Community 99 - "src/feedback/index.ts"
Cohesion: 0.09
Nodes (42): PARAM_KINDS, CHALLENGE_VERDICT_TEMPLATES_RU, ELLIOTT_VERDICT_TEMPLATES_RU, ERROR_SKILLS, ERROR_TEMPLATES_RU, ErrorTemplate, EW_ALT_REASON_RU, EW_ALT_TRIGGER_RU (+34 more)

### Community 100 - "SignInForm.tsx"
Cohesion: 0.20
Nodes (12): NotFound(), csp, nextConfig, Probe(), useAuth(), callbackUrl(), SignInForm(), google() (+4 more)

### Community 101 - "SessionActions"
Cohesion: 0.10
Nodes (5): ChallengeApiError, toError(), Side, SessionActions, SessionState

### Community 102 - "Стратегия тестирования — Trading Lab"
Cohesion: 0.12
Nodes (16): 10. Производительность, 1. Принципы, 3. Фикстуры, 4.1 Инвариант агрегации таймфреймов, 4.2 `sliceAt(series, T)`, 4.3 Нормализация (`market-data`), 4.4 Golden-тесты SMC/PA, 4.5 `resolveTrade` (+8 more)

### Community 103 - "features/feedback/index.ts"
Cohesion: 0.15
Nodes (23): errors, feedback, defaultFmt, FeedbackView(), FeedbackViewProps, Section(), renderBlock(), GlyphKind (+15 more)

### Community 104 - "fib.helpers.ts"
Cohesion: 0.25
Nodes (12): bodyText(), DATE_LEAK, drawFib(), FIB_STORAGE, fibPoints(), openFib(), PORT, Pt (+4 more)

### Community 105 - "ref_vitest"
Cohesion: 0.23
Nodes (7): contractAttempt(), contractMark, runRepositoryContract(), FakeSupabase, Row, UNIQUE, seedLocal()

### Community 106 - "challenge/resolve.ts"
Cohesion: 0.09
Nodes (26): ADR-0007: Правила исхода сделки Challenge (drill-down), Контекст, Открытые вопросы (закрыты: `docs/specs/ALGORITHMS.md`), Последствия, Рассмотренные альтернативы, Решение, 10.1 Алгоритм, 10.2 Эталон для «Проведи уровень» (+18 more)

### Community 107 - "patterns.ts"
Cohesion: 0.18
Nodes (19): 9.1 Состав (ответ на OQ-11), body(), bodyBottom(), bodyTop(), detectPatterns(), engulfing(), isBear(), isBull() (+11 more)

### Community 108 - "placeholders.test.ts"
Cohesion: 0.12
Nodes (14): algo, ALL, bad, candles, FIB_ERROR_CODES, FIB_OK_CODES, flat, FLIP (+6 more)

### Community 109 - "fib.controller.test.ts"
Cohesion: 0.18
Nodes (10): A_TAP, B_TAP, C_TAP, candles, index, proj, pt(), setup() (+2 more)

### Community 110 - "serialize.ts"
Cohesion: 0.20
Nodes (11): zod@^4.0.0, anchor, KINDS, MARKS_FORMAT_VERSION, markSchema, parseMarks(), serializeMarks(), m (+3 more)

### Community 111 - "fibonacci/adapters.ts"
Cohesion: 0.27
Nodes (9): ANCHORS, fibExtensionAnswer(), fibGridAnswer(), FibKind, fibReactionAnswer(), keepLastFib(), optionFromLevel(), optionRatio() (+1 more)

### Community 112 - "pa/index.ts"
Cohesion: 0.08
Nodes (64): depthOf(), buildPa(), gradePaContext(), pickSegment(), reconstructContext(), rngOf(), symbolFor(), 18.2 Участки (+56 more)

### Community 114 - "ThemeProvider.tsx"
Cohesion: 0.08
Nodes (38): Page(), DayStat, prevDay(), softStreak(), done, AsyncState, DailyProgress, useAttempts() (+30 more)

### Community 115 - "@playwright/test"
Cohesion: 0.28
Nodes (8): checkAndSeeResult(), nextThenHomeShowsDone(), openSession(), shot(), tapCandle(), solveOne(), selectTool(), @playwright/test

### Community 116 - "challenge.helpers.ts"
Cohesion: 0.24
Nodes (10): DATE_LEAK, expandResult(), lastCandleTime(), num(), openReasons(), projectPoint(), SESSION_URL(), startSession() (+2 more)

### Community 117 - "skills.ts"
Cohesion: 0.23
Nodes (13): accuracyOf(), applyOutcome(), FOCUS_SIZE, isEnoughData(), MIN_WEIGHT, OK_THRESHOLD, pickFocus(), rankWeakSkills() (+5 more)

### Community 118 - "CountdownBadge.tsx"
Cohesion: 0.21
Nodes (8): CandleCountdown, ClockOffsetEstimator, formatCountdown(), pad2(), remainingMs(), CountdownBadge(), CountdownBadgeProps, View

### Community 119 - "criteria.ts"
Cohesion: 0.23
Nodes (18): body(), bottom(), dojiItems(), engulfItems(), finish(), insideItems(), Item, PatternCheck (+10 more)

### Community 120 - "src/feedback/format.ts"
Cohesion: 0.21
Nodes (12): decimalsOf(), DIRECTION_RU, displayValue(), formatFeedbackParams(), ParamFormatters, ParamKind, ParamValue, round2() (+4 more)

### Community 121 - "handlers.test.ts"
Cohesion: 0.15
Nodes (13): CH, challengeDeps(), grade(), Json, loader, mkDeps(), MS_MARK, MS_Q (+5 more)

### Community 122 - "DrawingPrimitive.ts"
Cohesion: 0.16
Nodes (10): DrawingPrimitive, OpenCandleInfo, PrimitiveState, ZONE_KINDS, dimSpans(), HighlightColumn, highlightColumns(), HighlightRange (+2 more)

### Community 123 - "7. User Flows"
Cohesion: 0.25
Nodes (8): 7.1 Первый вход, 7.2 Сессия Market Structure (режим «Разметка»), 7.3 Trading Challenge: от выбора до разбора, 7.4 Price Action «Контекст», 7.5 Терминал с проверкой разметки, 7.6 Просмотр «Слабых мест», 7.7 Продолжение на другом устройстве, 7. User Flows

### Community 124 - "ProgressScreen.tsx"
Cohesion: 0.11
Nodes (36): ChallengePage(), Page(), ChallengeHome(), DIFFS, recentLine(), StartTf, Stats(), TF_OPTIONS (+28 more)

### Community 125 - "QA Report — финальная приёмка MVP Trading Lab (M8)"
Cohesion: 0.22
Nodes (8): 1. Сводка, 2. Таблица AC, 3. Ключевые инварианты, 4. Производительность (headless Chromium, software rendering, CPU throttling 4x), 5. Дефекты, 6. Бэклог оркестратора, 7. Не удалось проверить, QA Report — финальная приёмка MVP Trading Lab (M8)

### Community 126 - "useReplay.ts"
Cohesion: 0.43
Nodes (5): BASE_TICK_MS, REPLAY_SPEEDS, ReplaySpeed, stepPlayed(), useReplay()

### Community 127 - "Mark"
Cohesion: 0.13
Nodes (27): CandleHighlight, ToolId, ControllerDeps, ControllerNotice, TimeWindow, crosshairTimeFormatter(), FLASH_MS, mark (+19 more)

### Community 128 - "fixtures"
Cohesion: 0.50
Nodes (3): fixtures, recorded/ - записанные форматы API (fapi/fstream недоступны из облака, 451), Архивные CSV

### Community 129 - "elliott/placeholders.test.ts"
Cohesion: 0.11
Nodes (17): ALL_ALT, btc3, btc4, COR3, EW_ERRORS, EW_OK, flat, IMP1 (+9 more)

### Community 130 - "RateLimiter"
Cohesion: 0.19
Nodes (13): dynamic, maxDuration, POST(), runtime, getDeps(), getHistoryLimiter(), rateFromEnv(), deps() (+5 more)

### Community 131 - "AuthProvider.tsx"
Cohesion: 0.16
Nodes (17): dynamic, GET(), dynamic, Page(), AuthContext, AuthRepositoryProvider(), AuthState, DISABLED (+9 more)

### Community 132 - "4. Функциональные требования"
Cohesion: 0.17
Nodes (12): 4.10 Авторизация (FR-AUTH), 4.11 Интерфейс (FR-UI), 4.1 Данные (FR-DATA), 4.2 График (FR-CHART), 4.3 Слой разметки (FR-DRAW), 4.4 Market Structure Analyzer (FR-MS), 4.5 Trading Challenge (FR-TC), 4.6 Price Action Trainer (FR-PA) (+4 more)

### Community 133 - "Подключение Supabase и Vercel (с телефона)"
Cohesion: 0.18
Nodes (10): 1. Проект Supabase, 2. Применить миграцию (создать таблицы), 3. Ключи Supabase, 4. Вход через Google, 5. Redirect URL в Supabase, 6. Vercel, 7. Проверка на телефоне, Если что-то не работает (+2 more)

### Community 134 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, check:tokens, dev, format, lint, sync:tokens, test (+2 more)

### Community 135 - "14. Challenge: эталон, оценка качества, WAIT, лимиты"
Cohesion: 0.29
Nodes (7): 14.1 Факты на момент T (`ChallengeFacts`), 14.2 Эталонная сторона `refSide`, 14.3 Оценка качества 0–100 (ответ на OQ-08), независимо от исхода, 14.4 Правильность, вердикт, лимиты, 14.5 Предикаты причин (`ReasonCode`, состав без изменений), 14.6 Подсказки (easy), 14. Challenge: эталон, оценка качества, WAIT, лимиты

### Community 136 - "2. `detectSwings` — фрактальные swing"
Cohesion: 0.33
Nodes (6): 2.1 Сигнатура, 2.2 Определение, 2.3 Граничные случаи, 2.4 Кандидаты у правого края (`pendingSwings`), 2.5 Псевдокод, 2. `detectSwings` — фрактальные swing

### Community 139 - "ELLIOTT — спецификация модуля Elliott Wave Lab (v1.2) для `@tl/core`"
Cohesion: 0.17
Nodes (11): 10. Проигрывание — `resolveScenario`, 13. Навыки и прогресс, 18. Спорные места и вопросы оркестратору, 19. Решения оркестратора (2026-11-05), 1.1 Что входит, 1.3 Направление, роли точек, обозначения, 1. Область и общие соглашения, 3. Проверка точек (до правил) (+3 more)

### Community 140 - "terminal.countdown.spec.ts"
Cohesion: 0.25
Nodes (4): CORS, OPEN, REST_1H, openTerminal()

### Community 141 - "12. `gradeMarks` — сравнение разметки"
Cohesion: 0.13
Nodes (15): external(), 12.1 Сигнатура (расширение `API_CONTRACTS.md`), 12.2 Ключевая свеча метки, 12.3 Группы сопоставления, 12.4 Совместимость и стоимость пары, 12.5 Матчинг (решение: DP по времени вместо венгерского), 12.6 Классификация после матчинга, 12.7 Счёт, вердикт, навыки (+7 more)

### Community 142 - "panels.tsx"
Cohesion: 0.28
Nodes (14): blockerKey(), DecisionPanel(), ErrorBlock(), errorCopy(), PriceField(), ReasonsSheet(), buildAnswer(), formatRR() (+6 more)

### Community 143 - "ok"
Cohesion: 0.20
Nodes (11): ok(), 11.1 Части, 16. Тест-план для реализации (TDD, `packages/core/src/elliott/`), 6.1 Закрытый список (`EwScenarioId`, новое), 6.2 Согласованность, 6.3 Уровень invalidation (`ruleLevel`) и оценка ответа, 6. Сценарии, альтернатива, invalidation, 5.1 Генерация (+3 more)

### Community 144 - "ADR-0001: Next.js 16 + TypeScript strict, pnpm monorepo, Vercel"
Cohesion: 0.33
Nodes (5): ADR-0001: Next.js 16 + TypeScript strict, pnpm monorepo, Vercel, Контекст, Последствия, Рассмотренные альтернативы, Решение

### Community 145 - "3. Область продукта"
Cohesion: 0.40
Nodes (5): 3.1 В MVP, 3.2 Вне MVP, 3.3 Требует исследования, 3.4 Технические риски, 3. Область продукта

### Community 146 - "ADR-0003: Живые данные грузит браузер напрямую (REST + WS), fallback — REST-polling"
Cohesion: 0.33
Nodes (5): ADR-0003: Живые данные грузит браузер напрямую (REST + WS), fallback — REST-polling, Контекст, Последствия, Рассмотренные альтернативы, Решение

### Community 147 - "9. Генерация заданий"
Cohesion: 0.33
Nodes (6): 9.1 Общие правила (решение), 9.2 easy — `ew-impulse`, 9.3 medium — `ew-impulse-correction`, 9.4 hard — `ew-scenario`, 9.5 Payload и токен, 9. Генерация заданий

### Community 148 - "fib/types.ts"
Cohesion: 0.21
Nodes (14): ExtensionInput, ExtensionOutcome, resolveExtension(), Case, CASES, ExtensionPointsResult, FibDirection, FibAnchorCheck (+6 more)

### Community 149 - "14. Коды и шаблоны разбора (источник `src/i18n/ru/feedback`)"
Cohesion: 0.40
Nodes (5): 14.1 Общие блоки, 14.2 Что понято верно (`OkCode`, новые), 14.3 Ошибки (части 3–6), 14.4 Словари текстовых параметров, 14. Коды и шаблоны разбора (источник `src/i18n/ru/feedback`)

### Community 150 - "elliott/index.ts"
Cohesion: 0.11
Nodes (42): 15.1 Формат и процесс, 15.2 Участки, 15.3 Покрытие, 15. Golden-участки, CandidateParams, EnumerateParams, bcSupported(), corrTypeOf() (+34 more)

### Community 151 - "1. Общие соглашения"
Cohesion: 0.13
Nodes (15): c(), 1.1 Входные свечи, 1.2 Термины свечи, 1.3 ATR, 1.4 Детерминизм и числа, 1.5 ALGO_VERSION, 1.6 Параметры по сложностям (сводка), 1. Общие соглашения (+7 more)

### Community 152 - "12. Контракты API (расширение `API_CONTRACTS.md`)"
Cohesion: 0.50
Nodes (4): 12.1 Типы, 12.2 `POST /api/tasks/elliott/next`, 12.3 `POST /api/tasks/elliott/grade`, 12. Контракты API (расширение `API_CONTRACTS.md`)

### Community 153 - "2. Разметка: Mark-типы, якоря, снап"
Cohesion: 0.50
Nodes (4): 2.1 Mark-типы (новое), 2.2 Снап и допуск по времени, 2.3 Уровень invalidation и сценарии в ответе, 2. Разметка: Mark-типы, якоря, снап

### Community 154 - "4. Нерушимые правила (обязательны)"
Cohesion: 0.50
Nodes (4): 4.1 Импульс (без диагоналей), 4.2 Коррекции (на уровне цен, подволн нет), 4.3 Граничные случаи (проверены на реальных свечах), 4. Нерушимые правила (обязательны)

### Community 155 - "FIBONACCI — спецификация модуля Fibonacci Playground (v1.1) для `@tl/core`"
Cohesion: 0.20
Nodes (9): 10. Навыки и прогресс, 15. Спорные места и вопросы оркестратору, 4. Параметры по сложностям (сводка), 8. Свободный терминал (предложение), 9.1 Типы, 9.2 `POST /api/tasks/fibonacci/next`, 9.3 `POST /api/tasks/fibonacci/grade`, 9. Контракты API (расширение `API_CONTRACTS.md`) (+1 more)

### Community 156 - "playwright.config.ts"
Cohesion: 0.50
Nodes (3): INTRO_DISMISSED, INTRO_KEYS, PORT

### Community 157 - "6. Задание «Где реакция?» (`fib-reaction`)"
Cohesion: 0.29
Nodes (7): 6.1 Момент задания и варианты, 6.2 Генерация с балансировкой ответа (решение), 6.3 Определение реакции (решение) — `resolveReaction`, 6.4 Вопрос Premium/Discount, 6.6 Оценка, 6.7 Проигрывание, 6. Задание «Где реакция?» (`fib-reaction`)

### Community 158 - "sessionStore.ts"
Cohesion: 0.21
Nodes (12): defaultLevels(), roundToTick(), atrOf(), createSessionStore(), INITIAL, Phase, SessionStore, Speed (+4 more)

### Community 159 - "elliott.test.ts"
Cohesion: 0.18
Nodes (11): clearEwCatalogCache(), ewCatalogCacheSize(), easyAnswer(), grade(), Json, loader, mk(), next() (+3 more)

### Community 160 - "ADR-0004: История для заданий — сервер читает архив data.binance.vision"
Cohesion: 0.33
Nodes (5): ADR-0004: История для заданий — сервер читает архив data.binance.vision, Контекст, Последствия, Рассмотренные альтернативы, Решение

### Community 161 - "buildFeedback"
Cohesion: 0.15
Nodes (14): 17.1 Структура и ключи, 17.2 Верность и общие принципы, 17.3 Что понято верно (`OkCode`; новые помечены *), 17.4 Ошибки (части 3–6), 17. Шаблоны разбора (источник `src/i18n/ru/feedback`), 2. Пирамида, block(), buildFeedback() (+6 more)

### Community 162 - "golden.ew.test.ts"
Cohesion: 0.11
Nodes (20): TaskReplay, Segment, Draft, EwCheckInput, contiguousRuns(), EwCatalogEntry, EwPick, anchors() (+12 more)

### Community 163 - "RelativeAxis.tsx"
Cohesion: 0.27
Nodes (9): AxisTick, axisTicks(), relativeDuration(), relativeLabel(), STEPS, T, AXIS_H, PRICE_SCALE_W (+1 more)

### Community 164 - "11. Коды и шаблоны разбора (источник `src/i18n/ru/feedback`)"
Cohesion: 0.40
Nodes (5): 11.1 Общие блоки, 11.2 Что понято верно (`OkCode`, новые), 11.3 Ошибки (части 3–6), 11.4 Словари текстовых параметров, 11. Коды и шаблоны разбора (источник `src/i18n/ru/feedback`)

### Community 165 - "2. Уровни, зоны и формулы"
Cohesion: 0.40
Nodes (5): 2.1 Retracement, 2.2 Extension (Trend-Based Fib Extension A–B–C), 2.3 Premium / Discount (решение), 2.4 Сигнатуры, 2. Уровни, зоны и формулы

### Community 166 - "3. `findImpulses` — импульс для задания и эталон сетки"
Cohesion: 0.40
Nodes (5): 3.1 Определение (решение), 3.2 Сигнатура, 3.3 Псевдокод, 3.5 Статистика (обоснование порогов), 3. `findImpulses` — импульс для задания и эталон сетки

### Community 167 - "fibonacci/reveal.ts"
Cohesion: 0.40
Nodes (8): block(), Params, plainVerdict(), revealErrors(), revealFeedback(), shiftTimeParams(), storableGrade(), isTimeParam()

### Community 168 - "fib.test.ts"
Cohesion: 0.24
Nodes (9): deps(), grade(), Json, loader, next(), NOW, post(), seeds() (+1 more)

### Community 169 - "ReactionForm.tsx"
Cohesion: 0.27
Nodes (8): Choice(), ChoiceProps, COLS, ReactionForm(), TargetPicker(), Dir, FibTypeKey, fx

### Community 170 - "2. Карточки"
Cohesion: 0.20
Nodes (10): 2. Карточки, Backend Developer, Chart Developer, DevOps/Security Engineer, Documentation Engineer, Market Data Engineer, Orchestrator, QA Engineer (+2 more)

### Community 171 - "smc/normalize.test.ts"
Cohesion: 0.33
Nodes (4): cs, index, synthetic_rows, T0

### Community 172 - "5. Определения метрик прогресса"
Cohesion: 0.40
Nodes (5): 5.1 Точность навыка, 5.2 Дневная цель, 5.3 Мягкая серия дней, 5.4 Статистика Challenge (FR-PROG-04), 5. Определения метрик прогресса

### Community 173 - "8. FVG (Fair Value Gap)"
Cohesion: 0.50
Nodes (4): 8.1 Определение, 8.2 Заполнение, 8.3 Сигнатура, 8. FVG (Fair Value Gap)

### Community 174 - "11. Оценка (рубрика 0–100)"
Cohesion: 0.50
Nodes (4): 11.2 Вердикт, 11.3 Пример (EW-1, easy, разметка 0 = 08-06 23:00 … 5 = 08-09 22:00, `abc-next`, invalidation 77.88, без альтернативы), 11.4 Исход не входит в счёт (решение), 11. Оценка (рубрика 0–100)

## Knowledge Gaps
- **14 isolated node(s):** `ADR-0008`, `ADR-0007`, `ADR-0005`, `ADR-0006`, `ADR-0005` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1193 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Mark` connect `Mark` to `LocalRepository`, `terminal.helpers.ts`, `elliott/placeholders.test.ts`, `react`, `UtcMs`, `TerminalScreen.tsx`, `12. `gradeMarks` — сравнение разметки`, `ui/index.ts`, `facts.ts`, `fib/types.ts`, `elliott/index.ts`, `layout.ts`, `1. Общие соглашения`, `golden.ew.test.ts`, `elliott.test.ts`, `session/types.ts`, `fib.test.ts`, `src/types.ts`, `smc/normalize.test.ts`, `tasks.ts`, `DrawingController`, `rules.ts`, `GradeError`, `smc/marks.ts`, `TaskTimeframe`, `grading/grade.ts`, `MarkSession.tsx`, `importLocal.ts`, `fib/index.ts`, `fib/ref.ts`, `challenge/types.ts`, `core/src/index.ts`, `fib/generate.ts`, `TaskSession.tsx`, `elliott/check.ts`, `ChallengeSession.tsx`, `fib/grade.test.ts`, `markText.ts`, `model.ts`, `features/feedback/index.ts`, `ref_vitest`, `placeholders.test.ts`, `fib.controller.test.ts`, `serialize.ts`, `fibonacci/adapters.ts`, `pa/index.ts`, `handlers.test.ts`, `DrawingPrimitive.ts`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Mark` (e.g. with `Контекст` and `Последствия`) actually correct?**
  _`Mark` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0008`, `ADR-0007`, `ADR-0005` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `market-structure.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09856035437430787 - nodes in this community are weakly interconnected._
- **Why does `Candle` connect `tasks.ts` to `market-structure.ts`, `elliott/placeholders.test.ts`, `impulses.ts`, `facts.ts`, `fib/types.ts`, `elliott/index.ts`, `elliott/check.ts`, `sessionStore.ts`, `seriesData.ts`, `elliott.test.ts`, `golden.ew.test.ts`, `golden.ew.test.ts`, `session/types.ts`, `fib.test.ts`, `src/types.ts`, `smc/normalize.test.ts`, `DrawingController`, `rules.ts`, `GradeError`, `TradingChart.tsx`, `fib/index.ts`, `smc/marks.ts`, `TaskTimeframe`, `UtcMs`, `MarkSession.tsx`, `live.ts`, `core/src/index.ts`, `fib/index.ts`, `fib/ref.ts`, `challenge/types.ts`, `useMarketData.ts`, `archive.ts`, `core/src/index.ts`, `fib/generate.ts`, `TaskSession.tsx`, `elliott/check.ts`, `golden.pa-challenge.test.ts`, `fib/grade.test.ts`, `6. Внешние API Binance`, `challenge/resolve.ts`, `patterns.ts`, `fib.controller.test.ts`, `pa/index.ts`, `CountdownBadge.tsx`, `criteria.ts`, `handlers.test.ts`, `Mark`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `UtcMs` (e.g. with `1. Общие соглашения` and `4.1 Шкала задания`) actually correct?**
  _`UtcMs` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `LocalRepository` be split into smaller, more focused modules?**
  _Cohesion score 0.06620209059233449 - nodes in this community are weakly interconnected._