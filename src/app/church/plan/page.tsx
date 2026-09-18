import { AppShell } from '@/components/layout/app-shell';
import { ChurchPlan } from '@/modules/church';

export default function ChurchPlanPage() {
  return (
    <AppShell
      currentPath="/church"
      title="Church plan"
      subtitle="4-week coordination across ministries"
    >
      <ChurchPlan />
    </AppShell>
  );
}
