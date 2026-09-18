import {
  personDisplayName,
  type Person,
} from '@/modules/members/types/person.types';

import type { ChoirLeader, ChoirMember, ChoirMemberRole } from '../types';
import { CHOIR_MEMBER_ROLES } from '../types';

/** Migrate legacy free-text choir leader names → Person ids. */
const LEGACY_LEADER_NAME_TO_PERSON_ID: Record<string, string> = {
  'lydia stewart': 'person-lydia-stewart',
  'nikki jennings': 'person-nikki-jennings',
  'niki jennings': 'person-nikki-jennings',

  'leonard whicker': 'person-leonard-whicker',
  kayla: 'person-kayla-tbd',
  alex: 'person-alex-tbd',
  'andre porter': 'person-andre-porter',
  'lauren guinyard': 'person-lauren-guinyard',
  gore: 'person-gore',
};

export function parseChoirLeader(value: unknown): ChoirLeader | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;

  if (typeof row.personId === 'string' && row.personId.trim()) {
    return {
      personId: row.personId.trim(),
      title:
        typeof row.title === 'string' && row.title.trim()
          ? row.title.trim()
          : undefined,
    };
  }

  // Legacy { name, title?, lastNamePending? }
  if (typeof row.name === 'string' && row.name.trim()) {
    const key = row.name.trim().toLowerCase();
    const personId = LEGACY_LEADER_NAME_TO_PERSON_ID[key];
    if (!personId) return null;
    return {
      personId,
      title:
        typeof row.title === 'string' && row.title.trim()
          ? row.title.trim()
          : undefined,
    };
  }

  return null;
}

export function formatLeaderName(
  leader: ChoirLeader,
  peopleById: ReadonlyMap<string, Person> = new Map(),
): string {
  const person = peopleById.get(leader.personId);
  const base = person
    ? personDisplayName(person)
    : leader.personId.replace(/^person-/, '').replace(/-/g, ' ');
  return leader.title ? `${leader.title} ${base}` : base;
}

export function formatLeadersList(
  leaders: ChoirLeader[],
  peopleById: ReadonlyMap<string, Person> = new Map(),
): string {
  if (leaders.length === 0) return '';
  return leaders.map((leader) => formatLeaderName(leader, peopleById)).join(' · ');
}

function parseChoirMemberRole(value: unknown): ChoirMemberRole {
  if (
    typeof value === 'string' &&
    (CHOIR_MEMBER_ROLES as readonly string[]).includes(value)
  ) {
    return value as ChoirMemberRole;
  }
  return 'singer';
}

export function parseChoirMember(value: unknown): ChoirMember | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;
  if (typeof row.personId === 'string' && row.personId.trim()) {
    return {
      personId: row.personId.trim(),
      role: parseChoirMemberRole(row.role),
    };
  }
  return null;
}

export function membersByRole(
  members: readonly ChoirMember[],
  role: ChoirMemberRole,
): ChoirMember[] {
  return members.filter((member) => member.role === role);
}

export function formatMemberName(
  member: ChoirMember,
  peopleById: ReadonlyMap<string, Person> = new Map(),
): string {
  const person = peopleById.get(member.personId);
  return person
    ? personDisplayName(person)
    : member.personId.replace(/^person-/, '').replace(/-/g, ' ');
}

export function peopleByIdMap(people: readonly Person[]): Map<string, Person> {
  return new Map(people.map((person) => [person.id, person]));
}

export function resolveMusicianDisplayName(
  name: string,
  personId: string | undefined,
  peopleById: ReadonlyMap<string, Person>,
): string {
  if (!personId) return name;
  const person = peopleById.get(personId);
  return person ? personDisplayName(person) : name;
}
