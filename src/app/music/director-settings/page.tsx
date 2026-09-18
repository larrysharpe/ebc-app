import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AppShell } from '@/components/layout/app-shell';
import { getSession } from '@/modules/auth/services/auth.service';
import { getMusicAccess } from '@/modules/auth/utils/permissions.utils';
import { DirectorSettingsForm } from '@/modules/music/features/director-settings';
import { listChoirs } from '@/modules/music/repository/choir.repository';
import { getChoirDirectorSettings } from '@/modules/music/repository/director-settings.repository';

export default async function DirectorSettingsPage() {
  const session = await getSession();
  const access = getMusicAccess(session?.roles ?? ['volunteer']);

  if (!access.canEditPlans) {
    redirect('/music?denied=1');
  }

  const [settings, choirs] = await Promise.all([
    getChoirDirectorSettings(),
    listChoirs({ activeOnly: true }),
  ]);

  return (
    <AppShell
      currentPath="/music"
      title="Director settings"
      subtitle="Defaults for new choir plans and service slot templates"
    >
      <div className="space-y-6">
        <Link href="/music" className="text-sm text-ebc-burgundy hover:underline">
          ← Music home
        </Link>
        <DirectorSettingsForm settings={settings} choirs={choirs} />
      </div>
    </AppShell>
  );
}
