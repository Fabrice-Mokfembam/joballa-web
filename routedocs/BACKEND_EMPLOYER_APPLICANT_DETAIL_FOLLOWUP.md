# Backend Follow-up: Applicant Detail — Education + Always-Visible Fields

**Date:** 2026-06-07  
**From:** Joballa web frontend  
**Status:** Implemented — see [BACKEND_RESPONSE_EMPLOYER_APPLICANT_DETAIL.md](./BACKEND_RESPONSE_EMPLOYER_APPLICANT_DETAIL.md)  
**Route:** `GET /employer/applicants/:applicationId`

---

## Summary

Follow-up items from the employer detail UI are **implemented on the backend** (2026-06-07). Frontend is aligned.

| Request | Backend | Frontend |
| --- | --- | --- |
| `educations[]` on snapshot | Done | Education section always visible |
| Separate `documents` + `attachedDocuments` | Done | Client-side merge in `parseApplicantDetailProfile` |
| `coverNote` / `jobSpecificNote` | Done | Application note section always visible |
| Full `skills[]` + `highlightedSkills[]` | Done | Bold/muted skill display |

---

## Frontend after deploy

1. Hard-refresh applicant detail page.
2. All sections render (summary, skills, work, education, documents, application note).
3. Empty sections show placeholder text until worker profile / snapshot has data.

No further API changes required for this follow-up.
