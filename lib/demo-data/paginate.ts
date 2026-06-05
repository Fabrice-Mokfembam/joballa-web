export type PageParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  jobId?: string;
};

export function paginate<T>(
  items: T[],
  params?: PageParams,
  filter?: (item: T) => boolean,
): { items: T[]; total: number; page: number; limit: number } {
  const page = Math.max(1, params?.page ?? 1);
  const limit = Math.max(1, params?.limit ?? 20);
  let list = filter ? items.filter(filter) : [...items];
  const search = params?.search?.trim().toLowerCase();
  if (search) {
    list = list.filter((item) => JSON.stringify(item).toLowerCase().includes(search));
  }
  const total = list.length;
  const start = (page - 1) * limit;
  return {
    items: list.slice(start, start + limit),
    total,
    page,
    limit,
  };
}

export function demoDelay(ms = 120): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
