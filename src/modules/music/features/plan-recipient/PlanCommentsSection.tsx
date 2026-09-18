'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition, type ReactElement } from 'react';

import { useConfirm } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import type { SessionUser } from '@/modules/auth/types/auth.types';
import {
  createPlanCommentAction,
  deletePlanCommentAction,
} from '@/modules/music/actions/plan-response.actions';
import type { PlanComment } from '@/modules/music/types/plan-response.types';

export type PlanCommentsSectionProps = {
  planId: string;
  currentUser: SessionUser;
  comments: PlanComment[];
};

export function PlanCommentsSection({
  planId,
  currentUser,
  comments,
}: PlanCommentsSectionProps): ReactElement {
  const router = useRouter();
  const confirm = useConfirm();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [commentBody, setCommentBody] = useState('');

  function postComment(): void {
    setError(null);
    startTransition(async () => {
      const result = await createPlanCommentAction({
        planId,
        body: commentBody,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCommentBody('');
      router.refresh();
    });
  }

  async function removeComment(id: string): Promise<void> {
    const confirmed = await confirm({
      title: 'Delete this comment?',
      description: 'This removes the comment for everyone on the plan.',
      confirmLabel: 'Delete comment',
      tone: 'danger',
    });
    if (!confirmed) return;
    setError(null);
    startTransition(async () => {
      const result = await deletePlanCommentAction({ id });
      if (!result.ok) {
        setError(result.error);
        toast({ title: 'Could not delete comment', description: result.error, tone: 'error' });
        return;
      }
      toast({ title: 'Comment deleted', tone: 'success' });
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ebc-burgundy">Comments</h2>
        <p className="mt-1 text-base text-slate-600">
          Questions about the set list, practice, or attire.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-base text-red-700">
          {error}
        </p>
      ) : null}

      {comments.length === 0 ? (
        <p className="text-base text-slate-500">No comments yet.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => {
            const canDelete =
              comment.userId === currentUser.id ||
              currentUser.roles.includes('choir_director') ||
              currentUser.roles.includes('music_minister') ||
              currentUser.roles.includes('admin') ||
              currentUser.roles.includes('super_admin');
            return (
              <li
                key={comment.id}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">{comment.authorName}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(comment.createdAt).toLocaleString('en-US')}
                    </p>
                  </div>
                  {canDelete ? (
                    <button
                      type="button"
                      disabled={isPending}
                        onClick={() => {
                          void removeComment(comment.id);
                        }}
                      className="min-h-11 text-sm font-medium text-slate-600 hover:text-red-700 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-base text-slate-800">
                  {comment.body}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <label className="block">
        <span className="text-base font-medium text-slate-700">Add a comment</span>
        <textarea
          value={commentBody}
          onChange={(event) => setCommentBody(event.target.value)}
          rows={3}
          placeholder="Question about the set list, practice, attire…"
          className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-base"
        />
      </label>
      <button
        type="button"
        disabled={isPending || !commentBody.trim()}
        onClick={postComment}
        className="ebc-action-secondary"
      >
        {isPending ? 'Posting…' : 'Post comment'}
      </button>
    </div>
  );
}
