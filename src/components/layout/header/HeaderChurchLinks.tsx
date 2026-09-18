'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { CHURCH_LIFE_LINKS } from '@/modules/church/constants/church.constants';

export function HeaderChurchLinks() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Church life"
      className="flex items-center gap-1.5 overflow-x-auto sm:gap-2 lg:justify-end"
    >
      {CHURCH_LIFE_LINKS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.id}
            href={item.href}
            title={item.title}
            className={`inline-flex h-9 shrink-0 items-center rounded-lg px-3 text-xs font-semibold transition sm:text-sm ${
              isActive
                ? 'bg-ebc-burgundy text-white'
                : 'border border-slate-200 bg-slate-50 text-ebc-burgundy hover:border-ebc-burgundy/30 hover:bg-ebc-burgundy/5'
            }`}
          >
            <span className="sm:hidden">
              {item.id === 'deacon' ? 'Deacon' : item.headerLabel}
            </span>
            <span className="hidden sm:inline">{item.headerLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}
