import Image from 'next/image';

import { SignInForm } from '@/modules/auth/features/sign-in';
import { DevAccountSwitcher } from '@/modules/auth/features/dev-account-switcher/DevAccountSwitcher';
import { getSession } from '@/modules/auth/services/auth.service';
import { listDevAccountOptions } from '@/modules/auth/utils/dev-account-options.utils';
import { LegalLinks } from '@/modules/legal';
import { LOGO_ALT, LOGO_URL } from '@/lib/church';
import { redirect } from 'next/navigation';

export type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSession();
  if (session) {
    redirect('/');
  }

  const params = await searchParams;
  const nextPath = params.next?.startsWith('/') ? params.next : undefined;
  const devAccounts = await listDevAccountOptions();

  return (
    <div className="flex min-h-screen min-h-[100dvh] items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src={LOGO_URL}
            alt={LOGO_ALT}
            width={200}
            height={64}
            className="h-14 w-auto"
            priority
          />
          <h1 className="mt-6 text-2xl font-bold text-ebc-burgundy">Staff sign in</h1>
          <p className="mt-2 text-sm text-slate-600">
            Ebenezer Baptist Church · Woodbridge, VA
          </p>
        </div>

        <SignInForm nextPath={nextPath} />

        <div className="mt-6">
          {devAccounts.length > 0 ? (
            <DevAccountSwitcher accounts={devAccounts} returnPath={nextPath} variant="panel" />
          ) : null}
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Accounts are issued by church leadership. Contact the office if you need access.
        </p>
        <p className="mt-3 text-center text-xs leading-relaxed text-slate-500">
          By signing in you agree to the Privacy policy and Terms of use.
        </p>
        <LegalLinks variant="onLight" className="mt-1" />
      </div>
    </div>
  );
}
