'use client';

import { useRef, type KeyboardEvent } from 'react';
import { cn } from './cn';

export interface SegmentedOption<V extends string> {
  value: V;
  label: string;
  disabled?: boolean;
}

export interface SegmentedProps<V extends string> {
  label: string;
  options: readonly SegmentedOption<V>[];
  value: V;
  onChange: (value: V) => void;
  className?: string;
}

/** Равные сегменты, role=radiogroup; стрелки влево/вправо переключают (пропуская недоступные). */
export function Segmented<V extends string>({ label, options, value, onChange, className }: SegmentedProps<V>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: KeyboardEvent, index: number) {
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    for (let step = 1; step <= options.length; step++) {
      const i = (index + dir * step + options.length * step) % options.length;
      const opt = options[i];
      if (opt && !opt.disabled) {
        onChange(opt.value);
        refs.current[i]?.focus();
        return;
      }
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('inline-flex w-full overflow-hidden rounded-md border border-border-strong', className)}
    >
      {options.map((o, i) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-disabled={o.disabled || undefined}
            tabIndex={selected ? 0 : -1}
            onClick={() => {
              if (!o.disabled && !selected) onChange(o.value);
            }}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              'h-11 min-w-11 flex-1 cursor-pointer px-3 text-sm font-medium whitespace-nowrap pointer-fine:h-9',
              selected ? 'bg-accent text-on-accent' : 'text-text-1 hover:bg-surface-2',
              o.disabled && 'cursor-not-allowed text-text-3 hover:bg-transparent',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
