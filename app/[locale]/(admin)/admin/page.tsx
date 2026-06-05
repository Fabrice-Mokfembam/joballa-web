import { getTranslations } from "next-intl/server";
import { SectionBlock } from "@/components/layout/section-block";

export default async function AdminDashboardPage() {
  const t = await getTranslations("admin.dashboard");

  return (
    <div className="space-y-6">
      <SectionBlock title={t("title")} description={t("description")} eyebrow={t("eyebrow")}>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">{t("stats.pendingUsers.label")}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{t("stats.pendingUsers.value")}</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">{t("stats.pendingJobs.label")}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{t("stats.pendingJobs.value")}</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">{t("stats.disputes.label")}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{t("stats.disputes.value")}</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">{t("stats.payments.label")}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{t("stats.payments.value")}</p>
          </div>
        </div>
      </SectionBlock>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionBlock title={t("queue.title")} description={t("queue.description")}>
          <div className="space-y-4">
            <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-semibold text-amber-900">{t("queue.items.users.title")}</p>
              <p className="mt-2 text-sm leading-6 text-amber-950/75">{t("queue.items.users.description")}</p>
            </div>
            <div className="rounded-[24px] border border-sky-200 bg-sky-50 p-5">
              <p className="text-sm font-semibold text-sky-900">{t("queue.items.jobs.title")}</p>
              <p className="mt-2 text-sm leading-6 text-sky-950/75">{t("queue.items.jobs.description")}</p>
            </div>
          </div>
        </SectionBlock>

        <SectionBlock title={t("operations.title")} description={t("operations.description")}>
          <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm font-semibold text-emerald-900">{t("operations.highlight.title")}</p>
            <p className="mt-2 text-sm leading-6 text-emerald-950/75">{t("operations.highlight.description")}</p>
          </div>
        </SectionBlock>
      </div>
    </div>
  );
}
