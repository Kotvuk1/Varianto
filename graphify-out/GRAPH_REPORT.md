# Graph Report - Varianto  (2026-11-07)

## Corpus Check
- 568 files · ~360,078 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 49 file(s) not represented in the graph (top: .csv 43, (none) 4, .example 1)

## Summary
- 4164 nodes · 12788 edges · 161 communities (151 shown, 10 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 450 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3e84720e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- market-structure.ts
- SupabaseRepository
- terminal.helpers.ts
- API Contracts — Trading Lab
- curriculum/generate.ts
- with
- Architecture — Trading Lab
- FibBody.tsx
- progressLogic.ts
- market-data/package.json
- UtcMs
- tasks.ts
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
- parts.test.ts
- market-data-engineer.md
- qa-engineer.md
- technical-analyst.md
- uiux-designer.md
- DECISIONS/README.md
- elliott/check.ts
- golden.ew.test.ts
- toolCatalog.tsx
- fetch-fixtures.mjs
- enumerate.ts
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
- PaFindBody.tsx
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
- elliott/index.ts
- sources.ts
- smc/marks.ts
- grading/grade.ts
- MarkSession.tsx
- Side
- TIMEFRAME_MS
- README.md
- importLocal.ts
- Repository
- gradeFibGrid
- history/route.ts
- fib/types.ts
- localDay
- elliott.helpers.ts
- layout.ts
- useMarketData.ts
- archive.ts
- screens.test.tsx
- rubric.ts
- Roadmap — Trading Lab
- core/src/index.ts
- fib/generate.ts
- curriculum/swings.ts
- PRD — Trading Lab
- TaskSession.tsx
- ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`
- progressData.ts
- combo.ts
- ref
- runCheck.ts
- TerminalScreen.tsx
- package.json
- fib/grade.test.ts
- CURRICULUM_STAGES — курс из ступеней: спецификация ступеней 1–4, комбинированных модулей, прогресса и открытия
- terminal.fib.spec.ts
- web/AGENTS.md
- serialize.ts
- model.ts
- src/feedback/index.ts
- AUDIT — финальный дизайн-аудит Trading Lab (M8-UI)
- sessionStore.ts
- Стратегия тестирования — Trading Lab
- features/feedback/index.ts
- fib.helpers.ts
- ref_vitest
- golden.pa-challenge.test.ts
- levels-grade.ts
- ErrorCode
- fib.controller.test.ts
- react
- Команда агентов — Trading Lab
- pa/index.ts
- Query
- storage/index.ts
- @playwright/test
- challenge.helpers.ts
- resolveTrade
- 6. Задание «Где реакция?» (`fib-reaction`)
- criteria.ts
- sliceAt
- fib/generate.test.ts
- Mark
- 7. User Flows
- ProgressScreen.tsx
- QA Report — финальная приёмка MVP Trading Lab (M8)
- ok
- InstructionBar.tsx
- fixtures
- elliott.test.ts
- fib.test.ts
- AuthProvider.tsx
- 4. Функциональные требования
- Подключение Supabase и Vercel (с телефона)
- limit-trade.ts
- rankStrength
- high
- vercel.json
- ELLIOTT — спецификация модуля Elliott Wave Lab (v1.2) для `@tl/core`
- terminal.countdown.spec.ts
- 12. `gradeMarks` — сравнение разметки
- scripts
- ADR-0005: Stateless-задания с подписанными токенами; будущее только на сервере
- golden.ew.test.ts
- ADR-0008: Local-first хранилище за интерфейсом Repository; Supabase в M7
- 11. Контекст для PA «Контекст»
- 9. Генерация заданий
- Trading Lab
- frontend-developer.md
- elliott/index.ts
- patterns.ts
- 6. Внешние API Binance
- ADR-0001: Next.js 16 + TypeScript strict, pnpm monorepo, Vercel
- 5. Потоки данных
- FIBONACCI — спецификация модуля Fibonacci Playground (v1.1) для `@tl/core`
- playwright.config.ts
- 3. Область продукта
- CURRICULUM.md
- TaskTimeframe
- fibonacci/reveal.ts

## God Nodes (most connected - your core abstractions)
1. `Candle` - 180 edges
2. `Mark` - 135 edges
3. `UtcMs` - 133 edges
4. `TaskTimeframe` - 88 edges
5. `react` - 86 edges
6. `analyzeStructure()` - 60 edges
7. `cn()` - 49 edges
8. `Difficulty` - 47 edges
9. `Button()` - 46 edges
10. `atr14()` - 46 edges

## Surprising Connections (you probably didn't know these)
- `1. HIGH: open redirect в /auth/callback (исправлено)` --references--> `safeNextPath()`  [INFERRED]
  docs/SECURITY_REVIEW.md → apps/web/src/auth/config.ts
- `3.1 Определение (решение)` --references--> `low()`  [INFERRED]
  docs/specs/FIBONACCI.md → apps/web/src/chart/interaction/ew.controller.test.ts
- `P2` --references--> `GradeLegend()`  [INFERRED]
  docs/design/AUDIT.md → apps/web/src/features/feedback/GradeLegend.tsx
- `P1` --references--> `fmtPrice()`  [INFERRED]
  docs/design/AUDIT.md → apps/web/src/features/progress/ErrorLog.tsx
- `15. UI-структура раздела «Обучение» (запрос к Frontend/Designer)` --references--> `SessionLayout()`  [INFERRED]
  docs/specs/CURRICULUM_STAGES.md → apps/web/src/features/session/SessionLayout.tsx

## Import Cycles
- 2-file cycle: `packages/core/src/candles/aggregate.ts -> packages/core/src/index.ts -> packages/core/src/candles/aggregate.ts`

## Communities (161 total, 10 thin omitted)

### Community 0 - "market-structure.ts"
Cohesion: 0.09
Nodes (43): 2.2 `sw-mark` «Разметь свинги» (переиспользование `selectMsMarkTask` + `gradeMarks`), atrAt(), buildMsQuestion(), Candidate, checkMsWindow(), drawCandidate(), generateMsQuestion(), gradeMsQuestion() (+35 more)

### Community 2 - "terminal.helpers.ts"
Cohesion: 0.15
Nodes (24): Box, candlePoint(), chartCandles(), coreLevels(), coreMarks(), drawAlgoMark(), drawTwoPoint(), findVisibleBos() (+16 more)

### Community 3 - "API Contracts — Trading Lab"
Cohesion: 0.10
Nodes (20): 1.1 Формат ошибки, 1.2 Заголовки кэша, 1. Общие соглашения, 2.2 Расширения контрактов (предложение — фиксируются при реализации в `@tl/core`), 2. Типы `@tl/core`, используемые в контрактах, 3.1 `GET /api/health`, 3.2 `GET /api/history`, 3.3 `POST /api/tasks/{module}/next` (+12 more)

### Community 4 - "curriculum/generate.ts"
Cohesion: 0.13
Nodes (37): 17. Тест-план для реализации (TDD, `packages/core/src/curriculum/`), 3.6 `lv-reaction` «Какой уровень сработает» (проигрывание), smcContext(), CUR_TFS, CurTaskGroup, depthOfTf(), Draw, draw() (+29 more)

### Community 5 - "with"
Cohesion: 0.08
Nodes (26): runs-on, steps, GITHUB_TOKEN, jobs, check, secrets-scan, name, on (+18 more)

### Community 6 - "Architecture — Trading Lab"
Cohesion: 0.14
Nodes (14): 10. Развёртывание, 11. Риски, 1. Ключевые ограничения, определяющие архитектуру, 2. Обзор, 3. Репозиторий (pnpm monorepo), 4.1 Синхронизация таймфреймов, 4.2 Разметка (общая модель для пользователя и алгоритма), 4.3 Алгоритмы (детерминированные, версионируемые) (+6 more)

### Community 7 - "FibBody.tsx"
Cohesion: 0.11
Nodes (25): ANCHORS, fibExtensionAnswer(), fibGridAnswer(), FibKind, fibReactionAnswer(), keepLastFib(), optionFromLevel(), optionRatio() (+17 more)

### Community 8 - "progressLogic.ts"
Cohesion: 0.08
Nodes (51): ContinueBlock(), HomeWeakSpots(), ModuleAccuracy(), asCore(), canTrain(), ErrorGroup, groupByModule(), hasEnoughData() (+43 more)

### Community 9 - "market-data/package.json"
Cohesion: 0.11
Nodes (20): dependencies, fflate@^0.8.3, @tl/core@workspace:*, devDependencies, vitest@^4.1.12, @vitest/coverage-v8@^4.1.12, exports, ./archive (+12 more)

### Community 10 - "UtcMs"
Cohesion: 0.13
Nodes (17): ErrorExample, DailyActivityRow, SkillStatRow, TerminalMarksRow, TradingLabDB, defaultSettings(), LocalRepository, LocalSnapshot (+9 more)

### Community 11 - "tasks.ts"
Cohesion: 0.07
Nodes (70): archiveMonths(), buildElliott(), catalogCache, ElliottParams, ElliottParamsSchema, EW_MAX_SEGMENTS, EwReq, gradeElliottTask() (+62 more)

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
Cohesion: 0.08
Nodes (42): Page(), LearnScreen(), MODULES, ResultSheet(), MarksSheet(), MarksSheetProps, ru, Badge() (+34 more)

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
Nodes (57): age(), CHALLENGE_STRUCTURE, ChallengeFacts, computeChallengeFacts(), FactsInput, HTF, intersects(), lastEventSince() (+49 more)

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
Cohesion: 0.06
Nodes (28): distToRectEdge(), distToSegment(), Hit, hitLevel(), hitTest(), partScore(), synthetic_proj, T0 (+20 more)

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
Cohesion: 0.08
Nodes (19): ADR-0003: Живые данные грузит браузер напрямую (REST + WS), fallback — REST-polling, Контекст, Последствия, Рассмотренные альтернативы, Решение, ADR-0004: История для заданий — сервер читает архив data.binance.vision, Контекст, Последствия (+11 more)

### Community 29 - "elliott/check.ts"
Cohesion: 0.14
Nodes (30): atrCache, checkCount(), EwCheck, EwCheckInput, GUIDE_SKILL(), snapIndex(), swingCache, swingFlags() (+22 more)

### Community 30 - "golden.ew.test.ts"
Cohesion: 0.07
Nodes (38): btc4, run(), sol, SOL_IMP, scan(), NormSeries, ALL_ALT, btc3 (+30 more)

### Community 31 - "toolCatalog.tsx"
Cohesion: 0.13
Nodes (13): GroupId, groupOf(), HOTKEY_OF, ic, svgProps, TerminalTool, ToolGroup, Cell() (+5 more)

### Community 32 - "fetch-fixtures.mjs"
Cohesion: 0.07
Nodes (29): dynamic, GET(), safeEqual(), ChallengeAttemptStat, challengeStats(), dailyProgress(), DayMap, DayRecord (+21 more)

### Community 33 - "enumerate.ts"
Cohesion: 0.12
Nodes (31): 7.1 `enumerateCounts` — все допустимые разметки до текущей точки, 7.2 `findWaveCandidates` — участки для easy/medium, 7. Детекторы, CandidateParams, findWaveCandidates(), EASY, MEDIUM, zigzagPivots() (+23 more)

### Community 34 - "token.ts"
Cohesion: 0.07
Nodes (37): ConfigError, CH, challengeDeps(), grade(), Json, loader, mkDeps(), MS_MARK (+29 more)

### Community 35 - "session/types.ts"
Cohesion: 0.06
Nodes (56): Page(), Page(), Page(), Page(), Page(), Page(), ElliottSessionScreen(), ElliottSetup() (+48 more)

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
Nodes (54): 2.1 Из `ARCHITECTURE.md` §4 (дословно), Решение, 1.2 Переиспользуемые соглашения (без изменений), 1.2 Переиспользуемые соглашения (без изменений), 3.4 Граничные случаи (проверены на реальных свечах), golden/ - эталонные участки SMC (ALGORITHMS §18), levelHints(), Pivot (+46 more)

### Community 45 - "PaFindBody.tsx"
Cohesion: 0.10
Nodes (36): Page(), MsMarkBody(), highlightMarks(), MsQuestionBody(), MsSessionScreen(), PaFindBody(), ContextFactors, countsFromGrade() (+28 more)

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
Cohesion: 0.07
Nodes (35): dependencies, dexie@^4.0.0, lightweight-charts@~5.2.1, lucide-react@^1.66.0, next@^16.0.0, react@^19.0.0, react-dom@^19.0.0, @tl/core@workspace:* (+27 more)

### Community 52 - "DrawingController"
Cohesion: 0.06
Nodes (45): constrainAnchors(), createMark(), DrawKind, drawKindOf(), FULL_WIDTH_KINDS, isDrawTool(), isScopedKind(), RAY_RIGHT_KINDS (+37 more)

### Community 53 - "rules.ts"
Cohesion: 0.08
Nodes (51): SWING_SIDE, EW_CORRECTION_LABELS, EW_IMPULSE_LABELS, EW_IMPULSE_SIZES, EW_INVALIDATION_ROLE, EW_KINDS, ewDirection(), EwKind (+43 more)

### Community 54 - "PaContextBody.tsx"
Cohesion: 0.12
Nodes (28): dismissIntro(), isIntroDismissed(), key(), TaskIntro(), TaskIntroProps, Host(), Annotated(), byAlias (+20 more)

### Community 55 - "schemas.ts"
Cohesion: 0.06
Nodes (30): ValidationIssue, AnchorSchema, AnswerSchema, BUSINESS_CODES, ChallengeAnswer, ChallengeAnswerSchema, difficulty, ElliottAnswerSchema (+22 more)

### Community 56 - "GradeError"
Cohesion: 0.21
Nodes (22): Core, 17.1 Структура и ключи, 17.2 Верность и общие принципы, 17.3 Что понято верно (`OkCode`; новые помечены *), 17.4 Ошибки (части 3–6), 17. Шаблоны разбора (источник `src/i18n/ru/feedback`), ChallengeGrade, ZonePart (+14 more)

### Community 57 - "TradingChart.tsx"
Cohesion: 0.05
Nodes (51): DrawingPrimitive, PointerKind, lwcProjection(), RenderStyle, snapAnchor(), SnapOptions, snapPriceToCandle(), synthetic_candles (+43 more)

### Community 58 - "fib/index.ts"
Cohesion: 0.09
Nodes (49): ReactionFormProps, bandOf(), ConfluenceCtx, FIB_CONFLUENCE_KEYS, FIB_LEVEL_LOOKBACK, FibConfluence, overlaps(), PriceBand (+41 more)

### Community 59 - "feedback/placeholders.test.ts"
Cohesion: 0.10
Nodes (25): attempt(), 5. Дефекты, block(), buildFeedback(), glyphOf(), matchedOf(), OK_BY_SKILL, normalizeParams() (+17 more)

### Community 60 - "elliott/index.ts"
Cohesion: 0.17
Nodes (31): atrOf(), EW_N_POINT, EW_TOLERANCE_CANDLES, EW_MAX_COUNTS, contiguousRuns(), ewCatalog(), EwCatalogEntry, ewMakeTask() (+23 more)

### Community 61 - "sources.ts"
Cohesion: 0.12
Nodes (21): ARCHIVE_START, ArchiveLoaderOptions, CHALLENGE_FUTURE_MS, ChallengeZone, Chunk, countClosedBefore(), DAY_MS, depthOf() (+13 more)

### Community 62 - "smc/marks.ts"
Cohesion: 0.12
Nodes (24): algoOf(), ALL, candles, findAlgo(), P, r, window, allLayerSwings() (+16 more)

### Community 63 - "grading/grade.ts"
Cohesion: 0.25
Nodes (12): Entry, gradeMarks(), Group, groupEvaluated(), groupOf(), iou(), MAJOR, patternSkill() (+4 more)

### Community 64 - "MarkSession.tsx"
Cohesion: 0.08
Nodes (66): decimalsForTick(), makePriceFormatter(), TICK_TABLE, tickSizeFor(), fmtOf(), ReplayBar(), RelativeAxis(), formatScenarioDate() (+58 more)

### Community 65 - "Side"
Cohesion: 0.13
Nodes (17): Side, ComboLevelGrade, PlanInput, SmcContext, ComboSmcPick, StopTakePick, ZoneClassCode, LimitEntryInput (+9 more)

### Community 66 - "TIMEFRAME_MS"
Cohesion: 0.05
Nodes (49): dynamic, GET(), Frontend Developer, TIMEFRAME_MS, ALGO_VERSION, load(), klinesZip(), NOW (+41 more)

### Community 67 - "README.md"
Cohesion: 0.20
Nodes (3): Known Issues — Trading Lab, Не проверено вообще (среда), Открыто

### Community 68 - "importLocal.ts"
Cohesion: 0.23
Nodes (21): chunks(), IMPORTED_USER_META, ImportOutcome, importSnapshot(), must(), recomputeDerived(), Row, runFirstSignInImport() (+13 more)

### Community 69 - "Repository"
Cohesion: 0.08
Nodes (17): Repository, graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила, 2. Карточки (+9 more)

### Community 70 - "gradeFibGrid"
Cohesion: 0.18
Nodes (16): 13. Тест-план для реализации (TDD, `packages/core/src/fib/`), anchorIndex(), checkPoint(), evaluateExtensionPoints(), f3(), gradeFibExtension(), gradeFibGrid(), gradeFibReaction() (+8 more)

### Community 71 - "history/route.ts"
Cohesion: 0.05
Nodes (50): ARCHIVE_START_MS, dynamic, errorResponse(), GET(), ISSUE_CODES, querySchema, runtime, SYMBOLS (+42 more)

### Community 72 - "fib/types.ts"
Cohesion: 0.11
Nodes (27): 12.1 Формат и процесс, 12.2 Участки, 12.3 Покрытие граничных случаев golden-участками, 12. Golden-участки, checkFibMarks(), dirOf(), emptyDetail(), FIB_TERMINAL_MAX_DISTANCE (+19 more)

### Community 73 - "localDay"
Cohesion: 0.11
Nodes (17): ImportReport, 1. Принципы, 2. Локальная схема: IndexedDB (Dexie), 3.1 RLS, 3. Схема Supabase Postgres (M7), 4.1 Порядок, 4.2 Правила по таблицам (идемпотентность по `id`, конфликты по `updated_at`), 4.3 Пересчёт производных данных (+9 more)

### Community 74 - "elliott.helpers.ts"
Cohesion: 0.18
Nodes (18): bodyText(), closePanel(), countsFor(), DATE_LEAK, drawCount(), EW_STORAGE, EwEnvelope, openEw() (+10 more)

### Community 75 - "layout.ts"
Cohesion: 0.09
Nodes (37): geos(), buildGeometry(), formatPrice, GeometryOptions, GLYPH_OFFSET, GlyphKind, Handle, keepTextsInside() (+29 more)

### Community 76 - "useMarketData.ts"
Cohesion: 0.11
Nodes (18): ClockOffsetEstimator, ClockSync, eventTimeOf(), sniffingFetch(), sniffingWebSocket(), archiveWindow(), HISTORY_PAGE, appendCandle() (+10 more)

### Community 77 - "archive.ts"
Cohesion: 0.08
Nodes (32): ReplayMarkersInput, Segment, FIX, FixtureLoader, fixtures, flaky(), NOW, post() (+24 more)

### Community 78 - "screens.test.tsx"
Cohesion: 0.45
Nodes (8): AppShell(), BottomTabs(), DesktopTabs(), ICONS, activeNav(), isChartRoute(), NAV_ITEMS, NavId

### Community 79 - "rubric.ts"
Cohesion: 0.10
Nodes (31): ComboAnswer, fillExcursions(), findFill(), gradeLimitEntry(), LIMIT_TYPE_TEXT_RU, LimitFillInfo, LimitOrder, limitReaction() (+23 more)

### Community 80 - "Roadmap — Trading Lab"
Cohesion: 0.29
Nodes (6): MVP, Roadmap — Trading Lab, v1.1 — Fibonacci Playground и Premium/Discount, v1.2 — Elliott Wave Lab, v2, Правила корректировки

### Community 81 - "core/src/index.ts"
Cohesion: 0.11
Nodes (17): CandleCountdown, formatCountdown(), pad2(), remainingMs(), CountdownBadge(), CountdownBadgeProps, View, cs (+9 more)

### Community 82 - "fib/generate.ts"
Cohesion: 0.12
Nodes (23): ExtensionOutcome, Ctx, desiredClass(), EXT_TARGETS, extremesOk(), FIB_IMPULSE_RULES, FIB_NEXT, fibReactionTask() (+15 more)

### Community 83 - "curriculum/swings.ts"
Cohesion: 0.14
Nodes (17): 19. Спорные места и вопросы оркестратору, 2.3 `sw-trend` «Какой тренд по свингам?», inWindow(), selectSwTrendTask(), SW_MARK_TFS, SW_TREND_OPTIONS, SW_TREND_TFS, SW_TREND_WINDOW (+9 more)

### Community 84 - "PRD — Trading Lab"
Cohesion: 0.12
Nodes (16): 10. Приоритизация функций (MoSCoW), 11. План MVP, 12. Открытые вопросы, 1.1 Что это, 1.2 Цель, 1.3 Целевой пользователь, 1.4 Модули, 1. Обзор и цель продукта (+8 more)

### Community 85 - "TaskSession.tsx"
Cohesion: 0.10
Nodes (39): ResultExtraProps, AnswerSessionProps, createTaskApi(), kindOf(), post(), TaskApi, buildAttempt(), BuildAttemptInput (+31 more)

### Community 86 - "ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`"
Cohesion: 0.08
Nodes (24): 14.1 Факты на момент T (`ChallengeFacts`), 14.2 Эталонная сторона `refSide`, 14.3 Оценка качества 0–100 (ответ на OQ-08), независимо от исхода, 14.4 Правильность, вердикт, лимиты, 14.5 Предикаты причин (`ReasonCode`, состав без изменений), 14.6 Подсказки (easy), 14. Challenge: эталон, оценка качества, WAIT, лимиты, 16.1 Навыки (+16 more)

### Community 87 - "progressData.ts"
Cohesion: 0.21
Nodes (12): DayStat, prevDay(), softStreak(), done, AsyncState, DailyProgress, useAttempts(), useDailyProgress() (+4 more)

### Community 88 - "combo.ts"
Cohesion: 0.10
Nodes (38): ResolvedTrade, ComboPlay, ComboScore, ComboSmcGrade, gradeComboLevel(), gradeComboSmc(), iouInterval(), KIND_TEXT_RU (+30 more)

### Community 89 - "ref"
Cohesion: 0.12
Nodes (18): 13.1 Общие правила, 13.2 Market Structure «Разметка» (поправка v1.1, `ALGO_VERSION 1.1.0`), 13.3 Market Structure «Вопрос», 13.4 Price Action, 13.5 Challenge, 13. Генерация заданий, 5.1 Общие правила, 5.2 Внешний слой — машина состояний с защищёнными уровнями (+10 more)

### Community 90 - "runCheck.ts"
Cohesion: 0.18
Nodes (13): CheckPanelProps, CheckOutcome, CheckResult, CheckState, CONCEPT_OF, conceptsFor(), RANGE_TAIL_CANDLES, runCheck() (+5 more)

### Community 91 - "TerminalScreen.tsx"
Cohesion: 0.18
Nodes (20): TerminalPage(), ARCHIVE_MIN_AGE_MS, ARCHIVE_SYMBOLS, archiveAllowed(), archiveHref(), archivePageSize(), normalizeSymbolInput(), offerArchive() (+12 more)

### Community 92 - "package.json"
Cohesion: 0.08
Nodes (31): devDependencies, eslint@^9.39.0, eslint-config-next@^16.0.0, @eslint/js@^9.39.0, @playwright/test@1.63.0, prettier@^3.6.0, @types/node@^22.0.0, typescript@~5.9.3 (+23 more)

### Community 93 - "fib/grade.test.ts"
Cohesion: 0.09
Nodes (30): 4.1 Шкала задания, imp(), C, pt(), series(), upTo(), FG1, FG3 (+22 more)

### Community 94 - "CURRICULUM_STAGES — курс из ступеней: спецификация ступеней 1–4, комбинированных модулей, прогресса и открытия"
Cohesion: 0.04
Nodes (44): 11.1 Маршруты и типы, 11.2 Payload (`TaskPayload`), 11.3 Answer, 11.4 GradeResult, 11. API (расширение `API_CONTRACTS.md`), 12.1 Общие блоки, 12.2 Что понято верно (`OkCode`, новые помечены *), 12.3 Ошибки (части 3–6) (+36 more)

### Community 95 - "terminal.fib.spec.ts"
Cohesion: 0.19
Nodes (10): alternating(), isPivot(), P, Pt, Fib, findFib(), openFibTool(), pivot() (+2 more)

### Community 97 - "serialize.ts"
Cohesion: 0.24
Nodes (9): anchor, KINDS, MARKS_FORMAT_VERSION, markSchema, parseMarks(), serializeMarks(), m, validateMarks() (+1 more)

### Community 98 - "model.ts"
Cohesion: 0.15
Nodes (27): hit(), LabelItem, layoutLabels(), extensionLevels(), FIB_KINDS, FibKind, FibLevel, labelPriority() (+19 more)

### Community 99 - "src/feedback/index.ts"
Cohesion: 0.06
Nodes (63): okFromOutcomes(), decimalsOf(), DIRECTION_RU, displayValue(), formatFeedbackParams(), PARAM_KINDS, ParamFormatters, ParamKind (+55 more)

### Community 100 - "AUDIT — финальный дизайн-аудит Trading Lab (M8-UI)"
Cohesion: 0.18
Nodes (10): 1. Итог, 2. Находки, 3. Impeccable detect (по URL production-сборки), 4. Что проверено и ограничения, 5. Порядок исправления, AUDIT — финальный дизайн-аудит Trading Lab (M8-UI), P0, P1 (+2 more)

### Community 101 - "sessionStore.ts"
Cohesion: 0.06
Nodes (52): ChallengeSessionPage(), ChallengeApiError, fetchNext(), gradeChallenge(), post(), buildAttempt(), AxisTick, axisTicks() (+44 more)

### Community 102 - "Стратегия тестирования — Trading Lab"
Cohesion: 0.12
Nodes (16): 10. Производительность, 1. Принципы, 2. Пирамида, 3. Фикстуры, 4.3 Нормализация (`market-data`), 4.4 Golden-тесты SMC/PA, 4.5 `resolveTrade`, 4.6 Интеграционные тесты API (+8 more)

### Community 103 - "features/feedback/index.ts"
Cohesion: 0.14
Nodes (27): errors, feedback, defaultFmt, FeedbackView(), FeedbackViewProps, Section(), DIR, formatParam() (+19 more)

### Community 104 - "fib.helpers.ts"
Cohesion: 0.27
Nodes (11): bodyText(), DATE_LEAK, drawFib(), FIB_STORAGE, fibPoints(), openFib(), PORT, Pt (+3 more)

### Community 105 - "ref_vitest"
Cohesion: 0.23
Nodes (7): contractAttempt(), contractMark, runRepositoryContract(), FakeSupabase, Row, UNIQUE, seedLocal()

### Community 106 - "golden.pa-challenge.test.ts"
Cohesion: 0.13
Nodes (12): c4h, FIX, all, at(), c4h, idx(), ts(), loadAggTrades() (+4 more)

### Community 107 - "levels-grade.ts"
Cohesion: 0.11
Nodes (33): ChallengeSource, ComboLevelPick, LevelsPick, LimitPick, LvReactionPick, classifyZone(), correctReactionId(), EDGE_TEXT_RU (+25 more)

### Community 108 - "ErrorCode"
Cohesion: 0.36
Nodes (9): TaskPayload, NextRequest, 18. Расхождения с документами, 17. Расхождения с документами, 14. Расхождения с документами, Penalty, MsMarkSelection, ErrorCode (+1 more)

### Community 109 - "fib.controller.test.ts"
Cohesion: 0.20
Nodes (11): A_TAP, B_TAP, C_TAP, candles, index, proj, pt(), setup() (+3 more)

### Community 110 - "react"
Cohesion: 0.08
Nodes (33): AppError(), Page(), NotFound(), csp, nextConfig, CandleHighlight, ToolId, TimeWindow (+25 more)

### Community 111 - "Команда агентов — Trading Lab"
Cohesion: 0.25
Nodes (7): 1. Сводка, 3. Правила оркестрации, 4. Формат отчёта агента (до 15 строк), 5. Шаблон задания агенту, 6. Уроки оркестрации, Команда агентов — Trading Lab, Правило graphify (включается в каждый промпт агента, исследующего код)

### Community 112 - "pa/index.ts"
Cohesion: 0.08
Nodes (63): buildPa(), reconstructContext(), 18.2 Участки, 6.3 TP: у следующего уровня/ликвидности (35 баллов), 6.5 Конфлюэнс (через SMC-движок, только данные до T), computeContext(), CONTEXT_STRUCTURE, ContextAnswer (+55 more)

### Community 114 - "storage/index.ts"
Cohesion: 0.07
Nodes (39): metadata, plexMono, plexSans, RootLayout(), viewport, Page(), AuthRepositoryProvider(), SupabaseAuthRepositoryProvider() (+31 more)

### Community 115 - "@playwright/test"
Cohesion: 0.38
Nodes (7): checkAndSeeResult(), nextThenHomeShowsDone(), openSession(), shot(), tapCandle(), solveOne(), selectTool()

### Community 116 - "challenge.helpers.ts"
Cohesion: 0.19
Nodes (11): DATE_LEAK, expandResult(), lastCandleTime(), num(), openReasons(), projectPoint(), SESSION_URL(), startSession() (+3 more)

### Community 117 - "resolveTrade"
Cohesion: 0.10
Nodes (21): ADR-0007: Правила исхода сделки Challenge (drill-down), Контекст, Открытые вопросы (закрыты: `docs/specs/ALGORITHMS.md`), Последствия, Рассмотренные альтернативы, AggTrade, done(), FutureProvider (+13 more)

### Community 118 - "6. Задание «Где реакция?» (`fib-reaction`)"
Cohesion: 0.29
Nodes (7): 6.1 Момент задания и варианты, 6.2 Генерация с балансировкой ответа (решение), 6.3 Определение реакции (решение) — `resolveReaction`, 6.4 Вопрос Premium/Discount, 6.6 Оценка, 6.7 Проигрывание, 6. Задание «Где реакция?» (`fib-reaction`)

### Community 119 - "criteria.ts"
Cohesion: 0.24
Nodes (17): body(), bottom(), dojiItems(), engulfItems(), finish(), insideItems(), Item, patternCheck() (+9 more)

### Community 120 - "sliceAt"
Cohesion: 0.48
Nodes (5): aggregate(), SeriesByTf, sliceAt(), synthetic_hour(), synthetic_m1()

### Community 121 - "fib/generate.test.ts"
Cohesion: 0.09
Nodes (20): h1, fibExtensionTask(), fibGridTask(), C, idx(), pick(), times(), FILES (+12 more)

### Community 122 - "Mark"
Cohesion: 0.06
Nodes (38): drawParts(), OpenCandleInfo, PrimitiveState, ZONE_KINDS, dimSpans(), HighlightColumn, highlightColumns(), HighlightRange (+30 more)

### Community 123 - "7. User Flows"
Cohesion: 0.25
Nodes (8): 7.1 Первый вход, 7.2 Сессия Market Structure (режим «Разметка»), 7.3 Trading Challenge: от выбора до разбора, 7.4 Price Action «Контекст», 7.5 Терминал с проверкой разметки, 7.6 Просмотр «Слабых мест», 7.7 Продолжение на другом устройстве, 7. User Flows

### Community 124 - "ProgressScreen.tsx"
Cohesion: 0.09
Nodes (46): ChallengePage(), Page(), ChallengeHome(), DIFFS, recentLine(), StartTf, Stats(), TF_OPTIONS (+38 more)

### Community 125 - "QA Report — финальная приёмка MVP Trading Lab (M8)"
Cohesion: 0.25
Nodes (7): 1. Сводка, 2. Таблица AC, 3. Ключевые инварианты, 4. Производительность (headless Chromium, software rendering, CPU throttling 4x), 6. Бэклог оркестратора, 7. Не удалось проверить, QA Report — финальная приёмка MVP Trading Lab (M8)

### Community 126 - "ok"
Cohesion: 0.14
Nodes (15): ok(), 11.1 Части, 11.2 Вердикт, 11.3 Пример (EW-1, easy, разметка 0 = 08-06 23:00 … 5 = 08-09 22:00, `abc-next`, invalidation 77.88, без альтернативы), 11.4 Исход не входит в счёт (решение), 11. Оценка (рубрика 0–100), 16. Тест-план для реализации (TDD, `packages/core/src/elliott/`), 6.1 Закрытый список (`EwScenarioId`, новое) (+7 more)

### Community 127 - "InstructionBar.tsx"
Cohesion: 0.22
Nodes (13): NoticeCode, base, base, InstructionBarProps, instructionText(), base, cx, GROUPS (+5 more)

### Community 128 - "fixtures"
Cohesion: 0.50
Nodes (3): fixtures, recorded/ - записанные форматы API (fapi/fstream недоступны из облака, 451), Архивные CSV

### Community 129 - "elliott.test.ts"
Cohesion: 0.18
Nodes (11): clearEwCatalogCache(), ewCatalogCacheSize(), easyAnswer(), grade(), Json, loader, mk(), next() (+3 more)

### Community 130 - "fib.test.ts"
Cohesion: 0.24
Nodes (9): deps(), grade(), Json, loader, next(), NOW, post(), seeds() (+1 more)

### Community 131 - "AuthProvider.tsx"
Cohesion: 0.13
Nodes (24): dynamic, GET(), dynamic, Page(), @supabase/ssr@^0.12.7, @supabase/supabase-js@^2.118.0, AuthContext, AuthState (+16 more)

### Community 132 - "4. Функциональные требования"
Cohesion: 0.17
Nodes (12): 4.10 Авторизация (FR-AUTH), 4.11 Интерфейс (FR-UI), 4.1 Данные (FR-DATA), 4.2 График (FR-CHART), 4.3 Слой разметки (FR-DRAW), 4.4 Market Structure Analyzer (FR-MS), 4.5 Trading Challenge (FR-TC), 4.6 Price Action Trainer (FR-PA) (+4 more)

### Community 133 - "Подключение Supabase и Vercel (с телефона)"
Cohesion: 0.20
Nodes (10): 1. Проект Supabase, 2. Применить миграцию (создать таблицы), 3. Ключи Supabase, 4. Вход через Google, 5. Redirect URL в Supabase, 6. Vercel, 7. Проверка на телефоне, Если что-то не работает (+2 more)

### Community 134 - "limit-trade.ts"
Cohesion: 0.33
Nodes (13): conservative(), Filled, FillMethod, long(), priceSl(), priceTp(), resolveLimitTrade(), slTouch() (+5 more)

### Community 135 - "rankStrength"
Cohesion: 0.22
Nodes (11): inside(), 10.1 Алгоритм, 10.2 Эталон для «Проведи уровень», 10. `findLevels` — уровни поддержки/сопротивления, 3.1 Зона уровня `levelZone` (решение), 3.2 Тип и сила уровня (решение), 3.3 Генерация заданий ступени 2, 3.4 `lv-strongest` «Найди сильнейший уровень» (расширение «Проведи уровень») (+3 more)

### Community 136 - "high"
Cohesion: 0.10
Nodes (26): high(), low(), Решение, 2.1 Сигнатура, 2.2 Определение, 2.3 Граничные случаи, 2.4 Кандидаты у правого края (`pendingSwings`), 2.5 Псевдокод (+18 more)

### Community 139 - "ELLIOTT — спецификация модуля Elliott Wave Lab (v1.2) для `@tl/core`"
Cohesion: 0.07
Nodes (27): 10. Проигрывание — `resolveScenario`, 12.1 Типы, 12.2 `POST /api/tasks/elliott/next`, 12.3 `POST /api/tasks/elliott/grade`, 12. Контракты API (расширение `API_CONTRACTS.md`), 13. Навыки и прогресс, 14.1 Общие блоки, 14.2 Что понято верно (`OkCode`, новые) (+19 more)

### Community 140 - "terminal.countdown.spec.ts"
Cohesion: 0.25
Nodes (4): CORS, OPEN, REST_1H, openTerminal()

### Community 141 - "12. `gradeMarks` — сравнение разметки"
Cohesion: 0.12
Nodes (17): external(), selectHints(), time(), 12.1 Сигнатура (расширение `API_CONTRACTS.md`), 12.2 Ключевая свеча метки, 12.3 Группы сопоставления, 12.4 Совместимость и стоимость пары, 12.5 Матчинг (решение: DP по времени вместо венгерского) (+9 more)

### Community 142 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, start, test, typecheck

### Community 143 - "ADR-0005: Stateless-задания с подписанными токенами; будущее только на сервере"
Cohesion: 0.33
Nodes (6): ADR-0005: Stateless-задания с подписанными токенами; будущее только на сервере, Контекст, Открытые вопросы, Последствия, Рассмотренные альтернативы, Решение

### Community 144 - "golden.ew.test.ts"
Cohesion: 0.22
Nodes (6): anchors(), Case, countOf(), files, Golden, Pt

### Community 145 - "ADR-0008: Local-first хранилище за интерфейсом Repository; Supabase в M7"
Cohesion: 0.33
Nodes (6): ADR-0008: Local-first хранилище за интерфейсом Repository; Supabase в M7, Контекст, Открытые вопросы, Последствия, Рассмотренные альтернативы, Решение

### Community 146 - "11. Контекст для PA «Контекст»"
Cohesion: 0.29
Nodes (7): 11.1 Формат ответа (ответ на OQ-16), 11.2 Задание, 11.3 Факторы (детерминированно, для бычьей модели; медвежья — зеркально), 11.4 Значимость (решение), 11.5 Оценка, 11.6 Генерация, 11. Контекст для PA «Контекст»

### Community 147 - "9. Генерация заданий"
Cohesion: 0.33
Nodes (6): 9.1 Общие правила (решение), 9.2 easy — `ew-impulse`, 9.3 medium — `ew-impulse-correction`, 9.4 hard — `ew-scenario`, 9.5 Payload и токен, 9. Генерация заданий

### Community 148 - "Trading Lab"
Cohesion: 0.33
Nodes (6): Trading Lab, Быстрый старт, Документация, Команды, Ограничения, Структура

### Community 149 - "frontend-developer.md"
Cohesion: 0.29
Nodes (6): graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 150 - "elliott/index.ts"
Cohesion: 0.09
Nodes (45): EwFormState, ScenarioPanelProps, 15.1 Формат и процесс, 15.2 Участки, 15.3 Покрытие, 15. Golden-участки, bcSupported(), corrTypeOf() (+37 more)

### Community 151 - "patterns.ts"
Cohesion: 0.11
Nodes (29): c(), 1.1 Входные свечи, 1.2 Термины свечи, 1.3 ATR, 1.4 Детерминизм и числа, 1.5 ALGO_VERSION, 1.6 Параметры по сложностям (сводка), 1. Общие соглашения (+21 more)

### Community 152 - "6. Внешние API Binance"
Cohesion: 0.40
Nodes (5): status(), 6.1 REST: `GET https://fapi.binance.com/fapi/v1/klines` (браузер), 6.2 WebSocket: kline stream (браузер), 6.3 Архив data.binance.vision (сервер), 6. Внешние API Binance

### Community 153 - "ADR-0001: Next.js 16 + TypeScript strict, pnpm monorepo, Vercel"
Cohesion: 0.33
Nodes (5): ADR-0001: Next.js 16 + TypeScript strict, pnpm monorepo, Vercel, Контекст, Последствия, Рассмотренные альтернативы, Решение

### Community 154 - "5. Потоки данных"
Cohesion: 0.40
Nodes (5): 5.1 Живые данные (терминал), 5.2 История для заданий (сервер), 5.3 Задания (stateless, без БД до M7), 5.4 Хранение (Repository), 5. Потоки данных

### Community 155 - "FIBONACCI — спецификация модуля Fibonacci Playground (v1.1) для `@tl/core`"
Cohesion: 0.08
Nodes (24): 10. Навыки и прогресс, 11.1 Общие блоки, 11.2 Что понято верно (`OkCode`, новые), 11.3 Ошибки (части 3–6), 11.4 Словари текстовых параметров, 11. Коды и шаблоны разбора (источник `src/i18n/ru/feedback`), 15. Спорные места и вопросы оркестратору, 2.1 Retracement (+16 more)

### Community 156 - "playwright.config.ts"
Cohesion: 0.50
Nodes (3): INTRO_DISMISSED, INTRO_KEYS, PORT

### Community 157 - "3. Область продукта"
Cohesion: 0.40
Nodes (5): 3.1 В MVP, 3.2 Вне MVP, 3.3 Требует исследования, 3.4 Технические риски, 3. Область продукта

### Community 162 - "TaskTimeframe"
Cohesion: 0.05
Nodes (44): ChallengeErrorKind, kindOf(), AnswerInput, ChallengeAnswerBody, defaultLevels(), roundToTick(), Side, atrOf() (+36 more)

### Community 167 - "fibonacci/reveal.ts"
Cohesion: 0.26
Nodes (10): storableElliott(), block(), Params, plainVerdict(), revealErrors(), revealFeedback(), shiftTimeParams(), storableGrade() (+2 more)

## Knowledge Gaps
- **14 isolated node(s):** `ADR-0008`, `ADR-0007`, `ADR-0005`, `ADR-0006`, `ADR-0005` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1335 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Candle` connect `archive.ts` to `market-structure.ts`, `elliott.test.ts`, `fib.test.ts`, `curriculum/generate.ts`, `limit-trade.ts`, `tasks.ts`, `golden.ew.test.ts`, `facts.ts`, `elliott/index.ts`, `parts.test.ts`, `6. Внешние API Binance`, `patterns.ts`, `elliott/check.ts`, `golden.ew.test.ts`, `enumerate.ts`, `TaskTimeframe`, `token.ts`, `src/types.ts`, `DrawingController`, `rules.ts`, `GradeError`, `TradingChart.tsx`, `fib/index.ts`, `elliott/index.ts`, `sources.ts`, `MarkSession.tsx`, `Side`, `TIMEFRAME_MS`, `fib/types.ts`, `elliott.helpers.ts`, `useMarketData.ts`, `rubric.ts`, `core/src/index.ts`, `fib/generate.ts`, `curriculum/swings.ts`, `TaskSession.tsx`, `combo.ts`, `runCheck.ts`, `fib/grade.test.ts`, `model.ts`, `src/feedback/index.ts`, `golden.pa-challenge.test.ts`, `levels-grade.ts`, `ErrorCode`, `fib.controller.test.ts`, `react`, `pa/index.ts`, `resolveTrade`, `criteria.ts`, `sliceAt`, `fib/generate.test.ts`, `Mark`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Mark` (e.g. with `Контекст` and `Последствия`) actually correct?**
  _`Mark` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0008`, `ADR-0007`, `ADR-0005` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `market-structure.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Why does `Mark` connect `Mark` to `elliott.test.ts`, `fib.test.ts`, `SupabaseRepository`, `terminal.helpers.ts`, `FibBody.tsx`, `UtcMs`, `tasks.ts`, `12. `gradeMarks` — сравнение разметки`, `ui/index.ts`, `facts.ts`, `elliott/index.ts`, `parts.test.ts`, `patterns.ts`, `elliott/check.ts`, `golden.ew.test.ts`, `enumerate.ts`, `TaskTimeframe`, `token.ts`, `src/types.ts`, `PaFindBody.tsx`, `DrawingController`, `rules.ts`, `GradeError`, `TradingChart.tsx`, `fib/index.ts`, `feedback/placeholders.test.ts`, `smc/marks.ts`, `grading/grade.ts`, `MarkSession.tsx`, `Side`, `importLocal.ts`, `Repository`, `fib/types.ts`, `layout.ts`, `rubric.ts`, `core/src/index.ts`, `fib/generate.ts`, `curriculum/swings.ts`, `TaskSession.tsx`, `combo.ts`, `runCheck.ts`, `TerminalScreen.tsx`, `fib/grade.test.ts`, `serialize.ts`, `model.ts`, `src/feedback/index.ts`, `sessionStore.ts`, `ref_vitest`, `fib.controller.test.ts`, `react`, `pa/index.ts`, `InstructionBar.tsx`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `UtcMs` (e.g. with `1. Общие соглашения` and `4.1 Шкала задания`) actually correct?**
  _`UtcMs` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `terminal.helpers.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14919354838709678 - nodes in this community are weakly interconnected._