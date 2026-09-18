import { z } from 'zod';

export const musicianIntakeInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Name is required.'),
  email: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().email('Enter a valid email.').optional(),
  ),
  phone: z.string().trim().max(40).optional(),
  instrument: z.enum(['keys', 'drums', 'violin', 'bass', 'congas']),
  serviceDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Service date must be YYYY-MM-DD.'),
  playerType: z.enum(['regular', 'guest']).default('guest'),
  paymentPaperworkComplete: z.boolean(),
  paymentNotes: z.string().trim().max(500).optional(),
});

export const musicianIntakeIdSchema = z.object({
  id: z.string().min(1),
});

export type MusicianIntakeInput = z.infer<typeof musicianIntakeInputSchema>;
