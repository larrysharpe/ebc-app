import { notFound, redirect } from 'next/navigation';

import { AppShell } from '@/components/layout/app-shell';
import { getSession } from '@/modules/auth/services/auth.service';
import {
  canAccessMinistrySlug,
  canApproveMinistrySop,
  canManageMinistry,
} from '@/modules/auth/utils/ministry-scope.utils';
import { listChurchEvents } from '@/modules/events/repositories/church-event.repository';
import { canApproveActivityRequest } from '@/modules/events';
import { filterEventsForMinistryCalendar } from '@/modules/events/utils/church-event-relevance.utils';
import { getSopConfigAction } from '@/modules/leadership/actions/sop-config.actions';
import { getMinistryAction } from '@/modules/ministries/actions/ministry.actions';
import { listMinistryMediaAction } from '@/modules/ministries/actions/ministry-media.actions';
import { MinistryDetail } from '@/modules/ministries';
import type { MinistryTab } from '@/modules/ministries/types';
import { getUserUiPreferences } from '@/modules/preferences/server';

const VALID_TABS: MinistryTab[] = [
  'calendar',
  'overview',
  'personnel',
  'duties',
  'sops',
  'media',
  'documents',
];

type MinistryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function MinistryPage({ params, searchParams }: MinistryPageProps) {
  const { slug } = await params;
  const { tab } = await searchParams;
  const session = await getSession();

  if (session && !canAccessMinistrySlug(session, slug)) {
    redirect('/ministries?denied=1');
  }

  const ministry = await getMinistryAction(slug);
  const sopConfig = await getSopConfigAction();

  if (!ministry) {
    notFound();
  }

  const activeTab: MinistryTab =
    tab && VALID_TABS.includes(tab as MinistryTab) ? (tab as MinistryTab) : 'calendar';

  const canManage = session ? canManageMinistry(session, ministry.id) : false;
  const canApprove = session ? canApproveMinistrySop(session) : false;
  const canApproveEvents = session
    ? canApproveActivityRequest(session.roles)
    : false;

  const churchEvents =
    activeTab === 'calendar'
      ? filterEventsForMinistryCalendar(
          await listChurchEvents({
            ministryId: ministry.id,
            includeChurchWide: true,
            includeCancelled: true,
          }),
          ministry.id,
        )
      : [];

  const uiPreferences =
    session && activeTab === 'calendar'
      ? await getUserUiPreferences(session.id)
      : null;

  const mediaResult =
    activeTab === 'media'
      ? await listMinistryMediaAction(slug, 'media')
      : { ok: true as const, assets: [] };
  const documentResult =
    activeTab === 'documents'
      ? await listMinistryMediaAction(slug, 'documents')
      : { ok: true as const, assets: [] };

  return (
    <AppShell
      currentPath={`/ministries/${slug}`}
      title={ministry.name}
      subtitle="Ministry management"
    >
      <MinistryDetail
        ministry={ministry}
        activeTab={activeTab}
        sopConfig={sopConfig}
        churchEvents={churchEvents}
        mediaAssets={mediaResult.ok ? mediaResult.assets : []}
        documentAssets={documentResult.ok ? documentResult.assets : []}
        canManage={canManage}
        canApprove={canApprove}
        canApproveEvents={canApproveEvents}
        voiceCoachPreference={uiPreferences?.voiceCoachPreference}
      />
    </AppShell>
  );
}
