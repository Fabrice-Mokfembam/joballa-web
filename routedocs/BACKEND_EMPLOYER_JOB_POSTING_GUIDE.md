# Employer Job Posting — Complete API Guide

**Date:** 2026-06-07  
**Audience:** Frontend (employer portal — post job, edit job, draft)  
**Routes:** `POST /employer/jobs`, `PATCH /employer/jobs/:jobId`, `GET /employer/jobs/:jobId`

See backend team copy for full field reference, enum values, and examples.

## Frontend integration notes (this repo)

- **`departmentId`** must be a **UUID** from `departments.id` — use the department **select** in post/edit job (not slug/name/code).
- **`startNow: true`** → omit `startDate` from the request body.
- **`startDate`** → `YYYY-MM-DD` only (native date input); never empty string or locale formats.
- **Enums** → lowercase snake_case in JSON (`full_time`, `onsite`, `monthly`, …).
- **Status** → only via `PATCH /employer/jobs/:jobId/status`; display `active` as **Active** in UI.
- **Submit for review** → `POST /employer/jobs` with `asDraft: false` returns **`under_review`** until admin approves (see `BACKEND_RESPONSE_EMPLOYER_JOB_SUBMIT_FOR_REVIEW.md`). Employers cannot self-activate from `under_review`.
- Department catalog: `GET /employer/departments` via `useEmployerDepartmentOptions`; optional `NEXT_PUBLIC_JOB_DEPARTMENTS_JSON` env fallback for local dev without seed.
- Mapper: `features/employer/lib/job-form-mapper.ts`, validation: `features/employer/lib/job-api-fields.ts`.

## Related

- [BACKEND_RESPONSE_EMPLOYER_JOB_EDIT.md](./BACKEND_RESPONSE_EMPLOYER_JOB_EDIT.md)
- [FRONTEND_EMPLOYER_ROUTES.md](./FRONTEND_EMPLOYER_ROUTES.md)

## Backend follow-up (optional)

`GET /employer/departments` would remove the need for a static/env department catalog on the frontend.
