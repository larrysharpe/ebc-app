'use server';

import { revalidatePath } from 'next/cache';

import { getSession } from '@/modules/auth/services/auth.service';
import { hasAnyRole } from '@/modules/auth/utils/roles.utils';
import {
  addPersonRoleSchema,
  createPersonSchema,
  membershipStatusSchema,
  personIdSchema,
  updatePersonSchema,
} from '../schemas/person.schemas';
import {
  addRoleToDirectoryPerson,
  createChurchPerson,
  deleteChurchPerson,
  getDirectoryPerson,
  listDirectoryPeople,
  searchPeople,
  updateChurchPerson,
} from '../services/person.service';
import type { DirectoryPerson, MembershipStatus, Person } from '../types';
import {
  MEMBER_DIRECTORY_PAGE_SIZE,
  type PersonDirectoryPage,
} from '../utils/person-directory.utils';

async function guardMembersRead(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: 'You must be signed in.' };
  }
  return { ok: true };
}

async function guardMembersWrite(): Promise<
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
    return { ok: false, error: 'You do not have permission to manage people.' };
  }
  return { ok: true };
}

function revalidateMemberPaths(): void {
  revalidatePath('/people');
  revalidatePath('/members');
  revalidatePath('/ministries');
  revalidatePath('/music');
}

function revalidatePersonDetail(personId: string): void {
  revalidatePath(`/people/${personId}`);
  revalidatePath(`/members/${personId}`);
}

export async function searchPeopleAction(
  query?: string,
): Promise<{ ok: true; people: Person[] } | { ok: false; error: string }> {
  const allowed = await guardMembersRead();
  if (!allowed.ok) return allowed;

  const people = await searchPeople({
    query: query?.trim() || undefined,
    limit: 25,
  });
  return { ok: true, people };
}

export async function listPeopleAction(): Promise<
  { ok: true; people: Person[] } | { ok: false; error: string }
> {
  const allowed = await guardMembersRead();
  if (!allowed.ok) return allowed;

  const people = await searchPeople({ limit: 200 });
  return { ok: true, people };
}

export async function listDirectoryPeopleAction(input?: {
  query?: string;
  membershipStatus?: string;
  page?: number;
  sort?: 'lastName' | 'firstName' | 'status';
  dir?: 'asc' | 'desc';
}): Promise<
  | { ok: true; people: DirectoryPerson[]; page: PersonDirectoryPage }
  | { ok: false; error: string }
> {
  const allowed = await guardMembersRead();
  if (!allowed.ok) return allowed;

  let membershipStatus: MembershipStatus | undefined;
  if (input?.membershipStatus) {
    const parsedStatus = membershipStatusSchema.safeParse(input.membershipStatus);
    if (!parsedStatus.success) {
      return { ok: false, error: 'Invalid membership status filter.' };
    }
    membershipStatus = parsedStatus.data;
  }

  const result = await listDirectoryPeople({
    query: input?.query?.trim() || undefined,
    membershipStatus,
    page: input?.page ?? 1,
    pageSize: MEMBER_DIRECTORY_PAGE_SIZE,
    sort: input?.sort,
    dir: input?.dir,
  });

  return { ok: true, people: result.people, page: result.page };
}

export async function getDirectoryPersonAction(
  id: string,
): Promise<
  { ok: true; person: DirectoryPerson } | { ok: false; error: string }
> {
  const allowed = await guardMembersRead();
  if (!allowed.ok) return allowed;

  const person = await getDirectoryPerson(id);
  if (!person) {
    return { ok: false, error: 'Person not found.' };
  }
  return { ok: true, person };
}

export async function createPersonAction(
  input: unknown,
): Promise<{ ok: true; person: Person } | { ok: false; error: string }> {
  const allowed = await guardMembersWrite();
  if (!allowed.ok) return allowed;

  const parsed = createPersonSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid person data',
    };
  }

  const person = await createChurchPerson(parsed.data);
  revalidateMemberPaths();
  return { ok: true, person };
}

export async function updatePersonAction(
  input: unknown,
): Promise<{ ok: true; person: Person } | { ok: false; error: string }> {
  const allowed = await guardMembersWrite();
  if (!allowed.ok) return allowed;

  const parsed = updatePersonSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid person data',
    };
  }

  const person = await updateChurchPerson(parsed.data);
  if (!person) {
    return { ok: false, error: 'Person not found.' };
  }

  revalidateMemberPaths();
  return { ok: true, person };
}

export async function deletePersonAction(
  input: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const allowed = await guardMembersWrite();
  if (!allowed.ok) return allowed;

  const parsed = personIdSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid person.' };
  }

  const deleted = await deleteChurchPerson(parsed.data.id);
  if (!deleted) {
    return { ok: false, error: 'Could not delete person.' };
  }

  revalidateMemberPaths();
  return { ok: true };
}

export async function addPersonRoleAction(
  input: unknown,
): Promise<
  { ok: true; person: DirectoryPerson } | { ok: false; error: string }
> {
  const allowed = await guardMembersWrite();
  if (!allowed.ok) return allowed;

  const parsed = addPersonRoleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid role.',
    };
  }

  const result = await addRoleToDirectoryPerson(parsed.data);
  if (!result.ok) return result;

  revalidateMemberPaths();
  revalidatePersonDetail(parsed.data.personId);
  revalidatePath('/settings');
  return result;
}
