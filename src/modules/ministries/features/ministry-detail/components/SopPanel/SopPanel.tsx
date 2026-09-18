'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState, useTransition } from 'react';

import {
  removeSopAction,
  saveSopAction,
  setSopStatusAction,
} from '@/modules/ministries/actions/ministry.actions';
import type { MinistrySop, MinistrySopStatus } from '@/modules/ministries/types';

import { SopDocument } from './components/SopDocument';
import { SopListRail } from './components/SopListRail';
import { SopGuidedEditor, type SopSavePayload } from './SopGuidedEditor';
import type { SopPanelProps } from './sop-panel.types';
import { resolveSelectedSop } from './sop-panel.utils';

export type { SopPanelProps };

export function SopPanel({
  ministry,
  sopConfig,
  canManage = false,
  canApprove = false,
}: SopPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<MinistrySop | 'new' | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const documentRef = useRef<HTMLDivElement>(null);

  const requiresSafety = useMemo(
    () =>
      ministry.category === 'fellowship' ||
      ministry.category === 'outreach' ||
      ministry.category === 'education',
    [ministry.category],
  );

  const selectedSop = resolveSelectedSop(ministry.sops, selectedId);

  function handleSelect(sopId: string) {
    setSelectedId(sopId);
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) {
      documentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function handleSave(payload: SopSavePayload) {
    startTransition(async () => {
      await saveSopAction(ministry.slug, {
        id: editing && editing !== 'new' ? editing.id : undefined,
        ...payload,
      });
      setEditing(null);
      router.refresh();
    });
  }

  function handleDelete(sopId: string) {
    startTransition(async () => {
      await removeSopAction(ministry.slug, sopId);
      if (selectedId === sopId) {
        setSelectedId(null);
      }
      router.refresh();
    });
  }

  function handleSetStatus(sopId: string, status: MinistrySopStatus) {
    startTransition(async () => {
      await setSopStatusAction(ministry.slug, { sopId, status });
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-ebc-burgundy">Standard operating procedures</h3>
          <p className="text-sm text-slate-500">
            CLC charter for the ministry operating manual, plus task procedures. Templates and
            quality rules are set by church leadership.
          </p>
        </div>
        {!editing && canManage ? (
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="ebc-action-primary shrink-0"
          >
            New SOP
          </button>
        ) : null}
      </div>

      {editing ? (
        <SopGuidedEditor
          ministry={ministry}
          sopConfig={sopConfig}
          initialSop={editing === 'new' ? undefined : editing}
          isPending={isPending}
          canApprove={canApprove}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      ) : null}

      {!editing && ministry.sops.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
          <p className="font-medium text-slate-700">No SOPs yet</p>
          <p className="mt-2 text-sm text-slate-500">
            Start with a Ministry charter (CLC) or a task template for this ministry type.
          </p>
          {canManage ? (
            <button
              type="button"
              onClick={() => setEditing('new')}
              className="ebc-action-primary mt-4"
            >
              Create your first SOP
            </button>
          ) : null}
        </div>
      ) : null}

      {!editing && ministry.sops.length > 0 && selectedSop ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 lg:flex lg:h-[min(40rem,calc(100vh-14rem))]">
          <SopListRail
            sops={ministry.sops}
            selectedId={selectedSop.id}
            onSelect={handleSelect}
          />
          <div
            ref={documentRef}
            className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain border-t border-slate-200 lg:border-t-0"
          >
            <SopDocument
              sop={selectedSop}
              sopConfig={sopConfig}
              requiresSafety={requiresSafety}
              canManage={canManage}
              canApprove={canApprove}
              isPending={isPending}
              onEdit={() => setEditing(selectedSop)}
              onDelete={() => handleDelete(selectedSop.id)}
              onSetStatus={(status) => handleSetStatus(selectedSop.id, status)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
