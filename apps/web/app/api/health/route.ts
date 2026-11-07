import { ALGO_VERSION } from '@tl/core';

export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({ status: 'ok', algoVersion: ALGO_VERSION });
}
