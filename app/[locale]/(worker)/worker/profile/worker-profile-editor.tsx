"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  getWorkerFullProfile,
  patchWorkerPersonalInfo,
  patchWorkerProfessionalSummary,
  patchWorkerSkills,
  postWorkerAvatar,
  postWorkerCv,
  postWorkerDocument,
  postWorkerKyc,
  postWorkerWorkHistory,
  postWorkerEducation,
  postWorkerPaymentAccount,
  patchWorkerPaymentAccount,
  patchWorkerWorkHistory,
  patchWorkerEducation,
  patchWorkerCertification,
  deleteWorkerWorkHistory,
  deleteWorkerEducation,
  deleteWorkerCertification,
  postWorkerCertification,
  deleteWorkerDocument,
  uploadVerificationDoc,
} from "@/features/worker/api";
import { toastApiError, toastSuccess } from "@/features/employer/lib/mutation-feedback";
import { toast } from "@/lib/toast";
import {
  useWorkerDocuments,
  useWorkerFullProfile,
  useWorkerMe,
} from "@/features/worker/hooks";
import { workerKeys } from "@/features/worker/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import {
  profileDisplayName,
  profileInitials,
  profileSectionCompletion,
  sortedCertifications,
  sortedEducations,
  sortedWorkHistories,
} from "@/features/worker/lib/profile-display";
import { ProfileRecordCard } from "@/components/worker/profile-record-card";
import {
  sanitizeEducationForPut,
  sanitizeWorkHistoryForPut,
  toIsoDateOnly,
} from "@/features/worker/lib/profile-payload";
import { getVerificationStatus, isRejectedStatus, isVerifiedStatus, verificationStatusLabel } from "@/features/worker/lib/verification";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { KycUploadField } from "@/components/worker/kyc-upload-field";
import { SupportingDocumentPicker } from "@/components/worker/supporting-document-picker";
import { WorkerProfilePageSkeleton } from "@/components/worker/worker-loading-skeletons";
import { fieldMaxLength, type FieldLimitKey } from "@/lib/form-field-limits";
import { useConfirmAction } from "@/lib/hooks/use-confirm-action";
import {
  CAMEROON_REGION_IDS,
  DEFAULT_CAMEROON_REGION,
  getCitiesForRegion,
  type CameroonRegionId,
} from "@/lib/cameroon-region-cities";
import { JoballaApiError } from "@/lib/joballa/request";
import {
  activePaymentSlot,
  paymentMethodsFromProfile,
  switchPaymentProvider,
  updateActivePaymentSlot,
  type MomoProviderTab,
  type PaymentMethodsFormState,
} from "@/features/worker/lib/payment-methods";
import type { WorkerDocument, WorkerFullProfile } from "@/features/worker/types/worker-portal";
import { cn } from "@/lib/utils";

const SECTION_KEYS = [
  "personal",
  "summary",
  "skills",
  "education",
  "work",
  "verification",
  "payment",
] as const;

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

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-5 text-[var(--joballa-fg)] shadow-[var(--joballa-shadow-card)]", className)}>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  wide,
  as = "input",
  type = "text",
  disabled,
  limitKey,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  wide?: boolean;
  as?: "input" | "textarea";
  type?: "text" | "date";
  disabled?: boolean;
  limitKey?: FieldLimitKey;
}) {
  const maxLength = limitKey ? fieldMaxLength(limitKey) : undefined;
  return (
    <label className={cn("block min-w-0 text-[11px] font-medium text-[var(--joballa-muted)]", wide && "sm:col-span-2")}>
      {label}
      {as === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          disabled={disabled}
          maxLength={maxLength}
          className="mt-1 w-full resize-none rounded-[10px] border border-[var(--joballa-border)] bg-[var(--joballa-input-bg)] px-3 py-2 text-sm text-[var(--joballa-fg)] outline-none ring-[var(--joballa-primary)] placeholder:text-[var(--joballa-muted)] focus:border-[var(--joballa-primary)] focus:ring-2 disabled:opacity-50"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={type === "date" ? undefined : maxLength}
          className="mt-1 h-10 w-full rounded-[10px] border border-[var(--joballa-border)] bg-[var(--joballa-input-bg)] px-3 text-sm text-[var(--joballa-fg)] outline-none ring-[var(--joballa-primary)] placeholder:text-[var(--joballa-muted)] focus:border-[var(--joballa-primary)] focus:ring-2 disabled:opacity-50"
        />
      )}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  wide,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly { value: string; label: string }[];
  wide?: boolean;
}) {
  return (
    <label className={cn("block min-w-0 text-[11px] font-medium text-[var(--joballa-muted)]", wide && "sm:col-span-2")}>
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-10 w-full rounded-[10px] border border-[var(--joballa-border)] bg-[var(--joballa-input-bg)] px-3 text-sm text-[var(--joballa-fg)] outline-none ring-[var(--joballa-primary)] focus:border-[var(--joballa-primary)] focus:ring-2"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={cn("flex h-6 w-11 items-center rounded-full p-0.5 transition", enabled ? "bg-[var(--joballa-primary)]" : "bg-[#e5e5e5]")}
      aria-hidden
    >
      <span className={cn("size-5 rounded-full bg-white shadow-sm transition", enabled && "translate-x-5")} />
    </span>
  );
}

export function WorkerProfileEditor() {
  const t = useTranslations("worker.profile");
  const tc = useTranslations("common.confirm");
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const { requestConfirm, dialogProps } = useConfirmAction();
  const profileQuery = useWorkerFullProfile();
  const meQuery = useWorkerMe();
  const documentsQuery = useWorkerDocuments();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const verificationRef = useRef<HTMLDivElement>(null);
  const hydratedRef = useRef(false);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [personalBaseline, setPersonalBaseline] = useState<{
    fullName: string;
    city: string;
    region: CameroonRegionId;
    languages: string;
    available: boolean;
  } | null>(null);
  const [summaryBaseline, setSummaryBaseline] = useState<{ title: string; summary: string } | null>(null);
  const [skillsBaseline, setSkillsBaseline] = useState<string | null>(null);
  const [paymentBaseline, setPaymentBaseline] = useState<PaymentMethodsFormState | null>(null);

  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState<CameroonRegionId>(DEFAULT_CAMEROON_REGION);
  const [languages, setLanguages] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [available, setAvailable] = useState(true);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [paymentForm, setPaymentForm] = useState<PaymentMethodsFormState>(() =>
    paymentMethodsFromProfile([]),
  );
  const [workJobTitle, setWorkJobTitle] = useState("");
  const [workCompany, setWorkCompany] = useState("");
  const [workStart, setWorkStart] = useState("");
  const [workEnd, setWorkEnd] = useState("");
  const [workDescription, setWorkDescription] = useState("");
  const [educationInstitution, setEducationInstitution] = useState("");
  const [educationDegree, setEducationDegree] = useState("");
  const [educationStart, setEducationStart] = useState("");
  const [educationEnd, setEducationEnd] = useState("");
  const [workCurrent, setWorkCurrent] = useState(false);
  const [educationCurrent, setEducationCurrent] = useState(false);
  const [certName, setCertName] = useState("");
  const [certIssuer, setCertIssuer] = useState("");
  const [certIssueDate, setCertIssueDate] = useState("");
  const [certCredentialUrl, setCertCredentialUrl] = useState("");
  const [editingWorkId, setEditingWorkId] = useState<string | null>(null);
  const [editingEducationId, setEditingEducationId] = useState<string | null>(null);
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [kycDocumentType, setKycDocumentType] = useState<"NATIONAL_ID" | "PASSPORT" | "DRIVERS_LICENSE">("NATIONAL_ID");
  const [kycFrontFile, setKycFrontFile] = useState<File | null>(null);
  const [kycBackFile, setKycBackFile] = useState<File | null>(null);
  const [kycSelfieFile, setKycSelfieFile] = useState<File | null>(null);
  const [pendingSupportingDoc, setPendingSupportingDoc] = useState<{
    file: File;
    kind: "CV" | "OTHER";
  } | null>(null);
  const [pendingDocKind, setPendingDocKind] = useState<"CV" | "OTHER">("OTHER");

  useEffect(() => {
    const p = profileQuery.data;
    if (!p || hydratedRef.current) return;
    hydratedRef.current = true;
    setFullName(profileDisplayName(p));
    const nextRegion = normalizeRegion(p.region);
    setRegion(nextRegion);
    const regionCities = getCitiesForRegion(nextRegion);
    setCity(p.city && regionCities.includes(p.city) ? p.city : (regionCities[0] ?? ""));
    setLanguages((p.languages ?? []).join(", "));
    setAvailable(String(p.availabilityStatus ?? "AVAILABLE") === "AVAILABLE");
    setTitle(p.professionalTitle ?? "");
    setSummary(p.summary ?? "");
    setSkillsText((p.skills ?? []).join(", "));
    const nextCity =
      p.city && regionCities.includes(p.city) ? p.city : (regionCities[0] ?? "");
    const nextPaymentForm = paymentMethodsFromProfile(p.paymentAccounts ?? p.paymentMethods ?? []);
    setPaymentForm(nextPaymentForm);
    setPersonalBaseline({
      fullName: profileDisplayName(p),
      city: nextCity,
      region: nextRegion,
      languages: (p.languages ?? []).join(", "),
      available: String(p.availabilityStatus ?? "AVAILABLE") === "AVAILABLE",
    });
    setSummaryBaseline({ title: p.professionalTitle ?? "", summary: p.summary ?? "" });
    setSkillsBaseline((p.skills ?? []).join(", "));
    setPaymentBaseline(nextPaymentForm);
  }, [profileQuery.data]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  useEffect(() => {
    if (searchParams.get("section") !== "verification") return;
    window.requestAnimationFrame(() => verificationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, [searchParams]);

  const completion = useMemo(() => {
    if (!profileQuery.data) return null;
    return profileSectionCompletion(profileQuery.data);
  }, [profileQuery.data]);

  const pct =
    typeof meQuery.data?.workerProfile?.profileCompleteness === "number"
      ? meQuery.data.workerProfile.profileCompleteness
      : typeof profileQuery.data?.profileCompleteness === "number"
        ? profileQuery.data.profileCompleteness
        : 0;

  const regionOptions = useMemo(
    () => CAMEROON_REGION_IDS.map((id) => ({ value: id, label: regionLabel(id) })),
    [],
  );
  const cityOptions = useMemo(
    () => getCitiesForRegion(region).map((name) => ({ value: name, label: name })),
    [region],
  );

  const personalDirty = useMemo(() => {
    if (!personalBaseline) return false;
    if (avatarFile) return true;
    return (
      fullName !== personalBaseline.fullName ||
      city !== personalBaseline.city ||
      region !== personalBaseline.region ||
      languages !== personalBaseline.languages ||
      available !== personalBaseline.available
    );
  }, [avatarFile, available, city, fullName, languages, personalBaseline, region]);

  const summaryDirty = useMemo(() => {
    if (!summaryBaseline) return false;
    return title !== summaryBaseline.title || summary !== summaryBaseline.summary;
  }, [summary, summaryBaseline, title]);

  const skillsDirty = useMemo(() => {
    if (skillsBaseline == null) return false;
    return skillsText !== skillsBaseline;
  }, [skillsBaseline, skillsText]);

  const paymentDirty = useMemo(() => {
    if (!paymentBaseline) return false;
    return JSON.stringify(paymentForm) !== JSON.stringify(paymentBaseline);
  }, [paymentBaseline, paymentForm]);

  const activePayment = activePaymentSlot(paymentForm);

  function sectionSaveLabel(section: string, dirty: boolean) {
    if (savingSection === section) return t("editor.saving");
    return dirty ? t("editor.saveChanges") : t("editor.save");
  }

  if (profileQuery.isLoading) {
    return <WorkerProfilePageSkeleton />;
  }

  if (profileQuery.isError || !profileQuery.data) {
    const message =
      profileQuery.error instanceof JoballaApiError ? profileQuery.error.message : t("loadError");
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4 py-10 text-center text-sm text-[var(--joballa-muted)]">
        {message}
      </div>
    );
  }

  const profile = profileQuery.data;
  const documents = documentsQuery.data ?? profile.documents ?? [];
  const avatarUrl = avatarPreviewUrl ?? profile.avatarUrl ?? meQuery.data?.workerProfile?.avatarUrl;
  const avatarInitials = profileInitials(
    fullName.trim() ||
      profileDisplayName(profile) ||
      profile.professionalTitle?.trim() ||
      meQuery.data?.email ||
      "?",
  );
  const latestKyc = profile.kycSubmissions?.[0];
  const latestKycStatus = latestKyc?.status ? String(latestKyc.status).toUpperCase() : null;
  const profileVerified = isVerifiedStatus(getVerificationStatus(profile));
  const kycStatus = latestKycStatus ?? (profileVerified ? "VERIFIED" : "NOT_SUBMITTED");
  const kycLocked = isVerifiedStatus(kycStatus) || latestKycStatus === "PENDING";
  const kycRejection = latestKyc?.rejectionReason ?? latestKyc?.reviewNotes ?? null;
  const skillPills = skillsText
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  function removeSkillPill(skill: string) {
    setSkillsText(skillPills.filter((item) => item !== skill).join(", "));
  }

  function appendDocument(doc: WorkerDocument) {
    qc.setQueryData(workerKeys.documents(), (prev: WorkerDocument[] | undefined) => [...(prev ?? []), doc]);
    qc.setQueryData(workerKeys.profile(), (prev: WorkerFullProfile | undefined) =>
      prev ? { ...prev, documents: [...(prev.documents ?? []), doc] } : prev,
    );
  }

  function removeDocumentFromCache(documentId: string) {
    qc.setQueryData(workerKeys.documents(), (prev: WorkerDocument[] | undefined) =>
      (prev ?? []).filter((d) => d.id !== documentId),
    );
    qc.setQueryData(workerKeys.profile(), (prev: WorkerFullProfile | undefined) =>
      prev
        ? { ...prev, documents: (prev.documents ?? []).filter((d) => d.id !== documentId) }
        : prev,
    );
  }

  function setProfileCache(nextProfile: WorkerFullProfile) {
    qc.setQueryData(workerKeys.profile(), (previous: WorkerFullProfile | undefined) => ({
      ...nextProfile,
      avatarUrl:
        nextProfile.avatarUrl ??
        previous?.avatarUrl ??
        meQuery.data?.workerProfile?.avatarUrl ??
        null,
    }));
  }

  async function refreshProfileCache() {
    const profile = await getWorkerFullProfile();
    setProfileCache(profile);
    void qc.invalidateQueries({ queryKey: workerKeys.documents() });
    return profile;
  }

  async function runSectionSave(section: string, work: () => Promise<void>) {
    setSavingSection(section);
    try {
      await work();
      await Promise.all([
        qc.invalidateQueries({ queryKey: workerKeys.me() }),
        qc.invalidateQueries({ queryKey: workerKeys.dashboard() }),
      ]);
      toastSuccess(t("editor.saved"));
    } catch (err) {
      toastApiError(err, t("editor.saveError"));
    } finally {
      setSavingSection(null);
    }
  }

  async function savePersonal(e: React.SyntheticEvent) {
    e.preventDefault();
    await runSectionSave("personal", async () => {
      const profile = await patchWorkerPersonalInfo({
        fullName: fullName.trim() || undefined,
        city: city.trim() || undefined,
        region: regionLabel(region),
        languages: languages
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        availabilityStatus: available ? "AVAILABLE" : "NOT_AVAILABLE",
      });
      setProfileCache(profile);
      if (avatarFile) {
        const avatarProfile = await postWorkerAvatar(avatarFile);
        setProfileCache(avatarProfile);
        setAvatarFile(null);
      }
      void qc.invalidateQueries({ queryKey: workerKeys.me() });
      setPersonalBaseline({
        fullName,
        city,
        region,
        languages,
        available,
      });
    });
  }

  async function saveSummary(e: React.SyntheticEvent) {
    e.preventDefault();
    await runSectionSave("summary", async () => {
      const profile = await patchWorkerProfessionalSummary({
        title: title.trim() || undefined,
        summary: summary.trim() || undefined,
      });
      setProfileCache(profile);
      setSummaryBaseline({ title, summary });
    });
  }

  async function saveSkills(e: React.SyntheticEvent) {
    e.preventDefault();
    await runSectionSave("skills", async () => {
      const profile = await patchWorkerSkills({
        skills: skillsText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setProfileCache(profile);
      setSkillsBaseline(skillsText);
    });
  }

  function selectPaymentProvider(provider: MomoProviderTab) {
    setPaymentForm((prev) => switchPaymentProvider(prev, provider, activePaymentSlot(prev).phone));
  }

  async function savePayment(e: React.SyntheticEvent) {
    e.preventDefault();
    const slot = activePaymentSlot(paymentForm);
    const phone = slot.phone.trim();
    if (!phone) return;
    const provider = paymentForm.activeProvider;
    const makePrimary = slot.isPrimary;
    await runSectionSave("payment", async () => {
      let nextAccountId = slot.accountId;
      if (slot.accountId) {
        await patchWorkerPaymentAccount(slot.accountId, {
          provider,
          phone,
          isPrimary: makePrimary,
        });
      } else {
        const account = await postWorkerPaymentAccount({
          provider,
          phone,
          isPrimary: makePrimary,
        });
        nextAccountId = account.id;
      }
      if (makePrimary && nextAccountId) {
        const others = (profile.paymentAccounts ?? profile.paymentMethods ?? []).filter((a) => a.id !== nextAccountId);
        await Promise.all(
          others.filter((a) => a.isPrimary).map((a) => patchWorkerPaymentAccount(a.id, { isPrimary: false })),
        );
      }
      const refreshed = await refreshProfileCache();
      const nextForm = paymentMethodsFromProfile(refreshed.paymentAccounts ?? refreshed.paymentMethods ?? []);
      setPaymentForm(nextForm);
      setPaymentBaseline(nextForm);
    });
  }

  function resetWorkForm() {
    setEditingWorkId(null);
    setWorkJobTitle("");
    setWorkCompany("");
    setWorkStart("");
    setWorkEnd("");
    setWorkCurrent(false);
    setWorkDescription("");
  }

  function startEditWorkHistory(workId: string) {
    const entry = profile.workHistories?.find((w) => w.id === workId);
    if (!entry) return;
    setEditingWorkId(workId);
    setWorkJobTitle(entry.jobTitle ?? "");
    setWorkCompany(entry.companyName ?? "");
    setWorkStart(toIsoDateOnly(entry.startDate) ?? "");
    setWorkEnd(entry.isCurrent ? "" : toIsoDateOnly(entry.endDate) ?? "");
    setWorkCurrent(!!entry.isCurrent);
    setWorkDescription(entry.description ?? "");
  }

  async function saveWorkHistory(e: React.FormEvent) {
    e.preventDefault();
    const startDate = toIsoDateOnly(workStart);
    const endDate = workCurrent ? undefined : toIsoDateOnly(workEnd);
    if (!workJobTitle.trim() || !workCompany.trim() || !startDate) return;
    if (!workCurrent && !endDate) {
      toastApiError(new Error("End date required"), "Add an end date or mark this as your current role.");
      return;
    }
    await runSectionSave("work", async () => {
      const payload = sanitizeWorkHistoryForPut({
        id: editingWorkId ?? "",
        jobTitle: workJobTitle.trim(),
        companyName: workCompany.trim(),
        startDate,
        endDate: workCurrent ? null : endDate ?? null,
        isCurrent: workCurrent,
        description: workDescription.trim() || undefined,
      });
      if (editingWorkId) {
        await patchWorkerWorkHistory(editingWorkId, payload as Parameters<typeof patchWorkerWorkHistory>[1]);
      } else {
        await postWorkerWorkHistory(payload as Parameters<typeof postWorkerWorkHistory>[0]);
      }
      await refreshProfileCache();
      resetWorkForm();
    });
  }

  function resetEducationForm() {
    setEditingEducationId(null);
    setEducationInstitution("");
    setEducationDegree("");
    setEducationStart("");
    setEducationEnd("");
    setEducationCurrent(false);
  }

  function startEditEducation(educationId: string) {
    const entry = profile.educations?.find((e) => e.id === educationId);
    if (!entry) return;
    setEditingEducationId(educationId);
    setEducationInstitution(entry.institution ?? "");
    setEducationDegree(entry.degree ?? "");
    setEducationStart(toIsoDateOnly(entry.startDate) ?? "");
    setEducationEnd(entry.isCurrent ? "" : toIsoDateOnly(entry.endDate) ?? "");
    setEducationCurrent(!!entry.isCurrent);
  }

  async function saveEducation(e: React.FormEvent) {
    e.preventDefault();
    const startDate = toIsoDateOnly(educationStart);
    const endDate = educationCurrent ? undefined : toIsoDateOnly(educationEnd);
    if (!educationInstitution.trim() || !educationDegree.trim() || !startDate) return;
    if (!educationCurrent && !endDate) {
      toastApiError(new Error("End date required"), "Add an end date or mark education as in progress.");
      return;
    }
    await runSectionSave("education", async () => {
      const payload = sanitizeEducationForPut({
        id: editingEducationId ?? "",
        institution: educationInstitution.trim(),
        degree: educationDegree.trim(),
        startDate,
        endDate: educationCurrent ? null : endDate ?? null,
        isCurrent: educationCurrent,
      });
      if (editingEducationId) {
        await patchWorkerEducation(editingEducationId, payload as Parameters<typeof patchWorkerEducation>[1]);
      } else {
        await postWorkerEducation(payload as Parameters<typeof postWorkerEducation>[0]);
      }
      await refreshProfileCache();
      resetEducationForm();
    });
  }

  async function removeWorkHistory(workId: string) {
    if (/^work-\d+$/.test(workId)) return;
    await runSectionSave("work", async () => {
      await deleteWorkerWorkHistory(workId);
      await refreshProfileCache();
    });
  }

  async function removeEducation(educationId: string) {
    if (/^education-\d+$/.test(educationId)) return;
    await runSectionSave("education", async () => {
      await deleteWorkerEducation(educationId);
      await refreshProfileCache();
    });
  }

  function resetCertForm() {
    setEditingCertId(null);
    setCertName("");
    setCertIssuer("");
    setCertIssueDate("");
    setCertCredentialUrl("");
  }

  function startEditCertification(certId: string) {
    const entry = profile.certifications?.find((c) => c.id === certId);
    if (!entry) return;
    setEditingCertId(certId);
    setCertName(entry.name ?? "");
    setCertIssuer(entry.issuer ?? "");
    setCertIssueDate(toIsoDateOnly(entry.issueDate) ?? "");
    setCertCredentialUrl(entry.credentialUrl ?? "");
  }

  function validateCredentialUrl(url: string): string | null {
    const trimmed = url.trim();
    if (!trimmed) return null;
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== "https:") return "Credential URL must use HTTPS.";
      return null;
    } catch {
      return "Enter a valid credential URL.";
    }
  }

  async function saveCertification(e: React.FormEvent) {
    e.preventDefault();
    if (!certName.trim()) return;
    const urlError = validateCredentialUrl(certCredentialUrl);
    if (urlError) {
      toastApiError(new Error(urlError), urlError);
      return;
    }
    await runSectionSave("certifications", async () => {
      const body = {
        name: certName.trim(),
        issuer: certIssuer.trim() || undefined,
        issueDate: toIsoDateOnly(certIssueDate),
        credentialUrl: certCredentialUrl.trim() || undefined,
      };
      if (editingCertId) {
        await patchWorkerCertification(editingCertId, body);
      } else {
        await postWorkerCertification(body);
      }
      await refreshProfileCache();
      resetCertForm();
    });
  }

  async function removeCertification(certId: string) {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(certId)) return;
    await runSectionSave("certifications", async () => {
      await deleteWorkerCertification(certId);
      await refreshProfileCache();
    });
  }

  function documentUrl(doc: { url?: string; fileUrl?: string; [key: string]: unknown }) {
    return doc.url ?? doc.fileUrl ?? "";
  }

  async function uploadKycFile(file: File) {
    const doc = await uploadVerificationDoc(file);
    const url = doc.url ?? doc.secureUrl ?? "";
    if (!url) throw new Error("Document upload did not return a file URL.");
    return url;
  }

  function queueSupportingDocument(file: File, kind: "CV" | "OTHER") {
    setPendingSupportingDoc({ file, kind });
  }

  async function uploadSupportingDocument(file: File, type: "CV" | "OTHER" = "OTHER") {
    setSavingSection("documents");
    try {
      if (type === "CV") {
        const res = await postWorkerCv(file);
        appendDocument({
          id: `cv-${Date.now()}`,
          type: "CV",
          fileName: file.name,
          url: res.cvUrl,
          createdAt: new Date().toISOString(),
        });
      } else {
        const doc = await postWorkerDocument(file, type);
        appendDocument(doc);
      }
      await refreshProfileCache();
      void qc.invalidateQueries({ queryKey: workerKeys.me() });
      toastSuccess(t("editor.documentUploaded"));
      setPendingSupportingDoc(null);
    } catch (err) {
      toastApiError(err, t("editor.documentUploadError"));
    } finally {
      setSavingSection(null);
    }
  }

  async function savePendingSupportingDocument() {
    if (!pendingSupportingDoc) return;
    await uploadSupportingDocument(pendingSupportingDoc.file, pendingSupportingDoc.kind);
  }

  async function removeSupportingDocument(documentId: string) {
    await runSectionSave("documents", async () => {
      await deleteWorkerDocument(documentId);
      removeDocumentFromCache(documentId);
    });
  }

  async function submitKyc(e: React.FormEvent) {
    e.preventDefault();
    if (!kycFrontFile || !kycSelfieFile || (kycDocumentType !== "PASSPORT" && !kycBackFile)) return;
    await runSectionSave("verification", async () => {
      const [frontIdImageUrl, backIdImageUrl, selfieImageUrl] = await Promise.all([
        uploadKycFile(kycFrontFile),
        kycBackFile ? uploadKycFile(kycBackFile) : Promise.resolve(undefined),
        uploadKycFile(kycSelfieFile),
      ]);
      await postWorkerKyc({
        documentType: kycDocumentType,
        frontIdImageUrl,
        backIdImageUrl,
        selfieImageUrl,
      });
      void qc.invalidateQueries({ queryKey: workerKeys.kyc() });
      await refreshProfileCache();
      setKycFrontFile(null);
      setKycBackFile(null);
      setKycSelfieFile(null);
    });
  }

  return (
    <>
    <div className="-mx-4 -mb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] -mt-3 min-h-[calc(100dvh-3.5rem)] bg-[var(--joballa-page-tint)] px-4 py-6 min-[600px]:-mx-6 min-[600px]:-mb-5 min-[600px]:-mt-4 min-[600px]:px-6 md:-mx-8 md:-mb-6 md:px-8 lg:-mx-10 lg:px-10">
      <div className="mx-auto mb-5 flex w-full max-w-[76rem] justify-center">
        <button
          type="button"
          onClick={() => {
            setPendingDocKind("CV");
            docInputRef.current?.click();
          }}
          className="inline-flex min-h-10 max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full bg-[#e6fff5] px-4 py-2 text-center text-xs font-medium leading-5 text-[var(--joballa-primary)] sm:px-5"
        >
          <span className="text-[var(--joballa-fg)]">To build your profile faster, upload your CV or resume.</span>
          <span className="font-semibold underline underline-offset-2">Upload CV</span>
        </button>
      </div>
      <div className="mx-auto grid w-full max-w-[76rem] gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start xl:grid-cols-[25rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-20">
          <Card className="p-5">
            <h2 className="text-base font-semibold">{t("strength.title")}</h2>
            <div className="mt-4 h-2 rounded-full bg-[#cfe6e4]">
              <div className="h-full rounded-full bg-[var(--joballa-primary)]" style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
            <p className="mt-3 text-sm font-medium text-[var(--joballa-primary)]">{t("strength.percent", { pct })}</p>
            <ul className="mt-5 space-y-4">
              {SECTION_KEYS.map((key) => {
                const done = completion?.[key] ?? false;
                return (
                  <li key={key} className={cn("flex items-center gap-3 text-sm", done ? "text-[var(--joballa-primary)]" : "text-[var(--joballa-muted)]")}>
                    <span className={cn("flex size-5 items-center justify-center rounded-full border text-[10px]", done ? "border-[var(--joballa-primary)]" : "border-[var(--joballa-border-strong)]")}>
                      {done ? "✓" : null}
                    </span>
                    {t(`strength.sections.${key}`)}
                  </li>
                );
              })}
            </ul>
          </Card>
        </aside>

        <div className="space-y-6">
          <Card>
              <p className="text-xs font-semibold uppercase text-[var(--joballa-label-fg)]">{t("strength.sections.personal")}</p>
              <div className="mt-6 grid gap-5 sm:grid-cols-[8rem_1fr]">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative size-24 overflow-hidden rounded-full bg-[#d9dde1]">
                    {avatarPreviewUrl ? (
                      <img src={avatarPreviewUrl} alt="" className="size-full object-cover" />
                    ) : avatarUrl ? (
                      <Image src={avatarUrl} alt="" fill className="object-cover" sizes="96px" unoptimized />
                    ) : (
                      <div className="flex size-full items-center justify-center text-xl font-bold text-[#737373]">
                        {avatarInitials}
                      </div>
                    )}
                  </div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const allowed = ["image/jpeg", "image/png"];
                      if (!allowed.includes(f.type)) {
                        toast.error(t("editor.avatarFormatError"));
                        e.target.value = "";
                        return;
                      }
                      setAvatarFile(f);
                    }}
                  />
                  <button
                    type="button"
                    className="text-xs font-semibold text-[var(--joballa-primary)]"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    {t("editor.replacePhoto")}
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t("editor.fullName")} value={fullName} onChange={setFullName} wide limitKey="fullName" />
                  <SelectField
                    label={t("editor.region")}
                    value={region}
                    onChange={(value) => {
                      const nextRegion = normalizeRegion(value);
                      setRegion(nextRegion);
                      setCity(getCitiesForRegion(nextRegion)[0] ?? "");
                    }}
                    options={regionOptions}
                  />
                  <SelectField label={t("editor.city")} value={city} onChange={setCity} options={cityOptions} />
                  <Field label={t("editor.languages")} value={languages} onChange={setLanguages} wide limitKey="languages" />
                  <button
                    type="button"
                    onClick={() => setAvailable((x) => !x)}
                    className="flex items-center gap-3 text-sm text-[var(--joballa-primary)] sm:col-span-2"
                  >
                    <Toggle enabled={available} />
                    {t("editor.available")}
                  </button>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  disabled={savingSection === "personal" || !personalDirty}
                  onClick={(e) => void savePersonal(e)}
                  className="h-10 rounded-[12px] bg-[var(--joballa-primary)] px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sectionSaveLabel("personal", personalDirty)}
                </button>
              </div>
          </Card>

          <Card>
              <p className="text-xs font-semibold uppercase text-[var(--joballa-label-fg)]">{t("strength.sections.summary")}</p>
              <div className="mt-5 grid gap-5">
                <Field label={t("editor.yourTitle")} value={title} onChange={setTitle} wide limitKey="professionalTitle" />
                <Field label={t("editor.shortBio")} value={summary} onChange={setSummary} as="textarea" wide limitKey="bio" />
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  disabled={savingSection === "summary" || !summaryDirty}
                  onClick={(e) => void saveSummary(e)}
                  className="h-10 rounded-[12px] bg-[var(--joballa-primary)] px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sectionSaveLabel("summary", summaryDirty)}
                </button>
              </div>
          </Card>

          <Card>
              <p className="text-xs font-semibold uppercase text-[var(--joballa-label-fg)]">{t("strength.sections.skills")}</p>
              <Field label={t("editor.skillsHint")} value={skillsText} onChange={setSkillsText} wide limitKey="skillsList" />
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
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  disabled={savingSection === "skills" || !skillsDirty}
                  onClick={(e) => void saveSkills(e)}
                  className="h-10 rounded-[12px] bg-[var(--joballa-primary)] px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sectionSaveLabel("skills", skillsDirty)}
                </button>
              </div>
          </Card>

          <Card>
            <p className="text-xs font-semibold uppercase text-[var(--joballa-label-fg)]">{t("strength.sections.education")}</p>
            <div className="mt-5">
              {sortedEducations(profile).map((education) => (
                <ProfileRecordCard
                  key={education.id}
                  title={education.degree ?? education.institution ?? ""}
                  subtitle={education.institution}
                  meta={[toIsoDateOnly(education.startDate), education.isCurrent ? "Present" : toIsoDateOnly(education.endDate)].filter(Boolean).join(" – ")}
                  editLabel={t("editor.edit")}
                  removeLabel={t("editor.delete")}
                  onEdit={() => startEditEducation(education.id)}
                  onRemove={() =>
                    requestConfirm({
                      title: t("editor.confirmRemoveEducation"),
                      description: t("editor.confirmRemoveEducationDesc"),
                      confirmLabel: t("editor.delete"),
                      cancelLabel: tc("cancel"),
                      destructive: true,
                      onConfirm: () => void removeEducation(education.id),
                    })
                  }
                />
              ))}
            </div>
            <form onSubmit={saveEducation} className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label={t("editor.institution")} value={educationInstitution} onChange={setEducationInstitution} limitKey="institution" />
              <Field label={t("editor.degree")} value={educationDegree} onChange={setEducationDegree} limitKey="degree" />
              <Field label={t("editor.startDate")} value={educationStart} onChange={setEducationStart} type="date" />
              <Field label={t("editor.endDate")} value={educationEnd} onChange={setEducationEnd} type="date" disabled={educationCurrent} />
              <label className="flex items-center gap-2 text-sm text-[var(--joballa-fg)] sm:col-span-2">
                <input
                  type="checkbox"
                  checked={educationCurrent}
                  onChange={(e) => {
                    setEducationCurrent(e.target.checked);
                    if (e.target.checked) setEducationEnd("");
                  }}
                  className="size-4 shrink-0 rounded border-[var(--joballa-border)] accent-[var(--joballa-primary)]"
                />
                {t("editor.currentStudy")}
              </label>
              <div className="flex flex-wrap justify-end gap-2 sm:col-span-2">
                {editingEducationId ? (
                  <button type="button" onClick={resetEducationForm} className="h-10 rounded-[12px] px-4 text-sm font-medium text-[var(--joballa-muted)]">
                    {t("editor.cancelEdit")}
                  </button>
                ) : null}
                <button type="submit" disabled={savingSection === "education"} className="h-10 w-full rounded-[12px] bg-[var(--joballa-primary)] px-4 text-sm font-medium text-white disabled:opacity-50 min-[480px]:w-auto">
                  {editingEducationId ? t("editor.editEducation") : t("editor.addEducation")}
                </button>
              </div>
            </form>
          </Card>

          <Card>
            <p className="text-xs font-semibold uppercase text-[var(--joballa-label-fg)]">{t("editor.certificationsTitle")}</p>
            <div className="mt-5">
              {sortedCertifications(profile).map((cert) => (
                <ProfileRecordCard
                  key={cert.id}
                  title={cert.name ?? ""}
                  subtitle={cert.issuer}
                  meta={cert.issueDate ? toIsoDateOnly(cert.issueDate) : undefined}
                  editLabel={t("editor.edit")}
                  removeLabel={t("editor.delete")}
                  onEdit={() => startEditCertification(cert.id)}
                  onRemove={() =>
                    requestConfirm({
                      title: t("editor.confirmRemoveCertification"),
                      description: t("editor.confirmRemoveCertificationDesc"),
                      confirmLabel: t("editor.delete"),
                      cancelLabel: tc("cancel"),
                      destructive: true,
                      onConfirm: () => void removeCertification(cert.id),
                    })
                  }
                />
              ))}
            </div>
            <form onSubmit={saveCertification} className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label={t("editor.certificationName")} value={certName} onChange={setCertName} wide limitKey="certificationName" />
              <Field label={t("editor.certificationIssuer")} value={certIssuer} onChange={setCertIssuer} limitKey="issuer" />
              <Field label={t("editor.issueDate")} value={certIssueDate} onChange={setCertIssueDate} type="date" />
              <Field label={t("editor.credentialUrl")} value={certCredentialUrl} onChange={setCertCredentialUrl} wide placeholder="https://" />
              <div className="flex flex-wrap justify-end gap-2 sm:col-span-2">
                {editingCertId ? (
                  <button type="button" onClick={resetCertForm} className="h-10 rounded-[12px] px-4 text-sm font-medium text-[var(--joballa-muted)]">
                    {t("editor.cancelEdit")}
                  </button>
                ) : null}
                <button
                  type="submit"
                  disabled={savingSection === "certifications"}
                  className="h-10 w-full rounded-[12px] bg-[var(--joballa-primary)] px-4 text-sm font-medium text-white disabled:opacity-50 min-[480px]:w-auto"
                >
                  {editingCertId ? t("editor.editCertification") : t("editor.addCertification")}
                </button>
              </div>
            </form>
          </Card>

          <Card>
            <p className="text-xs font-semibold uppercase text-[var(--joballa-label-fg)]">{t("strength.sections.work")}</p>
            <div className="mt-5">
              {sortedWorkHistories(profile).map((w) => (
                <ProfileRecordCard
                  key={w.id}
                  title={w.jobTitle ?? ""}
                  subtitle={w.companyName}
                  meta={[toIsoDateOnly(w.startDate), w.isCurrent ? "Present" : toIsoDateOnly(w.endDate)].filter(Boolean).join(" – ")}
                  badge={w.isCurrent ? t("editor.currentRoleBadge") : undefined}
                  editLabel={t("editor.edit")}
                  removeLabel={t("editor.delete")}
                  onEdit={() => startEditWorkHistory(w.id)}
                  onRemove={() =>
                    requestConfirm({
                      title: t("editor.confirmRemoveWork"),
                      description: t("editor.confirmRemoveWorkDesc"),
                      confirmLabel: t("editor.delete"),
                      cancelLabel: tc("cancel"),
                      destructive: true,
                      onConfirm: () => void removeWorkHistory(w.id),
                    })
                  }
                />
              ))}
            </div>
            <form onSubmit={saveWorkHistory} className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label={t("editor.jobTitle")} value={workJobTitle} onChange={setWorkJobTitle} limitKey="jobTitle" />
              <Field label={t("editor.company")} value={workCompany} onChange={setWorkCompany} limitKey="companyName" />
              <Field label={t("editor.startDate")} value={workStart} onChange={setWorkStart} type="date" />
              <Field label={t("editor.endDate")} value={workEnd} onChange={setWorkEnd} type="date" disabled={workCurrent} />
              <label className="flex items-center gap-2 text-sm text-[var(--joballa-fg)] sm:col-span-2">
                <input
                  type="checkbox"
                  checked={workCurrent}
                  onChange={(e) => {
                    setWorkCurrent(e.target.checked);
                    if (e.target.checked) setWorkEnd("");
                  }}
                  className="size-4 shrink-0 rounded border-[var(--joballa-border)] accent-[var(--joballa-primary)]"
                />
                {t("editor.currentRole")}
              </label>
              <Field label={t("editor.description")} value={workDescription} onChange={setWorkDescription} as="textarea" wide limitKey="description" />
              <div className="flex flex-wrap justify-end gap-2 sm:col-span-2">
                {editingWorkId ? (
                  <button type="button" onClick={resetWorkForm} className="h-10 rounded-[12px] px-4 text-sm font-medium text-[var(--joballa-muted)]">
                    {t("editor.cancelEdit")}
                  </button>
                ) : null}
                <button type="submit" disabled={savingSection === "work"} className="h-10 w-full rounded-[12px] bg-[var(--joballa-primary)] px-4 text-sm font-medium text-white disabled:opacity-50 min-[480px]:w-auto">
                  {editingWorkId ? t("editor.editWorkExperience") : t("editor.addExperience")}
                </button>
              </div>
            </form>
          </Card>

          <Card className="scroll-mt-24">
            <p className="text-xs font-semibold uppercase text-[var(--joballa-label-fg)]">{t("strength.sections.verification")}</p>
            <div ref={verificationRef} />
            <div className="mt-3 rounded-[12px] border border-[var(--joballa-border)] bg-[var(--joballa-page-tint)] p-4">
              <p className="text-sm font-semibold text-[var(--joballa-fg)]">{t("editor.kycStatus", { status: verificationStatusLabel(kycStatus) })}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--joballa-muted)]">
                {isVerifiedStatus(kycStatus)
                  ? t("editor.kycVerified")
                  : kycStatus === "PENDING"
                    ? t("editor.kycPending")
                    : isRejectedStatus(kycStatus)
                      ? [t("editor.kycRejected"), kycRejection ? t("editor.kycReason", { reason: kycRejection }) : ""].filter(Boolean).join(" ")
                      : t("editor.kycNone")}
              </p>
            </div>
            {!kycLocked ? (
              <form onSubmit={submitKyc} className="mt-5 space-y-4">
                <label className="block max-w-xs text-[11px] font-medium text-[var(--joballa-muted)]">
                  {t("editor.documentType")}
                  <select
                    value={kycDocumentType}
                    onChange={(e) => {
                      setKycDocumentType(e.target.value as "NATIONAL_ID" | "PASSPORT" | "DRIVERS_LICENSE");
                      setKycBackFile(null);
                    }}
                    className="mt-1 h-10 w-full max-w-xs rounded-[10px] border border-[var(--joballa-border)] bg-[var(--joballa-input-bg)] px-3 text-sm text-[var(--joballa-fg)] outline-none focus:border-[var(--joballa-primary)] focus:ring-2 focus:ring-[var(--joballa-primary)]"
                  >
                    <option value="NATIONAL_ID">{t("editor.nationalId")}</option>
                    <option value="PASSPORT">{t("editor.passport")}</option>
                    <option value="DRIVERS_LICENSE">{t("editor.driversLicense")}</option>
                  </select>
                </label>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <KycUploadField
                    label={kycDocumentType === "PASSPORT" ? t("editor.passportDocument") : t("editor.idFront")}
                    file={kycFrontFile}
                    onFileChange={setKycFrontFile}
                    accept="image/*,.pdf"
                    capture="environment"
                  />
                  {kycDocumentType !== "PASSPORT" ? (
                    <KycUploadField
                      label={t("editor.idBack")}
                      file={kycBackFile}
                      onFileChange={setKycBackFile}
                      accept="image/*,.pdf"
                      capture="environment"
                    />
                  ) : null}
                  <KycUploadField
                    label={t("editor.selfie")}
                    file={kycSelfieFile}
                    onFileChange={setKycSelfieFile}
                    accept="image/*"
                    capture="user"
                  />
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={savingSection === "verification"} className="h-10 rounded-[12px] bg-[var(--joballa-primary)] px-4 text-sm font-medium text-white disabled:opacity-50">
                    {savingSection === "verification" ? t("editor.saving") : t("editor.submitKyc")}
                  </button>
                </div>
              </form>
            ) : null}
            <input
              ref={docInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) queueSupportingDocument(f, pendingDocKind);
              }}
            />
            <div className="mt-6 border-t border-[var(--joballa-border)] pt-5">
              <p className="text-xs font-semibold uppercase text-[var(--joballa-label-fg)]">Supporting documents</p>
              <p className="mt-1 text-xs text-[var(--joballa-muted)]">Add certificates, portfolio files, and other documents.</p>
            </div>
            <div className="mt-4 space-y-3">
              {documents.map((doc) => {
                const url = documentUrl(doc);
                const label = doc.fileName ?? doc.id;
                return (
                  <div key={doc.id} className="flex flex-col items-start justify-between gap-3 rounded-[12px] border border-[var(--joballa-border)] p-3 min-[480px]:flex-row min-[480px]:items-center">
                    {url ? (
                      <a href={url} target="_blank" rel="noopener noreferrer" className="truncate text-sm font-semibold text-[var(--joballa-primary)] hover:underline">
                        {label}
                      </a>
                    ) : (
                      <p className="truncate text-sm font-semibold">{label}</p>
                    )}
                    <button
                      type="button"
                      className="text-xs font-semibold text-[var(--joballa-danger-fg)]"
                      onClick={() =>
                        requestConfirm({
                          title: t("editor.confirmRemoveDocument"),
                          description: t("editor.confirmRemoveDocumentDesc"),
                          confirmLabel: t("editor.delete"),
                          cancelLabel: tc("cancel"),
                          destructive: true,
                          onConfirm: () => void removeSupportingDocument(doc.id),
                        })
                      }
                    >
                      {t("editor.delete")}
                    </button>
                  </div>
                );
              })}
            </div>
            {pendingSupportingDoc ? (
              <SupportingDocumentPicker
                className="mt-4"
                file={pendingSupportingDoc.file}
                saving={savingSection === "documents"}
                saveLabel={t("editor.saveDocument")}
                savingLabel={t("editor.savingDocument")}
                cancelLabel={t("editor.cancelDocument")}
                onSave={() => void savePendingSupportingDocument()}
                onCancel={() => setPendingSupportingDoc(null)}
              />
            ) : (
              <button
                type="button"
                className="mt-4 rounded-[10px] border border-[var(--joballa-border)] px-4 py-2 text-sm"
                onClick={() => {
                  setPendingDocKind("OTHER");
                  docInputRef.current?.click();
                }}
              >
                {t("editor.uploadDocument")}
              </button>
            )}
          </Card>

          <Card>
              <p className="text-xs font-semibold uppercase text-[var(--joballa-label-fg)]">{t("strength.sections.payment")}</p>
              <p className="mt-1 text-xs text-[var(--joballa-muted)]">{t("editor.paymentHint")}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[12px] border border-[var(--joballa-border)] bg-[var(--joballa-page-tint)] p-3">
                  <p className="text-xs font-semibold text-[var(--joballa-muted)]">MTN MoMo</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--joballa-fg)]">
                    {paymentForm.mtn.phone.trim() || "—"}
                  </p>
                  {paymentForm.mtn.isPrimary ? (
                    <p className="mt-1 text-xs text-[var(--joballa-primary)]">{t("editor.primaryAccount")}</p>
                  ) : null}
                </div>
                <div className="rounded-[12px] border border-[var(--joballa-border)] bg-[var(--joballa-page-tint)] p-3">
                  <p className="text-xs font-semibold text-[var(--joballa-muted)]">Orange Money</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--joballa-fg)]">
                    {paymentForm.orange.phone.trim() || "—"}
                  </p>
                  {paymentForm.orange.isPrimary ? (
                    <p className="mt-1 text-xs text-[var(--joballa-primary)]">{t("editor.primaryAccount")}</p>
                  ) : null}
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={cn(
                    "rounded-[10px] px-4 py-2 text-sm",
                    paymentForm.activeProvider === "MTN_MOMO"
                      ? "bg-[#ecfff8] text-[var(--joballa-primary)] ring-1 ring-[#92dfc8]"
                      : "bg-[var(--joballa-tag-bg)]",
                  )}
                  onClick={() => selectPaymentProvider("MTN_MOMO")}
                >
                  MTN MoMo
                </button>
                <button
                  type="button"
                  className={cn(
                    "rounded-[10px] px-4 py-2 text-sm",
                    paymentForm.activeProvider === "ORANGE_MONEY"
                      ? "bg-[#ecfff8] text-[var(--joballa-primary)] ring-1 ring-[#92dfc8]"
                      : "bg-[var(--joballa-tag-bg)]",
                  )}
                  onClick={() => selectPaymentProvider("ORANGE_MONEY")}
                >
                  Orange Money
                </button>
              </div>
              <div className="mt-4">
                <Field
                  label={t("editor.phone")}
                  value={activePayment.phone}
                  onChange={(phone) => setPaymentForm((prev) => updateActivePaymentSlot(prev, { phone }))}
                  wide
                  limitKey="phone"
                />
              </div>
              <label className="mt-3 flex items-center gap-2 text-sm text-[var(--joballa-muted)]">
                <input
                  type="checkbox"
                  className="size-4 shrink-0 rounded border-[var(--joballa-border)] accent-[var(--joballa-primary)]"
                  checked={activePayment.isPrimary}
                  onChange={(e) =>
                    setPaymentForm((prev) => updateActivePaymentSlot(prev, { isPrimary: e.target.checked }))
                  }
                />
                {t("editor.primaryAccount")}
              </label>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  disabled={savingSection === "payment" || !paymentDirty}
                  onClick={(e) => void savePayment(e)}
                  className="h-10 rounded-[12px] bg-[var(--joballa-primary)] px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sectionSaveLabel("payment", paymentDirty)}
                </button>
              </div>
          </Card>
        </div>
      </div>
    </div>
      <ConfirmDialog {...dialogProps} />
    </>
  );
}
