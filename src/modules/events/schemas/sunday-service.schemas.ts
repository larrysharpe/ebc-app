import { z } from 'zod';

import { SERVICE_CHARACTERISTICS } from '../types/sunday-service.types';

const characteristicSchema = z.enum(
  SERVICE_CHARACTERISTICS as [string, ...string[]],
);

const timeString = z
  .string()
  .regex(/^\d{2}:\d{2}$/, 'Use HH:MM time format')
  .optional()
  .or(z.literal(''));

export const sundayServiceInputSchema = z.object({
  serviceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Service date is required'),
  title: z.string().trim().max(160).optional().or(z.literal('')),
  characteristics: z.array(characteristicSchema).default([]),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
  startTime: timeString,
  endTime: timeString,
  status: z.enum(['scheduled', 'cancelled']).default('scheduled'),
});

export type SundayServiceInput = z.infer<typeof sundayServiceInputSchema>;
