import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AppShell } from '@/components/layout/app-shell';
import { getSession } from '@/modules/auth/services/auth.service';
import { getMusicAccess } from '@/modules/auth/utils/permissions.utils';
import {
  getPersonByEmail,
  listPeople,
} from '@/modules/members/repositories/person.repository';
import { ChoirSetup } from '@/modules/music/features/choir-setup';
import { listChoirs } from '@/modules/music/repository/choir.repository';
import {
  getPlans,
  getScheduleOverrides,
} from '@/modules/music/repository/music.repository';

export default async function MusicChoirsPage() {
  const session = await getSession();
  const access = getMusicAccess(session?.roles ?? ['volunteer']);

  if (!access.canView) {
    redirect('/music?denied=1');
  }

  const [plans, scheduleOverrides, choirs, people, person] = await Promise.all([
    getPlans(),
    getScheduleOverrides(),
    listChoirs(),
    listPeople({ limit: 500 }),
    session?.email ? getPersonByEmail(session.email) : Promise.resolve(null),
  ]);

  const isSetup = access.canManageRotation;

  return (
    <AppShell
      currentPath="/music"
      title={isSetup ? 'Choir setup' : 'My choirs'}
      subtitle={
        isSetup
          ? 'Choirs, Sunday rotation, and schedule swaps'
          : 'Your choirs and the chapel rotation'
      }
    >
      <div className="space-y-6">
        <Link href="/music" className="text-sm text-ebc-burgundy hover:underline">
          ← Music home
        </Link>
        <ChoirSetup
          choirs={choirs}
          people={people}
          overrides={scheduleOverrides}
          plans={plans}
          canManage={isSetup}
          personId={person?.id ?? null}
        />
      </div>
    </AppShell>
  );
}
