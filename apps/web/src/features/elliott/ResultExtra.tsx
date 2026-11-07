'use client';
// Итог Elliott под вердиктом: какой сценарий сработал, сценарий и invalidation пользователя, правила и рекомендации с числами.
import type { ElliottDetail } from '@tl/core';
import { ewx } from '@/i18n/ru/elliott';
import { formatScenarioDate } from '../challenge/reveal';

export interface ResultExtraProps {
  detail: ElliottDetail;
  limit: number;
  fmt: (p: number) => string;
  decisionTime: number | null;
}

export function outcomeLine(d: ElliottDetail, limit: number, fmt: (p: number) => string): string {
  const o = d.outcome;
  switch (o.kind) {
    case 'primary':
      return ewx.result.outcome.primary(ewx.scenarioShort[o.primary]);
    case 'alternative':
      return ewx.result.outcome.alternative(ewx.scenarioShort[o.alternative ?? o.primary]);
    case 'invalidated':
      return (o.altAfterInvalidation !== null ? ewx.result.outcome.invalidatedAlt : ewx.result.outcome.invalidated)(fmt(o.levels.invalidation));
    default:
      return ewx.result.outcome.timeout(limit);
  }
}

export function ResultExtra({ detail: d, limit, fmt, decisionTime }: ResultExtraProps) {
  const inv = d.invalidation;
  return (
    <div data-testid="ew-summary" className="mt-1 space-y-2 text-sm text-text-2">
      <div className="space-y-0.5">
        {decisionTime !== null && <p data-testid="ew-scenario-date">{ewx.result.scenarioDate(formatScenarioDate(decisionTime))}</p>}
        <p data-testid="ew-outcome" data-kind={d.outcome.kind}>
          {outcomeLine(d, limit, fmt)}
        </p>
        <p data-testid="ew-not-scored">{ewx.result.notScored}</p>
        {d.outcome.basis === 'reference' && <p>{ewx.result.basisRef}</p>}
      </div>
      <div className="space-y-0.5">
        <p data-testid="ew-scenario">{ewx.result.yourScenario(ewx.scenarioShort[d.scenario.primary], d.scenario.implied ? ewx.scenarioShort[d.scenario.implied] : null)}</p>
        <p data-testid="ew-alt">{ewx.result.altLine(d.scenario.alternative ? ewx.scenarioShort[d.scenario.alternative] : null, ewx.result.altStatus[d.scenario.altStatus])}</p>
        <p className="tnum" data-testid="ew-invalidation">
          {ewx.result.invLine(inv.given === null ? null : fmt(inv.given), fmt(inv.ruleLevel), ewx.result.refName[inv.ruleRef], ewx.result.invStatus[inv.status])}
        </p>
        {d.extended3 && <p>{ewx.result.extended3}</p>}
      </div>
      <section aria-label={ewx.result.rulesTitle}>
        <h3 className="font-semibold text-text-1">{ewx.result.rulesTitle}</h3>
        {d.rules.length === 0 ? (
          <p>{ewx.result.rulesEmpty}</p>
        ) : (
          <ul data-testid="ew-rules">
            {d.rules.map((r) => (
              <li key={r.rule}>
                {ewx.ruleNames[r.rule]}: {r.ok ? ewx.result.ruleOk : ewx.result.ruleBad}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section aria-label={ewx.result.guidesTitle}>
        <h3 className="font-semibold text-text-1">{ewx.result.guidesTitle}</h3>
        {d.guides.length === 0 ? (
          <p>{ewx.result.guidesEmpty}</p>
        ) : (
          <ul data-testid="ew-guides" className="tnum">
            {d.guides.map((g) => (
              <li key={g.guide}>{ewx.result.guideLine(ewx.guideNames[g.guide], g.actual.toFixed(3), g.expected, g.ok)}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
