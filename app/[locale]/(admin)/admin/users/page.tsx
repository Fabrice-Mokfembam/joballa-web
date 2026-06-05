import { getTranslations } from "next-intl/server";
import { SectionBlock } from "@/components/layout/section-block";

export default async function AdminUsersPage() {
  const t = await getTranslations("admin.users");

  return (
    <SectionBlock title={t("title")} description={t("description")} eyebrow={t("eyebrow")}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-lg font-semibold text-slate-950">{t("cards.workers.title")}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{t("cards.workers.description")}</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-lg font-semibold text-slate-950">{t("cards.employers.title")}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{t("cards.employers.description")}</p>
        </div>
      </div>
    </SectionBlock>
  );
}
