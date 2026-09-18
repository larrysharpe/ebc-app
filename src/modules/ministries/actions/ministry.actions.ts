'use server';

import { revalidatePath } from 'next/cache';
import type { z } from 'zod';

import { getSession } from '@/modules/auth/services/auth.service';
import {
  canApproveMinistrySop,
  canManageMinistry,
} from '@/modules/auth/utils/ministry-scope.utils';
import { getPerson } from '@/modules/members/services/person.service';
import { personDisplayName } from '@/modules/members/types';
import {
  getMinistryBySlug,
  listMinistries,
  updateMinistry,
} from '../repositories/ministry.repository';
import {
  saveMinistrySopSchema,
  setMinistrySopStatusSchema,
} from '../schemas/ministry-sop.schemas';
import { updateMinistryMetadataSchema } from '../schemas/ministry-metadata.schemas';
import {
  addMinistryDutySchema,
  removeMinistryDutySchema,
  updateMinistryDutySchema,
} from '../schemas/ministry-duty.schemas';
import {
  ministryPersonInputSchema,
  updateMinistryPersonSchema,
} from '../schemas/ministry-personnel.schemas';
import { refreshMinistrySuggestedPlanBySlug } from '../services/ministry-suggested-plan.service';
import type {
  Ministry,
  MinistryDutyDefinition,
  MinistryEvent,
  MinistryPerson,
  MinistryPersonRole,
  MinistrySop,
  MinistrySopStatus,
} from '../types';
import {
  dutyIdsInUse,
  slugifyDutyId,
} from '../utils/ministry-personnel.utils';

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

async function guardMinistryManage(
  slug: string,
): Promise<
  | { ok: true; ministry: Ministry; actorLabel: string; canApprove: boolean }
  | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: 'You must be signed in.' };
  }

  const ministry = await getMinistryBySlug(slug);
  if (!ministry) {
    return { ok: false, error: 'Ministry not found' };
  }

  if (!canManageMinistry(session, ministry.id)) {
    return { ok: false, error: 'You do not have permission to edit this ministry.' };
  }

  return {
    ok: true,
    ministry,
    actorLabel: session.name || session.email,
    canApprove: canApproveMinistrySop(session),
  };
}

export async function getMinistriesAction(): Promise<Ministry[]> {
  return listMinistries();
}

export async function getMinistryAction(slug: string): Promise<Ministry | null> {
  return getMinistryBySlug(slug);
}

export async function updateMinistryMetadataAction(
  slug: string,
  input: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const allowed = await guardMinistryManage(slug);
  if (!allowed.ok) return allowed;

  const parsed = updateMinistryMetadataSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid ministry details',
    };
  }

  const ministry = allowed.ministry;
  ministry.name = parsed.data.name;
  ministry.category = parsed.data.category;
  ministry.description = parsed.data.description;
  ministry.meetingSummary = parsed.data.meetingSummary;
  ministry.contactEmail = parsed.data.contactEmail;
  ministry.websiteUrl = parsed.data.websiteUrl;

  await updateMinistry(ministry);
  revalidatePath('/ministries');
  revalidatePath('/ministries', 'layout');
  revalidatePath(`/ministries/${slug}`);
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function refreshMinistrySuggestedPlanAction(
  slug: string,
): Promise<
  | { ok: true; suggestedPlan: string; generatedAt: string }
  | { ok: false; error: string }
> {
  const allowed = await guardMinistryManage(slug);
  if (!allowed.ok) return allowed;

  const result = await refreshMinistrySuggestedPlanBySlug(slug);
  if (!result.ok || !result.suggestedPlan || !result.generatedAt) {
    return {
      ok: false,
      error: result.error ?? 'Suggested plan refresh failed.',
    };
  }

  revalidatePath(`/ministries/${slug}`);
  return {
    ok: true,
    suggestedPlan: result.suggestedPlan,
    generatedAt: result.generatedAt,
  };
}

function normalizeOptional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function validateDutiesAgainstCatalog(
  duties: string[] | undefined,
  catalog: MinistryDutyDefinition[],
): { ok: true; duties: string[] | undefined } | { ok: false; error: string } {
  if (!duties?.length) {
    return { ok: true, duties: undefined };
  }
  const known = new Set(catalog.map((duty) => duty.id));
  const unknown = duties.filter((duty) => !known.has(duty));
  if (unknown.length > 0) {
    return {
      ok: false,
      error: 'One or more duties are not in this ministry’s duty list. Add them under Duties first.',
    };
  }
  return { ok: true, duties };
}

async function buildRosterEntry(
  input: z.infer<typeof ministryPersonInputSchema>,
  catalog: MinistryDutyDefinition[],
  existingId?: string,
): Promise<{ ok: true; entry: MinistryPerson } | { ok: false; error: string }> {
  const dutiesResult = validateDutiesAgainstCatalog(input.duties, catalog);
  if (!dutiesResult.ok) return dutiesResult;

  if (input.isOpenRole) {
    return {
      ok: true,
      entry: {
        id: existingId ?? newId('p'),
        name: input.name!.trim(),
        role: input.role,
        title: normalizeOptional(input.title),
        duties: dutiesResult.duties,
        isOpenRole: true,
      },
    };
  }

  const directoryPerson = await getPerson(input.personId!);
  if (!directoryPerson) {
    return { ok: false, error: 'Selected church member was not found.' };
  }

  return {
    ok: true,
    entry: {
      id: existingId ?? newId('p'),
      personId: directoryPerson.id,
      name: personDisplayName(directoryPerson),
      role: input.role,
      title: normalizeOptional(input.title),
      duties: dutiesResult.duties,
      email: directoryPerson.email,
      phone: directoryPerson.phone,
      isOpenRole: false,
    },
  };
}

export async function addPersonnelAction(
  slug: string,
  person: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const allowed = await guardMinistryManage(slug);
  if (!allowed.ok) return allowed;

  const parsed = ministryPersonInputSchema.safeParse(person);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid personnel data',
    };
  }

  const built = await buildRosterEntry(parsed.data, allowed.ministry.dutyCatalog);
  if (!built.ok) return built;

  if (
    built.entry.personId &&
    allowed.ministry.personnel.some((item) => item.personId === built.entry.personId)
  ) {
    return { ok: false, error: 'That member is already on this roster.' };
  }

  const ministry = allowed.ministry;
  ministry.personnel.push(built.entry);
  await updateMinistry(ministry);
  revalidatePath(`/ministries/${slug}`);
  return { ok: true };
}

export async function updatePersonnelAction(
  slug: string,
  person: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const allowed = await guardMinistryManage(slug);
  if (!allowed.ok) return allowed;

  const parsed = updateMinistryPersonSchema.safeParse(person);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid personnel data',
    };
  }

  const ministry = allowed.ministry;
  const index = ministry.personnel.findIndex((p) => p.id === parsed.data.id);
  if (index < 0) {
    return { ok: false, error: 'Person not found on this roster.' };
  }

  const built = await buildRosterEntry(
    parsed.data,
    ministry.dutyCatalog,
    parsed.data.id,
  );
  if (!built.ok) return built;

  if (
    built.entry.personId &&
    ministry.personnel.some(
      (item, itemIndex) =>
        itemIndex !== index && item.personId === built.entry.personId,
    )
  ) {
    return { ok: false, error: 'That member is already on this roster.' };
  }

  ministry.personnel[index] = built.entry;
  await updateMinistry(ministry);
  revalidatePath(`/ministries/${slug}`);
  return { ok: true };
}

export async function removePersonnelAction(
  slug: string,
  personId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const allowed = await guardMinistryManage(slug);
  if (!allowed.ok) return allowed;
  const ministry = allowed.ministry;

  ministry.personnel = ministry.personnel.filter((p) => p.id !== personId);
  await updateMinistry(ministry);
  revalidatePath(`/ministries/${slug}`);
  return { ok: true };
}

export async function addMinistryDutyAction(
  slug: string,
  input: unknown,
): Promise<{ ok: true; message?: string } | { ok: false; error: string }> {
  const allowed = await guardMinistryManage(slug);
  if (!allowed.ok) return allowed;

  const parsed = addMinistryDutySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid duty data',
    };
  }

  const ministry = allowed.ministry;
  const id = parsed.data.id ?? slugifyDutyId(parsed.data.label);
  if (ministry.dutyCatalog.some((duty) => duty.id === id)) {
    return { ok: false, error: 'A duty with that id already exists.' };
  }
  if (
    ministry.dutyCatalog.some(
      (duty) => duty.label.toLowerCase() === parsed.data.label.toLowerCase(),
    )
  ) {
    return { ok: false, error: 'A duty with that name already exists.' };
  }

  const sopId = normalizeOptional(parsed.data.sopId);
  if (sopId && !ministry.sops.some((sop) => sop.id === sopId)) {
    return { ok: false, error: 'Selected SOP was not found for this ministry.' };
  }

  const duty: MinistryDutyDefinition = {
    id,
    label: parsed.data.label,
    description: normalizeOptional(parsed.data.description),
    email: normalizeOptional(parsed.data.email),
    sopId,
    neededCount: parsed.data.neededCount,
    active: true,
  };
  ministry.dutyCatalog = [...ministry.dutyCatalog, duty];
  await updateMinistry(ministry, { replaceDutyCatalog: true });
  revalidatePath(`/ministries/${slug}`);
  return { ok: true };
}

export async function updateMinistryDutyAction(
  slug: string,
  input: unknown,
): Promise<{ ok: true; message?: string } | { ok: false; error: string }> {
  const allowed = await guardMinistryManage(slug);
  if (!allowed.ok) return allowed;

  const parsed = updateMinistryDutySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid duty data',
    };
  }

  const ministry = allowed.ministry;
  const index = ministry.dutyCatalog.findIndex((duty) => duty.id === parsed.data.id);
  if (index < 0) {
    return { ok: false, error: 'Duty not found.' };
  }

  const labelConflict = ministry.dutyCatalog.some(
    (duty, dutyIndex) =>
      dutyIndex !== index &&
      duty.label.toLowerCase() === parsed.data.label.toLowerCase(),
  );
  if (labelConflict) {
    return { ok: false, error: 'A duty with that name already exists.' };
  }

  const sopId = normalizeOptional(parsed.data.sopId);
  if (sopId && !ministry.sops.some((sop) => sop.id === sopId)) {
    return { ok: false, error: 'Selected SOP was not found for this ministry.' };
  }

  ministry.dutyCatalog[index] = {
    id: parsed.data.id,
    label: parsed.data.label,
    description: normalizeOptional(parsed.data.description),
    email: normalizeOptional(parsed.data.email),
    sopId,
    neededCount: parsed.data.neededCount,
    active: parsed.data.active,
  };
  await updateMinistry(ministry, { replaceDutyCatalog: true });
  revalidatePath(`/ministries/${slug}`);
  return { ok: true };
}

export async function removeMinistryDutyAction(
  slug: string,
  input: unknown,
): Promise<{ ok: true; message?: string } | { ok: false; error: string }> {
  const allowed = await guardMinistryManage(slug);
  if (!allowed.ok) return allowed;

  const parsed = removeMinistryDutySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid duty id',
    };
  }

  const ministry = allowed.ministry;
  const dutyId = parsed.data.id;
  if (!ministry.dutyCatalog.some((duty) => duty.id === dutyId)) {
    return { ok: false, error: 'Duty not found.' };
  }

  const assignedCount = dutyIdsInUse(ministry.personnel, dutyId);
  if (assignedCount > 0) {
    ministry.dutyCatalog = ministry.dutyCatalog.map((duty) =>
      duty.id === dutyId ? { ...duty, active: false } : duty,
    );
    await updateMinistry(ministry, { replaceDutyCatalog: true });
    revalidatePath(`/ministries/${slug}`);
    return {
      ok: true,
      message: `Duty is still assigned on the roster, so it was deactivated instead of deleted.`,
    };
  }

  ministry.dutyCatalog = ministry.dutyCatalog.filter((duty) => duty.id !== dutyId);
  await updateMinistry(ministry, { replaceDutyCatalog: true });
  revalidatePath(`/ministries/${slug}`);
  return { ok: true };
}

export async function addEventAction(
  slug: string,
  event: Omit<MinistryEvent, 'id'>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const allowed = await guardMinistryManage(slug);
  if (!allowed.ok) return allowed;
  const ministry = allowed.ministry;

  ministry.events.push({ ...event, id: newId('e') });
  await updateMinistry(ministry);
  revalidatePath(`/ministries/${slug}`);
  return { ok: true };
}

export async function removeEventAction(
  slug: string,
  eventId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const allowed = await guardMinistryManage(slug);
  if (!allowed.ok) return allowed;
  const ministry = allowed.ministry;

  ministry.events = ministry.events.filter((e) => e.id !== eventId);
  await updateMinistry(ministry);
  revalidatePath(`/ministries/${slug}`);
  return { ok: true };
}

export async function saveSopAction(
  slug: string,
  sop: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const allowed = await guardMinistryManage(slug);
  if (!allowed.ok) return allowed;

  const parsed = saveMinistrySopSchema.safeParse(sop);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid SOP data' };
  }

  const input = parsed.data;
  const ministry = allowed.ministry;
  const now = new Date().toISOString();

  let nextStatus: MinistrySopStatus = input.status ?? 'draft';
  if (nextStatus === 'approved' && !allowed.canApprove) {
    nextStatus = 'draft';
  }

  const docFields: Partial<MinistrySop> = {
    templateId: normalizeOptional(input.templateId),
    kind: input.kind,
    documentNumber: normalizeOptional(input.documentNumber),
    version: normalizeOptional(input.version) ?? '1.0',
    status: nextStatus,
    effectiveDate: normalizeOptional(input.effectiveDate),
    preparedBy: normalizeOptional(input.preparedBy) ?? allowed.actorLabel,
    reviewedBy: normalizeOptional(input.reviewedBy),
    nextReviewAt: normalizeOptional(input.nextReviewAt),
  };

  if (nextStatus === 'approved') {
    docFields.approvedBy = allowed.actorLabel;
    docFields.approvedAt = now;
    if (!docFields.effectiveDate) {
      docFields.effectiveDate = now.slice(0, 10);
    }
  }

  if (input.id) {
    const index = ministry.sops.findIndex((s) => s.id === input.id);
    if (index === -1) return { ok: false, error: 'SOP not found' };
    const previous = ministry.sops[index];
    ministry.sops[index] = {
      ...previous,
      ...docFields,
      title: input.title,
      content: input.content,
      updatedAt: now,
      updatedBy: allowed.actorLabel,
      approvedBy:
        nextStatus === 'approved'
          ? docFields.approvedBy
          : nextStatus === 'draft' || nextStatus === 'in_review'
            ? undefined
            : previous.approvedBy,
      approvedAt:
        nextStatus === 'approved'
          ? docFields.approvedAt
          : nextStatus === 'draft' || nextStatus === 'in_review'
            ? undefined
            : previous.approvedAt,
    };
  } else {
    ministry.sops.push({
      id: newId('sop'),
      title: input.title,
      content: input.content,
      updatedAt: now,
      updatedBy: allowed.actorLabel,
      ...docFields,
    });
  }

  await updateMinistry(ministry);
  revalidatePath(`/ministries/${slug}`);
  return { ok: true };
}

export async function setSopStatusAction(
  slug: string,
  payload: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const allowed = await guardMinistryManage(slug);
  if (!allowed.ok) return allowed;

  const parsed = setMinistrySopStatusSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid status' };
  }

  if (parsed.data.status === 'approved' && !allowed.canApprove) {
    return { ok: false, error: 'Only pastor or administrators can approve SOPs.' };
  }

  const ministry = allowed.ministry;
  const index = ministry.sops.findIndex((s) => s.id === parsed.data.sopId);
  if (index === -1) return { ok: false, error: 'SOP not found' };

  const now = new Date().toISOString();
  const previous = ministry.sops[index];
  const status = parsed.data.status;

  ministry.sops[index] = {
    ...previous,
    status,
    updatedAt: now,
    updatedBy: allowed.actorLabel,
    approvedBy: status === 'approved' ? allowed.actorLabel : undefined,
    approvedAt: status === 'approved' ? now : undefined,
    effectiveDate:
      status === 'approved'
        ? previous.effectiveDate ?? now.slice(0, 10)
        : previous.effectiveDate,
  };

  await updateMinistry(ministry);
  revalidatePath(`/ministries/${slug}`);
  return { ok: true };
}

export async function removeSopAction(
  slug: string,
  sopId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const allowed = await guardMinistryManage(slug);
  if (!allowed.ok) return allowed;
  const ministry = allowed.ministry;

  ministry.sops = ministry.sops.filter((s) => s.id !== sopId);
  await updateMinistry(ministry);
  revalidatePath(`/ministries/${slug}`);
  return { ok: true };
}

export type { MinistryPersonRole };
