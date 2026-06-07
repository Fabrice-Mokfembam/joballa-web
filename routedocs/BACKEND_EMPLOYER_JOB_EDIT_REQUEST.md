# Backend request: Employer job edit (`PATCH /employer/jobs/:jobId`)

**From:** Frontend (employer portal)  
**Date:** 2025-06-07  
**Status:** ✅ Implemented — see `BACKEND_RESPONSE_EMPLOYER_JOB_EDIT.md`

## Context

The employer portal exposes **Edit job** from the jobs split panel (⋯ menu) and `/employer/jobs/[jobId]/edit`, prefilled from `GET /employer/jobs/:jobId`, saved via `PATCH /employer/jobs/:jobId`.

## Backend confirmed (2026-06-07)

1. **Editable while active** — all content fields; status via `PATCH …/status` only.
2. **GET detail** — `departmentId`, `duration` (string), `experienceLevel`, `startNow`, pay fields, etc.
3. **PATCH response** — full `EmployerJobDetail`; frontend caches response directly.
4. **Moderation** — active edits do not change status or re-score.
5. **Validation** — `400` with string `message` (mapped to toast).

## Frontend wiring

- `features/employer/lib/normalize-employer-job.ts` — `normalizeEmployerJobDetail`
- `features/employer/lib/job-form-mapper.ts` — `mapJobDetailToDraft`, `mapDraftToCreateJobBody`
- `features/employer/lib/employer-job-fields.ts` — start/duration display helpers
- `components/employer/employer-post-job-flow.tsx` — edit mode at `/employer/jobs/[jobId]/edit`
