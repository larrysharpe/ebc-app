import { z } from 'zod';

/** Virtual folder path segments separated by `/`. Empty = library root. */
export const mediaFolderPathSchema = z
  .string()
  .trim()
  .max(300)
  .regex(/^$|^[^/]+(?:\/[^/]+)*$/, 'Use folder segments separated by / (e.g. 2026/CLC Retreat)')
  .transform((value) => value.replace(/^\/+|\/+$/g, '').replace(/\/{2,}/g, '/'));

export const ministryFileLibrarySchema = z.enum(['media', 'documents']);

export const updateMinistryMediaMetaSchema = z.object({
  displayName: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(2000).optional(),
  folderPath: mediaFolderPathSchema.optional(),
});
