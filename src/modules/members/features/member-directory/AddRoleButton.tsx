'use client';

import { useEffect, useId, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { ROLE_LABELS } from '@/modules/auth/constants/auth.constants';
import { addPersonRoleAction } from '@/modules/members/actions/person.actions';
import type { MemberDirectoryAssignableRole } from '@/modules/members/constants/member-roles.constants';
import type { DirectoryPerson } from '@/modules/members/types';
import { availableDirectoryRolesToAdd } from '@/modules/members/utils/person-roles.utils';

export type AddRoleButtonProps = {
  person: DirectoryPerson;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
};

export function AddRoleButton({
  person,
  onError,
  onSuccess,
}: AddRoleButtonProps) {
  const router = useRouter();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const available = availableDirectoryRolesToAdd(person.roles, person);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  function handleAdd(role: MemberDirectoryAssignableRole) {
    startTransition(async () => {
      const result = await addPersonRoleAction({
        personId: person.id,
        role,
      });
      if (!result.ok) {
        onError(result.error);
        return;
      }
      setOpen(false);
      onSuccess(`${ROLE_LABELS[role]} added.`);
      router.refresh();
    });
  }

  if (available.length === 0) {
    return null;
  }

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        aria-label={`Add role for ${person.firstName} ${person.lastName}`}
        aria-expanded={open}
        aria-controls={menuId}
        disabled={isPending}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-ebc-burgundy/30 text-sm font-semibold leading-none text-ebc-burgundy hover:bg-ebc-burgundy/10 disabled:opacity-50"
      >
        +
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute left-0 top-full z-20 mt-1 max-h-56 w-48 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {available.map((role) => (
            <button
              key={role}
              type="button"
              role="menuitem"
              disabled={isPending}
              onClick={() => handleAdd(role)}
              className="block w-full px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {ROLE_LABELS[role]}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
