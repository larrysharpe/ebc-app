import { z } from 'zod';

import { SLOT_TYPE_LABELS } from '../types';

const slotTypes = Object.keys(SLOT_TYPE_LABELS) as [
  keyof typeof SLOT_TYPE_LABELS,
  ...Array<keyof typeof SLOT_TYPE_LABELS>,
];

const timeString = z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM time format');

export const defaultPracticeTemplateSchema = z.object({
  id: z.string().min(1),
  weekday: z.coerce.number().int().min(0).max(6),
  weeksBefore: z.coerce.number().int().min(1).max(8),
  startTime: timeString,
  endTime: timeString,
  location: z.string().optional(),
});

export const choirDirectorSettingsSchema = z.object({
  defaultChoirGroup: z.string().min(1, 'Default choir is required.'),
  serviceStartTime: timeString,
  serviceEndTime: timeString,
  /** Optional when defaultPractices is provided; synced from first template. */
  practiceWeekday: z.coerce.number().int().min(0).max(6).optional(),
  practiceStartTime: timeString.optional(),
  practiceEndTime: timeString.optional(),
  defaultPractices: z
    .array(defaultPracticeTemplateSchema)
    .min(1, 'Add at least one default practice.'),
  defaultServiceSlots: z
    .array(z.enum(slotTypes))
    .min(1, 'Add at least one default service slot.'),
});

export type ChoirDirectorSettingsInput = z.infer<typeof choirDirectorSettingsSchema>;
