import {
  DEV_ACCOUNT_GROUPS,
  DEV_SEED_USERS,
} from '@/modules/auth/data/users.seed';
import { listUsers } from '@/modules/auth/repositories/user.repository';
import type { DevAccountOption } from '@/modules/auth/types/dev-auth.types';
import { isDevAuthEnabled } from '@/modules/auth/utils/dev-auth.utils';

const seedUserByEmail = new Map(DEV_SEED_USERS.map((user) => [user.email, user]));

/** Curated seed groups plus every active DB account (dev only). */
export async function listDevAccountOptions(): Promise<DevAccountOption[]> {
  if (!isDevAuthEnabled()) return [];

  const seedOptions: DevAccountOption[] = DEV_ACCOUNT_GROUPS.flatMap((group) =>
    group.emails.map((email) => {
      const seed = seedUserByEmail.get(email);
      return {
        email,
        name: seed?.name ?? email,
        roles: seed?.roles ?? ['volunteer'],
        ministryIds: seed?.ministryIds ?? [],
        choirIds: seed?.choirIds ?? [],
        group: group.label,
      };
    }),
  );

  const seedEmails = new Set(seedOptions.map((option) => option.email.toLowerCase()));
  const dbUsers = await listUsers();
  const extraUsers: DevAccountOption[] = dbUsers
    .filter(
      (user) =>
        user.status === 'active' && !seedEmails.has(user.email.toLowerCase()),
    )
    .map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      ministryIds: user.ministryIds,
      choirIds: user.choirIds,
      group: 'All users',
    }));

  return [...seedOptions, ...extraUsers];
}
