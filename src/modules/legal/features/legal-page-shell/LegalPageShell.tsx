import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { LOGO_ALT, LOGO_URL } from '@/lib/church';

import { LegalLinks } from '@/modules/legal/features/legal-links';
import type { LegalDocumentSlug } from '@/modules/legal/features/legal-document/legal-document.types';

export type LegalPageShellProps = {
  children: ReactNode;
  currentSlug?: LegalDocumentSlug;
};

export function LegalPageShell({ children, currentSlug }: LegalPageShellProps) {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="inline-flex min-h-11 items-center">
            <Image
              src={LOGO_URL}
              alt={LOGO_ALT}
              width={160}
              height={48}
              className="h-10 w-auto"
              priority
            />
          </Link>
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center text-sm font-medium text-ebc-burgundy hover:underline"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          {children}
        </div>
      </main>

      <footer className="pb-10">
        <LegalLinks variant="onLight" currentSlug={currentSlug} />
        <p className="mt-3 text-center text-xs text-slate-500">
          Ebenezer Baptist Church · Woodbridge, VA
        </p>
      </footer>
    </div>
  );
}
