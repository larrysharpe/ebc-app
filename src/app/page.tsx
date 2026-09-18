import { AppShell } from '@/components/layout/app-shell';
import { CHURCH } from '@/lib/church';
import { StaffDashboard } from '@/modules/dashboard';

export default async function HomePage() {
  return (
    <AppShell
      currentPath="/"
      title="Home"
      subtitle={`${CHURCH.name} · ${CHURCH.location}`}
    >
      <StaffDashboard />
    </AppShell>
  );
}
