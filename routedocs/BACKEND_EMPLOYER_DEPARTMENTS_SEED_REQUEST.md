# Backend Request: Employer Departments — Seed + List API

**Date:** 2026-06-07  
**From:** Joballa web frontend (`joballa-web-copy`)  
**To:** Backend / DB team  
**Status:** Requested — blocks category-based job posting for all categories except `software_tech`

---

## Summary

Employers pick a **category** in the post-job UI (Education, Domestic work, Software & technology, Other, …). The API still requires **`departmentId`** (UUID → `departments.id`). There is **no** `GET /employer/departments` today (404), and only one department row is usable in dev (`software_tech`).

Please **seed one active department per category** and expose a list endpoint so the frontend can resolve category → UUID without hard-coded env JSON.

---

## Frontend category values (must map 1:1)

These match `department_category` in `joballa-final-schema-v2.md` and the employer post-job dropdown:

| `category` (slug) | UI label |
| --- | --- |
| `education` | Education |
| `domestic` | Domestic work |
| `logistics` | Logistics & delivery |
| `events` | Events & hospitality |
| `agriculture` | Agriculture |
| `construction` | Construction |
| `software_tech` | Software & technology |
| `other` | Other |

**`other` must always exist** (schema requirement).

---

## Prisma model (reference)

```prisma
model Department {
  id          String   @id @default(uuid()) @db.Uuid
  name        String
  slug        String   @unique
  category    DepartmentCategory
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

```prisma
enum DepartmentCategory {
  education
  domestic
  logistics
  events
  agriculture
  construction
  software_tech
  other
}
```

---

## Seed data (suggested rows)

Use stable UUIDs in seed script so frontend/dev env can reference them. Example:

```ts
const DEPARTMENTS_SEED = [
  {
    id: "11111111-1111-4111-8111-111111110001",
    name: "Education",
    slug: "education",
    category: "education",
    description: "Teaching, tutoring, school support",
    isActive: true,
  },
  {
    id: "11111111-1111-4111-8111-111111110002",
    name: "Domestic work",
    slug: "domestic",
    category: "domestic",
    description: "Housekeeping, childcare, home support",
    isActive: true,
  },
  {
    id: "11111111-1111-4111-8111-111111110003",
    name: "Logistics & delivery",
    slug: "logistics",
    category: "logistics",
    description: "Drivers, warehouse, last-mile delivery",
    isActive: true,
  },
  {
    id: "11111111-1111-4111-8111-111111110004",
    name: "Events & hospitality",
    slug: "events",
    category: "events",
    description: "Catering, events, hotel staff",
    isActive: true,
  },
  {
    id: "11111111-1111-4111-8111-111111110005",
    name: "Agriculture",
    slug: "agriculture",
    category: "agriculture",
    description: "Farming, agro-processing, field work",
    isActive: true,
  },
  {
    id: "11111111-1111-4111-8111-111111110006",
    name: "Construction",
    slug: "construction",
    category: "construction",
    description: "Building, trades, site work",
    isActive: true,
  },
  {
    id: "ae761000-7002-4136-bf74-e5aabe5ae799",
    name: "Software & technology",
    slug: "software-tech",
    category: "software_tech",
    description: "Engineering, design, IT",
    isActive: true,
  },
  {
    id: "11111111-1111-4111-8111-111111110099",
    name: "Other",
    slug: "other",
    category: "other",
    description: "Categories not listed above",
    isActive: true,
  },
] as const;
```

### Seed script requirements

1. **Upsert** by `slug` or `category` — do not duplicate on re-run.
2. Keep **`ae761000-7002-4136-bf74-e5aabe5ae799`** if existing jobs reference it (rename display name from "Integration Smoke" → "Software & technology").
3. Set `isActive: true` for all seeded rows.
4. Run in `prisma/seed.ts` (or dedicated `seed-departments.ts` invoked from main seed).

Example Prisma upsert pattern:

```ts
for (const row of DEPARTMENTS_SEED) {
  await prisma.department.upsert({
    where: { slug: row.slug },
    create: row,
    update: {
      name: row.name,
      category: row.category,
      description: row.description,
      isActive: true,
    },
  });
}
```

---

## New API: `GET /employer/departments`

**Auth:** employer bearer token  
**Purpose:** populate category → `departmentId` mapping in post/edit job flows

### Response

```json
{
  "data": [
    {
      "id": "11111111-1111-4111-8111-111111110001",
      "name": "Education",
      "slug": "education",
      "category": "education",
      "isActive": true
    }
  ]
}
```

Or paginated (frontend accepts both via `data[]`):

```json
{
  "data": [ /* ... */ ],
  "total": 8,
  "page": 1,
  "limit": 50
}
```

### Query params (optional)

| Param | Type | Notes |
| --- | --- | --- |
| `isActive` | `boolean` | default `true` |
| `category` | `string` | filter single category |

### Errors

| HTTP | When |
| --- | --- |
| `401` | Missing/invalid token |
| `403` | Not an employer |

---

## How frontend will use this

1. On post-job / edit-job load: `GET /employer/departments`
2. Build map: `category` slug → `id`
3. When employer selects category **Education** → send `departmentId` for `category: "education"`
4. When employer selects **Other** + free-text label → send `departmentId` for `category: "other"` (custom label is UI-only until a dedicated field exists)

Until this ships, frontend falls back to env `NEXT_PUBLIC_JOB_DEPARTMENTS_JSON` and shows *“This category is not set up yet”* when no UUID exists.

---

## Verification checklist (backend)

- [ ] `GET /employer/departments` returns 8 rows (or all active departments)
- [ ] Each `category` slug appears exactly once among active departments
- [ ] `other` department exists
- [ ] `POST /employer/jobs` with `departmentId` from each category succeeds
- [ ] Existing jobs referencing `ae761000-7002-4136-bf74-e5aabe5ae799` still resolve

---

## Related docs

- [BACKEND_EMPLOYER_JOB_POSTING_GUIDE.md](./BACKEND_EMPLOYER_JOB_POSTING_GUIDE.md)
- [joballa-final-schema-v2.md](./joballa-final-schema-v2.md) — `department_category`, `departments` table
- [FRONTEND_EMPLOYER_ROUTES.md](./FRONTEND_EMPLOYER_ROUTES.md)

---

## Optional follow-up

- Admin CRUD for departments (`/admin/departments`) — already planned in marketing copy
- Return `department` object on job list items (already on detail) for display consistency
