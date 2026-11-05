// Шаблоны разбора на русском (ALGORITHMS §17) — данные с плейсхолдерами {name}. UI подставляет значения
// и форматирует время (локальный пояс) и цены (точность тика); ядро строки не формирует.
import type { ErrorCode, ModuleId, OkCode, SkillId, Verdict } from '../types';

export interface ErrorTemplate {
  /** Часть 3: ошибка. */
  mistake: string;
  /** Часть 4: почему. */
  why: string;
  /** Часть 5: как правильно. */
  howTo: string;
  /** Часть 6: принцип. */
  principle: string;
}

/** Градации оценки разметки: верно (>= 80%), частично верно (40-80%), неверно (< 40%). «N из M» — по эталонным меткам, процент — отдельная оценка. */
export const VERDICT_TEMPLATES_RU: Record<Verdict, string> = {
  correct: 'Верно: совпало {matched} из {total} эталонных меток. Оценка {score}% учитывает точность и лишние метки.',
  partial: 'Частично верно: совпало {matched} из {total} эталонных меток. Оценка {score}% учитывает точность и лишние метки.',
  incorrect: 'Неверно: совпало {matched} из {total} эталонных меток. Оценка {score}% учитывает точность и лишние метки.',
};

/** Запасная формулировка, когда счёт по элементам неизвестен (нет исходов навыков). */
export const VERDICT_PLAIN_TEMPLATES_RU: Record<Verdict, string> = {
  correct: 'Верно: оценка {score}%.',
  partial: 'Частично верно: оценка {score}%, есть ошибки ниже.',
  incorrect: 'Неверно: оценка {score}%. Разберём, что пошло не так.',
};

/** Challenge: вердикт по качеству решения (ALGORITHMS §14.3-14.4), без формулировки «совпадения с эталоном» (она для разметки). */
export const CHALLENGE_VERDICT_TEMPLATES_RU: Record<Verdict, string> = {
  correct: 'Решение верное: качество {score} из 100.',
  partial: 'Решение частично верное: качество {score} из 100, есть ошибки ниже.',
  incorrect: 'Решение неверное: качество {score} из 100. Разберём, что пошло не так.',
};

export const PRINCIPLE_TEMPLATES_RU: Record<ModuleId, string> = {
  'market-structure':
    'Структура читается по закрытиям тел и подтверждённым swing: фитиль показывает ликвидность, тело — решение рынка.',
  'price-action':
    'Свечная модель значима только в контексте: зона интереса и направление старшей структуры важнее формы свечи.',
  challenge:
    'Качество решения — это соответствие правилам до входа; исход одной сделки его не доказывает и не опровергает.',
  fibonacci:
    'Fibonacci — линейка для импульса, а не сигнал: уровни работают вместе со структурой, зоной интереса и premium/discount.',
};

export const OK_TEMPLATES_RU: Record<OkCode, string> = {
  OK_SWING: 'Swing High/Low отмечены верно: {count} из {total}, в пределах ±{tol} свечей.',
  OK_LABEL: 'Метки HH/HL/LH/LL расставлены верно: {count} из {total}.',
  OK_BOS: 'BOS определён верно по закрытию тела: {count} из {total}.',
  OK_CHOCH: 'CHoCH (смена характера структуры) найден верно: {count} из {total}.',
  OK_SCOPE: 'Внешняя (external) и внутренняя (internal) структура разделены верно.',
  OK_SWEEP: 'Liquidity sweep (снятие ликвидности) определён верно: {count} из {total}.',
  OK_OB: 'Order Block отмечен на верной свече: {count} из {total}.',
  OK_FVG: 'FVG (разрыв справедливой стоимости) отмечен верно: {count} из {total}.',
  OK_PATTERN: 'Модель «{pattern}» найдена верно: {count} из {total}.',
  OK_LEVEL: 'Уровень проведён в пределах допуска {tolPct}% (отклонение {devPct}%).',
  OK_CONTEXT: 'Факторы контекста определены верно: {count} из 5.',
  OK_HTF: 'Сделка по направлению старшего тренда ({htfTrend}).',
  OK_SL_PLACEMENT: 'Stop Loss за защищённым swing {level}.',
  OK_RR: 'Соотношение риск/прибыль {rr}R не ниже 2R.',
  OK_WAIT: 'WAIT верен: условий для входа по правилам структуры не было.',
  OK_FIB_ANCHOR: 'Сетка построена по импульсу верно: начало {startTime}, конец {endTime} (допуск ±{tol} свечей).',
  OK_FIB_EQUAL_EXTREME: 'Точка {point} стоит на равном экстремуме {userTime}: цена {price} совпадает с эталоном {refTime}, сетка та же.',
  OK_FIB_REACTION: 'Реакция от {given} определена верно: коррекция остановилась на {cPrice} ({depth} импульса).',
  OK_FIB_CONFLUENCE: 'Конфлюэнс на выбранном уровне указан верно: {factors}.',
  OK_PD: 'Premium/Discount определён верно: цена {price} в {expected}, equilibrium {eq}.',
  OK_EXT_POINTS: 'Точки A–B–C extension поставлены верно.',
  OK_EXT_TARGET: 'Цель {target} выбрана верно: максимум движения {maxPrice} ({xMax} от AB).',
};

/** Навык кода ошибки; null — определяется параметрами (pa-* по `params.pattern`, MARK_WRONG_DIRECTION по `params.kind`, QUESTION_WRONG по шаблону). */
export const ERROR_SKILLS: Record<ErrorCode, SkillId | null> = {
  SWING_MISSED: 'swing',
  SWING_EXTRA: 'swing',
  SWING_OFF_TOLERANCE: 'swing',
  SWING_UNCONFIRMED: 'swing',
  STRUCTURE_LABEL_WRONG: 'structure-labels',
  STRUCTURE_LABEL_MISSED: 'structure-labels',
  STRUCTURE_LABEL_EXTRA: 'structure-labels',
  BOS_WICK_ONLY: 'bos',
  BOS_MISSING: 'bos',
  BOS_WRONG_LEVEL: 'bos',
  BOS_EXTRA: 'bos',
  BOS_WRONG_DIRECTION: 'bos',
  BOS_CHOCH_CONFUSED: 'choch',
  CHOCH_MISSING: 'choch',
  CHOCH_WRONG_DIRECTION: 'choch',
  CHOCH_EXTRA: 'choch',
  INTERNAL_AS_EXTERNAL: 'internal-external',
  EXTERNAL_AS_INTERNAL: 'internal-external',
  SWEEP_MISSED: 'sweep',
  SWEEP_IS_BREAK: 'sweep',
  SWEEP_EXTRA: 'sweep',
  MARK_WRONG_DIRECTION: null,
  OB_WRONG_CANDLE: 'order-block',
  OB_NO_DISPLACEMENT: 'order-block',
  OB_WRONG_BOUNDS: 'order-block',
  OB_MISSED: 'order-block',
  OB_EXTRA: 'order-block',
  FVG_NOT_GAP: 'fvg',
  FVG_WRONG_BOUNDS: 'fvg',
  FVG_MISSED: 'fvg',
  FVG_EXTRA: 'fvg',
  QUESTION_WRONG: null,
  PATTERN_WRONG_TYPE: null,
  PATTERN_MISSED: null,
  PATTERN_EXTRA: null,
  PATTERN_WRONG_DIRECTION: null,
  LEVEL_OFF_TOLERANCE: 'pa-level',
  LEVEL_NOT_STRONGEST: 'pa-level',
  LEVEL_WRONG_TYPE: 'pa-level',
  CONTEXT_IGNORED_HTF: 'pa-context',
  CONTEXT_MISSED_SWEEP: 'pa-context',
  CONTEXT_MISSED_OB: 'pa-context',
  CONTEXT_MISSED_LEVEL: 'pa-context',
  CONTEXT_PHANTOM_FACTOR: 'pa-context',
  CONTEXT_FALSE_POSITIVE: 'pa-context',
  CONTEXT_FALSE_NEGATIVE: 'pa-context',
  SL_WRONG_SIDE: 'challenge-risk',
  TP_WRONG_SIDE: 'challenge-risk',
  SL_INSIDE_STRUCTURE: 'challenge-risk',
  SL_TOO_WIDE: 'challenge-risk',
  RR_TOO_LOW: 'challenge-risk',
  TRADE_AGAINST_HTF: 'challenge-entry',
  TRADE_AGAINST_STRUCTURE: 'challenge-entry',
  TRADE_IN_RANGE: 'challenge-entry',
  ENTRY_NO_POI: 'challenge-entry',
  WAIT_MISSED_SETUP: 'challenge-wait',
  REASON_MISMATCH: 'challenge-entry',
  FIB_WRONG_DIRECTION: 'fib-anchor',
  FIB_NOT_IMPULSE: 'fib-anchor',
  FIB_WRONG_ANCHOR_START: 'fib-anchor',
  FIB_WRONG_ANCHOR_END: 'fib-anchor',
  FIB_IMPULSE_UNCONFIRMED: 'fib-anchor',
  FIB_LEVEL_MISS: 'fib-reaction',
  FIB_DEEP_MISSED: 'fib-reaction',
  FIB_CONFLUENCE_WRONG: 'fib-reaction',
  FIB_PD_WRONG: 'premium-discount',
  EXT_WRONG_DIRECTION: 'fib-anchor',
  /** A, B - fib-anchor; C - fib-extension (по `params.point`, см. skillForError). */
  EXT_WRONG_POINTS: null,
  EXT_TARGET_MISS: 'fib-extension',
  EXT_TARGET_CONSERVATIVE: 'fib-extension',
};

export const ERROR_TEMPLATES_RU: Record<ErrorCode, ErrorTemplate> = {
  SWING_MISSED: {
    mistake: 'Пропущен Swing {side} на {time} ({price}).{labelNote}',
    why: 'Свеча имеет {n} свечей слева с более низким (высоким) экстремумом и {n} справа — это фрактал.',
    howTo: 'Ищите экстремум, который не перекрыт {n} свечами с каждой стороны.',
    principle: 'Swing — подтверждённый экстремум, а не любой изгиб цены.',
  },
  SWING_EXTRA: {
    mistake: 'Отмечен Swing {side} на {time}, которого нет в эталоне.',
    why: 'Хотя бы одна из {n} соседних свечей имеет более высокий high (низкий low), фрактал не образован.',
    howTo: 'Сравните экстремум с {n} свечами слева и справа перед отметкой.',
    principle: 'Меньше точек, но подтверждённых — структура чище.',
  },
  SWING_OFF_TOLERANCE: {
    mistake: 'Swing отмечен на {time}, эталон — на {refTime} (смещение {offset} свечей при допуске ±{tol}).{labelNote}',
    why: 'Метка стоит рядом, но не на экстремальной свече.',
    howTo: 'Ставьте метку на свечу с самым высоким high (самым низким low) в окрестности.',
    principle: 'Уровень структуры — это конкретная цена экстремума.',
  },
  SWING_UNCONFIRMED: {
    mistake: 'Swing на {time} ещё не подтверждён.',
    why: 'Справа от свечи меньше {n} закрытых свечей; экстремум может быть обновлён.',
    howTo: 'Дождитесь {n} закрытых свечей справа, прежде чем считать точку swing.',
    principle: 'Подтверждение важнее скорости: незакрытая структура ещё может измениться.',
  },
  STRUCTURE_LABEL_WRONG: {
    mistake: 'На {time} стоит {given}, а нужно {expected}.',
    why: 'Метка сравнивает swing с предыдущим swing того же типа ({prevPrice}); равенство не считается обновлением.',
    howTo: 'Сравните цену {price} с предыдущим swing {side} {prevPrice}.',
    principle: 'HH/HL/LH/LL — это сравнение экстремумов, а не направление последней свечи.',
  },
  STRUCTURE_LABEL_MISSED: {
    mistake: 'Не подписан swing на {time}: ожидалось {expected}.',
    why: 'Каждый swing после первого получает метку относительно предыдущего swing того же типа.',
    howTo: 'Подпишите все swing окна, начиная со второго каждого типа.',
    principle: 'Последовательность меток показывает тренд раньше, чем пробой.',
  },
  STRUCTURE_LABEL_EXTRA: {
    mistake: 'Метка {given} на {time} стоит не на swing.',
    why: 'Метки HH/HL/LH/LL ставятся только на подтверждённые swing.',
    howTo: 'Сначала найдите swing, затем подпишите его.',
    principle: 'Метка структуры наследует точность swing.',
  },
  BOS_WICK_ONLY: {
    mistake: '{kind} отмечен на {time}, но свеча закрылась на {close}, не за уровнем {level}.',
    why: 'Фитиль вышел за swing, тело — нет: это снятие ликвидности, а не слом структуры.',
    howTo: 'Ждите свечу, тело которой закроется за {level}; фитиль отмечайте как Liquidity sweep.',
    principle: 'BOS и CHoCH — только по закрытию тела.',
  },
  BOS_MISSING: {
    mistake: 'Пропущен BOS ({dir}) на {time}: закрытие {close} за уровнем {level}.',
    why: 'Тело закрылось за целевым swing по направлению тренда — структура продолжилась.',
    howTo: 'Отмечайте BOS на первой свече, закрывшейся за последним swing по тренду.',
    principle: 'Каждый BOS переносит защищённый уровень вслед за трендом.',
  },
  BOS_WRONG_LEVEL: {
    mistake: '{kind} на {time} привязан к уровню {given}, а пробит уровень {level} (swing {refTime}).',
    why: 'Пробиваемый уровень — цель структуры: наивысший swing high после прошлого пробоя (в нисходящем — наинизший low) или защищённый уровень для CHoCH.',
    howTo: 'Проведите линию от swing {refTime} до свечи пробоя.',
    principle: 'Уровень пробоя определяется структурой, а не ближайшим экстремумом.',
  },
  BOS_EXTRA: {
    mistake: 'Отмечен BOS на {time}, но целевой уровень не пробит.',
    why: 'На этой свече нет закрытия тела за подтверждённым структурным swing.',
    howTo: 'Определите текущую цель BOS ({level}) и ждите закрытия за ней.',
    principle: 'Не каждый импульс — слом структуры.',
  },
  BOS_WRONG_DIRECTION: {
    mistake: 'BOS на {time} отмечен как {given}, а он {expected}.',
    why: 'Направление BOS задаётся стороной пробитого swing: выше high — бычий, ниже low — медвежий.',
    howTo: 'Проверьте, какой swing пробит закрытием.',
    principle: 'Направление пробоя — это сторона, за которой закрылось тело.',
  },
  BOS_CHOCH_CONFUSED: {
    mistake: 'На {time} отмечен {given}, а это {expected}.',
    why: 'BOS продолжает текущий тренд ({trend}); CHoCH пробивает защищённый уровень против тренда и меняет его.',
    howTo: 'Перед отметкой определите текущий тренд и защищённый уровень ({protected}).',
    principle: 'CHoCH — первый пробой против тренда; всё по тренду — BOS.',
  },
  CHOCH_MISSING: {
    mistake: 'Пропущен CHoCH ({dir}) на {time}: закрытие {close} за защищённым уровнем {level}.',
    why: 'Пробит защищённый swing — структура сменила направление.',
    howTo: 'Держите в уме защищённый уровень и отмечайте первое закрытие тела за ним.',
    principle: 'Смена характера структуры начинается с пробоя защищённого уровня.',
  },
  CHOCH_WRONG_DIRECTION: {
    mistake: 'CHoCH на {time} отмечен как {given}, а он {expected}.',
    why: 'Бычий CHoCH пробивает защищённый high нисходящей структуры, медвежий — защищённый low восходящей.',
    howTo: 'Определите тренд до пробоя: CHoCH направлен против него.',
    principle: 'Направление CHoCH противоположно прежнему тренду.',
  },
  CHOCH_EXTRA: {
    mistake: 'Отмечен CHoCH на {time}, но защищённый уровень {protected} не пробит.',
    why: 'Пробит внутренний или промежуточный swing, а не защищённый уровень — внешний тренд не сменился.',
    howTo: 'Сравните закрытие с защищённым уровнем; внутренний пробой отмечайте как internal.',
    principle: 'Тренд жив, пока стоит защищённый уровень.',
  },
  INTERNAL_AS_EXTERNAL: {
    mistake: 'Метка на {time} отмечена как external, а это internal.',
    why: 'Swing определяется фракталом N={nInt} и не является внешним (N={nExt}).',
    howTo: 'Внешними отмечайте только крупные swing, ограничивающие ноги тренда.',
    principle: 'Внутренняя структура живёт внутри внешней ноги и не меняет её тренд сама по себе.',
  },
  EXTERNAL_AS_INTERNAL: {
    mistake: 'Метка на {time} отмечена как internal, а это external.',
    why: 'Этот swing подтверждён фракталом N={nExt} — это граница внешней структуры.',
    howTo: 'Проверьте swing на большом окне ({nExt} свечей с каждой стороны).',
    principle: 'Внешние swing задают тренд и защищённые уровни.',
  },
  SWEEP_MISSED: {
    mistake: 'Пропущен Liquidity sweep на {time}: фитиль до {wick} за swing {level}, закрытие {close}.',
    why: 'Цена сняла ликвидность за swing и вернулась: тело не закрепилось за уровнем {k} свечей.',
    howTo: 'Отмечайте свечу, фитиль которой вышел за swing, а тело осталось внутри.',
    principle: 'Ликвидность за очевидными экстремумами снимается перед движением в обратную сторону.',
  },
  SWEEP_IS_BREAK: {
    mistake: 'Sweep отмечен на {time}, но это {kind}: тело закрылось за {level}.',
    why: 'Закрытие тела за уровнем — пробой структуры, а не снятие ликвидности.',
    howTo: 'Различайте: закрытие за уровнем — BOS/CHoCH, только фитиль — sweep.',
    principle: 'Тело решает, фитиль проверяет.',
  },
  SWEEP_EXTRA: {
    mistake: 'Отмечен sweep на {time}, но живой внешний swing не снят.',
    why: 'За фитилём нет подтверждённого внешнего swing, или цена закрепилась за уровнем в течение {k} свечей.',
    howTo: 'Sweep возможен только за подтверждённым, ещё не снятым и не пробитым swing.',
    principle: 'Ликвидность находится за подтверждёнными экстремумами.',
  },
  MARK_WRONG_DIRECTION: {
    mistake: '{kindName} на {time} отмечен как {given}, а он {expected}.',
    why: 'Направление определяется стороной: снятие high — медвежий сигнал, снятие low — бычий; бычий OB/FVG ниже цены импульса вверх.',
    howTo: 'Определите, в какую сторону был импульс или какая ликвидность снята.',
    principle: 'Направление зоны совпадает с направлением импульса, который её создал.',
  },
  OB_WRONG_CANDLE: {
    mistake: 'OB отмечен на {time}, эталон — {refTime}.',
    why: 'Order Block — последняя противоположная свеча перед импульсом, сломавшим структуру ({eventKind} на {eventTime}).',
    howTo: 'Найдите начало импульса и последнюю {oppColor} свечу перед ним с крайним {extreme}.',
    principle: 'OB — это след крупного участника в начале импульса.',
  },
  OB_NO_DISPLACEMENT: {
    mistake: 'Зона на {time} не является валидным OB.',
    why: 'После свечи не было displacement: ни FVG, ни свечи с телом не меньше {k}×ATR до пробоя.',
    howTo: 'Ищите OB только перед сильным импульсом, сломавшим структуру.',
    principle: 'Без импульса нет доказательства участия крупного игрока.',
  },
  OB_WRONG_BOUNDS: {
    mistake: 'Границы OB на {time} не совпадают с эталоном [{low}–{high}] (перекрытие {iou}%).',
    why: 'Зона OB — диапазон свечи OB от low до high.',
    howTo: 'Растяните прямоугольник от low до high свечи OB.',
    principle: 'Точные границы задают точку входа и стоп.',
  },
  OB_MISSED: {
    mistake: 'Пропущен {dir} OB на {time} [{low}–{high}] для {eventKind} на {eventTime}.',
    why: 'Импульс с displacement сломал структуру — свеча перед ним образует OB.',
    howTo: 'После каждого внешнего BOS/CHoCH ищите последнюю противоположную свечу перед импульсом.',
    principle: 'Каждый слом структуры оставляет зону интереса.',
  },
  OB_EXTRA: {
    mistake: 'Зона на {time} не связана с внешним BOS/CHoCH.',
    why: 'OB строится только для импульса, сломавшего внешнюю структуру.',
    howTo: 'Сначала найдите пробой, затем его OB.',
    principle: 'Зона без слома структуры — просто свеча.',
  },
  FVG_NOT_GAP: {
    mistake: 'На {time} нет разрыва между свечами 1 и 3.',
    why: 'Тени первой и третьей свечи тройки перекрываются: неэффективности нет.',
    howTo: 'Проверьте: low третьей свечи выше high первой (бычий) или high третьей ниже low первой (медвежий).',
    principle: 'FVG — это цена, через которую рынок прошёл в одну сторону без встречных сделок.',
  },
  FVG_WRONG_BOUNDS: {
    mistake: 'Границы FVG на {time} неверны: эталон [{low}–{high}].',
    why: 'Границы FVG — high первой и low третьей свечи (для медвежьего — low первой и high третьей).',
    howTo: 'Совместите края прямоугольника с тенями первой и третьей свечи.',
    principle: 'Граница разрыва — это граница незаполненной цены.',
  },
  FVG_MISSED: {
    mistake: 'Пропущен {dir} FVG на {time} [{low}–{high}], размер {size} (≥ 0.5 ATR).',
    why: 'Разрыв значимого размера ещё не заполнен ({status}).',
    howTo: 'Просматривайте импульсные свечи: разрыв между тенями соседей — FVG.',
    principle: 'Незаполненный FVG притягивает цену.',
  },
  FVG_EXTRA: {
    mistake: 'FVG на {time} уже заполнен или не совпадает с эталоном.',
    why: 'В эталоне только незаполненные FVG от 0.5 ATR.',
    howTo: 'Отмечайте только актуальные разрывы.',
    principle: 'Заполненная неэффективность больше не работает.',
  },
  QUESTION_WRONG: {
    mistake: 'Выбран ответ «{given}», верный — «{expected}».',
    why: '{explain}',
    howTo: '{howTo}',
    principle: '{principle}',
  },
  PATTERN_WRONG_TYPE: {
    mistake: 'На {time} отмечена «{given}», а это «{expected}».',
    why: 'Критерии «{given}» не выполнены: {criterion}.',
    howTo: 'Сверьте доли тела и теней с критериями модели.',
    principle: 'Модель определяется пропорциями, а не впечатлением.',
  },
  PATTERN_MISSED: {
    mistake: 'Пропущена модель «{pattern}» на {time}.',
    why: 'Свечи удовлетворяют критериям: {criterion}.',
    howTo: 'Просмотрите окно свеча за свечой, проверяя тело, тени и размер относительно ATR.',
    principle: 'Систематический просмотр надёжнее поиска «на глаз».',
  },
  PATTERN_EXTRA: {
    mistake: 'На {time} нет модели «{pattern}».',
    why: 'Не выполнено: {criterion}.',
    howTo: 'Проверьте размер свечи относительно ATR и пропорции тела/теней.',
    principle: 'Маленькая свеча с похожей формой — шум.',
  },
  PATTERN_WRONG_DIRECTION: {
    mistake: '«{pattern}» на {time} отмечена как {given}, а она {expected}.',
    why: 'Направление пин-бара задаёт длинная тень (нижняя — бычий молот, верхняя — медвежья падающая звезда); поглощения и звёзд — цвет последней свечи.',
    howTo: 'Определяйте направление по отвергнутой стороне.',
    principle: 'Длинная тень — цена, которую рынок отверг.',
  },
  LEVEL_OFF_TOLERANCE: {
    mistake: 'Уровень {user} отклоняется от эталона {ref} на {devPct}% (допуск {tolPct}%).',
    why: 'Эталон — кластер из {touches} swing в зоне [{low}–{high}].',
    howTo: 'Проводите уровень через зону, где цена разворачивалась несколько раз.',
    principle: 'Уровень — зона повторных реакций, а не одна точка.',
  },
  LEVEL_NOT_STRONGEST: {
    mistake: 'Уровень {user} реален, но сильнее уровень {ref} ({touches} касаний).',
    why: 'Нужен наиболее значимый уровень: больше касаний, затем свежее.',
    howTo: 'Сравните число реакций у кандидатов перед выбором.',
    principle: 'Чем больше реакций, тем больше ордеров на уровне.',
  },
  LEVEL_WRONG_TYPE: {
    mistake: 'Уровень {user} — {given}, а требовался {expected}.',
    why: 'Поддержка ниже текущей цены, сопротивление — выше.',
    howTo: 'Определите положение уровня относительно последнего закрытия {close}.',
    principle: 'Роль уровня определяется положением цены.',
  },
  CONTEXT_IGNORED_HTF: {
    mistake: 'Старший тренд указан как {given}, а он {expected} ({htfTf}).',
    why: 'По внешней структуре {htfTf} последнее событие: {lastEvent}.',
    howTo: 'Перед оценкой модели откройте {htfTf} и определите тренд по последнему BOS/CHoCH.',
    principle: 'Младший ТФ торгуется по направлению старшего.',
  },
  CONTEXT_MISSED_SWEEP: {
    mistake: 'Не замечен sweep {side} на {time} (уровень {level}).',
    why: 'Модель сформировалась сразу после снятия ликвидности — это усиливает разворот.',
    howTo: 'Проверьте, не вышел ли фитиль за ближайший внешний swing перед моделью.',
    principle: 'Разворот после снятия ликвидности надёжнее разворота «из воздуха».',
  },
  CONTEXT_MISSED_OB: {
    mistake: 'Не замечен {dir} Order Block [{low}–{high}] на {time}.',
    why: 'Модель сформировалась в зоне OB — это зона интереса.',
    howTo: 'Проверьте, есть ли OB, в который вошла цена модели.',
    principle: 'Модель в зоне интереса значимее модели в пустоте.',
  },
  CONTEXT_MISSED_LEVEL: {
    mistake: 'Не замечен уровень {level} ({touches} касаний).',
    why: 'Экстремум модели находится в зоне уровня ±0.3%.',
    howTo: 'Отметьте ближайшие уровни перед оценкой модели.',
    principle: 'Уровни — места, где ждут ордера.',
  },
  CONTEXT_PHANTOM_FACTOR: {
    mistake: 'Указан фактор «{factor}», которого нет.',
    why: '{reason}.',
    howTo: 'Подтверждайте каждый фактор по правилу: sweep — фитиль за внешним swing, OB — валидная зона, уровень — кластер ≥ 2 касаний.',
    principle: 'Не приписывайте модели контекст, которого нет.',
  },
  CONTEXT_FALSE_POSITIVE: {
    mistake: 'Модель названа значимой, но это не так.',
    why: '{why}: по правилу нужна совпадающая со старшим трендом модель в зоне интереса.',
    howTo: 'Проверьте направление {htfTf} и наличие sweep/OB/уровня.',
    principle: 'Форма без контекста — не сигнал.',
  },
  CONTEXT_FALSE_NEGATIVE: {
    mistake: 'Модель названа незначимой, хотя контекст подтверждает её.',
    why: 'Направление совпадает со старшим трендом и есть {factors}.',
    howTo: 'Когда тренд и зона совпадают, модель — подтверждение входа.',
    principle: 'Совпадение тренда и зоны — основа сетапа.',
  },
  SL_WRONG_SIDE: {
    mistake: 'Stop Loss {sl} с неверной стороны от входа {entry}.',
    why: 'Для LONG стоп ниже входа, для SHORT — выше.',
    howTo: 'Перенесите стоп за вход в сторону риска.',
    principle: 'Стоп ограничивает убыток, а не прибыль.',
  },
  TP_WRONG_SIDE: {
    mistake: 'Take Profit {tp} с неверной стороны от входа {entry}.',
    why: 'Для LONG тейк выше входа, для SHORT — ниже.',
    howTo: 'Перенесите тейк в сторону сделки.',
    principle: 'Цель лежит в направлении сделки.',
  },
  SL_INSIDE_STRUCTURE: {
    mistake: 'Стоп {sl} стоит внутри структуры: он должен быть за защищённым уровнем {level}.',
    why: 'Обычный откат до {level} выбьет стоп, не отменяя идею.',
    howTo: 'Ставьте стоп за защищённым swing {level} (с запасом до 1.5 ATR).',
    principle: 'Стоп — там, где идея сделки становится неверной.',
  },
  SL_TOO_WIDE: {
    mistake: 'Стоп {sl} дальше защищённого уровня {level} более чем на 1.5 ATR.',
    why: 'Лишнее расстояние снижает R без выигрыша в надёжности.',
    howTo: 'Ставьте стоп сразу за защищённым swing.',
    principle: 'Риск должен быть минимальным, но достаточным.',
  },
  RR_TOO_LOW: {
    mistake: 'Соотношение риск/прибыль {rr}R ниже 1.5R.',
    why: 'При низком RR даже частые победы не покрывают убытки.',
    howTo: 'Выбирайте цель у ликвидности не ближе 1.5R (лучше 2R+) или ищите лучший вход.',
    principle: 'Сделка должна стоить своего риска.',
  },
  TRADE_AGAINST_HTF: {
    mistake: 'Сделка {side} против старшего тренда ({htfTrend} на {htfTf}).',
    why: 'Против старшей структуры вероятность продолжения ниже.',
    howTo: 'Торгуйте по направлению {htfTf} или ждите CHoCH на старшем ТФ.',
    principle: 'Старший ТФ задаёт направление, младший — точку входа.',
  },
  TRADE_AGAINST_STRUCTURE: {
    mistake: 'Сделка {side} против структуры рабочего ТФ ({trendTf}).',
    why: 'Последнее событие — {lastEvent}; защищённый уровень {level} не пробит.',
    howTo: 'Дождитесь CHoCH на рабочем ТФ или торгуйте по тренду.',
    principle: 'Пока стоит защищённый уровень, тренд продолжается.',
  },
  TRADE_IN_RANGE: {
    mistake: 'Позиция открыта во флэте.',
    why: 'Структура не определена ({trendTf}/{htfTrend}): нет направления и края диапазона.',
    howTo: 'Во флэте выбирайте WAIT или ждите sweep края и CHoCH.',
    principle: 'Нет структуры — нет сделки.',
  },
  ENTRY_NO_POI: {
    mistake: 'Вход {entry} не в зоне интереса.',
    why: 'Рядом нет OB, FVG или защищённого уровня — вход «в середине движения».',
    howTo: 'Ждите возврата в OB/FVG или к защищённому уровню.',
    principle: 'Входите от зоны, а не вдогонку.',
  },
  WAIT_MISSED_SETUP: {
    mistake: 'Выбран WAIT, но был сетап {refSide}.',
    why: 'Тренд рабочего ТФ ({trendTf}) совпадал со старшим ({htfTrend}), цена была в зоне интереса ({poi}), RR ≥ 2.',
    howTo: 'Когда тренд, зона и RR совпадают — это вход.',
    principle: 'Ожидание тоже решение и имеет цену упущенной возможности.',
  },
  REASON_MISMATCH: {
    mistake: 'Причина «{reason}» не подтверждается графиком.',
    why: '{reasonWhy}.',
    howTo: 'Выбирайте причины, которые можно указать на графике.',
    principle: 'Обоснование — это проверяемые факты, а не ощущения.',
  },
  // ---- Fibonacci Playground (FIBONACCI.md §11.3) ----
  FIB_WRONG_DIRECTION: {
    mistake: 'Сетка протянута {givenDir}, а импульс направлен {expectedDir}.',
    why: 'Retracement тянут от начала импульса к его концу: тогда уровень 0 стоит на конце импульса, а уровни коррекции — между концом и началом.',
    howTo: 'Начните с {refStartTime} ({refStartPrice}) и протяните сетку к {refEndTime} ({refEndPrice}).',
    principle: 'Направление сетки — это направление импульса; перевёрнутая сетка показывает уровни не там, где ждать коррекцию.',
  },
  FIB_NOT_IMPULSE: {
    mistake: 'Сетка построена на {legText} ({userStartTime} – {userEndTime}), а не на импульсе.',
    why: 'Импульс задания — нога, сломавшая структуру ({eventKind} на {eventTime}): от {refStartTime} ({refStartPrice}) до {refEndTime} ({refEndPrice}).',
    howTo: 'Найдите последний BOS или CHoCH и протяните сетку от защищённого экстремума ноги пробоя до её конца.',
    principle: 'Fibonacci измеряет откат импульса; сетка на коррекции или шуме даёт случайные уровни.',
  },
  FIB_WRONG_ANCHOR_START: {
    mistake: 'Начало сетки на {userTime} ({userPrice}), а импульс начинается на {refTime} ({refPrice}): смещение {offset} свечей при допуске ±{tol}.',
    why: '{reasonText} Начало импульса — крайний {sideName} между пробитым swing ({brokenTime}) и свечой пробоя ({eventTime}); это защищённый уровень тренда.',
    howTo: 'Перенесите первую точку на свечу {refTime}: магнит привяжет её к {sideName} {refPrice}.',
    principle: 'Сетка от защищённого swing задаёт dealing range, от которого считаются premium и discount.',
  },
  FIB_WRONG_ANCHOR_END: {
    mistake: 'Конец сетки на {userTime} ({userPrice}), а импульс заканчивается на {refTime} ({refPrice}): смещение {offset} свечей при допуске ±{tol}.',
    why: '{reasonText} Конец импульса — первый подтверждённый внешний swing за пробитым уровнем {level}; после него началась коррекция.',
    howTo: 'Поставьте вторую точку на {refTime}: это уровень 0 сетки ({refPrice}).',
    principle: 'Уровни отката считаются от фактического экстремума; недотянутая сетка сдвигает все уровни.',
  },
  FIB_IMPULSE_UNCONFIRMED: {
    mistake: 'Конец сетки на {userTime} ещё не подтверждён как swing.',
    why: 'Справа от свечи меньше {n} закрытых свечей: импульс может продолжиться и сдвинуть уровень 0.',
    howTo: 'Дождитесь {n} закрытых свечей справа от экстремума и при обновлении экстремума перетяните сетку.',
    principle: 'Сетку строят по завершённому импульсу.',
  },
  FIB_LEVEL_MISS: {
    mistake: 'Выбран {given}, а реакция была от {expected}: коррекция дошла до {cPrice} ({depth} импульса) на {cTime}.',
    why: 'Реакция — первый разворот коррекции не меньше {thr} по закрытию (порог: {thrText}); разворот подтвердила свеча {reactionTime}. Конфлюэнс в зоне реакции: {confText}.',
    howTo: 'Перед выбором уровня проверьте, где уровень совпадает с OB, FVG или старым swing, и не выбирайте зону, которую цена уже прошла.',
    principle: 'Fibonacci показывает, где ждать реакцию; подтверждают её зона интереса и разворот.',
  },
  FIB_DEEP_MISSED: {
    mistake: 'Выбран {given}, но ни один уровень 0.382–0.786 не остановил коррекцию: экстремум {cPrice} ({depth} импульса) на {cTime}.',
    why: '{endText} Уровни без зоны интереса не удержали цену.',
    howTo: 'Проверьте, есть ли под уровнями ликвидность (равные экстремумы, начало импульса): её часто снимают перед разворотом или сломом.',
    principle: 'Уровень без зоны интереса — не поддержка и не сопротивление.',
  },
  FIB_CONFLUENCE_WRONG: {
    mistake: 'Указан конфлюэнс «{factorName}» на {given}, но в зоне [{low}–{high}] его нет.',
    why: '{factorRule}',
    howTo: 'Проверяйте конфлюэнс по правилам SMC-движка: OB — валидный и не инвалидированный, FVG — незаполненный, уровень — старый внешний swing в зоне.',
    principle: 'Конфлюэнс усиливает уровень, только если он есть на графике.',
  },
  FIB_PD_WRONG: {
    mistake: 'Цена {price} отнесена к {given}, а она в {expected}.',
    why: 'Equilibrium диапазона импульса — {eq} (уровень 0.5): выше — premium, ниже — discount.',
    howTo: 'Сравните цену с уровнем 0.5 сетки: лонги ищут в discount, шорты — в premium.',
    principle: 'Smart money покупает в discount и продаёт в premium.',
  },
  EXT_WRONG_DIRECTION: {
    mistake: 'Extension построен {givenDir}, а импульс направлен {expectedDir}.',
    why: 'Точка A — начало импульса, B — его конец; цели extension лежат за B по направлению импульса.',
    howTo: 'Поставьте A на {refATime} ({refAPrice}), B на {refBTime} ({refBPrice}), C на {refCTime} ({refCPrice}).',
    principle: 'Extension проецирует импульс в его же сторону.',
  },
  EXT_WRONG_POINTS: {
    mistake: 'Точка {point} на {userTime} ({userPrice}), эталон — {refTime} ({refPrice}): смещение {offset} свечей при допуске ±{tol}.',
    why: '{pointRule}',
    howTo: 'Поставьте точку {point} на свечу {refTime}: магнит привяжет её к {sideName} {refPrice}.',
    principle: 'Extension проецирует длину AB от конца коррекции C; ошибка любой точки сдвигает все цели.',
  },
  EXT_TARGET_MISS: {
    mistake: 'Цель {target} ({targetPrice}) не достигнута: максимум движения {maxPrice} ({xMax} от AB) на {maxTime}.',
    why: 'Движение закончилось {endText} {endTime}; максимально достигнутый уровень — {reached}.',
    howTo: 'Если после C нет BOS по направлению импульса или на пути есть встречная зона интереса, выбирайте ближнюю цель.',
    principle: 'Цель — там, куда рынок вероятно дойдёт, а не там, где больше прибыль.',
  },
  EXT_TARGET_CONSERVATIVE: {
    mistake: 'Цель {target} достигнута, но рынок дошёл дальше — до {reached} ({maxPrice}).',
    why: 'После C импульс продолжился с силой не меньше AB, уровень {reached} достигнут до инвалидации.',
    howTo: 'Когда после C есть BOS по направлению импульса и нет встречной зоны, держите часть позиции до следующего уровня extension.',
    principle: 'Частичная фиксация с переносом цели забирает продолжение тренда.',
  },
};

/** Плоский словарь `feedback.*` — совпадает с `templateKey` в FeedbackBlock. */
export function flattenTemplates(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(VERDICT_TEMPLATES_RU)) out[`feedback.verdict.${k}`] = v;
  for (const [k, v] of Object.entries(VERDICT_PLAIN_TEMPLATES_RU)) out[`feedback.verdict.plain.${k}`] = v;
  for (const [k, v] of Object.entries(CHALLENGE_VERDICT_TEMPLATES_RU)) out[`feedback.verdict.challenge.${k}`] = v;
  for (const [k, v] of Object.entries(PRINCIPLE_TEMPLATES_RU)) out[`feedback.principle.${k}`] = v;
  for (const [k, v] of Object.entries(OK_TEMPLATES_RU)) out[`feedback.ok.${k}`] = v;
  for (const [code, t] of Object.entries(ERROR_TEMPLATES_RU)) {
    out[`feedback.${code}.mistake`] = t.mistake;
    out[`feedback.${code}.why`] = t.why;
    out[`feedback.${code}.howTo`] = t.howTo;
    out[`feedback.${code}.principle`] = t.principle;
  }
  return out;
}

/** Подстановка {name}; отсутствующие параметры остаются плейсхолдером (UI форматирует время и цены сам). */
export function fillTemplate(template: string, params?: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, name: string) => {
    const v = params?.[name];
    return v === undefined ? m : String(v);
  });
}

/** Навык кода ошибки с учётом параметров (pa-* по `params.pattern`, MARK_WRONG_DIRECTION по `params.kind`, QUESTION_WRONG по `params.skill`). */
export function skillForError(code: ErrorCode, params?: Record<string, string | number>): SkillId {
  const fixed = ERROR_SKILLS[code];
  if (fixed) return fixed;
  if (code === 'MARK_WRONG_DIRECTION') {
    const m: Record<string, SkillId> = { sweep: 'sweep', 'order-block': 'order-block', fvg: 'fvg' };
    return m[String(params?.kind)] ?? 'sweep';
  }
  if (code === 'QUESTION_WRONG') return (params?.skill as SkillId | undefined) ?? 'bos';
  if (code === 'EXT_WRONG_POINTS') return params?.point === 'C' ? 'fib-extension' : 'fib-anchor';
  const p = String(params?.pattern ?? '');
  const map: Record<string, SkillId> = {
    engulfing: 'pa-engulfing',
    'pin-bar': 'pa-pin-bar',
    'inside-bar': 'pa-inside-bar',
    doji: 'pa-doji',
    'morning-star': 'pa-star',
    'evening-star': 'pa-star',
  };
  return map[p] ?? 'pa-engulfing';
}

/** Пояснения к `REASON_MISMATCH` ({reasonWhy}) по коду причины (ALGORITHMS §14.5). */
export const REASON_WHY_RU: Record<string, string> = {
  'trend-continuation': 'Для продолжения тренда нужен тренд рабочего ТФ в сторону сделки и последний BOS по этому тренду',
  'choch-reversal': 'Последнее внешнее событие не является CHoCH в сторону сделки или старше 30 свечей',
  'bos-confirmed': 'Последнее внешнее событие не является BOS в сторону сделки или старше 30 свечей',
  'sweep-reversal': 'За последние 10 свечей нет снятия ликвидности (sweep) в сторону сделки',
  'order-block-reaction': 'Цена последней свечи не касается валидного Order Block в сторону сделки',
  'fvg-fill': 'Цена последней свечи не заходит в незаполненный FVG в сторону сделки',
  'level-reaction': 'Последняя свеча не касается подходящего уровня поддержки/сопротивления',
  'htf-alignment': 'Тренд старшего ТФ не совпадает с направлением сделки',
  'range-no-edge': 'Структура определена и рядом есть зона интереса: это не флэт без края',
  'unclear-structure': 'Структура ясна: тренды ТФ совпадают и последние события не противоречат друг другу',
  'wait-other': 'При WAIT верны только причины «флэт без края» и «неясная структура»',
};

/** Русские названия моделей для `OK_PATTERN` ({pattern}) по навыку. */
export const PATTERN_NAMES_RU: Record<string, string> = {
  'pa-engulfing': 'Engulfing (поглощение)',
  'pa-pin-bar': 'Pin bar (пин-бар)',
  'pa-inside-bar': 'Inside bar (внутренний бар)',
  'pa-doji': 'Doji (доджи)',
  'pa-star': 'Morning/Evening star (утренняя/вечерняя звезда)',
};

/** Отображаемые имена типов меток: подстановки {kind}/{given}/{expected}/{kindName} выводятся только через этот словарь. */
export const KIND_NAMES_RU: Record<string, string> = {
  'swing-high': 'Swing High',
  'swing-low': 'Swing Low',
  hh: 'HH',
  hl: 'HL',
  lh: 'LH',
  ll: 'LL',
  bos: 'BOS',
  choch: 'CHoCH',
  sweep: 'Liquidity sweep',
  'order-block': 'Order Block',
  fvg: 'FVG',
  engulfing: 'Engulfing (поглощение)',
  'pin-bar': 'Pin bar (пин-бар)',
  'inside-bar': 'Inside bar (внутренний бар)',
  doji: 'Doji (доджи)',
  'morning-star': 'Morning star (утренняя звезда)',
  'evening-star': 'Evening star (вечерняя звезда)',
  level: 'Уровень',
  hline: 'Горизонталь',
  trendline: 'Трендовая',
  position: 'Позиция',
};

/** Имя типа по id или по подписи в любом регистре (HH, bos, order-block). */
export function kindName(v: string | number): string {
  const k = String(v);
  return KIND_NAMES_RU[k] ?? KIND_NAMES_RU[k.toLowerCase()] ?? k;
}

// ---- Fibonacci: словари текстовых параметров (FIBONACCI.md §11.4). Ядро кладёт в params готовые строки по значению кода. ----

/** `{givenDir}` / `{expectedDir}`. */
export const FIB_DIR_TEXT_RU: Record<'bull' | 'bear' | 'none', string> = {
  bull: 'вверх (от swing low к swing high)',
  bear: 'вниз (от swing high к swing low)',
  none: 'горизонтально (точки на одной цене)',
};
/** `{legText}` по `legKind`. */
export const FIB_LEG_TEXT_RU: Record<'correction' | 'previous-leg' | 'other', string> = {
  correction: 'коррекции после импульса',
  'previous-leg': 'предыдущей ноге',
  other: 'участке, который не является импульсом задания',
};
/** `{reasonText}` для начала сетки. */
export const FIB_START_REASON_RU: Record<'previous-leg' | 'internal' | 'offset', string> = {
  'previous-leg': 'Точка стоит на начале предыдущей ноги, до пробитого swing.',
  internal: 'Точка стоит на внутреннем откате внутри импульса.',
  offset: 'Точка стоит рядом, но не на экстремальной свече.',
};
/** `{reasonText}` для конца сетки. */
export const FIB_END_REASON_RU: Record<'short' | 'offset', string> = {
  short: 'Сетка не дотянута до конца импульса.',
  offset: 'Точка стоит рядом, но не на экстремальной свече.',
};
/** `{thrText}`: слагаемое max(), которое больше. */
export const FIB_THR_TEXT_RU: Record<'atr' | 'range', string> = { atr: '1.5 × ATR14', range: '0.236 размаха импульса' };
/** `{endText}` для FIB_DEEP_MISSED. */
export const FIB_DEEP_END_TEXT_RU: Record<'reaction' | 'fail', string> = {
  reaction: 'Цена развернулась только за 0.786.',
  fail: 'Импульс сломан: свеча закрылась за началом импульса.',
};
/** `{endText}` для EXT_TARGET_MISS. */
export const FIB_EXT_END_TEXT_RU: Record<'invalidation' | 'limit', string> = {
  invalidation: 'закрытием за точкой C на свече',
  limit: 'по лимиту времени на свече',
};
/** `{pointRule}`. */
export const FIB_POINT_RULE_RU: Record<'A' | 'B' | 'C', string> = {
  A: 'A — начало импульса, защищённый экстремум ноги, сломавшей структуру.',
  B: 'B — конец импульса, первый подтверждённый swing за пробитым уровнем.',
  C: 'C — экстремум коррекции между B и текущей свечой, от которого цена развернулась.',
};
/** `{factorName}` / `{factorRule}`. */
export const FIB_FACTOR_NAME_RU: Record<'order-block' | 'fvg' | 'level', string> = { 'order-block': 'Order Block', fvg: 'FVG', level: 'уровень' };
export const FIB_FACTOR_RULE_RU: Record<'order-block' | 'fvg' | 'level', string> = {
  'order-block': 'Учитывается только валидный OB направления импульса (с displacement), не инвалидированный к текущей свече и перекрывающий зону уровня.',
  fvg: 'Учитывается только FVG направления импульса не меньше 0.5 ATR, не заполненный к текущей свече и перекрывающий зону уровня.',
  level: 'Учитывается только старый внешний swing до начала импульса, цена которого лежит в зоне уровня.',
};
/** `{confText}`: перечень найденных факторов («старый swing» для уровня). */
export const FIB_CONF_TEXT_RU: Record<'order-block' | 'fvg' | 'level', string> = { 'order-block': 'Order Block', fvg: 'FVG', level: 'старый swing' };
/** Подписи вариантов «Где реакция?» (`{given}`, `{expected}`). */
export const FIB_OPTION_LABEL_RU: Record<'0.382' | '0.5' | '0.618' | '0.705' | '0.786' | 'ote' | 'deep', string> = {
  '0.382': '0.382',
  '0.5': '0.5',
  '0.618': '0.618',
  '0.705': '0.705',
  '0.786': '0.786',
  ote: 'OTE (0.62–0.79)',
  deep: 'глубже 0.786',
};
/** Подписи целей extension (`{target}`, `{reached}`). */
export const FIB_TARGET_LABEL_RU: Record<'1' | '1.272' | '1.618' | 'none', string> = {
  '1': '1.0',
  '1.272': '1.272',
  '1.618': '1.618',
  none: '«ни одна»',
};
/** `{sideName}`. */
export const FIB_SIDE_NAME = { low: 'low', high: 'high' } as const;
