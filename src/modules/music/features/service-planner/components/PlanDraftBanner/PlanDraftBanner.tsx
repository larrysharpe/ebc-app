export function PlanDraftBanner() {
  return (
    <div role="status" className="ml-auto max-w-md">
      <p className="text-xs font-semibold text-amber-950 sm:text-sm">Still drafting</p>
      <p className="mt-0.5 text-[11px] leading-snug text-amber-900/90 sm:text-sm">
        Not shared with the choir yet — finish the plan, then send it when ready.
      </p>
    </div>
  );
}
