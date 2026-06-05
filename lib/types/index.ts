/**
 * Joballa web types: Prisma-aligned domain models plus HTTP helpers.
 */

export * from "./enums";
export * from "./json-shapes";
export * from "./models";
export * from "./auth";

import type { Language, Role } from "./enums";
import type { User } from "./models";

/** Bilingual UI / API preference (same values as Prisma `Language`). */
export type LanguagePreference = Language;

/**
 * Roles used in worker/employer signup and role-selection flows.
 * Full set: {@link Role}.
 */
export type JoballaRole = Extract<Role, "WORKER" | "EMPLOYER">;

/** @deprecated Prefer {@link User}; name kept for gradual migration. */
export type JoballaUser = User;

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
