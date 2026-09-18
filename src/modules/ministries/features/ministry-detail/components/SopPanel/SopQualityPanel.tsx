import type { SopQualityResult } from './sop-editor.types';

export type SopQualityPanelProps = {
  quality: SopQualityResult;
  minQualityScore: number;
};

export function SopQualityPanel({ quality, minQualityScore }: SopQualityPanelProps) {
  const { score, checks, readyToPublish } = quality;

  const ringColor = readyToPublish
    ? 'text-ebc-green'
    : score >= 50
      ? 'text-ebc-gold-bright'
      : 'text-slate-400';

  return (
    <aside className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 bg-white ${readyToPublish ? 'border-ebc-green' : score >= 50 ? 'border-ebc-gold' : 'border-slate-200'}`}
        >
          <span className={`text-lg font-bold ${ringColor}`}>{score}</span>
        </div>
        <div>
          <p className="font-semibold text-slate-900">SOP quality score</p>
          <p className="text-xs text-slate-500">
            {readyToPublish
              ? 'Ready to save — meets ministry standards'
              : `Reach ${minQualityScore}+ to publish with confidence`}
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {checks.map((check) => (
          <li key={check.id} className="flex gap-2 text-sm">
            <span
              className={`mt-0.5 shrink-0 ${check.passed ? 'text-ebc-green' : 'text-slate-300'}`}
              aria-hidden
            >
              {check.passed ? '✓' : '○'}
            </span>
            <div>
              <p className={check.passed ? 'text-slate-700' : 'font-medium text-slate-900'}>
                {check.label}
              </p>
              {!check.passed ? (
                <p className="text-xs text-ebc-navy">{check.tip}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
