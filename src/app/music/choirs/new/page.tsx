import { redirect } from 'next/navigation';

import { AppShell } from '@/components/layout/app-shell';
import { getSession } from '@/modules/auth/services/auth.service';
import { getMusicAccess } from '@/modules/auth/utils/permissions.utils';
import { listPeople } from '@/modules/members/repositories/person.repository';
import { ChoirEditForm } from '@/modules/music/features/choir-edit';

export default async function NewChoirPage() {
  const session = await getSession();
  const access = getMusicAccess(session?.roles ?? ['volunteer']);

  if (!access.canManageRotation) {
    redirect('/music/choirs?denied=1');
  }

  const people = await listPeople({ limit: 500 });

  return (
    <AppShell
      currentPath="/music"
      title="New choir"
      subtitle="Create a chapel choir and add members"
    >
      <ChoirEditForm people={people} />
    </AppShell>
  );
}
