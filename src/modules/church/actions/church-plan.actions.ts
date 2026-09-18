'use server';

import { revalidatePath } from 'next/cache';

import { getSession } from '@/modules/auth/services/auth.service';
import { GLOBAL_MINISTRY_ACCESS_ROLES } from '@/modules/auth/constants/ministry-scope.constants';
import { hasAnyRole } from '@/modules/auth/utils/roles.utils';

import { refreshChurchSuggestedPlan } from '../services/church-plan.service';

export async function refreshChurchSuggestedPlanAction(): Promise<
  | { ok: true; suggestedPlan: string; generatedAt: string }
  | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: 'You must be signed in.' };
  }

  if (!hasAnyRole(session.roles, [...GLOBAL_MINISTRY_ACCESS_ROLES])) {
    return { ok: false, error: 'You do not have permission to refresh the church plan.' };
  }

  const result = await refreshChurchSuggestedPlan();
  if (!result.ok || !result.suggestedPlan || !result.generatedAt) {
    return {
      ok: false,
      error: result.error ?? 'Church plan refresh failed.',
    };
  }

  revalidatePath('/church/plan');
  revalidatePath('/church');
  return {
    ok: true,
    suggestedPlan: result.suggestedPlan,
    generatedAt: result.generatedAt,
  };
}
