'use client';
import { ScanSearch } from 'lucide-react';
import type { ReactNode } from 'react';
import { ss } from '@/i18n/ru/session';
import { Button, cn } from '@/ui';

export interface RadioOption {
  id: string;
  label: string;
}

/** Варианты ответа крупными строками по 56 px (radio): выбор различим точкой и рамкой, не только цветом. */
export function AnswerList({ label, options, value, onChange, disabled }: { label: string; options: readonly RadioOption[]; value: string | null; onChange: (id: string) => void; disabled?: boolean }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-col">
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={on}
            aria-disabled={disabled || undefined}
            data-testid={`option-${o.id}`}
            onClick={() => !disabled && onChange(o.id)}
            className={cn(
              'flex min-h-14 w-full cursor-pointer items-center gap-3 border-b border-border px-3 py-2 text-left text-sm last:border-b-0',
              on ? 'bg-surface-2 font-medium' : 'hover:bg-surface-2',
            )}
          >
            <span aria-hidden className={cn('flex size-5 shrink-0 items-center justify-center rounded-full border-2', on ? 'border-accent' : 'border-border-strong')}>
              {on && <span className="size-2.5 rounded-full bg-accent" />}
            </span>
            <span className="min-w-0 flex-1">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Кнопка «Проверить»/«Ответить» (одно primary на экран). */
export function SubmitButton({ onClick, busy, label = ss.check, className }: { onClick: () => void; busy: boolean; label?: string; className?: string }) {
  return (
    <Button variant="primary" size="lg" loading={busy} onClick={onClick} data-testid="check-button" className={className} icon={<ScanSearch size={20} strokeWidth={1.75} />}>
      {busy ? ss.grading : label}
    </Button>
  );
}

/** Строка пояснения ошибки ввода под кнопкой (COPY §5.4). */
export function InputMessage({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <p role="status" data-testid="input-message" className="text-sm text-text-1">
      {text}
    </p>
  );
}

export function AsideSection({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="border-b border-border px-4 py-3 last:border-b-0">
      {title && <h2 className="mb-1 text-sm font-semibold">{title}</h2>}
      {children}
    </section>
  );
}
