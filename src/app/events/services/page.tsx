import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AppShell } from '@/components/layout/app-shell';
import { getSession } from '@/modules/auth/services/auth.service';
import {
  canManageSundayServices,
  SundayServiceForm,
  SundayServiceList,
} from '@/modules/events';
import { listSundayServices } from '@/modules/events/repositories/sunday-service.repository';

export default async function SundayServicesPage() {
  const session = await getSession();
  if (!session || !canManageSundayServices(session.roles)) {
    redirect('/?denied=1');
  }

  const services = await listSundayServices({ includeCancelled: true });
  const takenDates = services
    .filter((service) => service.status === 'scheduled')
    .map((service) => service.serviceDate);

  return (
    <AppShell
      currentPath="/events"
      title="Services"
      subtitle="Define upcoming worship services for the church"
    >
      <div className="space-y-8">
        <Link href="/events" className="text-sm text-ebc-burgundy hover:underline">
          ← Events
        </Link>
        <SundayServiceForm takenDates={takenDates} />
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-ebc-burgundy">Upcoming</h2>
          <SundayServiceList services={services} canManage />
        </section>
      </div>
    </AppShell>
  );
}
