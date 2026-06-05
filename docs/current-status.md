# Joballa Current Status

This document answers a simple question: what has actually been built so far in this codebase?

## Summary

The repository is currently an early-stage but intentional frontend foundation for Joballa. It is no longer just a default Next.js starter.

What exists today is mostly:

- a bilingual Next.js 16 App Router frontend
- a structured public marketing and entry flow
- separate route spaces for worker, employer, and admin experiences
- reusable dashboard shell and section components
- static content and placeholder product states for each role
- a basic health-check API route

What does **not** exist yet is equally important:

- real authentication
- backend API integration
- persistent data
- form submission flows
- route protection and permissions
- automated tests

## Product Surfaces Already Implemented

### Public surface

The public area under [`app/[locale]/(public)`](C:\Users\INTER-TECH\Desktop\PROJECTS\joballa\joballa-web\app\[locale]\(public)) includes:

- a branded landing page
- a role-aware login chooser
- a role-aware signup chooser
- locale switching between English and French

The landing page is composed in [`features/landing/landing-page.tsx`](C:\Users\INTER-TECH\Desktop\PROJECTS\joballa\joballa-web\features\landing\landing-page.tsx) and presents Joballa as a workforce platform for workers, employers, and admins, with support for informal work departments such as domestic work, logistics, agriculture, and construction.

### Worker surface

The worker area under [`app/[locale]/(worker)/worker`](C:\Users\INTER-TECH\Desktop\PROJECTS\joballa\joballa-web\app\[locale]\(worker)\worker) already has route coverage for:

- dashboard
- profile
- jobs
- applications
- payments
- settings

These pages are currently static UI shells with translated copy and placeholder cards. They already communicate the intended product model:

- profile-first onboarding
- structured job discovery
- tracked application flow
- mobile money payment readiness

### Employer surface

The employer area under [`app/[locale]/(employer)/employer`](C:\Users\INTER-TECH\Desktop\PROJECTS\joballa\joballa-web\app\[locale]\(employer)\employer) already has route coverage for:

- dashboard
- jobs
- applicants
- workforce
- payroll
- profile
- settings

This part of the app is framed around:

- structured job posting
- applicant review
- workforce tracking
- payroll preparation

Like the worker area, these are presentational screens at the moment rather than connected workflows.

### Admin surface

The admin area under [`app/[locale]/(admin)/admin`](C:\Users\INTER-TECH\Desktop\PROJECTS\joballa\joballa-web\app\[locale]\(admin)\admin) already has route coverage for:

- dashboard
- users
- jobs
- disputes
- departments
- reports
- settings

The current admin UI establishes the information architecture for:

- moderation and verification queues
- job review
- dispute handling
- internal department management
- reporting

## Technical Foundation Already In Place

### Next.js 16 app structure

The app uses:

- Next.js `16.2.3`
- React `19.2.4`
- App Router
- route groups for product surfaces

The top-level app layout is in [`app/layout.tsx`](C:\Users\INTER-TECH\Desktop\PROJECTS\joballa\joballa-web\app\layout.tsx), while locale-specific setup happens in [`app/[locale]/layout.tsx`](C:\Users\INTER-TECH\Desktop\PROJECTS\joballa\joballa-web\app\[locale]\layout.tsx).

### Internationalization

Internationalization is one of the strongest completed pieces so far.

Already implemented:

- locale-prefixed routing
- supported locales: `en` and `fr`
- locale-aware navigation helpers
- locale switcher component
- English and French translation message files

Main files:

- [`lib/i18n/routing.ts`](C:\Users\INTER-TECH\Desktop\PROJECTS\joballa\joballa-web\lib\i18n\routing.ts)
- [`lib/i18n/request.ts`](C:\Users\INTER-TECH\Desktop\PROJECTS\joballa\joballa-web\lib\i18n\request.ts)
- [`lib/i18n/navigation.ts`](C:\Users\INTER-TECH\Desktop\PROJECTS\joballa\joballa-web\lib\i18n\navigation.ts)
- [`components/navigation/locale-switcher.tsx`](C:\Users\INTER-TECH\Desktop\PROJECTS\joballa\joballa-web\components\navigation\locale-switcher.tsx)
- [`messages/en.json`](C:\Users\INTER-TECH\Desktop\PROJECTS\joballa\joballa-web\messages\en.json)
- [`messages/fr.json`](C:\Users\INTER-TECH\Desktop\PROJECTS\joballa\joballa-web\messages\fr.json)

### Shared UI building blocks

The codebase already has a small but clear shared component layer:

- [`components/layout/app-shell.tsx`](C:\Users\INTER-TECH\Desktop\PROJECTS\joballa\joballa-web\components\layout\app-shell.tsx)
- [`components/layout/section-block.tsx`](C:\Users\INTER-TECH\Desktop\PROJECTS\joballa\joballa-web\components\layout\section-block.tsx)
- [`components/ui/button.tsx`](C:\Users\INTER-TECH\Desktop\PROJECTS\joballa\joballa-web\components\ui\button.tsx)
- [`components/ui/badge.tsx`](C:\Users\INTER-TECH\Desktop\PROJECTS\joballa\joballa-web\components\ui\badge.tsx)

These components are already being reused across the product surfaces, which is a good sign that the frontend is being structured intentionally rather than page-by-page.

### Styling direction

The UI is styled with Tailwind CSS v4 and already shows a coherent visual direction:

- branded dark public hero sections
- light dashboard content surfaces
- rounded card-based layouts
- reusable shell patterns for role-specific dashboards

The implementation is design-forward, but still static.

### Health endpoint

A minimal operational endpoint exists at [`app/api/health/route.ts`](C:\Users\INTER-TECH\Desktop\PROJECTS\joballa\joballa-web\app\api\health\route.ts).

It currently returns a simple JSON status payload and is useful as a basic deployment or uptime check.

## What The Codebase Is Best Described As Right Now

Today, this repository is best described as:

- a frontend architecture and UI foundation
- a bilingual product shell
- a route-complete prototype for the major Joballa roles

It is **not yet** a feature-complete marketplace application.

## What Is Still Placeholder Or Static

The current screens mostly use translated copy and example metrics instead of live data.

Examples of static or not-yet-integrated behavior:

- login and signup pages route users to role areas but do not authenticate
- dashboard stats are illustrative
- profile, jobs, applicants, payroll, disputes, and reports views are presentational
- no database-backed mutations are visible in the frontend
- no server actions or API consumption for domain features are wired in yet
- no auth guard appears to protect worker, employer, or admin sections

## What Has Improved Compared To A Blank Starter

Substantial work has already been done compared to a freshly scaffolded app:

- the project has been moved off the default README-only starter state
- the route tree now matches the real product roles
- navigation points to real destinations instead of missing pages
- bilingual copy has been added across major surfaces
- the landing page now reflects the Joballa business model
- the dashboard areas are separated cleanly by audience

## Sensible Next Steps

If we continue from the current state, the most natural next implementation steps are:

1. add real auth and session handling
2. define role-based access control and route guards
3. connect dashboard pages to backend data
4. replace placeholder cards with real lists, tables, and forms
5. add loading, empty, and error states
6. add test coverage for routing, i18n, and key UI flows

## Related Docs

For structure and rationale, see [`docs/frontend-architecture.md`](C:\Users\INTER-TECH\Desktop\PROJECTS\joballa\joballa-web\docs\frontend-architecture.md).
