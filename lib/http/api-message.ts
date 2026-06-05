/** Normalize NestJS / validation error bodies to a single message string. */
export function messageFromApiPayload(data: unknown, fallback: string): string {
  if (typeof data !== "object" || data === null || !("message" in data)) {
    return fallback;
  }
  const raw = (data as { message: unknown }).message;
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) return raw.map((x) => String(x)).filter(Boolean).join(" ");
  return fallback;
}
