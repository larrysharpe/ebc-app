'use server';

import { revalidatePath } from 'next/cache';

import { getSession } from '@/modules/auth/services/auth.service';
import { hasAnyRole } from '@/modules/auth/utils/roles.utils';
import {
  addHouseholdChildSchema,
  addHouseholdMemberSchema,
  createHouseholdSchema,
  unlinkHouseholdMemberSchema,
  updateHouseholdMemberRoleSchema,
} from '../schemas/household.schemas';
import {
  addChildToHousehold,
  changeHouseholdMemberRole,
  createHouseholdForPerson,
  getHouseholdForDirectoryPerson,
  linkPersonToHousehold,
  unlinkHouseholdMember,
} from '../services/household.service';
import type { HouseholdDetail } from '../types';

async function guardHouseholdWrite(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: 'You must be signed in.' };
  }
  if (
    !hasAnyRole(session.roles, [
      'super_admin',
      'admin',
      'pastor',
      'office_staff',
      'ministry_leader',
    ])
  ) {
    return { ok: false, error: 'You do not have permission to manage households.' };
  }
  return { ok: true };
}

function revalidateHouseholdPaths(personIds: string[]): void {
  revalidatePath('/people');
  revalidatePath('/members');
  for (const personId of personIds) {
    revalidatePath(`/people/${personId}`);
    revalidatePath(`/members/${personId}`);
  }
}

export async function getHouseholdForPersonAction(
  personId: string,
): Promise<
  { ok: true; household: HouseholdDetail | null } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: 'You must be signed in.' };
  }
  const household = await getHouseholdForDirectoryPerson(personId);
  return { ok: true, household };
}

export async function createHouseholdAction(
  input: unknown,
): Promise<
  { ok: true; household: HouseholdDetail } | { ok: false; error: string }
> {
  const allowed = await guardHouseholdWrite();
  if (!allowed.ok) return allowed;

  const parsed = createHouseholdSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid household data.',
    };
  }

  const result = await createHouseholdForPerson(parsed.data);
  if (!result.ok) return result;

  revalidateHouseholdPaths([parsed.data.founderPersonId]);
  return result;
}

export async function addHouseholdMemberAction(
  input: unknown,
): Promise<
  { ok: true; household: HouseholdDetail } | { ok: false; error: string }
> {
  const allowed = await guardHouseholdWrite();
  if (!allowed.ok) return allowed;

  const parsed = addHouseholdMemberSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid household member.',
    };
  }

  const result = await linkPersonToHousehold(parsed.data);
  if (!result.ok) return result;

  revalidateHouseholdPaths(
    result.household.members.map((member) => member.personId),
  );
  return result;
}

export async function addHouseholdChildAction(
  input: unknown,
): Promise<
  { ok: true; household: HouseholdDetail } | { ok: false; error: string }
> {
  const allowed = await guardHouseholdWrite();
  if (!allowed.ok) return allowed;

  const parsed = addHouseholdChildSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid child data.',
    };
  }

  const result = await addChildToHousehold(parsed.data);
  if (!result.ok) return result;

  revalidateHouseholdPaths(
    result.household.members.map((member) => member.personId),
  );
  return result;
}

export async function updateHouseholdMemberRoleAction(
  input: unknown,
): Promise<
  { ok: true; household: HouseholdDetail } | { ok: false; error: string }
> {
  const allowed = await guardHouseholdWrite();
  if (!allowed.ok) return allowed;

  const parsed = updateHouseholdMemberRoleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid role.',
    };
  }

  const result = await changeHouseholdMemberRole(parsed.data);
  if (!result.ok) return result;

  revalidateHouseholdPaths(
    result.household.members.map((member) => member.personId),
  );
  return result;
}

export async function unlinkHouseholdMemberAction(
  input: unknown,
): Promise<
  | { ok: true; household: HouseholdDetail | null }
  | { ok: false; error: string }
> {
  const allowed = await guardHouseholdWrite();
  if (!allowed.ok) return allowed;

  const parsed = unlinkHouseholdMemberSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid person.' };
  }

  const result = await unlinkHouseholdMember(parsed.data.personId);
  if (!result.ok) return result;

  const personIds = [
    parsed.data.personId,
    ...(result.household?.members.map((member) => member.personId) ?? []),
  ];
  revalidateHouseholdPaths(personIds);
  return result;
}
