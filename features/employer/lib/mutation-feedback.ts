import { JoballaApiError } from "@/lib/joballa/request";
import { toast } from "@/lib/toast";
const STATUS_FALLBACKS: Record<number, string> = {
  0: "We could not reach the server. Check your connection and try again.",
  400: "Please check your input and try again.",
  401: "Your session has expired. Please sign in again.",
  403: "You do not have permission to do that.",
  404: "We could not find what you were looking for.",
  409: "That action conflicts with the current data. Refresh and try again.",
  422: "Some fields need attention before we can continue.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "Something went wrong on our side. Please try again shortly.",
};

function friendlyApiMessage(error: unknown, fallback: string): string {
  if (error instanceof JoballaApiError) {
    const trimmed = error.message.trim();
    if (trimmed && trimmed !== "Request failed" && trimmed !== "Network Error") {
      return trimmed;
    }
    return STATUS_FALLBACKS[error.status] ?? fallback;
  }
  return fallback;
}

export function toastApiError(error: unknown, fallback: string) {
  if (error instanceof JoballaApiError && error.status === 401) {
    return;
  }
  toast.error(friendlyApiMessage(error, fallback));
}
export function toastSuccess(message: string) {
  toast.success(message);
}
