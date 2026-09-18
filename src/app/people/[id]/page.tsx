import { notFound, redirect } from 'next/navigation';

import { AppShell } from '@/components/layout/app-shell';
import { getSession } from '@/modules/auth/services/auth.service';
import { hasAnyRole } from '@/modules/auth/utils/roles.utils';
import {
  MemberDetail,
  affiliationsForPerson,
  getDirectoryPersonAction,
  getHouseholdForPersonAction,
  personDisplayName,
} from '@/modules/members';
import { listMinistries } from '@/modules/ministries';

type PersonDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
};

export default async function PersonDetailPage({
  params,
  searchParams,
}: PersonDetailPageProps) {
  const session = await getSession();
  if (!session) {
    redirect('/login?next=/people');
  }

  const { id } = await params;
  const { edit } = await searchParams;
  const result = await getDirectoryPersonAction(id);
  if (!result.ok) {
    notFound();
  }

  const [householdResult, ministries] = await Promise.all([
    getHouseholdForPersonAction(id),
    listMinistries(),
  ]);
  const household = householdResult.ok ? householdResult.household : null;
  const affiliations = affiliationsForPerson(id, ministries);

  const canManage = hasAnyRole(session.roles, [
    'super_admin',
    'admin',
    'pastor',
    'office_staff',
    'ministry_leader',
  ]);

  return (
    <AppShell
      currentPath="/people"
      title={personDisplayName(result.person)}
      subtitle="Person detail"
    >
      <MemberDetail
        person={result.person}
        household={household}
        affiliations={affiliations}
        canManage={canManage}
        startInEdit={edit === '1' && canManage}
      />
    </AppShell>
  );
}
