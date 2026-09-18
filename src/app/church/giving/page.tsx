import { AppShell } from '@/components/layout/app-shell';
import { ChurchGivingPanel } from '@/modules/church';

export default function ChurchGivingPage() {
  return (
    <AppShell currentPath="/church" title="Give" subtitle="Tithes, offerings, and designated gifts">
      <ChurchGivingPanel />
    </AppShell>
  );
}
