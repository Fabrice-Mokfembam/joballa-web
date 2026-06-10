# Worker Profile, Applications, CV & Notifications — Outstanding Backend Work

**Date:** June 9, 2026  
**Contract reference:** [BACKEND_RESPONSE_WORKER_PROFILE_JUNE_2026_REQUIREMENTS.md](./BACKEND_RESPONSE_WORKER_PROFILE_JUNE_2026_REQUIREMENTS.md)  
**Frontend:** `features/worker/api/worker-portal.live.ts`, `features/worker/types/worker-portal.ts`

---

## 1. Supporting documents — human-readable `fileName` (blocking)

### Problem

`GET /worker/profile` and `GET /worker/profile/documents` return storage-derived names that are not readable in the UI, for example:

```
portfolio_50b5ca0d-8284-443d-a572-2ead34892a77_1781056003133
```

Workers uploaded a file named e.g. `my-portfolio.pdf` or `resume.pdf`, but the API surfaces an internal key (`{type}_{uuid}_{timestamp}`) instead of the original filename.

### Required response shape

```ts
type WorkerDocument = {
  id: string;
  type: string;           // CV | CERTIFICATE | PORTFOLIO | OTHER (from upload label)
  fileName: string;       // original upload name, e.g. "my-portfolio.pdf"
  displayName?: string;   // optional alias — same as fileName if unset
  url: string;            // HTTPS view URL
  mimeType?: string;
  fileType?: "pdf" | "image";
  createdAt: string;
};
```

### Rules

- Persist the **original client filename** at upload time (`POST /worker/profile/documents`).
- Never return raw Cloudinary public IDs or `{type}_{uuid}_{timestamp}` as `fileName`.
- For PDF uploads specifically, ensure extension is preserved (`.pdf`).
- `type` should reflect the upload category (`documentLabel` / query `type`), not the storage key prefix.

---

## 2. CV export — not working end-to-end (blocking)

### Problem

Worker profile **Export CV** / **Download CV** fails against the live API. Frontend calls:

| Method | Path |
| --- | --- |
| `GET` | `/worker/profile/cv-export/status` |
| `POST` | `/worker/profile/cv-export` |
| `GET` | `/worker/profile/cv-export` |

### Expected behaviour

1. `GET .../status` returns JSON with `available`, `downloadUrl` (relative path e.g. `/worker/profile/cv-export`), `fileName`, `isOutdated`.
2. `POST` and `GET` return `application/pdf` bytes with `Content-Disposition: attachment`.
3. Auth: Bearer worker token; role `worker`.
4. Minimum profile: `fullName` (or first+last) and professional summary (`shortBio` / `summary`).
5. Do not expose raw Cloudinary URLs in JSON — only `downloadUrl` on status.

### Errors to surface clearly

- `403` when profile incomplete for export
- `404` when no cached export on `GET`
- `500` with message when PDF generation fails (frontend falls back to client PDF only on network/5xx)

---

## 3. Apply profile customization — server draft + submit payload

### Current frontend behaviour (June 2026)

- Customize-role edits are stored **only in `sessionStorage`** until the worker submits the application.
- **No** `GET` / `PUT /worker/jobs/:jobId/application/profile` calls during customize or between steps (those routes return `Cannot PUT …` on live API today).
- On **submit only**, the client calls `POST /worker/jobs/:jobId/application/customize-profile` with `CustomizeProfileBody`, then `POST /worker/jobs/:jobId/apply`.

### Required backend behaviour

1. **`POST …/application/customize-profile`** — accept full `CustomizeProfileBody` (including `professionalTitle`) and persist until apply or 7-day TTL.
2. **`POST …/apply`** — merge the latest customization into immutable `profileSnapshot` (or accept `customizedData` inline on apply body as an alternative).
3. **`GET` / `PUT …/application/profile`** — implement when ready so clients can optionally sync drafts across devices; not required for current web flow.

`professionalTitle` must be accepted and merged into the final `profileSnapshot`.

```ts
type CustomizeProfileBody = {
  professionalTitle?: string;
  professionalSummary?: string;
  bio?: string;
  skills?: string[];
  languages?: string[];
  region?: string;
  city?: string;
  detachedWorkHistoryIds?: string[];
  detachedEducationIds?: string[];
  detachedCertificationIds?: string[];
  detachedDocumentIds?: string[];
};
```

---

## 4. Incoming applications on worker jobs — `GET /worker/jobs/applications` (blocking)

### Problem

Workers switching to **Applications → To my jobs** receive **500 Internal Server Error** from `GET /worker/jobs/applications`.

### Expected behaviour

- Register the static route **before** `GET /worker/jobs/:jobId` so `applications` is not parsed as a job id.
- Return paginated list (`data[]` or `items[]`) with `applicantName`, `applicantAvatarUrl`, `jobTitle`, `jobId`, `status`, `appliedAt`, `matchPercent`, `profileSnapshot`.
- Detail: `GET /worker/jobs/applications/:applicationId`.

### Worker department catalog

`GET /employer/departments` must be callable by **worker** role (or expose `GET /worker/departments`) so post-job department select is populated from the API, not env fallback only.

---

## 5. Notification triggers — v2

Wire remaining worker-facing triggers (v1 only has apply submitted + KYC submitted):

| Trigger | Suggested `type` |
| --- | --- |
| Application shortlisted | `application_shortlisted` |
| Application rejected | `application_rejected` |
| Application accepted / hired | `application_accepted` / `hired` |
| Engagement lifecycle | `contract_update` |
| KYC approved / rejected | `kyc_update` |
| Payment received / sent | `payment_received` / `payment_sent` |

Include `title`, `body`, `deepLink`, optional `metadata`.

---

## 6. KYC outcome notifications

On admin approve / reject / `changes_requested`: notify worker with deep link to profile verification; include rejection reason when applicable.

---

## 7. CV export — PDF layout polish (optional)

Improve server PDF spacing, hierarchy, and section alignment. Snapshot fields (work, education, certs, languages) should match public profile layout.

---

## 8. Payment `POST` upsert by provider (optional)

`POST /worker/profile/payment-accounts` should upsert when `provider` already exists for the worker (MTN / Orange tab save).

---

## 9. Deprecate legacy payment scalars (cleanup)

Remove root `mobileMoneyProvider` / `mobileMoneyNumber` from `GET /worker/profile` once all clients use `paymentMethods`.

---

## References

| Doc | Purpose |
| --- | --- |
| [BACKEND_RESPONSE_WORKER_PROFILE_JUNE_2026_REQUIREMENTS.md](./BACKEND_RESPONSE_WORKER_PROFILE_JUNE_2026_REQUIREMENTS.md) | Shipped API contracts |
| [BACKEND_RESPONSE_WORKER_CV_EXPORT.md](./BACKEND_RESPONSE_WORKER_CV_EXPORT.md) | CV export detail |
| [FRONTEND_WORKER_ROUTES.md](./FRONTEND_WORKER_ROUTES.md) | Worker route index |
