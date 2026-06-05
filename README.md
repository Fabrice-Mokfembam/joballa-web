# Joballa Web

Joballa Web is a bilingual Next.js 16 frontend for the Joballa hiring platform. The current codebase already includes separate public, worker, employer, and admin surfaces, but it is still in the frontend-foundation stage rather than full product-integration stage.

## What Has Been Built

- locale-based routing with `next-intl`
- English and French translation support
- public landing, login, and signup flows
- worker dashboard route set
- employer dashboard route set
- admin dashboard route set
- shared dashboard shell and UI primitives
- health endpoint at `/api/health`

## What Is Not Done Yet

- authentication
- backend/API integration
- real data fetching and mutations
- permissions and guarded routes
- automated tests

## Key Docs

- [Current status](C:\Users\INTER-TECH\Desktop\PROJECTS\joballa\joballa-web\docs\current-status.md)
- [Frontend architecture](C:\Users\INTER-TECH\Desktop\PROJECTS\joballa\joballa-web\docs\frontend-architecture.md)

## Local Development

```bash
npm run dev
```

Then open `http://localhost:3000`.
