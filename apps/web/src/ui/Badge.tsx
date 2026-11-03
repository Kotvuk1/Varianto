import type { ReactNode } from 'react';
import { cn } from './cn';

export interface BadgeProps {
  variant?: 'neutral' | 'outline';
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Неинтерактивная метка. Цветных вариантов успеха/ошибки нет. */
export function Badge({ variant = 'neutral', icon, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-5 items-center gap-1 rounded-sm px-2 text-xs font-medium whitespace-nowrap',
        variant === 'neutral' ? 'bg-surface-2 text-text-2' : 'border border-border-strong text-text-2',
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
