/** Normalize NestJS / validation error bodies to a single message string. */
export function messageFromApiPayload(data: unknown, fallback: string): string {
  if (typeof data !== "object" || data === null) {
    return fallback;
  }

  const record = data as Record<string, unknown>;
  const nestedError = record.error;
  if (nestedError && typeof nestedError === "object") {
    const errorRecord = nestedError as { code?: unknown; message?: unknown };
    if (typeof errorRecord.message === "string" && errorRecord.message.trim()) {
      return errorRecord.message.trim();
    }
  }

  if (!("message" in record)) {
    return fallback;
  }
  const raw = record.message;
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) return raw.map((x) => String(x)).filter(Boolean).join(" ");
  return fallback;
}

export function apiErrorCodeFromPayload(data: unknown): string | null {
  if (typeof data !== "object" || data === null) return null;
  const nestedError = (data as Record<string, unknown>).error;
  if (!nestedError || typeof nestedError !== "object") return null;
  const code = (nestedError as { code?: unknown }).code;
  return typeof code === "string" && code.trim() ? code.trim().toUpperCase() : null;
}
