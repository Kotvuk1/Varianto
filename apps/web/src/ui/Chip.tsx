import { Check } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from './cn';

export interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  selected: boolean;
  onSelectedChange: (next: boolean) => void;
}

/** Чип-переключатель: выбор различим галочкой, не только цветом. */
export function Chip({ selected, onSelectedChange, className, children, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelectedChange(!selected)}
      className={cn(
        'inline-flex h-11 cursor-pointer items-center gap-1 rounded-sm border px-3 text-sm whitespace-nowrap',
        'disabled:cursor-not-allowed disabled:text-text-3',
        selected
          ? 'border-accent bg-accent text-on-accent'
          : 'border-border-strong text-text-1 hover:bg-surface-2',
        className,
      )}
      {...rest}
    >
      {selected && <Check size={16} strokeWidth={1.75} aria-hidden />}
      {children}
    </button>
  );
}
