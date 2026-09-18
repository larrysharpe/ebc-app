import { z } from 'zod';

import { MINISTRY_CATEGORIES } from '../types/ministry.types';

const categoryIds = Object.keys(MINISTRY_CATEGORIES) as [
  keyof typeof MINISTRY_CATEGORIES,
  ...(keyof typeof MINISTRY_CATEGORIES)[],
];

const optionalEmail = z
  .string()
  .trim()
  .max(200)
  .optional()
  .transform((value) => (value ? value : undefined))
  .pipe(z.union([z.undefined(), z.string().email('Enter a valid email')]));

export const updateMinistryMetadataSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  category: z.enum(categoryIds),
  description: z.string().trim().min(1, 'Description is required').max(2000),
  meetingSummary: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((value) => (value ? value : undefined)),
  contactEmail: optionalEmail,
  websiteUrl: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((value) => (value ? value : undefined))
    .pipe(z.union([z.undefined(), z.string().url('Enter a valid URL')])),
});

export type UpdateMinistryMetadataInput = z.infer<typeof updateMinistryMetadataSchema>;
