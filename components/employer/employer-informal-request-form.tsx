"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { useCreateEmployerInformalRequest } from "@/features/employer/hooks";
import type { CreateInformalJobRequest } from "@/features/employer/types/employer-portal";
import { portalCardClass, portalInputClass, portalPageShellClass } from "@/components/portal/portal-ui";
import { buttonClassName } from "@/components/ui/button";
import { JoballaApiError } from "@/lib/joballa/request";
import { cn } from "@/lib/utils";

const CATEGORIES: CreateInformalJobRequest["departmentCategory"][] = [
  "education",
  "domestic",
  "logistics",
  "events",
  "agriculture",
  "construction",
  "other",
];

export function EmployerInformalRequestForm() {
  const t = useTranslations("employer.requests");
  const router = useRouter();
  const create = useCreateEmployerInformalRequest();
  const [departmentId, setDepartmentId] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CreateInformalJobRequest["departmentCategory"]>("other");
  const [paymentManagedByJoballa, setPaymentManagedByJoballa] = useState(true);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!departmentId.trim() || !title.trim()) {
      setError(t("validation"));
      return;
    }
    try {
      await create.mutateAsync({
        departmentId: departmentId.trim(),
        departmentCategory: category,
        paymentManagedByJoballa,
        formData: { title: title.trim(), notes: notes.trim() || undefined },
      });
      router.push("/employer/requests");
    } catch (err) {
      setError(err instanceof JoballaApiError ? err.message : t("submitError"));
    }
  }

  return (
    <div className={cn(portalPageShellClass, "gap-6")}>
      <header>
        <h1 className="text-2xl font-bold text-[var(--joballa-fg)]">{t("newTitle")}</h1>
        <p className="mt-1 text-sm text-[var(--joballa-muted)]">{t("newDescription")}</p>
      </header>

      <form onSubmit={onSubmit} className={cn(portalCardClass(), "mx-auto w-full max-w-lg space-y-4 p-6")}>
        <label className="block text-sm font-semibold text-[var(--joballa-fg)]">
          {t("departmentId")}
          <input
            required
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className={cn(portalInputClass, "mt-1 w-full")}
          />
        </label>
        <label className="block text-sm font-semibold text-[var(--joballa-fg)]">
          {t("titleLabel")}
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={cn(portalInputClass, "mt-1 w-full")}
          />
        </label>
        <label className="block text-sm font-semibold text-[var(--joballa-fg)]">
          {t("category")}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CreateInformalJobRequest["departmentCategory"])}
            className={cn(portalInputClass, "mt-1 w-full")}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--joballa-fg)]">
          <input
            type="checkbox"
            checked={paymentManagedByJoballa}
            onChange={(e) => setPaymentManagedByJoballa(e.target.checked)}
          />
          {t("paymentManaged")}
        </label>
        <label className="block text-sm font-semibold text-[var(--joballa-fg)]">
          {t("notes")}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className={cn(portalInputClass, "mt-1 w-full resize-y")}
          />
        </label>
        {error ? <p className="text-sm text-[var(--joballa-danger-fg)]">{error}</p> : null}
        <button type="submit" disabled={create.isPending} className={buttonClassName("primary")}>
          {create.isPending ? t("submitting") : t("submit")}
        </button>
      </form>
    </div>
  );
}
