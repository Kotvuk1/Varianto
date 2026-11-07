# Graph Report - Varianto  (2026-11-07)

## Corpus Check
- 644 files · ~402,647 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 49 file(s) not represented in the graph (top: .csv 43, (none) 4, .example 1)

## Summary
- 4553 nodes · 14489 edges · 176 communities (165 shown, 11 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 459 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ad51dba7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- market-structure.ts
- SupabaseRepository
- terminal.helpers.ts
- API Contracts — Trading Lab
- elliott/check.ts
- with
- Architecture — Trading Lab
- curriculum/swings.ts
- progressLogic.ts
- market-data/package.json
- UtcMs
- server/elliott.ts
- core/package.json
- compilerOptions
- Interview Summary — Trading Lab
- react
- compilerOptions
- Project Status — Trading Lab
- Skills Registry — Trading Lab
- UtcMs
- chart-developer.md
- devops-security.md
- documentation-engineer.md
- parts.test.ts
- market-data-engineer.md
- qa-engineer.md
- technical-analyst.md
- uiux-designer.md
- DECISIONS/README.md
- elliott/check.ts
- elliott/placeholders.test.ts
- service.ts
- fetch-fixtures.mjs
- impulses.ts
- token.ts
- session.ts
- .prettierrc.json
- e2e/tsconfig.json
- core/tsconfig.json
- market-data/tsconfig.json
- src/types.ts
- postcss.config.mjs
- CLAUDE.md
- .claude/CLAUDE.md
- pnpm-workspace.yaml
- i18n/format.ts
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
- buildFeedback
- elliott/ref.ts
- Timeframe
- context.ts
- grading/grade.ts
- MarkSession.tsx
- tasks.ts
- live.ts
- README.md
- importLocal.ts
- Repository
- stages.ts
- history/route.ts
- fib/index.ts
- localDay
- elliott.helpers.ts
- layout.ts
- useMarketData.ts
- archive.ts
- screens.test.tsx
- TradeBodies.tsx
- Roadmap — Trading Lab
- CountdownBadge.tsx
- fib/generate.ts
- cur.ts
- PRD — Trading Lab
- session/types.ts
- ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`
- data/streak.test.ts
- combo.ts
- ref
- runCheck.ts
- TerminalScreen.tsx
- package.json
- fib/grade.test.ts
- limit-trade.ts
- handlers.ts
- web/AGENTS.md
- src/normalize.ts
- model.ts
- src/feedback/index.ts
- AUDIT — финальный дизайн-аудит Trading Lab (M8-UI)
- challenge/reveal.ts
- Стратегия тестирования — Trading Lab
- features/feedback/index.ts
- fib.helpers.ts
- ref_vitest
- golden.pa-challenge.test.ts
- UtcMs
- ErrorCode
- fib.controller.test.ts
- core/src/index.ts
- 2. Карточки
- pa/index.ts
- Query
- storage/index.ts
- @playwright/test
- challenge.helpers.ts
- fib/types.ts
- panels.tsx
- criteria.ts
- ChallengeSession
- dependencies
- Mark
- SessionActions
- ProgressScreen.tsx
- QA Report — финальная приёмка MVP Trading Lab (M8)
- sessionStore.test.ts
- ElliottBody.tsx
- fixtures
- elliott.test.ts
- handlers.ts
- AuthProvider.tsx
- ok
- Подключение Supabase и Vercel (с телефона)
- handlers.test.ts
- serialize.ts
- high
- vercel.json
- ELLIOTT — спецификация модуля Elliott Wave Lab (v1.2) для `@tl/core`
- curriculum.helpers.ts
- 12. `gradeMarks` — сравнение разметки
- curriculum.test.ts
- 1. Общие соглашения
- markers.ts
- ew.controller.test.ts
- hints.ts
- Находки
- Trading Lab
- 14. Challenge: эталон, оценка качества, WAIT, лимиты
- elliott/index.ts
- patterns.ts
- 6. Внешние API Binance
- sessionStore.ts
- ref_node_crypto
- FIBONACCI — спецификация модуля Fibonacci Playground (v1.1) для `@tl/core`
- playwright.config.ts
- ref_vitest
- CourseSection.tsx
- Команда агентов — Trading Lab
- CURRICULUM.md
- 7. User Flows
- TaskTimeframe
- «Спросить ИИ» (MiniMax)
- feedback/placeholders.test.ts
- 2. `detectSwings` — фрактальные swing
- 11. Контекст для PA «Контекст»
- fibonacci/reveal.ts
- scripts
- 3. `findImpulses` — импульс для задания и эталон сетки
- 3. Внутренние HTTP API
- 12. Коды и шаблоны разбора (источник `src/i18n/ru/feedback`)
- 14. Коды и шаблоны разбора (источник `src/i18n/ru/feedback`)
- tf.ts
- PatternType
- fake-indexeddb

## God Nodes (most connected - your core abstractions)
1. `Candle` - 191 edges
2. `Mark` - 151 edges
3. `UtcMs` - 139 edges
4. `react` - 99 edges
5. `TaskTimeframe` - 96 edges
6. `analyzeStructure()` - 63 edges
7. `Difficulty` - 57 edges
8. `gradeCurTask()` - 54 edges
9. `cn()` - 51 edges
10. `GradeError` - 50 edges

## Surprising Connections (you probably didn't know these)
- `P2` --references--> `GradeLegend()`  [INFERRED]
  docs/design/AUDIT.md → apps/web/src/features/feedback/GradeLegend.tsx
- `Закрыто (по коду), не требует действий` --references--> `PaContextBody()`  [INFERRED]
  docs/KNOWN_ISSUES.md → apps/web/src/features/price-action/PaContextBody.tsx
- `15. UI-структура раздела «Обучение» (запрос к Frontend/Designer)` --references--> `SessionLayout()`  [INFERRED]
  docs/specs/CURRICULUM_STAGES.md → apps/web/src/features/session/SessionLayout.tsx
- `4.2 Типы ответа (`Answer`)` --references--> `Answer`  [INFERRED]
  docs/API_CONTRACTS.md → apps/web/src/server/schemas.ts
- `7. Интерфейс `Repository` (`ARCHITECTURE.md` §5.4)` --references--> `Repository`  [INFERRED]
  docs/API_CONTRACTS.md → apps/web/src/storage/types.ts

## Import Cycles
- 2-file cycle: `apps/web/src/server/common.ts -> apps/web/src/server/tasks.ts -> apps/web/src/server/common.ts`
- 2-file cycle: `packages/core/src/candles/aggregate.ts -> packages/core/src/index.ts -> packages/core/src/candles/aggregate.ts`
- 3-file cycle: `apps/web/src/server/common.ts -> apps/web/src/server/tasks.ts -> apps/web/src/server/curriculum.ts -> apps/web/src/server/common.ts`

## Communities (176 total, 11 thin omitted)

### Community 0 - "market-structure.ts"
Cohesion: 0.09
Nodes (39): atrAt(), buildMsQuestion(), Candidate, checkMsWindow(), drawCandidate(), generateMsQuestion(), gradeMsQuestion(), isBodyBreak() (+31 more)

### Community 1 - "SupabaseRepository"
Cohesion: 0.19
Nodes (7): must(), SupabaseRepository, 5.1 Живые данные (терминал), 5.2 История для заданий (сервер), 5.3 Задания (stateless, без БД до M7), 5.4 Хранение (Repository), 5. Потоки данных

### Community 2 - "terminal.helpers.ts"
Cohesion: 0.11
Nodes (35): alternating(), isPivot(), P, Pt, Fib, findFib(), openFibTool(), pivot() (+27 more)

### Community 3 - "API Contracts — Trading Lab"
Cohesion: 0.13
Nodes (14): 1.1 Формат ошибки, 1.2 Заголовки кэша, 1. Общие соглашения, 2.2 Расширения контрактов (предложение — фиксируются при реализации в `@tl/core`), 2. Типы `@tl/core`, используемые в контрактах, 4.2 Типы ответа (`Answer`), 4.3 Ответы курса (CURRICULUM_STAGES.md §11.3; схемы — apps/web/src/server/schemas.ts), 4. Шкала времени заданий и ответы (+6 more)

### Community 4 - "elliott/check.ts"
Cohesion: 0.15
Nodes (24): atrCache, EwCheck, EwCheckInput, GUIDE_SKILL(), swingCache, swingFlags(), cache, correctionGuides() (+16 more)

### Community 5 - "with"
Cohesion: 0.08
Nodes (26): runs-on, steps, GITHUB_TOKEN, jobs, check, secrets-scan, name, on (+18 more)

### Community 6 - "Architecture — Trading Lab"
Cohesion: 0.14
Nodes (14): 10. Развёртывание, 11. Риски, 1. Ключевые ограничения, определяющие архитектуру, 2. Обзор, 3. Репозиторий (pnpm monorepo), 4.1 Синхронизация таймфреймов, 4.2 Разметка (общая модель для пользователя и алгоритма), 4.3 Алгоритмы (детерминированные, версионируемые) (+6 more)

### Community 7 - "curriculum/swings.ts"
Cohesion: 0.13
Nodes (22): 13.3 Market Structure «Вопрос», 6.3 Граничные случаи, 16.1 Сила уровня и реакция (доля реакций среди «реакция + пробой»), 16.2 Лимитка и стоп (реакции, n = 3 271), 16.3 Структура и свинги (окна каждые 10 свечей, BTCUSDT 4h/1h, ETHUSDT 1h, SOLUSDT 1h; 424 окна), 16. Статистика (обоснование порогов), 2.1 Что выносится из Market Structure, 2.3 `sw-trend` «Какой тренд по свингам?» (+14 more)

### Community 8 - "progressLogic.ts"
Cohesion: 0.10
Nodes (54): Page(), EmptyState(), ErrorState(), LoadingRows(), ContinueBlock(), HomeWeakSpots(), CourseSection(), LearnScreen() (+46 more)

### Community 9 - "market-data/package.json"
Cohesion: 0.11
Nodes (20): dependencies, fflate@^0.8.3, @tl/core@workspace:*, devDependencies, vitest@^4.1.12, @vitest/coverage-v8@^4.1.12, exports, ./archive (+12 more)

### Community 10 - "UtcMs"
Cohesion: 0.12
Nodes (16): DailyActivityRow, SkillStatRow, TerminalMarksRow, TradingLabDB, defaultSettings(), LocalRepository, LocalSnapshot, mark (+8 more)

### Community 11 - "server/elliott.ts"
Cohesion: 0.12
Nodes (28): archiveMonths(), buildElliott(), catalogCache, ElliottParams, ElliottParamsSchema, EW_MAX_SEGMENTS, EwReq, gradeElliottTask() (+20 more)

### Community 12 - "core/package.json"
Cohesion: 0.15
Nodes (14): devDependencies, vitest@^4.1.12, @vitest/coverage-v8@^4.1.12, exports, vitest, @vitest/coverage-v8, name, private (+6 more)

### Community 13 - "compilerOptions"
Cohesion: 0.13
Nodes (14): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, lib, module, moduleResolution, noEmit (+6 more)

### Community 14 - "Interview Summary — Trading Lab"
Cohesion: 0.14
Nodes (13): 1. Продукт и пользователь, 2. Модули и приоритеты, 3. Обратная связь и прогресс, 4. Интерфейс, 5. Рыночные данные, 6. Стек и инфраструктура, 7. Процесс, Interview Summary — Trading Lab (+5 more)

### Community 15 - "react"
Cohesion: 0.05
Nodes (81): TerminalPage(), NoticeCode, FOCUS_SKILLS, SHEET_PAD, ORDER, ResultSheet(), ResultSheetHeight, ResultSheetProps (+73 more)

### Community 16 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, allowJs, incremental, jsx, lib, paths, plugins, exclude (+3 more)

### Community 17 - "Project Status — Trading Lab"
Cohesion: 0.22
Nodes (8): Project Status — Trading Lab, Блокеры, Готовность по частям, Окружение разработки (облачный контейнер), Следующие действия, Что НЕ проверено, Что реально работает (проверено 2026-11-04), Этапы

### Community 18 - "Skills Registry — Trading Lab"
Cohesion: 0.25
Nodes (7): Skills Registry — Trading Lab, Кандидаты — отложены до утверждения архитектуры, Отклонённые, Справочник: Public APIs, Уже доступные навыки окружения (не требуют установки), Установка в новом контейнере, Установленные инструменты

### Community 19 - "UtcMs"
Cohesion: 0.04
Nodes (81): SegmentData, ArchiveLoaderOptions, Chunk, RawAggTrade, age(), CHALLENGE_STRUCTURE, ChallengeFacts, computeChallengeFacts() (+73 more)

### Community 20 - "chart-developer.md"
Cohesion: 0.29
Nodes (6): graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 21 - "devops-security.md"
Cohesion: 0.29
Nodes (6): graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 22 - "documentation-engineer.md"
Cohesion: 0.29
Nodes (6): graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 23 - "parts.test.ts"
Cohesion: 0.05
Nodes (34): distToRectEdge(), distToSegment(), Hit, hitLevel(), hitTest(), inside(), partScore(), geos() (+26 more)

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
Nodes (31): ADR-0001: Next.js 16 + TypeScript strict, pnpm monorepo, Vercel, Контекст, Последствия, Рассмотренные альтернативы, Решение, ADR-0002: Lightweight Charts v5 + собственный слой разметки на Series Primitives, Контекст, Последствия (+23 more)

### Community 29 - "elliott/check.ts"
Cohesion: 0.14
Nodes (38): 7.1 `enumerateCounts` — все допустимые разметки до текущей точки, 7.2 `findWaveCandidates` — участки для easy/medium, 7. Детекторы, findWaveCandidates(), Pivot, zigzagPivots(), atrOf(), checkCount() (+30 more)

### Community 30 - "elliott/placeholders.test.ts"
Cohesion: 0.05
Nodes (53): EASY, MEDIUM, btc4, run(), sol, SOL_IMP, scan(), EW_WEIGHTS (+45 more)

### Community 31 - "service.ts"
Cohesion: 0.06
Nodes (43): dynamic, POST(), runtime, dynamic, GET(), runtime, ctx, mk() (+35 more)

### Community 32 - "fetch-fixtures.mjs"
Cohesion: 0.08
Nodes (15): CORS, OPEN, REST_1H, downloadedAt, items, m1, rec, root (+7 more)

### Community 33 - "impulses.ts"
Cohesion: 0.12
Nodes (19): 12.1 Формат и процесс, 12.2 Участки, 12.3 Покрытие граничных случаев golden-участками, 12. Golden-участки, idx(), FILES, series(), STEP (+11 more)

### Community 34 - "token.ts"
Cohesion: 0.13
Nodes (23): ConfigError, b64(), derive(), getSigningSecret(), HeaderSchema, invalid(), keyCache, Keys (+15 more)

### Community 35 - "session.ts"
Cohesion: 0.05
Nodes (68): AppError(), Page(), Page(), Page(), Page(), Page(), Page(), NotFound() (+60 more)

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
Cohesion: 0.05
Nodes (90): 2.1 Из `ARCHITECTURE.md` §4 (дословно), Решение, 18.2 Участки, 6.3 TP: у следующего уровня/ликвидности (35 баллов), 1.2 Переиспользуемые соглашения (без изменений), 1.2 Переиспользуемые соглашения (без изменений), 3.4 Граничные случаи (проверены на реальных свечах), 6.5 Конфлюэнс (через SMC-движок, только данные до T) (+82 more)

### Community 45 - "i18n/format.ts"
Cohesion: 0.13
Nodes (28): DIR, formatParam(), FORMATTERS(), formatWhen(), KIND_KEYS, placeOf(), ErrorLog(), errorName() (+20 more)

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
Nodes (18): devDependencies, jsdom@^26.0.0, tailwindcss@^4.0.0, @tailwindcss/postcss@^4.0.0, @testing-library/react@^16.0.0, @testing-library/user-event@^14.6.8, @types/react@^19.0.0, @types/react-dom@^19.0.0 (+10 more)

### Community 52 - "DrawingController"
Cohesion: 0.08
Nodes (29): constrainAnchors(), createMark(), DrawKind, ZONE_KIND, firstSideOf(), sideAt(), snapExtreme(), DrawingController (+21 more)

### Community 53 - "rules.ts"
Cohesion: 0.06
Nodes (58): drawKindOf(), isDrawTool(), MarkExtra, SWING_SIDE, EW_CORRECTION_LABELS, EW_IMPULSE_LABELS, EW_IMPULSE_SIZES, EW_INVALIDATION_ROLE (+50 more)

### Community 54 - "PaContextBody.tsx"
Cohesion: 0.13
Nodes (26): dismissIntro(), isIntroDismissed(), key(), TaskIntro(), TaskIntroProps, Host(), Annotated(), byAlias (+18 more)

### Community 55 - "schemas.ts"
Cohesion: 0.06
Nodes (28): AnchorSchema, AnswerSchema, BUSINESS_CODES, ChallengeAnswer, ChallengeAnswerSchema, difficulty, ElliottAnswerApi, ElliottAnswerSchema (+20 more)

### Community 56 - "GradeError"
Cohesion: 0.25
Nodes (23): Core, GradeResultApi, ChallengeGrade, ComboScore, ZonePart, Graded, CurPart, LimitEntryGrade (+15 more)

### Community 57 - "TradingChart.tsx"
Cohesion: 0.07
Nodes (23): DrawingPrimitive, snapAnchor(), SnapOptions, snapPriceToCandle(), synthetic_candles, T0, T0, TimeIndex (+15 more)

### Community 58 - "fib/index.ts"
Cohesion: 0.10
Nodes (42): ReactionFormProps, bandOf(), ConfluenceCtx, FIB_CONFLUENCE_KEYS, FIB_LEVEL_LOOKBACK, FibConfluence, overlaps(), PriceBand (+34 more)

### Community 59 - "buildFeedback"
Cohesion: 0.16
Nodes (17): block(), glyphOf(), OK_BY_SKILL, decimalsOf(), DIRECTION_RU, displayValue(), formatFeedbackParams(), normalizeParams() (+9 more)

### Community 60 - "elliott/ref.ts"
Cohesion: 0.14
Nodes (22): EwFormState, ScenarioPanelProps, EwPick, anchors(), Case, countOf(), files, Golden (+14 more)

### Community 61 - "Timeframe"
Cohesion: 0.15
Nodes (10): FIX, FixtureLoader, deps(), fixtures, flaky(), NOW, ArchiveLoader, CandleLoader (+2 more)

### Community 62 - "context.ts"
Cohesion: 0.14
Nodes (19): reconstructContext(), computeContext(), CONTEXT_STRUCTURE, ContextAnswer, ContextFactorAnswer, ContextReference, externalSwings(), gradeContext() (+11 more)

### Community 63 - "grading/grade.ts"
Cohesion: 0.18
Nodes (17): kindName(), Entry, gradeMarks(), Group, groupEvaluated(), groupOf(), iou(), MAJOR (+9 more)

### Community 64 - "MarkSession.tsx"
Cohesion: 0.09
Nodes (56): decimalsForTick(), makePriceFormatter(), TICK_TABLE, tickSizeFor(), TimeWindow, TradingChartHandle, fmtOf(), ReplayBar() (+48 more)

### Community 65 - "tasks.ts"
Cohesion: 0.05
Nodes (106): msDifficultyHelp(), isoOf(), pickSegment(), rangeOf(), rngOf(), sameSeries(), SEGMENT_EXTRA, TICK (+98 more)

### Community 66 - "live.ts"
Cohesion: 0.07
Nodes (27): Frontend Developer, BINANCE_REST_BASE, BINANCE_WS_BASE, binanceInterval(), FetchKlinesOptions, LiveErrorCode, LiveFeed, LiveFeedError (+19 more)

### Community 67 - "README.md"
Cohesion: 0.18
Nodes (4): Known Issues — Trading Lab, Закрыто (по коду), не требует действий, Не проверено вообще (среда), Открыто

### Community 68 - "importLocal.ts"
Cohesion: 0.23
Nodes (21): chunks(), IMPORTED_USER_META, ImportOutcome, importSnapshot(), must(), recomputeDerived(), Row, runFirstSignInImport() (+13 more)

### Community 69 - "Repository"
Cohesion: 0.07
Nodes (19): Repository, graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила, graphify (+11 more)

### Community 70 - "stages.ts"
Cohesion: 0.05
Nodes (69): buildCourse(), COMBO_HREF, COMBO_ORDER, ComboView, CourseView, Remaining, remainingOf(), STAGE_HREF (+61 more)

### Community 71 - "history/route.ts"
Cohesion: 0.12
Nodes (15): ARCHIVE_START_MS, dynamic, errorResponse(), GET(), ISSUE_CODES, querySchema, runtime, SYMBOLS (+7 more)

### Community 72 - "fib/index.ts"
Cohesion: 0.14
Nodes (29): gradeFibTask(), 13. Тест-план для реализации (TDD, `packages/core/src/fib/`), checkFibMarks(), dirOf(), emptyDetail(), FIB_TERMINAL_MAX_DISTANCE, FIB_TERMINAL_NEXT, nearest() (+21 more)

### Community 73 - "localDay"
Cohesion: 0.11
Nodes (19): buildAttempt(), localDay(), ImportReport, 1. Принципы, 2. Локальная схема: IndexedDB (Dexie), 3.1 RLS, 3. Схема Supabase Postgres (M7), 4.1 Порядок (+11 more)

### Community 74 - "elliott.helpers.ts"
Cohesion: 0.19
Nodes (16): bodyText(), closePanel(), countsFor(), DATE_LEAK, drawCount(), EW_STORAGE, EwEnvelope, openEw() (+8 more)

### Community 75 - "layout.ts"
Cohesion: 0.09
Nodes (42): buildGeometry(), CHAR_W, Dash, formatPrice, GeometryOptions, GLYPH_OFFSET, GlyphKind, Handle (+34 more)

### Community 76 - "useMarketData.ts"
Cohesion: 0.12
Nodes (18): ClockOffsetEstimator, ClockSync, eventTimeOf(), sniffingFetch(), sniffingWebSocket(), appendCandle(), ArchiveHttpError, DataStatus (+10 more)

### Community 77 - "archive.ts"
Cohesion: 0.15
Nodes (14): AGG_TRADES_HEADER, AggTrade, ARCHIVE_BASE_URL, ArchiveFetch, ArchiveFileSpec, ArchiveSource, ArchiveSourceOptions, archiveUrl() (+6 more)

### Community 78 - "screens.test.tsx"
Cohesion: 0.22
Nodes (14): metadata, plexMono, plexSans, RootLayout(), viewport, AppShell(), BottomTabs(), DesktopTabs() (+6 more)

### Community 79 - "TradeBodies.tsx"
Cohesion: 0.05
Nodes (69): Page(), Page(), Page(), Page(), Page(), Page(), Page(), Page() (+61 more)

### Community 80 - "Roadmap — Trading Lab"
Cohesion: 0.29
Nodes (6): MVP, Roadmap — Trading Lab, v1.1 — Fibonacci Playground и Premium/Discount, v1.2 — Elliott Wave Lab, v2, Правила корректировки

### Community 81 - "CountdownBadge.tsx"
Cohesion: 0.40
Nodes (7): CandleCountdown, formatCountdown(), pad2(), remainingMs(), CountdownBadge(), CountdownBadgeProps, View

### Community 82 - "fib/generate.ts"
Cohesion: 0.10
Nodes (30): FibMarkCheck, Ctx, desiredClass(), EXT_TARGETS, extremesOk(), FIB_IMPULSE_RULES, FIB_NEXT, fibExtensionTask() (+22 more)

### Community 83 - "cur.ts"
Cohesion: 0.06
Nodes (77): 17. Тест-план для реализации (TDD, `packages/core/src/curriculum/`), 3.6 `lv-reaction` «Какой уровень сработает» (проигрывание), ComboAnswer, gradeComboLevel(), gradeComboSmc(), playCombo(), sideOfZone(), SmcContext (+69 more)

### Community 84 - "PRD — Trading Lab"
Cohesion: 0.06
Nodes (33): 10. Приоритизация функций (MoSCoW), 11. План MVP, 12. Открытые вопросы, 1.1 Что это, 1.2 Цель, 1.3 Целевой пользователь, 1.4 Модули, 1. Обзор и цель продукта (+25 more)

### Community 85 - "session/types.ts"
Cohesion: 0.06
Nodes (82): Page(), CurShellProps, P, P, EwUserMarks, MsMarkBody(), highlightMarks(), MsQuestionBody() (+74 more)

### Community 86 - "ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`"
Cohesion: 0.10
Nodes (21): 13.1 Общие правила, 13.2 Market Structure «Разметка» (поправка v1.1, `ALGO_VERSION 1.1.0`), 13.4 Price Action, 13.5 Challenge, 13. Генерация заданий, 16.1 Навыки, 16.2 Обновление точности, 16.3 Адаптивная подборка (+13 more)

### Community 87 - "data/streak.test.ts"
Cohesion: 0.43
Nodes (4): DayStat, prevDay(), softStreak(), done

### Community 88 - "combo.ts"
Cohesion: 0.08
Nodes (50): Side, ComboLevelGrade, ComboPlay, ComboSmcGrade, iouInterval(), KIND_TEXT_RU, PLACEMENT_COMBO, PlanInput (+42 more)

### Community 89 - "ref"
Cohesion: 0.33
Nodes (6): 5.1 Общие правила, 5.2 Внешний слой — машина состояний с защищёнными уровнями, 5.3 Внутренний слой — «последний подтверждённый swing», 5.4 Что происходит после CHoCH, 5.5 Граничные случаи (проверены на реальных свечах), 5. Тренд, BOS и CHoCH

### Community 90 - "runCheck.ts"
Cohesion: 0.14
Nodes (16): CheckPanelProps, CheckOutcome, CheckResult, CheckState, CONCEPT_OF, conceptsFor(), RANGE_TAIL_CANDLES, runCheck() (+8 more)

### Community 91 - "TerminalScreen.tsx"
Cohesion: 0.07
Nodes (36): FULL_WIDTH_KINDS, isScopedKind(), RAY_RIGHT_KINDS, ToolDef, ToolId, TaskToolbarProps, ERASER, paLevelGroups() (+28 more)

### Community 92 - "package.json"
Cohesion: 0.08
Nodes (31): devDependencies, eslint@^9.39.0, eslint-config-next@^16.0.0, @eslint/js@^9.39.0, @playwright/test@1.63.0, prettier@^3.6.0, @types/node@^22.0.0, typescript@~5.9.3 (+23 more)

### Community 93 - "fib/grade.test.ts"
Cohesion: 0.10
Nodes (29): 4.1 Шкала задания, imp(), C, pt(), series(), upTo(), FG1, FG3 (+21 more)

### Community 94 - "limit-trade.ts"
Cohesion: 0.06
Nodes (49): 10.1 Алгоритм, 10.2 Эталон для «Проведи уровень», 10. `findLevels` — уровни поддержки/сопротивления, 13. Миграция БД (запрос к Backend/DB), 15. UI-структура раздела «Обучение» (запрос к Frontend/Designer), 19. Спорные места и вопросы оркестратору, 20. Решения оркестратора (2026-11-07), 3.1 Зона уровня `levelZone` (решение) (+41 more)

### Community 95 - "handlers.ts"
Cohesion: 0.11
Nodes (29): dynamic, maxDuration, POST(), runtime, ApiError, ApiErrorCode, errorResponse(), toApiError() (+21 more)

### Community 97 - "src/normalize.ts"
Cohesion: 0.15
Nodes (19): load(), klinesZip(), NOW, Served, zipOf(), ArchiveErrorCode, ARCHIVE_KLINE_HEADER, Gap (+11 more)

### Community 98 - "model.ts"
Cohesion: 0.19
Nodes (24): extensionLevels(), FIB_KINDS, FibKind, FibLevel, labelPriority(), oteRange(), retracementLevels(), thinLabels() (+16 more)

### Community 99 - "src/feedback/index.ts"
Cohesion: 0.08
Nodes (46): okFromOutcomes(), PARAM_KINDS, CHALLENGE_VERDICT_TEMPLATES_RU, CUR_OUTCOME_TEXT_RU, ELLIOTT_VERDICT_TEMPLATES_RU, ERROR_SKILLS, ERROR_TEMPLATES_RU, ErrorTemplate (+38 more)

### Community 100 - "AUDIT — финальный дизайн-аудит Trading Lab (M8-UI)"
Cohesion: 0.33
Nodes (5): 1. Итог, 3. Impeccable detect (по URL production-сборки), 4. Что проверено и ограничения, 5. Порядок исправления, AUDIT — финальный дизайн-аудит Trading Lab (M8-UI)

### Community 101 - "challenge/reveal.ts"
Cohesion: 0.14
Nodes (17): AxisTick, axisTicks(), relativeDuration(), relativeLabel(), STEPS, T, DIR_RU, localizeParam() (+9 more)

### Community 102 - "Стратегия тестирования — Trading Lab"
Cohesion: 0.12
Nodes (16): 10. Производительность, 1. Принципы, 2. Пирамида, 3. Фикстуры, 4.3 Нормализация (`market-data`), 4.4 Golden-тесты SMC/PA, 4.5 `resolveTrade`, 4.6 Интеграционные тесты API (+8 more)

### Community 103 - "features/feedback/index.ts"
Cohesion: 0.13
Nodes (23): AiReply, AskAi(), buildAttemptContext(), loadAiEnabled(), resetAiEnabledCache(), Status, errors, feedback (+15 more)

### Community 104 - "fib.helpers.ts"
Cohesion: 0.27
Nodes (11): bodyText(), DATE_LEAK, drawFib(), FIB_STORAGE, fibPoints(), openFib(), PORT, Pt (+3 more)

### Community 105 - "ref_vitest"
Cohesion: 0.23
Nodes (7): contractAttempt(), contractMark, runRepositoryContract(), FakeSupabase, Row, UNIQUE, seedLocal()

### Community 106 - "golden.pa-challenge.test.ts"
Cohesion: 0.09
Nodes (17): agg, c1, c15, T0, T1, c4h, FIX, all (+9 more)

### Community 107 - "UtcMs"
Cohesion: 0.06
Nodes (68): ComboLevelPick, ComboSmcPick, CUR_TFS, CurTaskGroup, depthOfTf(), Draw, draw(), LevelsPick (+60 more)

### Community 108 - "ErrorCode"
Cohesion: 0.22
Nodes (13): TaskPayload, NextRequest, 11.1 Маршруты и типы, 11.2 Payload (`TaskPayload`), 11.3 Answer, 11.4 GradeResult, 11. API (расширение `API_CONTRACTS.md`), 18. Расхождения с документами (+5 more)

### Community 109 - "fib.controller.test.ts"
Cohesion: 0.20
Nodes (11): A_TAP, B_TAP, C_TAP, candles, index, proj, pt(), setup() (+3 more)

### Community 110 - "core/src/index.ts"
Cohesion: 0.13
Nodes (13): series, setRange, snapZoneEdge(), synthetic_candles, T0, zoneEdgeCandidates(), fmt, t (+5 more)

### Community 111 - "2. Карточки"
Cohesion: 0.20
Nodes (10): 2. Карточки, Backend Developer, Chart Developer, DevOps/Security Engineer, Documentation Engineer, Market Data Engineer, Orchestrator, QA Engineer (+2 more)

### Community 112 - "pa/index.ts"
Cohesion: 0.15
Nodes (28): buildPa(), patternToMark(), buildPatternAlgoMarkSet(), CONTEXT_TYPES, endCandidates(), FIND_RULES, FIND_WINDOW, LADDER (+20 more)

### Community 114 - "storage/index.ts"
Cohesion: 0.11
Nodes (27): Page(), Page(), ProgressScreen(), wrap(), CANDLE_OPTIONS, DAILY_GOAL_MAX, DAILY_GOAL_MIN, DailyGoalStepper() (+19 more)

### Community 115 - "@playwright/test"
Cohesion: 0.29
Nodes (9): toFeedback(), checkAndSeeResult(), markOneBos(), nextThenHomeShowsDone(), openSession(), shot(), tapCandle(), solveOne() (+1 more)

### Community 116 - "challenge.helpers.ts"
Cohesion: 0.22
Nodes (10): DATE_LEAK, expandResult(), lastCandleTime(), num(), openReasons(), projectPoint(), SESSION_URL(), startSession() (+2 more)

### Community 117 - "fib/types.ts"
Cohesion: 0.16
Nodes (17): Imp, ExtensionInput, resolveExtension(), TARGET_ORDER, Case, CASES, Expect, FibDirection (+9 more)

### Community 118 - "panels.tsx"
Cohesion: 0.28
Nodes (14): blockerKey(), DecisionPanel(), ErrorBlock(), errorCopy(), PriceField(), ReasonsSheet(), buildAnswer(), formatRR() (+6 more)

### Community 119 - "criteria.ts"
Cohesion: 0.23
Nodes (18): body(), bottom(), dojiItems(), engulfItems(), finish(), insideItems(), Item, PatternCheck (+10 more)

### Community 120 - "ChallengeSession"
Cohesion: 0.18
Nodes (11): ChallengeSessionPage(), ChallengeApiError, ChallengeErrorKind, fetchNext(), gradeChallenge(), kindOf(), post(), ChallengeSession() (+3 more)

### Community 121 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, dexie@^4.0.0, lightweight-charts@~5.2.1, lucide-react@^1.66.0, next@^16.0.0, react@^19.0.0, react-dom@^19.0.0, @supabase/supabase-js@^2.118.0 (+7 more)

### Community 122 - "Mark"
Cohesion: 0.08
Nodes (45): drawParts(), OpenCandleInfo, PrimitiveState, ZONE_KINDS, CandleHighlight, dimSpans(), HighlightColumn, highlightColumns() (+37 more)

### Community 124 - "ProgressScreen.tsx"
Cohesion: 0.13
Nodes (22): ChallengePage(), ChallengeHome(), DIFFS, recentLine(), StartTf, Stats(), TF_OPTIONS, partMax() (+14 more)

### Community 125 - "QA Report — финальная приёмка MVP Trading Lab (M8)"
Cohesion: 0.25
Nodes (7): 1. Сводка, 2. Таблица AC, 3. Ключевые инварианты, 4. Производительность (headless Chromium, software rendering, CPU throttling 4x), 6. Бэклог оркестратора, 7. Не удалось проверить, QA Report — финальная приёмка MVP Trading Lab (M8)

### Community 126 - "sessionStore.test.ts"
Cohesion: 0.14
Nodes (13): candle(), series, task, ADR-0007: Правила исхода сделки Challenge (drill-down), Контекст, Открытые вопросы (закрыты: `docs/specs/ALGORITHMS.md`), Последствия, Рассмотренные альтернативы (+5 more)

### Community 127 - "ElliottBody.tsx"
Cohesion: 0.09
Nodes (42): Page(), allowedAlternatives(), EW_INTRO, EW_KIND, EW_TFS, ewAnswer(), EwAnswerOrError, impliedFromMarks() (+34 more)

### Community 128 - "fixtures"
Cohesion: 0.50
Nodes (3): fixtures, recorded/ - записанные форматы API (fapi/fstream недоступны из облака, 451), Архивные CSV

### Community 129 - "elliott.test.ts"
Cohesion: 0.16
Nodes (12): clearEwCatalogCache(), ewCatalogCacheSize(), deps(), easyAnswer(), grade(), Json, loader, mk() (+4 more)

### Community 130 - "handlers.ts"
Cohesion: 0.12
Nodes (21): dynamic, maxDuration, POST(), runtime, getDeps(), getHistoryLimiter(), rateFromEnv(), deps() (+13 more)

### Community 131 - "AuthProvider.tsx"
Cohesion: 0.12
Nodes (26): dynamic, GET(), dynamic, Page(), @supabase/ssr@^0.12.7, AuthContext, AuthRepositoryProvider(), AuthState (+18 more)

### Community 132 - "ok"
Cohesion: 0.14
Nodes (15): ok(), 11.1 Части, 11.2 Вердикт, 11.3 Пример (EW-1, easy, разметка 0 = 08-06 23:00 … 5 = 08-09 22:00, `abc-next`, invalidation 77.88, без альтернативы), 11.4 Исход не входит в счёт (решение), 11. Оценка (рубрика 0–100), 16. Тест-план для реализации (TDD, `packages/core/src/elliott/`), 6.1 Закрытый список (`EwScenarioId`, новое) (+7 more)

### Community 133 - "Подключение Supabase и Vercel (с телефона)"
Cohesion: 0.20
Nodes (10): 1. Проект Supabase, 2. Применить миграцию (создать таблицы), 3. Ключи Supabase, 4. Вход через Google, 5. Redirect URL в Supabase, 6. Vercel, 7. Проверка на телефоне, Если что-то не работает (+2 more)

### Community 134 - "handlers.test.ts"
Cohesion: 0.15
Nodes (13): CH, challengeDeps(), grade(), Json, loader, mkDeps(), MS_MARK, MS_Q (+5 more)

### Community 135 - "serialize.ts"
Cohesion: 0.20
Nodes (11): zod@^4.0.0, anchor, KINDS, MARKS_FORMAT_VERSION, markSchema, parseMarks(), serializeMarks(), m (+3 more)

### Community 136 - "high"
Cohesion: 0.10
Nodes (24): high(), low(), ADR-0006: Синхронизация таймфреймов — нативные ТФ, инвариант агрегации, sliceAt, Контекст, Последствия, Рассмотренные альтернативы, Решение, 7.1 Определение (решение, ICT: «последняя противоположная свеча перед импульсом, сломавшим структуру») (+16 more)

### Community 139 - "ELLIOTT — спецификация модуля Elliott Wave Lab (v1.2) для `@tl/core`"
Cohesion: 0.07
Nodes (28): 10. Проигрывание — `resolveScenario`, 12.1 Типы, 12.2 `POST /api/tasks/elliott/next`, 12.3 `POST /api/tasks/elliott/grade`, 12. Контракты API (расширение `API_CONTRACTS.md`), 13. Навыки и прогресс, 18. Спорные места и вопросы оркестратору, 19. Решения оркестратора (2026-11-05) (+20 more)

### Community 140 - "curriculum.helpers.ts"
Cohesion: 0.26
Nodes (10): checkReplayResult(), noHScroll(), pricePoint(), seedAttempts(), Side, sideFromTask(), tapPrice(), tapPoints() (+2 more)

### Community 141 - "12. `gradeMarks` — сравнение разметки"
Cohesion: 0.22
Nodes (9): 12.1 Сигнатура (расширение `API_CONTRACTS.md`), 12.2 Ключевая свеча метки, 12.3 Группы сопоставления, 12.4 Совместимость и стоимость пары, 12.5 Матчинг (решение: DP по времени вместо венгерского), 12.6 Классификация после матчинга, 12.7 Счёт, вердикт, навыки, 12.8 Пример AC-07 на реальных данных (GS-1) (+1 more)

### Community 142 - "curriculum.test.ts"
Cohesion: 0.21
Nodes (11): checkNext(), deps(), DIFFS, find(), grade(), Json, loader, next() (+3 more)

### Community 143 - "1. Общие соглашения"
Cohesion: 0.17
Nodes (12): c(), 1.1 Входные свечи, 1.2 Термины свечи, 1.3 ATR, 1.4 Детерминизм и числа, 1.5 ALGO_VERSION, 1.6 Параметры по сложностям (сводка), 1. Общие соглашения (+4 more)

### Community 144 - "markers.ts"
Cohesion: 0.21
Nodes (9): GLYPH, guideBandParts(), ReplayMarkerKind, replayMarkerParts(), ReplayMarkersInput, synthetic_candles, T0, GUIDE_BAND_LABEL (+1 more)

### Community 145 - "ew.controller.test.ts"
Cohesion: 0.24
Nodes (9): candles, index, proj, pt(), setup(), T0, tap(), TAPS (+1 more)

### Community 146 - "hints.ts"
Cohesion: 0.24
Nodes (8): external(), selectHints(), time(), 3.1 Правило (решение), 3.2 Дедупликация, 3.3 Сигнатура `analyzeStructure`, 3.4 Отображение в `Mark` (общая модель `ARCHITECTURE.md` §4.2), 3. Внешняя и внутренняя структура

### Community 147 - "Находки"
Cohesion: 0.14
Nodes (14): clientKey(), 2. MEDIUM: обход rate limit через X-Forwarded-For (исправлено частично), 4. LOW: /api/cron/keepalive (открыто), 5. LOW: Supabase (повторное чтение 0001_init.sql), 6. LOW: заголовки/CSP (фактически curl на production-сборке), 7. LOW: токены (src/server/token.ts) - корректно, 8. Утечка даты Challenge, 9. Ввод, лимиты, XSS, хранилища (+6 more)

### Community 148 - "Trading Lab"
Cohesion: 0.33
Nodes (6): Trading Lab, Быстрый старт, Документация, Команды, Ограничения, Структура

### Community 149 - "14. Challenge: эталон, оценка качества, WAIT, лимиты"
Cohesion: 0.29
Nodes (7): 14.1 Факты на момент T (`ChallengeFacts`), 14.2 Эталонная сторона `refSide`, 14.3 Оценка качества 0–100 (ответ на OQ-08), независимо от исхода, 14.4 Правильность, вердикт, лимиты, 14.5 Предикаты причин (`ReasonCode`, состав без изменений), 14.6 Подсказки (easy), 14. Challenge: эталон, оценка качества, WAIT, лимиты

### Community 150 - "elliott/index.ts"
Cohesion: 0.10
Nodes (37): 15.1 Формат и процесс, 15.2 Участки, 15.3 Покрытие, 15. Golden-участки, CandidateParams, EW_N_POINT, EW_TOLERANCE_CANDLES, userDirection() (+29 more)

### Community 151 - "patterns.ts"
Cohesion: 0.23
Nodes (17): 9.1 Состав (ответ на OQ-11), 9.3 Выход, 9.4 Проверенные примеры (BTCUSDT 4h 2026-09, GS-5), 9. Свечные модели Price Action (`detectPatterns`), body(), bodyBottom(), bodyTop(), detectPatterns() (+9 more)

### Community 152 - "6. Внешние API Binance"
Cohesion: 0.33
Nodes (6): status(), 6.1 REST: `GET https://fapi.binance.com/fapi/v1/klines` (браузер), 6.2 WebSocket: kline stream (браузер), 6.3 Архив data.binance.vision (сервер), 6. Внешние API Binance, t()

### Community 153 - "sessionStore.ts"
Cohesion: 0.29
Nodes (9): defaultLevels(), roundToTick(), atrOf(), createSessionStore(), INITIAL, Phase, SessionStore, Speed (+1 more)

### Community 154 - "ref_node_crypto"
Cohesion: 0.32
Nodes (3): dynamic, GET(), safeEqual()

### Community 155 - "FIBONACCI — спецификация модуля Fibonacci Playground (v1.1) для `@tl/core`"
Cohesion: 0.08
Nodes (24): 10. Навыки и прогресс, 11.1 Общие блоки, 11.2 Что понято верно (`OkCode`, новые), 11.3 Ошибки (части 3–6), 11. Коды и шаблоны разбора (источник `src/i18n/ru/feedback`), 15. Спорные места и вопросы оркестратору, 2.1 Retracement, 2.2 Extension (Trend-Based Fib Extension A–B–C) (+16 more)

### Community 156 - "playwright.config.ts"
Cohesion: 0.50
Nodes (3): INTRO_DISMISSED, INTRO_KEYS, PORT

### Community 157 - "ref_vitest"
Cohesion: 0.14
Nodes (7): dynamic, GET(), CONTEXT_FIELD_IDS, CONTEXT_HTF, ContextFieldId, viewForField(), ALGO_VERSION

### Community 158 - "CourseSection.tsx"
Cohesion: 0.36
Nodes (7): ComboRow(), CourseLists(), remainText(), StageRow(), COMBO_TEXT, learnCourse, STAGE_TEXT

### Community 159 - "Команда агентов — Trading Lab"
Cohesion: 0.25
Nodes (7): 1. Сводка, 3. Правила оркестрации, 4. Формат отчёта агента (до 15 строк), 5. Шаблон задания агенту, 6. Уроки оркестрации, Команда агентов — Trading Lab, Правило graphify (включается в каждый промпт агента, исследующего код)

### Community 161 - "7. User Flows"
Cohesion: 0.25
Nodes (8): 7.1 Первый вход, 7.2 Сессия Market Structure (режим «Разметка»), 7.3 Trading Challenge: от выбора до разбора, 7.4 Price Action «Контекст», 7.5 Терминал с проверкой разметки, 7.6 Просмотр «Слабых мест», 7.7 Продолжение на другом устройстве, 7. User Flows

### Community 162 - "TaskTimeframe"
Cohesion: 0.15
Nodes (24): AnswerInput, ChallengeAnswerBody, SessionState, ChallengeDetailDto, ChallengeGradeResult, ChallengeOutcomeDto, ChallengePayload, ChallengeTaskEnvelope (+16 more)

### Community 163 - "«Спросить ИИ» (MiniMax)"
Cohesion: 0.29
Nodes (6): Источник (официальная документация MiniMax, прочитана 2026-11-07), Как подключить (с телефона), Как проверить, что модель настоящая, Приватность, «Спросить ИИ» (MiniMax), Стоимость (ориентир)

### Community 164 - "feedback/placeholders.test.ts"
Cohesion: 0.08
Nodes (27): attempt(), 5. Дефекты, 17.1 Структура и ключи, 17.2 Верность и общие принципы, 17.3 Что понято верно (`OkCode`; новые помечены *), 17.4 Ошибки (части 3–6), 17. Шаблоны разбора (источник `src/i18n/ru/feedback`), check() (+19 more)

### Community 165 - "2. `detectSwings` — фрактальные swing"
Cohesion: 0.33
Nodes (6): 2.1 Сигнатура, 2.2 Определение, 2.3 Граничные случаи, 2.4 Кандидаты у правого края (`pendingSwings`), 2.5 Псевдокод, 2. `detectSwings` — фрактальные swing

### Community 166 - "11. Контекст для PA «Контекст»"
Cohesion: 0.29
Nodes (7): 11.1 Формат ответа (ответ на OQ-16), 11.2 Задание, 11.3 Факторы (детерминированно, для бычьей модели; медвежья — зеркально), 11.4 Значимость (решение), 11.5 Оценка, 11.6 Генерация, 11. Контекст для PA «Контекст»

### Community 167 - "fibonacci/reveal.ts"
Cohesion: 0.22
Nodes (14): storableCurGrade(), storableElliott(), block(), Params, plainVerdict(), revealErrors(), revealFeedback(), shiftTimeParams() (+6 more)

### Community 168 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, start, test, typecheck

### Community 169 - "3. `findImpulses` — импульс для задания и эталон сетки"
Cohesion: 0.20
Nodes (10): 6.1 Определение (решение), 6.2 Несколько уровней за одну свечу, 6.4 Сигнатура, 6. Liquidity sweep, 3.1 Определение (решение), 3.2 Сигнатура, 3.3 Псевдокод, 3.5 Статистика (обоснование порогов) (+2 more)

### Community 170 - "3. Внутренние HTTP API"
Cohesion: 0.33
Nodes (6): 3.1 `GET /api/health`, 3.2 `GET /api/history`, 3.3 `POST /api/tasks/{module}/next`, 3.4 `POST /api/tasks/{module}/grade`, 3.5 Токен задания (`taskToken`), 3. Внутренние HTTP API

### Community 171 - "12. Коды и шаблоны разбора (источник `src/i18n/ru/feedback`)"
Cohesion: 0.40
Nodes (5): 12.1 Общие блоки, 12.2 Что понято верно (`OkCode`, новые помечены *), 12.3 Ошибки (части 3–6), 12.4 Словари текстовых параметров, 12. Коды и шаблоны разбора (источник `src/i18n/ru/feedback`)

### Community 172 - "14. Коды и шаблоны разбора (источник `src/i18n/ru/feedback`)"
Cohesion: 0.40
Nodes (5): 14.1 Общие блоки, 14.2 Что понято верно (`OkCode`, новые), 14.3 Ошибки (части 3–6), 14.4 Словари текстовых параметров, 14. Коды и шаблоны разбора (источник `src/i18n/ru/feedback`)

### Community 173 - "tf.ts"
Cohesion: 0.50
Nodes (3): isTaskTf(), TASK_TFS, TF_LABEL

### Community 174 - "PatternType"
Cohesion: 0.83
Nodes (3): FindPatternPick, PatternInstance, PatternType

## Knowledge Gaps
- **15 isolated node(s):** `ADR-0008`, `ADR-0007`, `ADR-0005`, `ADR-0005`, `ADR-0006` (+10 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1434 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Candle` connect `UtcMs` to `market-structure.ts`, `elliott.test.ts`, `handlers.ts`, `elliott/check.ts`, `handlers.test.ts`, `curriculum/swings.ts`, `server/elliott.ts`, `curriculum.test.ts`, `markers.ts`, `ew.controller.test.ts`, `UtcMs`, `elliott/index.ts`, `patterns.ts`, `6. Внешние API Binance`, `elliott/check.ts`, `elliott/placeholders.test.ts`, `impulses.ts`, `TaskTimeframe`, `src/types.ts`, `DrawingController`, `rules.ts`, `GradeError`, `TradingChart.tsx`, `fib/index.ts`, `elliott/ref.ts`, `Timeframe`, `context.ts`, `MarkSession.tsx`, `tasks.ts`, `live.ts`, `fib/index.ts`, `elliott.helpers.ts`, `useMarketData.ts`, `archive.ts`, `TradeBodies.tsx`, `CountdownBadge.tsx`, `fib/generate.ts`, `cur.ts`, `session/types.ts`, `combo.ts`, `runCheck.ts`, `fib/grade.test.ts`, `limit-trade.ts`, `src/normalize.ts`, `golden.pa-challenge.test.ts`, `fib.controller.test.ts`, `core/src/index.ts`, `pa/index.ts`, `fib/types.ts`, `criteria.ts`, `Mark`, `sessionStore.test.ts`, `ElliottBody.tsx`?**
  _High betweenness centrality (0.121) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Mark` (e.g. with `Контекст` and `Последствия`) actually correct?**
  _`Mark` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0008`, `ADR-0007`, `ADR-0005` to the rest of the system?**
  _15 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `market-structure.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09024390243902439 - nodes in this community are weakly interconnected._
- **Why does `Mark` connect `session/types.ts` to `elliott.test.ts`, `handlers.ts`, `SupabaseRepository`, `terminal.helpers.ts`, `elliott/check.ts`, `handlers.test.ts`, `serialize.ts`, `curriculum/swings.ts`, `UtcMs`, `server/elliott.ts`, `curriculum.test.ts`, `react`, `1. Общие соглашения`, `ew.controller.test.ts`, `hints.ts`, `UtcMs`, `elliott/index.ts`, `parts.test.ts`, `DECISIONS/README.md`, `elliott/placeholders.test.ts`, `TaskTimeframe`, `feedback/placeholders.test.ts`, `src/types.ts`, `DrawingController`, `rules.ts`, `GradeError`, `TradingChart.tsx`, `fib/index.ts`, `elliott/ref.ts`, `context.ts`, `grading/grade.ts`, `MarkSession.tsx`, `tasks.ts`, `importLocal.ts`, `fib/index.ts`, `layout.ts`, `TradeBodies.tsx`, `fib/generate.ts`, `cur.ts`, `combo.ts`, `runCheck.ts`, `TerminalScreen.tsx`, `fib/grade.test.ts`, `model.ts`, `ref_vitest`, `fib.controller.test.ts`, `core/src/index.ts`, `fib/types.ts`, `Mark`, `ElliottBody.tsx`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `UtcMs` (e.g. with `1. Общие соглашения` and `4.1 Шкала задания`) actually correct?**
  _`UtcMs` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `terminal.helpers.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10730804810360776 - nodes in this community are weakly interconnected._