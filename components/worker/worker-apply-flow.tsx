"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  useApplyToJob,
  useCustomizeJobApplication,
  useWorkerFullProfile,
  useWorkerProfileCompleteness,
} from "@/features/worker/hooks";
import { WorkerProfilePublic } from "@/components/worker/worker-profile-public";
import { WorkerApplicationProfileCustomize } from "@/components/worker/worker-application-profile-customize";
import {
  buildApplicationCustomizationFromProfile,
  encodeApplicationProfileDraft,
  hasApplicationCustomization,
  mergeProfileWithCustomization,
} from "@/features/worker/lib/application-profile-customization";
import {
  clearApplicationProfileDraft,
  readApplicationProfileDraft,
  writeApplicationProfileDraft,
} from "@/features/worker/lib/application-profile-draft-storage";
import type { ApplicationProfileCustomization } from "@/features/worker/types/worker-portal";
import { IconChevronLeft } from "@/components/worker/icons";
import { useRouter } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3;
type Step1Mode = "review" | "customize";

function StepDot({
  n,
  label,
  active,
}: {
  n: number;
  label: string;
  active: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          active ? "bg-[var(--joballa-primary)] text-[var(--joballa-on-primary)]" : "bg-[var(--joballa-tag-bg)] text-[var(--joballa-muted)]",
        )}
      >
        {n}
      </div>
      <span
        className={cn(
          "whitespace-nowrap text-sm font-semibold",
          active ? "text-[var(--joballa-primary)]" : "text-[var(--joballa-muted)]",
        )}
      >
        {label}
      </span>
    </div>
  );
}

function Dash() {
  return <div className="mx-1 h-px w-6 shrink-0 border-t border-dashed border-[var(--joballa-border)] md:w-10" />;
}

/** Multi-step apply flow shown in a modal on the job detail page. */
export function WorkerApplyFlow({
  jobId,
  jobTitle,
  onClose,
}: {
  jobId: string;
  jobTitle: string;
  onClose: () => void;
}) {
  const t = useTranslations("worker.apply");
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [step1Mode, setStep1Mode] = useState<Step1Mode>("review");
  const [note, setNote] = useState("");
  const [customizationEdits, setCustomizationEdits] = useState<ApplicationProfileCustomization | null>(null);
  const completeness = useWorkerProfileCompleteness();
  const profileQuery = useWorkerFullProfile();
  const customizeProfile = useCustomizeJobApplication();
  const apply = useApplyToJob();

  const chars = note.length;
  const submitting = apply.isPending || customizeProfile.isPending;
  const profile = profileQuery.data;
  const baseCustomization = useMemo(() => {
    if (!profile) return null;
    const fromLocal = readApplicationProfileDraft(jobId);
    return fromLocal ?? buildApplicationCustomizationFromProfile(profile);
  }, [jobId, profile]);

  const customization = customizationEdits ?? baseCustomization;

  const previewProfile = useMemo(
    () => (profile ? mergeProfileWithCustomization(profile, customization) : undefined),
    [customization, profile],
  );

  function openCustomize() {
    if (profile && !customization) {
      setCustomizationEdits(buildApplicationCustomizationFromProfile(profile));
    }
    setStep1Mode("customize");
  }

  function persistDraftLocally(next: ApplicationProfileCustomization) {
    writeApplicationProfileDraft(jobId, next);
  }

  function handleCustomizationChange(next: ApplicationProfileCustomization) {
    setCustomizationEdits(next);
    persistDraftLocally(next);
  }

  function continueFromCustomize() {
    if (customization) persistDraftLocally(customization);
    setStep1Mode("review");
  }

  const submitApplication = async () => {
    try {
      if (profile && customization && hasApplicationCustomization(profile, customization)) {
        await customizeProfile.mutateAsync({
          jobId,
          body: encodeApplicationProfileDraft(customization),
        });
      }
      await apply.mutateAsync({
        jobId,
        body: {
          jobSpecificNote: note.trim() || undefined,
          coverNote: note.trim() || undefined,
          source: "web",
        },
      });
      clearApplicationProfileDraft(jobId);
      onClose();
      router.push("/worker/applications");
    } catch {
      // Errors surfaced by mutation hooks.
    }
  };

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/45 p-4 sm:items-center sm:p-6"
      role="dialog"
      aria-modal
      aria-labelledby="apply-flow-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="my-6 w-full max-w-3xl overflow-hidden rounded-2xl border border-[var(--joballa-border)] bg-[var(--joballa-page-tint)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[var(--joballa-border)] bg-[var(--joballa-card)] px-4 py-3 sm:px-5">
          <p id="apply-flow-title" className="min-w-0 truncate text-base font-semibold text-[var(--joballa-fg)]">
            {jobTitle}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("closeModal")}
            className="shrink-0 rounded-lg p-2 text-[var(--joballa-muted)] transition hover:bg-[var(--joballa-row-hover)] hover:text-[var(--joballa-fg)]"
          >
            <span aria-hidden className="block text-xl leading-none">
              ×
            </span>
          </button>
        </div>

        <div className="max-h-[min(85vh,calc(100vh-6rem))] overflow-y-auto p-4 sm:p-6">
          <button
            type="button"
            onClick={() => {
              if (step1Mode === "customize") {
                setStep1Mode("review");
                return;
              }
              if (step === 1) onClose();
              else setStep((s) => Math.max(1, (s - 1) as number) as Step);
            }}
            className="flex w-fit items-center gap-1.5 text-sm font-medium text-[var(--joballa-muted)] transition hover:text-[var(--joballa-fg)]"
          >
            <IconChevronLeft className="size-4" />
            {t("back")}
          </button>

          <div className="mt-4 flex flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex flex-wrap items-center justify-center gap-1 px-0 md:justify-start">
              <StepDot n={1} label={t("step1")} active={step === 1} />
              <Dash />
              <StepDot n={2} label={t("step2")} active={step === 2} />
              <Dash />
              <StepDot n={3} label={t("step3")} active={step === 3} />
            </div>
            {step === 3 ? (
              <button
                type="button"
                disabled={submitting}
                className="h-10 shrink-0 rounded-[12px] bg-[var(--joballa-primary)] px-4 text-sm font-medium text-white hover:opacity-95 disabled:opacity-50"
                onClick={() => void submitApplication()}
              >
                {submitting ? t("submitting") : t("submit")}
              </button>
            ) : (
              <span className="hidden lg:block lg:w-[140px]" />
            )}
          </div>

          {step === 1 && step1Mode === "customize" && customization ? (
            <WorkerApplicationProfileCustomize
              value={customization}
              onChange={handleCustomizationChange}
              onContinue={continueFromCustomize}
              onCancel={() => setStep1Mode("review")}
            />
          ) : null}

          {step === 1 && step1Mode === "review" ? (
            <div className="mx-auto mt-6 w-full max-w-3xl space-y-4">
              <div className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-jade-3)] px-4 py-3 text-sm text-[var(--joballa-fg)]">
                {completeness < 60
                  ? t("profileIncomplete", { pct: completeness })
                  : t("customizeCta")}{" "}
                <button
                  type="button"
                  className="font-semibold text-[var(--joballa-primary)] underline-offset-2 hover:underline"
                  onClick={openCustomize}
                >
                  {t("customizeLink")}
                </button>
              </div>

              <WorkerProfilePublic
                showEditProfileButton={false}
                compactHeader
                previewProfile={previewProfile}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="h-10 rounded-[12px] bg-[var(--joballa-primary)] px-4 text-sm font-medium text-white"
                >
                  {t("saveContinue")}
                </button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="mx-auto mt-6 w-full max-w-[480px]">
              <div className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-6 shadow-sm">
                <div className="space-y-1.5 text-xs">
                  <p className="font-bold uppercase text-[var(--joballa-muted)]">{t("noteTitle")}</p>
                  <p className="font-normal text-[var(--joballa-muted)]">{t("noteHint")}</p>
                </div>
                <div className="mt-6 overflow-hidden rounded-md border border-[var(--joballa-border)] shadow-xs">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value.slice(0, 500))}
                    rows={8}
                    placeholder={t("notePlaceholder")}
                    className="min-h-[200px] w-full resize-none border-0 bg-[var(--joballa-input-bg)] p-3 text-xs text-[var(--joballa-fg)] outline-none ring-0 placeholder:text-[var(--joballa-muted)]"
                  />
                  <div className="flex items-center justify-between gap-2 border-t border-[var(--joballa-border)] p-3">
                    <span className="text-sm text-[var(--joballa-muted)]">{t("chars", { used: chars })}</span>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="h-8 rounded-[12px] bg-[var(--joballa-primary)] px-3 text-sm font-medium text-white"
                    >
                      {t("saveContinue")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="mx-auto mt-6 flex w-full max-w-3xl flex-col gap-6">
              <WorkerProfilePublic
                showEditProfileButton={false}
                applicationNote={note.trim() || undefined}
                compactHeader
                previewProfile={previewProfile}
              />
              <p className="text-xs text-[var(--joballa-muted)]">{t("vettedFooter")}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

