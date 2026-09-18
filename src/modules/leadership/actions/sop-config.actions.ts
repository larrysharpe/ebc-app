'use server';

import { revalidatePath } from 'next/cache';

import {
  deleteSopTemplate,
  getSopConfig,
  saveSopTemplate,
  updateSopSections,
  updateSopSettings,
} from '../repositories/sop-config.repository';
import type { SopConfigStore, SopSectionConfig, SopTemplateConfig } from '../types';

function newTemplateId(label: string): string {
  const base = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40);
  return `${base || 'template'}_${crypto.randomUUID().slice(0, 6)}`;
}

export async function getSopConfigAction(): Promise<SopConfigStore> {
  return getSopConfig();
}

export async function saveSopTemplateAction(
  template: Omit<SopTemplateConfig, 'id'> & { id?: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const id = template.id ?? newTemplateId(template.label);

  await saveSopTemplate({
    id,
    label: template.label,
    description: template.description,
    categories: template.categories,
    suggestedTitle: template.suggestedTitle,
    prefill: template.prefill ?? {},
    enabled: template.enabled ?? true,
    kind: template.kind ?? 'task',
  });

  revalidatePath('/leadership/sop-templates');
  revalidatePath('/ministries', 'layout');
  return { ok: true };
}

export async function deleteSopTemplateAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (id === 'general' || id === 'ministry_charter') {
    return { ok: false, error: 'Built-in templates cannot be deleted.' };
  }
  await deleteSopTemplate(id);
  revalidatePath('/leadership/sop-templates');
  revalidatePath('/ministries', 'layout');
  return { ok: true };
}

export async function updateSopSectionsAction(
  sections: SopSectionConfig[],
): Promise<{ ok: true }> {
  await updateSopSections(sections);
  revalidatePath('/leadership/sop-guidance');
  revalidatePath('/ministries', 'layout');
  return { ok: true };
}

export async function updateSopSettingsAction(settings: {
  minQualityScore: number;
  categoryDefaults: SopConfigStore['categoryDefaults'];
}): Promise<{ ok: true }> {
  await updateSopSettings(settings);
  revalidatePath('/leadership');
  revalidatePath('/ministries', 'layout');
  return { ok: true };
}
