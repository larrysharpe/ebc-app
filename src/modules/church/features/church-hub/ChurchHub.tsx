import Link from 'next/link';

import { CHURCH_LIFE_LINKS } from '@/modules/church/constants/church.constants';

export function ChurchHub() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-ebc-burgundy/20 bg-white p-5">
        <p className="text-sm text-slate-600">
          Church-wide resources for every member and volunteer — always available no matter
          which ministry teams you serve on.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {CHURCH_LIFE_LINKS.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-ebc-burgundy/40 hover:shadow-sm"
          >
            <h2 className="font-display text-lg text-ebc-burgundy">{item.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
