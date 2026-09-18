import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AppShell } from '@/components/layout/app-shell';
import { getSession } from '@/modules/auth/services/auth.service';
import { getMusicAccess } from '@/modules/auth/utils/permissions.utils';
import { MusicPeopleManagement } from '@/modules/music/features/music-people';
import { getMusicPeopleWorkspace } from '@/modules/music/services/music-people.service';

export default async function MusicPeoplePage() {
  const session = await getSession();
  const access = getMusicAccess(session?.roles ?? ['volunteer']);

  if (!access.canManagePeople) {
    redirect('/music?denied=1');
  }

  const workspace = await getMusicPeopleWorkspace();

  return (
    <AppShell
      currentPath="/music/people"
      title="Music people"
      subtitle="Choir rosters, external musicians, and app access"
    >
      <div className="space-y-6">
        <Link href="/music" className="text-sm text-ebc-burgundy hover:underline">
          ← Music home
        </Link>
        <MusicPeopleManagement
          choirs={workspace.choirs}
          peopleById={workspace.peopleById}
          externalMusicians={workspace.externalMusicians}
          rolePeople={workspace.rolePeople}
        />
      </div>
    </AppShell>
  );
}
