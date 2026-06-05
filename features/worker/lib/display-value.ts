/** Trimmed string for UI, or empty when missing (no placeholder copy). */
export function displayValue(value?: string | number | null): string {
  if (value == null) return "";
  const s = String(value).trim();
  return s;
}
