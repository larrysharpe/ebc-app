import { z } from 'zod';

export const scheduleOverrideInputSchema = z.object({
  id: z.string().optional(),
  serviceDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Service date must be YYYY-MM-DD.'),
  choirGroup: z.string().min(1, 'Choir is required.'),
  note: z.string().trim().max(500).optional(),
});

export const scheduleOverrideIdSchema = z.object({
  id: z.string().min(1),
});

export type ScheduleOverrideInput = z.infer<typeof scheduleOverrideInputSchema>;
