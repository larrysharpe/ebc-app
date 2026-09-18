import Link from 'next/link';

import { AppShell } from '@/components/layout/app-shell';
import { getSession } from '@/modules/auth/services/auth.service';
import { getMusicAccess } from '@/modules/auth/utils/permissions.utils';
import { listPeople } from '@/modules/members/repositories/person.repository';
import { getBandRoster } from '@/modules/music/repository/music.repository';
import { BandRosterPanel } from '@/modules/music';
import { BandRosterManagement } from '@/modules/music/features/band-roster';

export default async function MusicBandPage() {
  const session = await getSession();
  const access = getMusicAccess(session?.roles ?? ['volunteer']);
  const [roster, people] = await Promise.all([
    getBandRoster(),
    listPeople({ limit: 500 }),
  ]);

  return (
    <AppShell
      currentPath="/music"
      title="Band roster"
      subtitle="Chapel musicians by Sunday"
    >
      <div className="space-y-6">
        <Link href="/music" className="text-sm text-ebc-burgundy hover:underline">
          ← Music home
        </Link>
        {access.canManageBand ? (
          <BandRosterManagement roster={roster} people={people} />
        ) : null}
        <BandRosterPanel roster={roster} showSundayMatrix />
      </div>
    </AppShell>
  );
}
