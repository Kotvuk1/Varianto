// Клиент MiniMax (OpenAI-совместимый Chat Completions). Источник: docs/AI.md.
export const DEFAULT_BASE_URL = 'https://api.minimax.io/v1';
export const DEFAULT_MODEL = 'MiniMax-M3.1-Flash';
export const TIMEOUT_MS = 25_000;

export interface MiniMaxResult {
  answer: string;
  model: string;
  id: string;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
}

export class MiniMaxError extends Error {
  constructor(
    readonly kind: 'timeout' | 'http' | 'api' | 'format',
    readonly detail: string,
  ) {
    super(detail);
    this.name = 'MiniMaxError';
  }
}

interface RawResponse {
  id?: unknown;
  model?: unknown;
  choices?: { message?: { content?: unknown } }[];
  usage?: { prompt_tokens?: unknown; completion_tokens?: unknown; total_tokens?: unknown };
  base_resp?: { status_code?: unknown; status_msg?: unknown };
}

const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : 0);

export async function callMiniMax(
  p: { apiKey: string; model: string; baseUrl?: string; messages: { role: string; content: string }[] },
  fetchImpl: typeof fetch = fetch,
): Promise<MiniMaxResult> {
  let res: Response;
  try {
    res = await fetchImpl(`${p.baseUrl ?? DEFAULT_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${p.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: p.model,
        messages: p.messages,
        // Flash всегда «думает»; low снижает задержку и стоимость. Лимит покрывает рассуждение и ответ.
        reasoning_effort: 'low',
        max_completion_tokens: 3000,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (e) {
    const name = e instanceof Error ? e.name : '';
    throw new MiniMaxError(name === 'TimeoutError' || name === 'AbortError' ? 'timeout' : 'http', name || 'network');
  }
  if (!res.ok) throw new MiniMaxError('http', `status ${res.status}`);
  let raw: RawResponse;
  try {
    raw = (await res.json()) as RawResponse;
  } catch {
    throw new MiniMaxError('format', 'invalid json');
  }
  const code = num(raw.base_resp?.status_code);
  if (code !== 0) throw new MiniMaxError('api', `base_resp ${code}`);
  const content = raw.choices?.[0]?.message?.content;
  if (typeof content !== 'string') throw new MiniMaxError('format', 'no content');
  // Страховка: если рассуждение попало в content в тегах <think>, убираем его.
  const answer = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  if (!answer) throw new MiniMaxError('format', 'empty answer');
  const prompt = num(raw.usage?.prompt_tokens);
  const completion = num(raw.usage?.completion_tokens);
  return {
    answer,
    model: typeof raw.model === 'string' ? raw.model : '',
    id: typeof raw.id === 'string' ? raw.id : '',
    usage: { promptTokens: prompt, completionTokens: completion, totalTokens: num(raw.usage?.total_tokens) || prompt + completion },
  };
}
