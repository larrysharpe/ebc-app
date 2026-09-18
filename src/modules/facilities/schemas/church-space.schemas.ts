import { z } from 'zod';

export const updateChurchSpaceSchema = z.object({
  capacity: z
    .number()
    .int()
    .min(0)
    .max(5000)
    .nullable()
    .optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
  active: z.boolean().optional(),
});

export type UpdateChurchSpaceSchemaInput = z.infer<typeof updateChurchSpaceSchema>;
