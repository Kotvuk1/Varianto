import { cn } from './cn';

export interface StatProps {
  label: string;
  value: string;
  unit?: string;
  className?: string;
}

/** Значение + подпись. Цвет не зависит от знака и величины. */
export function Stat({ label, value, unit, className }: StatProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span className="tnum text-2xl font-semibold text-text-1">
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-text-2">{unit}</span>}
      </span>
      <span className="text-xs text-text-2">{label}</span>
    </div>
  );
}
