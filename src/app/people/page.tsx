import { redirect } from 'next/navigation';

import { AppShell } from '@/components/layout/app-shell';
import { getSession } from '@/modules/auth/services/auth.service';
import { hasAnyRole } from '@/modules/auth/utils/roles.utils';
import {
  MemberDirectory,
  listDirectoryPeopleAction,
  parseDirectorySearchParams,
  resolveDirectorySort,
} from '@/modules/members';

type PeoplePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PeoplePage({ searchParams }: PeoplePageProps) {
  const session = await getSession();
  if (!session) {
    redirect('/login?next=/people');
  }

  const params = await searchParams;
  const query = parseDirectorySearchParams(params);
  const { sort, dir } = resolveDirectorySort(query);

  const result = await listDirectoryPeopleAction({
    query: query.q,
    membershipStatus: query.status,
    page: query.page,
    sort,
    dir,
  });

  const people = result.ok ? result.people : [];
  const page = result.ok
    ? result.page
    : { page: 1, pageSize: 25, total: 0, totalPages: 1 };

  const canManage = hasAnyRole(session.roles, [
    'super_admin',
    'admin',
    'pastor',
    'office_staff',
    'ministry_leader',
  ]);

  return (
    <AppShell currentPath="/people" title="People" subtitle="Church directory">
      <MemberDirectory
        people={people}
        page={page}
        query={query.q ?? ''}
        status={query.status ?? ''}
        sort={sort}
        dir={dir}
        canManage={canManage}
      />
    </AppShell>
  );
}
