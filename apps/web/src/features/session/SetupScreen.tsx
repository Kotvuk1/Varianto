'use client';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ss } from '@/i18n/ru/session';
import { ButtonLink, Segmented, type SegmentedOption } from '@/ui';

export interface SetupFieldProps<V extends string = string> {
  id: string;
  label: string;
  options: readonly SegmentedOption<V>[];
  value: V;
  onChange: (v: V) => void;
  help?: string;
}

export function SetupField<V extends string>({ id, label, options, value, onChange, help }: SetupFieldProps<V>) {
  return (
    <div className="py-3" data-testid={`setup-${id}`}>
      <h2 id={`setup-${id}-h`} className="mb-2 text-sm font-semibold">
        {label}
      </h2>
      <Segmented label={label} options={options} value={value} onChange={onChange} />
      {help && <p className="mt-2 text-sm text-text-2">{help}</p>}
    </div>
  );
}

/** Экран выбора задания модуля: режим, сложность, пара, ТФ, «Начать» (LAYOUTS §3, PRD 7.2 п.1). */
export function SetupScreen({ title, subtitle, children, startHref }: { title: string; subtitle: string; children: ReactNode; startHref: string }) {
  return (
    <div className="mx-auto w-full max-w-[560px] px-4 pb-8">
      <div className="flex items-center gap-1 py-2">
        <Link href="/" aria-label={ss.back} className="-ml-3 flex size-11 items-center justify-center rounded-md hover:bg-surface-2">
          <ChevronLeft size={20} strokeWidth={1.75} aria-hidden />
        </Link>
      </div>
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="mt-1 text-sm text-text-2">{subtitle}</p>
      <div className="mt-2 divide-y divide-border" role="group" aria-label={ss.setup.sectionsLabel}>
        {children}
      </div>
      <p className="mt-2 text-sm text-text-2">{ss.setup.realData}</p>
      <ButtonLink href={startHref} variant="primary" size="lg" className="mt-4 w-full" data-testid="start-session">
        {ss.start}
      </ButtonLink>
    </div>
  );
}

export interface ChoiceOption<V extends string> {
  value: V;
  label: string;
  help: string;
}

/** Выбор из 2-3 вариантов с пояснением (режим, тип задания): строки по 56+ px, точка и рамка выбранного. */
export function SetupChoice<V extends string>({ id, label, options, value, onChange }: { id: string; label: string; options: readonly ChoiceOption<V>[]; value: V; onChange: (v: V) => void }) {
  return (
    <div className="py-3" data-testid={`setup-${id}`}>
      <h2 className="mb-2 text-sm font-semibold">{label}</h2>
      <div role="radiogroup" aria-label={label} className="overflow-hidden rounded-md border border-border-strong">
        {options.map((o) => {
          const on = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(o.value)}
              className={`flex min-h-14 w-full cursor-pointer items-center gap-3 border-b border-border px-3 py-2 text-left last:border-b-0 ${on ? 'bg-surface-2' : 'hover:bg-surface-2'}`}
            >
              <span aria-hidden className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${on ? 'border-accent' : 'border-border-strong'}`}>
                {on && <span className="size-2.5 rounded-full bg-accent" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{o.label}</span>
                <span className="block text-sm text-text-2">{o.help}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
