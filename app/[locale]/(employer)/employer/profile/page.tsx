import { getTranslations } from "next-intl/server";
import { EmployerProfilePublic } from "@/components/employer/employer-profile-public";
import { portalPageShellClass } from "@/components/portal/portal-ui";

export default async function EmployerProfilePage() {
  const t = await getTranslations("employer.profile");

  return (
    <div className={`${portalPageShellClass} py-4 sm:py-6`}>
      <h1 className="sr-only">{t("title")}</h1>
      <EmployerProfilePublic className="mx-auto w-full max-w-[72rem]" />
    </div>
  );
}
