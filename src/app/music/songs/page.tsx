import Link from 'next/link';

import { AppShell } from '@/components/layout/app-shell';
import { getSession } from '@/modules/auth/services/auth.service';
import { getMusicAccess } from '@/modules/auth/utils/permissions.utils';
import { SongCatalog, SongRequestForm } from '@/modules/music';
import { getSongs } from '@/modules/music/repository/music.repository';
import { countPendingSongRequests } from '@/modules/music/repository/song-request.repository';

export default async function MusicSongsPage() {
  const session = await getSession();
  const access = getMusicAccess(session?.roles ?? ['volunteer']);
  const songs = await getSongs();
  const pendingCount = access.canManageSongs
    ? await countPendingSongRequests()
    : 0;

  return (
    <AppShell
      currentPath="/music"
      title="Song catalog"
      subtitle="Lyrics, references, and themes"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/music" className="text-sm text-ebc-burgundy hover:underline">
            ← Music home
          </Link>
          {access.canManageSongs ? (
            <Link
              href="/music/song-requests"
              className="text-sm font-medium text-ebc-burgundy hover:underline"
            >
              Review requests
              {pendingCount > 0 ? ` (${pendingCount})` : ''}
            </Link>
          ) : null}
        </div>

        {songs.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
            No songs in the catalog yet.
            {access.canRequestSongs
              ? ' Submit a request below to get one added.'
              : ''}
          </p>
        ) : (
          <SongCatalog songs={songs} />
        )}

        {access.canRequestSongs ? <SongRequestForm /> : null}
      </div>
    </AppShell>
  );
}
