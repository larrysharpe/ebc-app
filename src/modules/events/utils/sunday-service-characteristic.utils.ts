import type { ServiceCharacteristic } from '../types/sunday-service.types';

/**
 * WordPress calendar often lists ordinance “tags” as separate events
 * (e.g. COMMUNION SUNDAY) alongside Morning Worship. Those are service
 * characteristics, not standalone calendar events.
 */
const MARKER_TITLE =
  /^(baby\s*dedication|communion|baptism)(\s+sunday)?$/i;

export function isServiceCharacteristicMarkerTitle(title: string): boolean {
  return MARKER_TITLE.test(title.trim());
}

/** Map a WP title to SundayService characteristics (may be empty). */
export function inferServiceCharacteristicsFromTitle(
  title: string,
): ServiceCharacteristic[] {
  const value = title.trim();
  const found = new Set<ServiceCharacteristic>();

  if (/communion/i.test(value)) found.add('communion');
  if (/\bbaptism\b/i.test(value) && !/baby\s*dedication/i.test(value)) {
    found.add('baptism');
  }
  if (/baby\s*dedication|dedication\s+sunday/i.test(value)) {
    found.add('baby_dedication');
  }

  return [...found];
}

export function mergeServiceCharacteristics(
  current: readonly ServiceCharacteristic[],
  incoming: readonly ServiceCharacteristic[],
): ServiceCharacteristic[] {
  return [...new Set([...current, ...incoming])];
}
