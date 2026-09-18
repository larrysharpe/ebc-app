import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AppShell } from '@/components/layout/app-shell';
import { getSession } from '@/modules/auth/services/auth.service';
import { getMusicAccess } from '@/modules/auth/utils/permissions.utils';
import { SongRequestReviewPanel } from '@/modules/music/features/song-request';
import { listSongRequests } from '@/modules/music/repository/song-request.repository';

export default async function SongRequestsPage() {
  const session = await getSession();
  const access = getMusicAccess(session?.roles ?? ['volunteer']);

  if (!access.canManageSongs) {
    redirect('/music?denied=1');
  }

  const requests = await listSongRequests();

  return (
    <AppShell
      currentPath="/music"
      title="Song requests"
      subtitle="Review choir suggestions and add songs to the repertoire"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/music" className="text-sm text-ebc-burgundy hover:underline">
            ← Music home
          </Link>
          <Link href="/music/songs" className="text-sm text-slate-600 hover:underline">
            Song catalog
          </Link>
        </div>
        <SongRequestReviewPanel requests={requests} />
      </div>
    </AppShell>
  );
}
