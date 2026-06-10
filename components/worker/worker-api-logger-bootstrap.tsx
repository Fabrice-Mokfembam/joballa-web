"use client";

import { useEffect } from "react";
import { installWorkerApiLogger } from "@/features/worker/api/worker-api-logger";

export function WorkerApiLoggerBootstrap() {
  useEffect(() => {
    installWorkerApiLogger();
  }, []);
  return null;
}
