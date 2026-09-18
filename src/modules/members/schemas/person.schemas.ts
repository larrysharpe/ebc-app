import { z } from 'zod';

import { MEMBER_DIRECTORY_ASSIGNABLE_ROLES } from '../constants/member-roles.constants';

function emptyToUndefined(value: unknown): unknown {
  if (typeof value === 'string' && value.trim() === '') return undefined;
  return value;
}

export const memberDirectoryRoleSchema = z.enum(MEMBER_DIRECTORY_ASSIGNABLE_ROLES);

export const membershipStatusSchema = z.enum([
  'visitor',
  'attender',
  'member',
  'hired',
  'inactive',
]);

const optionalIsoDateSchema = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD for date of birth.')
    .optional(),
);

const personFields = {
  firstName: z.string().trim().min(1, 'First name is required.').max(80),
  lastName: z.string().trim().min(1, 'Last name is required.').max(80),
  suffix: z.preprocess(emptyToUndefined, z.string().trim().max(20).optional()),
  email: z.preprocess(
    emptyToUndefined,
    z.string().trim().email('Enter a valid email address.').max(200).optional(),
  ),
  phone: z.preprocess(emptyToUndefined, z.string().trim().max(40).optional()),
  dateOfBirth: optionalIsoDateSchema,
  notes: z.preprocess(emptyToUndefined, z.string().trim().max(2000).optional()),
};

export const createPersonSchema = z.object({
  ...personFields,
  membershipStatus: membershipStatusSchema.default('member'),
});

export const updatePersonSchema = z.object({
  id: z.string().trim().min(1),
  ...personFields,
  membershipStatus: membershipStatusSchema,
});

export const personIdSchema = z.object({
  id: z.string().trim().min(1),
});

export const addPersonRoleSchema = z.object({
  personId: z.string().trim().min(1),
  role: memberDirectoryRoleSchema,
});

export type CreatePersonInput = z.infer<typeof createPersonSchema>;
export type UpdatePersonInput = z.infer<typeof updatePersonSchema>;
export type AddPersonRoleInput = z.infer<typeof addPersonRoleSchema>;
