import { notFound } from 'next/navigation';

import { AppShell } from '@/components/layout/app-shell';
import { getSession } from '@/modules/auth/services/auth.service';
import { getMusicAccess } from '@/modules/auth/utils/permissions.utils';
import { getChurchEventById } from '@/modules/events/repositories/church-event.repository';
import { getSundayServiceById } from '@/modules/events/repositories/sunday-service.repository';
import { PlanDetail, PlanDraftBanner } from '@/modules/music';
import { getPlanById, getSongs } from '@/modules/music/repository/music.repository';
import { getPlanResponseBoard } from '@/modules/music/services/plan-response.service';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MusicPlanDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSession();
  const access = getMusicAccess(session?.roles ?? ['volunteer']);
  const [plan, songs] = await Promise.all([getPlanById(id), getSongs()]);

  if (!plan) notFound();

  const [churchEvent, sundayService, responseBoard] = await Promise.all([
    plan.churchEventId ? getChurchEventById(plan.churchEventId) : null,
    plan.sundayServiceId ? getSundayServiceById(plan.sundayServiceId) : null,
    plan.status === 'sent' && access.canViewPlans
      ? getPlanResponseBoard(plan.id)
      : Promise.resolve(null),
  ]);

  return (
    <AppShell
      currentPath="/music"
      title="Choir plan"
      subtitle={plan.title}
      headerTitleAside={plan.status === 'draft' ? <PlanDraftBanner /> : undefined}
    >
      <PlanDetail
        plan={plan}
        songs={songs}
        access={access}
        churchEvent={churchEvent}
        sundayService={sundayService}
        currentUser={session}
        responseBoard={responseBoard}
      />
    </AppShell>
  );
}
