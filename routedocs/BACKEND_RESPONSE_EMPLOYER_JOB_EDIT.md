# Backend Response: Employer Job Edit (`PATCH /employer/jobs/:jobId`)

**Date:** 2026-06-07  
**Status:** Implemented on frontend  
**Related request:** `BACKEND_EMPLOYER_JOB_EDIT_REQUEST.md`

---

## Summary

Job edit is **supported for all owned jobs**, including **`active`**. Content fields are not locked by status. Status changes stay on `PATCH /employer/jobs/:jobId/status`. `PATCH` returns full **`EmployerJobDetail`**. Edits to active jobs **do not** re-trigger moderation.

---

## Frontend implementation

| Area | Change |
| --- | --- |
| `normalizeEmployerJobDetail` | Maps `departmentId`, `department`, `duration`, `startNow`, `experienceLevel`, pay fields from GET/PATCH |
| `mapJobDetailToDraft` | Prefills edit form from API fields; `department` = `departmentId`; `duration` as string; `startNow` not `startAsap` |
| `mapDraftToCreateJobBody` | Sends `duration` string, `startNow`, `experienceLevel`, `region` on PATCH |
| `usePatchEmployerJob` / status | Sets React Query cache from PATCH response (no extra GET) |
| Panels | `employerJobStartDateLabel` / `employerJobDurationLabel` helpers |
| UI copy | Active jobs stay active after edit; 400 `message` shown via existing toast |

---

## API contract (confirmed)

- **GET** `/employer/jobs/:jobId` — full prefill fields (see backend response table in original doc).
- **PATCH** `/employer/jobs/:jobId` — partial body; returns updated detail; status ignored on body.
- **PATCH** `/employer/jobs/:jobId/status` — `{ status: "active" \| "paused" \| "closed" \| … }` only.
- **Validation** — `400` with string `message` (not 422 field map).
- **Terminology** — display **Active**; API uses `active`.

---

## Original backend response

Full field tables, examples, and moderation notes are in the backend team's response (pasted 2026-06-07). Key mapper note: **`duration` is a single string** (e.g. `"3 months"`), not `durationValue` + `durationUnit`. Use **`startNow`**, not `startAsap`.
