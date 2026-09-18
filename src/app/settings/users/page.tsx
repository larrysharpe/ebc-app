import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AppShell } from '@/components/layout/app-shell';
import { UserManagement } from '@/modules/auth/features/user-management';
import { getSession } from '@/modules/auth/services/auth.service';
import {
  getAssignableRoles,
  listAdminUsers,
} from '@/modules/auth/services/user-admin.service';
import { isPlatformAdmin } from '@/modules/auth/utils/ministry-scope.utils';
import { listChoirs } from '@/modules/music/repository/choir.repository';

export default async function SettingsUsersPage() {
  const session = await getSession();
  if (!session || !isPlatformAdmin(session.roles)) {
    redirect('/?denied=1');
  }

  const [users, choirs] = await Promise.all([listAdminUsers(), listChoirs()]);
  const assignableRoles = getAssignableRoles(session);
  const choirOptions = choirs
    .filter((choir) => choir.active)
    .map((choir) => ({ id: choir.id, name: choir.name }));

  return (
    <AppShell
      currentPath="/settings"
      title="Staff accounts"
      subtitle="Users and role assignments"
    >
      <div className="space-y-6">
        <Link href="/settings" className="text-sm text-ebc-burgundy hover:underline">
          ← Settings
        </Link>
        <UserManagement
          users={users}
          assignableRoles={assignableRoles}
          choirOptions={choirOptions}
          actor={{ id: session.id, roles: session.roles }}
        />
      </div>
    </AppShell>
  );
}
