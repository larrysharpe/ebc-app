import { AppShell } from '@/components/layout/app-shell';
import { getSopConfigAction } from '@/modules/leadership/actions/sop-config.actions';
import { SopGuidanceEditor } from '@/modules/leadership';

export default async function SopGuidancePage() {
  const config = await getSopConfigAction();

  return (
    <AppShell
      currentPath="/leadership"
      title="SOP section guidance"
      subtitle="Leadership controls"
    >
      <SopGuidanceEditor config={config} />
    </AppShell>
  );
}
