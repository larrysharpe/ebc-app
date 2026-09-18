import { AppShell } from '@/components/layout/app-shell';
import { getSession } from '@/modules/auth/services/auth.service';
import { getMusicAccess } from '@/modules/auth/utils/permissions.utils';
import { getPersonByEmail } from '@/modules/members/repositories/person.repository';
import { MusicHub } from '@/modules/music';
import { listChoirs } from '@/modules/music/repository/choir.repository';
import {
  getBandRoster,
  getPlans,
  getScheduleOverrides,
  getSongs,
} from '@/modules/music/repository/music.repository';
import { buildRepertoireSnapshot } from '@/modules/music/utils/repertoire.utils';

export default async function MusicPage() {
  const session = await getSession();
  const access = getMusicAccess(session?.roles ?? ['volunteer']);

  const [plans, songs, scheduleOverrides, bandRoster, choirs, person] =
    await Promise.all([
      getPlans(),
      getSongs(),
      getScheduleOverrides(),
      getBandRoster(),
      listChoirs(),
      session?.email ? getPersonByEmail(session.email) : Promise.resolve(null),
    ]);

  const repertoire = buildRepertoireSnapshot(songs, plans);
  const isChoirDirector = access.canEditPlans;
  const isBandOnly = access.canViewBand && !access.canViewPlans;
  const isChoirViewer = access.canViewPlans && !access.canEditPlans;

  const title = isBandOnly
    ? 'Band'
    : isChoirDirector
      ? 'Choir'
      : access.canViewPlans
        ? 'Choir'
        : 'Music';

  const subtitle = isBandOnly
    ? 'Who’s playing this month'
    : isChoirDirector
      ? 'This Sunday’s plan, drafts, and choir tools'
      : isChoirViewer
        ? 'This Sunday’s songs — practice and say if you can make it'
        : 'Choir plans and songs';

  return (
    <AppShell currentPath="/music" title={title} subtitle={subtitle}>
      <MusicHub
        plans={plans}
        scheduleOverrides={scheduleOverrides}
        bandRoster={bandRoster}
        repertoire={repertoire}
        access={access}
        choirs={choirs}
        personId={person?.id ?? null}
        assignedChoirIds={session?.choirIds ?? []}
      />
    </AppShell>
  );
}
