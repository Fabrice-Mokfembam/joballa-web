import { getTranslations } from "next-intl/server";
import { WorkerProfilePublic } from "@/components/worker/worker-profile-public";

export default async function WorkerProfilePage() {
  const t = await getTranslations("worker.profile");

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-[var(--joballa-page-tint)] py-4 sm:py-6">
      <h1 className="sr-only">{t("title")}</h1>
      <WorkerProfilePublic className="mx-auto w-full max-w-[72rem]" />
    </div>
  );
}
