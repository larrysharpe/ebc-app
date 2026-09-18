import { AppShell } from '@/components/layout/app-shell';
import { FamilyDeaconPanel } from '@/modules/church';

export default function ChurchDeaconPage() {
  return (
    <AppShell
      currentPath="/church"
      title="Family deacon"
      subtitle="Pastoral care and support"
    >
      <FamilyDeaconPanel />
    </AppShell>
  );
}
