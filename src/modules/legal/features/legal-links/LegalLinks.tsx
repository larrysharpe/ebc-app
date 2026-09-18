import Link from 'next/link';

import { LEGAL_NAV_LINKS } from '@/modules/legal/constants/legal-routes.constants';

import type { LegalLinksProps } from './legal-links.types';

const VARIANT_CLASS = {
  onLight: 'text-slate-500 hover:text-ebc-burgundy',
  onDark: 'text-white/70 hover:text-white',
  inline: 'text-ebc-burgundy hover:underline',
} as const;

const DIVIDER_CLASS = {
  onLight: 'text-slate-300',
  onDark: 'text-white/30',
  inline: 'text-slate-300',
} as const;

export function LegalLinks({
  variant = 'onLight',
  currentSlug,
  className = '',
}: LegalLinksProps) {
  const links = LEGAL_NAV_LINKS.filter((link) => link.slug !== currentSlug);
  const color = VARIANT_CLASS[variant];

  return (
    <nav aria-label="Legal" className={className}>
      <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm">
        {links.map((link, index) => (
          <li key={link.href} className="flex items-center gap-3">
            {index > 0 ? (
              <span aria-hidden="true" className={DIVIDER_CLASS[variant]}>
                ·
              </span>
            ) : null}
            <Link href={link.href} className={`min-h-11 inline-flex items-center ${color}`}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
