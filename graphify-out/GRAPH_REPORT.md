# Graph Report - Varianto  (2026-11-05)

## Corpus Check
- 463 files · ~274,224 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 44 file(s) not represented in the graph (top: .csv 38, (none) 4, .example 1)

## Summary
- 3316 nodes · 9456 edges · 169 communities (158 shown, 11 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 336 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d5e18954`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- market-structure.ts
- Repository
- terminal.helpers.ts
- API Contracts — Trading Lab
- golden.fib.test.ts
- with
- Architecture — Trading Lab
- PaContextBody.tsx
- HomeBlocks.tsx
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
- layout.ts
- market-data-engineer.md
- qa-engineer.md
- technical-analyst.md
- uiux-designer.md
- DECISIONS/README.md
- ToolPalette.tsx
- TaskTimeframe
- render.ts
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
- 1. Общие соглашения
- rules.ts
- terms.tsx
- schemas.ts
- GradeError
- TradingChart.tsx
- fib/index.ts
- smc/marks.ts
- ref_vitest
- sources.ts
- handlers.ts
- grading/grade.ts
- MarkSession.tsx
- UtcMs
- core/src/index.ts
- README.md
- importLocal.ts
- Команда агентов — Trading Lab
- fib/index.ts
- history/route.ts
- ref.ts
- localDay
- progressData.ts
- Находки
- useMarketData.ts
- archive.ts
- screens.test.tsx
- ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`
- Roadmap — Trading Lab
- AUDIT — финальный дизайн-аудит Trading Lab (M8-UI)
- fib/generate.ts
- i18n/format.ts
- PRD — Trading Lab
- TaskSession.tsx
- T
- hit.ts
- panels.tsx
- 5. Тренд, BOS и CHoCH
- Candle
- LocalRepository
- package.json
- fib/grade.test.ts
- 6. Внешние API Binance
- 7. Order Block
- web/AGENTS.md
- reveal.ts
- fib/marks.ts
- src/feedback/index.ts
- grading/grade.test.ts
- SessionActions
- Стратегия тестирования — Trading Lab
- features/feedback/index.ts
- model.ts
- ref_vitest
- sessionStore.ts
- patterns.ts
- placeholders.test.ts
- smc/normalize.test.ts
- 2. Карточки
- fib/types.ts
- pa/index.ts
- Query
- ThemeProvider.tsx
- @playwright/test
- challenge.helpers.ts
- progressLogic.ts
- axis.ts
- criteria.ts
- src/feedback/format.ts
- handlers.test.ts
- DrawingPrimitive.ts
- challenge/api.ts
- ProgressScreen.tsx
- QA Report — финальная приёмка MVP Trading Lab (M8)
- render.ts
- 12. `gradeMarks` — сравнение разметки
- fixtures
- touches
- Mark
- storage/index.ts
- 4. Функциональные требования
- Подключение Supabase и Vercel (с телефона)
- scripts
- SettingsScreen.tsx
- 2. `detectSwings` — фрактальные swing
- vercel.json
- ELLIOTT — спецификация модуля Elliott Wave Lab (v1.2) для `@tl/core`
- terminal.fib.spec.ts
- 12. `gradeMarks` — сравнение разметки
- FakeWs
- ok
- ErrorCode
- terminal.countdown.spec.ts
- ADR-0003: Живые данные грузит браузер напрямую (REST + WS), fallback — REST-polling
- 9. Генерация заданий
- keepalive/route.ts
- 14. Коды и шаблоны разбора (источник `src/i18n/ru/feedback`)
- 15. Golden-участки
- DrawingPrimitive
- 12. Контракты API (расширение `API_CONTRACTS.md`)
- 2. Разметка: Mark-типы, якоря, снап
- 4. Нерушимые правила (обязательны)
- FIBONACCI — спецификация модуля Fibonacci Playground (v1.1) для `@tl/core`
- playwright.config.ts
- 6. Задание «Где реакция?» (`fib-reaction`)
- TaskReplay
- ADR-0002: Lightweight Charts v5 + собственный слой разметки на Series Primitives
- ADR-0004: История для заданий — сервер читает архив data.binance.vision
- 5. Потоки данных
- 17. Шаблоны разбора (источник `src/i18n/ru/feedback`)
- 6. Liquidity sweep
- 11. Коды и шаблоны разбора (источник `src/i18n/ru/feedback`)
- 2. Уровни, зоны и формулы
- 3. `findImpulses` — импульс для задания и эталон сетки
- 7. Задание «Цель по Extension» (`fib-extension`)
- 5. Результат проверки и разбор

## God Nodes (most connected - your core abstractions)
1. `Candle` - 122 edges
2. `Mark` - 102 edges
3. `UtcMs` - 94 edges
4. `react` - 76 edges
5. `TaskTimeframe` - 63 edges
6. `analyzeStructure()` - 51 edges
7. `cn()` - 46 edges
8. `Button()` - 40 edges
9. `Difficulty` - 39 edges
10. `TradingChart()` - 37 edges

## Surprising Connections (you probably didn't know these)
- `P2` --references--> `GradeLegend()`  [INFERRED]
  docs/design/AUDIT.md → apps/web/src/features/feedback/GradeLegend.tsx
- `14.3 Оценка качества 0–100 (ответ на OQ-08), независимо от исхода` --references--> `key()`  [INFERRED]
  docs/specs/ALGORITHMS.md → apps/web/src/features/guide/introStore.ts
- `P1` --references--> `fmtPrice()`  [INFERRED]
  docs/design/AUDIT.md → apps/web/src/features/progress/ErrorLog.tsx
- `5.2 Ответ и проверка` --references--> `ok()`  [INFERRED]
  docs/specs/FIBONACCI.md → apps/web/src/features/progress/progressLogic.test.ts
- `7.3 Ответ и проверка` --references--> `ok()`  [INFERRED]
  docs/specs/FIBONACCI.md → apps/web/src/features/progress/progressLogic.test.ts

## Import Cycles
- 2-file cycle: `packages/core/src/candles/aggregate.ts -> packages/core/src/index.ts -> packages/core/src/candles/aggregate.ts`

## Communities (169 total, 11 thin omitted)

### Community 0 - "market-structure.ts"
Cohesion: 0.10
Nodes (45): endCandidates(), pickContextTask(), pickFindPattern(), pickLevelTask(), usable(), mulberry32(), randInt(), atrAt() (+37 more)

### Community 1 - "Repository"
Cohesion: 0.08
Nodes (15): Repository, graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила, ADR-0008: Local-first хранилище за интерфейсом Repository; Supabase в M7 (+7 more)

### Community 2 - "terminal.helpers.ts"
Cohesion: 0.17
Nodes (21): Box, candlePoint(), chartCandles(), coreLevels(), coreMarks(), drawTwoPoint(), findVisibleBos(), findVisibleFvg() (+13 more)

### Community 3 - "API Contracts — Trading Lab"
Cohesion: 0.12
Nodes (16): 1.1 Формат ошибки, 1.2 Заголовки кэша, 1. Общие соглашения, 2.2 Расширения контрактов (предложение — фиксируются при реализации в `@tl/core`), 2. Типы `@tl/core`, используемые в контрактах, 3.1 `GET /api/health`, 3.2 `GET /api/history`, 3.3 `POST /api/tasks/{module}/next` (+8 more)

### Community 4 - "golden.fib.test.ts"
Cohesion: 0.13
Nodes (17): 12.1 Формат и процесс, 12.2 Участки, 12.3 Покрытие граничных случаев golden-участками, 12. Golden-участки, idx(), FILES, series(), STEP (+9 more)

### Community 5 - "with"
Cohesion: 0.08
Nodes (26): runs-on, steps, GITHUB_TOKEN, jobs, check, secrets-scan, name, on (+18 more)

### Community 6 - "Architecture — Trading Lab"
Cohesion: 0.14
Nodes (14): 10. Развёртывание, 11. Риски, 1. Ключевые ограничения, определяющие архитектуру, 2. Обзор, 3. Репозиторий (pnpm monorepo), 4.1 Синхронизация таймфреймов, 4.2 Разметка (общая модель для пользователя и алгоритма), 4.3 Алгоритмы (детерминированные, версионируемые) (+6 more)

### Community 7 - "PaContextBody.tsx"
Cohesion: 0.07
Nodes (49): Page(), Annotated(), MsMarkBody(), CONTEXT_FIELD_IDS, CONTEXT_HTF, ContextFieldId, viewForField(), PaContextBody() (+41 more)

### Community 8 - "HomeBlocks.tsx"
Cohesion: 0.21
Nodes (19): Page(), ContinueBlock(), HomeWeakSpots(), LearnScreen(), MODULES, ModuleAccuracy(), useSkillStats(), canTrain() (+11 more)

### Community 9 - "market-data/package.json"
Cohesion: 0.11
Nodes (20): dependencies, fflate@^0.8.3, @tl/core@workspace:*, devDependencies, vitest@^4.1.12, @vitest/coverage-v8@^4.1.12, exports, ./archive (+12 more)

### Community 10 - "UtcMs"
Cohesion: 0.20
Nodes (15): DailyActivityRow, SkillStatRow, TerminalMarksRow, TradingLabDB, defaultSettings(), LocalSnapshot, mark, Attempt (+7 more)

### Community 11 - "core/src/index.ts"
Cohesion: 0.07
Nodes (51): TerminalPage(), patternLabel(), anchor, KINDS, MARKS_FORMAT_VERSION, markSchema, parseMarks(), serializeMarks() (+43 more)

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
Nodes (37): NotFound(), SetupFieldProps, ru, Badge(), BadgeProps, BottomSheet(), BottomSheetProps, HEIGHT (+29 more)

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

### Community 23 - "layout.ts"
Cohesion: 0.11
Nodes (18): geos(), synthetic_proj, T0, buildGeometry(), formatPrice, GeometryOptions, GLYPH_OFFSET, GlyphKind (+10 more)

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
Cohesion: 0.10
Nodes (15): ADR-0001: Next.js 16 + TypeScript strict, pnpm monorepo, Vercel, Контекст, Последствия, Рассмотренные альтернативы, Решение, ADR-0007: Правила исхода сделки Challenge (drill-down), Контекст, Открытые вопросы (закрыты: `docs/specs/ALGORITHMS.md`) (+7 more)

### Community 29 - "ToolPalette.tsx"
Cohesion: 0.16
Nodes (18): base, GroupId, groupOf(), GROUPS, HOTKEY_OF, HOTKEYS, ic, MOBILE_GROUPS (+10 more)

### Community 30 - "TaskTimeframe"
Cohesion: 0.15
Nodes (23): AnswerInput, ChallengeAnswerBody, SessionState, ChallengeDetailDto, ChallengeGradeResult, ChallengeOutcomeDto, ChallengePayload, ChallengeTaskEnvelope (+15 more)

### Community 31 - "render.ts"
Cohesion: 0.19
Nodes (14): limitCandles(), OPEN_CANDLE_ALPHA, pricePrecision(), T0, tokens, toCandleData(), toVolumeData(), VOLUME_ALPHA (+6 more)

### Community 32 - "fetch-fixtures.mjs"
Cohesion: 0.08
Nodes (26): ChallengeAttemptStat, challengeStats(), dailyProgress(), DayMap, DayRecord, GOAL_DEFAULT, GOAL_MAX, GOAL_MIN (+18 more)

### Community 33 - "Trading Lab"
Cohesion: 0.33
Nodes (6): Trading Lab, Быстрый старт, Документация, Команды, Ограничения, Структура

### Community 34 - "token.ts"
Cohesion: 0.11
Nodes (25): ConfigError, b64(), derive(), getSigningSecret(), HeaderSchema, invalid(), keyCache, Keys (+17 more)

### Community 35 - "session/types.ts"
Cohesion: 0.09
Nodes (40): AppError(), Page(), Page(), Page(), csp, nextConfig, highlightMarks(), MsQuestionBody() (+32 more)

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
Nodes (46): 2.1 Из `ARCHITECTURE.md` §4 (дословно), 1.2 Переиспользуемые соглашения (без изменений), 1.2 Переиспользуемые соглашения (без изменений), 3.4 Граничные случаи (проверены на реальных свечах), golden/ - эталонные участки SMC (ALGORITHMS §18), PoiInfo, allSwingsMap, AnalyzeOptions (+38 more)

### Community 45 - "tasks.ts"
Cohesion: 0.10
Nodes (45): ApiError, validationError(), readJsonBody(), cutoffOf(), futureProviderFor(), buildChallenge(), buildFib(), buildMs() (+37 more)

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

### Community 52 - "1. Общие соглашения"
Cohesion: 0.17
Nodes (12): c(), 1.1 Входные свечи, 1.2 Термины свечи, 1.3 ATR, 1.4 Детерминизм и числа, 1.5 ALGO_VERSION, 1.6 Параметры по сложностям (сводка), 1. Общие соглашения (+4 more)

### Community 53 - "rules.ts"
Cohesion: 0.05
Nodes (68): constrainAnchors(), createMark(), DrawKind, FULL_WIDTH_KINDS, isDrawKind(), MarkExtra, RAY_RIGHT_KINDS, SWING_SIDE (+60 more)

### Community 54 - "terms.tsx"
Cohesion: 0.18
Nodes (17): dismissIntro(), isIntroDismissed(), key(), TaskIntro(), TaskIntroProps, Host(), byAlias, pattern (+9 more)

### Community 55 - "schemas.ts"
Cohesion: 0.08
Nodes (24): AnchorSchema, AnswerSchema, BUSINESS_CODES, ChallengeAnswer, ChallengeAnswerSchema, difficulty, FIB_OPTIONS, FIB_TARGETS (+16 more)

### Community 56 - "GradeError"
Cohesion: 0.20
Nodes (23): FeedbackViewProps, CheckPanelProps, CheckResult, Core, GradeResultApi, 5.2 `Feedback` (6 частей, FR-FB-02), ChallengeGrade, block() (+15 more)

### Community 57 - "TradingChart.tsx"
Cohesion: 0.12
Nodes (16): lwcProjection(), snapAnchor(), SnapOptions, snapPriceToCandle(), synthetic_candles, T0, T0, TimeIndex (+8 more)

### Community 58 - "fib/index.ts"
Cohesion: 0.14
Nodes (21): ConfluenceCtx, FIB_CONFLUENCE_KEYS, FIB_LEVEL_LOOKBACK, PriceBand, TARGET_ORDER, SnapInput, correctOptions(), FIB_DEEP_FROM (+13 more)

### Community 59 - "smc/marks.ts"
Cohesion: 0.13
Nodes (24): CheckOutcome, CheckState, CONCEPT_OF, conceptsFor(), RANGE_TAIL_CANDLES, runCheck(), algoMarks, candles (+16 more)

### Community 60 - "ref_vitest"
Cohesion: 0.13
Nodes (11): dynamic, GET(), fake-indexeddb@^6.2.7, @testing-library/user-event@^14.6.8, splitTerms(), terms(), Harness(), OPTIONS (+3 more)

### Community 61 - "sources.ts"
Cohesion: 0.11
Nodes (20): ARCHIVE_START, ArchiveLoader, CHALLENGE_FUTURE_MS, ChallengeZone, countClosedBefore(), DAY_MS, depthOf(), floorTo() (+12 more)

### Community 62 - "handlers.ts"
Cohesion: 0.07
Nodes (40): dynamic, maxDuration, POST(), runtime, dynamic, maxDuration, POST(), runtime (+32 more)

### Community 63 - "grading/grade.ts"
Cohesion: 0.18
Nodes (17): normalizeParams(), Entry, gradeMarks(), Group, groupEvaluated(), groupOf(), iou(), MAJOR (+9 more)

### Community 64 - "MarkSession.tsx"
Cohesion: 0.12
Nodes (34): GradeLegendToggle(), countsFromGrade(), AsideSection(), InputMessage(), RadioOption, SubmitButton(), AnswerSession(), patternHighlights() (+26 more)

### Community 65 - "UtcMs"
Cohesion: 0.09
Nodes (22): ArchiveLoaderOptions, Chunk, Draft, Frontend Developer, ChallengeSource, PointRef, ImpulsePoint, UtcMs (+14 more)

### Community 66 - "core/src/index.ts"
Cohesion: 0.10
Nodes (28): load(), klinesZip(), NOW, Served, zipOf(), LiveStatus, archiveH1, archiveM1 (+20 more)

### Community 67 - "README.md"
Cohesion: 0.18
Nodes (3): Known Issues — Trading Lab, Не проверено вообще (среда), Открыто

### Community 68 - "importLocal.ts"
Cohesion: 0.15
Nodes (23): chunks(), IMPORTED_USER_META, ImportOutcome, importSnapshot(), must(), recomputeDerived(), Row, runFirstSignInImport() (+15 more)

### Community 69 - "Команда агентов — Trading Lab"
Cohesion: 0.25
Nodes (7): 1. Сводка, 3. Правила оркестрации, 4. Формат отчёта агента (до 15 строк), 5. Шаблон задания агенту, 6. Уроки оркестрации, Команда агентов — Trading Lab, Правило graphify (включается в каждый промпт агента, исследующего код)

### Community 70 - "fib/index.ts"
Cohesion: 0.14
Nodes (29): 13. Тест-план для реализации (TDD, `packages/core/src/fib/`), checkFibMarks(), dirOf(), emptyDetail(), FIB_TERMINAL_MAX_DISTANCE, FIB_TERMINAL_NEXT, FibMarkCheck, nearest() (+21 more)

### Community 71 - "history/route.ts"
Cohesion: 0.08
Nodes (23): ARCHIVE_START_MS, dynamic, errorResponse(), GET(), ISSUE_CODES, querySchema, runtime, SYMBOLS (+15 more)

### Community 72 - "ref.ts"
Cohesion: 0.17
Nodes (19): bandOf(), FibConfluence, overlaps(), ExtensionOutcome, resolveExtension(), Case, CASES, ReactionClass (+11 more)

### Community 73 - "localDay"
Cohesion: 0.12
Nodes (19): buildAttempt(), localDay(), ImportReport, 1. Принципы, 2. Локальная схема: IndexedDB (Dexie), 3.1 RLS, 3. Схема Supabase Postgres (M7), 4.1 Порядок (+11 more)

### Community 74 - "progressData.ts"
Cohesion: 0.22
Nodes (9): DayStat, prevDay(), softStreak(), done, AsyncState, DailyProgress, useDailyProgress(), useWeakSkills() (+1 more)

### Community 75 - "Находки"
Cohesion: 0.25
Nodes (8): 2. MEDIUM: обход rate limit через X-Forwarded-For (исправлено частично), 4. LOW: /api/cron/keepalive (открыто), 5. LOW: Supabase (повторное чтение 0001_init.sql), 6. LOW: заголовки/CSP (фактически curl на production-сборке), 7. LOW: токены (src/server/token.ts) - корректно, 8. Утечка даты Challenge, 9. Ввод, лимиты, XSS, хранилища, Находки

### Community 76 - "useMarketData.ts"
Cohesion: 0.09
Nodes (26): CandleCountdown, ClockOffsetEstimator, formatCountdown(), pad2(), remainingMs(), CountdownBadge(), CountdownBadgeProps, View (+18 more)

### Community 77 - "archive.ts"
Cohesion: 0.15
Nodes (13): AGG_TRADES_HEADER, AggTrade, ARCHIVE_BASE_URL, ArchiveFetch, ArchiveFileSpec, ArchiveSource, ArchiveSourceOptions, archiveUrl() (+5 more)

### Community 78 - "screens.test.tsx"
Cohesion: 0.45
Nodes (8): AppShell(), BottomTabs(), DesktopTabs(), ICONS, activeNav(), isChartRoute(), NAV_ITEMS, NavId

### Community 79 - "ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`"
Cohesion: 0.08
Nodes (24): 14.1 Факты на момент T (`ChallengeFacts`), 14.2 Эталонная сторона `refSide`, 14.3 Оценка качества 0–100 (ответ на OQ-08), независимо от исхода, 14.4 Правильность, вердикт, лимиты, 14.5 Предикаты причин (`ReasonCode`, состав без изменений), 14.6 Подсказки (easy), 14. Challenge: эталон, оценка качества, WAIT, лимиты, 15. `resolveTrade` (ADR-0007, уточнения) (+16 more)

### Community 80 - "Roadmap — Trading Lab"
Cohesion: 0.29
Nodes (6): MVP, Roadmap — Trading Lab, v1.1 — Fibonacci Playground и Premium/Discount, v1.2 — Elliott Wave Lab, v2, Правила корректировки

### Community 81 - "AUDIT — финальный дизайн-аудит Trading Lab (M8-UI)"
Cohesion: 0.20
Nodes (9): 1. Итог, 2. Находки, 3. Impeccable detect (по URL production-сборки), 4. Что проверено и ограничения, 5. Порядок исправления, AUDIT — финальный дизайн-аудит Trading Lab (M8-UI), P1, P2 (+1 more)

### Community 82 - "fib/generate.ts"
Cohesion: 0.10
Nodes (28): Ctx, desiredClass(), EXT_TARGETS, extremesOk(), FIB_IMPULSE_RULES, FIB_NEXT, fibExtensionTask(), fibGridTask() (+20 more)

### Community 83 - "i18n/format.ts"
Cohesion: 0.23
Nodes (16): FORMATTERS(), ErrorLog(), errorName(), fmtPrice(), Review(), textOf(), buildErrorLog(), formatDayShort() (+8 more)

### Community 84 - "PRD — Trading Lab"
Cohesion: 0.07
Nodes (28): 10. Приоритизация функций (MoSCoW), 11. План MVP, 1.1 Что это, 1.2 Цель, 1.3 Целевой пользователь, 1.4 Модули, 1. Обзор и цель продукта, 2. Принципы продукта (+20 more)

### Community 85 - "TaskSession.tsx"
Cohesion: 0.12
Nodes (36): AnswerSessionProps, createTaskApi(), kindOf(), post(), TaskApi, buildAttempt(), BuildAttemptInput, saveTaskAttempt() (+28 more)

### Community 86 - "T"
Cohesion: 0.10
Nodes (25): ADR-0005: Stateless-задания с подписанными токенами; будущее только на сервере, Контекст, Открытые вопросы, Последствия, Рассмотренные альтернативы, Решение, ADR-0006: Синхронизация таймфреймов — нативные ТФ, инвариант агрегации, sliceAt, Контекст (+17 more)

### Community 87 - "hit.ts"
Cohesion: 0.15
Nodes (12): distToRectEdge(), distToSegment(), Hit, hitLevel(), hitTest(), inside(), partScore(), Tolerance (+4 more)

### Community 88 - "panels.tsx"
Cohesion: 0.19
Nodes (18): blockerKey(), DecisionPanel(), ErrorBlock(), errorCopy(), PriceField(), ReasonsSheet(), buildAnswer(), formatRR() (+10 more)

### Community 89 - "5. Тренд, BOS и CHoCH"
Cohesion: 0.33
Nodes (6): 5.1 Общие правила, 5.2 Внешний слой — машина состояний с защищёнными уровнями, 5.3 Внутренний слой — «последний подтверждённый swing», 5.4 Что происходит после CHoCH, 5.5 Граничные случаи (проверены на реальных свечах), 5. Тренд, BOS и CHoCH

### Community 90 - "Candle"
Cohesion: 0.06
Nodes (37): Решение, FactsInput, AggTrade, done(), FutureProvider, Hit, Position, priceHits() (+29 more)

### Community 91 - "LocalRepository"
Cohesion: 0.12
Nodes (7): LocalRepository, graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 92 - "package.json"
Cohesion: 0.12
Nodes (21): devDependencies, eslint@^9.39.0, eslint-config-next@^16.0.0, @eslint/js@^9.39.0, @playwright/test@1.63.0, prettier@^3.6.0, @types/node@^22.0.0, typescript@~5.9.3 (+13 more)

### Community 93 - "fib/grade.test.ts"
Cohesion: 0.09
Nodes (32): 4.1 Шкала задания, C, pt(), series(), upTo(), FG1, FG3, FG4 (+24 more)

### Community 94 - "6. Внешние API Binance"
Cohesion: 0.40
Nodes (5): status(), 6.1 REST: `GET https://fapi.binance.com/fapi/v1/klines` (браузер), 6.2 WebSocket: kline stream (браузер), 6.3 Архив data.binance.vision (сервер), 6. Внешние API Binance

### Community 95 - "7. Order Block"
Cohesion: 0.50
Nodes (4): 7.1 Определение (решение, ICT: «последняя противоположная свеча перед импульсом, сломавшим структуру»), 7.2 Статус (после свечи события `k`, по закрытым свечам), 7.3 Сигнатура, 7. Order Block

### Community 97 - "reveal.ts"
Cohesion: 0.17
Nodes (14): partMax(), ResultView(), DIR_RU, formatScenarioDate(), localizeParam(), POI_RU, resolutionNote(), revealFeedback() (+6 more)

### Community 98 - "fib/marks.ts"
Cohesion: 0.27
Nodes (14): fibReactionTask(), FIB_EXTENSION_INFO, FIB_EXTENSION_TARGETS, FIB_OTE, FIB_RETRACEMENT_LEVELS, fibDepth(), fibExtensionPrice(), fibLevelPrice() (+6 more)

### Community 99 - "src/feedback/index.ts"
Cohesion: 0.12
Nodes (29): okFromOutcomes(), PARAM_KINDS, CHALLENGE_VERDICT_TEMPLATES_RU, ERROR_SKILLS, ERROR_TEMPLATES_RU, ErrorTemplate, FIB_CONF_TEXT_RU, FIB_DEEP_END_TEXT_RU (+21 more)

### Community 100 - "grading/grade.test.ts"
Cohesion: 0.09
Nodes (22): algoOf(), ALL, at(), candles, findAlgo(), P, r, window (+14 more)

### Community 102 - "Стратегия тестирования — Trading Lab"
Cohesion: 0.12
Nodes (17): 10. Производительность, 1. Принципы, 3. Фикстуры, 4.1 Инвариант агрегации таймфреймов, 4.2 `sliceAt(series, T)`, 4.3 Нормализация (`market-data`), 4.4 Golden-тесты SMC/PA, 4.5 `resolveTrade` (+9 more)

### Community 103 - "features/feedback/index.ts"
Cohesion: 0.16
Nodes (16): errors, feedback, defaultFmt, FeedbackView(), Section(), DIR, formatParam(), formatWhen() (+8 more)

### Community 104 - "model.ts"
Cohesion: 0.20
Nodes (21): extensionLevels(), FIB_EXTENSION_INFO, FIB_EXTENSION_TARGETS, FIB_KINDS, FIB_OTE, FIB_RETRACEMENT_LEVELS, fibDepth(), FibDirection (+13 more)

### Community 105 - "ref_vitest"
Cohesion: 0.21
Nodes (8): contractAttempt(), contractMark, runRepositoryContract(), FakeSupabase, Row, UNIQUE, seedLocal(), @supabase/supabase-js

### Community 106 - "sessionStore.ts"
Cohesion: 0.19
Nodes (13): defaultLevels(), roundToTick(), atrOf(), createSessionStore(), INITIAL, Phase, SessionStore, Speed (+5 more)

### Community 107 - "patterns.ts"
Cohesion: 0.23
Nodes (17): 9.1 Состав (ответ на OQ-11), 9.3 Выход, 9.4 Проверенные примеры (BTCUSDT 4h 2026-09, GS-5), 9. Свечные модели Price Action (`detectPatterns`), body(), bodyBottom(), bodyTop(), detectPatterns() (+9 more)

### Community 108 - "placeholders.test.ts"
Cohesion: 0.10
Nodes (21): attempt(), 5. Дефекты, buildFeedback(), matchedOf(), algo, ALL, assertFilled(), bad (+13 more)

### Community 109 - "smc/normalize.test.ts"
Cohesion: 0.33
Nodes (4): cs, index, synthetic_rows, T0

### Community 110 - "2. Карточки"
Cohesion: 0.14
Nodes (16): 2. Карточки, Backend Developer, Chart Developer, DevOps/Security Engineer, Documentation Engineer, Market Data Engineer, Orchestrator, QA Engineer (+8 more)

### Community 111 - "fib/types.ts"
Cohesion: 0.17
Nodes (14): ExtensionInput, FibDirection, ReactionInput, ReactionOutcome, Case, CASES, LIMIT, FibExtensionAnswer (+6 more)

### Community 112 - "pa/index.ts"
Cohesion: 0.09
Nodes (48): buildPa(), reconstructContext(), 18.2 Участки, 6.5 Конфлюэнс (через SMC-движок, только данные до T), computeContext(), CONTEXT_STRUCTURE, ContextAnswer, ContextEvidence (+40 more)

### Community 114 - "ThemeProvider.tsx"
Cohesion: 0.12
Nodes (23): metadata, plexMono, plexSans, RootLayout(), viewport, Page(), wrap(), SettingsScreen() (+15 more)

### Community 115 - "@playwright/test"
Cohesion: 0.27
Nodes (11): PA(), checkAndSeeResult(), nextThenHomeShowsDone(), openSession(), shot(), tapCandle(), solveOne(), chartBox() (+3 more)

### Community 116 - "challenge.helpers.ts"
Cohesion: 0.19
Nodes (11): DATE_LEAK, expandResult(), lastCandleTime(), num(), openReasons(), projectPoint(), SESSION_URL(), startSession() (+3 more)

### Community 117 - "progressLogic.ts"
Cohesion: 0.10
Nodes (33): asCore(), ErrorExample, ErrorGroup, groupByModule(), hasEnoughData(), MODULE_ORDER, ModuleAccuracy, ModuleGroup (+25 more)

### Community 118 - "axis.ts"
Cohesion: 0.27
Nodes (9): AxisTick, axisTicks(), relativeDuration(), relativeLabel(), STEPS, T, AXIS_H, PRICE_SCALE_W (+1 more)

### Community 119 - "criteria.ts"
Cohesion: 0.23
Nodes (18): body(), bottom(), dojiItems(), engulfItems(), finish(), insideItems(), Item, PatternCheck (+10 more)

### Community 120 - "src/feedback/format.ts"
Cohesion: 0.21
Nodes (12): decimalsOf(), DIRECTION_RU, displayValue(), formatFeedbackParams(), ParamFormatters, ParamKind, ParamValue, round2() (+4 more)

### Community 121 - "handlers.test.ts"
Cohesion: 0.11
Nodes (21): FIX, FixtureLoader, CH, challengeDeps(), grade(), Json, loader, mkDeps() (+13 more)

### Community 122 - "DrawingPrimitive.ts"
Cohesion: 0.30
Nodes (9): OpenCandleInfo, PrimitiveState, ZONE_KINDS, dimSpans(), HighlightColumn, highlightColumns(), HighlightRange, labelTop() (+1 more)

### Community 123 - "challenge/api.ts"
Cohesion: 0.18
Nodes (11): ChallengeSessionPage(), ChallengeApiError, ChallengeErrorKind, fetchNext(), gradeChallenge(), kindOf(), post(), ChallengeSession() (+3 more)

### Community 124 - "ProgressScreen.tsx"
Cohesion: 0.12
Nodes (33): ChallengePage(), Page(), ChallengeHome(), DIFFS, recentLine(), StartTf, Stats(), TF_OPTIONS (+25 more)

### Community 125 - "QA Report — финальная приёмка MVP Trading Lab (M8)"
Cohesion: 0.25
Nodes (7): 1. Сводка, 2. Таблица AC, 3. Ключевые инварианты, 4. Производительность (headless Chromium, software rendering, CPU throttling 4x), 6. Бэклог оркестратора, 7. Не удалось проверить, QA Report — финальная приёмка MVP Trading Lab (M8)

### Community 126 - "render.ts"
Cohesion: 0.21
Nodes (11): CHAR_W, Dash, MarkGeometry, PILL_H, STATE_GLYPH_W, DASH, drawGeometry(), drawPart() (+3 more)

### Community 127 - "12. `gradeMarks` — сравнение разметки"
Cohesion: 0.24
Nodes (8): external(), selectHints(), time(), 3.1 Правило (решение), 3.2 Дедупликация, 3.3 Сигнатура `analyzeStructure`, 3.4 Отображение в `Mark` (общая модель `ARCHITECTURE.md` §4.2), 3. Внешняя и внутренняя структура

### Community 128 - "fixtures"
Cohesion: 0.50
Nodes (3): fixtures, recorded/ - записанные форматы API (fapi/fstream недоступны из облака, 451), Архивные CSV

### Community 129 - "touches"
Cohesion: 0.67
Nodes (4): 10.1 Алгоритм, 10.2 Эталон для «Проведи уровень», 10. `findLevels` — уровни поддержки/сопротивления, touches()

### Community 130 - "Mark"
Cohesion: 0.09
Nodes (36): CandleHighlight, PointerKind, ToolId, ControllerDeps, ControllerNotice, PointerInput, decimalsForTick(), makePriceFormatter() (+28 more)

### Community 131 - "storage/index.ts"
Cohesion: 0.13
Nodes (27): dynamic, GET(), dynamic, Page(), AuthContext, AuthRepositoryProvider(), AuthState, DISABLED (+19 more)

### Community 132 - "4. Функциональные требования"
Cohesion: 0.17
Nodes (12): 4.10 Авторизация (FR-AUTH), 4.11 Интерфейс (FR-UI), 4.1 Данные (FR-DATA), 4.2 График (FR-CHART), 4.3 Слой разметки (FR-DRAW), 4.4 Market Structure Analyzer (FR-MS), 4.5 Trading Challenge (FR-TC), 4.6 Price Action Trainer (FR-PA) (+4 more)

### Community 133 - "Подключение Supabase и Vercel (с телефона)"
Cohesion: 0.20
Nodes (10): 1. Проект Supabase, 2. Применить миграцию (создать таблицы), 3. Ключи Supabase, 4. Вход через Google, 5. Redirect URL в Supabase, 6. Vercel, 7. Проверка на телефоне, Если что-то не работает (+2 more)

### Community 134 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, check:tokens, dev, format, lint, sync:tokens, test (+2 more)

### Community 135 - "SettingsScreen.tsx"
Cohesion: 0.25
Nodes (7): CANDLE_OPTIONS, DAILY_GOAL_MAX, DAILY_GOAL_MIN, THEME_OPTIONS, Trigger(), USED, useToast()

### Community 136 - "2. `detectSwings` — фрактальные swing"
Cohesion: 0.33
Nodes (6): 2.1 Сигнатура, 2.2 Определение, 2.3 Граничные случаи, 2.4 Кандидаты у правого края (`pendingSwings`), 2.5 Псевдокод, 2. `detectSwings` — фрактальные swing

### Community 139 - "ELLIOTT — спецификация модуля Elliott Wave Lab (v1.2) для `@tl/core`"
Cohesion: 0.14
Nodes (13): 13. Навыки и прогресс, 18. Спорные места и вопросы оркестратору, 19. Решения оркестратора (2026-11-05), 1.1 Что входит, 1.3 Направление, роли точек, обозначения, 1. Область и общие соглашения, 3. Проверка точек (до правил), 5. Рекомендации (баллы, не обязательны) (+5 more)

### Community 140 - "terminal.fib.spec.ts"
Cohesion: 0.32
Nodes (6): Fib, findFib(), openFibTool(), pivot(), Pt, RealCandle

### Community 141 - "12. `gradeMarks` — сравнение разметки"
Cohesion: 0.22
Nodes (9): 12.1 Сигнатура (расширение `API_CONTRACTS.md`), 12.2 Ключевая свеча метки, 12.3 Группы сопоставления, 12.4 Совместимость и стоимость пары, 12.5 Матчинг (решение: DP по времени вместо венгерского), 12.6 Классификация после матчинга, 12.7 Счёт, вердикт, навыки, 12.8 Пример AC-07 на реальных данных (GS-1) (+1 more)

### Community 143 - "ok"
Cohesion: 0.20
Nodes (11): ok(), 11.1 Части, 11.2 Вердикт, 11.3 Пример (EW-1, easy, разметка 0 = 08-06 23:00 … 5 = 08-09 22:00, `abc-next`, invalidation 77.88, без альтернативы), 11.4 Исход не входит в счёт (решение), 11. Оценка (рубрика 0–100), 16. Тест-план для реализации (TDD, `packages/core/src/elliott/`), 6.1 Закрытый список (`EwScenarioId`, новое) (+3 more)

### Community 144 - "ErrorCode"
Cohesion: 0.43
Nodes (7): TaskPayload, NextRequest, 19. Расхождения с документами, 17. Расхождения с документами, 14. Расхождения с документами, ErrorCode, MarkKind

### Community 145 - "terminal.countdown.spec.ts"
Cohesion: 0.29
Nodes (3): CORS, OPEN, REST_1H

### Community 146 - "ADR-0003: Живые данные грузит браузер напрямую (REST + WS), fallback — REST-polling"
Cohesion: 0.33
Nodes (5): ADR-0003: Живые данные грузит браузер напрямую (REST + WS), fallback — REST-polling, Контекст, Последствия, Рассмотренные альтернативы, Решение

### Community 147 - "9. Генерация заданий"
Cohesion: 0.33
Nodes (6): 9.1 Общие правила (решение), 9.2 easy — `ew-impulse`, 9.3 medium — `ew-impulse-correction`, 9.4 hard — `ew-scenario`, 9.5 Payload и токен, 9. Генерация заданий

### Community 148 - "keepalive/route.ts"
Cohesion: 0.38
Nodes (3): dynamic, GET(), safeEqual()

### Community 149 - "14. Коды и шаблоны разбора (источник `src/i18n/ru/feedback`)"
Cohesion: 0.40
Nodes (5): 14.1 Общие блоки, 14.2 Что понято верно (`OkCode`, новые), 14.3 Ошибки (части 3–6), 14.4 Словари текстовых параметров, 14. Коды и шаблоны разбора (источник `src/i18n/ru/feedback`)

### Community 150 - "15. Golden-участки"
Cohesion: 0.40
Nodes (5): 15.1 Формат и процесс, 15.2 Участки, 15.3 Покрытие, 15. Golden-участки, r2()

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
Nodes (9): 10. Навыки и прогресс, 15. Спорные места и вопросы оркестратору, 4. Параметры по сложностям (сводка), 5.1 Генерация, 5.2 Ответ и проверка, 5.3 Пример (FG-1, BTCUSDT 4h, BOS bull 2026-09-21 08:00), 5. Задание «Построй сетку» (`fib-grid`), 8. Свободный терминал (предложение) (+1 more)

### Community 156 - "playwright.config.ts"
Cohesion: 0.50
Nodes (3): INTRO_DISMISSED, INTRO_KEYS, PORT

### Community 157 - "6. Задание «Где реакция?» (`fib-reaction`)"
Cohesion: 0.29
Nodes (7): 6.1 Момент задания и варианты, 6.2 Генерация с балансировкой ответа (решение), 6.3 Определение реакции (решение) — `resolveReaction`, 6.4 Вопрос Premium/Discount, 6.6 Оценка, 6.7 Проигрывание, 6. Задание «Где реакция?» (`fib-reaction`)

### Community 158 - "TaskReplay"
Cohesion: 0.33
Nodes (6): TaskReplay, 10. Проигрывание — `resolveScenario`, 9.1 Типы, 9.2 `POST /api/tasks/fibonacci/next`, 9.3 `POST /api/tasks/fibonacci/grade`, 9. Контракты API (расширение `API_CONTRACTS.md`)

### Community 159 - "ADR-0002: Lightweight Charts v5 + собственный слой разметки на Series Primitives"
Cohesion: 0.33
Nodes (5): ADR-0002: Lightweight Charts v5 + собственный слой разметки на Series Primitives, Контекст, Последствия, Рассмотренные альтернативы, Решение

### Community 160 - "ADR-0004: История для заданий — сервер читает архив data.binance.vision"
Cohesion: 0.33
Nodes (5): ADR-0004: История для заданий — сервер читает архив data.binance.vision, Контекст, Последствия, Рассмотренные альтернативы, Решение

### Community 161 - "5. Потоки данных"
Cohesion: 0.40
Nodes (5): 5.1 Живые данные (терминал), 5.2 История для заданий (сервер), 5.3 Задания (stateless, без БД до M7), 5.4 Хранение (Repository), 5. Потоки данных

### Community 162 - "17. Шаблоны разбора (источник `src/i18n/ru/feedback`)"
Cohesion: 0.40
Nodes (5): 17.1 Структура и ключи, 17.2 Верность и общие принципы, 17.3 Что понято верно (`OkCode`; новые помечены *), 17.4 Ошибки (части 3–6), 17. Шаблоны разбора (источник `src/i18n/ru/feedback`)

### Community 163 - "6. Liquidity sweep"
Cohesion: 0.40
Nodes (5): 6.1 Определение (решение), 6.2 Несколько уровней за одну свечу, 6.3 Граничные случаи, 6.4 Сигнатура, 6. Liquidity sweep

### Community 164 - "11. Коды и шаблоны разбора (источник `src/i18n/ru/feedback`)"
Cohesion: 0.40
Nodes (5): 11.1 Общие блоки, 11.2 Что понято верно (`OkCode`, новые), 11.3 Ошибки (части 3–6), 11.4 Словари текстовых параметров, 11. Коды и шаблоны разбора (источник `src/i18n/ru/feedback`)

### Community 165 - "2. Уровни, зоны и формулы"
Cohesion: 0.40
Nodes (5): 2.1 Retracement, 2.2 Extension (Trend-Based Fib Extension A–B–C), 2.3 Premium / Discount (решение), 2.4 Сигнатуры, 2. Уровни, зоны и формулы

### Community 166 - "3. `findImpulses` — импульс для задания и эталон сетки"
Cohesion: 0.40
Nodes (5): 3.1 Определение (решение), 3.2 Сигнатура, 3.3 Псевдокод, 3.5 Статистика (обоснование порогов), 3. `findImpulses` — импульс для задания и эталон сетки

### Community 167 - "7. Задание «Цель по Extension» (`fib-extension`)"
Cohesion: 0.50
Nodes (4): 7.1 Момент задания и точка C, 7.2 Исход — `resolveExtension` (решение), 7.3 Ответ и проверка, 7. Задание «Цель по Extension» (`fib-extension`)

### Community 168 - "5. Результат проверки и разбор"
Cohesion: 0.67
Nodes (3): 5.1 `GradeResult`, 5.3 Коды ошибок, 5. Результат проверки и разбор

## Knowledge Gaps
- **13 isolated node(s):** `ADR-0008`, `ADR-0007`, `ADR-0006`, `ADR-0005`, `ADR-0005` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1110 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Mark` connect `Mark` to `Repository`, `terminal.helpers.ts`, `PaContextBody.tsx`, `UtcMs`, `core/src/index.ts`, `facts.ts`, `layout.ts`, `TaskTimeframe`, `ADR-0002: Lightweight Charts v5 + собственный слой разметки на Series Primitives`, `session/types.ts`, `src/types.ts`, `tasks.ts`, `1. Общие соглашения`, `rules.ts`, `GradeError`, `fib/index.ts`, `smc/marks.ts`, `handlers.ts`, `grading/grade.ts`, `MarkSession.tsx`, `importLocal.ts`, `fib/index.ts`, `ref.ts`, `fib/generate.ts`, `TaskSession.tsx`, `hit.ts`, `LocalRepository`, `fib/grade.test.ts`, `fib/marks.ts`, `grading/grade.test.ts`, `ref_vitest`, `placeholders.test.ts`, `smc/normalize.test.ts`, `fib/types.ts`, `pa/index.ts`, `handlers.test.ts`, `DrawingPrimitive.ts`, `render.ts`, `12. `gradeMarks` — сравнение разметки`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Mark` (e.g. with `Контекст` and `Последствия`) actually correct?**
  _`Mark` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0008`, `ADR-0007`, `ADR-0006` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `market-structure.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0963265306122449 - nodes in this community are weakly interconnected._
- **Why does `Candle` connect `Candle` to `market-structure.ts`, `Mark`, `golden.fib.test.ts`, `facts.ts`, `TaskReplay`, `TaskTimeframe`, `render.ts`, `src/types.ts`, `tasks.ts`, `rules.ts`, `GradeError`, `TradingChart.tsx`, `fib/index.ts`, `smc/marks.ts`, `sources.ts`, `handlers.ts`, `MarkSession.tsx`, `UtcMs`, `core/src/index.ts`, `fib/index.ts`, `ref.ts`, `useMarketData.ts`, `archive.ts`, `fib/generate.ts`, `TaskSession.tsx`, `fib/grade.test.ts`, `6. Внешние API Binance`, `grading/grade.test.ts`, `sessionStore.ts`, `patterns.ts`, `smc/normalize.test.ts`, `2. Карточки`, `fib/types.ts`, `pa/index.ts`, `criteria.ts`, `handlers.test.ts`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `UtcMs` (e.g. with `1. Общие соглашения` and `4.1 Шкала задания`) actually correct?**
  _`UtcMs` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Repository` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._