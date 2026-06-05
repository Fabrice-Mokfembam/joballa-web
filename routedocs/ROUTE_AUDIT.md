# Route audit (frontend vs routedocs vs backend docs)

Last updated: **2026-06-04**. Use this file as the source of truth for implementation status.

## API path convention

| Doc set | Path style | Example |
| --- | --- | --- |
| `routedocs/FRONTEND_*.md` | v2, no `/api` prefix | `GET /worker/jobs` |
| `VERIFIED_API_INTEGRATION.md` | v2 smoke targets | `GET /employer/me` |
| `AUTH_ROUTES.md`, `WORKER_ROUTES.md`, `EMPLOYER_ROUTES.md` | Legacy Nest prefix | `GET /api/worker/me` |
| **This codebase (`features/*/api/*.live.ts`)** | **v2 — no `/api` prefix** | `GET /worker/me`, `GET /employer/me` |

Auth routes use `/auth/*` (no `/api`). List responses are normalized from v2 `{ data, total, … }` to `{ items, total, … }` in `lib/http/normalize-paginated.ts`.

---

## Auth (`FRONTEND_AUTH_ROUTES.md` ↔ `AUTH_ROUTES.md`)

| Frontend route | Page | API | Backend doc | Status |
| --- | --- | --- | --- | --- |
| `/login` | redirect | — | — | OK — preserves query params |
| `/signup` | redirect | — | — | OK |
| `/sign-up/role` | yes | local | — | OK |
| `/sign-up/phone`, `/email` | yes | `POST /auth/register` | yes | OK |
| `/sign-up/verify/*` | yes | verify + resend | yes | OK |
| `/sign-in`, `/sign-in/email` | yes | `POST /auth/login` | yes | OK |
| `/sign-in/phone` | redirect | — | — | OK |
| `/forgot-password`, `/reset-password` | yes | yes | yes | OK |
| `/sign-up/interests`, `/post-categories`, `/profile` | yes | worker profile PATCH | in `AUTH_ROUTES.md` | OK — documented in backend doc, add to FRONTEND_AUTH if needed |
| Session APIs | client | me, refresh, logout, resend | yes | OK |
| `POST /auth/select-role` | client | yes | **added to `AUTH_ROUTES.md`** | OK |

**Partial / doc drift:** Worker post-verify goes to onboarding (`/sign-up/interests`), not straight to `/worker/jobs`. Verify sends `{ identifier, otp, purpose? }` only — **not** `role` / `password` / `preferredLanguage` (see `VERIFIED_API_INTEGRATION.md`).

---

## Employer (`FRONTEND_EMPLOYER_ROUTES.md` ↔ `EMPLOYER_ROUTES.md`)

| Frontend route | Page | API client | Backend doc | Status |
| --- | --- | --- | --- | --- |
| `/employer` | yes | dashboard | yes | OK |
| `/employer/jobs`, `/new`, `/[jobId]` | yes | yes | yes | Partial — job PATCH/draft not in job detail UI |
| `/employer/applicants`, `/[applicantId]` | yes | yes | yes | OK |
| `/employer/workforce`, `/[workerId]` | yes | yes | yes | OK — status PATCH on detail page |
| `/employer/payroll` | yes | yes | yes | Partial — statement API unused; pay payload shape may differ |
| `/employer/payroll/[paymentId]` | **yes** | `getEmployerPayment` | yes | OK |
| `/employer/profile`, `/edit` | yes | company + logo | yes | Partial — company documents API not wired |
| `/employer/requests`, `/new` | **yes** | informal-requests | yes | OK |
| `/employer/notifications` | yes | yes | yes | OK |
| `/employer/settings` | yes | PATCH notifications | yes | Partial — GET notifications stubbed; language API not wired |

---

## Worker (`FRONTEND_WORKER_ROUTES.md` ↔ `WORKER_ROUTES.md`)

| Frontend route | Page | API client | Backend doc | Status |
| --- | --- | --- | --- | --- |
| `/worker` | redirect → jobs | — | yes | OK |
| `/worker/jobs`, `/search`, `/[jobSlug]` | yes | `/api/jobs` | yes | OK — search reuses jobs API |
| `/worker/jobs/.../apply` | yes | apply | yes | OK |
| `/worker/dashboard` | yes | yes | yes | OK |
| `/worker/applications`, `/search`, `/[slug]` | yes | yes | yes | Partial — DELETE not on detail page |
| `/worker/saved-jobs` | yes | yes | yes | OK |
| `/worker/engagements` | yes | yes | yes | OK |
| `/worker/engagements/[engagementId]` | **yes** | `getWorkerEngagement` | yes | OK |
| `/worker/earnings`, `/[transactionId]` | yes | yes | yes | Partial — `GET …/statement` not used in UI |
| `/worker/profile`, `/edit` | yes | PUT profile + docs/KYC | yes | Partial — CV upload/export, granular PATCH, payment accounts |
| `/worker/my-jobs`, `/jobs/new` | yes | **`/api/worker/jobs`** (owned) | informal in doc | **Doc mismatch** — code uses owned jobs, routedoc says informal-requests |
| `/worker/notifications` | yes | yes | yes | OK |
| `/worker/settings` | yes | PATCH notifications | yes | Partial — GET notifications stubbed; language via locale only |
| `/worker/payments` | redirect → earnings | — | yes | Extra (documented in WORKER_ROUTES) |

---

## Remaining gaps (prioritized)

1. **Worker informal-requests** — align `my-jobs` / `jobs/new` with `GET/POST /worker/informal-requests` or update FRONTEND_WORKER_ROUTES.
2. **Settings GET** — replace stubs for worker/employer notification settings queries.
3. **Profile** — employer company documents; worker CV upload/export; payment accounts UI.
4. **Payroll** — wire `GET …/payments/statement`; align pay body with backend (`engagementId`, providers).
5. **Pagination shape** — routedocs use `{ data, totalPages }`; many clients expect `{ items, total }` — normalize or document.

---

## How to re-audit

```bash
# List app routes
Get-ChildItem -Recurse app -Filter page.tsx

# Compare to routedocs sections
rg "^### \`" routedocs/FRONTEND_*.md
```
