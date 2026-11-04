# FIBONACCI — спецификация модуля Fibonacci Playground (v1.1) для `@tl/core`

Версия документа: 1.0 (черновик на утверждение оркестратором), 2026-11-04. Автор: Technical Analyst.
`ALGO_VERSION` после реализации модуля: **`1.2.0`** (MINOR по `ALGORITHMS.md` §1.5: новый детектор и новые задания, существующие метки и эталоны MS/PA/Challenge не меняются; `ANALYSIS_ALGO_VERSION = 1.0.0` сохраняется). Константа модуля `FIB_ALGO_VERSION = '1.0.0'` записывается в golden-файлы этого документа и в `params` токена (смена семантики любого правила ниже — MAJOR для `FIB_ALGO_VERSION` и MINOR+ для `ALGO_VERSION`).
Источники: решения пользователя, переданные оркестратором (2026-11-04); `docs/specs/ALGORITHMS.md` (§1 соглашения, §2–§5 swing/структура, §7 OB, §8 FVG, §12 `gradeMarks`, §13 генерация, §14.4 лимиты, §15 `resolveTrade`, §16 навыки, §17 шаблоны); `docs/API_CONTRACTS.md` (§2–§5); `docs/PRD.md` (FR-FB-02, FR-DRAW, FR-TERM, FR-PROG); `docs/INTERVIEW_SUMMARY.md`; `docs/ROADMAP.md` (v1.1).
Проверка на реальных данных: все примеры и golden-участки (§12) получены из data.binance.vision (USDⓈ-M futures), контрольные суммы архивов сверены с `.CHECKSUM`. Референсная реализация на Python (только для исследования; сверена с golden GS-1/GS-4/GS-6 `ALGORITHMS.md` — события, OB, FVG и уровни совпали точно) использовалась для поиска участков; ключевые значения сверены вручную по OHLC.

Условные обозначения: **(решение)** — выбор между вариантами с обоснованием; **(новое)** — дополнение к словарям `API_CONTRACTS.md`; **(вопрос)** — вынесено оркестратору (§15).

---

## 1. Область и общие соглашения

### 1.1 Что входит
| Тип задания (`taskType`) | `kind` | Будущее | Суть |
|---|---|---|---|
| «Построй сетку» | `fib-grid` | нет | пользователь тянет Fibonacci Retracement по импульсу в окне |
| «Где реакция?» | `fib-reaction` | да, только на сервере | сетка дана; пользователь выбирает уровень реакции, опционально конфлюэнс, отвечает на вопрос Premium/Discount; затем проигрывание |
| «Цель по Extension» | `fib-extension` | да, только на сервере | пользователь строит Extension A–B–C и выбирает цель; затем проигрывание |
Плюс инструменты Fibonacci Retracement / Extension в свободном терминале (§8).

### 1.2 Переиспользуемые соглашения (без изменений)
- Только закрытые свечи (`closedOnly`, `ALGORITHMS.md` §1.1); незакрытая свеча не участвует ни в одном правиле этого документа, в том числе как кандидат в точку A, B или C.
- Пропуски свечей (`gaps`): генерация отбраковывает окно с пропуском в видимой истории **и** в будущем на лимит проигрывания; в терминале анализируется последний непрерывный сегмент.
- ATR14 — простое среднее TR (`ALGORITHMS.md` §1.3); `null` при `i < 14` — правило, требующее ATR, не срабатывает.
- Сравнения цен свечей — точные; производные цены (уровни) вычисляются ровно по формулам §2 в указанном порядке операций, без округления в ядре (округление — только при показе, до тика).
- При равенстве выигрывает более ранняя свеча (если явно не сказано иное).
- Случайность — только `mulberry32(seed)`.
- Внешняя структура — `analyzeStructure` (`ALGORITHMS.md` §5.2) с `nExt` по сложности; OB — §7, FVG — §8.
- Время якорей переводится в индекс свечи `idx(t)` по `ALGORITHMS.md` §12.2.

### 1.3 Направление и обозначения
- Импульс **вверх** (`direction = 'bull'`): A — swing low (начало), B — swing high (конец). Импульс **вниз** (`'bear'`): A — swing high, B — swing low.
- `A`, `B`, `C` в формулах — цены точек; `a`, `b`, `c` — индексы их свечей.
- Цена точки — экстремум свечи по роли: для bull `A = low[a]`, `B = high[b]`, `C = low[c]`; для bear `A = high[a]`, `B = low[b]`, `C = high[c]`.

---

## 2. Уровни, зоны и формулы

### 2.1 Retracement
Единая формула для обоих направлений (уровень 0 — на B, уровень 1 — на A, как у Fibonacci Retracement TradingView при протяжке от A к B):
```
levelPrice(r) = B + r * (A - B)
depth(price)  = (B - price) / (B - A)            // глубина коррекции в долях импульса; 0 = B, 1 = A
```
Уровни сетки: `0, 0.236, 0.382, 0.5, 0.618, 0.705, 0.786, 1`. Зона **OTE** (optimal trade entry): `depth ∈ [0.62, 0.79]` (границы включительно).
`depth > 1` — цена за точкой A (фитиль за A — снятие ликвидности под началом импульса; закрытие за A — слом импульса, §6.4).

### 2.2 Extension (Trend-Based Fib Extension A–B–C)
```
extPrice(x) = C + x * (B - A)                     // для bear (B - A) < 0, цели ниже C
extReached(x) = bull ? maxHigh >= extPrice(x) : minLow <= extPrice(x)   // касание с равенством — достижение (как ALGORITHMS §15 п.1)
xMax = (extreme - C) / (B - A)
```
Цели: `1.0, 1.272, 1.618`; `2.0` показывается справочно (не вариант ответа и не оценивается).

### 2.3 Premium / Discount (решение)
Диапазон (dealing range) — импульс `[A, B]`; equilibrium `EQ = levelPrice(0.5)`.
- **Premium** — цена выше EQ, **Discount** — ниже EQ (абсолютно, независимо от направления импульса).
- Для импульса вверх вход по направлению (лонг) — из discount (`depth > 0.5`); для импульса вниз шорт — из premium (`depth > 0.5`). Иначе: «глубже 0.5 по направлению коррекции» = зона входа по направлению импульса.
- `pdZone(price)`: `price > EQ` -> `premium`, `price < EQ` -> `discount`, `price == EQ` -> `equilibrium`.
- Вопрос Premium/Discount задаётся только при `|depth(price) - 0.5| >= 0.02` (иначе ответ неоднозначен для глаза; вопрос не задаётся, `pdQuestion = null`). **(решение)** Варианта `equilibrium` в ответе нет — решение пользователя двухзначное (premium/discount).

### 2.4 Сигнатуры
```ts
type FibDirection = 'bull' | 'bear';
const FIB_RETRACEMENT_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.705, 0.786, 1] as const;
const FIB_OTE = { from: 0.62, to: 0.79 } as const;
const FIB_EXTENSION_TARGETS = [1, 1.272, 1.618] as const;
const FIB_EXTENSION_INFO = [2] as const;

function fibLevelPrice(A: number, B: number, r: number): number;          // B + r*(A-B)
function fibDepth(A: number, B: number, price: number): number;           // (B-price)/(B-A)
function fibExtensionPrice(A: number, B: number, C: number, x: number): number;   // C + x*(B-A)
function pdZone(A: number, B: number, price: number): 'premium' | 'discount' | 'equilibrium';
```

---

## 3. `findImpulses` — импульс для задания и эталон сетки

### 3.1 Определение (решение)
Импульс — нога внешней структуры, сломавшая структуру закрытием тела. Для каждого внешнего события `E` (BOS или CHoCH, `ALGORITHMS.md` §5.2; `E.brokenSwing = H`, `E.breakIndex = k`, `E.level = H.price`), bull (bear — зеркально):
1. **Начало A** — свеча с минимальным `low` на `(H.index, k]` (при равенстве — ранняя). Она обязана быть внешним swing low (`nExt`). Это тот же защищённый low (strong low), который машина состояний ставит после пробоя (`ALGORITHMS.md` §5.2), т.е. начало dealing range в смысле SMC. Иначе — отказ `A_NOT_SWING`.
2. **Конец B** — первый (по индексу) внешний swing high `S` с `S.index > a` и `S.price > E.level` (первый подтверждённый экстремум за пробитым уровнем). Нет такого — `NO_B` (у правого края — кандидат `pending`, §3.4).
3. **Пробой внутри ноги:** `k <= b + nExt` (закрытие за уровнем — на ноге A→B или на правом плече B до его подтверждения). Иначе пробой сделала более поздняя нога — отказ `BREAK_AFTER_B`.
4. **A и B — внешние экстремумы ноги:** `min(low[a..b]) == A` (ни одна свеча ноги, включая свечу B, не ушла ниже A) — иначе `A_NOT_EXTREME`; `max(high[a..b]) == B` — иначе `B_NOT_EXTREME`.
5. `ATR14[a] != null` — иначе `ATR_NULL`.
Метрики: `candles = b - a`; `atrA = ATR14[a]`; `rangeAtr = |B - A| / atrA` (ATR до импульса: размах сравнивается с «нормальной» волатильностью до движения, а не с ATR, раздутым самим импульсом).
Импульс известен (подтверждён) на свече `confirmedIndex = b + nExt`.

Обоснование выбора A: проведение сетки «от абсолютного минимума окна» неоднозначно (зависит от окна) и не совпадает с SMC-практикой: dealing range строят от защищённого swing ноги, сломавшей структуру (strong low -> weak high). Правило «минимум на `(H.index, k]` + внешний swing» однозначно, проверяемо вручную и совпадает с `refLow` машины состояний.

### 3.2 Сигнатура
```ts
interface ImpulsePoint { index: number; time: UtcMs; price: number }
interface Impulse {
  direction: FibDirection;
  event: StructureEvent;                 // внешний BOS/CHoCH (ALGORITHMS §3.3)
  a: ImpulsePoint;                       // начало, уровень 1
  b: ImpulsePoint;                       // конец, уровень 0
  confirmedIndex: number;                // b.index + nExt
  candles: number;                       // b.index - a.index
  atrA: number;                          // ATR14[a.index]
  rangeAtr: number;                      // |b.price - a.price| / atrA
}
type ImpulseRejectReason = 'A_NOT_SWING' | 'A_NOT_EXTREME' | 'NO_B' | 'B_NOT_EXTREME' | 'BREAK_AFTER_B' | 'ATR_NULL';
interface ImpulseScan {
  algoVersion: string;                   // FIB_ALGO_VERSION
  impulses: Impulse[];                   // по event.breakIndex
  rejected: { event: StructureEvent; reason: ImpulseRejectReason }[];
  pending: Omit<Impulse, 'confirmedIndex'>[];   // B — кандидат pendingSwings у правого края (§3.4), только для терминала
}
function findImpulses(candles: Candle[], p: { nExt: number }): ImpulseScan;
```

### 3.3 Псевдокод
```ts
function findImpulses(c, { nExt }) {
  const r = analyzeStructure(c, { nExt, nInt: null, sweepHoldK: 3, fvgMinAtr: 0.5, obDisplacementAtr: 1.2 });
  const ext = r.swings.filter(s => s.scope === 'external');
  const atr = atr14(c);
  for (const e of r.events.filter(e => e.scope === 'external')) {
    const bull = e.direction === 'bull', k = e.breakIndex, h = e.brokenSwing.index;
    const a = argExtreme(c, h + 1, k, bull ? 'low-min' : 'high-max');          // равенство -> ранняя
    if (!ext.some(s => s.index === a && s.type === (bull ? 'low' : 'high'))) { reject('A_NOT_SWING'); continue; }
    const S = ext.find(s => s.type === (bull ? 'high' : 'low') && s.index > a && (bull ? s.price > e.level : s.price < e.level));
    if (!S) { pendingOrReject('NO_B'); continue; }
    const b = S.index;
    if (k > b + nExt) { reject('BREAK_AFTER_B'); continue; }
    const A = bull ? c[a].low : c[a].high, B = S.price;
    if (bull ? minLow(c, a, b) < A : maxHigh(c, a, b) > A) { reject('A_NOT_EXTREME'); continue; }
    if (bull ? maxHigh(c, a, b) !== B : minLow(c, a, b) !== B) { reject('B_NOT_EXTREME'); continue; }
    if (atr[a] === null) { reject('ATR_NULL'); continue; }
    push({ direction: e.direction, event: e, a, b, confirmedIndex: b + nExt, candles: b - a, atrA: atr[a], rangeAtr: Math.abs(B - A) / atr[a] });
  }
}
```

### 3.4 Граничные случаи (проверены на реальных свечах)
| Случай | Поведение | Реальный пример (фикстура, время UTC) |
|---|---|---|
| Начало импульса — не внешний swing | `A_NOT_SWING`, импульса нет | BTCUSDT 4h, BOS bull 2026-09-06 20:00: минимум на (09-05 16:00, 09-06 20:00] — 09-06 12:00 L 79125.3, это внутренний swing N=3, не внешний N=5 (FG-1) |
| Внешний бар на B перекрывает A | `A_NOT_EXTREME` | BTCUSDT 4h, BOS bear 2026-09-10 12:00: A = 79737.3 (09-09 08:00), свеча B 09-11 12:00 (H 79859.8, L 76000.3) выше A (FG-1) |
| Пробой сделала поздняя нога | `BREAK_AFTER_B` | BTCUSDT 4h, CHoCH bear 2026-10-24 12:00 (FG-1); SOLUSDT 15m, CHoCH bear 2026-07-15 19:45 (FG-7) |
| Фитиль за уровнем до закрытия; закрытие — на свече после B | импульс валиден (`k <= b + nExt`) | BTCUSDT 4h, BOS bear 2026-09-15 20:00: B = 09-15 16:00 L 74909.4 (фитиль за 76000.3), закрытие C 75599.9 на следующей свече (FG-2) |
| B — сама свеча пробоя | валиден | SOLUSDT 15m, BOS bear 2026-08-11 07:15: B = 07:15 (L 75.36, C 75.39 < 75.54) (FG-8) |
| Равные экстремумы | точка — более ранняя свеча (правило swing `ALGORITHMS.md` §2.3); ответ на поздней равной свече засчитывается (§5.5) | SOLUSDT 15m, 2026-08-10 20:30 / 21:00 / 21:30, H 76.47 (тройная вершина), A = 20:30 (FG-8) |
| Импульс с ценовым гэпом (`open != close` пред.) | не влияет: точки — по high/low | — (в крипто-фьючерсах гэпы цены редки) |
| Импульс с пропуском свечей (`gaps`) | генерация отбраковывает; терминал — последний непрерывный сегмент | — |
| Незакрытая свеча | отброшена `closedOnly`; не может быть A/B/C | — |
| Недостроенный импульс у правого края | B не подтверждён (`< nExt` закрытых свечей справа) -> не входит в `impulses`; если B — кандидат `pendingSwings` за уровнем, импульс в `pending` (терминал: `FIB_IMPULSE_UNCONFIRMED`) | — |
| Одна свеча — и swing high, и swing low | допустимо, A/B выбираются по типу | BTCUSDT 4h 2026-09-11 12:00 (ALGORITHMS GS-1) |
| Короткий импульс | ограничение `candles >= 5 = 2*toleranceCandles + 1`: при меньшей длине окна допуска ±2 для A и B пересекаются | BTCUSDT 4h BOS bear 09-15: 5 свечей — допустим (FG-2) |

### 3.5 Статистика (обоснование порогов)
Прогон по месячным архивам 2026-07..2026-10 (BTCUSDT 4h, ETHUSDT 4h, ETHUSDT 1h, SOLUSDT 1h, SOLUSDT 15m; N=5, структура считается на каждом месяце отдельно): 220 принятых импульсов; `rangeAtr`: `< 3` — 7, `3–4` — 21, `4–6` — 56, `>= 6` — 136. Отказы: `A_NOT_SWING` 52, `BREAK_AFTER_B` 19, `A_NOT_EXTREME` 1, `NO_B` 1. Пороги `rangeAtr` 6 / 4 / 3 по сложностям отбирают «очевидные» (62%), «нормальные» и «слабые» импульсы.

---

## 4. Параметры по сложностям (сводка)

| Параметр | easy | medium | hard | Терминал |
|---|---|---|---|---|
| `nExt` (импульс и структура) | 7 | 5 | 5 | 5 |
| `minRangeAtr` (`rangeAtr >=`) | 6 | 4 | 3 | — (любой) |
| `candles` (`b - a`) | 8–60 | 5–80 | 5–120 | >= 5 |
| `toleranceCandles` (A, B, C) | 2 | 2 | 2 | 2 |
| Допуск зоны уровня `levelTol` (в долях импульса) | 0.04 | 0.04 | 0.04 | — |
| Порог реакции | `max(1.5*ATR14[T], 0.236*|B-A|)` | то же | то же | — |
| Лимит проигрывания (свечей ТФ) | 15m 96, 1h 72, 4h 60, 1d 30 (`ALGORITHMS.md` §14.4) | то же | то же | — |
| «Построй сетку»: окно | `pad` 5–7 свечей до A (A и B — экстремумы окна); `directionHint` | `pad` 5–20, A и B — экстремумы окна | `pad` 20–60; ловушка обязательна (§5.1) | — |
| «Где реакция?»: эталонный класс | уровень 0.5 / 0.618 / 0.705 / 0.786, на нём ≥ 1 конфлюэнс | любой уровень 0.382–0.786 | уровень или `deep`; ловушка обязательна (§6.2) | — |
| «Где реакция?»: варианты | доступные уровни + `ote` | то же | + `deep` | — |
| «Где реакция?»: подсказки | линия EQ, заливка premium/discount, зона OTE | нет | нет | — |
| «Цель по Extension»: глубина C | `[0.5, 0.79]` | `[0.342, 0.826]` | `[0.342, 1)` | — |
| «Цель по Extension»: варианты | `1`, `1.272`, `1.618` | то же | + `none` | — |

Ослабление при неудачном поиске (как `ALGORITHMS.md` §13.1): до 200 попыток, затем критерий сложности ослабляется на ступень (hard -> medium -> easy) с сохранением `difficulty`, затем снимается балансировка ответа (§6.2, §7.2).

---

## 5. Задание «Построй сетку» (`fib-grid`)

### 5.1 Генерация
1. По `seed` выбирается кандидат `T0` (сетка 15m, данные старше 2 суток, видимая история 500 свечей, 1d — 365, ≥ 300 до окна; `ALGORITHMS.md` §13.1); `findImpulses(видимый ряд, nExt)`; кандидаты — импульсы, проходящие фильтры §4 по сложности.
2. `T` (последняя видимая закрытая свеча) = `confirmedIndex + u`, `u ∈ [0, 10]` по `seed`, при условиях на `(b, T]`: нет `high > B` (bull) / `low < B` (bear), нет закрытия за A, нет нового внешнего BOS/CHoCH. Так импульс в окне — последний и завершённый.
3. Окно задания `window = [a - pad, T]` (`pad` по §4). easy/medium: в окне A — крайний экстремум своей стороны и B — крайний своей; иначе кандидат отбраковывается.
4. **Ловушка hard** (хотя бы одна): (а) в окне до A есть экстремум за A (начало предыдущей ноги: тянуть от него — ошибка `previous-leg`); (б) в ноге `(a, b)` есть внутренний swing (N=2) противоположного типа — соблазн начать сетку с внутреннего HL/LH.
5. Инвариант: импульс, найденный на ряду `candles[0..T]`, совпадает с найденным на полном ряду (A, B и событие известны к `confirmedIndex <= T`; тест на golden FG-1).

### 5.2 Ответ и проверка
Пользователь тянет Fibonacci Retracement: `anchors[0]` — начало (уровень 1), `anchors[1]` — конец (уровень 0). Клиент притягивает якорь к high/low свечи (магнит), но сервер **пересчитывает снап сам**:
```ts
userDir = anchors[1].price > anchors[0].price ? 'bull' : anchors[1].price < anchors[0].price ? 'bear' : null;
i0 = idx(anchors[0].time); i1 = idx(anchors[1].time);
p0 = userDir === 'bull' ? low[i0] : high[i0];   p1 = userDir === 'bull' ? high[i1] : low[i1];
```
Проверка точки (A: `i0` против `a`, B: `i1` против `b`):
- `ok`, если `|i - ref.index| <= toleranceCandles`;
- **равный экстремум** (решение): `ok`, если снапнутая цена **точно равна** цене эталона и свеча лежит внутри ноги (`a < i0 < b` для A; `b < i1 <= T` для B) — сетка идентична, засчитывается с блоком `OK_FIB_EQUAL_EXTREME`;
- иначе — ошибка точки.
Классификация (ровно один исход):
| Ситуация | Результат | Код |
|---|---|---|
| `userDir === null` или `i0 >= i1` | 0 точек | `FIB_NOT_IMPULSE` (`legKind = 'other'`) |
| `userDir != ref.direction`, `|i0 - b| <= 2` и `|i1 - a| <= 2` (сетка протянута от B к A) | 0 точек | `FIB_WRONG_DIRECTION` |
| `userDir != ref.direction`, `|i0 - b| <= 2`, `i1 > b + 2` (сетка на коррекции после B) | 0 точек | `FIB_NOT_IMPULSE` (`legKind = 'correction'`) |
| `userDir != ref.direction`, иначе | 0 точек | `FIB_NOT_IMPULSE` (`legKind = 'other'`) |
| направление верно, обе точки `ok` | 2 точки | — (`OK_FIB_ANCHOR`) |
| направление верно, A не `ok`, B `ok` | 1 точка | `FIB_WRONG_ANCHOR_START` (`reason`, первое выполненное: `previous-leg`, если `i0 <= H.index`; `offset`, если `|i0 - a| <= 4`; `internal`, если `a < i0 < b`; иначе `offset`) |
| направление верно, A `ok`, B не `ok` | 1 точка | `FIB_WRONG_ANCHOR_END` (`reason`, первое выполненное: `offset`, если `|i1 - b| <= 4`; `short`, если `a < i1 < b`; иначе `offset`) |
| направление верно, обе не `ok` | 0 точек | `FIB_NOT_IMPULSE` (`legKind = 'previous-leg'`, если `max(i0,i1) < a`; `'correction'`, если `min(i0,i1) >= b - 2`; иначе `'other'`) |
Счёт: `score = points / 2`; `verdict`: `correct` — 2 точки, `partial` — 1, `incorrect` — 0. Отчётная величина `gridShift = max(|p0 - A|, |p1 - B|) / |B - A|` (сдвиг сетки в долях импульса, для `detail`).

### 5.3 Пример (FG-1, BTCUSDT 4h, BOS bull 2026-09-21 08:00)
Эталон A = 80095.9 (09-20 00:00), B = 87385.1 (09-21 20:00). Ответы: начало 09-20 04:00 (Δ+1), конец 09-21 20:00 -> `correct`; начало 09-15 16:00 (L 74909.4 — начало предыдущей ноги CHoCH) -> `FIB_WRONG_ANCHOR_START`, `reason = previous-leg`, `partial`; от 09-21 20:00 к 09-20 00:00 -> `FIB_WRONG_DIRECTION`; от 09-21 20:00 вниз к 09-24 08:00 (L 82832.0) -> `FIB_NOT_IMPULSE`, `legKind = correction`.

---

## 6. Задание «Где реакция?» (`fib-reaction`)

### 6.1 Момент задания и варианты
- Импульс — как в §5.1 (фильтры по сложности). `T = confirmedIndex` (самый ранний момент, когда импульс известен). Сетка эталона передаётся в payload (`author: 'algo'`).
- Уже пройденные зоны исключаются из вариантов: `dT = depth(экстремум коррекции на (b, T])`; уровень `L` доступен, если `dT < L - levelTol`; `ote` доступна, если `dT < 0.62`; `deep` (только hard) доступна всегда.
- Отбраковка: исход §6.3 (реакция, слом или продолжение) наступил на `(b, T]`; эталонный класс не входит в доступные варианты; класс `between`, `shallow`, `continuation`, `timeout` (неоднозначно или нет реакции в зонах); в будущем на лимит нет полного окна или есть пропуск.

### 6.2 Генерация с балансировкой ответа (решение)
По `seed` выбирается желаемый эталонный класс равновероятно из классов сложности (easy: `0.5/0.618/0.705/0.786`; medium: `0.382…0.786`; hard: `0.382…0.786` и `deep` с долей 30%), затем ищется импульс с таким исходом (до 200 попыток, затем ослабление §4). Обоснование: без балансировки распределение ответов отражает отбор (в данных 0.382 встречается в 4,5 раза чаще 0.786: 32 против 7, §6.3), и пользователь учится угадывать частый ответ вместо чтения графика.
**Ловушка hard** (хотя бы одна): эталон `deep`; или на доступном уровне, который **не** является эталонным, есть конфлюэнс (OB/FVG/уровень) — «ложная» зона интереса.

### 6.3 Определение реакции (решение) — `resolveReaction`
Обход свечей `j = b+1 … T+limit` (будущее — только на сервере); `m_j` — экстремум коррекции на `(b, j]` (для bull — минимальный `low`, при равенстве ранний), `thr = max(1.5 * ATR14[T], 0.236 * |B - A|)`:
```ts
for (let j = b + 1; j <= T + limit; j++) {
  updateExtreme(j);                                              // m, mIndex
  if (bull ? close[j] < A : close[j] > A)       return { kind: 'fail',         index: j };   // слом импульса закрытием за A
  if (bull ? close[j] >= m + thr : close[j] <= m - thr) return { kind: 'reaction', index: j };   // разворот подтверждён закрытием
  if (bull ? high[j] > B : low[j] < B)          return { kind: 'continuation', index: j };   // импульс обновлён без реакции
}
return { kind: 'timeout', index: T + limit };
```
Порядок проверок на одной свече: слом -> реакция -> продолжение (свеча, сделавшая новый экстремум и закрывшаяся с разворотом ≥ `thr`, — реакция). Внутри свечи порядок событий не нужен: все условия — по закрытию, кроме продолжения, которое проверяется последним. Drill-down на 1m не требуется.
Глубина реакции `r = depth(m)`; класс:
| Класс | Условие | Верные варианты |
|---|---|---|
| уровень `L ∈ {0.382, 0.5, 0.618, 0.705, 0.786}` | `kind = reaction`, `|r - L| <= 0.04` | `L`; плюс `ote`, если `0.62 <= r <= 0.79` |
| `deep` | `kind = reaction` и `r > 0.826` (включая фитиль за A: `r > 1` без закрытия за A), или `kind = fail` | `deep` |
| `between` | реакция вне всех зон (`0.422 < r < 0.46`, `0.54 < r < 0.578`, `0.658 < r < 0.665`, `0.745 < r < 0.746`) | — (задание не генерируется) |
| `shallow` | реакция при `r < 0.342` | — |
| `continuation`, `timeout` | — | — |
Зоны уровней при `levelTol = 0.04` не пересекаются (минимальный шаг уровней 0.081 между 0.705 и 0.786).

Обоснование выбора (сравнение на тех же 5 рядах × 4 месяца, импульсы `rangeAtr >= 3`, исход после T):
| Правило подтверждения | Исходов | В зонах 0.382–0.786 | deep/fail | shallow/continuation | between | timeout | Реакция до T (потеря кандидата) |
|---|---|---|---|---|---|---|---|
| `close >= m + 1.0·ATR` | 125 | 67 | 17 | 29 | 12 | 0 | 53 |
| `close >= m + 1.5·ATR` | 158 | 73 | 36 | 34 | 13 | 2 | 20 |
| `close >= m + 2.0·ATR` | 169 | 68 | 43 | 40 | 14 | 4 | 9 |
| **`close >= m + max(1.5·ATR, 0.236·|B−A|)`** | 162 | **78** | 38 | 31 | 13 | 2 | 16 |
- ATR-порог отсекает шумовые откаты; доля 0.236 размаха делает порог пропорциональным импульсу (на крупных 1d/4h-импульсах 1.5·ATR — микро-откат). Комбинация даёт максимум однозначных реакций в зонах.
- Альтернатива «BOS на младшем (внутреннем, N=2) слое» отклонена: внутренний swing high N=2 подтверждается уже через 2 свечи, и его пробой фиксирует «реакцией» почти любой микро-откат коррекции, не зависящий от размера импульса; кроме того, правило требует состояния внутренней машины на коррекции, а порог по закрытию проверяется вручную одной формулой.
- Альтернатива «реакция = минимум коррекции до закрытия за B» отклонена: в предварительном прогоне около четверти исходов не разрешались в лимит (timeout).

### 6.4 Вопрос Premium/Discount
Проба — `close[T]` (текущая цена). Ожидаемый ответ — `pdZone(close[T])` (§2.3); при `|depth(close[T]) - 0.5| < 0.02` вопрос не задаётся. Формулировка: «Цена сейчас ({price}) в premium или discount диапазона импульса?». На easy EQ и заливка видны (подсказка), вопрос всё равно задаётся (закрепление).

### 6.5 Конфлюэнс (через SMC-движок, только данные до T)
Полоса выбранного варианта: уровень `L` — цены `[levelPrice(L - 0.04), levelPrice(L + 0.04)]` (упорядочить по возрастанию); `ote` — `[levelPrice(0.62), levelPrice(0.79)]`; для `deep` конфлюэнс не оценивается. Факторы считаются по `candles[0..T]` (`analyzeStructure` с `nExt` задания):
| Фактор (`FibConfluenceKey`) | Есть, если |
|---|---|
| `order-block` | внешний OB направления импульса (`ALGORITHMS.md` §7), `valid = true`, статус на T не `invalidated`, `[bottom, top]` пересекает полосу |
| `fvg` | FVG направления импульса (§8, `size >= 0.5·ATR`), статус на T не `filled`, `[bottom, top]` пересекает полосу |
| `level` | внешний swing (`nExt`, подтверждён к T) с `index < a` и `index >= n - 300`, цена которого лежит в полосе (старый high/low структуры, в т.ч. пробитый уровень `E.level`) |
**(решение)** Фактор «уровень» — не `findLevels` (`ALGORITHMS.md` §10): на 15m ширина полосы уровня (0.08 импульса ≈ 0.15–0.25% цены) меньше допуска ±0.3%, и `findLevels` давал «уровень» почти на каждой полосе (SOLUSDT 15m 2026-07-20: 6 из 6 полос). Внешний swing на полосе — проверяемый и редкий факт.
Конфлюэнс — необязательная часть ответа: оцениваются только **заявленные** факторы (заявлен, а нет — `FIB_CONFLUENCE_WRONG`); незаявленные существующие факторы не являются ошибкой, но показываются в `reference` и в разборе как часть эталона.

### 6.6 Оценка
- `levelScore`: 1 — выбранный вариант в множестве верных (§6.3); 0.5 — соседний: вариант-уровень соседний с эталонным классом в упорядоченном ряду `0.382, 0.5, 0.618, 0.705, 0.786, deep`, или `ote` при `r ∈ [0.578, 0.62) ∪ (0.79, 0.826]`; иначе 0.
- `pdScore`: 1/0 (если вопрос задан); `confScore = верных заявленных / заявленных` (если заявлен ≥ 1 фактор).
- `score = Σ w·s / Σ w` по присутствующим частям с весами `level 0.6`, `pd 0.2`, `confluence 0.2` (пропущенный конфлюэнс не штрафуется и не добавляет балл).
- `verdict`: `correct` — `levelScore = 1`, PD верно или не задан, нет `FIB_CONFLUENCE_WRONG`; `partial` — `score >= 0.5`; иначе `incorrect`.
- Ошибки: эталон — уровень, ответ не верен -> `FIB_LEVEL_MISS` (`severity`: `minor` при `levelScore = 0.5`, иначе `major`); эталон `deep`, выбран уровень -> `FIB_DEEP_MISSED` (major); неверный PD -> `FIB_PD_WRONG` (major); каждый неверно заявленный фактор -> `FIB_CONFLUENCE_WRONG` (minor).

### 6.7 Проигрывание
`replay = { tf, candles: свечи (T, min(outcome.index + 10, T + limit)], exitIndex: индекс свечи исхода в replay }`. Хвост 10 свечей показывает развитие после подтверждения. Лимиты — `ALGORITHMS.md` §14.4 (от T, по ТФ задания).

---

## 7. Задание «Цель по Extension» (`fib-extension`)

### 7.1 Момент задания и точка C
- Импульс — по §5.1; исход `resolveReaction` от `T0 = confirmedIndex` должен быть `kind = 'reaction'` после `T0`; `C = m` (экстремум коррекции), `c = mIndex`, `j` — свеча подтверждения.
- `Te` (последняя видимая свеча) `= max(j, c + 2)`; условия: на `(c, Te]` нет нового экстремума за C; на `(b, Te)` нет выхода за B (свеча `Te` может выйти за B — реакция и продолжение одной свечой); `depth(C) < 1` (C не за A; иначе геометрия A–B–C невалидна).
- Глубина C — по сложности (§4).
- Окно задания `[a - pad, Te]` (`pad` как в «Построй сетку»).

### 7.2 Исход — `resolveExtension` (решение)
Обход `q = Te+1 … Te+limit`:
```ts
for (let q = Te + 1; q <= Te + limit; q++) {
  extreme = bull ? max(extreme, high[q]) : min(extreme, low[q]);     // экстремум свечи учитывается и на свече инвалидации
  if (bull ? close[q] < C : close[q] > C) { invalidationIndex = q; break; }
}
reached = максимальный x из [1, 1.272, 1.618] с extReached(x), иначе 'none';  xMax = (extreme - C) / (B - A)
```
- Инвалидация — **закрытие** за C (как BOS/CHoCH по телу); экстремум свечи инвалидации засчитывается: high свечи (bull) достигнут до её закрытия, порядок внутри свечи не нужен.
- Лимит — как Challenge (`ALGORITHMS.md` §14.4). Проверено: удвоение лимита меняет распределение `reached` незначительно (`none` 77 -> 73 из 105 в предварительном прогоне).
- Распределение на тех же данных (117 кандидатов, `depth(C) < 1`): `none` 77, `1.0` 7, `1.272` 11, `1.618` 22. Поэтому генерация балансируется по `reached` (как §6.2), а `none` — вариант только hard (доля 25%).

### 7.3 Ответ и проверка
Пользователь строит Extension: `anchors = [A, B, C]`. Направление пользователя — по `anchors[1].price` против `anchors[0].price`; снап: A и B — как §5.2, C — `low` (bull) / `high` (bear) свечи `idx(anchors[2].time)`. Каждая точка `ok` при `|i - ref| <= 2` или равном экстремуме (A: внутри `(a, b)`; B: внутри `(b, Te]`; C: внутри `(c, Te]`).
- Направление неверно -> `EXT_WRONG_DIRECTION` (major), все точки не `ok`.
- Иначе каждая не `ok` точка -> `EXT_WRONG_POINTS` с `params.point` (`A`/`B` — навык `fib-anchor`, `C` — `fib-extension`; major).
- Цель оценивается по **эталонной** сетке (ошибка точек отражена отдельно): порядок `none < 1 < 1.272 < 1.618`; `targetScore` = 1 при совпадении с `reached`; ниже `reached` на 1 ступень — 0.5, на ≥ 2 — 0.25 (`EXT_TARGET_CONSERVATIVE`, minor); выше `reached` — 0 (`EXT_TARGET_MISS`, major).
- `score = 0.5 * okPoints / 3 + 0.5 * targetScore`; `verdict`: `correct` — 3 точки и `targetScore = 1`; `partial` — `score >= 0.5`; иначе `incorrect`.
- `replay = { tf, candles: (Te, invalidationIndex ?? Te + limit], exitIndex }`.

---

## 8. Свободный терминал (предложение)

- Инструменты `fib-retracement` (2 якоря) и `fib-extension` (3 якоря) в панели разметки (FR-TERM-03, FR-DRAW-17); отрисовка уровней §2, зона OTE, линия EQ, переключатель заливки premium/discount; для extension — 1.0/1.272/1.618 и пунктиром 2.0.
- «Проверить мою разметку» дополнительно проверяет сетки (**проверка «сетка по реальному импульсу?»**, без будущего и без прогресса, как MVP-проверка терминала):
```ts
function checkFibMarks(candles: Candle[], tf: Timeframe, marks: Mark[]): { results: FibMarkCheck[]; feedback: Feedback };
interface FibMarkCheck { markId: string; impulse: Impulse | null; detail: FibDetail; errors: GradeError[] }
```
  `findImpulses(closedOnly(candles), { nExt: 5 })`; для каждой сетки эталон — импульс (включая `pending`) того же направления пользователя с минимальным `|i0 - a| + |i1 - b|` (при равенстве — с более поздним B); если минимум > 10 свечей — `FIB_NOT_IMPULSE` (`legKind = 'other'`); иначе проверка §5.2; конец на `pending` B — `FIB_IMPULSE_UNCONFIRMED` (minor) вместо ошибки точки. Для extension — A, B как выше, C — экстремум на `(b, min(iC + 2, n - 1)]`; цель не оценивается.
- Отказ от варианта «только разметка без проверки»: проверка дешёвая (тот же `findImpulses`) и закрывает главный навык модуля (`fib-anchor`) на живом рынке.

---

## 9. Контракты API (расширение `API_CONTRACTS.md`)

### 9.1 Типы
```ts
type ModuleId = 'market-structure' | 'price-action' | 'challenge' | 'fibonacci';        // (новое)
type SkillId = /* … существующие … */ | 'fib-anchor' | 'fib-reaction' | 'fib-extension' | 'premium-discount';   // (новое)
type MarkKind = /* … существующие … */ | 'fib-retracement' | 'fib-extension';          // (новое)
type FibReactionOption = '0.382' | '0.5' | '0.618' | '0.705' | '0.786' | 'ote' | 'deep';
type FibConfluenceKey = 'order-block' | 'fvg' | 'level';
type FibTarget = '1' | '1.272' | '1.618' | 'none';
```
Mark-типы сетки:
| `kind` | `anchors` | `direction` | `scope` | `meta` (эталон, `author: 'algo'`) |
|---|---|---|---|---|
| `fib-retracement` | 2: `[начало (уровень 1), конец (уровень 0)]` | `bull`/`bear` | null | `{ levels: {ratio, price}[], ote: {from, to}, eq, eventKind, eventTime }` |
| `fib-extension` | 3: `[A, B, C]` | `bull`/`bear` | null | `{ targets: {ratio, price}[], info: {ratio: 2, price} }` |
У меток пользователя `meta` не требуется; `direction` сервер вычисляет сам (§5.2). Идентификатор эталона: `algo:fib-retracement:-:<dir>:<a.time>` / `algo:fib-extension:-:<dir>:<a.time>`.

### 9.2 `POST /api/tasks/fibonacci/next`
```ts
type NextRequest = /* … */ | (NextBase & { module: 'fibonacci'; taskType: 'grid' | 'reaction' | 'extension'; tf: TaskTimeframe });
type TaskPayload = /* … */ | FibGridTask | FibReactionTask | FibExtensionTask;

interface FibGridTask {
  kind: 'fib-grid'; tf: TaskTimeframe;
  window: { fromTime: UtcMs; toTime: UtcMs };    // где искать импульс
  directionHint: FibDirection | null;           // только easy
  toleranceCandles: number;                     // 2
  tools: ['fib-retracement'];
}
interface FibReactionTask {
  kind: 'fib-reaction'; tf: TaskTimeframe;
  grid: Mark;                                   // эталонная сетка (author 'algo', kind 'fib-retracement')
  options: FibReactionOption[];                 // только доступные (§6.1)
  confluenceOptions: FibConfluenceKey[];        // всегда все три
  pdQuestion: { price: number } | null;         // close[T]; null, если |depth-0.5| < 0.02
  limitCandles: number;
  hints?: Mark[];                               // easy: EQ (kind 'hline', meta.role 'eq'), OTE и premium/discount (meta.role)
}
interface FibExtensionTask {
  kind: 'fib-extension'; tf: TaskTimeframe;
  window: { fromTime: UtcMs; toTime: UtcMs };
  directionHint: FibDirection | null;           // только easy
  targetOptions: FibTarget[];                   // ['1','1.272','1.618'] (+ 'none' на hard)
  limitCandles: number;
  tools: ['fib-extension'];
}
```
- `series`: только запрошенный `tf`, закрытые свечи до T (500, для 1d — 365).
- `timeline.mode`: `fib-grid` — `absolute`; `fib-reaction`, `fib-extension` — **`relative`** (дата скрыта, как Challenge: будущее проигрывается, по дате его можно подсмотреть) **(решение, вопрос)**.
- Токен: `sealed.params = { fibAlgoVersion, taskType, nExt, a: {time}, b: {time}, c?: {time}, options, targetOptions, pdAsked, window }` — сервер при `grade` пересчитывает импульс и сверяет с запечатанными точками (рассогласование — 500 + лог, не оценка).

### 9.3 `POST /api/tasks/fibonacci/grade`
```ts
type Answer = /* … */ | FibGridAnswer | FibReactionAnswer | FibExtensionAnswer;
interface FibGridAnswer      { kind: 'fib-grid'; mark: Mark }            // kind 'fib-retracement', author 'user', anchors 2
interface FibReactionAnswer  { kind: 'fib-reaction'; option: FibReactionOption; confluence: FibConfluenceKey[]; pd: 'premium' | 'discount' | null }
interface FibExtensionAnswer { kind: 'fib-extension'; mark: Mark; target: FibTarget }   // kind 'fib-extension', anchors 3
```
zod-правила и 400 (validation issue, попытка не оценивается) **(новое)**: `FIB_ANCHORS_COUNT` (не 2 / не 3 якоря или не тот `kind`), `FIB_ANCHOR_OUT_OF_RANGE` (время якоря вне видимого ряда), `FIB_OPTION_UNAVAILABLE` (вариант не из `options`/`targetOptions`), `FIB_CONFLUENCE_INVALID` (дубликаты, > 3, или конфлюэнс при `option = 'deep'`), `FIB_PD_MISMATCH` (`pd` задан при `pdQuestion = null` или пропущен при заданном вопросе).

Ответ — `GradeResult` (`API_CONTRACTS.md` §5.1) с `module: 'fibonacci'`:
```ts
type ModuleDetail = /* … */ | { kind: 'fib-grid' | 'fib-reaction' | 'fib-extension'; fib: FibDetail };
interface FibAnchorCheck {
  point: 'A' | 'B' | 'C';
  userTime: UtcMs; snappedPrice: number; offsetCandles: number;     // со знаком: user - ref
  refTime: UtcMs; refPrice: number;
  ok: boolean; equalExtreme: boolean;
}
interface FibDetail {
  direction: { user: FibDirection | null; ref: FibDirection };
  anchors: FibAnchorCheck[];                                       // всегда 2 (grid) или 3 (extension), в т.ч. при ошибке направления (ok = false)
  gridShift: number | null;                                        // §5.2
  reaction?: {
    option: FibReactionOption; correctOptions: FibReactionOption[]; levelScore: number;
    outcome: { kind: 'reaction' | 'fail'; time: UtcMs; extremeTime: UtcMs; extremePrice: number; depth: number; threshold: number };
    pd: { asked: boolean; given: 'premium' | 'discount' | null; expected: 'premium' | 'discount' | null; price: number | null; eq: number };
    confluence: { claimed: FibConfluenceKey[]; atChosen: Record<FibConfluenceKey, boolean>; atReference: Record<FibConfluenceKey, boolean> };
  };
  extension?: { target: FibTarget; reached: FibTarget; xMax: number; extremePrice: number; extremeTime: UtcMs; invalidationTime: UtcMs | null; endTime: UtcMs };
}
```
- `reference`: эталонная сетка; для `fib-reaction` также `level` (`meta.role = 'fib-reaction'`, цена C) и OB/FVG/swing эталонной зоны; для `fib-extension` — сетка A–B–C.
- `replay`: тип `ChallengeReplay` используется и для `fibonacci` (предложено переименовать в `TaskReplay`, §14).
- `score` и `verdict` — по §5.2, §6.6, §7.3.

---

## 10. Навыки и прогресс

| Задание | `skillOutcomes` |
|---|---|
| `fib-grid` | `fib-anchor`: `correct = points`, `total = 2` |
| `fib-reaction` | `fib-reaction`: `correct = (levelScore == 1 ? 1 : 0) + верных заявленных факторов`, `total = 1 + заявленных`; `premium-discount`: `1/1` или `0/1`, только если вопрос задан |
| `fib-extension` | `fib-anchor`: `correct = okA + okB`, `total = 2`; `fib-extension`: `correct = okC + (targetScore == 1 ? 1 : 0)`, `total = 2` |
Исход навыка в попытке — `ok = correct / total >= 0.8` (`ALGORITHMS.md` §16.2). Адаптивная подборка (`ALGORITHMS.md` §16.3, расширение): `fib-anchor` -> `fib-grid` (50%) или `fib-extension` (50%); `fib-reaction`, `premium-discount` -> `fib-reaction`; `fib-extension` -> `fib-extension`.

---

## 11. Коды и шаблоны разбора (источник `src/i18n/ru/feedback`)

### 11.1 Общие блоки
- Верность — существующие `feedback.verdict.plain.<verdict>` («Верно: оценка {score}%.» и т.д.), `{score} = round(score*100)`.
- Принцип без ошибок — `feedback.principle.fibonacci` **(новое)**: «Fibonacci — линейка для импульса, а не сигнал: уровни работают вместе со структурой, зоной интереса и premium/discount.»
- Форматирование параметров: `{time}`-параметры — локальное время UI; цены — с точностью тика; `{depth}`, `{xMax}` — 3 знака; `{given}`/`{expected}`-варианты — подписи `0.382 … 0.786`, «OTE (0.62–0.79)», «глубже 0.786», цели «1.0 / 1.272 / 1.618», «не будет достигнута ни одна». Словари текстовых параметров (`{dirText}`, `{legText}`, `{reasonText}`, `{pointRule}`, `{factorName}`, `{factorRule}`, `{endText}`, `{sideName}`, `{confText}`) — фиксированные строки i18n по значению кода, перечислены в §11.4; ни один шаблон не содержит условного текста, все плейсхолдеры заполняются всегда.

### 11.2 Что понято верно (`OkCode`, новые)
| Ключ | Текст | Параметры |
|---|---|---|
| `OK_FIB_ANCHOR` | Сетка построена по импульсу верно: начало {startTime}, конец {endTime} (допуск ±{tol} свечей). | startTime, endTime, tol |
| `OK_FIB_EQUAL_EXTREME` | Точка {point} стоит на равном экстремуме {userTime}: цена {price} совпадает с эталоном {refTime}, сетка та же. | point, userTime, price, refTime |
| `OK_FIB_REACTION` | Реакция от {given} определена верно: коррекция остановилась на {cPrice} ({depth} импульса). | given, cPrice, depth |
| `OK_FIB_CONFLUENCE` | Конфлюэнс на выбранном уровне указан верно: {factors}. | factors |
| `OK_PD` | Premium/Discount определён верно: цена {price} в {expected}, equilibrium {eq}. | price, expected, eq |
| `OK_EXT_POINTS` | Точки A–B–C extension поставлены верно. | — |
| `OK_EXT_TARGET` | Цель {target} выбрана верно: максимум движения {maxPrice} ({xMax} от AB). | target, maxPrice, xMax |

### 11.3 Ошибки (части 3–6)
| Код | Навык | Severity | Ошибка (3) | Почему (4) | Как правильно (5) | Принцип (6) |
|---|---|---|---|---|---|---|
| `FIB_WRONG_DIRECTION` | fib-anchor | major | Сетка протянута {givenDir}, а импульс направлен {expectedDir}. | Retracement тянут от начала импульса к его концу: тогда уровень 0 стоит на конце импульса, а уровни коррекции — между концом и началом. | Начните с {refStartTime} ({refStartPrice}) и протяните сетку к {refEndTime} ({refEndPrice}). | Направление сетки — это направление импульса; перевёрнутая сетка показывает уровни не там, где ждать коррекцию. |
| `FIB_NOT_IMPULSE` | fib-anchor | major | Сетка построена на {legText} ({userStartTime} – {userEndTime}), а не на импульсе. | Импульс задания — нога, сломавшая структуру ({eventKind} на {eventTime}): от {refStartTime} ({refStartPrice}) до {refEndTime} ({refEndPrice}). | Найдите последний BOS или CHoCH и протяните сетку от защищённого экстремума ноги пробоя до её конца. | Fibonacci измеряет откат импульса; сетка на коррекции или шуме даёт случайные уровни. |
| `FIB_WRONG_ANCHOR_START` | fib-anchor | major | Начало сетки на {userTime} ({userPrice}), а импульс начинается на {refTime} ({refPrice}): смещение {offset} свечей при допуске ±{tol}. | {reasonText} Начало импульса — крайний {sideName} между пробитым swing ({brokenTime}) и свечой пробоя ({eventTime}); это защищённый уровень тренда. | Перенесите первую точку на свечу {refTime}: магнит привяжет её к {sideName} {refPrice}. | Сетка от защищённого swing задаёт dealing range, от которого считаются premium и discount. |
| `FIB_WRONG_ANCHOR_END` | fib-anchor | major | Конец сетки на {userTime} ({userPrice}), а импульс заканчивается на {refTime} ({refPrice}): смещение {offset} свечей при допуске ±{tol}. | {reasonText} Конец импульса — первый подтверждённый внешний swing за пробитым уровнем {level}; после него началась коррекция. | Поставьте вторую точку на {refTime}: это уровень 0 сетки ({refPrice}). | Уровни отката считаются от фактического экстремума; недотянутая сетка сдвигает все уровни. |
| `FIB_IMPULSE_UNCONFIRMED` | fib-anchor | minor | Конец сетки на {userTime} ещё не подтверждён как swing. | Справа от свечи меньше {n} закрытых свечей: импульс может продолжиться и сдвинуть уровень 0. | Дождитесь {n} закрытых свечей справа от экстремума и при обновлении экстремума перетяните сетку. | Сетку строят по завершённому импульсу. |
| `FIB_LEVEL_MISS` | fib-reaction | major / minor | Выбран {given}, а реакция была от {expected}: коррекция дошла до {cPrice} ({depth} импульса) на {cTime}. | Реакция — первый разворот коррекции не меньше {thr} по закрытию (порог: {thrText}); разворот подтвердила свеча {reactionTime}. Конфлюэнс в зоне реакции: {confText}. | Перед выбором уровня проверьте, где уровень совпадает с OB, FVG или старым swing, и не выбирайте зону, которую цена уже прошла. | Fibonacci показывает, где ждать реакцию; подтверждают её зона интереса и разворот. |
| `FIB_DEEP_MISSED` | fib-reaction | major | Выбран {given}, но ни один уровень 0.382–0.786 не остановил коррекцию: экстремум {cPrice} ({depth} импульса) на {cTime}. | {endText} Уровни без зоны интереса не удержали цену. | Проверьте, есть ли под уровнями ликвидность (равные экстремумы, начало импульса): её часто снимают перед разворотом или сломом. | Уровень без зоны интереса — не поддержка и не сопротивление. |
| `FIB_CONFLUENCE_WRONG` | fib-reaction | minor | Указан конфлюэнс «{factorName}» на {given}, но в зоне [{low}–{high}] его нет. | {factorRule} | Проверяйте конфлюэнс по правилам SMC-движка: OB — валидный и не инвалидированный, FVG — незаполненный, уровень — старый внешний swing в зоне. | Конфлюэнс усиливает уровень, только если он есть на графике. |
| `FIB_PD_WRONG` | premium-discount | major | Цена {price} отнесена к {given}, а она в {expected}. | Equilibrium диапазона импульса — {eq} (уровень 0.5): выше — premium, ниже — discount. | Сравните цену с уровнем 0.5 сетки: лонги ищут в discount, шорты — в premium. | Smart money покупает в discount и продаёт в premium. |
| `EXT_WRONG_DIRECTION` | fib-anchor | major | Extension построен {givenDir}, а импульс направлен {expectedDir}. | Точка A — начало импульса, B — его конец; цели extension лежат за B по направлению импульса. | Поставьте A на {refATime} ({refAPrice}), B на {refBTime} ({refBPrice}), C на {refCTime} ({refCPrice}). | Extension проецирует импульс в его же сторону. |
| `EXT_WRONG_POINTS` | fib-anchor (A, B) / fib-extension (C) | major | Точка {point} на {userTime} ({userPrice}), эталон — {refTime} ({refPrice}): смещение {offset} свечей при допуске ±{tol}. | {pointRule} | Поставьте точку {point} на свечу {refTime}: магнит привяжет её к {sideName} {refPrice}. | Extension проецирует длину AB от конца коррекции C; ошибка любой точки сдвигает все цели. |
| `EXT_TARGET_MISS` | fib-extension | major | Цель {target} ({targetPrice}) не достигнута: максимум движения {maxPrice} ({xMax} от AB) на {maxTime}. | Движение закончилось {endText} {endTime}; максимально достигнутый уровень — {reached}. | Если после C нет BOS по направлению импульса или на пути есть встречная зона интереса, выбирайте ближнюю цель. | Цель — там, куда рынок вероятно дойдёт, а не там, где больше прибыль. |
| `EXT_TARGET_CONSERVATIVE` | fib-extension | minor | Цель {target} достигнута, но рынок дошёл дальше — до {reached} ({maxPrice}). | После C импульс продолжился с силой не меньше AB, уровень {reached} достигнут до инвалидации. | Когда после C есть BOS по направлению импульса и нет встречной зоны, держите часть позиции до следующего уровня extension. | Частичная фиксация с переносом цели забирает продолжение тренда. |
Validation-коды `FIB_ANCHORS_COUNT`, `FIB_ANCHOR_OUT_OF_RANGE`, `FIB_OPTION_UNAVAILABLE`, `FIB_CONFLUENCE_INVALID`, `FIB_PD_MISMATCH` — сообщения 400 (FR-FB-09), в разбор не попадают.

### 11.4 Словари текстовых параметров
| Параметр | Значения |
|---|---|
| `givenDir` / `expectedDir` | `bull` — «вверх (от swing low к swing high)»; `bear` — «вниз (от swing high к swing low)»; `null` — «горизонтально (точки на одной цене)» |
| `legText` (`legKind`) | `correction` — «коррекции после импульса»; `previous-leg` — «предыдущей ноге»; `other` — «участке, который не является импульсом задания» |
| `reasonText` (START) | `previous-leg` — «Точка стоит на начале предыдущей ноги, до пробитого swing.»; `internal` — «Точка стоит на внутреннем откате внутри импульса.»; `offset` — «Точка стоит рядом, но не на экстремальной свече.» |
| `reasonText` (END) | `short` — «Сетка не дотянута до конца импульса.»; `offset` — «Точка стоит рядом, но не на экстремальной свече.» |
| `sideName` | для A и C bull, B bear — «low»; для A и C bear, B bull — «high» |
| `thrText` | «1.5 × ATR14» или «0.236 размаха импульса» — то слагаемое `max`, которое больше |
| `confText` | перечень найденных факторов через запятую («Order Block, FVG, старый swing») или «нет» |
| `endText` (`FIB_DEEP_MISSED`) | `reaction` — «Цена развернулась только за 0.786.»; `fail` — «Импульс сломан: свеча закрылась за началом импульса.» |
| `endText` (`EXT_TARGET_MISS`) | `invalidation` — «закрытием за точкой C на свече»; `limit` — «по лимиту времени на свече» |
| `pointRule` | `A` — «A — начало импульса, защищённый экстремум ноги, сломавшей структуру.»; `B` — «B — конец импульса, первый подтверждённый swing за пробитым уровнем.»; `C` — «C — экстремум коррекции между B и текущей свечой, от которого цена развернулась.» |
| `factorName` / `factorRule` | `order-block` — «Order Block» / «Учитывается только валидный OB направления импульса (с displacement), не инвалидированный к текущей свече и перекрывающий зону уровня.»; `fvg` — «FVG» / «Учитывается только FVG направления импульса не меньше 0.5 ATR, не заполненный к текущей свече и перекрывающий зону уровня.»; `level` — «уровень» / «Учитывается только старый внешний swing до начала импульса, цена которого лежит в зоне уровня.» |

---

## 12. Golden-участки

### 12.1 Формат и процесс
Файлы `fixtures/golden/fib_FG-<n>.<символ>-<tf>-<период>.<суть>.golden.json` (текущая практика каталога `fixtures/golden/`), поля как `ALGORITHMS.md` §18.1: `algoVersion: "1.0.0"` (`FIB_ALGO_VERSION`), `author: "technical-analyst"`, `date: "2026-11-04"`, `source` (пути CSV + sha256), `function` (`findImpulses` / `resolveReaction` / `resolveExtension` / `gradeFib*`), `params`, `expected`, `rationale`. Создаются после утверждения спецификации (как в `ALGORITHMS.md`). Ряд для `findImpulses` — ровно перечисленные файлы, структура считается с первой свечи набора. Время — UTC, `openTime` свечи. «T» — последняя видимая закрытая свеча (`decisionTime = openTime(T) + шаг ТФ`). Значения уровней — до 4 знаков (тест сравнивает с точностью `1e-9` относительно формулы §2).

Фикстуры (sha256 CSV сверены; zip сверены с `.CHECKSUM`):
| Файл | Есть в репозитории | sha256 CSV |
|---|---|---|
| `fixtures/klines/BTCUSDT/4h/BTCUSDT-4h-2026-09.csv` | да | `83ab0cd5a285a747946fcc17684ecafe368a6d982f000f1890e76136e8b3b92a` |
| `fixtures/klines/BTCUSDT/4h/BTCUSDT-4h-2026-10.csv` | **нет** (monthly) | `ee01e880f96134d085c4b669abf4796467e5bd54356ff568fdab36dd084a695e` |
| `fixtures/klines/ETHUSDT/1h/ETHUSDT-1h-2026-10.csv` | **нет** (monthly) | `1043120d4704071add0bb0b541d6288867d73942be59d76bf57bb6e90e69ea34` |
| `fixtures/klines/ETHUSDT/4h/ETHUSDT-4h-2026-09.csv` | **нет** (monthly) | `23775ef5e2b2ad47d88370a8f8e222ccf1f1c0e3f605daae9f3fb031855ff2be` |
| `fixtures/klines/SOLUSDT/15m/SOLUSDT-15m-2026-07-15.csv`, `-16`, `-17` | **нет** (daily) | `b7c725b10227c003e93639f4465df3f5f653fd4f1a31844db4d44e2d30ef2863`, `dd1cb353092feed72d7222b867b2045e63a66bfdfd3b51e16430e30a958d319f`, `c245e7e337baafd96d2c5efbd7db467fcb717bb7304ee66cdbad1189f9e4e38d` |
| `fixtures/klines/SOLUSDT/15m/SOLUSDT-15m-2026-07-19.csv`, `-20`, `-21` | **нет** (daily) | `d13b94a03ec4a0c57f766609f35ceebef1ba1ba5a7b66bc40cc4fec90d9024c6`, `95bebca9c5ce9e35d4a6a05c6ddfdb94a0c4c810be2b98e3928e3a603bbb9214`, `723ba4374e910a944749c48c04903b406a5256157f0ff57dafc7b51648649327` |
| `fixtures/klines/SOLUSDT/15m/SOLUSDT-15m-2026-08-09.csv` | да | `b8910898cd24ec8b4c21c905db4fef6ca410dccd5fd6368a20fa4d99ee7ec98f` |
| `fixtures/klines/SOLUSDT/15m/SOLUSDT-15m-2026-08-10.csv`, `-11`, `-12` | **нет** (daily) | `2c81134720cdc45036404c031fcb2bd0c264cc47804a77f0a1cd8a6a26685080`, `a6d5f4ab27b4df65636df27a5246bb5b8ef8d533b0aa7b32b7d9cbc86329eaa5`, `ee09034aa5ff140e412f112fc9d574979d0e1f1e6eeb80c1f2fb68e1a7cedb04` |
URL: `https://data.binance.vision/data/futures/um/{monthly|daily}/klines/<SYMBOL>/<tf>/<имя>.zip`.

### 12.2 Участки
**FG-1. BTCUSDT 4h, импульс вверх, реакция 0.618 / OTE, extension не достигнут; отказы** — файлы `BTCUSDT-4h-2026-09.csv` + `BTCUSDT-4h-2026-10.csv` (360 свечей), `nExt = 5`.
- `findImpulses`, принятый импульс: BOS bull 09-21 08:00 (C 84849.9 > 81933.9, swing 09-19 12:00); **A = 80095.9** (09-20 00:00: O 81225.7 H 81295.0 L 80095.9 C 80467.8 — минимум на (09-19 12:00, 09-21 08:00], внешний swing, защищённый low GS-1); **B = 87385.1** (09-21 20:00: H 87385.1 — первый внешний swing high выше 81933.9); 11 свечей; ATR14[A] = 911.8500; `rangeAtr` = 7.994.
- Отказы на этом наборе: BOS bull 09-06 20:00 — `A_NOT_SWING` (09-06 12:00 L 79125.3 — внутренний swing); BOS bear 09-10 12:00 — `A_NOT_EXTREME` (свеча 09-11 12:00 H 79859.8 > A 79737.3); CHoCH bear 10-24 12:00 — `BREAK_AFTER_B`.
- Принятый, но не годный для «Где реакция?»: CHoCH bull 09-18 12:00, A = 74909.4 (09-15 16:00), B = 81933.9 (09-19 12:00), 23 свечи, `rangeAtr` 6.907; T = 09-20 08:00; исход `continuation` на 09-21 00:00 (H 82099.9 > B) при экстремуме 80095.9 (глубина 0.2617, `shallow`) — отбраковка. Для «Построй сетку» годен.
- «Где реакция?» (medium, T = `confirmedIndex` = 09-22 16:00, close 86146.1): экстремум коррекции к T 85080.0 (`dT` = 0.3162) -> доступны все уровни и OTE. Уровни: 0.382 = 84600.6256, 0.5 = 83740.5000, 0.618 = 82880.3744, 0.705 = 82246.2140, 0.786 = 81655.7888; OTE 81626.6320–82865.7960. ATR14[T] = 1188.1429; `thr = max(1782.2143, 1720.2512) = 1782.2143`. PD: `depth(86146.1)` = 0.1700 -> **premium** (EQ 83740.5). Конфлюэнс на T: FVG bull (середина 09-21 08:00) [81857.1–84724.9] `open` пересекает полосы всех уровней; OB — нет; старый swing: 82282.8 (09-03 20:00) в полосе 0.705, 81933.9 (09-19 12:00) в полосе 0.786. **Исход:** реакция на 09-27 04:00 (C 84751.2 >= 82832.0 + 1782.2143 = 84614.2143), экстремум **C = 82832.0** (09-24 08:00: O 84468.0 H 84584.6 L 82832.0 C 83451.1), глубина **0.6246** -> верные варианты `0.618`, `ote`. Конфлюэнс у выбранного `0.618` [82588.8064–83171.9424]: `fvg` — да, `order-block` — нет, `level` — нет.
- easy-вариант (`nExt = 7`): тот же импульс, T = 09-23 00:00 (close 86664.0, PD premium, `depth` 0.0989), тот же исход; годен для easy (`rangeAtr >= 6`, 11 свечей, класс 0.618 с FVG-конфлюэнсом).
- «Цель по Extension» (hard: `none`): Te = 09-27 04:00; цели 1.0 = 90121.2000, 1.272 = 92103.8624, 1.618 = 94625.9256, (2.0 = 97410.4000); максимум 87249.6 (10-02 12:00), `xMax` = 0.6060, инвалидации (закрытие < 82832.0) нет до конца лимита 10-07 04:00 -> **reached = none**.
- Ответы «Построй сетку»: см. §5.3.

**FG-2. BTCUSDT 4h, импульсы вниз: зона пройдена до T; extension 1.618; слом импульса** — те же файлы, `nExt = 5`.
- CHoCH bear 09-08 04:00 (C 78445.0 < 78618.1): **A = 80536.1** (09-06 20:00), **B = 77600.1** (09-08 12:00), 10 свечей, `rangeAtr` 6.873. T = 09-09 08:00 (O 79246.0 H 79737.3 L 78690.3 C 79281.7): экстремум коррекции 79737.3 уже на T (`dT` = 0.7279, в зоне 0.705) -> для «Где реакция?» доступен только 0.786, эталонный класс 0.705 недоступен -> **отбраковка** (кейс «зона пройдена до T»). PD на T: `depth(79281.7)` = 0.5728 -> premium.
- Extension: реакция 09-09 12:00 (C 78570.0 <= 79737.3 − 1109.3464); **C = 79737.3** (09-09 08:00); Te = max(09-09 12:00, C+2 = 09-09 16:00) = **09-09 16:00**; цели 1.0 = 76801.3000, 1.272 = 76002.7080, **1.618 = 74986.8520**; минимум 74909.4 (09-15 16:00) <= 74986.852 -> **reached = 1.618**, `xMax` = 1.6444; инвалидация 09-18 12:00 (C 80688.7 > 79737.3) после достижения; окно до 09-19 16:00.
- BOS bear 09-15 20:00 (C 75599.9 < 76000.3): **A = 79570.9** (09-14 20:00), **B = 74909.4** (09-15 16:00, фитиль за уровнем до закрытия; пробой на следующей свече — `k = b + 1`), 5 свечей (минимум допустимого), `rangeAtr` 6.512. T = 09-16 12:00 (close 75753.7; `dT` = 0.2930; PD `depth` 0.1811 -> discount). Исход **`fail`** на 09-18 12:00 (C 80688.7 > A 79570.9) -> эталон `deep` (hard).

**FG-3. ETHUSDT 1h, импульс вниз, реакция 0.705 / OTE с OB и FVG, extension 1.272** — `ETHUSDT-1h-2026-10.csv` (720 свечей), `nExt = 5`.
- CHoCH bear 10-02 18:00 (C 2663.64 < 2671.2, swing 10-01 15:00): **A = 2779.0** (10-02 08:00), **B = 2647.9** (10-02 18:00, свеча пробоя), 10 свечей, ATR14[A] = 18.3057, `rangeAtr` 7.162.
- «Где реакция?»: T = 10-02 23:00 (close 2667.28), `dT` = 0.1754 -> все варианты. Уровни: 0.382 = 2697.9802, 0.5 = 2713.4500, 0.618 = 2728.9198, 0.705 = 2740.3255, 0.786 = 2750.9446; OTE 2729.1820–2751.4690. `thr = max(30.3321, 30.9396) = 30.9396`. PD: `depth(2667.28)` = 0.1478 -> **discount** (EQ 2713.45; для шорта цена ещё «дешёвая»). Конфлюэнс: полоса 0.705 [2735.0815–2745.5695] — OB bear 10-02 12:00 [2736.77–2766.31] `fresh` и FVG bear (середина 10-02 14:00) [2711.0–2740.37] `open`; полоса 0.5 — FVG и старый swing 2714.77 (10-01 18:00). **Исход:** реакция 10-05 04:00 (C 2701.37 <= 2738.68 − 30.9396 = 2707.7404), **C = 2738.68** (10-04 23:00, внутри OB), глубина **0.6924** -> верные `0.705`, `ote`.
- Extension: Te = 10-05 04:00; цели 1.0 = 2607.5800, **1.272 = 2571.9208**, 1.618 = 2526.5602; минимум 2535.19 (10-07 17:00) -> **reached = 1.272**, `xMax` = 1.5522; без инвалидации до 10-08 04:00.

**FG-4. ETHUSDT 4h, импульс вверх, реакция 0.786 / OTE в OB; PD не задаётся; extension не достигнут** — `ETHUSDT-4h-2026-09.csv` (180 свечей), `nExt = 5`.
- CHoCH bull 09-11 12:00 (C 2558.01 > 2522.75): **A = 2403.33** (09-10 12:00), **B = 2666.0** (09-11 12:00), 6 свечей, `rangeAtr` 7.704.
- T = 09-12 08:00 (close 2535.21); `dT` = 0.6146 -> доступны `0.705`, `0.786`, `ote`. Уровни: 0.705 = 2480.8176, 0.786 = 2459.5414; OTE 2458.4907–2503.1446; EQ 2534.665. PD: `depth(2535.21)` = 0.4979, `|0.4979 − 0.5| < 0.02` -> **вопрос не задаётся** (`pdQuestion = null`). Конфлюэнс: полоса 0.786 [2449.0346–2470.0482] — OB bull 09-10 12:00 [2403.33–2465.82] `fresh`; полоса 0.705 [2470.3108–2491.3245] — FVG bull (середина 09-11 12:00) [2483.73–2527.2] `partial`. `thr = max(68.0614, 61.9901) = 68.0614`. **Исход:** реакция 09-14 16:00 (C 2538.48 >= 2460.3 + 68.0614), **C = 2460.3** (09-13 12:00, внутри OB), глубина **0.7831** -> верные `0.786`, `ote`; ответ `0.705` -> соседний, `levelScore` 0.5, `FIB_LEVEL_MISS` minor.
- Extension: Te = 09-14 16:00; цель 1.0 = 2722.9700; максимум 2614.99 (09-14 20:00), `xMax` = 0.5889; инвалидация 09-15 12:00 (C 2423.27 < 2460.3) -> **reached = none**.

**FG-5. ETHUSDT 4h, слом импульса и «глубокая» реакция за A (снятие ликвидности)** — тот же файл.
- BOS bear 09-10 12:00 (C 2440.01 < 2440.22): **A = 2522.75** (09-09 08:00), **B = 2403.33** (09-10 12:00), 7 свечей, `rangeAtr` 3.836 (только hard). T = 09-11 08:00 (close 2457.19; `dT` = 0.6733 -> доступны `0.786`, `deep`; PD `depth` 0.4510 -> discount). Исход **`fail`** на 09-11 12:00 (C 2558.01 > A) -> верный `deep`; ответ `0.786` -> `FIB_DEEP_MISSED` (`endText = fail`).
- CHoCH bear 09-15 20:00 (C 2397.15 < 2403.33): **A = 2666.0** (09-11 12:00), **B = 2357.0** (09-15 16:00), 25 свечей, `rangeAtr` 6.308. T = 09-16 12:00 (close 2391.66; `dT` = 0.2330; PD 0.1122 -> discount). Исход: реакция 09-20 00:00 (C 2586.59 <= 2669.0 − 72.9240), экстремум **2669.0** (09-19 16:00) — фитиль на 3.0 за A без закрытия за A, глубина **1.0097** -> верный `deep`. Для extension отбраковка (`depth(C) >= 1`).

**FG-6. SOLUSDT 15m, импульс вверх, ложный конфлюэнс на 0.618, реакция deep, extension 1.618** — `SOLUSDT-15m-2026-07-19/20/21.csv` (288 свечей), `nExt = 5`.
- CHoCH bull 07-20 00:00 (C 76.82 > 76.67): **A = 75.31** (07-19 18:00), **B = 77.39** (07-20 01:00), 28 свечей, ATR14[A] = 0.2693, `rangeAtr` 7.724.
- T = 07-20 02:15 (close 76.47), `dT` = 0.5577 -> доступны `0.618`, `0.705`, `0.786`, `ote` (+ `deep` на hard). PD: `depth(76.47)` = 0.4423 -> premium (EQ 76.35). Конфлюэнс: полоса 0.618 [76.0214–76.1878] — OB bull 07-19 22:45 [76.04–76.22] `fresh` и старый swing 76.07 (07-19 05:00) — **ловушка hard**. `thr = max(0.7682, 0.4909) = 0.7682`. **Исход:** уровни 0.618 (76.1046), 0.705 (75.9236), 0.786 (75.7551) пройдены; реакция 07-20 08:00 (C 76.25 >= 75.45 + 0.7682 = 76.2182), **экстремум 75.45** (07-20 06:30), глубина **0.9327** -> верный `deep`.
- Extension (hard, `depth(C)` 0.9327 < 1): Te = 07-20 08:00; цели 1.0 = 77.5300, 1.272 = 78.0958, **1.618 = 78.8154**; максимум **78.87** (07-21 06:30) -> **reached = 1.618** (на 0.0546 выше цели), `xMax` = 1.6442; без инвалидации до 07-21 08:00.

**FG-7. SOLUSDT 15m, импульс вниз, реакция 0.5 у границы допуска, extension 1.618** — `SOLUSDT-15m-2026-07-15/16/17.csv` (288 свечей), `nExt = 5`.
- BOS bear 07-16 17:45 (C 75.56 < 75.57): **A = 76.85** (07-16 15:15), **B = 75.34** (07-16 17:45), 10 свечей, `rangeAtr` 3.768 (только hard). Отказ на том же наборе: CHoCH bear 07-15 19:45 — `BREAK_AFTER_B`.
- T = 07-16 19:00 (close 75.64), `dT` = 0.3709 -> доступны `0.5`…`0.786`, `ote`, `deep`. PD: 0.1987 -> discount. Конфлюэнс: полоса 0.5 [76.0346–76.1554] — нет; полоса 0.705 — FVG bear (середина 07-16 07:30) [76.41–76.94] `partial` (ловушка). `thr = max(0.5154, 0.3564) = 0.5154`. **Исход:** реакция 07-16 22:45 (C 75.29 <= 76.04 − 0.5154 = 75.5246), **C = 76.04** (07-16 21:30), глубина **0.4636** (`|0.4636 − 0.5| = 0.0364 <= 0.04`) -> верный `0.5`.
- Extension: Te = 07-16 22:45 (свеча пробивает B: L 75.13 < 75.34 — допускается на Te); цели 1.0 = 74.5300, 1.272 = 74.1193, **1.618 = 73.5968**; минимум 73.32 (07-17 13:30) -> **reached = 1.618**, `xMax` = 1.8013; без инвалидации до 07-17 22:45.

**FG-8. SOLUSDT 15m, равные максимумы в A, B на свече пробоя, deep, extension 1.272 (1.618 не достигнут на 0.016)** — `SOLUSDT-15m-2026-08-09/10/11/12.csv` (384 свечи), `nExt = 5`.
- BOS bear 08-11 07:15 (O 75.65 H 75.65 L 75.36 C 75.39 < 75.54, swing 08-10 16:15): **A = 76.47** (08-10 20:30; равные high 76.47 на 21:00 и 21:30 — не swing по правилу равенства), **B = 75.36** (08-11 07:15 — свеча пробоя), 43 свечи, `rangeAtr` 6.816.
- «Построй сетку»: ответ «начало 08-10 21:30» (Δ+4, H 76.47 == A, внутри ноги) -> точка `ok`, блок `OK_FIB_EQUAL_EXTREME`; «начало 08-10 22:00» (Δ+6, H 76.32, внутри ноги) -> `FIB_WRONG_ANCHOR_START`, `reason = internal`; «начало 08-10 20:00» (Δ−2, H 76.35) -> точка `ok` по допуску.
- «Где реакция?»: T = 08-11 08:30 (close 75.84), `dT` = 0.4505 -> доступны `0.5`…`0.786`, `ote`, `deep`. PD: 0.4324 -> discount. `thr = max(0.3118, 0.2620) = 0.3118`. **Исход:** реакция 08-11 12:15 (C 75.84 <= 76.35 − 0.3118 = 76.0382), **C = 76.35** (08-11 11:00), глубина **0.8919** -> верный `deep`.
- Extension (hard): Te = 08-11 12:15; цели 1.0 = 75.2400, **1.272 = 74.9381**, 1.618 = 74.5540; минимум **74.57** (08-11 15:30) -> **reached = 1.272** (1.618 не достигнут: 74.57 > 74.554); инвалидация 08-11 21:45 (C 76.41 > 76.35).

### 12.3 Покрытие граничных случаев golden-участками
| Правило | Участок |
|---|---|
| A = защищённый low, не минимум окна (ловушка hard `previous-leg`) | FG-1 |
| `A_NOT_SWING`, `A_NOT_EXTREME`, `BREAK_AFTER_B` | FG-1, FG-7 |
| пробой после B (`k = b + 1`), импульс 5 свечей | FG-2 |
| B — свеча пробоя | FG-3, FG-8 |
| равные экстремумы | FG-8 |
| зона пройдена до T (отбраковка) | FG-2 |
| `continuation` / `shallow` (отбраковка) | FG-1 |
| `fail` -> `deep` | FG-2, FG-5 |
| фитиль за A без закрытия (`r > 1`) -> `deep`, extension отбракован | FG-5 |
| PD не задаётся у EQ | FG-4 |
| ловушка «ложный конфлюэнс» | FG-6, FG-7 |
| граница допуска уровня | FG-7 |
| extension: `none` без инвалидации / с инвалидацией; 1.272; 1.618 с запасом 0.05; 1.618 не достигнут на 0.016 | FG-1, FG-4, FG-3, FG-6, FG-8 |

---

## 13. Тест-план для реализации (TDD, `packages/core/src/fib/`)
1. `levels.test.ts`: формулы §2 на FG-1/FG-3 (уровни, OTE, EQ, extension) — точные значения из §12.
2. `impulses.test.ts`: `findImpulses` на наборах FG-1…FG-8 — принятые импульсы и отказы с причинами; инвариант префикса (§5.1 п.5).
3. `reaction.test.ts`: `resolveReaction` — исходы FG-1…FG-8 (вид, индекс, экстремум, глубина, класс); порядок проверок на одной свече.
4. `extension.test.ts`: `resolveExtension` — `reached`, `xMax`, инвалидация, экстремум свечи инвалидации.
5. `confluence.test.ts`: факторы на полосах FG-1, FG-3, FG-4, FG-6 на момент T (только `candles[0..T]`).
6. `grade.test.ts`: `gradeFibGrid` (ответы §5.3, FG-8), `gradeFibReaction` (FG-4 соседний уровень, FG-5 `FIB_DEEP_MISSED`, PD, конфлюэнс), `gradeFibExtension` (FG-2, FG-8 консервативная цель и промах).
7. `placeholders.test.ts` (расширение): все шаблоны §11 после подстановки реальных параметров FG-участков не содержат `{…}`.
8. `generate.test.ts`: детерминизм по `seed`; балансировка класса; отсутствие свечей позже T в payload.

---

## 14. Расхождения с документами
1. `API_CONTRACTS.md` §2.2 / `packages/core/src/types.ts`: `ModuleId` без `fibonacci`; `SkillId` без `fib-anchor`, `fib-reaction`, `fib-extension`, `premium-discount`; `MarkKind` без `fib-retracement`, `fib-extension` — нужны расширения §9.1.
2. `DATABASE_SCHEMA.md`, таблица `public.attempts`: `check (module in ('market-structure', 'price-action', 'challenge'))` — нужна миграция с `'fibonacci'`; `skill_stats.skill` — свободный текст, правка не нужна.
3. `API_CONTRACTS.md` §3.3–§3.4: путь `module` — только три модуля; `NextRequest`, `TaskPayload`, `Answer`, `ModuleDetail` — добавить варианты §9.2–§9.3; validation-коды §9.3.
4. `API_CONTRACTS.md` §4.1: `relative`-шкала описана только для Challenge; для `fib-reaction` и `fib-extension` предлагается `relative`.
5. `API_CONTRACTS.md` §5.1: `replay?: ChallengeReplay // только challenge` — предлагается общий `TaskReplay` (та же форма) для `challenge` и `fibonacci`.
6. `API_CONTRACTS.md` §5.2–§5.3: новые `OkCode` и `ErrorCode` §11; ключ `feedback.principle.fibonacci`.
7. `ALGORITHMS.md` §1.5 / `packages/core/src/version.ts`: `ALGO_VERSION` -> `1.2.0` при реализации; новая константа `FIB_ALGO_VERSION = '1.0.0'`.
8. `ALGORITHMS.md` §16.1, §16.3: таблицы навыков и адаптивной подборки — дополнить строками §10.
9. `ALGORITHMS.md` §10 (`findLevels`) и фактор «уровень» конфлюэнса: в Fibonacci используется внешний swing в полосе, а не кластер `findLevels` (§6.5) — сознательное отличие.
10. `PRD.md`: нет требований FR-FIB-* и AC для v1.1; `ROADMAP.md` v1.1 требует «отдельное интервью по Fibonacci» — решения переданы оркестратором, но `INTERVIEW_SUMMARY.md` их не содержит.
11. `TESTING_STRATEGY.md` §4.4: golden «рядом с фикстурой», фактическая практика — `fixtures/golden/`; документ следует практике.
12. `FR-TERM-03` («все инструменты») — инструменты Fibonacci добавляются в терминал; проверка сеток в терминале не пишет прогресс (как MVP-проверка терминала).

## 15. Спорные места и вопросы оркестратору
1. **A — защищённый low ноги пробоя** (минимум на `(H, k]`, внешний swing), а не минимум окна; B — первый внешний swing за пробитым уровнем; пробой должен быть не позже `b + nExt` (§3.1).
2. **Реакция** — первое закрытие с разворотом от экстремума коррекции не меньше `max(1.5·ATR14[T], 0.236·|B−A|)`; слом — закрытие за A; продолжение — выход за B без реакции (§6.3). Альтернатива «BOS на внутреннем слое» отклонена.
3. **Допуск уровня ±0.04** доли импульса; OTE `[0.62, 0.79]` без допуска засчитывается наравне с точным уровнем (более широкая зона — осознанный выбор SMC-трейдера) — подтвердить или ввести для OTE меньший вес.
4. **Вариант `deep`** («глубже 0.786, включая слом») — только hard; `between`, `shallow`, `continuation`, `timeout` не генерируются (§6.1).
5. **Балансировка ответа по seed** в «Где реакция?» и «Цель по Extension» (§6.2, §7.2): иначе 0.382 и `none` доминируют (данные §6.3, §7.2).
6. **T = подтверждение B**, пройденные зоны исключаются из вариантов (§6.1).
7. **Premium/Discount**: вопрос про `close[T]`, не задаётся при `|depth − 0.5| < 0.02`; варианта `equilibrium` нет (§2.3, §6.4).
8. **Конфлюэнс необязателен**: оцениваются только заявленные факторы; «уровень» = старый внешний swing в полосе (§6.5).
9. **Extension**: инвалидация закрытием за C, экстремум свечи инвалидации засчитывается; лимит как в Challenge; `none` — только hard; консервативная цель — частичный балл (§7).
10. **Шкала времени** `relative` для заданий с будущим (§9.2).
11. **Терминал**: проверка «сетка по реальному импульсу?» без прогресса (§8).
12. **Минимальная длина импульса 5 свечей** (`2·tol + 1`) для medium/hard, 8 — для easy (§4).
13. **Новые фикстуры** (запрос к Market Data Engineer, §12.1): `BTCUSDT-4h-2026-10`, `ETHUSDT-1h-2026-10`, `ETHUSDT-4h-2026-09` (monthly); `SOLUSDT-15m` daily 2026-07-15/16/17, 07-19/20/21, 08-10/11/12.
14. **Правки чужих зон** (оркестратору): пункты 1–8, 10 раздела 14.
