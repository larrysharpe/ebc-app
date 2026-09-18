import { redirect } from 'next/navigation';

import {
  ROLE_LABELS,
  WelcomeSplash,
  getSession,
  resolveWelcomeNextPath,
} from '@/modules/auth';

export type WelcomePageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function WelcomePage({
  searchParams,
}: WelcomePageProps) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const params = await searchParams;
  const nextPath = resolveWelcomeNextPath(params.next);
  const roleLabel = session.roles.map((role) => ROLE_LABELS[role]).join(' · ');

  return (
    <WelcomeSplash
      displayName={session.name}
      roleLabel={roleLabel}
      nextPath={nextPath}
    />
  );
}
