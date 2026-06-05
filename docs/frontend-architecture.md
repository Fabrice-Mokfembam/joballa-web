# Joballa Frontend Architecture

This document explains the current frontend structure in `joballa-web`, why it is organized this way, and how the main pieces work together.

## High-level idea

The frontend is a Next.js App Router application with:

- locale-based routing using `next-intl`
- route groups for the main product surfaces
- shared layout and UI primitives
- feature-level composition for larger screens such as the landing page

The current structure is designed around the actual product roles in the scope document:

- public marketing and auth pages
- worker portal
- employer portal
- admin panel

## Top-level structure

```text
app/
components/
docs/
features/
lib/
messages/
proxy.ts
```

## What each area is for

### `app/`

This is the routing layer.

- `app/layout.tsx`
  Root HTML/body wrapper for the whole app.
- `app/globals.css`
  Global Tailwind v4 styles and design tokens.
- `app/not-found.tsx`
  Fallback 404 for non-localized routes.
- `app/api/health/route.ts`
  Health endpoint.
- `app/[locale]/`
  Locale-aware application routes.

### `components/`

This holds reusable UI and layout building blocks.

- `components/ui/`
  Small reusable primitives like buttons and badges.
- `components/layout/`
  Shared shells and section wrappers.
- `components/navigation/`
  Navigation-specific components like the locale switcher.

### `features/`

This is where larger product-specific UI composition lives.

Right now:

- `features/landing/landing-page.tsx`
  The public homepage content and section composition.

As the app grows, more domain-level features can move here:

- worker dashboard sections
- employer applicant review blocks
- admin moderation panels

### `lib/`

This contains shared app infrastructure.

- `lib/i18n/`
  Locale routing, request config, and locale-aware navigation helpers.
- `lib/utils.ts`
  Shared helpers like `cn()`.

### Auth and the Joballa API

Authentication is handled entirely against the external NestJS API (`/auth/*`), not via Next.js route handlers. HTTP wrappers live in `features/auth/api/auth.ts`; session helpers in `lib/auth/establish-session.ts`; types in `lib/types/auth.ts`.

See **[docs/auth-api.md](./auth-api.md)** for every auth route, payloads, responses, and which UI flows call them.

### `messages/`

Translation files for all visible UI copy.

- `messages/en.json`
- `messages/fr.json`

All user-facing strings should come from here instead of being hardcoded in components.

### `proxy.ts`

This is the Next.js 16 replacement for `middleware.ts`.

It runs the `next-intl` request handling so locale-aware routing works across the app.

## Route structure

The main application routing is under:

```text
app/[locale]/
```

This means pages are resolved with a locale prefix like:

- `/en`
- `/fr`
- `/en/worker`
- `/fr/admin`

Inside `app/[locale]/`, route groups are used to organize the product without changing the URL path.

## Route groups

### `app/[locale]/(public)/`

Public-facing routes:

- landing page
- login
- signup

Files:

```text
app/[locale]/(public)/layout.tsx
app/[locale]/(public)/page.tsx
app/[locale]/(public)/login/page.tsx
app/[locale]/(public)/signup/page.tsx
```

This group is for marketing and entry flows.

### `app/[locale]/(worker)/worker/`

Worker product surface:

- dashboard
- profile
- jobs
- applications
- payments
- settings

This group uses a dedicated worker layout so the worker shell and navigation stay separate from employer and admin UI.

### `app/[locale]/(employer)/employer/`

Employer product surface:

- dashboard
- jobs
- applicants
- workforce
- payroll
- profile
- settings

This keeps employer-specific navigation and page structure isolated.

### `app/[locale]/(admin)/admin/`

Admin product surface:

- dashboard
- users
- jobs
- disputes
- departments
- reports
- settings

This gives admin operations their own shell and route space.

## How layouts work together

### 1. Root layout

`app/layout.tsx` provides the outer HTML and body tags for the whole application.

### 2. Locale layout

`app/[locale]/layout.tsx` does the locale-specific setup:

- validates the locale
- loads the correct translation messages
- wraps the route tree with `NextIntlClientProvider`

This is the key bridge between routing and translation.

### 3. Route-group layouts

Each product surface can then have its own layout:

- public layout
- worker layout
- employer layout
- admin layout

These layouts are responsible for section-specific shells, not for global app setup.

## Shared layout components

### `components/layout/app-shell.tsx`

This is the reusable shell for the worker, employer, and admin surfaces.

It handles:

- sidebar
- section title
- description
- nav links
- content area

The worker, employer, and admin route layouts each pass different nav items and copy into this shell.

### `components/layout/section-block.tsx`

This is a reusable page section wrapper.

It standardizes:

- eyebrow label
- section title
- description
- content container

This keeps individual pages simpler and visually consistent.

## Navigation and i18n flow

### `lib/i18n/routing.ts`

Defines the supported locales and default locale.

### `lib/i18n/request.ts`

Loads the correct locale messages per request.

### `lib/i18n/navigation.ts`

Exports locale-aware helpers from `next-intl`, including:

- `Link`
- `redirect`
- `usePathname`
- `useRouter`

Use this `Link` instead of `next/link` when navigating between app routes so locale behavior stays correct.

### `components/navigation/locale-switcher.tsx`

This reads the current locale and pathname, then switches between `en` and `fr` without breaking the current route context.

## Current page composition pattern

The codebase currently uses this pattern:

1. Route file lives in `app/.../page.tsx`
2. Page reads translated strings with `getTranslations()`
3. Page composes reusable building blocks like `SectionBlock`
4. Shared shells come from route layouts

For the landing page, the route file is intentionally thin:

- `app/[locale]/(public)/page.tsx`
  just renders the feature component
- `features/landing/landing-page.tsx`
  contains the larger landing page composition

This is the preferred direction for more complex screens.

## Why the codebase is split this way

This structure solves a few practical problems:

### 1. It keeps role-based UI separate

Worker, employer, and admin flows are different enough that sharing one generic dashboard structure would become messy quickly.

### 2. It removes broken navigation

The previous layout linked to pages that did not exist. The current structure creates actual routes for the main navigation destinations.

### 3. It makes i18n first-class

Because everything is under `app/[locale]` and uses shared locale-aware navigation, English and French can scale with the rest of the app.

### 4. It keeps page files from becoming giant

Reusable shells and sections reduce duplication and make it easier to move larger features into `features/` later.

## Current design system direction

The styling currently uses:

- Tailwind CSS v4
- design tokens in `app/globals.css`
- shared UI primitives in `components/ui/`

The design direction favors:

- light, clean dashboard surfaces
- dark hero/public header contrast
- reusable rounded cards and shells

## How data should plug in later

The current frontend is mostly structural and presentation-focused. As backend integration starts, the expected direction is:

1. keep route files thin
2. add API helpers under `lib/` or feature-local files
3. move domain-specific UI into `features/`
4. keep shared primitives in `components/ui/`

Suggested future additions:

```text
features/jobs/
features/applications/
features/worker-profile/
features/payments/
lib/api/
lib/permissions/
lib/validation/
```

## Current limitations

This codebase is now structurally cleaner, but it is still early-stage.

What is already done:

- route-group based frontend structure
- locale-aware navigation
- bilingual landing page and entry pages
- real route destinations for worker/employer/admin nav
- Clerk auth entry points and callback flow
- backend-backed worker/employer profile fetch and update flows

What still needs to come later:

- forms and mutations
- permissions/guards
- loading and error states per feature
- tests

## Quick mental model

If you want one short way to think about the codebase:

- `app/` decides **where the user is**
- `components/` provides **reusable building blocks**
- `features/` assembles **product-specific UI**
- `lib/` provides **shared infrastructure**
- `messages/` provides **all visible text**

That is the current frontend architecture in one sentence.
