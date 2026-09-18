import { redirect } from 'next/navigation';

import { AppShell } from '@/components/layout/app-shell';
import { MyAccessPanel } from '@/modules/auth/features/my-access';
import { getSession } from '@/modules/auth/services/auth.service';

export default async function AccountPermissionsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  return (
    <AppShell
      currentPath="/"
      title="Permissions"
      subtitle="Your roles and access"
    >
      <MyAccessPanel user={session} />
    </AppShell>
  );
}
