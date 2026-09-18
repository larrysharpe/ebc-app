import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AppShell } from '@/components/layout/app-shell';
import { getSession } from '@/modules/auth/services/auth.service';
import { resolveScopedChoirIds } from '@/modules/auth/utils/choir-scope.utils';
import { getMusicAccess } from '@/modules/auth/utils/permissions.utils';
import { getPersonByEmail } from '@/modules/members/repositories/person.repository';
import {
  filterPlansForDirectorScope,
  ledChoirIdsForPerson,
} from '@/modules/music/features/my-choirs';
import { listChoirs } from '@/modules/music/repository/choir.repository';
import { getPlans } from '@/modules/music/repository/music.repository';
import { PlanList } from '@/modules/music';

export default async function MusicPlansPage() {
  const session = await getSession();
  const access = getMusicAccess(session?.roles ?? ['volunteer']);

  if (!access.canEditPlans) {
    redirect('/music?denied=1');
  }

  const [plans, choirs, person] = await Promise.all([
    getPlans(),
    listChoirs(),
    session?.email ? getPersonByEmail(session.email) : Promise.resolve(null),
  ]);

  const visiblePlans = filterPlansForDirectorScope(plans, {
    seeAll: access.canManageRotation,
    ledChoirIds: resolveScopedChoirIds(
      session?.choirIds ?? [],
      ledChoirIdsForPerson(choirs, person?.id),
    ),
  });

  return (
    <AppShell
      currentPath="/music"
      title="Choir plans"
      subtitle="Choir plans for worship and other church events"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/music" className="text-sm text-ebc-burgundy hover:underline">
            ← Music home
          </Link>
          <Link
            href="/music/plans/new"
            className="rounded-lg bg-ebc-burgundy px-4 py-2 text-sm font-medium text-white hover:bg-ebc-burgundy-dark"
          >
            New choir plan
          </Link>
        </div>
        <PlanList plans={visiblePlans} />
      </div>
    </AppShell>
  );
}
