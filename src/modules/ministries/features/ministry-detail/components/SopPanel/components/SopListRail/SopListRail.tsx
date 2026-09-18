import type { SopListRailProps } from '../../sop-panel.types';
import { sopStatusClass, sopStatusLabel } from '../../sop-panel.utils';

export function SopListRail({ sops, selectedId, onSelect }: SopListRailProps) {
  return (
    <nav
      className="flex min-h-0 flex-col border-slate-200 bg-slate-50 lg:w-72 lg:shrink-0 lg:border-r"
      aria-label="Procedures"
    >
      <p className="hidden px-3 pb-1 pt-3 text-xs font-bold uppercase tracking-wide text-slate-500 lg:block">
        Procedures
      </p>
      <ul className="max-h-52 overflow-y-auto overscroll-contain lg:max-h-none lg:min-h-0 lg:flex-1">
        {sops.map((sop) => {
          const isSelected = sop.id === selectedId;

          return (
            <li key={sop.id} className="border-b border-slate-200 last:border-b-0">
              <button
                type="button"
                onClick={() => onSelect(sop.id)}
                aria-current={isSelected ? 'true' : undefined}
                className={`flex min-h-11 w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left text-base ${
                  isSelected
                    ? 'border-l-4 border-ebc-burgundy bg-ebc-burgundy/5 font-semibold text-ebc-burgundy'
                    : 'border-l-4 border-transparent text-slate-800 hover:bg-white'
                }`}
              >
                <span className="line-clamp-2">{sop.title}</span>
                <span className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${sopStatusClass(sop.status)}`}
                  >
                    {sopStatusLabel(sop.status)}
                  </span>
                  {sop.kind === 'charter' ? (
                    <span className="rounded-full bg-ebc-navy/10 px-2 py-0.5 text-xs font-semibold text-ebc-navy">
                      Charter
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
