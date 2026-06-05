# Backend reply: authentication & profiles (Joballa Web handoff)

This document is the **contract** the **joballa-web** client implements for auth and profile APIs. It describes the Nest API behavior (cookies, JWT, routes, errors).

> The API repo may also maintain `docs/routes/02-auth.md`, `03-worker-profiles.md`, `04-employer-profiles.md`; this file remains the copy tracked **in joballa-web** for front-end work.

---

## 1. Handoff confirmations

| Topic | Backend behavior |
| --- | --- |
| **§1.2 Employer email signup without `select-role`** | **Acceptable.** Employer display name and language can be set at **`register` / `verify`** (stored on `User` and seeded employer profile). **`POST /auth/select-role`** is optional for updating **`name`** → employer `companyName` (or worker `fullName`) and **`languagePreference`** after OTP signup. |
| **§2.2 Stale `Authorization` on public routes** | **No conflict.** Public auth routes (`register`, `verify`, `login`, `forgot-password`, `reset-password`, `resend-otp`, `refresh`) **do not** mount `JwtAuthGuard`. A stale Bearer is **ignored**; credentials come from the JSON body and/or the refresh cookie as documented. |
| **`POST /auth/select-role` and HTTP 404** | The route **is implemented** (returns **200** on success). The web’s “404 = optional endpoint” fallback is **no longer required** for this environment once deployed. |
| **`dashboardRoute`** | Returned **without locale** and **without a trailing `/dashboard` segment**: `/worker`, `/employer`, `/admin`, `/super-admin` (or `null` if role has no mapped home). Matches the handoff’s prose examples; the web may still normalize paths locally. |
| **`profileType` on `GET /auth/me` (and `select-role`)** | **`WORKER`**, **`EMPLOYER`**, or **`null`** (uppercase strings, aligned with web types). |
| **Anti-enumeration (`forgot-password`)** | **Always 200** with a generic `message` whether or not an account exists (same copy as before). |
| **OTP copy (§11)** | Registration vs password-reset use **different subjects and bodies** (EN/FR) for **email** and **SMS**, using `languagePreference` from registration snapshot / user record when available. |
| **CORS (§2.3)** | `GET`, `POST`, `PATCH`, `PUT`, `DELETE`, `OPTIONS`; allowed headers **`Content-Type`**, **`Authorization`**, **`Accept`**; **`credentials: true`**; **`origin`** from comma-separated `CORS_ORIGINS` (required for real browsers when not using `*` — when the list is empty, Nest is configured with `origin: true` for permissive dev only). |

---

## 2. Refresh cookie (exact name & attributes)

| Attribute | Value / source |
| --- | --- |
| **Name** | `refreshToken` (constant `REFRESH_TOKEN_COOKIE` in `src/modules/auth/auth.constants.ts`) |
| **Path** | **`COOKIE_PATH`** env, default **`/auth`** (cookie is sent on `/auth/refresh`, `/auth/login`, `/auth/verify`, `/auth/logout`, etc. under that path). |
| **HttpOnly** | **`true`** |
| **Secure** | **`true`** when `NODE_ENV=production` **or** `COOKIE_SECURE=true`. If **`COOKIE_SAME_SITE=none`**, **`Secure` is forced `true`** (browser requirement). |
| **SameSite** | **`COOKIE_SAME_SITE`**: `lax` (default), `strict`, or `none`. Use **`none`** + HTTPS + correct `CORS_ORIGINS` when the SPA origin and API origin are **cross-site** and the browser must send the cookie on XHR. |
| **Domain** | **`COOKIE_DOMAIN`**. Omit, `localhost`, or empty → **host-only** cookie (no `Domain` attribute). Otherwise set to your shared parent domain in staging/prod if needed. |
| **Max-Age** | Derived from **`JWT_REFRESH_EXPIRES_SEC`** (milliseconds passed to `res.cookie` `maxAge`). |
| **Rotation** | **`POST /auth/refresh`** deletes the used refresh row and issues a **new** opaque refresh token + **`Set-Cookie`** (rotation on every successful refresh). |

Logout clears the cookie with the **same** path/domain/sameSite/secure attributes so the browser stops sending it.

---

## 3. JWT access token

| Item | Detail |
| --- | --- |
| **Where used** | `Authorization: Bearer <accessToken>` on protected routes. |
| **Lifetime** | **`JWT_ACCESS_EXPIRES_SEC`** (seconds), e.g. `900` = 15 minutes. |
| **Claims** | **`sub`**: user id (UUID). **`role`**: Prisma `Role`. **`email`**: string (empty string if user has no email). Standard **`iat`**, **`exp`** issued by `@nestjs/jwt`. |
| **Opaque refresh** | Stored hashed in DB; **not** a JWT. |

---

## 4. Error shape

Validation and most HTTP errors use Nest’s JSON shape. The UI expects a **`message`** field:

- String: `{ "message": "…" }`
- Or string array (class-validator): `{ "message": ["…", "…"] }`

Global filter (if present) should keep this convention; throttler uses a string `message` for **429**.

---

## 5. OpenAPI / Swagger

There is **no** Swagger/OpenAPI URL wired in this repository yet. **`docs/routes/*.md`** and this file serve as the contract. OpenAPI can be added later if product wants a machine-readable spec.

---

## 6. Operational limits (OTP / auth)

| Mechanism | Detail |
| --- | --- |
| **OTP format** | **6 digits**, regex `^[0-9]{6}$` on verify / reset / resend flows. |
| **OTP TTL** | **`OTP_EXPIRES_MINUTES`** (default in `.env.example`: 10). |
| **Password length** | **8–128** on register, verify, and reset-password DTOs. |
| **Resend cooldown** | In-memory: **max 3** resends per **`purpose` + `identifier`** per **rolling hour** per API instance (`OtpResendThrottleService`). Exceeded → **429** with `message`. |
| **Controller throttles** | See `auth.controller.ts` (`@Throttle`) for per-route Nest throttler limits (429 with generic message). |

---

## 7. Changelog (breaking / notable for frontend)

1. **`GET /auth/me`** (and **`POST /auth/select-role`**): `profileType` is now **`WORKER` | `EMPLOYER` | null`** (was lowercase `worker` / `employer`).  
2. **`dashboardRoute`**: now **`/worker`**, **`/employer`**, **`/admin`**, **`/super-admin`** (no `/dashboard` suffix).  
3. **`POST /auth/login`** and **`POST /auth/verify`** user objects include **`phone`** (`string | null`).  
4. **`POST /auth/logout`** success message: **`Logged out`**.  
5. **`POST /auth/reset-password`** success message: **`Password updated`**.  
6. **`POST /auth/select-role`** added (Bearer); returns same body as **`GET /auth/me`**.

---

## 8. Auth routes reference (`/auth/*`)

Unless noted, **`Content-Type: application/json`**. Browser calls should use **`credentials: 'include'`** (or Axios `withCredentials: true`) wherever cookies are involved (`login`, `verify`, `refresh`, `logout`, `me`, profiles).

### `POST /auth/register`

| | |
| --- | --- |
| **Auth** | None |
| **Body** | **Exactly one** of `email` or `phone`; `password` (8–128); `role` **`WORKER` \| `EMPLOYER`**; optional `languagePreference` **`EN` \| `FR`**. |
| **200** | `{ "message": string, "identifier": string }` — `identifier` is canonical email or phone for verify/resend. |
| **Errors** | **400** validation / XOR contact; **409** account already exists; **429** throttle. |

### `POST /auth/verify`

| | |
| --- | --- |
| **Auth** | None |
| **Body** | `identifier`, `otp` (6 digits), `role`, `password`, optional `languagePreference`. |
| **201** | `{ "accessToken": string, "user": { id, role, email, phone, languagePreference, verificationStatus } }` — sets **`refreshToken`** cookie. |
| **Note** | New users are created with **`verificationStatus: VERIFIED`** today (email/phone OTP counts as verification for login). |

### `POST /auth/login`

| | |
| --- | --- |
| **Auth** | None |
| **Body** | `identifier` (email or phone), `password`. |
| **200** | `{ "accessToken", "user": { id, role, email, phone, languagePreference } }` — sets/refreshes **`refreshToken`**. |
| **Errors** | **401** bad credentials / inactive; **403** if `verificationStatus` is not **`VERIFIED`**. |

### `GET /auth/me`

| | |
| --- | --- |
| **Auth** | Bearer |
| **200** | `{ "user": UserSummary, "dashboardRoute": string \| null, "profileType": "WORKER" \| "EMPLOYER" \| null, "profile": object \| null }` — `profile` is worker or employer shape when applicable. |
| **Errors** | **401**; **404** edge (user missing). |

### `POST /auth/refresh`

| | |
| --- | --- |
| **Auth** | None (uses **`refreshToken`** cookie) |
| **Body** | `{}` optional |
| **200** | `{ "accessToken": string }` — new refresh cookie (rotation). |
| **Errors** | **401** missing/invalid/expired refresh. |

### `POST /auth/logout`

| | |
| --- | --- |
| **Auth** | Bearer |
| **Body** | `{}` or empty |
| **200** | `{ "message": "Logged out" }` — clears refresh cookie and deletes matching refresh row when cookie present. |

### `POST /auth/select-role`

| | |
| --- | --- |
| **Auth** | Bearer |
| **Body** | `role` (**must match** user’s role, **`WORKER` \| `EMPLOYER`**); optional `name` (employer → **`companyName`**, worker → **`fullName`**); optional `languagePreference`. |
| **200** | Same JSON as **`GET /auth/me`**. |
| **Errors** | **400** role mismatch; **401**; **404** edge. |

### `POST /auth/forgot-password`

| | |
| --- | --- |
| **Auth** | None |
| **Body** | `{ "identifier": string }` |
| **200** | `{ "message": "If an account exists for this email/phone, a reset code has been sent." }` always (anti-enumeration). |

### `POST /auth/reset-password`

| | |
| --- | --- |
| **Auth** | None |
| **Body** | `identifier`, `otp` (6 digits), `newPassword` (8–128). |
| **200** | `{ "message": "Password updated" }` — revokes all refresh tokens for that user. |
| **Errors** | **400** invalid/expired OTP, etc. |

### `POST /auth/resend-otp`

| | |
| --- | --- |
| **Auth** | None |
| **Body** | `identifier`, `purpose`: **`REGISTRATION`** \| **`PASSWORD_RESET`** (Prisma `OtpPurpose`). |
| **200** | `{ "message": string, "identifier": string }` (registration copy on success; password path uses generic reset copy + identifier). |
| **Errors** | **400** if registration not in progress / cannot rebuild snapshot / password reset not started; **429** resend throttle. |

---

## 9. Profile routes (`Bearer` + `credentials`)

| Method | Path | Role | Returns |
| --- | --- | --- | --- |
| **GET** | `/worker-profiles/me` | **WORKER** | Worker profile JSON |
| **PATCH** | `/worker-profiles/me` | **WORKER** | Updated worker profile |
| **GET** | `/employer-profiles/me` | **EMPLOYER** | Employer profile JSON |
| **PATCH** | `/employer-profiles/me` | **EMPLOYER** | Updated employer profile |

**403** if JWT role does not match the route (e.g. employer calling worker path). **400** + `message` on validation (`forbidNonWhitelisted: true` — unknown JSON keys rejected).

**Allowed PATCH fields** — see `docs/routes/03-worker-profiles.md` and `docs/routes/04-employer-profiles.md` (field tables match DTOs `UpdateWorkerProfileDto`, `UpdateEmployerProfileDto`).

---

## 10. Route protection (§8)

**Supported today:** **client-side / API 401** pattern — protected business APIs should return **401** when the access token is missing or invalid; the web’s Axios layer refreshes once then retries. Longer term, a server-readable session for Next middleware is **not** implemented in this API yet; we can add e.g. opaque session introspection in a follow-up if product picks approach **B**.

---

## 11. Frontend alignment (`joballa-web`)

| Change | Location |
|--------|-----------|
| `GET /auth/me`: `dashboardRoute` **`string \| null`**; `profileType` **`WORKER` \| `EMPLOYER` \| null** | `lib/types/auth.ts` |
| Navigation: **`intlPathFromDashboardRoute(route, role)`** with role fallback; **`/super-admin` → `/admin`** (no super-admin UI route yet) | `lib/joballa/dashboard-route.ts`, `lib/auth/establish-session.ts`, signup flows |
| Employer OTP: **`POST /auth/select-role`** is **best-effort** (§1.2); failure does not block navigation | `components/auth/sign-up-otp-form.tsx` |
| Axios **`withCredentials: true`** on API base URL (cookies on `login`, `verify`, `refresh`, `logout`, profiles) | `lib/http/axios-instance.ts`, `lib/http/refresh-access-token.ts` |
| Profile **`GET` / `PATCH`** `worker-profiles/me`, `employer-profiles/me` | `features/profile/api/*.ts` |
| Local dev: API **`CORS_ORIGINS`** must allow the SPA origin | `.env.example` |

---

*Generated to match implementation in branch/workspace at time of writing.*
