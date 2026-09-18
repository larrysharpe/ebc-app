import Link from 'next/link';

import { LEGAL_PATHS } from '@/modules/legal';

const SETTINGS_LINKS = [
  {
    href: '/settings/users',
    title: 'Staff accounts',
    description: 'Create accounts, assign roles, disable access, and scope ministry leaders.',
  },
  {
    href: '/settings/access',
    title: 'Roles & permissions',
    description: 'Reference for module access, music hierarchy, and permission rules.',
  },
  {
    href: '/account/preferences',
    title: 'My preferences',
    description:
      'Personal choices like the event voice coach. Every staff account manages their own.',
  },
  {
    href: '/account/notifications',
    title: 'My notification preferences',
    description:
      'Every staff account manages their own email and app alerts (including ministry-scoped topics).',
  },
  {
    href: LEGAL_PATHS.hub,
    title: 'Privacy & terms',
    description:
      'What EBC APP collects, who may see it, children and prayer rules, and how giving stays in Realm.',
  },
] as const;

export function SettingsHub() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-ebc-burgundy/20 bg-white p-5">
        <p className="text-sm text-slate-600">
          Platform settings for church administrators. Manage who can sign in and what they can
          access across EBC APP. Personal email and app-alert preferences live under each
          person’s account menu → Preferences or Notifications.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {SETTINGS_LINKS.map((item) => (
          <Link
            key={item.href}
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
