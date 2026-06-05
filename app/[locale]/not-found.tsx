import { getLocale, getTranslations } from "next-intl/server";
import { NotFoundPage } from "@/components/portal/not-found-page";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  const locale = await getLocale();

  return (
    <NotFoundPage
      title={t("title")}
      description={t("description")}
      ctaDashboard={t("ctaDashboard")}
      ctaSignIn={t("ctaSignIn")}
      dashboardHref={`/${locale}`}
      signInHref={`/${locale}/sign-in`}
    />
  );
}
