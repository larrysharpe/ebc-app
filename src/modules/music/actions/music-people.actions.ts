'use server';

import { revalidatePath } from 'next/cache';

import {
  addChoirRosterMemberSchema,
  assignMusicRoleSchema,
  removeChoirRosterMemberSchema,
  removeMusicRoleSchema,
  type AddChoirRosterMemberInput,
  type AssignMusicRoleInput,
  type RemoveChoirRosterMemberInput,
  type RemoveMusicRoleInput,
} from '@/modules/music/schemas/music-people.schemas';
import {
  addChoirRosterMember,
  assignMusicRoleToPerson,
  removeChoirRosterMember,
  removeMusicRoleFromPerson,
} from '@/modules/music/services/music-people.service';

function revalidatePeoplePaths(personId?: string, choirId?: string): void {
  revalidatePath('/music');
  revalidatePath('/music/people');
  revalidatePath('/music/choirs');
  revalidatePath('/people');
  revalidatePath('/members');
  if (personId) {
    revalidatePath(`/people/${personId}`);
    revalidatePath(`/members/${personId}`);
  }
  if (choirId) {
    revalidatePath(`/music/choirs/${choirId}`);
  }
}

export async function assignMusicRoleAction(input: AssignMusicRoleInput) {
  const parsed = assignMusicRoleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? 'Invalid assignment.',
    };
  }

  const result = await assignMusicRoleToPerson(parsed.data);
  if (result.ok) revalidatePeoplePaths(parsed.data.personId);
  return result;
}

export async function removeMusicRoleAction(input: RemoveMusicRoleInput) {
  const parsed = removeMusicRoleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? 'Invalid request.',
    };
  }

  const result = await removeMusicRoleFromPerson(parsed.data);
  if (result.ok) revalidatePeoplePaths(parsed.data.personId);
  return result;
}

export async function addChoirRosterMemberAction(
  input: AddChoirRosterMemberInput,
) {
  const parsed = addChoirRosterMemberSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? 'Invalid roster change.',
    };
  }

  const result = await addChoirRosterMember(parsed.data);
  if (result.ok) {
    revalidatePeoplePaths(parsed.data.personId, parsed.data.choirId);
  }
  return result;
}

export async function removeChoirRosterMemberAction(
  input: RemoveChoirRosterMemberInput,
) {
  const parsed = removeChoirRosterMemberSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? 'Invalid roster change.',
    };
  }

  const result = await removeChoirRosterMember(parsed.data);
  if (result.ok) {
    revalidatePeoplePaths(parsed.data.personId, parsed.data.choirId);
  }
  return result;
}
