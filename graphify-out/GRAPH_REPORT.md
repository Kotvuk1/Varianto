# Graph Report - Varianto  (2026-11-07)

## Corpus Check
- 614 files · ~390,892 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 49 file(s) not represented in the graph (top: .csv 43, (none) 4, .example 1)

## Summary
- 4397 nodes · 13797 edges · 173 communities (162 shown, 11 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 454 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a8a92485`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- market-structure.ts
- SupabaseRepository
- terminal.helpers.ts
- API Contracts — Trading Lab
- mulberry32
- with
- Architecture — Trading Lab
- fib/ref.ts
- progressLogic.ts
- market-data/package.json
- UtcMs
- server/elliott.ts
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
- service.ts
- fetch-fixtures.mjs
- impulses.ts
- token.ts
- session/params.ts
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
- ChallengeSession.tsx
- schemas.ts
- GradeError
- TradingChart.tsx
- fib/reaction.ts
- buildFeedback
- elliott/index.ts
- sources.ts
- smc/marks.ts
- grading/grade.ts
- MarkSession.tsx
- curriculum.ts
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
- limit.ts
- Roadmap — Trading Lab
- CountdownBadge.tsx
- fib/generate.ts
- cur.ts
- PRD — Trading Lab
- session/types.ts
- ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`
- progressData.ts
- combo.ts
- ref
- runCheck.ts
- TerminalScreen.tsx
- package.json
- fib/grade.test.ts
- CURRICULUM_STAGES — курс из ступеней: спецификация ступеней 1–4, комбинированных модулей, прогресса и открытия
- tasks.ts
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
- limit-trade.test.ts
- panels.tsx
- criteria.ts
- sliceAt
- ew/model.ts
- Mark
- SessionActions
- ProgressScreen.tsx
- QA Report — финальная приёмка MVP Trading Lab (M8)
- elliott/placeholders.test.ts
- ElliottSetup.tsx
- fixtures
- elliott.test.ts
- handlers.ts
- AuthProvider.tsx
- FibSetup.tsx
- Подключение Supabase и Vercel (с телефона)
- handlers.test.ts
- zone.ts
- high
- vercel.json
- ELLIOTT — спецификация модуля Elliott Wave Lab (v1.2) для `@tl/core`
- terminal.countdown.spec.ts
- 12. `gradeMarks` — сравнение разметки
- curriculum.test.ts
- 1. Общие соглашения
- features/feedback/format.ts
- ew.controller.test.ts
- ResultExtra.tsx
- Находки
- Trading Lab
- 14. Challenge: эталон, оценка качества, WAIT, лимиты
- elliott/index.ts
- patterns.ts
- 6. Внешние API Binance
- ADR-0001: Next.js 16 + TypeScript strict, pnpm monorepo, Vercel
- zone/snap.test.ts
- FIBONACCI — спецификация модуля Fibonacci Playground (v1.1) для `@tl/core`
- playwright.config.ts
- contextFlow.ts
- ADR-0002: Lightweight Charts v5 + собственный слой разметки на Series Primitives
- ADR-0003: Живые данные грузит браузер напрямую (REST + WS), fallback — REST-polling
- CURRICULUM.md
- ADR-0004: История для заданий — сервер читает архив data.binance.vision
- TaskTimeframe
- ADR-0006: Синхронизация таймфреймов — нативные ТФ, инвариант агрегации, sliceAt
- 17. Шаблоны разбора (источник `src/i18n/ru/feedback`)
- 2. `detectSwings` — фрактальные swing
- health/route.ts
- fibonacci/reveal.ts
- 16. Навыки и прогресс
- 6. Liquidity sweep
- 8. FVG (Fair Value Gap)
- 11. Коды и шаблоны разбора (источник `src/i18n/ru/feedback`)
- next.config.ts

## God Nodes (most connected - your core abstractions)
1. `Candle` - 190 edges
2. `Mark` - 140 edges
3. `UtcMs` - 139 edges
4. `TaskTimeframe` - 93 edges
5. `react` - 87 edges
6. `analyzeStructure()` - 63 edges
7. `gradeCurTask()` - 54 edges
8. `Difficulty` - 52 edges
9. `cn()` - 49 edges
10. `GradeError` - 49 edges

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
- 2-file cycle: `apps/web/src/server/common.ts -> apps/web/src/server/tasks.ts -> apps/web/src/server/common.ts`
- 2-file cycle: `packages/core/src/candles/aggregate.ts -> packages/core/src/index.ts -> packages/core/src/candles/aggregate.ts`
- 3-file cycle: `apps/web/src/server/common.ts -> apps/web/src/server/tasks.ts -> apps/web/src/server/curriculum.ts -> apps/web/src/server/common.ts`

## Communities (173 total, 11 thin omitted)

### Community 0 - "market-structure.ts"
Cohesion: 0.09
Nodes (43): gradeMsMark(), markGradeOf(), 2.2 `sw-mark` «Разметь свинги» (переиспользование `selectMsMarkTask` + `gradeMarks`), atrAt(), buildMsQuestion(), checkMsWindow(), drawCandidate(), generateMsQuestion() (+35 more)

### Community 1 - "SupabaseRepository"
Cohesion: 0.17
Nodes (8): must(), SupabaseRepository, DailyActivity, 5.1 Живые данные (терминал), 5.2 История для заданий (сервер), 5.3 Задания (stateless, без БД до M7), 5.4 Хранение (Repository), 5. Потоки данных

### Community 2 - "terminal.helpers.ts"
Cohesion: 0.11
Nodes (35): alternating(), isPivot(), P, Pt, Fib, findFib(), openFibTool(), pivot() (+27 more)

### Community 3 - "API Contracts — Trading Lab"
Cohesion: 0.11
Nodes (17): 1.1 Формат ошибки, 1.2 Заголовки кэша, 1. Общие соглашения, 2.2 Расширения контрактов (предложение — фиксируются при реализации в `@tl/core`), 2. Типы `@tl/core`, используемые в контрактах, 3.1 `GET /api/health`, 3.2 `GET /api/history`, 3.3 `POST /api/tasks/{module}/next` (+9 more)

### Community 4 - "mulberry32"
Cohesion: 0.14
Nodes (22): buildHints(), DEFAULT_TFS, HTF, meetsDifficulty(), pickChallengeScenario(), tail(), c15, c4h (+14 more)

### Community 5 - "with"
Cohesion: 0.08
Nodes (26): runs-on, steps, GITHUB_TOKEN, jobs, check, secrets-scan, name, on (+18 more)

### Community 6 - "Architecture — Trading Lab"
Cohesion: 0.14
Nodes (14): 10. Развёртывание, 11. Риски, 1. Ключевые ограничения, определяющие архитектуру, 2. Обзор, 3. Репозиторий (pnpm monorepo), 4.1 Синхронизация таймфреймов, 4.2 Разметка (общая модель для пользователя и алгоритма), 4.3 Алгоритмы (детерминированные, версионируемые) (+6 more)

### Community 7 - "fib/ref.ts"
Cohesion: 0.14
Nodes (21): Choice(), ChoiceProps, COLS, ReactionFormProps, TargetPicker(), Dir, FibTypeKey, fx (+13 more)

### Community 8 - "progressLogic.ts"
Cohesion: 0.11
Nodes (35): Page(), ContinueBlock(), HomeWeakSpots(), LearnScreen(), MODULES, ModuleAccuracy(), asCore(), canTrain() (+27 more)

### Community 9 - "market-data/package.json"
Cohesion: 0.11
Nodes (20): dependencies, fflate@^0.8.3, @tl/core@workspace:*, devDependencies, vitest@^4.1.12, @vitest/coverage-v8@^4.1.12, exports, ./archive (+12 more)

### Community 10 - "UtcMs"
Cohesion: 0.13
Nodes (15): DailyActivityRow, SkillStatRow, TerminalMarksRow, TradingLabDB, defaultSettings(), LocalRepository, LocalSnapshot, mark (+7 more)

### Community 11 - "server/elliott.ts"
Cohesion: 0.10
Nodes (42): isoOf(), pickSegment(), rangeOf(), rngOf(), sameSeries(), toSeed(), withPartial(), buildStageSwings() (+34 more)

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
Nodes (42): AppError(), NotFound(), ChoiceOption, SetupField(), SetupFieldProps, Badge(), BadgeProps, BottomSheet() (+34 more)

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
Cohesion: 0.09
Nodes (40): age(), CHALLENGE_STRUCTURE, ChallengeFacts, computeChallengeFacts(), FactsInput, HTF, intersects(), lastEventSince() (+32 more)

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
Cohesion: 0.07
Nodes (27): distToRectEdge(), distToSegment(), Hit, hitLevel(), hitTest(), partScore(), geos(), synthetic_proj (+19 more)

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
Cohesion: 0.14
Nodes (10): ADR-0007: Правила исхода сделки Challenge (drill-down), Контекст, Открытые вопросы (закрыты: `docs/specs/ALGORITHMS.md`), Последствия, Рассмотренные альтернативы, ADR-0009: Детерминированное общее ядро @tl/core; разборы по шаблонам; ИИ позже, Контекст, Последствия (+2 more)

### Community 29 - "elliott/check.ts"
Cohesion: 0.10
Nodes (58): 7.1 `enumerateCounts` — все допустимые разметки до текущей точки, 7.2 `findWaveCandidates` — участки для easy/medium, 7. Детекторы, findWaveCandidates(), Pivot, zigzagPivots(), atrCache, checkCount() (+50 more)

### Community 30 - "golden.ew.test.ts"
Cohesion: 0.08
Nodes (33): EASY, MEDIUM, atrOf(), snapIndex(), btc4, run(), sol, SOL_IMP (+25 more)

### Community 31 - "service.ts"
Cohesion: 0.06
Nodes (43): dynamic, POST(), runtime, dynamic, GET(), runtime, ctx, mk() (+35 more)

### Community 32 - "fetch-fixtures.mjs"
Cohesion: 0.07
Nodes (29): dynamic, GET(), safeEqual(), ChallengeAttemptStat, challengeStats(), dailyProgress(), DayMap, DayRecord (+21 more)

### Community 33 - "impulses.ts"
Cohesion: 0.15
Nodes (16): 12.1 Формат и процесс, 12.2 Участки, 12.3 Покрытие граничных случаев golden-участками, 12. Golden-участки, argExtreme(), findImpulses(), ImpulseParams, maxHigh() (+8 more)

### Community 34 - "token.ts"
Cohesion: 0.10
Nodes (25): ApiErrorCode, ConfigError, ValidationIssue, b64(), derive(), getSigningSecret(), HeaderSchema, keyCache (+17 more)

### Community 35 - "session/params.ts"
Cohesion: 0.18
Nodes (18): Page(), Page(), MsSetup(), PaSetup(), CommonFields(), common(), Get, MsParams (+10 more)

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
Nodes (51): 2.1 Из `ARCHITECTURE.md` §4 (дословно), Решение, 2.3 `sw-trend` «Какой тренд по свингам?», 1.2 Переиспользуемые соглашения (без изменений), 1.2 Переиспользуемые соглашения (без изменений), 3.4 Граничные случаи (проверены на реальных свечах), golden/ - эталонные участки SMC (ALGORITHMS §18), inWindow() (+43 more)

### Community 45 - "i18n/format.ts"
Cohesion: 0.23
Nodes (14): ErrorLog(), errorName(), fmtPrice(), Review(), textOf(), buildErrorLog(), formatDateTime(), formatDayMonth() (+6 more)

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
Nodes (43): dependencies, dexie@^4.0.0, lightweight-charts@~5.2.1, lucide-react@^1.66.0, next@^16.0.0, react@^19.0.0, react-dom@^19.0.0, @supabase/ssr@^0.12.7 (+35 more)

### Community 52 - "DrawingController"
Cohesion: 0.08
Nodes (31): constrainAnchors(), createMark(), DrawKind, drawKindOf(), isDrawTool(), ZONE_KIND, firstSideOf(), sideAt() (+23 more)

### Community 53 - "rules.ts"
Cohesion: 0.10
Nodes (39): PointerKind, SWING_SIDE, ewDirection(), isEwKind(), timesAscending(), fibDirection(), snapFibAnchor(), candles (+31 more)

### Community 54 - "ChallengeSession.tsx"
Cohesion: 0.07
Nodes (41): ChallengeSessionPage(), buildAttempt(), ChallengeSession(), FOCUS_SKILLS, SHEET_PAD, toError(), useDesktop(), selectHints() (+33 more)

### Community 55 - "schemas.ts"
Cohesion: 0.07
Nodes (23): AnchorSchema, AnswerSchema, BUSINESS_CODES, ChallengeAnswerSchema, difficulty, ElliottAnswerSchema, EW_ALTERNATIVES, EW_PRIMARY (+15 more)

### Community 56 - "GradeError"
Cohesion: 0.25
Nodes (23): Core, GradeResultApi, ChallengeGrade, ComboScore, ZonePart, Graded, CurPart, LimitEntryGrade (+15 more)

### Community 57 - "TradingChart.tsx"
Cohesion: 0.07
Nodes (24): DrawingPrimitive, lwcProjection(), snapAnchor(), SnapOptions, snapPriceToCandle(), synthetic_candles, T0, T0 (+16 more)

### Community 58 - "fib/reaction.ts"
Cohesion: 0.09
Nodes (27): 7.1 Момент задания и точка C, 7.2 Исход — `resolveExtension` (решение), 7.3 Ответ и проверка, 7. Задание «Цель по Extension» (`fib-extension`), resolveExtension(), idx(), FILES, STEP (+19 more)

### Community 59 - "buildFeedback"
Cohesion: 0.13
Nodes (25): attempt(), check(), block(), buildFeedback(), glyphOf(), matchedOf(), OK_BY_SKILL, okFromOutcomes() (+17 more)

### Community 60 - "elliott/index.ts"
Cohesion: 0.14
Nodes (29): CandidateParams, EW_N_POINT, EW_TOLERANCE_CANDLES, EnumerateParams, contiguousRuns(), ewCatalog(), ewMakeTask(), EwPick (+21 more)

### Community 61 - "sources.ts"
Cohesion: 0.08
Nodes (25): FixtureLoader, fixtures, flaky(), NOW, post(), ARCHIVE_START, ArchiveLoader, ArchiveLoaderOptions (+17 more)

### Community 62 - "smc/marks.ts"
Cohesion: 0.16
Nodes (23): PoiInfo, allLayerSwings(), buildAlgoMarkSet(), conceptOf(), endTimeOf(), eventMark(), fvgMark(), IndexWindow (+15 more)

### Community 63 - "grading/grade.ts"
Cohesion: 0.16
Nodes (18): 19. Расхождения с документами, FeedbackBlock, Entry, gradeMarks(), Group, groupEvaluated(), groupOf(), iou() (+10 more)

### Community 64 - "MarkSession.tsx"
Cohesion: 0.07
Nodes (75): tickSizeFor(), ReplayBar(), AXIS_H, PRICE_SCALE_W, RelativeAxis(), allowedAlternatives(), EW_KIND, ewAnswer() (+67 more)

### Community 65 - "curriculum.ts"
Cohesion: 0.10
Nodes (37): asValidation(), base(), buildLevels(), buildTradeTask(), checkZoneAnchors(), CurParams, EXTRA_FOR, FRONT_K (+29 more)

### Community 66 - "live.ts"
Cohesion: 0.07
Nodes (26): BINANCE_REST_BASE, BINANCE_WS_BASE, binanceInterval(), FetchKlinesOptions, LiveErrorCode, LiveFeed, LiveFeedError, LiveFeedOptions (+18 more)

### Community 67 - "README.md"
Cohesion: 0.20
Nodes (3): Known Issues — Trading Lab, Не проверено вообще (среда), Открыто

### Community 68 - "importLocal.ts"
Cohesion: 0.21
Nodes (21): chunks(), IMPORTED_USER_META, ImportOutcome, importSnapshot(), must(), recomputeDerived(), Row, runFirstSignInImport() (+13 more)

### Community 69 - "Repository"
Cohesion: 0.07
Nodes (19): Repository, graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила, graphify (+11 more)

### Community 70 - "stages.ts"
Cohesion: 0.08
Nodes (44): TrainTarget, 10.1 Новые `SkillId` **(новое)**, 10.2 Ступень → модули → навыки, 10.3 Прогресс и «пройдено» (решение, через существующую систему навыков), 10.4 `generatorForSkill` (расширение `ALGORITHMS.md` §16.3), 10. Навыки, прогресс ступени, открытие комбо, рекомендация, accuracyOf(), applyOutcome() (+36 more)

### Community 71 - "history/route.ts"
Cohesion: 0.09
Nodes (23): ARCHIVE_START_MS, dynamic, errorResponse(), GET(), ISSUE_CODES, querySchema, runtime, SYMBOLS (+15 more)

### Community 72 - "fib/index.ts"
Cohesion: 0.09
Nodes (53): gradeFibTask(), 13. Тест-план для реализации (TDD, `packages/core/src/fib/`), checkFibMarks(), dirOf(), emptyDetail(), FIB_TERMINAL_MAX_DISTANCE, FIB_TERMINAL_NEXT, FibMarkCheck (+45 more)

### Community 73 - "localDay"
Cohesion: 0.11
Nodes (17): ImportReport, 1. Принципы, 2. Локальная схема: IndexedDB (Dexie), 3.1 RLS, 3. Схема Supabase Postgres (M7), 4.1 Порядок, 4.2 Правила по таблицам (идемпотентность по `id`, конфликты по `updated_at`), 4.3 Пересчёт производных данных (+9 more)

### Community 74 - "elliott.helpers.ts"
Cohesion: 0.18
Nodes (18): bodyText(), closePanel(), countsFor(), DATE_LEAK, drawCount(), EW_STORAGE, EwEnvelope, openEw() (+10 more)

### Community 75 - "layout.ts"
Cohesion: 0.09
Nodes (37): buildGeometry(), formatPrice, GeometryOptions, GLYPH_OFFSET, GlyphKind, Handle, keepTextsInside(), norm() (+29 more)

### Community 76 - "useMarketData.ts"
Cohesion: 0.16
Nodes (17): ClockSync, eventTimeOf(), sniffingFetch(), sniffingWebSocket(), HISTORY_PAGE, SourceMode, appendCandle(), ArchiveHttpError (+9 more)

### Community 77 - "archive.ts"
Cohesion: 0.15
Nodes (14): AGG_TRADES_HEADER, AggTrade, ARCHIVE_BASE_URL, ArchiveFetch, ArchiveFileSpec, ArchiveSource, ArchiveSourceOptions, archiveUrl() (+6 more)

### Community 78 - "screens.test.tsx"
Cohesion: 0.22
Nodes (14): metadata, plexMono, plexSans, RootLayout(), viewport, AppShell(), BottomTabs(), DesktopTabs() (+6 more)

### Community 79 - "limit.ts"
Cohesion: 0.10
Nodes (33): 4.1 `resolveZoneReaction` (решение), 4.2 `resolveZoneChain` (несколько зон, `lv-reaction`), 4. Общий детектор реакции у зоны, 8.1 `combo-level-trade` «Уровень + лимитка + стоп/тейк», 8.2 `combo-smc-entry` «SMC-вход», 8.3 Trading Challenge, 8. Комбинированные модули, fillExcursions() (+25 more)

### Community 80 - "Roadmap — Trading Lab"
Cohesion: 0.29
Nodes (6): MVP, Roadmap — Trading Lab, v1.1 — Fibonacci Playground и Premium/Discount, v1.2 — Elliott Wave Lab, v2, Правила корректировки

### Community 81 - "CountdownBadge.tsx"
Cohesion: 0.18
Nodes (8): CandleCountdown, ClockOffsetEstimator, formatCountdown(), pad2(), remainingMs(), CountdownBadge(), CountdownBadgeProps, View

### Community 82 - "fib/generate.ts"
Cohesion: 0.11
Nodes (26): Ctx, desiredClass(), EXT_TARGETS, extremesOk(), FIB_IMPULSE_RULES, FIB_NEXT, fibExtensionTask(), fibGridTask() (+18 more)

### Community 83 - "cur.ts"
Cohesion: 0.09
Nodes (40): 15.3 Покрытие, playCombo(), reactionOptions(), correctReactionId(), gradeLvReaction(), gradeLvStrongest(), hitZone(), outcome() (+32 more)

### Community 84 - "PRD — Trading Lab"
Cohesion: 0.05
Nodes (41): 10. Приоритизация функций (MoSCoW), 11. План MVP, 12. Открытые вопросы, 1.1 Что это, 1.2 Цель, 1.3 Целевой пользователь, 1.4 Модули, 1. Обзор и цель продукта (+33 more)

### Community 85 - "session/types.ts"
Cohesion: 0.05
Nodes (96): Page(), Page(), Page(), Page(), decimalsForTick(), makePriceFormatter(), TICK_TABLE, fmtOf() (+88 more)

### Community 86 - "ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`"
Cohesion: 0.10
Nodes (20): 11.1 Формат ответа (ответ на OQ-16), 11.2 Задание, 11.3 Факторы (детерминированно, для бычьей модели; медвежья — зеркально), 11.4 Значимость (решение), 11.5 Оценка, 11.6 Генерация, 11. Контекст для PA «Контекст», 13.1 Общие правила (+12 more)

### Community 87 - "progressData.ts"
Cohesion: 0.23
Nodes (13): DayStat, prevDay(), softStreak(), done, DailyProgress, useAttempts(), useDailyProgress(), useSkillStats() (+5 more)

### Community 88 - "combo.ts"
Cohesion: 0.07
Nodes (54): ComboAnswer, ComboPlay, gradeComboLevel(), gradeComboSmc(), iouInterval(), KIND_TEXT_RU, PLACEMENT_COMBO, POI_STATUS_TEXT_RU (+46 more)

### Community 89 - "ref"
Cohesion: 0.25
Nodes (9): 13.3 Market Structure «Вопрос», 5.1 Общие правила, 5.2 Внешний слой — машина состояний с защищёнными уровнями, 5.3 Внутренний слой — «последний подтверждённый swing», 5.4 Что происходит после CHoCH, 5.5 Граничные случаи (проверены на реальных свечах), 5. Тренд, BOS и CHoCH, 6.3 Граничные случаи (+1 more)

### Community 90 - "runCheck.ts"
Cohesion: 0.21
Nodes (10): CheckOutcome, CheckState, CONCEPT_OF, conceptsFor(), RANGE_TAIL_CANDLES, runCheck(), TERMINAL_STRUCTURE, algoMarks (+2 more)

### Community 91 - "TerminalScreen.tsx"
Cohesion: 0.06
Nodes (54): TerminalPage(), validateMarks(), isScopedKind(), SHORT, TASK_TFS, ARCHIVE_MIN_AGE_MS, ARCHIVE_SYMBOLS, archiveAllowed() (+46 more)

### Community 92 - "package.json"
Cohesion: 0.08
Nodes (31): devDependencies, eslint@^9.39.0, eslint-config-next@^16.0.0, @eslint/js@^9.39.0, @playwright/test@1.63.0, prettier@^3.6.0, @types/node@^22.0.0, typescript@~5.9.3 (+23 more)

### Community 93 - "fib/grade.test.ts"
Cohesion: 0.09
Nodes (33): 4.1 Шкала задания, imp(), C, pt(), series(), upTo(), FG1, FG3 (+25 more)

### Community 94 - "CURRICULUM_STAGES — курс из ступеней: спецификация ступеней 1–4, комбинированных модулей, прогресса и открытия"
Cohesion: 0.05
Nodes (36): 11.1 Маршруты и типы, 11.2 Payload (`TaskPayload`), 11.3 Answer, 11.4 GradeResult, 11. API (расширение `API_CONTRACTS.md`), 12.1 Общие блоки, 12.2 Что понято верно (`OkCode`, новые помечены *), 12.3 Ошибки (части 3–6) (+28 more)

### Community 95 - "tasks.ts"
Cohesion: 0.09
Nodes (34): SEGMENT_EXTRA, TICK, CUR_PARAM_SCHEMAS, ElliottParamsSchema, ApiError, validationError(), ChallengeAnswer, CurAnswer (+26 more)

### Community 97 - "src/normalize.ts"
Cohesion: 0.13
Nodes (20): load(), klinesZip(), NOW, Served, zipOf(), ArchiveErrorCode, ARCHIVE_KLINE_HEADER, findGaps() (+12 more)

### Community 98 - "model.ts"
Cohesion: 0.21
Nodes (22): extensionLevels(), FIB_KINDS, FibKind, FibLevel, labelPriority(), oteRange(), retracementLevels(), thinLabels() (+14 more)

### Community 99 - "src/feedback/index.ts"
Cohesion: 0.08
Nodes (45): CHALLENGE_VERDICT_TEMPLATES_RU, CUR_OUTCOME_TEXT_RU, ELLIOTT_VERDICT_TEMPLATES_RU, ERROR_SKILLS, ERROR_TEMPLATES_RU, ErrorTemplate, EW_ALT_REASON_RU, EW_ALT_TRIGGER_RU (+37 more)

### Community 100 - "AUDIT — финальный дизайн-аудит Trading Lab (M8-UI)"
Cohesion: 0.20
Nodes (9): 1. Итог, 2. Находки, 3. Impeccable detect (по URL production-сборки), 4. Что проверено и ограничения, 5. Порядок исправления, AUDIT — финальный дизайн-аудит Trading Lab (M8-UI), P1, P2 (+1 more)

### Community 101 - "challenge/reveal.ts"
Cohesion: 0.13
Nodes (19): AxisTick, axisTicks(), relativeDuration(), relativeLabel(), STEPS, T, partMax(), ResultView() (+11 more)

### Community 102 - "Стратегия тестирования — Trading Lab"
Cohesion: 0.12
Nodes (16): 10. Производительность, 1. Принципы, 2. Пирамида, 3. Фикстуры, 4.3 Нормализация (`market-data`), 4.4 Golden-тесты SMC/PA, 4.5 `resolveTrade`, 4.6 Интеграционные тесты API (+8 more)

### Community 103 - "features/feedback/index.ts"
Cohesion: 0.10
Nodes (29): AiReply, AskAi(), buildAttemptContext(), loadAiEnabled(), resetAiEnabledCache(), Status, errors, feedback (+21 more)

### Community 104 - "fib.helpers.ts"
Cohesion: 0.27
Nodes (11): bodyText(), DATE_LEAK, drawFib(), FIB_STORAGE, fibPoints(), openFib(), PORT, Pt (+3 more)

### Community 105 - "ref_vitest"
Cohesion: 0.21
Nodes (8): contractAttempt(), contractMark, runRepositoryContract(), FakeSupabase, Row, UNIQUE, seedLocal(), @supabase/supabase-js

### Community 106 - "golden.pa-challenge.test.ts"
Cohesion: 0.06
Nodes (35): FIX, FILES, c4h, FIX, algoOf(), ALL, at(), candles (+27 more)

### Community 107 - "UtcMs"
Cohesion: 0.06
Nodes (66): SegmentData, Side, ChallengeSource, ComboLevelGrade, ComboSmcGrade, PlanInput, SmcContext, ComboLevelPick (+58 more)

### Community 108 - "ErrorCode"
Cohesion: 0.43
Nodes (7): TaskPayload, NextRequest, 18. Расхождения с документами, 17. Расхождения с документами, 14. Расхождения с документами, MsMarkSelection, MarkKind

### Community 109 - "fib.controller.test.ts"
Cohesion: 0.18
Nodes (12): A_TAP, algo(), B_TAP, C_TAP, candles, index, proj, pt() (+4 more)

### Community 110 - "core/src/index.ts"
Cohesion: 0.06
Nodes (50): PrimitiveState, CandleHighlight, HighlightRange, anchor, KINDS, MARKS_FORMAT_VERSION, markSchema, parseMarks() (+42 more)

### Community 111 - "2. Карточки"
Cohesion: 0.11
Nodes (17): 1. Сводка, 2. Карточки, 3. Правила оркестрации, 4. Формат отчёта агента (до 15 строк), 5. Шаблон задания агенту, 6. Уроки оркестрации, Chart Developer, DevOps/Security Engineer (+9 more)

### Community 112 - "pa/index.ts"
Cohesion: 0.06
Nodes (68): buildPa(), reconstructContext(), 18.2 Участки, 19. Спорные места и вопросы оркестратору, 6.3 TP: у следующего уровня/ликвидности (35 баллов), 6.5 Конфлюэнс (через SMC-движок, только данные до T), algo, ALL (+60 more)

### Community 114 - "storage/index.ts"
Cohesion: 0.08
Nodes (31): Page(), ChallengeStats, waitCorrectOf(), AsyncState, useAsync(), wrap(), CANDLE_OPTIONS, DAILY_GOAL_MAX (+23 more)

### Community 115 - "@playwright/test"
Cohesion: 0.31
Nodes (9): toFeedback(), checkAndSeeResult(), nextThenHomeShowsDone(), openSession(), shot(), tapCandle(), solveOne(), selectTool() (+1 more)

### Community 116 - "challenge.helpers.ts"
Cohesion: 0.22
Nodes (10): DATE_LEAK, expandResult(), lastCandleTime(), num(), openReasons(), projectPoint(), SESSION_URL(), startSession() (+2 more)

### Community 117 - "limit-trade.test.ts"
Cohesion: 0.07
Nodes (45): limitCandles(), 15. `resolveTrade` (ADR-0007, уточнения), 7. `resolveLimitTrade` — отложенный ордер с SL/TP (комбо), AggTrade, done(), FutureProvider, Hit, Position (+37 more)

### Community 118 - "panels.tsx"
Cohesion: 0.14
Nodes (24): blockerKey(), DecisionPanel(), errorCopy(), PriceField(), buildAnswer(), defaultLevels(), formatRR(), parsePrice() (+16 more)

### Community 119 - "criteria.ts"
Cohesion: 0.21
Nodes (19): body(), bottom(), dojiItems(), engulfItems(), finish(), insideItems(), Item, PatternCheck (+11 more)

### Community 120 - "sliceAt"
Cohesion: 0.17
Nodes (12): Backend Developer, ADR-0005: Stateless-задания с подписанными токенами; будущее только на сервере, Контекст, Открытые вопросы, Последствия, Рассмотренные альтернативы, Решение, aggregate() (+4 more)

### Community 121 - "ew/model.ts"
Cohesion: 0.10
Nodes (18): EW_CORRECTION_LABELS, EW_IMPULSE_LABELS, EW_IMPULSE_SIZES, EW_INVALIDATION_ROLE, EW_KINDS, EwKind, ewLabels(), other() (+10 more)

### Community 122 - "Mark"
Cohesion: 0.06
Nodes (41): drawParts(), OpenCandleInfo, ZONE_KINDS, dimSpans(), HighlightColumn, highlightColumns(), labelTop(), CHAR_W (+33 more)

### Community 123 - "SessionActions"
Cohesion: 0.10
Nodes (7): ChallengeApiError, ChallengeErrorKind, fetchNext(), gradeChallenge(), kindOf(), post(), SessionActions

### Community 124 - "ProgressScreen.tsx"
Cohesion: 0.15
Nodes (29): ChallengePage(), Page(), ChallengeHome(), DIFFS, recentLine(), StartTf, Stats(), TF_OPTIONS (+21 more)

### Community 125 - "QA Report — финальная приёмка MVP Trading Lab (M8)"
Cohesion: 0.22
Nodes (8): 1. Сводка, 2. Таблица AC, 3. Ключевые инварианты, 4. Производительность (headless Chromium, software rendering, CPU throttling 4x), 5. Дефекты, 6. Бэклог оркестратора, 7. Не удалось проверить, QA Report — финальная приёмка MVP Trading Lab (M8)

### Community 126 - "elliott/placeholders.test.ts"
Cohesion: 0.11
Nodes (17): ALL_ALT, btc3, btc4, COR3, EW_ERRORS, EW_OK, flat, IMP1 (+9 more)

### Community 127 - "ElliottSetup.tsx"
Cohesion: 0.19
Nodes (12): Page(), EW_TFS, ElliottSetup(), SHORT, ewBody(), ewQuery(), Get, parseEwParams() (+4 more)

### Community 128 - "fixtures"
Cohesion: 0.50
Nodes (3): fixtures, recorded/ - записанные форматы API (fapi/fstream недоступны из облака, 451), Архивные CSV

### Community 129 - "elliott.test.ts"
Cohesion: 0.18
Nodes (11): clearEwCatalogCache(), ewCatalogCacheSize(), easyAnswer(), grade(), Json, loader, mk(), next() (+3 more)

### Community 130 - "handlers.ts"
Cohesion: 0.08
Nodes (39): dynamic, maxDuration, POST(), runtime, dynamic, maxDuration, POST(), runtime (+31 more)

### Community 131 - "AuthProvider.tsx"
Cohesion: 0.13
Nodes (26): dynamic, GET(), dynamic, Page(), AuthContext, AuthRepositoryProvider(), AuthState, DISABLED (+18 more)

### Community 132 - "FibSetup.tsx"
Cohesion: 0.26
Nodes (10): Page(), FibSetup(), FIB_TYPES, FibParams, fibQuery(), Get, parseFibParams(), from() (+2 more)

### Community 133 - "Подключение Supabase и Vercel (с телефона)"
Cohesion: 0.18
Nodes (10): 1. Проект Supabase, 2. Применить миграцию (создать таблицы), 3. Ключи Supabase, 4. Вход через Google, 5. Redirect URL в Supabase, 6. Vercel, 7. Проверка на телефоне, Если что-то не работает (+2 more)

### Community 134 - "handlers.test.ts"
Cohesion: 0.16
Nodes (12): CH, challengeDeps(), grade(), Json, loader, mkDeps(), MS_MARK, MS_Q (+4 more)

### Community 135 - "zone.ts"
Cohesion: 0.12
Nodes (26): inside(), 10.1 Алгоритм, 10.2 Эталон для «Проведи уровень», 10. `findLevels` — уровни поддержки/сопротивления, 17. Тест-план для реализации (TDD, `packages/core/src/curriculum/`), 3.1 Зона уровня `levelZone` (решение), 3.2 Тип и сила уровня (решение), 3.3 Генерация заданий ступени 2 (+18 more)

### Community 136 - "high"
Cohesion: 0.17
Nodes (16): high(), low(), Решение, 2.3 Граничные случаи, 7.1 Определение (решение, ICT: «последняя противоположная свеча перед импульсом, сломавшим структуру»), 7.2 Статус (после свечи события `k`, по закрытым свечам), 7.3 Сигнатура, 7. Order Block (+8 more)

### Community 139 - "ELLIOTT — спецификация модуля Elliott Wave Lab (v1.2) для `@tl/core`"
Cohesion: 0.04
Nodes (48): ok(), 10. Проигрывание — `resolveScenario`, 11.1 Части, 11.2 Вердикт, 11.3 Пример (EW-1, easy, разметка 0 = 08-06 23:00 … 5 = 08-09 22:00, `abc-next`, invalidation 77.88, без альтернативы), 11.4 Исход не входит в счёт (решение), 11. Оценка (рубрика 0–100), 12.1 Типы (+40 more)

### Community 140 - "terminal.countdown.spec.ts"
Cohesion: 0.29
Nodes (3): CORS, OPEN, REST_1H

### Community 141 - "12. `gradeMarks` — сравнение разметки"
Cohesion: 0.13
Nodes (15): external(), 12.1 Сигнатура (расширение `API_CONTRACTS.md`), 12.2 Ключевая свеча метки, 12.3 Группы сопоставления, 12.4 Совместимость и стоимость пары, 12.5 Матчинг (решение: DP по времени вместо венгерского), 12.6 Классификация после матчинга, 12.7 Счёт, вердикт, навыки (+7 more)

### Community 142 - "curriculum.test.ts"
Cohesion: 0.21
Nodes (11): checkNext(), deps(), DIFFS, find(), grade(), Json, loader, next() (+3 more)

### Community 143 - "1. Общие соглашения"
Cohesion: 0.17
Nodes (12): c(), 1.1 Входные свечи, 1.2 Термины свечи, 1.3 ATR, 1.4 Детерминизм и числа, 1.5 ALGO_VERSION, 1.6 Параметры по сложностям (сводка), 1. Общие соглашения (+4 more)

### Community 144 - "features/feedback/format.ts"
Cohesion: 0.35
Nodes (10): DIR, formatParam(), FORMATTERS(), formatWhen(), KIND_KEYS, placeOf(), formatDecimal(), formatPercentValue() (+2 more)

### Community 145 - "ew.controller.test.ts"
Cohesion: 0.24
Nodes (9): candles, index, proj, pt(), setup(), T0, tap(), TAPS (+1 more)

### Community 146 - "ResultExtra.tsx"
Cohesion: 0.36
Nodes (5): formatScenarioDate(), outcomeLine(), ResultExtra(), ResultExtraProps, ElliottDetail

### Community 147 - "Находки"
Cohesion: 0.22
Nodes (9): 1. HIGH: open redirect в /auth/callback (исправлено), 2. MEDIUM: обход rate limit через X-Forwarded-For (исправлено частично), 4. LOW: /api/cron/keepalive (открыто), 5. LOW: Supabase (повторное чтение 0001_init.sql), 6. LOW: заголовки/CSP (фактически curl на production-сборке), 7. LOW: токены (src/server/token.ts) - корректно, 8. Утечка даты Challenge, 9. Ввод, лимиты, XSS, хранилища (+1 more)

### Community 148 - "Trading Lab"
Cohesion: 0.33
Nodes (6): Trading Lab, Быстрый старт, Документация, Команды, Ограничения, Структура

### Community 149 - "14. Challenge: эталон, оценка качества, WAIT, лимиты"
Cohesion: 0.29
Nodes (7): 14.1 Факты на момент T (`ChallengeFacts`), 14.2 Эталонная сторона `refSide`, 14.3 Оценка качества 0–100 (ответ на OQ-08), независимо от исхода, 14.4 Правильность, вердикт, лимиты, 14.5 Предикаты причин (`ReasonCode`, состав без изменений), 14.6 Подсказки (easy), 14. Challenge: эталон, оценка качества, WAIT, лимиты

### Community 150 - "elliott/index.ts"
Cohesion: 0.08
Nodes (43): EwFormState, ScenarioPanelProps, 15.1 Формат и процесс, 15.2 Участки, 15. Golden-участки, bcSupported(), corrTypeOf(), evaluateInvalidation() (+35 more)

### Community 151 - "patterns.ts"
Cohesion: 0.15
Nodes (22): 9.1 Состав (ответ на OQ-11), 9.3 Выход, 9.4 Проверенные примеры (BTCUSDT 4h 2026-09, GS-5), 9. Свечные модели Price Action (`detectPatterns`), body(), bodyBottom(), bodyTop(), detectPatterns() (+14 more)

### Community 152 - "6. Внешние API Binance"
Cohesion: 0.33
Nodes (6): status(), 6.1 REST: `GET https://fapi.binance.com/fapi/v1/klines` (браузер), 6.2 WebSocket: kline stream (браузер), 6.3 Архив data.binance.vision (сервер), 6. Внешние API Binance, t()

### Community 153 - "ADR-0001: Next.js 16 + TypeScript strict, pnpm monorepo, Vercel"
Cohesion: 0.33
Nodes (5): ADR-0001: Next.js 16 + TypeScript strict, pnpm monorepo, Vercel, Контекст, Последствия, Рассмотренные альтернативы, Решение

### Community 154 - "zone/snap.test.ts"
Cohesion: 0.53
Nodes (4): snapZoneEdge(), synthetic_candles, T0, zoneEdgeCandidates()

### Community 155 - "FIBONACCI — спецификация модуля Fibonacci Playground (v1.1) для `@tl/core`"
Cohesion: 0.07
Nodes (26): 10. Навыки и прогресс, 15. Спорные места и вопросы оркестратору, 2.1 Retracement, 2.2 Extension (Trend-Based Fib Extension A–B–C), 2.3 Premium / Discount (решение), 2.4 Сигнатуры, 2. Уровни, зоны и формулы, 3.1 Определение (решение) (+18 more)

### Community 156 - "playwright.config.ts"
Cohesion: 0.50
Nodes (3): INTRO_DISMISSED, INTRO_KEYS, PORT

### Community 157 - "contextFlow.ts"
Cohesion: 0.53
Nodes (4): CONTEXT_FIELD_IDS, CONTEXT_HTF, ContextFieldId, viewForField()

### Community 158 - "ADR-0002: Lightweight Charts v5 + собственный слой разметки на Series Primitives"
Cohesion: 0.33
Nodes (5): ADR-0002: Lightweight Charts v5 + собственный слой разметки на Series Primitives, Контекст, Последствия, Рассмотренные альтернативы, Решение

### Community 159 - "ADR-0003: Живые данные грузит браузер напрямую (REST + WS), fallback — REST-polling"
Cohesion: 0.33
Nodes (5): ADR-0003: Живые данные грузит браузер напрямую (REST + WS), fallback — REST-polling, Контекст, Последствия, Рассмотренные альтернативы, Решение

### Community 161 - "ADR-0004: История для заданий — сервер читает архив data.binance.vision"
Cohesion: 0.33
Nodes (5): ADR-0004: История для заданий — сервер читает архив data.binance.vision, Контекст, Последствия, Рассмотренные альтернативы, Решение

### Community 162 - "TaskTimeframe"
Cohesion: 0.11
Nodes (30): AnswerInput, ChallengeAnswerBody, SessionState, candle(), series, task, ChallengeDetailDto, ChallengeGradeResult (+22 more)

### Community 163 - "ADR-0006: Синхронизация таймфреймов — нативные ТФ, инвариант агрегации, sliceAt"
Cohesion: 0.40
Nodes (4): ADR-0006: Синхронизация таймфреймов — нативные ТФ, инвариант агрегации, sliceAt, Контекст, Последствия, Рассмотренные альтернативы

### Community 164 - "17. Шаблоны разбора (источник `src/i18n/ru/feedback`)"
Cohesion: 0.40
Nodes (5): 17.1 Структура и ключи, 17.2 Верность и общие принципы, 17.3 Что понято верно (`OkCode`; новые помечены *), 17.4 Ошибки (части 3–6), 17. Шаблоны разбора (источник `src/i18n/ru/feedback`)

### Community 165 - "2. `detectSwings` — фрактальные swing"
Cohesion: 0.40
Nodes (5): 2.1 Сигнатура, 2.2 Определение, 2.4 Кандидаты у правого края (`pendingSwings`), 2.5 Псевдокод, 2. `detectSwings` — фрактальные swing

### Community 167 - "fibonacci/reveal.ts"
Cohesion: 0.23
Nodes (14): storableElliott(), block(), Params, plainVerdict(), revealErrors(), revealFeedback(), shiftTimeParams(), storableGrade() (+6 more)

### Community 168 - "16. Навыки и прогресс"
Cohesion: 0.50
Nodes (4): 16.1 Навыки, 16.2 Обновление точности, 16.3 Адаптивная подборка, 16. Навыки и прогресс

### Community 169 - "6. Liquidity sweep"
Cohesion: 0.50
Nodes (4): 6.1 Определение (решение), 6.2 Несколько уровней за одну свечу, 6.4 Сигнатура, 6. Liquidity sweep

### Community 170 - "8. FVG (Fair Value Gap)"
Cohesion: 0.50
Nodes (4): 8.1 Определение, 8.2 Заполнение, 8.3 Сигнатура, 8. FVG (Fair Value Gap)

### Community 171 - "11. Коды и шаблоны разбора (источник `src/i18n/ru/feedback`)"
Cohesion: 0.50
Nodes (4): 11.1 Общие блоки, 11.2 Что понято верно (`OkCode`, новые), 11.3 Ошибки (части 3–6), 11. Коды и шаблоны разбора (источник `src/i18n/ru/feedback`)

## Knowledge Gaps
- **15 isolated node(s):** `ADR-0008`, `ADR-0007`, `ADR-0005`, `ADR-0005`, `ADR-0006` (+10 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1418 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Mark` connect `core/src/index.ts` to `elliott.test.ts`, `handlers.ts`, `SupabaseRepository`, `terminal.helpers.ts`, `mulberry32`, `handlers.test.ts`, `fib/ref.ts`, `UtcMs`, `server/elliott.ts`, `12. `gradeMarks` — сравнение разметки`, `curriculum.test.ts`, `1. Общие соглашения`, `ew.controller.test.ts`, `facts.ts`, `elliott/index.ts`, `parts.test.ts`, `elliott/check.ts`, `ADR-0002: Lightweight Charts v5 + собственный слой разметки на Series Primitives`, `golden.ew.test.ts`, `TaskTimeframe`, `src/types.ts`, `DrawingController`, `rules.ts`, `ChallengeSession.tsx`, `GradeError`, `TradingChart.tsx`, `elliott/index.ts`, `smc/marks.ts`, `grading/grade.ts`, `MarkSession.tsx`, `curriculum.ts`, `importLocal.ts`, `fib/index.ts`, `layout.ts`, `fib/generate.ts`, `cur.ts`, `session/types.ts`, `combo.ts`, `runCheck.ts`, `TerminalScreen.tsx`, `fib/grade.test.ts`, `tasks.ts`, `model.ts`, `features/feedback/index.ts`, `ref_vitest`, `golden.pa-challenge.test.ts`, `fib.controller.test.ts`, `pa/index.ts`, `ew/model.ts`, `Mark`, `elliott/placeholders.test.ts`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Mark` (e.g. with `Контекст` and `Последствия`) actually correct?**
  _`Mark` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0008`, `ADR-0007`, `ADR-0005` to the rest of the system?**
  _15 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `market-structure.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09292929292929293 - nodes in this community are weakly interconnected._
- **Why does `Candle` connect `src/types.ts` to `market-structure.ts`, `elliott.test.ts`, `handlers.ts`, `mulberry32`, `handlers.test.ts`, `zone.ts`, `fib/ref.ts`, `server/elliott.ts`, `curriculum.test.ts`, `ew.controller.test.ts`, `facts.ts`, `elliott/index.ts`, `parts.test.ts`, `6. Внешние API Binance`, `patterns.ts`, `zone/snap.test.ts`, `elliott/check.ts`, `golden.ew.test.ts`, `impulses.ts`, `TaskTimeframe`, `DrawingController`, `rules.ts`, `GradeError`, `TradingChart.tsx`, `fib/reaction.ts`, `elliott/index.ts`, `sources.ts`, `smc/marks.ts`, `MarkSession.tsx`, `curriculum.ts`, `live.ts`, `fib/index.ts`, `elliott.helpers.ts`, `useMarketData.ts`, `archive.ts`, `limit.ts`, `CountdownBadge.tsx`, `fib/generate.ts`, `cur.ts`, `session/types.ts`, `combo.ts`, `runCheck.ts`, `fib/grade.test.ts`, `tasks.ts`, `src/normalize.ts`, `golden.pa-challenge.test.ts`, `UtcMs`, `ErrorCode`, `fib.controller.test.ts`, `core/src/index.ts`, `pa/index.ts`, `limit-trade.test.ts`, `criteria.ts`, `sliceAt`, `ew/model.ts`, `Mark`, `elliott/placeholders.test.ts`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `UtcMs` (e.g. with `1. Общие соглашения` and `4.1 Шкала задания`) actually correct?**
  _`UtcMs` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `terminal.helpers.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10638297872340426 - nodes in this community are weakly interconnected._