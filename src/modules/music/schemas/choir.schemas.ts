import { z } from 'zod';

const sundaySchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

const leaderSchema = z.object({
  personId: z.string().trim().min(1, 'Leader is required.'),
  title: z.string().trim().optional(),
});

const memberRoleSchema = z.enum(['singer', 'soloist', 'band']);

const memberSchema = z.object({
  personId: z.string().trim().min(1, 'Member is required.'),
  role: memberRoleSchema.default('singer'),
});

export const choirInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Choir name is required.').max(80),
  leaders: z.array(leaderSchema).optional(),
  members: z.array(memberSchema).optional(),
  defaultSunday: sundaySchema.nullable().optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
  active: z.boolean().optional(),
  notes: z.string().trim().max(500).optional(),
});

export const choirIdSchema = z.object({
  id: z.string().min(1),
});

export const choirSundayAssignmentSchema = z.object({
  assignments: z.array(
    z.object({
      choirId: z.string().min(1),
      defaultSunday: sundaySchema.nullable(),
    }),
  ),
});

export type ChoirInput = z.infer<typeof choirInputSchema>;
export type ChoirSundayAssignmentInput = z.infer<typeof choirSundayAssignmentSchema>;
