import { redirect } from 'next/navigation';

import { AppShell } from '@/components/layout/app-shell';
import { getSession } from '@/modules/auth/services/auth.service';
import {
  filterMinistriesForUser,
  hasGlobalMinistryAccess,
} from '@/modules/auth/utils/ministry-scope.utils';
import { listMinistries } from '@/modules/ministries/repositories/ministry.repository';
import {
  getNotificationSettingsForUser,
  NotificationSettings,
} from '@/modules/notifications';

export default async function AccountNotificationsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login?next=/account/notifications');
  }

  const ministries = await listMinistries();
  const scoped = hasGlobalMinistryAccess(session.roles)
    ? ministries
    : filterMinistriesForUser(session, ministries);
  const ministryOptions = scoped.map((ministry) => ({
    id: ministry.id,
    name: ministry.name,
  }));

  const settings = await getNotificationSettingsForUser(session, ministryOptions);

  return (
    <AppShell
      currentPath="/account/notifications"
      title="Notifications"
      subtitle="Email and app alerts for your roles"
    >
      <NotificationSettings
        settings={settings}
        ministryOptions={ministryOptions}
      />
    </AppShell>
  );
}
