import { listUsers } from '@/modules/auth/repositories/user.repository';
import { hasAnyRole } from '@/modules/auth/utils/roles.utils';
import { getPeopleByIds } from '@/modules/members/repositories/person.repository';
import { getChoirById } from '@/modules/music/repository/choir.repository';

const MUSIC_LEADER_ROLES = [
  'music_minister',
  'choir_director',
  'super_admin',
  'admin',
  'pastor',
] as const;

/**
 * Users who should hear about a shared/updated choir plan:
 * roster contacts (matched by email) plus music leadership.
 */
export async function listChoirPlanNotifyUserIds(
  choirGroup: string,
  excludeUserId?: string,
): Promise<string[]> {
  const [choir, users] = await Promise.all([getChoirById(choirGroup), listUsers()]);
  const personIds = new Set<string>();
  if (choir) {
    for (const leader of choir.leaders) personIds.add(leader.personId);
    for (const member of choir.members) personIds.add(member.personId);
  }

  const people = await getPeopleByIds([...personIds]);
  const emails = new Set(
    people
      .map((person) => person.email?.trim().toLowerCase())
      .filter((email): email is string => Boolean(email)),
  );

  const ids = new Set<string>();
  for (const user of users) {
    if (user.status !== 'active') continue;
    const emailMatch = emails.has(user.email.toLowerCase());
    const leaderMatch = hasAnyRole(user.roles, MUSIC_LEADER_ROLES);
    if (emailMatch || leaderMatch) {
      ids.add(user.id);
    }
  }

  if (excludeUserId) ids.delete(excludeUserId);
  return [...ids];
}

export async function listMusicLeaderNotifyUserIds(
  excludeUserId?: string,
): Promise<string[]> {
  const users = await listUsers();
  const ids = users
    .filter(
      (user) =>
        user.status === 'active' && hasAnyRole(user.roles, MUSIC_LEADER_ROLES),
    )
    .map((user) => user.id);
  return excludeUserId ? ids.filter((id) => id !== excludeUserId) : ids;
}
