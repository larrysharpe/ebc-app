import type { SortDirection } from '@/lib/table-sort';

export const MEMBER_DIRECTORY_PAGE_SIZE = 25;

export const PERSON_DIRECTORY_SORT_KEYS = [
  'lastName',
  'firstName',
  'status',
] as const;

export type PersonDirectorySortKey = (typeof PERSON_DIRECTORY_SORT_KEYS)[number];

export type PersonDirectoryQuery = {
  q?: string;
  status?: string;
  page?: number;
  sort?: PersonDirectorySortKey;
  dir?: SortDirection;
};

export type PersonDirectoryPage = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export function clampPage(page: number, totalPages: number): number {
  if (!Number.isFinite(page) || page < 1) return 1;
  if (totalPages < 1) return 1;
  return Math.min(Math.floor(page), totalPages);
}

export function pageOffset(page: number, pageSize: number): number {
  const safePage = Math.max(1, Math.floor(page) || 1);
  const safeSize = Math.max(1, Math.floor(pageSize) || 1);
  return (safePage - 1) * safeSize;
}

export function buildDirectoryPageMeta(input: {
  page: number;
  pageSize: number;
  total: number;
}): PersonDirectoryPage {
  const pageSize = Math.max(1, input.pageSize);
  const total = Math.max(0, input.total);
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
  return {
    page: clampPage(input.page, totalPages),
    pageSize,
    total,
    totalPages,
  };
}

function parseSortKey(value: string | undefined): PersonDirectorySortKey | undefined {
  if (!value) return undefined;
  return PERSON_DIRECTORY_SORT_KEYS.includes(value as PersonDirectorySortKey)
    ? (value as PersonDirectorySortKey)
    : undefined;
}

function parseSortDir(value: string | undefined): SortDirection | undefined {
  if (value === 'asc' || value === 'desc') return value;
  return undefined;
}

export function parseDirectorySearchParams(
  params: Record<string, string | string[] | undefined>,
): PersonDirectoryQuery {
  const qRaw = params.q;
  const statusRaw = params.status;
  const pageRaw = params.page;
  const sortRaw = params.sort;
  const dirRaw = params.dir;
  const q = Array.isArray(qRaw) ? qRaw[0] : qRaw;
  const status = Array.isArray(statusRaw) ? statusRaw[0] : statusRaw;
  const pageValue = Array.isArray(pageRaw) ? pageRaw[0] : pageRaw;
  const sortValue = Array.isArray(sortRaw) ? sortRaw[0] : sortRaw;
  const dirValue = Array.isArray(dirRaw) ? dirRaw[0] : dirRaw;
  const page = pageValue ? Number.parseInt(pageValue, 10) : 1;

  return {
    q: q?.trim() || undefined,
    status: status?.trim() || undefined,
    page: Number.isFinite(page) ? page : 1,
    sort: parseSortKey(sortValue?.trim()),
    dir: parseSortDir(dirValue?.trim()),
  };
}

export function directoryHref(query: PersonDirectoryQuery): string {
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (query.status) params.set('status', query.status);
  if (query.page && query.page > 1) params.set('page', String(query.page));
  const sort = query.sort ?? 'lastName';
  const dir = query.dir ?? 'asc';
  if (sort !== 'lastName' || dir !== 'asc') {
    params.set('sort', sort);
    params.set('dir', dir);
  }
  const qs = params.toString();
  return qs ? `/people?${qs}` : '/people';
}

export function resolveDirectorySort(
  query: Pick<PersonDirectoryQuery, 'sort' | 'dir'>,
): { sort: PersonDirectorySortKey; dir: SortDirection } {
  return {
    sort: query.sort ?? 'lastName',
    dir: query.dir ?? 'asc',
  };
}
