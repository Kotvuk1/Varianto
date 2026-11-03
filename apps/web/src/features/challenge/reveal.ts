// Раскрытие сценария после разбора: реальное время = время шкалы задания + shiftMs.
import type { Feedback, FeedbackBlock } from '@tl/core';
import { relativeDuration } from './axis';
import { ch } from '@/i18n/ru/challenge';
import type { ChallengeGradeResult } from './types';

const TIME_KEYS = new Set(['time', 'refTime', 'eventTime', 'fromTime', 'toTime']);

const shiftBlock = (b: FeedbackBlock, shift: number): FeedbackBlock => {
  if (!b.params) return b;
  const params: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(b.params)) params[k] = typeof v === 'number' && TIME_KEYS.has(k) ? v + shift : v;
  return { ...b, params };
};

/** Времена в параметрах разбора приходят на шкале задания: возвращаем реальные, чтобы текст показывал локальное время. */
export function revealFeedback(f: Feedback, shiftMs: number): Feedback {
  const m = (xs: FeedbackBlock[]) => xs.map((b) => shiftBlock(b, shiftMs));
  return {
    verdict: shiftBlock(f.verdict, shiftMs),
    understood: m(f.understood),
    mistakes: m(f.mistakes),
    why: m(f.why),
    howTo: m(f.howTo),
    principle: shiftBlock(f.principle, shiftMs),
  };
}

/** «14 марта 2025, 14:00» в локальном поясе. */
export function formatScenarioDate(utcMs: number): string {
  const d = new Date(utcMs);
  const date = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${date}, ${time}`;
}

/** Пояснение к способу определения исхода (ADR-0007). null - пояснение не нужно. */
export function resolutionNote(r: ChallengeGradeResult, tfLabel: string): string | null {
  const o = r.detail.challenge.outcome;
  if (!o || !r.resolution) return null;
  const rel = relativeDuration(Math.max(0, r.resolution.triggerTime - r.task.reveal.decisionTime + r.task.reveal.shiftMs));
  const first = o.result === 'sl' ? ch.result.resolution.stop : ch.result.resolution.take;
  switch (r.resolution.method) {
    case 'drill-1m':
      return ch.result.resolution.drill1m(tfLabel, first, rel);
    case 'drill-aggtrades':
      return ch.result.resolution.drillAgg(tfLabel, first, rel);
    case 'conservative-sl':
      return ch.result.resolution.conservative;
    case 'timeout':
      return ch.result.resolution.timeout;
    default:
      return null;
  }
}
