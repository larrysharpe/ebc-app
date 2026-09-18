import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().trim().email('Enter a valid church email'),
  password: z.string().min(1, 'Password is required'),
});

export type SignInInput = z.infer<typeof signInSchema>;
