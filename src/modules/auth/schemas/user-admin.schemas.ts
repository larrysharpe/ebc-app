import { z } from 'zod';

import type { UserRole } from '@/modules/auth/types/auth.types';

const USER_ROLES = [
  'super_admin',
  'admin',
  'webmaster',
  'pastor',
  'office_staff',
  'finance',
  'trustee',
  'deacon',
  'music_minister',
  'choir_director',
  'choir_member',
  'band_director',
  'band_member',
  'social_manager',
  'facility_manager',
  'ministry_leader',
  'volunteer',
] as const satisfies readonly UserRole[];

export const userRoleSchema = z.enum(USER_ROLES);

export const userStatusSchema = z.enum(['active', 'disabled']);

const userBaseSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  name: z.string().trim().min(1, 'Name is required'),
  roles: z.array(userRoleSchema).min(1, 'Select at least one role'),
  status: userStatusSchema,
  ministryIds: z.array(z.string().trim().min(1)).optional(),
  choirIds: z.array(z.string().trim().min(1)).optional(),
  password: z.string().optional(),
});

function validateScopeAssignments(
  value: { roles: UserRole[]; ministryIds?: string[]; choirIds?: string[] },
  ctx: z.RefinementCtx,
): void {
  const hasMinistryLeader = value.roles.includes('ministry_leader');
  const ministryIds = value.ministryIds ?? [];

  if (hasMinistryLeader && ministryIds.length === 0) {
    ctx.addIssue({
      code: 'custom',
      message: 'Ministry leaders need at least one assigned ministry',
      path: ['ministryIds'],
    });
  }

  if (!hasMinistryLeader && ministryIds.length > 0) {
    ctx.addIssue({
      code: 'custom',
      message: 'Only ministry leaders can have ministry assignments',
      path: ['ministryIds'],
    });
  }

  const hasChoirDirector = value.roles.includes('choir_director');
  const choirIds = value.choirIds ?? [];

  if (hasChoirDirector && choirIds.length === 0) {
    ctx.addIssue({
      code: 'custom',
      message: 'Choir directors need at least one assigned choir',
      path: ['choirIds'],
    });
  }

  if (!hasChoirDirector && choirIds.length > 0) {
    ctx.addIssue({
      code: 'custom',
      message: 'Only choir directors can have choir assignments',
      path: ['choirIds'],
    });
  }
}

export const createUserSchema = userBaseSchema
  .extend({
    password: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .superRefine(validateScopeAssignments);

export const updateUserSchema = userBaseSchema
  .extend({
    id: z.string().trim().min(1),
    password: z
      .string()
      .optional()
      .transform((value) => (value?.trim() ? value.trim() : undefined)),
  })
  .superRefine((value, ctx) => {
    if (value.password && value.password.length < 8) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password must be at least 8 characters',
        path: ['password'],
      });
    }
    validateScopeAssignments(value, ctx);
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
