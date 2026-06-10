"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { EmployerAsyncState } from "@/components/employer/employer-async-state";
import { useCreateEmployerJob, useEmployerCompany, useEmployerDepartmentOptions, useEmployerJob, usePatchEmployerJob } from "@/features/employer/hooks";
import {
  EMPTY_POST_JOB_DRAFT,
  formatPostJobStartPreview,
  mapDraftToCreateJobBody,
  mapJobDetailToDraft,
  normalizePostJobDraft,
  validatePostJobDraft,
  type PostJobDraft,
} from "@/features/employer/lib/job-form-mapper";
import { mergeJobDepartments } from "@/features/employer/lib/job-departments";
import {
  displayCategoryLabel,
  JOB_POST_CATEGORY_VALUES,
  syncDepartmentForCategory,
} from "@/features/employer/lib/job-categories";
import { toast } from "@/lib/toast";
import { VerificationGateDialog } from "@/components/verification/verification-gate-dialog";
import { getVerificationStatus, isVerifiedStatus } from "@/features/worker/lib/verification";
import {
  portalCardClass,
  portalInputClass,
  portalOutlineButtonClass,
  portalPageShellClass,
  portalSegmentGroupClass,
  portalTextareaClass,
} from "@/components/portal/portal-ui";
import { fieldMaxLength } from "@/lib/form-field-limits";
import { cn } from "@/lib/utils";
import { buttonClassName } from "@/components/ui/button";

type Step = "basics" | "details" | "preview";

const INITIAL_DRAFT = EMPTY_POST_JOB_DRAFT;

const EMPLOYMENT_TYPES = ["full_time", "part_time", "contract", "casual", "seasonal", "internship"] as const;
const WORK_MODES = ["onsite", "remote", "hybrid"] as const;
const PAY_STRUCTURES = ["hourly", "daily", "weekly", "monthly", "fixed"] as const;
const EXPERIENCE_LEVELS = ["entry", "junior", "mid", "senior", "lead", "tutor", "not_required"] as const;

const STEPS: Step[] = ["basics", "details", "preview"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-[var(--joballa-fg)]">{label}</span>
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <Field label={label}>
      <select className={portalInputClass} value={value} onChange={(e) => onChange(e.target.value)}>
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

function DetailCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn(portalCardClass(), "p-5 sm:p-6")}>
      <div className="max-w-3xl">
        <h3 className="text-lg font-semibold text-[var(--joballa-fg)]">{title}</h3>
        {description ? <p className="mt-1.5 text-sm leading-6 text-[var(--joballa-muted)]">{description}</p> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function PreviewList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="space-y-3">
      <h4 className="text-lg font-semibold text-[var(--joballa-fg)]">{title}</h4>
      <ul className="list-disc space-y-1.5 pl-5 text-sm leading-7 text-[var(--joballa-muted)]">
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
          className="flex items-start gap-3 rounded-[18px] border border-[var(--joballa-border)] bg-[var(--joballa-page-tint)] px-3 py-3"
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
        className="inline-flex h-11 items-center justify-center rounded-[14px] border border-dashed border-[var(--joballa-border)] bg-[var(--joballa-card)] px-4 text-sm font-semibold text-[var(--joballa-primary)] transition hover:bg-[var(--joballa-row-hover)]"
      >
        {addLabel}
      </button>
    </div>
  );
}

function StepTabs({ step, onStep }: { step: Step; onStep: (s: Step) => void }) {
  const t = useTranslations("employer.postJobFlow");
  return (
    <div className={portalSegmentGroupClass} role="tablist" aria-label={t("stepsLabel")}>
      {STEPS.map((item, index) => {
        const active = step === item;
        const completed = STEPS.indexOf(step) > index;
        return (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onStep(item)}
            className={cn(
              "rounded-[12px] px-3 py-2 text-sm font-medium transition sm:px-4 sm:py-2.5",
              active
                ? "bg-[var(--joballa-primary)] text-[var(--joballa-on-primary)]"
                : completed
                  ? "text-[var(--joballa-primary)] hover:bg-[var(--joballa-tag-bg)]"
                  : "text-[var(--joballa-muted)] hover:text-[var(--joballa-fg)]",
            )}
          >
            {t(`steps.${item}`)}
          </button>
        );
      })}
    </div>
  );
}

export function EmployerPostJobFlow({ jobId }: { jobId?: string }) {
  const isEdit = Boolean(jobId);
  const jobQuery = useEmployerJob(jobId ?? "");

  return (
    <EmployerAsyncState
      isLoading={isEdit && jobQuery.isLoading}
      isError={isEdit && jobQuery.isError}
      error={jobQuery.error}
      onRetry={() => void jobQuery.refetch()}
    >
      {!isEdit || jobQuery.data ? (
        <EmployerPostJobFlowEditor
          key={jobId ?? "new"}
          jobId={jobId}
          initialDraft={
            isEdit && jobQuery.data
              ? normalizePostJobDraft(mapJobDetailToDraft(jobQuery.data))
              : INITIAL_DRAFT
          }
        />
      ) : null}
    </EmployerAsyncState>
  );
}

function EmployerPostJobFlowEditor({
  jobId,
  initialDraft,
}: {
  jobId?: string;
  initialDraft: PostJobDraft;
}) {
  const isEdit = Boolean(jobId);
  const t = useTranslations("employer.postJobFlow");
  const router = useRouter();
  const createJob = useCreateEmployerJob();
  const patchJob = usePatchEmployerJob(jobId ?? "");
  const companyQuery = useEmployerCompany();
  const { departments: catalogDepartments, isLoading: departmentsLoading } = useEmployerDepartmentOptions();
  const [step, setStep] = useState<Step>("basics");
  const [draft, setDraft] = useState(() => normalizePostJobDraft(initialDraft));
  const [verifyOpen, setVerifyOpen] = useState(false);

  const departments = useMemo(
    () =>
      mergeJobDepartments(
        catalogDepartments,
        initialDraft.department
          ? [
              {
                id: initialDraft.department,
                name: initialDraft.categoryCustom || initialDraft.category,
                category: initialDraft.category,
              },
            ]
          : [],
      ),
    [catalogDepartments, initialDraft.category, initialDraft.categoryCustom, initialDraft.department],
  );

  useEffect(() => {
    if (!draft.category) return;
    const resolved = syncDepartmentForCategory(draft.category, departments);
    if (resolved && resolved !== draft.department) {
      setDraft((current) => ({ ...current, department: resolved }));
    }
  }, [departments, draft.category, draft.department]);

  const categoryLabel = displayCategoryLabel(draft.category, draft.categoryCustom, (key) => t(key));
  const startDatePreview = formatPostJobStartPreview(draft);

  const requirements = useMemo(() => draft.requirements.map((line) => line.trim()).filter(Boolean), [draft.requirements]);
  const responsibilities = useMemo(
    () => draft.responsibilities.map((line) => line.trim()).filter(Boolean),
    [draft.responsibilities],
  );
  const verificationStatus = getVerificationStatus(companyQuery.data);

  function submitJob(asDraft: boolean) {
    if (!isVerifiedStatus(verificationStatus)) {
      setVerifyOpen(true);
      return;
    }
    const payload = { ...draft, requirements, responsibilities };
    if (departmentsLoading) {
      toast.error(t("errors.departmentsLoading"));
      return;
    }
    const validationError = validatePostJobDraft(payload, departments);
    if (validationError === "CATEGORY_REQUIRED") {
      toast.error(t("errors.category"));
      setStep("basics");
      return;
    }
    if (validationError === "CATEGORY_OTHER_REQUIRED") {
      toast.error(t("errors.categoryOther"));
      setStep("basics");
      return;
    }
    if (validationError === "INVALID_DEPARTMENT") {
      toast.error(t("errors.categoryNotConfigured"));
      setStep("basics");
      return;
    }
    if (validationError === "INVALID_START_DATE") {
      toast.error(t("errors.startDate"));
      setStep("details");
      return;
    }
    let body;
    try {
      body = mapDraftToCreateJobBody(
        { ...payload, department: syncDepartmentForCategory(payload.category, departments) },
        asDraft,
        departments,
      );
    } catch {
      toast.error(t("errors.categoryNotConfigured"));
      setStep("basics");
      return;
    }
    if (isEdit && jobId) {
      patchJob.mutate(body, {
        onSuccess: () => {
          router.push(`/employer/jobs?job=${encodeURIComponent(jobId)}`);
        },
      });
      return;
    }
    createJob.mutate(body, {
      onSuccess: (data) => {
        const params = new URLSearchParams();
        params.set("job", String(data.jobId));
        if (data.status === "under_review") {
          params.set("status", "under_review");
        }
        router.push(`/employer/jobs?${params.toString()}`);
      },
    });
  }

  function update<K extends keyof PostJobDraft>(key: K, value: PostJobDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateCategory(category: string) {
    setDraft((current) => ({
      ...current,
      category,
      categoryCustom: category === "other" ? current.categoryCustom : "",
      department: syncDepartmentForCategory(category, departments),
    }));
  }

  const isSaving = createJob.isPending || patchJob.isPending || departmentsLoading;

  return (
    <div className={portalPageShellClass}>
      <Link
        href={isEdit && jobId ? `/employer/jobs?job=${encodeURIComponent(jobId)}` : "/employer/jobs"}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--joballa-muted)] transition hover:text-[var(--joballa-fg)]"
      >
        <span aria-hidden>‹</span> {isEdit ? t("backToJob") : t("backToJobs")}
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-[1.625rem] font-semibold tracking-[-0.05em] text-[var(--joballa-fg)] sm:text-[1.875rem]">
            {isEdit ? t("editTitle") : t("title")}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--joballa-muted)]">
            {isEdit ? t("editDescription") : t("description")}
          </p>
        </div>
        <StepTabs step={step} onStep={setStep} />
      </div>

      {step === "basics" ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_360px]">
          <section className={cn(portalCardClass(), "p-5 sm:p-6")}>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label={t("fields.title")}>
                <input
                  className={portalInputClass}
                  value={draft.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder={t("placeholders.title")}
                  maxLength={fieldMaxLength("jobTitle")}
                />
              </Field>
              <SelectField
                label={t("fields.category")}
                value={draft.category}
                onChange={updateCategory}
                placeholder={t("placeholders.category")}
                options={JOB_POST_CATEGORY_VALUES.map((value) => ({
                  value,
                  label: t(`options.category.${value}`),
                }))}
              />
              {draft.category === "other" ? (
                <Field label={t("fields.categoryOther")}>
                  <input
                    className={portalInputClass}
                    value={draft.categoryCustom}
                    onChange={(e) => update("categoryCustom", e.target.value)}
                    placeholder={t("placeholders.categoryOther")}
                    maxLength={fieldMaxLength("categoryCustom")}
                  />
                </Field>
              ) : null}
              <SelectField
                label={t("fields.jobType")}
                value={draft.jobType}
                onChange={(value) => update("jobType", value)}
                placeholder={t("placeholders.jobType")}
                options={EMPLOYMENT_TYPES.map((value) => ({
                  value,
                  label: t(`options.employmentType.${value}`),
                }))}
              />
              <SelectField
                label={t("fields.workMode")}
                value={draft.workMode}
                onChange={(value) => update("workMode", value)}
                placeholder={t("placeholders.workMode")}
                options={WORK_MODES.map((value) => ({
                  value,
                  label: t(`options.workMode.${value}`),
                }))}
              />
              <Field label={t("fields.location")}>
                <input
                  className={portalInputClass}
                  value={draft.location}
                  onChange={(e) => update("location", e.target.value)}
                  placeholder={t("placeholders.location")}
                  maxLength={fieldMaxLength("location")}
                />
              </Field>
              <Field label={t("fields.pay")}>
                <input
                  className={portalInputClass}
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
              <Field label={t("fields.openings")}>
                <input
                  className={portalInputClass}
                  value={draft.openings}
                  onChange={(e) => update("openings", e.target.value)}
                  placeholder={t("placeholders.openings")}
                  inputMode="numeric"
                  maxLength={fieldMaxLength("openings")}
                />
              </Field>
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
            </div>
          </section>

          <aside className={cn(portalCardClass(), "h-fit p-5 sm:p-6")}>
            <h2 className="text-lg font-semibold text-[var(--joballa-fg)]">{t("summary.title")}</h2>
            <dl className="mt-5 space-y-3 text-sm">
              {[
                [t("fields.title"), draft.title],
                [t("fields.category"), categoryLabel],
                [t("fields.jobType"), draft.jobType ? t(`options.employmentType.${draft.jobType as (typeof EMPLOYMENT_TYPES)[number]}`) : ""],
                [t("fields.pay"), draft.pay],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex items-start justify-between gap-4">
                  <dt className="text-[var(--joballa-muted)]">{label}</dt>
                  <dd className="text-right font-medium text-[var(--joballa-fg)]">{value || "—"}</dd>
                </div>
              ))}
            </dl>
            <button
              type="button"
              onClick={() => setStep("details")}
              className={cn(buttonClassName("primary"), "mt-6 h-11 w-full")}
            >
              {t("actions.continue")}
            </button>
          </aside>
        </div>
      ) : null}

      {step === "details" ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_360px]">
          <div className="space-y-5">
            <DetailCard title={t("fields.schedule")} description={t("helpers.scheduleDescription")}>
              <div className="space-y-4">
                <label className="flex items-start gap-3 rounded-[20px] border border-[var(--joballa-border)] bg-[var(--joballa-page-tint)] p-4">
                  <input
                    type="checkbox"
                    className="mt-1 size-4 accent-[var(--joballa-primary)]"
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
                  <span>
                    <span className="block text-sm font-semibold text-[var(--joballa-fg)]">{t("startNow.label")}</span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--joballa-muted)]">{t("startNow.hint")}</span>
                  </span>
                </label>
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label={t("fields.startDate")}>
                    <input
                      type="date"
                      className={portalInputClass}
                      value={draft.startDate}
                      disabled={draft.startNow}
                      onChange={(e) => update("startDate", e.target.value)}
                      placeholder={t("placeholders.startDate")}
                    />
                  </Field>
                  <Field label={t("fields.duration")}>
                    <input
                      className={portalInputClass}
                      value={draft.duration}
                      onChange={(e) => update("duration", e.target.value)}
                      placeholder={t("placeholders.duration")}
                      maxLength={fieldMaxLength("duration")}
                    />
                  </Field>
                  <Field label={t("fields.schedule")}>
                    <input
                      className={portalInputClass}
                      value={draft.schedule}
                      onChange={(e) => update("schedule", e.target.value)}
                      placeholder={t("placeholders.schedule")}
                      maxLength={fieldMaxLength("schedule")}
                    />
                  </Field>
                </div>
              </div>
            </DetailCard>

            <DetailCard title={t("fields.requiredSkills")}>
              <input
                className={portalInputClass}
                value={draft.requiredSkillsText}
                onChange={(e) => update("requiredSkillsText", e.target.value)}
                placeholder={t("placeholders.requiredSkills")}
                maxLength={fieldMaxLength("requiredSkills")}
              />
            </DetailCard>

            <DetailCard title={t("fields.description")} description={t("helpers.descriptionDescription")}>
              <textarea
                className={cn(portalTextareaClass, "min-h-[180px]")}
                value={draft.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder={t("placeholders.description")}
                maxLength={fieldMaxLength("description")}
              />
            </DetailCard>

            <DetailCard title={t("fields.requirements")} description={t("helpers.requirementsDescription")}>
              <ListComposer
                items={draft.requirements}
                onChange={(items) => update("requirements", items)}
                placeholder={t("placeholders.requirement")}
                addLabel={t("actions.addRequirement")}
              />
            </DetailCard>

            <DetailCard title={t("fields.responsibilities")} description={t("helpers.responsibilitiesDescription")}>
              <ListComposer
                items={draft.responsibilities}
                onChange={(items) => update("responsibilities", items)}
                placeholder={t("placeholders.responsibility")}
                addLabel={t("actions.addResponsibility")}
              />
            </DetailCard>
          </div>

          <aside className={cn(portalCardClass(), "h-fit p-5 sm:p-6")}>
            <h2 className="text-lg font-semibold text-[var(--joballa-fg)]">{t("summary.readyTitle")}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--joballa-muted)]">{t("summary.readyDescription")}</p>
            <div className="mt-6 flex flex-col gap-3">
              <button type="button" onClick={() => setStep("preview")} className={cn(buttonClassName("primary"), "h-11 w-full")}>
                {t("actions.preview")}
              </button>
              <button type="button" onClick={() => setStep("basics")} className={cn(portalOutlineButtonClass, "h-11 w-full")}>
                {t("actions.back")}
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      {step === "preview" ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <section className="space-y-5">
            <article className={cn(portalCardClass(), "p-5 sm:p-6")}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[1.8rem] font-semibold leading-none tracking-[-0.05em] text-[var(--joballa-primary)] sm:text-[2rem]">
                    {draft.pay || "—"}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--joballa-muted)]">
                    {[draft.workMode, draft.schedule].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-[var(--joballa-jade-3)] px-3 py-1 text-xs font-semibold text-[var(--joballa-primary)]">
                  {t("preview.status")}
                </span>
              </div>

              <div className="mt-7">
                <h2 className="text-[1.55rem] font-semibold leading-tight tracking-[-0.05em] text-[var(--joballa-fg)] sm:text-[1.8rem]">
                  {draft.title || "—"}
                </h2>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-full bg-[var(--joballa-primary)] text-xs font-bold text-[var(--joballa-on-primary)]">
                    {(categoryLabel || "C").charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-[var(--joballa-muted)]">{categoryLabel}</span>
                </div>
              </div>

              <dl className="mt-8 space-y-3">
                {[
                  [t("fields.jobType"), draft.jobType ? t(`options.employmentType.${draft.jobType as (typeof EMPLOYMENT_TYPES)[number]}`) : ""],
                  [t("fields.location"), draft.location],
                  [t("fields.startDate"), startDatePreview],
                  [t("fields.duration"), draft.duration],
                  [t("fields.openings"), draft.openings],
                ].map(([label, value]) => (
                  <div key={String(label)} className="flex items-start justify-between gap-4 text-sm font-semibold">
                    <dt className="text-[var(--joballa-fg)]">{label}</dt>
                    <dd className="text-right text-[var(--joballa-muted)]">{value || "—"}</dd>
                  </div>
                ))}
              </dl>
            </article>

            <article className={cn(portalCardClass(), "p-5 sm:p-6")}>
              <h3 className="text-lg font-semibold text-[var(--joballa-fg)]">{t("preview.aboutTitle")}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--joballa-muted)]">{draft.description || "—"}</p>
              <div className="mt-8 space-y-8">
                {requirements.length > 0 ? (
                  <PreviewList title={t("preview.requirementsTitle")} items={requirements} />
                ) : null}
                {responsibilities.length > 0 ? (
                  <PreviewList title={t("preview.doTitle")} items={responsibilities} />
                ) : null}
              </div>
            </article>
          </section>

          <aside className={cn(portalCardClass(), "h-fit p-5 sm:p-6")}>
            <h2 className="text-lg font-semibold text-[var(--joballa-fg)]">{t("preview.panelTitle")}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--joballa-muted)]">{t("preview.panelDescription")}</p>
            <div className="mt-6 space-y-3">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => submitJob(false)}
                className={cn(buttonClassName("primary"), "h-11 w-full disabled:opacity-60")}
              >
                {isSaving ? t("actions.submitting") : isEdit ? t("actions.saveChanges") : t("actions.submit")}
              </button>
              {!isEdit ? (
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => submitJob(true)}
                  className={cn(portalOutlineButtonClass, "h-11 w-full disabled:opacity-60")}
                >
                  {t("actions.saveDraft")}
                </button>
              ) : null}
              <button type="button" onClick={() => setStep("details")} className={cn(portalOutlineButtonClass, "h-11 w-full")}>
                {t("actions.edit")}
              </button>
            </div>
            <div className="mt-8 rounded-[18px] bg-[var(--joballa-page-tint)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.02em] text-[var(--joballa-muted)]">
                {t("preview.moderationTitle")}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--joballa-muted)]">{t("preview.moderationDescription")}</p>
            </div>
          </aside>
        </div>
      ) : null}

      <VerificationGateDialog
        open={verifyOpen}
        onOpenChange={setVerifyOpen}
        status={verificationStatus}
        subject="employer"
        onVerify={() => router.push("/employer/profile/edit?section=verification")}
      />
    </div>
  );
}
