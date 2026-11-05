import type { ReactNode } from 'react';
import {
  AlignVerticalSpaceAround,
  ArrowLeftRight,
  ArrowRightToLine,
  ArrowUpFromLine,
  ChevronDown,
  ChevronUp,
  Crosshair,
  Eraser,
  Minus,
  MousePointer2,
  MoveDiagonal,
  RectangleHorizontal,
  SeparatorHorizontal,
  TrendingUp,
  Zap,
} from 'lucide-react';
import type { ToolId } from '@/chart/drawing/tools';

const ic = { size: 24, strokeWidth: 1.75, 'aria-hidden': true } as const;
const svgProps = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;
/** Сетка коррекции: уровни разной длины и диагональ импульса (форма, не цвет). */
const FibRetracementIcon = () => (
  <svg {...svgProps}>
    <path d="M3 5h18M3 10h18M3 15h18M3 20h18" />
    <path d="M6 20 18 5" strokeDasharray="2 2.5" />
  </svg>
);
/** Расширение: ножки A-B-C и уровни-цели справа. */
const FibExtensionIcon = () => (
  <svg {...svgProps}>
    <path d="M3 19 8 9l4 6" />
    <path d="M12 15h9M12 8h9M12 4h9" />
  </svg>
);
/** Волны: импульс 0-5 (ломаная с узлами), зигзаг и плоская (A-B-C), invalidation (горизонталь с флажком). */
const EwImpulseIcon = () => (
  <svg {...svgProps}>
    <path d="M2 20 7 11l3 5 6-12 3 8 3-4" />
  </svg>
);
const EwZigzagIcon = () => (
  <svg {...svgProps}>
    <path d="M3 6 9 18l5-8 7 9" strokeDasharray="3 2.5" />
  </svg>
);
const EwFlatIcon = () => (
  <svg {...svgProps}>
    <path d="M3 10 9 17l6-7 6 7" strokeDasharray="1 3" />
    <path d="M3 21h18" />
  </svg>
);
const EwInvalidationIcon = () => (
  <svg {...svgProps}>
    <path d="M3 13h18" />
    <path d="M7 13V5l5 2-5 2" />
  </svg>
);
const txt = (t: string): ReactNode => <span className="text-sm leading-6 font-semibold">{t}</span>;

export const TOOL_ICON: Record<ToolId, ReactNode> = {
  select: <MousePointer2 {...ic} />,
  eraser: <Eraser {...ic} />,
  'swing-high': <ChevronUp {...ic} />,
  'swing-low': <ChevronDown {...ic} />,
  hh: txt('HH'),
  hl: txt('HL'),
  lh: txt('LH'),
  ll: txt('LL'),
  bos: <ArrowRightToLine {...ic} />,
  choch: <ArrowLeftRight {...ic} />,
  sweep: <ArrowUpFromLine {...ic} />,
  'order-block': <RectangleHorizontal {...ic} />,
  fvg: <AlignVerticalSpaceAround {...ic} />,
  level: <Minus {...ic} />,
  hline: <SeparatorHorizontal {...ic} />,
  trendline: <MoveDiagonal {...ic} />,
  position: <Crosshair {...ic} />,
  'fib-retracement': <FibRetracementIcon />,
  'fib-extension': <FibExtensionIcon />,
  'ew-impulse': <EwImpulseIcon />,
  'ew-zigzag': <EwZigzagIcon />,
  'ew-flat': <EwFlatIcon />,
  'ew-invalidation': <EwInvalidationIcon />,
};

export type TerminalTool = keyof typeof TOOL_ICON;
export type GroupId = 'select' | 'structure' | 'breaks' | 'zones' | 'lines' | 'fib' | 'ew' | 'position' | 'smc';

export interface ToolGroup {
  id: GroupId;
  tools: readonly TerminalTool[];
  icon: ReactNode;
}

/** Семь групп рейки (ластик - отдельно внизу). Группы из одного инструмента не имеют flyout. */
export const GROUPS: readonly ToolGroup[] = [
  { id: 'select', tools: ['select'], icon: TOOL_ICON.select },
  { id: 'structure', tools: ['swing-high', 'swing-low', 'hh', 'hl', 'lh', 'll'], icon: <TrendingUp {...ic} /> },
  { id: 'breaks', tools: ['bos', 'choch', 'sweep'], icon: <Zap {...ic} /> },
  { id: 'zones', tools: ['order-block', 'fvg'], icon: <RectangleHorizontal {...ic} /> },
  { id: 'lines', tools: ['level', 'hline', 'trendline'], icon: <Minus {...ic} /> },
  { id: 'fib', tools: ['fib-retracement', 'fib-extension'], icon: <FibRetracementIcon /> },
  { id: 'ew', tools: ['ew-impulse', 'ew-zigzag', 'ew-flat', 'ew-invalidation'], icon: <EwImpulseIcon /> },
  { id: 'position', tools: ['position'], icon: TOOL_ICON.position },
];

/**
 * Мобильная панель: «Позиция» входит в веер «Линии», «Зоны» сливаются с «Пробои» в группу «SMC», чтобы 7 групп + Ластик + «Проверить»
 * помещались в 360 px (8 кнопок не уже 44 px).
 */
export const MOBILE_GROUPS: readonly ToolGroup[] = [
  GROUPS[0]!,
  GROUPS[1]!,
  { ...GROUPS[2]!, id: 'smc', tools: ['bos', 'choch', 'sweep', 'order-block', 'fvg'] },
  { ...GROUPS[4]!, tools: ['level', 'hline', 'trendline', 'position'] },
  GROUPS[5]!,
  GROUPS[6]!,
];

export const groupOf = (t: ToolId | null, groups: readonly ToolGroup[] = GROUPS): GroupId | null =>
  groups.find((g) => (g.tools as readonly string[]).includes(t ?? ''))?.id ?? null;

/** Горячие клавиши десктопа. Esc - отмена (обрабатывается отдельно). */
export const HOTKEYS: Readonly<Record<string, TerminalTool>> = {
  v: 'select',
  e: 'eraser',
  b: 'bos',
  c: 'choch',
  f: 'fvg',
  o: 'order-block',
  l: 'level',
  t: 'trendline',
  g: 'fib-retracement',
  w: 'ew-impulse',
};

export const HOTKEY_OF: Readonly<Partial<Record<TerminalTool, string>>> = Object.fromEntries(
  Object.entries(HOTKEYS).map(([k, t]) => [t, k.toUpperCase()]),
);
