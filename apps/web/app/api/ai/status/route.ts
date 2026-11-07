import { aiEnabled } from '../../../../src/server/ai/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET(): Response {
  return Response.json({ enabled: aiEnabled(process.env) }, { headers: { 'Cache-Control': 'no-store' } });
}
