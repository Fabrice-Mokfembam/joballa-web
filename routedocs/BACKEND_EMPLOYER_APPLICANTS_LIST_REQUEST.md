# Backend Request: Employer Applicant List — Display Name & Headline

**Status:** Implemented — see [`BACKEND_RESPONSE_EMPLOYER_APPLICANT_LIST.md`](./BACKEND_RESPONSE_EMPLOYER_APPLICANT_LIST.md)

**Date:** 2026-06-07  
**From:** Joballa web frontend (`joballa-web-copy`)  
**Priority:** High — employer dashboard applicant cards show wrong identity  
**Related routes:** `GET /employer/applicants`, `GET /employer/dashboard`

---

## Summary

Employer applicant **list** responses are used on the dashboard preview cards and the applicants grid. Two fields block a correct Figma match:

1. **`workerName` is the worker account email** (e.g. `fabricemokfembam@gmail.com`) instead of the applicant's real name.
2. **`workerHeadline` is missing** from list items (e.g. `Frontend Developer, Marketer`), so the subtitle under the name cannot be rendered without an extra detail fetch per card.

The frontend can map field names (`workerName` → display name, `submittedAt` → applied time), but it **cannot invent** a proper full name or headline if the list API only returns an email.

---

## Current behaviour (bug)

Example live list item (observed):

```json
{
  "applicationId": "…",
  "workerName": "fabricemokfembam@gmail.com",
  "workerPhotoUrl": "https://…",
  "workerLocation": "Douala, Littoral",
  "topSkills": ["React", "javascript", "html"],
  "matchScore": null,
  "submittedAt": "2026-06-06T…",
  "jobTitle": "Frontend Engineer (React / Next.js)",
  "verificationStatus": "VERIFIED"
}
```

**UI impact:**

| Card region (Figma) | Expected | Actual with current API |
|---------------------|----------|-------------------------|
| Name (bold) | `Ako James` | `fabricemokfembam@gma…` (email) |
| Subtitle | `Frontend Developer, Marketer` | empty (no headline field) |
| Skills | skill pills | works via `topSkills` |
| Location | city/region | works via `workerLocation` |

Detail page (`GET /employer/applicants/:applicationId`) already has `profileSnapshot` with `fullName`, `headline`, etc. — but the **list** endpoint does not expose enough for cards.

---

## Required backend changes

### 1. Fix display name on list items

**`workerName` must be the worker's display name**, not login email.

Recommended source (in order):

1. `profileSnapshot.fullName` at application time (immutable snapshot — preferred for hiring)
2. Else `workers` profile `full_name` / `first_name` + `last_name` at read time
3. Never fall back to `users.email` for `workerName`

Optionally expose email separately if needed for admin/support:

```ts
workerEmail?: string | null;  // optional, not for card title
```

### 2. Add headline to list items

Add a dedicated field for the card subtitle:

```ts
workerHeadline?: string | null;
```

Recommended source:

1. `profileSnapshot.headline`
2. Else `profileSnapshot.professionalTitle`
3. Else worker profile headline / short professional title

Do **not** reuse `jobTitle` for this — that is the **job posting** the person applied to, not their professional headline.

### 3. Updated list item contract

Please update **`EmployerApplicantListItem`** on:

- `GET /employer/applicants`
- `GET /employer/dashboard` → `recentApplicants[]` (same shape)

```ts
type EmployerApplicantListItem = {
  id: string;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  workerId: string;

  /** Display name for cards — MUST NOT be email */
  workerName: string;
  /** Professional subtitle under name, e.g. "Frontend Developer, Marketer" */
  workerHeadline?: string | null;

  workerPhotoUrl?: string | null;
  workerLocation?: string | null;
  topSkills: string[];
  verificationStatus: string;
  availabilityStatus?: string | null;
  status: "submitted" | "shortlisted" | "hired" | "rejected";
  matchScore?: number | null;
  submittedAt: string;

  /** Optional — only if product needs it; do not use as workerName */
  workerEmail?: string | null;
};
```

### 4. Example — corrected response

```json
{
  "applicationId": "a1b2c3d4-…",
  "workerName": "Fabrice Mokfembam",
  "workerHeadline": "Frontend Developer, Marketer",
  "workerPhotoUrl": "https://…",
  "workerLocation": "Douala, Littoral",
  "topSkills": ["React", "javascript", "html"],
  "matchScore": 72,
  "submittedAt": "2026-06-06T14:22:00.000Z",
  "jobTitle": "Frontend Engineer (React / Next.js)",
  "verificationStatus": "VERIFIED",
  "status": "submitted",
  "workerEmail": "fabricemokfembam@gmail.com"
}
```

---

## Acceptance criteria

1. Every item in `GET /employer/applicants` has `workerName` that is **not** an email when the worker profile or application snapshot contains a real name.
2. `workerHeadline` is present when the application snapshot includes headline / professional title.
3. `jobTitle` remains the applied job posting title (unchanged).
4. Dashboard `recentApplicants` uses the same normalized list mapper (no email-as-name regression).
5. Existing detail route `GET /employer/applicants/:applicationId` remains compatible; `profileSnapshot.fullName` should match list `workerName` when snapshot exists.

---

## Frontend status

| Item | Status |
|------|--------|
| Map `workerName`, `submittedAt`, `workerPhotoUrl`, `workerLocation`, `topSkills[]` | Done (`normalize-employer-applicant.ts`) |
| Reject email-shaped values when profile `fullName` exists | Defensive guard (`resolve-applicant-display.ts`) |
| Show headline when `workerHeadline` arrives | Ready — UI reads `workerHeadline` / snapshot headline |
| Correct name without backend fix | Blocked if list only returns email and no snapshot on list |

After backend deploy, cards should populate automatically once list fields are correct.

---

## Doc updates requested

Please mirror this contract in:

- `routedocs/FRONTEND_EMPLOYER_ROUTES.md` → `EmployerApplicantListItem`
- Backend `EMPLOYER_ROUTES.md` (or equivalent OpenAPI) if maintained separately

---

## Verification after backend deploy

1. Sign in as employer with `NEXT_PUBLIC_USE_DEMO_DATA=false`
2. Open `/en/employer`
3. Applicant preview card shows **full name** (not email) and **headline** when profile has one
4. `GET /employer/applicants?limit=3` JSON matches the contract above
