import type {
  AddHouseholdChildInput,
  AddHouseholdMemberInput,
  CreateHouseholdInput,
} from '../schemas/household.schemas';
import {
  addPersonToHousehold,
  createHousehold,
  getHouseholdById,
  getHouseholdForPerson,
  getPersonHouseholdId,
  unlinkPersonFromHousehold,
  updateHouseholdMemberRole,
} from '../repositories/household.repository';
import { createPerson, getPersonById } from '../repositories/person.repository';
import type { HouseholdDetail, HouseholdRole } from '../types';
import { HOUSEHOLD_ROLE_ORDER } from '../types';
import { deriveIsMinorFromBirthday } from '../utils/person-minor.utils';

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 10)}`;
}

function sortMembers(detail: HouseholdDetail): HouseholdDetail {
  const order = new Map(HOUSEHOLD_ROLE_ORDER.map((role, index) => [role, index]));
  return {
    ...detail,
    members: [...detail.members].sort((a, b) => {
      const roleDiff = (order.get(a.role) ?? 99) - (order.get(b.role) ?? 99);
      if (roleDiff !== 0) return roleDiff;
      return a.person.lastName.localeCompare(b.person.lastName);
    }),
  };
}

export async function getHouseholdForDirectoryPerson(
  personId: string,
): Promise<HouseholdDetail | null> {
  const detail = await getHouseholdForPerson(personId);
  return detail ? sortMembers(detail) : null;
}

export async function createHouseholdForPerson(
  input: CreateHouseholdInput,
): Promise<
  { ok: true; household: HouseholdDetail } | { ok: false; error: string }
> {
  const founder = await getPersonById(input.founderPersonId);
  if (!founder) {
    return { ok: false, error: 'Person not found.' };
  }

  const existing = await getPersonHouseholdId(input.founderPersonId);
  if (existing) {
    return { ok: false, error: 'This person is already in a household.' };
  }

  const household = await createHousehold({
    id: newId('household'),
    name: input.name.trim(),
    primaryPhone: input.primaryPhone,
    primaryEmail: input.primaryEmail,
    founder: {
      id: newId('hh-member'),
      personId: input.founderPersonId,
      role: input.founderRole,
    },
  });

  return { ok: true, household: sortMembers(household) };
}

export async function linkPersonToHousehold(
  input: AddHouseholdMemberInput,
): Promise<
  { ok: true; household: HouseholdDetail } | { ok: false; error: string }
> {
  const person = await getPersonById(input.personId);
  if (!person) {
    return { ok: false, error: 'Person not found.' };
  }

  const existing = await getPersonHouseholdId(input.personId);
  if (existing) {
    if (existing === input.householdId) {
      return { ok: false, error: 'That person is already in this household.' };
    }
    return {
      ok: false,
      error: 'That person is already in another household. Unlink them first.',
    };
  }

  try {
    const household = await addPersonToHousehold({
      id: newId('hh-member'),
      householdId: input.householdId,
      personId: input.personId,
      role: input.role,
    });
    if (!household) {
      return { ok: false, error: 'Household not found.' };
    }
    return { ok: true, household: sortMembers(household) };
  } catch {
    return { ok: false, error: 'Could not add person to household.' };
  }
}

export async function addChildToHousehold(
  input: AddHouseholdChildInput,
): Promise<
  { ok: true; household: HouseholdDetail } | { ok: false; error: string }
> {
  const dateOfBirth = input.dateOfBirth?.trim() || undefined;
  const child = await createPerson({
    id: newId('person'),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    suffix: input.suffix?.trim() || undefined,
    dateOfBirth,
    // Birthday drives minor status; without one, household children still count as minors.
    isMinor: dateOfBirth ? deriveIsMinorFromBirthday(dateOfBirth) : true,
    membershipStatus: input.membershipStatus,
  });

  return linkPersonToHousehold({
    householdId: input.householdId,
    personId: child.id,
    role: 'child',
  });
}

export async function changeHouseholdMemberRole(input: {
  personId: string;
  role: HouseholdRole;
}): Promise<
  { ok: true; household: HouseholdDetail } | { ok: false; error: string }
> {
  const household = await updateHouseholdMemberRole(input);
  if (!household) {
    return { ok: false, error: 'Household membership not found.' };
  }
  return { ok: true, household: sortMembers(household) };
}

export async function unlinkHouseholdMember(
  personId: string,
): Promise<
  | { ok: true; household: HouseholdDetail | null }
  | { ok: false; error: string }
> {
  const result = await unlinkPersonFromHousehold(personId);
  if (!result) {
    return { ok: false, error: 'Household membership not found.' };
  }
  if (result.deletedHousehold) {
    return { ok: true, household: null };
  }
  const detail = await getHouseholdById(result.householdId);
  return { ok: true, household: detail ? sortMembers(detail) : null };
}
