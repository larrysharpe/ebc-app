import { redirect } from 'next/navigation';

import { AppShell } from '@/components/layout/app-shell';
import { getSession } from '@/modules/auth/services/auth.service';
import { UserPreferencesPanel } from '@/modules/preferences';
import { getUserUiPreferences } from '@/modules/preferences/server';

export default async function AccountPreferencesPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login?next=/account/preferences');
  }

  const preferences = await getUserUiPreferences(session.id);

  return (
    <AppShell
      currentPath="/account/preferences"
      title="Preferences"
      subtitle="Personal choices for how the app works for you"
    >
      <UserPreferencesPanel preferences={preferences} />
    </AppShell>
  );
}
