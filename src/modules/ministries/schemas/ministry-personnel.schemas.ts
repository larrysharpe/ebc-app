import { z } from 'zod';

const baseFields = {
  personId: z.string().trim().min(1).optional(),
  name: z.string().trim().max(120).optional(),
  role: z.enum([
    'director',
    'chair',
    'vice_chair',
    'advisor',
    'member',
    'volunteer',
  ]),
  title: z.string().trim().max(200).optional(),
  /** Duty ids from the ministry's duty catalog. */
  duties: z.array(z.string().trim().min(1).max(64)).max(20).optional(),
  email: z.string().trim().max(200).optional(),
  phone: z.string().trim().max(40).optional(),
  isOpenRole: z.boolean().optional(),
};

function refineRosterPerson(
  value: {
    personId?: string;
    name?: string;
    isOpenRole?: boolean;
  },
  ctx: z.RefinementCtx,
): void {
  if (value.isOpenRole) {
    if (!value.name?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Open roles need a label (e.g. Photographer).',
        path: ['name'],
      });
    }
    return;
  }
  if (!value.personId) {
    ctx.addIssue({
      code: 'custom',
      message: 'Select a church member for this roster entry.',
      path: ['personId'],
    });
  }
}

export const ministryPersonInputSchema = z.object(baseFields).superRefine(refineRosterPerson);

export const updateMinistryPersonSchema = z
  .object({
    id: z.string().trim().min(1),
    ...baseFields,
  })
  .superRefine(refineRosterPerson);
