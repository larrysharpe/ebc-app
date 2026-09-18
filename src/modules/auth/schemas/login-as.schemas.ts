import { z } from 'zod';

export const loginAsUserSchema = z.object({
  userId: z.string().trim().min(1, 'User is required.'),
});

export type LoginAsUserInput = z.infer<typeof loginAsUserSchema>;
