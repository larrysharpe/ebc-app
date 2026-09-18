import Link from 'next/link';

const LEADERSHIP_CARDS = [
  {
    href: '/leadership/sop-templates',
    title: 'SOP templates',
    description:
      'Create and edit starting templates ministry leaders choose when writing procedures — outreach, youth, AV, and more.',
    badge: 'Templates',
  },
  {
    href: '/leadership/sop-guidance',
    title: 'Section guidance',
    description:
      'Edit the hints, placeholders, and required flags shown in the guided SOP editor for every ministry.',
    badge: 'Guidance',
  },
  {
    href: '/leadership/sop-settings',
    title: 'SOP quality settings',
    description:
      'Set the minimum quality score and default template per ministry category.',
    badge: 'Standards',
  },
] as const;

export function LeadershipHub() {
  return (
    <div className="space-y-8">
      <section className="rounded-xl bg-gradient-to-br from-ebc-navy to-ebc-burgundy-dark p-6 text-white">
        <p className="text-xs font-bold uppercase tracking-widest text-ebc-gold">
          Church leadership
        </p>
        <h2 className="mt-2 font-display text-2xl text-ebc-gold">Governance & standards</h2>
        <p className="mt-3 max-w-2xl text-sm text-white/80">
          For pastor, church administrator, and designated officers. Controls here shape how
          all ministries write SOPs — templates, editor guidance, and quality thresholds.
          Ministry leaders use those tools; they do not edit these settings.
        </p>
        <p className="mt-3 text-xs text-white/60">
          Roles (when auth is live): <span className="text-white/80">admin</span>,{' '}
          <span className="text-white/80">pastor</span>,{' '}
          <span className="text-white/80">office_staff</span> (policy TBD)
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {LEADERSHIP_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="ebc-card block transition-shadow hover:shadow-md"
          >
            <span className="rounded-full bg-ebc-burgundy/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ebc-burgundy">
              {card.badge}
            </span>
            <h3 className="mt-3 text-lg font-bold text-ebc-burgundy">{card.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
