"use client";

import type { EmployerJobDetail } from "@/features/employer/types/employer-portal";

export function employerJobRequiredSkillsList(
  job?: Pick<EmployerJobDetail, "requiredSkills"> | null,
): string[] {
  if (!job || !Array.isArray(job.requiredSkills)) return [];
  return job.requiredSkills.map((skill) => String(skill).trim()).filter(Boolean);
}

export function EmployerJobRequiredSkillsBlock({
  skills,
  title,
}: {
  skills: string[];
  title: string;
}) {
  if (skills.length === 0) return null;

  return (
    <div>
      <h4 className="text-sm font-bold text-[var(--joballa-fg)]">{title}</h4>
      <ul className="mt-2 flex flex-wrap gap-2">
        {skills.map((skill) => (
          <li
            key={skill}
            className="inline-flex rounded-full bg-[var(--joballa-jade-3)] px-2.5 py-1 text-xs font-semibold text-[var(--joballa-primary)]"
          >
            {skill}
          </li>
        ))}
      </ul>
    </div>
  );
}
