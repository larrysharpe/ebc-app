import { prisma } from '@/lib/db';
import type { SopConfigStore, SopTemplateConfig } from '../types';

function mapSopConfig(row: {
  sections: unknown;
  templates: unknown;
  categoryDefaults: unknown;
  minQualityScore: number;
  updatedAt: Date;
}): SopConfigStore {
  return {
    sections: row.sections as SopConfigStore['sections'],
    templates: row.templates as SopConfigStore['templates'],
    categoryDefaults: row.categoryDefaults as SopConfigStore['categoryDefaults'],
    minQualityScore: row.minQualityScore,
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function loadConfigRow() {
  const row = await prisma.sopConfig.findUnique({ where: { id: 'default' } });
  if (!row) {
    throw new Error('SOP config not found. Run npm run db:seed.');
  }
  return row;
}

export async function getSopConfig(): Promise<SopConfigStore> {
  const row = await loadConfigRow();
  return mapSopConfig(row);
}

export async function saveSopTemplate(template: SopTemplateConfig): Promise<SopTemplateConfig> {
  const store = await getSopConfig();
  const index = store.templates.findIndex((t) => t.id === template.id);
  const templates =
    index === -1
      ? [...store.templates, template]
      : store.templates.map((t) => (t.id === template.id ? template : t));

  const row = await prisma.sopConfig.update({
    where: { id: 'default' },
    data: { templates },
  });

  return mapSopConfig(row).templates.find((t) => t.id === template.id)!;
}

export async function deleteSopTemplate(id: string): Promise<void> {
  const store = await getSopConfig();
  await prisma.sopConfig.update({
    where: { id: 'default' },
    data: { templates: store.templates.filter((t) => t.id !== id) },
  });
}

export async function updateSopSections(sections: SopConfigStore['sections']): Promise<void> {
  await prisma.sopConfig.update({
    where: { id: 'default' },
    data: { sections },
  });
}

export async function updateSopSettings(settings: {
  minQualityScore: number;
  categoryDefaults: SopConfigStore['categoryDefaults'];
}): Promise<void> {
  await prisma.sopConfig.update({
    where: { id: 'default' },
    data: {
      minQualityScore: settings.minQualityScore,
      categoryDefaults: settings.categoryDefaults,
    },
  });
}
