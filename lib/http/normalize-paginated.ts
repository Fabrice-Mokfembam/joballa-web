import type { Paginated } from "@/features/worker/types/worker-portal";

/** v2 list endpoints (`routedocs/VERIFIED_API_INTEGRATION.md`). */
export type ApiPaginatedV2<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
};

export function normalizePaginated<T>(raw: Paginated<T> | ApiPaginatedV2<T>): Paginated<T> {
  if (Array.isArray((raw as Paginated<T>).items)) {
    return raw as Paginated<T>;
  }
  const v2 = raw as ApiPaginatedV2<T>;
  if (Array.isArray(v2.data)) {
    return {
      items: v2.data,
      total: v2.total ?? v2.data.length,
      page: v2.page ?? 1,
      limit: v2.limit ?? v2.data.length,
    };
  }
  return { items: [], total: 0, page: 1, limit: 0 };
}
