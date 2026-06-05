# Backend handoff: authentication API & session contract (Joballa Web)

**Implemented API reply (Nest):** [`BACKEND_AUTH_REPLY.md`](./BACKEND_AUTH_REPLY.md)

**Audience:** Joballa API / backend team  
**From:** Joballa Web (`joballa-web`, Next.js App Router)  
**Goal:** Align on every HTTP contract required for a **solid, browser-safe authentication flow**, optional **strict route protection**, and predictable error handling — including **`/auth/*`**, **profile `*/me` routes**, **Axios refresh semantics**, **validation alignment**, and **transactional copy** for OTP email/SMS. Subsections **§1.2**, **§12–§15** were added so backend can respond without gaps.

---

## 1. Context: how the web app authenticates today

| Layer | Behavior |
|--------|----------|
| **Access token** | Short-lived JWT returned on `login`, `verify`, and `refresh`. Stored **in memory** (client Zustand store), **not** `localStorage`. Sent as `Authorization: Bearer <accessToken>` on API calls. |
| **Refresh token** | Issued by the API and expected to be stored in an **HttpOnly, Secure (prod), SameSite-appropriate** cookie so the browser sends it on `POST /auth/refresh` with `credentials` / `withCredentials: true`. |
| **Login / signup** | Direct REST calls from the browser to **`NEXT_PUBLIC_API_BASE_URL`** (see §2). No Next.js BFF for auth today. |
| **Route protection (UI)** | **Planned:** redirect unauthenticated users away from worker / employer / admin surfaces. **Today** the Next.js `proxy.ts` only handles **locale**, not JWT. True **server-side** guards require either (a) a **server-readable** session signal (e.g. opaque session cookie + introspection, or access token in cookie), or (b) client-only guards + **401** from APIs. See §8. |

### 1.1 API routes used by the web (quick index)

| § | Method | Path | Summary |
|---|--------|------|---------|
| 5.1 | `POST` | `/auth/register` | Start signup; send registration OTP (email or SMS). |
| 5.2 | `POST` | `/auth/verify` | Complete signup with OTP; return **access** token (+ set refresh cookie). |
| 5.3 | `POST` | `/auth/login` | Sign in; return **access** token (+ refresh cookie). |
| 5.4 | `GET` | `/auth/me` | Current user, `dashboardRoute`, profile. **Bearer required.** |
| 5.5 | `POST` | `/auth/refresh` | New **access** token using **refresh cookie** only. |
| 5.6 | `POST` | `/auth/logout` | Invalidate session / cookies. **Bearer required.** |
| 5.7 | `POST` | `/auth/select-role` | Onboarding role / employer name. **Bearer required.** |
| **5.8** | **`POST`** | **`/auth/forgot-password`** | **Request password-reset OTP** (email or SMS). |
| **5.9** | **`POST`** | **`/auth/reset-password`** | **Set new password** with reset OTP. |
| 5.10 | `POST` | `/auth/resend-otp` | Resend OTP (`REGISTRATION` or `PASSWORD_RESET`). |
| §12 | `GET`/`PATCH` | `/worker-profiles/me`, `/employer-profiles/me` | Authenticated profile reads/writes (**Bearer**). |

**Forgot password is fully specified in §5.8 and §5.9.** Suggested **email/SMS wording** for all OTP flows is in **§11**. **Profile REST paths** are in **§12**.

### 1.2 Signup entry points (employer / `select-role` behavior)

The web has **two** primary signup UX paths after **`POST /auth/register`**. Both end with **`POST /auth/verify`** + session bootstrap, but **`POST /auth/select-role`** is **not** used in all cases:

| Entry | After successful `POST /auth/verify` |
|--------|----------------------------------------|
| **Phone flow** (`/sign-up/phone` → `/sign-up/verify/phone` or email verify) | For **`EMPLOYER`**, client calls **`POST /auth/select-role`** with optional **`name`** and **`languagePreference`**, then **`GET /auth/me`** (via `refreshAuthSessionInStore`). **HTTP 404** on `select-role` is currently **ignored** (assumes endpoint missing). **Workers** go to **`/sign-up/interests`** (not `select-role`). |
| **`/sign-up/email` (`EmailSignUpForm`)** | **`establishSessionAndNavigate` only** — **no** `select-role` call. Employer display name / language must be fully reflected via **`verify`**, **`/auth/me`**, or **profile** APIs (`§12`). |

**Backend ask:** Confirm whether employer accounts created only through **`EmailSignUpForm`** require **`select-role`** or equivalent; if yes, the web will need a follow-up change to call it.

---

## 2. Base URL & common request shape

| Item | Detail |
|------|--------|
| **Base URL** | Configurable per environment; web default is production API unless overridden by `NEXT_PUBLIC_API_BASE_URL` (no trailing slash). |
| **Content-Type** | `application/json` on bodies. |
| **Accept** | `application/json`. |
| **Cookies** | All auth-related browser calls from the shared Axios client use **`withCredentials: true`** so **cookies set by the API** on the API origin are sent on **same-site** or **CORS credentialed** requests as allowed by your CORS config. |

### 2.1 Base URL environment variable

| Env var (web) | Meaning |
|---------------|---------|
| **`NEXT_PUBLIC_API_BASE_URL`** | Optional. Overrides default production API. **No trailing slash.** Example local: `http://localhost:8000`. |

### 2.2 “Public” auth endpoints vs stale `Authorization` headers

These routes are used **before** or **without** a trusted session:  
`POST /auth/register`, `POST /auth/verify`, `POST /auth/login`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `POST /auth/resend-otp`, `POST /auth/refresh` (cookie-only).

The Axios client **auto-attaches** `Authorization: Bearer <token>` from an **in-memory store** whenever the header is not already set. If a user starts **Sign in** while an **old** access token is still in memory, **`POST /auth/login`** might **also** send that stale Bearer.

**Expectation:** For the routes above (except where Bearer is intentionally required per §5), the API should **authenticate using the request body / cookies as documented** and **must not reject the request solely because a stale Bearer is present** (e.g. ignore invalid Bearer when valid credentials are in the body). If that is impossible, tell us so we can clear the store before `login` / `register` / `verify`.

### 2.3 CORS preflight

For browser clients, please document allowed **methods** (at least `GET`, `POST`, `PATCH`, `OPTIONS`) and **`Access-Control-Allow-Headers`** (e.g. `Content-Type`, `Authorization`, `Accept`). **`OPTIONS`** must succeed for credentialed XHR/fetch from the web origin.

---

## 3. CORS & refresh cookie (critical for local + staging)

For the SPA to send the refresh cookie and receive `Set-Cookie` on `login` / `verify` / `refresh`:

1. **CORS** from the web origin must include:
   - `Access-Control-Allow-Credentials: true`
   - `Access-Control-Allow-Origin` = **specific** allowed origin(s) (not `*` when credentials are used).
2. **Refresh cookie** attributes should be documented by you (name, `Path`, `Domain`, `SameSite`, `Secure`, `Max-Age` / `Expires`).  
   - Local dev often uses `http://localhost:3000` → `http://localhost:8000` (or similar): **`SameSite=None; Secure`** may be required if origins differ and cookie must be cross-site; otherwise **`Lax`** may suffice if API and web share a parent domain in staging/prod.
3. **`POST /auth/refresh`** must succeed when called **with no `Authorization` header** but **with the refresh cookie**, and return a new **access** JWT in JSON (see §5.5).

**Ask:** Please confirm the **exact cookie name(s)** and **attribute matrix** per environment in your response doc.

---

## 4. Error responses (what the UI parses)

The web normalizes failures using a **`message`** field on JSON error bodies (NestJS-style):

- Prefer: `{ "message": "Human-readable string" }` or `{ "message": ["error1", "error2"] }` (array is joined).
- If `message` is missing, the UI falls back to status text / generic copy.

**Statuses the UI already treats specially (do not change semantics without telling us):**

| HTTP | Usage on frontend |
|------|-------------------|
| **401** | Invalid credentials on login; expired/invalid access token; refresh failure → session cleared; triggers one refresh retry on `joballaAxios` when the failed request had Bearer. |
| **403** | Sign-in treated as “not verified” in one path (`SignInForm`). |
| **404** | Employer `POST /auth/select-role` failure is **ignored** if status is 404 (signup OTP flow) — assumes endpoint optional / not deployed; **please confirm** if this should instead be 4xx with a body. |
| **429** | Not handled specially today; body should still expose a clear **`message`** if possible. Document rate limits & **`Retry-After`** if used. |

---

## 5. Route-by-route contract (`/auth/*`)

Unless noted, **method is POST with JSON body `{}` or as specified**. Paths are relative to API base.

Legend: **Auth** = whether `Authorization: Bearer <accessToken>` is required.

---

### 5.1 `POST /auth/register`

| | |
|---|---|
| **Purpose** | Start signup: send OTP to email or phone, create pending registration server-side. |
| **Auth** | No |
| **Request body** | **One of** two shapes (discriminated by presence of `email` vs `phone`): |

**Email registration**

```json
{
  "email": "user@example.com",
  "password": "string",
  "role": "WORKER",
  "languagePreference": "EN"
}
```

**Phone registration**

```json
{
  "phone": "+15551234567",
  "password": "string",
  "role": "EMPLOYER",
  "languagePreference": "FR"
}
```

| Field | Notes |
|-------|--------|
| `role` | **`WORKER`** or **`EMPLOYER`** only for this flow. |
| `languagePreference` | Optional; **`EN`** \| **`FR`**. |
| `password` | Same password will be re-sent on `verify` (see §5.2). |

**Expected 2xx JSON**

```json
{
  "message": "e.g. OTP sent",
  "identifier": "canonical-id-for-channel"
}
```

| Field | Notes |
|-------|--------|
| `identifier` | Stable handle for **`verify`**, **`resend-otp`**, etc. (e.g. normalized email or phone). |

**Side effects (expected)**  
- OTP delivery; **optionally** set no long-lived session until `verify`.  
- If you set **refresh cookie** only after verify, document that.

---

### 5.2 `POST /auth/verify`

| | |
|---|---|
| **Purpose** | Complete registration with OTP; establish session — return ** access token** and **user**; **Set-Cookie** refresh if applicable. |
| **Auth** | No |

**Request body**

```json
{
  "identifier": "from register response",
  "otp": "123456",
  "role": "WORKER",
  "password": "same-as-register",
  "languagePreference": "EN"
}
```

| Field | Notes |
|-------|--------|
| `otp` | Six digits (frontend validates format). |
| `role` | Must match registration intent (`WORKER` \| `EMPLOYER`). |
| `languagePreference` | Optional. |

**Expected 2xx JSON**

```json
{
  "accessToken": "<jwt>",
  "user": {
    "id": "uuid",
    "role": "WORKER",
    "email": "user@example.com",
    "phone": null,
    "languagePreference": "EN",
    "verificationStatus": "PENDING"
  }
}
```

| `user` fields | Notes |
|---------------|--------|
| `role` | `WORKER` \| `EMPLOYER` \| `ADMIN` \| `SUPER_ADMIN` (web uses this for routing decisions). |
| `verificationStatus` | Prefer **`PENDING`** \| **`VERIFIED`** \| **`REJECTED`** \| **`MORE_INFO_REQUIRED`** if available. |

**After this call**, the web calls **`GET /auth/me`** to load full `User`, `dashboardRoute`, and profile shell.

**Cookies:** On success, please issue / refresh the **refresh-token cookie** via `Set-Cookie` (same rules as **`POST /auth/login`**).

---

### 5.3 `POST /auth/login`

| | |
|---|---|
| **Purpose** | Sign in with email **or** phone + password; return tokens; refresh cookie as per your design. |
| **Auth** | No |

**Request body**

```json
{
  "identifier": "user@example.com",
  "password": "string"
}
```

| Field | Notes |
|-------|--------|
| `identifier` | Email or phone string; web **lowercases** when value contains `@`. |

**Expected 2xx JSON** — same shape as §5.2 **`AuthTokensResponse`:**

```json
{
  "accessToken": "<jwt>",
  "user": { "id": "…", "role": "…", "email": "…", "phone": "…", "languagePreference": "EN" }
}
```

Then the web calls **`GET /auth/me`** for **`dashboardRoute`** and profile.

**Side effect:** Please **`Set-Cookie`** for refresh when session is created (same as `verify`).

---

### 5.4 `GET /auth/me`

| | |
|---|---|
| **Purpose** | Source of truth for **current user**, **role**, **dashboard entry path**, and **typed profile** (worker vs employer). Used after login/verify and anywhere the UI needs profile context. |
| **Auth** | **Yes** — `Authorization: Bearer <accessToken>` |

**Request body**  
None.

**Expected 2xx JSON**

```json
{
  "user": {
    "id": "string",
    "email": "string | null",
    "phone": "string | null",
    "role": "WORKER",
    "languagePreference": "EN",
    "verificationStatus": "VERIFIED",
    "isActive": true,
    "createdAt": "ISO-8601",
    "updatedAt": "ISO-8601"
  },
  "dashboardRoute": "/worker/dashboard",
  "profileType": "WORKER",
  "profile": { }
}
```

| Field | Notes |
|-------|--------|
| `user` | Full **`User`** model as you expose to clients (see web `lib/types/models.ts`). |
| `dashboardRoute` | **Path without locale prefix** (e.g. `/worker`, `/employer`, `/admin`). Web strips trailing `/dashboard` and lets i18n add `/en` or `/fr`. **Consistency here is important.** |
| `profileType` | String label or null (e.g. `WORKER`, `EMPLOYER`). |
| `profile` | `WorkerProfile` \| `EmployerProfile` \| **null** if none yet. |

**401** if token missing/invalid/expired (after refresh retry logic).

---

### 5.5 `POST /auth/refresh`

| | |
|---|---|
| **Purpose** | Issue a **new access JWT** using **refresh cookie** (no Bearer required). |
| **Auth** | **Cookie-based** (refresh token); **no** `Authorization` header required. |

**Request body**

```json
{}
```

**Headers**  
`Content-Type: application/json`, `Accept: application/json`, **`Cookie`** (browser automatic with credentials).

**Expected 2xx JSON**

```json
{
  "accessToken": "<new-jwt>"
}
```

**401** / **403** if refresh cookie missing/expired/revoked — web **clears client session** and user must sign in again.

**Important:** This route is called from a **small Axios instance without interceptors** to avoid infinite refresh loops.

---

### 5.6 `POST /auth/logout`

| | |
|---|---|
| **Purpose** | Invalidate server session / refresh rotation; clear cookie if applicable. |
| **Auth** | **Yes** — `Authorization: Bearer <accessToken>` |

**Request body**

```json
{}
```

**Expected 2xx JSON**

```json
{
  "message": "Logged out"
}
```

Optional: `identifier` or other fields — ignored unless we add support.

**Client behavior:** Web clears local session even if request fails (best-effort logout).

**Cookies:** Response should **`Set-Cookie`** to **invalidate** the refresh cookie (empty value + expired `Max-Age` / past `Expires`), or equivalent, so the browser stops sending it.

---

### 5.7 `POST /auth/select-role`

| | |
|---|---|
| **Purpose** | Onboarding: confirm **employer** (and optional display name / language) after signup; returns same shape as **`/auth/me`** for easy store refresh. |
| **Auth** | **Yes** — Bearer |

**Request body**

```json
{
  "role": "EMPLOYER",
  "name": "Acme Corp",
  "languagePreference": "EN"
}
```

| Field | Notes |
|-------|--------|
| `role` | **`WORKER`** \| **`EMPLOYER`** (web uses for employer name capture path). |
| `name`, `languagePreference` | Optional. |

**Expected 2xx JSON** — **same as §5.4** (`AuthMeResponse`).

**404:** Web currently treats **404 as non-fatal** during employer OTP signup (assumes missing route). **Please confirm** intended behavior (deploy guarantee vs. defer).

---

### 5.8 `POST /auth/forgot-password`

| | |
|---|---|
| **Purpose** | Request password-reset OTP. |
| **Auth** | No |

**Request body**

```json
{
  "identifier": "user@example.com"
}
```

**Expected 2xx JSON**

```json
{
  "message": "OTP sent"
}
```

Optional `identifier` in response is allowed.

**Security / UX note (matches web copy):** The public app tells users *“If an account exists for this email/phone, a reset code has been sent”* — the API may **always return 2xx with a generic message** even when no account exists (anti-enumeration). If you instead return **404** when unknown, tell us so we can adjust UI messaging.

---

### 5.9 `POST /auth/reset-password`

| | |
|---|---|
| **Purpose** | Set new password using OTP from forgot-password flow. |
| **Auth** | No |

**Request body**

```json
{
  "identifier": "user@example.com",
  "otp": "123456",
  "newPassword": "string"
}
```

**Expected 2xx JSON**

```json
{
  "message": "Password updated"
}
```

**Client follow-up:** Web then calls **`POST /auth/login`** with `identifier` + `newPassword`, then **`GET /auth/me`**.

**Password rules (client today):** Reset form enforces **8–128 characters** before calling the API. Server validation should **match** or return **`message`** explaining stricter rules (length, complexity) so we can update the UI.

---

### 5.10 `POST /auth/resend-otp`

| | |
|---|---|
| **Purpose** | Resend OTP for **registration** or **password reset**. |
| **Auth** | No |

**Request body**

```json
{
  "identifier": "user@example.com",
  "purpose": "REGISTRATION"
}
```

| `purpose` | Values used by web |
|-----------|-------------------|
| | **`REGISTRATION`** — signup OTP |
| | **`PASSWORD_RESET`** — reset-password OTP |

**Expected 2xx JSON**  
Either **`AuthRegisterResponse`**-like (`message` + `identifier`) or **`AuthMessageResponse`** (`message` optional `identifier`). Web accepts union.

**Operational expectations:** Please document **OTP cooldown**, **max resends per window**, and **account lockout** (if any) so we can align UX copy. **429** + **`message`** should be used when clients hit limits.

---

## 6. Optional / legacy (not used by current web)

| Route / feature | Status |
|-----------------|--------|
| `POST /auth/sync` | **Not used** — legacy Clerk-era doc mention only. |
| **Google OAuth** | **Not used** — `AuthGoogleButton` is disabled in UI; no OAuth callback endpoints consumed by this web app. |

---

## 7. JWT claims (what we expect from access tokens)

Please document for us:

1. **Standard claims** you issue (`sub`, `exp`, `iat`, etc.).
2. **Custom claims** if any (e.g. `role`, `tenantId`).
3. **Access token lifetime** and **refresh token lifetime / rotation** policy.
4. Whether **refresh** returns a **new refresh cookie** (rotation) each time.

The Axios client **does not decode JWT**; it treats it as opaque except that APIs must accept `Bearer <token>`.

---

## 8. Route protection on the web & what we need from you

**Today:** product pages under `/worker`, `/employer`, `/admin` can be requested as URLs without Next checking JWT.

**Target:** Unauthenticated users should **not** use those surfaces (redirect to `/sign-in` or role-appropriate entry).

Two implementation paths:

| Approach | What we need from backend |
|----------|----------------------------|
| **A. Client-only guards** | Reliable **401** on all protected **business** APIs + current refresh behavior. No new routes strictly required. UX: brief flash of shell possible. |
| **B. Server / middleware guards (preferred long-term)** | A **server-validatable** session signal, e.g.: (1) **HttpOnly cookie** with opaque session id + **`GET /auth/session`** or **`HEAD`** check from Next middleware / server; or (2) **access JWT in HttpOnly cookie** + server verify signature with your JWKS/secret; or (3) BFF proxy. **Please specify** recommended pattern for Nest + Next split domains. |

**Ask:** Which approach you officially support first, and any **OpenAPI / Swagger** URL or **machine-readable spec** you can publish.

---

## 9. Follow-up document requested from backend

Please return a short spec that includes:

1. **Confirmation or correction** of every subsection above (especially **cookies**, **CORS**, **`dashboardRoute` rules**, **`select-role` 404** semantics).
2. **Exact cookie names and attributes** per environment.
3. **JWT** lifetimes and claims.
4. **Error schema** if you use something other than `{ message: string \| string[] }`.
5. **OpenAPI** link or attached YAML if available.
6. **Changelog** if any breaking changes are planned.
7. **Transactional templates:** confirm or revise the suggested **§11** email/SMS copy (EN/FR), actual OTP TTL, and sender domains.
8. **§12 Profile routes:** `PATCH` payload schemas, validation errors, and **`403`** when role ≠ resource (e.g. employer calling worker profile).
9. **§1.2** confirmation: employer signup via **`/sign-up/email`** without **`select-role`** — acceptable or not?
10. **§2.2 / §13:** behavior when **`login`** / **`register`** includes a **stale Bearer**; confirm ignore policy or require frontend change.

---

## 10. Reference: web source locations

| Concern | Path |
|---------|------|
| Auth HTTP wrappers | `features/auth/api/auth.ts` |
| TypeScript types | `lib/types/auth.ts`, `lib/types/models.ts`, `lib/types/enums.ts` |
| Axios + 401 refresh | `lib/http/axios-instance.ts`, `lib/http/refresh-access-token.ts` |
| Session after login/verify | `lib/auth/establish-session.ts` |
| Worker profile API client | `features/profile/api/worker-profile.ts` |
| Employer profile API client | `features/profile/api/employer-profile.ts` |
| Earlier narrative doc | `docs/auth-api.md` |

---

## 11. Transactional emails & SMS — suggested copy (frontend-aligned)

The web product is **bilingual (EN / FR)** and uses a **6-digit OTP** on registration and password reset. Below is **suggested** subject/body content your notification service can implement. Replace `{{otp}}`, `{{minutes}}`, and branding URLs with your production values.

**Localization:** Prefer sending in the user’s **`languagePreference`** (`EN` \| `FR`) when known (e.g. at registration or from profile). Otherwise default to English or use your own rules.

**Accessibility:** Put the **code on its own line** and avoid relying only on images for the OTP.

---

### 11.1 Registration — verify new account (email)

**English**

| | |
|---|---|
| **Subject** | Your Joballa verification code |
| **Preheader** *(optional)* | Use this code to finish creating your account. |
| **Body** | Hi,<br><br>Thanks for signing up for **Joballa**. Enter this verification code in the app to continue:<br><br>**{{otp}}**<br><br>This code expires in **{{minutes}} minutes**. If it expires, you can request a new one from the sign-up screen.<br><br>**Do not share this code** with anyone. Joballa will never ask you for it by phone or email.<br><br>If you didn’t try to create a Joballa account, you can safely ignore this message.<br><br>— The Joballa team |

**Français**

| | |
|---|---|
| **Objet** | Votre code de vérification Joballa |
| **Pré-en-tête** *(optionnel)* | Utilisez ce code pour terminer la création de votre compte. |
| **Corps** | Bonjour,<br><br>Merci de vous inscrire sur **Joballa**. Saisissez ce code de vérification dans l’application pour continuer :<br><br>**{{otp}}**<br><br>Ce code expire dans **{{minutes}} minutes**. S’il expire, vous pouvez en demander un nouveau depuis l’écran d’inscription.<br><br>**Ne partagez ce code avec personne.** Joballa ne vous le demandera jamais par téléphone ou par e-mail.<br><br>Si vous n’avez pas tenté de créer un compte Joballa, ignorez ce message.<br><br>— L’équipe Joballa |

---

### 11.2 Registration — verify new account (SMS)

Keep short; the in-app UI says users should check **email or phone** for the code.

**English (example ≤ 160 chars with short expiry):**  
`Joballa: Your code is {{otp}}. Expires in {{minutes}} min. Don’t share it.`

**Français :**  
`Joballa : Votre code est {{otp}}. Expire dans {{minutes}} min. Ne le partagez pas.`

---

### 11.3 Password reset — forgot password (email)

Matches the flow: user taps **Forgot password?** → **`POST /auth/forgot-password`** → receives code → enters it on **Reset password** with a new password (**§5.9**). No magic link is required today (OTP-only in app).

**English**

| | |
|---|---|
| **Subject** | Reset your Joballa password |
| **Preheader** *(optional)* | Use this code to choose a new password. |
| **Body** | Hi,<br><br>We received a request to reset the password for your Joballa account. Use this code in the app:<br><br>**{{otp}}**<br><br>This code expires in **{{minutes}} minutes**. If it expires, go back to **Forgot password** and request a new code.<br><br>**Do not share this code.** Joballa staff will never ask you for it.<br><br>If you **didn’t** request a reset, you can ignore this email — your password will stay the same.<br><br>— The Joballa team |

**Français**

| | |
|---|---|
| **Objet** | Réinitialisez votre mot de passe Joballa |
| **Pré-en-tête** *(optionnel)* | Utilisez ce code pour choisir un nouveau mot de passe. |
| **Corps** | Bonjour,<br><br>Nous avons reçu une demande de réinitialisation du mot de passe de votre compte Joballa. Saisissez ce code dans l’application :<br><br>**{{otp}}**<br><br>Ce code expire dans **{{minutes}} minutes**. S’il expire, retournez à **Mot de passe oublié** et demandez un nouveau code.<br><br>**Ne partagez pas ce code.** L’équipe Joballa ne vous le demandera jamais.<br><br>Si vous n’êtes **pas** à l’origine de cette demande, ignorez ce message — votre mot de passe ne changera pas.<br><br>— L’équipe Joballa |

---

### 11.4 Password reset (SMS)

**English:**  
`Joballa password reset: {{otp}}. Expires in {{minutes}} min. Ignore if this wasn’t you.`

**Français :**  
`Joballa : réinitialisation : {{otp}}. Expire dans {{minutes}} min. Ignorez si ce n’est pas vous.`

---

### 11.5 Optional — welcome after successful verification (email)

Not required for the current API contract; include only if product wants it.

**English — Subject:** `Welcome to Joballa`  
**Body (short):** Confirm the account is active, link to sign-in or getting started, and support contact.

**Français — Objet :** `Bienvenue sur Joballa`  
**Corps :** Courte confirmation que le compte est actif, lien vers la connexion ou la prise en main, contact support.

---

### 11.6 Footer & legal (all auth emails)

Keep a minimal, consistent footer:

- **Sender / product name:** Joballa  
- **Why you got this:** You (or someone using your email/phone) started sign-up or password reset on Joballa.  
- **Help:** Link or address for support (when available).  
- **Don’t reply** *(if using no-reply)*: *“This inbox is not monitored.”*

---

## 12. Authenticated profile REST routes (Bearer), used by the web today

These are **not** under `/auth/*` but share the same **`joballaAxios`** client: **`Authorization: Bearer`**, **`withCredentials: true`**, and the **401 → one refresh retry** behavior described in **§13**.

| Method | Path | Purpose | Success body (web types) |
|--------|------|---------|---------------------------|
| `GET` | `/worker-profiles/me` | Read logged-in worker profile | `WorkerProfile` (`lib/types`) |
| `PATCH` | `/worker-profiles/me` | Partial update | `WorkerProfile` |
| `GET` | `/employer-profiles/me` | Read logged-in employer profile | `EmployerProfile` |
| `PATCH` | `/employer-profiles/me` | Partial update | `EmployerProfile` |

**`PATCH` body:** The web sends a **JSON object**; keys depend on the screen (typed as `Record<string, unknown>` in the client). Backend should **validate** allowed fields and return **400** + **`message`** for unknown or invalid fields.

**Authorization:** **`403`** if the user’s **`role`** does not match the resource (e.g. employer token calling **`/worker-profiles/me`**). **`401`** if token invalid after refresh attempt.

**Ask:** Please publish **OpenAPI** (or equivalent) for **`WorkerProfile`** / **`EmployerProfile`** and allowed **`PATCH`** fields.

---

## 13. Automatic access-token refresh (Axios interceptor)

Behavior implemented in **`lib/http/axios-instance.ts`** and **`lib/http/refresh-access-token.ts`**:

1. **Outgoing requests:** If `Authorization` is not set, client may set **`Bearer`** from in-memory store.
2. **On 401 response:** If the **failed request already had** a Bearer token, client calls **`POST /auth/refresh`** **once** (separate Axios instance, **no** interceptors), with **`withCredentials: true`**, updates the access token in memory, **retries the original request once**.
3. If refresh **fails** (401/403/network): **client clears the session** (access token + user) — user must sign in again.
4. If 401 on a request that **did not** include Bearer (rare for `joballaAxios`): **no** refresh is attempted; error surfaces to the UI.
5. **`POST /auth/refresh` itself** must not create refresh loops (handled by using a bare Axios client).

**Backend implication:** Any **protected** route that returns **401** for an **expired** access token (but valid refresh cookie) should work with this pattern **after** refresh and retry.

---

## 14. Client-side validation & normalization (align server rules)

Values below are enforced **in the browser** before some API calls; server should **match** or return clear **`message`** so we can update forms.

| Area | Client behavior |
|------|-----------------|
| **Registration password (`register` / `verify`)** | UI often uses **min 8 / max 128** characters on password fields (HTML). Server should match or return **`message`**. |
| **Signup / reset OTP** | Must match **`^[0-9]{6}$`** (six digits). |
| **Reset password (`/auth/reset-password`)** | Length **8–128** inclusive; must match confirmation field. |
| **Identifier (email)** | **Trimmed** and **lower-cased** when it contains **`@`** (`forgot-password`, `reset-password`, `sign-in`, etc.). |
| **Identifier (phone)** | **Trimmed**; not lower-cased. |
| **Role enum** | `WORKER` / `EMPLOYER` for signup/register/verify/select-role as documented. |
| **`languagePreference`** | `EN` / `FR` when sent. |

---

## 15. Out of scope on the backend API (web-only)

| Item | Note |
|------|------|
| **Next.js `GET /api/health`** | Served by the **Next** app, not the Joballa Nest API. |
| **Locale / `proxy.ts`** | Next‑intl middleware only; **no** API calls. |

---

*End of handoff document.*
