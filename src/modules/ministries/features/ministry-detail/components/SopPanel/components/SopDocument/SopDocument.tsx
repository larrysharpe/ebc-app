import type { SopConfigStore } from '@/modules/leadership/types';
import type { MinistrySop } from '@/modules/ministries/types';

import { evaluateSopQuality, parseSopContent } from '../../sop-editor.utils';
import { sopStatusClass, sopStatusLabel } from '../../sop-panel.utils';
import type { SopDocumentProps } from '../../sop-panel.types';

function SopPreview({ content }: { content: string }) {
  const blocks = content.split(/^## /m).filter(Boolean);

  if (blocks.length <= 1 && !content.includes('## ')) {
    return (
      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">
        {content}
      </pre>
    );
  }

  return (
    <div className="space-y-4">
      {blocks.map((block) => {
        const newline = block.indexOf('\n');
        const heading = newline === -1 ? block : block.slice(0, newline);
        const body = newline === -1 ? '' : block.slice(newline + 1).trim();

        return (
          <section key={heading}>
            <h5 className="text-sm font-bold text-ebc-burgundy">{heading}</h5>
            <pre className="mt-1 whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">
              {body}
            </pre>
          </section>
        );
      })}
    </div>
  );
}

function SopQualityBadge({
  sop,
  sopConfig,
  requiresSafety,
}: {
  sop: MinistrySop;
  sopConfig: SopConfigStore;
  requiresSafety: boolean;
}) {
  const draft = parseSopContent(
    sop.content,
    sop.title,
    sopConfig.sections,
    sop.templateId ?? 'general',
  );
  const { score, readyToPublish } = evaluateSopQuality(draft, sopConfig, {
    requiresSafety,
  });

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
        readyToPublish
          ? 'bg-ebc-green/15 text-ebc-green-dark'
          : 'bg-ebc-gold/20 text-ebc-burgundy-dark'
      }`}
    >
      Quality {score}
    </span>
  );
}

export function SopDocument({
  sop,
  sopConfig,
  requiresSafety,
  canManage,
  canApprove,
  isPending,
  onEdit,
  onDelete,
  onSetStatus,
}: SopDocumentProps) {
  return (
    <article className="min-w-0 flex-1 bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-lg font-bold text-slate-900">{sop.title}</h4>
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
            <SopQualityBadge sop={sop} sopConfig={sopConfig} requiresSafety={requiresSafety} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {sop.version ? `v${sop.version} · ` : ''}
            Updated {new Date(sop.updatedAt).toLocaleDateString()}
            {sop.updatedBy ? ` · ${sop.updatedBy}` : ''}
            {sop.approvedBy ? ` · Approved by ${sop.approvedBy}` : ''}
          </p>
        </div>
        {canManage ? (
          <div className="flex shrink-0 flex-wrap gap-2">
            <button type="button" onClick={onEdit} className="ebc-action-secondary sm:w-auto">
              Edit
            </button>
            {canApprove && sop.status !== 'approved' ? (
              <button
                type="button"
                onClick={() => onSetStatus('approved')}
                disabled={isPending}
                className="ebc-action-secondary sm:w-auto"
              >
                Approve
              </button>
            ) : null}
            {canApprove && sop.status === 'approved' ? (
              <button
                type="button"
                onClick={() => onSetStatus('draft')}
                disabled={isPending}
                className="ebc-action-quiet sm:w-auto"
              >
                Revert to draft
              </button>
            ) : null}
            <button
              type="button"
              onClick={onDelete}
              disabled={isPending}
              className="ebc-action-quiet text-red-700 sm:w-auto"
            >
              Delete
            </button>
          </div>
        ) : null}
      </div>
      <div className="p-4 sm:p-5">
        <SopPreview content={sop.content} />
      </div>
    </article>
  );
}
