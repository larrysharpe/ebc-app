import type { ChurchFloor } from '@/modules/facilities/types/church-space.types';

export const CHURCH_FLOOR_LABELS: Record<ChurchFloor, string> = {
  first: '1st Floor',
  second: '2nd Floor',
  third: '3rd Floor',
};

export const CHURCH_FLOORS = ['first', 'second', 'third'] as const satisfies readonly ChurchFloor[];

/** Stable catalog used for seed + fallbacks. */
export type ChurchSpaceSeed = {
  id: string;
  floor: ChurchFloor;
  name: string;
  sortOrder: number;
};

export const CHURCH_SPACES_SEED: readonly ChurchSpaceSeed[] = [
  // 1st floor
  { id: 'space-1f-gym', floor: 'first', name: 'Gym', sortOrder: 10 },
  { id: 'space-1f-room-a', floor: 'first', name: 'Room A (New Member room)', sortOrder: 20 },
  { id: 'space-1f-room-b', floor: 'first', name: 'Room B (Deaconess room)', sortOrder: 30 },
  { id: 'space-1f-teen', floor: 'first', name: 'Teen Room', sortOrder: 40 },
  { id: 'space-1f-multipurpose', floor: 'first', name: 'Multipurpose Room', sortOrder: 50 },
  { id: 'space-1f-bathrooms', floor: 'first', name: 'Bathrooms', sortOrder: 60 },
  { id: 'space-1f-kitchen', floor: 'first', name: 'Kitchen', sortOrder: 70 },
  // 2nd floor
  { id: 'space-2f-chapel', floor: 'second', name: 'Chapel', sortOrder: 10 },
  { id: 'space-2f-media-booth', floor: 'second', name: 'Media Booth', sortOrder: 20 },
  {
    id: 'space-2f-crows-nest',
    floor: 'second',
    name: "Crow's Nest (Media Booth for the gym)",
    sortOrder: 30,
  },
  {
    id: 'space-2f-executive',
    floor: 'second',
    name: 'Executive Conference Room',
    sortOrder: 40,
  },
  { id: 'space-2f-bathrooms', floor: 'second', name: 'Bathrooms', sortOrder: 50 },
  // 3rd floor
  { id: 'space-3f-room-d', floor: 'third', name: 'Room D (Deacon Room)', sortOrder: 10 },
  { id: 'space-3f-ministers', floor: 'third', name: 'Ministers Room', sortOrder: 20 },
  {
    id: 'space-3f-assistant-pastors',
    floor: 'third',
    name: 'Assistant Pastors Room',
    sortOrder: 30,
  },
  { id: 'space-3f-pastors', floor: 'third', name: 'Pastors Room', sortOrder: 40 },
  { id: 'space-3f-first-lady', floor: 'third', name: "First Lady's Room", sortOrder: 50 },
  { id: 'space-3f-admin', floor: 'third', name: 'Church Admin Room', sortOrder: 60 },
  { id: 'space-3f-classroom-a', floor: 'third', name: 'Class Room A', sortOrder: 70 },
  { id: 'space-3f-classroom-b', floor: 'third', name: 'Class Room B', sortOrder: 80 },
] as const;

export const OTHER_LOCATION_VALUE = '__other__';
