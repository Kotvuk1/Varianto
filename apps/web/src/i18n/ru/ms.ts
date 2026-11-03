// Тексты Market Structure (COPY.md §7, ALGORITHMS §13). Термины SMC на английском с расшифровкой.
import type { SkillId } from '@tl/core';

export const msTx = {
  title: 'Market Structure',
  subtitle: 'Структура рынка',
  modes: { mark: 'Разметка', question: 'Вопрос' },
  modeHelp: {
    mark: 'Размечайте структуру на графике, алгоритм сравнит с эталоном.',
    question: 'Быстрый вопрос по подсвеченному месту графика.',
  },
  difficultyHelp: {
    easy: 'Явный тренд. Swing, HH/HL/LH/LL, BOS и CHoCH.',
    medium: 'Добавляются внешняя и внутренняя структура, Liquidity sweep и FVG.',
    hard: 'Ловушки с проколом фитилём, плюс Order Block.',
  },
  sessionTitle: { mark: 'Разметка', question: 'Вопрос' },
  referenceToggle: 'Справка по заданию',
  referenceClose: 'Свернуть справку',
  question: 'Вопрос',
  answerGroup: 'Варианты ответа',
  answerHelpDesktop: 'Выберите вариант ответа и нажмите «Ответить».',
  highlightNote: 'Нужное место подсвечено линией на графике.',
} as const;

/** Что делать в задании (COPY §7), по понятиям. */
/** Короткие названия понятий для фразы задания («Отметьте … в подсвеченной области»). */
export const msConceptShort: Partial<Record<SkillId, string>> = {
  swing: 'Swing High и Swing Low',
  'structure-labels': 'HH, HL, LH и LL',
  bos: 'BOS',
  choch: 'CHoCH',
  'internal-external': 'внешнюю и внутреннюю структуру',
  sweep: 'Liquidity sweep',
  'order-block': 'Order Block',
  fvg: 'FVG',
};

export function msFocusTask(focus: readonly SkillId[]): string {
  const names = focus.map((c) => msConceptShort[c]).filter((x): x is string => !!x);
  const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} и ${names[names.length - 1]}` : (names[0] ?? '');
  return `Отметьте ${list} в подсвеченной области.`;
}

export const msConceptTask: Partial<Record<SkillId, { name: string; task: string; term: string }>> = {
  swing: {
    name: 'Swing High / Swing Low',
    task: 'Отметьте все Swing High и Swing Low на графике.',
    term: 'Swing (свинг) — локальный экстремум: свеча, максимум (минимум) которой выше (ниже) соседних слева и справа.',
  },
  'structure-labels': {
    name: 'HH / HL / LH / LL',
    task: 'Подпишите структуру: HH, HL, LH или LL.',
    term: 'HH, HL, LH, LL (Higher High, Higher Low, Lower High, Lower Low) — каждый новый свинг выше или ниже предыдущего того же типа.',
  },
  bos: {
    name: 'BOS',
    task: 'Отметьте свечи, где произошёл BOS. Считается закрытие тела, не фитиль.',
    term: 'BOS (Break of Structure, слом структуры) — закрытие тела свечи за последним свингом по направлению тренда.',
  },
  choch: {
    name: 'CHoCH',
    task: 'Отметьте свечу, где структура сменила характер. Считается закрытие тела.',
    term: 'CHoCH (Change of Character, смена характера) — закрытие тела свечи за последним свингом против тренда.',
  },
  'internal-external': {
    name: 'Internal / External',
    task: 'Внешняя структура образована крупными свингами, внутренняя — мелкими внутри них. Отмечайте оба слоя.',
    term: 'Внешняя (external) и внутренняя (internal) структура — крупные и мелкие свинги соответственно.',
  },
  sweep: {
    name: 'Liquidity sweep',
    task: 'Отметьте свечу, которая собрала ликвидность.',
    term: 'Liquidity sweep (сбор ликвидности) — цена выходит за экстремум фитилём, забирает стопы и возвращается под уровень.',
  },
  'order-block': {
    name: 'Order Block',
    task: 'Выделите Order Block, с которого начался импульс.',
    term: 'Order Block (OB, ордерблок) — последняя противоположная свеча перед импульсом, сломавшим структуру.',
  },
  fvg: {
    name: 'FVG',
    task: 'Выделите FVG — разрыв между свечами.',
    term: 'FVG (Fair Value Gap, имбаланс) — разрыв между тенями первой и третьей из трёх свечей, не перекрытый второй.',
  },
};

const reference = {
  easy: 'Лёгкий уровень: явный тренд. Отмечайте то, что видно по закрытию тела свечи, фитиль пробоем не считается.',
  medium: 'Средний уровень: оцениваются внешняя и внутренняя структура. Проверьте, где прокол фитилём, а где закрытие тела.',
  hard: 'Сложный уровень: в графике есть ложные пробои. Отличайте Liquidity sweep (фитиль) от BOS и CHoCH (закрытие тела).',
} as const;

export const msReference = (key: string): string => {
  const d = key.replace('ms.reference.', '') as keyof typeof reference;
  return reference[d] ?? '';
};

type P = Record<string, string | number> | undefined;
const DAY_MONTH = new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'long' });
/** «2 мая, 14:00»: месяц в родительном падеже, время в локальном поясе. */
export function formatDateTimeRu(t: number): string {
  const d = new Date(t);
  return `${DAY_MONTH.format(d)}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
const fmtTime = (t: unknown) => (typeof t === 'number' ? formatDateTimeRu(t) : '');
const fmtNum = (v: unknown) => (typeof v === 'number' ? String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : String(v ?? ''));

/** Ключи вопросов и вариантов, которые отдаёт сервер (ALGORITHMS §13.3). */
export function msQuestionText(key: string, params?: P): string {
  switch (key) {
    case 'ms.q.trend.prompt':
      return 'Какой сейчас внешний тренд по структуре?';
    case 'ms.q.trend.up':
      return 'Восходящий (HH и HL)';
    case 'ms.q.trend.down':
      return 'Нисходящий (LH и LL)';
    case 'ms.q.trend.range':
      return 'Боковик (диапазон)';
    case 'ms.q.breakType.prompt':
      return `Что произошло на подсвеченной свече (${fmtTime(params?.time)})?`;
    case 'ms.q.breakType.bos':
      return 'BOS (слом структуры по тренду)';
    case 'ms.q.breakType.choch':
      return 'CHoCH (смена характера)';
    case 'ms.q.breakType.sweep':
      return 'Liquidity sweep (сбор ликвидности)';
    case 'ms.q.wickOrBody.prompt':
      return `Подсвечен уровень ${fmtNum(params?.level)}. Пробит ли он на свече ${fmtTime(params?.time)}?`;
    case 'ms.q.wickOrBody.body':
      return 'Да: тело закрылось за уровнем (BOS или CHoCH)';
    case 'ms.q.wickOrBody.wick':
      return 'Нет: только фитиль, закрытие осталось по эту сторону';
    case 'ms.q.protected.prompt':
      return params?.trend === 'up'
        ? 'Тренд восходящий. Какой уровень его защищает: закрытие тела ниже него будет CHoCH?'
        : 'Тренд нисходящий. Какой уровень его защищает: закрытие тела выше него будет CHoCH?';
    case 'ms.q.protected.option':
      return fmtNum(params?.price);
    default:
      return key;
  }
}
