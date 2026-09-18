import { AppShell } from '@/components/layout/app-shell';
import { LeadershipHub } from '@/modules/leadership';

export default function LeadershipPage() {
  return (
    <AppShell
      currentPath="/leadership"
      title="Leadership"
      subtitle="Governance, standards & SOP controls"
    >
      <LeadershipHub />
    </AppShell>
  );
}
