import { CHURCH, QUICK_LINKS, WEEKLY_RHYTHM } from '@/lib/church';
import { requireSession } from '@/modules/auth';
import { getHomeDashboardData } from '@/modules/dashboard/services/dashboard.service';

import { ChurchLifePanel } from './components/ChurchLifePanel';
import { MyMinistriesSection } from './components/MyMinistriesSection';
import { NeedsAttentionSection } from './components/NeedsAttentionSection';
import { QuickActions, ThisWeekPanel } from './components/OperationalPanels';

const ACCENT_STYLES = {
  burgundy: 'border-ebc-burgundy/30 bg-ebc-burgundy/5 hover:border-ebc-burgundy',
  green: 'border-ebc-green/30 bg-ebc-green/5 hover:border-ebc-green',
  navy: 'border-ebc-navy/30 bg-ebc-navy/5 hover:border-ebc-navy',
  gold: 'border-ebc-gold/50 bg-ebc-gold/10 hover:border-ebc-gold',
} as const;

export async function StaffDashboard() {
  const session = await requireSession();
  const home = await getHomeDashboardData(session);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-slate-500">{home.roleLabel}</p>
        <h1 className="mt-1 text-2xl font-bold text-ebc-burgundy sm:text-3xl">
          Welcome back, {home.greetingName}
        </h1>
        <p className="mt-2 max-w-2xl text-base text-slate-600">
          Start with what needs your attention, then open your ministries. Built for
          phones first at {CHURCH.location}.
        </p>
      </header>

      <NeedsAttentionSection items={home.attentionItems} />
      <MyMinistriesSection ministries={home.myMinistries} />

      <ChurchLifePanel />

      <QuickActions />

      <ThisWeekPanel snapshot={home.snapshot} />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="ebc-card">
          <p className="ebc-section-label">Weekly rhythm</p>
          <h2 className="mt-1 text-lg font-bold text-ebc-burgundy">Church schedule</h2>
          <ul className="mt-4 space-y-4">
            {WEEKLY_RHYTHM.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-semibold text-slate-900">{item.label}</p>
                  <p className="text-sm text-slate-500">{item.note}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-ebc-burgundy">{item.schedule}</p>
                  <p className="text-sm text-slate-600">{item.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="ebc-card">
          <p className="ebc-section-label">Quick links</p>
          <h2 className="mt-1 text-lg font-bold text-ebc-burgundy">External systems</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {QUICK_LINKS.map((link) => (
              <a
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`rounded-lg border-2 p-4 transition-colors ${ACCENT_STYLES[link.accent]}`}
              >
                <p className="font-semibold text-slate-900">{link.label}</p>
                <p className="text-sm text-slate-600">{link.description}</p>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
