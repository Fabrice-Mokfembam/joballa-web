# Backend Request: Employer Applicant Detail — Complete `profileSnapshot`

**Date:** 2026-06-07  
**From:** Joballa web frontend (`joballa-web-copy`)  
**Status:** Implemented on backend (2026-06-07) — frontend aligned in same release cycle  
**Related routes:** `GET /employer/applicants/:applicationId`  
**Backend response:** [BACKEND_RESPONSE_EMPLOYER_APPLICANT_DETAIL.md](./BACKEND_RESPONSE_EMPLOYER_APPLICANT_DETAIL.md)

---

## Summary

The employer **applicant detail page** (Figma profile card, node `336-8998`) is wired on the frontend, but the API **`profileSnapshot`** returned by `GET /employer/applicants/:applicationId` is **too sparse** for employers to review a candidate before shortlisting/hiring.

List-level fixes (`workerName`, `workerHeadline`, `topSkills`) help dashboard cards, but the **detail snapshot** still omits most sections the UI is designed to show.

---

## What we see in production (example)

Applicant: **MOKFEMBAM KONGNYUY** (live API, June 2026)

| UI section | Expected (Figma / contract) | Actually rendered |
| --- | --- | --- |
| Avatar | Worker photo | ✅ Present |
| Name | Person name | ✅ Present (all caps — cosmetic) |
| Headline | `professionalTitle` e.g. "Frontend Developer, Marketer" | ⚠️ Shows **"Inspire and Innovate"** — likely wrong field (tagline/bio?) |
| Location | City, region | ✅ "Douala, Littoral" |
| Phone | `(+237) …` | ❌ Missing |
| Languages | "Speaks English, French" | ⚠️ Only **English** |
| Professional summary | Paragraph + industries + availability | ❌ Only raw **`available`** (from `availabilityStatus`) — no `summary` / `bio` / `professionalSummary`, no `industries` |
| Skills | Full list with job-matched highlights | ⚠️ Only 4 skills (`React, javascript, html, css`) — no `highlightedSkills` split |
| Work history | 1+ entries with company, role, description, dates, location | ❌ Section empty — no `workHistory` / `workHistories` |
| Supporting documents | PDF/JPG rows with name + size | ❌ Section empty — no `documents` / `attachedDocuments` metadata |

**Conclusion:** Frontend parsing is in place for both UI-normalized and worker-DB snapshot shapes. Empty sections mean the backend snapshot **does not include the data** (or apply-time capture is incomplete).

---

## Required contract

`GET /employer/applicants/:applicationId` must return:

```ts
type EmployerApplicantDetail = EmployerApplicantListItem & {
  coverNote?: string | null;
  employerNotes?: string | null;
  attachedDocuments?: ApplicantDocument[];
  profileSnapshot: ApplicantProfileSnapshot; // REQUIRED — full apply-time copy
  job: EmployerJobDetail;
};
```

### `ApplicantProfileSnapshot` (minimum for employer review UI)

Either the **UI-normalized shape** (preferred for employer detail) **or** the **worker DB shape** — frontend coerces both. Must include:

```ts
type ApplicantProfileSnapshot = {
  // Identity
  fullName: string;
  headline?: string;                    // OR professionalTitle
  professionalTitle?: string;
  avatarUrl?: string | null;
  verificationStatus?: string;          // "VERIFIED" for badge

  // Contact (header right column)
  location?: string;                    // OR city + region + country
  city?: string;
  region?: string;
  country?: string;
  phone?: string;                       // OR phoneNumber — employer-visible at apply time
  languages?: string;                   // OR languagesSpoken: string[]

  // Professional summary block (3 lines in UI)
  summary?: string;                     // OR professionalSummary OR bio — paragraph text
  industries?: string | string[];       // e.g. "Design & Creative, Software & Tech"
  availability?: string;                // OR availabilityStatus + preferredJobTypes[]
  preferredJobTypes?: string[];         // FULL_TIME, PART_TIME → "Full-time, part-time"
  availabilityStatus?: "AVAILABLE" | "NOT_AVAILABLE";

  // Skills
  skills: string[];
  highlightedSkills?: string[];           // job-matched subset; else derive from job requirements ∩ skills

  // Work history
  workHistory?: WorkHistoryEntry[];     // OR workHistories[] (worker DB shape)
};

type WorkHistoryEntry = {
  company?: string;                     // OR companyName
  role?: string;                        // OR jobTitle
  description?: string;
  period?: string;                      // OR startMonth/startYear/endMonth/endYear OR startDate/endDate
  location?: string;
  city?: string;
  region?: string;
};

type ApplicantDocument = {
  name: string;                         // OR fileName
  type?: string;                        // PDF, JPG, CV
  size?: string | number;               // OR fileSize — e.g. "1 MB"
  url?: string;
};
```

Reference: `docs/BACKEND_WORKER_VERIFICATION_TODOS.md` § Employer applicant detail (`submittedProfile` / snapshot example ~line 1107).

---

## Apply-time capture (root cause)

When a worker submits `POST /worker/jobs/:jobId/apply` (or equivalent), the server must persist a **complete immutable `profileSnapshot`** copied from the worker's public profile at that moment:

| Worker profile source | Snapshot field |
| --- | --- |
| `worker_profiles.fullName` / first+last | `fullName` |
| `worker_profiles.professionalTitle` | `headline` / `professionalTitle` |
| `worker_profiles.bio` | `summary` / `professionalSummary` |
| `worker_profiles.industries[]` | `industries` |
| `worker_profiles.preferredJobTypes[]` | `preferredJobTypes` |
| `worker_profiles.availabilityStatus` | `availabilityStatus` |
| `worker_profiles.skills[]` | `skills` |
| `worker_work_histories` rows | `workHistories[]` or `workHistory[]` |
| `worker_documents` (CV, certs) | `documents[]` |
| `users.phone` (if employer-visible) | `phone` |
| `worker_profiles.languagesSpoken[]` | `languagesSpoken` / `languages` |
| `worker_profiles.avatarUrl` | `avatarUrl` |

**Do not** store company taglines, placeholder text, or availability-only blobs as the only summary content.

---

## Headline bug (observed)

`workerHeadline` / snapshot headline for **MOKFEMBAM KONGNYUY** resolves to **"Inspire and Innovate"**, which is not a job title.

Please verify resolution order:

1. `profileSnapshot.headline`
2. `profileSnapshot.professionalTitle`
3. `workerProfile.professionalTitle`

**Not:** `bio`, `tagline`, company slogan, or first line of summary.

---

## `highlightedSkills` / match display

Figma shows some skills **bold** (job-relevant) and others muted. Frontend uses:

1. `profileSnapshot.highlightedSkills[]` if present
2. Else intersection of `profileSnapshot.skills[]` with job `requiredSkills[]`
3. Else list-level `topSkills[]` from applicant list mapper

Please populate `highlightedSkills` at apply time or ensure `topSkills` on detail matches job-relevant skills.

---

## `attachedDocuments` vs `profileSnapshot.documents`

Detail route may return both:

- `profileSnapshot.documents[]` — snapshot of worker docs at apply time (preferred for review card)
- `attachedDocuments[]` — docs attached to this specific application

Frontend merges both. Please return **filename + type + size** (not bare UUIDs or URLs only).

---

## Acceptance criteria

| # | Criterion |
| --- | --- |
| 1 | `profileSnapshot.summary` (or `bio` / `professionalSummary`) is a real paragraph when worker profile has bio |
| 2 | `profileSnapshot.industries` populated when worker has industries |
| 3 | `profileSnapshot.workHistory` or `workHistories` has ≥1 entry when worker has work history |
| 4 | `profileSnapshot.documents` or `attachedDocuments` has filename + size when worker uploaded CV/certs |
| 5 | `profileSnapshot.phone` present when employer is allowed to see worker phone at apply time |
| 6 | `workerHeadline` / snapshot headline = `professionalTitle`, not tagline/bio |
| 7 | `highlightedSkills` or detail-level `topSkills` reflects job match |
| 8 | Existing list route fields unchanged (`workerName`, `workerHeadline`, etc.) |

---

## Verification

```http
GET /employer/applicants/:applicationId
Authorization: Bearer <employer token>
```

Inspect `profileSnapshot` JSON for applicant **MOKFEMBAM KONGNYUY** (or any worker with complete worker profile). Compare against table above.

Suggested smoke assertion (employer v2 script):

```js
const detail = await GET(`/employer/applicants/${id}`);
const snap = detail.profileSnapshot;
assert(snap.fullName && !snap.fullName.includes("@"));
assert(snap.summary || snap.bio || snap.professionalSummary, "summary missing");
assert(Array.isArray(snap.workHistory || snap.workHistories) && (snap.workHistory || snap.workHistories).length > 0, "work history missing");
```

---

## Frontend status

- Detail UI implemented per Figma `336-8998`
- Parser coerces worker DB + UI-normalized snapshot shapes (`coerceProfileSnapshot`, `parseApplicantDetailProfile`)
- **No further UI work can fill empty work history / documents / summary** — data must come from API snapshot

---

## Priority

**High** — Employers cannot make informed hire/shortlist decisions without full profile on the detail page. List card fixes alone are insufficient.
