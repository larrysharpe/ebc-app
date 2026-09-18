import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AppShell } from '@/components/layout/app-shell';
import { AccessOverview } from '@/modules/auth/features/access-overview';
import { getSession } from '@/modules/auth/services/auth.service';
import { isPlatformAdmin } from '@/modules/auth/utils/ministry-scope.utils';

export default async function SettingsAccessPage() {
  const session = await getSession();
  if (!session || !isPlatformAdmin(session.roles)) {
    redirect('/?denied=1');
  }

  return (
    <AppShell
      currentPath="/settings"
      title="Roles & permissions"
      subtitle="Access control reference"
    >
      <div className="space-y-6">
        <Link href="/settings" className="text-sm text-ebc-burgundy hover:underline">
          ← Settings
        </Link>
        <AccessOverview />
      </div>
    </AppShell>
  );
}
