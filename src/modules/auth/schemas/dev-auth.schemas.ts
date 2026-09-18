import { z } from 'zod';

export const switchDevAccountSchema = z.object({
  email: z.string().trim().email(),
  returnPath: z
    .string()
    .optional()
    .transform((value) => {
      if (!value || !value.startsWith('/') || value.startsWith('/login')) {
        return '/';
      }
      return value;
    }),
  stayOnPage: z.boolean().optional(),
});

export type SwitchDevAccountInput = z.infer<typeof switchDevAccountSchema>;
