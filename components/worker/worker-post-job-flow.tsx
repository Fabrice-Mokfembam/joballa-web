"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { findJobDepartment } from "@/features/employer/lib/job-departments";
import {
  EMPTY_POST_JOB_DRAFT,
  formatPostJobStartPreview,
  mapDraftToCreateWorkerJobBody,
  normalizePostJobDraft,
  validateWorkerPostJobDraft,
  type PostJobDraft,
} from "@/features/worker/lib/job-payload";
import { useCreateWorkerJob, useWorkerDepartmentOptions, useWorkerKyc, useWorkerMe } from "@/features/worker/hooks";
import { getVerificationStatus, isVerifiedStatus } from "@/features/worker/lib/verification";
import { profileInitials } from "@/features/worker/lib/profile-display";
import { VerificationGateDialog } from "@/components/verification/verification-gate-dialog";
import { CAMEROON_CITIES_BY_REGION } from "@/lib/cameroon-region-cities";
import { toast } from "@/lib/toast";
import {
  portalCardClass,
  portalCheckboxClass,
  portalInputClass,
  portalOutlineButtonClass,
  portalPageShellClass,
  portalTextareaClass,
} from "@/components/portal/portal-ui";
import { fieldMaxLength } from "@/lib/form-field-limits";
import { cn } from "@/lib/utils";
import { buttonClassName } from "@/components/ui/button";

type Step = "basics" | "details" | "preview";

const INITIAL_DRAFT = EMPTY_POST_JOB_DRAFT;
const STEPS: Step[] = ["basics", "details", "preview"];
const FORM_SHELL_CLASS = "mx-auto flex w-full max-w-4xl flex-col";

const EMPLOYMENT_TYPES = ["full_time", "part_time", "contract", "casual", "seasonal", "internship"] as const;
const PAY_STRUCTURES = ["hourly", "daily", "weekly", "monthly", "fixed"] as const;
const EXPERIENCE_LEVELS = ["entry", "junior", "mid", "senior", "lead", "tutor", "not_required"] as const;
const DURATION_UNITS = ["months", "weeks", "years"] as const;

const ALL_CITIES = Array.from(new Set(Object.values(CAMEROON_CITIES_BY_REGION).flat())).sort((a, b) =>
  a.localeCompare(b),
);

function splitDuration(raw: string): { amount: string; unit: (typeof DURATION_UNITS)[number] } {
  const match = raw.trim().match(/^(\d+)\s*(\w+)/i);
  if (!match) return { amount: "", unit: "months" };
  const unitRaw = match[2]!.toLowerCase();
  const unit = unitRaw.startsWith("week")
    ? "weeks"
    : unitRaw.startsWith("year") || unitRaw.startsWith("an")
      ? "years"
      : "months";
  return { amount: match[1]!, unit };
}

function mergeDuration(amount: string, unit: string): string {
  const n = amount.trim();
  if (!n) return "";
  return `${n} ${unit}`;
}

function formatPayPreview(pay: string, payPer: string): string {
  const digits = pay.replace(/\D/g, "");
  if (!digits) return "—";
  const per =
    payPer === "monthly"
      ? "mo"
      : payPer === "weekly"
        ? "wk"
        : payPer === "daily"
          ? "day"
          : payPer === "hourly"
            ? "hr"
            : "fixed";
  return `${Number(digits).toLocaleString("en-US")} XAF/${per}`;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="px-1 text-xs font-medium text-[var(--joballa-muted)]">{label}</span>
      {children}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  placeholder,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <Field label={label}>
      <select
        className={cn(portalInputClass, "h-9")}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

function SkillsField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength?: number;
}) {
  const pills = value
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  function removeSkill(skill: string) {
    onChange(pills.filter((item) => item !== skill).join(", "));
  }

  return (
    <Field label={label}>
      <input
        className={cn(portalInputClass, "h-11")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
      />
      {pills.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {pills.map((skill) => (
            <span
              key={skill}
              className="group relative inline-flex min-h-8 items-center rounded-full border border-[var(--joballa-border)] bg-[var(--joballa-tag-bg)] px-3 pr-7 text-xs font-semibold text-[var(--joballa-fg)]"
            >
              {skill}
              <button
                type="button"
                aria-label={`Remove ${skill}`}
                onClick={() => removeSkill(skill)}
                className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full border border-[var(--joballa-border)] bg-[var(--joballa-card)] text-[11px] font-bold text-[var(--joballa-muted)] shadow-sm transition hover:bg-[var(--joballa-danger-bg)] hover:text-[var(--joballa-danger-fg)]"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}
      <p className="mt-2 px-1 text-xs text-[var(--joballa-muted)]">{hint}</p>
    </Field>
  );
}

function PreviewList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="space-y-2.5">
      <h4 className="text-sm font-semibold text-[var(--joballa-fg)]">{title}</h4>
      <ul className="list-disc space-y-1.5 pl-5 text-sm leading-5 text-[var(--joballa-muted)]">
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ListComposer({
  items,
  onChange,
  placeholder,
  addLabel,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  addLabel: string;
}) {
  function updateItem(index: number, value: string) {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  function addItem() {
    onChange([...items, ""]);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={`${placeholder}-${index}`}
          className="flex items-start gap-3 rounded-[12px] border border-[var(--joballa-border)] bg-[var(--joballa-page-tint)] px-3 py-3"
        >
          <div className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--joballa-card)] text-xs font-semibold text-[var(--joballa-primary)]">
            {index + 1}
          </div>
          <input
            value={item}
            onChange={(event) => updateItem(index, event.target.value)}
            placeholder={placeholder}
            maxLength={fieldMaxLength("listLine")}
            className={cn(portalInputClass, "h-11 border-0 bg-[var(--joballa-card)]")}
          />
          {items.length > 1 ? (
            <button
              type="button"
              onClick={() => removeItem(index)}
              className={cn(portalOutlineButtonClass, "h-11 shrink-0 px-3")}
              aria-label="Remove"
            >
              ×
            </button>
          ) : null}
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="inline-flex h-11 items-center justify-center rounded-[12px] border border-dashed border-[var(--joballa-border)] bg-[var(--joballa-card)] px-4 text-sm font-semibold text-[var(--joballa-primary)] transition hover:bg-[var(--joballa-row-hover)]"
      >
        {addLabel}
      </button>
    </div>
  );
}

function StepDash() {
  return <div className="mx-1 h-px w-6 shrink-0 border-t border-dashed border-[var(--joballa-border)] md:w-10" />;
}

function PostJobStepIndicator({ step, onStep }: { step: Step; onStep: (s: Step) => void }) {
  const t = useTranslations("worker.postJobFlow");

  return (
    <nav
      className="flex flex-wrap items-center justify-start gap-1"
      aria-label={t("stepsLabel")}
    >
      {STEPS.map((item, index) => {
        const active = step === item;
        return (
          <div key={item} className="flex items-center gap-1">
            {index > 0 ? <StepDash /> : null}
            <button
              type="button"
              aria-current={active ? "step" : undefined}
              onClick={() => onStep(item)}
              className="flex items-center gap-2 rounded-lg p-0.5 transition hover:opacity-90"
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  active
                    ? "bg-[var(--joballa-primary)] text-[var(--joballa-on-primary)]"
                    : "bg-[var(--joballa-tag-bg)] text-[var(--joballa-muted)]",
                )}
              >
                {index + 1}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap text-sm font-semibold",
                  active ? "text-[var(--joballa-primary)]" : "text-[var(--joballa-muted)]",
                )}
              >
                {t(`steps.${item}`)}
              </span>
            </button>
          </div>
        );
      })}
    </nav>
  );
}

export function WorkerPostJobFlow() {
  const t = useTranslations("worker.postJobFlow");
  const router = useRouter();
  const createJob = useCreateWorkerJob();
  const meQuery = useWorkerMe();
  const kycQuery = useWorkerKyc();
  const { departments, isLoading: departmentsLoading } = useWorkerDepartmentOptions();
  const [step, setStep] = useState<Step>("basics");
  const [draft, setDraft] = useState(() => normalizePostJobDraft({ ...INITIAL_DRAFT, workMode: "onsite" }));
  const [verifyOpen, setVerifyOpen] = useState(false);

  const durationParts = useMemo(() => splitDuration(draft.duration), [draft.duration]);

  const selectedDepartment = useMemo(
    () => findJobDepartment(departments, draft.department),
    [departments, draft.department],
  );
  const departmentLabel = selectedDepartment?.name ?? "—";
  const startDatePreview = formatPostJobStartPreview(draft);

  const requirements = useMemo(() => draft.requirements.map((line) => line.trim()).filter(Boolean), [draft.requirements]);
  const responsibilities = useMemo(
    () => draft.responsibilities.map((line) => line.trim()).filter(Boolean),
    [draft.responsibilities],
  );
  const requiredSkills = useMemo(
    () =>
      draft.requiredSkillsText
        .split(/[,;|]/)
        .map((skill) => skill.trim())
        .filter(Boolean),
    [draft.requiredSkillsText],
  );

  const wp = meQuery.data?.workerProfile;
  const posterName = wp?.fullName?.trim() || meQuery.data?.email || "You";
  const posterAvatarUrl =
    typeof wp?.avatarUrl === "string" && wp.avatarUrl.trim() ? wp.avatarUrl.trim() : null;
  const posterInitial = profileInitials(posterName);

  const latestKycStatus = kycQuery.data?.status ? String(kycQuery.data.status).toUpperCase() : null;
  const verificationStatus = latestKycStatus ?? getVerificationStatus(meQuery.data?.workerProfile);
  const gateStatus =
    latestKycStatus === "PENDING" ? "PENDING" : isVerifiedStatus(verificationStatus) ? "VERIFIED" : "UNVERIFIED";

  const payPreview = formatPayPreview(draft.pay, draft.payPer);
  const employmentLabel = draft.jobType
    ? t(`options.employmentType.${draft.jobType as (typeof EMPLOYMENT_TYPES)[number]}`)
    : "—";
  const schedulePreview = [employmentLabel !== "—" ? employmentLabel : "", draft.schedule].filter(Boolean).join(" · ");
  const locationPreview = draft.location ? `Onsite, ${draft.location}` : "—";

  function validateBasics(): boolean {
    const payload = { ...draft, requirements, responsibilities };
    if (departmentsLoading) {
      toast.error(t("errors.departmentsLoading"));
      return false;
    }
    const validationError = validateWorkerPostJobDraft(payload);
    if (validationError === "INVALID_DEPARTMENT") {
      toast.error(t("errors.department"));
      return false;
    }
    if (validationError === "INVALID_START_DATE") {
      toast.error(t("errors.startDate"));
      return false;
    }
    return true;
  }

  function submitJob(asDraft: boolean) {
    if (!isVerifiedStatus(verificationStatus)) {
      setVerifyOpen(true);
      return;
    }
    const payload = { ...draft, requirements, responsibilities };
    if (!validateBasics()) {
      setStep("basics");
      return;
    }
    let body;
    try {
      body = mapDraftToCreateWorkerJobBody(payload, asDraft, departments);
    } catch {
      toast.error(t("errors.department"));
      setStep("basics");
      return;
    }
    createJob.mutate(body, {
      onSuccess: () => router.push("/worker/my-jobs"),
    });
  }

  function update<K extends keyof PostJobDraft>(key: K, value: PostJobDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateDepartment(departmentId: string) {
    setDraft((current) => ({ ...current, department: departmentId }));
  }

  function updateDuration(amount: string, unit: string) {
    update("duration", mergeDuration(amount, unit));
  }

  const isSaving = createJob.isPending || departmentsLoading;

  return (
    <div className={portalPageShellClass}>
      <Link
        href="/worker/my-jobs"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--joballa-muted)] transition hover:text-[var(--joballa-fg)]"
      >
        <span aria-hidden>‹</span> {t("backToJobs")}
      </Link>

      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-[1.625rem] font-semibold tracking-[-0.05em] text-[var(--joballa-fg)] sm:text-[1.875rem]">
            {t("title")}
          </h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--joballa-muted)]">{t("description")}</p>
        </div>
        <PostJobStepIndicator step={step} onStep={setStep} />
      </div>

      {step === "basics" ? (
        <div className={cn(FORM_SHELL_CLASS, "gap-7")}>
          <section className={cn(portalCardClass(), "p-7 sm:p-8")}>
            <div className="flex flex-col gap-7">
              <Field label={t("fields.title")}>
                <input
                  className={cn(portalInputClass, "h-[57px]")}
                  value={draft.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder={t("placeholders.title")}
                  maxLength={fieldMaxLength("jobTitle")}
                />
              </Field>

              <SelectField
                label={t("fields.city")}
                value={draft.location}
                onChange={(value) => update("location", value)}
                placeholder={t("placeholders.city")}
                options={ALL_CITIES.map((city) => ({ value: city, label: city }))}
              />

              <div className="grid gap-2.5 sm:grid-cols-2">
                <SelectField
                  label={t("fields.requiredLevel")}
                  value={draft.requiredLevel}
                  onChange={(value) => update("requiredLevel", value)}
                  placeholder={t("placeholders.requiredLevel")}
                  options={EXPERIENCE_LEVELS.map((value) => ({
                    value,
                    label: t(`options.experienceLevel.${value}`),
                  }))}
                />
                <SelectField
                  label={t("fields.department")}
                  value={draft.department}
                  onChange={updateDepartment}
                  disabled={departmentsLoading}
                  placeholder={
                    departmentsLoading ? t("errors.departmentsLoading") : t("placeholders.department")
                  }
                  options={departments.map((dept) => ({
                    value: dept.id,
                    label: dept.name,
                  }))}
                />
              </div>

              <SkillsField
                label={t("fields.requiredSkills")}
                hint={t("placeholders.requiredSkills")}
                value={draft.requiredSkillsText}
                onChange={(value) => update("requiredSkillsText", value)}
                placeholder={t("placeholders.requiredSkills")}
                maxLength={fieldMaxLength("requiredSkills")}
              />

              <SelectField
                label={t("fields.employmentType")}
                value={draft.jobType}
                onChange={(value) => update("jobType", value)}
                placeholder={t("placeholders.jobType")}
                options={EMPLOYMENT_TYPES.map((value) => ({
                  value,
                  label: t(`options.employmentType.${value}`),
                }))}
              />

              <Field label={t("fields.schedule")}>
                <input
                  className={cn(portalInputClass, "h-9")}
                  value={draft.schedule}
                  onChange={(e) => update("schedule", e.target.value)}
                  placeholder={t("placeholders.schedule")}
                  maxLength={fieldMaxLength("schedule")}
                />
              </Field>

              <div className="grid gap-2.5 sm:grid-cols-2">
                <Field label={t("fields.duration")}>
                  <input
                    className={cn(portalInputClass, "h-9")}
                    value={durationParts.amount}
                    onChange={(e) => updateDuration(e.target.value, durationParts.unit)}
                    placeholder="6"
                    inputMode="numeric"
                    maxLength={fieldMaxLength("duration")}
                  />
                </Field>
                <SelectField
                  label={t("fields.durationUnit")}
                  value={durationParts.unit}
                  onChange={(value) => updateDuration(durationParts.amount, value)}
                  placeholder={t("options.durationUnit.months")}
                  options={DURATION_UNITS.map((value) => ({
                    value,
                    label: t(`options.durationUnit.${value}`),
                  }))}
                />
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                <Field label={t("fields.pay")}>
                  <input
                    className={cn(portalInputClass, "h-9")}
                    value={draft.pay}
                    onChange={(e) => update("pay", e.target.value)}
                    placeholder={t("placeholders.pay")}
                    inputMode="numeric"
                    maxLength={fieldMaxLength("payAmount")}
                  />
                </Field>
                <SelectField
                  label={t("fields.payPer")}
                  value={draft.payPer}
                  onChange={(value) => update("payPer", value)}
                  placeholder={t("placeholders.payPer")}
                  options={PAY_STRUCTURES.map((value) => ({
                    value,
                    label: t(`options.payStructure.${value}`),
                  }))}
                />
              </div>

              <Field label={t("fields.openings")}>
                <input
                  className={cn(portalInputClass, "h-9")}
                  value={draft.openings}
                  onChange={(e) => update("openings", e.target.value)}
                  placeholder={t("placeholders.openings")}
                  inputMode="numeric"
                  maxLength={fieldMaxLength("openings")}
                />
              </Field>

              <div className="flex flex-col gap-1">
                <Field label={t("fields.startDate")}>
                  <input
                    type="date"
                    className={cn(portalInputClass, "h-9")}
                    value={draft.startDate}
                    disabled={draft.startNow}
                    onChange={(e) => update("startDate", e.target.value)}
                    placeholder={t("placeholders.startDate")}
                  />
                </Field>
                <label className="mt-2 flex items-center gap-2 rounded-[8px] p-0.5">
                  <input
                    type="checkbox"
                    className={portalCheckboxClass}
                    checked={draft.startNow}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setDraft((current) => ({
                        ...current,
                        startNow: checked,
                        startDate: checked ? "" : current.startDate,
                      }));
                    }}
                  />
                  <span className="text-sm text-[var(--joballa-muted)]">{t("startNow.label")}</span>
                </label>
              </div>
            </div>
          </section>

          <div className="flex flex-col items-center gap-[26px]">
            <button
              type="button"
              onClick={() => {
                if (validateBasics()) setStep("details");
              }}
              className={cn(buttonClassName("primary"), "h-12 w-full")}
            >
              {t("actions.continue")}
            </button>
            <p className="text-center text-xs font-semibold text-[#bbb]">{t("preview.moderationDescription")}</p>
          </div>
        </div>
      ) : null}

      {step === "details" ? (
        <div className={cn(FORM_SHELL_CLASS, "gap-6")}>
          <section className={cn(portalCardClass(), "p-7 sm:p-8")}>
            <h2 className="text-lg font-semibold text-[var(--joballa-fg)]">{t("fields.description")}</h2>
            <p className="mt-1.5 text-sm leading-6 text-[var(--joballa-muted)]">{t("helpers.descriptionDescription")}</p>
            <textarea
              className={cn(portalTextareaClass, "mt-5 min-h-[194px]")}
              value={draft.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder={t("placeholders.description")}
              maxLength={fieldMaxLength("description")}
            />
          </section>

          <section className={cn(portalCardClass(), "p-7 sm:p-8")}>
            <h2 className="text-lg font-semibold text-[var(--joballa-fg)]">{t("fields.requirements")}</h2>
            <p className="mt-1.5 text-sm leading-6 text-[var(--joballa-muted)]">{t("helpers.requirementsDescription")}</p>
            <div className="mt-5">
              <ListComposer
                items={draft.requirements}
                onChange={(items) => update("requirements", items)}
                placeholder={t("placeholders.requirement")}
                addLabel={t("actions.addRequirement")}
              />
            </div>
          </section>

          <section className={cn(portalCardClass(), "p-7 sm:p-8")}>
            <h2 className="text-lg font-semibold text-[var(--joballa-fg)]">{t("fields.responsibilities")}</h2>
            <p className="mt-1.5 text-sm leading-6 text-[var(--joballa-muted)]">
              {t("helpers.responsibilitiesDescription")}
            </p>
            <div className="mt-5">
              <ListComposer
                items={draft.responsibilities}
                onChange={(items) => update("responsibilities", items)}
                placeholder={t("placeholders.responsibility")}
                addLabel={t("actions.addResponsibility")}
              />
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setStep("basics")}
              className={cn(portalOutlineButtonClass, "h-12 flex-1")}
            >
              {t("actions.back")}
            </button>
            <button
              type="button"
              onClick={() => {
                if (validateBasics()) setStep("preview");
              }}
              className={cn(buttonClassName("primary"), "h-12 flex-1")}
            >
              {t("actions.preview")}
            </button>
          </div>
        </div>
      ) : null}

      {step === "preview" ? (
        <div className={cn(FORM_SHELL_CLASS, "max-w-6xl gap-6")}>
          <div className="grid gap-4 xl:grid-cols-2 xl:gap-5">
            <article className={cn(portalCardClass(), "flex flex-col gap-6 p-[14px]")}>
              <div className="flex items-start justify-between gap-2.5">
                <div className="min-w-0">
                  <p className="text-2xl font-semibold leading-8 text-[var(--joballa-primary)]">{payPreview}</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--joballa-muted)]">{schedulePreview || "—"}</p>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold leading-7 text-[var(--joballa-fg)]">{draft.title || "—"}</h2>
                <div className="mt-2 flex items-center gap-2">
                  {posterAvatarUrl ? (
                    <span className="relative size-6 shrink-0 overflow-hidden rounded-full">
                      <Image src={posterAvatarUrl} alt="" fill className="object-cover" sizes="24px" unoptimized />
                    </span>
                  ) : (
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--joballa-primary)] text-[8px] font-bold text-[var(--joballa-on-primary)]">
                      {posterInitial}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-[var(--joballa-muted)]">{posterName}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => submitJob(false)}
                  className={cn(buttonClassName("primary"), "h-12 w-full disabled:opacity-60")}
                >
                  {isSaving ? t("actions.submitting") : t("actions.publish")}
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => submitJob(true)}
                  className={cn(portalOutlineButtonClass, "h-12 w-full disabled:opacity-60")}
                >
                  {t("actions.saveDraft")}
                </button>
              </div>

              <dl className="flex flex-col gap-1.5">
                {[
                  [t("fields.jobType"), employmentLabel],
                  [t("fields.location"), locationPreview],
                  [t("fields.startDate"), startDatePreview],
                  [t("fields.duration"), draft.duration || "—"],
                  [t("preview.applications"), t("preview.applicationsCount")],
                ].map(([label, value]) => (
                  <div key={String(label)} className="flex items-start justify-between gap-4 text-sm font-semibold">
                    <dt className="text-[var(--joballa-fg)]">{label}</dt>
                    <dd className="text-right text-[var(--joballa-muted)]">{value || "—"}</dd>
                  </div>
                ))}
              </dl>
            </article>

            <article className={cn(portalCardClass(), "flex flex-col gap-6 p-[14px]")}>
              <div>
                <h3 className="text-sm font-semibold text-[var(--joballa-fg)]">{t("preview.aboutTitle")}</h3>
                <p className="mt-2.5 text-sm leading-5 text-[var(--joballa-muted)]">{draft.description || "—"}</p>
              </div>

              {requirements.length > 0 ? (
                <PreviewList title={t("preview.requirementsTitle")} items={requirements} />
              ) : null}

              {responsibilities.length > 0 ? (
                <PreviewList title={t("preview.doTitle")} items={responsibilities} />
              ) : null}

              {requiredSkills.length > 0 ? (
                <div>
                  <h4 className="text-sm font-semibold text-[var(--joballa-fg)]">{t("fields.requiredSkills")}</h4>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex rounded-full border border-[var(--joballa-pill-border)] bg-[var(--joballa-pill-bg)] px-2 py-1 text-xs font-semibold text-[var(--joballa-muted)]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="border-t border-[var(--joballa-border)] pt-4 text-center text-xs font-medium text-[#bbb]">
                <p>{t("preview.listedBy", { department: departmentLabel })}</p>
                <p>{t("preview.listedFor", { name: posterName })}</p>
              </div>
            </article>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setStep("details")} className={cn(portalOutlineButtonClass, "h-11 px-5")}>
              {t("actions.continueEditing")}
            </button>
          </div>
        </div>
      ) : null}

      <VerificationGateDialog
        open={verifyOpen}
        onOpenChange={setVerifyOpen}
        status={gateStatus}
        subject="worker"
        action="post-job"
        onVerify={() => router.push("/worker/profile/edit?section=verification")}
      />
    </div>
  );
}
