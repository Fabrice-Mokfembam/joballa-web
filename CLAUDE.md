# Joballa Web

Next.js 15 app with App Router, TypeScript, Tailwind CSS, and `next-intl` for i18n.

## Structure

```
app/
  [locale]/          # i18n wrapper — locale is "en" | "fr"
    (marketing)/     # public-facing marketing site (no auth)
    admin/           # admin panel (protected)
    user/            # authenticated user dashboard (protected)
  api/               # API routes (no i18n prefix)
  globals.css
  layout.tsx         # root shell (delegates html/body to [locale])
components/
  ui/                # shared UI primitives (Button, etc.)
lib/
  i18n/
    routing.ts       # defineRouting — locales & defaultLocale
    navigation.ts    # typed Link/useRouter from next-intl
    request.ts       # getRequestConfig (loads messages)
messages/
  en.json
  fr.json
middleware.ts        # next-intl locale detection & redirect
```

## Commands

```bash
npm run dev      # start dev server
npm run build    # production build
npm run lint     # eslint
```

## Notes

- Default locale is `en`. Visiting `/` redirects to `/en`.
- Admin and user routes should be protected with a session check (add auth middleware).
- Add new locales by updating `messages/`, `lib/i18n/routing.ts`, and `lib/i18n/request.ts`.
