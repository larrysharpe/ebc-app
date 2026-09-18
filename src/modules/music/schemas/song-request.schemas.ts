import { z } from 'zod';

function emptyToUndefined(value: unknown): unknown {
  if (typeof value === 'string' && value.trim() === '') return undefined;
  return value;
}

export const songRequestInputSchema = z.object({
  title: z.string().trim().min(1, 'Song title is required.').max(200),
  artist: z.preprocess(emptyToUndefined, z.string().trim().max(200).optional()),
  youtubeUrl: z.preprocess(
    emptyToUndefined,
    z.string().trim().url('Enter a valid URL.').optional(),
  ),
  audioUrl: z.preprocess(
    emptyToUndefined,
    z.string().trim().url('Enter a valid URL.').optional(),
  ),
  defaultKey: z.preprocess(emptyToUndefined, z.string().trim().max(20).optional()),
  themes: z
    .union([z.array(z.string()), z.string()])
    .optional()
    .transform((value) => {
      if (!value) return [] as string[];
      if (Array.isArray(value)) {
        return value.map((item) => item.trim()).filter(Boolean);
      }
      return value
        .split(/[,;]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }),
  notes: z.preprocess(emptyToUndefined, z.string().trim().max(2000).optional()),
  reason: z.preprocess(emptyToUndefined, z.string().trim().max(1000).optional()),
});

export const songRequestIdSchema = z.object({
  id: z.string().min(1),
});

export const reviewSongRequestSchema = z.object({
  id: z.string().min(1),
  reviewNotes: z.preprocess(emptyToUndefined, z.string().trim().max(1000).optional()),
});

export type SongRequestInput = z.infer<typeof songRequestInputSchema>;
export type ReviewSongRequestInput = z.infer<typeof reviewSongRequestSchema>;
