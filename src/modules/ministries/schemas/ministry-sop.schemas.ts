import { z } from 'zod';

export const ministrySopStatusSchema = z.enum([
  'draft',
  'in_review',
  'approved',
  'archived',
]);

export const ministrySopKindSchema = z.enum(['charter', 'task']);

export const saveMinistrySopSchema = z.object({
  id: z.string().min(1).optional(),
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().min(1).max(100_000),
  templateId: z.string().trim().min(1).max(80).optional(),
  kind: ministrySopKindSchema.optional(),
  documentNumber: z.string().trim().max(80).optional(),
  version: z.string().trim().max(40).optional(),
  status: ministrySopStatusSchema.optional(),
  effectiveDate: z.string().trim().max(40).optional(),
  preparedBy: z.string().trim().max(120).optional(),
  reviewedBy: z.string().trim().max(120).optional(),
  nextReviewAt: z.string().trim().max(40).optional(),
});

export type SaveMinistrySopInput = z.infer<typeof saveMinistrySopSchema>;

export const setMinistrySopStatusSchema = z.object({
  sopId: z.string().min(1),
  status: ministrySopStatusSchema,
});
