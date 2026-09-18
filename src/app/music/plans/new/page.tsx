import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AppShell } from '@/components/layout/app-shell';
import { getSession } from '@/modules/auth/services/auth.service';
import { resolveScopedChoirIds } from '@/modules/auth/utils/choir-scope.utils';
import { getMusicAccess } from '@/modules/auth/utils/permissions.utils';
import { listChurchEvents } from '@/modules/events/repositories/church-event.repository';
import { getPersonByEmail } from '@/modules/members/repositories/person.repository';
import { ledChoirIdsForPerson } from '@/modules/music/features/my-choirs';
import { NewPlanForm } from '@/modules/music/features/service-planner/NewPlanForm';
import { listChoirs } from '@/modules/music/repository/choir.repository';
import { getChoirDirectorSettings } from '@/modules/music/repository/director-settings.repository';
import { getPlans, getSongs } from '@/modules/music/repository/music.repository';

export default async function NewMusicPlanPage() {
  const session = await getSession();
  const access = getMusicAccess(session?.roles ?? ['volunteer']);

  if (!access.canEditPlans) {
    redirect('/music/plans?denied=1');
  }

  const [settings, churchEvents, choirs, plans, songs, person] = await Promise.all([
    getChoirDirectorSettings(),
    listChurchEvents(),
    listChoirs({ activeOnly: true }),
    getPlans(),
    getSongs(),
    session?.email ? getPersonByEmail(session.email) : Promise.resolve(null),
  ]);

  const scopedChoirIds = resolveScopedChoirIds(
    session?.choirIds ?? [],
    ledChoirIdsForPerson(choirs, person?.id),
  );
  const visibleChoirs = access.canManageRotation
    ? choirs
    : choirs.filter((choir) => scopedChoirIds.includes(choir.id));

  return (
    <AppShell
      currentPath="/music"
      title="New choir plan"
      subtitle="Plan choir music for any church event"
    >
      <div className="space-y-3 sm:space-y-6">
        <Link
          href="/music/plans"
          className="hidden text-sm text-ebc-burgundy hover:underline sm:inline"
        >
          ← Choir plans
        </Link>
        <NewPlanForm
          settings={settings}
          churchEvents={churchEvents}
          choirs={visibleChoirs}
          songs={songs}
          existingPlans={plans}
          canSendPlans={access.canSendPlans}
        />
      </div>
    </AppShell>
  );
}
