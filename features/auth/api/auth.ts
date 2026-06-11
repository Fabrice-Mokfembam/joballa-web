/**
 * Joballa backend auth routes (`/auth/*`).
 *
 * Contract: `docs/BACKEND_AUTH_REPLY.md` §8 (status codes, bodies; `POST /auth/verify` returns **201**).
 */
import { joballaAxios } from "@/lib/http/axios-instance";
import { JoballaApiError } from "@/lib/joballa/request";
import type {
  AuthForgotPasswordBody,
  AuthLoginBody,
  AuthMeResponse,
  AuthMessageResponse,
  AuthRefreshResponse,
  AuthRegisterBody,
  AuthRegisterResponse,
  AuthResendOtpBody,
  AuthResetPasswordBody,
  AuthSelectRoleBody,
  AuthTokensResponse,
  AuthVerifyBody,
  GoogleAuthBody,
  GoogleAuthResponse,
} from "@/lib/types/auth";

function apiRole(role: string) {
  return role.toLowerCase();
}

function apiLanguage(language: string | undefined) {
  if (!language) return undefined;
  const value = language.toLowerCase();
  if (value === "fr" || value === "fre") return "fre";
  return "eng";
}

function encodeRegisterBody(body: AuthRegisterBody) {
  return {
    ...body,
    role: apiRole(body.role),
    preferredLanguage: apiLanguage(body.preferredLanguage),
  };
}

function encodeSelectRoleBody(body: AuthSelectRoleBody) {
  return {
    ...body,
    role: apiRole(body.role),
    preferredLanguage: apiLanguage(body.preferredLanguage),
  };
}

export async function postRegister(body: AuthRegisterBody): Promise<AuthRegisterResponse> {
  const { data } = await joballaAxios.post<AuthRegisterResponse>("/auth/register", encodeRegisterBody(body));
  return data;
}

export async function postVerify(body: AuthVerifyBody): Promise<AuthTokensResponse> {
  const { data } = await joballaAxios.post<AuthTokensResponse>("/auth/verify", body);
  return data;
}

export async function postSelectRole(body: AuthSelectRoleBody): Promise<AuthMeResponse> {
  const { data } = await joballaAxios.post<AuthMeResponse>("/auth/select-role", encodeSelectRoleBody(body));
  return data;
}

export async function postLogin(body: AuthLoginBody): Promise<AuthTokensResponse> {
  const { data } = await joballaAxios.post<AuthTokensResponse>("/auth/login", body);
  return data;
}

function encodeGoogleAuthBody(body: GoogleAuthBody) {
  return {
    idToken: body.idToken,
    mode: body.mode,
    ...(body.role ? { role: apiRole(body.role) } : {}),
    ...(body.preferredLanguage ? { preferredLanguage: apiLanguage(body.preferredLanguage) } : {}),
  };
}

export async function postAuthGoogle(body: GoogleAuthBody): Promise<GoogleAuthResponse> {
  const { data } = await joballaAxios.post<GoogleAuthResponse>("/auth/google", encodeGoogleAuthBody(body));
  return data;
}

export async function postRefresh(refreshToken?: string | null): Promise<AuthRefreshResponse> {
  const { data } = await joballaAxios.post<AuthRefreshResponse>(
    "/auth/refresh",
    refreshToken ? { refreshToken } : {},
  );
  return data;
}

export async function postLogout(
  accessToken: string | null,
  refreshToken?: string | null,
): Promise<AuthMessageResponse> {
  if (!accessToken) throw new JoballaApiError("Missing session token.", 401);
  const body = refreshToken ? { refreshToken } : {};
  const { data } = await joballaAxios.post<AuthMessageResponse>("/auth/logout", body, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
}

export async function postForgotPassword(body: AuthForgotPasswordBody): Promise<AuthMessageResponse> {
  const { data } = await joballaAxios.post<AuthMessageResponse>("/auth/forgot-password", body);
  return data;
}

export async function postResetPassword(body: AuthResetPasswordBody): Promise<AuthMessageResponse> {
  const { data } = await joballaAxios.post<AuthMessageResponse>("/auth/reset-password", {
    identifier: body.identifier,
    code: body.code,
    newPassword: body.newPassword,
  });
  return data;
}

export async function postResendOtp(
  body: AuthResendOtpBody
): Promise<AuthRegisterResponse | AuthMessageResponse> {
  const { data } = await joballaAxios.post<AuthRegisterResponse & AuthMessageResponse>(
    "/auth/resend-otp",
    body
  );
  return data;
}

/** Uses Bearer from the store via interceptor, or an explicit header when `token` is passed. */
export async function getAuthMe(token?: string | null): Promise<AuthMeResponse> {
  const { data } = await joballaAxios.get<AuthMeResponse>(
    "/auth/me",
    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
  );
  return data;
}
