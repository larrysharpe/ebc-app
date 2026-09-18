import Link from 'next/link';

import { CHURCH_LIFE_LINKS } from '@/modules/church/constants/church.constants';

export function ChurchLifePanel() {
  return (
    <section className="ebc-card">
      <p className="ebc-section-label">Church life</p>
      <h2 className="mt-1 text-lg font-bold text-ebc-burgundy">Always available</h2>
      <p className="mt-2 text-sm text-slate-600">
        Contact your deacon, request prayer, give, and view the church calendar — no matter
        which teams you serve on.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {CHURCH_LIFE_LINKS.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="rounded-lg border border-ebc-burgundy/20 bg-ebc-burgundy/5 p-4 transition hover:border-ebc-burgundy/40"
          >
            <p className="font-semibold text-slate-900">{item.title}</p>
            <p className="mt-1 text-sm text-slate-600">{item.description}</p>
          </Link>
        ))}
      </div>
      <Link href="/church" className="mt-4 inline-block text-sm font-medium text-ebc-burgundy hover:underline">
        View all church life →
      </Link>
    </section>
  );
}
