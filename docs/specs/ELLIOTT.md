# ELLIOTT — спецификация модуля Elliott Wave Lab (v1.2) для `@tl/core`

Версия документа: 1.0 (черновик на утверждение оркестратором), 2026-11-04. Автор: Technical Analyst.
`ALGO_VERSION` после реализации модуля: **`1.3.0`** (MINOR по `ALGORITHMS.md` §1.5: новый модуль и новые задания; метки и эталоны MS/PA/Challenge/Fibonacci не меняются; предполагается, что Fibonacci уже поднял версию до `1.2.0`, иначе Elliott выставляет `1.2.0`). Константа модуля **`EW_ALGO_VERSION = '1.0.0'`** пишется в golden-файлы этого документа и в `params` токена; смена семантики любого правила, допуска или веса ниже — MAJOR для `EW_ALGO_VERSION` и MINOR+ для `ALGO_VERSION`.
Источники: решения пользователя (SMC-трейдер, средний уровень), переданные оркестратором 2026-11-04 (вариант проверки C, состав структур, сложности, инструменты); `docs/specs/ALGORITHMS.md` (§1 соглашения, §2 swing, §1.3 ATR, §12.2 `idx(t)`, §13.1 генерация, §14.4 лимиты, §16 навыки, §17 шаблоны); `docs/specs/FIBONACCI.md` (§2 формулы, допуск ±0.04, `TaskReplay`, `relative`-шкала, стиль); `docs/API_CONTRACTS.md` (§2–§5); `docs/ROADMAP.md` (v1.2); `docs/DATABASE_SCHEMA.md` (`attempts.module`).
Проверка на реальных данных: все примеры и golden-участки (§15) получены из data.binance.vision (USDⓈ-M futures, monthly klines), каждый zip сверен с `.CHECKSUM`. Референсная реализация на Python (только для исследования, не продукт) использовалась для перебора разметок и поиска участков; ключевые значения сверены вручную по OHLC.

Условные обозначения: **(решение)** — выбор между вариантами с обоснованием; **(новое)** — дополнение к словарям `API_CONTRACTS.md`; **(вопрос)** — вынесено оркестратору (§18).

---

## 1. Область и общие соглашения

### 1.1 Что входит
| Сложность | `kind` задания | Пользователь размечает | Будущее |
|---|---|---|---|
| easy | `ew-impulse` | импульс 0–5 (6 точек), основной сценарий, уровень invalidation; альтернатива необязательна | да, только на сервере |
| medium | `ew-impulse-correction` | импульс 0–5 + коррекция A–B–C (zigzag или flat), сценарий, invalidation, альтернатива | да |
| hard | `ew-scenario` | любую допустимую разметку до текущей точки (0–2, 0–4, 0–5 или 0–5 + A–B–C), сценарий, invalidation, альтернатива | да |

Структуры: импульс 1–5 (в том числе с удлинённой 3-й), zigzag A–B–C, flat A–B–C. **Нет** подволн, треугольников, диагоналей, комбинаций (W–X–Y); проверка подволн невозможна — правила zigzag (5-3-5) и flat (3-3-5) проверяются только на уровне ценовых соотношений (§4.2).

Принцип проверки (вариант C, решение пользователя): **единственно верной разметки нет**. Оценивается: (1) нерушимые правила — обязательны, нарушение = «неверно»; (2) рекомендации Фибоначчи и чередования — баллы; (3) основной сценарий, корректный по правилам уровень invalidation и альтернативный сценарий — баллы; затем проигрывание будущего показывает, какой сценарий сработал (исход в счёт не входит, §11.4).

### 1.2 Переиспользуемые соглашения (без изменений)
- Только закрытые свечи (`closedOnly`, `ALGORITHMS.md` §1.1): незакрытая свеча не бывает точкой волны, не участвует в swing, правилах и проигрывании.
- Пропуски (`gaps`): генерация отбраковывает кандидата, если пропуск есть в видимом ряду **или** в будущем на весь лимит проигрывания (реальный случай: в monthly-архивах 2026-10 BTCUSDT/ETHUSDT/SOLUSDT нет свечей 2026-10-28 — 4h с 10-28 00:00 по 10-28 20:00, 1h с 10-28 00:00 по 10-28 23:00; см. EW-2).
- ATR14 — простое среднее TR (`ALGORITHMS.md` §1.3), `null` при `i < 14`; правило, требующее ATR, при `null` не срабатывает (кандидат отбраковывается).
- Swing — `detectSwings` (`ALGORITHMS.md` §2) с `left = right = N`; равные экстремумы — swing только у более ранней свечи.
- Сравнения цен свечей — точные; производные величины (отношения, уровни) — ровно по формулам ниже, без округления в ядре.
- При равенстве выигрывает более ранняя свеча, если не сказано иное. Случайность — только `mulberry32(seed)`.
- Время якоря -> индекс свечи `idx(t)` по `ALGORITHMS.md` §12.2.

### 1.3 Направление, роли точек, обозначения
- Направление импульса `dir`: `bull` (0 — low, 1 — high, 2 — low, 3 — high, 4 — low, 5 — high) или `bear` (зеркально). Коррекция после импульса: A и C — против импульса (для bull — low), B — по импульсу (для bull — high).
- **Цена точки — экстремум её свечи по роли** (high или low); цену якоря пользователя сервер не использует (снап, §2.2).
- Нормировка: `sg = (dir == 'bull') ? +1 : -1`; для точки с ценой `p` — `v = sg * p`. Все формулы ниже записаны в `v`, поэтому одинаковы для обоих направлений.
- `i_k` — индекс свечи точки `k`, `v_k` — нормированная цена. Длины волн (всегда в цене, положительные при правильном порядке):
```
L1 = v1 - v0;  L2 = v1 - v2;  L3 = v3 - v2;  L4 = v3 - v4;  L5 = v5 - v4
a  = v5 - vA                                  // длина A
retrB   = (vB - vA) / a                       // откат B в долях A; 1 = B на начале A (на точке 5)
cBeyond = (vA - vC) / a                       // насколько C ушла за конец A (>0 — за A)
cLen    = (vB - vC) / a                       // длина C в долях A
corrRetr = (v5 - vC) / (v5 - v0)              // глубина всей коррекции в долях импульса
size    = (v5 - v0) / ATR14[i0]               // размах импульса в ATR до начала движения (как FIBONACCI §3.1)
```

---

## 2. Разметка: Mark-типы, якоря, снап

### 2.1 Mark-типы (новое)
| `kind` | `anchors` (порядок = метки) | Роли (bull) | `direction` | `meta` у эталона (`author: 'algo'`) |
|---|---|---|---|---|
| `ew-impulse` | 3 (`0,1,2`), 5 (`0..4`) или 6 (`0..5`) | low, high, low, high, low, high | `bull`/`bear` | `{ labels, scenario, lengths, ratios, extended3 }` |
| `ew-zigzag` | 3 (`A,B,C`); начало A — точка 5 импульса той же разметки | low, high, low | как у импульса | `{ labels, retrB, cBeyond, cLen }` |
| `ew-flat` | 3 (`A,B,C`) | low, high, low | как у импульса | то же |
| `hline` (существующий) | 1 | — | null | `meta.role = 'ew-invalidation'` |
У меток пользователя `direction` и `meta` не требуются (сервер вычисляет сам). Id эталона: `algo:ew-impulse:-:<dir>:<time точки 0>`, `algo:ew-zigzag|ew-flat:-:<dir>:<time A>`.
Ответ содержит **не более одного** `ew-impulse` и **не более одной** коррекции; коррекция допустима только при 6-точечном импульсе (иначе 400 `EW_CORRECTION_WITHOUT_IMPULSE`).

### 2.2 Снап и допуск по времени
Клиент притягивает якорь к high/low свечи (магнит), сервер **пересчитывает сам**:
1. `userDir = anchors[1].price > anchors[0].price ? 'bull' : anchors[1].price < anchors[0].price ? 'bear' : null` (как `FIBONACCI.md` §5.2); `null` -> `EW_WRONG_ORDER`.
2. Для каждой точки с ролью `r` и индексом `i = idx(anchor.time)`: окно `[i - 2, i + 2]` ∩ видимый ряд (`toleranceCandles = 2`, как MS/FIB); `j* =` свеча с экстремумом роли в окне; если свеча `i` сама достигает этого экстремума — `j* = i`, иначе при равенстве — более ранняя. Цена точки — экстремум `j*`. Результат: `offsetCandles = j* - i`.
3. Дальнейшие проверки (§3–§5) идут по `j*`. Пример: BTCUSDT 4h, точка 4 поставлена на 2026-08-26 08:00 (L 78208.0) -> окно 08-26 00:00…16:00 (L 78252.8 / 78600.0 / 78208.0 / 77600.0 / 77812.6) -> `j*` = 08-26 12:00, цена 77600.0 (EW-4).

### 2.3 Уровень invalidation и сценарии в ответе
Горизонталь — одно число `invalidation` (цена); магнит UI притягивает к ценам точек разметки, сервер берёт число как есть. Сценарии — из закрытого списка §6.

---

## 3. Проверка точек (до правил)

Порядок проверок фиксирован; каждая точка получает не более одной ошибки `EW_POINT_*`.

| № | Проверка | Условие нарушения | Код | Severity |
|---|---|---|---|---|
| 1 | Порядок | индексы `j*` не строго возрастают; или любая из длин `L1..L5` (по имеющимся точкам), `a`, `vB - vA`, `vB - vC` `<= 0`; или `i_A <= i_5` | `EW_WRONG_ORDER` (одна на разметку; при ней §3.2–§5 не выполняются) | major |
| 2 | Экстремум сегмента | для каждой волны между соседними точками `s < e`: волна по направлению импульса — `min(v-low на [s,e]) != v_s` или `max(v-high на [s,e]) != v_e`; против — зеркально (с равенством: равный экстремум внутри сегмента допустим) | `EW_POINT_NOT_EXTREME` на точку, которая не является экстремумом (`params`: `extremeTime`, `extremePrice`) | major |
| 3 | Swing | `j*` не является внешним swing нужного типа с `N = nPoint` (§8) | `EW_POINT_NOT_SWING` | minor |
| 4 | Текущая точка | последняя точка разметки `!= lastPivot.index` задания (и цена не равна цене `lastPivot`) | `EW_COUNT_NOT_CURRENT` | major |
| 5 | Полнота по сложности | easy — не 6 точек импульса или есть коррекция; medium — нет 6 точек + коррекции | `EW_COUNT_INCOMPLETE` | major |
`v-low`/`v-high`: для bull — `low`/`high`, для bear — `-high`/`-low` (т.е. экстремумы в нормированных ценах). Сегментная проверка реализуется через префиксные/разреженные таблицы min/max (O(1) на сегмент).
**(решение)** Точка обязана быть и экстремумом сегмента (иначе цены правил считаются не по волне), и swing с `nPoint = 5` (иначе «волной» можно назвать двухсвечный шум). Ошибка swing — minor: правила на таких ценах всё ещё проверяемы.
Пример `EW_POINT_NOT_EXTREME`: SOLUSDT 1h, A поставлена на 2026-08-10 16:00 (L 75.54), B — 08-11 11:00: в сегменте A–B свеча 08-11 07:00 имеет L 75.36 < 75.54 (EW-1). Пример 2: BTCUSDT 4h, точка 3 на 08-21 08:00 (H 79555.5), точка 4 на 08-26 12:00: в сегменте 3–4 свеча 08-25 00:00 H 81270.5 (EW-4).

---

## 4. Нерушимые правила (обязательны)

### 4.1 Импульс (без диагоналей)
| Правило | Нарушение (в `v`) | Применимо | Код | Обоснование строгости |
|---|---|---|---|---|
| Wave 2 не уходит за начало wave 1 | `v2 < v0` | ≥ 3 точек | `EW_RULE_W2_BEYOND_W1` | «никогда не откатывает более 100%»: ровно 100% (`v2 == v0`, двойное дно) допустимо |
| Wave 3 уходит за конец wave 1 | `v3 <= v1` | ≥ 4 точек | `EW_RULE_W3_NOT_BEYOND_W1` | без этого 1–2–3 не импульс (стандартное следствие определения импульса) |
| Wave 3 не самая короткая из 1, 3, 5 | `L3 < L1 && L3 < L5` | 6 точек | `EW_RULE_W3_SHORTEST` | строго: равенство длин в double практически не встречается; при равенстве 3 не «короче» |
| Wave 4 не заходит в ценовую зону wave 1 | `v4 <= v1` | ≥ 5 точек | `EW_RULE_W4_OVERLAP` | зона wave 1 включает её конец: касание = заход |
Усечённая 5-я (`v5 <= v3`) **не** нарушение правила (truncation), но генерация такие импульсы не использует (§9).
Следствие для 5-точечной разметки (сценарий «ожидаю 5»): если `L3 < L1`, будущая 5-я не может быть длиннее 3-й — потолок `v4 + L3` выводится в `detail.scenario.secondaryLimit` (справочно, не оценивается).

### 4.2 Коррекции (на уровне цен, подволн нет)
| Тип | Правило | Нарушение | Код |
|---|---|---|---|
| zigzag (5-3-5) | B не доходит до начала A | `retrB >= 1` | `EW_ZIGZAG_B_TOO_DEEP` |
| zigzag | C уходит за конец A | `cBeyond <= 0` | `EW_ZIGZAG_C_NOT_BEYOND_A` |
| flat (3-3-5) | B откатывает почти всю A | `retrB < 0.9` | `EW_FLAT_B_TOO_SHALLOW` |
| flat | C около конца A или за ним | `cBeyond < -0.1` (C не дошла до конца A более чем на 10% длины A) | `EW_FLAT_C_TOO_SHORT` |
- **(решение)** Порог flat `0.9` и допуск C `-0.1` — формализация «B ≥ ~90% A» и «C около конца A» из решения пользователя. Зона `0.9 <= retrB < 1` при `cBeyond > 0` допускает **оба** типа — пользователь может назвать коррекцию как zigzag, так и flat (EW-2). `retrB >= 1` — только flat (в том числе expanded flat с B за точкой 5, EW-5).
- Тип коррекции пользователь выбирает инструментом; `detail.correction.validTypes` показывает, какие типы допустимы для этих цен.
- Коррекция сама по себе не обязана оставаться выше точки 0 (это не правило); но для сценария `trend-next` уровень invalidation — точка 0 (§6.3).

### 4.3 Граничные случаи (проверены на реальных свечах)
| Случай | Поведение | Пример |
|---|---|---|
| Wave 4 близко к вершине 1 | правило выполнено при `v4 > v1` даже с малым запасом | BTCUSDT 1h 2026-06-09 20:00: H 62253.2 против L 62381.2 точки 1 — запас 128.0 (EW-3) |
| 5-я едва за 3-й | не truncation | BTCUSDT 1h 2026-06-10 09:00: L 60691.9 против 60755.0 — на 63.1 ниже (EW-3) |
| Wave 2 почти 100% | валидно | BTCUSDT 4h: `r2 = 0.9215` (EW-4) |
| Соблазнительная разметка с заходом 4 в 1 | `EW_RULE_W4_OVERLAP` | BTCUSDT 4h, 0 = 08-14 12:00 … 4 = 08-26 12:00: 77600.0 <= 79555.5 (EW-4) |
| Соблазнительная разметка с 2 за 0 | `EW_RULE_W2_BEYOND_W1` | BTCUSDT 4h, 0 = 08-11 16:00 (L 63211.6), 2 = 08-14 12:00 (L 62484.2) (EW-4) |
| 3-я короче 1-й и 5-й | `EW_RULE_W3_SHORTEST` | BTCUSDT 1h 2026-07-25…27: L1 805.5, L3 652.6, L5 1116.2 (EW-6) |
| B за началом A | zigzag запрещён, flat (expanded) допустим | BTCUSDT 4h: B 81500.0 > точка 5 81270.5, `retrB = 1.0625` (EW-5) |
| C едва за A | правило zigzag выполнено при `cBeyond > 0` | ETHUSDT 1h 2026-09-22 14:00: L 2714.41 против A 2714.77 (на 0.36), но `corrRetr = 0.2053` — генерация отбраковывает (§9.3) |
| Равные экстремумы (A и C на одной цене) | `cBeyond = 0` -> zigzag не выполнен, flat выполнен | — (на просмотренных данных не встретилось; покрывается unit-кейсом `synthetic_` при необходимости) |
| Одна свеча — swing high и swing low | допустимо как две соседние точки только при `i_k < i_{k+1}`; на одной свече двух точек нет (`EW_WRONG_ORDER`) | — |

---

## 5. Рекомендации (баллы, не обязательны)

| `guide` | Условие выполнения | Применимо | Источник |
|---|---|---|---|
| `w2-depth` | `r2 = L2/L1 ∈ [0.46, 0.658]` (0.5–0.618 ± 0.04) | ≥ 3 точек | 2 в 0.5–0.618 |
| `w3-ratio` | `r3 = L3/L1 >= 1.4562` (1.618 − 10%): 3 ≈ 1.618·1 или длиннее (удлинённая) | ≥ 4 точек | 3 ≈ 1.618·1 |
| `w4-depth` | `r4 = L4/L3 ∈ [0.196, 0.422]` (0.236–0.382 ± 0.04) | ≥ 5 точек | 4 в 0.236–0.382 (не OTE 0.62–0.79) |
| `w5-ratio` | `|L5/L1 − 1| <= 0.1` **или** `|L5/(v3 − v0) − 0.618| <= 0.0618` | 6 точек | 5 ≈ 1 или 0.618·(0…3) |
| `alternation` | `|r2 − r4| >= 0.2` **или** `max(d2, d4) >= 2·min(d2, d4)`, `d2 = i2 − i1`, `d4 = i4 − i3` | ≥ 5 точек | чередование 2 и 4 по глубине/времени |
| `zigzag-b` | `retrB ∈ [0.342, 0.826]` (0.382–0.786 ± 0.04) | zigzag | B обычно 38–79% A |
| `zigzag-c` | `cLen` в пределах ±10% от 0.618, 1 или 1.618 | zigzag | C = 0.618/1/1.618 A |
| `flat-b` | `retrB <= 1.382` | flat | regular/expanded flat |
| `flat-c` | `cLen` в пределах ±10% от 1 или 1.618 | flat | C ≈ A или 1.618·A |
**(решение) Допуски:** уровни отката (`w2`, `w4`, `zigzag-b`) — абсолютный ±0.04, как `levelTol` в `FIBONACCI.md` §4 (одна шкала с «Где реакция?»); отношения длин (`w3`, `w5`, `zigzag-c`, `flat-c`) — относительный ±10% от целевого коэффициента (для 0.618 — ±0.0618), потому что длина, в отличие от уровня отката, растёт с целевым коэффициентом.
**Удлинённая 3-я** (`extended3`): `L3 >= 1.618·max(L1, L5)` (6 точек) — справочный признак, блок `OK_EW_EXTENDED3`; не отдельная рекомендация (удлинённая 3-я — вариант нормы, а не требование).
Граница: BTCUSDT 4h, разметка X: `r4 = 3670.5 / 18786.3 = 0.1954 < 0.196` — `w4-depth` не выполнена на 0.0006 (EW-4).
Невыполненная рекомендация -> `EW_GUIDE_MISS` (minor) с `params.guide`, фактическим и ожидаемым значением.

---

## 6. Сценарии, альтернатива, invalidation

### 6.1 Закрытый список (`EwScenarioId`, новое)
| id | Текст для пользователя | Основной? | Требуемая разметка | Следующее движение | Подтверждение (закрытие тела за уровнем) | Invalidation (по правилу, касание экстремумом) |
|---|---|---|---|---|---|---|
| `w3-next` | «Wave 2 завершена — ожидаю wave 3» | да | 0, 1, 2 | по импульсу | `close` за точкой 1 | цена за точкой 0: bull `low < P0` (правило §4.1 wave 2) |
| `w5-next` | «Wave 4 завершена — ожидаю wave 5» | да | 0…4 | по импульсу | `close` за точкой 3 | цена в зоне wave 1: bull `low <= P1` (правило wave 4) |
| `abc-next` | «Impulse 1–5 завершён — ожидаю коррекцию A–B–C» | да | 0…5 | против | `close` за точкой 4 | цена за точкой 5: bull `high > P5` (5-я не завершена) |
| `trend-next` | «Коррекция A–B–C завершена — ожидаю продолжение тренда» | да | 0…5 + A–B–C | по импульсу | `close` за B | цена за точкой 0: bull `low < P0` (коррекция как wave 2 старшего уровня) |
| `bc-next` | «Я ошибся на одну волну: моя 3 была 5, моя 4 — это A; дальше B и C» | только альтернатива | — | против (C за A) | `close` за последней точкой против импульса | — |
| `correction-extends` | «Коррекция ещё не завершена (wave 2/4/C удлинится или усложнится)» | только альтернатива | — | против | `close` за последней точкой против импульса | — |
| `impulse-extends` | «Impulse не завершён: 5-я удлинится (или моя 5 — это 3)» | только альтернатива | — | по импульсу | `close` за точкой 5 | — |
Bear — зеркально (`high > P0`, `high >= P1`, `low < P5`, …). Цены уровней — цены точек **разметки пользователя** (после снапа).
**(решение) Асимметрия:** подтверждение — закрытием тела (как BOS/CHoCH в проекте, `ALGORITHMS.md` §5.1), invalidation — касанием экстремумом (правила Эллиотта формулируются по ценам экстремумов: фитиль за точкой 0 уже делает новую точку 2 нарушающей правило). Это согласует проигрывание с §4: invalidation наступает ровно тогда, когда продолжение текущей разметки нарушило бы правило.

### 6.2 Согласованность
- **Основной сценарий** обязан совпадать с выводимым из разметки: 3 точки -> `w3-next`, 5 -> `w5-next`, 6 -> `abc-next`, 6 + коррекция -> `trend-next`. Иначе `EW_SCENARIO_MISMATCH` (major).
- **Допустимые альтернативы** (разный триггер подтверждения, чтобы проигрывание различало сценарии):
| Основной | Допустимые альтернативы |
|---|---|
| `w3-next` | `correction-extends` |
| `w5-next` | `bc-next`, `correction-extends` |
| `abc-next` | `impulse-extends` |
| `trend-next` | `correction-extends` |
- **Поддержка альтернативы** (только `bc-next`): в `enumerateCounts` (§7.1) должна существовать допустимая разметка 0…5, у которой A = последняя точка разметки пользователя (сегмент 5–A — экстремумы). `correction-extends` и `impulse-extends` поддержаны всегда (продолжение текущей волны не нарушает правил).
- Статусы альтернативы: `ok`; `missing` (`EW_ALT_MISSING`, major; на easy — не ошибка); `same` (= основной, `EW_ALT_SAME`, major); `not-allowed` (нет в таблице, `EW_ALT_INCONSISTENT` с `reason = not-allowed`, minor, 0 баллов); `unsupported` (`EW_ALT_INCONSISTENT` с `reason = unsupported`, minor, 0.5 балла).

### 6.3 Уровень invalidation (`ruleLevel`) и оценка ответа
`ruleLevel`: `w3-next` и `trend-next` — P0; `w5-next` — P1; `abc-next` — P5 (из разметки пользователя). Допуск `invTol = 0.25 · ATR14[T]` (передаётся в payload как цена).
```ts
s = Math.sign(ruleLevel - close[T]);                 // сторона invalidation относительно текущей цены
if (u === null)                         status = 'missing';            // EW_INVALIDATION_WRONG, reason missing
else if (Math.abs(u - ruleLevel) <= invTol) status = 'ok';
else if (s !== 0 && s * (u - close[T]) <= 0) status = 'wrong';        // не с той стороны цены; reason wrong-side
else if (s * (u - ruleLevel) > 0)       status = 'wrong';              // дальше правила; reason too-wide
else                                    status = 'tight';              // между ценой и уровнем правила
```
Баллы: `ok` 1, `tight` 0.5 (`EW_INVALIDATION_TOO_TIGHT`, minor: уровень на экстремуме своей волны — разумный стоп, но не invalidation подсчёта), `wrong`/`missing` 0 (`EW_INVALIDATION_WRONG`, major: «слишком широкий» уровень оставляет подсчёт «живым» после нарушения правила).
Пример (EW-4, `w5-next`, T = 2026-08-27 08:00, close 79440.1, ATR14 1016.65, `invTol` 254.1625): 65400.0 -> `ok` (P1 65482.7); 77600.0 (низ wave 4) -> `tight`; 62228.8 (точка 0) -> `wrong`, `too-wide`; 80000.0 -> `wrong`, `wrong-side`.
**(решение)** Уровень оценивается от разметки **самого пользователя** (даже если в ней нарушено правило): навык — «знать, какая точка инвалидирует какой сценарий». Нарушение правила уже обнуляет вердикт (§11).

---

## 7. Детекторы

### 7.1 `enumerateCounts` — все допустимые разметки до текущей точки
```ts
interface WavePoint { index: number; time: UtcMs; price: number; label: '0'|'1'|'2'|'3'|'4'|'5'|'A'|'B'|'C' }
interface WaveCount {
  direction: 'bull' | 'bear';
  impulse: WavePoint[];                                   // 3, 5 или 6 точек
  correction: { type: 'zigzag' | 'flat'; points: WavePoint[] } | null;   // type — первый допустимый: zigzag, затем flat
  scenario: 'w3-next' | 'w5-next' | 'abc-next' | 'trend-next' | 'bc-next';
  amplitude: number;                                      // max(v) - min(v) по точкам
}
interface CountScan { algoVersion: string; counts: WaveCount[]; truncated: boolean; byScenario: Record<string, number> }
function enumerateCounts(candles: Candle[], p: { nPoint: number; fromIndex: number; lastIndex: number; maxCounts: number }): CountScan;
```
- Кандидаты точек — внешние swing `nPoint`, подтверждённые к `lastIndex + nPoint` (при генерации — к T), с индексом в `[fromIndex, lastIndex]`; последняя точка — ровно `lastIndex`.
- Перебор с возвратом по чередующимся типам swing с отсечением: каждый новый сегмент проверяется на экстремумы (§3 п.2) и на правила §4, применимые к уже набранным точкам. Минимальный размер волн **не** требуется (оценка разметки пользователя от размера не зависит).
- Формы: 0–2, 0–4, 0–5, 0–5 + A–B–C (коррекция — с правилами zigzag или flat), `bc-next` = 0–5 + A (A = `lastIndex`).
- Порядок вывода: по `amplitude` убыв., затем по времени точки 0 возр. `maxCounts = 5000`; при превышении — `truncated = true` (генерация hard такого кандидата отбраковывает).
- Используется: проверка поддержки `bc-next` (§6.2), критерий hard (§9.4), эталонные разметки в `reference` (до 3 с разными `scenario`).

### 7.2 `findWaveCandidates` — участки для easy/medium
```ts
interface WaveCandidate { count: WaveCount; size: number; guides: number; corrRetr: number | null; confirmedIndex: number }
function findWaveCandidates(candles: Candle[], p: { nPivot: number; withCorrection: boolean; minSizeAtr: number; minWaveAtr: number; minGuides: number }): WaveCandidate[];
```
1. `zigzag(nPivot)`: внешние swing `nPivot` по индексу; подряд идущие одного типа сжимаются в один — более экстремальный (при равенстве — ранний). Получается чередующаяся последовательность pivot.
2. Кандидат-импульс — **6 подряд идущих pivot** (чистый импульс без внутренних pivot), начинающихся с low (bull) или high (bear), где все 5 сегментов проходят проверку экстремумов (§3 п.2; в данных встречаются pivot-последовательности, где экстремум сегмента не является swing — такие отбрасываются), выполнены правила §4.1 и `v5 > v3` (без truncation).
3. `size >= minSizeAtr`; каждая волна `L_k >= minWaveAtr · ATR14[i0]`; выполнено рекомендаций `>= minGuides` из 5.
4. `withCorrection`: следующие 3 pivot — A, B, C; сегменты 5–A, A–B, B–C проходят проверку экстремумов; выполнены правила хотя бы одного типа §4.2; `corrRetr ∈ [0.236, 1)`.
5. `confirmedIndex` = индекс последней точки + `nPivot`.
Статистика (обоснование порогов; monthly 2026-06…2026-10, BTCUSDT/ETHUSDT/SOLUSDT × 1h/4h, 30 рядов-месяцев): при `nPivot = 5` — 17 чистых валидных импульсов (14 с `size >= 6`, 8 с `size >= 6` и ≥ 3 рекомендаций); при `nPivot = 7` — 8 (все `size >= 6`; ≥ 2 рекомендаций — 6). Импульс + 3 pivot с экстремумами (`nPivot = 5`): 11, из них zigzag 5, flat 2, оба типа 1; годных для medium (`size >= 6`, `corrRetr ∈ [0.236, 1)`) — 4. На 4h при `nPivot = 5` чистых импульсов нет (волны 4h содержат внутренние pivot) — 4h-задания easy идут с `nPivot = 7`.

---

## 8. Параметры по сложностям (сводка)

| Параметр | easy | medium | hard |
|---|---|---|---|
| `kind` | `ew-impulse` | `ew-impulse-correction` | `ew-scenario` |
| ТФ задания | 1h, 4h | 15m, 1h, 4h | 15m, 1h, 4h |
| `nPivot` (детектор участка) | 7 | 5 | 5 |
| `nPoint` (точка пользователя — swing с этим N) | 5 | 5 | 5 |
| `toleranceCandles` (снап) | 2 | 2 | 2 |
| `minSizeAtr` / `minWaveAtr` | 6 / 1.0 | 6 / 1.0 | 5 / — (размер самой крупной разметки) |
| `minGuides` (из 5 импульса) | 2 | 0 | 0 |
| Требуемая форма ответа | 6 точек | 6 + A–B–C | 3 / 5 / 6 / 6 + A–B–C |
| Альтернатива | необязательна (0 баллов) | обязательна | обязательна |
| Неоднозначность | — | — | ≥ 2 разных сценария среди разметок с ≥ 5 точками (§9.4) |
| `invTol` | 0.25·ATR14[T] | то же | то же |
| Лимит проигрывания (свечей ТФ) | 15m 96, 1h 72, 4h 60 (`ALGORITHMS.md` §14.4) | то же | то же |
| Подсказки | направление импульса; живая проверка правил в UI (клиент вызывает те же функции §3–§5 по черновику) | нет | нет |
Ослабление (`ALGORITHMS.md` §13.1): после неудачного поиска критерий сложности ослабляется на ступень с сохранением `difficulty` и `kind` (hard: «≥ 2 сценария» -> любой участок с допустимой 6-точечной разметкой; easy: `minGuides` 2 -> 0).

---

## 9. Генерация заданий

### 9.1 Общие правила (решение)
- Кандидаты редки (~0.2–0.6 на ряд-месяц, §7.2), поэтому равномерный выбор T с 200 попытками (`ALGORITHMS.md` §13.1) почти всегда пуст. Генерация идёт **по сегментам**: `seed` -> (символ, ТФ по сложности, месяц архива старше 2 суток); детектор §7 на месяце плюс 500 свечей контекста слева; кандидаты сортируются по времени, выбирается `seed`-ый; при отсутствии — следующий месяц (до 24 сегментов), затем ослабление §8. Рекомендуется серверный кэш каталога кандидатов по `(symbol, tf, month, EW_ALGO_VERSION)` — архив закрытых месяцев неизменен **(вопрос)**.
- Видимая история — 500 закрытых свечей ТФ; пропуск в видимом ряду или в `(T, T + limit]` — отбраковка.
- Последняя видимая свеча `T = confirmedIndex + u`, `u ∈ [0, 3]` по `seed`; на `(lastIndex, T]`: нет цены за последней точкой (строго), не сработал ни один триггер сценария эталона (§6.1, включая альтернативу), не подтвердился новый внешний swing `nPoint`. Если условие нарушено — `u` уменьшается; при `u = 0` — кандидат отбраковывается.
- `lastPivot` (последняя точка эталона) раскрывается в payload и подсвечивается: пользователь размечает до неё («текущая точка»).
- Инвариант: детектор на ряду `candles[0..T]` находит тот же кандидат, что и на полном ряду (все точки подтверждены к T).
- Шкала времени — **`relative`** (будущее проигрывается; по дате его можно подсмотреть), как Challenge и `fib-reaction`.

### 9.2 easy — `ew-impulse`
`findWaveCandidates(nPivot = 7, withCorrection = false, minSizeAtr = 6, minWaveAtr = 1, minGuides = 2)`; окно `[i0 − pad, T]`, `pad ∈ [10, 30]`; в окне P0 — крайний экстремум своей стороны и P5 — крайний своей (иначе отбраковка). Эталонный сценарий `abc-next`.

### 9.3 medium — `ew-impulse-correction`
`findWaveCandidates(nPivot = 5, withCorrection = true, minSizeAtr = 6, minWaveAtr = 1, minGuides = 0)`; окно `[i0 − pad, T]`, `pad ∈ [10, 30]`, P0 — крайний экстремум окна своей стороны. Эталонный сценарий `trend-next`. Отбраковка мелкой коррекции `corrRetr < 0.236` (пример: ETHUSDT 1h, импульс 2026-09-15 18:00 … 09-21 20:00, A–B–C 09-22 05:00 / 13:00 / 14:00 — `corrRetr = 0.2053`).

### 9.4 hard — `ew-scenario`
1. Кандидат `lastIndex` — внешний swing `nPoint = 5`; окно `[T − W, T]`, `W ∈ [80, 200]` по `seed`.
2. `enumerateCounts(fromIndex = T − W, lastIndex)`: не `truncated`; среди разметок с ≥ 5 точками (`w5-next`, `abc-next`, `trend-next`, `bc-next`) есть **≥ 2 разных `scenario`** (сценарий `w3-next` в счёт не идёт: тройка low–high–low допустима почти всегда); самая крупная разметка `amplitude / ATR14[её i0] >= 5`.
3. Эталон (для fallback-проигрывания и показа) — разметка с наибольшей `amplitude` среди основных сценариев; при равенстве — с более ранней точкой 0. `reference` — до 3 разметок с разными сценариями.
4. Ловушка обязательна (хотя бы одна): в окне есть соблазнительная 5/6-точечная последовательность pivot, нарушающая ровно одно правило §4.1 (например, EW-4: 0 = 08-14 12:00 нарушает wave 4), или пик/дно с фитилём за точкой 3/5 без закрытия.

### 9.5 Payload и токен
```ts
type EwTaskKind = 'ew-impulse' | 'ew-impulse-correction' | 'ew-scenario';
type EwPrimaryScenario = 'w3-next' | 'w5-next' | 'abc-next' | 'trend-next';
type EwScenarioId = EwPrimaryScenario | 'bc-next' | 'correction-extends' | 'impulse-extends';
interface ElliottTask {
  kind: EwTaskKind; tf: TaskTimeframe;
  window: { fromTime: UtcMs; toTime: UtcMs };          // где размечать (шкала задания)
  lastPivot: { time: UtcMs; type: 'high' | 'low'; price: number };   // текущая точка: разметка заканчивается здесь
  directionHint: 'bull' | 'bear' | null;               // только easy
  shapes: ('impulse-3' | 'impulse-5' | 'impulse-6' | 'impulse-6+correction')[];   // easy ['impulse-6'], medium ['impulse-6+correction'], hard все
  primaryOptions: EwPrimaryScenario[];                 // всегда все 4
  alternativeOptions: EwScenarioId[];                  // всегда все 7 (проверка допустимости — при оценке)
  alternativeRequired: boolean;                        // false на easy
  nPoint: number; toleranceCandles: number;           // 5, 2
  invalidationTolerance: number;                       // invTol, цена
  limitCandles: number;
  tools: ['ew-impulse', 'ew-zigzag', 'ew-flat', 'hline'];
  hints?: { liveRules: true };                         // только easy
}
```
`sealed.params = { ewAlgoVersion, kind, nPivot, nPoint, window, lastPivot: {index, time}, refCount: {times[], type}, invTol }`. При `grade` сервер пересчитывает детектор и сверяет с запечатанным эталоном (рассогласование — 500 + лог, не оценка).

---

## 10. Проигрывание — `resolveScenario`

```ts
interface EwOutcome {
  basis: 'user' | 'reference';           // чья разметка проигрывается
  primary: EwPrimaryScenario; alternative: EwScenarioId | null;
  levels: { invalidation: number; confirm: number; altConfirm: number | null };
  kind: 'primary' | 'alternative' | 'invalidated' | 'timeout';
  index: number; time: UtcMs;            // свеча события (или T + limit)
  altAfterInvalidation: UtcMs | null;    // только при kind = 'invalidated'
  extreme: { high: number; low: number };   // экстремумы на (T, index]
}
function resolveScenario(candles: Candle[] /* полный ряд с будущим */, T: number, count: WaveCount, primary: EwPrimaryScenario, alternative: EwScenarioId | null, limit: number): EwOutcome;
```
```ts
for (let j = T + 1; j <= T + limit; j++) {
  if (kind === null) {
    if (invalidationTouched(j))      { kind = 'invalidated'; index = j; }            // 1. касание уровня invalidation (§6.1)
    else if (primaryClosed(j))       return done('primary', j);                      // 2. закрытие за уровнем подтверждения
    else if (alt && altClosed(j))    return done('alternative', j);                  // 3. закрытие за уровнем альтернативы
  }
  if (kind === 'invalidated' && alt && altClosed(j)) { altAfterInvalidation = time[j]; break; }   // та же свеча допускается
}
// kind === null -> 'timeout', index = T + limit
```
- **Порядок на одной свече (решение):** invalidation -> основной -> альтернатива. Консервативно: касание правила ломает подсчёт независимо от закрытия; drill-down на 1m не нужен (подтверждения — по закрытию).
- `basis = 'user'`, если в разметке пользователя нет `EW_WRONG_ORDER` и `EW_POINT_NOT_EXTREME`; иначе проигрывается эталонная разметка (`basis = 'reference'`) с основным сценарием эталона.
- `replay = { tf, candles: свечи (T, min(index + 10, T + limit)], exitIndex: индекс свечи события в replay }` — форма `ChallengeReplay` (предлагаемое имя `TaskReplay`, как в `FIBONACCI.md` §9.3).
- Реальные случаи: фитиль за точкой 3 без закрытия — не подтверждение (BTCUSDT 4h 2026-08-28 00:00: H 81500.0 > 81270.5, C 79783.3; EW-4); альтернатива с последующей invalidation (BTCUSDT 1h 2026-06-11 17:00 и 06-12 15:00; EW-3); фитиль за C без закрытия, затем закрытие на 64.5 за C (BTCUSDT 4h 09-01 16:00 и 09-02 08:00; EW-5).

---

## 11. Оценка (рубрика 0–100)

### 11.1 Части
| Часть `key` | Как считается (0…1) | easy | medium | hard |
|---|---|---|---|---|
| `points` | `max(0, 1 − (notExtreme + 0.5·notSwing) / nPoints)`; при `EW_WRONG_ORDER` — 0 | 20 | 15 | 10 |
| `rules` | 1 — нет ошибок §4.1 и §4.2; иначе 0; при `EW_WRONG_ORDER` — 0 | 40 | 35 | 25 |
| `guides` | выполнено / применимо (импульс + коррекция по её типу); при `EW_WRONG_ORDER` — 0 | 15 | 15 | 10 |
| `scenario` | 1 — основной совпадает с выводимым (§6.2), иначе 0 | 5 | 5 | 5 |
| `invalidation` | 1 / 0.5 / 0 (§6.3) | 20 | 15 | 25 |
| `alternative` | 1 `ok` / 0.5 `unsupported` / 0 прочее (§6.2) | 0 | 15 | 25 |
`quality = Σ weight·part` (0…100); `GradeResult.score = quality / 100`.

### 11.2 Вердикт
- **Блокирующие ошибки** (правила обязательны): `EW_WRONG_ORDER`, `EW_RULE_*`, `EW_ZIGZAG_*`, `EW_FLAT_*`, `EW_COUNT_NOT_CURRENT`, `EW_COUNT_INCOMPLETE` -> `verdict = 'incorrect'`, `score = min(score, 0.4)`.
- Иначе: `correct` — `quality >= 80` и нет других major; `partial` — `quality >= 50`; иначе `incorrect`.
- Обоснование весов: на easy главное — правила и точки (60); на hard — сценарий, invalidation и альтернатива (55), т.к. задание строится на неоднозначности.

### 11.3 Пример (EW-1, easy, разметка 0 = 08-06 23:00 … 5 = 08-09 22:00, `abc-next`, invalidation 77.88, без альтернативы)
`points` 1, `rules` 1, `guides` 5/5, `scenario` 1, `invalidation` ok -> quality 100, `correct`. Та же разметка с точкой 0 = 08-07 05:00 (L 72.39, тоже swing и экстремум сегмента): допустима, `w5-ratio` не выполнена (`L5/L1 = 1.1186`) -> guides 4/5, quality 97, `correct`.

### 11.4 Исход не входит в счёт (решение)
Счёт оценивает процесс (правила, уровень, план Б), как качество Challenge (`ALGORITHMS.md` §14.3): на EW-4 и EW-5 обе разметки после события продолжили быть допустимыми (коррекция удлинилась, затем тренд продолжился), т.е. исход одного окна не доказывает и не опровергает подсчёт. Исход показывается в разборе (часть 1) и в `detail.outcome` **(вопрос: ввести небольшой вес исхода)**.

---

## 12. Контракты API (расширение `API_CONTRACTS.md`)

### 12.1 Типы
```ts
type ModuleId = /* … */ | 'fibonacci' | 'elliott';                                   // (новое)
type SkillId = /* … */ | 'ew-impulse' | 'ew-correction' | 'ew-rules' | 'ew-invalidation';   // (новое)
type MarkKind = /* … */ | 'ew-impulse' | 'ew-zigzag' | 'ew-flat';                     // (новое); Mark.anchors до 6
```

### 12.2 `POST /api/tasks/elliott/next`
```ts
type NextRequest = /* … */ | (NextBase & { module: 'elliott'; tf?: TaskTimeframe });   // tf из списка сложности (§8), иначе по seed
type TaskPayload = /* … */ | ElliottTask;                                               // §9.5
```
`series` — только `tf` задания, закрытые свечи до T (500); `timeline.mode = 'relative'`.

### 12.3 `POST /api/tasks/elliott/grade`
```ts
interface ElliottAnswer {
  kind: EwTaskKind;
  impulse: Mark;                          // kind 'ew-impulse', author 'user', anchors 3 | 5 | 6
  correction: Mark | null;                // kind 'ew-zigzag' | 'ew-flat', anchors 3
  primary: EwPrimaryScenario;
  alternative: EwScenarioId | null;
  invalidation: number | null;            // цена горизонтали
}
type ModuleDetail = /* … */ | { kind: EwTaskKind; elliott: ElliottDetail };
interface EwPointCheck { label: WavePoint['label']; userTime: UtcMs; time: UtcMs; price: number; offsetCandles: number; extreme: boolean; swing: boolean }
interface EwRuleCheck { rule: 'w2' | 'w3-beyond-w1' | 'w3-shortest' | 'w4-overlap' | 'zigzag-b' | 'zigzag-c' | 'flat-b' | 'flat-c'; ok: boolean; actual: number; limit: number }
interface EwGuideCheck { guide: 'w2-depth' | 'w3-ratio' | 'w4-depth' | 'w5-ratio' | 'alternation' | 'zigzag-b' | 'zigzag-c' | 'flat-b' | 'flat-c'; ok: boolean; actual: number; expected: string }
interface ElliottDetail {
  direction: 'bull' | 'bear' | null;
  points: EwPointCheck[];
  lengths: number[]; ratios: Record<string, number>; extended3: boolean | null;
  rules: EwRuleCheck[]; guides: EwGuideCheck[];
  correction: { given: 'zigzag' | 'flat'; validTypes: ('zigzag' | 'flat')[] } | null;
  scenario: { primary: EwPrimaryScenario; implied: EwPrimaryScenario | null; alternative: EwScenarioId | null;
              altStatus: 'ok' | 'missing' | 'same' | 'not-allowed' | 'unsupported' | 'optional-empty'; secondaryLimit: number | null };
  invalidation: { given: number | null; ruleLevel: number; ruleRef: 'P0' | 'P1' | 'P5'; tolerance: number;
                  status: 'ok' | 'tight' | 'wrong' | 'missing'; reason: 'missing' | 'wrong-side' | 'too-wide' | null };
  validCounts: Record<string, number>;   // byScenario из enumerateCounts
  quality: { score: number; parts: { key: string; score: number; weight: number }[] };
  outcome: EwOutcome;
}
```
zod и 400 (validation issue, попытка не оценивается) **(новое)**: `EW_ANCHORS_COUNT` (импульс не 3/5/6 или коррекция не 3 якоря; неверный `kind` метки), `EW_ANCHOR_OUT_OF_RANGE` (время якоря вне `window`), `EW_CORRECTION_WITHOUT_IMPULSE` (коррекция при импульсе не из 6 точек), `EW_SCENARIO_UNKNOWN` (значение вне `primaryOptions`/`alternativeOptions`), `EW_SHAPE_NOT_ALLOWED` (форма не из `shapes`: например коррекция на easy), `EW_INVALIDATION_INVALID` (не конечное положительное число), `EW_ALT_REQUIRED` не используется — отсутствие альтернативы оценивается (§6.2).
`reference`: до 3 эталонных разметок (§9.4) + `hline` уровня invalidation эталона (`meta.role = 'ew-invalidation'`); `replay` — §10.
Миграция (запрос к Backend/DB): `supabase/migrations/0004_elliott_module.sql` (номер — после миграции Fibonacci) — `alter table public.attempts drop constraint …, add constraint attempts_module_check check (module in ('market-structure', 'price-action', 'challenge', 'fibonacci', 'elliott'))`; `skill_stats.skill` — свободный текст, правка не нужна.

---

## 13. Навыки и прогресс

| Навык | `total` | `correct` |
|---|---|---|
| `ew-impulse` | точки импульса + применимые рекомендации импульса | точки без `EW_POINT_*` + выполненные рекомендации |
| `ew-correction` (medium/hard с коррекцией) | 3 точки + 2 правила типа + 2 рекомендации типа | без ошибок + выполненные |
| `ew-rules` | применимые правила §4.1 + 2 правила коррекции (если есть) | выполненные |
| `ew-invalidation` | 1 (+1 сценарий, +1 альтернатива при `alternativeRequired`) | `invalidation = ok` + `scenario = 1` + `altStatus = ok` |
При `EW_WRONG_ORDER` все навыки получают `correct = 0`. Исход навыка — `correct / total >= 0.8` (`ALGORITHMS.md` §16.2). Адаптивная подборка: `kind` определяется сложностью (решение пользователя), `focus` для elliott не меняет генератор **(вопрос)**.

---

## 14. Коды и шаблоны разбора (источник `src/i18n/ru/feedback`)

### 14.1 Общие блоки
- Верность — `feedback.verdict.elliott.<verdict>` **(новое)**: «Верно: оценка {score}%. {outcomeText}» / «Частично верно: оценка {score}%, есть ошибки ниже. {outcomeText}» / «Неверно: оценка {score}%. {outcomeText}». `{outcomeText}` — словарь §14.4.
- Принцип без ошибок — `feedback.principle.elliott`: «Подсчёт волн — гипотеза, а не факт: правила отсекают невозможные разметки, invalidation level говорит, когда гипотеза сломана, а альтернатива — что делать дальше.»
- Параметры: время — локальное время UI на шкале задания; цены — до тика; отношения — 3 знака; `{label}` — «0»…«5», «A», «B», «C»; ни один шаблон не содержит условного текста.

### 14.2 Что понято верно (`OkCode`, новые)
| Ключ | Текст | Параметры |
|---|---|---|
| `OK_EW_POINTS` | Точки волн стоят на экстремумах и внешних swing: {count} из {total}. | count, total |
| `OK_EW_RULES` | Все правила Эллиотта выполнены: {rulesText}. | rulesText |
| `OK_EW_GUIDES` | Рекомендации Фибоначчи и чередования: выполнено {count} из {total}. | count, total |
| `OK_EW_EXTENDED3` | Wave 3 удлинённая: {l3} против {l1} у wave 1 и {l5} у wave 5. | l3, l1, l5 |
| `OK_EW_CORRECTION` | Коррекция названа верно: {type} (B {retrB} от A, C за концом A на {cBeyond}). | type, retrB, cBeyond |
| `OK_EW_INVALIDATION` | Invalidation level {price} стоит по правилу: {ruleText}. | price, ruleText |
| `OK_EW_ALT` | Альтернатива «{alt}» допустима и проверяется другим триггером: {altTrigger}. | alt, altTrigger |

### 14.3 Ошибки (части 3–6)
| Код | Навык | Severity | Ошибка (3) | Почему (4) | Как правильно (5) | Принцип (6) |
|---|---|---|---|---|---|---|
| `EW_WRONG_ORDER` | ew-impulse | major | Точки разметки идут не по порядку: {pointA} ({timeA}, {priceA}) и {pointB} ({timeB}, {priceB}). | Волны чередуются: по направлению impulse каждая следующая точка выше (bull) или ниже (bear) предыдущей противоположной, а время строго растёт. | Расставьте 0, 1, 2… слева направо, чередуя swing low и swing high. | Разметка волн — последовательность экстремумов; без порядка правила не применимы. |
| `EW_POINT_NOT_EXTREME` | ew-impulse / ew-correction (A–C) | major | Точка {label} на {userTime} ({price}) не является экстремумом своей волны. | Между точками {prevLabel} и {nextLabel} цена дошла до {extremePrice} на {extremeTime}: волна заканчивается там. | Перенесите точку {label} на {extremeTime}: магнит привяжет её к {sideName} {extremePrice}. | Волна измеряется от экстремума до экстремума, иначе длины и соотношения ложные. |
| `EW_POINT_NOT_SWING` | ew-impulse / ew-correction | minor | Точка {label} на {time} не является внешним swing (N={n}). | Слева или справа от свечи в пределах {n} свечей есть {sideName} не хуже: это колебание внутри волны. | Ставьте точки волн на внешние swing: так волна заметна на графике задания. | Волна — значимое движение; шум внутри волны волной не считается. |
| `EW_COUNT_NOT_CURRENT` | ew-impulse | major | Разметка заканчивается на {userTime}, а текущая точка — {lastTime} ({lastPrice}). | Сценарий строится от последнего подтверждённого swing: волны после вашей последней точки не размечены. | Доведите подсчёт до {lastTime}: решите, какой волной является это движение. | Прогноз по устаревшему подсчёту не учитывает то, что рынок уже сделал. |
| `EW_COUNT_INCOMPLETE` | ew-impulse | major | В задании нужно разметить {shapeText}, а в ответе {givenText}. | {shapeRule} | Добавьте недостающие точки инструментами {toolsText}. | Задание проверяет полную структуру; часть подсчёта не оценивается как целое. |
| `EW_RULE_W2_BEYOND_W1` | ew-rules | major | Wave 2 ({p2}, {t2}) ушла за начало wave 1 ({p0}, {t0}). | Правило: wave 2 никогда не откатывает больше 100% wave 1. Здесь откат {r2}. | Если цена ушла за начало wave 1, импульс начинается ниже: перенесите точку 0 на {extremeTime} или считайте движение коррекцией. | Нарушение правила — не «редкий вариант», а неверный подсчёт. |
| `EW_RULE_W3_NOT_BEYOND_W1` | ew-rules | major | Wave 3 ({p3}) не вышла за конец wave 1 ({p1}). | В импульсе wave 3 всегда обновляет экстремум wave 1; без этого 1–2–3 — коррекция, а не impulse. | Ищите wave 3 там, где цена прошла за {p1}, или размечайте участок как A–B–C. | Impulse — движение с обновлением экстремумов по тренду. |
| `EW_RULE_W3_SHORTEST` | ew-rules | major | Wave 3 ({l3}) короче wave 1 ({l1}) и wave 5 ({l5}). | Правило: wave 3 никогда не бывает самой короткой из 1, 3 и 5. | Скорее всего, ваша wave 3 — только её часть: проверьте, не являются ли точки 3–4 внутренним откатом wave 3. | Самая короткая 3-я означает, что волны посчитаны со сдвигом. |
| `EW_RULE_W4_OVERLAP` | ew-rules | major | Wave 4 ({p4}, {t4}) зашла в зону wave 1 (конец wave 1 — {p1}). | Правило для impulse (без диагоналей): wave 4 не перекрывает ценовую зону wave 1. | Если перекрытие есть, это не 4-я: возможно, ваша wave 1 — это wave 3 меньшего масштаба, или идёт коррекция A–B–C. | Перекрытие 1 и 4 ломает импульсный подсчёт. |
| `EW_ZIGZAG_B_TOO_DEEP` | ew-correction | major | В zigzag wave B ({pB}) дошла до начала A ({p5}): откат {retrB} A. | В zigzag B откатывает меньше 100% A (обычно 38–79%). | B на уровне или за началом A — признак flat: выберите инструмент «Flat». | Тип коррекции определяется глубиной B. |
| `EW_ZIGZAG_C_NOT_BEYOND_A` | ew-correction | major | В zigzag wave C ({pC}) не ушла за конец A ({pA}). | В zigzag C всегда выходит за конец A. | Если C не дошла до A, коррекция не завершена или это flat с короткой C: проверьте правило flat. | Zigzag — резкая коррекция с обновлением экстремума A. |
| `EW_FLAT_B_TOO_SHALLOW` | ew-correction | major | Во flat wave B откатила только {retrB} A. | Во flat B откатывает почти всю A — не меньше 90%. | При откате B меньше 90% выберите инструмент «Zigzag». | Flat — боковая коррекция: B возвращается к началу A. |
| `EW_FLAT_C_TOO_SHORT` | ew-correction | major | Во flat wave C ({pC}) не дошла до конца A ({pA}): не хватает {short} A. | Во flat C заканчивается около конца A или за ним (допуск 10% длины A). | Дождитесь C у конца A или размечайте коррекцию как незавершённую (альтернатива «Коррекция не завершена»). | Незавершённая коррекция — не повод для входа по тренду. |
| `EW_GUIDE_MISS` | ew-impulse / ew-correction | minor | Рекомендация «{guideName}» не выполнена: {actual} при ожидании {expected}. | {guideRule} | Рекомендация не обязательна; если несколько рекомендаций не выполнено, проверьте альтернативный подсчёт. | Соотношения Фибоначчи повышают вероятность подсчёта, но не доказывают его. |
| `EW_SCENARIO_MISMATCH` | ew-invalidation | major | Основной сценарий «{given}» не следует из разметки: она заканчивается точкой {lastLabel}. | После точки {lastLabel} подсчёт ожидает «{implied}». | Выберите «{implied}» или измените разметку. | Сценарий — продолжение подсчёта, а не отдельная догадка. |
| `EW_INVALIDATION_WRONG` | ew-invalidation | major | Invalidation level {given} поставлен неверно: {reasonText} | Для сценария «{primary}» подсчёт ломается, когда {ruleText}, то есть на {ruleLevel}. | Поставьте горизонталь на {ruleLevel} (допуск ±{tol}). | Invalidation — цена, при которой подсчёт нарушает правило; без неё прогноз нельзя проверить. |
| `EW_INVALIDATION_TOO_TIGHT` | ew-invalidation | minor | Уровень {given} ближе к цене, чем invalidation по правилу ({ruleLevel}). | Цена за {given} ещё не нарушает правила: подсчёт остаётся допустимым до {ruleLevel}. | Используйте {given} как стоп сделки, а invalidation подсчёта держите на {ruleLevel}. | Стоп сделки и invalidation подсчёта — разные уровни. |
| `EW_ALT_MISSING` | ew-invalidation | major | Альтернативный сценарий не выбран. | На этом участке допустимы и другие разметки: {altCountsText}. | Выберите альтернативу из допустимых для «{primary}»: {allowedText}. | Без плана Б invalidation застаёт врасплох. |
| `EW_ALT_SAME` | ew-invalidation | major | Альтернатива совпадает с основным сценарием «{primary}». | Альтернатива должна давать другой триггер, чтобы рынок мог показать, какой сценарий верен. | Выберите из: {allowedText}. | Два одинаковых сценария — это один сценарий. |
| `EW_ALT_INCONSISTENT` | ew-invalidation | minor | Альтернатива «{alt}» не сочетается с разметкой: {reasonText} | Допустимы альтернативы с другим триггером, опирающиеся на допустимую разметку того же участка. | Для «{primary}» подходят: {allowedText}. | Альтернатива — тоже подсчёт по правилам, а не любой другой исход. |
Validation-коды §12.3 — сообщения 400 (FR-FB-09), в разбор не попадают.

### 14.4 Словари текстовых параметров
| Параметр | Значения |
|---|---|
| `outcomeText` (`EwOutcome.kind`) | `primary` — «Дальше сработал основной сценарий: закрытие за {confirm} на {time}.»; `alternative` — «Дальше сработала альтернатива: закрытие за {altConfirm} на {time}.»; `invalidated` — «Подсчёт инвалидирован: цена коснулась {invalidation} на {time}.»; `timeout` — «За {limit} свечей ни один сценарий не подтвердился.» |
| `reasonText` (`EW_INVALIDATION_WRONG`) | `missing` — «уровень не поставлен.»; `wrong-side` — «он с другой стороны от текущей цены.»; `too-wide` — «он дальше уровня правила: подсчёт будет считаться живым после нарушения правила.» |
| `ruleText` | `P0` — «цена уходит за начало wave 1 (точка 0)»; `P1` — «цена заходит в зону wave 1 (точка 1)»; `P5` — «цена обновляет экстремум точки 5» |
| `reasonText` (`EW_ALT_INCONSISTENT`) | `not-allowed` — «у неё тот же триггер, что у основного сценария, или она не следует из этой точки.»; `unsupported` — «на участке нет допустимого импульса 0–5, у которого ваша последняя точка была бы A.» |
| `guideName` / `guideRule` | `w2-depth` — «глубина wave 2» / «Wave 2 обычно откатывает 50–61.8% wave 1 (допуск ±0.04).»; `w3-ratio` — «длина wave 3» / «Wave 3 обычно не короче 1.618 wave 1 (допуск −10%); длиннее — удлинённая 3-я.»; `w4-depth` — «глубина wave 4» / «Wave 4 обычно откатывает 23.6–38.2% wave 3 (это не зона OTE 0.62–0.79).»; `w5-ratio` — «длина wave 5» / «Wave 5 обычно равна wave 1 или 0.618 пути от 0 до 3 (допуск ±10%).»; `alternation` — «чередование 2 и 4» / «Если wave 2 глубокая, wave 4 обычно мелкая или длится заметно дольше (и наоборот).»; `zigzag-b` — «глубина B в zigzag» / «B обычно 38.2–78.6% A.»; `zigzag-c` — «длина C в zigzag» / «C обычно 0.618, 1 или 1.618 A.»; `flat-b` — «глубина B во flat» / «B обычно не дальше 138.2% A.»; `flat-c` — «длина C во flat» / «C обычно равна A или 1.618 A.» |
| `sideName` | для low-точек — «low», для high-точек — «high» |
| `shapeText` / `givenText` | `impulse-6` — «impulse 0–5»; `impulse-6+correction` — «impulse 0–5 и коррекцию A–B–C»; число точек ответа — «{n} точек impulse» / «impulse и коррекцию» |
| `shapeRule` | easy — «Лёгкое задание проверяет полный impulse из пяти волн.»; medium — «Задание проверяет impulse и следующую за ним коррекцию.» |

---

## 15. Golden-участки

### 15.1 Формат и процесс
Файлы `fixtures/golden/ew_EW-<n>.<символ>-<tf>-<период>.<суть>.golden.json`, поля как `ALGORITHMS.md` §18.1: `algoVersion: "1.0.0"` (`EW_ALGO_VERSION`), `author: "technical-analyst"`, `date: "2026-11-04"`, `source` (пути CSV + sha256), `function` (`checkCount` / `enumerateCounts` / `findWaveCandidates` / `resolveScenario` / `gradeElliott`), `params`, `expected`, `rationale` по каждой метке. Создаются после утверждения спецификации. Время — UTC `openTime`; индексы — в наборе перечисленных файлов (с первой свечи). Отношения — 4 знака (тест: точность `1e-9` относительно формул §1.3).
Фикстуры (zip сверены с `.CHECKSUM`):
| Файл | В репозитории | sha256 CSV | sha256 zip |
|---|---|---|---|
| `klines/SOLUSDT/1h/SOLUSDT-1h-2026-08.csv` | **нет** | `3513f142da378dafcd50365072d8c030749b4a46123135fef8bca64f6ca960c6` | `a25ab3dfcabcf739bd8bdd0aa9b1302865d5c571a5af1ffbb6e4a2b5c26ab833` |
| `klines/ETHUSDT/4h/ETHUSDT-4h-2026-09.csv` | да | `23775ef5e2b2ad47d88370a8f8e222ccf1f1c0e3f605daae9f3fb031855ff2be` | `9bb8b5ec953a6f5e96ab0470091fb76307d0935ae43332ecd1e442d494e0c7f0` |
| `klines/ETHUSDT/4h/ETHUSDT-4h-2026-10.csv` | **нет** | `13c6eb851825abfefb889bb6b1a7dd56efdc950959694ab0c01121ecb1abd8fe` | `3053e4d835ecda19e9170abd600568da661070c87f68a2395813fe98ac6085e4` |
| `klines/BTCUSDT/1h/BTCUSDT-1h-2026-06.csv` | **нет** | `43b014f49ac5586b1f575791649ee5e88b629ace2a8f58d167eb379ae5a52112` | `30bba473837a672a6a00a181a447446852414e6927bbda6684f873571788e9aa` |
| `klines/BTCUSDT/1h/BTCUSDT-1h-2026-07.csv` | **нет** | `fb49ce88123549ab9156d4f7afb0fd1bd32880ec4cf52066277d0008e187c2d1` | `a09f135066ace6925ce051ddbbdd4345c103423fbe35d32b568942de978dcc7c` |
| `klines/BTCUSDT/4h/BTCUSDT-4h-2026-07.csv`, `-08`, `-09` | да | `3f315145…e101`, `e8a295e3…d2ec`, `83ab0cd5…b92a` (как `fixtures/README.md`) | как `fixtures/README.md` |
URL: `https://data.binance.vision/data/futures/um/monthly/klines/<SYMBOL>/<tf>/<имя>.zip`.

### 15.2 Участки
**EW-1. SOLUSDT 1h, учебный impulse вверх (5/5 рекомендаций, удлинённая 3-я) + zigzag; easy и medium-оценка** — `SOLUSDT-1h-2026-08.csv` (744 свечи).
- Импульс (`nPivot = 7`, чистый — 6 подряд pivot; на N=7 это **единственная** допустимая 6-точечная разметка, на N=5 — две):
| Точка | Время | OHLC | Цена |
|---|---|---|---|
| 0 | 08-06 23:00 (idx 143) | O 72.65 H 72.71 L 72.29 C 72.65 | **72.29** |
| 1 | 08-07 13:00 (157) | O 73.87 H 74.33 L 73.76 C 74.09 | **74.33** |
| 2 | 08-07 17:00 (161) | O 73.55 H 73.55 L 73.15 C 73.38 | **73.15** |
| 3 | 08-08 15:00 (183) | O 76.48 H 76.82 L 76.22 C 76.37 | **76.82** |
| 4 | 08-09 01:00 (193) | O 75.99 H 76.08 L 75.71 C 75.86 | **75.71** |
| 5 | 08-09 22:00 (214) | O 77.33 H 77.88 L 76.63 C 76.80 | **77.88** |
- Длины 2.04 / 1.18 / 3.67 / 1.11 / 2.17. Правила: все выполнены (W4: 75.71 > 74.33). Рекомендации: `r2` 0.5784 ✓, `r3` 1.7990 ✓, `r4` 0.3025 ✓, `L5/L1` 1.0637 ✓, чередование `|0.5784 − 0.3025|` = 0.2759 ✓ (и время 4 против 10) -> 5/5; `extended3` ✓ (3.67 ≥ 1.618·2.17 = 3.5111). ATR14[i0] 0.38, `size` 14.711.
- Вторая допустимая разметка на N=5: 0 = 08-07 05:00 (L 72.39): `r2` 0.6082, `L5/L1` 1.1186 ✗ -> 4/5 (вариант C: засчитывается, §11.3).
- easy-задание: T = 08-10 05:00 (idx 221, close 76.86, ATR14 0.5121, `invTol` 0.1280). Сценарий `abc-next`: invalidation `high > 77.88`, подтверждение `close < 75.71`. **Дальше:** основной сценарий 08-10 16:00 (O 75.93 H 76.08 L 75.54 C 75.68); максимум после T 77.12 < 77.88.
- Сценарий у точки 4 (иллюстрация hard): T = 08-09 06:00 (idx 198), `w5-next`, invalidation `low <= 74.33`, подтверждение `close > 76.82` -> основной 08-09 14:00 (C 77.00).
- Коррекция (оценка medium; как задание не генерируется: внутри A есть pivot N=5 08-09 23:00 / 08-10 08:00 / 08-10 16:00 / 08-10 20:00): **A = 75.36** (08-11 07:00), **B = 76.35** (08-11 11:00), **C = 74.57** (08-11 15:00); `a` 2.52, `retrB` 0.3929, `cBeyond` 0.3135, `cLen` 0.7063, `corrRetr` 0.5921. zigzag: правила ✓, `zigzag-b` ✓, `zigzag-c` ✗ (0.7063 вне ±10% от 0.618); flat: `EW_FLAT_B_TOO_SHALLOW`. T = 08-11 20:00 (idx 260, close 76.01, ATR14 0.4893); `trend-next`: invalidation `low < 72.29`, подтверждение `close > 76.35`, альтернатива `correction-extends` `close < 74.57` -> **основной** 08-11 21:00 (O 76.02 H 76.41 L 75.97 C 76.41).
- Ошибка точки: A на 08-10 16:00 (L 75.54, pivot N=7) -> `EW_POINT_NOT_EXTREME`, экстремум сегмента A–B 75.36 на 08-11 07:00.

**EW-2. ETHUSDT 4h, impulse вниз + коррекция, допустимая и как zigzag, и как flat; пропуск архива в лимите** — `ETHUSDT-4h-2026-09.csv` + `-10.csv` (360 свечей), `nPoint = 5`.
| Точка | Время (idx) | Цена |
|---|---|---|
| 0 | 10-02 08:00 (188), H | **2779.00** |
| 1 | 10-02 16:00 (190), L | **2647.90** |
| 2 | 10-04 20:00 (203), H | **2738.68** |
| 3 | 10-08 16:00 (226), L | **2405.07** |
| 4 | 10-12 04:00 (247), H | **2578.97** |
| 5 | 10-15 00:00 (264), L | **2313.39** |
| A | 10-16 08:00 (272), H | **2493.48** |
| B | 10-18 16:00 (286), L | **2327.32** |
| C | 10-21 16:00 (304), H | **2526.99** |
- Длины 131.10 / 90.78 / 333.61 / 173.90 / 265.58; правила ✓ (W4: 2578.97 < 2647.90). Рекомендации: `w3-ratio` ✓ (2.5447); `r2` 0.6924 ✗, `r4` 0.5213 ✗, `w5` ✗ (2.0258; 0.7102), чередование ✗ (0.1711; 13 и 21 свечей) -> 1/5. `size` 12.906.
- Коррекция: `retrB` 0.9226, `cBeyond` 0.1861, `cLen` 1.1087, `corrRetr` 0.4588 -> `validTypes = [zigzag, flat]`; рекомендации zigzag 0/2 (`zigzag-b` ✗, `zigzag-c` ✗ — 1.1087 вне 1 ± 0.1), flat 1/2 (`flat-b` ✓, `flat-c` ✗).
- Вторая допустимая 5-точечная разметка до 10-12 04:00: 0 = 10-04 20:00, 1 = 10-05 16:00 (L 2676.97), 2 = 10-06 12:00 (H 2725.00), 3 = 10-08 16:00, 4 = 10-12 04:00.
- `trend-next` от T = 10-22 12:00 (idx 309, close 2397.60, ATR14 37.5779): invalidation `high > 2779.00`, подтверждение `close < 2327.32`, альтернатива `close > 2526.99` -> **основной** 10-24 12:00 (O 2364.60 H 2372.46 L 2281.22 C 2304.73). `w5-next` от T = 10-13 00:00 (idx 252): основной 10-15 00:00 (C 2358.47).
- Как задание: **отбраковка** — в `(T, T + 60]` пропуск архива 10-28 00:00…20:00; easy (N=7, импульс чистый) не проходит `minGuides = 2`; medium (N=5) не чистый. Golden проверяет `checkCount`, `resolveScenario`, `gradeElliott`.

**EW-3. BTCUSDT 1h, impulse вниз + zigzag; medium-кандидат; сработала альтернатива, затем invalidation** — `BTCUSDT-1h-2026-06.csv` (720 свечей), `nPivot = nPoint = 5`.
| Точка | Время (idx) | Цена |
|---|---|---|
| 0 | 06-08 15:00 (183), H | **64179.5** |
| 1 | 06-09 00:00 (192), L | **62381.2** |
| 2 | 06-09 05:00 (197), H | **63499.9** |
| 3 | 06-09 16:00 (208), L | **60755.0** |
| 4 | 06-09 20:00 (212), H | **62253.2** |
| 5 | 06-10 09:00 (225), L | **60691.9** |
| A | 06-10 15:00 (231), H | **62840.2** |
| B | 06-10 22:00 (238), L | **61068.6** |
| C | 06-11 11:00 (251), H | **63235.9** |
- Длины 1798.3 / 1118.7 / 2744.9 / 1498.2 / 1561.3; правила ✓ (W4 с запасом 128.0; 5 за 3 на 63.1). Рекомендации: `r2` 0.6221 ✓, `r3` 1.5264 ✓, `r4` 0.5458 ✗, `w5` ✗ (0.8682; 0.4559), чередование ✗ -> 2/5. `size` 6.281 (ATR14[i0] 555.29).
- Коррекция: `retrB` 0.8247, `cBeyond` 0.1842, `cLen` 1.0088, `corrRetr` 0.7294 -> zigzag ✓ (`zigzag-b` ✓ у верхней границы 0.826, `zigzag-c` ✓); как flat — `EW_FLAT_B_TOO_SHALLOW`.
- medium-кандидат (`findWaveCandidates`): 9 подряд pivot N=5, `size >= 6`, `corrRetr ∈ [0.236, 1)`. T = 06-11 16:00 (idx 256, close 62546.6, ATR14 404.32, `invTol` 101.08).
- `trend-next`: invalidation `high > 64179.5`, подтверждение `close < 61068.6`, альтернатива `correction-extends` `close > 63235.9` -> **альтернатива** на T+1: 06-11 17:00 (O 62546.6 H 63643.0 L 62315.0 C 63614.2). Справочно (после события): касание invalidation 06-12 15:00 (H 64362.6). Ответ без альтернативы на этом задании: `EW_ALT_MISSING`, исход — «инвалидирован» на 06-12 15:00.

**EW-4. BTCUSDT 4h, hard: две допустимые разметки на одной точке, три соблазнительные ошибки, фитиль за 3 без закрытия** — `BTCUSDT-4h-2026-07/08/09.csv` (552 свечи), `nPoint = 5`, текущая точка `lastPivot` = 08-26 12:00 (idx 339, L 77600.0), T = 08-27 08:00 (idx 344, close 79440.1, ATR14 1016.65, `invTol` 254.1625).
- Точки участка: 08-01 16:00 L 62228.8 (190); 08-03 08:00 L 62268.2 (200); 08-09 20:00 H 65482.7 (239); 08-11 16:00 L 63211.6 (250); 08-12 12:00 H 64450.0 (255); 08-14 12:00 L 62484.2 (267); 08-21 08:00 H 79555.5 (308); 08-23 04:00 L 75588.0 (319); 08-25 00:00 H 81270.5 (330); 08-26 12:00 L 77600.0 (339).
- `enumerateCounts(fromIndex = 180, lastIndex = 339)`: `w3-next` 5, `w5-next` 2, `bc-next` 2 -> два сценария с ≥ 5 точками -> **hard** ✓.
- **Разметка X** (`w5-next`): 0 = 08-01 16:00, 1 = 08-09 20:00, 2 = 08-14 12:00, 3 = 08-25 00:00, 4 = 08-26 12:00. Длины 3253.9 / 2998.5 / 18786.3 / 3670.5; правила ✓; `r2` 0.9215 ✗, `r3` 5.7735 ✓, `r4` 0.1954 ✗ (граница 0.196), чередование ✓ -> 2/4. Invalidation по правилу P1 = 65482.7.
- **Разметка Y** (импульс 0–5 до 08-25 00:00, текущая точка — A): 3 = 08-21 08:00, 4 = 08-23 04:00, 5 = 08-25 00:00; длины 3253.9 / 2998.5 / 17071.3 / 3967.5 / 5682.5; `r3` 5.2464 ✓, `r4` 0.2324 ✓, `w5` ✗ (1.7464; 0.3280), чередование ✓ -> 3/5; `extended3` ✓ (`size` 36.641). В ответе выражается как основной `w5-next` (X) + альтернатива `bc-next` (поддержана); 6-точечный ответ Y до 08-25 00:00 -> `EW_COUNT_NOT_CURRENT`.
- Ошибки: 0 = 08-14 12:00, 1 = 08-21 08:00, 2 = 08-23 04:00, 3 = 08-25 00:00, 4 = 08-26 12:00 -> `EW_RULE_W4_OVERLAP` (77600.0 <= 79555.5). 0 = 08-11 16:00, 1 = 08-12 12:00, 2 = 08-14 12:00, 3 = 08-25 00:00, 4 = 08-26 12:00 -> `EW_RULE_W2_BEYOND_W1` (62484.2 < 63211.6). 3 = 08-21 08:00 при 4 = 08-26 12:00 -> `EW_POINT_NOT_EXTREME` (экстремум 81270.5 на 08-25 00:00). Точка 4 на 08-26 08:00 -> снап на 08-26 12:00 (§2.2).
- Invalidation-ответы: §6.3.
- **Дальше** (X, `w5-next` + `bc-next`): 08-28 00:00 H 81500.0 > 81270.5, но C 79783.3 — не подтверждение; **альтернатива** 08-28 16:00 (O 78309.0 H 78381.6 L 76853.1 C 77546.4 < 77600.0). Справочно: позже закрытие выше 81270.5 — 09-03 12:00 (C 81316.7), т.е. и X (удлинённая 4-я), и Y (flat, EW-5) остались допустимыми.

**EW-5. BTCUSDT 4h, expanded flat (B за точкой 5); zigzag запрещён; альтернатива по закрытию на 64.5 за C** — те же файлы.
- Импульс Y (EW-4) + **A = 77600.0** (08-26 12:00), **B = 81500.0** (08-28 00:00, O 80208.9 H 81500.0 L 79659.2 C 79783.3), **C = 76853.1** (08-28 16:00). `a` 3670.5, `retrB` 1.0625, `cBeyond` 0.2035, `cLen` 1.2660, `corrRetr` 0.2320.
- flat ✓ (`flat-b` ✓, `flat-c` ✗ — 1.266 вне 1 ± 0.1 и 1.618 ± 0.1618); zigzag -> `EW_ZIGZAG_B_TOO_DEEP`.
- T = 08-29 12:00 (idx 357, close 77824.1, ATR14 976.67, `invTol` 244.17). `trend-next`: invalidation `low < 62228.8`, подтверждение `close > 81500.0`, альтернатива `close < 76853.1`. 09-01 16:00 (L 76368.0, C 77286.3) — фитиль за C без закрытия; **альтернатива** 09-02 08:00 (O 77444.8 H 77518.2 L 76151.9 C 76788.6). Справочно: подтверждение основного позже — 09-03 16:00 (C 81722.9).
- Как задание не генерируется: импульс не чистый на N=5 и `corrRetr` 0.2320 < 0.236.

**EW-6. BTCUSDT 1h, соблазнительный impulse с самой короткой 3-й** — `BTCUSDT-1h-2026-07.csv` (744 свечи).
- 0 = 07-25 08:00 (584) L **63760.5**; 1 = 07-26 04:00 (604) H **64566.0**; 2 = 07-26 06:00 (606) L **64256.4**; 3 = 07-26 16:00 (616) H **64909.0**; 4 = 07-26 20:00 (620) L **64606.3**; 5 = 07-27 06:00 (630) H **65722.5**. Все точки — swing N=5 и экстремумы сегментов; W2 ✓, W3 за W1 ✓, W4 ✓ (запас 40.3); **L1 805.5, L3 652.6, L5 1116.2 -> `EW_RULE_W3_SHORTEST`**, вердикт `incorrect`, `score <= 0.4`.
- `enumerateCounts(fromIndex = 570, lastIndex = 630)`: допустимых разметок, оканчивающихся на 07-27 06:00, **нет** — участок не может быть заданием; golden проверяет правило.

### 15.3 Покрытие
| Правило / случай | Участок |
|---|---|
| учебный импульс 5/5, `extended3`, единственность на N=7, второй допустимый подсчёт на N=5 | EW-1 |
| W2 / W3-shortest / W4 нарушены | EW-4, EW-6, EW-4 |
| `EW_POINT_NOT_EXTREME`, снап ±2 | EW-1, EW-4 |
| zigzag ✓ / flat ✗; оба типа ✓; flat ✓ / zigzag ✗ (expanded) | EW-3, EW-2, EW-5 |
| граница рекомендации (`r4` 0.1954; `zigzag-b` 0.8247) | EW-4, EW-3 |
| исходы: основной; альтернатива; инвалидация после альтернативы; фитиль без закрытия | EW-1, EW-2; EW-3, EW-4, EW-5; EW-3; EW-4, EW-5 |
| hard-критерий (≥ 2 сценария), `bc-next` поддержан, `EW_COUNT_NOT_CURRENT` | EW-4 |
| отбраковка: пропуск в лимите; не чистый импульс; `corrRetr < 0.236` | EW-2; EW-1 (коррекция), EW-5; EW-5 |

---

## 16. Тест-план для реализации (TDD, `packages/core/src/elliott/`)
1. `rules.test.ts`: §4 на EW-1…EW-6 (точные `actual`, `limit`; строгие/нестрогие границы).
2. `guides.test.ts`: §5 (отношения до `1e-9`, граница `r4 = 0.1954`).
3. `points.test.ts`: снап ±2, `EW_POINT_NOT_EXTREME`, `EW_POINT_NOT_SWING`, `EW_WRONG_ORDER`, `EW_COUNT_NOT_CURRENT`.
4. `enumerate.test.ts`: `byScenario` EW-4 (`w3-next` 5, `w5-next` 2, `bc-next` 2), EW-6 (0), EW-1 (N=7 — 1, N=5 — 2 полных импульса).
5. `candidates.test.ts`: EW-1 (easy, N=7), EW-3 (medium, N=5); отказы EW-2/EW-5; инвариант префикса `candles[0..T]`.
6. `resolve.test.ts`: исходы EW-1…EW-5 (вид, свеча, порядок проверок на одной свече, фитиль без закрытия).
7. `grade.test.ts`: рубрика §11 (EW-1 — 100 и 97; EW-4 — invalidation `ok`/`tight`/`wrong`, `bc-next` поддержан; EW-6 — блокировка), skillOutcomes §13.
8. `placeholders.test.ts` (расширение): все шаблоны §14 после подстановки параметров EW-участков не содержат `{…}`.
9. `generate.test.ts`: детерминизм по `seed`, отсутствие свечей позже T в payload, отбраковка пропуска (EW-2).

---

## 17. Расхождения с документами
1. `API_CONTRACTS.md` §2.1: `Mark.anchors` «1..3 точки по типу» — `ew-impulse` требует до 6 якорей; `MarkKind` без `ew-impulse`, `ew-zigzag`, `ew-flat`; `ModuleId` без `elliott`; `SkillId` без `ew-*` (§12.1).
2. `API_CONTRACTS.md` §3.3–§3.4, §4.2, §5.1: путь `module`, `NextRequest`, `TaskPayload`, `Answer`, `ModuleDetail` — добавить варианты §12; validation-коды §12.3; `replay` только для challenge — нужен общий `TaskReplay` (как предлагает `FIBONACCI.md` §14 п.5).
3. `API_CONTRACTS.md` §4.1: `relative`-шкала описана только для Challenge — для elliott всегда `relative`.
4. `API_CONTRACTS.md` §5.2–§5.3: новые `OkCode`/`ErrorCode` §14; ключи `feedback.verdict.elliott.*`, `feedback.principle.elliott`.
5. `DATABASE_SCHEMA.md` / `0001_init.sql`: `attempts.module` check без `'elliott'` (и без `'fibonacci'`) — миграция §12.3.
6. `ALGORITHMS.md` §13.1: «T равномерно из архива, 200 попыток» — для elliott заменено поиском по сегментам-месяцам и каталогом кандидатов (§9.1); причина — редкость кандидатов.
7. `ALGORITHMS.md` §1.5 / `packages/core/src/version.ts`: `ALGO_VERSION` -> `1.3.0` (после Fibonacci), новая константа `EW_ALGO_VERSION = '1.0.0'`.
8. `ALGORITHMS.md` §16.1, §16.3: дополнить навыками §13; адаптивная подборка по `focus` для elliott не меняет `kind`.
9. `ROADMAP.md` v1.2: вход «v1.1 принят; отдельное интервью по Elliott» — решения переданы оркестратором, но `INTERVIEW_SUMMARY.md` их не содержит; `PRD.md` не имеет FR/AC для Elliott.
10. `ALGORITHMS.md` §1.6 / `FIBONACCI.md` §4: `nExt` easy = 7 — здесь `nPivot` easy = 7 только для выбора участка, а точки пользователя проверяются на swing N=5 на всех сложностях (§8) — сознательное отличие.
11. Архив data.binance.vision: monthly 2026-10 (BTCUSDT, ETHUSDT, SOLUSDT; 1h и 4h) не содержит свечей 2026-10-28 — генерация и `gaps` обязаны это обрабатывать (запрос Market Data Engineer: проверить daily-архив за 10-28).

## 18. Спорные места и вопросы оркестратору
1. **Точка — экстремум сегмента и swing N=5** (снап ±2); ошибка swing — minor, экстремума — major (§2.2, §3).
2. **Строгость правил:** wave 2 ровно на 100% допустима; касание конца wave 1 четвёртой — нарушение; wave 3 «не самая короткая» — строго (§4.1).
3. **Пороги коррекций:** flat `retrB >= 0.9`, C не короче конца A на 10%; zigzag `retrB < 1`, `cBeyond > 0`; зона 0.9–1 допускает оба типа (§4.2).
4. **Допуски рекомендаций:** откаты ±0.04, длины ±10%; `w3-ratio` — «не меньше 1.4562» (длиннее = удлинённая 3-я) (§5).
5. **Закрытый список сценариев** из 7 (4 основных + 3 только альтернативы) и таблица допустимых альтернатив (§6.1–§6.2); разметка, оканчивающаяся на A или B, не допускается — `bc-next` только как альтернатива.
6. **Invalidation:** P0 для `w3-next`/`trend-next`, P1 для `w5-next`, P5 для `abc-next`; допуск `0.25·ATR14[T]`; «слишком тесный» уровень — 0.5 балла. Для `trend-next` уровень P0 далёк (EW-5: ~16 ATR) — подтвердить или взять C (практический уровень) (§6.3).
7. **Проигрывание:** invalidation — касанием, подтверждения — закрытием; порядок на свече invalidation -> основной -> альтернатива; `abc-next` подтверждается закрытием за точкой 4 — мелкая коррекция A может не дойти до 4 (timeout) (§10).
8. **Исход не входит в счёт** (§11.4) — или дать ему вес 5–10.
9. **Веса рубрики** по сложностям и блокировка `score <= 0.4` при нарушении правила (§11).
10. **Генерация по сегментам и каталог кандидатов** (§9.1); пороги easy `nPivot 7`, `size >= 6`, `minGuides 2`; medium — 9 подряд pivot N=5 и `corrRetr ∈ [0.236, 1)`; hard — ≥ 2 сценария с ≥ 5 точками. Пул кандидатов мал (~0.2 easy и ~0.13 medium на ряд-месяц 1h/4h): нужен прогон по полному архиву с 15m, пороги для 15m на данных не проверялись; 1d исключён.
11. **`kind` задаётся сложностью**, `focus` не влияет (§13).
12. **Терминал:** инструменты `ew-*` в свободном терминале и проверка «Проверить мою разметку» (правила §3–§5 без будущего) в спецификацию не включены — нужно решение.
13. **Новые фикстуры** (запрос к Market Data Engineer, §15.1): `SOLUSDT-1h-2026-08`, `ETHUSDT-4h-2026-10`, `BTCUSDT-1h-2026-06`, `BTCUSDT-1h-2026-07`.
14. **Правки чужих зон** (оркестратору): пункты 1–8 раздела 17; миграция `0004_elliott_module.sql`.

## 19. Решения оркестратора (2026-11-05)
- Все пункты §15–§17 утверждены как предложено, с уточнениями ниже.
- Invalidation после завершённой ABC (сценарий «после ABC → тренд»): уровень = точка **C** (выход за конец C означает, что коррекция не завершена), а не P0.
- Исход проигрывания в рубрику не входит (вес 0), как в Trading Challenge: качество решения оценивается отдельно от исхода; исход показывается в разборе.
- Инструменты Elliott (метки волн, уровень invalidation) входят в свободный терминал: разметка + проверка правил (без сценария и без прогресса).
- `focus` не влияет на тип задания; тип определяет сложность.
- Окна с пропусками данных (например, отсутствующие свечи 2026-10-28 в monthly-архивах) отбраковываются генерацией.
- Реализация стартует после завершения Fibonacci (общие файлы ядра: types, index, templates, version).
