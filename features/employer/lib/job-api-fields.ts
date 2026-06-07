/** Helpers for employer job POST/PATCH bodies (`routedocs/BACKEND_EMPLOYER_JOB_POSTING_GUIDE.md`). */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isDepartmentUuid(value: string): boolean {
  return UUID_RE.test(value.trim());
}

/** Returns `YYYY-MM-DD` or `undefined` — never send invalid/empty strings to the API. */
export function toApiStartDate(value: string | null | undefined): string | undefined {
  const trimmed = String(value ?? "").trim();
  if (!trimmed || trimmed.toLowerCase().includes("asap")) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const parsed = new Date(trimmed.includes("T") ? trimmed : `${trimmed}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().slice(0, 10);
}
