import { notFound, redirect } from 'next/navigation';

import { AppShell } from '@/components/layout/app-shell';
import { getSession } from '@/modules/auth/services/auth.service';
import { getMusicAccess } from '@/modules/auth/utils/permissions.utils';
import { PlanDraftBanner, PlanRehearsal } from '@/modules/music';
import { getPlanById, getSongs } from '@/modules/music/repository/music.repository';
import { getPlanResponseBoard } from '@/modules/music/services/plan-response.service';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MusicPlanRehearsePage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSession();
  const access = getMusicAccess(session?.roles ?? ['volunteer']);

  if (!access.canViewPlans) {
    redirect('/music?denied=1');
  }

  const [plan, songs] = await Promise.all([getPlanById(id), getSongs()]);
  if (!plan) notFound();

  const responseBoard =
    plan.status === 'sent' ? await getPlanResponseBoard(plan.id) : null;

  return (
    <AppShell
      currentPath="/music"
      title="Rehearse"
      subtitle={plan.title}
      headerTitleAside={plan.status === 'draft' ? <PlanDraftBanner /> : undefined}
    >
      <PlanRehearsal
        plan={plan}
        songs={songs}
        currentUser={session}
        responseBoard={responseBoard}
        canViewRoster={access.canEditPlans || access.canSendPlans}
      />
    </AppShell>
  );
}
