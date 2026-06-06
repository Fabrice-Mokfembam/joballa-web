import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getApiBaseUrl } from "@/lib/joballa/config";
import { joballaErrorFromAxiosData } from "@/lib/http/parse-api-error";
import { JoballaApiError } from "@/lib/joballa/request";
import { isProtectedPortalPath, splitLocalePath } from "@/lib/auth/route-protection";
import { hasRecoverableSessionHint } from "@/lib/auth/session-hint";
import { terminateSession } from "@/lib/auth/session-lifecycle";
import { refreshAccessToken, SessionExpiredError } from "@/lib/auth/token-refresh";
import { hydrateAuthStoreFromPersistence, useAuthStore } from "@/lib/stores/auth-store";

type RetryConfig = InternalAxiosRequestConfig & { _joballaRetry?: boolean };

const AUTH_REFRESH_PATH = "/auth/refresh";

async function parseBlobErrorData(data: unknown): Promise<unknown> {
  if (typeof Blob === "undefined" || !(data instanceof Blob)) return data;
  try {
    const text = await data.text();
    return text ? JSON.parse(text) : data;
  } catch {
    return data;
  }
}

function requestHadBearer(config: InternalAxiosRequestConfig): boolean {
  const h = config.headers;
  if (!h) return false;
  if (typeof h.get === "function") {
    return !!(h.get("Authorization") || h.get("authorization"));
  }
  const o = h as Record<string, unknown>;
  return !!(o["Authorization"] ?? o["authorization"]);
}

function shouldAttemptRefresh(config: InternalAxiosRequestConfig | undefined): boolean {
  if (!config) return false;
  const url = config.url ?? "";
  if (url.includes(AUTH_REFRESH_PATH)) return false;
  if (requestHadBearer(config)) return true;
  return hasRecoverableSessionHint(useAuthStore.getState().accessToken);
}

function callbackUrlFromBrowser(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const { path } = splitLocalePath(window.location.pathname);
  const search = window.location.search;
  if (!isProtectedPortalPath(path)) return undefined;
  return `${path}${search}`;
}

/**
 * Shared Axios client for the Joballa REST API.
 * - Sends cookies on same-site requests (`withCredentials`).
 * - Attaches `Authorization` from {@link useAuthStore} when not already set.
 * - On 401 (with a recoverable session hint), attempts one shared `POST /auth/refresh` then retries the request.
 */
export const joballaAxios = axios.create({
  baseURL: getApiBaseUrl(),
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  withCredentials: true,
});

joballaAxios.interceptors.request.use((config) => {
  const headers = config.headers ?? {};
  const existing =
    (typeof headers.get === "function" ? headers.get("Authorization") : undefined) ??
    (headers as Record<string, unknown>)["Authorization"] ??
    (headers as Record<string, unknown>)["authorization"];
  if (existing) return config;

  const fromStore = useAuthStore.getState().accessToken;
  if (fromStore) {
    headers.Authorization = `Bearer ${fromStore}`;
    config.headers = headers;
  }
  return config;
});

joballaAxios.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const status = err.response?.status ?? 0;
    const data = await parseBlobErrorData(err.response?.data);
    const original = err.config as RetryConfig | undefined;

    if (status === 401 && original && !original._joballaRetry && shouldAttemptRefresh(original)) {
      original._joballaRetry = true;
      hydrateAuthStoreFromPersistence();
      try {
        const newToken = await refreshAccessToken();
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return joballaAxios.request(original);
      } catch (e) {
        const wasExpired = e instanceof SessionExpiredError;
        terminateSession({
          notify: wasExpired,
          callbackUrl: callbackUrlFromBrowser(),
        });
        throw wasExpired
          ? new JoballaApiError("Your session has expired. Please sign in again.", 401)
          : joballaErrorFromAxiosData(status, data, err.message || "Request failed");
      }
    }

    const isNetworkFailure =
      !err.response &&
      (err.code === "ERR_NETWORK" || err.message === "Network Error" || err.message.includes("ECONNREFUSED"));

    if (isNetworkFailure) {
      throw new JoballaApiError(
        "We could not reach the Joballa server. Check your connection and try again.",
        0,
      );
    }

    throw joballaErrorFromAxiosData(status, data, err.message || "Request failed");
  },
);
