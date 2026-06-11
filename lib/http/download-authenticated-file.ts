import { getApiBaseUrl } from "@/lib/joballa/config";
import { useAuthStore } from "@/lib/stores/auth-store";

function resolveDownloadUrl(downloadUrl: string): string {
  if (downloadUrl.startsWith("http://") || downloadUrl.startsWith("https://")) {
    return downloadUrl;
  }
  const base = getApiBaseUrl().replace(/\/$/, "");
  const path = downloadUrl.startsWith("/") ? downloadUrl : `/${downloadUrl}`;
  return `${base}${path}`;
}

/** Download via API `downloadUrl` path with Bearer auth (PM platform review §1.4). */
export async function downloadAuthenticatedFile(
  downloadUrl: string,
  fileName: string,
  token?: string | null,
): Promise<void> {
  const accessToken = token ?? useAuthStore.getState().accessToken;
  const res = await fetch(resolveDownloadUrl(downloadUrl), {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  if (!res.ok) {
    throw new Error(`Download failed (${res.status})`);
  }
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName || "download";
  link.click();
  URL.revokeObjectURL(objectUrl);
}
