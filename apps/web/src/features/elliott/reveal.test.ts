import { describe, expect, it } from 'vitest';
import type { ElliottDetail, Feedback } from '@tl/core';
import { outcomeLine } from './ResultExtra';
import { storableElliott } from './reveal';

const fmt = (p: number) => p.toFixed(1);
// SYNTHETIC: формат строки исхода по заданному EwOutcome, без свечей
const synthetic_detail = (outcome: Partial<ElliottDetail['outcome']>) =>
  ({ outcome: { basis: 'user', primary: 'abc-next', alternative: 'impulse-extends', levels: { invalidation: 65400, confirm: 1, altConfirm: 2 }, kind: 'primary', index: 1, time: 1, altAfterInvalidation: null, extreme: { high: 1, low: 1 }, ...outcome } }) as ElliottDetail;

describe('строка исхода', () => {
  it('какой сценарий сработал', () => {
    expect(outcomeLine(synthetic_detail({ kind: 'primary' }), 72, fmt)).toContain('основной');
    expect(outcomeLine(synthetic_detail({ kind: 'alternative' }), 72, fmt)).toContain('альтернатива');
    expect(outcomeLine(synthetic_detail({ kind: 'invalidated' }), 72, fmt)).toContain('65400.0');
    expect(outcomeLine(synthetic_detail({ kind: 'invalidated', altAfterInvalidation: 5 }), 72, fmt)).toContain('затем подтвердилась альтернатива');
    expect(outcomeLine(synthetic_detail({ kind: 'timeout' }), 72, fmt)).toContain('72');
  });
});

describe('storableElliott', () => {
  it('убирает проигрывание и возвращает реальные времена; вердикт не меняется', () => {
    // SYNTHETIC: минимальный разбор с одним параметром времени
    const feedback = {
      verdict: { templateKey: 'feedback.verdict.elliott.correct', params: { score: 90, outcomeTime: 1000 }, glyph: 'match' },
      understood: [], mistakes: [], why: [], howTo: [], principle: { templateKey: 'x', params: {}, glyph: 'match' },
    } as unknown as Feedback;
    const g = storableElliott({ feedback, replay: { candles: [] }, task: { reveal: { shiftMs: 500 } } });
    expect('replay' in g).toBe(false);
    expect(g.feedback.verdict.templateKey).toBe('feedback.verdict.elliott.correct');
    expect(g.feedback.verdict.params?.outcomeTime).toBe(1500);
  });
});
