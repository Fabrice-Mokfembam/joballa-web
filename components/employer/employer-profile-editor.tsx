"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { EmployerAsyncState } from "@/components/employer/employer-async-state";
import { portalInputClass, portalPageShellClass, portalTextareaClass, PortalSectionCard } from "@/components/portal/portal-ui";
import {
  useDeleteEmployerCompanyDocument,
  useEmployerCompany,
  usePatchEmployerCompany,
  useUploadEmployerCompanyDocument,
  useUploadEmployerCompanyLogo,
} from "@/features/employer/hooks";
import { buttonClassName } from "@/components/ui/button";
import { fieldMaxLength } from "@/lib/form-field-limits";
import { cn } from "@/lib/utils";

export function EmployerProfileEditor() {
  const t = useTranslations("employer.profile.profileForm");
  const tPage = useTranslations("employer.profile");
  const company = useEmployerCompany();
  const patchCompany = usePatchEmployerCompany();
  const uploadLogo = useUploadEmployerCompanyLogo();
  const uploadDocument = useUploadEmployerCompanyDocument();
  const deleteDocument = useDeleteEmployerCompanyDocument();
  const hydratedCompanyId = useRef<string | null>(null);

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");

  useEffect(() => {
    if (!company.data) return;
    const currentId = String(company.data.id ?? company.data.companyId ?? "");
    if (hydratedCompanyId.current === currentId) return;
    hydratedCompanyId.current = currentId;
    const data = company.data;
    const loc = data.location;
    queueMicrotask(() => {
      setName(data.name ?? "");
      setIndustry(data.industry ?? "");
      setCity(typeof loc === "string" ? loc : (loc?.city ?? ""));
      setBio(data.bio ?? "");
      setWebsite(data.website ?? "");
    });
  }, [company.data]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    patchCompany.mutate({
      name: name.trim() || undefined,
      industry: industry.trim() || undefined,
      bio: bio.trim() || undefined,
      website: website.trim() || undefined,
      location: city.trim() ? { city: city.trim(), country: "Cameroon" } : undefined,
    });
  }

  return (
    <div className={portalPageShellClass}>
      <Link
        href="/employer/profile"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--joballa-muted)] transition hover:text-[var(--joballa-fg)]"
      >
        <span aria-hidden>‹</span> {tPage("preview.backToProfile")}
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-[var(--joballa-fg)]">{tPage("editSectionTitle")}</h1>
        <p className="mt-2 text-sm text-[var(--joballa-muted)]">{tPage("editSectionLead")}</p>
      </header>

      <EmployerAsyncState
        isLoading={company.isLoading}
        isError={company.isError}
        error={company.error}
        onRetry={() => void company.refetch()}
        loadingLabel={t("loading")}
        errorLabel={t("loadError")}
      >
        <PortalSectionCard title={tPage("formIntro.title")} description={tPage("formIntro.description")}>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--joballa-fg)]">
                {t("fields.companyName")}
                <input className={portalInputClass} value={name} onChange={(e) => setName(e.target.value)} maxLength={fieldMaxLength("companyName")} />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--joballa-fg)]">
                {t("fields.industry")}
                <input className={portalInputClass} value={industry} onChange={(e) => setIndustry(e.target.value)} maxLength={fieldMaxLength("industry")} />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--joballa-fg)] md:col-span-2">
                {t("fields.location")}
                <input className={portalInputClass} value={city} onChange={(e) => setCity(e.target.value)} maxLength={fieldMaxLength("city")} />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--joballa-fg)] md:col-span-2">
                {t("fields.website")}
                <input className={portalInputClass} value={website} onChange={(e) => setWebsite(e.target.value)} maxLength={fieldMaxLength("url")} />
              </label>
            </div>
            <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--joballa-fg)]">
              {t("fields.about")}
              <textarea className={portalTextareaClass} value={bio} onChange={(e) => setBio(e.target.value)} rows={4} maxLength={fieldMaxLength("bio")} />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--joballa-fg)]">
              {t("fields.logo")}
              <input
                type="file"
                accept="image/*"
                className="block w-full text-sm text-[var(--joballa-muted)] file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--joballa-jade-3)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--joballa-primary)]"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadLogo.mutate(file);
                }}
              />
            </label>
            <div className="space-y-3 rounded-[12px] border border-[var(--joballa-border)] bg-[var(--joballa-page-tint)] p-4">
              <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--joballa-fg)]">
                Business document
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  className="block w-full text-sm text-[var(--joballa-muted)] file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--joballa-jade-3)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--joballa-primary)]"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadDocument.mutate({ file, documentName: file.name });
                    e.currentTarget.value = "";
                  }}
                />
              </label>
              {(company.data?.documents ?? []).length > 0 ? (
                <ul className="divide-y divide-[var(--joballa-border)] rounded-[10px] bg-[var(--joballa-card)]">
                  {(company.data?.documents ?? []).map((doc) => (
                    <li key={doc.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[var(--joballa-fg)]">{doc.documentName}</p>
                        <p className="text-xs capitalize text-[var(--joballa-muted)]">{doc.verificationStatus.replace(/_/g, " ")}</p>
                      </div>
                      <button
                        type="button"
                        disabled={deleteDocument.isPending}
                        onClick={() => deleteDocument.mutate(doc.id)}
                        className="text-xs font-semibold text-[var(--joballa-danger-fg)] disabled:opacity-60"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[var(--joballa-muted)]">No business documents uploaded yet.</p>
              )}
            </div>
            <button
              type="submit"
              disabled={patchCompany.isPending}
              className={cn(buttonClassName("primary"), patchCompany.isPending && "opacity-60")}
            >
              {patchCompany.isPending ? t("saving") : t("submit")}
            </button>
          </form>
        </PortalSectionCard>
      </EmployerAsyncState>
    </div>
  );
}
