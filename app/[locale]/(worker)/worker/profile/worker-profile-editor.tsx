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
  deleteWorkerWorkHistory,
  deleteWorkerEducation,
  deleteWorkerCertification,
  postWorkerCertification,
  deleteWorkerDocument,
  uploadVerificationDoc,
} from "@/features/worker/api";
import { toastApiError, toastSuccess } from "@/features/employer/lib/mutation-feedback";
import {
  useWorkerDocuments,
  useWorkerFullProfile,
  useWorkerMe,
} from "@/features/worker/hooks";
import { workerKeys } from "@/features/worker/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { profileSectionCompletion } from "@/features/worker/lib/profile-display";
import {
  sanitizeEducationForPut,
  sanitizeWorkHistoryForPut,
  toIsoDateOnly,
} from "@/features/worker/lib/profile-payload";
import { getVerificationStatus, isRejectedStatus, isVerifiedStatus, verificationStatusLabel } from "@/features/worker/lib/verification";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { WorkerProfilePageSkeleton } from "@/components/worker/worker-loading-skeletons";
import { useConfirmAction } from "@/lib/hooks/use-confirm-action";
import {
  CAMEROON_REGION_IDS,
  DEFAULT_CAMEROON_REGION,
  getCitiesForRegion,
  type CameroonRegionId,
} from "@/lib/cameroon-region-cities";
import { JoballaApiError } from "@/lib/joballa/request";
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  wide?: boolean;
  as?: "input" | "textarea";
  type?: "text" | "date";
  disabled?: boolean;
}) {
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
          className="mt-1 w-full resize-none rounded-[10px] border border-[var(--joballa-border)] bg-[var(--joballa-input-bg)] px-3 py-2 text-sm text-[var(--joballa-fg)] outline-none ring-[var(--joballa-primary)] placeholder:text-[var(--joballa-muted)] focus:border-[var(--joballa-primary)] focus:ring-2 disabled:opacity-50"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
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

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState<CameroonRegionId>(DEFAULT_CAMEROON_REGION);
  const [languages, setLanguages] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [available, setAvailable] = useState(true);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [momoProvider, setMomoProvider] = useState<"MTN_MOMO" | "ORANGE_MONEY">("MTN_MOMO");
  const [momoNumber, setMomoNumber] = useState("");
  const [paymentAccountId, setPaymentAccountId] = useState<string | null>(null);
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
  const [kycDocumentType, setKycDocumentType] = useState<"NATIONAL_ID" | "PASSPORT" | "DRIVERS_LICENSE">("NATIONAL_ID");
  const [kycFrontFile, setKycFrontFile] = useState<File | null>(null);
  const [kycBackFile, setKycBackFile] = useState<File | null>(null);
  const [kycSelfieFile, setKycSelfieFile] = useState<File | null>(null);

  useEffect(() => {
    const p = profileQuery.data;
    if (!p || hydratedRef.current) return;
    hydratedRef.current = true;
    setFirstName(p.firstName ?? "");
    setLastName(p.lastName ?? "");
    const nextRegion = normalizeRegion(p.region);
    setRegion(nextRegion);
    const regionCities = getCitiesForRegion(nextRegion);
    setCity(p.city && regionCities.includes(p.city) ? p.city : (regionCities[0] ?? ""));
    setLanguages((p.languages ?? []).join(", "));
    setAvailable(String(p.availabilityStatus ?? "AVAILABLE") === "AVAILABLE");
    setTitle(p.professionalTitle ?? "");
    setSummary(p.summary ?? "");
    setSkillsText((p.skills ?? []).join(", "));
    setMomoProvider((p.mobileMoneyProvider as "MTN_MOMO" | "ORANGE_MONEY") ?? "MTN_MOMO");
    setMomoNumber(p.mobileMoneyNumber ?? "");
    const primary =
      p.paymentAccounts?.find((a) => a.isPrimary) ?? p.paymentAccounts?.[0] ?? null;
    setPaymentAccountId(primary?.id ?? null);
    if (primary?.phone) setMomoNumber(primary.phone);
    if (primary?.provider) {
      const prov = String(primary.provider).toLowerCase();
      setMomoProvider(prov.includes("orange") ? "ORANGE_MONEY" : "MTN_MOMO");
    }
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
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
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
    });
  }

  async function savePayment(e: React.SyntheticEvent) {
    e.preventDefault();
    const phone = momoNumber.trim();
    if (!phone) return;
    await runSectionSave("payment", async () => {
      if (paymentAccountId) {
        await patchWorkerPaymentAccount(paymentAccountId, {
          provider: momoProvider,
          phone,
          isPrimary: true,
        });
      } else {
        const account = await postWorkerPaymentAccount({
          provider: momoProvider,
          phone,
          isPrimary: true,
        });
        setPaymentAccountId(account.id);
      }
      const profile = await refreshProfileCache();
      setMomoNumber(profile.mobileMoneyNumber ?? phone);
    });
  }

  async function addWorkHistory(e: React.FormEvent) {
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
        id: "",
        jobTitle: workJobTitle.trim(),
        companyName: workCompany.trim(),
        startDate,
        endDate: workCurrent ? null : endDate ?? null,
        isCurrent: workCurrent,
        description: workDescription.trim() || undefined,
      });
      await postWorkerWorkHistory(payload as Parameters<typeof postWorkerWorkHistory>[0]);
      await refreshProfileCache();
      setWorkJobTitle("");
      setWorkCompany("");
      setWorkStart("");
      setWorkEnd("");
      setWorkCurrent(false);
      setWorkDescription("");
    });
  }

  async function addEducation(e: React.FormEvent) {
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
        id: "",
        institution: educationInstitution.trim(),
        degree: educationDegree.trim(),
        startDate,
        endDate: educationCurrent ? null : endDate ?? null,
        isCurrent: educationCurrent,
      });
      await postWorkerEducation(payload as Parameters<typeof postWorkerEducation>[0]);
      await refreshProfileCache();
      setEducationInstitution("");
      setEducationDegree("");
      setEducationStart("");
      setEducationEnd("");
      setEducationCurrent(false);
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

  async function addCertification(e: React.FormEvent) {
    e.preventDefault();
    if (!certName.trim()) return;
    await runSectionSave("certifications", async () => {
      await postWorkerCertification({
        name: certName.trim(),
        issuer: certIssuer.trim() || undefined,
        issueDate: toIsoDateOnly(certIssueDate),
      });
      await refreshProfileCache();
      setCertName("");
      setCertIssuer("");
      setCertIssueDate("");
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
      toastSuccess(t("editor.documentUploaded"));
    } catch (err) {
      toastApiError(err, t("editor.documentUploadError"));
    } finally {
      setSavingSection(null);
    }
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
          onClick={() => docInputRef.current?.click()}
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
                        {(firstName || "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setAvatarFile(f);
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
                  <Field label={t("editor.firstName")} value={firstName} onChange={setFirstName} />
                  <Field label={t("editor.lastName")} value={lastName} onChange={setLastName} />
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
                  <Field label={t("editor.languages")} value={languages} onChange={setLanguages} wide />
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
                <button type="button" disabled={savingSection === "personal"} onClick={(e) => void savePersonal(e)} className="h-10 rounded-[12px] bg-[var(--joballa-primary)] px-4 text-sm font-medium text-white disabled:opacity-50">
                  {savingSection === "personal" ? t("editor.saving") : t("editor.save")}
                </button>
              </div>
          </Card>

          <Card>
              <p className="text-xs font-semibold uppercase text-[var(--joballa-label-fg)]">{t("strength.sections.summary")}</p>
              <div className="mt-5 grid gap-5">
                <Field label={t("editor.yourTitle")} value={title} onChange={setTitle} wide />
                <Field label={t("editor.shortBio")} value={summary} onChange={setSummary} as="textarea" wide />
              </div>
              <div className="mt-6 flex justify-end">
                <button type="button" disabled={savingSection === "summary"} onClick={(e) => void saveSummary(e)} className="h-10 rounded-[12px] bg-[var(--joballa-primary)] px-4 text-sm font-medium text-white disabled:opacity-50">
                  {savingSection === "summary" ? t("editor.saving") : t("editor.save")}
                </button>
              </div>
          </Card>

          <Card>
              <p className="text-xs font-semibold uppercase text-[var(--joballa-label-fg)]">{t("strength.sections.skills")}</p>
              <Field label={t("editor.skillsHint")} value={skillsText} onChange={setSkillsText} wide />
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
                <button type="button" disabled={savingSection === "skills"} onClick={(e) => void saveSkills(e)} className="h-10 rounded-[12px] bg-[var(--joballa-primary)] px-4 text-sm font-medium text-white disabled:opacity-50">
                  {savingSection === "skills" ? t("editor.saving") : t("editor.save")}
                </button>
              </div>
          </Card>

          <Card>
            <p className="text-xs font-semibold uppercase text-[var(--joballa-label-fg)]">{t("strength.sections.education")}</p>
            <div className="mt-5 space-y-4">
              {(profile.educations ?? []).map((education) => (
                <div key={education.id} className="flex flex-col items-start justify-between gap-3 rounded-[12px] border border-[var(--joballa-border)] p-4 min-[480px]:flex-row">
                  <div className="min-w-0">
                    <p className="font-bold">{education.institution}</p>
                    <p className="text-sm text-[var(--joballa-muted)]">{[education.degree, education.fieldOfStudy].filter(Boolean).join(" · ")}</p>
                    <p className="mt-1 text-xs text-[var(--joballa-muted)]">
                      {[toIsoDateOnly(education.startDate), education.isCurrent ? "Present" : toIsoDateOnly(education.endDate)].filter(Boolean).join(" – ")}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-red-600"
                    onClick={() =>
                      requestConfirm({
                        title: tc("delete.title"),
                        description: tc("delete.description"),
                        confirmLabel: tc("delete.confirm"),
                        cancelLabel: tc("cancel"),
                        destructive: true,
                        onConfirm: () => void removeEducation(education.id),
                      })
                    }
                  >
                    {t("editor.delete")}
                  </button>
                </div>
              ))}
            </div>
            <form onSubmit={addEducation} className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label={t("editor.institution")} value={educationInstitution} onChange={setEducationInstitution} />
              <Field label={t("editor.degree")} value={educationDegree} onChange={setEducationDegree} />
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
                  className="size-4 rounded border-[var(--joballa-border)]"
                />
                {t("editor.currentStudy")}
              </label>
              <div className="flex justify-end sm:col-span-2">
                <button type="submit" disabled={savingSection === "education"} className="h-10 w-full rounded-[12px] bg-[var(--joballa-primary)] px-4 text-sm font-medium text-white disabled:opacity-50 min-[480px]:w-auto">
                  {t("editor.addEducation")}
                </button>
              </div>
            </form>
          </Card>

          <Card>
            <p className="text-xs font-semibold uppercase text-[var(--joballa-label-fg)]">{t("editor.certificationsTitle")}</p>
            <div className="mt-5 space-y-4">
              {(profile.certifications ?? []).map((cert) => (
                <div key={cert.id} className="flex flex-col items-start justify-between gap-3 rounded-[12px] border border-[var(--joballa-border)] p-4 min-[480px]:flex-row">
                  <div className="min-w-0">
                    <p className="font-bold">{cert.name}</p>
                    {cert.issuer?.trim() ? <p className="text-sm text-[var(--joballa-muted)]">{cert.issuer}</p> : null}
                    {cert.issueDate ? (
                      <p className="mt-1 text-xs text-[var(--joballa-muted)]">{toIsoDateOnly(cert.issueDate)}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="text-sm text-red-600"
                    onClick={() =>
                      requestConfirm({
                        title: tc("delete.title"),
                        description: tc("delete.description"),
                        confirmLabel: tc("delete.confirm"),
                        cancelLabel: tc("cancel"),
                        destructive: true,
                        onConfirm: () => void removeCertification(cert.id),
                      })
                    }
                  >
                    {t("editor.delete")}
                  </button>
                </div>
              ))}
            </div>
            <form onSubmit={addCertification} className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label={t("editor.certificationName")} value={certName} onChange={setCertName} wide />
              <Field label={t("editor.certificationIssuer")} value={certIssuer} onChange={setCertIssuer} />
              <Field label={t("editor.issueDate")} value={certIssueDate} onChange={setCertIssueDate} type="date" />
              <div className="flex justify-end sm:col-span-2">
                <button
                  type="submit"
                  disabled={savingSection === "certifications"}
                  className="h-10 w-full rounded-[12px] bg-[var(--joballa-primary)] px-4 text-sm font-medium text-white disabled:opacity-50 min-[480px]:w-auto"
                >
                  {t("editor.addCertification")}
                </button>
              </div>
            </form>
          </Card>

          <Card>
            <p className="text-xs font-semibold uppercase text-[var(--joballa-label-fg)]">{t("strength.sections.work")}</p>
            <div className="mt-5 space-y-4">
              {(profile.workHistories ?? []).map((w) => (
                <div key={w.id} className="flex flex-col items-start justify-between gap-3 rounded-[12px] border border-[var(--joballa-border)] p-4 min-[480px]:flex-row">
                  <div className="min-w-0">
                    <p className="font-bold">{w.jobTitle}</p>
                    <p className="text-sm text-[var(--joballa-muted)]">{w.companyName}</p>
                    <p className="mt-1 text-xs text-[var(--joballa-muted)]">
                      {[toIsoDateOnly(w.startDate), w.isCurrent ? "Present" : toIsoDateOnly(w.endDate)].filter(Boolean).join(" – ")}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-red-600"
                    onClick={() =>
                      requestConfirm({
                        title: tc("delete.title"),
                        description: tc("delete.description"),
                        confirmLabel: tc("delete.confirm"),
                        cancelLabel: tc("cancel"),
                        destructive: true,
                        onConfirm: () => void removeWorkHistory(w.id),
                      })
                    }
                  >
                    {t("editor.delete")}
                  </button>
                </div>
              ))}
            </div>
            <form onSubmit={addWorkHistory} className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label={t("editor.jobTitle")} value={workJobTitle} onChange={setWorkJobTitle} />
              <Field label={t("editor.company")} value={workCompany} onChange={setWorkCompany} />
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
                  className="size-4 rounded border-[var(--joballa-border)]"
                />
                {t("editor.currentRole")}
              </label>
              <Field label={t("editor.description")} value={workDescription} onChange={setWorkDescription} as="textarea" wide />
              <div className="flex justify-end sm:col-span-2">
                <button type="submit" disabled={savingSection === "work"} className="h-10 w-full rounded-[12px] bg-[var(--joballa-primary)] px-4 text-sm font-medium text-white disabled:opacity-50 min-[480px]:w-auto">
                  {t("editor.addExperience")}
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
                <label className="block text-[11px] font-medium text-[var(--joballa-muted)]">
                  {t("editor.documentType")}
                  <select
                    value={kycDocumentType}
                    onChange={(e) => {
                      setKycDocumentType(e.target.value as "NATIONAL_ID" | "PASSPORT" | "DRIVERS_LICENSE");
                      setKycBackFile(null);
                    }}
                    className="mt-1 h-10 w-full rounded-[10px] border border-[var(--joballa-border)] bg-[var(--joballa-input-bg)] px-3 text-sm text-[var(--joballa-fg)] outline-none focus:border-[var(--joballa-primary)] focus:ring-2 focus:ring-[var(--joballa-primary)]"
                  >
                    <option value="NATIONAL_ID">{t("editor.nationalId")}</option>
                    <option value="PASSPORT">{t("editor.passport")}</option>
                    <option value="DRIVERS_LICENSE">{t("editor.driversLicense")}</option>
                  </select>
                </label>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <label className="block rounded-[12px] border border-dashed border-[var(--joballa-border)] p-4 text-sm text-[var(--joballa-muted)]">
                    <span className="font-semibold text-[var(--joballa-fg)]">{kycDocumentType === "PASSPORT" ? t("editor.passportDocument") : t("editor.idFront")}</span>
                    <input className="mt-3 block w-full text-xs" type="file" accept="image/*,.pdf" capture="environment" onChange={(e) => setKycFrontFile(e.target.files?.[0] ?? null)} />
                    {kycFrontFile ? <span className="mt-2 block truncate text-xs">{kycFrontFile.name}</span> : null}
                  </label>
                  {kycDocumentType !== "PASSPORT" ? (
                    <label className="block rounded-[12px] border border-dashed border-[var(--joballa-border)] p-4 text-sm text-[var(--joballa-muted)]">
                      <span className="font-semibold text-[var(--joballa-fg)]">{t("editor.idBack")}</span>
                      <input className="mt-3 block w-full text-xs" type="file" accept="image/*,.pdf" capture="environment" onChange={(e) => setKycBackFile(e.target.files?.[0] ?? null)} />
                      {kycBackFile ? <span className="mt-2 block truncate text-xs">{kycBackFile.name}</span> : null}
                    </label>
                  ) : null}
                  <label className="block rounded-[12px] border border-dashed border-[var(--joballa-border)] p-4 text-sm text-[var(--joballa-muted)]">
                    <span className="font-semibold text-[var(--joballa-fg)]">{t("editor.selfie")}</span>
                    <input className="mt-3 block w-full text-xs" type="file" accept="image/*" capture="user" onChange={(e) => setKycSelfieFile(e.target.files?.[0] ?? null)} />
                    {kycSelfieFile ? <span className="mt-2 block truncate text-xs">{kycSelfieFile.name}</span> : null}
                  </label>
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
                if (f) void uploadSupportingDocument(f, "CV");
              }}
            />
            <div className="mt-6 border-t border-[var(--joballa-border)] pt-5">
              <p className="text-xs font-semibold uppercase text-[var(--joballa-label-fg)]">Supporting documents</p>
              <p className="mt-1 text-xs text-[var(--joballa-muted)]">Add certificates, portfolio files, and other documents.</p>
            </div>
            <div className="mt-4 space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex flex-col items-start justify-between gap-3 rounded-[12px] border border-[var(--joballa-border)] p-3 min-[480px]:flex-row min-[480px]:items-center">
                  <p className="truncate text-sm font-semibold">{doc.fileName ?? doc.id}</p>
                  <button
                    type="button"
                    className="text-sm text-red-600"
                    onClick={() =>
                      requestConfirm({
                        title: tc("delete.title"),
                        description: tc("delete.description"),
                        confirmLabel: tc("delete.confirm"),
                        cancelLabel: tc("cancel"),
                        destructive: true,
                        onConfirm: () => void removeSupportingDocument(doc.id),
                      })
                    }
                  >
                    {t("editor.delete")}
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className="mt-4 rounded-[10px] border border-[var(--joballa-border)] px-4 py-2 text-sm" onClick={() => docInputRef.current?.click()}>
              {t("editor.uploadDocument")}
            </button>
          </Card>

          <Card>
              <p className="text-xs font-semibold uppercase text-[var(--joballa-label-fg)]">{t("strength.sections.payment")}</p>
              <p className="mt-1 text-xs text-[var(--joballa-muted)]">Ensure the name on this account matches your National ID.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className={cn("rounded-[10px] px-4 py-2 text-sm", momoProvider === "MTN_MOMO" ? "bg-[#ecfff8] text-[var(--joballa-primary)] ring-1 ring-[#92dfc8]" : "bg-[var(--joballa-tag-bg)]")} onClick={() => setMomoProvider("MTN_MOMO")}>
                  MTN MoMo
                </button>
                <button type="button" className={cn("rounded-[10px] px-4 py-2 text-sm", momoProvider === "ORANGE_MONEY" ? "bg-[#ecfff8] text-[var(--joballa-primary)] ring-1 ring-[#92dfc8]" : "bg-[var(--joballa-tag-bg)]")} onClick={() => setMomoProvider("ORANGE_MONEY")}>
                  Orange Money
                </button>
              </div>
              <div className="mt-4">
                <Field label={t("editor.phone")} value={momoNumber} onChange={setMomoNumber} wide />
              </div>
              <label className="mt-3 flex items-center gap-2 text-sm text-[var(--joballa-muted)]">
                <input type="checkbox" className="size-4 rounded border-[var(--joballa-border)]" />
                Set as primary account
              </label>
              <div className="mt-6 flex justify-end">
                <button type="button" disabled={savingSection === "payment"} onClick={(e) => void savePayment(e)} className="h-10 rounded-[12px] bg-[var(--joballa-primary)] px-4 text-sm font-medium text-white disabled:opacity-50">
                  {savingSection === "payment" ? t("editor.saving") : t("editor.save")}
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
