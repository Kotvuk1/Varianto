import { describe, expect, it } from 'vitest';
import type { Feedback, FeedbackBlock } from '@tl/core';
import { renderBlock } from '../feedback';
import { localizeParam, revealFeedback } from './reveal';

const blk = (templateKey: string, params: Record<string, string | number>): FeedbackBlock => ({ templateKey, code: null, glyph: 'info', params });

describe('локализация параметров разбора Challenge', () => {
  it('тренды, события, ТФ и POI переводятся', () => {
    expect(localizeParam('htfTrend', 'up')).toBe('восходящий');
    expect(localizeParam('trendTf', 'down')).toBe('нисходящий');
    expect(localizeParam('lastEvent', 'BOS up')).toBe('BOS вверх');
    expect(localizeParam('htfTf', '4h')).toBe('4H');
    expect(localizeParam('poi', 'protected')).toBe('защищённый уровень');
    expect(localizeParam('side', 'LONG')).toBe('LONG');
  });
  it('итоговый текст не содержит англ. кодов направлений', () => {
    const b = blk('feedback.ok.OK_HTF', { htfTrend: 'up' });
    const f = { verdict: b, understood: [b], mistakes: [], why: [], howTo: [], principle: b } as Feedback;
    const r = revealFeedback(f, 0);
    const text = renderBlock(r.understood[0]!.templateKey, r.understood[0]!.params, (p) => String(p));
    expect(text).toBe('Сделка по направлению старшего тренда (восходящий).');
    expect(text).not.toMatch(/\b(up|down)\b/);
  });
});
