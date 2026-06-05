"use client";

import { useMemo, useState } from "react";
import { useRouter } from "@/lib/i18n/navigation";
import { useCreateWorkerJob, useWorkerKyc, useWorkerMe } from "@/features/worker/hooks";
import { mapDraftToCreateWorkerJobBody } from "@/features/worker/lib/job-payload";
import { getVerificationStatus, isVerifiedStatus } from "@/features/worker/lib/verification";
import { VerificationGateDialog } from "@/components/verification/verification-gate-dialog";
import { CAMEROON_CITIES_BY_REGION } from "@/lib/cameroon-region-cities";
import { cn } from "@/lib/utils";

type Draft = {
  departmentId: string;
  departmentCategory: "education" | "domestic" | "logistics" | "events" | "agriculture" | "construction" | "other";
  title: string;
  city: string;
  neighbourhood: string;
  description: string;
  requiredSkillsText: string;
  requiredLevel: string;
  jobType: string;
  durationValue: string;
  durationUnit: string;
  pay: string;
  currency: string;
  per: string;
  openings: string;
  startDate: string;
  startAsap: boolean;
  requirements: string[];
  responsibilities: string[];
};

const cityOptions = Array.from(new Set(Object.values(CAMEROON_CITIES_BY_REGION).flat())).sort();

const initialDraft: Draft = {
  departmentId: "",
  departmentCategory: "other",
  title: "",
  city: "Douala",
  neighbourhood: "",
  description: "",
  requiredSkillsText: "",
  requiredLevel: "Senior",
  jobType: "Full Time",
  durationValue: "",
  durationUnit: "Months",
  pay: "",
  currency: "XAF",
  per: "Month",
  openings: "1",
  startDate: "",
  startAsap: true,
  requirements: [""],
  responsibilities: [""],
};

function inputClass(extra?: string) {
  return cn(
    "h-12 w-full rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-input-bg)] px-4 text-sm text-[var(--joballa-fg)] outline-none ring-[var(--joballa-primary)] placeholder:text-[var(--joballa-muted)] focus:border-[var(--joballa-primary)] focus:ring-2",
    extra,
  );
}

function compactPayPeriod(period: string) {
  const normalized = period.toLowerCase();

  if (normalized.includes("hour")) {
    return "/h";
  }

  if (normalized.includes("day")) {
    return "/d";
  }

  return "/mo";
}

function formatNumberText(value: string) {
  const digits = value.replace(/[^\d]/g, "");

  if (!digits) {
    return value;
  }

  return Number(digits).toLocaleString("en-US");
}

function formatPayPreview(draft: Draft) {
  const amount = formatNumberText(draft.pay.trim());

  if (!amount) {
    return `- ${draft.currency}${compactPayPeriod(draft.per)}`;
  }

  return `${amount} ${draft.currency}${compactPayPeriod(draft.per)}`;
}

function formatDurationPreview(draft: Draft) {
  const value = draft.durationValue.trim() || "1";

  return `${value} ${draft.durationUnit.toLowerCase()}`;
}

function formatStartPreview(draft: Draft) {
  if (draft.startAsap) {
    return "As soon as possible";
  }

  if (!draft.startDate) {
    return "Not set";
  }

  const date = new Date(`${draft.startDate}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return draft.startDate;
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-start justify-between gap-1 text-base min-[480px]:flex-row min-[480px]:gap-6 sm:text-lg">
      <dt className="font-bold text-[var(--joballa-fg)]">{label}</dt>
      <dd className="font-bold text-[var(--joballa-muted)] min-[480px]:max-w-[58%] min-[480px]:text-right">{value}</dd>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block text-sm font-semibold text-[var(--joballa-muted)]", className)}>
      {label}
      <div className="mt-2">{children}</div>
    </label>
  );
}

function BulletInputs({
  label,
  items,
  placeholder,
  onChange,
}: {
  label: string;
  items: string[];
  placeholder: string;
  onChange: (items: string[]) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-[var(--joballa-muted)]">{label}</p>
      <div className="mt-2 space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              value={item}
              onChange={(event) => onChange(items.map((current, i) => (i === index ? event.target.value : current)))}
              placeholder={placeholder}
              className={inputClass()}
            />
            {items.length > 1 ? (
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                className="h-12 shrink-0 rounded-[14px] border border-[var(--joballa-border)] px-3 text-sm font-semibold text-[var(--joballa-muted)]"
                aria-label="Remove item"
              >
                x
              </button>
            ) : null}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="mt-2 text-sm font-semibold text-[var(--joballa-primary)]"
      >
        Add another
      </button>
    </div>
  );
}

export function WorkerPostJobFlow() {
  const router = useRouter();
  const createJob = useCreateWorkerJob();
  const meQuery = useWorkerMe();
  const kycQuery = useWorkerKyc();
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [preview, setPreview] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);

  const requiredSkills = useMemo(
    () => draft.requiredSkillsText.split(",").map((skill) => skill.trim()).filter(Boolean),
    [draft.requiredSkillsText],
  );
  const requirements = useMemo(() => draft.requirements.map((line) => line.trim()).filter(Boolean), [draft.requirements]);
  const responsibilities = useMemo(
    () => draft.responsibilities.map((line) => line.trim()).filter(Boolean),
    [draft.responsibilities],
  );
  const latestKycStatus = kycQuery.data?.status ? String(kycQuery.data.status).toUpperCase() : null;
  const verificationStatus = latestKycStatus ?? getVerificationStatus(meQuery.data?.workerProfile);
  const gateStatus = latestKycStatus === "PENDING" ? "PENDING" : isVerifiedStatus(verificationStatus) ? "VERIFIED" : "UNVERIFIED";

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function submit(asDraft: boolean) {
    if (!isVerifiedStatus(verificationStatus)) {
      setVerifyOpen(true);
      return;
    }
    if (!draft.departmentId.trim()) {
      setPreview(false);
      return;
    }

    createJob.mutate(
      mapDraftToCreateWorkerJobBody(
        {
          departmentId: draft.departmentId,
          departmentCategory: draft.departmentCategory,
          title: draft.title,
          location: `${draft.city}, ${draft.neighbourhood}`,
          jobType: draft.jobType,
          pay: draft.pay,
          currency: draft.currency,
          per: draft.per,
          requiredLevel: draft.requiredLevel,
          requiredSkills,
          openings: draft.openings,
          startDate: draft.startDate,
          startAsap: draft.startAsap,
          duration: `${draft.durationValue || 1} ${draft.durationUnit}`,
          description: draft.description,
          requirements,
          responsibilities,
        },
        asDraft,
      ),
      {
        onSuccess: () => router.push("/worker/my-jobs"),
      },
    );
  }

  if (preview) {
    const location = ["Onsite", draft.city, draft.neighbourhood].filter(Boolean).join(", ");
    const descriptionLines = draft.description
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    return (
      <div className="mx-auto w-full max-w-[1180px] space-y-8">
        <button
          type="button"
          onClick={() => setPreview(false)}
          className="inline-flex items-center gap-2 text-2xl font-semibold text-[var(--joballa-muted)]"
        >
          <span aria-hidden="true" className="text-3xl leading-none">
            ‹
          </span>
          Back
        </button>

        <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
          <section className="rounded-[18px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-5 shadow-[var(--joballa-shadow-card)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-3xl font-bold leading-tight text-[var(--joballa-primary)] sm:text-4xl">
                  {formatPayPreview(draft)}
                </p>
                <p className="mt-1 text-lg font-bold text-[var(--joballa-muted)]">{draft.jobType}</p>
              </div>
              <button
                type="button"
                aria-label="More actions"
                className="grid size-12 place-items-center rounded-[16px] bg-[var(--joballa-surface)] text-2xl font-bold text-[var(--joballa-muted)]"
              >
                ...
              </button>
            </div>

            <div className="mt-8 sm:mt-12">
              <h1 className="text-xl font-bold text-[var(--joballa-fg)] sm:text-3xl">
                {draft.title || "Untitled job"}
              </h1>
              <div className="mt-2 flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-black text-sm font-bold text-white">
                  J
                </span>
                <span className="text-lg font-bold text-[var(--joballa-muted)]">joballa</span>
              </div>
            </div>

            <div className="mt-10 space-y-4">
              <button
                type="button"
                disabled={createJob.isPending}
                onClick={() => submit(false)}
                className="h-16 w-full rounded-[14px] bg-[var(--joballa-primary)] text-lg font-semibold text-[var(--joballa-on-primary)] disabled:opacity-60"
              >
                {createJob.isPending ? "Posting..." : "Post Job"}
              </button>
              <button
                type="button"
                disabled={createJob.isPending}
                onClick={() => submit(true)}
                className="h-16 w-full rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] text-lg font-semibold text-[var(--joballa-fg)] disabled:opacity-60"
              >
                Save as Draft
              </button>
            </div>

            <dl className="mt-10 space-y-3">
              <MetaRow label="Job type" value={draft.jobType} />
              <MetaRow label="Location" value={location || "Not set"} />
              <MetaRow label="Start Date" value={formatStartPreview(draft)} />
              <MetaRow label="Duration" value={formatDurationPreview(draft)} />
              <MetaRow label="Applications" value="0 so far" />
            </dl>
          </section>

          <section className="rounded-[18px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-5 shadow-[var(--joballa-shadow-card)] sm:p-6">
            <div className="space-y-10">
              <div>
                <h2 className="text-2xl font-bold text-[var(--joballa-fg)]">About this role</h2>
                {descriptionLines.length > 0 ? (
                  <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-7 text-[var(--joballa-muted)] sm:mt-5 sm:pl-8 sm:text-xl sm:leading-8">
                    {descriptionLines.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-base leading-7 text-[var(--joballa-muted)] sm:mt-5 sm:text-xl sm:leading-8">
                    No description added yet.
                  </p>
                )}
              </div>

              {requirements.length > 0 ? (
                <div>
                  <h2 className="text-xl font-bold text-[var(--joballa-fg)] sm:text-2xl">Requirements</h2>
                  <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-7 text-[var(--joballa-muted)] sm:mt-5 sm:pl-8 sm:text-xl sm:leading-8">
                    {requirements.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {responsibilities.length > 0 ? (
                <div>
                  <h2 className="text-xl font-bold text-[var(--joballa-fg)] sm:text-2xl">What you will do</h2>
                  <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-7 text-[var(--joballa-muted)] sm:mt-5 sm:pl-8 sm:text-xl sm:leading-8">
                    {responsibilities.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="pt-8 text-center text-base font-semibold text-[var(--joballa-muted)]">
                <div className="mx-auto mb-8 h-px w-16 bg-[var(--joballa-border)]" />
                <p>Listed by joballa</p>
                <p>for you</p>
              </div>
            </div>
          </section>
        </div>
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

  return (
    <div className="mx-auto w-full max-w-[760px] space-y-6">
      <h1 className="text-2xl font-bold text-[var(--joballa-fg)] sm:text-3xl">Post a Job</h1>
      <section className="rounded-[18px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] px-5 py-6 shadow-[var(--joballa-shadow-card)] sm:px-8">
        <div className="space-y-6">
          <Field label="Department ID">
            <input
              value={draft.departmentId}
              onChange={(e) => update("departmentId", e.target.value)}
              placeholder="Paste department UUID"
              className={inputClass()}
            />
          </Field>

          <Field label="Department Category">
            <select
              value={draft.departmentCategory}
              onChange={(e) => update("departmentCategory", e.target.value as Draft["departmentCategory"])}
              className={inputClass()}
            >
              {["education", "domestic", "logistics", "events", "agriculture", "construction", "other"].map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Job Title">
            <input value={draft.title} onChange={(e) => update("title", e.target.value)} className={inputClass()} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="City">
              <select value={draft.city} onChange={(e) => update("city", e.target.value)} className={inputClass()}>
                {cityOptions.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </Field>
            <Field label="Area / Neighbourhood">
              <input value={draft.neighbourhood} onChange={(e) => update("neighbourhood", e.target.value)} className={inputClass()} />
            </Field>
          </div>

          <Field label="Job Description">
            <textarea
              value={draft.description}
              onChange={(e) => update("description", e.target.value)}
              className={inputClass("h-44 resize-none py-3 leading-6")}
            />
          </Field>

          <Field label="Required Skills">
            <input
              value={draft.requiredSkillsText}
              onChange={(e) => update("requiredSkillsText", e.target.value)}
              placeholder="React, Tailwind CSS, Problem solving"
              className={inputClass()}
            />
          </Field>

          <Field label="Required Level">
            <select value={draft.requiredLevel} onChange={(e) => update("requiredLevel", e.target.value)} className={inputClass()}>
              {["Entry", "Junior", "Mid", "Senior", "Lead"].map((level) => <option key={level}>{level}</option>)}
            </select>
          </Field>

          <Field label="Employment Type">
            <select value={draft.jobType} onChange={(e) => update("jobType", e.target.value)} className={inputClass()}>
              {["Full Time", "Part Time", "Contract", "Temporary"].map((type) => <option key={type}>{type}</option>)}
            </select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Duration">
              <input value={draft.durationValue} onChange={(e) => update("durationValue", e.target.value)} placeholder="Ex: 6" className={inputClass()} />
            </Field>
            <Field label="Unit">
              <select value={draft.durationUnit} onChange={(e) => update("durationUnit", e.target.value)} className={inputClass()}>
                {["Days", "Weeks", "Months", "Years"].map((unit) => <option key={unit}>{unit}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Field label="Pay">
              <input value={draft.pay} onChange={(e) => update("pay", e.target.value)} placeholder="185,000" className={inputClass()} />
            </Field>
            <Field label="Currency">
              <select value={draft.currency} onChange={(e) => update("currency", e.target.value)} className={inputClass()}>
                <option>XAF</option>
              </select>
            </Field>
            <Field label="Per">
              <select value={draft.per} onChange={(e) => update("per", e.target.value)} className={inputClass()}>
                {["Month", "Hour", "Day"].map((per) => <option key={per}>{per}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Number of Openings">
            <input value={draft.openings} onChange={(e) => update("openings", e.target.value)} className={inputClass()} />
          </Field>

          <Field label="Start Date">
            <input
              type="date"
              value={draft.startDate}
              onChange={(e) => update("startDate", e.target.value)}
              disabled={draft.startAsap}
              className={inputClass(draft.startAsap ? "opacity-60" : undefined)}
            />
          </Field>
          <label className="flex items-center gap-3 text-sm font-semibold text-[var(--joballa-muted)]">
            <input
              type="checkbox"
              checked={draft.startAsap}
              onChange={(e) => update("startAsap", e.target.checked)}
              className="size-5 accent-[var(--joballa-primary)]"
            />
            Shortlisted applicant starts as soon as possible
          </label>

          <BulletInputs label="Requirements" items={draft.requirements} placeholder="Add one requirement" onChange={(items) => update("requirements", items)} />
          <BulletInputs label="What you will do" items={draft.responsibilities} placeholder="Add one responsibility" onChange={(items) => update("responsibilities", items)} />
        </div>
      </section>

      <button
        type="button"
        onClick={() => setPreview(true)}
        className="h-12 w-full rounded-[14px] bg-[var(--joballa-primary)] text-sm font-semibold text-[var(--joballa-on-primary)]"
      >
        Preview
      </button>
      <p className="text-center text-sm font-semibold text-[var(--joballa-muted)]">Jobs are reviewed by joballa Admin before going live</p>
    </div>
  );
}
