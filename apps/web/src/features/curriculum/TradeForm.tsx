'use client';
// Форма лимитки (тип входа, опережение) и сводка плана сделки для ступени 3 и комбо.
import { useMemo } from 'react';
import type { LimitType } from '@tl/core';
import { cuSession as cs } from '@/i18n/ru/curriculum';
import { cn } from '@/ui';
import type { QualityPartDto } from '../session/types';

const TYPES: readonly LimitType[] = ['near-edge', 'middle', 'far-edge', 'front-run'];
const FRONT_VALUES = [0.1, 0.2, 0.3, 0.4, 0.5] as const;

function Chip({ on, onClick, children, testId, disabled }: { on: boolean; onClick: () => void; children: string; testId: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      data-testid={testId}
      aria-disabled={disabled || undefined}
      onClick={() => !disabled && onClick()}
      className={cn('min-h-11 cursor-pointer rounded-md border px-3 py-1.5 text-left text-sm', on ? 'border-accent bg-surface-2 font-medium' : 'border-border-strong hover:bg-surface-2')}
    >
      {children}
    </button>
  );
}

export interface LimitFormProps {
  type: LimitType | null;
  onType: (t: LimitType) => void;
  frontK: number | null;
  onFrontK: (k: number) => void;
  range: { min: number; max: number };
  disabled?: boolean;
  plan?: { limit: string | null; sl: string | null; tp: string | null; rr: string | null } | null;
}

export function LimitForm(p: LimitFormProps) {
  const values = useMemo(() => FRONT_VALUES.filter((v) => v >= p.range.min && v <= p.range.max), [p.range]);
  return (
    <div className="px-3 pt-2 lg:px-0 lg:pt-0" data-testid="limit-form">
      <div role="radiogroup" aria-label={cs.limitType} data-testid="limit-type" className="grid grid-cols-2 gap-1.5">
        {TYPES.map((t) => (
          <Chip key={t} on={p.type === t} onClick={() => p.onType(t)} testId={`limit-type-${t}`} {...(p.disabled ? { disabled: true } : {})}>
            {cs.limitTypes[t]}
          </Chip>
        ))}
      </div>
      {p.type === 'front-run' && (
        <div className="mt-1.5">
          <p className="text-xs text-text-2">{cs.frontK}</p>
          <div role="radiogroup" aria-label={cs.frontK} data-testid="front-k" className="mt-1 flex gap-1.5">
            {values.map((v) => (
              <Chip key={v} on={p.frontK === v} onClick={() => p.onFrontK(v)} testId={`front-k-${v}`} {...(p.disabled ? { disabled: true } : {})}>
                {cs.frontKValue(v)}
              </Chip>
            ))}
          </div>
        </div>
      )}
      {p.plan !== undefined && (
        <p data-testid="plan-line" className="tnum mt-1.5 min-h-5 text-xs text-text-2">
          {p.plan && (p.plan.limit || p.plan.sl) ? cs.planLine(p.plan.limit, p.plan.sl, p.plan.tp, p.plan.rr) : cs.planEmpty}
        </p>
      )}
    </div>
  );
}

/** Разбивка оценки по частям (нейтральные цифры). */
export function PartsSummary({ parts, quality }: { parts: readonly QualityPartDto[]; quality: number }) {
  return (
    <p data-testid="cur-parts" className="tnum">
      {cs.parts.title}: {parts.map((x) => cs.parts.line(cs.parts.keys[x.key], x.score, x.max)).join(' · ')} · {cs.parts.total(quality)}
    </p>
  );
}
