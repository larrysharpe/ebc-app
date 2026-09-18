import { z } from 'zod';

import {
  DUTY_NEEDED_COUNT_MAX,
  DUTY_NEEDED_COUNT_MIN,
} from '../constants/ministry.constants';

const optionalEmail = z
  .string()
  .trim()
  .max(200)
  .optional()
  .transform((value) => (value ? value : undefined))
  .pipe(z.union([z.undefined(), z.string().email('Enter a valid email')]));

const optionalSopId = z
  .string()
  .trim()
  .max(80)
  .optional()
  .transform((value) => (value ? value : undefined));

export const dutyNeededCountSchema = z.coerce
  .number({ invalid_type_error: 'Enter how many people are needed' })
  .int('Use a whole number')
  .min(DUTY_NEEDED_COUNT_MIN, 'Need at least 1 person')
  .max(DUTY_NEEDED_COUNT_MAX, 'Enter 99 or fewer');

export const addMinistryDutySchema = z.object({
  label: z.string().trim().min(1, 'Duty name is required').max(80),
  description: z.string().trim().max(300).optional(),
  email: optionalEmail,
  sopId: optionalSopId,
  neededCount: dutyNeededCountSchema.default(DUTY_NEEDED_COUNT_MIN),
  /** Optional custom id; otherwise derived from the label. */
  id: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(/^[a-z][a-z0-9_]*$/, 'Use lowercase letters, numbers, and underscores')
    .optional(),
});

export const updateMinistryDutySchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1, 'Duty name is required').max(80),
  description: z.string().trim().max(300).optional(),
  email: optionalEmail,
  sopId: optionalSopId,
  neededCount: dutyNeededCountSchema,
  active: z.boolean(),
});

export const removeMinistryDutySchema = z.object({
  id: z.string().trim().min(1),
});
