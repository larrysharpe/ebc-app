'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';

import { useConfirm } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import {
  deleteMinistryMediaAction,
  moveMinistryMediaAction,
  uploadMinistryMediaAction,
} from '@/modules/ministries/actions/ministry-media.actions';
import {
  MINISTRY_FILE_LIBRARY_COPY,
  MINISTRY_MEDIA_KIND_LABELS,
} from '@/modules/ministries/constants/ministry-media.constants';
import type {
  Ministry,
  MinistryFileLibrary,
  MinistryMediaAsset,
} from '@/modules/ministries/types';
import {
  assetsInFolder,
  folderBreadcrumbs,
  formatMediaBytes,
  joinFolderPath,
  listChildFolders,
  mediaDownloadPath,
  parentFolderPath,
} from '@/modules/ministries/utils/ministry-media.utils';

export type MediaPanelProps = {
  ministry: Ministry;
  assets: MinistryMediaAsset[];
  canManage?: boolean;
  library?: MinistryFileLibrary;
};

export function MediaPanel({
  ministry,
  assets,
  canManage = false,
  library = 'media',
}: MediaPanelProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | MinistryMediaAsset['kind']>('all');
  const [currentPath, setCurrentPath] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [movingId, setMovingId] = useState<string | null>(null);
  const [moveTarget, setMoveTarget] = useState('');

  const copy = MINISTRY_FILE_LIBRARY_COPY[library];
  const libraryAssets = assets.filter((asset) => asset.library === library);
  const folders = listChildFolders(libraryAssets, currentPath);
  const filesHere = assetsInFolder(libraryAssets, currentPath).filter(
    (asset) => filter === 'all' || asset.kind === filter,
  );
  const crumbs = folderBreadcrumbs(currentPath);
  const knownFolders = Array.from(
    new Set(libraryAssets.map((asset) => asset.folderPath).filter(Boolean)),
  ).sort();
  const folderListId = `folders-${ministry.id}-${library}`;

  function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('files', file));
    formData.set('folderPath', currentPath);
    formData.set('library', library);

    startTransition(async () => {
      const result = await uploadMinistryMediaAction(ministry.slug, formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
      router.refresh();
    });
  }

  function handleCreateFolder() {
    const name = newFolderName.trim();
    if (!name) return;
    const next = joinFolderPath(currentPath, name);
    setCurrentPath(next);
    setNewFolderName('');
    setShowNewFolder(false);
  }

  async function handleDelete(assetId: string): Promise<void> {
    const confirmed = await confirm({
      title: 'Remove this file?',
      description: `It will be removed from the ${library} library.`,
      confirmLabel: 'Remove file',
      tone: 'danger',
    });
    if (!confirmed) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteMinistryMediaAction(ministry.slug, assetId);
      if (!result.ok) {
        setError(result.error);
        toast({ title: 'Could not remove file', description: result.error, tone: 'error' });
        return;
      }
      toast({ title: 'File removed', tone: 'success' });
      router.refresh();
    });
  }

  function handleMove(assetId: string) {
    setError(null);
    startTransition(async () => {
      const result = await moveMinistryMediaAction(ministry.slug, assetId, moveTarget);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMovingId(null);
      setMoveTarget('');
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-ebc-burgundy">{copy.title}</h3>
          <p className="mt-0.5 text-sm text-slate-500">{copy.description}</p>
        </div>
        {canManage ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => setShowNewFolder((value) => !value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {showNewFolder ? 'Cancel' : 'New folder'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={copy.accept}
              className="hidden"
              onChange={(event) => handleUpload(event.target.files)}
            />
            <button
              type="button"
              disabled={isPending}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg bg-ebc-burgundy px-3 py-1.5 text-sm font-medium text-white hover:bg-ebc-burgundy-dark disabled:opacity-50"
            >
              {isPending ? 'Uploading…' : 'Upload here'}
            </button>
          </div>
        ) : null}
      </div>

      {showNewFolder && canManage ? (
        <form
          className="flex flex-wrap items-end gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3"
          onSubmit={(event) => {
            event.preventDefault();
            handleCreateFolder();
          }}
        >
          <label className="min-w-[12rem] flex-1">
            <span className="text-xs font-medium text-slate-600">Folder name</span>
            <input
              value={newFolderName}
              onChange={(event) => setNewFolderName(event.target.value)}
              placeholder={
                currentPath
                  ? library === 'documents'
                    ? 'e.g. Handbooks'
                    : 'e.g. CLC Retreat'
                  : 'e.g. 2026'
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-ebc-navy px-3 py-2 text-sm font-medium text-white hover:bg-ebc-navy/90"
          >
            Open folder
          </button>
          <p className="w-full text-[11px] text-slate-500">
            Creates a virtual path
            {currentPath ? ` under ${currentPath}` : ' at the library root'}. Upload files
            after opening it.
          </p>
        </form>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <nav
        aria-label="Folder path"
        className="flex flex-wrap items-center gap-1 text-sm text-slate-600"
      >
        <button
          type="button"
          onClick={() => setCurrentPath('')}
          className={`rounded px-1.5 py-0.5 font-medium hover:bg-slate-100 ${
            currentPath === '' ? 'text-ebc-burgundy' : 'text-ebc-navy'
          }`}
        >
          Library
        </button>
        {crumbs.map((crumb) => (
          <span key={crumb.path} className="inline-flex items-center gap-1">
            <span className="text-slate-300">/</span>
            <button
              type="button"
              onClick={() => setCurrentPath(crumb.path)}
              className={`rounded px-1.5 py-0.5 font-medium hover:bg-slate-100 ${
                crumb.path === currentPath ? 'text-ebc-burgundy' : 'text-ebc-navy'
              }`}
            >
              {crumb.label}
            </button>
          </span>
        ))}
        {currentPath ? (
          <button
            type="button"
            onClick={() => setCurrentPath(parentFolderPath(currentPath))}
            className="ml-2 text-xs font-medium text-slate-500 hover:text-slate-700"
          >
            Up
          </button>
        ) : null}
      </nav>

      {copy.showKindFilter ? (
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ['all', 'All'],
              ['image', 'Images'],
              ['video', 'Videos'],
              ['document', 'Documents'],
              ['audio', 'Audio'],
              ['other', 'Other'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                filter === id
                  ? 'bg-ebc-burgundy text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}

      {folders.length > 0 ? (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {folders.map((folder) => (
            <li key={folder.path}>
              <button
                type="button"
                onClick={() => setCurrentPath(folder.path)}
                className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 text-left transition hover:border-ebc-burgundy/40 hover:bg-ebc-burgundy/5"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-ebc-gold/20 text-ebc-burgundy"
                  aria-hidden
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2Z" />
                  </svg>
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-800">
                    {folder.name}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {folder.fileCount} file{folder.fileCount === 1 ? '' : 's'}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {folders.length === 0 && filesHere.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
          <p className="text-sm font-medium text-slate-700">
            {currentPath ? 'This folder is empty' : copy.emptyLabel}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {canManage
              ? currentPath
                ? 'Upload files here, or create a subfolder.'
                : 'Create a year folder (e.g. 2026), then topic or event folders inside it.'
              : 'Nothing has been added to this library.'}
          </p>
        </div>
      ) : null}

      {filesHere.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filesHere.map((asset) => (
            <li
              key={asset.id}
              className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white"
            >
              <div className="flex aspect-video items-center justify-center bg-slate-100">
                {asset.kind === 'image' && library === 'media' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mediaDownloadPath(asset.id)}
                    alt={asset.displayName ?? asset.fileName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {MINISTRY_MEDIA_KIND_LABELS[asset.kind]}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-3">
                <div>
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {asset.displayName ?? asset.fileName}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {MINISTRY_MEDIA_KIND_LABELS[asset.kind]} ·{' '}
                    {formatMediaBytes(asset.sizeBytes)}
                    {asset.uploadedBy ? ` · ${asset.uploadedBy}` : ''}
                  </p>
                </div>

                {movingId === asset.id && canManage ? (
                  <div className="space-y-2 rounded-md border border-slate-100 bg-slate-50 p-2">
                    <label className="block text-[11px] font-medium text-slate-600">
                      Move to folder
                      <input
                        list={folderListId}
                        value={moveTarget}
                        onChange={(event) => setMoveTarget(event.target.value)}
                        placeholder="e.g. 2026/Handbooks (blank = root)"
                        className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-xs"
                      />
                    </label>
                    <datalist id={folderListId}>
                      <option value="" label="Library root" />
                      {knownFolders.map((folder) => (
                        <option key={folder} value={folder} />
                      ))}
                    </datalist>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleMove(asset.id)}
                        className="text-xs font-medium text-ebc-navy hover:underline disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMovingId(null);
                          setMoveTarget('');
                        }}
                        className="text-xs font-medium text-slate-500 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="mt-auto flex flex-wrap gap-2">
                  <a
                    href={mediaDownloadPath(asset.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-ebc-navy hover:underline"
                  >
                    Open
                  </a>
                  {canManage ? (
                    <>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => {
                          setMovingId(asset.id);
                          setMoveTarget(asset.folderPath);
                        }}
                        className="text-xs font-medium text-slate-600 hover:underline disabled:opacity-50"
                      >
                        Move
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => {
                          void handleDelete(asset.id);
                        }}
                        className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export type DocumentsPanelProps = Omit<MediaPanelProps, 'library'>;

export function DocumentsPanel(props: DocumentsPanelProps) {
  return <MediaPanel {...props} library="documents" />;
}
