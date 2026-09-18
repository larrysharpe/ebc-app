import { z } from 'zod';

export const eventTimeSuggestionSchema = z.object({
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional()
    .nullable(),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional()
    .nullable(),
  reason: z.string().trim().min(1).max(400),
});

export const eventTimeSuggestResponseSchema = z.object({
  summary: z.string().trim().min(1).max(600),
  suggestions: z.array(eventTimeSuggestionSchema).min(1).max(5),
});

export type EventTimeSuggestResponse = z.infer<
  typeof eventTimeSuggestResponseSchema
>;
