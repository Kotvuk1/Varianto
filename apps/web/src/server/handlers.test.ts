// @vitest-environment node
// Интеграционные тесты route handlers заданий на реальных фикстурах fixtures/ (data.binance.vision), без сети.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ALGO_VERSION, type Candle, type Mark } from '@tl/core';
import { ArchiveError } from '@tl/market-data';
import { FixtureLoader } from './fixture-loader';
import { handleGrade, handleNext, type HandlerDeps } from './handlers';
import { RateLimiter } from './rate-limit';
import { DAY_MS, type CandleLoader } from './sources';
import { shiftMark, withPartial } from './tasks';
import { open, seal, TOKEN_TTL_MS } from './token';

const SECRET = 'integration-secret-0123456789abcdef';
const NOW = Date.UTC(2026, 10, 3, 3);
const H4 = 4 * 3_600_000;
const loader = new FixtureLoader();
const mkDeps = (over: Partial<HandlerDeps> = {}): HandlerDeps => ({
  loader,
  now: () => NOW,
  newSeed: () => 1,
  secret: SECRET,
  range: { from: Date.UTC(2026, 6, 1), to: Date.UTC(2026, 9, 1) },
  gridStepMs: H4, // фикстуры без 1m для сентября: T на границе 4h, частичных свечей нет
  maxAttempts: 400,
  limiter: new RateLimiter({ capacity: 1000, now: () => NOW }),
  ...over,
});
const challengeDeps = (over: Partial<HandlerDeps> = {}) =>
  mkDeps({ warmupMs: 0, gridStepMs: DAY_MS, range: { from: Date.UTC(2026, 7, 14), to: Date.UTC(2026, 9, 22) }, ...over });

const req = (path: string, body: unknown, headers: Record<string, string> = {}) =>
  new Request(`http://localhost${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any;
const next = async (module: string, body: unknown, deps = mkDeps()) => {
  const res = await handleNext(req(`/api/tasks/${module}/next`, body), module, deps);
  return { res, json: (await res.json()) as Json };
};
const grade = async (module: string, body: unknown, deps = mkDeps()) => {
  const res = await handleGrade(req(`/api/tasks/${module}/grade`, body), module, deps);
  return { res, json: (await res.json()) as Json };
};

const MS_MARK = { module: 'market-structure', difficulty: 'medium', mode: 'mark', tf: '4h', symbol: 'BTCUSDT' };
const MS_Q = { ...MS_MARK, mode: 'question' };
const PA = (taskType: string) => ({ module: 'price-action', difficulty: 'medium', taskType, tf: '4h', symbol: 'BTCUSDT' });
const CH = { module: 'challenge', difficulty: 'medium', symbol: 'BTCUSDT' };

const asUser = (m: Mark, i: number): Mark => ({ ...m, id: `u${i}`, author: 'user' });

afterEach(() => vi.unstubAllEnvs());

describe('next: только прошлое, формат ответа', () => {
  const check = (json: Json, module: string) => {
    expect(json).toMatchObject({ module, difficulty: 'medium', symbol: 'BTCUSDT', algoVersion: ALGO_VERSION });
    expect(typeof json.taskToken).toBe('string');
    expect(json.expiresAt).toBe(NOW + TOKEN_TTL_MS);
    const header = open(json.taskToken, NOW, SECRET).header;
    expect(header).toMatchObject({ module, symbol: 'BTCUSDT', difficulty: 'medium', iat: NOW });
    // токен не содержит T в открытом виде
    expect(Buffer.from(json.taskToken.split('.')[1], 'base64url').toString()).not.toContain('decisionTime');
  };
  const onlyPast = (json: Json) => {
    const T: number = json.decisionTime;
    for (const [tf, candles] of Object.entries(json.series) as [string, Candle[]][]) {
      expect(candles.length, tf).toBeGreaterThan(0);
      for (const c of candles) {
        expect(c.openTime, tf).toBeLessThan(T);
        if (c.closed) expect(c.closeTime, tf).toBeLessThan(T);
      }
      expect(Math.max(...candles.filter((c) => c.closed).map((c) => c.closeTime)), tf).toBeLessThanOrEqual(T);
    }
  };

  it('market-structure / mark: 500 закрытых свечей tf, окно оценки, no-store', async () => {
    const { res, json } = await next('market-structure', MS_MARK);
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    check(json, 'market-structure');
    expect(json.timeline.mode).toBe('absolute');
    expect(Object.keys(json.series)).toEqual(['4h']);
    expect(json.series['4h']).toHaveLength(500);
    onlyPast(json);
    expect(json.payload).toMatchObject({ kind: 'ms-mark', tf: '4h' });
    expect(json.payload.concepts).toEqual(expect.arrayContaining(['bos', 'choch'])); // ступень 5: swing - в ступени 1 (CURRICULUM_STAGES.md §9.1)
    expect(json.payload.tools.length).toBeGreaterThan(0);
    expect(json.payload.window.toTime).toBe(json.series['4h'].at(-1).openTime);
  });

  it('market-structure / question: варианты без ответа и объяснения', async () => {
    const { res, json } = await next('market-structure', MS_Q);
    expect(res.status).toBe(200);
    onlyPast(json);
    expect(json.payload.kind).toBe('ms-question');
    expect(json.payload.options.length).toBeGreaterThanOrEqual(2);
    expect(JSON.stringify(json)).not.toMatch(/correctOptionId|explain/);
  });

  it('price-action: find-pattern, context (ряды tf и htf); draw-level переехал в levels', async () => {
    const find = await next('price-action', PA('find-pattern'));
    expect(find.res.status).toBe(200);
    check(find.json, 'price-action');
    onlyPast(find.json);
    expect(find.json.payload).toMatchObject({ kind: 'pa-find', tf: '4h' });
    expect(find.json.payload.window.fromTime).toBeLessThan(find.json.payload.window.toTime);

    expect((await next('price-action', PA('draw-level'))).res.status).toBe(400); // «Проведи уровень» -> levels/lv-strongest

    const ctx = await next('price-action', PA('context'));
    expect(ctx.res.status).toBe(200);
    onlyPast(ctx.json);
    expect(Object.keys(ctx.json.series).sort()).toEqual(['1d', '4h']);
    expect(ctx.json.series['1d'].every((c: Candle) => c.closed)).toBe(true);
    expect(ctx.json.payload.kind).toBe('pa-context');
    expect(ctx.json.payload.pattern).toMatchObject({ kind: 'pattern', author: 'algo' });
    expect(ctx.json.payload.factorOptions).toEqual(['sweep', 'order-block', 'key-level', 'htf-trend']);
  });

  it('challenge: относительная шкала, все четыре ТФ, реальная дата не раскрывается', async () => {
    const { res, json } = await next('challenge', CH, challengeDeps());
    expect(res.status).toBe(200);
    check(json, 'challenge');
    expect(json.timeline.mode).toBe('relative');
    expect(Object.keys(json.series).sort()).toEqual(['15m', '1d', '1h', '4h']);
    // 15m в сентябрьских фикстурах отсутствует (нет файлов); остальные ряды - только прошлое
    onlyPast({ decisionTime: json.decisionTime, series: Object.fromEntries(Object.entries(json.series).filter(([, v]) => (v as Candle[]).length > 0)) });
    // шкала сдвинута: ни одно число времени не похоже на 2026 год, а дата не просачивается в текст
    const REAL_2026 = Date.UTC(2026, 0, 1);
    expect(json.decisionTime).toBeLessThan(Date.UTC(2002, 0, 1));
    for (const candles of Object.values(json.series) as Candle[][]) for (const c of candles) expect(c.openTime).toBeLessThan(REAL_2026 / 2);
    expect(JSON.stringify(json)).not.toMatch(/2026-/);
    expect(json.payload).toMatchObject({ kind: 'challenge' });
    expect(json.payload.entryPrice).toBe(json.series['1h'].at(-1).close);
    expect(json.payload.reasonOptions.length).toBeGreaterThanOrEqual(10);
    expect(json.payload.timeLimitCandles).toEqual({ '15m': 96, '1h': 72, '4h': 60, '1d': 30 });
    // сдвиг кратен суткам: сетка 4h/1d сохраняется
    expect(json.series['4h'].every((c: Candle) => c.openTime % H4 === 0)).toBe(true);
    expect(json.series['1d'].every((c: Candle) => c.openTime % DAY_MS === 0)).toBe(true);
  });

  it('детерминизм: тот же seed -> та же ситуация; exclude даёт другую или 404', async () => {
    const a = await next('market-structure', MS_MARK);
    const b = await next('market-structure', MS_MARK);
    expect(b.json.decisionTime).toBe(a.json.decisionTime);
    expect(b.json.taskId).toBe(a.json.taskId);
    expect(b.json.series).toEqual(a.json.series);
    const c = await next('market-structure', { ...MS_MARK, exclude: [a.json.taskId] });
    if (c.res.status === 200) expect(c.json.taskId).not.toBe(a.json.taskId);
    else expect(c.res.status).toBe(404);
  });

  it('taskId не раскрывает T: перебор открытого хэша невозможен без секрета', async () => {
    const a = await next('market-structure', MS_MARK);
    expect(a.json.taskId).toMatch(/^[A-Za-z0-9_-]{16}$/);
  });
});

describe('частичная старшая свеча (sliceAt, ADR-0006)', () => {
  it('withPartial: 4h-свеча из 1m [openTime, T), closed=false, без данных позже T', async () => {
    const T = Date.UTC(2026, 9, 21, 10, 15);
    const bucket = Date.UTC(2026, 9, 21, 8);
    const visible = (await loader.candles('BTCUSDT', '4h', Date.UTC(2026, 9, 20), bucket)).filter((c) => c.closeTime < T);
    const shown = await withPartial(mkDeps(), 'BTCUSDT', '4h', visible, T);
    const last = shown!.at(-1)!;
    expect(shown).toHaveLength(visible.length + 1);
    expect(last).toMatchObject({ openTime: bucket, closed: false });
    const minutes = (await loader.candles('BTCUSDT', '1m', bucket, T));
    expect(minutes).toHaveLength(135);
    expect(last.high).toBe(Math.max(...minutes.map((m) => m.high)));
    expect(last.close).toBe(minutes.at(-1)!.close);
  });
  it('withPartial: пропуск 1m -> null (сценарий отбраковывается)', async () => {
    expect(await withPartial(mkDeps(), 'BTCUSDT', '4h', [], Date.UTC(2026, 8, 21, 10, 15))).toBeNull();
  });
  it('shiftMark: время сдвигается, id не содержит реального времени', () => {
    const m: Mark = { id: 'algo:level:external:-:1792454400000', kind: 'level', anchors: [{ time: 1792454400000, price: 5 }], scope: 'external', direction: null, meta: { confirmedTime: 1792454400000 }, author: 'algo' };
    const s = shiftMark(m, DAY_MS, 'hint:0');
    expect(s.id).toBe('hint:0');
    expect(s.anchors[0]!.time).toBe(1792454400000 - DAY_MS);
    expect(s.meta!.confirmedTime).toBe(1792454400000 - DAY_MS);
  });
});

describe('grade: круг next -> grade на эталоне из ответа API', () => {
  it('market-structure / mark: пустой ответ неверен, копия эталона даёт score 1', async () => {
    const t = (await next('market-structure', MS_MARK)).json;
    const bad = await grade('market-structure', { taskToken: t.taskToken, answer: { kind: 'ms-mark', marks: [] } });
    expect(bad.res.status).toBe(200);
    expect(bad.json.verdict).toBe('incorrect');
    expect(bad.json.errors.map((e: Json) => e.code)).toContain('CHOCH_MISSING');
    expect(bad.json.reference.length).toBeGreaterThan(2);
    expect(Object.keys(bad.json.feedback).sort()).toEqual(['howTo', 'mistakes', 'principle', 'understood', 'verdict', 'why']);
    expect(bad.json.feedback.mistakes.length).toBe(bad.json.errors.length);
    // F-02: в params разбора нет «сырых» float (цены по tickSize символа)
    for (const b of bad.json.feedback.mistakes as Json[]) {
      for (const v of Object.values(b.params ?? {})) if (typeof v === 'number') expect(String(v)).not.toMatch(/\.\d{5,}/);
    }
    expect(bad.json.task).toMatchObject({ module: 'market-structure', tf: '4h', reveal: { decisionTime: t.decisionTime, shiftMs: 0 } });
    expect(bad.json.taskId).toBe(t.taskId);
    expect(bad.json.detail.kind).toBe('ms-mark');

    const marks = bad.json.reference.map(asUser);
    const good = await grade('market-structure', { taskToken: t.taskToken, answer: { kind: 'ms-mark', marks } });
    expect(good.json.score).toBe(1);
    expect(good.json.verdict).toBe('correct');
    expect(good.json.errors).toEqual([]);
    expect(good.json.detail.marks.missed).toEqual([]);
  });

  it('market-structure / question', async () => {
    const t = (await next('market-structure', MS_Q)).json;
    const ids: string[] = t.payload.options.map((o: Json) => o.id);
    const first = await grade('market-structure', { taskToken: t.taskToken, answer: { kind: 'ms-question', questionId: t.payload.questionId, optionId: ids[0] } });
    expect(first.res.status).toBe(200);
    const correct = first.json.detail.correctOptionId as string;
    const wrong = ids.find((i) => i !== correct)!;
    const w = await grade('market-structure', { taskToken: t.taskToken, answer: { kind: 'ms-question', questionId: t.payload.questionId, optionId: wrong } });
    expect(w.json.verdict).toBe('incorrect');
    expect(w.json.errors[0].code).toBe('QUESTION_WRONG');
    const r = await grade('market-structure', { taskToken: t.taskToken, answer: { kind: 'ms-question', questionId: t.payload.questionId, optionId: correct } });
    expect(r.json).toMatchObject({ verdict: 'correct', score: 1, errors: [] });
    // чужой questionId / несуществующий вариант -> 400
    const x = await grade('market-structure', { taskToken: t.taskToken, answer: { kind: 'ms-question', questionId: 'trend:999', optionId: correct } });
    expect(x.res.status).toBe(400);
    const y = await grade('market-structure', { taskToken: t.taskToken, answer: { kind: 'ms-question', questionId: t.payload.questionId, optionId: 'nope' } });
    expect(y.res.status).toBe(400);
  });

  it('price-action / find-pattern', async () => {
    const t = (await next('price-action', PA('find-pattern'))).json;
    const bad = await grade('price-action', { taskToken: t.taskToken, answer: { kind: 'pa-find', marks: [] } });
    expect(bad.res.status).toBe(200);
    expect(bad.json.errors.map((e: Json) => e.code)).toContain('PATTERN_MISSED');
    const good = await grade('price-action', { taskToken: t.taskToken, answer: { kind: 'pa-find', marks: bad.json.reference.map(asUser) } });
    expect(good.json).toMatchObject({ score: 1, verdict: 'correct', errors: [] });
  });

  it('price-action / context', async () => {
    const t = (await next('price-action', PA('context'))).json;
    const probe = await grade('price-action', {
      taskToken: t.taskToken,
      answer: { kind: 'pa-context', factors: { sweep: false, orderBlock: false, keyLevel: false, htfTrend: 'range' }, significant: false },
    });
    expect(probe.res.status).toBe(200);
    const exp = probe.json.detail.expected;
    const good = await grade('price-action', {
      taskToken: t.taskToken,
      answer: { kind: 'pa-context', factors: { sweep: exp.sweep, orderBlock: exp.orderBlock, keyLevel: exp.keyLevel, htfTrend: exp.htfTrend }, significant: exp.significant },
    });
    expect(good.json).toMatchObject({ verdict: 'correct', score: 1, errors: [] });
    const flipped = await grade('price-action', {
      taskToken: t.taskToken,
      answer: { kind: 'pa-context', factors: { sweep: !exp.sweep, orderBlock: !exp.orderBlock, keyLevel: !exp.keyLevel, htfTrend: exp.htfTrend === 'up' ? 'down' : 'up' }, significant: !exp.significant },
    });
    expect(flipped.json.score).toBeLessThan(0.5);
    expect(flipped.json.errors.length).toBeGreaterThanOrEqual(3);
  });

  it('challenge: WAIT и позиция; будущее на относительной шкале, дата раскрывается только здесь', async () => {
    const d = challengeDeps();
    const t = (await next('challenge', CH, d)).json;
    const wait = await grade('challenge', { taskToken: t.taskToken, answer: { kind: 'challenge', side: 'WAIT', tf: t.payload.defaultTf, reasons: ['range-no-edge'] } }, d);
    expect(wait.res.status).toBe(200);
    expect(wait.json.detail.challenge.outcome).toBeNull();
    expect(typeof wait.json.detail.challenge.waitCorrect).toBe('boolean');
    expect(wait.json.detail.challenge.quality.parts.map((p: Json) => p.key)).toEqual(['wait', 'reasons']);
    expect(wait.json.replay.candles.length).toBe({ '15m': 96, '1h': 72, '4h': 60, '1d': 30 }[t.payload.defaultTf as '1h']);
    const { shiftMs, decisionTime } = wait.json.task.reveal;
    expect(shiftMs % DAY_MS).toBe(0);
    expect(new Date(decisionTime).getUTCFullYear()).toBe(2026);
    expect(decisionTime - shiftMs).toBe(t.decisionTime);
    expect(wait.json.replay.candles[0].openTime).toBeGreaterThanOrEqual(t.decisionTime);
    expect(wait.json.replay.candles[0].openTime).toBeLessThan(Date.UTC(2002, 0, 1));

    const e = t.payload.entryPrice as number;
    const pos = await grade('challenge', { taskToken: t.taskToken, answer: { kind: 'challenge', side: 'LONG', tf: '1h', entry: e, sl: e * 0.99, tp: e * 1.03, reasons: ['htf-alignment'] } }, d);
    expect(pos.res.status).toBe(200);
    const o = pos.json.detail.challenge.outcome;
    expect(['tp', 'sl', 'timeout']).toContain(o.result);
    expect(o.exitTime).toBeLessThan(Date.UTC(2002, 0, 1));
    expect(pos.json.resolution.method).toBeTruthy();
    expect(pos.json.replay.exitIndex).not.toBeNull();
    expect(pos.json.replay.candles.length).toBe(pos.json.replay.exitIndex + 1);
    expect(pos.json.detail.challenge.quality.parts.map((p: Json) => p.key)).toContain('htf');
    expect(pos.json.score).toBeGreaterThanOrEqual(0);
    expect(pos.json.score).toBeLessThanOrEqual(1);
  });
});

describe('grade: golden GS-10 (resolveTrade) через API', () => {
  const g = JSON.parse(readFileSync(resolve(process.cwd(), '../../fixtures/golden/challenge_GS-10.BTCUSDT-15m-2026-10-20.resolve-trade.golden.json'), 'utf8'));
  const SHIFT = 2000 * DAY_MS;
  const ms = (v: string | number) => (typeof v === 'number' ? v : Date.parse(v));

  for (const e of g.expected as Json[]) it(e.case, async () => {
    const T = ms(e.position.T);
    const { token } = seal({
      header: { module: 'challenge', symbol: 'BTCUSDT', difficulty: 'medium' },
      sealed: { T, seed: 7, shiftMs: SHIFT, tf: '15m', params: { kind: 'challenge', defaultTf: '15m', entry: e.position.entry } },
      now: NOW,
      secret: SECRET,
    });
    const { res, json } = await grade('challenge', {
      taskToken: token,
      answer: { kind: 'challenge', side: e.position.side, tf: '15m', entry: e.position.entry, sl: e.position.sl, tp: e.position.tp, reasons: [] },
    });
    expect(res.status, JSON.stringify(json).slice(0, 300)).toBe(200);
    const o = json.detail.challenge.outcome;
    expect(o.result).toBe(e.result);
    expect(json.resolution.method).toBe(e.method);
    expect(o.method).toBe(e.method);
    expect(o.exitPrice).toBe(e.exitPrice);
    expect(o.exitTime + SHIFT).toBe(ms(e.exitTime));
    expect(o.rMultiple).toBeCloseTo(e.r, 9);
    expect(json.task.reveal).toEqual({ decisionTime: T, shiftMs: SHIFT });
    expect(json.replay.candles[0].openTime + SHIFT).toBe(T);
    expect(json.resolution.triggerTime + SHIFT).toBeGreaterThanOrEqual(T);
    if (e.case.startsWith('R1')) expect(json.resolution.triggerTf).toBe('aggTrades');
  });
});

describe('ошибки: 400 / 401 / 404 / 413 / 429 / 502 / 500', () => {
  const tokenFor = (over: Partial<Parameters<typeof seal>[0]['header']> = {}, now = NOW) =>
    seal({
      header: { module: 'challenge', symbol: 'BTCUSDT', difficulty: 'medium', ...over },
      sealed: { T: Date.UTC(2026, 9, 20), seed: 1, shiftMs: DAY_MS, tf: '15m', params: { kind: 'challenge', defaultTf: '15m', entry: 81903.3 } },
      now,
      secret: SECRET,
    }).token;
  const issues = (json: Json): string[] => json.error.details.issues.map((i: Json) => i.code);
  const ans = { kind: 'challenge', side: 'LONG', tf: '15m', entry: 81903.3, sl: 81895, tp: 81950, reasons: [] };

  it('неизвестный модуль -> 404; модуль в теле не совпал с путём -> 400', async () => {
    const a = await next('crypto', { difficulty: 'easy' });
    expect(a.res.status).toBe(404);
    expect(a.json.error.code).toBe('not_found');
    expect(a.res.headers.get('Cache-Control')).toBe('no-store');
    const b = await next('challenge', { ...CH, module: 'price-action' });
    expect(b.res.status).toBe(400);
  });

  it('валидация next: символ, ТФ, лишнее поле, exclude > 200', async () => {
    expect(issues((await next('market-structure', { ...MS_MARK, symbol: 'DOGEUSDT' })).json)).toContain('UNKNOWN_SYMBOL');
    expect(issues((await next('market-structure', { ...MS_MARK, tf: '5m' })).json)).toContain('UNKNOWN_TIMEFRAME');
    expect((await next('market-structure', { ...MS_MARK, extra: 1 })).res.status).toBe(400);
    expect((await next('challenge', { ...CH, tf: '1h' })).res.status).toBe(400);
    expect(issues((await next('challenge', { ...CH, exclude: Array.from({ length: 201 }, (_, i) => `id${i}`) })).json)).toContain('TOO_MANY_ITEMS');
    expect((await next('market-structure', { module: 'market-structure', difficulty: 'easy' })).res.status).toBe(400);
    const bad = await handleNext(req('/x', '{not json'), 'challenge', mkDeps());
    expect(bad.status).toBe(400);
  });

  it('валидация grade: > 200 меток, SL/TP не с той стороны, WAIT с позицией, длинная заметка, > 8 причин', async () => {
    const token = tokenFor();
    const mark = { id: 'm', kind: 'swing-high', anchors: [{ time: 1, price: 1 }], scope: null, direction: null, author: 'user' };
    const many = await grade('market-structure', { taskToken: token, answer: { kind: 'ms-mark', marks: Array.from({ length: 201 }, () => mark) } });
    expect(issues(many.json)).toContain('TOO_MANY_ITEMS');
    expect(issues((await grade('challenge', { taskToken: token, answer: { ...ans, sl: 90000 } })).json)).toContain('SL_WRONG_SIDE');
    expect(issues((await grade('challenge', { taskToken: token, answer: { ...ans, tp: 81000 } })).json)).toContain('TP_WRONG_SIDE');
    expect(issues((await grade('challenge', { taskToken: token, answer: { ...ans, sl: undefined } })).json)).toContain('SL_REQUIRED');
    expect(issues((await grade('challenge', { taskToken: token, answer: { ...ans, tp: undefined } })).json)).toContain('TP_REQUIRED');
    expect(issues((await grade('challenge', { taskToken: token, answer: { ...ans, side: 'WAIT' } })).json)).toContain('WAIT_HAS_POSITION_FIELDS');
    expect(issues((await grade('challenge', { taskToken: token, answer: { ...ans, note: 'x'.repeat(501) } })).json)).toContain('TEXT_TOO_LONG');
    expect(issues((await grade('challenge', { taskToken: token, answer: { ...ans, reasons: Array(9).fill('htf-alignment') } })).json)).toContain('TOO_MANY_ITEMS');
  });

  it('ENTRY_MISMATCH: вход не совпал с entryPrice токена', async () => {
    const r = await grade('challenge', { taskToken: tokenFor(), answer: { ...ans, entry: 81910, sl: 81800, tp: 82100 } });
    expect(r.res.status).toBe(400);
    expect(issues(r.json)).toContain('ENTRY_MISMATCH');
  });

  it('токен: подмена -> 401 invalid_token_signature, просрочка -> 401 token_expired', async () => {
    const t = tokenFor();
    const parts = t.split('.');
    const tampered = [...parts.slice(0, 2), parts[2]!.slice(0, -2) + (parts[2]!.at(-2) === 'A' ? 'B' : 'A') + parts[2]!.at(-1), parts[3]].join('.');
    const a = await grade('challenge', { taskToken: tampered, answer: ans });
    expect(a.res.status).toBe(401);
    expect(a.json.error.code).toBe('invalid_token_signature');
    const old = await grade('challenge', { taskToken: tokenFor({}, NOW - TOKEN_TTL_MS - 1), answer: ans });
    expect(old.res.status).toBe(401);
    expect(old.json.error.code).toBe('token_expired');
  });

  it('токен другого модуля / answer.kind не соответствует заданию -> 400', async () => {
    const t = tokenFor();
    expect((await grade('price-action', { taskToken: t, answer: { kind: 'pa-level', price: 1 } })).res.status).toBe(400);
    const k = await grade('challenge', { taskToken: t, answer: { kind: 'ms-question', questionId: 'a', optionId: 'b' } });
    expect(k.res.status).toBe(400);
    expect(k.json.error.details.issues[0].path).toBe('answer.kind');
  });

  it('нет данных за период -> 404', async () => {
    const empty: CandleLoader = { candles: async () => [], aggTrades: async () => [] };
    const r = await grade('challenge', { taskToken: tokenFor(), answer: ans }, mkDeps({ loader: empty }));
    expect(r.res.status).toBe(404);
    expect(r.json.error.code).toBe('not_found');
  });

  it('архив недоступен -> 502 archive_unavailable (next и grade)', async () => {
    const down: CandleLoader = {
      candles: async () => {
        throw new ArchiveError('unavailable', 'down');
      },
      aggTrades: async () => [],
    };
    const g = await grade('challenge', { taskToken: tokenFor(), answer: ans }, mkDeps({ loader: down }));
    expect(g.res.status).toBe(502);
    expect(g.json.error.code).toBe('archive_unavailable');
    const n = await next('market-structure', MS_MARK, mkDeps({ loader: down }));
    expect(n.res.status).toBe(502);
  });

  it('aggTrades недоступны -> conservative-sl, а не ошибка (ADR-0007)', async () => {
    const noAgg: CandleLoader = { candles: (...a) => loader.candles(...a), aggTrades: async () => { throw new ArchiveError('unavailable', 'x'); } };
    const r = await grade('challenge', { taskToken: tokenFor(), answer: ans }, mkDeps({ loader: noAgg }));
    expect(r.res.status).toBe(200);
    expect(r.json.resolution.method).toBe('conservative-sl');
    expect(r.json.detail.challenge.outcome.result).toBe('sl');
  });

  it('тело больше 64 КБ -> 413 (по Content-Length и по факту)', async () => {
    const big = JSON.stringify({ taskToken: 'x'.repeat(70_000), answer: {} });
    const a = await handleGrade(req('/x', big), 'challenge', mkDeps());
    expect(a.status).toBe(413);
    expect((await a.json()).error.code).toBe('payload_too_large');
    const chunked = new Request('http://localhost/x', {
      method: 'POST',
      body: new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode('{"a":"' + 'x'.repeat(70_000) + '"}')); c.close(); } }),
      // @ts-expect-error duplex нужен Node для потокового тела
      duplex: 'half',
    });
    expect((await handleNext(chunked, 'challenge', mkDeps())).status).toBe(413);
  });

  it('rate limit: сверх бакета -> 429 с Retry-After; next и grade делят бакет', async () => {
    let t = NOW;
    const limiter = new RateLimiter({ capacity: 2, refillPerMin: 30, now: () => t });
    const d = mkDeps({ limiter });
    const hdr = { 'x-forwarded-for': '9.9.9.9' };
    const call = (m: 'next' | 'grade') =>
      (m === 'next' ? handleNext : handleGrade)(req(`/api/tasks/challenge/${m}`, {}, hdr), 'challenge', d);
    expect((await call('next')).status).toBe(400);
    expect((await call('grade')).status).toBe(400);
    const r = await call('next');
    expect(r.status).toBe(429);
    expect(r.headers.get('Retry-After')).toBe('2');
    expect((await r.json()).error).toMatchObject({ code: 'rate_limited', details: { retryAfterSec: 2 } });
    t += 2000;
    expect((await call('next')).status).toBe(400);
  });

  it('production без TASK_SIGNING_SECRET -> 500 internal_error (не молча), без деталей наружу', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('TASK_SIGNING_SECRET', '');
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const r = await next('market-structure', MS_MARK, mkDeps({ secret: undefined }));
    expect(r.res.status).toBe(500);
    expect(r.json.error).toEqual({ code: 'internal_error', message: 'Internal error' });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
