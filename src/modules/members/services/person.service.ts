import {
  createUserRecord,
  findUserByEmail,
  findUsersByEmails,
  updateUserRecord,
} from '@/modules/auth/repositories/user.repository';
import type { UserRole } from '@/modules/auth/types/auth.types';
import { hashPassword } from '@/modules/auth/utils/password.utils';

import type { MemberDirectoryAssignableRole } from '../constants/member-roles.constants';
import {
  createPerson,
  deletePerson,
  getPeopleByIds,
  getPersonById,
  listPeople,
  listPeoplePage,
  updatePerson,
  upsertPerson,
} from '../repositories/person.repository';
import type {
  DirectoryPerson,
  MembershipStatus,
  Person,
} from '../types';
import { personDisplayName } from '../types';
import {
  MEMBER_DIRECTORY_PAGE_SIZE,
  buildDirectoryPageMeta,
  type PersonDirectoryPage,
} from '../utils/person-directory.utils';
import {
  APP_ACCESS_MIN_AGE,
  canHaveAppAccess,
  deriveIsMinorFromBirthday,
  isJuniorMember,
} from '../utils/person-minor.utils';
import { isRoleAllowedForPerson } from '../utils/person-roles.utils';

function newPersonId(): string {
  return `person-${crypto.randomUUID().slice(0, 10)}`;
}

function normalizeOptional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export async function searchPeople(input?: {
  query?: string;
  membershipStatus?: MembershipStatus;
  limit?: number;
}): Promise<Person[]> {
  return listPeople(input);
}

async function withDirectoryRoles(people: Person[]): Promise<DirectoryPerson[]> {
  const users = await findUsersByEmails(
    people
      .map((person) => person.email)
      .filter((email): email is string => Boolean(email)),
  );
  const accessByEmail = new Map(
    users.map((user) => [
      user.email.toLowerCase(),
      {
        roles: [...user.roles] as UserRole[],
        ministryIds: [...user.ministryIds],
        choirIds: [...user.choirIds],
      },
    ]),
  );

  return people.map((person) => {
    const access = person.email
      ? accessByEmail.get(person.email.toLowerCase())
      : undefined;
    return {
      ...person,
      roles: access?.roles ?? [],
      ministryIds: access?.ministryIds ?? [],
      choirIds: access?.choirIds ?? [],
    };
  });
}

export async function listDirectoryPeople(input?: {
  query?: string;
  membershipStatus?: MembershipStatus;
  page?: number;
  pageSize?: number;
  sort?: 'lastName' | 'firstName' | 'status';
  dir?: 'asc' | 'desc';
}): Promise<{ people: DirectoryPerson[]; page: PersonDirectoryPage }> {
  const pageSize = input?.pageSize ?? MEMBER_DIRECTORY_PAGE_SIZE;
  const requestedPage = input?.page ?? 1;
  const sort = input?.sort ?? 'lastName';
  const dir = input?.dir ?? 'asc';
  const { people, total } = await listPeoplePage({
    query: input?.query,
    membershipStatus: input?.membershipStatus,
    page: requestedPage,
    pageSize,
    sort,
    dir,
  });
  const page = buildDirectoryPageMeta({
    page: requestedPage,
    pageSize,
    total,
  });

  if (page.page !== requestedPage && total > 0) {
    const retry = await listPeoplePage({
      query: input?.query,
      membershipStatus: input?.membershipStatus,
      page: page.page,
      pageSize,
      sort,
      dir,
    });
    return { people: await withDirectoryRoles(retry.people), page };
  }

  return { people: await withDirectoryRoles(people), page };
}

export async function getPerson(id: string): Promise<Person | null> {
  return getPersonById(id);
}

export async function getDirectoryPerson(
  id: string,
): Promise<DirectoryPerson | null> {
  const person = await getPersonById(id);
  if (!person) return null;
  const [enriched] = await withDirectoryRoles([person]);
  return enriched ?? null;
}

export async function getPeopleMap(ids: string[]): Promise<Map<string, Person>> {
  const people = await getPeopleByIds(ids);
  return new Map(people.map((person) => [person.id, person]));
}

export async function createChurchPerson(input: {
  firstName: string;
  lastName: string;
  suffix?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  membershipStatus?: MembershipStatus;
  notes?: string;
}): Promise<Person> {
  const dateOfBirth = normalizeOptional(input.dateOfBirth);
  return createPerson({
    id: newPersonId(),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    suffix: normalizeOptional(input.suffix),
    email: normalizeOptional(input.email),
    phone: normalizeOptional(input.phone),
    dateOfBirth,
    isMinor: deriveIsMinorFromBirthday(dateOfBirth),
    membershipStatus: input.membershipStatus ?? 'member',
    notes: normalizeOptional(input.notes),
  });
}

export async function updateChurchPerson(input: {
  id: string;
  firstName: string;
  lastName: string;
  suffix?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  membershipStatus: MembershipStatus;
  notes?: string;
}): Promise<Person | null> {
  const dateOfBirth = normalizeOptional(input.dateOfBirth);
  return updatePerson({
    id: input.id,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    suffix: normalizeOptional(input.suffix),
    email: normalizeOptional(input.email),
    phone: normalizeOptional(input.phone),
    dateOfBirth,
    isMinor: deriveIsMinorFromBirthday(dateOfBirth),
    membershipStatus: input.membershipStatus,
    notes: normalizeOptional(input.notes),
  });
}

export async function deleteChurchPerson(id: string): Promise<boolean> {
  return deletePerson(id);
}

export async function upsertChurchPerson(
  person: Omit<Person, 'createdAt' | 'updatedAt'>,
): Promise<Person> {
  return upsertPerson(person);
}

/**
 * Adds an app role for a directory person (matched by email).
 * Creates a login account when one does not exist yet.
 */
export async function addRoleToDirectoryPerson(input: {
  personId: string;
  role: MemberDirectoryAssignableRole;
}): Promise<
  { ok: true; person: DirectoryPerson } | { ok: false; error: string }
> {
  const person = await getPersonById(input.personId);
  if (!person) {
    return { ok: false, error: 'Person not found.' };
  }
  if (!canHaveAppAccess(person)) {
    return {
      ok: false,
      error: `App access starts at age ${APP_ACCESS_MIN_AGE}. Add a birthday, or contact guardians for younger children.`,
    };
  }
  if (!isRoleAllowedForPerson(person, input.role)) {
    return {
      ok: false,
      error: isJuniorMember(person)
        ? 'Junior members (13–17) can only receive Choir Member, Band Member, or Volunteer.'
        : 'That role cannot be assigned from the directory.',
    };
  }
  if (!person.email) {
    return {
      ok: false,
      error: isJuniorMember(person)
        ? 'Add the junior member’s email (or a parent-managed email) before assigning app access.'
        : 'Add an email on the person detail page before assigning roles.',
    };
  }

  const existing = await findUserByEmail(person.email);
  if (existing) {
    if (
      existing.roles.includes('super_admin') ||
      existing.roles.includes('webmaster')
    ) {
      return { ok: false, error: 'You cannot modify this account.' };
    }
    if (existing.roles.includes(input.role)) {
      return { ok: false, error: 'That role is already assigned.' };
    }

    const updated = await updateUserRecord(existing.id, {
      name: existing.name,
      roles: [...existing.roles, input.role],
      ministryIds: [...existing.ministryIds],
      choirIds: [...existing.choirIds],
      status: existing.status,
    });
    if (!updated) {
      return { ok: false, error: 'Could not update roles.' };
    }
  } else {
    const passwordHash = await hashPassword(crypto.randomUUID());
    await createUserRecord({
      email: person.email,
      name: personDisplayName(person),
      roles: [input.role],
      ministryIds: [],
      choirIds: [],
      passwordHash,
      status: 'active',
    });
  }

  const enriched = await getDirectoryPerson(person.id);
  if (!enriched) {
    return { ok: false, error: 'Role saved, but could not reload the person.' };
  }
  return { ok: true, person: enriched };
}

export { personDisplayName };
