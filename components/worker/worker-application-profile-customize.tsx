"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  CAMEROON_REGION_IDS,
  DEFAULT_CAMEROON_REGION,
  getCitiesForRegion,
  type CameroonRegionId,
} from "@/lib/cameroon-region-cities";
import { useWorkerFullProfile, useWorkerMe } from "@/features/worker/hooks";
import {
  formatCertificationMeta,
  formatEducationMeta,
  formatWorkHistoryMeta,
  profileDisplayName,
  profileInitials,
  profileLanguagesLine,
  profileLocationLine,
} from "@/features/worker/lib/profile-display";
import { sortByMostRecent } from "@/features/worker/lib/profile-sort";
import { isAvailableForHire } from "@/features/worker/lib/availability";
import { IconGlobe, IconPhone, IconPin, IconShieldCheck, IconVerified } from "@/components/worker/icons";
import { getVerificationStatus, isPendingStatus, isVerifiedStatus } from "@/features/worker/lib/verification";
import { Link } from "@/lib/i18n/navigation";
import type { ApplicationProfileCustomization } from "@/features/worker/types/worker-portal";
import { fieldMaxLength } from "@/lib/form-field-limits";
import { cn } from "@/lib/utils";

function regionLabel(regionId: string): string {
  const spaced = regionId.replace(/([a-z])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function normalizeRegion(value?: string | null): CameroonRegionId {
  const normalized = String(value ?? "").trim();
  const byId = CAMEROON_REGION_IDS.find((id) => id === normalized);
  if (byId) return byId;
  const byLabel = CAMEROON_REGION_IDS.find((id) => regionLabel(id).toLowerCase() === normalized.toLowerCase());
  return byLabel ?? DEFAULT_CAMEROON_REGION;
}

type Props = {
  value: ApplicationProfileCustomization;
  onChange: (next: ApplicationProfileCustomization) => void;
  onContinue: () => void;
  onCancel: () => void;
  saving?: boolean;
};

export function WorkerApplicationProfileCustomize({ value, onChange, onContinue, onCancel, saving }: Props) {
  const t = useTranslations("worker.apply");
  const tProfile = useTranslations("worker.profile");
  const profileQuery = useWorkerFullProfile();
  const meQuery = useWorkerMe();
  const profile = profileQuery.data;

  const region = useMemo(() => normalizeRegion(value.region), [value.region]);
  const cityOptions = getCitiesForRegion(region);

  if (profileQuery.isLoading || !profile) {
    return <p className="py-8 text-center text-sm text-[var(--joballa-muted)]">{tProfile("profileForm.loading")}</p>;
  }

  const name = profileDisplayName(profile);
  const verified = isVerifiedStatus(getVerificationStatus(profile));
  const pending = isPendingStatus(getVerificationStatus(profile));
  const available = isAvailableForHire(profile);
  const paymentMethods = profile.paymentMethods ?? profile.paymentAccounts ?? [];
  const primaryPayment = paymentMethods.find((m) => m.isPrimary) ?? paymentMethods[0];
  const contactPhone =
    meQuery.data?.phone?.trim() ||
    primaryPayment?.phoneNumber?.trim() ||
    primaryPayment?.phone?.trim() ||
    profile.mobileMoneyNumber?.trim() ||
    "";
  const locationLine = profileLocationLine({ ...profile, city: value.city, region: value.region });
  const languagesLine = profileLanguagesLine({ ...profile, languages: value.languages });
  const skillPills = value.skills ?? [];

  const detachedWork = new Set(value.detachedWorkHistoryIds ?? []);
  const detachedEducation = new Set(value.detachedEducationIds ?? []);
  const detachedCerts = new Set(value.detachedCertificationIds ?? []);
  const detachedDocs = new Set(value.detachedDocumentIds ?? []);

  function patch(patch: Partial<ApplicationProfileCustomization>) {
    onChange({ ...value, ...patch });
  }

  function removeSkillPill(skill: string) {
    patch({ skills: skillPills.filter((item) => item !== skill) });
  }

  function toggleDetached(
    key: keyof Pick<
      ApplicationProfileCustomization,
      "detachedWorkHistoryIds" | "detachedEducationIds" | "detachedCertificationIds" | "detachedDocumentIds"
    >,
    id: string,
  ) {
    const current = new Set(value[key] ?? []);
    if (current.has(id)) current.delete(id);
    else current.add(id);
    patch({ [key]: [...current] });
  }

  return (
    <div className="mx-auto mt-6 w-full max-w-3xl space-y-4">
      <div className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-jade-3)] px-4 py-3 text-sm text-[var(--joballa-fg)]">
        {t("customizeHint")}
      </div>

      <div className="space-y-6 text-sm leading-6 text-[var(--joballa-fg)]">
        <div className="flex flex-col gap-4 border-b border-[var(--joballa-border)] pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-[var(--joballa-avatar-bg)] sm:size-20">
              {profile.avatarUrl ? (
                <Image src={profile.avatarUrl} alt="" fill className="object-cover" sizes="80px" unoptimized />
              ) : (
                <div className="flex size-full items-center justify-center text-lg font-bold text-[var(--joballa-muted)]">
                  {profileInitials(name || "?")}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="text-lg font-bold text-[var(--joballa-fg)] sm:text-xl">{name}</h3>
                {verified ? (
                  <IconVerified className="size-4 text-[var(--joballa-primary)]" aria-label={tProfile("preview.verified")} />
                ) : pending ? (
                  <span className="text-xs font-semibold text-[var(--joballa-muted)]">{tProfile("preview.underReview")}</span>
                ) : (
                  <Link
                    href="/worker/profile/edit?section=verification"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--joballa-primary)]"
                  >
                    <IconShieldCheck className="size-3.5" />
                    {tProfile("preview.verifyKyc")}
                  </Link>
                )}
              </div>
              {value.professionalTitle?.trim() ? (
                <p className="mt-0.5 text-sm text-[var(--joballa-fg-subtle)]">{value.professionalTitle}</p>
              ) : null}
              {available ? (
                <span className="mt-2 inline-flex rounded-full bg-[var(--joballa-jade-3)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--joballa-primary)]">
                  {tProfile("preview.availableForHire")}
                </span>
              ) : null}
            </div>
          </div>
          <div className="shrink-0 space-y-2 text-sm leading-6 text-[var(--joballa-fg-subtle)] sm:min-w-56 sm:text-right">
            {locationLine ? (
              <p className="flex items-center gap-2 sm:justify-end">
                <IconPin className="size-4 shrink-0" />
                {locationLine}
              </p>
            ) : null}
            {contactPhone ? (
              <p className="flex items-center gap-2 sm:justify-end">
                <IconPhone className="size-4 shrink-0" />
                {contactPhone}
              </p>
            ) : null}
            {languagesLine ? (
              <p className="flex items-center gap-2 sm:justify-end">
                <IconGlobe className="size-4 shrink-0" />
                {languagesLine}
              </p>
            ) : null}
          </div>
        </div>

        <section className="flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--joballa-muted)]">{tProfile("preview.summaryLabel")}</p>
          <div className="space-y-3">
            <label className="block text-xs font-medium text-[var(--joballa-muted)]">
              {tProfile("editor.yourTitle")}
              <input
                value={value.professionalTitle ?? ""}
                onChange={(e) => patch({ professionalTitle: e.target.value })}
                maxLength={fieldMaxLength("professionalTitle")}
                className="mt-1 h-10 w-full rounded-[10px] border border-[var(--joballa-border)] bg-[var(--joballa-input-bg)] px-3 text-sm"
              />
            </label>
            <label className="block text-xs font-medium text-[var(--joballa-muted)]">
              {tProfile("editor.shortBio")}
              <textarea
                value={value.professionalSummary ?? value.bio ?? ""}
                onChange={(e) => patch({ professionalSummary: e.target.value, bio: e.target.value })}
                maxLength={fieldMaxLength("bio")}
                rows={4}
                className="mt-1 w-full resize-none rounded-[10px] border border-[var(--joballa-border)] bg-[var(--joballa-input-bg)] px-3 py-2 text-sm"
              />
            </label>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--joballa-muted)]">{tProfile("preview.skillsLabel")}</p>
          <div>
            <input
              value={(value.skills ?? []).join(", ")}
              onChange={(e) =>
                patch({
                  skills: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder={tProfile("editor.skillsHint")}
              maxLength={fieldMaxLength("skillsList")}
              className="h-10 w-full rounded-[10px] border border-[var(--joballa-border)] bg-[var(--joballa-input-bg)] px-3 text-sm"
            />
            {skillPills.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {skillPills.map((skill) => (
                  <span
                    key={skill}
                    className="group relative inline-flex min-h-8 items-center rounded-full border border-[var(--joballa-border)] bg-[var(--joballa-tag-bg)] px-3 pr-7 text-xs font-semibold text-[var(--joballa-fg)]"
                  >
                    {skill}
                    <button
                      type="button"
                      aria-label={`Remove ${skill}`}
                      onClick={() => removeSkillPill(skill)}
                      className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full border border-[var(--joballa-border)] bg-[var(--joballa-card)] text-[11px] font-bold text-[var(--joballa-muted)] shadow-sm transition hover:bg-[var(--joballa-danger-bg)] hover:text-[var(--joballa-danger-fg)]"
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--joballa-muted)]">{tProfile("editor.languages")}</p>
          <input
            value={(value.languages ?? []).join(", ")}
            onChange={(e) =>
              patch({
                languages: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            maxLength={fieldMaxLength("languages")}
            className="h-10 w-full rounded-[10px] border border-[var(--joballa-border)] bg-[var(--joballa-input-bg)] px-3 text-sm"
          />
        </section>

        <section className="flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--joballa-muted)]">{tProfile("editor.region")}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={region}
              onChange={(e) => {
                const next = normalizeRegion(e.target.value);
                patch({
                  region: regionLabel(next),
                  city: getCitiesForRegion(next)[0] ?? "",
                });
              }}
              className="h-10 rounded-[10px] border border-[var(--joballa-border)] bg-[var(--joballa-input-bg)] px-3 text-sm"
            >
              {CAMEROON_REGION_IDS.map((id) => (
                <option key={id} value={id}>
                  {regionLabel(id)}
                </option>
              ))}
            </select>
            <select
              value={value.city ?? ""}
              onChange={(e) => patch({ city: e.target.value })}
              className="h-10 rounded-[10px] border border-[var(--joballa-border)] bg-[var(--joballa-input-bg)] px-3 text-sm"
            >
              {cityOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </section>

        <DetachableSection
          label={tProfile("preview.workLabel")}
          empty={tProfile("preview.emptyWork")}
          items={sortByMostRecent(profile.workHistories ?? []).map((entry) => ({
            id: entry.id,
            title: entry.jobTitle ?? "",
            meta: [entry.companyName, formatWorkHistoryMeta(entry)].filter(Boolean).join(" · "),
            detached: detachedWork.has(entry.id),
          }))}
          onToggle={(id) => toggleDetached("detachedWorkHistoryIds", id)}
          detachLabel={t("detachSection")}
          includeLabel={t("includeSection")}
        />

        <DetachableSection
          label={tProfile("preview.educationLabel")}
          empty={tProfile("preview.emptyEducation")}
          items={sortByMostRecent(profile.educations ?? []).map((entry) => ({
            id: entry.id,
            title: entry.degree ?? entry.institution ?? "",
            meta: [entry.institution, formatEducationMeta(entry)].filter(Boolean).join(" · "),
            detached: detachedEducation.has(entry.id),
          }))}
          onToggle={(id) => toggleDetached("detachedEducationIds", id)}
          detachLabel={t("detachSection")}
          includeLabel={t("includeSection")}
        />

        <DetachableSection
          label={tProfile("preview.certificationsLabel")}
          empty={tProfile("preview.emptyCertifications")}
          items={sortByMostRecent(profile.certifications ?? []).map((entry) => ({
            id: entry.id,
            title: entry.name ?? "",
            meta: formatCertificationMeta(entry),
            detached: detachedCerts.has(entry.id),
          }))}
          onToggle={(id) => toggleDetached("detachedCertificationIds", id)}
          detachLabel={t("detachSection")}
          includeLabel={t("includeSection")}
        />

        {(profile.documents ?? []).length > 0 ? (
          <DetachableSection
            label={tProfile("preview.documentsLabel")}
            empty={tProfile("preview.emptyDocuments")}
            items={(profile.documents ?? []).map((entry) => ({
              id: entry.id,
              title: entry.fileName ?? entry.id,
              meta: "",
              detached: detachedDocs.has(entry.id),
            }))}
            onToggle={(id) => toggleDetached("detachedDocumentIds", id)}
            detachLabel={t("detachSection")}
            includeLabel={t("includeSection")}
          />
        ) : null}

        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-[12px] px-4 text-sm font-medium text-[var(--joballa-muted)] hover:text-[var(--joballa-fg)]"
          >
            {t("back")}
          </button>
          <button
            type="button"
            onClick={onContinue}
            disabled={saving}
            className="h-10 rounded-[12px] bg-[var(--joballa-primary)] px-4 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? t("submitting") : t("saveContinue")}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetachableSection({
  label,
  empty,
  items,
  onToggle,
  detachLabel,
  includeLabel,
}: {
  label: string;
  empty: string;
  items: { id: string; title: string; meta: string; detached: boolean }[];
  onToggle: (id: string) => void;
  detachLabel: string;
  includeLabel: string;
}) {
  if (items.length === 0) {
    return (
      <section className="flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--joballa-muted)]">{label}</p>
        <p className="text-sm text-[var(--joballa-fg-subtle)]">{empty}</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--joballa-label-fg)]">{label}</p>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-center justify-between gap-3 rounded-[10px] border border-[var(--joballa-border)] px-3 py-2",
              item.detached && "opacity-50",
            )}
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{item.title}</p>
              {item.meta ? <p className="truncate text-xs text-[var(--joballa-muted)]">{item.meta}</p> : null}
            </div>
            <button
              type="button"
              onClick={() => onToggle(item.id)}
              className="shrink-0 text-xs font-semibold text-[var(--joballa-primary)]"
            >
              {item.detached ? includeLabel : detachLabel}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
