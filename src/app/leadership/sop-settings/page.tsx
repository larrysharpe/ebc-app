import { AppShell } from '@/components/layout/app-shell';
import { getSopConfigAction } from '@/modules/leadership/actions/sop-config.actions';
import { SopSettingsEditor } from '@/modules/leadership';

export default async function SopSettingsPage() {
  const config = await getSopConfigAction();

  return (
    <AppShell
      currentPath="/leadership"
      title="SOP quality settings"
      subtitle="Leadership controls"
    >
      <SopSettingsEditor config={config} />
    </AppShell>
  );
}
