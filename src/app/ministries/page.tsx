import { AppShell } from '@/components/layout/app-shell';
import { getSession } from '@/modules/auth/services/auth.service';
import {
  filterMinistriesForUser,
  isScopedMinistryLeader,
} from '@/modules/auth/utils/ministry-scope.utils';
import { getMinistriesAction } from '@/modules/ministries/actions/ministry.actions';
import { MinistryRegistry } from '@/modules/ministries';

export default async function MinistriesPage() {
  const session = await getSession();
  const ministries = await getMinistriesAction();
  const visibleMinistries = session
    ? filterMinistriesForUser(session, ministries)
    : ministries;

  return (
    <AppShell
      currentPath="/ministries"
      title="Ministries"
      subtitle="Teams, programs, and leadership"
    >
      <MinistryRegistry
        ministries={visibleMinistries}
        scopedToSingleMinistry={session ? isScopedMinistryLeader(session) : false}
      />
    </AppShell>
  );
}
