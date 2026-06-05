/** Production API (Render). Override with `NEXT_PUBLIC_API_BASE_URL` for local backend. */
const DEFAULT_API_BASE_URL = "https://joballa-api.onrender.com";

export function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;
  return base.replace(/\/$/, "");
}
