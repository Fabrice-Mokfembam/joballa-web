export function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not configured. Set it in joballa-web/.env",
    );
  }
  return base.replace(/\/$/, "");
}
