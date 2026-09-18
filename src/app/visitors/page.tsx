import { AppShell } from '@/components/layout/app-shell';
import { listVisitors } from '@/modules/visitors/repositories/visitor.repository';
import { VisitorIntake } from '@/modules/visitors';

type PageProps = {
  searchParams: Promise<{ new?: string }>;
};

export default async function VisitorsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const visitors = await listVisitors();

  return (
    <AppShell
      currentPath="/visitors"
      title="Visitors"
      subtitle="First-time guest follow-up"
    >
      <VisitorIntake visitors={visitors} showFormInitially={params.new === '1'} />
    </AppShell>
  );
}
