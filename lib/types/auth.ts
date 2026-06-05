/**
 * Auth HTTP contract — Joballa NestJS API (JWT access + refresh token in JSON body).
 * See `docs/auth.md`.
 */

import type { Language, OtpPurpose, Role, VerificationStatus } from "./enums";
import type { EmployerProfile, User, WorkerProfile } from "./models";

type SignupRole = Extract<Role, "WORKER" | "EMPLOYER">;

export type AuthSelectRoleBody = {
  role: SignupRole;
  name?: string;
  preferredLanguage?: Language;
};

/** User summary returned on login / verify (subset of full {@link User}). */
export type AuthSessionUser = {
  id: string;
  role: Role;
  email: string | null;
  phone: string | null;
  languagePreference: Language;
  verificationStatus?: VerificationStatus;
};

export type AuthRegisterBody =
  | {
      email: string;
      password: string;
      role: SignupRole;
      preferredLanguage?: Language;
    }
  | {
      phone: string;
      password: string;
      role: SignupRole;
      preferredLanguage?: Language;
    };

export type AuthRegisterResponse = {
  message: string;
  identifier: string;
};

/** OTP verify — role/password/language come from `POST /auth/register` snapshot, not this body. */
export type AuthVerifyBody = {
  identifier: string;
  /** Six-digit code; backend also accepts field name `code`. */
  otp: string;
  purpose?: "registration";
};

export type AuthTokensResponse = {
  accessToken: string;
  refreshToken?: string;
  user: AuthSessionUser;
};

export type AuthLoginBody = {
  identifier: string;
  password: string;
};

export type AuthRefreshResponse = {
  accessToken: string;
  refreshToken?: string;
};

export type AuthMeResponse = {
  user: User;
  /** May be `null` when the role has no mapped home (backend contract). */
  dashboardRoute: string | null;
  /** Uppercase, aligned with Nest (`BACKEND_AUTH_REPLY.md`). */
  profileType: "WORKER" | "EMPLOYER" | null;
  profile: WorkerProfile | EmployerProfile | null;
};

export type AuthForgotPasswordBody = {
  identifier: string;
};

export type AuthResetPasswordBody = {
  identifier: string;
  code: string;
  newPassword: string;
};

export type AuthResendOtpBody = {
  identifier: string;
  purpose: OtpPurpose;
};

export type AuthMessageResponse = {
  message: string;
  identifier?: string;
};
