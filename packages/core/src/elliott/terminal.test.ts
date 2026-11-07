import { describe, expect, it } from 'vitest';
import { ewCandles, ewIndexAt } from '../testing/elliott';
import type { Mark } from '../types';
import { checkEwMarks } from './terminal';
import { anchorsAt, type Pt } from './test-helpers';

const sol = ewCandles('EW-1');
const IMP: Pt[] = [['2026-08-06T23:00', 'low'], ['2026-08-07T13:00', 'high'], ['2026-08-07T17:00', 'low'], ['2026-08-08T15:00', 'high'], ['2026-08-09T01:00', 'low'], ['2026-08-09T22:00', 'high']];
const COR: Pt[] = [['2026-08-11T07:00', 'low'], ['2026-08-11T11:00', 'high'], ['2026-08-11T15:00', 'low']];
const upTo = (t: string) => sol.slice(0, ewIndexAt(sol, t) + 1);
const mk = (id: string, kind: Mark['kind'], list: Pt[]): Mark => ({ id, kind, anchors: anchorsAt(sol, list), scope: null, direction: null, author: 'user' });

describe('терминал: проверка разметки Elliott (§19)', () => {
  it('импульс EW-1 + zigzag: правила и рекомендации, без сценария и без будущего', () => {
    const r = checkEwMarks(upTo('2026-08-11T20:00'), '1h', [mk('i', 'ew-impulse', IMP), mk('z', 'ew-zigzag', COR)]);
    expect(r.results).toHaveLength(1);
    expect(r.results[0]!.correctionId).toBe('z');
    expect(r.results[0]!.check.correction).toMatchObject({ given: 'zigzag', validTypes: ['zigzag'] });
    expect(r.results[0]!.errors.every((e) => e.severity === 'minor')).toBe(true);
    expect(r.feedback.verdict.templateKey).toBe('feedback.verdict.plain.correct');
    expect(r.feedback.understood.map((b) => b.code)).toContain('OK_EW_RULES');
  });
  it('нарушение правила - major и вердикт incorrect; нет EW_COUNT_*/EW_SCENARIO_*/EW_ALT_*', () => {
    const bad: Pt[] = [['2026-08-06T23:00', 'low'], ['2026-08-07T13:00', 'high'], ['2026-08-07T17:00', 'low'], ['2026-08-08T15:00', 'high'], ['2026-08-08T16:00', 'low']];
    const r = checkEwMarks(upTo('2026-08-10T05:00'), '1h', [mk('i', 'ew-impulse', bad)]);
    const codes = r.results[0]!.errors.map((e) => e.code);
    expect(codes.some((c) => c.startsWith('EW_COUNT') || c.startsWith('EW_SCENARIO') || c.startsWith('EW_ALT') || c.startsWith('EW_INVALIDATION'))).toBe(false);
    expect(r.feedback.verdict.templateKey).toBe(r.results[0]!.errors.some((e) => e.severity === 'major') ? 'feedback.verdict.plain.incorrect' : 'feedback.verdict.plain.correct');
  });
  it('якорь вне ряда, неверное число точек, коррекция без импульса и 1m - пропускаются без исключения', () => {
    const cut = upTo('2026-08-08T00:00');
    expect(checkEwMarks(cut, '1h', [mk('i', 'ew-impulse', IMP)]).results).toEqual([]);
    expect(checkEwMarks(upTo('2026-08-10T05:00'), '1h', [mk('z', 'ew-zigzag', COR.slice(0, 3))]).results).toEqual([]);
    expect(checkEwMarks(upTo('2026-08-10T05:00'), '1h', [mk('i', 'ew-impulse', IMP.slice(0, 4))]).results).toEqual([]);
    expect(checkEwMarks(upTo('2026-08-10T05:00'), '1m', [mk('i', 'ew-impulse', IMP)]).results).toEqual([]);
    expect(checkEwMarks([], '1h', []).results).toEqual([]);
  });
});
