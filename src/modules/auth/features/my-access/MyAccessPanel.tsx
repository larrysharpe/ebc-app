import { ROLE_LABELS } from '@/modules/auth/constants/auth.constants';
import type { SessionUser } from '@/modules/auth/types/auth.types';
import { formatMinistryScopeLabels } from '@/modules/auth/utils/ministry-scope.utils';
import { canAccessRoute } from '@/modules/auth/utils/route-access.utils';
import { hasPermission } from '@/modules/auth/utils/permissions.utils';
import { PERMISSIONS } from '@/modules/auth/constants/permissions.constants';

const MODULE_ACCESS = [
  { path: '/', label: 'Home' },
  { path: '/visitors', label: 'Visitors' },
  { path: '/ministries', label: 'Ministries' },
  { path: '/music', label: 'Music' },
  { path: '/leadership', label: 'Leadership' },
  { path: '/giving', label: 'Giving' },
  { path: '/trustees', label: 'Trustees' },
  { path: '/social', label: 'Social' },
  { path: '/settings', label: 'Settings' },
] as const;

const CHURCH_LIFE_ACCESS = [
  { path: '/church/giving', label: 'Give' },
  { path: '/church/prayer', label: 'Prayer requests' },
  { path: '/church/deacon', label: 'Family deacon' },
  { path: '/church/calendar', label: 'Church calendar' },
] as const;

const MUSIC_PERMISSION_LABELS: Partial<Record<keyof typeof PERMISSIONS, string>> = {
  'music.view': 'View music home & choir rotation',
  'music.plans.view': 'View choir plans',
  'music.plans.edit': 'Edit choir plans',
  'music.plans.send': 'Send plans to choir',
  'music.songs.view': 'View song catalog',
  'music.songs.pick': 'Pick songs for plans',
  'music.band.view': 'View band roster',
  'music.band.manage': 'Manage band roster',
};

export type MyAccessPanelProps = {
  user: SessionUser;
};

export function MyAccessPanel({ user }: MyAccessPanelProps) {
  const modules = MODULE_ACCESS.filter((item) => canAccessRoute(user, item.path));
  const churchLife = CHURCH_LIFE_ACCESS.filter((item) => canAccessRoute(user, item.path));
  const musicPermissions = (Object.keys(PERMISSIONS) as (keyof typeof PERMISSIONS)[]).filter(
    (permission) => hasPermission(user.roles, permission),
  );
  const ministryScope = formatMinistryScopeLabels(user.ministryIds);
  const choirScope = user.choirIds.length
    ? user.choirIds.join(' · ')
    : '';

  return (
    <div className="space-y-6">
      <section className="ebc-card">
        <h2 className="text-lg font-bold text-ebc-burgundy">Your account</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="font-medium text-slate-500">Name</dt>
            <dd className="text-slate-900">{user.name}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Email</dt>
            <dd className="text-slate-900">{user.email}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Roles</dt>
            <dd className="text-slate-900">
              {user.roles.map((role) => ROLE_LABELS[role]).join(' · ')}
            </dd>
          </div>
          {ministryScope ? (
            <div>
              <dt className="font-medium text-slate-500">Ministry assignments</dt>
              <dd className="text-slate-900">{ministryScope}</dd>
            </div>
          ) : null}
          {choirScope ? (
            <div>
              <dt className="font-medium text-slate-500">Choir assignments</dt>
              <dd className="text-slate-900">{choirScope}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="ebc-card">
        <h2 className="text-lg font-bold text-ebc-burgundy">Modules you can open</h2>
        {modules.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No staff modules assigned yet.</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {modules.map((item) => (
              <li
                key={item.path}
                className="rounded-full bg-ebc-burgundy/10 px-3 py-1 text-sm font-medium text-ebc-burgundy"
              >
                {item.label}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="ebc-card">
        <h2 className="text-lg font-bold text-ebc-burgundy">Church life</h2>
        <p className="mt-1 text-sm text-slate-600">
          Available to every signed-in member and volunteer.
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {churchLife.map((item) => (
            <li
              key={item.path}
              className="rounded-full bg-ebc-green/10 px-3 py-1 text-sm font-medium text-ebc-green-dark"
            >
              {item.label}
            </li>
          ))}
        </ul>
      </section>

      {musicPermissions.length > 0 ? (
        <section className="ebc-card">
          <h2 className="text-lg font-bold text-ebc-burgundy">Music permissions</h2>
          <ul className="mt-3 space-y-2">
            {musicPermissions.map((permission) => (
              <li key={permission} className="text-sm text-slate-700">
                {MUSIC_PERMISSION_LABELS[permission] ?? permission}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
