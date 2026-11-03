import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

export interface ToolbarProps {
  label: string;
  /** horizontal — нижняя панель на мобильном; vertical — рейка на десктопе. */
  orientation?: 'horizontal' | 'vertical';
  children: ReactNode;
  className?: string;
}

/** Панель инструментов. Не фиксирована: размещается рамкой экрана (flex), учитывает safe-area. */
export function Toolbar({ label, orientation = 'horizontal', children, className }: ToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label={label}
      aria-orientation={orientation}
      className={cn(
        'flex shrink-0 bg-surface-1',
        orientation === 'horizontal'
          ? 'h-[calc(var(--toolbar-h)+env(safe-area-inset-bottom))] items-start gap-0 border-t border-border pb-[env(safe-area-inset-bottom)]'
          : 'w-(--rail-w) flex-col items-center gap-1 border-r border-border py-1',
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface ToolButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  label: string;
  icon: ReactNode;
  selected?: boolean;
  /** Группа с «веером»: треугольник в правом нижнем углу. */
  hasGroup?: boolean;
  /** Подпись под иконкой (мобильный). На < 375 px скрывается, остаётся aria-label. */
  showLabel?: boolean;
  /** Причина блокировки: кнопка остаётся в порядке фокуса. */
  disabledReason?: string;
}

export function ToolButton({
  label,
  icon,
  selected = false,
  hasGroup = false,
  showLabel = true,
  disabledReason,
  className,
  onClick,
  ...rest
}: ToolButtonProps) {
  const blocked = disabledReason !== undefined;
  return (
    <button
      type="button"
      aria-label={label}
      title={disabledReason ?? label}
      aria-pressed={selected}
      aria-disabled={blocked || undefined}
      onClick={(e) => {
        if (blocked) return e.preventDefault();
        onClick?.(e);
      }}
      className={cn(
        'relative flex h-14 w-12 shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-md',
        'max-[374px]:w-11 lg:size-11',
        selected ? 'bg-accent text-on-accent' : 'text-text-2 hover:text-text-1',
        blocked && 'cursor-not-allowed text-text-3 hover:text-text-3',
        className,
      )}
      {...rest}
    >
      {icon}
      {showLabel && <span className="text-xs leading-4 max-[374px]:sr-only lg:sr-only">{label}</span>}
      {hasGroup && (
        <span
          aria-hidden="true"
          className="absolute right-1 bottom-1 size-0 border-x-4 border-t-0 border-b-4 border-x-transparent border-b-current"
        />
      )}
    </button>
  );
}
