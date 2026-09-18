import { notFound } from 'next/navigation';

import { AppShell } from '@/components/layout/app-shell';
import { getPlans, getSongById } from '@/modules/music/repository/music.repository';
import { SongDetail } from '@/modules/music';
import { getSongPerformances } from '@/modules/music/utils/song-history.utils';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MusicSongDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [song, plans] = await Promise.all([getSongById(id), getPlans()]);

  if (!song) notFound();

  const performances = getSongPerformances(id, plans);

  return (
    <AppShell currentPath="/music" title="Song detail" subtitle={song.title}>
      <SongDetail song={song} performances={performances} />
    </AppShell>
  );
}
