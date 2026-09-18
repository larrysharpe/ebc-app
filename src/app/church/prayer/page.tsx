import { AppShell } from '@/components/layout/app-shell';
import { PrayerRequestPanel } from '@/modules/church';

export default function ChurchPrayerPage() {
  return (
    <AppShell currentPath="/church" title="Request prayer" subtitle="Confidential pastoral care">
      <PrayerRequestPanel />
    </AppShell>
  );
}
