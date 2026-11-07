# CURRICULUM_STAGES — курс из ступеней: спецификация ступеней 1–4, комбинированных модулей, прогресса и открытия

Версия документа: 1.0 (черновик на утверждение оркестратором), 2026-11-07. Автор: Technical Analyst.
`ALGO_VERSION` после реализации: **`2.0.0`** (MAJOR по `ALGORITHMS.md` §1.5: меняется набор оцениваемых понятий Market Structure на тех же свечах, §9). Новая константа **`CUR_ALGO_VERSION = '1.0.0'`** для правил ступеней 2–4 и комбинированных модулей (зоны, сила, реакция, лимитка, SL/TP, `resolveLimitTrade`, рубрики); пишется в golden `cur_*` и в `params` токена. `ANALYSIS_ALGO_VERSION = 1.0.0`, `FIB_ALGO_VERSION`, `EW_ALGO_VERSION` не меняются.
Источники: `docs/CURRICULUM.md` (решения пользователя от 2026-11-07, обязательны); `docs/specs/ALGORITHMS.md` (§1 соглашения, §2–§5 swing/структура, §7 OB, §8 FVG, §10 `findLevels`, §12 `gradeMarks`, §13 генерация, §14.4 лимиты, §15 `resolveTrade`, §16 навыки, §17 шаблоны); `docs/specs/FIBONACCI.md` (§6.3 правило реакции по закрытию, `TaskReplay`, relative-шкала); `docs/specs/ELLIOTT.md` (§11 рубрика, «исход не входит в счёт»); код `packages/core/src/{tasks,pa,challenge,progress,feedback}`, `apps/web/src/server/{schemas,tasks,handlers}.ts`, `supabase/migrations/0001–0004`.
Проверка на реальных данных: все примеры, пороги и golden (§14) получены на архивах data.binance.vision (USDⓈ-M futures, monthly klines), zip сверены с `.CHECKSUM`; sha256 CSV совпали с фикстурами репозитория (§14.1), новых фикстур не требуется. Расчёты — исследовательский скрипт на TypeScript поверх `@tl/core` (`findLevels`, `analyzeStructure`, `atr14`) и прототипа правил этого документа; ключевые свечи каждого golden сверены вручную по OHLC.

Условные обозначения: **(решение)** — выбор между вариантами с обоснованием; **(новое)** — дополнение к словарям `API_CONTRACTS.md`; **(вопрос)** — вынесено оркестратору (§19).

---

## 1. Область, термины, соглашения

### 1.1 Курс
| Ступень | `ModuleId` | Задания (`kind`) | Будущее (проигрывание) | Шкала |
|---|---|---|---|---|
| 1 Свинги | `stage-swings` **(новое)** | `sw-mark` «Разметь свинги», `sw-trend` «Тренд по свингам» | нет | absolute |
| 2 Уровни | `levels` **(новое)** | `lv-strongest` «Найди сильнейший уровень», `lv-zone` «Отметь зону», `lv-reaction` «Какой уровень сработает» | только `lv-reaction` | absolute / relative |
| 3 Лимитный вход | `limit-entry` **(новое)** | `limit-entry` | да | relative |
| 4 Стоп и тейк | `stop-take` **(новое)** | `stop-take` | да | relative |
| 5 Smart Money Concepts | `market-structure` (есть) | `ms-mark`, `ms-question` — переразметка сложностей §9 | нет | absolute |
| 6 Свечные модели | `price-action` (есть) | `pa-find`, `pa-context`; `pa-level` переезжает в ступень 2 | нет | absolute |
| 7 Фибоначчи | `fibonacci` (есть) | без изменений | — | — |
| 8 Волны Эллиотта | `elliott` (есть) | без изменений | — | — |
| Комбо «Уровень + лимитка + стоп/тейк» | `combo-level-trade` **(новое)** | `combo-level-trade` | да | relative |
| Комбо «SMC-вход» | `combo-smc-entry` **(новое)** | `combo-smc-entry` | да | relative |
| Trading Challenge | `challenge` (есть) | без изменений | да | relative |

Отдельное задание «разметить все свинги» есть только в ступени 1 (`CURRICULUM.md`); в ступени 5 swing и HH/HL/LH/LL больше не оцениваются как отдельные метки (§9.1), а остаются частью меток BOS/CHoCH (якорь на пробитом swing) и места стопа (ступени 4, комбо).

### 1.2 Переиспользуемые соглашения (без изменений)
- Только закрытые свечи (`closedOnly`), видимая история 500 свечей (1d — 365), пропуск в видимом ряду или в будущем на лимит проигрывания — отбраковка (`ALGORITHMS.md` §1.1, §13.1). Monthly-архивы 2026-10 не содержат свечей 2026-10-28 (`ELLIOTT.md` §17 п.11) — такие окна отбраковываются.
- ATR14 — простое среднее TR (`ALGORITHMS.md` §1.3); `A` в этом документе — `ATR14` последней видимой свечи задания, если не сказано иное.
- Сравнения цен свечей — точные; касание с равенством — касание (`ALGORITHMS.md` §15 п.1). Производные пороги вычисляются ровно по формулам документа (сначала цена порога, затем сравнение с ценой свечи или ответа), без округления в ядре.
- Случайность — только `mulberry32(seed)`; T на сетке 15m, данные старше 2 суток; до 200 попыток на критерий.
- Лимиты проигрывания `TIME_LIMIT_CANDLES` (`ALGORITHMS.md` §14.4): 15m — 96, 1h — 72, 4h — 60, 1d — 30.
- Разбор — 6 частей (`ALGORITHMS.md` §17.1), исход проигрывания не входит в оценку качества там, где сказано (ступень 4, комбо), как в Challenge и Elliott.

### 1.3 Обозначения
- `side`: `LONG` — сделка от поддержки (зона ниже цены), `SHORT` — от сопротивления. Все формулы даны для `LONG`; `SHORT` — зеркально (`low`↔`high`, `+`↔`−`, `min`↔`max`, «ниже»↔«выше»).
- Зона `Z = [Zb, Zt]`; **ближний край** `Zn` — край, к которому подходит цена (`Zt` для LONG, `Zb` для SHORT); **дальний край** `Zf` — противоположный; `h = (Zt − Zb) / A` — высота в ATR; `mid = (Zb + Zt) / 2`.
- `P = close` последней видимой свечи (индекс `T`).

### 1.4 Параметры (сводка)
| Параметр | Значение | Раздел |
|---|---|---|
| Фрактал уровней `n`, `lookback`, `minTouches`, кластер `W` | 3, 300, 2, `min(max(0.5·A, 0.002·P), 0.01·P)` | `ALGORITHMS.md` §10.1 (без изменений) |
| Минимальная высота зоны `hMin` | `0.2·A` | 3.1 |
| Реакция касания (для силы) | ход ≥ `2·ATR14[s]` за 10 свечей | 3.2 |
| Зона подхода `BAND_K` | `0.5·A` перед ближним краем | 4.1 |
| Порог реакции `THR_K` | `1.5·A` от экстремума, по закрытию | 4.1 |
| Пробой зоны | закрытие за дальним краем | 4.1 |
| Допуск края зоны (`lv-zone`) | `0.1·A`; лишняя высота ≤ `1.0·A` | 3.5 |
| Расстояние зоны от цены | `lv-strongest`/`lv-zone` 0–5·A; ступени 3, 4, комбо 1–4·A; `lv-reaction`, SMC 1–6·A | 3, 5, 6, 8 |
| Полоса лимитки «по правилам» | от `0.3·A` перед ближним краем до `0.1·A` внутрь зоны | 5.3 |
| Запас стопа | `[0.25·A, 1.5·A]` за структурной точкой `Pl` | 6.2 |
| Полоса тейка | `0.5·A` перед целью | 6.3 |
| R:R | полный балл ≥ 2, половина ≥ 1.5 | 6.4 |
| Открытие комбо | ≥ 10 заданий и точность ≥ 70% по каждой составной ступени | 10.3 |

---

## 2. Ступень 1 «Свинги» (`stage-swings`)

### 2.1 Что выносится из Market Structure
- Текущий MS «Разметка» easy (`concepts = ['swing']`, `nExt = 7`, окно ≤ 60) целиком переходит в `sw-mark` easy без изменения правил оценки.
- HH/HL/LH/LL (`structure-labels`) из MS medium/hard переходят в `sw-mark` medium/hard.
- Из MS удаляются: сложность «только swing», понятия `swing` и `structure-labels` в `concepts` (метки пользователя этих типов — `ignored`, `ALGORITHMS.md` §12.3). MS становится ступенью 5 с переразмеченными сложностями (§9).

### 2.2 `sw-mark` «Разметь свинги» (переиспользование `selectMsMarkTask` + `gradeMarks`)
| Сложность | `concepts` | `nExt` | Окно (макс.), свечей | Обязательных меток | Доп. критерий T | ТФ |
|---|---|---|---|---|---|---|
| easy | `swing` | 7 | 60 | 4–12 | — | 1h, 4h, 1d |
| medium | `swing`, `structure-labels` | 7 | 60 | 4–12 | в эталоне окна ≥ 1 метка из {HH, LH} и ≥ 1 из {HL, LL} | 15m, 1h, 4h, 1d |
| hard | `swing`, `structure-labels` | 5 | 70 | 4–12 | как medium | 15m, 1h, 4h, 1d |
- Сужение окна при избытке меток и выбор другого T — как `ALGORITHMS.md` §13.2 (шаг 4 свечи, не уже 40). `scoped = false`, `nInt = null`, `toleranceCandles = 2`, правила дублей ошибок swing/подписи — §13.2.
- Реализация (запрос Backend): параметризовать `msParamsFor`/`msConceptsFor`/`checkMsWindow` таблицей «ступень × сложность» вместо жёсткой привязки к MS; генерация и оценка — тот же код.
- Обоснование окон (данные §16.3): swing N=7 в окне 60 — 4–6 меток в 81% окон; swing + подписи N=7 в 60 — 8–12 меток в 81%; N=5 в окне 40 — 8–12 в 74%: границы 4–12 достигаются без ослабления.

### 2.3 `sw-trend` «Какой тренд по свингам?»
**Определение `swingTrend` (решение, новое).** На видимом ряду строятся внешние swing `detectSwings` с `N = nExt` сложности и метки §4 `ALGORITHMS.md`. `H1` — последний swing high, `L1` — последний swing low (оба подтверждены к T по построению):
- `up`, если `H1.label = HH` и `L1.label = HL`;
- `down`, если `H1.label = LH` и `L1.label = LL`;
- `range` — иначе (`HH + LL` — расширение, `LH + HL` — сжатие);
- `label = null` у `H1` или `L1` — задание не генерируется.
Это тренд по последовательности экстремумов (Dow), а **не** тренд машины BOS/CHoCH (`ALGORITHMS.md` §5.2), который проверяет шаблон `trend` ступени 5. Различие — осознанная часть курса: на реальных данных они расходятся часто (§16.3), см. SW-1 (§14.2).
- Окно вопроса: последние 120 свечей; `H1`, `L1` и предыдущие swing того же типа обязаны лежать в окне (иначе другое T).
- Сложности: easy — `N = 7`, ТФ 1h/4h, `hints` = алгоритмические swing окна без подписей; medium — `N = 7`, без подсказок; hard — `N = 5`, без подсказок, доля T, где `swingTrend` ≠ тренду BOS (`none` → `range`), не ниже 50% (выбор по `seed`).
- Балансировка: желаемый ответ по `seed` равновероятно из `up/down/range`, до 200 попыток, затем любой (распределение без балансировки при N=7: range 48%, up 30%, down 22%; при N=5 — 49% / 32% / 19%, §16.3).
- Оценка: `correct`/`incorrect`, `score` 1/0; ошибка `SWING_TREND_WRONG` (major); навык `swing-trend`, `total = 1`.

---

## 3. Ступень 2 «Уровни» (`levels`) — зоны, сила, типы

### 3.1 Зона уровня `levelZone` (решение)
Уровень — кластер `findLevels` (`ALGORITHMS.md` §10.1, без изменений). Зона:
```ts
function levelZone(l: Level, A: number): { bottom: number; top: number } {
  const hMin = 0.2 * A;
  if (l.high - l.low >= hMin) return { bottom: l.low, top: l.high };
  return { bottom: Math.min(l.low, l.center - hMin / 2), top: Math.max(l.high, l.center + hMin / 2) };
}
```
- Зона — разброс экстремумов (фитилей) swing кластера: там, где цена разворачивалась. Тела свечей в зону не входят: правило «до тела» дало бы зависимость от цвета свечей и неустойчивые границы на 15m. Минимальная высота `0.2·A` убирает вырожденные зоны из одного-двух swing с почти равными ценами.
- Реальные высоты (данные §16.1): медиана `0.375·A`, 90-й перцентиль `0.494·A` (верх ограничен шириной кластера `W`).

### 3.2 Тип и сила уровня (решение)
- **Роль** — `type` из `findLevels`: `support` (`high < P`), `resistance` (`low > P`); `inside` в заданиях ступени 2 не используется.
- **Флип** `flip = true`, если кластер содержит и swing high, и swing low (уровень менял роль). Показывается в разборе и в подсказке, в силу не входит (данные: 0.54 против 0.52 удержаний, §16.1).
- **Компоненты силы** (по видимому ряду, индексы — в нём):
  - `touches` — число swing кластера;
  - `reactions` — число swing `s` кластера, после которых за свечи `(s.index, min(s.index + 10, n − 1)]` цена ушла от `s.price` не меньше `2·ATR14[s.index]` (swing low: `max(high) − s.price`; swing high: `s.price − min(low)`); при `ATR14[s.index] = null` касание не считается;
  - `age = n − 1 − lastTouchIndex`; `recency = 1` при `age ≤ 50`, `0.5` при `age ≤ 150`, иначе `0`;
  - `htf = 1`, если `findLevels` на ряду старшего ТФ (`HTF_OF`: 15m→1h, 1h→4h, 4h→1d; для 1d — всегда 0), закрытом к T, содержит уровень `h` с `inLevelZone(l.center, h)` (±0.3%); иначе 0.
- **Сила** `strength = touches + 0.5·reactions + recency + htf`.
- **Ранжирование** `rankStrength`: `strength` по убыванию, затем `touches` по убыванию, `lastTouchIndex` по убыванию, `|center − P|` по возрастанию.
- **Расстояние** `dist = (P − Zt) / A` для поддержки, `(Zb − P) / A` для сопротивления.
- Обоснование и оговорка: сила — общепринятая шкала «больше касаний, сильнее реакции, свежее, видна на старшем ТФ»; это правило чтения графика, а **не** прогноз. На данных (§16.1) ни один компонент не меняет долю удержаний заметно (0.48–0.63 при базовой 0.53); сильнее влияет направление внешнего тренда (0.58 по тренду против 0.48 против тренда). Поэтому `lv-strongest`/`lv-zone` оценивают чтение по правилу, а прогноз (`lv-reaction`) не входит в критерий «пройдено» (§10.2). **(вопрос)** §19 п.1.

### 3.3 Генерация заданий ступени 2
- Видимая история как в MS; кандидаты — уровни роли `role` с `0 ≤ dist ≤ 5`; эталон `ref = rankStrength[0]`.
- Однозначность: `ref.touches ≥ 3` (easy ≥ 2) и `ref.strength ≥ second.strength + 1` (если второй кандидат есть).
- Сложности: easy — ТФ 1h/4h, `role` задана, `hints` = swing N=3 последних 300 свечей; medium — 15m–1d, `role` задана; hard — `role = null` (кандидаты обеих ролей, эталон — сильнейший из всех), флип-уровни допускаются.

### 3.4 `lv-strongest` «Найди сильнейший уровень» (расширение «Проведи уровень»)
Ответ — цена горизонтали `u`. Попадание в уровень `l`: `hit(u, l) = inLevelZone(u, l) || (Zb(l) ≤ u ≤ Zt(l))` (допуск ±0.3% `ALGORITHMS.md` §10.2 сохраняется).
| Ситуация (первая подходящая) | verdict | score | Код |
|---|---|---|---|
| `hit(u, ref)` | correct | 1 | `OK_LEVEL` |
| `hit(u, l)` для другого кандидата той же роли (на hard — любой роли) с `touches ≥ 2` | partial | 0.5 | `LEVEL_NOT_STRONGEST` (minor) |
| `hit(u, l)` для уровня противоположной роли (только при заданной `role`) | incorrect | 0 | `LEVEL_WRONG_TYPE` (major) |
| иначе | incorrect | 0 | `LEVEL_OFF_TOLERANCE` (major) |
Навык `pa-level` (id сохраняется ради накопленной статистики, §10.1): `correct = 1` только при `correct`.

### 3.5 `lv-zone` «Отметь зону»
Ответ — метка `zone` **(новое `MarkKind`)**: 2 якоря `[{time, price: верх}, {time, price: низ}]` (как у OB, `ALGORITHMS.md` §3.4); сервер берёт `ub = min`, `ut = max` цен; время якорей должно лежать в видимом ряду. `tol = 0.1·A`, `H = Zt − Zb`, `share(l) = max(0, min(ut, Zt(l)) − max(ub, Zb(l))) / (Zt(l) − Zb(l))`.
| Ситуация (первая подходящая) | verdict | score | Код |
|---|---|---|---|
| `ub ≤ Zb + tol` и `ut ≥ Zt − tol` (накрывает ядро) и `ut − ub ≤ H + 1.0·A` | correct | 1 | `OK_ZONE` |
| накрывает ядро, но `ut − ub > H + 1.0·A` | partial | 0.5 | `ZONE_TOO_WIDE` (minor) |
| `share(ref) ≥ 0.5` | partial | 0.5 | `ZONE_EDGE_OFF` (minor) |
| `share(l) ≥ 0.5` для другого кандидата той же роли | partial | 0.5 | `LEVEL_NOT_STRONGEST` (minor) |
| `share(l) ≥ 0.5` для уровня противоположной роли | incorrect | 0 | `LEVEL_WRONG_TYPE` (major) |
| иначе | incorrect | 0 | `ZONE_OFF` (major) |
Обоснование: IoU (как у OB) штрафует обычную практику рисовать зону шире ядра; правило «накрой ядро, не шире ядра + 1 ATR» проверяет главное — что зона содержит места разворотов и пригодна для лимитки и стопа. Навык `level-zone`: `correct = 1` только при `correct`.

### 3.6 `lv-reaction` «Какой уровень сработает» (проигрывание)
- **Варианты:** пул — уровни роли (по `side`) с `1 ≤ dist ≤ 6`, `touches ≥ 3`, по `rankStrength`; жадно берутся до `K` зон (easy/medium `K = 2`, hard `K = 3`), каждая следующая — только если отделена от всех выбранных: дальний край более близкой зоны отстоит от ближнего края более далёкой не меньше чем на `0.5·A` (зоны подхода не перекрываются). Выбранные сортируются по `dist`; id `z1…zK` по близости; на hard добавляется `none` («ни один не удержит»).
- **Исход** — `resolveZoneChain` (§4.2). Генерация: исход `reaction` (или `none` на hard); желаемый ответ по `seed` равновероятно из вариантов; отбраковка `no-touch`, `timeout`.
- **Оценка:** `correct` (1) при совпадении, иначе `incorrect` (0), код по ситуации: выбранная зона пробита — `LEVEL_REACTION_BROKEN`; выбрана более далёкая зона, а реакция была раньше — `LEVEL_REACTION_EARLIER`; выбран `none`, а зона удержала — `LEVEL_REACTION_FALSE_NONE` (все major). Навык `level-reaction` (информационный, §10.2).
- `replay = { tf, candles: (T, min(e + 10, T + limit)], exitIndex: e }`, `e` — свеча реакции или последнего пробоя; `reference` — зоны вариантов с `meta.strength`, `meta.touches`, `meta.flip`, метка исхода.

---

## 4. Общий детектор реакции у зоны

### 4.1 `resolveZoneReaction` (решение)
```ts
interface ZoneReaction { kind: 'reaction' | 'break' | 'no-touch' | 'timeout'; t0: number; m: number; mIndex: number; e: number }
function resolveZoneReaction(c: Candle[] /* с будущим */, T: number, Z: Zone, side: Side, A: number, limit: number): ZoneReaction {
  const band = Zn + 0.5 * A, thr = 1.5 * A;          // LONG
  for (let j = T + 1; j <= T + limit; j++) {
    if (t0 < 0) { if (low[j] <= band) { t0 = j; m = low[j]; mIndex = j; } else continue; }
    else if (low[j] < m) { m = low[j]; mIndex = j; }    // при равенстве — ранняя
    if (close[j] < Zf) return { kind: 'break', t0, m, mIndex, e: j };
    if (close[j] >= m + thr) return { kind: 'reaction', t0, m, mIndex, e: j };
  }
  return { kind: t0 < 0 ? 'no-touch' : 'timeout', t0, m, mIndex, e: T + limit };
}
```
- Порядок на свече: вход в зону подхода → обновление экстремума → пробой → реакция (свеча, закрывшаяся за дальним краем, — пробой, даже если она же сделала новый экстремум). Всё по закрытию, кроме входа в зону подхода и экстремума; drill-down не нужен.
- Зона подхода `0.5·A` перед ближним краем нужна потому, что 38% реакций разворачиваются, не коснувшись ближнего края (§16.2): без неё фронтраннинг уровня был бы «не реакцией».
- Порог `1.5·A` по закрытию — то же правило, что реакция Fibonacci (`FIBONACCI.md` §6.3), без доли импульса (импульса здесь нет).

### 4.2 `resolveZoneChain` (несколько зон, `lv-reaction`)
Обход свечей по возрастанию; текущая зона `k = 0`. На свече `j` в цикле: если зона `k` ещё не «вошла» — проверка входа в её зону подхода (иначе переход к следующей свече); обновление `m`; закрытие за дальним краем зоны `k` → зона пробита, `k++`, **та же свеча** проверяется для зоны `k + 1` (одна свеча может пробить несколько зон: LV-5); реакция `close ≥ m + thr` → исход `reaction` зоны `k`. `k = K` → исход `none`. Лимит — как §4.1.

---

## 5. Ступень 3 «Лимитный вход» (`limit-entry`)

### 5.1 Генерация
- Зона — эталон §3.3 роли по `side` (`role` задана на всех сложностях), `1 ≤ dist ≤ 4`.
- Исход `resolveZoneReaction` — только `reaction` в пределах лимита **(решение)**: в ступени 3 нет стопа, и исполнение на пробивающемся уровне нельзя оценить без SL; пробои учатся в ступени 4 и комбо (§19 п.4).
- Сложности: easy — ТФ 1h/4h, `hints` — горизонтали ближнего края, середины и опережения `0.2·A`; medium — 15m/1h/4h; hard — 15m/1h/4h, доля задач с реакцией до ближнего края (`m > Zt`) или с фитилём за дальний край (`m < Zb`) не ниже 50%.

### 5.2 Ответ
`{ price: L, type, frontK }`, `type ∈ { near-edge, middle, far-edge, front-run }`; `frontK` обязателен только для `front-run`, `0.05 ≤ frontK ≤ 0.5`. LONG: `L < P` (иначе ордер исполнился бы сразу — validation `LIMIT_WRONG_SIDE`).

### 5.3 Оценка (0–100)
Глубина `dL = (Zn − L) / A` (LONG; положительная — внутрь зоны, отрицательная — опережение).
| Часть | Баллы | Правило | Код при недоборе |
|---|---|---|---|
| `placement` | 40 | `−0.3 ≤ dL ≤ 0.1` (опережение до 0.3·A или у ближнего края) | — |
| | 25 | `−0.5 ≤ dL < −0.3` | `LIMIT_FRONT_TOO_FAR` (minor) |
| | 25 | `0.1 < dL ≤ h/2 + 0.1` | `LIMIT_DEEP_IN_ZONE` (minor) |
| | 10 | `h/2 + 0.1 < dL ≤ h + 0.1` | `LIMIT_AT_FAR_EDGE` (minor) |
| | 0 | `dL > h + 0.1` / `dL < −0.5` | `LIMIT_BEYOND_ZONE` / `LIMIT_FAR_FROM_ZONE` (major) |
| `type` | 10 | `|L − X| ≤ 0.1·A`, где `X` = `Zn` / `mid` / `Zf` / `Zn + frontK·A` по заявленному типу | `LIMIT_TYPE_MISMATCH` (minor) |
| `fill` | 25 | исполнилась на `(T, e]`: первая свеча `f` с `low[f] ≤ L` | `LIMIT_NOT_FILLED` (major) |
| `price` | 25·`q` | `q = clamp((B − L) / (B − m), 0, 1)`, `B = Zn + 0.5·A`; 0 без исполнения | — |
`quality = Σ`; `GradeResult.score = quality / 100`; `verdict`: `correct` — `quality ≥ 75` и нет major; `partial` — `quality ≥ 50`; иначе `incorrect`.
- Исполнение — касание (`low ≤ L`), без очереди и проскальзывания, как `resolveTrade` (§19 п.14). Исполнение после `e` (цена вернулась позже) — не исполнение для оценки; в `detail.lateFillTime` показывается.
- `detail`: `fillTime`, `fillCandles = f − T`, `maeAtr = (L − min low[f..e]) / A`, `mfeAtr = (max high[f..min(e + 10, T + limit)] − L) / A`, `gapAtr = (m − L) / A` для неисполненных (насколько не дотянули).
- Обоснование полос (данные §16.2, 3 271 реакция): исполнение при `dL = −0.3 / −0.2 / 0 / +0.2 / +0.3` — 84% / 77% / 62% / 50% / 45%; медиана экстремума реакции — `0.196·A` внутрь от ближнего края, 38% реакций — до него. Выигрыш в цене при заходе вглубь — доли ATR при реакции ≥ 1.5·ATR, а потеря — треть сделок; поэтому полный балл за опережение до `0.3·A` и вход у края, «середина» и «дальний край» — допустимы с понижением. Лучшая фиксированная стратегия (опережение 0.2·A) даёт `quality ≥ 75` в 70% задач — исход в части `fill`/`price` вероятностный, поэтому критерий «пройдено» ступени 3 считается только по процессному навыку `limit-placement` (§10.2).
- Навыки: `limit-placement` — `correct = 1`, если `placement = 40` и `type = 10`; `limit-fill` — `correct = 1`, если исполнилась (информационный).
- `replay = { tf, candles: (T, min(e + 10, T + limit)], exitIndex: e, fillIndex: f | null }`.

---

## 6. Ступень 4 «Стоп и тейк» (`stop-take`)

### 6.1 Генерация (вход дан: лимитка у ближнего края исполнена)
- Зона — эталон §3.3 (`role` по `side`), `1 ≤ dist ≤ 4` на свече `T0`; вход `E = Zn`.
- Свеча исполнения `f` — первая на `(T0, T0 + limit]` с `low[f] ≤ E`. Видимый ряд заканчивается свечой `f` (решение принимается на её закрытии; T задания = `closeTime(f) + 1`), `A = ATR14[f]`.
- Отбраковка: исполнения нет; `close[f] < Zf` (пробой на свече входа); `close[f] ≥ low[f] + 1.5·A` (реакция уже подтверждена); нет цели `k*` (§6.3).
- Сложности: easy — ТФ 1h/4h, `hints`: линия `Pl` (`meta.role = 'structure'`) и линии всех кандидатов-целей без указания, какая верная (`meta.role = 'target-candidate'`); medium — 15m/1h/4h; hard — 15m/1h/4h, доля задач с `low[f] < Zb` (фитиль за зону на свече входа) или с `RRref(C1) < 1.5` (ближняя цель слишком близко) не ниже 50%.

### 6.2 SL: за структуру с запасом (40 баллов)
Структурная точка `Pl = min(Zf, low[f])` (LONG): дальний край зоны (крайний swing кластера) или фитиль свечи входа, если он ушёл глубже. «Защищённый swing» уровня — это крайний swing кластера, поэтому дальний край зоны и есть он.
| Правило (LONG) | Баллы | Код |
|---|---|---|
| `Pl − 1.5·A ≤ sl ≤ Pl − 0.25·A` | 40 | `OK_SL_PLACEMENT` |
| `Pl − 0.25·A < sl < Pl` (за структурой без запаса) | 20 | `SL_NO_BUFFER` (minor) |
| `sl < Pl − 1.5·A` | 20 | `SL_TOO_WIDE` (minor) |
| `sl ≥ Pl` | 0 | `SL_INSIDE_STRUCTURE` (major) |
Обоснование (данные §16.2): среди реакций доля, где фитиль не дошёл до `Zf − x·A`: `x = 0` — 62%, `0.1` — 68%, `0.25` — 75%, `0.5` — 84%, `0.75` — 90%, `1.0` — 94%, `1.5` — 98%. Запас `0.25·A` — минимум, отсекающий четверть «выносов»; дальше `1.5·A` выигрыш в выживании < 4% при росте риска (то же 1.5·ATR, что в Challenge, `ALGORITHMS.md` §14.3).

### 6.3 TP: у следующего уровня/ликвидности (35 баллов)
- `E* = max(E, close[f])` (LONG). Кандидаты `C`: (1) для каждого уровня `findLevels` видимого ряда (любой роли, включая `inside`) с зоной `levelZone(·, A)`, у которой `Zb > E*`, — цена `Zb` (ближний край встречной зоны); (2) каждый внешний swing high `N = 5` (`analyzeStructure`) с ценой `> E*`, не пробитый закрытием после подтверждения (`close ≤ price` на `(confirmedIndex, f]`) — ликвидность. Сортировка по удалённости от `E` (при равных ценах уровень раньше swing); слияние: кандидат пропускается, если ближе `0.5·A` к последнему оставленному.
- `slRef = Pl − 0.25·A`; `RRref(C) = (C − E) / (E − slRef)`; `k*` — первый кандидат с `RRref ≥ 2`; **допустимые цели** — `C1 … C(k*+1)` (любой уровень до первой цели на 2R включительно и следующий за ней).
| Правило (LONG; полоса цели `[C − 0.5·A, C]`) | Баллы | Код |
|---|---|---|
| `tp` в полосе допустимой цели | 35 | `OK_TP_LEVEL` |
| `tp` вне полос, но не дальше полосы `C(k*+1)` | 15 | `TP_NOT_AT_LEVEL` (minor) |
| `tp` дальше полосы `C(k*+1)` (в том числе в полосе более далёкой цели) | 0 | `TP_BEYOND_TARGETS` (major) |
- Полосы не перекрываются (слияние 0.5·A). Слишком близкую цель (`C1` с RR < 1.5) рубрика не запрещает — её штрафует часть `rr`.

### 6.4 R:R (25 баллов)
`RR = (tp − E) / (E − sl)`: `≥ 2` — 25 (`OK_RR`); `[1.5, 2)` — 12; `< 1.5` — 0 (`RR_TOO_LOW`, minor).

### 6.5 Итог, исход, stop hunt
- `quality = sl + tp + rr`; `score = quality / 100`; `verdict`: `correct` — `sl = 40`, `tp = 35`, `rr ≥ 12`; `partial` — `quality ≥ 50`; иначе `incorrect`. Исход проигрывания в оценку не входит (как Challenge, `ALGORITHMS.md` §14.4; `ELLIOTT.md` §11.4).
- Проигрывание — `resolveTrade` (`ALGORITHMS.md` §15) без изменений: `Position { side, entry: E, sl, tp, T: openTime(f + 1), tf, limitCandles: limit }`, drill-down 15m/1h/4h → 1m → aggTrades → `conservative-sl`. Дополнительно проигрывается эталонный план (`slRef`, `tp = C(k*)`) — `detail.referenceOutcome`.
- **Stop hunt `stopHunted` (решение, новое):** `result = 'sl'`; `s` — свеча `tf`, содержащая `triggerTime`; (а) `close[s] > sl` (стоп снят фитилём, свеча закрылась по эту сторону стопа); (б) после `s` в окне проигрывания цена достигла `tp` (`high ≥ tp`) раньше, чем какая-либо свеча закрылась ниже `low[s]` (экстремум выноса не пробит закрытием).
  - `stopHunted` и `sl < 40` → ошибка `STOP_HUNTED` (minor, навык `stop-placement`) — запас не защитил от выноса;
  - `stopHunted` и `sl = 40` → блок `OK_STOP_HUNT_RULES` — стоп стоял по правилам, вынос — исход, а не ошибка решения.
  Ни один из блоков не меняет `quality`, `verdict` и `skillOutcomes`.
- Навыки: `stop-placement` (`sl = 40`), `take-profit` (`tp = 35`), `risk-reward` (`rr ≥ 12`), по `total = 1`.
- Validation (400): LONG `sl ≥ min(E, close[f])` — `SL_WRONG_SIDE`; `tp ≤ max(E, close[f])` — `TP_WRONG_SIDE`.
- `replay = { tf, candles: (f, min(exit + 10, f + limit)], exitIndex }`; `resolution` — как Challenge.
- Данные: на BTCUSDT 1h 2026-08-22…09-26 эталонный план дал TP 28, SL 62, timeout 7 (наблюдения с перекрытием), из SL 12 — stop hunt. Сделка по правилам — это не гарантия: разбор обязан разделять качество и исход.

---

## 7. `resolveLimitTrade` — отложенный ордер с SL/TP (комбо)

```ts
interface PendingOrder { side: Side; limit: number; sl: number; tp: number; T: UtcMs; tf: TaskTimeframe; limitCandles: number;
                         zone: { near: number; far: number }; A: number; P: number }
type LimitOutcome =
  | { kind: 'cancelled-reaction' | 'cancelled-target' | 'not-filled'; time: UtcMs; rMultiple: 0 }
  | (ResolvedTrade & { kind: 'tp' | 'sl' | 'timeout'; fillTime: UtcMs; fillMethod: 'candle' | 'drill-1m' | 'drill-aggtrades' | 'conservative' });
function resolveLimitTrade(o: PendingOrder, f: FutureProvider): Promise<LimitOutcome>;
```
1. Окно — `limitCandles` свечей `tf` от T на обе фазы вместе.
2. **Ожидание** (LONG): свеча без касания `low ≤ limit` — проверки снятия по её закрытию: (а) `tp > P` и `high ≥ tp` → `cancelled-target` («цель достигнута без входа»); (б) реакция зоны по §4.1 (вход в зону подхода, `close ≥ m + 1.5·A`) → `cancelled-reaction` («реакция прошла без исполнения»). Окно исчерпано → `not-filled`.
3. **Свеча исполнения** (`low ≤ limit`): если на ней нет ни `low ≤ sl`, ни `high ≥ tp` — исполнение по `limit`, далее `resolveTrade` с `T = openTime(следующей)` и остатком лимита. Иначе drill-down: 1m-свечи этой свечи по порядку с тем же автоматом (ожидание → позиция); минута, где неоднозначно (исполнение и `sl`/`tp`, или `sl` и `tp` в открытой позиции), — aggTrades в порядке `(transactTime, aggTradeId)`: в ожидании `price ≤ limit` — исполнение, `price ≥ tp` (при `tp > P`) — `cancelled-target`; в позиции — `sl`/`tp` по `ALGORITHMS.md` §15 п.3. Нет aggTrades / пропуск 1m → консервативно: если в неоднозначной минуте касается `sl` — «исполнение, затем SL» (−1R); иначе «цель до входа» — `cancelled-target` (0R).
4. R считается от `limit`; `cancelled-*`/`not-filled` — `rMultiple = 0`, в статистику win rate не входят.
Обоснование снятия: ордер у уровня имеет смысл, пока идея жива; исполнение «задним числом» после ушедшей реакции — другая сделка (CB-3: лимитка у края не взяла реакцию 09-17 12:00 и без правила снятия исполнилась бы 09-18 03:00 на пробое со стопом через 2 свечи).

---

## 8. Комбинированные модули

### 8.1 `combo-level-trade` «Уровень + лимитка + стоп/тейк»
- **Генерация:** как ступень 3 (`1 ≤ dist ≤ 4`, однозначный эталон §3.3), но исход `resolveZoneReaction` — `reaction` или `break`, по `seed` 50/50. easy/medium — `side` задан, ТФ 1h/4h (easy), 15m/1h/4h (medium); hard — `side = null` (сторону задаёт нарисованная зона: ниже цены — LONG), 15m/1h/4h.
- **Ответ:** `zone` (метка `zone`), `limit` (§5.2), `sl`, `tp`. Validation: зона по другую сторону от `P` относительно `side` — `ZONE_SIDE_MISMATCH`; `limit` вне стороны — `LIMIT_WRONG_SIDE`; LONG `sl ≥ limit` / `tp ≤ limit` — `SL_WRONG_SIDE` / `TP_WRONG_SIDE`.
- **Сопоставленная зона `Zu`:** эталон, если классификация §3.5 дала `OK_ZONE`/`ZONE_TOO_WIDE`/`ZONE_EDGE_OFF`; другой кандидат той роли при `share ≥ 0.5` (`LEVEL_NOT_STRONGEST`); иначе эталон (часть `zone` = 0). Лимитка и стоп оцениваются относительно `Zu`.
- **Рубрика (процесс, 0–100):**
| Часть | Баллы | Правило |
|---|---|---|
| `zone` | 20 / 10 / 10 / 10 / 0 | `OK_ZONE` / `ZONE_TOO_WIDE` / `ZONE_EDGE_OFF` / `LEVEL_NOT_STRONGEST` / прочее (`LEVEL_WRONG_TYPE`, `ZONE_OFF`) |
| `placement` | 25 / 15 / 15 / 6 / 0 | полосы §5.3 (40 / 25 / 25 / 10 / 0) относительно `Zu` |
| `type` | 5 | §5.3 |
| `sl` | 20 / 10 / 10 / 0 | §6.2 с `Pl = Zf(Zu)` (свечи исполнения ещё нет), `A` — на T |
| `tp` | 18 / 8 / 0 | §6.3 с `E = E* = limit`, видимый ряд — на T |
| `rr` | 12 / 6 / 0 | §6.4 |
  `verdict`: `correct` — `zone = 20`, `placement = 25`, `type = 5`, `sl = 20`, `tp = 18`, `rr ≥ 6`; `partial` — `quality ≥ 50`; иначе `incorrect`. Исход (`resolveLimitTrade` с зоной `Zu`) в оценку не входит, показывается в разборе и `detail.outcome`.
- **Навыки** (питают статистику базовых ступеней): `level-zone`, `limit-placement`, `stop-placement`, `take-profit`, `risk-reward` — по правилам частей (`correct = 1` при полном балле части; `risk-reward` — при `rr ≥ 6`).

### 8.2 `combo-smc-entry` «SMC-вход»
- **Генерация:** ТФ 1h/4h (easy), 15m/1h/4h (medium/hard); внешний тренд `analyzeStructure(nExt = 5)` на T — `up`/`down` (не `none`); **POI-кандидаты** направления тренда: OB `valid = true`, `status = 'fresh'` (`ALGORITHMS.md` §7.2) и FVG `status = 'open'` (§8.2), ближний край на `1 ≤ dist ≤ 6`. Нужен ≥ 1 кандидат; исход `resolveZoneReaction` по ближайшему POI — `reaction`/`break` 50/50. `side` = направление тренда, задан всегда; easy — `hints` = внешняя структура (swing, BOS/CHoCH).
- **Зона:** IoU (`ALGORITHMS.md` §12.4) с POI-кандидатом ≥ 0.5 → 20 (`OK_POI`); IoU ≥ 0.5 с OB/FVG против тренда → 0 (`TRADE_AGAINST_STRUCTURE`, major); IoU ≥ 0.5 с OB `mitigated`/`invalidated`/`valid = false` или FVG `partial`/`filled` → 8 (`POI_NOT_FRESH`, minor); иначе 0 (`POI_OFF`, major). `Zu` — сопоставленный POI; при 0 баллов — ближайший кандидат.
- **SL:** как §6.2 с `Pl = Zf(Zu)`; полный балл также при `sl` в полосе `[Pl2 − 1.5·A, Pl2 − 0.25·A]`, где `Pl2` — защищённый уровень тренда (`refLow` для up), если он дальше `Pl`.
- **TP, RR, placement, type, verdict, исход** — как §8.1 (цели §6.3 включают `refHigh` и прочие живые внешние swing).
- **Навыки:** `order-block` или `fvg` (по типу POI, `correct = 1` при `zone = 20`), `limit-placement`, `stop-placement`, `take-profit`, `risk-reward`.

### 8.3 Trading Challenge
Без изменений (`ALGORITHMS.md` §13.5, §14). Становится комбинированным модулем с правилом открытия §10.3.

---

## 9. Ступени 5 и 6 после перестройки

### 9.1 Ступень 5 «Smart Money Concepts» — переразметка сложностей (решение)
Из двух вариантов задачи («только medium/hard» или «новые easy/medium/hard») выбран второй: у ступени остаются три сложности, а отдельное понятие swing уходит в ступень 1.
| Сложность | `concepts` («Разметка») | `nExt` / `nInt` | Окно, свечей | Обязательных меток | Доп. критерий T |
|---|---|---|---|---|---|
| easy (новое) | `bos`, `choch` (external) | 5 / null | 120–150 | 2–8 | — |
| medium (из текущего hard) | `bos`, `choch` + 1 понятие `focus` из {`sweep`, `order-block`, `fvg`} | 5 / null | 40–80 | 3–10 | ≥ 1 BOS/CHoCH и ≥ 1 метка `focus` |
| hard (из текущего hard) | `bos`, `choch`, `internal-external` + ≥ 1 из {`sweep`, `order-block`, `fvg`} | 5 / 2 | 40–80 | 4–12 | как текущий hard (`ALGORITHMS.md` §13.2) |
- Метки пользователя `swing-*`, `hh/hl/lh/ll` в ступени 5 — `ignored` (не ошибка); якорь BOS/CHoCH на пробитом swing по-прежнему проверяется (`BOS_WRONG_LEVEL`).
- Окно easy 150: внешние BOS/CHoCH N=5 редки — в окне 80 свечей ≥ 2 события в 16% окон, в окне 150 — в 38% (§16.3); 200 попыток генерации это покрывают.
- «Вопрос»: шаблоны без изменений, `nExt = 5` на всех сложностях (было 7 на easy); формулировка `trend` — «Какой внешний тренд по структуре (последний BOS/CHoCH)?», чтобы не путать с `sw-trend`. Окно вопросов — 150.
- Это смена эталона на тех же свечах → `ALGO_VERSION 2.0.0`; ранее выданные токены с `ALGO_VERSION 1.x` оцениваются старой версией или отклоняются (как принято для смены MAJOR, решение Backend).

### 9.2 Ступень 6 «Свечные модели»
`pa-level` («Проведи уровень») удаляется из `price-action` (`NextSchemas['price-action'].taskType` без `draw-level`); задание живёт как `lv-strongest`. Остальное без изменений.

---

## 10. Навыки, прогресс ступени, открытие комбо, рекомендация

### 10.1 Новые `SkillId` **(новое)**
`swing-trend`, `level-zone`, `level-reaction`, `limit-placement`, `limit-fill`, `stop-placement`, `take-profit`, `risk-reward`. `pa-level` сохраняется (смысл — «сильнейший уровень», ступень 2). `skill_stats.skill` — свободный текст, миграция не нужна.

### 10.2 Ступень → модули → навыки
| Ступень | Модули попыток | Ключевые навыки (критерий «пройдено») | Информационные |
|---|---|---|---|
| 1 | `stage-swings`, `market-structure` (старые попытки) | `swing`, `structure-labels`, `swing-trend` | — |
| 2 | `levels`, `price-action` (старые `pa-level`) | `pa-level`, `level-zone` | `level-reaction` |
| 3 | `limit-entry` | `limit-placement` | `limit-fill` |
| 4 | `stop-take` | `stop-placement`, `take-profit`, `risk-reward` | — |
| 5 | `market-structure` | `bos`, `choch`, `internal-external`, `sweep`, `order-block`, `fvg` | — |
| 6 | `price-action` | `pa-engulfing`, `pa-pin-bar`, `pa-inside-bar`, `pa-doji`, `pa-star`, `pa-context` | — |
| 7 | `fibonacci` | `fib-anchor`, `fib-extension`, `premium-discount` | `fib-reaction` (§19 п.11) |
| 8 | `elliott` | `ew-impulse`, `ew-correction`, `ew-rules`, `ew-invalidation` | — |
Информационные навыки зависят от исхода будущего (вероятностные, §16) и в критерий не входят; они видны в «Слабых местах» как обычно.

### 10.3 Прогресс и «пройдено» (решение, через существующую систему навыков)
Считается на клиенте по `Repository.listAttempts` в хронологическом порядке (без новых таблиц):
```ts
const STAGE_MIN_ATTEMPTS = 10, STAGE_MIN_ACCURACY = 0.70, SKILL_FLOOR = 0.5;
// попытка относится к ступени s, если a.module ∈ modules(s) и среди a.grade.skillOutcomes есть ключевой навык s
for (const a of attemptsAsc) for (const s of stagesOf(a)) {
  st[s].attempts++;
  for (const o of a.grade.skillOutcomes ?? []) if (core(s).includes(o.skill))
    win[s][o.skill] = [...(win[s][o.skill] ?? []), isOutcomeOk(o)].slice(-WINDOW_N);   // 20, ok = correct/total >= 0.8
  const all = Object.values(win[s]).flat();
  st[s].accuracy = all.length ? count(all, true) / all.length : null;                 // пул по ключевым навыкам
  const floorOk = Object.values(win[s]).every(w => w.length < MIN_SAMPLE || count(w, true) / w.length >= SKILL_FLOOR);
  if (!st[s].passedAt && st[s].attempts >= 10 && all.length >= 10 && st[s].accuracy! >= 0.70 && floorOk) st[s].passedAt = a.createdAt;
}
```
- Статусы: `not-started` (0 попыток), `in-progress`, `passed` (`passedAt` задан — «пройдено» не отзывается при последующем падении точности, иначе комбо закрывались бы обратно).
- Шкала прогресса: `passed` → 1; иначе `0.5·min(1, attempts/10) + 0.5·min(1, (accuracy ?? 0)/0.70)`; подпись «N из 10 заданий · точность P%» («мало данных» при `all.length < 10`).
- `SKILL_FLOOR`: ключевой навык с ≥ 5 исходами и точностью < 50% блокирует «пройдено» (одна дыра не прячется за сильными навыками).
- **Открытие комбо:** `combo-level-trade` — ступени 2, 3, 4 `passed`; `combo-smc-entry` — 3, 4, 5; `challenge` — 1, 2, 3, 4, 5 **(вопрос §19 п.8)**; для `challenge` действует сохранение доступа: если у пользователя есть хотя бы одна попытка `challenge` до релиза курса — модуль открыт. Замок — только в UI; API заданий не проверяет прогресс (нет обязательной авторизации), см. §19 п.8.
- **Рекомендованный шаг:** бейдж «Рекомендуем» — первая по номеру базовая ступень не `passed`; если все 1–8 пройдены — первое открытое комбо с < 10 попытками. Внутри ступени: тип задания — генератор самого слабого ключевого навыка (`rankWeakSkills` по ключевым навыкам ступени, затем `generatorForSkill`), сложность — текущая, «Повысить сложность» по `shouldSuggestHarder` (`progress/skills.ts`).

### 10.4 `generatorForSkill` (расширение `ALGORITHMS.md` §16.3)
`swing`, `structure-labels` → `stage-swings`/`sw-mark`; `swing-trend` → `sw-trend`; `pa-level` → `levels`/`lv-strongest`; `level-zone` → `lv-zone`; `level-reaction` → `lv-reaction`; `limit-placement`, `limit-fill` → `limit-entry`; `stop-placement`, `take-profit`, `risk-reward` → `stop-take`; `bos`, `choch`, `internal-external`, `sweep`, `order-block`, `fvg` → `market-structure` (разметка с `focus` или вопрос, 50/50). Комбо из `focus` не выбираются (открываются только явно).

---

## 11. API (расширение `API_CONTRACTS.md`)

### 11.1 Маршруты и типы
`POST /api/tasks/{module}/next`, `POST /api/tasks/{module}/grade` для `module ∈ { stage-swings, levels, limit-entry, stop-take, combo-level-trade, combo-smc-entry }` — тот же конвейер `handlers.ts` (rate limit → 404 модуля → тело → zod → сервис), токен `seal/open`.
```ts
type ModuleId = /* … */ | 'stage-swings' | 'levels' | 'limit-entry' | 'stop-take' | 'combo-level-trade' | 'combo-smc-entry';
type SkillId = /* … */ | 'swing-trend' | 'level-zone' | 'level-reaction' | 'limit-placement' | 'limit-fill' | 'stop-placement' | 'take-profit' | 'risk-reward';
type MarkKind = /* … */ | 'zone';                     // 2 якоря: [{time, price: верх}, {time, price: низ}]
type Side = 'LONG' | 'SHORT';
type LevelRole = 'support' | 'resistance';
type LimitType = 'near-edge' | 'middle' | 'far-edge' | 'front-run';
interface ZoneInfo { bottom: number; top: number; role: LevelRole; center: number; touches: number; reactions: number; strength: number; flip: boolean; lastTouchTime: UtcMs }
interface LimitOrder { price: number; type: LimitType; frontK: number | null }

type NextRequest = /* … */
  | (NextBase & { module: 'stage-swings'; taskType: 'sw-mark' | 'sw-trend'; tf: TaskTimeframe })
  | (NextBase & { module: 'levels'; taskType: 'lv-strongest' | 'lv-zone' | 'lv-reaction'; tf: TaskTimeframe })
  | (NextBase & { module: 'limit-entry' | 'stop-take' | 'combo-level-trade' | 'combo-smc-entry'; tf?: TaskTimeframe });   // tf из списка сложности, иначе по seed
```
`tf` вне списка сложности (§2–§8; 1d недоступен в ступенях 3, 4 и комбо, в `lv-reaction`) → 400 `UNKNOWN_TIMEFRAME`. `timeline.mode`: `sw-*`, `lv-strongest`, `lv-zone` — `absolute`; `lv-reaction`, `limit-entry`, `stop-take`, комбо — `relative`.

### 11.2 Payload (`TaskPayload`)
```ts
interface SwMarkTask      { kind: 'sw-mark'; tf; window: { fromTime; toTime }; concepts: SkillId[]; n: number; requiredCount: number; toleranceCandles: 2; tools: MarkKind[] }
interface SwTrendTask     { kind: 'sw-trend'; tf; questionId: string; window: { fromTime; toTime }; n: number; options: ['up', 'down', 'range']; hints?: Mark[] }
interface LvStrongestTask { kind: 'lv-strongest'; tf; role: LevelRole | null; tolerancePct: 0.3; maxDistanceAtr: 5; atr: number; hints?: Mark[] }
interface LvZoneTask      { kind: 'lv-zone'; tf; role: LevelRole | null; atr: number; edgeToleranceAtr: 0.1; maxExtraHeightAtr: 1; tools: ['zone'] }
interface LvReactionTask  { kind: 'lv-reaction'; tf; side: Side; atr: number; options: { id: string; bottom: number; top: number; touches: number | null; strength: number | null }[];   // touches/strength — только easy
                            allowNone: boolean; limitCandles: number }
interface LimitEntryTask  { kind: 'limit-entry'; tf; side: Side; zone: ZoneInfo; atr: number; frontK: { min: 0.05; max: 0.5 }; limitCandles: number; hints?: Mark[] }
interface StopTakeTask    { kind: 'stop-take'; tf; side: Side; zone: ZoneInfo; entry: { price: number; fillTime: UtcMs }; atr: number; limitCandles: number; hints?: Mark[] }
interface ComboTask       { kind: 'combo-level-trade' | 'combo-smc-entry'; tf; side: Side | null /* null только combo-level-trade hard */; atr: number; frontK: { min: 0.05; max: 0.5 }; limitCandles: number; tools: ['zone', 'hline']; hints?: Mark[] }
```
`series` — только `tf` задания, закрытые свечи до T (`stop-take` — до свечи исполнения включительно). `sealed.params` = `{ curAlgoVersion, kind, tf, … }` + запечатанный эталон: `sw-*` — как `ms-mark`/`ms-question` плюс `stage: 1`; `lv-*` — `{ role, refCenter, refZone, optionZones? }`; `limit-entry`/`stop-take` — `{ side, zone, entry?, fillTime? }`; комбо — `{ side, refZone | poiList }`. При `grade` сервер пересчитывает эталон по ряду и сверяет с запечатанным (рассогласование — 500 + лог, не оценка).

### 11.3 Answer
```ts
type Answer = /* … */
  | { kind: 'sw-mark'; marks: Mark[] }
  | { kind: 'sw-trend'; questionId: string; optionId: 'up' | 'down' | 'range' }
  | { kind: 'lv-strongest'; price: number }
  | { kind: 'lv-zone'; zone: Mark }
  | { kind: 'lv-reaction'; optionId: string }                     // 'z1'…'z3' | 'none'
  | { kind: 'limit-entry'; limit: LimitOrder }
  | { kind: 'stop-take'; sl: number; tp: number }
  | { kind: 'combo-level-trade' | 'combo-smc-entry'; zone: Mark; limit: LimitOrder; sl: number; tp: number };
```
Validation (400, попытка не оценивается) **(новое)**: `ZONE_MARK_INVALID` (не `zone`, не 2 якоря, равные цены, время вне ряда), `ZONE_SIDE_MISMATCH`, `LIMIT_WRONG_SIDE`, `LIMIT_TYPE_INVALID` (`frontK` пропущен/вне `[0.05, 0.5]` при `front-run` или задан при другом типе), `OPTION_UNKNOWN` (`optionId` не из вариантов, `none` при `allowNone = false`); `SL_WRONG_SIDE`, `TP_WRONG_SIDE` — существующие.

### 11.4 GradeResult
`GradeResult` (`API_CONTRACTS.md` §5.1) без изменений структуры; `replay: TaskReplay` расширяется полем `fillIndex?: number | null` (индекс свечи исполнения в `replay.candles`) **(новое)**; `resolution` — для `stop-take` и комбо.
```ts
type ModuleDetail = /* … */
  | { kind: 'sw-mark'; marks: MarkGrade }
  | { kind: 'sw-trend'; chosen: string; correct: string; lastHigh: SwingRef; prevHigh: SwingRef; lastLow: SwingRef; prevLow: SwingRef; bosTrend: 'up' | 'down' | 'range' }
  | { kind: 'lv-strongest'; userPrice: number; reference: ZoneInfo; second: ZoneInfo | null; hit: ZoneInfo | null; deviationPct: number; tolerancePct: 0.3 }
  | { kind: 'lv-zone'; user: { bottom: number; top: number }; reference: ZoneInfo; coversCore: boolean; sharePct: number; heightAtr: number; maxHeightAtr: number; hit: ZoneInfo | null }
  | { kind: 'lv-reaction'; chosen: string; correct: string; options: (ZoneInfo & { id: string; status: 'reaction' | 'broken' | 'untouched'; eventTime: UtcMs | null })[]; extreme: { price: number; time: UtcMs } | null }
  | { kind: 'limit-entry'; limit: LimitOrder; depthAtr: number; parts: QualityPart[]; quality: number; fill: { time: UtcMs; candles: number } | null; lateFillTime: UtcMs | null;
      reaction: { t0Time: UtcMs; extreme: number; extremeTime: UtcMs; confirmTime: UtcMs; threshold: number }; maeAtr: number | null; mfeAtr: number | null; gapAtr: number | null }
  | { kind: 'stop-take'; entry: number; structure: number; slBand: [number, number]; targets: { price: number; source: 'level' | 'swing'; rrRef: number; allowed: boolean }[];
      rr: number; parts: QualityPart[]; quality: number; outcome: ResolvedTrade; referencePlan: { sl: number; tp: number; outcome: ResolvedTrade }; stopHunted: boolean }
  | { kind: 'combo-level-trade' | 'combo-smc-entry'; matchedZone: ZoneInfo | PoiInfo; parts: QualityPart[]; quality: number; rr: number; targets: TargetInfo[]; outcome: LimitOutcome; stopHunted: boolean };
interface QualityPart { key: 'placement' | 'type' | 'fill' | 'price' | 'zone' | 'sl' | 'tp' | 'rr'; score: number; max: number; code: ErrorCode | null }
interface SwingRef { time: UtcMs; price: number; label: SwingLabel | null }
interface PoiInfo { kind: 'order-block' | 'fvg'; bottom: number; top: number; time: UtcMs; status: string }
interface TargetInfo { price: number; source: 'level' | 'swing'; rrRef: number; allowed: boolean }
```
`reference`: зона эталона (`kind: 'zone'`, `author: 'algo'`, `meta: { role, touches, reactions, strength, flip }`), линии `Pl` (`hline`, `meta.role = 'structure'`), цели (`meta.role = 'target'`, `meta.allowed`), эталонный план (`position`, `meta.role = 'reference-plan'`).

---

## 12. Коды и шаблоны разбора (источник `src/i18n/ru/feedback`)

### 12.1 Общие блоки
- Верность: `sw-mark` — `feedback.verdict.<v>` («N из M совпало», как MS); `sw-trend`, `lv-strongest`, `lv-zone`, `lv-reaction` — `feedback.verdict.plain.<v>`; `limit-entry` — `feedback.verdict.limit.<v>` **(новое)**: «Верно: оценка {score}%. {outcomeText} ({outcomeTime}).» / «Частично верно: оценка {score}%, есть ошибки ниже. {outcomeText} ({outcomeTime}).» / «Неверно: оценка {score}%. {outcomeText} ({outcomeTime}).»; `stop-take` и комбо — `feedback.verdict.trade.<v>` **(новое)**: те же тексты с окончанием «{outcomeText} ({outcomeTime}), R = {r}.». `outcomeTime` — время исполнения/снятия/выхода (для `not-filled` — конец окна), `r` — `rMultiple` (0 для снятых и неисполненных) — заполняются всегда.
- Принципы без ошибок **(новое)**: `stage-swings` — «Swing — подтверждённый экстремум; тренд по свингам читается по двум последним максимумам и минимумам.»; `levels` — «Уровень — зона, где цена несколько раз разворачивалась; сила уровня — правило чтения, а не гарантия реакции.»; `limit-entry` — «Лимитка ставится там, где её исполнит реакция: у ближнего края или с небольшим опережением; глубже — лучше цена, но больше пропущенных сделок.»; `stop-take` — «Стоп — за структурой с запасом от фитилей, тейк — у следующего уровня или ликвидности; качество плана не зависит от исхода одной сделки.»; `combo-level-trade` — «Сделка от уровня — это цепочка: зона, лимитка, стоп за структурой, тейк у следующего уровня; слабое звено обесценивает остальные.»; `combo-smc-entry` — «POI работает по направлению структуры: свежий OB или FVG, лимитка у его края, стоп за зоной или защищённым уровнем.».
- Буквальные словари параметров — §12.4; ни один шаблон не содержит условного текста; время — локальное время UI на шкале задания; цены — до тика; `…Atr`, `rr` — 2 знака; `sharePct` — целое.

### 12.2 Что понято верно (`OkCode`, новые помечены *)
| Ключ | Текст | Параметры |
|---|---|---|
| `OK_SWING_TREND`* | Тренд по свингам определён верно: последний максимум {lastHighLabel}, последний минимум {lastLowLabel}. | lastHighLabel, lastLowLabel |
| `OK_LEVEL` | Уровень проведён в пределах допуска {tolPct}% (отклонение {devPct}%). | tolPct, devPct |
| `OK_ZONE`* | Зона [{low}–{high}] накрывает все развороты уровня ({touches} касаний) и не шире нужного. | low, high, touches |
| `OK_LEVEL_REACTION`* | Верно: реакция была от зоны [{low}–{high}], экстремум {extreme}, разворот подтверждён {reactionTime}. | low, high, extreme, reactionTime |
| `OK_LIMIT_PLACEMENT`* | Лимитка {price} стоит по правилам: {typeText}. | price, typeText |
| `OK_LIMIT_FILLED`* | Лимитка исполнилась {fillTime} через {fillCandles} свеч.; просадка {maeAtr} ATR, ход в плюс {mfeAtr} ATR. | fillTime, fillCandles, maeAtr, mfeAtr |
| `OK_SL_PLACEMENT` | Stop Loss за защищённым swing {level}. | level |
| `OK_TP_LEVEL`* | Take Profit {tp} стоит перед целью {target} ({sourceText}). | tp, target, sourceText |
| `OK_RR` | Соотношение риск/прибыль {rr}R не ниже 2R. | rr |
| `OK_STOP_HUNT_RULES`* | Стоп {sl} стоял по правилам; его снял фитиль {time} до {wick}, после чего цена дошла до цели. Это исход, а не ошибка решения. | sl, time, wick |
| `OK_POI`* | Зона интереса выбрана верно: {kindText} [{low}–{high}] по направлению структуры. | kindText, low, high |

### 12.3 Ошибки (части 3–6)
| Код | Навык | Severity | Ошибка (3) | Почему (4) | Как правильно (5) | Принцип (6) |
|---|---|---|---|---|---|---|
| `SWING_TREND_WRONG`* | swing-trend | major | Выбран тренд «{given}», а по свингам он «{expected}». | Последний swing high {lastHigh} — {lastHighLabel} к {prevHigh}, последний swing low {lastLow} — {lastLowLabel} к {prevLow}. | Сравните два последних максимума и два последних минимума: HH и HL — восходящий, LH и LL — нисходящий, смешанные метки — диапазон. | Тренд по свингам — это последовательность экстремумов, а не наклон последних свечей. |
| `LEVEL_NOT_STRONGEST` | pa-level | minor | Уровень {user} реален, но сильнее уровень {ref}: сила {refStrength} против {userStrength}. | Сила складывается из касаний ({touches}), реакций, свежести и совпадения со старшим ТФ. | Сравните кандидатов по числу разворотов и их размеру, затем по свежести. | Чем больше реакций, тем больше ордеров на уровне. |
| `LEVEL_WRONG_TYPE` | pa-level | major | Уровень {user} — {givenText}, а требовался {expectedText}. | Поддержка ниже текущей цены, сопротивление — выше. | Определите положение уровня относительно последнего закрытия {close}. | Роль уровня определяется положением цены. |
| `LEVEL_OFF_TOLERANCE` | pa-level | major | Уровень {user} отклоняется от эталона {ref} на {devPct}% (допуск {tolPct}%). | Эталон — кластер из {touches} swing в зоне [{low}–{high}]. | Проводите уровень через зону, где цена разворачивалась несколько раз. | Уровень — зона повторных реакций, а не одна точка. |
| `ZONE_TOO_WIDE`* | level-zone | minor | Зона [{userLow}–{userHigh}] шире нужного: {height} при допустимых {maxHeight}. | Широкая зона не задаёт ни цену лимитки, ни место стопа: внутри неё нет конкретного края. | Сожмите зону до разворотов уровня [{low}–{high}] с запасом не больше 1 ATR. | Зона должна быть такой, чтобы от её краёв можно было поставить ордер и стоп. |
| `ZONE_EDGE_OFF`* | level-zone | minor | Зона [{userLow}–{userHigh}] не накрывает {edgeText} уровня [{low}–{high}] (перекрытие {sharePct}%). | Края зоны — крайние развороты уровня; без них лимитка или стоп окажутся не там, где реагировала цена. | Дотяните край до крайнего swing уровня с допуском 0.1 ATR. | Край зоны — это последний разворот, а не середина скопления. |
| `ZONE_OFF`* | level-zone | major | Зона [{userLow}–{userHigh}] не совпадает ни с одним уровнем; сильнейший — [{low}–{high}] ({touches} касаний). | В отмеченном месте цена не разворачивалась несколько раз. | Найдите место, где swing high и swing low собираются в узкий диапазон, и отметьте его. | Зона рисуется по фактическим разворотам, а не по круглой цене. |
| `LEVEL_REACTION_BROKEN`* | level-reaction | major | Выбрана зона [{givenLow}–{givenHigh}], но {breakTime} свеча закрылась за ней на {close}. | Закрытие за дальним краем — пробой: ордера уровня поглощены. Итог: {expectedText}. | Сравните силу зон и направление внешнего тренда: уровни против тренда пробиваются чаще. | Уровень держит, пока цена не закрылась за ним. |
| `LEVEL_REACTION_EARLIER`* | level-reaction | major | Выбрана зона [{givenLow}–{givenHigh}], а цена развернулась раньше — от [{low}–{high}]: экстремум {extreme}, разворот {reactionTime}. | Ближняя зона удержала цену, до выбранной цена не дошла. | Начинайте с ближней сильной зоны: дальняя работает, только если ближняя пробита. | Первая сильная зона на пути цены — первый кандидат на реакцию. |
| `LEVEL_REACTION_FALSE_NONE`* | level-reaction | major | Выбран вариант «ни один не удержит», а зона [{low}–{high}] удержала: экстремум {extreme}, разворот {reactionTime}. | Цена дошла до зоны и закрылась в обратную сторону не меньше чем на 1.5 ATR от экстремума. | Если зона сильная и по направлению тренда, ждите реакцию от неё. | Отсутствие реакции — тоже прогноз, и его нужно обосновать. |
| `LIMIT_FAR_FROM_ZONE`* | limit-placement | major | Лимитка {price} дальше 0.5 ATR от края зоны {near} (опережение {offsetAtr} ATR). | Ордер исполнится в середине движения к уровню, а не на реакции. | Ставьте лимитку у края {near} или с опережением до 0.3 ATR. | Вход от уровня — у уровня. |
| `LIMIT_FRONT_TOO_FAR`* | limit-placement | minor | Опережение {offsetAtr} ATR от края {near} больше 0.3 ATR. | Исполнение почти гарантировано, но цена входа хуже, а стоп за зоной становится дальше. | Опережайте край на 0.1–0.3 ATR: этого хватает, чтобы взять ранние развороты. | Опережение — страховка от недохода, а не вход заранее. |
| `LIMIT_DEEP_IN_ZONE`* | limit-placement | minor | Лимитка {price} внутри зоны на {depthAtr} ATR от края {near}. | Чем глубже ордер, тем чаще реакция проходит без исполнения: цена часто разворачивается у края. | Если не готовы пропустить сделку, ставьте ордер у края или с небольшим опережением. | Лучшая цена бесполезна, если ордер не исполнился. |
| `LIMIT_AT_FAR_EDGE`* | limit-placement | minor | Лимитка {price} у дальнего края зоны {far} ({depthAtr} ATR от ближнего). | До дальнего края цена доходит меньше чем в половине реакций. | Дальний край — место стопа, а не входа: вход — у ближнего края. | Вход у ближнего края, стоп за дальним. |
| `LIMIT_BEYOND_ZONE`* | limit-placement | major | Лимитка {price} за дальним краем зоны {far}. | Исполнение за зоной означает, что уровень уже пробит: вход против идеи. | Перенесите ордер к ближнему краю зоны. | Ордер за уровнем исполняется только при его пробое. |
| `LIMIT_TYPE_MISMATCH`* | limit-placement | minor | Лимитка {price} заявлена как «{typeText}», но для этого типа цена должна быть около {expected} (допуск 0.1 ATR). | Тип входа задаёт цену ордера; несовпадение значит, что план и ордер расходятся. | Выберите тип, который соответствует цене, или передвиньте ордер к {expected}. | План входа и ордер должны совпадать. |
| `LIMIT_NOT_FILLED`* | limit-fill | major | Лимитка {price} не исполнилась: цена развернулась от {extreme} ({extremeTime}), не дойдя {gapAtr} ATR. | Разворот подтвердился закрытием {reactionTime}; сделка упущена. | Ставьте ордер ближе к краю или с опережением: заметная часть реакций не доходит до края зоны. | Пропущенная сделка — тоже результат размещения ордера. |
| `SL_INSIDE_STRUCTURE` | stop-placement | major | Stop Loss {sl} внутри структуры, защищённый уровень — {level}. | Обычный откат до {level} выбьет стоп, не отменяя идею. | Ставьте стоп за защищённым swing {level} (с запасом до 1.5 ATR). | Стоп — там, где идея сделки становится неверной. |
| `SL_NO_BUFFER`* | stop-placement | minor | Stop Loss {sl} сразу за структурой {level}: запас {bufferAtr} ATR меньше 0.25 ATR. | Ликвидность за краем зоны часто снимают фитилём перед разворотом. | Отодвиньте стоп за {level} не меньше чем на 0.25 ATR, но не дальше 1.5 ATR. | Стоп ставят за фитили, а не на них. |
| `SL_TOO_WIDE` | stop-placement | minor | Stop Loss {sl} дальше защищённого уровня {level} более чем на 1.5 ATR. | Лишнее расстояние снижает R без выигрыша в надёжности. | Ставьте стоп сразу за защищённым swing. | Риск должен быть минимальным, но достаточным. |
| `TP_NOT_AT_LEVEL`* | take-profit | minor | Take Profit {tp} стоит между уровнями: ближайшая цель — {target} ({sourceText}). | Тейк вне уровня либо отдаёт часть хода, либо ждёт цену, которую встречная зона может не пропустить. | Ставьте тейк в пределах 0.5 ATR перед ближним краем встречной зоны или перед ликвидностью. | Цель — следующий уровень на пути цены. |
| `TP_BEYOND_TARGETS`* | take-profit | major | Take Profit {tp} дальше допустимых целей: последняя — {target} ({sourceText}). | По пути цена встречает уровни, от которых может развернуться; первая цель на 2R — {firstTarget}. | Выберите цель не дальше следующей за первой целью на 2R. | Тейк за несколькими уровнями — надежда, а не план. |
| `RR_TOO_LOW` | risk-reward | minor | Соотношение риск/прибыль {rr}R ниже 1.5R. | При низком RR даже частые победы не покрывают убытки. | Выбирайте цель у ликвидности не ближе 1.5R (лучше 2R+) или ищите лучший вход. | Сделка должна стоить своего риска. |
| `STOP_HUNTED`* | stop-placement | minor | Стоп {sl} снял фитиль {time} до {wick}: свеча закрылась обратно на {close}, затем цена дошла до цели. | Запас за структурой {level} был {bufferAtr} ATR; выносы за край зоны обычно глубже. | Держите стоп за структурой с запасом 0.25–1.5 ATR. | Ликвидность за уровнем снимают перед разворотом. |
| `POI_OFF`* | order-block / fvg | major | Зона [{userLow}–{userHigh}] не совпадает с POI: ближайший — {kindText} [{low}–{high}]. | Вход по SMC делается от свежего OB или незаполненного FVG по направлению структуры. | Найдите последний BOS/CHoCH по тренду и его OB или FVG. | Зона интереса — след импульса, сломавшего структуру. |
| `POI_NOT_FRESH`* | order-block / fvg | minor | {kindText} [{low}–{high}] уже {statusText}. | Отработанная зона уже исполнила часть ордеров и держит хуже. | Выбирайте зону, к которой цена ещё не возвращалась. | Первое касание зоны — самое сильное. |
| `TRADE_AGAINST_STRUCTURE` | challenge-entry | major | Сделка {side} против структуры рабочего ТФ ({trendTf}). | Последнее событие — {lastEvent}; защищённый уровень {level} не пробит. | Дождитесь CHoCH на рабочем ТФ или торгуйте по тренду. | Пока стоит защищённый уровень, тренд продолжается. |
Навык `POI_*` — `order-block` или `fvg` по типу ближайшего POI. Validation-коды §11.3 — сообщения 400 (FR-FB-09), в разбор не попадают.

### 12.4 Словари текстовых параметров
| Параметр | Значения |
|---|---|
| `given`/`expected` (`sw-trend`), `lastHighLabel`, `lastLowLabel` | `up` — «восходящий»; `down` — «нисходящий»; `range` — «диапазон»; метки — `HH`/`HL`/`LH`/`LL` |
| `givenText`/`expectedText` (роль) | `support` — «поддержка»; `resistance` — «сопротивление» |
| `edgeText` | `near` — «ближний край»; `far` — «дальний край»; `both` — «оба края» |
| `expectedText` (`LEVEL_REACTION_BROKEN`) | реакция была — «реакцию дала другая зона»; `none` — «ни одна зона не удержала цену» |
| `typeText` | `near-edge` — «у ближнего края зоны»; `middle` — «в середине зоны»; `far-edge` — «у дальнего края зоны»; `front-run` — «с опережением края зоны» |
| `sourceText` | `level` — «ближний край встречного уровня»; `swing` — «внешний swing, ликвидность за ним» |
| `kindText` | `order-block` — «Order Block»; `fvg` — «FVG» |
| `statusText` | `mitigated` — «отработан (цена возвращалась в зону)»; `invalidated` — «инвалидирован закрытием за зоной»; `no-displacement` — «без displacement»; `partial` — «частично заполнен»; `filled` — «заполнен» |
| `outcomeText` | `filled` — «Лимитка исполнилась»; `missed` — «Лимитка не исполнилась»; `tp` — «Исход: Take Profit»; `sl` — «Исход: Stop Loss»; `timeout` — «Исход: лимит времени»; `cancelled-reaction` — «Ордер снят: реакция прошла без исполнения»; `cancelled-target` — «Ордер снят: цель достигнута без входа»; `not-filled` — «Ордер не исполнился за лимит времени» |

---

## 13. Миграция БД (запрос к Backend/DB)
`supabase/migrations/0005_curriculum.sql`:
```sql
alter table public.attempts drop constraint if exists attempts_module_check;
alter table public.attempts add constraint attempts_module_check check (module in (
  'market-structure', 'price-action', 'challenge', 'fibonacci', 'elliott',
  'stage-swings', 'levels', 'limit-entry', 'stop-take', 'combo-level-trade', 'combo-smc-entry'));
```
`skill_stats.skill` — свободный текст (правка не нужна). Локальное хранилище: `apps/web/src/storage/types.ts` `ModuleId` — те же 11 значений; новых таблиц нет (прогресс §10.3 вычисляется из попыток).

---

## 14. Golden-участки

### 14.1 Формат и фикстуры
Файлы `fixtures/golden/cur_<ID>.<символ>-<tf>-<период>.<суть>.golden.json`, поля как `ALGORITHMS.md` §18.1: `algoVersion: "1.0.0"` (`CUR_ALGO_VERSION`), `author: "technical-analyst"`, `date: "2026-11-07"`, `source` (пути CSV + sha256), `function`, `params`, `inputs` (ответы пользователя — входные данные теста), `expected`, `rationale`. Создаются после утверждения спецификации. Ряд — последние 500 закрытых свечей до T из перечисленных файлов; старший ТФ — закрытые к T свечи 4h (для 1h-участков). Время — UTC, `openTime`. Ответы пользователя — тестовые входы (цены — уровни реальных свечей или круглые значения вне границ правил), не рыночные данные.
| Файл (есть в репозитории) | sha256 CSV (сверен со скачанным архивом) |
|---|---|
| `fixtures/klines/BTCUSDT/1h/BTCUSDT-1h-2026-08.csv` | `08ed90afdac40e82c6e516587d5f1291b7970bac765704852996c5b5047f8a3f` |
| `fixtures/klines/BTCUSDT/1h/BTCUSDT-1h-2026-09.csv` | `6c93df5ac755f8be4a976f56069b1f0dc274aeff99d598afc0dc1c300f996690` |
| `fixtures/klines/BTCUSDT/4h/BTCUSDT-4h-2026-07.csv` | `3f315145e54edb7d5d0b30ddb68bc79b333171b5f6e66b303414436a8846e101` |
| `fixtures/klines/BTCUSDT/4h/BTCUSDT-4h-2026-08.csv` | `e8a295e3633bb365db324a7d08b0e1512d2eb371d4d193a29d083a2837ed14d2` |
| `fixtures/klines/BTCUSDT/4h/BTCUSDT-4h-2026-09.csv` | `83ab0cd5a285a747946fcc17684ecafe368a6d982f000f1890e76136e8b3b92a` |
| `fixtures/klines/BTCUSDT/4h/BTCUSDT-4h-2026-10.csv` | `ee01e880f96134d085c4b669abf4796467e5bd54356ff568fdab36dd084a695e` (нет 10-28; участки заканчиваются раньше) |
Все свечи исходов ниже разрешаются одним касанием на свече `tf` (метод `candle`), 1m для drill-down не нужны.

### 14.2 Участки
**SW-1. Тренд по свингам против тренда BOS (ступень 1, hard-ловушка)** — `BTCUSDT-4h-2026-09.csv` (ряд GS-1), T = 09-30 20:00. N=5 (по GS-1): `H1` 09-29 12:00 84554.9 LH (к 85146.4, 09-27 12:00), `L1` 09-28 12:00 82500.1 LL (к 83130.1, 09-25 12:00) → `swingTrend = down`; тренд BOS — `up` (защищённый low 80095.9). N=7 (по GS-2): `H1` 09-27 12:00 85146.4 LH (к 85224.0), `L1` 09-28 12:00 82500.1 LL (к 82832.0) → `down`.

**LV-1. `lv-strongest`, сопротивление** — BTCUSDT 1h, T = 2026-09-12 00:00 (C 77251.8), A = 777.7429, W = 388.8714. Эталон: center 79554.575, зона [79384.4–79737.3], touches 12 (swing 08-30 16:00 H 79384.4 … 09-09 08:00 H 79737.3), reactions 10, age 59 (recency 0.5), htf 1 → **strength 18.5**, flip, dist 2.742. Второй: 77588.7556 [77422.8–77767.8], strength 14.5 (9 + 3.5 + 1 + 1), отрыв 4 ≥ 1. Ответы: 79500 → correct; 78600 → partial `LEVEL_NOT_STRONGEST` (уровень 78628.1571, strength 12); 81000 → `LEVEL_OFF_TOLERANCE` (1.8169%); 76000 → `LEVEL_WRONG_TYPE` (поддержка 76173.4).

**LV-2. `lv-zone`, сопротивление** — BTCUSDT 1h, T = 2026-09-16 12:00 (C 75933.5), A = 370.2071, tol = 37.0207. Эталон [77291.2–77469.3] (10 касаний, reactions 9, strength 16.5; второй 77137.525, 7.5). Ответы: [77280–77480] → correct; [77100–77700] → `ZONE_TOO_WIDE` (600 > 548.3071); [77350–77470] → `ZONE_EDGE_OFF` (ближний край 77291.2 не накрыт, перекрытие 67%); [76350–76460] → `LEVEL_NOT_STRONGEST` (76403.9667 [76350.1–76458.9], strength 6).

**LV-3. `lv-reaction`, SHORT, ответ z2** — BTCUSDT 1h, T = 2026-09-12 00:00, A = 777.7429. Варианты: z1 [78396.9–78774] (S 12), z2 [79384.4–79737.3] (S 18.5), z3 [80458–80614] (S 5). 09-14 17:00 (O 78726.1 H 79040.3 L 78668.7 C 78911): закрытие выше 78774 — z1 пробита; та же свеча входит в зону подхода z2 (H ≥ 79384.4 − 388.8714 = 78995.5286). Экстремум 79570.9 (09-14 20:00), реакция 09-14 23:00: C 78153.3 ≤ 79570.9 − 1166.6143 = 78404.2857 → **z2**.

**LV-4. `lv-reaction`, LONG, ответ z2 (пробой на 6.5 USDT)** — BTCUSDT 1h, T = 2026-09-09 12:00 (C 79566.3), A = 409.9143. Варианты: z1 [78938.7–79125.3] (S 8), z2 [78133–78314.9] (S 11.5), z3 [77422.8–77604.3] (S 9). 09-09 13:00 L 79070.0 — вход в подход z1; 09-09 14:00 C 78932.2 < 78938.7 — z1 пробита; 09-09 15:00 L 78020.0 (вход z2, фитиль за дальний край на 0.276 ATR), C 78570.0 — ни пробоя (≥ 78133), ни реакции (< 78634.8714); 09-09 16:00 C 78769.6 ≥ 78634.8714 → **z2**.

**LV-5. `lv-reaction`, hard, ответ none (одна свеча пробивает две зоны)** — BTCUSDT 1h, T = 2026-09-16 00:00, A = 745.9643. Варианты: z1 [77291.2–77600.1] (S 21), z2 [78543.9–78737.9] (S 9), z3 [79391.4–79737.3] (S 19). Пробои: z1 — 09-18 07:00 (C 77776.1 > 77600.1); z2 и z3 — одной свечой 09-18 13:00 (O 78004.9 H 80486.5 C 80046.5) → **none**.

**LE-1. `limit-entry`, SHORT** — участок LV-1/LV-3. Зона [79384.4–79737.3], h = 0.4537; `resolveZoneReaction`: t0 09-14 17:00, m 79570.9 (09-14 20:00), e 09-14 23:00, B = 78995.5286.
| Ответ | dL | placement | type | Исполнение | q | quality | verdict |
|---|---|---|---|---|---|---|---|
| 79384.4 near-edge | 0 | 40 | 10 | 09-14 20:00 (+68) | 0.6759 | 91.90 | correct; MAE 0.2398, MFE 1.9015 |
| 79250 front-run 0.2 | −0.1728 | 40 | 10 (ожид. 79228.8514) | 09-14 18:00 (+66) | 0.4423 | 86.06 | correct |
| 79560 middle | 0.2258 | 25 `LIMIT_DEEP_IN_ZONE` | 10 | 09-14 20:00 | 0.9811 | 84.53 | correct |
| 79700 middle | 0.4058 | 10 `LIMIT_AT_FAR_EDGE` | 0 `LIMIT_TYPE_MISMATCH` | нет (m 79570.9 < 79700) `LIMIT_NOT_FILLED` | 0 | 10 | incorrect |

**LE-2. `limit-entry`, SHORT, реакция до края зоны (hard)** — участок LV-2, зона [77291.2–77469.3], A = 370.2071, B = 77106.0964. 09-17 12:00 (H 77149.8) входит в подход, m = 77149.8; 09-17 13:00 C 76671.5 > 76594.4893 — ещё не реакция; 09-17 14:00 C 76469.5 ≤ 76594.4893 → реакция. Ответы: 77291.2 near-edge → не исполнилась (недобор 0.382 ATR), quality 50, partial; 77140 front-run 0.4 → dL −0.4084, placement 25 `LIMIT_FRONT_TOO_FAR`, type 10 (ожид. 77143.1171), исполнена 09-17 12:00 (+24), q 0.7758, quality 79.39, correct.

**LE-3. `limit-entry`, LONG, фитиль за дальний край** — участок LV-4, зона [78133–78314.9], A = 409.9143, B = 78519.8571; t0 = 09-09 15:00, m 78020.0, e 09-09 16:00. Ответы: 78314.9 near-edge → 85.25 correct (q 0.41, MAE 0.7194); 78133 far-edge → placement 10, q 0.7739, quality 64.35, partial; 78400 front-run 0.2 → dL −0.2076, quality 80.99, correct. Все исполнены на 09-09 15:00 (+3).

**ST-1. `stop-take`, SHORT, TP** — T0 = 2026-09-12 00:00, зона LV-1, E = 79384.4; исполнение 09-14 20:00 (O 78952 H 79570.9 L 78936.7 C 79065.5, +68), A = ATR14[f] = 484.2071, Pl = max(79737.3, 79570.9) = 79737.3, полоса SL [79858.3518–80463.6107], E* = 79065.5. Цели (RRref): C1 78737.9 (уровень 78645.24, 1.3641), C2 78343.8 (78213.0, 2.1956 = k*), C3 78020.0 (2.8788). Эталонный план sl 79858.3518 / tp 78343.8 → TP 09-14 23:00 (L 78084.6). Ответы: sl 79950 / tp 78343.8 → 40 + 35 + 12 (RR 1.8398) = 87, correct, TP; sl 79800 / tp 78343.8 → `SL_NO_BUFFER` (20), RR 2.5038, 80, partial, TP; sl 80000 / tp 78737.9 → tp 35 (C1), RR 1.0502 `RR_TOO_LOW`, 75, partial, TP 09-14 21:00.

**ST-2. `stop-take`, SHORT, stop hunt** — T0 = 2026-09-26 00:00, зона [84855–85080] (3 касания, strength 6), E = 84855; исполнение 09-27 08:00 (H 84855.0 = E — касание с равенством, +32), A = 222.5214, Pl = 85080, полоса SL [85135.6304–85413.7821]; цели: C1 84638.5 (0.7715), C2 84154.9 (2.4947 = k*), C3 83794.2. Свеча 09-27 13:00 (O 84754.4 H 85146.4 L 84588.0 C 84991.8) — вынос (тот же экстремум, что swing 4h 09-27 12:00 85146.4 из GS-1); закрытия 14:00–21:00 ниже 85146.4; 09-27 22:00 L 84092.9 ≤ 84154.9.
| Ответ | sl | tp | rr | quality | verdict | Исход | Блок |
|---|---|---|---|---|---|---|---|
| sl 85140 / tp 84154.9 | 40 (запас 0.2696 ATR) | 35 | 25 (2.4565) | 100 | correct | SL 09-27 13:00, `stopHunted` | `OK_STOP_HUNT_RULES` |
| sl 85100 / tp 84154.9 | 20 `SL_NO_BUFFER` | 35 | 25 (2.8576) | 80 | partial | SL 09-27 13:00, `stopHunted` | `STOP_HUNTED` |
| sl 85300 / tp 84154.9 | 40 | 35 | 12 (1.5733) | 87 | correct | TP 09-27 22:00, +1.5733R | — |

**ST-3. `stop-take`, LONG, пробой (стоп по правилам, без выноса)** — T0 = 2026-09-15 00:00, зона [77208–77427.4] (9 касаний, strength 15), E = 77427.4; исполнение 09-15 05:00 (L 77265.8, C 77590.5, +5), A = 373.8786, Pl = 77208, полоса [76647.1821–77114.5304]; цели: 77706.1 (0.8908), 78020.0 (1.8941), 78230.5 (2.5669 = k*), 78543.9. Ответ sl 77050 / tp 78230.5 → 100, correct; исход SL 09-15 07:00 (L 76848.3, C 76895.3 < 77050 — закрытие за стопом, не вынос), −1R.

**CB-1. `combo-level-trade`, SHORT, TP при RR < 2** — участок LV-1, A = 777.7429. Ответ: зона [79380–79740], лимитка 79384.4 near-edge, sl 80000, tp 78230.5. zone 20, placement 25, type 5, sl 20 (Pl 79737.3, полоса от 79931.7357), цели от E = 79384.4: 79228.5 (0.2848), 78774.0 (1.1152), 78230.5 (2.1082 = k*), 77767.8; tp 18; RR 1.8744 → rr 6; quality 94, correct. Исход: исполнение 09-14 20:00, TP 09-14 23:00, +1.8744R.

**CB-2. `combo-level-trade`, LONG, правильная сделка в убыток** — участок ST-3, A = 464.5071. Ответ: зона [77200–77430], лимитка 77427.4 near-edge, sl 77050, tp 78343.8 (цель 4, k* = 4: RRref 2.7312). quality 100, correct. Исход: исполнение 09-15 05:00, SL 09-15 07:00, −1R.

**CB-3. `combo-level-trade`, SHORT, снятие ордера по реакции** — участок LV-2/LE-2, A = 370.2071. Ответ: зона [77290–77470], лимитка 77291.2, sl 77600, tp 76458.9 (k* = 3 76687.8207, tp — цель 4, допустима). quality 100, correct. Исход `cancelled-reaction` 09-17 14:00 (реакция от 77149.8 без исполнения), 0R.

**CB-S1. `combo-smc-entry`, LONG от OB, SL фитилём в конце окна** — BTCUSDT 4h, T = 2026-10-06 00:00 (C 85475), видимый ряд с 2026-07-14 20:00, A = 717.5143; тренд up (последнее событие CHoCH bull 09-21 08:00, защищённый low 74909.4). POI: OB bull 09-20 00:00 [80095.9–81295] fresh (тот же OB, что GS-4), dist 5.8257. Ответ: зона [80095.9–81295] (IoU 1), лимитка 81295 near-edge, sl 79850, tp 84350 (цель 5, k* = 5: RRref 2.2162). quality 100, correct. Исход: исполнение 10-08 12:00 (L 80901.2), SL 10-15 12:00 (L 79732.3, C 82374.0 — фитиль, но TP в остатке окна не достигнут → не stop hunt), −1R.

**CB-S2. `combo-smc-entry`, LONG, снятие по цели** — BTCUSDT 4h, T = 2026-09-30 20:00 (C 83576.9), A = 961.7286, тот же OB (dist 2.3727). Ответ: лимитка 81295, sl 79800, tp 84901.6 (k* = 4 84350.0; tp — цель 5, допустима). quality 100, correct. Исход `cancelled-target` 10-01 16:00 (H 85265.3 ≥ 84901.6 до исполнения), 0R.

### 14.3 Покрытие граничных случаев
| Правило | Участок |
|---|---|
| Сила: reactions, recency 0.5, htf, ранжирование, отрыв ≥ 1 | LV-1, LV-2 |
| `lv-zone`: все 4 класса | LV-2 |
| Пробой зоны и вход в следующую на той же свече | LV-3 |
| Пробой на минимальную величину (6.5 USDT) | LV-4 |
| Одна свеча пробивает две зоны, `none` | LV-5 |
| Реакция в зоне подхода без касания края | LE-2, CB-3 |
| Фитиль за дальний край без закрытия | LE-3 |
| Все полосы placement, `LIMIT_TYPE_MISMATCH`, `LIMIT_NOT_FILLED` | LE-1, LE-2, LE-3 |
| Исполнение касанием с равенством | ST-2 |
| `k*` не на первой цели; tp на C1 с RR < 1.5 | ST-1 |
| Stop hunt при стопе по правилам / без запаса | ST-2 |
| Закрытие за стопом — не stop hunt | ST-3 |
| SL фитилём без достижения TP — не stop hunt | CB-S1 |
| `cancelled-reaction`, `cancelled-target` | CB-3, CB-S2 |
| Тренд по свингам ≠ тренд BOS | SW-1 |

---

## 15. UI-структура раздела «Обучение» (запрос к Frontend/Designer)
1. **Блоки сверху** — без изменений: «Продолжить», «Цель дня», «Слабые места».
2. **«Курс»** — нумерованный список ступеней 1–8 (порядок §1.1). Строка: номер, название ступени, одна строка навыков («Swing High/Low, HH/HL/LH/LL, тренд по свингам» и т. д. из `CURRICULUM.md`), полоса прогресса (§10.3), подпись «N из 10 заданий · точность P%» или «Пройдено», статус-иконка (`not-started` — пустой круг, `in-progress` — половина, `passed` — галочка). Бейдж «Рекомендуем» — ровно у одной строки (§10.3). Все ступени открыты (вариант C). Нажатие — экран ступени: выбор задания (`sw-mark`/`sw-trend`, `lv-*`), сложность, ТФ, кнопка «Начать»; ниже — ключевые навыки ступени с точностью.
3. **«Комбинированные модули»** — отдельный блок после курса: «Уровень + лимитка + стоп/тейк», «SMC-вход», «Trading Challenge». Закрытый модуль: иконка замка, условие «Откроется после ступеней 2, 3, 4 — пройдено 1 из 3» со списком ступеней и их статусами (ссылки на ступени); строка не ведёт в задание, `aria-disabled`. Открытый — как ступень: статистика (число сделок, win rate, средний R из `rMultiple` попыток модуля) и «Начать».
4. Ступени 5–8 ведут в существующие экраны модулей; `/learn/market-structure` показывает новые сложности §9.1, `/learn/price-action` — без «Проведи уровень».
5. Экраны новых заданий используют `SessionLayout`; проигрывание — тот же компонент, что Challenge/Fibonacci (`TaskReplay`, маркеры исполнения `fillIndex` и выхода `exitIndex`, линии лимитки, SL, TP, зоны).
6. Тексты — `src/i18n/ru`; термины SMC — английские.

---

## 16. Статистика (обоснование порогов)
Наблюдения с перекрытием (каждая 3-я свеча, все уровни с `1 ≤ dist ≤ 6`): BTCUSDT 1h 2026-08-01…10-27, BTCUSDT 4h 2026-07-01…10-27, ETHUSDT 1h 2026-09-01…10-27, ETHUSDT 4h 2026-09-01…10-27, SOLUSDT 1h 2026-08…09; ряды обрезаны на пропуске 2026-10-28. Всего 9 305 наблюдений: реакция 3 271, пробой 2 854, без касания 3 110, timeout 70.

### 16.1 Сила уровня и реакция (доля реакций среди «реакция + пробой»)
| Признак | Значения → доля реакций |
|---|---|
| touches 2 / 3 / 4 / ≥ 5 | 0.55 / 0.54 / 0.57 / 0.48 |
| reactions 0 / 1 / 2 / ≥ 3 | 0.51 / 0.63 / 0.52 / 0.51 |
| age ≤ 50 / ≤ 150 / > 150 | 0.55 / 0.53 / 0.48 |
| flip нет / да | 0.52 / 0.54 |
| ТФ 1h / 4h | 0.53 / 0.55 |
| внешний тренд (N=5) по сделке / против | 0.58 / 0.48 (против тренда и touches ≥ 4 — 0.43) |
Вывод: сила — правило чтения; прогнозная сила слабая, направление тренда важнее числа касаний. Высота зоны: q10/q50/q90 = 0.200 / 0.375 / 0.494 ATR.

### 16.2 Лимитка и стоп (реакции, n = 3 271)
- Экстремум реакции от ближнего края (ATR, «+» — внутрь): q10 −0.382, q25 −0.176, q50 0.196, q75 0.656, q90 1.118; 38% — до края.
- Исполнение при глубине `dL` −0.5 / −0.3 / −0.2 / −0.1 / 0 / +0.1 / +0.2 / +0.3: 100% / 84% / 77% / 69% / 62% / 56% / 50% / 45% (−0.5 — по построению зоны подхода).
- Доля задач с `quality ≥ 75` у фиксированной стратегии (рубрика §5.3): −0.3 — 61%, −0.2 — 70%, −0.1 — 67%, 0 — 61%, +0.2 — 50%.
- Фитиль за дальним краем на реакции: не дальше 0 / 0.1 / 0.25 / 0.5 / 0.75 / 1.0 / 1.5 ATR — 62% / 68% / 75% / 84% / 90% / 94% / 98%.

### 16.3 Структура и свинги (окна каждые 10 свечей, BTCUSDT 4h/1h, ETHUSDT 1h, SOLUSDT 1h; 424 окна)
- Внешние BOS/CHoCH N=5: ≥ 2 события — в окне 60 свечей 11%, 80 — 16%, 120 — 29%, 150 — 38%.
- swing N=7 в 60: 4–6 меток — 81%; swing + подписи N=7 в 60: 8–12 — 81%; N=5 в 40: 8–12 — 74%.
- `swingTrend` N=5: range 49%, up 32%, down 19%; при тренде BOS `up` `swingTrend` = up лишь в 31% окон (range 48%, down 21%).

---

## 17. Тест-план для реализации (TDD, `packages/core/src/curriculum/`)
1. `zone.test.ts`: `levelZone` (минимальная высота), сила и её компоненты, `rankStrength` — LV-1, LV-2.
2. `reaction.test.ts`: `resolveZoneReaction` (порядок пробой → реакция, зона подхода, равенство) — LE-1…LE-3; `resolveZoneChain` — LV-3…LV-5.
3. `levels-grade.test.ts`: `lv-strongest`, `lv-zone` (все классы), `lv-reaction` (коды) — LV-1…LV-5.
4. `limit.test.ts`: полосы placement (границы проверяются ценами, не равенством дробей), type, fill, q, MAE/MFE — LE-1…LE-3.
5. `stoptake.test.ts`: `Pl`, кандидаты целей (слияние, `E*`, `k*`), рубрика, stop hunt — ST-1…ST-3.
6. `limit-trade.test.ts`: `resolveLimitTrade` (снятие по реакции и цели, исполнение, drill-down свечи исполнения — синтетический минимальный кейс `synthetic_fill_and_sl_same_candle` с пометкой `// SYNTHETIC: на реальных фикстурах нет 1m для такой свечи`, инвариант «15m и 1m дают одно») — CB-1…CB-S2.
7. `combo.test.ts`: рубрики §8 — CB-1…CB-S2.
8. `swings.test.ts`: `swingTrend` — SW-1; параметры `sw-mark` по сложностям.
9. `progress.test.ts`: `stageStatus` (10 попыток, 70%, пол навыка, необратимость `passed`, старые попытки MS/PA), открытие комбо, рекомендация.
10. `placeholders.test.ts` (расширение): все шаблоны §12 после подстановки параметров golden не содержат `{…}`.
11. `generate.test.ts`: детерминизм по `seed`, отсутствие свечей позже T в payload, отбраковка пропуска.

---

## 18. Расхождения с документами
1. `CURRICULUM.md`: ступень 5 = «Market Structure medium/hard». Спецификация переразмечает её в easy/medium/hard (§9.1); swing и HH/HL/LH/LL уходят в ступень 1 — по смыслу решения «разметка всех свингов только в ступени 1».
2. `ALGORITHMS.md` §1.6, §13.2, §13.3: таблицы понятий и `nExt` MS по сложностям меняются (§9.1) — смена эталона на тех же свечах, `ALGO_VERSION 2.0.0`; `packages/core/src/version.ts` — `ALGO_VERSION`, новая `CUR_ALGO_VERSION`.
3. `ALGORITHMS.md` §10.2, §13.4, §16.1: «Проведи уровень» ранжирует по касаниям; в ступени 2 — по силе §3.2 и с допуском «±0.3% или внутри зоны»; задание уходит из `price-action` (§9.2); тексты `LEVEL_NOT_STRONGEST` получают параметры силы.
4. `ALGORITHMS.md` §14.3: Challenge даёт полный балл SL при `Pl − 1.5·A ≤ sl < Pl` без минимального запаса; ступень 4 требует запас ≥ 0.25·A. Курс учит одному, Challenge оценивает мягче — согласование Challenge (MAJOR) — §19 п.5.
5. `ALGORITHMS.md` §16.3 и `progress/skills.ts` `generatorForSkill`: `swing`/`structure-labels` → `stage-swings`, `pa-level` → `levels` (§10.4).
6. Два определения тренда: `sw-trend` (по свингам) и MS `trend` (по BOS/защищённым уровням) — формулировки вопросов разведены (§2.3, §9.1).
7. `API_CONTRACTS.md` §2–§5: `ModuleId`, `SkillId`, `MarkKind 'zone'`, `NextRequest`, `TaskPayload`, `Answer`, `ModuleDetail`, validation-коды, `OkCode`/`ErrorCode` §12, `TaskReplay.fillIndex`, ключи `feedback.verdict.limit.*`, `feedback.verdict.trade.*`, `feedback.principle.<новые модули>`.
8. `feedback/build.ts`: список модулей с вердиктом «качество решения» (`challenge|fibonacci|elliott`) нужно расширить новыми модулями, кроме `stage-swings` (у `sw-mark` — «N из M»).
9. `apps/web/src/server/schemas.ts` (`MODULES`, `SKILLS`, `MARK_KINDS`, `NextSchemas`, `AnswerSchema`, `BUSINESS_CODES`), `storage/types.ts` (`ModuleId`), `LearnScreen.tsx` (`MODULES`) — новые значения.
10. `DATABASE_SCHEMA.md` / миграции: `attempts_module_check` — §13.
11. `PRD.md`/`ROADMAP.md`: нет FR/AC и вехи для курса из ступеней — решения пользователя есть только в `CURRICULUM.md`.
12. `FIBONACCI.md` §6: навык `fib-reaction` оценивает выбор против фактического исхода (вероятностный) — в критерий «пройдено» ступени 7 не включён (§10.2).
13. Имя навыка ступени 2 `pa-level` сохраняет префикс PA ради накопленной статистики.

## 19. Спорные места и вопросы оркестратору
1. **Сила уровня** `touches + 0.5·reactions + recency + htf` и отрыв эталона ≥ 1 (§3.2–§3.3). Данные (§16.1) показывают слабую прогнозную силу; тренд по сделке важнее. Включать ли совпадение с трендом в силу (это смешает уровень и контекст)? Предложение — нет, учить отдельно в комбо SMC.
2. **Вероятностные задания вне критерия «пройдено»:** `lv-reaction` и `limit-fill` (и `fib-reaction`) — информационные навыки (§10.2). Альтернатива — включить их и снизить порог; не рекомендуется (лучшая фиксированная стратегия не даёт 70%).
3. **Полосы лимитки** (§5.3): полный балл от опережения 0.3·A до 0.1·A внутрь; «середина» — 25 из 40. Это позиция «пропущенная сделка хуже худшей цены», подтверждённая долями исполнения; утвердить.
4. **Ступень 3 только на реакциях** (§5.1): без стопа пробои не оцениваются; пробои — в ступени 4 и комбо.
5. **Запас стопа 0.25–1.5 ATR** (§6.2) и согласование с Challenge §14.3 (сейчас без минимального запаса) — менять ли Challenge (MAJOR).
6. **Цели TP** (§6.3): ближний край любого уровня `findLevels` и живые внешние swing N=5 за входом, слияние 0.5·A; допустимы C1…C(k*+1). Не включены OB/FVG противоположного направления как цели — добавить?
7. **Снятие отложенного ордера** (§7): по подтверждённой реакции зоны и по цели (если цель за текущей ценой); консервативное разрешение неоднозначной минуты. Утвердить правило.
8. **Открытие:** 10 попыток, пул ключевых навыков ≥ 70%, пол навыка 50% (≥ 5 исходов), «пройдено» необратимо (§10.3). Challenge требует ступени 1–5 (в `CURRICULUM.md` — «всё вместе»: 1–8 закрыли бы Challenge за Эллиоттом) с сохранением доступа тем, кто уже торговал в Challenge. Замок — только UI: сервер прогресс не проверяет (нет обязательной авторизации) — достаточно ли этого?
9. **Ступень 5 easy** — только BOS/CHoCH в окне 120–150 и 2–8 меток (§9.1); `nExt` easy 7 → 5. Альтернатива «только medium/hard» отклонена.
10. **`swingTrend`** по последнему swing high и low (§2.3): «HH + LL» и «LH + HL» → range.
11. **Зона = разброс фитилей swing** с минимальной высотой 0.2·A (§3.1), без тел свечей.
12. **Веса комбо** 20/25/5/20/18/12 и правило `correct` (все части по правилам, RR ≥ 1.5) (§8.1).
13. **POI SMC:** только `fresh` OB и `open` FVG; FVG `partial` — «не свежий» (§8.2).
14. **Исполнение = касание** лимитной цены, без очереди и проскальзывания (§5.3, §7) — оптимистично для лимиток на точном экстремуме (ST-2: исполнение по 84855.0 = high свечи).
15. **Комбо питают навыки базовых ступеней** (§8): попытка комбо улучшает точность навыка, но не засчитывается в 10 попыток ступени (считаются по модулю). Утвердить.
16. **Правки чужих зон** (оркестратору): пункты 2–10 раздела 18; миграция `0005_curriculum.sql`; новых фикстур не требуется (§14.1).

## 20. Решения оркестратора (2026-11-07)
Утверждено как предложено: п. 1 (тренд в силу уровня не включать), 2, 3, 4, 7, 9, 10, 11, 12, 13, 15; п. 8 — Challenge открывается после ступеней 1–5, доступ сохраняется у тех, кто уже торговал; замок только в UI (один пользователь, достаточно).
Изменения:
- п. 5: правило запаса стопа 0.25–1.5·ATR применяется и в Trading Challenge (MAJOR: обновить рубрику Challenge §14.3 ALGORITHMS, ALGO_VERSION 2.0.0 покрывает).
- п. 6: цели TP дополнительно включают противоположные OB (fresh) и FVG (open) за входом.
- п. 14: исполнение лимитки — только если цена прошла лимитную цену хотя бы на 1 тик (касание ровно экстремумом не исполняет). Обновить golden, где исполнение было по экстремуму (ST-2 и др.).
