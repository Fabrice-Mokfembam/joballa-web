"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";

import { toast } from "@/lib/toast";

export function useFeatureAlert() {
  const t = useTranslations("common.featureAlert");

  const showInProgress = useCallback(() => {
    toast.info(t("inProgress"));
  }, [t]);

  const showUpcoming = useCallback(() => {
    toast.info(t("upcoming"));
  }, [t]);

  return { showInProgress, showUpcoming };
}
