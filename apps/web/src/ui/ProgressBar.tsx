import { cn } from './cn';

export interface ProgressBarProps {
  value: number;
  max: number;
  /** Доступное имя; числовая подпись рядом обязательна на стороне экрана. */
  label: string;
  size?: 'sm' | 'md';
  className?: string;
}

/** Один цвет независимо от значения, без анимации. */
export function ProgressBar({ value, max, label, size = 'md', className }: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), max);
  const pct = max > 0 ? (clamped / max) * 100 : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn('w-full overflow-hidden rounded-sm bg-surface-2', size === 'md' ? 'h-2' : 'h-1.5', className)}
    >
      <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
    </div>
  );
}
