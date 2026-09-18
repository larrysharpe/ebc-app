import { redirect } from 'next/navigation';
import type { ReactElement } from 'react';

import { AppShell } from '@/components/layout/app-shell';
import { getSession } from '@/modules/auth/services/auth.service';
import {
  canManageFacilities,
  SpaceInventory,
} from '@/modules/facilities';
import { listManagedChurchSpaces } from '@/modules/facilities/server';

export default async function FacilitiesPage(): Promise<ReactElement> {
  const session = await getSession();
  if (!session || !canManageFacilities(session.roles)) {
    redirect('/?denied=1');
  }

  const spaces = await listManagedChurchSpaces();

  return (
    <AppShell
      currentPath="/facilities"
      title="Facilities"
      subtitle="Church spaces used on calendars and practice plans"
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          These rooms appear in location pickers on events and music forms. Hide a
          space if it should not be offered right now.
        </p>
        <SpaceInventory spaces={spaces} />
      </div>
    </AppShell>
  );
}
