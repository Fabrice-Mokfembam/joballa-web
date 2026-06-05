# Joballa Frontend Replication Guide

This document is written for someone who wants to reproduce the current Joballa frontend structure in another project.

It explains:

- how the codebase is organized
- why the route structure is split the way it is
- how the English/French language system works
- how a page automatically changes when the user switches locale
- how Clerk auth and Joballa backend sync work together
- the rules to follow if you want the same behavior in another app

## 1. What kind of frontend structure this is

This frontend uses:

- Next.js App Router
- `next-intl` for internationalization
- route groups for separate product surfaces
- shared layout and UI primitives

The app is structured around product roles instead of random page folders.

That means the frontend is split into:

- public pages
- worker pages
- employer pages
- admin pages

This is important because each role has a different navigation, layout, and workflow.

## 2. The folder structure

The important folders are:

```text
app/
components/
features/
lib/
messages/
proxy.ts
```

### `app/`

This is the routing layer.

Important files:

- `app/layout.tsx`
  Root HTML/body wrapper
- `app/globals.css`
  Global styles and design tokens
- `app/[locale]/layout.tsx`
  Locale-aware app wrapper
- `app/[locale]/(public)/...`
  Public routes
- `app/[locale]/(worker)/worker/...`
  Worker routes
- `app/[locale]/(employer)/employer/...`
  Employer routes
- `app/[locale]/(admin)/admin/...`
  Admin routes

### `components/`

Reusable building blocks.

- `components/layout/`
  Shared shells and page wrappers
- `components/navigation/`
  Locale switcher and nav helpers
- `components/ui/`
  Buttons, badges, and other small UI pieces

### `features/`

For larger, product-specific UI composition.

Right now the best example is:

- `features/landing/landing-page.tsx`

This keeps complex page composition out of `page.tsx`.

### `lib/`

Shared infrastructure.

Important part:

- `lib/i18n/`

This is where the locale routing and message loading are configured.

### `messages/`

This is where all the text lives.

- `messages/en.json`
- `messages/fr.json`

If a piece of UI text is visible to the user, it should come from here.

### `proxy.ts`

This is the entry point that makes locale-based routing work before the request reaches the page.

In Next.js 16, `middleware.ts` is now `proxy.ts`.

## 3. The main idea behind the language system

The language system works because five pieces cooperate together:

1. `proxy.ts`
2. `lib/i18n/routing.ts`
3. `lib/i18n/request.ts`
4. `app/[locale]/layout.tsx`
5. `messages/en.json` and `messages/fr.json`

If these five pieces stay aligned, language switching works across the whole app.

## 4. How locale routing works

The app uses this folder:

```text
app/[locale]/
```

That means every main page lives under a locale segment.

Examples:

- `/en`
- `/fr`
- `/en/worker`
- `/fr/worker`
- `/en/admin`
- `/fr/admin`

That `[locale]` part is the dynamic route parameter.

So when the user visits `/en/worker`, the app knows the locale is `en`.

When the user visits `/fr/worker`, the app knows the locale is `fr`.

## 5. What `routing.ts` does

File:

- `lib/i18n/routing.ts`

This file defines the supported locales and default locale.

Example idea:

```ts
export const routing = defineRouting({
  locales: ["en", "fr"],
  defaultLocale: "en"
});
```

This tells the app:

- only English and French are valid
- English is the fallback/default

So this file is the source of truth for supported languages.

## 6. What `proxy.ts` does

File:

- `proxy.ts`

This file runs the locale-aware request handling before pages render.

It uses `next-intl/middleware` with the routing config.

What it does in practice:

- recognizes locale-prefixed routes
- ensures the request is processed with the correct locale context
- keeps the app consistent when navigating between localized routes

Without this file, locale-based page handling becomes unreliable.

## 7. What `request.ts` does

File:

- `lib/i18n/request.ts`

This file tells `next-intl` how to load the correct messages for the current request.

In simple terms:

- it reads the current locale
- it checks if that locale is valid
- it loads `messages/en.json` or `messages/fr.json`

That is the bridge between the URL and the translation file.

So:

- route is `/en/...` -> load `en.json`
- route is `/fr/...` -> load `fr.json`

## 8. What `app/[locale]/layout.tsx` does

File:

- `app/[locale]/layout.tsx`

This is the main locale-aware wrapper for the application.

It does three important things:

1. reads the `locale` route param
2. rejects invalid locales with `notFound()`
3. wraps the page tree in `NextIntlClientProvider`

Why this matters:

The provider is what makes translations available to the pages and components inside that route tree.

So if the user is inside `/fr/...`, everything under that layout gets French messages.

## 9. Where the text actually comes from

Files:

- `messages/en.json`
- `messages/fr.json`

These files contain matching translation keys.

Example idea:

```json
{
  "public": {
    "hero": {
      "title": "A bilingual hiring platform..."
    }
  }
}
```

and in French:

```json
{
  "public": {
    "hero": {
      "title": "Une plateforme bilingue..."
    }
  }
}
```

The structure of both files should stay the same.

Only the values change.

That is how the same page can render in two different languages without changing its component code.

## 10. How a page changes language automatically

This is the exact flow:

1. user visits a locale route like `/fr`
2. `proxy.ts` and `routing.ts` recognize `fr`
3. `request.ts` loads `messages/fr.json`
4. `app/[locale]/layout.tsx` provides those messages through `NextIntlClientProvider`
5. page/component asks for a translation key
6. `next-intl` returns the French value

If the user switches to `/en`, the same process happens again with `en.json`.

So the page itself does not need separate French and English files.

It only needs translation keys.

## 11. How components read translated text

There are two common ways used in this structure:

### On server components/pages

Use `getTranslations()`.

Example idea:

```ts
const t = await getTranslations("public");
```

Then:

```ts
t("hero.title")
```

### On client components

Use `useTranslations()`.

Example idea:

```ts
const t = useTranslations("localeSwitcher");
```

Then:

```ts
t("label")
```

That is why:

- pages/layouts often use `getTranslations`
- interactive client components often use `useTranslations`

## 12. How the language switcher works

File:

- `components/navigation/locale-switcher.tsx`

This component does not translate the app by magic.

What it really does is:

1. read the current locale
2. read the current pathname
3. create a link to the same route with another locale

So if the user is on:

- `/en/worker`

and clicks French, the switcher sends them to:

- `/fr/worker`

Then the whole message-loading pipeline runs again and the page becomes French.

That is the key idea:

The language switcher changes the locale in the route, not just some local UI state.

## 13. Why locale-aware links matter

File:

- `lib/i18n/navigation.ts`

This exports locale-aware helpers created by `next-intl/navigation`.

That includes:

- `Link`
- `redirect`
- `usePathname`
- `useRouter`

This is very important.

When navigating inside the app, use this `Link` instead of raw `<a>` tags and preferably instead of plain `next/link` for app routes.

Why:

- it preserves locale behavior
- it avoids hardcoded `/en/...` links
- it keeps navigation language-aware

If you hardcode links like `/en/worker`, your French flow will break.

That was one of the earlier problems before the refactor.

## 14. The rule that makes everything consistent

If you want this same system to work in your own project, follow this rule:

### Never hardcode visible text or language-specific paths in components.

That means:

- no hardcoded English UI strings in pages
- no hardcoded `/en/...` URLs
- no internal raw anchors for app navigation

Instead:

- all text comes from `messages/*.json`
- all routes use locale-aware navigation helpers

This is the reason the whole app actually changes language correctly.

## 15. Why route groups are used

Inside `app/[locale]/`, the app uses route groups:

- `(public)`
- `(worker)`
- `(employer)`
- `(admin)`

These groups help organize code without changing the URL path.

For example:

```text
app/[locale]/(worker)/worker/page.tsx
```

still resolves to:

- `/en/worker`
- `/fr/worker`

not:

- `/en/(worker)/worker`

So route groups are for structure, not for URL text.

## 16. Why the app is split by role

This structure is not arbitrary.

Worker, employer, and admin flows are different enough that each one needs:

- its own navigation
- its own dashboard
- its own page hierarchy
- its own future feature growth path

That is why each role gets:

- its own route group
- its own layout
- its own pages

This keeps the app maintainable as the product grows.

## 17. How the shared shell works

File:

- `components/layout/app-shell.tsx`

This is the reusable dashboard shell used by:

- worker layout
- employer layout
- admin layout

It receives:

- brand label
- title
- subtitle
- nav items
- utility text
- page content

This means the shell is shared, but the content is different per role.

That gives consistency without mixing the actual product flows together.

## 18. How the landing page is organized

Files:

- `app/[locale]/(public)/page.tsx`
- `features/landing/landing-page.tsx`

The route file is kept thin.

It just renders the feature component.

The larger composition lives in `features/landing/landing-page.tsx`.

This is a good pattern because:

- route file stays simple
- big page logic stays grouped together
- future landing-page changes stay localized

## 19. If your friend wants to copy this exactly

Tell him to reproduce these pieces in this order:

### Step 1

Create locale routing:

- `app/[locale]/...`
- `lib/i18n/routing.ts`
- `lib/i18n/request.ts`
- `proxy.ts`

### Step 2

Create translation files:

- `messages/en.json`
- `messages/fr.json`

### Step 3

Wrap the localized app with:

- `app/[locale]/layout.tsx`
- `NextIntlClientProvider`

### Step 4

Create locale-aware navigation:

- `lib/i18n/navigation.ts`
- use exported `Link`

### Step 5

Create role-based route groups:

- `(public)`
- `(worker)`
- `(employer)`
- `(admin)`

### Step 6

Move all visible strings into translation files

### Step 7

Add a locale switcher that changes the route locale, not just UI state

## 20. Common mistakes to avoid

If your friend is trying to replicate this structure, these are the mistakes that will break it:

### Mistake 1

Hardcoding `/en/...` links

This causes French navigation to jump back to English.

### Mistake 2

Using raw `<a>` tags for internal app routes

This breaks Next navigation behavior and can bypass locale-aware helpers.

### Mistake 3

Keeping strings directly inside components

Then the page will not fully switch language.

### Mistake 4

Using different key structures in `en.json` and `fr.json`

Both files should match in shape.

### Mistake 5

Not wrapping the localized app tree with `NextIntlClientProvider`

Then the pages/components will not receive the right messages.

## 21. Short summary you can send with this doc

If you want one short explanation for your friend, use this:

> The app works in English and French because the locale is part of the route (`/[locale]`), `next-intl` loads the matching message file for that locale, the localized layout provides those messages to the page tree, and all internal navigation uses locale-aware helpers instead of hardcoded English links. The structure is split into public, worker, employer, and admin route groups so each product surface can grow independently while still sharing the same translation system.

## 22. Final mental model

Here is the easiest way to remember the architecture:

- `proxy.ts` catches the request
- `routing.ts` defines the valid locales
- `request.ts` loads the correct language file
- `app/[locale]/layout.tsx` provides translations to the app
- `messages/*.json` hold the actual text
- locale-aware `Link` keeps navigation in the selected language

That is the whole system.

## 23. How auth works in the current version

The app still uses Clerk as the authentication system.

Clerk still owns:

- sign up
- sign in
- session creation
- social login
- verification code generation
- verification code validation

The Joballa backend owns:

- local user sync
- role assignment
- worker/employer profile shell creation
- authorization against Joballa APIs

The practical frontend flow is:

1. user signs in or signs up with Clerk
2. Clerk completes verification and creates the session
3. frontend gets the Clerk session token
4. frontend calls Joballa backend routes with `Authorization: Bearer <token>`
5. backend returns auth state and dashboard destination

Important:

The delivery layer changed behind the scenes, but the frontend auth contract did not.

That means:

- frontend still starts auth with Clerk
- frontend still does not build its own OTP system
- frontend still uses the same Joballa auth/profile routes after session activation

## 24. Verification delivery change

Clerk should no longer be thought of as the direct message sender.

The updated delivery model is:

1. Clerk generates the verification message or code
2. Clerk notifies the Joballa backend
3. backend sends email through Resend
4. backend sends SMS through Africa's Talking

From the frontend point of view:

- nothing changes in the API contract
- nothing changes in bearer token usage
- nothing changes in the onboarding sequence

The only mental model update is this:

- Clerk still owns auth
- Joballa backend now owns delivery of Clerk-triggered verification messages

## 25. Frontend routes and backend routes involved in auth

Frontend auth routes:

- `app/[locale]/(public)/sign-in/[[...sign-in]]/page.tsx`
- `app/[locale]/(public)/sign-up/[[...sign-up]]/page.tsx`
- `app/[locale]/auth/callback/page.tsx`
- `app/[locale]/auth/select-role/page.tsx`

Backend routes used by frontend after session creation:

- `GET /auth/me`
- `POST /auth/sync`
- `POST /auth/select-role`

Backend webhook route used by Clerk only:

- `POST /webhooks/clerk`

The frontend does not call that webhook route.

## 26. Local development base URL

For the current local frontend setup, the backend base URL should be:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

If this value is wrong, auth sync and profile fetch/update requests will fail even if Clerk login itself succeeds.
