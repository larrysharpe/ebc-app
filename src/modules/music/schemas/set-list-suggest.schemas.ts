import { z } from 'zod';

export const setListSuggestSlotSchema = z.object({
  slotId: z.string().min(1),
  songId: z.string().min(1).nullable(),
  reason: z.string().min(1).max(400),
});

export const setListSuggestResponseSchema = z.object({
  summary: z.string().min(1).max(800),
  slots: z.array(setListSuggestSlotSchema).min(1),
});

export type SetListSuggestResponseInput = z.infer<
  typeof setListSuggestResponseSchema
>;
