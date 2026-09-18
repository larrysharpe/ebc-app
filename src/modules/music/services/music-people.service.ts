import 'server-only';

import {
  createUserRecord,
  findUserByEmail,
  listUsers,
  updateUserRecord,
} from '@/modules/auth/repositories/user.repository';
import {
  PermissionDeniedError,
  requirePermission,
} from '@/modules/auth/services/auth.service';
import type { UserRole } from '@/modules/auth/types/auth.types';
import { hashPassword } from '@/modules/auth/utils/password.utils';
import {
  getPeopleByIds,
  getPersonByEmail,
  listPeople,
} from '@/modules/members/repositories/person.repository';
import {
  getDirectoryPerson,
  getPerson,
} from '@/modules/members/services/person.service';
import type { DirectoryPerson, Person } from '@/modules/members/types';
import { personDisplayName } from '@/modules/members/types';
import {
  canHaveAppAccess,
  isJuniorMember,
} from '@/modules/members/utils/person-minor.utils';
import { isRoleAllowedForPerson } from '@/modules/members/utils/person-roles.utils';
import {
  getChoirById,
  listChoirs,
  updateChoir,
} from '@/modules/music/repository/choir.repository';
import { ledChoirIdsForPerson } from '@/modules/music/features/my-choirs';
import {
  MUSIC_MANAGEABLE_ROLES,
  type AddChoirRosterMemberInput,
  type AssignMusicRoleInput,
  type MusicManageableRole,
  type RemoveChoirRosterMemberInput,
  type RemoveMusicRoleInput,
} from '@/modules/music/schemas/music-people.schemas';
import type { Choir } from '@/modules/music/types/choir.types';
import type { ChoirMemberRole } from '@/modules/music/types';

const MUSIC_ROLE_SET = new Set<string>([
  ...MUSIC_MANAGEABLE_ROLES,
  'music_minister',
]);

function isMusicRole(role: string): boolean {
  return MUSIC_ROLE_SET.has(role);
}

function isMusicManageableRole(role: string): role is MusicManageableRole {
  return (MUSIC_MANAGEABLE_ROLES as readonly string[]).includes(role);
}

export async function requireMusicPeopleManage() {
  return requirePermission('music.people.manage');
}

function permissionError(
  error: unknown,
): { ok: false; error: string } | null {
  if (error instanceof PermissionDeniedError) {
    return { ok: false, error: 'You do not have permission to manage music people.' };
  }
  return null;
}

/** Directory people who already hold any music app role (matched by email). */
export async function listMusicDirectoryPeople(): Promise<DirectoryPerson[]> {
  await requireMusicPeopleManage();
  const users = await listUsers();
  const musicUsers = users.filter((user) =>
    user.roles.some((role) => isMusicRole(role)),
  );

  const byId = new Map<string, DirectoryPerson>();
  for (const user of musicUsers) {
    const person = await getPersonByEmail(user.email);
    if (!person) continue;
    byId.set(person.id, {
      ...person,
      roles: [...user.roles] as UserRole[],
      ministryIds: [...user.ministryIds],
      choirIds: [...user.choirIds],
    });
  }

  return [...byId.values()].sort((a, b) => {
    const last = a.lastName.localeCompare(b.lastName);
    return last !== 0 ? last : a.firstName.localeCompare(b.firstName);
  });
}

export type MusicPeopleWorkspace = {
  choirs: Choir[];
  /** All people referenced on choir rosters + external musicians. */
  peopleById: Record<string, Person>;
  /** Hired / contractor musicians available to call up onto a choir. */
  externalMusicians: Person[];
  /** People with music app login roles (for App access section). */
  rolePeople: DirectoryPerson[];
};

export async function getMusicPeopleWorkspace(): Promise<MusicPeopleWorkspace> {
  await requireMusicPeopleManage();
  const [choirs, externalMusicians, rolePeople] = await Promise.all([
    listChoirs({ activeOnly: true }),
    listPeople({ membershipStatus: 'hired', limit: 200 }),
    listMusicDirectoryPeople(),
  ]);

  const rosterIds = new Set<string>();
  for (const choir of choirs) {
    for (const leader of choir.leaders) rosterIds.add(leader.personId);
    for (const member of choir.members) rosterIds.add(member.personId);
  }
  for (const person of externalMusicians) rosterIds.add(person.id);

  const rosterPeople = await getPeopleByIds([...rosterIds]);
  const peopleById: Record<string, Person> = {};
  for (const person of rosterPeople) {
    peopleById[person.id] = person;
  }

  return {
    choirs,
    peopleById,
    externalMusicians: externalMusicians.sort((a, b) => {
      const last = a.lastName.localeCompare(b.lastName);
      return last !== 0 ? last : a.firstName.localeCompare(b.firstName);
    }),
    rolePeople,
  };
}

export async function addChoirRosterMember(
  input: AddChoirRosterMemberInput,
): Promise<{ ok: true; choir: Choir } | { ok: false; error: string }> {
  try {
    await requireMusicPeopleManage();
  } catch (error) {
    return permissionError(error) ?? { ok: false, error: 'You must be signed in.' };
  }

  const choir = await getChoirById(input.choirId);
  if (!choir) {
    return { ok: false, error: 'Choir not found.' };
  }

  const person = await getPerson(input.personId);
  if (!person) {
    return { ok: false, error: 'Person not found in the directory.' };
  }

  const role = (input.role ?? 'singer') as ChoirMemberRole;
  const without = choir.members.filter(
    (member) => member.personId !== input.personId,
  );
  const next: Choir = {
    ...choir,
    members: [...without, { personId: input.personId, role }],
  };

  const saved = await updateChoir(next);
  if (!saved) {
    return { ok: false, error: 'Could not update the choir roster.' };
  }
  return { ok: true, choir: saved };
}

export async function removeChoirRosterMember(
  input: RemoveChoirRosterMemberInput,
): Promise<{ ok: true; choir: Choir } | { ok: false; error: string }> {
  try {
    await requireMusicPeopleManage();
  } catch (error) {
    return permissionError(error) ?? { ok: false, error: 'You must be signed in.' };
  }

  const choir = await getChoirById(input.choirId);
  if (!choir) {
    return { ok: false, error: 'Choir not found.' };
  }

  const next: Choir = {
    ...choir,
    members: choir.members.filter(
      (member) => member.personId !== input.personId,
    ),
  };

  const saved = await updateChoir(next);
  if (!saved) {
    return { ok: false, error: 'Could not update the choir roster.' };
  }
  return { ok: true, choir: saved };
}

export async function assignMusicRoleToPerson(
  input: AssignMusicRoleInput,
): Promise<{ ok: true; person: DirectoryPerson } | { ok: false; error: string }> {
  try {
    await requireMusicPeopleManage();
  } catch (error) {
    return permissionError(error) ?? { ok: false, error: 'You must be signed in.' };
  }

  if (!isMusicManageableRole(input.role)) {
    return { ok: false, error: 'That music role cannot be assigned here.' };
  }

  const person = await getPerson(input.personId);
  if (!person) {
    return { ok: false, error: 'Person not found in the directory.' };
  }
  if (!canHaveAppAccess(person)) {
    return {
      ok: false,
      error: 'This person is too young for app access. Add a birthday if missing.',
    };
  }
  if (!isRoleAllowedForPerson(person, input.role)) {
    return {
      ok: false,
      error: isJuniorMember(person)
        ? 'Junior members (13–17) can only be Choir Member or Band Member.'
        : 'That role cannot be assigned to this person.',
    };
  }
  if (!person.email) {
    return {
      ok: false,
      error:
        'Add an email on their People directory record before assigning a music role.',
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
      return { ok: false, error: 'They already have that role.' };
    }

    const nextRoles = [...existing.roles, input.role];
    let nextChoirIds = [...existing.choirIds];
    if (input.role === 'choir_director' && nextChoirIds.length === 0) {
      const choirs = await listChoirs({ activeOnly: true });
      nextChoirIds = ledChoirIdsForPerson(choirs, person.id);
    }

    const updated = await updateUserRecord(existing.id, {
      name: existing.name,
      roles: nextRoles,
      ministryIds: [...existing.ministryIds],
      choirIds: nextChoirIds,
      status: existing.status,
    });
    if (!updated) {
      return { ok: false, error: 'Could not update roles.' };
    }
  } else {
    let choirIds: string[] = [];
    if (input.role === 'choir_director') {
      const choirs = await listChoirs({ activeOnly: true });
      choirIds = ledChoirIdsForPerson(choirs, person.id);
    }
    const passwordHash = await hashPassword(crypto.randomUUID());
    await createUserRecord({
      email: person.email,
      name: personDisplayName(person),
      roles: [input.role],
      ministryIds: [],
      choirIds,
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

export async function removeMusicRoleFromPerson(
  input: RemoveMusicRoleInput,
): Promise<{ ok: true; person: DirectoryPerson } | { ok: false; error: string }> {
  try {
    await requireMusicPeopleManage();
  } catch (error) {
    return permissionError(error) ?? { ok: false, error: 'You must be signed in.' };
  }

  const role = input.role as MusicManageableRole;
  if (!isMusicManageableRole(role)) {
    return { ok: false, error: 'That music role cannot be changed here.' };
  }

  const person = await getPerson(input.personId);
  if (!person) {
    return { ok: false, error: 'Person not found in the directory.' };
  }
  if (!person.email) {
    return { ok: false, error: 'This directory record has no email to match a login.' };
  }

  const existing = await findUserByEmail(person.email);
  if (!existing) {
    return { ok: false, error: 'No app account is linked to this person.' };
  }
  if (
    existing.roles.includes('super_admin') ||
    existing.roles.includes('webmaster')
  ) {
    return { ok: false, error: 'You cannot modify this account.' };
  }
  if (!existing.roles.includes(role)) {
    return { ok: false, error: 'They do not have that role.' };
  }

  const nextRoles = existing.roles.filter((item) => item !== role);
  const updated = await updateUserRecord(existing.id, {
    name: existing.name,
    roles: [...nextRoles],
    ministryIds: [...existing.ministryIds],
    choirIds: role === 'choir_director' ? [] : [...existing.choirIds],
    status: existing.status,
  });
  if (!updated) {
    return { ok: false, error: 'Could not update roles.' };
  }

  const enriched = await getDirectoryPerson(person.id);
  if (!enriched) {
    return { ok: false, error: 'Role removed, but could not reload the person.' };
  }
  return { ok: true, person: enriched };
}
