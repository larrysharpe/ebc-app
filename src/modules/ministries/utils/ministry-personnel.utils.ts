import {
  DUTY_NEEDED_COUNT_MAX,
  DUTY_NEEDED_COUNT_MIN,
} from '../constants/ministry.constants';
import type { MinistryDutyDefinition, MinistryDutyId } from '../types';

export function slugifyDutyId(label: string): string {
  return (
    label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 48) || `duty_${Date.now().toString(36)}`
  );
}

function optionalTrimmedString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

export function parseDutyNeededCount(value: unknown): number {
  const numeric =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : Number.NaN;
  if (!Number.isInteger(numeric)) return DUTY_NEEDED_COUNT_MIN;
  if (numeric < DUTY_NEEDED_COUNT_MIN) return DUTY_NEEDED_COUNT_MIN;
  if (numeric > DUTY_NEEDED_COUNT_MAX) return DUTY_NEEDED_COUNT_MAX;
  return numeric;
}

export function normalizeDutyCatalog(value: unknown): MinistryDutyDefinition[] {
  if (!Array.isArray(value)) return [];
  const catalog: MinistryDutyDefinition[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') continue;
    const record = raw as Record<string, unknown>;
    if (typeof record.id !== 'string' || typeof record.label !== 'string') continue;
    const id = record.id.trim();
    const label = record.label.trim();
    if (!id || !label) continue;
    const duty: MinistryDutyDefinition = {
      id,
      label,
      neededCount: parseDutyNeededCount(record.neededCount),
      active: record.active !== false,
    };
    const description = optionalTrimmedString(record.description);
    if (description) duty.description = description;
    const email = optionalTrimmedString(record.email);
    if (email) duty.email = email;
    const sopId = optionalTrimmedString(record.sopId);
    if (sopId) duty.sopId = sopId;
    catalog.push(duty);
  }
  return catalog;
}

export function normalizeDuties(duties: unknown): MinistryDutyId[] {
  if (!Array.isArray(duties)) return [];
  return duties
    .filter((duty): duty is string => typeof duty === 'string')
    .map((duty) => duty.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export function formatMinistryDuties(
  duties: MinistryDutyId[] | undefined,
  catalog: MinistryDutyDefinition[] = [],
): string {
  if (!duties?.length) return '';
  const labels = new Map(catalog.map((duty) => [duty.id, duty.label]));
  return duties.map((duty) => labels.get(duty) ?? duty).join(' · ');
}

export function activeDutyCatalog(
  catalog: MinistryDutyDefinition[],
): MinistryDutyDefinition[] {
  return catalog.filter((duty) => duty.active);
}

export function dutyIdsInUse(
  personnel: Array<{ duties?: MinistryDutyId[] }>,
  dutyId: string,
): number {
  return personnel.filter((person) => person.duties?.includes(dutyId)).length;
}

export function findDutySopTitle(
  sopId: string | undefined,
  sops: Array<{ id: string; title: string }>,
): string | undefined {
  if (!sopId) return undefined;
  return sops.find((sop) => sop.id === sopId)?.title;
}
