import { z } from 'zod';
import { TIMEFRAME_MS, type CandleSeries } from '@tl/core';
import { ArchiveError, findGaps } from '@tl/market-data';
import { ArchiveSource } from '@tl/market-data/archive';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// API_CONTRACTS §3.2. Задания - только BTC/ETH/SOL.
const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'] as const;
const TIMEFRAMES = ['1m', '15m', '1h', '4h', '1d'] as const;
const MAX_CANDLES = 5000;
const MIN_AGE_MS = 2 * 86_400_000;

const CACHE_IMMUTABLE = 'public, max-age=31536000, s-maxage=31536000, immutable';
const CACHE_SHORT = 'public, max-age=300, s-maxage=300';

const ISSUE_CODES = new Set([
  'INVALID_TYPE',
  'OUT_OF_RANGE',
  'UNKNOWN_SYMBOL',
  'UNKNOWN_TIMEFRAME',
  'RANGE_NOT_ALIGNED',
  'RANGE_TOO_LARGE',
  'RANGE_TOO_RECENT',
]);

const missingOr = (code: string) => (iss: { input?: unknown }) =>
  iss.input === undefined ? 'INVALID_TYPE' : code;
const timeField = z
  .string({ error: 'INVALID_TYPE' })
  .regex(/^\d{1,15}$/, { error: 'INVALID_TYPE' })
  .transform(Number);

const querySchema = z
  .object({
    symbol: z.enum(SYMBOLS, { error: missingOr('UNKNOWN_SYMBOL') }),
    tf: z.enum(TIMEFRAMES, { error: missingOr('UNKNOWN_TIMEFRAME') }),
    from: timeField,
    to: timeField,
  })
  .strict()
  .superRefine((v, ctx) => {
    const step = TIMEFRAME_MS[v.tf];
    const add = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message });
    if (v.to <= v.from) add('to', 'OUT_OF_RANGE');
    if (v.from % step !== 0) add('from', 'RANGE_NOT_ALIGNED');
    if (v.to % step !== 0) add('to', 'RANGE_NOT_ALIGNED');
    if ((v.to - v.from) / step > MAX_CANDLES) add('to', 'RANGE_TOO_LARGE');
    if (v.to > Date.now() - MIN_AGE_MS) add('to', 'RANGE_TOO_RECENT');
  });

function errorResponse(
  status: number,
  code: string,
  message: string,
  issues?: { path: string; code: string; message: string }[],
): Response {
  return Response.json(
    { error: { code, message, ...(issues ? { details: { issues } } : {}) } },
    { status, headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function GET(request: Request): Promise<Response> {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = querySchema.safeParse(params);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => ({
      path: i.path.join('.'),
      code: ISSUE_CODES.has(i.message) ? i.message : 'INVALID_TYPE',
      message: i.message,
    }));
    return errorResponse(400, 'validation_failed', 'Invalid query', issues);
  }
  const { symbol, tf, from, to } = parsed.data;

  try {
    const archive = new ArchiveSource();
    const candles = await archive.get(symbol, tf, from, to);
    if (candles.length === 0) return errorResponse(404, 'not_found', 'No archive data for the requested period');
    const series: CandleSeries = { symbol, tf, source: 'binance-archive', candles };
    const gaps = findGaps(candles, tf, { from, to });
    return Response.json(
      { series, gaps },
      { headers: { 'Cache-Control': gaps.length === 0 ? CACHE_IMMUTABLE : CACHE_SHORT } },
    );
  } catch (e) {
    if (e instanceof ArchiveError) {
      if (e.code === 'not_found') return errorResponse(404, 'not_found', 'Archive file not found');
      return errorResponse(502, 'archive_unavailable', `Archive error: ${e.code}`);
    }
    return errorResponse(500, 'internal_error', 'Internal error');
  }
}
