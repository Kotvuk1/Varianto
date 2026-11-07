# ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`

Версия документа: 1.0 (черновик на утверждение оркестратором), 2026-11-03. Автор: Technical Analyst.
`ALGO_VERSION` этой спецификации: **`1.1.0`** (поправка v1.1 к §13.2, генерация и оценка «Разметки»; определения анализа §2–§8 не менялись и сохраняют версию `1.0.0` в `StructureResult.algoVersion` и golden — константа `ANALYSIS_ALGO_VERSION`). Прежняя версия: `1.0.0` (в коде сейчас `0.1.0` — каркас без алгоритмов; при реализации по этой спецификации Backend выставляет `1.0.0`).
Источники: `docs/INTERVIEW_SUMMARY.md`, `docs/PRD.md` (FR-MS, FR-PA, FR-TC, FR-FB, FR-PROG, OQ-02/08/09/11/16), `docs/ARCHITECTURE.md` §4, `docs/API_CONTRACTS.md`, `docs/DATABASE_SCHEMA.md` §5, ADR-0006, ADR-0007, ADR-0009.
Проверка на реальных данных: все примеры и golden-участки взяты из data.binance.vision (USDⓈ-M futures), контрольные суммы архивов сверены с `.CHECKSUM`. Референсная реализация на Python, по которой получены ожидаемые значения, использовалась только для поиска участков; ключевые метки сверены вручную по OHLC.

Условные обозначения: **(решение)** — выбор между вариантами с обоснованием; **(новое)** — дополнение к словарям `API_CONTRACTS.md` (код ошибки, поле); **(вопрос)** — вынесено оркестратору (раздел 20).

---

## 1. Общие соглашения

### 1.1 Входные свечи
- Все функции ядра принимают `Candle[]`, отсортированные по `openTime` по возрастанию, без дубликатов (результат `normalize`).
- **Только закрытые свечи.** Перед любым расчётом вызывается `closedOnly(candles)`:
  - хвост из свечей `closed === false` отбрасывается (в живом ряду это максимум одна свеча; в Challenge — частичные старшие свечи из `sliceAt`);
  - свеча `closed === false` не в хвосте -> исключение `CoreInputError('UNCLOSED_IN_SERIES')`.
  - Незакрытая свеча **никогда** не участвует в определении swing, BOS/CHoCH, sweep, OB, FVG, моделей PA и уровней (FR-DATA-08, ADR-0006 п.7). Это же правило распространяется на частичную старшую свечу Challenge при расчёте старшего тренда (ответ на ADR-0006 п.7).
- **Непрерывность.** `gaps(candles, tf)` находит пары соседних свечей с `openTime[i] - openTime[i-1] != TIMEFRAME_MS[tf]`.
  - Генерация заданий: окно с пропуском отбраковывается (свечи не выдумываются).
  - Терминал: анализируется только последний непрерывный сегмент; в результате возвращается `gaps` для показа пользователю (FR-DATA-09).
- Индексация: все алгоритмы работают по индексу `i` внутри переданного массива; во внешние структуры (`Mark`) время пишется как `openTime` свечи.

### 1.2 Термины свечи
Для свечи `c`:
- `range = high - low`; `body = |close - open|`; `bodyTop = max(open, close)`; `bodyBottom = min(open, close)`;
- `upperWick = high - bodyTop`; `lowerWick = bodyBottom - low`;
- бычья: `close > open`; медвежья: `close < open`; `close == open` — **нейтральная** (не бычья и не медвежья; доджи с нулевым телом).
- Свеча с `range == 0` не образует ни одну модель PA; в swing участвует по общим правилам.

### 1.3 ATR
`TR[i] = max(high[i]-low[i], |high[i]-close[i-1]|, |low[i]-close[i-1]|)` для `i >= 1`.
`ATR14[i] = (TR[i-13] + TR[i-12] + ... + TR[i]) / 14` — простое среднее, суммирование строго слева направо, определено при `i >= 14`; при `i < 14` значение `null`, и правила, требующие ATR, на этой свече не срабатывают. **(решение)** простое среднее вместо Wilder: проще проверять вручную, результат не зависит от длины истории до окна.

### 1.4 Детерминизм и числа
- Цены — `number` (double), полученные парсингом десятичных строк Binance; сравнения цен свечей между собой — **точные** (`>`, `>=`, `==`), без эпсилонов: две цены, пришедшие одной строкой, равны бит в бит.
- Производные пороги (доли ATR, проценты) вычисляются ровно по формулам документа, в указанном порядке операций; результат IEEE-754 одинаков в браузере и Node.
- Никаких `Date.now`, `Math.random`; случайность генерации — только из явного `seed` (PRNG `mulberry32(seed)`; **(решение)** — однозначно специфицируемый 32-битный генератор).
- Правила разрешения равенств указаны у каждого алгоритма; общий принцип: **при равенстве выигрывает более ранняя свеча** (первое касание уровня формирует уровень), если явно не сказано иное.
- Идентификаторы алгоритмических меток детерминированы: `algo:<kind>:<scope|->:<direction|->:<openTime ключевой свечи>`.

### 1.5 ALGO_VERSION
- Семвер-строка, записывается в каждую попытку и токен (ADR-0009).
- MAJOR — смена семантики определения (другой набор меток на тех же свечах), MINOR — новый детектор/поле без изменения существующих меток, PATCH — исправление реализации, приводящее её в соответствие этой спецификации (golden не меняется).
- Любое изменение значений параметров разделов 2–16 — MAJOR (меняет эталон). Изменение golden-файла без смены версии запрещено.

> **2.0.0 (CURRICULUM_STAGES.md):** MS «Разметка» переразмечена по ступеням (§9.1: swing и HH/HL/LH/LL — ступень 1, BOS/CHoCH/sweep/OB/FVG — ступень 5), запас стопа Challenge 0.25–1.5·ATR (§14.3), «Проведи уровень» переехало в ступень 2. Правила ступеней 2–4 и комбо версионируются `CUR_ALGO_VERSION = 1.0.0`. Таблицы §1.6/§13.2/§13.3 ниже описывают версию 1.x; актуальные параметры — CURRICULUM_STAGES.md §2.2, §9.1.

### 1.6 Параметры по сложностям (сводка)

| Параметр | easy | medium | hard | Терминал | Раздел |
|---|---|---|---|---|---|
| `nExt` (фрактал внешней структуры, слева = справа) | 7 | 5 | 5 | 5 | 2, 3 |
| `nInt` (фрактал внутренней структуры) | — (не оценивается) | 3 | 2 | 3 | 3 |
| Окно оценки MS «Разметка», свечей (v1.1) | 40–60 (макс. 60) | 40–70 (макс. 70) | 40–80 (макс. 80) | от первой метки пользователя | 12, 13.2 |
| Понятия в MS «Разметка» (v1.1) | только swing (external) | swing, HH/HL/LH/LL, BOS, CHoCH (external) | + по focus: internal, sweep, OB, FVG | все | 13.2 |
| `sweepHoldK` | 3 | 3 | 3 | 3 | 6 |
| `fvgMinAtr` | 0.5 | 0.5 | 0.5 | 0.5 | 8 |
| `obDisplacementAtr` | 1.2 | 1.2 | 1.2 | 1.2 | 7 |
| Допуск по времени `toleranceCandles` | 2 | 2 | 2 | 2 | 12 |
| Допуск уровня PA `tolerancePct` | 0.3 | 0.3 | 0.3 | — | 10 |
| Подсказки Challenge | да | нет | нет | — | 14 |

Обоснование выбора N (статистика на реальных данных, август 2026, BTC/ETH/SOL, 15m/1h/4h): плотность swing при N=2 — 28–30 на 100 свечей, N=3 — 20–22, N=5 — 12–14, N=7 — 8–10. N=7 на easy даёт ~11 swing в окне 120 свечей (крупная, «очевидная» структура); N=5 — стандарт внешней структуры для medium/hard; внутренняя структура N=3 (medium) и N=2 (hard, более мелкая и плотная). FR-MS-05 выполняется: N зависит от сложности (easy 7 / medium 5+3 / hard 5+2).

---

## 2. `detectSwings` — фрактальные swing

### 2.1 Сигнатура
```ts
type SwingType = 'high' | 'low';
interface Swing {
  index: number;            // индекс свечи в переданном массиве
  time: UtcMs;              // openTime свечи
  type: SwingType;
  price: number;            // high (для 'high') или low (для 'low') этой свечи
  confirmedIndex: number;   // index + right: первая свеча, на закрытии которой swing известен
  scope: 'external' | 'internal';   // заполняет analyzeStructure; detectSwings возвращает 'external'
  label: 'HH' | 'HL' | 'LH' | 'LL' | null;   // заполняет labelSwings (раздел 4)
}
interface SwingParams { left: number; right: number }       // в продукте всегда left = right = N
function detectSwings(candles: Candle[], p: SwingParams): Swing[];
function pendingSwings(candles: Candle[], p: SwingParams): Swing[];   // кандидаты у правого края (2.4)
```

### 2.2 Определение
Свеча `i` — **swing high**, если одновременно:
1. `left <= i <= n - 1 - right` (есть `left` свечей слева и `right` закрытых свечей справа);
2. `high[j] < high[i]` для всех `j` из `[i-left, i-1]` (слева строго ниже);
3. `high[j] <= high[i]` для всех `j` из `[i+1, i+right]` (справа не выше).

Swing low — зеркально: слева `low[j] > low[i]` строго, справа `low[j] >= low[i]`.

### 2.3 Граничные случаи
- **Равные максимумы (EQH).** Из двух свечей с одинаковым `high` в пределах окна swing — только **более ранняя**: у поздней в левом окне есть равный максимум, строгость слева не выполняется. **(решение)** Так первая вершина «двойной вершины» становится swing, а вторая образует равные максимумы — ликвидность (используется sweep, раздел 6). Реальный пример: BTCUSDT 15m 2026-08-24 21:00 и 21:45, `high = 79012.6` -> при N=5 swing только 21:00 (GS-9).
- **Одна свеча — и swing high, и swing low** (внешний бар, поглотивший окрестность) — допустимо, возвращаются оба. Порядок в выходном массиве: по `index`, при равенстве `high` раньше `low`. Пример: BTCUSDT 4h 2026-09-11 12:00 (H 79859.8, L 76000.3) — swing high и swing low при N=5 (GS-1).
- Доджи с нулевым телом и свеча с `range == 0` участвуют по общим правилам (важны только high/low).
- Свечей меньше `2N+1` -> пустой результат.
- Подтверждение: swing существует для алгоритма только начиная со свечи `confirmedIndex = i + right`. Ни BOS/CHoCH, ни sweep не могут ссылаться на swing до его подтверждения (нет заглядывания вперёд). Следствие: swing с менее чем `right` закрытыми свечами справа **не возвращается** `detectSwings`.

### 2.4 Кандидаты у правого края (`pendingSwings`)
Свеча `i` из `[n - right, n - 1]` — кандидат, если выполнены условия 2 (слева) и условие 3 для всех **имеющихся** правых свечей. Кандидаты не входят в эталон; используются только для кода `SWING_UNCONFIRMED` (раздел 12) и подсказки «swing ещё не подтверждён».

### 2.5 Псевдокод
```ts
function detectSwings(c, {left, right}) {
  const out: Swing[] = [];
  for (let i = left; i <= c.length - 1 - right; i++) {
    let isH = true, isL = true;
    for (let j = i - left; j < i; j++) { if (!(c[j].high < c[i].high)) isH = false; if (!(c[j].low > c[i].low)) isL = false; }
    for (let j = i + 1; j <= i + right; j++) { if (!(c[j].high <= c[i].high)) isH = false; if (!(c[j].low >= c[i].low)) isL = false; }
    if (isH) out.push(swing(i, 'high', c[i].high, i + right));
    if (isL) out.push(swing(i, 'low',  c[i].low,  i + right));
  }
  return out;          // уже упорядочено по index, high раньше low
}
```

---

## 3. Внешняя и внутренняя структура

### 3.1 Правило (решение)
Выбран подход двух независимых фрактальных слоёв, распространённый в SMC-практике (LuxAlgo «Smart Money Concepts»: swing structure / internal structure), с уточнением «защищённых уровней» для внешнего слоя:
- **Внешняя (external, swing) структура** — swing с `N = nExt`; события BOS/CHoCH — по машине состояний с защищёнными уровнями (раздел 5.2). Это «большая» структура, по которой определяется тренд.
- **Внутренняя (internal) структура** — swing с `N = nInt < nExt`, которые **не являются** внешними swing (та же свеча и тот же тип); события — по машине «последний подтверждённый swing» (раздел 5.3). Это микроструктура внутри внешних ног: откаты, внутренние CHoCH, предупреждающие о смене внешней структуры.

Обоснование: правило «внутренняя = swing с меньшим N внутри текущего внешнего диапазона» на реальных данных почти совпадает с независимым слоем, но требует определения «текущего диапазона» в моменты смены тренда и даёт разрывы; независимые слои однозначны, общеприняты и проверяемы. Защищённые уровни на внешнем слое нужны, чтобы пробой внутреннего lower high в откате восходящего тренда не считался внешним BOS (иначе слои совпадают по смыслу). Проверено: при одинаковой машине состояний внутренний слой N=2/3 на BTCUSDT 4h 2026-09 повторял внешние события и терял смысл.

### 3.2 Дедупликация
- Swing, найденный в обоих слоях (тот же `index` и `type`), получает `scope = 'external'` и в список внутренних не попадает.
- Внутреннее событие BOS/CHoCH **подавляется**, если на той же свече (`breakIndex`) внешний слой зафиксировал событие того же направления (`direction`). Одна свеча — один факт пробоя; старший слой важнее. Пример: BTCUSDT 15m 2026-10-20 12:30 — внешний BOS bull (уровень 81626.4) и внутренний CHoCH bull (81623.0) на одной свече; остаётся только внешний (GS-7).

### 3.3 Сигнатура `analyzeStructure`
```ts
interface StructureParams {
  nExt: number; nInt: number | null;            // null — внутренний слой не считается (easy)
  sweepHoldK: number;                           // 3
  fvgMinAtr: number;                            // 0.5
  obDisplacementAtr: number;                    // 1.2
}
interface StructureEvent {
  kind: 'bos' | 'choch'; direction: 'bull' | 'bear'; scope: 'external' | 'internal';
  level: number;                                // цена пробитого swing
  brokenSwing: { index: number; time: UtcMs; type: SwingType };
  breakIndex: number; breakTime: UtcMs;         // свеча, закрывшая тело за уровнем
}
interface LayerState {
  trend: 'up' | 'down' | 'none';
  refHigh: Swing | null;  // внешний слой: в up — цель BOS, в down — защищённый high (уровень CHoCH)
  refLow: Swing | null;   // внешний слой: в up — защищённый low (уровень CHoCH), в down — цель BOS
  lastEvent: StructureEvent | null;
}
interface StructureResult {
  algoVersion: string; params: StructureParams;
  swings: Swing[];                              // внешние + внутренние (с scope и label)
  events: StructureEvent[];                     // после подавления (3.2), по breakIndex, внешние раньше внутренних
  sweeps: Sweep[]; orderBlocks: OrderBlock[]; fvgs: Fvg[];
  state: { external: LayerState; internal: LayerState | null };   // на последней закрытой свече
  stateAt(index: number): { external: LayerState; internal: LayerState | null };   // состояние после обработки свечи index
  gaps: { fromTime: UtcMs; toTime: UtcMs }[];
}
function analyzeStructure(candles: Candle[], p: StructureParams): StructureResult;
function toMarks(r: StructureResult, window?: { fromIndex: number; toIndex: number }): Mark[];   // раздел 3.4
```

### 3.4 Отображение в `Mark` (общая модель `ARCHITECTURE.md` §4.2)
| Объект | `kind` | `anchors` | `scope` | `direction` | `meta` |
|---|---|---|---|---|---|
| Swing high / low | `swing-high` / `swing-low` | `[{time, price}]` свечи swing | external/internal | null | `{ confirmedTime }` |
| Метка структуры | `hh`/`hl`/`lh`/`ll` | `[{time, price}]` swing | как у swing | null | — |
| BOS / CHoCH | `bos` / `choch` | `[{time: brokenSwing.time, price: level}, {time: breakTime, price: level}]` | external/internal | bull/bear | `{ breakClose }` |
| Sweep | `sweep` | `[{time: swept.time, price: level}, {time: sweepTime, price: wickExtreme}]` | `external` | `bear` для sweep high (buy-side), `bull` для sweep low (sell-side) | `{ side: 'high'\|'low', sweptCount }` |
| Order Block | `order-block` | `[{time: obTime, price: top}, {time: endTime, price: bottom}]` | external | bull/bear | `{ status, eventTime, valid }` |
| FVG | `fvg` | `[{time: firstTime, price: top}, {time: endTime, price: bottom}]` | null | bull/bear | `{ status, middleTime, size }` |
| Уровень S/R | `level` | `[{time: lastTouchTime, price: center}]` | null | null | `{ low, high, touches, type }` |
| Модель PA | `pattern` | по одному якорю на свечу модели `{time: openTime, price: close}` | null | bull/bear/null | `{ patternType }` |

`endTime` — `openTime` свечи митигации/инвалидации/заполнения, иначе `openTime` последней закрытой свечи. Метки HH/HL/LH/LL выдаются отдельными `Mark` той же свечи, что и swing (пользователь ставит их отдельным инструментом, FR-DRAW-05).

---

## 4. Метки HH / HL / LH / LL

### 4.1 Правило
Для каждого слоя отдельно, по последовательности swing этого слоя в порядке `index` (внутренний слой — по полному набору swing с `N = nInt`, включая совпадающие с внешними; метки выдаются только внутренним):
- swing high сравнивается с **предыдущим swing high того же слоя**: `price > prev.price` -> `HH`, иначе (`<` или `==`) -> `LH`;
- swing low — с предыдущим swing low: `price < prev.price` -> `LL`, иначе (`>` или `==`) -> `HL`;
- первый swing каждого типа в ряду — `label = null` (не с чем сравнить; метка не выдаётся и не оценивается).

### 4.2 Граничные случаи
- **Равенство** цен: равный максимум — `LH` («не выше» = не обновил максимум), равный минимум — `HL`. **(решение)** Двойная вершина структурно не продолжает рост.
- Метки не требуют чередования high/low: два swing high подряд сравниваются между собой.
- Метки описывают последовательность экстремумов и не зависят от тренда/BOS; тренд определяет только машина состояний (раздел 5). Поэтому в восходящем тренде возможны LH/LL внутри отката без CHoCH (пример: BTCUSDT 4h 2026-09-28 12:00 `LL 82500.1` при внешнем тренде up и защищённом low 80095.9 — GS-1).

---

## 5. Тренд, BOS и CHoCH

### 5.1 Общие правила
- **Пробой фиксируется только закрытием тела:** бычий пробой уровня `L` свечой `k` — `close[k] > L` (строго); медвежий — `close[k] < L`. Фитиль за уровнем при `close` внутри — не пробой (FR-MS-07, AC-06). `close == L` — не пробой.
- Пробиваемый уровень — цена подтверждённого swing (`confirmedIndex <= k`). Подтверждённый на свече `k` swing не может быть пробит этой же свечой (её high/low не выходит за swing по определению фрактала), поэтому порядок «сначала подтверждения, затем проверка пробоя» корректен.
- `BOS` — пробой в сторону текущего тренда (или первый пробой при `trend = 'none'`); `CHoCH` — пробой против текущего тренда, меняющий его.
- Каждый swing пробивается не более одного раза: после события соответствующий `ref` сбрасывается.

### 5.2 Внешний слой — машина состояний с защищёнными уровнями
Состояние: `trend ∈ {none, up, down}`, `refHigh`, `refLow`, `bullRange`, `bearRange` (интервалы индексов `(from, to]`, в которых ищется защищённый уровень после пробоя).

Смысл `ref`:
| trend | `refHigh` | `refLow` |
|---|---|---|
| none | последний подтверждённый swing high | последний подтверждённый swing low |
| up | цель BOS: **наивысший** swing high, подтверждённый после последнего бычьего пробоя | **защищённый low** (strong low): самый низкий swing low в интервале от пробитого high до свечи пробоя |
| down | **защищённый high**: самый высокий swing high в интервале от пробитого low до свечи пробоя | цель BOS: **наинизший** swing low, подтверждённый после последнего медвежьего пробоя |

Псевдокод (на каждой закрытой свече `k` по возрастанию):
```ts
for (const s of swingsConfirmedAt(k)) {          // порядок: index asc, high раньше low
  if (s.type === 'high') onHigh(s); else onLow(s);
}
checkBreak(k);

function onHigh(s) {
  if (trend === 'down' && bearRange && bearRange.from < s.index && s.index <= bearRange.to) {
    // поздно подтверждённый swing внутри интервала медвежьего пробоя -> кандидат в защищённый high
    if (refHigh === null || refHighOrigin !== bearRange || s.price > refHigh.price) { refHigh = s; refHighOrigin = bearRange; }
  } else if (trend === 'up')   { if (refHigh === null || s.price > refHigh.price) refHigh = s; }
  else if (trend === 'none')   { refHigh = s; }
  else /* down, вне интервала */ { if (refHigh === null) refHigh = s; }
}
// onLow — зеркально (bullRange, '<', 'down' <-> 'up')

function checkBreak(k) {
  let bull = refHigh !== null && close[k] > refHigh.price;
  let bear = refLow  !== null && close[k] < refLow.price;
  if (bull && bear) { if (trend === 'up') bull = false; else bear = false; }   // практически невозможно; приоритет — пробой против тренда
  if (bull) {
    emit(trend === 'down' ? 'choch' : 'bos', 'bull', refHigh, k);
    const broken = refHigh; trend = 'up'; refHigh = null;
    bullRange = { from: broken.index, to: k };
    const cand = confirmedLows.filter(s => broken.index < s.index && s.index <= k);
    if (cand.length) { refLow = minBy(cand, s => [s.price, s.index]); refLowOrigin = bullRange; }   // самый низкий, при равенстве — ранний
    // если кандидатов нет — refLow не меняется; если он null, его заполнит следующий подтверждённый swing low
  } else if (bear) { /* зеркально */ }
}
```
Пояснения:
- После бычьего BOS следующий BOS требует **нового** swing high (подтверждённого после пробоя); старые более высокие swing — цели ликвидности, но не структура.
- Защищённый low переносится вверх только на подтверждённый swing low внутри ноги, давшей пробой; если откат перед пробоем не образовал swing `nExt`, защищённый уровень остаётся прежним (консервативно). Swing low, подтверждённый позже свечи пробоя, но лежащий в интервале (его правые свечи частично после пробоя), применяется в момент подтверждения.
- Пробой защищённого уровня — CHoCH; пробой цели — BOS.
- Первое событие из `trend = 'none'` — `bos` соответствующего направления. В заданиях это не влияет на оценку: анализ ведётся на всей видимой истории (500 свечей, 1d — 365), а оценивается только окно последних W свечей (раздел 13).

### 5.3 Внутренний слой — «последний подтверждённый swing»
```ts
for (const s of swingsConfirmedAt(k)) { if (s.type === 'high') refHigh = s; else refLow = s; }   // всегда последний
bull = refHigh && close[k] > refHigh.price; bear = refLow && close[k] < refLow.price;
if (bull && bear) { if (trend === 'up') bull = false; else bear = false; }
if (bull) { emit(trend === 'down' ? 'choch' : 'bos', 'bull', refHigh, k); trend = 'up'; refHigh = null; }
else if (bear) { emit(trend === 'up' ? 'choch' : 'bos', 'bear', refLow, k); trend = 'down'; refLow = null; }
```
Используются все swing `N = nInt` (включая совпадающие с внешними), затем применяется подавление 3.2.

### 5.4 Что происходит после CHoCH
- Тренд слоя меняется сразу на свече CHoCH.
- Защищённый уровень нового тренда — экстремум ноги, давшей CHoCH (см. `bullRange`/`bearRange`); цель BOS — первый новый swing в сторону нового тренда.
- Пример (GS-1, BTCUSDT 4h 2026-09): медвежий тренд, защищённый high 79570.9 (swing 09-14 20:00). Свеча 2026-09-18 12:00 закрылась на 80688.7 > 79570.9 -> CHoCH bull; новый защищённый low — 74909.4 (swing 09-15 16:00, самый низкий в интервале). Затем 09-21 08:00 close 84849.9 > 81933.9 (новый swing high 09-19 12:00) -> BOS bull.

### 5.5 Граничные случаи (проверены на реальных свечах)
| Случай | Поведение | Реальный пример |
|---|---|---|
| Фитиль за уровнем, тело внутри | Не пробой; может быть sweep | BTCUSDT 4h 2026-09-11 12:00: H 79859.8 > защищённый high 79737.3, C 77682.9 -> CHoCH нет, sweep (GS-1) |
| `close == level` | Не пробой | SOLUSDT 15m 2026-08-09 22:30: C 77.04 == защищённый low 77.04 -> CHoCH нет; 22:45 C 76.80 -> CHoCH bear (GS-8) |
| Пробой на минимальную величину | Пробой | BTCUSDT 4h 2026-08-01 16:00 (месячные архивы `BTCUSDT-4h-2026-07` + `-08`, N=5): C 62502.1 < защищённого low 62505.1 (swing 07-17 12:00), на 3.0 USDT -> CHoCH bear |
| Пробой незакрытой свечой | Игнорируется (свеча отброшена `closedOnly`) | — |
| Пробой swing до его подтверждения | Невозможен по построению (2.3) | — |
| Две свечи подряд закрываются за уровнем | Событие только на первой | — |

---

## 6. Liquidity sweep

### 6.1 Определение (решение)
Sweep — снятие ликвидности за **внешним** swing: фитиль за уровнем без закрытия тела за ним и удержание в течение `K = sweepHoldK = 3` следующих свечей.

Свеча `k` — **sweep high** (buy-side), если существует внешний swing high `S` такой, что:
1. `S.confirmedIndex < k`;
2. `S` «жив»: ни одна свеча из `(S.confirmedIndex, k)` не закрылась выше `S.price` и `S` ещё не был снят (sweep засчитывается один раз на swing);
3. `high[k] > S.price` и `close[k] <= S.price`;
4. **удержание:** `close[j] <= L` для всех `j` из `[k+1, k+K]`, где `L` — уровень sweep (см. 6.2). Sweep подтверждается на свече `k+K`; если `k + K > n - 1`, это **кандидат** (не эталон; используется в «Контексте», раздел 11).

Sweep low — зеркально (`low[k] < S.price`, `close[k] >= S.price`, удержание `close[j] >= L`).

Трактовка «в пределах K свечей возврат» из резюме: возврат тела внутрь происходит на той же свече (иначе это пробой по закрытию, раздел 5), а K — окно, в котором цена не должна закрепиться за уровнем. **(вопрос)** Альтернатива (sweep = закрытие за уровнем с возвратом за K свечей) противоречит правилу «BOS по закрытию тела» и не принята.

### 6.2 Несколько уровней за одну свечу
Если свеча `k` снимает несколько живых swing одной стороны, выдаётся **один** sweep; уровень `L` — самый экстремальный из снятых (наивысший для high, наинизший для low), `meta.sweptCount` — их число. Все снятые swing помечаются снятыми независимо от результата удержания. При равенстве цен — более ранний swing.

### 6.3 Граничные случаи
- `close[k] == S.price` — sweep (тело не закрылось **за** уровнем). Пример: SOLUSDT 15m 2026-08-09 20:00: L 77.05 < 77.06 (swing 18:15), C 77.06 -> sweep low (GS-8).
- Свеча может одновременно снять один уровень и пробить закрытием другой (более близкий) — выдаются оба события. Пример (архивы `BTCUSDT-4h-2026-07` + `-08`): BTCUSDT 4h 2026-08-01 16:00: CHoCH bear (уровень 62505.1) и sweep low 62410.5 (L 62228.8, C 62502.1).
- Свеча может снять обе стороны (внешний бар): BTCUSDT 4h 2026-09-11 12:00 — sweep high 79737.3 и sweep low 76151.9 (GS-1).
- Если удержание нарушено (закрытие за уровнем в течение K свечей), sweep не выдаётся; пробой фиксирует машина состояний, если уровень был `ref`.
- Равные максимумы (EQH): первый swing снимается свечой, превысившей общий уровень. Пример: BTCUSDT 15m 2026-08-04 19:30 (H 64388.0, C 64351.1) снимает EQH 64370.0 (swing 18:15) при N=3/2 (GS-9, вспомогательная проверка `detectSweeps` со swing N=3).

### 6.4 Сигнатура
```ts
interface Sweep { side: 'high' | 'low'; index: number; time: UtcMs; level: number; sweptSwings: Swing[]; wickExtreme: number; confirmedIndex: number | null /* null = кандидат */ }
function detectSweeps(candles: Candle[], swings: Swing[] /* внешние */, K: number): { confirmed: Sweep[]; candidates: Sweep[] };
```

---

## 7. Order Block

### 7.1 Определение (решение, ICT: «последняя противоположная свеча перед импульсом, сломавшим структуру»)
OB строится для каждого **внешнего** события BOS/CHoCH (внутренние OB — v2). Для бычьего события `E` (пробой swing high `H` свечой `k`):
1. **Начало импульса** `o`: самый поздний swing low фрактала `L=R=2` с `H.index < o` и `o + 2 <= k` (подтверждён к моменту пробоя). Если такого нет — свеча с минимальным `low` на `(H.index, k]` (при равенстве — поздняя).
2. **Свеча OB** `j`: среди **медвежьих** свечей на отрезке `[max(o-1, H.index+1), k-1]` — свеча с минимальным `low` (при равенстве — более поздняя). Если медвежьих нет: `o-1`, если она медвежья и `o-1 > H.index`; иначе `o`.
3. **Зона:** `[low[j], high[j]]` — тело + фитиль. **(решение)** ICT определяет OB диапазоном свечи high–low; фитиль содержит снятую ликвидность; сравнение с разметкой пользователя ведётся по перекрытию (IoU), что делает выбор устойчивым.
4. **Displacement (валидность):** OB валиден, если на `(j, k]` есть бычий FVG (раздел 8, с `fvgMinAtr`) со средней свечой в этом интервале **или** свеча с `body >= obDisplacementAtr * ATR14` (1.2). Без displacement OB — кандидат с `valid = false` (не эталон; используется для кода `OB_NO_DISPLACEMENT`).

Медвежий OB — зеркально (swing high фрактала 2 как начало, бычья свеча с максимальным `high`, зона `[low[j], high[j]]`).

Обоснование выбора начала импульса по фракталу 2: правило «минимум всего интервала» на BTCUSDT 4h (архивы 2026-07 + 2026-08) дало OB для CHoCH 2026-08-19 на свече 2026-08-01 (за 18 дней до пробоя, в начале флэта) — не соответствует практике; правило «последний фрактал 2» даёт 2026-08-19 04:00 (последняя медвежья свеча перед импульсной свечой 08-19 12:00 с H 70450.0). Включение `o-1` нужно, когда сама свеча экстремума противоположного цвета (BOS bear 2026-09-15 20:00: OB = бычья 09-14 16:00 перед медвежьей свечой-вершиной 09-14 20:00).

### 7.2 Статус (после свечи события `k`, по закрытым свечам)
- `fresh` — цена не возвращалась в зону;
- `mitigated` — первая свеча `t > k` с `low[t] <= top` (бычий) / `high[t] >= bottom` (медвежий); фиксируется `mitigatedIndex`;
- `invalidated` — первая свеча `t > k` с `close[t] < bottom` (бычий) / `close[t] > top` (медвежий); проверяется раньше митигации на той же свече (если свеча и вошла, и закрылась за зоной — `invalidated`).
- Эталон разметки: OB со статусом `fresh` или `mitigated` на последней свече окна; `invalidated` — допустимые (раздел 12.6).

### 7.3 Сигнатура
```ts
interface OrderBlock { direction: 'bull'|'bear'; index: number; time: UtcMs; top: number; bottom: number; event: StructureEvent; originIndex: number; valid: boolean; status: 'fresh'|'mitigated'|'invalidated'; statusIndex: number | null }
```

---

## 8. FVG (Fair Value Gap)

### 8.1 Определение
Три последовательные свечи `i-1, i, i+1` (`i` — средняя):
- **бычий FVG:** `low[i+1] > high[i-1]`; зона `[bottom, top] = [high[i-1], low[i+1]]`;
- **медвежий FVG:** `high[i+1] < low[i-1]`; зона `[high[i+1], low[i-1]]`;
- размер `size = top - bottom`; **минимальный размер** `size >= fvgMinAtr * ATR14[i+1]` (0.5). Цвет средней свечи не проверяется (разрыв возможен только при сильном движении в его сторону).
- Разрывы `0 < size < 0.5*ATR` — «малые FVG»: не эталон, но и не ошибка, если пользователь их отметил (раздел 12.6).
- Равенство `low[i+1] == high[i-1]` — не FVG.

**(решение)** Порог в ATR, а не в %, чтобы правило одинаково работало на 15m и 1d. Статистика: при 0.5·ATR — 5–7 FVG на 100 свечей (BTC/ETH/SOL 15m–4h, август 2026), при 0.25·ATR — 10–13 (слишком много для разметки).

### 8.2 Заполнение
По свечам `t >= i+2`:
- бычий: `partial`, если `low[t] < top`; `filled`, если `low[t] <= bottom` (первая такая свеча — `filledIndex`);
- медвежий: `partial`, если `high[t] > bottom`; `filled`, если `high[t] >= top`;
- иначе `open`.
Эталон разметки: FVG со статусом `open` или `partial` на последней свече окна; `filled` — допустимые.

### 8.3 Сигнатура
```ts
interface Fvg { direction: 'bull'|'bear'; middleIndex: number; firstTime: UtcMs; middleTime: UtcMs; top: number; bottom: number; size: number; status: 'open'|'partial'|'filled'; statusIndex: number | null }
function detectFvgs(candles: Candle[], minAtr: number): { fvgs: Fvg[]; small: Fvg[] };
```

---

## 9. Свечные модели Price Action (`detectPatterns`)

### 9.1 Состав (ответ на OQ-11)
Шесть моделей `PatternType`: `engulfing`, `pin-bar`, `inside-bar`, `doji`, `morning-star`, `evening-star`.
- **Молот и падающая звезда — одна модель `pin-bar`** с направлением: молот = `bull` (длинная нижняя тень), падающая звезда = `bear` (длинная верхняя тень). Определение — только по форме, без учёта предшествующего тренда; «повешенный» и «перевёрнутый молот» не выделяются. **(решение)** Контекст (тренд, уровень) оценивается отдельно в задании «Контекст» — смешивать форму и контекст в распознавании значит дважды учитывать одно и то же.
- **Утренняя и вечерняя звезда — две модели** (`morning-star` = bull, `evening-star` = bear), обе относятся к навыку `pa-star`.
- `doji`, `inside-bar` — без направления (`direction = null`).

### 9.2 Критерии (ATR = ATR14 последней свечи модели, если не сказано иное; модель не ищется при ATR = null или `range == 0`)
| Модель | Свечи | Критерии (все одновременно) | Направление |
|---|---|---|---|
| `pin-bar` | `i` | `range >= 0.8*ATR`; `body <= range/3`; бычий: `lowerWick >= 0.6*range` и `upperWick <= 0.15*range`; медвежий: `upperWick >= 0.6*range` и `lowerWick <= 0.15*range` | bull / bear; цвет свечи не важен |
| `doji` | `i` | **не** `pin-bar`; `body <= 0.1*range`; `range >= 0.5*ATR` | null |
| `inside-bar` | `i-1` (материнская), `i` | `high[i] <= high[i-1]`; `low[i] >= low[i-1]`; `range[i] < range[i-1]`; `range[i-1] >= 1.0*ATR` | null |
| `engulfing` | `i-1`, `i` | бычье: `i-1` медвежья, `i` бычья, `open[i] <= close[i-1]`, `close[i] >= open[i-1]`; медвежье: `i-1` бычья, `i` медвежья, `open[i] >= close[i-1]`, `close[i] <= open[i-1]`; оба: `body[i] > body[i-1] > 0`, `body[i] >= 0.5*ATR` | bull / bear |
| `morning-star` | `a=i-2`, `b=i-1`, `c=i` | `a` медвежья, `body[a] >= 0.6*ATR14[a]`; `body[b] <= 0.3*body[a]` (любой цвет); `bodyTop[b] <= close[a] + 0.1*body[a]`; `c` бычья, `body[c] >= 0.5*body[a]`, `close[c] >= (open[a]+close[a])/2` | bull |
| `evening-star` | `a`, `b`, `c` | зеркально: `a` бычья с `body >= 0.6*ATR14[a]`; `body[b] <= 0.3*body[a]`; `bodyBottom[b] >= close[a] - 0.1*body[a]`; `c` медвежья, `body[c] >= 0.5*body[a]`, `close[c] <= (open[a]+close[a])/2` | bear |

Пояснения к выбору:
- Критерий тела через `<=` и долей range — общепринятые пропорции пин-бара (тень не менее 2/3 range по классике; принято 0.6 для устойчивости к тиковой дискретности); `range >= 0.8*ATR` отсекает мелкие свечи, где «тень» — шум.
- В крипто-фьючерсах гэпов практически нет (`open[i] == close[i-1]` почти всегда), поэтому поглощение проверяется по телам с нестрогим равенством на стыке, а у звёзд вместо гэпа — условие «тело звезды не выше закрытия первой свечи + 10% её тела».
- Пересечения разрешены: одна свеча может входить в несколько моделей разных типов (например, `doji` и вторая свеча `inside-bar`). Внутри одной свечи `pin-bar` имеет приоритет над `doji` (доджи-стрекоза с длинной тенью и достаточным range — пин-бар).

### 9.3 Выход
```ts
interface PatternInstance { type: PatternType; direction: 'bull'|'bear'|null; firstIndex: number; lastIndex: number; time: UtcMs /* openTime последней свечи */ }
function detectPatterns(candles: Candle[]): PatternInstance[];    // по lastIndex, затем по порядку строк таблицы 9.2
```

### 9.4 Проверенные примеры (BTCUSDT 4h 2026-09, GS-5)
- `morning-star` 2026-09-08 04:00..12:00: a O 78880.0 C 78445.0 (тело 435.0 >= 0.6*ATR 658.99 = 395.4), b тело 45.1 <= 130.5, c O 78400.0 C 78870.0 >= середины 78662.5.
- `evening-star` 2026-09-09 04:00..12:00: a тело 652.3, b тело 35.7, c C 78570.0 <= 78919.85.
- `pin-bar bull` 2026-09-06 12:00: O 79878.3 H 79973.6 L 79125.3 C 79677.8 (медвежья по цвету): range 848.3 >= 0.8*590.9; нижняя тень 552.5 >= 509.0; верхняя 95.3 <= 127.2.
- `pin-bar bear` 2026-09-19 00:00: O 80863.0 H 81732.4 L 80802.6 C 81100.1 (бычья по цвету): верхняя тень 632.3 >= 557.9.
- `doji` 2026-09-05 16:00: тело 40.3 <= 49.3, range 492.6 >= 0.5*ATR 973.08 = 486.5; форма как у падающей звезды, но range < 0.8*ATR -> не пин-бар.
- `inside-bar` 2026-09-03 04:00/08:00; `engulfing bull` 2026-09-04 04:00/08:00 (стык `open[i] == close[i-1] == 80628.0`).

---

## 10. `findLevels` — уровни поддержки/сопротивления

### 10.1 Алгоритм
```ts
interface LevelParams { n: 3; lookback: 300; minTouches: 2 }
interface Level { center: number; low: number; high: number; touches: number; swings: Swing[]; lastTouchIndex: number; type: 'support'|'resistance'|'inside' }
function findLevels(candles: Candle[], p?: LevelParams): { levels: Level[]; width: number };
```
1. `swings = detectSwings(candles, {3,3})` с `index >= n - lookback` — обе стороны (уровень может менять роль).
2. `P = close[n-1]`, `A = ATR14[n-1]`; ширина кластера `W = min(max(0.5*A, 0.002*P), 0.01*P)`.
3. Сортировка swing по `(price, index)`; жадная кластеризация: swing добавляется в текущий кластер, если `price - firstPriceOfCluster <= W`, иначе открывает новый кластер.
4. Кластер с `touches = |swings| >= minTouches` -> уровень: `low = min`, `high = max`, `center = среднее арифметическое` цен (суммирование по порядку сортировки).
5. `type`: `support`, если `high < P`; `resistance`, если `low > P`; иначе `inside`.
6. Ранжирование: `touches` по убыванию, затем `lastTouchIndex` по убыванию (свежее), затем `|center - P|` по возрастанию.

### 10.2 Эталон для «Проведи уровень»
- Кандидаты — уровни нужного `levelType` с `|center - P| <= 5*A`; эталон — первый по ранжированию 10.1 п.6. Задание генерируется, только если у эталона `touches` строго больше, чем у второго кандидата того же типа (однозначность), и `touches >= 3` на medium/hard, `>= 2` на easy.
- **Допуск (FR-PA-03, FR-PA-14):** `tolerancePct = 0.3` для всех ТФ и сложностей. Ответ `u` верен, если
  `low*(1 - 0.003) <= u <= high*(1 + 0.003)` **или** `|u - center| / center <= 0.003`.
  `deviationPct = |u - center| / center * 100` (для `ModuleDetail`).
- Если `u` не попал в эталон, но попал (по тому же правилу) в другой уровень того же типа с `touches >= 2` -> `partial`, код `LEVEL_NOT_STRONGEST` **(новое)**; если попал в уровень другого типа -> `incorrect`, `LEVEL_WRONG_TYPE` **(новое)**; иначе `incorrect`, `LEVEL_OFF_TOLERANCE`.
- Пример (GS-6, BTCUSDT 4h 2026-09, на последней свече 09-30 20:00, P = 83576.9, ATR = 961.73, W = 480.86): сильнейшее сопротивление в пределах 5·ATR — `85088.0` (зона 84901.6–85224.0, 4 касания: 09-22 04:00, 09-24 12:00, 09-25 08:00, 09-27 12:00); верный ответ — `u ∈ [84646.90, 85479.67]`. Поддержка — `79965.0` (зона 79737.3–80167.0, 4 касания), верный ответ — `u ∈ [79498.09, 80407.50]`.

---

## 11. Контекст для PA «Контекст»

### 11.1 Формат ответа (ответ на OQ-16)
Принят формат `API_CONTRACTS.md` §4.2 без изменений: `ContextFactorAnswer { sweep, orderBlock, keyLevel, htfTrend: 'up'|'down'|'range' }` + `significant: boolean`.

### 11.2 Задание
- Модель — только направленная: `engulfing`, `pin-bar`, `morning-star`, `evening-star` (`doji`/`inside-bar` не используются в «Контексте»).
- График заканчивается последней свечой модели (`T = closeTime` последней свечи + 1 мс); будущего нет.
- Сервер возвращает ряд задания `tf` и ряд старшего ТФ `htf(tf)` (оба только закрытые свечи до `T`; частичная старшая свеча не показывается и не участвует). Соответствие: `15m -> 1h`, `1h -> 4h`, `4h -> 1d`, `1d -> 1d` (недельного ТФ нет; для 1d старший тренд = тренд 1d).

### 11.3 Факторы (детерминированно, для бычьей модели; медвежья — зеркально)
Обозначения: `F..L` — индексы первой и последней свечи модели; `patternLow = min(low[F..L])`; `A = ATR14[L]`. Структура считается `analyzeStructure(candles[0..L], {nExt: 5, nInt: null, ...})` (N=5 для всех сложностей контекста).
- `sweep = true`, если есть **кандидат** sweep low (6.1 п.1–3, без удержания) любой свечой из `[F-2, L]` по внешнему swing low, подтверждённому до этой свечи.
- `orderBlock = true`, если есть внешний бычий OB с `valid = true` и статусом, отличным от `invalidated`, на свече `F-1`, такой что `bottom - 0.25*A <= patternLow <= top`.
- `keyLevel = true`, если `findLevels(candles[0..F-1])` содержит уровень (любого `type`, `touches >= 2`) с `low*(1-0.003) <= patternLow <= high*(1+0.003)`.
- `htfTrend` = `trend` внешнего слоя (N=5) на ряду `htf`, закрытом к `T`: `up` / `down`, `none -> 'range'`.

### 11.4 Значимость (решение)
```
location = sweep || orderBlock || keyLevel
aligned  = (direction == 'bull' && htfTrend == 'up') || (direction == 'bear' && htfTrend == 'down')
significant = (aligned && location) || (htfTrend == 'range' && count(sweep, orderBlock, keyLevel) >= 2)
```
Модель против старшего тренда в MVP не значима никогда. Обоснование: для пользователя среднего уровня базовый принцип SMC — торговать по направлению старшей структуры от зоны интереса; разворотные модели против HTF без CHoCH на рабочем ТФ — частая ошибка, которую тренажёр должен отучать. **(вопрос)** Исключение «против тренда, но sweep + OB + уровень» не вводится.

### 11.5 Оценка
5 пунктов: `sweep`, `orderBlock`, `keyLevel`, `htfTrend`, `significant`. `score = совпавших / 5`. `verdict`: `correct` — все 5; `partial` — `significant` верно, но есть ошибки факторов; `incorrect` — `significant` неверно. Коды — раздел 17 (`CONTEXT_*`). Эталонное объяснение (`feedback.howTo`) строится шаблоном `context.explain` с параметрами: фактическими значениями факторов, временем свечи sweep, зоной OB, ценой уровня, `htfTrend`, итоговой формулой значимости.

### 11.6 Генерация
Сервер выбирает по `seed` желаемый ответ `significant` (50/50) и ищет `T` (последняя свеча модели) с таким эталоном; не более 200 попыток, затем инвертирует желаемый ответ.

---

## 12. `gradeMarks` — сравнение разметки

### 12.1 Сигнатура (расширение `API_CONTRACTS.md`)
```ts
interface GradeContext {
  candles: Candle[];                       // тот же ряд, что видел пользователь (закрытые)
  window: { fromIndex: number; toIndex: number };   // окно оценки
  concepts: SkillId[];                     // оцениваемые понятия (раздел 13)
  toleranceCandles: number;                // 2 (FR-MS-13, AC-07)
  iouMin: number;                          // 0.5 для OB/FVG
  levelPricePct: number;                   // 0.1 — допуск цены уровня BOS/CHoCH
  scoped: boolean;                         // false на easy: scope пользователя не проверяется
}
interface AlgoMarkSet { required: Mark[]; tolerated: Mark[]; aux: { sweepsCandidates: Sweep[]; obCandidates: OrderBlock[]; pending: Swing[]; smallFvgs: Fvg[]; refsAt: (k: number) => Swing[] } }
interface MarkGradeResult extends MarkGrade { ignored: string[] /* (новое) id меток пользователя, совпавших с допустимыми или вне окна */; errors: GradeError[]; skillOutcomes: SkillOutcome[]; score: number; verdict: Verdict }
function gradeMarks(user: Mark[], algo: AlgoMarkSet, ctx: GradeContext): MarkGradeResult;
```

### 12.2 Ключевая свеча метки
Время якоря переводится в индекс свечи: `idx(t) = i`, где `openTime[i] <= t < openTime[i] + TIMEFRAME_MS[tf]`; вне ряда — метка в `ignored` с причиной «вне окна».
| Тип | Ключевая свеча |
|---|---|
| swing, hh/hl/lh/ll | `idx(anchors[0].time)` |
| bos, choch | `idx(anchors[last].time)` — свеча пробоя |
| sweep | `idx(anchors[last].time)` — свеча фитиля |
| order-block, fvg | `idx(min(anchors.time))` — левый край прямоугольника (OB — свеча OB; FVG — первая свеча тройки) |
| pattern | интервал `[idx(min time), idx(max time)]` |
Метки пользователя с ключевой свечой вне окна — `ignored`; эталонные метки вне окна не требуются.

### 12.3 Группы сопоставления
Метки сопоставляются только внутри группы: `SWING_H` {swing-high}, `SWING_L` {swing-low}, `LABEL_H` {hh, lh}, `LABEL_L` {hl, ll}, `BREAK` {bos, choch}, `SWEEP`, `OB`, `FVG`, `PATTERN:<type>`. Группы для понятий вне `ctx.concepts` не оцениваются (метки пользователя этих типов — `ignored`).

### 12.4 Совместимость и стоимость пары
Пара `(u, a)` совместима, если `|keyIdx(u) - keyIdx(a)| <= toleranceCandles` (для pattern — интервалы пересекаются, Δ = 0). Стоимость: `cost = 10*Δ + штрафы`, где штрафы (одновременно возможны несколько; каждый — ошибка на совпавшей паре):
| Расхождение | Штраф | Код |
|---|---|---|
| scope (если `ctx.scoped`; `null` у пользователя = `external`) | 3 | `INTERNAL_AS_EXTERNAL` / `EXTERNAL_AS_INTERNAL` |
| hh <-> lh, hl <-> ll | 3 | `STRUCTURE_LABEL_WRONG` |
| bos <-> choch | 3 | `BOS_CHOCH_CONFUSED` (новое) |
| direction (BREAK, SWEEP, OB, FVG, PATTERN; для doji/inside-bar не проверяется) | 5 | `BOS_WRONG_DIRECTION` (новое) / `CHOCH_WRONG_DIRECTION` / `MARK_WRONG_DIRECTION` (новое) / `PATTERN_WRONG_DIRECTION` |
| уровень BOS/CHoCH: `|idx(anchors[0]) - brokenSwing.index| > 2` **и** `|price - level|/level > 0.1%` | 2 | `BOS_WRONG_LEVEL` (для choch — тот же код с `params.kind = 'choch'`) |
| границы OB/FVG: IoU ценовых интервалов `< 0.5` | 2 | `OB_WRONG_BOUNDS` (новое) / `FVG_WRONG_BOUNDS` |
IoU = `max(0, min(hi1,hi2) - max(lo1,lo2)) / (max(hi1,hi2) - min(lo1,lo2))`.

### 12.5 Матчинг (решение: DP по времени вместо венгерского)
Внутри группы: `U` — метки пользователя, `A` — эталон (`required`), обе отсортированы по `(keyIdx, id)`. Поскольку совместимость ограничена полосой `|Δ| <= 2`, а стоимость монотонна по `|Δ|`, существует оптимальное паросочетание без пересечений; оно находится динамикой как выравнивание последовательностей:
```
best(i, j) = лучшее для суффиксов U[i..], A[j..] по ключу (больше пар, меньше суммарная cost)
best(i, j) = max_by_key(
  match:     если compatible(U[i], A[j]) -> (1 + best(i+1, j+1).pairs, cost(U[i],A[j]) + best(i+1, j+1).cost),
  skipAlgo:  best(i, j+1)      // A[j] пропущен
  skipUser:  best(i+1, j)      // U[i] лишний
)
при равенстве ключа приоритет: match > skipAlgo > skipUser
```
Обоснование: максимум пар и минимальное смещение, однозначный тай-брейк, `O(|U|·|A|)`; жадный алгоритм на реальных данных может назвать «лишней» точную метку пользователя, а венгерский не задаёт канонический выбор среди равных решений.

### 12.6 Классификация после матчинга
1. **matched** — пары; без штрафов — `OK`, со штрафами — совпадение с ошибками (вес 0.5 в счёте).
2. Непарные метки пользователя сначала проверяются на **допустимые** (`tolerated`): если есть допустимая эталонная метка той же группы в пределах допуска — метка уходит в `ignored` (не ошибка). Допустимые: OB `invalidated`, FVG `filled` и малые FVG, sweep-кандидаты у правого края.
3. **missed** — непарные `required`; **extra** — оставшиеся метки пользователя.
4. Уточнение кодов для непарных (каждая непарная метка — ровно один код):
| Ситуация | Код |
|---|---|
| Непарные `u` (swing) и `a` (swing) одной группы с `|Δ| <= 4` (жадно по меньшему Δ, затем по времени) | одна ошибка `SWING_OFF_TOLERANCE` на пару; `u` остаётся в `extra`, `a` в `missed` (AC-07) |
| Extra swing на свече из `pendingSwings` | `SWING_UNCONFIRMED` (новое) |
| Иначе extra / missed swing | `SWING_EXTRA` / `SWING_MISSED` |
| Missed / extra hh/hl/lh/ll | `STRUCTURE_LABEL_MISSED` / `STRUCTURE_LABEL_EXTRA` (новые) |
| Extra BOS/CHoCH на свече `k`, где фитиль вышел за подтверждённый swing (`refsAt(k)` либо любой живой swing оцениваемых слоёв) в направлении метки, а `close` — нет | `BOS_WICK_ONLY` (для choch тот же код, `params.kind = 'choch'`) |
| Иначе extra BOS / CHoCH | `BOS_EXTRA` / `CHOCH_EXTRA` (новые) |
| Missed BOS / CHoCH | `BOS_MISSING` / `CHOCH_MISSING`; не выдаётся, если на этой свече (±2) у пользователя есть sweep, получивший `SWEEP_IS_BREAK` |
| Extra sweep, если на ±2 свечах есть эталонный BOS/CHoCH той же стороны | `SWEEP_IS_BREAK` |
| Иначе extra / missed sweep | `SWEEP_EXTRA` (новое) / `SWEEP_MISSED`; `SWEEP_MISSED` не выдаётся, если на этой свече пользователь получил `BOS_WICK_ONLY` |
| Непарные OB `u` и `a` одного направления с `|Δ| <= 6` | одна ошибка `OB_WRONG_CANDLE` на пару |
| Extra OB на свече OB-кандидата с `valid = false` (±2) | `OB_NO_DISPLACEMENT` |
| Иначе extra / missed OB | `OB_EXTRA` / `OB_MISSED` (новые) |
| Extra FVG, если ни одна тройка с серединой в `[key-1, key+2]` не образует разрыв нужного направления | `FVG_NOT_GAP` |
| Иначе extra / missed FVG | `FVG_EXTRA` / `FVG_MISSED` (новые) |
| Pattern: extra на свечах, где есть модель другого типа | `PATTERN_WRONG_TYPE`; иначе `PATTERN_EXTRA`; missed — `PATTERN_MISSED` |

### 12.7 Счёт, вердикт, навыки
- Вес эталонной метки: 1 — `OK`, 0.5 — совпала с ошибками, 0 — пропущена. `score = Σ весов / (|required в окне| + |extra|)`; если знаменатель 0 — `score = 1`.
- `verdict`: `correct` при `score >= 0.85` и отсутствии ошибок `severity = 'major'`; `partial` при `score >= 0.5`; иначе `incorrect`.
- `SkillOutcome` по навыку: `total = |required навыка| + |extra навыка|`, `correct = число OK-пар навыка`. Навык метки: swing -> `swing`; hh/hl/lh/ll -> `structure-labels`; bos -> `bos`; choch -> `choch`; sweep -> `sweep`; OB -> `order-block`; FVG -> `fvg`; pattern -> `pa-*` по типу. Дополнительно при `ctx.scoped`: `internal-external` с `total` = число пар структурных меток (swing, labels, break), `correct` = пары с верным scope.
- Severity: `major` — `*_MISSED`/`*_MISSING`, `BOS_WICK_ONLY`, `SWEEP_IS_BREAK`, `BOS_CHOCH_CONFUSED`, `*_WRONG_DIRECTION`, `BOS_EXTRA`, `CHOCH_EXTRA`; остальные — `minor`.

### 12.8 Пример AC-07 на реальных данных (GS-1)
Эталонный swing high BTCUSDT 4h 2026-09-14 20:00 (79570.9, index 83). Метка пользователя `swing-high` на 2026-09-15 04:00 (index 85, Δ=2) — matched, `timeOffsetCandles = 2`. Метка на 2026-09-15 08:00 (index 86, Δ=3) — extra, эталон — missed, одна ошибка `SWING_OFF_TOLERANCE`.

---

## 13. Генерация заданий

### 13.1 Общие правила
- Момент `T` — на сетке 15m (ADR-0006), только по данным старше 2 суток (ARCHITECTURE §5.2); `seed` -> `mulberry32`; кандидаты `T` равномерно из допустимого диапазона архива; до 200 попыток, затем ослабление критерия сложности на одну ступень (hard -> medium -> easy) с сохранением `difficulty` задания.
- Видимая история: 500 закрытых свечей ТФ задания (1d — 365); **минимум 300** закрытых свечей до окна оценки (прогрев машины состояний). Любой пропуск в видимом ряду (и в 1m для частичных свечей Challenge) — отбраковка.
- Исключение «слишком мало структуры»: в окне оценки меньше 4 внешних swing или ATR14 последней свечи `== 0` — отбраковка.

### 13.2 Market Structure «Разметка» (поправка v1.1, `ALGO_VERSION 1.1.0`)
Причина: v1.0 требовала до 24 меток на 5 днях по всем понятиям сразу, что неподъёмно.
- **Окно оценки** — 40–80 закрытых свечей, всегда оканчивается последней видимой свечой (контекст слева показывается шире, эталон — только в окне). Максимум по сложности: easy 60, medium 70, hard 80.
- **Число обязательных эталонных меток в окне (`required` по `concepts`) — 4–12.** Если больше — окно сужается (шаг 4 свечи, не уже 40); если меньше 4 или после сужения всё ещё больше 12 — выбирается другое `T`.
- **Понятия по сложности:**
| Сложность | Понятия (`concepts`) | Критерий отбора `T` (помимо 4–12 меток и `ATR14 != 0`) |
|---|---|---|
| easy | `swing` (swing-high/swing-low внешнего слоя) | — |
| medium | внешняя структура: `swing`, `structure-labels`, `bos`, `choch` (external; `scoped = false`) | ≥ 1 BOS или CHoCH в эталоне окна |
| hard | medium + понятия `focus`: `internal-external` (внутренние BOS/CHoCH, без HH/HL/LH/LL, чтобы уложиться в 12 меток), `sweep`, `order-block`, `fvg` | каждое понятие `focus` представлено ≥ 1 меткой эталона окна (для internal-external — внутренний BOS/CHoCH) |
- **`focus`** — что именно отметить сверх базы (только hard). Если вызывающий не задал `focus`, выбирается одно дополнительное понятие по `seed`. Итоговый `focus`, `windowCandles` и `requiredCount` явно входят в payload задания (формулировка задания называет понятия), а `focus` и `windowSize` — в подписанные `params` для `grade`. `scoped = concepts ∋ internal-external`.
- Ослабление критерия по §13.1 (hard -> medium -> easy) относится к дополнительному критерию в таблице; границы 4–12 и окно 40–80 не ослабляются. `difficulty` и `concepts` задания сохраняются.
- **Дубли ошибок:** непарный эталонный swing и непарная эталонная подпись HH/HL/LH/LL на той же свече дают ОДНУ ошибку `SWING_MISSED` (или `SWING_OFF_TOLERANCE`) с ожидаемой подписью в `params.labelNote`; `STRUCTURE_LABEL_MISSED` выдаётся только если swing поставлен (сопоставлен), но не подписан.
- **Вердикт в разборе:** «N из M совпало (P%)», где N/M — сумма `SkillOutcome` (без производного `internal-external`); формулировка «P% совпадения» не используется.
- Вопросы режима «Вопрос» (§13.3) окно 120/150 и критерии не менялись.

### 13.3 Market Structure «Вопрос»
Шаблоны (`questionId` = `<template>:<seed>`), эталон — по `analyzeStructure` на видимом ряду (N по сложности):
| Шаблон | Вопрос | Варианты | Верный | Навык |
|---|---|---|---|---|
| `trend` | Какой сейчас внешний тренд? | up / down / range | `state.external.trend` (`none` -> range) | `bos` |
| `break-type` | Подсвеченная свеча — это… | BOS / CHoCH / Liquidity sweep | по событию/свипу этой свечи | `choch` (если верный CHoCH), `bos`, `sweep` |
| `wick-or-body` | Пробит ли уровень подсвеченного swing? | Да, BOS/CHoCH по закрытию / Нет, только фитиль | по 5.1 | `bos` |
| `protected` | Какой уровень защищает текущий тренд? | 3 цены: защищённый `ref` + 2 других внешних swing того же типа из окна | защищённый `ref` | `choch` |
Генератор выбирает подсвеченную свечу так, чтобы ответ был однозначен (для `wick-or-body` 50/50 пробой/фитиль). Ошибка — `QUESTION_WRONG` **(новое)** с `params.template`.

### 13.4 Price Action
- **«Найди модель»:** окно поиска — последние 40 свечей; цель `target` выбирается из моделей, которых в окне от 1 до 4; easy — модели с `range >= 1.0*ATR` (крупные), hard — допускается до 4 экземпляров. Оцениваются только экземпляры типа `target` (раздел 12, группа `PATTERN:<target>`).
- **«Проведи уровень»:** см. 10.2; `levelType` по `seed` из доступных однозначных.
- **«Контекст»:** см. 11.6.

### 13.5 Challenge
Анализ на `T` по `defaultTf` (рабочий ТФ задания) и `htf(defaultTf)` (раздел 11.2), N=5, только закрытые свечи. Эталонная сторона `refSide` — раздел 14.2.
| Сложность | `defaultTf` | Критерий выбора `T` |
|---|---|---|
| easy | 1h или 4h | `refSide ∈ {LONG, SHORT}`; последнее внешнее событие — BOS в сторону `refSide` не старше 40 свечей; HTF совпадает |
| medium | 15m / 1h / 4h | любая валидная ситуация; доля `refSide = WAIT` поддерживается 30–50% выбором по `seed` |
| hard | 15m / 1h / 4h | «флэт/ложный пробой»: `htfTrend = none` **или** два последних внешних события противоположных направлений в пределах 60 свечей **или** подтверждённый sweep в последних 10 свечах; ожидаемо `refSide = WAIT` в ≥ 50% |
Дополнительно: в архиве есть будущее на лимит времени (раздел 14.4) и 1m за этот период (для drill-down).

---

## 14. Challenge: эталон, оценка качества, WAIT, лимиты

### 14.1 Факты на момент T (`ChallengeFacts`)
На `defaultTf`: `trendTf`, `refHigh`, `refLow`, `lastEvent`, OB/FVG/sweeps (N=5), `A = ATR14` последней свечи, `entry = close` последней видимой свечи; на `htf`: `trendHtf`. Внутренний слой N=2 — для оценки SL «за внутренним swing».

### 14.2 Эталонная сторона `refSide`
`LONG`, если все условия:
1. `trendHtf == 'up'` и `trendTf == 'up'`;
2. **POI**: диапазон последней свечи пересекает зону бычьего внешнего OB (`valid`, не `invalidated`), расширенную вверх на `0.25*A`; **или** бычий FVG `open/partial`; **или** `low <= refLow.price + 1.0*A`;
3. `refLow != null`; `SLref = refLow.price - 0.1*A`; `TPref = refHigh.price`, если `refHigh` есть и выше `entry`, иначе максимум `high` с последнего бычьего события; `RRref = (TPref - entry)/(entry - SLref) >= 2`.
`SHORT` — зеркально. Иначе `WAIT`.

### 14.3 Оценка качества 0–100 (ответ на OQ-08), независимо от исхода
Для LONG/SHORT (`dir` = up для LONG):
| Компонент `key` | Баллы | Правило | Код при недоборе |
|---|---|---|---|
| `htf` | 25 / 10 / 0 | `trendHtf == dir` / `none` / против | `TRADE_AGAINST_HTF` (при 0) |
| `structure` | 25 / 10 / 0 | `trendTf == dir` / `none` / против | `TRADE_AGAINST_STRUCTURE` (новое, при 0); `TRADE_IN_RANGE` при `trendTf == none` и `refSide == WAIT` |
| `location` | 15 / 0 | условие POI 14.2 п.2 в сторону сделки | `ENTRY_NO_POI` (новое) |
| `sl` | 15 / 8 / 0 | LONG: защищённый уровень `Pl` = `refLow`, если он ниже входа, иначе последний внешний swing low ниже входа. 15 — `Pl - 1.5*A <= sl <= Pl - 0.25*A` (запас стопа 0.25–1.5·ATR, ALGO_VERSION 2.0.0, CURRICULUM_STAGES.md §20); 8 — `Pl - 0.25*A < sl < Pl` (`SL_NO_BUFFER`, новое, minor), `sl < Pl - 1.5*A` (`SL_TOO_WIDE`, новое) или `sl` ниже последнего внутреннего swing low, но `>= Pl`; 0 — иначе | `SL_INSIDE_STRUCTURE` (при 0) |
| `rr` | 10 / 5 / 0 | `RR = |tp-entry|/|entry-sl|`: `>= 2` / `[1.5, 2)` / `< 1.5` | `RR_TOO_LOW` (при `< 1.5`) |
| `reasons` | 10·(верных/выбранных), 0 если не выбрано ни одной | предикаты 14.5 | `REASON_MISMATCH` (если есть неверная) |
Для WAIT: `wait` 70 (если `refSide == WAIT`, иначе 0, код `WAIT_MISSED_SETUP`) + `reasons` 30·(верных/выбранных). `quality.score` — сумма; `GradeResult.score = quality.score / 100`.

### 14.4 Правильность, вердикт, лимиты
- `waitCorrect = (refSide == 'WAIT')` — только правила структуры (FR-TC-14, ADR-0007 п.7).
- `decisionCorrect` (FR-TC-22): WAIT — `waitCorrect`; позиция — `side == refSide && rMultiple > 0`.
- `verdict` (по качеству решения, не по исходу): `correct` — `side == refSide` и `quality >= 70`; `partial` — `side == refSide` и `quality < 70`, или `side != refSide`, `side` не противоположна `refSide` и `quality >= 70`; иначе `incorrect`.
- **Лимит проигрывания (OQ-09), свечей выбранного ТФ, одинаков для всех сложностей:** 15m — 96 (24 ч), 1h — 72 (3 сут), 4h — 60 (10 сут), 1d — 30. Значения из ADR-0007 подтверждаются: окно покрывает типичное достижение цели 2R на рабочем ТФ и при этом ограничивает размер выдачи `replay`. Лимит считается от `T` по ТФ, выбранному в ответе (`answer.tf`); WAIT проигрывается на `defaultTf`.
- Статистика Challenge (FR-PROG-04): win = `rMultiple > 0` (TP или timeout в плюс); win rate = win / число позиций; средний R — среднее `rMultiple` позиций; доля верных WAIT = `waitCorrect` / число WAIT.

### 14.5 Предикаты причин (`ReasonCode`, состав без изменений)
`dir` — направление позиции; для WAIT верны только `range-no-edge`, `unclear-structure`, остальные причины при WAIT — неверные.
| Причина | Верна, если |
|---|---|
| `trend-continuation` | `trendTf == dir` и `lastEvent.kind == 'bos'` в сторону `dir` |
| `choch-reversal` | `lastEvent.kind == 'choch'` в сторону `dir`, не старше 30 свечей |
| `bos-confirmed` | `lastEvent.kind == 'bos'` в сторону `dir`, не старше 30 свечей |
| `sweep-reversal` | кандидат или подтверждённый sweep в сторону `dir` (sweep low для LONG) в последних 10 свечах |
| `order-block-reaction` | POI по OB (14.2 п.2) в сторону `dir` |
| `fvg-fill` | POI по FVG в сторону `dir` |
| `level-reaction` | диапазон последней свечи пересекает зону `findLevels` (±0.3%) нужного типа (support для LONG) |
| `htf-alignment` | `trendHtf == dir` |
| `range-no-edge` | `trendHtf == none` или `trendTf == none` или нет POI ни в одну сторону |
| `unclear-structure` | `trendTf == none`, или два последних внешних события противоположны и не старше 30 свечей, или `trendTf != trendHtf` |

### 14.6 Подсказки (easy)
`hints`: внешние swing последних 100 свечей, последнее внешнее событие, защищённый уровень (`kind: 'level'`, `meta.role = 'protected'`).

---

## 15. `resolveTrade` (ADR-0007, уточнения)
```ts
interface Position { side: 'LONG'|'SHORT'; entry: number; sl: number; tp: number; T: UtcMs; tf: TaskTimeframe; limitCandles: number }
interface FutureProvider { candles(tf: Timeframe, from: UtcMs, count: number): Promise<Candle[]>; minute1(from: UtcMs, to: UtcMs): Promise<Candle[]>; aggTrades(minuteOpen: UtcMs): Promise<AggTrade[] | null> }
interface AggTrade { aggTradeId: number; price: number; transactTime: UtcMs }
function resolveTrade(p: Position, f: FutureProvider): Promise<ChallengeOutcome & { triggerTime: UtcMs; triggerTf: '1m'|'aggTrades'|TaskTimeframe }>;
```
Уточнения к ADR-0007:
1. Касание с равенством — касание (`low <= sl`, `high >= tp` и т.д.; подтверждено реальным примером R1: сделка `aggTradeId 3490482886` по цене ровно 81950.0 = TP).
2. Обход ведётся по свечам `tf` с `openTime >= T`, не более `limitCandles`; drill-down: свеча `tf` -> её 1m `[openTime, openTime + TIMEFRAME_MS[tf])` -> aggTrades минуты, упорядоченные по `(transactTime, aggTradeId)`.
3. На aggTrades: первая сделка с `price <= sl` или `price >= tp` (LONG; SHORT — зеркально) определяет исход. Если aggTrades недоступны / минута не найдена / превышен бюджет времени функции — `conservative-sl`.
4. Если 1m-свечи для drill-down отсутствуют (пропуск) — `conservative-sl` (сценарии с пропусками 1m отбраковываются при генерации, поэтому случай аварийный).
5. Timeout: `exitPrice = close` последней свечи окна, `R = (exit-entry)/|entry-sl|` для LONG, `(entry-exit)/|entry-sl|` для SHORT; R не округляется в ядре (округление — только при показе, 2 знака).
6. `triggerTime`/`triggerTf` — момент срабатывания на младшем ТФ для разбора (FR-TC-25).
7. Инвариант: результат при обходе по 15m и по 1m одинаков (тест на GS-10).

---

## 16. Навыки и прогресс

### 16.1 Навыки
`SkillId` — без изменений (`API_CONTRACTS.md` §2.2). Привязка кодов к навыкам — раздел 17 (колонка «Навык»). Навыки заданий:
| Задание | Навыки в `skillOutcomes` |
|---|---|
| MS «Разметка» | по меткам (12.7) + `internal-external` при scoped |
| MS «Вопрос» | навык шаблона (13.3), `total = 1` |
| PA «Найди модель» | `pa-<target>` (`morning-star`/`evening-star` -> `pa-star`) |
| PA «Проведи уровень» | `pa-level`, `total = 1`, `correct = 1` только при `verdict = correct` |
| PA «Контекст» | `pa-context`, `total = 5`, `correct` = совпавшие пункты |
| Challenge, позиция | `challenge-entry` (`correct = 1`, если `side == refSide` и нет `TRADE_AGAINST_*`/`TRADE_IN_RANGE`), `challenge-risk` (`correct = 1`, если `sl` = 15 баллов и `RR >= 1.5`); при `refSide == WAIT` дополнительно `challenge-wait` = 0/1 |
| Challenge, WAIT | `challenge-wait` (`correct = waitCorrect`) |

### 16.2 Обновление точности
По `DATABASE_SCHEMA.md` §5.1: окно 20 последних исходов навыка, `MIN_SAMPLE = 5`. Исход навыка в попытке: `ok = correct / total >= 0.8` **(новое, см. раздел 19 п.3)**; для `total = 1` это совпадает с `correct === total`.

### 16.3 Адаптивная подборка
- Вес навыка `w = max(0.05, 1 - accuracy)`; при «мало данных» `accuracy = 0.5`; минимальный вес 0.05 оставляет сильные навыки в ротации.
- Клиент формирует `focus`: выборка без возвращения до 3 навыков модуля пропорционально `w` (PRNG `mulberry32` от `seed` клиента — недетерминизм подборки допустим, оценка от него не зависит).
- Навык -> генератор: `swing|structure-labels|bos|choch|internal-external|sweep|order-block|fvg` -> MS (разметка с `concepts = focus` или вопрос соответствующего шаблона, 50/50); `pa-*` -> PA «Найди модель» с `target`; `pa-level` -> «Проведи уровень»; `pa-context` -> «Контекст»; `challenge-*` -> Challenge (`challenge-wait` повышает долю `refSide = WAIT` до 60%).

---

## 17. Шаблоны разбора (источник `src/i18n/ru/feedback`)

### 17.1 Структура и ключи
Разбор (FR-FB-02) собирается `buildFeedback` из ключей:
1. **Верность** — `feedback.verdict.<correct|partial|incorrect>`;
2. **Что понято верно** — `feedback.ok.<OkCode>` (по одному блоку на каждый `OkCode` с хотя бы одной OK-парой);
3. **Ошибка** — `feedback.<ErrorCode>.mistake`;
4. **Почему** — `feedback.<ErrorCode>.why`;
5. **Как правильно** — `feedback.<ErrorCode>.howTo`;
6. **Принцип** — `feedback.<ErrorCode>.principle` первой ошибки с наибольшей severity (при равенстве — первой по времени); если ошибок нет — `feedback.principle.<module>`.
Плейсхолдеры `{name}` заполняются из `GradeError.params` / `FeedbackBlock.params`; время — в локальном поясе (форматирует UI), цены — с точностью тика. Общие параметры: `{time}` (время ключевой свечи), `{price}`, `{level}`, `{close}`, `{n}` (N фрактала), `{tol}` (допуск свечей), `{dir}` (бычий/медвежий), `{scope}` (external/internal).

### 17.2 Верность и общие принципы
| Ключ | Текст |
|---|---|
| `feedback.verdict.correct` | Верно: {score}% совпадения с эталоном. |
| `feedback.verdict.partial` | Частично верно: {score}% совпадения, есть ошибки ниже. |
| `feedback.verdict.incorrect` | Неверно: {score}% совпадения. Разберём, что пошло не так. |
| `feedback.principle.market-structure` | Структура читается по закрытиям тел и подтверждённым swing: фитиль показывает ликвидность, тело — решение рынка. |
| `feedback.principle.price-action` | Свечная модель значима только в контексте: зона интереса и направление старшей структуры важнее формы свечи. |
| `feedback.principle.challenge` | Качество решения — это соответствие правилам до входа; исход одной сделки его не доказывает и не опровергает. |

### 17.3 Что понято верно (`OkCode`; новые помечены *)
| Ключ | Текст |
|---|---|
| `OK_SWING` | Swing High/Low отмечены верно: {count} из {total}, в пределах ±{tol} свечей. |
| `OK_LABEL`* | Метки HH/HL/LH/LL расставлены верно: {count} из {total}. |
| `OK_BOS` | BOS определён верно по закрытию тела: {count} из {total}. |
| `OK_CHOCH` | CHoCH (смена характера структуры) найден верно: {count} из {total}. |
| `OK_SCOPE`* | Внешняя (external) и внутренняя (internal) структура разделены верно. |
| `OK_SWEEP`* | Liquidity sweep (снятие ликвидности) определён верно: {count} из {total}. |
| `OK_OB` | Order Block отмечен на верной свече: {count} из {total}. |
| `OK_FVG` | FVG (разрыв справедливой стоимости) отмечен верно: {count} из {total}. |
| `OK_PATTERN` | Модель «{pattern}» найдена верно: {count} из {total}. |
| `OK_LEVEL` | Уровень проведён в пределах допуска {tolPct}% (отклонение {devPct}%). |
| `OK_CONTEXT` | Факторы контекста определены верно: {count} из 5. |
| `OK_HTF`* | Сделка по направлению старшего тренда ({htfTrend}). |
| `OK_SL_PLACEMENT` | Stop Loss за защищённым swing {level}. |
| `OK_RR`* | Соотношение риск/прибыль {rr}R не ниже 2R. |
| `OK_WAIT` | WAIT верен: условий для входа по правилам структуры не было. |

### 17.4 Ошибки (части 3–6)
Колонка «Навык» задаёт `GradeError.skill`; `pa-*` — навык модели из `params.pattern`. Коды из `API_CONTRACTS.md` §5.3 сохранены; новые помечены *.

| Код | Навык | Ошибка (3) | Почему (4) | Как правильно (5) | Принцип (6) |
|---|---|---|---|---|---|
| `SWING_MISSED` | swing | Пропущен Swing {side} на {time} ({price}). | Свеча имеет {n} свечей слева с более низким (высоким) экстремумом и {n} справа — это фрактал. | Ищите экстремум, который не перекрыт {n} свечами с каждой стороны. | Swing — подтверждённый экстремум, а не любой изгиб цены. |
| `SWING_EXTRA` | swing | Отмечен Swing {side} на {time}, которого нет в эталоне. | Хотя бы одна из {n} соседних свечей имеет более высокий high (низкий low), фрактал не образован. | Сравните экстремум с {n} свечами слева и справа перед отметкой. | Меньше точек, но подтверждённых — структура чище. |
| `SWING_OFF_TOLERANCE` | swing | Swing отмечен на {time}, эталон — на {refTime} (смещение {offset} свечей при допуске ±{tol}). | Метка стоит рядом, но не на экстремальной свече. | Ставьте метку на свечу с самым высоким high (самым низким low) в окрестности. | Уровень структуры — это конкретная цена экстремума. |
| `SWING_UNCONFIRMED`* | swing | Swing на {time} ещё не подтверждён. | Справа от свечи меньше {n} закрытых свечей; экстремум может быть обновлён. | Дождитесь {n} закрытых свечей справа, прежде чем считать точку swing. | Подтверждение важнее скорости: незакрытая структура ещё может измениться. |
| `STRUCTURE_LABEL_WRONG` | structure-labels | На {time} стоит {given}, а нужно {expected}. | Метка сравнивает swing с предыдущим swing того же типа ({prevPrice}); равенство не считается обновлением. | Сравните цену {price} с предыдущим swing {side} {prevPrice}. | HH/HL/LH/LL — это сравнение экстремумов, а не направление последней свечи. |
| `STRUCTURE_LABEL_MISSED`* | structure-labels | Не подписан swing на {time}: ожидалось {expected}. | Каждый swing после первого получает метку относительно предыдущего swing того же типа. | Подпишите все swing окна, начиная со второго каждого типа. | Последовательность меток показывает тренд раньше, чем пробой. |
| `STRUCTURE_LABEL_EXTRA`* | structure-labels | Метка {given} на {time} стоит не на swing. | Метки HH/HL/LH/LL ставятся только на подтверждённые swing. | Сначала найдите swing, затем подпишите его. | Метка структуры наследует точность swing. |
| `BOS_WICK_ONLY` | bos | {kind} отмечен на {time}, но свеча закрылась на {close}, не за уровнем {level}. | Фитиль вышел за swing, тело — нет: это снятие ликвидности, а не слом структуры. | Ждите свечу, тело которой закроется за {level}; фитиль отмечайте как Liquidity sweep. | BOS и CHoCH — только по закрытию тела. |
| `BOS_MISSING` | bos | Пропущен BOS ({dir}) на {time}: закрытие {close} за уровнем {level}. | Тело закрылось за целевым swing по направлению тренда — структура продолжилась. | Отмечайте BOS на первой свече, закрывшейся за последним swing по тренду. | Каждый BOS переносит защищённый уровень вслед за трендом. |
| `BOS_WRONG_LEVEL` | bos | {kind} на {time} привязан к уровню {given}, а пробит уровень {level} (swing {refTime}). | Пробиваемый уровень — цель структуры: наивысший swing high после прошлого пробоя (в нисходящем — наинизший low) или защищённый уровень для CHoCH. | Проведите линию от swing {refTime} до свечи пробоя. | Уровень пробоя определяется структурой, а не ближайшим экстремумом. |
| `BOS_EXTRA`* | bos | Отмечен BOS на {time}, но целевой уровень не пробит. | На этой свече нет закрытия тела за подтверждённым структурным swing. | Определите текущую цель BOS ({level}) и ждите закрытия за ней. | Не каждый импульс — слом структуры. |
| `BOS_WRONG_DIRECTION`* | bos | BOS на {time} отмечен как {given}, а он {expected}. | Направление BOS задаётся стороной пробитого swing: выше high — бычий, ниже low — медвежий. | Проверьте, какой swing пробит закрытием. | Направление пробоя — это сторона, за которой закрылось тело. |
| `BOS_CHOCH_CONFUSED`* | choch | На {time} отмечен {given}, а это {expected}. | BOS продолжает текущий тренд ({trend}); CHoCH пробивает защищённый уровень против тренда и меняет его. | Перед отметкой определите текущий тренд и защищённый уровень ({protected}). | CHoCH — первый пробой против тренда; всё по тренду — BOS. |
| `CHOCH_MISSING` | choch | Пропущен CHoCH ({dir}) на {time}: закрытие {close} за защищённым уровнем {level}. | Пробит защищённый swing — структура сменила направление. | Держите в уме защищённый уровень и отмечайте первое закрытие тела за ним. | Смена характера структуры начинается с пробоя защищённого уровня. |
| `CHOCH_WRONG_DIRECTION` | choch | CHoCH на {time} отмечен как {given}, а он {expected}. | Бычий CHoCH пробивает защищённый high нисходящей структуры, медвежий — защищённый low восходящей. | Определите тренд до пробоя: CHoCH направлен против него. | Направление CHoCH противоположно прежнему тренду. |
| `CHOCH_EXTRA`* | choch | Отмечен CHoCH на {time}, но защищённый уровень {protected} не пробит. | Пробит внутренний или промежуточный swing, а не защищённый уровень — внешний тренд не сменился. | Сравните закрытие с защищённым уровнем; внутренний пробой отмечайте как internal. | Тренд жив, пока стоит защищённый уровень. |
| `INTERNAL_AS_EXTERNAL` | internal-external | Метка на {time} отмечена как external, а это internal. | Swing определяется фракталом N={nInt} и не является внешним (N={nExt}). | Внешними отмечайте только крупные swing, ограничивающие ноги тренда. | Внутренняя структура живёт внутри внешней ноги и не меняет её тренд сама по себе. |
| `EXTERNAL_AS_INTERNAL` | internal-external | Метка на {time} отмечена как internal, а это external. | Этот swing подтверждён фракталом N={nExt} — это граница внешней структуры. | Проверьте swing на большом окне ({nExt} свечей с каждой стороны). | Внешние swing задают тренд и защищённые уровни. |
| `SWEEP_MISSED` | sweep | Пропущен Liquidity sweep на {time}: фитиль до {wick} за swing {level}, закрытие {close}. | Цена сняла ликвидность за swing и вернулась: тело не закрепилось за уровнем {k} свечей. | Отмечайте свечу, фитиль которой вышел за swing, а тело осталось внутри. | Ликвидность за очевидными экстремумами снимается перед движением в обратную сторону. |
| `SWEEP_IS_BREAK` | sweep | Sweep отмечен на {time}, но это {kind}: тело закрылось за {level}. | Закрытие тела за уровнем — пробой структуры, а не снятие ликвидности. | Различайте: закрытие за уровнем — BOS/CHoCH, только фитиль — sweep. | Тело решает, фитиль проверяет. |
| `SWEEP_EXTRA`* | sweep | Отмечен sweep на {time}, но живой внешний swing не снят. | За фитилём нет подтверждённого внешнего swing, или цена закрепилась за уровнем в течение {k} свечей. | Sweep возможен только за подтверждённым, ещё не снятым и не пробитым swing. | Ликвидность находится за подтверждёнными экстремумами. |
| `MARK_WRONG_DIRECTION`* | по `params.kind` | {kindName} на {time} отмечен как {given}, а он {expected}. | Направление определяется стороной: снятие high — медвежий сигнал, снятие low — бычий; бычий OB/FVG ниже цены импульса вверх. | Определите, в какую сторону был импульс или какая ликвидность снята. | Направление зоны совпадает с направлением импульса, который её создал. |
| `OB_WRONG_CANDLE` | order-block | OB отмечен на {time}, эталон — {refTime}. | Order Block — последняя противоположная свеча перед импульсом, сломавшим структуру ({eventKind} на {eventTime}). | Найдите начало импульса и последнюю {oppColor} свечу перед ним с крайним {extreme}. | OB — это след крупного участника в начале импульса. |
| `OB_NO_DISPLACEMENT` | order-block | Зона на {time} не является валидным OB. | После свечи не было displacement: ни FVG, ни свечи с телом не меньше {k}×ATR до пробоя. | Ищите OB только перед сильным импульсом, сломавшим структуру. | Без импульса нет доказательства участия крупного игрока. |
| `OB_WRONG_BOUNDS`* | order-block | Границы OB на {time} не совпадают с эталоном [{low}–{high}] (перекрытие {iou}%). | Зона OB — диапазон свечи OB от low до high. | Растяните прямоугольник от low до high свечи OB. | Точные границы задают точку входа и стоп. |
| `OB_MISSED`* | order-block | Пропущен {dir} OB на {time} [{low}–{high}] для {eventKind} на {eventTime}. | Импульс с displacement сломал структуру — свеча перед ним образует OB. | После каждого внешнего BOS/CHoCH ищите последнюю противоположную свечу перед импульсом. | Каждый слом структуры оставляет зону интереса. |
| `OB_EXTRA`* | order-block | Зона на {time} не связана с внешним BOS/CHoCH. | OB строится только для импульса, сломавшего внешнюю структуру. | Сначала найдите пробой, затем его OB. | Зона без слома структуры — просто свеча. |
| `FVG_NOT_GAP` | fvg | На {time} нет разрыва между свечами 1 и 3. | Тени первой и третьей свечи тройки перекрываются: неэффективности нет. | Проверьте: low третьей свечи выше high первой (бычий) или high третьей ниже low первой (медвежий). | FVG — это цена, через которую рынок прошёл в одну сторону без встречных сделок. |
| `FVG_WRONG_BOUNDS` | fvg | Границы FVG на {time} неверны: эталон [{low}–{high}]. | Границы FVG — high первой и low третьей свечи (для медвежьего — low первой и high третьей). | Совместите края прямоугольника с тенями первой и третьей свечи. | Граница разрыва — это граница незаполненной цены. |
| `FVG_MISSED`* | fvg | Пропущен {dir} FVG на {time} [{low}–{high}], размер {size} (≥ 0.5 ATR). | Разрыв значимого размера ещё не заполнен ({status}). | Просматривайте импульсные свечи: разрыв между тенями соседей — FVG. | Незаполненный FVG притягивает цену. |
| `FVG_EXTRA`* | fvg | FVG на {time} уже заполнен или не совпадает с эталоном. | В эталоне только незаполненные FVG от 0.5 ATR. | Отмечайте только актуальные разрывы. | Заполненная неэффективность больше не работает. |
| `PATTERN_WRONG_TYPE` | pa-* | На {time} отмечена «{given}», а это «{expected}». | Критерии «{given}» не выполнены: {criterion}. | Сверьте доли тела и теней с критериями модели. | Модель определяется пропорциями, а не впечатлением. |
| `PATTERN_MISSED` | pa-* | Пропущена модель «{pattern}» на {time}. | Свечи удовлетворяют критериям: {criterion}. | Просмотрите окно свеча за свечой, проверяя тело, тени и размер относительно ATR. | Систематический просмотр надёжнее поиска «на глаз». |
| `PATTERN_EXTRA` | pa-* | На {time} нет модели «{pattern}». | Не выполнено: {criterion}. | Проверьте размер свечи относительно ATR и пропорции тела/теней. | Маленькая свеча с похожей формой — шум. |
| `PATTERN_WRONG_DIRECTION` | pa-* | «{pattern}» на {time} отмечена как {given}, а она {expected}. | Направление пин-бара задаёт длинная тень (нижняя — бычий молот, верхняя — медвежья падающая звезда); поглощения и звёзд — цвет последней свечи. | Определяйте направление по отвергнутой стороне. | Длинная тень — цена, которую рынок отверг. |
| `LEVEL_OFF_TOLERANCE` | pa-level | Уровень {user} отклоняется от эталона {ref} на {devPct}% (допуск {tolPct}%). | Эталон — кластер из {touches} swing в зоне [{low}–{high}]. | Проводите уровень через зону, где цена разворачивалась несколько раз. | Уровень — зона повторных реакций, а не одна точка. |
| `LEVEL_NOT_STRONGEST`* | pa-level | Уровень {user} реален, но сильнее уровень {ref} ({touches} касаний). | Нужен наиболее значимый уровень: больше касаний, затем свежее. | Сравните число реакций у кандидатов перед выбором. | Чем больше реакций, тем больше ордеров на уровне. |
| `LEVEL_WRONG_TYPE`* | pa-level | Уровень {user} — {given}, а требовался {expected}. | Поддержка ниже текущей цены, сопротивление — выше. | Определите положение уровня относительно последнего закрытия {close}. | Роль уровня определяется положением цены. |
| `CONTEXT_IGNORED_HTF` | pa-context | Старший тренд указан как {given}, а он {expected} ({htfTf}). | По внешней структуре {htfTf} последнее событие: {lastEvent}. | Перед оценкой модели откройте {htfTf} и определите тренд по последнему BOS/CHoCH. | Младший ТФ торгуется по направлению старшего. |
| `CONTEXT_MISSED_SWEEP` | pa-context | Не замечен sweep {side} на {time} (уровень {level}). | Модель сформировалась сразу после снятия ликвидности — это усиливает разворот. | Проверьте, не вышел ли фитиль за ближайший внешний swing перед моделью. | Разворот после снятия ликвидности надёжнее разворота «из воздуха». |
| `CONTEXT_MISSED_OB`* | pa-context | Не замечен {dir} Order Block [{low}–{high}] на {time}. | Модель сформировалась в зоне OB — это зона интереса. | Проверьте, есть ли OB, в который вошла цена модели. | Модель в зоне интереса значимее модели в пустоте. |
| `CONTEXT_MISSED_LEVEL` | pa-context | Не замечен уровень {level} ({touches} касаний). | Экстремум модели находится в зоне уровня ±0.3%. | Отметьте ближайшие уровни перед оценкой модели. | Уровни — места, где ждут ордера. |
| `CONTEXT_PHANTOM_FACTOR`* | pa-context | Указан фактор «{factor}», которого нет. | {reason}. | Подтверждайте каждый фактор по правилу: sweep — фитиль за внешним swing, OB — валидная зона, уровень — кластер ≥ 2 касаний. | Не приписывайте модели контекст, которого нет. |
| `CONTEXT_FALSE_POSITIVE` | pa-context | Модель названа значимой, но это не так. | {why}: по правилу нужна совпадающая со старшим трендом модель в зоне интереса. | Проверьте направление {htfTf} и наличие sweep/OB/уровня. | Форма без контекста — не сигнал. |
| `CONTEXT_FALSE_NEGATIVE`* | pa-context | Модель названа незначимой, хотя контекст подтверждает её. | Направление совпадает со старшим трендом и есть {factors}. | Когда тренд и зона совпадают, модель — подтверждение входа. | Совпадение тренда и зоны — основа сетапа. |
| `QUESTION_WRONG`* | по шаблону | Выбран ответ «{given}», верный — «{expected}». | {explain}. | {howTo}. | Принцип шаблона {template}. |
| `SL_WRONG_SIDE` | challenge-risk | Stop Loss {sl} с неверной стороны от входа {entry}. | Для LONG стоп ниже входа, для SHORT — выше. | Перенесите стоп за вход в сторону риска. | Стоп ограничивает убыток, а не прибыль. |
| `TP_WRONG_SIDE` | challenge-risk | Take Profit {tp} с неверной стороны от входа {entry}. | Для LONG тейк выше входа, для SHORT — ниже. | Перенесите тейк в сторону сделки. | Цель лежит в направлении сделки. |
| `SL_INSIDE_STRUCTURE` | challenge-risk | Stop Loss {sl} внутри структуры, защищённый уровень — {level}. | Обычный откат до {level} выбьет стоп, не отменяя идею. | Ставьте стоп за защищённым swing {level} (с запасом до 1.5 ATR). | Стоп — там, где идея сделки становится неверной. |
| `SL_TOO_WIDE`* | challenge-risk | Stop Loss {sl} дальше защищённого уровня {level} более чем на 1.5 ATR. | Лишнее расстояние снижает R без выигрыша в надёжности. | Ставьте стоп сразу за защищённым swing. | Риск должен быть минимальным, но достаточным. |
| `RR_TOO_LOW` | challenge-risk | Соотношение риск/прибыль {rr}R ниже 1.5R. | При низком RR даже частые победы не покрывают убытки. | Выбирайте цель у ликвидности не ближе 1.5R (лучше 2R+) или ищите лучший вход. | Сделка должна стоить своего риска. |
| `TRADE_AGAINST_HTF` | challenge-entry | Сделка {side} против старшего тренда ({htfTrend} на {htfTf}). | Против старшей структуры вероятность продолжения ниже. | Торгуйте по направлению {htfTf} или ждите CHoCH на старшем ТФ. | Старший ТФ задаёт направление, младший — точку входа. |
| `TRADE_AGAINST_STRUCTURE`* | challenge-entry | Сделка {side} против структуры рабочего ТФ ({trendTf}). | Последнее событие — {lastEvent}; защищённый уровень {level} не пробит. | Дождитесь CHoCH на рабочем ТФ или торгуйте по тренду. | Пока стоит защищённый уровень, тренд продолжается. |
| `TRADE_IN_RANGE` | challenge-entry | Позиция открыта во флэте. | Структура не определена ({trendTf}/{htfTrend}): нет направления и края диапазона. | Во флэте выбирайте WAIT или ждите sweep края и CHoCH. | Нет структуры — нет сделки. |
| `ENTRY_NO_POI`* | challenge-entry | Вход {entry} не в зоне интереса. | Рядом нет OB, FVG или защищённого уровня — вход «в середине движения». | Ждите возврата в OB/FVG или к защищённому уровню. | Входите от зоны, а не вдогонку. |
| `WAIT_MISSED_SETUP` | challenge-wait | Выбран WAIT, но был сетап {refSide}. | Тренд {trendTf} совпадал с {htfTrend}, цена была в зоне интереса ({poi}), RR ≥ 2. | Когда тренд, зона и RR совпадают — это вход. | Ожидание тоже решение и имеет цену упущенной возможности. |
| `REASON_MISMATCH` | challenge-entry | Причина «{reason}» не подтверждается графиком. | {reasonWhy}. | Выбирайте причины, которые можно указать на графике. | Обоснование — это проверяемые факты, а не ощущения. |

`SL_WRONG_SIDE`/`TP_WRONG_SIDE` возвращаются как validation issue (400), попытка не оценивается (API_CONTRACTS §1.1); шаблоны нужны для сообщений FR-FB-09.

---

## 18. Golden-тесты

### 18.1 Формат и процесс
- Файл `<имя фикстуры>.<участок>.golden.json` рядом с CSV в `fixtures/klines/...` (зона Technical Analyst). Поля: `algoVersion: "1.0.0"`, `author: "technical-analyst"`, `date`, `source` (путь CSV + sha256 CSV), `function`, `params`, `expected` (метки/события/исходы), `rationale` (обоснование каждой метки: правило раздела + цены свечей).
- Golden создаются после утверждения спецификации; тест сравнивает выход ядра с `expected` точно (цены — точное равенство, время — `openTime`). Ниже — утверждаемое содержание; все значения получены из реальных CSV и сверены вручную по OHLC.

### 18.2 Участки
**GS-1. Внешняя структура, medium (N=5)** — `fixtures/klines/BTCUSDT/4h/BTCUSDT-4h-2026-09.csv` (есть; 180 свечей, 2026-09-01 00:00 .. 2026-09-30 20:00 UTC).
- Swing (время UTC, тип, цена, метка): 09-02 08:00 L 76151.9 —; 09-03 20:00 H 82282.8 —; 09-04 12:00 L 78618.1 HL; 09-05 16:00 H 80167.0 LH; 09-06 20:00 H 80536.1 HH; 09-08 12:00 L 77600.1 LL; 09-09 08:00 H 79737.3 LH; **09-11 12:00 H 79859.8 HH и L 76000.3 LL (одна свеча)**; 09-14 00:00 L 76350.1 HL; 09-14 20:00 H 79570.9 LH; 09-15 16:00 L 74909.4 LL; 09-16 16:00 L 75025.0 HL; 09-19 12:00 H 81933.9 HH; 09-20 00:00 L 80095.9 HL; 09-21 20:00 H 87385.1 HH; 09-23 04:00 H 87247.3 LH; 09-24 08:00 L 82832.0 HL; 09-25 08:00 H 85224.0 LH; 09-25 12:00 L 83130.1 HL; 09-27 12:00 H 85146.4 LH; 09-28 12:00 L 82500.1 LL; 09-29 12:00 H 84554.9 LH (23 swing).
- События: BOS bull 09-06 20:00 (C 80301.1 > 80167.0, swing 09-05 16:00; первый пробой из `none`); CHoCH bear 09-08 04:00 (C 78445.0 < 78618.1, swing 09-04 12:00); BOS bear 09-10 12:00 (C 77218.5 < 77600.1); BOS bear 09-15 20:00 (C 75599.9 < 76000.3, swing 09-11 12:00); CHoCH bull 09-18 12:00 (C 80688.7 > защищённый high 79570.9, swing 09-14 20:00); BOS bull 09-21 08:00 (C 84849.9 > 81933.9).
- **AC-06:** свеча 09-11 12:00 (O 77000.1 H 79859.8 L 76000.3 C 77682.9): high выше защищённого high 79737.3 (swing 09-09 08:00), close ниже -> CHoCH **нет**; CHoCH фиксируется на 09-18 12:00 закрытием тела.
- Конечное состояние: `trend = up`, `refHigh = 87385.1` (09-21 20:00), `refLow` (защищённый) `= 80095.9` (09-20 00:00). LL 82500.1 (09-28) не меняет внешний тренд.
- AC-07: см. 12.8.

**GS-2. Внешняя структура, easy (N=7)** — тот же файл. Swing: 09-02 08:00 L 76151.9; 09-03 20:00 H 82282.8; 09-06 20:00 H 80536.1 LH; 09-08 12:00 L 77600.1 HL; 09-09 08:00 H 79737.3 LH; 09-11 12:00 H 79859.8 HH; 09-11 12:00 L 76000.3 LL; 09-14 00:00 L 76350.1 HL; 09-14 20:00 H 79570.9 LH; 09-15 16:00 L 74909.4 LL; 09-19 12:00 H 81933.9 HH; 09-20 00:00 L 80095.9 HL; 09-21 20:00 H 87385.1 HH; 09-23 04:00 H 87247.3 LH; 09-24 08:00 L 82832.0 HL; 09-25 08:00 H 85224.0 LH; 09-27 12:00 H 85146.4 LH; 09-28 12:00 L 82500.1 LL (18 swing). События: BOS bear 09-10 12:00 (77600.1); BOS bear 09-15 20:00 (76000.3); CHoCH bull 09-18 12:00 (79570.9); BOS bull 09-21 08:00 (81933.9). Проверяет, что N влияет на набор swing (нет 09-04 12:00, 09-05 16:00) и событий (нет BOS 09-06 20:00).

**GS-3. Внутренняя структура** — тот же файл.
- medium (`nExt=5, nInt=3`): внутренние swing (13): 09-01 16:00 L 76368.0; 09-06 12:00 L 79125.3 HL; 09-07 12:00 L 78636.0 LL; 09-10 20:00 L 76402.9 LL; 09-12 12:00 H 77477.4 LH; 09-13 08:00 L 76458.9 HL; 09-17 12:00 L 75975.0 HL; 09-22 04:00 L 85080.0 HL; 09-23 16:00 L 83450.1 LL; 09-24 12:00 H 84901.6 LH; 09-26 20:00 L 83778.4 HL; 09-28 16:00 H 84350.0 LH; 09-29 16:00 L 82851.5 HL. Внутренние события после подавления: CHoCH bear 09-07 12:00 (79125.3); CHoCH bull 09-14 00:00 (77477.4); CHoCH bear 09-15 16:00 (76350.1); CHoCH bear 09-23 12:00 (85080.0); BOS bear 09-28 00:00 (83778.4). Подавлены (внешнее событие того же направления на той же свече): 09-06 20:00, 09-08 04:00, 09-10 12:00, 09-18 12:00, 09-21 08:00.
- hard (`nInt=2`): внутренние события после подавления: CHoCH bear 09-07 12:00 (79125.3); BOS bear 09-13 08:00 (77025.1); CHoCH bull 09-14 00:00 (77477.4); CHoCH bear 09-15 16:00 (76350.1); **CHoCH bull 09-18 00:00 (77149.8) — внутренний CHoCH за 3 свечи до внешнего CHoCH 09-18 12:00**; CHoCH bear 09-23 12:00 (85080.0); CHoCH bull 09-26 20:00 (84296.6); CHoCH bear 09-28 00:00 (83778.4).
- Обоснование участка: внутренняя медвежья структура 09-23..09-28 при внешнем восходящем тренде — эталонный пример различия слоёв.

**GS-4. Sweep, OB, FVG** — тот же файл, N=5.
- Sweep: 09-11 12:00 high, уровень 79737.3 (swing 09-09 08:00), `direction = bear`; 09-11 12:00 low, уровень 76151.9 (swing 09-02 08:00), `direction = bull`; 09-28 04:00 low, уровень 82832.0 (swing 09-24 08:00; L 82617.8, C 82914.4).
- OB (свеча, зона, валидность, статус на 09-30 20:00): для BOS bull 09-06 20:00 — 09-06 12:00 [79125.3–79973.6] **valid = false** (нет displacement; кейс `OB_NO_DISPLACEMENT`); для CHoCH bear 09-08 04:00 — 09-06 20:00 [79600.0–80536.1] valid, invalidated 09-18 12:00; для BOS bear 09-10 12:00 — 09-09 08:00 [78690.3–79737.3] valid = false; для BOS bear 09-15 20:00 — 09-14 16:00 [78379.6–79298.3] valid, invalidated 09-18 12:00 (кейс «o−1»); для CHoCH bull 09-18 12:00 — **09-17 20:00 [76210.0–76711.0]** valid, fresh; для BOS bull 09-21 08:00 — 09-20 00:00 [80095.9–81295.0] valid, fresh.
- FVG ≥ 0.5·ATR (середина, зона, статус на конец): bull 09-03 12:00 [78032.0–80588.0] filled 09-08 12:00; bear 09-04 12:00 [79838.1–80458.0] filled 09-06 20:00; bear 09-15 04:00 [77188.0–77622.0] filled 09-18 04:00; bull 09-18 00:00 [76711.0–77188.0] open; bull 09-18 12:00 [78443.0–80532.3] partial; bull 09-21 08:00 [81857.1–84724.9] partial; bear 09-23 12:00 [84524.0–85381.4] filled 09-30 12:00; bear 09-28 00:00 [83498.6–84074.3] filled 09-28 16:00.

**GS-5. Модели PA** — тот же файл. Ключевые экземпляры (полный список 65 экземпляров фиксируется в golden-файле после ревью): все из 9.4, плюс `evening-star` 09-27 04:00..12:00, `pin-bar bull` 09-28 08:00, `engulfing bull` 09-11 08:00/12:00 (внешний бар 09-11 12:00). Отрицательный кейс: 09-05 16:00 — `doji`, но **не** `pin-bar` (range < 0.8·ATR).

**GS-6. Уровни** — тот же файл, `findLevels` на всём файле: значения из 10.2; полный список уровней: support 76208.03 [75975.0–76402.9] 6 касаний; resistance 85088.0 [84901.6–85224.0] 4; support 79965.0 [79737.3–80167.0] 4; support 82727.87 [82500.1–82851.5] 3; далее уровни с 2 касаниями (84452.45, 83290.1, 87316.2, 82108.35, 74967.2, 79348.1, 77538.75, 78627.05). Для «Проведи уровень»: support -> 79965.0 (76208.03 дальше 5·ATR), resistance -> 85088.0.

**GS-7. Явный тренд (easy MS / easy Challenge)** — `fixtures/klines/BTCUSDT/15m/BTCUSDT-15m-2026-10-20.csv` + `...-10-21.csv` (есть; 192 свечи).
- Внешние (N=5) события: BOS bull 10-20 12:30 (C 81662.6 > 81626.4, swing 10-20 10:15); BOS bull 10-21 09:00 (C 83512.1 > 83420.0, swing 10-20 14:45); BOS bull 10-21 13:00 (C 83796.7 > 83686.2, swing 10-21 08:45); CHoCH нет. Конец: `trend = up`, `refHigh = 84875.2` (10-21 16:30), защищённый low `= 82345.6` (10-20 19:15) — не сдвинут BOS 10-21 13:00, так как в интервале (08:45, 13:00] нет внешнего swing low (кейс «защищённый уровень не меняется»).
- Внутренние (N=2): 16 событий, из них подавлены CHoCH bull 10-20 12:30 (на свече внешнего BOS) и BOS bull 10-21 13:00; остальные: BOS bull 10-20 03:00 (81823.2); CHoCH bear 07:30 (81578.2); BOS bear 12:00 (81436.3); BOS bull 13:45 (81751.7); BOS bull 16:45 (82684.4); BOS bull 22:00 (82980.0); CHoCH bear 10-21 01:00 (82824.1); BOS bear 02:00 (82750.4); CHoCH bull 05:00 (82837.2); CHoCH bear 05:30 (82698.9); CHoCH bull 07:15 (82881.9); CHoCH bear 19:00 (84339.9); CHoCH bull 20:30 (84568.9); CHoCH bear 23:00 (84400.0).
- OB: для BOS 10-21 09:00 — 10-21 05:45 [82594.8–82770.7] valid, fresh.

**GS-8. Равенство close и уровня** — **новая фикстура** `fixtures/klines/SOLUSDT/15m/SOLUSDT-15m-2026-08-09.csv` (https://data.binance.vision/data/futures/um/daily/klines/SOLUSDT/15m/SOLUSDT-15m-2026-08-09.zip; ожидаемый sha256 CSV из моей проверки по месячному архиву: `460a5060524b398958b35b6978abbbd7c21c8fdbc5aac65207e458ddccb3d493` — сверить с дневным файлом).
- N=5: события BOS bull 06:15 (76.11); BOS bull 13:15 (76.64); BOS bull 22:00 (C 77.69 > 77.56, swing 16:00); **22:30: C 77.04 == защищённый low 77.04 (swing 20:15) -> CHoCH нет**; **CHoCH bear 22:45 (C 76.80 < 77.04)**.
- Sweep low 20:00: L 77.05 < 77.06 (swing 18:15), **C 77.06 == уровень** -> sweep (удержание 20:15..20:45 закрытиями ≥ 77.06).
- Swing 23:45 L 76.16 — кандидат у правого края, в эталон не входит (правило 2.3/2.4).

**GS-9. Равные максимумы** — **новые фикстуры** `fixtures/klines/BTCUSDT/15m/BTCUSDT-15m-2026-08-24.csv` (sha256 по месячному: `2474c1ef31a8ff2d78c7c8e85fc14cdfaacb4954cf92d4c8cf9f981b5ec486d8`) и `BTCUSDT-15m-2026-08-04.csv` (`4760abab5985a0d4598746f9f182e77b2ad380fc223afb41faedbbda697dee71`).
- 2026-08-24, N=5: 21:00 H 79012.6 — swing high (метка LH к 19:00 79089.1); 21:45 H 79012.6 — **не** swing (равный максимум слева).
- 2026-08-04, N=3 и N=2: 18:15 H 64370.0 — swing high; 18:30 H 64370.0 — не swing. Вспомогательно: `detectSweeps` по swing N=3 даёт sweep high 19:30 (H 64388.0, C 64351.1) уровня 64370.0 — снятие EQH.

**GS-10. resolveTrade** — фикстуры `fixtures/klines/BTCUSDT/15m/BTCUSDT-15m-2026-10-20.csv`, `...-10-21.csv`, `fixtures/klines/BTCUSDT/1m/BTCUSDT-1m-2026-10-20.csv`, `...-10-21.csv`, `fixtures/aggTrades/BTCUSDT-aggTrades-2026-10-20.csv` (есть; покрывает 00:00:00.007–00:03:16.408) и **новая** `fixtures/klines/BTCUSDT/15m/BTCUSDT-15m-2026-10-19.csv` (для цены входа R1; sha256 zip `47f130b08f45c073f5423a2d6b1ae1b513e8f175b25a3f680741bda6ad097f56` сверен с `.CHECKSUM`). Параметры позиций — входные данные теста (цены свечей реальные), `tf = 15m`, лимит 96:
| Кейс | T (UTC) | Позиция | Ожидаемо |
|---|---|---|---|
| R1 | 2026-10-20 00:00 | LONG entry 81903.3 (close 10-19 23:45), SL 81895.0, TP 81950.0 | 15m 00:00 задевает оба -> 1m 00:00 (H 81987.8, L 81892.4) задевает оба -> aggTrades: первая сделка за уровнем `aggTradeId 3490482886`, `transactTime 1792454413607` (00:00:13.607), цена 81950.0 = TP; `result = tp`, `method = drill-aggtrades`, R = 46.7/8.3 = 5.626506… |
| R1s | 2026-10-20 00:00 | SHORT entry 81903.3, SL 81950.0, TP 81895.0 | та же сделка -> `sl`, R = −1, `drill-aggtrades` |
| R2 | 2026-10-20 00:15 | SHORT entry 81752.9 (close 00:00), SL 81770.0, TP 81500.0 | 15m 00:15 (H 81770.6, L 81381.5) задевает оба -> 1m 00:15 (H 81770.6, L 81745.8) — только SL -> `sl`, `drill-1m`, триггер 00:15 |
| R3 | 2026-10-20 00:15 | LONG entry 81752.9, SL 81300.0, TP 82000.0 | первое касание — SL на 15m 01:00, только один уровень -> `sl`, `method = candle` |
| R4 | 2026-10-20 00:15 | LONG entry 81752.9, SL 80500.0, TP 86000.0 | ни один уровень за 96 свечей -> `timeout`, exit = close 15m 2026-10-21 00:00 = 83047.0, R = 1294.1/1252.9 = 1.032883… |
Инвариант 15.7: R2–R4 дают тот же результат при обходе по 1m.

### 18.3 Что ещё размечается после утверждения (M4/M5)
Golden «Контекст» (11.3–11.4) и эталон Challenge (14.2–14.3) на участках GS-1/GS-7 с 1h/4h/1d-рядами; требуются фикстуры старшего ТФ: `BTCUSDT-1d-2026-08.csv`, `BTCUSDT-1d-2026-09.csv` (для htf 4h-участка GS-1) и `BTCUSDT-1h-2026-10-20/21` (есть) + `BTCUSDT-4h-2026-10-*` (частично есть).

---

## 19. Расхождения с документами
1. `API_CONTRACTS.md` §2.1: `gradeMarks(user, algo, tolerance)` — недостаточно входов (нужны свечи, окно, понятия, допустимые метки). Спецификация задаёт `gradeMarks(user, algo: AlgoMarkSet, ctx: GradeContext)` (12.1). Нужна правка контракта.
2. `API_CONTRACTS.md` §5.1 `MarkGrade`: нет списка меток, совпавших с допустимыми эталонами (заполненные FVG, инвалидированные OB, sweep-кандидаты) и вне окна — предлагается поле `ignored: string[]`.
3. `DATABASE_SCHEMA.md` §5.1: `ok = (correct === total)` для заданий «Разметка» с 10–30 метками почти никогда не выполняется, навык будет выглядеть слабым при 95% точности. Предлагается `ok = correct / total >= 0.8` (для `total = 1` совпадает с текущим правилом). Решение — за оркестратором.
4. `API_CONTRACTS.md` §3.3: «Контекст» требует ряд старшего ТФ (FR-PA-04: старший тренд); в описании «market-structure / price-action — только запрошенный tf». Предлагается для `pa-context` отдавать `tf` и `htf(tf)`.
5. `API_CONTRACTS.md` §5.3 `ErrorCode` и `OkCode`: добавлены коды, помеченные «(новое)» в разделах 10, 12, 13, 14, 17 (`SWING_UNCONFIRMED`, `STRUCTURE_LABEL_MISSED/EXTRA`, `BOS_EXTRA`, `BOS_WRONG_DIRECTION`, `BOS_CHOCH_CONFUSED`, `CHOCH_EXTRA`, `SWEEP_EXTRA`, `MARK_WRONG_DIRECTION`, `OB_WRONG_BOUNDS`, `OB_MISSED`, `OB_EXTRA`, `FVG_MISSED`, `FVG_EXTRA`, `LEVEL_NOT_STRONGEST`, `LEVEL_WRONG_TYPE`, `CONTEXT_MISSED_OB`, `CONTEXT_PHANTOM_FACTOR`, `CONTEXT_FALSE_NEGATIVE`, `QUESTION_WRONG`, `SL_TOO_WIDE`, `TRADE_AGAINST_STRUCTURE`, `ENTRY_NO_POI`; OkCode: `OK_LABEL`, `OK_SCOPE`, `OK_SWEEP`, `OK_HTF`, `OK_RR`). `BOS_WRONG_LEVEL` и `BOS_WICK_ONLY` применяются и к CHoCH с `params.kind`.
6. `packages/core/src/index.ts`: `ALGO_VERSION = '0.1.0'`; по этой спецификации — `1.0.0`.
7. ADR-0007 «Открытые вопросы»: равенство цены = касание — подтверждено (15.1); лимиты времени OQ-09 — зафиксированы значения ADR (14.4). PRD OQ-08, OQ-09, OQ-11, OQ-16 и OQ-02 закрываются этой спецификацией после утверждения.
8. ADR-0006 п.7: частичная старшая свеча **не** участвует в старшем тренде Challenge и «Контекста» (1.1).
9. FR-MS-05 / резюме («N зависит от сложности»): `nExt` одинаков на medium и hard (5); различие — `nInt` (3/2) и набор понятий. Если требуется разный `nExt` на всех трёх уровнях — нужно решение пользователя.
10. PRD FR-MS-04 описывает фрактал как «N свечей слева и справа с меньшим максимумом»; спецификация уточняет нестрогость справа (`<=`) для разрешения равных максимумов.
11. TESTING_STRATEGY §4.4: golden «рядом с фикстурой» — для GS-8, GS-9, GS-10 нужны новые фикстуры (зона Market Data Engineer), см. раздел 20.

## 20. Спорные места и вопросы оркестратору
1. **Sweep и K:** принята трактовка «фитиль за внешним swing, close не за ним, K=3 свечи без закрытия за уровнем» (6.1). Подтвердить у пользователя.
2. **Разные машины состояний слоёв:** внешний — защищённые уровни, внутренний — «последний swing» (3.1, 5.2, 5.3). Это сознательная асимметрия; подтвердить.
3. **easy `nExt = 7`**, medium/hard `nExt = 5`; `nInt` 3/2 (1.6).
4. **OB только для внешних событий**; зона — high–low свечи; начало импульса — последний фрактал L=R=2 (7.1).
5. **Эталон разметки FVG/OB — только актуальные** (FVG `open/partial`, OB не `invalidated`); заполненные — допустимы без штрафа (8.2, 7.2, 12.6).
6. **Контекст:** модель против старшего тренда никогда не значима (11.4).
7. **Challenge:** рубрика 25/25/15/15/10/10, `RR_MIN = 1.5`, полный балл с 2R; WAIT верен только при `refSide = WAIT` без учёта исхода; вердикт по качеству (14.3–14.4).
8. **Терминал:** окно оценки — от первой метки пользователя до последней закрытой свечи, понятия — по типам меток пользователя (1.6, 12) — предложение.
9. **Новые фикстуры (запрос к Market Data Engineer):** daily `SOLUSDT 15m 2026-08-09`, `BTCUSDT 15m 2026-08-04`, `BTCUSDT 15m 2026-08-24`, `BTCUSDT 15m 2026-10-19`; для M4/M5 — `BTCUSDT 1d 2026-08`, `BTCUSDT 1d 2026-09`.
10. **Правки контрактов (оркестратор):** пункты 1–5 раздела 19.
