// Тексты курса из ступеней (CURRICULUM.md, CURRICULUM_STAGES.md): список «Обучение», выбор и сессии модулей ступеней 1-4 и комбо.
import type { Difficulty, StageId } from '@tl/core';
import { formatPercent, plural } from '@/i18n/format';

export type CurModule = 'stage-swings' | 'levels' | 'limit-entry' | 'stop-take' | 'combo-level-trade' | 'combo-smc-entry';
export type CurTaskType = 'sw-mark' | 'sw-trend' | 'lv-strongest' | 'lv-zone' | 'lv-reaction';
export type ComboId = 'combo-level-trade' | 'combo-smc-entry' | 'challenge';

export const STAGE_TEXT: Readonly<Record<StageId, { title: string; text: string }>> = {
  1: { title: 'Свинги', text: 'Swing High/Low, HH/HL/LH/LL, тренд по свингам' },
  2: { title: 'Уровни', text: 'Сильнейший уровень, зона, реакция цены' },
  3: { title: 'Лимитный вход', text: 'Где ставить лимитку на уровне и исполнится ли она' },
  4: { title: 'Стоп и тейк', text: 'Стоп за структурой, тейк у уровня, R:R' },
  5: { title: 'Smart Money Concepts', text: 'BOS, CHoCH, Liquidity sweep, Order Block, FVG' },
  6: { title: 'Свечные модели', text: 'Свечные модели и их значимость в контексте' },
  7: { title: 'Фибоначчи', text: 'Сетка, реакция, Extension, Premium/Discount' },
  8: { title: 'Волны Эллиотта', text: 'Импульс, коррекции, сценарии' },
};

export const COMBO_TEXT: Readonly<Record<ComboId, { title: string; text: string; needs: string }>> = {
  'combo-level-trade': { title: 'Уровень + лимитка + стоп/тейк', text: 'Полная сделка от уровня: зона, лимитка, стоп, тейк', needs: 'ступени 2, 3 и 4' },
  'combo-smc-entry': { title: 'SMC-вход', text: 'Order Block или FVG как зона для лимитки', needs: 'ступени 3, 4 и 5' },
  challenge: { title: 'Trading Challenge', text: 'Решение по графику без будущего', needs: 'ступени 1-5' },
};

export const learnCourse = {
  title: 'Курс',
  hint: 'Восемь ступеней, каждая про один навык. Все открыты; порядок рекомендованный.',
  listLabel: 'Ступени курса',
  recommended: 'Рекомендуем',
  passed: 'Пройдено',
  notStarted: 'Не начато',
  stageLabel: (n: number) => `Ступень ${n}`,
  progressLine: (attempts: number, min: number, acc: number | null, few: boolean) =>
    `${Math.min(attempts, min)} из ${min} ${plural(min, ['задания', 'заданий', 'заданий'])} · ${few || acc === null ? 'мало данных' : `точность ${formatPercent(acc)}`}`,
  barLabel: (title: string) => `Прогресс: ${title}`,
  comboTitle: 'Комбинированные модули',
  comboHint: 'Открываются, когда составные ступени пройдены: не меньше 10 заданий и точность от 70% на каждой.',
  open: 'Открыт',
  locked: 'Закрыт',
  legacyOpen: 'Открыт: вы уже торговали в Challenge',
  unlockTitle: 'Чтобы открыть:',
  remainTask: (stage: number, title: string, left: number) => `Ступень ${stage} «${title}»: ещё ${left} ${plural(left, ['задание', 'задания', 'заданий'])}`,
  remainAcc: (stage: number, title: string, acc: number | null) => `Ступень ${stage} «${title}»: точность ${acc === null ? 'пока не определена' : formatPercent(acc)}, нужна от 70%`,
  remainBoth: (stage: number, title: string, left: number, acc: number | null) =>
    `Ступень ${stage} «${title}»: ещё ${left} ${plural(left, ['задание', 'задания', 'заданий'])}, точность ${acc === null ? 'пока не определена' : formatPercent(acc)} (нужна от 70%)`,
  lockNote: 'Замок только в интерфейсе: прогресс не теряется, ступени открыты всегда.',
  loadError: 'Не удалось прочитать прогресс курса',
  loadErrorText: 'Локальное хранилище недоступно. Ступени ниже открываются без отметок прогресса.',
} as const;

export const cuSetup = {
  stageNote: (n: number) => `Ступень ${n}`,
  typeLabel: 'Тип задания',
  auto: 'Авто',
  titles: {
    'stage-swings': 'Свинги',
    levels: 'Уровни',
    'limit-entry': 'Лимитный вход',
    'stop-take': 'Стоп и тейк',
    'combo-level-trade': 'Уровень + лимитка + стоп/тейк',
    'combo-smc-entry': 'SMC-вход',
  } satisfies Record<CurModule, string>,
  subtitles: {
    'stage-swings': 'Ступень 1. Свинги и тренд по последовательности максимумов и минимумов.',
    levels: 'Ступень 2. Сила уровня, зона и реакция цены на реальных свечах.',
    'limit-entry': 'Ступень 3. Где ставить лимитный ордер у зоны: край, середина, опережение.',
    'stop-take': 'Ступень 4. Стоп за структурой с запасом и тейк у следующего уровня.',
    'combo-level-trade': 'Комбо (ступени 2-4). Зона, лимитка, стоп и тейк в одном задании.',
    'combo-smc-entry': 'Комбо (ступени 3-5). Order Block или FVG по направлению структуры как зона входа.',
  } satisfies Record<CurModule, string>,
  subtitleShort: {
    'stage-swings': 'Ступень 1',
    levels: 'Ступень 2',
    'limit-entry': 'Ступень 3',
    'stop-take': 'Ступень 4',
    'combo-level-trade': 'Комбо',
    'combo-smc-entry': 'Комбо',
  } satisfies Record<CurModule, string>,
  types: {
    'sw-mark': 'Разметь свинги',
    'sw-trend': 'Тренд по свингам',
    'lv-strongest': 'Найди сильнейший уровень',
    'lv-zone': 'Отметь зону',
    'lv-reaction': 'Какой уровень сработает',
  } satisfies Record<CurTaskType, string>,
  typeHelp: {
    'sw-mark': 'Отметьте все Swing High и Swing Low (и подписи HH/HL/LH/LL) в подсвеченной области.',
    'sw-trend': 'Определите тренд по двум последним максимумам и минимумам.',
    'lv-strongest': 'Проведите линию через самый сильный уровень рядом с ценой.',
    'lv-zone': 'Выделите прямоугольником зону уровня: от крайнего до крайнего разворота.',
    'lv-reaction': 'Выберите зону, от которой цена развернётся. Будущее проигрывается после ответа.',
  } satisfies Record<CurTaskType, string>,
  difficultyHelp: {
    'stage-swings': {
      easy: 'Только Swing High и Swing Low, окно до 60 свечей.',
      medium: 'Добавляются подписи HH, HL, LH, LL; доступны все таймфреймы.',
      hard: 'Более мелкие свинги (N = 5), окно до 70 свечей.',
    },
    levels: {
      easy: 'Роль уровня известна, на графике видны подсказки свингов.',
      medium: 'Роль уровня известна, подсказок нет, доступны все таймфреймы.',
      hard: 'Роль уровня не названа: ищите сильнейший уровень выше или ниже цены.',
    },
    'limit-entry': {
      easy: 'На графике подсказки: край зоны, середина, опережение.',
      medium: 'Без подсказок, таймфреймы 15m, 1H, 4H.',
      hard: 'Часть ситуаций с реакцией до края зоны или с проколом дальнего края.',
    },
    'stop-take': {
      easy: 'На графике линия структуры и кандидаты в цели.',
      medium: 'Без подсказок, таймфреймы 15m, 1H, 4H.',
      hard: 'Часть ситуаций с проколом зоны на свече входа или с близкой целью.',
    },
    'combo-level-trade': {
      easy: 'Сторона сделки известна, на графике подсказки уровней.',
      medium: 'Сторона известна, подсказок нет.',
      hard: 'Сторону определяет нарисованная зона: ниже цены - покупка, выше - продажа.',
    },
    'combo-smc-entry': {
      easy: 'На графике внешняя структура (swing, BOS, CHoCH).',
      medium: 'Без подсказок: найдите свежий Order Block или FVG по тренду.',
      hard: 'Без подсказок, таймфреймы 15m, 1H, 4H.',
    },
  } satisfies Record<CurModule, Record<Difficulty, string>>,
} as const;

export const cuSession = {
  loading: 'Подбираю ситуацию на реальных свечах…',
  hints: {
    'sw-mark': (concepts: string, n: number | null) => `Отметьте ${concepts} в подсвеченной области${n ? `: ожидается ${n} ${plural(n, ['метка', 'метки', 'меток'])}` : ''}.`,
    'sw-trend': 'Какой тренд по свингам: сравните два последних максимума и два последних минимума.',
    'lv-strongest-support': 'Проведите линию через самый сильный уровень поддержки ниже цены. Допуск около 0,3%.',
    'lv-strongest-resistance': 'Проведите линию через самый сильный уровень сопротивления выше цены. Допуск около 0,3%.',
    'lv-strongest-any': 'Проведите линию через самый сильный уровень рядом с ценой: поддержку или сопротивление. Допуск около 0,3%.',
    'lv-zone-support': 'Выделите зону самого сильного уровня поддержки ниже цены: от крайнего до крайнего разворота.',
    'lv-zone-resistance': 'Выделите зону самого сильного уровня сопротивления выше цены: от крайнего до крайнего разворота.',
    'lv-zone-any': 'Выделите зону самого сильного уровня рядом с ценой: от крайнего до крайнего разворота.',
    'lv-reaction-long': 'Цена идёт к зонам поддержки. От какой зоны она развернётся вверх?',
    'lv-reaction-short': 'Цена идёт к зонам сопротивления. От какой зоны она развернётся вниз?',
    'limit-entry-long': 'Поставьте лимитку на покупку у зоны поддержки и укажите тип входа.',
    'limit-entry-short': 'Поставьте лимитку на продажу у зоны сопротивления и укажите тип входа.',
    'stop-take': (side: 'LONG' | 'SHORT') => `Лимитка исполнена, вы в ${side === 'LONG' ? 'покупке' : 'продаже'}. Подвиньте стоп и тейк.`,
    'combo-level': (side: 'LONG' | 'SHORT' | null) =>
      `${side === null ? 'Сторону определит ваша зона. ' : side === 'LONG' ? 'Сделка на покупку. ' : 'Сделка на продажу. '}1) Отметьте зону сильного уровня. 2) Поставьте лимитку. 3) Подвиньте стоп и тейк.`,
    'combo-smc': (side: 'LONG' | 'SHORT') =>
      `Структура ${side === 'LONG' ? 'восходящая' : 'нисходящая'}. 1) Отметьте зону свежего OB или FVG по тренду. 2) Поставьте лимитку. 3) Подвиньте стоп и тейк.`,
  },
  details: {
    'sw-mark': 'Свинг подтверждён, когда справа от него есть N свечей без обновления экстремума. Допуск по времени - 2 свечи.',
    'sw-trend': 'HH и HL - восходящий, LH и LL - нисходящий, смешанные подписи - диапазон. Это тренд по свингам, а не по BOS/CHoCH.',
    'lv-strongest': 'Сила уровня растёт с числом касаний, размером реакций, свежестью и видимостью на старшем таймфрейме.',
    'lv-zone': 'Зона - разброс фитилей разворотов. Края в пределах 0,1 ATR от крайних разворотов, лишняя высота не больше 1 ATR.',
    'lv-reaction': 'Реакция - закрытие свечи на 1,5 ATR от экстремума у зоны. Закрытие за дальним краем - пробой зоны.',
    'limit-entry': 'Полный балл за цену от 0,3 ATR перед ближним краем до 0,1 ATR внутри зоны. Глубже - лучше цена, но выше шанс не исполниться.',
    'stop-take': 'Стоп за структурной точкой с запасом 0,25-1,5 ATR, тейк у следующего уровня или ликвидности, R:R от 2. Исход сделки в оценку не входит.',
    combo: 'Оценка складывается из зоны, места и типа лимитки, стопа, тейка и R:R. Исход сделки показывается в разборе, но оценку не меняет.',
  },
  options: { up: 'Восходящий (HH и HL)', down: 'Нисходящий (LH и LL)', range: 'Диапазон (смешанные подписи)' },
  optionsGroup: 'Тренд по свингам',
  reactionGroup: 'Зона, от которой развернётся цена',
  reactionOption: (id: string, bottom: string, top: string, touches: number | null, strength: number | null) =>
    `Зона ${id.replace('z', '')}: ${bottom} - ${top}${touches !== null && strength !== null ? ` · касаний ${touches}, сила ${strength.toFixed(1).replace('.', ',')}` : ''}`,
  reactionNone: 'Ни одна зона не удержит цену',
  limitType: 'Тип входа',
  limitTypes: {
    'near-edge': 'У ближнего края зоны',
    middle: 'В середине зоны',
    'far-edge': 'У дальнего края зоны',
    'front-run': 'С опережением (перед зоной)',
  },
  frontK: 'Опережение, ATR',
  frontKValue: (k: number) => k.toFixed(2).replace(/0$/, '').replace('.', ','),
  outcomeLine: (what: string, r: string) => `Исход сделки: ${what}, ${r}`,
  planTitle: 'План сделки',
  planLine: (limit: string | null, sl: string | null, tp: string | null, rr: string | null) =>
    [limit ? `Вход ${limit}` : null, sl ? `стоп ${sl}` : null, tp ? `тейк ${tp}` : null, rr ? `R:R ${rr}` : null].filter(Boolean).join(' · '),
  planEmpty: 'Лимитка и стоп/тейк появятся после зоны и лимитки.',
  input: {
    noMarks: 'Поставьте хотя бы одну метку.',
    noLevel: 'Проведите уровень: выберите инструмент «Уровень» и нажмите на график.',
    noZone: 'Отметьте зону: выберите инструмент «Зона» и нажмите на график два раза - у верхнего и нижнего края.',
    noLimit: 'Поставьте лимитку: выберите инструмент «Лимитка» и нажмите на график.',
    noType: 'Выберите тип входа.',
    noFront: 'Выберите величину опережения.',
    noAnswer: 'Выберите вариант ответа.',
    slSide: 'Стоп должен быть по другую сторону входа от цели.',
    tpSide: 'Тейк должен быть в сторону сделки от входа.',
    limitSide: 'Лимитка на покупку должна быть ниже цены, на продажу - выше.',
  },
  parts: {
    title: 'Оценка',
    keys: { placement: 'Место лимитки', type: 'Тип', fill: 'Исполнение', price: 'Цена входа', zone: 'Зона', sl: 'Стоп', tp: 'Тейк', rr: 'R:R' },
    line: (label: string, score: number, max: number) => `${label} ${Math.round(score)}/${max}`,
    total: (q: number) => `Итого ${Math.round(q)} из 100`,
  },
  replay: {
    title: 'Что произошло дальше',
    fill: 'Исполнен',
    cancelled: 'Ордер снят',
    tp: 'Тейк',
    sl: 'Стоп',
    timeout: 'Время вышло',
    reaction: 'Реакция',
    broken: 'Пробой',
    guideBand: 'Полный балл',
    stopHunt: 'Stop hunt',
  },
  levelDetail: {
    yours: (price: string) => `Ваш уровень: ${price}`,
    reference: (bottom: string, top: string, touches: number, strength: number) => `Эталон: зона ${bottom} - ${top}, касаний ${touches}, сила ${strength.toFixed(1).replace('.', ',')}`,
  },
  zoneDetail: {
    yours: (bottom: string, top: string) => `Ваша зона: ${bottom} - ${top}`,
    reference: (bottom: string, top: string, touches: number) => `Эталон: ${bottom} - ${top}, касаний ${touches}`,
  },
  trendDetail: {
    title: 'Подробности тренда',
    chosen: (c: string) => `Ваш ответ: ${c}`,
    correct: (c: string) => `Верный ответ: ${c}`,
  },
  scenarioDate: (d: string) => `Дата ситуации: ${d}`,
} as const;
