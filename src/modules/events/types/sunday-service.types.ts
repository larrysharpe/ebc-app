export type SundayServiceStatus = 'scheduled' | 'cancelled';

export type ServiceCharacteristic =
  | 'children'
  | 'mens_day'
  | 'womens_day'
  | 'youth'
  | 'graduation'
  | 'anniversary'
  | 'homecoming'
  | 'communion'
  | 'baptism'
  | 'baby_dedication'
  | 'revival'
  | 'special';

export type SundayService = {
  id: string;
  serviceDate: string;
  title: string;
  characteristics: ServiceCharacteristic[];
  notes?: string;
  startTime?: string;
  endTime?: string;
  status: SundayServiceStatus;
};

export const SERVICE_CHARACTERISTIC_LABELS: Record<ServiceCharacteristic, string> = {
  children: "Children's Service",
  mens_day: "Men's Day",
  womens_day: "Women's Day",
  youth: 'Youth emphasis',
  graduation: 'Graduation',
  anniversary: 'Church anniversary',
  homecoming: 'Homecoming',
  communion: 'Communion',
  baptism: 'Baptism',
  baby_dedication: 'Baby dedication',
  revival: 'Revival',
  special: 'Special service',
};

export const SERVICE_CHARACTERISTICS = Object.keys(
  SERVICE_CHARACTERISTIC_LABELS,
) as ServiceCharacteristic[];

export function isSpecialSundayService(service: Pick<SundayService, 'characteristics'>): boolean {
  return service.characteristics.length > 0;
}

export function formatServiceCharacteristics(
  characteristics: ServiceCharacteristic[],
): string {
  return characteristics.map((c) => SERVICE_CHARACTERISTIC_LABELS[c]).join(' · ');
}

/** Title when set; otherwise a short date-based label for lists and pickers. */
export function formatServiceDisplayTitle(
  service: Pick<SundayService, 'title' | 'serviceDate'>,
): string {
  const title = service.title.trim();
  if (title) return title;
  return new Date(`${service.serviceDate.slice(0, 10)}T12:00:00`).toLocaleDateString(
    'en-US',
    { weekday: 'long', month: 'short', day: 'numeric' },
  );
}
