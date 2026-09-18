import { AppShell } from '@/components/layout/app-shell';
import { ChurchHub } from '@/modules/church';

export default function ChurchPage() {
  return (
    <AppShell currentPath="/church" title="Church life" subtitle="For every member and volunteer">
      <ChurchHub />
    </AppShell>
  );
}
