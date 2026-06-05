import { getTranslations } from "next-intl/server";
import { WorkerMyJobsView } from "@/components/worker/worker-my-jobs-view";

export default async function WorkerMyJobsPage() {
  const t = await getTranslations("worker.myJobs");

  return (
    <div className="flex min-w-0 flex-1 flex-col px-0 py-4 sm:py-6">
      <h1 className="sr-only">{t("title")}</h1>
      <WorkerMyJobsView />
    </div>
  );
}
