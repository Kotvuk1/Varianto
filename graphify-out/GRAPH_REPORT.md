# Graph Report - Varianto  (2026-11-05)

## Corpus Check
- 454 files · ~269,315 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 44 file(s) not represented in the graph (top: .csv 38, (none) 4, .example 1)

## Summary
- 3292 nodes · 9338 edges · 159 communities (149 shown, 10 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 332 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ef57ebc4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- market-structure.ts
- Repository
- terminal.helpers.ts
- API Contracts — Trading Lab
- FIBONACCI — спецификация модуля Fibonacci Playground (v1.1) для `@tl/core`
- with
- Architecture — Trading Lab
- PaFindBody.tsx
- toolGroups.tsx
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
- PaContextBody.tsx
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
- TradingChart
- smc/marks.ts
- serialize.ts
- sources.ts
- deps.ts
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
- SettingsScreen.tsx
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
- 14. Challenge: эталон, оценка качества, WAIT, лимиты
- sessionStore.ts
- 5. Тренд, BOS и CHoCH
- golden.pa-challenge.test.ts
- pa/generate.ts
- package.json
- fib/grade.test.ts
- 6. Внешние API Binance
- 7. Order Block
- web/AGENTS.md
- reveal.ts
- fib/types.ts
- src/feedback/index.ts
- grading/grade.test.ts
- SessionActions
- Стратегия тестирования — Trading Lab
- features/feedback/index.ts
- model.ts
- ref_vitest
- markText.ts
- patterns.ts
- placeholders.test.ts
- core/src/index.ts
- 2. Карточки
- Candle
- pa/index.ts
- Query
- ThemeProvider.tsx
- @playwright/test
- challenge.helpers.ts
- progressLogic.ts
- ChallengeSession.tsx
- criteria.ts
- runCheck.ts
- handlers.test.ts
- MsQuestionBody.tsx
- challenge/api.ts
- ProgressScreen.tsx
- QA Report — финальная приёмка MVP Trading Lab (M8)
- data/streak.test.ts
- 12. `gradeMarks` — сравнение разметки
- fixtures
- resolve.ts
- Mark
- storage/index.ts
- 4. Функциональные требования
- Подключение Supabase и Vercel (с телефона)
- scripts
- build.ts
- 2. `detectSwings` — фрактальные swing
- vercel.json
- ELLIOTT — спецификация модуля Elliott Wave Lab (v1.2) для `@tl/core`
- 7. User Flows
- 12. `gradeMarks` — сравнение разметки
- FakeWs
- ok
- ErrorCode
- terminal.countdown.spec.ts
- ADR-0003: Живые данные грузит браузер напрямую (REST + WS), fallback — REST-polling
- 9. Генерация заданий
- 1. Обзор и цель продукта
- 14. Коды и шаблоны разбора (источник `src/i18n/ru/feedback`)
- 15. Golden-участки
- 11. Оценка (рубрика 0–100)
- 12. Контракты API (расширение `API_CONTRACTS.md`)
- 2. Разметка: Mark-типы, якоря, снап
- 4. Нерушимые правила (обязательны)
- 5. Задание «Построй сетку» (`fib-grid`)
- playwright.config.ts
- 1. Область и общие соглашения
- 7. Детекторы

## God Nodes (most connected - your core abstractions)
1. `Candle` - 120 edges
2. `Mark` - 101 edges
3. `UtcMs` - 94 edges
4. `react` - 76 edges
5. `TaskTimeframe` - 62 edges
6. `analyzeStructure()` - 51 edges
7. `cn()` - 46 edges
8. `Button()` - 40 edges
9. `Difficulty` - 39 edges
10. `TradingChart()` - 37 edges

## Surprising Connections (you probably didn't know these)
- `1. HIGH: open redirect в /auth/callback (исправлено)` --references--> `safeNextPath()`  [INFERRED]
  docs/SECURITY_REVIEW.md → apps/web/src/auth/config.ts
- `P2` --references--> `GradeLegend()`  [INFERRED]
  docs/design/AUDIT.md → apps/web/src/features/feedback/GradeLegend.tsx
- `14.3 Оценка качества 0–100 (ответ на OQ-08), независимо от исхода` --references--> `key()`  [INFERRED]
  docs/specs/ALGORITHMS.md → apps/web/src/features/guide/introStore.ts
- `5.2 Ответ и проверка` --references--> `ok()`  [INFERRED]
  docs/specs/FIBONACCI.md → apps/web/src/features/progress/progressLogic.test.ts
- `7.3 Ответ и проверка` --references--> `ok()`  [INFERRED]
  docs/specs/FIBONACCI.md → apps/web/src/features/progress/progressLogic.test.ts

## Import Cycles
- 2-file cycle: `packages/core/src/candles/aggregate.ts -> packages/core/src/index.ts -> packages/core/src/candles/aggregate.ts`

## Communities (159 total, 10 thin omitted)

### Community 0 - "market-structure.ts"
Cohesion: 0.10
Nodes (37): atrAt(), buildMsQuestion(), Candidate, checkMsWindow(), CORE_CONCEPTS, generateMsQuestion(), gradeMsQuestion(), isBodyBreak() (+29 more)

### Community 1 - "Repository"
Cohesion: 0.07
Nodes (19): Repository, graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила, graphify (+11 more)

### Community 2 - "terminal.helpers.ts"
Cohesion: 0.13
Nodes (30): Fib, findFib(), openFibTool(), pivot(), Pt, Box, candlePoint(), chartBox() (+22 more)

### Community 3 - "API Contracts — Trading Lab"
Cohesion: 0.09
Nodes (21): 1.1 Формат ошибки, 1.2 Заголовки кэша, 1. Общие соглашения, 2.2 Расширения контрактов (предложение — фиксируются при реализации в `@tl/core`), 2. Типы `@tl/core`, используемые в контрактах, 3.1 `GET /api/health`, 3.2 `GET /api/history`, 3.3 `POST /api/tasks/{module}/next` (+13 more)

### Community 4 - "FIBONACCI — спецификация модуля Fibonacci Playground (v1.1) для `@tl/core`"
Cohesion: 0.06
Nodes (36): 10. Навыки и прогресс, 11.1 Общие блоки, 11.2 Что понято верно (`OkCode`, новые), 11.3 Ошибки (части 3–6), 11.4 Словари текстовых параметров, 11. Коды и шаблоны разбора (источник `src/i18n/ru/feedback`), 12.1 Формат и процесс, 12.2 Участки (+28 more)

### Community 5 - "with"
Cohesion: 0.08
Nodes (26): runs-on, steps, GITHUB_TOKEN, jobs, check, secrets-scan, name, on (+18 more)

### Community 6 - "Architecture — Trading Lab"
Cohesion: 0.13
Nodes (14): 10. Развёртывание, 11. Риски, 1. Ключевые ограничения, определяющие архитектуру, 2. Обзор, 3. Репозиторий (pnpm monorepo), 4.1 Синхронизация таймфреймов, 4.2 Разметка (общая модель для пользователя и алгоритма), 4.3 Алгоритмы (детерминированные, версионируемые) (+6 more)

### Community 7 - "PaFindBody.tsx"
Cohesion: 0.16
Nodes (23): MsMarkBody(), PaFindBody(), ContextFactors, impliedDirection(), keepSingleLevel(), msMarkAnswer(), paContextAnswer(), paFindAnswer() (+15 more)

### Community 8 - "toolGroups.tsx"
Cohesion: 0.28
Nodes (11): ToolId, Cell(), groupOf(), TaskToolbarBar(), TaskToolbarProps, TaskToolRail(), ERASER, PATTERN_TAP_TOOL (+3 more)

### Community 9 - "market-data/package.json"
Cohesion: 0.11
Nodes (20): dependencies, fflate@^0.8.3, @tl/core@workspace:*, devDependencies, vitest@^4.1.12, @vitest/coverage-v8@^4.1.12, exports, ./archive (+12 more)

### Community 10 - "UtcMs"
Cohesion: 0.13
Nodes (15): DailyActivityRow, SkillStatRow, TerminalMarksRow, TradingLabDB, defaultSettings(), LocalRepository, LocalSnapshot, mark (+7 more)

### Community 11 - "core/src/index.ts"
Cohesion: 0.07
Nodes (53): TerminalPage(), isScopedKind(), CheckPanel(), subscribe(), useDesktop(), ARCHIVE_MIN_AGE_MS, ARCHIVE_SYMBOLS, archiveAllowed() (+45 more)

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
Nodes (47): AppError(), NotFound(), csp, nextConfig, Status, ChoiceOption, SetupFieldProps, copyFor() (+39 more)

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
Cohesion: 0.11
Nodes (34): age(), CHALLENGE_STRUCTURE, FactsInput, HTF, intersects(), lastEventSince(), poiFor(), PoiInfo (+26 more)

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
Cohesion: 0.09
Nodes (15): ADR-0001: Next.js 16 + TypeScript strict, pnpm monorepo, Vercel, Контекст, Последствия, Рассмотренные альтернативы, Решение, ADR-0004: История для заданий — сервер читает архив data.binance.vision, Контекст, Последствия (+7 more)

### Community 29 - "PaContextBody.tsx"
Cohesion: 0.14
Nodes (22): Page(), GradeGlyph(), Annotated(), CONTEXT_FIELD_IDS, CONTEXT_HTF, ContextFieldId, viewForField(), PaContextBody() (+14 more)

### Community 30 - "TaskTimeframe"
Cohesion: 0.14
Nodes (24): AnswerInput, ChallengeAnswerBody, SessionState, task, ChallengeDetailDto, ChallengeGradeResult, ChallengeOutcomeDto, ChallengePayload (+16 more)

### Community 31 - "render.ts"
Cohesion: 0.11
Nodes (26): OpenCandleInfo, PrimitiveState, ZONE_KINDS, CandleHighlight, dimSpans(), HighlightColumn, highlightColumns(), HighlightRange (+18 more)

### Community 32 - "fetch-fixtures.mjs"
Cohesion: 0.05
Nodes (32): dynamic, GET(), safeEqual(), ChallengeAttemptStat, challengeStats(), dailyProgress(), DayMap, DayRecord (+24 more)

### Community 33 - "Trading Lab"
Cohesion: 0.33
Nodes (6): Trading Lab, Быстрый старт, Документация, Команды, Ограничения, Структура

### Community 34 - "token.ts"
Cohesion: 0.11
Nodes (26): zod@^4.0.0, ConfigError, b64(), derive(), getSigningSecret(), HeaderSchema, invalid(), keyCache (+18 more)

### Community 35 - "session/types.ts"
Cohesion: 0.12
Nodes (34): Page(), Page(), MsSetup(), PaSetup(), CommonFields(), SHORT, common(), CommonParams (+26 more)

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
Cohesion: 0.12
Nodes (33): 2.1 Из `ARCHITECTURE.md` §4 (дословно), Решение, 1.2 Переиспользуемые соглашения (без изменений), 1.2 Переиспользуемые соглашения (без изменений), 3.4 Граничные случаи (проверены на реальных свечах), golden/ - эталонные участки SMC (ALGORITHMS §18), allSwingsMap, AnalyzeOptions (+25 more)

### Community 45 - "tasks.ts"
Cohesion: 0.12
Nodes (33): cutoffOf(), futureProviderFor(), loadClosedBefore(), buildChallenge(), buildMs(), ChReq, gradeChallengeTask(), gradeMsMark() (+25 more)

### Community 46 - "LAYOUTS — Trading Lab"
Cohesion: 0.07
Nodes (29): 0.1 Навигация и уровни, 0.2 Зоны экрана 390x844, 0.3 Жесты и разметка (мобильный), 0. Общие правила, 1.1 Мобильный 390x844 (прокручивается; график не нужен), 1.2 Десктоп 1440x900, 1. Главная (раздел «Обучение»), 2.1 Мобильный 390x844 (+21 more)

### Community 47 - "2. Компоненты"
Cohesion: 0.10
Nodes (20): 0. Общее, 1.1 Инструменты разметки, 1. Набор иконок: lucide-react, 2.10 ProgressBar, 2.11 Toast, 2.12 Tooltip / Hint, 2.13 FeedbackBlock (разбор), 2.14 Прочие (по необходимости, не расширять без решения) (+12 more)

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
Nodes (44): dependencies, dexie@^4.0.0, lightweight-charts@~5.2.1, lucide-react@^1.66.0, next@^16.0.0, react@^19.0.0, react-dom@^19.0.0, @supabase/ssr@^0.12.7 (+36 more)

### Community 52 - "1. Общие соглашения"
Cohesion: 0.17
Nodes (12): c(), 1.1 Входные свечи, 1.2 Термины свечи, 1.3 ATR, 1.4 Детерминизм и числа, 1.5 ALGO_VERSION, 1.6 Параметры по сложностям (сводка), 1. Общие соглашения (+4 more)

### Community 53 - "rules.ts"
Cohesion: 0.09
Nodes (45): DrawKind, FULL_WIDTH_KINDS, isDrawKind(), MarkExtra, RAY_RIGHT_KINDS, SWING_SIDE, TOOL_DEFS, ToolDef (+37 more)

### Community 54 - "terms.tsx"
Cohesion: 0.18
Nodes (17): dismissIntro(), isIntroDismissed(), key(), TaskIntro(), TaskIntroProps, Host(), byAlias, pattern (+9 more)

### Community 55 - "schemas.ts"
Cohesion: 0.08
Nodes (38): ApiError, ApiErrorCode, errorResponse(), toApiError(), validationError(), ValidationIssue, guard(), handleGrade() (+30 more)

### Community 56 - "GradeError"
Cohesion: 0.22
Nodes (20): Core, GradeResultApi, 17.1 Структура и ключи, 17.2 Верность и общие принципы, 17.3 Что понято верно (`OkCode`; новые помечены *), 17.4 Ошибки (части 3–6), 17. Шаблоны разбора (источник `src/i18n/ru/feedback`), ChallengeGrade (+12 more)

### Community 57 - "TradingChart.tsx"
Cohesion: 0.07
Nodes (32): DrawingPrimitive, PointerKind, lwcProjection(), snapAnchor(), SnapOptions, snapPriceToCandle(), synthetic_candles, T0 (+24 more)

### Community 58 - "TradingChart"
Cohesion: 0.07
Nodes (28): constrainAnchors(), createMark(), ControllerNotice, DrawingController, bosMark, breakIdx, drag(), index (+20 more)

### Community 59 - "smc/marks.ts"
Cohesion: 0.26
Nodes (15): allLayerSwings(), buildAlgoMarkSet(), conceptOf(), endTimeOf(), eventMark(), fvgMark(), IndexWindow, KIND_CONCEPT (+7 more)

### Community 60 - "serialize.ts"
Cohesion: 0.28
Nodes (7): anchor, KINDS, MARKS_FORMAT_VERSION, markSchema, parseMarks(), serializeMarks(), m

### Community 61 - "sources.ts"
Cohesion: 0.08
Nodes (30): FIX, FixtureLoader, deps(), fixtures, flaky(), NOW, post(), ARCHIVE_START (+22 more)

### Community 62 - "deps.ts"
Cohesion: 0.14
Nodes (16): dynamic, maxDuration, POST(), runtime, dynamic, maxDuration, POST(), runtime (+8 more)

### Community 63 - "grading/grade.ts"
Cohesion: 0.21
Nodes (14): Entry, gradeMarks(), Group, groupEvaluated(), groupOf(), iou(), MAJOR, patternSkill() (+6 more)

### Community 64 - "MarkSession.tsx"
Cohesion: 0.11
Nodes (31): decimalsForTick(), makePriceFormatter(), TICK_TABLE, tickSizeFor(), fmtOf(), GradeLegendToggle(), countsFromGrade(), AsideSection() (+23 more)

### Community 65 - "UtcMs"
Cohesion: 0.08
Nodes (23): ArchiveLoader, ChallengeSource, FutureProvider, Position, PointRef, Timeframe, UtcMs, BINANCE_REST_BASE (+15 more)

### Community 66 - "core/src/index.ts"
Cohesion: 0.09
Nodes (30): load(), klinesZip(), NOW, Served, zipOf(), ArchiveErrorCode, LiveStatus, archiveH1 (+22 more)

### Community 67 - "README.md"
Cohesion: 0.20
Nodes (3): Known Issues — Trading Lab, Не проверено вообще (среда), Открыто

### Community 68 - "importLocal.ts"
Cohesion: 0.11
Nodes (31): chunks(), IMPORTED_USER_META, ImportOutcome, importSnapshot(), must(), recomputeDerived(), Row, runFirstSignInImport() (+23 more)

### Community 69 - "Команда агентов — Trading Lab"
Cohesion: 0.25
Nodes (7): 1. Сводка, 3. Правила оркестрации, 4. Формат отчёта агента (до 15 строк), 5. Шаблон задания агенту, 6. Уроки оркестрации, Команда агентов — Trading Lab, Правило graphify (включается в каждый промпт агента, исследующего код)

### Community 70 - "fib/index.ts"
Cohesion: 0.10
Nodes (41): 13. Тест-план для реализации (TDD, `packages/core/src/fib/`), checkFibMarks(), dirOf(), emptyDetail(), FIB_TERMINAL_MAX_DISTANCE, FIB_TERMINAL_NEXT, FibMarkCheck, nearest() (+33 more)

### Community 71 - "history/route.ts"
Cohesion: 0.09
Nodes (21): ARCHIVE_START_MS, dynamic, errorResponse(), GET(), ISSUE_CODES, querySchema, runtime, SYMBOLS (+13 more)

### Community 72 - "ref.ts"
Cohesion: 0.09
Nodes (37): 6.1 Момент задания и варианты, 6.2 Генерация с балансировкой ответа (решение), 6.3 Определение реакции (решение) — `resolveReaction`, 6.4 Вопрос Premium/Discount, 6.5 Конфлюэнс (через SMC-движок, только данные до T), 6.6 Оценка, 6.7 Проигрывание, 6. Задание «Где реакция?» (`fib-reaction`) (+29 more)

### Community 73 - "localDay"
Cohesion: 0.12
Nodes (18): localDay(), ImportReport, 1. Принципы, 2. Локальная схема: IndexedDB (Dexie), 3.1 RLS, 3. Схема Supabase Postgres (M7), 4.1 Порядок, 4.2 Правила по таблицам (идемпотентность по `id`, конфликты по `updated_at`) (+10 more)

### Community 74 - "SettingsScreen.tsx"
Cohesion: 0.14
Nodes (17): Page(), validateMarks(), AsyncState, useAsync(), DailyProgress, useAttempts(), useDailyProgress(), useWeakSkills() (+9 more)

### Community 75 - "Находки"
Cohesion: 0.22
Nodes (9): 1. HIGH: open redirect в /auth/callback (исправлено), 2. MEDIUM: обход rate limit через X-Forwarded-For (исправлено частично), 4. LOW: /api/cron/keepalive (открыто), 5. LOW: Supabase (повторное чтение 0001_init.sql), 6. LOW: заголовки/CSP (фактически curl на production-сборке), 7. LOW: токены (src/server/token.ts) - корректно, 8. Утечка даты Challenge, 9. Ввод, лимиты, XSS, хранилища (+1 more)

### Community 76 - "useMarketData.ts"
Cohesion: 0.13
Nodes (16): ClockOffsetEstimator, ClockSync, eventTimeOf(), sniffingFetch(), sniffingWebSocket(), archiveWindow(), appendCandle(), ArchiveHttpError (+8 more)

### Community 77 - "archive.ts"
Cohesion: 0.15
Nodes (14): AGG_TRADES_HEADER, AggTrade, ARCHIVE_BASE_URL, ArchiveFetch, ArchiveFileSpec, ArchiveSource, ArchiveSourceOptions, archiveUrl() (+6 more)

### Community 78 - "screens.test.tsx"
Cohesion: 0.22
Nodes (14): metadata, plexMono, plexSans, RootLayout(), viewport, AppShell(), BottomTabs(), DesktopTabs() (+6 more)

### Community 79 - "ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`"
Cohesion: 0.08
Nodes (24): 15. `resolveTrade` (ADR-0007, уточнения), 16.1 Навыки, 16.2 Обновление точности, 16.3 Адаптивная подборка, 16. Навыки и прогресс, 18.1 Формат и процесс, 18.2 Участки, 18.3 Что ещё размечается после утверждения (M4/M5) (+16 more)

### Community 80 - "Roadmap — Trading Lab"
Cohesion: 0.29
Nodes (6): MVP, Roadmap — Trading Lab, v1.1 — Fibonacci Playground и Premium/Discount, v1.2 — Elliott Wave Lab, v2, Правила корректировки

### Community 81 - "AUDIT — финальный дизайн-аудит Trading Lab (M8-UI)"
Cohesion: 0.33
Nodes (5): 1. Итог, 3. Impeccable detect (по URL production-сборки), 4. Что проверено и ограничения, 5. Порядок исправления, AUDIT — финальный дизайн-аудит Trading Lab (M8-UI)

### Community 82 - "fib/generate.ts"
Cohesion: 0.11
Nodes (24): Ctx, desiredClass(), EXT_TARGETS, extremesOk(), fibExtensionTask(), fibGridTask(), fibReactionTask(), hasTrap() (+16 more)

### Community 83 - "i18n/format.ts"
Cohesion: 0.15
Nodes (22): FORMATTERS(), ErrorLog(), errorName(), fmtPrice(), Review(), textOf(), buildErrorLog(), ErrorExample (+14 more)

### Community 84 - "PRD — Trading Lab"
Cohesion: 0.12
Nodes (16): 10. Приоритизация функций (MoSCoW), 11. План MVP, 12. Открытые вопросы, 2. Принципы продукта, 3.1 В MVP, 3.2 Вне MVP, 3.3 Требует исследования, 3.4 Технические риски (+8 more)

### Community 85 - "TaskSession.tsx"
Cohesion: 0.14
Nodes (26): zustand@^5.0.0, AnswerSessionProps, createTaskApi(), kindOf(), post(), TaskApi, buildAttempt(), BuildAttemptInput (+18 more)

### Community 86 - "T"
Cohesion: 0.11
Nodes (25): ADR-0005: Stateless-задания с подписанными токенами; будущее только на сервере, Контекст, Открытые вопросы, Последствия, Рассмотренные альтернативы, Решение, ADR-0006: Синхронизация таймфреймов — нативные ТФ, инвариант агрегации, sliceAt, Контекст (+17 more)

### Community 87 - "14. Challenge: эталон, оценка качества, WAIT, лимиты"
Cohesion: 0.29
Nodes (7): 14.1 Факты на момент T (`ChallengeFacts`), 14.2 Эталонная сторона `refSide`, 14.3 Оценка качества 0–100 (ответ на OQ-08), независимо от исхода, 14.4 Правильность, вердикт, лимиты, 14.5 Предикаты причин (`ReasonCode`, состав без изменений), 14.6 Подсказки (easy), 14. Challenge: эталон, оценка качества, WAIT, лимиты

### Community 88 - "sessionStore.ts"
Cohesion: 0.15
Nodes (19): buildAnswer(), defaultLevels(), formatRR(), parsePrice(), PositionIssue, reasonsFor(), RiskReward, riskReward() (+11 more)

### Community 89 - "5. Тренд, BOS и CHoCH"
Cohesion: 0.33
Nodes (6): 5.1 Общие правила, 5.2 Внешний слой — машина состояний с защищёнными уровнями, 5.3 Внутренний слой — «последний подтверждённый swing», 5.4 Что происходит после CHoCH, 5.5 Граничные случаи (проверены на реальных свечах), 5. Тренд, BOS и CHoCH

### Community 90 - "golden.pa-challenge.test.ts"
Cohesion: 0.07
Nodes (22): c15, c4h, h1, MIN, src15, src4h, agg, c1 (+14 more)

### Community 91 - "pa/generate.ts"
Cohesion: 0.13
Nodes (35): buildPa(), pickSegment(), rngOf(), symbolFor(), computeChallengeFacts(), buildHints(), DEFAULT_TFS, HTF (+27 more)

### Community 92 - "package.json"
Cohesion: 0.12
Nodes (21): devDependencies, eslint@^9.39.0, eslint-config-next@^16.0.0, @eslint/js@^9.39.0, @playwright/test@1.63.0, prettier@^3.6.0, @types/node@^22.0.0, typescript@~5.9.3 (+13 more)

### Community 93 - "fib/grade.test.ts"
Cohesion: 0.09
Nodes (33): 1.2 Остальные иконки, C, pt(), series(), upTo(), FG1, FG3, FG4 (+25 more)

### Community 94 - "6. Внешние API Binance"
Cohesion: 0.40
Nodes (5): status(), 6.1 REST: `GET https://fapi.binance.com/fapi/v1/klines` (браузер), 6.2 WebSocket: kline stream (браузер), 6.3 Архив data.binance.vision (сервер), 6. Внешние API Binance

### Community 95 - "7. Order Block"
Cohesion: 0.50
Nodes (4): 7.1 Определение (решение, ICT: «последняя противоположная свеча перед импульсом, сломавшим структуру»), 7.2 Статус (после свечи события `k`, по закрытым свечам), 7.3 Сигнатура, 7. Order Block

### Community 97 - "reveal.ts"
Cohesion: 0.22
Nodes (9): DIR_RU, localizeParam(), POI_RU, shiftBlock(), TF_RU, TIME_KEYS, TREND_KEYS, TREND_RU (+1 more)

### Community 98 - "fib/types.ts"
Cohesion: 0.12
Nodes (29): ExtensionInput, ExtensionOutcome, resolveExtension(), Case, CASES, FibPick, FIB_EXTENSION_INFO, FIB_EXTENSION_TARGETS (+21 more)

### Community 99 - "src/feedback/index.ts"
Cohesion: 0.09
Nodes (41): decimalsOf(), DIRECTION_RU, displayValue(), formatFeedbackParams(), isTimeParam(), PARAM_KINDS, ParamFormatters, ParamKind (+33 more)

### Community 100 - "grading/grade.test.ts"
Cohesion: 0.10
Nodes (24): algoOf(), ALL, at(), candles, findAlgo(), P, r, window (+16 more)

### Community 102 - "Стратегия тестирования — Trading Lab"
Cohesion: 0.12
Nodes (16): 10. Производительность, 1. Принципы, 3. Фикстуры, 4.1 Инвариант агрегации таймфреймов, 4.2 `sliceAt(series, T)`, 4.3 Нормализация (`market-data`), 4.4 Golden-тесты SMC/PA, 4.6 Интеграционные тесты API (+8 more)

### Community 103 - "features/feedback/index.ts"
Cohesion: 0.15
Nodes (19): errors, feedback, defaultFmt, FeedbackView(), FeedbackViewProps, Section(), DIR, formatParam() (+11 more)

### Community 104 - "model.ts"
Cohesion: 0.19
Nodes (22): extensionLevels(), FIB_EXTENSION_INFO, FIB_EXTENSION_TARGETS, FIB_KINDS, FIB_OTE, FIB_RETRACEMENT_LEVELS, fibDepth(), FibDirection (+14 more)

### Community 105 - "ref_vitest"
Cohesion: 0.16
Nodes (7): contractAttempt(), contractMark, runRepositoryContract(), FakeSupabase, Row, UNIQUE, seedLocal()

### Community 106 - "markText.ts"
Cohesion: 0.29
Nodes (7): patternLabel(), isFibKind(), describeMark(), formatWhen, markName(), fmt, t

### Community 107 - "patterns.ts"
Cohesion: 0.19
Nodes (20): 9.1 Состав (ответ на OQ-11), 9.3 Выход, 9.4 Проверенные примеры (BTCUSDT 4h 2026-09, GS-5), 9. Свечные модели Price Action (`detectPatterns`), FindPatternPick, body(), bodyBottom(), bodyTop() (+12 more)

### Community 108 - "placeholders.test.ts"
Cohesion: 0.12
Nodes (17): algo, ALL, assertFilled(), bad, candles, check(), FIB_ERROR_CODES, FIB_OK_CODES (+9 more)

### Community 109 - "core/src/index.ts"
Cohesion: 0.15
Nodes (16): CandleCountdown, formatCountdown(), pad2(), remainingMs(), CountdownBadge(), CountdownBadgeProps, View, cs (+8 more)

### Community 110 - "2. Карточки"
Cohesion: 0.18
Nodes (11): 2. Карточки, Backend Developer, Chart Developer, DevOps/Security Engineer, Documentation Engineer, Frontend Developer, Market Data Engineer, Orchestrator (+3 more)

### Community 111 - "Candle"
Cohesion: 0.20
Nodes (16): ChallengeFacts, ImpulseScan, MarkItem, Candle, Fvg, OrderBlock, StructureEvent, StructureResult (+8 more)

### Community 112 - "pa/index.ts"
Cohesion: 0.12
Nodes (32): gradePaLevel(), computeContext(), CONTEXT_STRUCTURE, ContextAnswer, ContextEvidence, ContextFactorAnswer, ContextReference, externalSwings() (+24 more)

### Community 114 - "ThemeProvider.tsx"
Cohesion: 0.17
Nodes (19): AuthRepositoryProvider(), SupabaseAuthRepositoryProvider(), wrap(), getDefaultRepository(), RepositoryContext, RepositoryProvider(), APPEARANCE_STORAGE_KEY, themeInitScript (+11 more)

### Community 115 - "@playwright/test"
Cohesion: 0.28
Nodes (8): checkAndSeeResult(), nextThenHomeShowsDone(), openSession(), shot(), tapCandle(), solveOne(), selectTool(), @playwright/test

### Community 116 - "challenge.helpers.ts"
Cohesion: 0.24
Nodes (10): DATE_LEAK, expandResult(), lastCandleTime(), num(), openReasons(), projectPoint(), SESSION_URL(), startSession() (+2 more)

### Community 117 - "progressLogic.ts"
Cohesion: 0.10
Nodes (34): asCore(), avgQuality(), ErrorGroup, groupByModule(), hasEnoughData(), MODULE_ORDER, moduleAccuracies(), ModuleAccuracy (+26 more)

### Community 118 - "ChallengeSession.tsx"
Cohesion: 0.09
Nodes (37): ChallengeSessionPage(), buildAttempt(), AxisTick, axisTicks(), relativeDuration(), relativeLabel(), STEPS, T (+29 more)

### Community 119 - "criteria.ts"
Cohesion: 0.23
Nodes (18): body(), bottom(), dojiItems(), engulfItems(), finish(), insideItems(), Item, PatternCheck (+10 more)

### Community 120 - "runCheck.ts"
Cohesion: 0.18
Nodes (13): CheckPanelProps, CheckOutcome, CheckResult, CheckState, CONCEPT_OF, conceptsFor(), RANGE_TAIL_CANDLES, runCheck() (+5 more)

### Community 121 - "handlers.test.ts"
Cohesion: 0.10
Nodes (16): dynamic, GET(), CH, challengeDeps(), grade(), Json, loader, mkDeps() (+8 more)

### Community 122 - "MsQuestionBody.tsx"
Cohesion: 0.24
Nodes (12): Page(), highlightMarks(), MsQuestionBody(), MsSessionScreen(), msQuestionAnswer(), AnswerList(), msBody(), ChartSkeleton() (+4 more)

### Community 123 - "challenge/api.ts"
Cohesion: 0.29
Nodes (6): ChallengeApiError, ChallengeErrorKind, fetchNext(), gradeChallenge(), kindOf(), post()

### Community 124 - "ProgressScreen.tsx"
Cohesion: 0.11
Nodes (48): ChallengePage(), Page(), Page(), ChallengeHome(), DIFFS, recentLine(), StartTf, Stats() (+40 more)

### Community 125 - "QA Report — финальная приёмка MVP Trading Lab (M8)"
Cohesion: 0.25
Nodes (7): 1. Сводка, 2. Таблица AC, 3. Ключевые инварианты, 4. Производительность (headless Chromium, software rendering, CPU throttling 4x), 6. Бэклог оркестратора, 7. Не удалось проверить, QA Report — финальная приёмка MVP Trading Lab (M8)

### Community 126 - "data/streak.test.ts"
Cohesion: 0.43
Nodes (4): DayStat, prevDay(), softStreak(), done

### Community 127 - "12. `gradeMarks` — сравнение разметки"
Cohesion: 0.21
Nodes (9): external(), selectHints(), time(), 12.4 Совместимость и стоимость пары, 3.1 Правило (решение), 3.2 Дедупликация, 3.3 Сигнатура `analyzeStructure`, 3.4 Отображение в `Mark` (общая модель `ARCHITECTURE.md` §4.2) (+1 more)

### Community 128 - "fixtures"
Cohesion: 0.50
Nodes (3): fixtures, recorded/ - записанные форматы API (fapi/fstream недоступны из облака, 451), Архивные CSV

### Community 129 - "resolve.ts"
Cohesion: 0.07
Nodes (29): candle(), series, ADR-0007: Правила исхода сделки Challenge (drill-down), Контекст, Открытые вопросы (закрыты: `docs/specs/ALGORITHMS.md`), Последствия, Рассмотренные альтернативы, Решение (+21 more)

### Community 130 - "Mark"
Cohesion: 0.18
Nodes (12): TradingChartHandle, MarkState, tailRange(), TaskChartProps, MarksSheetProps, ADR-0002: Lightweight Charts v5 + собственный слой разметки на Series Primitives, Контекст, Последствия (+4 more)

### Community 131 - "storage/index.ts"
Cohesion: 0.13
Nodes (22): dynamic, GET(), dynamic, Page(), @supabase/supabase-js@^2.118.0, AuthContext, AuthState, DISABLED (+14 more)

### Community 132 - "4. Функциональные требования"
Cohesion: 0.17
Nodes (12): 4.10 Авторизация (FR-AUTH), 4.11 Интерфейс (FR-UI), 4.1 Данные (FR-DATA), 4.2 График (FR-CHART), 4.3 Слой разметки (FR-DRAW), 4.4 Market Structure Analyzer (FR-MS), 4.5 Trading Challenge (FR-TC), 4.6 Price Action Trainer (FR-PA) (+4 more)

### Community 133 - "Подключение Supabase и Vercel (с телефона)"
Cohesion: 0.20
Nodes (10): 1. Проект Supabase, 2. Применить миграцию (создать таблицы), 3. Ключи Supabase, 4. Вход через Google, 5. Redirect URL в Supabase, 6. Vercel, 7. Проверка на телефоне, Если что-то не работает (+2 more)

### Community 134 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, check:tokens, dev, format, lint, sync:tokens, test (+2 more)

### Community 135 - "build.ts"
Cohesion: 0.39
Nodes (8): attempt(), block(), buildFeedback(), glyphOf(), matchedOf(), OK_BY_SKILL, okFromOutcomes(), normalizeParams()

### Community 136 - "2. `detectSwings` — фрактальные swing"
Cohesion: 0.33
Nodes (6): 2.1 Сигнатура, 2.2 Определение, 2.3 Граничные случаи, 2.4 Кандидаты у правого края (`pendingSwings`), 2.5 Псевдокод, 2. `detectSwings` — фрактальные swing

### Community 139 - "ELLIOTT — спецификация модуля Elliott Wave Lab (v1.2) для `@tl/core`"
Cohesion: 0.22
Nodes (8): 10. Проигрывание — `resolveScenario`, 13. Навыки и прогресс, 18. Спорные места и вопросы оркестратору, 19. Решения оркестратора (2026-11-05), 3. Проверка точек (до правил), 5. Рекомендации (баллы, не обязательны), 8. Параметры по сложностям (сводка), ELLIOTT — спецификация модуля Elliott Wave Lab (v1.2) для `@tl/core`

### Community 140 - "7. User Flows"
Cohesion: 0.25
Nodes (8): 7.1 Первый вход, 7.2 Сессия Market Structure (режим «Разметка»), 7.3 Trading Challenge: от выбора до разбора, 7.4 Price Action «Контекст», 7.5 Терминал с проверкой разметки, 7.6 Просмотр «Слабых мест», 7.7 Продолжение на другом устройстве, 7. User Flows

### Community 141 - "12. `gradeMarks` — сравнение разметки"
Cohesion: 0.25
Nodes (8): 12.1 Сигнатура (расширение `API_CONTRACTS.md`), 12.2 Ключевая свеча метки, 12.3 Группы сопоставления, 12.5 Матчинг (решение: DP по времени вместо венгерского), 12.6 Классификация после матчинга, 12.7 Счёт, вердикт, навыки, 12.8 Пример AC-07 на реальных данных (GS-1), 12. `gradeMarks` — сравнение разметки

### Community 143 - "ok"
Cohesion: 0.33
Nodes (7): ok(), 11.1 Части, 16. Тест-план для реализации (TDD, `packages/core/src/elliott/`), 6.1 Закрытый список (`EwScenarioId`, новое), 6.2 Согласованность, 6.3 Уровень invalidation (`ruleLevel`) и оценка ответа, 6. Сценарии, альтернатива, invalidation

### Community 144 - "ErrorCode"
Cohesion: 0.43
Nodes (7): TaskPayload, NextRequest, 17. Расхождения с документами, 14. Расхождения с документами, Penalty, ErrorCode, MarkKind

### Community 145 - "terminal.countdown.spec.ts"
Cohesion: 0.29
Nodes (3): CORS, OPEN, REST_1H

### Community 146 - "ADR-0003: Живые данные грузит браузер напрямую (REST + WS), fallback — REST-polling"
Cohesion: 0.33
Nodes (5): ADR-0003: Живые данные грузит браузер напрямую (REST + WS), fallback — REST-polling, Контекст, Последствия, Рассмотренные альтернативы, Решение

### Community 147 - "9. Генерация заданий"
Cohesion: 0.33
Nodes (6): 9.1 Общие правила (решение), 9.2 easy — `ew-impulse`, 9.3 medium — `ew-impulse-correction`, 9.4 hard — `ew-scenario`, 9.5 Payload и токен, 9. Генерация заданий

### Community 148 - "1. Обзор и цель продукта"
Cohesion: 0.40
Nodes (5): 1.1 Что это, 1.2 Цель, 1.3 Целевой пользователь, 1.4 Модули, 1. Обзор и цель продукта

### Community 149 - "14. Коды и шаблоны разбора (источник `src/i18n/ru/feedback`)"
Cohesion: 0.40
Nodes (5): 14.1 Общие блоки, 14.2 Что понято верно (`OkCode`, новые), 14.3 Ошибки (части 3–6), 14.4 Словари текстовых параметров, 14. Коды и шаблоны разбора (источник `src/i18n/ru/feedback`)

### Community 150 - "15. Golden-участки"
Cohesion: 0.40
Nodes (5): 15.1 Формат и процесс, 15.2 Участки, 15.3 Покрытие, 15. Golden-участки, r2()

### Community 151 - "11. Оценка (рубрика 0–100)"
Cohesion: 0.50
Nodes (4): 11.2 Вердикт, 11.3 Пример (EW-1, easy, разметка 0 = 08-06 23:00 … 5 = 08-09 22:00, `abc-next`, invalidation 77.88, без альтернативы), 11.4 Исход не входит в счёт (решение), 11. Оценка (рубрика 0–100)

### Community 152 - "12. Контракты API (расширение `API_CONTRACTS.md`)"
Cohesion: 0.50
Nodes (4): 12.1 Типы, 12.2 `POST /api/tasks/elliott/next`, 12.3 `POST /api/tasks/elliott/grade`, 12. Контракты API (расширение `API_CONTRACTS.md`)

### Community 153 - "2. Разметка: Mark-типы, якоря, снап"
Cohesion: 0.50
Nodes (4): 2.1 Mark-типы (новое), 2.2 Снап и допуск по времени, 2.3 Уровень invalidation и сценарии в ответе, 2. Разметка: Mark-типы, якоря, снап

### Community 154 - "4. Нерушимые правила (обязательны)"
Cohesion: 0.50
Nodes (4): 4.1 Импульс (без диагоналей), 4.2 Коррекции (на уровне цен, подволн нет), 4.3 Граничные случаи (проверены на реальных свечах), 4. Нерушимые правила (обязательны)

### Community 155 - "5. Задание «Построй сетку» (`fib-grid`)"
Cohesion: 0.50
Nodes (4): 5.1 Генерация, 5.2 Ответ и проверка, 5.3 Пример (FG-1, BTCUSDT 4h, BOS bull 2026-09-21 08:00), 5. Задание «Построй сетку» (`fib-grid`)

### Community 156 - "playwright.config.ts"
Cohesion: 0.50
Nodes (3): INTRO_DISMISSED, INTRO_KEYS, PORT

### Community 157 - "1. Область и общие соглашения"
Cohesion: 0.67
Nodes (3): 1.1 Что входит, 1.3 Направление, роли точек, обозначения, 1. Область и общие соглашения

### Community 158 - "7. Детекторы"
Cohesion: 0.67
Nodes (3): 7.1 `enumerateCounts` — все допустимые разметки до текущей точки, 7.2 `findWaveCandidates` — участки для easy/medium, 7. Детекторы

## Knowledge Gaps
- **13 isolated node(s):** `ADR-0008`, `ADR-0007`, `ADR-0006`, `ADR-0005`, `ADR-0005` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1103 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Mark` connect `Mark` to `terminal.helpers.ts`, `PaFindBody.tsx`, `UtcMs`, `core/src/index.ts`, `facts.ts`, `hit.ts`, `TaskTimeframe`, `render.ts`, `session/types.ts`, `tasks.ts`, `1. Общие соглашения`, `rules.ts`, `GradeError`, `TradingChart.tsx`, `TradingChart`, `smc/marks.ts`, `serialize.ts`, `grading/grade.ts`, `MarkSession.tsx`, `importLocal.ts`, `fib/index.ts`, `ref.ts`, `SettingsScreen.tsx`, `fib/generate.ts`, `TaskSession.tsx`, `pa/generate.ts`, `fib/grade.test.ts`, `fib/types.ts`, `grading/grade.test.ts`, `ref_vitest`, `markText.ts`, `placeholders.test.ts`, `core/src/index.ts`, `Candle`, `pa/index.ts`, `ChallengeSession.tsx`, `runCheck.ts`, `handlers.test.ts`, `MsQuestionBody.tsx`, `12. `gradeMarks` — сравнение разметки`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Mark` (e.g. with `Контекст` and `Последствия`) actually correct?**
  _`Mark` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0008`, `ADR-0007`, `ADR-0006` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `market-structure.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1039136302294197 - nodes in this community are weakly interconnected._
- **Why does `Candle` connect `Candle` to `market-structure.ts`, `resolve.ts`, `Mark`, `facts.ts`, `hit.ts`, `TaskTimeframe`, `render.ts`, `session/types.ts`, `src/types.ts`, `tasks.ts`, `rules.ts`, `GradeError`, `TradingChart.tsx`, `TradingChart`, `sources.ts`, `MarkSession.tsx`, `UtcMs`, `core/src/index.ts`, `fib/index.ts`, `ref.ts`, `useMarketData.ts`, `archive.ts`, `fib/generate.ts`, `TaskSession.tsx`, `golden.pa-challenge.test.ts`, `pa/generate.ts`, `fib/grade.test.ts`, `6. Внешние API Binance`, `fib/types.ts`, `grading/grade.test.ts`, `patterns.ts`, `core/src/index.ts`, `pa/index.ts`, `criteria.ts`, `runCheck.ts`, `handlers.test.ts`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `UtcMs` (e.g. with `1. Общие соглашения` and `4.1 Шкала задания`) actually correct?**
  _`UtcMs` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Repository` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._