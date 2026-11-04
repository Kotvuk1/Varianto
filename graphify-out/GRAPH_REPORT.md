# Graph Report - Varianto  (2026-11-04)

## Corpus Check
- 401 files · ~214,653 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 32 file(s) not represented in the graph (top: .csv 26, (none) 4, .example 1)

## Summary
- 2791 nodes · 7703 edges · 123 communities (115 shown, 8 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 222 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `91622a46`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- market-structure.ts
- Repository
- terminal.helpers.ts
- API Contracts — Trading Lab
- i18n/format.ts
- with
- Architecture — Trading Lab
- MsMarkBody.tsx
- Mark
- market-data/package.json
- LocalRepository
- Mark
- core/package.json
- compilerOptions
- Interview Summary — Trading Lab
- ui/index.ts
- compilerOptions
- Project Status — Trading Lab
- Skills Registry — Trading Lab
- SupabaseRepository
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
- Candle
- 4. Обязательные наборы тестов
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
- 3. Внешняя и внутренняя структура
- LAYOUTS — Trading Lab
- 2. Компоненты
- DESIGN — Trading Lab
- COPY — микрокопия Trading Lab
- check_tokens.py
- web/package.json
- rules.ts
- TradingChart.tsx
- GradeError
- TimeIndex
- TradingChart
- src/types.ts
- useMarketData.ts
- session/types.ts
- placeholders.test.ts
- MarkSession.tsx
- Timeframe
- core/src/index.ts
- README.md
- SupabaseRepository.ts
- grade.ts
- schemas.ts
- 13. Генерация заданий
- Settings
- Находки
- live.test.ts
- tasks.ts
- screens.test.tsx
- ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`
- ChallengeSession.tsx
- AUDIT — финальный дизайн-аудит Trading Lab (M8-UI)
- facts.ts
- PRD — Trading Lab
- TaskSession.tsx
- 11. Контекст для PA «Контекст»
- 14. Challenge: эталон, оценка качества, WAIT, лимиты
- 5. Тренд, BOS и CHoCH
- patterns.ts
- package.json
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
- 6. Внешние API Binance
- ref_vitest
- serialize.ts
- @playwright/test
- Roadmap — Trading Lab
- 6. Liquidity sweep
- pa/index.ts
- Query
- SettingsScreen.tsx
- scripts
- ProgressScreen.tsx
- criteria.ts
- ms.helpers.ts
- handlers.test.ts
- runCheck.ts
- ProgressScreen.tsx
- QA Report — финальная приёмка MVP Trading Lab (M8)
- data/streak.test.ts
- 12. `gradeMarks` — сравнение разметки
- fixtures
- golden.pa-challenge.test.ts
- storage/index.ts
- Подключение Supabase и Vercel (с телефона)
- TimeIndex
- Команда агентов — Trading Lab
- 16. Навыки и прогресс
- vercel.json
- 8. FVG (Fair Value Gap)

## God Nodes (most connected - your core abstractions)
1. `Candle` - 92 edges
2. `Mark` - 83 edges
3. `UtcMs` - 79 edges
4. `react` - 72 edges
5. `TaskTimeframe` - 50 edges
6. `cn()` - 46 edges
7. `analyzeStructure()` - 45 edges
8. `Button()` - 36 edges
9. `TradingChart()` - 33 edges
10. `LocalRepository` - 33 edges

## Surprising Connections (you probably didn't know these)
- `1. HIGH: open redirect в /auth/callback (исправлено)` --references--> `safeNextPath()`  [INFERRED]
  docs/SECURITY_REVIEW.md → apps/web/src/auth/config.ts
- `P2` --references--> `GradeLegend()`  [INFERRED]
  docs/design/AUDIT.md → apps/web/src/features/feedback/GradeLegend.tsx
- `P1` --references--> `fmtPrice()`  [INFERRED]
  docs/design/AUDIT.md → apps/web/src/features/progress/ErrorLog.tsx
- `1. Принципы` --references--> `localDay()`  [INFERRED]
  docs/DATABASE_SCHEMA.md → apps/web/src/i18n/format.ts
- `6. Открытые вопросы` --references--> `localDay()`  [INFERRED]
  docs/DATABASE_SCHEMA.md → apps/web/src/i18n/format.ts

## Import Cycles
- 2-file cycle: `packages/core/src/candles/aggregate.ts -> packages/core/src/index.ts -> packages/core/src/candles/aggregate.ts`

## Communities (123 total, 8 thin omitted)

### Community 0 - "market-structure.ts"
Cohesion: 0.11
Nodes (40): mulberry32(), randInt(), atrAt(), buildMsQuestion(), checkMsWindow(), CORE_CONCEPTS, drawCandidate(), generateMsQuestion() (+32 more)

### Community 1 - "Repository"
Cohesion: 0.07
Nodes (19): Repository, graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила, graphify (+11 more)

### Community 2 - "terminal.helpers.ts"
Cohesion: 0.17
Nodes (23): Box, candlePoint(), chartCandles(), coreLevels(), coreMarks(), drawAlgoMark(), drawTwoPoint(), findVisibleBos() (+15 more)

### Community 3 - "API Contracts — Trading Lab"
Cohesion: 0.10
Nodes (20): 1.1 Формат ошибки, 1.2 Заголовки кэша, 1. Общие соглашения, 2.2 Расширения контрактов (предложение — фиксируются при реализации в `@tl/core`), 2. Типы `@tl/core`, используемые в контрактах, 3.1 `GET /api/health`, 3.2 `GET /api/history`, 3.3 `POST /api/tasks/{module}/next` (+12 more)

### Community 4 - "i18n/format.ts"
Cohesion: 0.10
Nodes (40): errors, feedback, defaultFmt, FeedbackView(), FeedbackViewProps, Section(), DIR, formatParam() (+32 more)

### Community 5 - "with"
Cohesion: 0.08
Nodes (26): runs-on, steps, GITHUB_TOKEN, jobs, check, secrets-scan, name, on (+18 more)

### Community 6 - "Architecture — Trading Lab"
Cohesion: 0.14
Nodes (14): 10. Развёртывание, 11. Риски, 1. Ключевые ограничения, определяющие архитектуру, 2. Обзор, 3. Репозиторий (pnpm monorepo), 4.1 Синхронизация таймфреймов, 4.2 Разметка (общая модель для пользователя и алгоритма), 4.3 Алгоритмы (детерминированные, версионируемые) (+6 more)

### Community 7 - "MsMarkBody.tsx"
Cohesion: 0.15
Nodes (23): Page(), MsMarkBody(), highlightMarks(), MsQuestionBody(), MsSessionScreen(), msQuestionAnswer(), AnswerList(), msBody() (+15 more)

### Community 8 - "Mark"
Cohesion: 0.15
Nodes (18): ToolId, MarkSessionProps, SessionBase, Cell(), groupOf(), TaskToolbarBar(), TaskToolbarProps, TaskToolRail() (+10 more)

### Community 9 - "market-data/package.json"
Cohesion: 0.11
Nodes (20): dependencies, fflate@^0.8.3, @tl/core@workspace:*, devDependencies, vitest@^4.1.12, @vitest/coverage-v8@^4.1.12, exports, ./archive (+12 more)

### Community 10 - "LocalRepository"
Cohesion: 0.12
Nodes (16): DailyActivityRow, SkillStatRow, TerminalMarksRow, TradingLabDB, defaultSettings(), LocalRepository, LocalSnapshot, mark (+8 more)

### Community 11 - "Mark"
Cohesion: 0.07
Nodes (48): TerminalPage(), patternLabel(), ARCHIVE_MIN_AGE_MS, ARCHIVE_SYMBOLS, archiveAllowed(), archivePageSize(), HISTORY_PAGE, normalizeSymbolInput() (+40 more)

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
Nodes (43): AppError(), NotFound(), csp, nextConfig, isScopedKind(), ResultSheet(), InstructionBar(), instructionText() (+35 more)

### Community 16 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, allowJs, incremental, jsx, lib, paths, plugins, exclude (+3 more)

### Community 17 - "Project Status — Trading Lab"
Cohesion: 0.22
Nodes (8): Project Status — Trading Lab, Блокеры, Готовность по частям, Окружение разработки (облачный контейнер), Следующие действия, Что НЕ проверено, Что реально работает (проверено 2026-11-04), Этапы

### Community 18 - "Skills Registry — Trading Lab"
Cohesion: 0.25
Nodes (7): Skills Registry — Trading Lab, Кандидаты — отложены до утверждения архитектуры, Отклонённые, Справочник: Public APIs, Уже доступные навыки окружения (не требуют установки), Установка в новом контейнере, Установленные инструменты

### Community 19 - "SupabaseRepository"
Cohesion: 0.19
Nodes (7): must(), SupabaseRepository, 5.1 Живые данные (терминал), 5.2 История для заданий (сервер), 5.3 Задания (stateless, без БД до M7), 5.4 Хранение (Repository), 5. Потоки данных

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
Nodes (38): distToRectEdge(), distToSegment(), Hit, hitTest(), inside(), partScore(), geos(), synthetic_proj (+30 more)

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
Nodes (39): candle(), series, ADR-0001: Next.js 16 + TypeScript strict, pnpm monorepo, Vercel, Контекст, Последствия, Рассмотренные альтернативы, Решение, ADR-0003: Живые данные грузит браузер напрямую (REST + WS), fallback — REST-polling (+31 more)

### Community 29 - "PaFindBody.tsx"
Cohesion: 0.12
Nodes (31): Page(), HTF, PaContextBody(), Row(), YN, yn, PaFindBody(), PaLevelBody() (+23 more)

### Community 30 - "Candle"
Cohesion: 0.07
Nodes (54): ControllerDeps, AnswerInput, ChallengeAnswerBody, SessionState, task, ChallengeDetailDto, ChallengeGradeResult, ChallengeOutcomeDto (+46 more)

### Community 31 - "4. Обязательные наборы тестов"
Cohesion: 0.25
Nodes (8): 4.1 Инвариант агрегации таймфреймов, 4.2 `sliceAt(series, T)`, 4.3 Нормализация (`market-data`), 4.4 Golden-тесты SMC/PA, 4.5 `resolveTrade`, 4.6 Интеграционные тесты API, 4.7 Прочие unit-тесты, 4. Обязательные наборы тестов

### Community 32 - "skills.ts"
Cohesion: 0.05
Nodes (43): dynamic, GET(), safeEqual(), accuracyOf(), applyOutcome(), FOCUS_SIZE, isEnoughData(), isOutcomeOk() (+35 more)

### Community 33 - "Trading Lab"
Cohesion: 0.33
Nodes (6): Trading Lab, Быстрый старт, Документация, Команды, Ограничения, Структура

### Community 34 - "token.ts"
Cohesion: 0.12
Nodes (24): ConfigError, b64(), derive(), getSigningSecret(), HeaderSchema, invalid(), keyCache, Keys (+16 more)

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
Cohesion: 0.09
Nodes (53): 2.1 Из `ARCHITECTURE.md` §4 (дословно), Решение, golden/ - эталонные участки SMC (ALGORITHMS §18), at(), allSwingsMap, AnalyzeOptions, analyzeStructure(), EMPTY_LAYER (+45 more)

### Community 45 - "3. Внешняя и внутренняя структура"
Cohesion: 0.50
Nodes (4): 3.1 Правило (решение), 3.2 Дедупликация, 3.3 Сигнатура `analyzeStructure`, 3. Внешняя и внутренняя структура

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
Nodes (43): dependencies, dexie@^4.0.0, lightweight-charts@~5.2.1, lucide-react@^1.66.0, next@^16.0.0, react@^19.0.0, react-dom@^19.0.0, @supabase/supabase-js@^2.118.0 (+35 more)

### Community 53 - "rules.ts"
Cohesion: 0.09
Nodes (43): constrainAnchors(), createMark(), DrawKind, FULL_WIDTH_KINDS, isDrawKind(), MarkExtra, RAY_RIGHT_KINDS, SWING_SIDE (+35 more)

### Community 55 - "TradingChart.tsx"
Cohesion: 0.17
Nodes (15): RenderStyle, limitCandles(), OPEN_CANDLE_ALPHA, pricePrecision(), T0, tokens, toCandleData(), toVolumeData() (+7 more)

### Community 56 - "GradeError"
Cohesion: 0.19
Nodes (22): ResultBodyProps, GradeResultDto, Core, GradeResultApi, 5.2 `Feedback` (6 частей, FR-FB-02), 17.1 Структура и ключи, 17.2 Верность и общие принципы, 17.3 Что понято верно (`OkCode`; новые помечены *) (+14 more)

### Community 57 - "TimeIndex"
Cohesion: 0.18
Nodes (17): PointerKind, ControllerNotice, PointerInput, defaultLogicalRange(), LogicalRange, logicalRangeFromWindow(), padRangeForMarks(), T0 (+9 more)

### Community 58 - "TradingChart"
Cohesion: 0.14
Nodes (14): DrawingController, bosMark, breakIdx, drag(), index, lvl, proj, pt() (+6 more)

### Community 59 - "src/types.ts"
Cohesion: 0.12
Nodes (23): algoOf(), ALL, candles, findAlgo(), P, r, window, allLayerSwings() (+15 more)

### Community 60 - "useMarketData.ts"
Cohesion: 0.26
Nodes (11): archiveWindow(), appendCandle(), ArchiveHttpError, DataStatus, fetchArchive(), LoadError, MarketState, toLoadError() (+3 more)

### Community 61 - "session/types.ts"
Cohesion: 0.10
Nodes (36): Page(), Page(), MsSetup(), PaSetup(), CommonFields(), SHORT, common(), Get (+28 more)

### Community 62 - "placeholders.test.ts"
Cohesion: 0.13
Nodes (13): algo, ALL, assertFilled(), bad, candles, flat, FLIP, MS_PA_CODES (+5 more)

### Community 64 - "MarkSession.tsx"
Cohesion: 0.14
Nodes (28): decimalsForTick(), makePriceFormatter(), TICK_TABLE, tickSizeFor(), fmtOf(), countsFromGrade(), AsideSection(), InputMessage() (+20 more)

### Community 65 - "Timeframe"
Cohesion: 0.12
Nodes (16): ArchiveLoader, Timeframe, AGG_TRADES_HEADER, AggTrade, ARCHIVE_BASE_URL, ArchiveFetch, ArchiveFileSpec, ArchiveSource (+8 more)

### Community 66 - "core/src/index.ts"
Cohesion: 0.09
Nodes (28): dynamic, GET(), aggregate(), SeriesByTf, sliceAt(), synthetic_hour(), synthetic_m1(), ALGO_VERSION (+20 more)

### Community 67 - "README.md"
Cohesion: 0.22
Nodes (3): Known Issues — Trading Lab, Не проверено вообще (среда), Открыто

### Community 68 - "SupabaseRepository.ts"
Cohesion: 0.22
Nodes (22): chunks(), IMPORTED_USER_META, ImportOutcome, importSnapshot(), must(), recomputeDerived(), Row, runFirstSignInImport() (+14 more)

### Community 69 - "grade.ts"
Cohesion: 0.18
Nodes (17): Entry, gradeMarks(), Group, groupEvaluated(), groupOf(), iou(), MAJOR, patternSkill() (+9 more)

### Community 70 - "schemas.ts"
Cohesion: 0.09
Nodes (38): ApiError, ApiErrorCode, errorResponse(), toApiError(), validationError(), ValidationIssue, guard(), handleGrade() (+30 more)

### Community 72 - "13. Генерация заданий"
Cohesion: 0.33
Nodes (6): 13.1 Общие правила, 13.2 Market Structure «Разметка» (поправка v1.1, `ALGO_VERSION 1.1.0`), 13.3 Market Structure «Вопрос», 13.4 Price Action, 13.5 Challenge, 13. Генерация заданий

### Community 73 - "Settings"
Cohesion: 0.11
Nodes (16): ImportReport, 1. Принципы, 2. Локальная схема: IndexedDB (Dexie), 3.1 RLS, 3. Схема Supabase Postgres (M7), 4.1 Порядок, 4.2 Правила по таблицам (идемпотентность по `id`, конфликты по `updated_at`), 4.3 Пересчёт производных данных (+8 more)

### Community 75 - "Находки"
Cohesion: 0.22
Nodes (9): 1. HIGH: open redirect в /auth/callback (исправлено), 2. MEDIUM: обход rate limit через X-Forwarded-For (исправлено частично), 4. LOW: /api/cron/keepalive (открыто), 5. LOW: Supabase (повторное чтение 0001_init.sql), 6. LOW: заголовки/CSP (фактически curl на production-сборке), 7. LOW: токены (src/server/token.ts) - корректно, 8. Утечка даты Challenge, 9. Ввод, лимиты, XSS, хранилища (+1 more)

### Community 76 - "live.test.ts"
Cohesion: 0.05
Nodes (39): 2. Карточки, Backend Developer, Chart Developer, DevOps/Security Engineer, Documentation Engineer, Frontend Developer, Market Data Engineer, Orchestrator (+31 more)

### Community 77 - "tasks.ts"
Cohesion: 0.07
Nodes (54): ARCHIVE_START, ArchiveLoaderOptions, CHALLENGE_FUTURE_MS, ChallengeZone, Chunk, countClosedBefore(), cutoffOf(), DAY_MS (+46 more)

### Community 78 - "screens.test.tsx"
Cohesion: 0.12
Nodes (27): metadata, plexMono, plexSans, RootLayout(), viewport, AppShell(), BottomTabs(), DesktopTabs() (+19 more)

### Community 79 - "ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`"
Cohesion: 0.17
Nodes (12): 10.2 Эталон для «Проведи уровень», 10. `findLevels` — уровни поддержки/сопротивления, 15. `resolveTrade` (ADR-0007, уточнения), 18.1 Формат и процесс, 18.2 Участки, 18.3 Что ещё размечается после утверждения (M4/M5), 18. Golden-тесты, 20. Спорные места и вопросы оркестратору (+4 more)

### Community 80 - "ChallengeSession.tsx"
Cohesion: 0.08
Nodes (47): ChallengeSessionPage(), ChallengeApiError, ChallengeErrorKind, fetchNext(), gradeChallenge(), kindOf(), post(), ChallengeSession() (+39 more)

### Community 81 - "AUDIT — финальный дизайн-аудит Trading Lab (M8-UI)"
Cohesion: 0.20
Nodes (9): 1. Итог, 2. Находки, 3. Impeccable detect (по URL production-сборки), 4. Что проверено и ограничения, 5. Порядок исправления, AUDIT — финальный дизайн-аудит Trading Lab (M8-UI), P1, P2 (+1 more)

### Community 82 - "facts.ts"
Cohesion: 0.07
Nodes (44): CHALLENGE_STRUCTURE, computeChallengeFacts(), intersects(), poiFor(), REASON_CODES, reasonValid(), RR_FULL, RR_MIN (+36 more)

### Community 84 - "PRD — Trading Lab"
Cohesion: 0.05
Nodes (41): 10. Приоритизация функций (MoSCoW), 11. План MVP, 12. Открытые вопросы, 1.1 Что это, 1.2 Цель, 1.3 Целевой пользователь, 1.4 Модули, 1. Обзор и цель продукта (+33 more)

### Community 85 - "TaskSession.tsx"
Cohesion: 0.14
Nodes (23): AnswerSessionProps, createTaskApi(), kindOf(), post(), TaskApi, BuildAttemptInput, ChartSkeleton(), copyFor() (+15 more)

### Community 86 - "11. Контекст для PA «Контекст»"
Cohesion: 0.29
Nodes (7): 11.1 Формат ответа (ответ на OQ-16), 11.2 Задание, 11.3 Факторы (детерминированно, для бычьей модели; медвежья — зеркально), 11.4 Значимость (решение), 11.5 Оценка, 11.6 Генерация, 11. Контекст для PA «Контекст»

### Community 87 - "14. Challenge: эталон, оценка качества, WAIT, лимиты"
Cohesion: 0.29
Nodes (7): 14.1 Факты на момент T (`ChallengeFacts`), 14.2 Эталонная сторона `refSide`, 14.3 Оценка качества 0–100 (ответ на OQ-08), независимо от исхода, 14.4 Правильность, вердикт, лимиты, 14.5 Предикаты причин (`ReasonCode`, состав без изменений), 14.6 Подсказки (easy), 14. Challenge: эталон, оценка качества, WAIT, лимиты

### Community 89 - "5. Тренд, BOS и CHoCH"
Cohesion: 0.33
Nodes (6): 5.1 Общие правила, 5.2 Внешний слой — машина состояний с защищёнными уровнями, 5.3 Внутренний слой — «последний подтверждённый swing», 5.4 Что происходит после CHoCH, 5.5 Граничные случаи (проверены на реальных свечах), 5. Тренд, BOS и CHoCH

### Community 90 - "patterns.ts"
Cohesion: 0.14
Nodes (22): 9.1 Состав (ответ на OQ-11), 9.3 Выход, 9.4 Проверенные примеры (BTCUSDT 4h 2026-09, GS-5), 9. Свечные модели Price Action (`detectPatterns`), c4h, found, FindPatternPick, body() (+14 more)

### Community 92 - "package.json"
Cohesion: 0.12
Nodes (21): devDependencies, eslint@^9.39.0, eslint-config-next@^16.0.0, @eslint/js@^9.39.0, @playwright/test@1.63.0, prettier@^3.6.0, @types/node@^22.0.0, typescript@~5.9.3 (+13 more)

### Community 94 - "1. Общие соглашения"
Cohesion: 0.22
Nodes (9): c(), 1.1 Входные свечи, 1.2 Термины свечи, 1.3 ATR, 1.4 Детерминизм и числа, 1.5 ALGO_VERSION, 1.6 Параметры по сложностям (сводка), 1. Общие соглашения (+1 more)

### Community 95 - "7. Order Block"
Cohesion: 0.50
Nodes (4): 7.1 Определение (решение, ICT: «последняя противоположная свеча перед импульсом, сломавшим структуру»), 7.2 Статус (после свечи события `k`, по закрытым свечам), 7.3 Сигнатура, 7. Order Block

### Community 97 - "reveal.ts"
Cohesion: 0.12
Nodes (19): AxisTick, axisTicks(), relativeDuration(), relativeLabel(), STEPS, T, AXIS_H, PRICE_SCALE_W (+11 more)

### Community 98 - "history/route.ts"
Cohesion: 0.06
Nodes (38): ARCHIVE_START_MS, dynamic, errorResponse(), GET(), ISSUE_CODES, querySchema, runtime, SYMBOLS (+30 more)

### Community 99 - "src/feedback/index.ts"
Cohesion: 0.12
Nodes (34): attempt(), block(), buildFeedback(), glyphOf(), OK_BY_SKILL, okFromOutcomes(), decimalsOf(), DIRECTION_RU (+26 more)

### Community 100 - "hints.ts"
Cohesion: 0.36
Nodes (5): external(), selectHints(), time(), 12.4 Совместимость и стоимость пары, 3.4 Отображение в `Mark` (общая модель `ARCHITECTURE.md` §4.2)

### Community 102 - "Стратегия тестирования — Trading Lab"
Cohesion: 0.18
Nodes (10): 10. Производительность, 1. Принципы, 2. Пирамида, 3. Фикстуры, 5. E2E (Playwright), 6. Визуальная проверка и доступность, 7. Критерии «готово» для вехи, 8. CI (GitHub Actions) (+2 more)

### Community 103 - "DrawingPrimitive.ts"
Cohesion: 0.17
Nodes (7): DrawingPrimitive, OpenCandleInfo, PrimitiveState, ZONE_KINDS, dimSpans(), HighlightRange, MarkState

### Community 104 - "6. Внешние API Binance"
Cohesion: 0.40
Nodes (5): status(), 6.1 REST: `GET https://fapi.binance.com/fapi/v1/klines` (браузер), 6.2 WebSocket: kline stream (браузер), 6.3 Архив data.binance.vision (сервер), 6. Внешние API Binance

### Community 105 - "ref_vitest"
Cohesion: 0.18
Nodes (7): contractAttempt(), contractMark, runRepositoryContract(), FakeSupabase, Row, UNIQUE, seedLocal()

### Community 106 - "serialize.ts"
Cohesion: 0.24
Nodes (9): anchor, KINDS, MARKS_FORMAT_VERSION, markSchema, parseMarks(), serializeMarks(), m, validateMarks() (+1 more)

### Community 108 - "@playwright/test"
Cohesion: 0.18
Nodes (12): DATE_LEAK, expandResult(), lastCandleTime(), num(), openReasons(), projectPoint(), SESSION_URL(), startSession() (+4 more)

### Community 109 - "Roadmap — Trading Lab"
Cohesion: 0.29
Nodes (6): MVP, Roadmap — Trading Lab, v1.1 — Fibonacci Playground и Premium/Discount, v1.2 — Elliott Wave Lab, v2, Правила корректировки

### Community 110 - "6. Liquidity sweep"
Cohesion: 0.40
Nodes (5): 6.1 Определение (решение), 6.2 Несколько уровней за одну свечу, 6.3 Граничные случаи, 6.4 Сигнатура, 6. Liquidity sweep

### Community 112 - "pa/index.ts"
Cohesion: 0.09
Nodes (59): buildPa(), reconstructContext(), PoiInfo, computeContext(), CONTEXT_STRUCTURE, ContextAnswer, ContextEvidence, ContextFactorAnswer (+51 more)

### Community 114 - "SettingsScreen.tsx"
Cohesion: 0.12
Nodes (19): Page(), Page(), ProgressScreen(), wrap(), CANDLE_OPTIONS, DAILY_GOAL_MAX, DAILY_GOAL_MIN, DailyGoalStepper() (+11 more)

### Community 116 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, check:tokens, dev, format, lint, sync:tokens, test (+2 more)

### Community 117 - "ProgressScreen.tsx"
Cohesion: 0.10
Nodes (49): Page(), EmptyState(), ErrorState(), LoadingRows(), ContinueBlock(), HomeWeakSpots(), LearnScreen(), MODULES (+41 more)

### Community 119 - "criteria.ts"
Cohesion: 0.36
Nodes (13): body(), bottom(), dojiItems(), engulfItems(), finish(), insideItems(), Item, patternCheck() (+5 more)

### Community 120 - "ms.helpers.ts"
Cohesion: 0.31
Nodes (9): PA(), checkAndSeeResult(), nextThenHomeShowsDone(), openSession(), shot(), tapCandle(), solveOne(), chartBox() (+1 more)

### Community 121 - "handlers.test.ts"
Cohesion: 0.10
Nodes (21): FIX, FixtureLoader, HandlerDeps, CH, challengeDeps(), grade(), Json, loader (+13 more)

### Community 122 - "runCheck.ts"
Cohesion: 0.15
Nodes (16): CheckPanelProps, CheckOutcome, CheckResult, CheckState, CONCEPT_OF, conceptsFor(), RANGE_TAIL_CANDLES, runCheck() (+8 more)

### Community 124 - "ProgressScreen.tsx"
Cohesion: 0.10
Nodes (31): ChallengePage(), buildAttempt(), ChallengeHome(), DIFFS, recentLine(), StartTf, Stats(), TF_OPTIONS (+23 more)

### Community 125 - "QA Report — финальная приёмка MVP Trading Lab (M8)"
Cohesion: 0.29
Nodes (6): 1. Сводка, 2. Таблица AC, 3. Ключевые инварианты, 4. Производительность (headless Chromium, software rendering, CPU throttling 4x), 7. Не удалось проверить, QA Report — финальная приёмка MVP Trading Lab (M8)

### Community 126 - "data/streak.test.ts"
Cohesion: 0.43
Nodes (4): DayStat, prevDay(), softStreak(), done

### Community 127 - "12. `gradeMarks` — сравнение разметки"
Cohesion: 0.25
Nodes (8): 12.1 Сигнатура (расширение `API_CONTRACTS.md`), 12.2 Ключевая свеча метки, 12.3 Группы сопоставления, 12.5 Матчинг (решение: DP по времени вместо венгерского), 12.6 Классификация после матчинга, 12.7 Счёт, вердикт, навыки, 12.8 Пример AC-07 на реальных данных (GS-1), 12. `gradeMarks` — сравнение разметки

### Community 128 - "fixtures"
Cohesion: 0.50
Nodes (3): fixtures, recorded/ - записанные форматы API (fapi/fstream недоступны из облака, 451), Архивные CSV

### Community 129 - "golden.pa-challenge.test.ts"
Cohesion: 0.08
Nodes (18): agg, c1, c15, T0, T1, c4h, FIX, all (+10 more)

### Community 131 - "storage/index.ts"
Cohesion: 0.12
Nodes (27): dynamic, GET(), dynamic, Page(), @supabase/ssr@^0.12.7, AuthContext, AuthRepositoryProvider(), AuthState (+19 more)

### Community 133 - "Подключение Supabase и Vercel (с телефона)"
Cohesion: 0.20
Nodes (10): 1. Проект Supabase, 2. Применить миграцию (создать таблицы), 3. Ключи Supabase, 4. Вход через Google, 5. Redirect URL в Supabase, 6. Vercel, 7. Проверка на телефоне, Если что-то не работает (+2 more)

### Community 134 - "TimeIndex"
Cohesion: 0.10
Nodes (16): lwcProjection(), snapAnchor(), SnapOptions, snapPriceToCandle(), synthetic_candles, T0, T0, TimeIndex (+8 more)

### Community 135 - "Команда агентов — Trading Lab"
Cohesion: 0.25
Nodes (7): 1. Сводка, 3. Правила оркестрации, 4. Формат отчёта агента (до 15 строк), 5. Шаблон задания агенту, 6. Уроки оркестрации, Команда агентов — Trading Lab, Правило graphify (включается в каждый промпт агента, исследующего код)

### Community 140 - "16. Навыки и прогресс"
Cohesion: 0.50
Nodes (4): 16.1 Навыки, 16.2 Обновление точности, 16.3 Адаптивная подборка, 16. Навыки и прогресс

### Community 147 - "8. FVG (Fair Value Gap)"
Cohesion: 0.50
Nodes (4): 8.1 Определение, 8.2 Заполнение, 8.3 Сигнатура, 8. FVG (Fair Value Gap)

## Knowledge Gaps
- **13 isolated node(s):** `ADR-0008`, `ADR-0007`, `ADR-0006`, `ADR-0005`, `ADR-0005` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 984 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Mark` connect `Mark` to `Repository`, `terminal.helpers.ts`, `TimeIndex`, `MsMarkBody.tsx`, `LocalRepository`, `Mark`, `ui/index.ts`, `SupabaseRepository`, `hit.ts`, `PaFindBody.tsx`, `Candle`, `src/types.ts`, `rules.ts`, `GradeError`, `TimeIndex`, `TradingChart`, `src/types.ts`, `session/types.ts`, `placeholders.test.ts`, `MarkSession.tsx`, `SupabaseRepository.ts`, `grade.ts`, `tasks.ts`, `ChallengeSession.tsx`, `TaskSession.tsx`, `1. Общие соглашения`, `hints.ts`, `DrawingPrimitive.ts`, `ref_vitest`, `serialize.ts`, `pa/index.ts`, `handlers.test.ts`, `runCheck.ts`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Mark` (e.g. with `Контекст` and `Последствия`) actually correct?**
  _`Mark` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0008`, `ADR-0007`, `ADR-0006` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `market-structure.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10606060606060606 - nodes in this community are weakly interconnected._
- **Why does `Candle` connect `Candle` to `market-structure.ts`, `golden.pa-challenge.test.ts`, `TimeIndex`, `Mark`, `src/types.ts`, `rules.ts`, `TradingChart.tsx`, `GradeError`, `TimeIndex`, `TradingChart`, `useMarketData.ts`, `session/types.ts`, `MarkSession.tsx`, `Timeframe`, `core/src/index.ts`, `live.test.ts`, `tasks.ts`, `facts.ts`, `TaskSession.tsx`, `patterns.ts`, `6. Внешние API Binance`, `pa/index.ts`, `criteria.ts`, `handlers.test.ts`, `runCheck.ts`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `UtcMs` (e.g. with `1. Общие соглашения` and `4.1 Шкала задания`) actually correct?**
  _`UtcMs` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Repository` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._