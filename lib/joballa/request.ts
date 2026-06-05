import { getApiBaseUrl } from "@/lib/joballa/config";
import { messageFromApiPayload } from "@/lib/http/api-message";

export class JoballaApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload?: unknown
  ) {
    super(message);
    this.name = "JoballaApiError";
  }
}

export async function joballaFetch(
  pathname: string,
  token: string | null | undefined,
  init?: RequestInit
): Promise<Response> {
  if (!token) {
    throw new JoballaApiError("Missing session token.", 401);
  }
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const url = `${getApiBaseUrl()}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
  return res;
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** Fetch JSON body; throws `JoballaApiError` when `!response.ok`. */
export async function joballaFetchJson<T>(
  pathname: string,
  token: string | null | undefined,
  init?: RequestInit
): Promise<T> {
  const res = await joballaFetch(pathname, token, init);

  let body: unknown;
  try {
    body = await parseJsonSafe(res);
  } catch {
    body = null;
  }

  if (!res.ok) {
    const msg = messageFromApiPayload(body, res.statusText);
    throw new JoballaApiError(msg || `Request failed (${res.status})`, res.status, body);
  }

  return body as T;
}
