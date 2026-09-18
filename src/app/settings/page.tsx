import { redirect } from 'next/navigation';

import { AppShell } from '@/components/layout/app-shell';
import { SettingsHub } from '@/modules/auth/features/settings-hub';
import { getSession } from '@/modules/auth/services/auth.service';
import { isPlatformAdmin } from '@/modules/auth/utils/ministry-scope.utils';

export default async function SettingsPage() {
  const session = await getSession();
  if (!session || !isPlatformAdmin(session.roles)) {
    redirect('/?denied=1');
  }

  return (
    <AppShell currentPath="/settings" title="Settings" subtitle="Platform administration">
      <SettingsHub />
    </AppShell>
  );
}
