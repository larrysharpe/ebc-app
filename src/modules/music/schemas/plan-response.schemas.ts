import { z } from 'zod';

import { PLAN_ATTENDANCE_STATUSES } from '../types/plan-response.types';

export const planAttendanceStatusSchema = z.enum(PLAN_ATTENDANCE_STATUSES);

export const upsertPlanAttendanceSchema = z.object({
  planId: z.string().trim().min(1),
  status: planAttendanceStatusSchema,
  note: z
    .string()
    .trim()
    .max(500, 'Keep notes under 500 characters.')
    .optional()
    .or(z.literal('')),
});

export const createPlanCommentSchema = z.object({
  planId: z.string().trim().min(1),
  body: z
    .string()
    .trim()
    .min(1, 'Write a comment.')
    .max(2000, 'Keep comments under 2000 characters.'),
});

export const deletePlanCommentSchema = z.object({
  id: z.string().trim().min(1),
});

export type UpsertPlanAttendanceInput = z.infer<typeof upsertPlanAttendanceSchema>;
export type CreatePlanCommentInput = z.infer<typeof createPlanCommentSchema>;
export type DeletePlanCommentInput = z.infer<typeof deletePlanCommentSchema>;
