// Общие zod-схемы API заданий (API_CONTRACTS §3.3, §3.4, §4.2). Все схемы strict: лишние поля -> 400.
import { z } from 'zod';
import { REASON_CODES, type ModuleId } from '@tl/core';
import { ApiError, validationError, type ValidationIssue } from './errors';

export const MAX_BODY_BYTES = 64 * 1024;
export const MAX_MARKS = 200;
export const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'] as const;
export const TASK_TFS = ['15m', '1h', '4h', '1d'] as const;
export const MODULES: readonly ModuleId[] = [
  'market-structure', 'price-action', 'challenge', 'fibonacci', 'elliott',
  'stage-swings', 'levels', 'limit-entry', 'stop-take', 'combo-level-trade', 'combo-smc-entry',
];

const SKILLS = [
  'swing', 'structure-labels', 'bos', 'choch', 'internal-external', 'sweep', 'order-block', 'fvg',
  'pa-engulfing', 'pa-pin-bar', 'pa-inside-bar', 'pa-doji', 'pa-star', 'pa-level', 'pa-context',
  'challenge-entry', 'challenge-risk', 'challenge-wait', 'fib-anchor', 'fib-reaction', 'fib-extension', 'premium-discount',
  'ew-impulse', 'ew-correction', 'ew-rules', 'ew-invalidation',
  'swing-trend', 'level-zone', 'level-reaction', 'limit-placement', 'limit-fill', 'stop-placement', 'take-profit', 'risk-reward',
] as const;
const MARK_KINDS = [
  'swing-high', 'swing-low', 'hh', 'hl', 'lh', 'll', 'bos', 'choch', 'sweep', 'order-block', 'fvg',
  'level', 'zone', 'hline', 'trendline', 'pattern', 'position', 'fib-retracement', 'fib-extension', 'ew-impulse', 'ew-zigzag', 'ew-flat',
] as const;

const difficulty = z.enum(['easy', 'medium', 'hard']);
const tf = z.enum(TASK_TFS);
const symbol = z.enum(SYMBOLS);
const price = z.number().positive().finite();

const nextBase = {
  module: z.string().optional(),
  difficulty,
  symbol: symbol.optional(),
  exclude: z.array(z.string().min(1).max(64)).max(200).optional(),
  focus: z.array(z.enum(SKILLS)).max(5).optional(),
};

export const NextSchemas = {
  'market-structure': z.object({ ...nextBase, mode: z.enum(['mark', 'question']), tf }).strict(),
  'price-action': z.object({ ...nextBase, taskType: z.enum(['find-pattern', 'context']), tf }).strict(),
  challenge: z.object(nextBase).strict(),
  fibonacci: z.object({ ...nextBase, taskType: z.enum(['grid', 'reaction', 'extension']), tf }).strict(),
  // tf из списка сложности проверяется при выборе (UNKNOWN_TIMEFRAME); без tf - по seed. focus на тип задания не влияет (ELLIOTT.md §19).
  elliott: z.object({ ...nextBase, tf: tf.optional() }).strict(),
  // курс по ступеням (CURRICULUM_STAGES.md §11.1); tf вне списка сложности -> 400 UNKNOWN_TIMEFRAME при выборе
  'stage-swings': z.object({ ...nextBase, taskType: z.enum(['sw-mark', 'sw-trend']), tf }).strict(),
  levels: z.object({ ...nextBase, taskType: z.enum(['lv-strongest', 'lv-zone', 'lv-reaction']), tf }).strict(),
  'limit-entry': z.object({ ...nextBase, tf: tf.optional() }).strict(),
  'stop-take': z.object({ ...nextBase, tf: tf.optional() }).strict(),
  'combo-level-trade': z.object({ ...nextBase, tf: tf.optional() }).strict(),
  'combo-smc-entry': z.object({ ...nextBase, tf: tf.optional() }).strict(),
} as const;

export type NextRequest =
  | ({ module: 'market-structure' } & z.infer<(typeof NextSchemas)['market-structure']>)
  | ({ module: 'price-action' } & z.infer<(typeof NextSchemas)['price-action']>)
  | ({ module: 'challenge' } & z.infer<(typeof NextSchemas)['challenge']>)
  | ({ module: 'fibonacci' } & z.infer<(typeof NextSchemas)['fibonacci']>)
  | ({ module: 'elliott' } & z.infer<(typeof NextSchemas)['elliott']>)
  | ({ module: 'stage-swings' } & z.infer<(typeof NextSchemas)['stage-swings']>)
  | ({ module: 'levels' } & z.infer<(typeof NextSchemas)['levels']>)
  | ({ module: 'limit-entry' } & z.infer<(typeof NextSchemas)['limit-entry']>)
  | ({ module: 'stop-take' } & z.infer<(typeof NextSchemas)['stop-take']>)
  | ({ module: 'combo-level-trade' } & z.infer<(typeof NextSchemas)['combo-level-trade']>)
  | ({ module: 'combo-smc-entry' } & z.infer<(typeof NextSchemas)['combo-smc-entry']>);

export const AnchorSchema = z.object({ time: z.number().int().finite(), price: z.number().finite() }).strict();
export const UserMarkSchema = z
  .object({
    id: z.string().min(1).max(100),
    kind: z.enum(MARK_KINDS),
    anchors: z.array(AnchorSchema).min(1).max(6),
    scope: z.enum(['internal', 'external']).nullable(),
    direction: z.enum(['bull', 'bear']).nullable(),
    meta: z.record(z.string(), z.unknown()).optional(),
    author: z.literal('user'),
  })
  .strict();

const marksField = z.array(UserMarkSchema).max(MAX_MARKS);

export const ChallengeAnswerSchema = z
  .object({
    kind: z.literal('challenge'),
    side: z.enum(['LONG', 'SHORT', 'WAIT']),
    tf,
    entry: price.optional(),
    sl: price.optional(),
    tp: price.optional(),
    reasons: z.array(z.enum(REASON_CODES as [string, ...string[]])).max(8),
    note: z.string().max(500).optional(),
  })
  .strict()
  .superRefine((a, ctx) => {
    const add = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message });
    if (a.side === 'WAIT') {
      for (const f of ['entry', 'sl', 'tp'] as const) if (a[f] !== undefined) add(f, 'WAIT_HAS_POSITION_FIELDS');
      return;
    }
    if (a.entry === undefined) add('entry', 'ENTRY_MISMATCH');
    if (a.sl === undefined) add('sl', 'SL_REQUIRED');
    if (a.tp === undefined) add('tp', 'TP_REQUIRED');
    if (a.entry === undefined || a.sl === undefined || a.tp === undefined) return;
    const long = a.side === 'LONG';
    if (long ? a.sl >= a.entry : a.sl <= a.entry) add('sl', 'SL_WRONG_SIDE');
    if (long ? a.tp <= a.entry : a.tp >= a.entry) add('tp', 'TP_WRONG_SIDE');
  });

const fibMark = (kind: 'fib-retracement' | 'fib-extension', anchors: number) =>
  UserMarkSchema.superRefine((m, ctx) => {
    if (m.kind !== kind || m.anchors.length !== anchors) ctx.addIssue({ code: 'custom', path: ['anchors'], message: 'FIB_ANCHORS_COUNT' });
  });
const ewMark = (kinds: readonly ('ew-impulse' | 'ew-zigzag' | 'ew-flat')[], counts: readonly number[]) =>
  UserMarkSchema.superRefine((m, ctx) => {
    if (!(kinds as readonly string[]).includes(m.kind) || !counts.includes(m.anchors.length)) ctx.addIssue({ code: 'custom', path: ['anchors'], message: 'EW_ANCHORS_COUNT' });
  });
const EW_PRIMARY = ['w3-next', 'w5-next', 'abc-next', 'trend-next'] as const;
const EW_ALTERNATIVES = [...EW_PRIMARY, 'bc-next', 'correction-extends', 'impulse-extends'] as const;
const ewScenario = <T extends readonly string[]>(list: T) =>
  z.string().superRefine((v, ctx) => {
    if (!(list as readonly string[]).includes(v)) ctx.addIssue({ code: 'custom', message: 'EW_SCENARIO_UNKNOWN' });
  }) as unknown as z.ZodType<T[number]>;
const FIB_OPTIONS = ['0.382', '0.5', '0.618', '0.705', '0.786', 'ote', 'deep'] as const;
const FIB_TARGETS = ['1', '1.272', '1.618', 'none'] as const;

export const ElliottAnswerSchema = z
  .object({
    kind: z.enum(['ew-impulse', 'ew-impulse-correction', 'ew-scenario']),
    impulse: ewMark(['ew-impulse'], [3, 5, 6]),
    correction: ewMark(['ew-zigzag', 'ew-flat'], [3]).nullable(),
    primary: ewScenario(EW_PRIMARY),
    alternative: ewScenario(EW_ALTERNATIVES).nullable(),
    invalidation: z
      .number()
      .nullable()
      .superRefine((v, ctx) => {
        if (v !== null && !(Number.isFinite(v) && v > 0)) ctx.addIssue({ code: 'custom', message: 'EW_INVALIDATION_INVALID' });
      }),
  })
  .strict();
export type ElliottAnswerApi = z.infer<typeof ElliottAnswerSchema>;

/** Метка `zone` (CURRICULUM_STAGES.md §3.5): ровно 2 якоря с разными положительными ценами. */
const zoneMark = UserMarkSchema.superRefine((m, ctx) => {
  const [a, b] = m.anchors;
  if (m.kind !== 'zone' || m.anchors.length !== 2 || !a || !b || a.price === b.price || a.price <= 0 || b.price <= 0) {
    ctx.addIssue({ code: 'custom', path: ['anchors'], message: 'ZONE_MARK_INVALID' });
  }
});
export const LimitOrderSchema = z
  .object({ price, type: z.enum(['near-edge', 'middle', 'far-edge', 'front-run']), frontK: z.number().finite().nullable() })
  .strict()
  .superRefine((o, ctx) => {
    const ok = o.frontK !== null && o.frontK >= 0.05 && o.frontK <= 0.5;
    if (o.type === 'front-run' ? !ok : o.frontK !== null) ctx.addIssue({ code: 'custom', path: ['frontK'], message: 'LIMIT_TYPE_INVALID' });
  });
const comboAnswer = <K extends 'combo-level-trade' | 'combo-smc-entry'>(kind: K) =>
  z.object({ kind: z.literal(kind), zone: zoneMark, limit: LimitOrderSchema, sl: price, tp: price }).strict();

export const AnswerSchema = z.discriminatedUnion('kind', [
  // Устарело: «Проведи уровень» переехало в ступень 2 (lv-strongest); схема оставлена для совместимости типов клиента.
  z.object({ kind: z.literal('pa-level'), price }).strict(),
  z.object({ kind: z.literal('sw-mark'), marks: marksField }).strict(),
  z.object({ kind: z.literal('sw-trend'), questionId: z.string().min(1).max(64), optionId: z.enum(['up', 'down', 'range']) }).strict(),
  z.object({ kind: z.literal('lv-strongest'), price }).strict(),
  z.object({ kind: z.literal('lv-zone'), zone: zoneMark }).strict(),
  z.object({ kind: z.literal('lv-reaction'), optionId: z.string().min(1).max(8) }).strict(),
  z.object({ kind: z.literal('limit-entry'), limit: LimitOrderSchema }).strict(),
  z.object({ kind: z.literal('stop-take'), sl: price, tp: price }).strict(),
  comboAnswer('combo-level-trade'),
  comboAnswer('combo-smc-entry'),
  ElliottAnswerSchema,
  z.object({ kind: z.literal('fib-grid'), mark: fibMark('fib-retracement', 2) }).strict(),
  z
    .object({
      kind: z.literal('fib-reaction'),
      option: z.enum(FIB_OPTIONS),
      confluence: z.array(z.enum(['order-block', 'fvg', 'level'])).max(3),
      pd: z.enum(['premium', 'discount']).nullable(),
    })
    .strict()
    .superRefine((a, ctx) => {
      if (new Set(a.confluence).size !== a.confluence.length || (a.option === 'deep' && a.confluence.length > 0))
        ctx.addIssue({ code: 'custom', path: ['confluence'], message: 'FIB_CONFLUENCE_INVALID' });
    }),
  z.object({ kind: z.literal('fib-extension'), mark: fibMark('fib-extension', 3), target: z.enum(FIB_TARGETS) }).strict(),
  z.object({ kind: z.literal('ms-mark'), marks: marksField }).strict(),
  z.object({ kind: z.literal('ms-question'), questionId: z.string().min(1).max(64), optionId: z.string().min(1).max(64) }).strict(),
  z.object({ kind: z.literal('pa-find'), marks: marksField }).strict(),
  z
    .object({
      kind: z.literal('pa-context'),
      factors: z
        .object({ sweep: z.boolean(), orderBlock: z.boolean(), keyLevel: z.boolean(), htfTrend: z.enum(['up', 'down', 'range']) })
        .strict(),
      significant: z.boolean(),
    })
    .strict(),
  ChallengeAnswerSchema,
]);
export type Answer = z.infer<typeof AnswerSchema>;
export type ChallengeAnswer = z.infer<typeof ChallengeAnswerSchema>;
export type CurAnswer = Extract<Answer, { kind: 'sw-mark' | 'sw-trend' | 'lv-strongest' | 'lv-zone' | 'lv-reaction' | 'limit-entry' | 'stop-take' | 'combo-level-trade' | 'combo-smc-entry' }>;
export type FibAnswer = Extract<Answer, { kind: 'fib-grid' | 'fib-reaction' | 'fib-extension' }>;

export const GradeSchema = z.object({ taskToken: z.string().min(10).max(4096), answer: AnswerSchema }).strict();
export type GradeRequest = z.infer<typeof GradeSchema>;

const BUSINESS_CODES = new Set([
  'SL_REQUIRED', 'TP_REQUIRED', 'SL_WRONG_SIDE', 'TP_WRONG_SIDE', 'ENTRY_MISMATCH', 'WAIT_HAS_POSITION_FIELDS',
  'FIB_ANCHORS_COUNT', 'FIB_CONFLUENCE_INVALID',
  'EW_ANCHORS_COUNT', 'EW_SCENARIO_UNKNOWN', 'EW_INVALIDATION_INVALID',
  'ZONE_MARK_INVALID', 'ZONE_SIDE_MISMATCH', 'LIMIT_WRONG_SIDE', 'LIMIT_TYPE_INVALID', 'OPTION_UNKNOWN',
]);

/** zod-issue -> ValidationIssueCode контракта (API_CONTRACTS §1.1). */
export function toIssues(error: z.ZodError): ValidationIssue[] {
  return error.issues.map((i) => {
    const path = i.path.join('.');
    const last = String(i.path[i.path.length - 1] ?? '');
    let code = 'INVALID_TYPE';
    if (i.code === 'custom' && BUSINESS_CODES.has(i.message)) code = i.message;
    else if (i.code === 'too_big' && i.origin === 'array') code = 'TOO_MANY_ITEMS';
    else if (i.code === 'too_big' && i.origin === 'string') code = 'TEXT_TOO_LONG';
    else if (i.code === 'too_big' || i.code === 'too_small') code = 'OUT_OF_RANGE';
    else if (i.code === 'invalid_value' && last === 'symbol') code = 'UNKNOWN_SYMBOL';
    else if (i.code === 'invalid_value' && last === 'tf') code = 'UNKNOWN_TIMEFRAME';
    return { path, code, message: i.message };
  });
}

export function parseWith<S extends z.ZodType>(schema: S, value: unknown): z.infer<S> {
  const r = schema.safeParse(value);
  if (!r.success) throw new ApiError(400, 'validation_failed', 'Invalid request', { issues: toIssues(r.error) });
  return r.data;
}

/** Читает тело потоково с жёстким лимитом; 413 при превышении, 400 при некорректном JSON. */
export async function readJsonBody(request: Request, maxBytes = MAX_BODY_BYTES): Promise<unknown> {
  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > maxBytes) throw new ApiError(413, 'payload_too_large', 'Request body too large');
  const reader = request.body?.getReader();
  if (!reader) throw validationError('INVALID_TYPE', '', 'Empty body');
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel().catch(() => undefined);
      throw new ApiError(413, 'payload_too_large', 'Request body too large');
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw validationError('INVALID_TYPE', '', 'Body is not valid JSON');
  }
}
