import { LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from 'react';
import { cn } from './cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'lg' | 'md' | 'sm';

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-on-accent hover:bg-accent-hover active:bg-accent',
  secondary: 'border border-border-strong text-text-1 hover:bg-surface-2 active:bg-surface-2',
  ghost: 'text-text-1 hover:bg-surface-2 active:bg-surface-2',
};
const SIZE: Record<ButtonSize, string> = {
  lg: 'h-12',
  md: 'h-11 pointer-fine:h-9',
  sm: 'h-9',
};

/** Классы кнопки: для Link и других элементов. */
export function buttonClass(variant: ButtonVariant = 'secondary', size: ButtonSize = 'md', extra?: string) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-md px-4 text-sm font-medium whitespace-nowrap',
    'cursor-pointer select-none aria-disabled:cursor-not-allowed aria-disabled:border aria-disabled:border-border',
    'aria-disabled:bg-transparent aria-disabled:text-text-3 aria-disabled:hover:bg-transparent aria-disabled:active:bg-transparent',
    VARIANT[variant],
    SIZE[size],
    extra,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  loading?: boolean;
  /** Блокирует действие, оставаясь в порядке фокуса (aria-disabled). */
  disabled?: boolean;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  className,
  children,
  onClick,
  type = 'button',
  ...rest
}: ButtonProps) {
  const blocked = disabled || loading;
  return (
    <button
      type={type}
      aria-disabled={blocked || undefined}
      aria-busy={loading || undefined}
      className={buttonClass(variant, size, className)}
      onClick={(e) => {
        if (blocked) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      {...rest}
    >
      {loading ? <LoaderCircle size={20} strokeWidth={1.75} className="animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = 'secondary',
  size = 'md',
  icon,
  className,
  children,
  ...rest
}: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize; icon?: ReactNode }) {
  return (
    <Link className={buttonClass(variant, size, className)} {...rest}>
      {icon}
      {children}
    </Link>
  );
}
