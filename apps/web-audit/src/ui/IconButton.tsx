import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  /** Обязателен: имя для скринридера и подсказка при наведении. */
  label: string;
  icon: ReactNode;
  /** Режим переключателя (aria-pressed). */
  pressed?: boolean;
}

export function IconButton({ label, icon, pressed, className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className={cn(
        'inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-md border text-text-1',
        'hover:bg-surface-2 active:bg-surface-2 disabled:cursor-not-allowed disabled:text-text-3',
        pressed ? 'border-border-strong bg-surface-2' : 'border-transparent',
        className,
      )}
      {...rest}
    >
      {icon}
    </button>
  );
}
