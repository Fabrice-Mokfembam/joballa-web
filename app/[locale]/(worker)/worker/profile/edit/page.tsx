import { getTranslations } from "next-intl/server";
import { WorkerProfileEditor } from "../worker-profile-editor";

export default async function WorkerProfileEditPage() {
  const t = await getTranslations("worker.profile");

  return (
    <>
      <h1 className="sr-only">{t("editSectionTitle")}</h1>
      <WorkerProfileEditor />
    </>
  );
}
