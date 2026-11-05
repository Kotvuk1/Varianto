'use client';
import type { FibConfluenceKey, FibReactionOption, FibTarget, PdSide } from '@tl/core';
import { Annotated } from '@/features/guide';
import { fx } from '@/i18n/ru/fib';
import { cn } from '@/ui';

export interface ReactionFormProps {
  options: readonly FibReactionOption[];
  confluenceOptions: readonly FibConfluenceKey[];
  pdQuestion: { price: number } | null;
  fmtPrice: (p: number) => string;
  option: FibReactionOption | null;
  onOption: (o: FibReactionOption) => void;
  confluence: ReadonlySet<FibConfluenceKey>;
  onConfluence: (k: FibConfluenceKey) => void;
  pd: PdSide | null;
  onPd: (v: PdSide) => void;
  disabled: boolean;
}


interface ChoiceProps<V extends string> {
  label: string;
  prefix: string;
  options: readonly { value: V; label: string; title?: string }[];
  value: V | null;
  onChange: (v: V) => void;
  disabled: boolean;
  cols: 2 | 3 | 4;
}

const COLS = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' } as const;

/** Выбор одного из вариантов кнопками ≥44 px (radio): выбранный отмечен точкой и рамкой, не только цветом. */
function Choice<V extends string>(p: ChoiceProps<V>) {
  return (
    <div role="radiogroup" aria-label={p.label} className={cn('grid gap-1.5', COLS[p.cols])}>
      {p.options.map((o) => {
        const on = o.value === p.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={p.disabled}
            data-testid={`${p.prefix}-${o.value}`}
            title={o.title}
            onClick={() => p.onChange(o.value)}
            className={cn(
              'tnum min-h-11 cursor-pointer rounded-md border px-1 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60',
              on ? 'border-accent bg-surface-2 text-text-1' : 'border-border-strong text-text-2 hover:bg-surface-2',
            )}
          >
            {on && <span aria-hidden>● </span>}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Уровни крупными кнопками (≥44 px), конфлюэнс чекбоксами, вопрос Premium/Discount. */
export function ReactionForm(p: ReactionFormProps) {
  const deep = p.option === 'deep';
  return (
    <div className="flex flex-col gap-2 px-3 py-2 lg:px-0" aria-disabled={p.disabled || undefined}>
      <div>
        <p className="mb-1 text-sm font-medium">
          {fx.reaction.levelTitle}
        </p>
        <Choice<FibReactionOption>
          label={fx.reaction.levelGroup}
          prefix="level"
          cols={3}
          disabled={p.disabled}
          value={p.option}
          onChange={p.onOption}
          options={p.options.map((o) => ({ value: o, label: fx.reaction.options[o], ...(o === 'ote' ? { title: fx.reaction.optionHelp.ote } : {}) }))}
        />
      </div>
      <div>
        <p className="text-sm font-medium">{fx.reaction.confTitle}</p>
        <div role="group" aria-label={fx.reaction.confTitle} className="flex flex-wrap gap-x-4">
          {p.confluenceOptions.map((k) => (
            <label key={k} className={cn('flex min-h-11 cursor-pointer items-center gap-2 text-sm', deep && 'opacity-50')}>
              <input
                type="checkbox"
                className="size-5 accent-[var(--accent)]"
                data-testid={`conf-${k}`}
                checked={p.confluence.has(k)}
                disabled={p.disabled || deep}
                onChange={() => p.onConfluence(k)}
              />
              {fx.reaction.conf[k]}
            </label>
          ))}
        </div>
      </div>
      {p.pdQuestion && (
        <div data-testid="pd-question">
          <p className="mb-1 text-sm">
            <Annotated text={fx.reaction.pdQuestion(p.fmtPrice(p.pdQuestion.price))} />
          </p>
          <Choice<PdSide>
            label={fx.reaction.pdTitle}
            prefix="pd"
            cols={2}
            disabled={p.disabled}
            value={p.pd}
            onChange={p.onPd}
            options={[
              { value: 'premium', label: fx.reaction.pd.premium },
              { value: 'discount', label: fx.reaction.pd.discount },
            ]}
          />
        </div>
      )}
    </div>
  );
}

export function TargetPicker({ options, value, onChange, disabled }: { options: readonly FibTarget[]; value: FibTarget | null; onChange: (t: FibTarget) => void; disabled: boolean }) {
  return (
    <div className="px-3 py-2 lg:px-0" data-testid="target-picker">
      <p className="mb-1 text-sm font-medium">{fx.extension.targetTitle}</p>
      <Choice<FibTarget>
        label={fx.extension.targetGroup}
        prefix="target"
        cols={4}
        disabled={disabled}
        value={value}
        onChange={onChange}
        options={options.map((o) => ({ value: o, label: fx.extension.targets[o], ...(o === 'none' ? { title: fx.extension.targetHelp.none } : {}) }))}
      />
    </div>
  );
}
