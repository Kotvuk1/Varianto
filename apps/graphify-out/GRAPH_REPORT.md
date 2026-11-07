# Graph Report - apps  (2026-11-04)

## Corpus Check
- 228 files · ~81,912 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 1 file(s) not represented in the graph (top: .css 1)

## Summary
- 1469 nodes · 4416 edges · 62 communities (56 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 52 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9e928097`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- tasks.ts
- runCheck.ts
- layout.ts
- session/types.ts
- PaContextBody.tsx
- schemas.ts
- TaskSession.tsx
- handlers.test.ts
- AppShell.tsx
- TradingChart.tsx
- sources.ts
- ProgressScreen.tsx
- TimeIndex
- TradingChart
- token.ts
- history/route.ts
- progressLogic.ts
- MsMarkBody.tsx
- dataSource.ts
- rules.ts
- HomeBlocks.tsx
- Query
- SupabaseRepository.ts
- sessionStore.ts
- ext_packages_core_src_index_ts
- TerminalScreen.tsx
- ChallengeSession.tsx
- AuthProvider.tsx
- controller.ts
- package.json
- useRepository
- i18n/format.ts
- MarkSession.tsx
- react
- ui/index.ts
- reveal.ts
- TaskChart.tsx
- ToolPalette.tsx
- dependencies
- cn
- LocalRepository
- InstructionBar.tsx
- panels.tsx
- SessionActions
- ApiError
- WeakSkillList.tsx
- vitest
- SignInForm.tsx
- BottomSheet
- SupabaseRepository
- compilerOptions
- serialize.ts
- axis.ts
- challenge/api.ts
- Repository
- keepalive/route.ts
- DrawingPrimitive
- scripts
- hints.ts
- next.config.ts
- AGENTS.md
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `react` - 72 edges
2. `vitest` - 51 edges
3. `cn()` - 46 edges
4. `Button()` - 36 edges
5. `TradingChart()` - 33 edges
6. `lucide-react` - 32 edges
7. `ChallengeSession()` - 28 edges
8. `LocalRepository` - 28 edges
9. `MarkSession()` - 27 edges
10. `TerminalScreen()` - 27 edges

## Surprising Connections (you probably didn't know these)
- `RenderStyle` --references--> `ChartTokens`  [EXTRACTED]
  web/src/chart/drawing/render.ts → web/src/chart/theme/chartTokens.ts
- `ChallengeSession()` --indirect_call--> `createSessionStore()`  [INFERRED]
  web/src/features/challenge/ChallengeSession.tsx → web/src/features/challenge/sessionStore.ts
- `call()` --calls--> `GET()`  [EXTRACTED]
  web/app/api/history/route.test.ts → web/app/api/history/route.ts
- `POST()` --calls--> `getDeps()`  [EXTRACTED]
  web/app/api/tasks/[module]/grade/route.ts → web/src/server/deps.ts
- `POST()` --calls--> `getDeps()`  [EXTRACTED]
  web/app/api/tasks/[module]/next/route.ts → web/src/server/deps.ts

## Import Cycles
- None detected.

## Communities (62 total, 6 thin omitted)

### Community 0 - "tasks.ts"
Cohesion: 0.04
Nodes (31): cutoffOf(), depthOf(), buildChallenge(), buildMs(), buildPa(), ChReq, Core, Draft (+23 more)

### Community 1 - "runCheck.ts"
Cohesion: 0.07
Nodes (32): errors, feedback, defaultFmt, FeedbackView(), FeedbackViewProps, Section(), DIR, formatParam() (+24 more)

### Community 2 - "layout.ts"
Cohesion: 0.07
Nodes (39): distToRectEdge(), distToSegment(), Hit, hitTest(), inside(), partScore(), geos(), synthetic_proj (+31 more)

### Community 3 - "session/types.ts"
Cohesion: 0.10
Nodes (36): Page(), Page(), MsSetup(), PaSetup(), CommonFields(), SHORT, common(), CommonParams (+28 more)

### Community 4 - "PaContextBody.tsx"
Cohesion: 0.11
Nodes (32): next, AppError(), Page(), NotFound(), HTF, PaContextBody(), Row(), YN (+24 more)

### Community 5 - "schemas.ts"
Cohesion: 0.06
Nodes (39): dynamic, maxDuration, POST(), runtime, dynamic, maxDuration, POST(), runtime (+31 more)

### Community 6 - "TaskSession.tsx"
Cohesion: 0.13
Nodes (29): AnswerSessionProps, createTaskApi(), kindOf(), post(), TaskApi, buildAttempt(), BuildAttemptInput, saveTaskAttempt() (+21 more)

### Community 7 - "handlers.test.ts"
Cohesion: 0.07
Nodes (22): FROM, getMock, h1, ok, ApiErrorCode, ValidationIssue, FIX, FixtureLoader (+14 more)

### Community 8 - "AppShell.tsx"
Cohesion: 0.10
Nodes (28): metadata, plexMono, plexSans, RootLayout(), viewport, wrap(), AppShell(), BottomTabs() (+20 more)

### Community 9 - "TradingChart.tsx"
Cohesion: 0.11
Nodes (28): lightweight-charts, OpenCandleInfo, PrimitiveState, ZONE_KINDS, dimSpans(), HighlightRange, MarkState, lwcProjection() (+20 more)

### Community 10 - "sources.ts"
Cohesion: 0.08
Nodes (21): ADR-0006, ARCHIVE_START, ArchiveLoader, ArchiveLoaderOptions, CHALLENGE_FUTURE_MS, ChallengeZone, Chunk, countClosedBefore() (+13 more)

### Community 11 - "ProgressScreen.tsx"
Cohesion: 0.13
Nodes (25): ChallengePage(), Page(), ChallengeHome(), DIFFS, recentLine(), StartTf, Stats(), TF_OPTIONS (+17 more)

### Community 12 - "TimeIndex"
Cohesion: 0.10
Nodes (18): snapAnchor(), SnapOptions, snapPriceToCandle(), synthetic_candles, T0, T0, TimeIndex, cs (+10 more)

### Community 13 - "TradingChart"
Cohesion: 0.13
Nodes (15): DrawKind, DrawingController, bosMark, breakIdx, drag(), index, lvl, proj (+7 more)

### Community 14 - "token.ts"
Cohesion: 0.10
Nodes (24): dynamic, GET(), ConfigError, b64(), derive(), getSigningSecret(), HeaderSchema, keyCache (+16 more)

### Community 15 - "history/route.ts"
Cohesion: 0.11
Nodes (20): ARCHIVE_START_MS, dynamic, errorResponse(), GET(), ISSUE_CODES, querySchema, runtime, SYMBOLS (+12 more)

### Community 16 - "progressLogic.ts"
Cohesion: 0.11
Nodes (18): asCore(), ErrorExample, ErrorGroup, groupByModule(), hasEnoughData(), MODULE_ORDER, moduleAccuracies(), ModuleAccuracy (+10 more)

### Community 17 - "MsMarkBody.tsx"
Cohesion: 0.14
Nodes (24): Page(), MsMarkBody(), highlightMarks(), MsQuestionBody(), MsSessionScreen(), msQuestionAnswer(), AnswerList(), msBody() (+16 more)

### Community 18 - "dataSource.ts"
Cohesion: 0.11
Nodes (19): ARCHIVE_MIN_AGE_MS, ARCHIVE_SYMBOLS, archiveAllowed(), archivePageSize(), archiveWindow(), HISTORY_PAGE, PRESET_SYMBOLS, resolveSourceMode() (+11 more)

### Community 19 - "rules.ts"
Cohesion: 0.16
Nodes (24): normalizeMark(), better(), BreakResult, clampIdx(), Direction, extreme(), FvgResult, isPivot() (+16 more)

### Community 20 - "HomeBlocks.tsx"
Cohesion: 0.18
Nodes (17): Page(), Page(), ErrorState(), LoadingRows(), ContinueBlock(), HomeWeakSpots(), LearnScreen(), MODULES (+9 more)

### Community 21 - "Query"
Cohesion: 0.09
Nodes (4): FakeSupabase, Query, Row, UNIQUE

### Community 22 - "SupabaseRepository.ts"
Cohesion: 0.21
Nodes (22): chunks(), IMPORTED_USER_META, ImportOutcome, ImportReport, importSnapshot(), must(), recomputeDerived(), Row (+14 more)

### Community 23 - "sessionStore.ts"
Cohesion: 0.14
Nodes (18): defaultLevels(), roundToTick(), Side, atrOf(), createSessionStore(), INITIAL, Phase, SessionState (+10 more)

### Community 24 - "ext_packages_core_src_index_ts"
Cohesion: 0.18
Nodes (10): DailyActivityRow, SkillStatRow, TerminalMarksRow, LocalSnapshot, mark, DailyActivity, SKILL_WINDOW, SkillId (+2 more)

### Community 25 - "TerminalScreen.tsx"
Cohesion: 0.18
Nodes (17): TerminalPage(), decimalsForTick(), makePriceFormatter(), TICK_TABLE, tickSizeFor(), fmtOf(), normalizeSymbolInput(), InstructionBar() (+9 more)

### Community 26 - "ChallengeSession.tsx"
Cohesion: 0.16
Nodes (16): ChallengeSessionPage(), buildAttempt(), ChallengeSession(), FOCUS_SKILLS, SHEET_PAD, useDesktop(), ErrorBlock(), errorCopy() (+8 more)

### Community 27 - "AuthProvider.tsx"
Cohesion: 0.22
Nodes (15): ADR-0008, @supabase/ssr, dynamic, GET(), AuthContext, AuthRepositoryProvider(), AuthState, DISABLED (+7 more)

### Community 28 - "controller.ts"
Cohesion: 0.15
Nodes (17): PointerKind, constrainAnchors(), createMark(), FULL_WIDTH_KINDS, isDrawKind(), isScopedKind(), MarkExtra, RAY_RIGHT_KINDS (+9 more)

### Community 29 - "package.json"
Cohesion: 0.12
Nodes (19): fake-indexeddb, jsdom, tailwindcss, @tailwindcss/postcss, @types/react, @types/react-dom, devDependencies, fake-indexeddb@^6.2.7 (+11 more)

### Community 30 - "useRepository"
Cohesion: 0.18
Nodes (15): DayStat, prevDay(), softStreak(), done, AsyncState, DailyProgress, useAttempts(), useDailyProgress() (+7 more)

### Community 31 - "i18n/format.ts"
Cohesion: 0.22
Nodes (18): EmptyState(), FORMATTERS(), ErrorLog(), errorName(), fmtPrice(), Review(), textOf(), buildErrorLog() (+10 more)

### Community 32 - "MarkSession.tsx"
Cohesion: 0.30
Nodes (16): GradeLegendToggle(), countsFromGrade(), AsideSection(), InputMessage(), RadioOption, SubmitButton(), AnswerSession(), MarkSession() (+8 more)

### Community 33 - "react"
Cohesion: 0.14
Nodes (14): react, @testing-library/react, @testing-library/user-event, Trigger(), USED, Segmented(), SegmentedProps, Harness() (+6 more)

### Community 34 - "ui/index.ts"
Cohesion: 0.18
Nodes (13): Badge(), BadgeProps, ButtonProps, ButtonSize, ButtonVariant, SIZE, VARIANT, ProgressBarProps (+5 more)

### Community 35 - "reveal.ts"
Cohesion: 0.15
Nodes (14): ADR-0007, partMax(), ResultView(), DIR_RU, formatScenarioDate(), localizeParam(), POI_RU, resolutionNote() (+6 more)

### Community 36 - "TaskChart.tsx"
Cohesion: 0.18
Nodes (15): ToolId, ControllerNotice, TimeWindow, TradingChartProps, MarkState, tailRange(), TaskChartProps, Cell() (+7 more)

### Community 37 - "ToolPalette.tsx"
Cohesion: 0.19
Nodes (16): GroupId, groupOf(), GROUPS, HOTKEY_OF, HOTKEYS, ic, MOBILE_GROUPS, TerminalTool (+8 more)

### Community 38 - "dependencies"
Cohesion: 0.11
Nodes (18): dexie, react-dom, @supabase/supabase-js, @tl/core, @tl/market-data, zustand, dependencies, dexie@^4.0.0 (+10 more)

### Community 39 - "cn"
Cohesion: 0.19
Nodes (14): lucide-react, ORDER, ResultSheet(), ResultSheetHeight, ResultSheetProps, SHEET_CLASS, SHEET_PAD, SessionLayoutProps (+6 more)

### Community 40 - "LocalRepository"
Cohesion: 0.14
Nodes (5): TradingLabDB, defaultSettings(), LocalRepository, Attempt, AttemptFilter

### Community 41 - "InstructionBar.tsx"
Cohesion: 0.24
Nodes (11): NoticeCode, InstructionBarProps, instructionText(), MarksSheet(), MarksSheetProps, describeMark(), formatWhen, markName() (+3 more)

### Community 42 - "panels.tsx"
Cohesion: 0.26
Nodes (14): blockerKey(), DecisionPanel(), PriceField(), AnswerInput, buildAnswer(), formatRR(), parsePrice(), PositionIssue (+6 more)

### Community 44 - "ApiError"
Cohesion: 0.24
Nodes (16): ApiError, validationError(), readJsonBody(), loadClosedBefore(), gradeChallengeTask(), gradeMsMark(), gradeMsQuestionTask(), gradePaContext() (+8 more)

### Community 45 - "WeakSkillList.tsx"
Cohesion: 0.25
Nodes (10): ModuleAccuracy(), canTrain(), trendOf(), SkillsTab(), WeakSkillList(), formatPercent(), ERROR_NAMES_RU, pr (+2 more)

### Community 46 - "vitest"
Cohesion: 0.20
Nodes (7): vitest, fmt, t, contractAttempt(), contractMark, runRepositoryContract(), seedLocal()

### Community 47 - "SignInForm.tsx"
Cohesion: 0.25
Nodes (10): dynamic, Page(), Probe(), useAuth(), callbackUrl(), SignInForm(), google(), magic() (+2 more)

### Community 48 - "BottomSheet"
Cohesion: 0.21
Nodes (10): BottomSheet(), BottomSheetProps, HEIGHT, SheetHeight, Harness(), Hint(), HintProps, Select() (+2 more)

### Community 49 - "SupabaseRepository"
Cohesion: 0.32
Nodes (3): must(), SupabaseRepository, Settings

### Community 50 - "compilerOptions"
Cohesion: 0.17
Nodes (11): ../../tsconfig.base.json, compilerOptions, allowJs, incremental, jsx, lib, paths, plugins (+3 more)

### Community 51 - "serialize.ts"
Cohesion: 0.21
Nodes (10): zod, zod@^4.0.0, anchor, KINDS, MARKS_FORMAT_VERSION, markSchema, parseMarks(), serializeMarks() (+2 more)

### Community 52 - "axis.ts"
Cohesion: 0.27
Nodes (9): AxisTick, axisTicks(), relativeDuration(), relativeLabel(), STEPS, T, AXIS_H, PRICE_SCALE_W (+1 more)

### Community 53 - "challenge/api.ts"
Cohesion: 0.25
Nodes (7): ChallengeApiError, ChallengeErrorKind, fetchNext(), gradeChallenge(), kindOf(), post(), toError()

### Community 55 - "keepalive/route.ts"
Cohesion: 0.32
Nodes (3): dynamic, GET(), safeEqual()

### Community 57 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, start, test, typecheck

### Community 58 - "hints.ts"
Cohesion: 0.53
Nodes (3): external(), selectHints(), time()

## Knowledge Gaps
- **6 isolated node(s):** `ADR-0008`, `ADR-0007`, `ADR-0006`, `ADR-0005`, `ADR-0005` (+1 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 431 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `runCheck.ts`, `session/types.ts`, `PaContextBody.tsx`, `TaskSession.tsx`, `AppShell.tsx`, `TradingChart.tsx`, `ProgressScreen.tsx`, `MsMarkBody.tsx`, `dataSource.ts`, `HomeBlocks.tsx`, `ext_packages_core_src_index_ts`, `TerminalScreen.tsx`, `ChallengeSession.tsx`, `AuthProvider.tsx`, `package.json`, `useRepository`, `i18n/format.ts`, `MarkSession.tsx`, `ui/index.ts`, `TaskChart.tsx`, `ToolPalette.tsx`, `dependencies`, `cn`, `InstructionBar.tsx`, `panels.tsx`, `SignInForm.tsx`, `BottomSheet`, `axis.ts`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **What connects `ADR-0008`, `ADR-0007`, `ADR-0006` to the rest of the system?**
  _6 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `tasks.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.04283447911158118 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `vitest` to `runCheck.ts`, `layout.ts`, `PaContextBody.tsx`, `TaskSession.tsx`, `handlers.test.ts`, `AppShell.tsx`, `TradingChart.tsx`, `sources.ts`, `ProgressScreen.tsx`, `TimeIndex`, `TradingChart`, `token.ts`, `history/route.ts`, `progressLogic.ts`, `dataSource.ts`, `rules.ts`, `HomeBlocks.tsx`, `sessionStore.ts`, `ext_packages_core_src_index_ts`, `TerminalScreen.tsx`, `AuthProvider.tsx`, `package.json`, `useRepository`, `i18n/format.ts`, `react`, `reveal.ts`, `panels.tsx`, `SignInForm.tsx`, `BottomSheet`, `serialize.ts`, `axis.ts`, `keepalive/route.ts`, `hints.ts`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Should `runCheck.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06753246753246753 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `cn` to `runCheck.ts`, `session/types.ts`, `PaContextBody.tsx`, `TaskSession.tsx`, `AppShell.tsx`, `ProgressScreen.tsx`, `HomeBlocks.tsx`, `TerminalScreen.tsx`, `ChallengeSession.tsx`, `package.json`, `MarkSession.tsx`, `react`, `ui/index.ts`, `TaskChart.tsx`, `ToolPalette.tsx`, `dependencies`, `InstructionBar.tsx`, `panels.tsx`, `BottomSheet`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Should `layout.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06868686868686869 - nodes in this community are weakly interconnected._