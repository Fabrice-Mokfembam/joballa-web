import { JoballaApiError } from "@/lib/joballa/request";
import { messageFromApiPayload } from "@/lib/http/api-message";

export function joballaErrorFromAxiosData(
  status: number,
  data: unknown,
  httpFallback: string
): JoballaApiError {
  return new JoballaApiError(messageFromApiPayload(data, httpFallback), status, data);
}
