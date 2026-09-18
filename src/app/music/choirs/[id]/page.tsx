import { notFound, redirect } from 'next/navigation';

import { AppShell } from '@/components/layout/app-shell';
import { getSession } from '@/modules/auth/services/auth.service';
import { getMusicAccess } from '@/modules/auth/utils/permissions.utils';
import { listPeople } from '@/modules/members/repositories/person.repository';
import { ChoirEditForm } from '@/modules/music/features/choir-edit';
import { getChoirById } from '@/modules/music/repository/choir.repository';

type ChoirEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ChoirEditPage({ params }: ChoirEditPageProps) {
  const session = await getSession();
  const access = getMusicAccess(session?.roles ?? ['volunteer']);

  if (!access.canManageRotation) {
    redirect('/music/choirs?denied=1');
  }

  const { id } = await params;
  const [choir, people] = await Promise.all([
    getChoirById(id),
    listPeople({ limit: 500 }),
  ]);

  if (!choir) {
    notFound();
  }

  return (
    <AppShell
      currentPath="/music"
      title={choir.name}
      subtitle="Edit choir, leaders, and members"
    >
      <ChoirEditForm choir={choir} people={people} />
    </AppShell>
  );
}
