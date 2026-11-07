import { getAiDeps, handleExplain } from '../../../../src/server/ai/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function POST(request: Request): Promise<Response> {
  return handleExplain(request, getAiDeps());
}
