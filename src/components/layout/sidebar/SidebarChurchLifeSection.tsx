'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { CHURCH_LIFE_LINKS } from '@/modules/church/constants/church.constants';

export type SidebarChurchLifeSectionProps = {
  onNavigate?: () => void;
};

export function SidebarChurchLifeSection({
  onNavigate,
}: SidebarChurchLifeSectionProps) {
  const pathname = usePathname();

  return (
    <div className="mb-3 space-y-1 border-b border-white/10 pb-3">
      <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-white/50">
        Church life
      </p>
      <ul className="space-y-0.5">
        {CHURCH_LIFE_LINKS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <li key={item.id}>
              <Link
                href={item.href}
                title={item.title}
                onClick={onNavigate}
                aria-current={isActive ? 'page' : undefined}
                className={`flex min-h-[44px] items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.headerLabel}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
