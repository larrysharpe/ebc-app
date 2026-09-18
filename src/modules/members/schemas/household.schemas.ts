import { z } from 'zod';

function emptyToUndefined(value: unknown): unknown {
  if (typeof value === 'string' && value.trim() === '') return undefined;
  return value;
}

export const householdRoleSchema = z.enum(['head', 'spouse', 'child', 'other']);

export const createHouseholdSchema = z.object({
  name: z.string().trim().min(1, 'Household name is required.').max(120),
  /** Person who starts the household (linked as head by default). */
  founderPersonId: z.string().trim().min(1),
  founderRole: householdRoleSchema.default('head'),
  primaryPhone: z.preprocess(emptyToUndefined, z.string().trim().max(40).optional()),
  primaryEmail: z.preprocess(
    emptyToUndefined,
    z.string().trim().email('Enter a valid email address.').max(200).optional(),
  ),
});

export const addHouseholdMemberSchema = z.object({
  householdId: z.string().trim().min(1),
  personId: z.string().trim().min(1),
  role: householdRoleSchema,
});

export const addHouseholdChildSchema = z.object({
  householdId: z.string().trim().min(1),
  firstName: z.string().trim().min(1, 'First name is required.').max(80),
  lastName: z.string().trim().min(1, 'Last name is required.').max(80),
  suffix: z.preprocess(emptyToUndefined, z.string().trim().max(20).optional()),
  dateOfBirth: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD for date of birth.')
      .optional(),
  ),
  membershipStatus: z
    .enum(['visitor', 'attender', 'member', 'hired', 'inactive'])
    .default('member'),
});

export const unlinkHouseholdMemberSchema = z.object({
  personId: z.string().trim().min(1),
});

export const updateHouseholdMemberRoleSchema = z.object({
  personId: z.string().trim().min(1),
  role: householdRoleSchema,
});

export type CreateHouseholdInput = z.infer<typeof createHouseholdSchema>;
export type AddHouseholdMemberInput = z.infer<typeof addHouseholdMemberSchema>;
export type AddHouseholdChildInput = z.infer<typeof addHouseholdChildSchema>;
