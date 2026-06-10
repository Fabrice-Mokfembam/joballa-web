import {
  formatCertificationMeta,
  formatEducationMeta,
  formatWorkHistoryMeta,
  profileDisplayName,
  profileEmploymentTypes,
  profileHeadline,
  profileIndustriesLine,
  profileLanguagesLine,
  profileLocationLine,
  profileSkillsLine,
  sortedCertifications,
  sortedEducations,
  sortedWorkHistories,
} from "@/features/worker/lib/profile-display";
import type { WorkerFullProfile } from "@/features/worker/types/worker-portal";
import { buildStructuredPdfBlob } from "@/lib/pdf-download";

export type WorkerCvContact = {
  email?: string | null;
  phone?: string | null;
};

export function validateProfileForCvExport(profile: WorkerFullProfile): string | null {
  const name = profileDisplayName(profile).trim();
  const summary = profile.summary?.trim();
  if (!name) {
    return "Complete your name before exporting your CV.";
  }
  if (!summary) {
    return "Complete your professional summary before exporting your CV.";
  }
  return null;
}

export function buildWorkerCvFileName(profile: WorkerFullProfile): string {
  const slug = profileDisplayName(profile)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `joballa-cv-${slug || "profile"}.pdf`;
}

function wrapParagraph(text: string, maxChars = 92): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines;
}

export function buildWorkerCvPdfBlob(profile: WorkerFullProfile, contact?: WorkerCvContact): Blob {
  const name = profileDisplayName(profile);
  const headline = profileHeadline(profile);
  const location = profileLocationLine(profile);
  const contactLines = [location, contact?.email?.trim(), contact?.phone?.trim()].filter(Boolean) as string[];

  const sections: { title: string; lines: string[] }[] = [];

  const summary = profile.summary?.trim();
  if (summary) {
    sections.push({ title: "Professional Summary", lines: wrapParagraph(summary) });
  }

  const languages = profileLanguagesLine(profile);
  if (languages) {
    sections.push({ title: "Languages", lines: [languages] });
  }

  const skills = profileSkillsLine(profile);
  if (skills) {
    sections.push({ title: "Skills", lines: wrapParagraph(skills) });
  }

  const industries = profileIndustriesLine(profile);
  const employmentTypes = profileEmploymentTypes(profile);
  const preferenceLines = [industries, employmentTypes].filter(Boolean);
  if (preferenceLines.length > 0) {
    sections.push({ title: "Preferences", lines: preferenceLines });
  }

  const workLines =
    sortedWorkHistories(profile).flatMap((entry) => {
      const title = [entry.jobTitle, entry.companyName].filter(Boolean).join(" — ");
      const meta = formatWorkHistoryMeta(entry);
      const description = entry.description?.trim();
      return [
        title,
        ...(meta ? [meta] : []),
        ...(description ? wrapParagraph(description) : []),
        "",
      ];
    });
  if (workLines.some((line) => line.trim())) {
    sections.push({ title: "Work Experience", lines: workLines.filter((line, index, arr) => !(line === "" && index === arr.length - 1)) });
  }

  const educationLines =
    sortedEducations(profile).flatMap((entry) => {
      const title = entry.degree?.trim() ?? "";
      const subtitle = [entry.institution, entry.fieldOfStudy].filter(Boolean).join(" · ");
      const meta = formatEducationMeta(entry);
      return [title, ...(subtitle ? [subtitle] : []), ...(meta ? [meta] : []), ""];
    });
  if (educationLines.some((line) => line.trim())) {
    sections.push({ title: "Education", lines: educationLines.filter((line, index, arr) => !(line === "" && index === arr.length - 1)) });
  }

  const certificationLines =
    sortedCertifications(profile).flatMap((entry) => {
      const title = entry.name?.trim() ?? "Certification";
      const meta = formatCertificationMeta(entry);
      return [title, ...(meta ? [meta] : []), ""];
    });
  if (certificationLines.some((line) => line.trim())) {
    sections.push({ title: "Certifications", lines: certificationLines.filter((line, index, arr) => !(line === "" && index === arr.length - 1)) });
  }

  return buildStructuredPdfBlob(
    {
      title: name,
      subtitle: headline || undefined,
      meta: contactLines,
    },
    sections,
  );
}

export function downloadWorkerCvFromProfile(profile: WorkerFullProfile, contact?: WorkerCvContact): WorkerCvDownloadShape {
  const fileName = buildWorkerCvFileName(profile);
  const blob = buildWorkerCvPdfBlob(profile, contact);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return { blob, fileName };
}

export type WorkerCvDownloadShape = {
  blob: Blob;
  fileName: string;
};
