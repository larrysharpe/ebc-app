export type ChurchFloor = 'first' | 'second' | 'third';

export type ChurchSpace = {
  id: string;
  floor: ChurchFloor;
  name: string;
  sortOrder: number;
  capacity?: number;
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

/** Lightweight option for location pickers. */
export type ChurchSpaceOption = {
  id: string;
  floor: ChurchFloor;
  name: string;
  label: string;
  active: boolean;
};

export type UpdateChurchSpaceInput = {
  capacity?: number | null;
  notes?: string | null;
  active?: boolean;
};
