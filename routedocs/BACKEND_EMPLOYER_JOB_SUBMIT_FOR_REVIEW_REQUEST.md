# Backend Request: Employer job submit must enter admin review (`under_review`), not go `active` immediately

**Date:** 2026-06-07  
**From:** Joballa web frontend (`joballa-web-copy`)  
**To:** Backend / admin review team  
**Status:** ✅ Implemented — see `BACKEND_RESPONSE_EMPLOYER_JOB_SUBMIT_FOR_REVIEW.md`  
**Routes:** `POST /employer/jobs`, `GET /employer/jobs`, `GET /employer/jobs/:jobId`, worker job feed

---

## Summary

When an employer clicks **“Submit for review”** in the post-job flow, the frontend calls **`POST /employer/jobs`** with **`asDraft: false`**. The product contract and employer UI copy both say the job enters **moderation** and only becomes visible to workers **after admin approval**.

**Observed today:** the job is created with status **`active`** immediately. It appears in the employer jobs list as Active and is eligible for the worker job feed without passing through admin review.

**Expected:** non-draft submissions should land in **`under_review`** until an admin explicitly approves them to **`active`**.

---

## Product / contract reference

| Source | Expected behaviour |
| --- | --- |
| `joballa-final-schema-v2.md` | `job_status`: `draft` → `under_review` → `active` (admin approves) |
| `docs/FRONTEND_EMPLOYER_PORTAL_API_GUIDE_MAY_31_2026.md` §6.1 | Non-draft jobs get **`UNDER_REVIEW`** until admin approves |
| `routedocs/FRONTEND_EMPLOYER_ROUTES.md` | Create response status: `draft` \| `under_review` \| `active` \| `rejected` |
| Employer UI (`employer.postJobFlow.preview`) | *“When you submit, the role moves into the moderation flow before it becomes visible to workers.”* |

---

## What the frontend sends (verified)

**Button:** “Submit for review” → `submitJob(false)`  
**Mapper:** `features/employer/lib/job-form-mapper.ts` → `mapDraftToCreateJobBody(..., asDraft: false)`

Example body (abbreviated):

```json
{
  "departmentId": "11111111-1111-4111-8111-111111110006",
  "title": "Site supervisor",
  "employmentType": "full_time",
  "workMode": "onsite",
  "country": "Cameroon",
  "city": "Douala",
  "description": "...",
  "requiredSkills": ["Safety", "Team lead"],
  "payAmount": 250000,
  "payCurrency": "XAF",
  "payStructure": "monthly",
  "numberOfOpenings": 1,
  "startNow": true,
  "requirements": [],
  "responsibilities": [],
  "paymentManagedByJoballa": true,
  "asDraft": false
}
```

**Save as draft** uses the same endpoint with **`asDraft: true`** — that path should continue to set status **`draft`** only.

The frontend does **not** call `PATCH /employer/jobs/:jobId/status` on create. Status on create must be decided entirely by **`POST /employer/jobs`**.

---

## Expected backend behaviour

### `POST /employer/jobs`

| `asDraft` | Initial `jobs.status` | Visible on worker job feed? | Admin queue |
| --- | --- | --- | --- |
| `true` | `draft` | No | No |
| `false` | **`under_review`** | **No** | **Yes** — awaiting admin approve/reject/changes |

### After admin action (separate admin API — confirm wired)

| Admin action | Resulting `jobs.status` | Worker visibility |
| --- | --- | --- |
| Approve | `active` | Yes |
| Reject | `rejected` | No |
| Request changes | `under_review` (or dedicated state) + `changeRequest` | No |

### `submissionScore` / `submission_tier`

If rule-based scoring runs on create (`auto_approved`, `yellow_zone`, `flagged`, `auto_rejected`):

- **`submissionScore.tier` must be informational / queue routing only** for employer-submitted jobs in the current product phase.
- **`auto_approved` must not set `jobs.status = active`** or publish the job to workers without a human admin approve step.
- Auto-reject (`auto_rejected`) may set `rejected` if that tier is implemented — please document if so.

If product later allows trusted employers to skip manual review, that should be an explicit env flag or employer attribute — not the default for all submissions.

---

## Expected API responses

### Create — submit for review (`asDraft: false`)

**HTTP `201`**

```json
{
  "jobId": "uuid",
  "status": "under_review",
  "submissionScore": {
    "score": 82,
    "tier": "auto_approved"
  },
  "message": "Job submitted. Joballa admin will review before going live."
}
```

Notes:

- **`status` must be `under_review`**, even when `submissionScore.tier` is `auto_approved`.
- Do not return `active` on create unless product explicitly documents instant publish (it does not today).

### Create — save draft (`asDraft: true`)

```json
{
  "jobId": "uuid",
  "status": "draft",
  "message": "Job saved as draft."
}
```

### List / detail after submit

- `GET /employer/jobs` and `GET /employer/jobs/:jobId` must return **`status: "under_review"`** until admin approval.
- Employer UI maps this to **“Under review”** (`features/employer/lib/employer-job-status.ts`).

### Worker feed

- Jobs with `status !== active` must **not** appear in worker browse/search/apply endpoints.

---

## Reproduction (local)

1. Employer account with verified company profile.
2. `POST /employer/jobs` with valid body and **`asDraft: false`**.
3. **Actual:** response and subsequent `GET /employer/jobs/:jobId` show **`active`**.
4. **Expected:** **`under_review`**; job absent from worker listings; present in admin moderation queue.

Test employer used in frontend QA: `fabricekongnyuy2@gmail.com` (local API `http://localhost:8000`).

---

## Acceptance criteria

- [ ] `POST /employer/jobs` with `asDraft: false` → **`status: under_review`** (never `active` on create).
- [ ] `POST /employer/jobs` with `asDraft: true` → **`status: draft`** (unchanged).
- [ ] `GET /employer/jobs/:jobId` reflects `under_review` until admin approves.
- [ ] Worker job list/detail/apply endpoints exclude `under_review`, `draft`, `rejected`, `paused`, `closed`.
- [ ] Admin moderation queue receives new employer submissions (`under_review`).
- [ ] Admin approve endpoint transitions job to **`active`** and only then worker-visible.
- [ ] Response `message` matches moderation copy when status is `under_review`.
- [ ] Smoke test updated in `scripts/v2-routes/03-employer.mjs` (assert create → `under_review`).

---

## Frontend impact after fix

No request-body changes required. We may optionally:

- Show a success toast from `CreateEmployerJobResponse.message`.
- Redirect employer to jobs list filtered by **Under review** when `status === "under_review"`.

Blocked on backend — frontend already sends the correct flag.

---

## Related docs

- [FRONTEND_EMPLOYER_ROUTES.md](./FRONTEND_EMPLOYER_ROUTES.md) — create job contract
- [BACKEND_EMPLOYER_JOB_POSTING_GUIDE.md](./BACKEND_EMPLOYER_JOB_POSTING_GUIDE.md) — field/enums
- [joballa-final-schema-v2.md](./joballa-final-schema-v2.md) — `job_status`, `submission_tier`
- [BACKEND_RESPONSE_EMPLOYER_JOB_EDIT.md](./BACKEND_RESPONSE_EMPLOYER_JOB_EDIT.md) — edits to active jobs do not re-trigger moderation
