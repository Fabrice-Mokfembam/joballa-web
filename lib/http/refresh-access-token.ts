import { refreshAccessToken } from "@/lib/auth/token-refresh";

/**
 * @deprecated Prefer {@link refreshAccessToken} from `@/lib/auth/token-refresh`.
 * Kept for existing imports; uses the shared in-flight refresh promise.
 */
export async function fetchRefreshedAccessToken(): Promise<string> {
  return refreshAccessToken();
}
