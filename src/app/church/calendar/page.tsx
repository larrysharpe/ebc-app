import { AppShell } from '@/components/layout/app-shell';
import { ChurchCalendarPanel } from '@/modules/church';

export default function ChurchCalendarPage() {
  return (
    <AppShell
      currentPath="/church"
      title="Church calendar"
      subtitle="Worship, Bible study, and events"
    >
      <ChurchCalendarPanel />
    </AppShell>
  );
}
