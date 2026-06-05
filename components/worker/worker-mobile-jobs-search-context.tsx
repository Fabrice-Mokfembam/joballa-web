"use client";

import { createContext, useContext, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";

export type WorkerMobileJobsSearchState = {
  q: string;
  setQ: Dispatch<SetStateAction<string>>;
  placeholder: string;
  onSubmit?: () => void;
};

const WorkerMobileJobsSearchContext = createContext<{
  mobileJobsSearch: WorkerMobileJobsSearchState | null;
  setMobileJobsSearch: Dispatch<SetStateAction<WorkerMobileJobsSearchState | null>>;
} | null>(null);

export function WorkerMobileJobsSearchProvider({ children }: { children: ReactNode }) {
  const [mobileJobsSearch, setMobileJobsSearch] = useState<WorkerMobileJobsSearchState | null>(null);
  const value = useMemo(() => ({ mobileJobsSearch, setMobileJobsSearch }), [mobileJobsSearch]);
  return <WorkerMobileJobsSearchContext.Provider value={value}>{children}</WorkerMobileJobsSearchContext.Provider>;
}

export function useWorkerMobileJobsSearch() {
  const ctx = useContext(WorkerMobileJobsSearchContext);
  if (!ctx) {
    throw new Error("useWorkerMobileJobsSearch must be used within WorkerMobileJobsSearchProvider");
  }
  return ctx;
}
