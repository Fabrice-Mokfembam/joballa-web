type DatedRecord = {
  endDate?: string | null;
  isCurrent?: boolean;
  createdAt?: string;
  [key: string]: unknown;
};

function sortDateValue(endDate?: string | null, isCurrent?: boolean): number {
  if (isCurrent || (endDate == null && isCurrent !== false)) return Number.MAX_SAFE_INTEGER;
  if (!endDate) return 0;
  const t = new Date(endDate).getTime();
  return Number.isNaN(t) ? 0 : t;
}

/** Most recent first: end date DESC, then createdAt DESC. */
export function sortByMostRecent<T extends DatedRecord>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const endDiff = sortDateValue(b.endDate, b.isCurrent) - sortDateValue(a.endDate, a.isCurrent);
    if (endDiff !== 0) return endDiff;
    const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bCreated - aCreated;
  });
}
