// Схемы входа /api/ai/explain. Лимиты длины - защита от раздувания промпта (и стоимости).
import { z } from 'zod';

export const MAX_QUESTION = 500;
export const MAX_HISTORY = 6;
export const MAX_BODY_BYTES = 24_000;

const codes = z.array(z.string().min(1).max(80)).max(30);

export const attemptContextSchema = z
  .object({
    module: z.string().regex(/^[a-z][a-z0-9-]{0,39}$/),
    grade: z
      .object({
        errors: codes,
        okCodes: codes,
        params: z.record(z.string().max(40), z.union([z.string().max(120), z.number()])).optional(),
      })
      .strict(),
    feedback: z.string().max(4000),
    userMarks: z.string().max(800).optional(),
    referenceSummary: z.string().max(800).optional(),
  })
  .strict();

export const explainSchema = z
  .object({
    attemptContext: attemptContextSchema,
    question: z.string().trim().min(1).max(MAX_QUESTION),
    history: z
      .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(2000) }).strict())
      .max(MAX_HISTORY)
      .default([]),
  })
  .strict();

export type ExplainInput = z.infer<typeof explainSchema>;
export type AttemptContext = z.infer<typeof attemptContextSchema>;
