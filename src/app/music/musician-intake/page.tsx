import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AppShell } from '@/components/layout/app-shell';
import { getSession } from '@/modules/auth/services/auth.service';
import { getMusicAccess } from '@/modules/auth/utils/permissions.utils';
import { MusicianIntakePanel } from '@/modules/music/features/musician-intake';
import { listMusicianIntakes } from '@/modules/music/repository/musician-intake.repository';

export default async function MusicianIntakePage() {
  const session = await getSession();
  const access = getMusicAccess(session?.roles ?? ['volunteer']);

  if (!access.canManageIntake) {
    redirect('/music?denied=1');
  }

  const intakes = await listMusicianIntakes();

  return (
    <AppShell
      currentPath="/music"
      title="Musician intake"
      subtitle="Signup and payment paperwork — then add to the band roster"
    >
      <div className="space-y-6">
        <Link href="/music" className="text-sm text-ebc-burgundy hover:underline">
          ← Music home
        </Link>
        <MusicianIntakePanel intakes={intakes} />
      </div>
    </AppShell>
  );
}
