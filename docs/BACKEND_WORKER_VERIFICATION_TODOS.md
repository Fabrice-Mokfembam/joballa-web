# Backend TODOs — Worker & Employer Portals (Profile, Jobs, Applications, Workforce, Verification)

This document reflects the current **worker** and **employer** frontend designs and the backend changes needed to support them end to end. It is based on the frontend API layer, portal pages implemented so far, and the database model summary in `docs/database-data-structure.md`.

**Related docs**

| Doc | Purpose |
| --- | --- |
| `docs/database-data-structure.md` | Prisma/table baseline and proposed columns |
| `docs/backend-auth-handoff.md` | Auth/session contract (refresh, cookies, `/auth/me`) |
| `docs/FRONTEND_EMPLOYER_PORTAL_API_GUIDE_MAY_2026.md` | Existing employer route index (verify against this TODO list) |
| `docs/FRONTEND_WORKER_PORTAL_API_GUIDE_MAY_2026.md` | Worker route index |

The live backend schema is not present in this repo. The model comparison below uses `docs/database-data-structure.md` as the current backend model baseline.

## Current Backend Model Baseline

The documented backend model already has these worker-related tables/fields:

- `worker_profiles`: `fullName`, `firstName`, `lastName`, `city`, `region`, `country`, `dateOfBirth`, `languagesSpoken`, `professionalTitle`, `bio`, `industries`, `preferredJobCategories`, `preferredJobTypes`, `availabilityStatus`, `skills`, `nationalIdDocUrl`, `verificationStatus`, `verificationNotes`, `uploadedResumeUrl`, `profileCompleteness`, `mobileMoneyProvider`, `mobileMoneyNumber`, `bankName`, `bankAccountNumber`.
- `work_histories`: `company`, `role`, `location`, `description`, `startDate`, `endDate`, `isCurrent`.
- `educations`: `school`, `degree`, `fieldOfStudy`, `startDate`, `endDate`, `isCurrent`.
- `certifications`: `name`, `issuer`, `issueDate`, `expiryDate`, `fileUrl`.
- `worker_documents`: `type`, `fileName`, `fileUrl`, `fileSize`, `mimeType`, `reviewStatus`, `riskLevel`, `rejectionReason`, `departmentCategory`, `reviewedAt`, `reviewedById`, `uploadedAt`.
- `kyc_submissions`: `documentType`, `frontImageUrl`, `backImageUrl`, `status`, `rejectionReason`, `submittedAt`, `reviewedAt`, `reviewedById`, `reviewNotes`.
- `jobs`: employer-created job fields exist, but worker-created jobs need explicit support or a documented mapping.
- `applications`: stores a `profileSnapshot`, `jobSpecificNote`, `attachedDocuments`, `status`, `employerNotes`.
- `employer_profiles`: company identity, verification, payout — see [`employer_profiles`](#employer_profiles) below for new `tagline` and computed stats.
- `work_engagements`: hired workers; workforce UI needs role, shift counts, and tab-friendly status labels.
- `shift_logs`: hours logged per engagement; workforce inline shift log and worker detail page.

## Model Gaps From Current Designs

## Schema Additions Required

These are the database-level additions needed for the current worker panel designs. Some fields can be implemented as aliases in API responses first, but the durable schema should support them directly.

### `worker_profiles`

Add or expose:

- `avatarUrl String?` or `profileImageUrl String?`
- `profileStrengthBreakdown Json?` if the backend stores the computed checklist instead of calculating it on every response
- `profileViews Int @default(0)` or a separate profile analytics table if profile views need history

Keep existing `bio`, but return it as `summary` in worker-facing APIs.

### `worker_payment_accounts` new table

The UI supports more than one payout account and a primary account.

Columns:

- `id String @id`
- `workerId String`
- `provider MomoProvider`
- `phone String`
- `isPrimary Boolean @default(false)`
- `createdAt DateTime`
- `updatedAt DateTime`

Constraints and indexes:

- Index `workerId`
- Only one primary account per worker
- Optional unique constraint on `workerId + provider + phone`

Legacy fields `mobileMoneyProvider` and `mobileMoneyNumber` can remain during migration, but worker profile responses should prefer `paymentAccounts[]`.

### `work_histories`

Add fields needed by edit/public profile:

- `website String?`
- `city String?`
- `region String?`
- `startMonth String?`
- `startYear Int?`
- `endMonth String?`
- `endYear Int?`

Keep `startDate` and `endDate` as canonical sortable dates. Month/year fields support the form and display exactly.

### `educations`

Add fields needed by edit/public profile:

- `website String?`
- `city String?`
- `region String?`
- `description Text?`
- `startMonth String?`
- `startYear Int?`
- `endMonth String?`
- `endYear Int?`

### `certifications`

Add or expose:

- `description Text?`
- `credentialUrl String?`
- `documentId String?` linked to `worker_documents.id`

### `kyc_submissions`

Add:

- `selfieImageUrl String?`

Return aliases:

- `frontIdImageUrl` for `frontImageUrl`
- `backIdImageUrl` for `backImageUrl`

### `jobs`

Worker-created jobs can use the same `jobs` table if ownership is made explicit.

Add:

- `createdByWorkerId String?` relation to `worker_profiles.id`
- `createdByType String` or enum: `EMPLOYER`, `WORKER`
- `region String?` if not already derivable from `location`
- `applicationCount Int` can be computed, but list/detail APIs must return it

Rules:

- Exactly one of `employerId` or `createdByWorkerId` should be present.
- Worker-created jobs still require admin review before publication.
- Worker-created jobs must be blocked unless the creator's KYC is `VERIFIED`.

### `applications`

Add or expose:

- `matchPercent Int?`
- `lastStatusMessage String?`
- `interviewAt DateTime?`
- `offerValidUntil DateTime?`
- `archivedByWorkerAt DateTime?` if worker archive differs from employer/admin archive

Keep `profileSnapshot Json` and ensure it stores the full public profile shape at application time.

### `payments`

Add or expose:

- `paymentPlatform String?` such as `FAPSHI`
- `paymentMethod String?` such as `MTN_MOMO` or `ORANGE_MONEY`
- `completedAt DateTime?` aliasing `confirmedAt` if needed
- `receiptNumber String?` or use a stable generated display reference

The worker earnings UI does not need hours worked, platform fee, payment timeline, share, flag, delete, or contact employer actions.

### Worker profile naming and shape

Frontend currently accepts some legacy/backend names, but the backend should normalize response aliases so every worker profile payload is consistent across `GET /api/worker/me`, `GET /api/worker/profile`, `GET /api/worker/profile/:workerId/public`, applications, employer applicant details, and application snapshots.

Required response fields:

- `id`, `userId`
- `firstName`, `lastName`, `fullName`
- `avatarUrl` or `profileImageUrl`
- `professionalTitle`
- `summary` and/or `bio`; frontend currently reads `summary`, while the documented DB has `bio`
- `city`, `region`, `country`
- `phone` from the user account or profile
- `languages: string[]` and/or `languagesSpoken: string[]`; frontend currently reads `languages`
- `availabilityStatus`
- `verificationStatus`
- `profileCompleteness`
- optional `profileStrengthBreakdown`
- `industries: string[]`
- `preferredJobCategories: string[]`
- `preferredJobTypes: string[]`
- `skills: string[]`
- `workHistories[]`
- `educations[]`
- `certifications[]`
- `documents[]`
- `kycSubmissions[]`
- payment details for the logged-in worker only

Recommended backend response aliases:

- Map `worker_profiles.bio` to `summary` in API responses, while keeping `bio` if needed.
- Map `languagesSpoken` to `languages`.
- Map `work_histories.company` to `companyName`.
- Map `work_histories.role` to `jobTitle`.
- Map `educations.school` to `institution`.
- Map `worker_documents.fileUrl` to `url`, or return both `fileUrl` and `url`.
- Map `kyc_submissions.frontImageUrl` to `frontIdImageUrl`.
- Map `kyc_submissions.backImageUrl` to `backIdImageUrl`.
- Return `bankAccountNumber` and `accountNumber` consistently, or pick one and document it.

### Worker profile fields to add or expose

The edit and public profile designs need these fields. Some are already stored, but may not be exposed in the current API contract.

- `avatarUrl` on `worker_profiles`, if the backend does not already store it.
- `phone` on profile responses, sourced from `users.phone` or profile contact details.
- Multiple payment accounts:
  - Current model has one `mobileMoneyProvider` and `mobileMoneyNumber`.
  - Design shows multiple accounts, such as MTN MoMo primary and Orange Money secondary.
  - Add a `worker_payment_accounts` table or a JSON field:
    - `id`
    - `provider`: `MTN_MOMO` or `ORANGE_MONEY`
    - `phone`
    - `isPrimary`
    - `createdAt`, `updatedAt`
- Work history design fields missing from the documented `work_histories` model:
  - `website`
  - `city`
  - `region`
  - `startMonth`
  - `startYear`
  - `endMonth`
  - `endYear`
- Education design fields missing from the documented `educations` model:
  - `website`
  - `city`
  - `region`
  - `description`
  - `startMonth`
  - `startYear`
  - `endMonth`
  - `endYear`
- Certification should be returned in the public/profile payload and may need:
  - `description`
  - `credentialUrl`
  - `documentId`
- KYC design fields missing from the documented `kyc_submissions` model:
  - `selfieImageUrl`
  - explicit `frontIdImageUrl` / `backIdImageUrl` response aliases if model keeps `frontImageUrl` / `backImageUrl`
- Documents should return:
  - `fileSize`
  - `mimeType`
  - `uploadedAt`
  - `url` alias for `fileUrl`

## Profile Update Route Needed

The edit profile page is now designed around a single update route for all editable profile subsections.

### `PUT /api/worker/profile`

Auth: worker only.

Purpose: update any subset of profile fields and return the full recomputed profile.

Body should accept partial data:

```json
{
  "firstName": "Ako",
  "lastName": "James",
  "city": "Buea",
  "region": "Southwest",
  "country": "Cameroon",
  "languages": ["English", "French"],
  "availabilityStatus": "AVAILABLE",
  "professionalTitle": "Frontend Developer, Marketer",
  "summary": "Senior frontend developer...",
  "industries": ["Design & Creative", "Software & Tech"],
  "preferredJobCategories": ["Frontend Developer"],
  "preferredJobTypes": ["FULL_TIME", "PART_TIME"],
  "skills": ["React", "Tailwind CSS", "NextJs"],
  "workHistories": [
    {
      "id": "existing-or-client-temp-id",
      "companyName": "TechoCameroun",
      "website": "https://example.com",
      "jobTitle": "Frontend Developer",
      "location": "Buea, Cameroon",
      "city": "Buea",
      "region": "Southwest",
      "startMonth": "January",
      "startYear": 2023,
      "endMonth": "August",
      "endYear": 2025,
      "startDate": "2023-01-01",
      "endDate": "2025-08-01",
      "isCurrent": false,
      "description": "Developed high-performance SaaS frontends..."
    }
  ],
  "educations": [
    {
      "id": "existing-or-client-temp-id",
      "institution": "University of Buea",
      "website": "https://example.com",
      "degree": "Bachelor of Science",
      "fieldOfStudy": "Computer Science",
      "city": "Buea",
      "region": "Southwest",
      "startMonth": "October",
      "startYear": 2019,
      "endMonth": "June",
      "endYear": 2023,
      "startDate": "2019-10-01",
      "endDate": "2023-06-01",
      "isCurrent": false,
      "description": "Relevant coursework..."
    }
  ],
  "paymentAccounts": [
    {
      "provider": "MTN_MOMO",
      "phone": "+237652036786",
      "isPrimary": true
    }
  ]
}
```

Processing rules:

- Treat all top-level fields as partial.
- If arrays are present, replace the existing collection for that section atomically.
- Preserve existing records when their `id` exists.
- Create new child records when no valid `id` exists.
- Delete child records omitted from the submitted array for that section.
- Recompute `profileCompleteness` after every successful update.
- Return the same full shape as `GET /api/worker/profile`.
- Return validation errors per field.
- Return success only after the database transaction commits.

Existing section-specific PATCH/POST/DELETE routes can remain for backward compatibility, but the frontend edit profile now needs this route as the preferred contract.

## Edit Profile Page — Section-by-Section Contract

The worker edit profile page (`/worker/profile/edit`) is a single scrollable form with a profile-strength sidebar. Each section saves independently through `PUT /api/worker/profile`, dedicated upload routes, or KYC routes. The backend must persist and return every field below.

### Suggested document prompt (CV banner)

At the top of the page, the UI shows a suggested-upload banner: “To build your profile faster, upload your CV or resume.”

Backend requirements:

- Accept `POST /api/worker/profile/documents?type=CV` for the banner action.
- Also accept `CV`, `CERTIFICATE`, `PORTFOLIO`, and `OTHER` through the same route.
- Return uploaded documents in `GET /api/worker/profile` and `GET /api/worker/profile/documents`.
- Recompute profile strength when a CV is uploaded (`profileStrengthBreakdown.educationAndCertifications` or a dedicated `documents` flag if CV alone should count).
- Store `type`, `fileName`, `fileUrl`/`url`, `fileSize`, `mimeType`, `uploadedAt`, and optional `reviewStatus` on `worker_documents`.

### Personal info

Fields shown and saved:

- `avatarUrl` via `POST /api/worker/profile/avatar` (multipart image)
- `firstName`, `lastName`
- `region` (Cameroon region label), `city` (city within region)
- `languages` as comma-separated input mapped to `languagesSpoken[]`
- `availabilityStatus`: `AVAILABLE` or `NOT_AVAILABLE` from the availability toggle

### Professional summary

- `professionalTitle` / `title`
- `summary` (maps from `bio`)
- Optional future fields already in schema: `industries[]`, `preferredJobCategories[]`, `preferredJobTypes[]`

### Skills

- `skills[]` from comma-separated input

### Work history

List items plus add form:

- `companyName` (maps from `company`)
- `jobTitle` (maps from `role`)
- `startDate`, `endDate` (ISO date strings from form)
- `description`
- `id` for updates/deletes when sent through `PUT /api/worker/profile` with the full `workHistories[]` array

Future/extra fields the UI is ready to consume if returned:

- `website`, `city`, `region`, `startMonth`, `startYear`, `endMonth`, `endYear`, `isCurrent`

### Education and certifications

Education add form currently sends:

- `institution` (maps from `school`)
- `degree`
- `fieldOfStudy` optional
- `startDate`, `endDate`

Certifications should be supported through the same profile payload (`certifications[]`) even if the current UI focuses on education rows first. Each certification needs:

- `name`, `issuer`, `issueDate`, `expiryDate`
- optional `description`, `credentialUrl`, linked `documentId`

### Verification (KYC)

The verification section supports three document types via `KYCDocumentType`:

| `documentType` | Front required | Back required | Selfie required |
| --- | --- | --- | --- |
| `NATIONAL_ID` | yes | yes | yes |
| `PASSPORT` | yes | no | yes |
| `DRIVERS_LICENSE` | yes | yes | yes |

Flow:

1. Worker uploads KYC images through `POST /api/worker/profile/documents` or a dedicated verification upload route.
2. Worker submits `POST /api/worker/profile/kyc` with URLs:
   - `frontIdImageUrl`
   - `backIdImageUrl` optional for passport
   - `selfieImageUrl`
3. Backend creates/updates `kyc_submissions` with status `PENDING`.
4. While status is `PENDING` or `VERIFIED`, the UI locks further submissions.
5. On `REJECTED` or `MORE_INFO_REQUIRED`, show `rejectionReason` / `reviewNotes` and allow resubmission.

### Supporting documents list

Below KYC, workers can upload additional files (certificates, portfolio, other):

- `POST /api/worker/profile/documents?type=CERTIFICATE|PORTFOLIO|OTHER|CV`
- `DELETE /api/worker/profile/documents/:documentId`
- Public profile and application snapshots should only expose employer-safe document types.

### Payment details

Current UI captures one MoMo account:

- `mobileMoneyProvider`: `MTN_MOMO` or `ORANGE_MONEY`
- `mobileMoneyNumber`

Target schema uses `worker_payment_accounts[]` with one primary account. Return both legacy fields and `paymentAccounts[]` during migration.

## Supporting Documents API Detail

### `POST /api/worker/profile/documents`

Auth: worker only.

Query/body:

- `type`: `CV` | `CERTIFICATE` | `PORTFOLIO` | `OTHER`
- multipart field `file`

Validation:

- Allowed MIME types: `application/pdf`, `image/jpeg`, `image/png`
- Max size: 10 MB (match frontend copy)
- Reject empty files

Response item:

```json
{
  "id": "uuid",
  "type": "CV",
  "fileName": "resume.pdf",
  "fileUrl": "https://...",
  "url": "https://...",
  "fileSize": 245000,
  "mimeType": "application/pdf",
  "uploadedAt": "2026-05-30T10:00:00.000Z",
  "reviewStatus": "PENDING"
}
```

Processing:

- Store in `worker_documents`.
- Optionally enqueue admin document review when type is `CV`, `CERTIFICATE`, or `PORTFOLIO`.
- Return `201` only after the file is stored and the DB row exists.

## Public Profile Layout Data

The public profile layout needs the following sections in one payload:

- Header:
  - `avatarUrl`
  - `fullName`
  - `verificationStatus`
  - `professionalTitle`
  - `availabilityStatus`
  - `city`, `region`, `country`
  - `phone`
  - `languages`
- Professional summary:
  - `summary`
  - `industries`
  - `preferredJobCategories`
  - `preferredJobTypes`
- Skills:
  - `skills`
- Work history:
  - `companyName`
  - `jobTitle`
  - `description`
  - `startDate`, `endDate`
  - `startMonth`, `startYear`, `endMonth`, `endYear`
  - `city`, `region`, `location`
- Supporting documents:
  - `documents[]` filtered to public-safe CV/certification/portfolio documents
  - `fileName`, `fileSize`, `mimeType`, `url`
- Payment details:
  - Logged-in worker should see payment accounts.
  - Public/employer profile should hide payment details unless explicitly viewing a worker application detail where payment is allowed.

## Profile Strength

Frontend now calculates strength visually, but backend should own and return the same value everywhere.

Required fields:

```json
{
  "profileCompleteness": 75,
  "profileStrengthBreakdown": {
    "personalInfo": true,
    "kyc": true,
    "professionalSummary": true,
    "skills": true,
    "workHistory": true,
    "educationAndCertifications": false,
    "verification": false,
    "paymentDetails": true
  }
}
```

Use the same calculation for:

- `GET /api/worker/me`
- `GET /api/worker/profile`
- `GET /api/worker/profile/:workerId/public`
- dashboard profile-strength card
- application snapshot at apply time
- employer applicant profile view

## Worker KYC

Routes needed:

- `POST /api/worker/profile/kyc`
- `GET /api/worker/profile/kyc`
- production file upload route, such as `POST /files/verification-doc`

Payload for `POST /api/worker/profile/kyc`:

```json
{
  "documentType": "NATIONAL_ID",
  "frontIdImageUrl": "https://res.cloudinary.com/.../front.jpg",
  "backIdImageUrl": "https://res.cloudinary.com/.../back.jpg",
  "selfieImageUrl": "https://res.cloudinary.com/.../selfie.jpg"
}
```

Backend requirements:

- Persist `selfieImageUrl`.
- Accept `backIdImageUrl` as optional for passports.
- Reject duplicate submission while status is `PENDING` or `VERIFIED`.
- Allow resubmission after `REJECTED`, `MORE_INFO_REQUIRED`, or `RESUBMISSION_REQUESTED`.
- Return latest KYC in both `GET /api/worker/profile` and `GET /api/worker/profile/kyc`.
- Return:
  - `status`
  - `documentType`
  - `frontIdImageUrl`
  - `backIdImageUrl`
  - `selfieImageUrl`
  - `rejectionReason`
  - `reviewNotes`
  - `submittedAt`
  - `reviewedAt`
- Set worker `verificationStatus` to `VERIFIED` only after admin approval.
- Only verified KYC should enable verified badges.

Server-side KYC enforcement:

- `POST /api/jobs/:jobId/apply` must reject unverified workers.
- Worker job posting routes must reject unverified workers.
- Return `403` with a clear status-specific message for missing, pending, rejected, or resubmission-required KYC.

Notification requirements:

- On approval: send `VERIFICATION_APPROVED`, deep link `/worker/profile/edit?section=verification`.
- On rejection/resubmission: send `VERIFICATION_REJECTED` or equivalent, include the review reason, deep link `/worker/profile/edit?section=verification`.

## Worker Dashboard

`GET /api/worker/me` is not enough for the dashboard design. Add or document a worker dashboard endpoint.

### `GET /api/worker/dashboard`

Response should include:

```json
{
  "greeting": {
    "name": "Takem",
    "profileSetupMessage": "You have not set up your profile"
  },
  "stats": {
    "activeApplications": { "count": 4, "trendLabel": "4 active this month" },
    "shortlisted": { "count": 2, "trendLabel": "+2 this week" },
    "profileViews": { "count": 28, "trendLabel": "+12 this month" },
    "earnings": { "amount": 195000, "currency": "XAF", "trendLabel": "+20% this month" }
  },
  "recommendedJobs": [],
  "applications": [],
  "profileCompleteness": 75,
  "profileStrengthBreakdown": {}
}
```

Dashboard job and application cards need company logo URLs, status, applied time, job slug/id, and enough data to deep-link to details pages.

## Job Discovery and Details

The find-jobs, saved-jobs, dashboard recommended jobs, application details, and post-job preview screens require these normalized fields on job list/detail payloads:

- `id`
- `slug`
- `title`
- `description`
- `companyName`
- `companyLogoUrl`
- `city`
- `region`
- `neighbourhood`
- `workMode`
- `jobType`
- `requiredLevel`
- `requiredSkills`
- `payRate`
- `currency`
- `payStructure`
- `startDate`
- `startAsap`
- `durationValue`
- `durationUnit`
- `duration`
- `numberOfOpenings`
- `applicationCount`
- `requirements: string[]`
- `responsibilities: string[]`
- `postedAt` or `createdAt`
- `saved`
- `hasApplied` or `applicationId`

Important behavior:

- Jobs the worker has already applied to must not appear in `GET /api/jobs`, dashboard recommended jobs, or any other applyable job list for that worker.
- If the backend still returns an applied job in any secondary list, include `hasApplied: true` so the frontend can hide the Apply button.
- `GET /api/jobs` and `GET /api/saved-jobs` must accept filters with “All” choices omitted or empty:
  - `keyword`
  - `region`
  - `city`
  - `category`
  - `jobType`
  - `workMode`
  - `payStructure`
  - `minPay`
  - `maxPay`
  - `sortBy`
  - `sortOrder`
  - `page`
  - `limit`
- Every filter change triggers a backend request, so the API must handle partial filters efficiently.
- Return formatted dates as ISO strings; frontend will format them as human-readable values.

## Worker-Created Jobs / My Jobs

The worker portal now has a Post a Job flow, job preview, and My Jobs page. Backend should support worker-owned jobs directly or document the exact mapping to existing employer job routes.

Preferred routes:

- `POST /api/worker/jobs`
- `GET /api/worker/jobs`
- `GET /api/worker/jobs/:jobId`
- `PATCH /api/worker/jobs/:jobId`
- `PATCH /api/worker/jobs/:jobId/status`
- `DELETE /api/worker/jobs/:jobId` or archive endpoint

Create/update payload:

```json
{
  "title": "Frontend Developer",
  "city": "Douala",
  "neighbourhood": "Bonanjo",
  "description": "We are looking for...",
  "requiredSkills": ["React", "Tailwind CSS"],
  "requiredLevel": "Senior",
  "jobType": "FULL_TIME",
  "durationValue": 6,
  "durationUnit": "MONTHS",
  "payRate": 185000,
  "currency": "XAF",
  "payStructure": "MONTHLY",
  "numberOfOpenings": 1,
  "startDate": "2026-06-04",
  "startAsap": true,
  "requirements": ["At least 1 year experience"],
  "responsibilities": ["Conduct sessions"],
  "asDraft": false
}
```

Rules:

- Worker must be KYC `VERIFIED` before saving a draft or posting.
- Return `403` when not verified.
- Submitted jobs enter admin review before going live.
- Success responses should only be returned after the DB write succeeds.
- My Jobs cards should represent jobs the worker created, not matched/recommended jobs.
- My Jobs should use the same card/list density as Find Jobs and should not expose the worker-facing Apply button.

## Worker Applications

The applications page now has two top-level modes:

- Applications the worker made to jobs.
- Applications other workers made to jobs created by this worker.

Both modes have card and table layouts. Rows/cards click through to the correct detail page.

Outgoing list route:

- `GET /api/applications`

Query:

- `status`
- `keyword`
- `page`
- `limit`

Outgoing response item fields:

- `id`
- `slug`
- `status`
- `appliedAt`
- `jobId`
- `jobTitle`
- `companyName`
- `companyLogoUrl`
- `payRate`
- `currency`
- `payStructure`
- `jobType`
- `city`
- `region`
- `matchPercent` if available; frontend can show blank when missing
- short status/detail text such as `interviewAt`, `offerValidUntil`, or `lastStatusMessage`

Important title behavior:

- `jobTitle` should be only the title, for example `Software Engineer`.
- Do not append the city/region in brackets, for example avoid `Software Engineer (Bamenda)`.
- Return location separately as `city`, `region`, and optional `location`.

Incoming applications to worker-created jobs:

Preferred route:

- `GET /api/worker/jobs/applications`

Alternative if reusing employer applicant infrastructure:

- `GET /api/employer/applicants?ownerType=worker`

Query:

- `status`
- `keyword`
- `jobId`
- `page`
- `limit`

Incoming response item fields:

- `id` or `applicationId`
- `status`
- `appliedAt`
- `jobId`
- `jobTitle`
- `applicantName`
- `applicantAvatarUrl`
- `workerId`
- `payRate`
- `currency`
- `payStructure`
- `jobType`
- `city`
- `region`
- `matchPercent`
- `profileSnapshot`

Incoming detail route:

- `GET /api/worker/jobs/applications/:applicationId`

It should return the job summary plus the submitted worker profile snapshot. This is the route the "Applications to my jobs" mode should deep-link to if the backend exposes a worker-specific URL.

Outgoing application detail route:

- `GET /api/applications/:applicationId`

Response should include:

- application summary fields above
- `job` detail block with requirements/responsibilities/duration/application count
- worker `profileSnapshot` in the same public profile layout shape
- `jobSpecificNote`
- `attachedDocuments`
- `engagement` if hired

Profile snapshot requirement:

- Store enough profile data at apply time to render the large applicant/profile view later:
  - personal header
  - summary
  - skills
  - work history
  - education/certifications
  - supporting documents selected for the application
  - verification status

## Earnings

The earnings page and receipt detail need payment metadata beyond basic payment rows.

Routes:

- `GET /api/earnings/summary`
- `GET /api/earnings/transactions`
- `GET /api/earnings/statement`
- Optional: `GET /api/earnings/transactions/:transactionId`

Summary response:

```json
{
  "totalEarned": 1200000,
  "thisMonthTotal": 195000,
  "pendingAmount": 320000,
  "totalJobs": 3,
  "activeJobs": 2,
  "pendingCount": 1,
  "currency": "XAF",
  "monthTrendLabel": "+20% this month"
}
```

Transaction item fields:

- `id`
- `amount`
- `currency`
- `status`
- `initiatedAt`
- `completedAt`
- `paymentPlatform`
- `paymentMethod`
- `recipientNumber`
- `reference`
- `fapshiTransactionId`
- `fapshiReference`
- `employerId`
- `employerName`
- `employerLogoUrl`
- `jobId`
- `jobTitle`
- `applicationId`
- `engagementId`

Behavior:

- `GET /api/earnings/statement` should support status/date filters and return all fields needed to generate a PDF statement client-side.
- “View job listing” on a transaction should route to the application detail for that job, so return `applicationId` when available.
- The frontend removed share, flag, delete record, contact employer, hours worked, platform fee, and payment timeline from worker earnings detail.

## Saved Jobs

`GET /api/saved-jobs` should accept the same search/filter query shape as `GET /api/jobs`:

- `keyword`
- `region`
- `city`
- `category`
- `jobType`
- `workMode`
- `payStructure`
- `minPay`
- `maxPay`
- `sortBy`
- `sortOrder`
- `page`
- `limit`

Saved job items should include:

- saved record id
- `jobId`
- `savedAt`
- nested normalized `job`
- `hasApplied` or `applicationId`

## Admin Responsibilities

The admin panel must support every worker-portal feature that requires human review or moderation.

### Worker KYC review

Admin actions on `GET /admin/kyc` queue:

- Open submission detail with `documentType`, `frontIdImageUrl`, `backIdImageUrl`, `selfieImageUrl`, worker profile link, and prior review history.
- Approve:
  - set `kyc_submissions.status = VERIFIED`
  - set `worker_profiles.verificationStatus = VERIFIED`
  - set `users.verificationStatus = VERIFIED`
  - send `VERIFICATION_APPROVED` notification with deep link `/worker/profile/edit?section=verification`
- Reject:
  - store `rejectionReason`
  - set status `REJECTED`
  - send notification with reason
- Request resubmission:
  - set status `MORE_INFO_REQUIRED`
  - store review notes
  - allow worker to submit again from edit profile

Admin must verify all three KYC document types (`NATIONAL_ID`, `PASSPORT`, `DRIVERS_LICENSE`) including selfie/liveness image.

### Worker supporting documents review

When workers upload `CV`, `CERTIFICATE`, or `PORTFOLIO` files:

- Admin document queue should list `worker_documents` with worker name, document type, file metadata, and risk level.
- Admin can approve, reject, or request resubmission.
- Rejected documents should remain visible to the worker with reason; approved documents can appear on public profile/application snapshots.

### Worker-created job moderation

Worker post-job and My Jobs flows create jobs owned by the worker (`createdByWorkerId`, `createdByType = WORKER`).

Admin job review queue must:

- Show creator type (`WORKER` vs `EMPLOYER`) and creator profile link.
- Review title, location, pay, description, requirements, and responsibilities before publication.
- Approve to `ACTIVE` or reject with `adminNotes`.
- Pause/close worker-created jobs when fraudulent or outdated.

Rules enforced before admin sees the job:

- Worker must be KYC `VERIFIED` to create/submit.
- New jobs enter `UNDER_REVIEW` until approved.

### Applications to worker-created jobs

When workers receive applications on jobs they posted:

- Admin disputes/flags may reference applications where `jobs.createdByWorkerId` is set.
- Admin should be able to inspect the applicant snapshot (`applications.profileSnapshot`) and the worker-owned job context.
- Admin does not shortlist/hire on behalf of the worker, but must be able to suspend fraudulent jobs or users involved.

### Profile and payout oversight

Admin should be able to:

- View full worker profile including work history, education, certifications, documents, and payment accounts.
- See profile completeness / strength breakdown for support calls.
- Flag duplicate profiles, suspicious documents, or payout fraud (`FlagType` values already in schema).

### Notifications admin should expect to trigger

| Event | Notification type | Recipient |
| --- | --- | --- |
| KYC approved | `VERIFICATION_APPROVED` | worker |
| KYC rejected / resubmission | `VERIFICATION_REJECTED` or equivalent | worker |
| Worker job approved | `JOB_APPROVED` | worker creator |
| Worker job rejected | `JOB_REJECTED` | worker creator |
| Application received on worker job | `APPLICATION_RECEIVED` | worker job owner |
| Application status change | existing application notifications | applicant worker |

- `payments`: stores payment amount, currency, provider, recipient number, Fapshi identifiers, status, initiated/confirmed timestamps.

## Auth & Session (SPA — both portals)

The web app stores **`accessToken`** and **`refreshToken`** in **`localStorage`** (shared across tabs) and hydrates Zustand on load. Protected routes call `GET /auth/me`; expired access tokens trigger **`POST /auth/refresh`** via the Axios interceptor, then retry the failed request once.

Backend must support this without breaking multi-tab sessions:

| Requirement | Detail |
| --- | --- |
| **Refresh response body** | Always return `{ accessToken, refreshToken }` on successful refresh (not cookie-only). The SPA persists both tokens locally. |
| **Refresh rotation** | When rotating refresh tokens, return the **new** pair in the JSON body. Old refresh digests must be invalidated server-side. |
| **Concurrent refresh** | Multiple tabs may hit refresh at once; use server-side idempotency or accept only one rotation per user within a short window (frontend uses `navigator.locks` when available). |
| **401 semantics** | Return **`401`** only when refresh is impossible (missing/invalid/expired refresh). Do not return **`401`** for recoverable access-token expiry if refresh would succeed. |
| **`GET /auth/me`** | Must work with the latest access token after refresh. Should not require a stale token if refresh cookie/body is valid. |
| **Logout** | `POST /auth/logout` should revoke the refresh token server-side so other tabs cannot refresh after sign-out. |

Optional but recommended for long-term route protection: document HttpOnly cookie + server session check for Next middleware (`docs/backend-auth-handoff.md` §8).

## Employer Portal — Model & API Gaps

The employer portal tabs (dashboard, **My Jobs**, applicants, workforce, payroll, profile) expect richer payloads than the baseline employer API guide. Below is what the current UI consumes.

### `employer_profiles`

Add or expose:

- `tagline String?` — short one-line bio shown **under the company name** on `/employer/profile` (distinct from full `about` / `bio`).
- Keep `about Text?` as the long **About the company** section.
- `location` should be structured in API responses as `{ city, country }` (DB may remain a string; normalize in DTO).
- `logoUrl` alias for `logo` in PATCH/GET responses.

Computed fields (do **not** store; return on `GET /api/employer/company` and optionally dashboard):

- `applicantsCount` — count of applications across all employer jobs (respecting filters/archived rules you define).
- `employeesCount` — count of active `work_engagements` for this employer (`status = ACTIVE`).

PATCH body should accept:

```json
{
  "name": "TechCo Cameroun",
  "tagline": "Building reliable teams across Cameroon.",
  "bio": "Long about-the-company paragraph…",
  "industry": "Technology",
  "size": "51-200",
  "location": { "city": "Douala", "country": "Cameroon" },
  "website": "https://techco.cm"
}
```

### `work_engagements`

Workforce list and worker detail pages need:

- `role String?` or derive from linked `jobs.title` / `applications.profileSnapshot.professionalTitle` — shown as the worker’s role column.
- `jobType String?` — human-readable employment type from the hired job.
- `dateJoined` — alias for `startDate` (ISO date).
- `shiftsLogged Int` — computed `COUNT(shift_logs)` for the engagement.
- `status` for UI tabs:
  - `active` ← `EngagementStatus.ACTIVE`
  - `terminated` ← `EngagementStatus.TERMINATED` or `COMPLETED`
  - `rejected` ← optional UI label for engagements never activated or hire reversed; map from your business rules or omit and fold into `terminated`
- `avatarUrl` — from linked worker profile.

Worker detail (`GET /api/employer/workforce/:workerId`) should return:

- workforce row fields above
- nested `job` block (same shape as job detail/preview: title, pay, currency, schedule, location, description, requirements, responsibilities)
- `submittedProfile` — same JSON snapshot shape as applicant detail (see below)
- optional inline `shifts[]` or rely on `GET .../shifts`

### `shift_logs`

No schema change required if columns match the guide. Workforce UI expects shift rows with:

- `shiftId` / `id`
- `date` (ISO date)
- `hours` (number; maps from `hoursWorked`)
- `notes`
- `loggedBy` (display name of employer user who logged the shift)

Inline shift log on the workforce table uses the **selected worker’s** shifts from `GET /api/employer/workforce/:workerId/shifts`.

### Applications (employer applicants tab)

#### Applicant list card UI (`GET /api/employer/applicants`)

The grid/card view renders one card per application. Frontend behavior:

| UI element | Backend field(s) | Notes |
| --- | --- | --- |
| “Applied … ago” | `appliedAt` (ISO) | Relative time computed client-side |
| Match pill (`70% match`) | `matchScore` or `match` | Omit pill when missing |
| Avatar photo | `avatarUrl`, `applicantAvatarUrl`, or `submittedProfile.avatarUrl` | Cloudinary/HTTPS URL from `worker_profiles.avatarUrl` at apply time |
| Initial circle (no photo) | *(none)* | Frontend shows first letter of `applicantName` / `name` when all avatar fields are empty |
| Name | `applicantName` / `name` | |
| Verified badge | `verificationStatus` or `kycStatus` | **Show only when value is `VERIFIED`** (admin-approved KYC). Do not show for `PENDING`, `REJECTED`, or `MORE_INFO_REQUIRED`. |
| Headline under name | `submittedProfile.headline` | Fallback: plain `jobTitle` (not industry/category) |
| Skill pills (max 3) | `skills[]` or `topSkills` | Comma-separated `topSkills` is split client-side |
| Location footer | `location` | e.g. `Buea, Cameroon` |

List/card/table views (`GET /api/employer/applicants`) must return per item:

- `applicationId` (or `id`)
- `applicantName` / `name`
- `jobId`, `jobTitle` (plain title — **no** location suffix in brackets)
- `status`: `pending` \| `shortlisted` \| `rejected` \| `hired`
- `appliedAt` (ISO)
- `location`, `jobType`
- `matchScore` or `match` (integer 0–100 or string with `%`)
- `skills[]` **or** `topSkills` comma-separated string
- `verificationStatus` or `kycStatus` (from worker KYC — **`VERIFIED` only** drives the badge)
- `avatarUrl` and/or `applicantAvatarUrl` (worker profile image URL; optional on list if present in `submittedProfile.avatarUrl`)
- optional `submittedProfile.headline` for card subtitle
- optional `submittedProfile.avatarUrl` when list-level avatar fields are omitted

Worker avatar source URL (stored once, copied into application snapshot at apply):

- `POST /api/worker/profile/avatar` — multipart upload; persists `worker_profiles.avatarUrl`
- Include `avatarUrl` in `applications.profileSnapshot` when the worker applies so cards stay stable even if the worker later changes their photo

Detail (`GET /api/employer/applicants/:applicationId`) must include **`submittedProfile`** JSON captured at apply time with at least:

```json
{
  "fullName": "Musa Diallo",
  "headline": "Backend Developer, DevOps",
  "location": "Douala, Cameroon",
  "phone": "(+237) 652036786",
  "languages": "English, French",
  "availability": "Available",
  "verificationStatus": "VERIFIED",
  "summary": "Professional summary paragraph…",
  "industries": "Design & Creative, Software & Tech",
  "skills": ["Node.js", "Docker", "Problem Solving"],
  "highlightedSkills": ["Node.js", "Docker"],
  "workHistory": [
    {
      "company": "TechoCameroun",
      "role": "Frontend Developer",
      "description": "…",
      "period": "Jan. 2023 - Aug. 2025 • Buea, Cameroon",
      "startDate": "2023-01-01",
      "endDate": "2025-08-01"
    }
  ],
  "documents": [{ "name": "resume.pdf", "type": "CV", "url": "https://…" }],
  "avatarUrl": "https://…"
}
```

Use the **same snapshot shape** for worker public profile at apply time (`applications.profileSnapshot`) so employer applicant detail, workforce worker detail, and admin review all render consistently.

Status patch (`PATCH /api/employer/applicants/:applicationId/status`):

- **`hired`** must create `work_engagements` if none exists (worker appears in workforce).
- Return updated applicant summary; do not return success if DB write fails.

### Workforce list endpoint

`GET /api/employer/workforce` response shape:

```json
{
  "stats": {
    "activeWorkers": { "count": 4, "trend": "1 hired this month" },
    "totalShifts": { "count": 47, "trend": "+89 this month" },
    "engagementsEnded": { "count": 5, "trend": "4 this year" },
    "tabCounts": { "all": 6, "active": 4, "terminated": 3 }
  },
  "items": [
    {
      "workerId": "uuid",
      "fullName": "Musa Diallo",
      "name": "Musa Diallo",
      "role": "Backend Developer",
      "status": "active",
      "dateJoined": "2026-05-01",
      "shiftsLogged": 12,
      "jobType": "Full-time",
      "avatarUrl": "https://…"
    }
  ],
  "total": 6,
  "page": 1,
  "limit": 20
}
```

Query:

- `status`: `all` \| `active` \| `terminated` — **`terminated` tab includes both `terminated` and `rejected` UI statuses**
- `search`, `page`, `limit`

### Employer dashboard

`GET /api/employer/dashboard` stat cards should align with workforce/applicants:

- `activeJobs`, `totalApplicants`, `hiredWorkers`, `totalPayroll` — each `{ count, trend }` (trend is display string)
- `liveJobs[]` preview with `applicantsCount`, `shortlistedCount`, `postedAt`, `status`

### Employer jobs (My Jobs nav)

Nav label is **My Jobs**; post-job CTA lives on the jobs page. Backend routes unchanged (`POST/GET/PATCH /api/employer/jobs`). Ensure list items include `applicantsCount`, `shortlistedCount`, and normalized `status` values (`draft`, `pending_review`, `live`, `paused`, `closed`, `rejected`).

## Employer Portal — Admin Responsibilities

| Area | Admin action |
| --- | --- |
| **Employer verification** | Review `employer_profiles.businessRegDocUrl`; approve/reject company; set `verificationStatus`; notify employer. |
| **Job moderation** | Employer-posted jobs: approve to `live`, reject with `adminNotes`, pause/close fraudulent listings. |
| **Applicant disputes** | Inspect `applications.profileSnapshot` and employer notes when flagging fraud or misuse. |
| **Workforce / payments** | Admin does not log shifts; may suspend employer or worker on payment fraud (`FlagType.PAYMENT_FRAUD`). |
| **Company profile** | Moderate public-facing `tagline`, `bio`, and logo if reported; no separate queue required unless you add content moderation. |

Notifications employers should receive (extend `NotificationType` if missing):

| Event | Suggested type | Deep link |
| --- | --- | --- |
| New applicant | `APPLICATION_RECEIVED` | `/employer/applicants/:applicationId` |
| Applicant hired (confirmation) | `HIRE_CONFIRMED` | `/employer/workforce/:workerId` |
| Job approved / rejected | `JOB_APPROVED` / `JOB_REJECTED` | `/employer/jobs/:jobId` |
| Payment completed / failed | `PAYMENT_SENT` / existing | `/employer/payroll` |

## Cross-Portal Profile Snapshots (Employer ↔ Worker)

Employer applicant cards, applicant detail, workforce worker detail, and worker application snapshots must share one **public profile JSON shape** (see worker [Public Profile Layout Data](#public-profile-layout-data) and employer [Applications (employer applicants tab)](#applications-employer-applicants-tab) above).

Additional employer-facing rules:

- **`headline`** — worker `professionalTitle` or comma-separated titles; shown on applicant cards (not job category/industry alone).
- **Verified badge** — only when `verificationStatus === VERIFIED` from approved KYC.
- **Company logo** — return `companyLogoUrl` on all job and application list payloads (worker and employer).
- **Match score** — optional `matchPercent` on `applications`; expose as `matchScore` in employer applicant APIs.

## Backend Route Checklist

Worker profile:

- `GET /api/worker/me`
- `GET /api/worker/profile`
- `PUT /api/worker/profile`
- `GET /api/worker/profile/:workerId/public`
- `POST /api/worker/profile/avatar`
- `POST /api/worker/profile/documents`
- `GET /api/worker/profile/documents`
- `DELETE /api/worker/profile/documents/:documentId`
- `POST /api/worker/profile/kyc`
- `GET /api/worker/profile/kyc`

Worker dashboard:

- `GET /api/worker/dashboard`

Jobs:

- `GET /api/jobs`
- `GET /api/jobs/:jobId`
- `POST /api/jobs/:jobId/save`
- `DELETE /api/jobs/:jobId/save`
- `POST /api/jobs/:jobId/hide`
- `DELETE /api/jobs/:jobId/hide`
- `POST /api/jobs/:jobId/report`
- `GET /api/jobs/:jobId/share`
- `POST /api/jobs/:jobId/application/customize-profile`
- `POST /api/jobs/:jobId/apply`

Worker-created jobs:

- `POST /api/worker/jobs`
- `GET /api/worker/jobs`
- `GET /api/worker/jobs/:jobId`
- `PATCH /api/worker/jobs/:jobId`
- `PATCH /api/worker/jobs/:jobId/status`
- `DELETE /api/worker/jobs/:jobId`

Applications:

- `GET /api/applications`
- `GET /api/applications/:applicationId`
- `DELETE /api/applications/:applicationId`
- `GET /api/worker/jobs/applications`
- `GET /api/worker/jobs/applications/:applicationId`

Saved jobs:

- `GET /api/saved-jobs`
- `DELETE /api/saved-jobs/:jobId`
- `DELETE /api/saved-jobs`

Earnings:

- `GET /api/earnings/summary`
- `GET /api/earnings/transactions`
- `GET /api/earnings/transactions/:transactionId`
- `GET /api/earnings/statement`

Auth (both portals):

- `POST /auth/login` — return `{ accessToken, refreshToken, user }`
- `POST /auth/refresh` — return `{ accessToken, refreshToken }` in JSON body (SPA persists to `localStorage`)
- `GET /auth/me`
- `POST /auth/logout` — revoke refresh server-side

Employer portal:

- `GET /api/employer/me`
- `GET /api/employer/dashboard`
- `POST /api/employer/jobs`
- `GET /api/employer/jobs`
- `GET /api/employer/jobs/:jobId`
- `PATCH /api/employer/jobs/:jobId`
- `PATCH /api/employer/jobs/:jobId/status`
- `GET /api/employer/applicants/filters`
- `GET /api/employer/applicants`
- `GET /api/employer/applicants/:applicationId`
- `PATCH /api/employer/applicants/:applicationId/status`
- `GET /api/employer/applicants/:applicationId/share`
- `GET /api/employer/workforce` — include `stats` + `tabCounts`
- `GET /api/employer/workforce/:workerId` — include `submittedProfile` + optional `job`
- `GET /api/employer/workforce/:workerId/shifts`
- `POST /api/employer/workforce/:workerId/shifts`
- `PATCH /api/employer/workforce/:workerId/shifts/:shiftId`
- `DELETE /api/employer/workforce/:workerId/shifts/:shiftId`
- `PATCH /api/employer/workforce/:workerId/status`
- `GET /api/employer/payments`
- `GET /api/employer/payments/workers`
- `POST /api/employer/payments/pay`
- `GET /api/employer/payments/history`
- `GET /api/employer/company` — include `tagline`, `bio`, `applicantsCount`, `employeesCount`
- `PATCH /api/employer/company` — accept `tagline`
- `POST /api/employer/company/logo`
