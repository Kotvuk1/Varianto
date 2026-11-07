'use client';
// Панель «Сценарий»: основной (закрытый список), альтернатива (только допустимые пары), уровень invalidation (график или цена).
import type { EwPrimaryScenario, EwScenarioId } from '@tl/core';
import { useState } from 'react';
import { ewx } from '@/i18n/ru/elliott';
import { Button } from '@/ui';
import { AnswerList } from '../session/AnswerParts';
import { allowedAlternatives, NO_ALTERNATIVE, parsePrice } from './adapters';

export interface ScenarioPanelProps {
  primaryOptions: readonly EwPrimaryScenario[];
  primary: EwPrimaryScenario | null;
  onPrimary: (p: EwPrimaryScenario) => void;
  alternative: EwScenarioId | null;
  onAlternative: (a: EwScenarioId | null) => void;
  alternativeRequired: boolean;
  /** Цена горизонтали invalidation на графике. */
  invalidation: number | null;
  onInvalidation: (price: number | null) => void;
  disabled: boolean;
}

function InvalidationField({ value, onChange, disabled }: { value: number | null; onChange: (p: number | null) => void; disabled: boolean }) {
  // Черновик живёт, пока уровень на графике не изменился (перетаскивание линии сбрасывает ввод).
  const [draft, setDraft] = useState<{ text: string; base: number | null } | null>(null);
  const [invalid, setInvalid] = useState(false);
  const shown = draft && draft.base === value ? draft.text : value === null ? '' : String(value);
  const apply = () => {
    const p = parsePrice(shown);
    setInvalid(p === null);
    if (p !== null) {
      setDraft(null);
      onChange(p);
    }
  };
  return (
    <div>
      <label htmlFor="ew-inv-input" className="mb-1 block text-sm text-text-2">
        {ewx.panel.invInput}
      </label>
      <div className="flex items-center gap-2">
        <input
          id="ew-inv-input"
          data-testid="inv-input"
          inputMode="decimal"
          autoComplete="off"
          disabled={disabled}
          value={shown}
          placeholder={ewx.panel.invPlaceholder}
          aria-invalid={invalid || undefined}
          onChange={(e) => {
            setInvalid(false);
            setDraft({ text: e.target.value, base: value });
          }}
          onKeyDown={(e) => e.key === 'Enter' && apply()}
          className="tnum h-11 min-w-0 flex-1 rounded-md border border-border-strong bg-bg px-3 text-base"
        />
        <Button variant="secondary" size="md" onClick={apply} disabled={disabled} data-testid="inv-set">
          {ewx.panel.invSet}
        </Button>
        {value !== null && (
          <Button variant="ghost" size="md" onClick={() => onChange(null)} disabled={disabled} data-testid="inv-clear">
            {ewx.panel.invClear}
          </Button>
        )}
      </div>
      {invalid && (
        <p role="status" className="mt-1 text-sm text-text-1">
          {ewx.panel.invInvalid}
        </p>
      )}
      {value !== null && !invalid && (
        <p className="tnum mt-1 text-sm text-text-2" data-testid="inv-current">
          {ewx.panel.invOnChart}: {value}
        </p>
      )}
    </div>
  );
}

export function ScenarioPanel(p: ScenarioPanelProps) {
  const allowed = allowedAlternatives(p.primary);
  const altOptions = [
    ...allowed.map((a) => ({ id: a as string, label: ewx.scenario[a] })),
    ...(p.alternativeRequired ? [] : [{ id: NO_ALTERNATIVE, label: ewx.panel.altNone }]),
  ];
  return (
    <div data-testid="scenario-panel" className="space-y-4">
      <section aria-labelledby="ew-primary-h">
        <h3 id="ew-primary-h" className="text-sm font-semibold">
          {ewx.panel.primaryTitle}
        </h3>
        <p className="mb-1 text-sm text-text-2">{ewx.panel.primaryHelp}</p>
        <div className="overflow-hidden rounded-md border border-border-strong">
          <AnswerList
            label={ewx.panel.primaryTitle}
            options={p.primaryOptions.map((o) => ({ id: o, label: ewx.scenario[o] }))}
            value={p.primary}
            onChange={(id) => p.onPrimary(id as EwPrimaryScenario)}
            disabled={p.disabled}
          />
        </div>
      </section>
      <section aria-labelledby="ew-alt-h">
        <h3 id="ew-alt-h" className="text-sm font-semibold">
          {ewx.panel.altTitle}
        </h3>
        <p className="mb-1 text-sm text-text-2">
          {ewx.panel.altHelp} {p.alternativeRequired ? ewx.panel.altRequired : ewx.panel.altOptional}
        </p>
        {p.primary === null ? (
          <p data-testid="alt-need-primary" className="text-sm text-text-2">
            {ewx.panel.altNeedPrimary}
          </p>
        ) : (
          <div className="overflow-hidden rounded-md border border-border-strong">
            <AnswerList
              label={ewx.panel.altTitle}
              options={altOptions}
              value={p.alternative ?? (p.alternativeRequired ? null : NO_ALTERNATIVE)}
              onChange={(id) => p.onAlternative(id === NO_ALTERNATIVE ? null : (id as EwScenarioId))}
              disabled={p.disabled}
            />
          </div>
        )}
      </section>
      <section aria-labelledby="ew-inv-h">
        <h3 id="ew-inv-h" className="text-sm font-semibold">
          {ewx.panel.invTitle}
        </h3>
        <p className="mb-2 text-sm text-text-2">{ewx.panel.invHelp}</p>
        <InvalidationField value={p.invalidation} onChange={p.onInvalidation} disabled={p.disabled} />
      </section>
    </div>
  );
}
