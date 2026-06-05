"use client";

import { useEffect } from "react";
import { useRouter } from "@/lib/i18n/navigation";

/** On large viewports, deep-linked job pages open in the find-jobs split pane instead. */
export function WorkerJobDetailLgRedirect({ jobSlug }: { jobSlug: string }) {
  const router = useRouter();

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    if (!mq.matches) return;
    const sp = new URLSearchParams(window.location.search);
    const q = new URLSearchParams();
    q.set("job", jobSlug);
    if (sp.get("apply") === "1") q.set("apply", "1");
    router.replace(`/worker/jobs?${q.toString()}`);
  }, [jobSlug, router]);

  return null;
}
