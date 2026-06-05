/** Max `limit` for paginated list endpoints (see worker portal API guide). */
export const API_LIST_LIMIT_MAX = 50;

export type ListQueryParams = {
  page?: number;
  limit?: number;
};

/** Clamp list query params to API validation rules (`page` ≥ 1, `limit` ≤ max). */
export function clampListParams<T extends ListQueryParams>(params?: T): T | undefined {
  if (!params) return params;
  const next = { ...params };
  if (next.page != null) {
    next.page = Math.max(1, next.page);
  }
  if (next.limit != null) {
    next.limit = Math.min(API_LIST_LIMIT_MAX, Math.max(1, next.limit));
  }
  return next;
}
