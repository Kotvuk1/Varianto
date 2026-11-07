import { getDeps } from '@/server/deps';
import { handleGrade } from '@/server/handlers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: Request, ctx: { params: Promise<{ module: string }> }): Promise<Response> {
  const { module } = await ctx.params;
  return handleGrade(request, module, getDeps());
}
