import { z } from 'zod';

export const activityReviewFindingSchema = z.object({
  severity: z.enum(['blocker', 'warning', 'tip']),
  area: z.enum([
    'schedule',
    'form',
    'media',
    'kitchen',
    'floorPlan',
    'coordination',
    'leadTime',
    'other',
  ]),
  message: z.string().trim().min(1).max(400),
});

export const activityRequestReviewResponseSchema = z.object({
  summary: z.string().trim().min(1).max(600),
  status: z.enum(['ok', 'needs_attention', 'blocked']),
  findings: z.array(activityReviewFindingSchema).max(20),
});

export type ActivityReviewFinding = z.infer<typeof activityReviewFindingSchema>;
export type ActivityRequestReviewResponse = z.infer<
  typeof activityRequestReviewResponseSchema
>;
