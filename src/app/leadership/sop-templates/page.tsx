import { AppShell } from '@/components/layout/app-shell';
import { getSopConfigAction } from '@/modules/leadership/actions/sop-config.actions';
import { SopTemplateManager } from '@/modules/leadership';

export default async function SopTemplatesPage() {
  const config = await getSopConfigAction();

  return (
    <AppShell
      currentPath="/leadership"
      title="SOP templates"
      subtitle="Leadership controls"
    >
      <SopTemplateManager config={config} />
    </AppShell>
  );
}
