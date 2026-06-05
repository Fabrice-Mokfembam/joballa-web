# Seeding the database (employer + worker panels)

The **joballa-web** app does not talk to PostgreSQL directly. All rows are created through the **Joballa API** (`NEXT_PUBLIC_API_BASE_URL`), which persists to your Neon/Postgres database.

The earlier in-memory demo layer (`NEXT_PUBLIC_USE_DEMO_DATA`) only fakes API responses in the browser. To fill the **real DB**, use the seed script below.

## 1. Turn off frontend demo mode

In `.env`:

```env
NEXT_PUBLIC_USE_DEMO_DATA=false
```

Restart `npm run dev`.

## 2. API must use the same database

- **Local:** Run the Nest API on port `8000` with `DATABASE_URL` pointing at your Neon DB (or local Postgres).
- **Render:** `SEED_API_URL=https://joballa-api.onrender.com` (default from `.env`) — seeding writes to whatever DB that deployment uses.

## 3. Accounts

You need users that already exist (or register locally with a fixed OTP).

| Variable | Purpose |
|----------|---------|
| `SEED_EMPLOYER_EMAIL` | Employer login |
| `SEED_EMPLOYER_PASSWORD` | Employer password |
| `SEED_WORKER_EMAIL` | Worker login |
| `SEED_WORKER_PASSWORD` | Worker password |
| `SEED_ADMIN_EMAIL` | **Recommended** — approves jobs so they appear in worker search |
| `SEED_ADMIN_PASSWORD` | Admin password |

Optional local-only registration (API must expose `JOBALLA_DEV_FIXED_OTP`):

```env
SEED_REGISTER=1
SEED_DEV_OTP=123456
SEED_EMPLOYER_EMAIL=employer.seed@joballa.test
SEED_WORKER_EMAIL=worker.seed@joballa.test
SEED_EMPLOYER_PASSWORD=SeedDemo2026!
SEED_WORKER_PASSWORD=SeedDemo2026!
```

## 4. Run the seed

From `joballa-web`:

```bash
npm run seed:demo
```

### Tech Chantier + teaching worker (`npm run seed:accounts`)

Dedicated accounts for demo employer **Tech Chantier** (IT jobs + logo) and a **teaching-focused worker**:

| Variable | Default |
|----------|---------|
| `SEED_TECH_CHANTIER_EMAIL` | `takemjimreepls@gmail.com` |
| `SEED_TECH_CHANTIER_PASSWORD` | (required in `.env`) |
| `SEED_TEACHING_WORKER_EMAIL` | `tjanonymous39@gmail.com` |
| `SEED_TEACHING_WORKER_PASSWORD` | (required in `.env`) |

```bash
npm run seed:accounts
```

- Patches employer company (name, logo URL, bio).
- Creates 12 IT jobs + 10 `[Education]` teaching jobs (set `SEED_TEACHING_JOBS=0` to skip teaching postings).
- Enriches worker profile for tutoring/education and applies to teaching-related listings.

### Takem Family Health (employer)

| Variable | Default |
|----------|---------|
| `SEED_HEALTH_EMPLOYER_EMAIL` | `takemfamily2025@gmail.com` |
| `SEED_HEALTH_EMPLOYER_PASSWORD` | (required in `.env`) |

Seeds company profile (healthcare) and **14 healthcare job postings** (nursing, lab, community health, etc.). Set only `SEED_HEALTH_EMPLOYER_PASSWORD` to run just this employer; omit other seed passwords to skip Tech Chantier / worker steps.

Optional tuning:

| Variable | Default | Meaning |
|----------|---------|---------|
| `SEED_API_URL` | `NEXT_PUBLIC_API_BASE_URL` | API base |
| `SEED_JOB_COUNT` | `22` | Jobs created by employer |
| `SEED_APPLY_COUNT` | `18` | Worker applications |
| `SEED_SAVE_COUNT` | `10` | Saved jobs |
| `SEED_SHORTLIST_COUNT` | `14` | Applicants shortlisted |
| `SEED_HIRE_COUNT` | `6` | Applicants marked hired (workforce) |

## 5. What gets created

1. **Employer** — many job postings (`pending_review` → `ACTIVE` when admin approves).
2. **Admin** (if configured) — approves moderation queue jobs.
3. **Worker** — full profile (personal, summary, skills, payment, work history).
4. **Worker** — applies to jobs, saves some jobs.
5. **Employer** — shortlists and hires applicants (workforce / engagements).

Worker job search only lists **`ACTIVE`** jobs. Without admin approval, panels will look empty until an admin approves postings in the admin UI.

## 6. Backend repo scripts

If you have the **joballa-api** (Nest) repository locally, it may also ship:

- `JOBALLA_EMPLOYER_BOOTSTRAP=1` / `JOBALLA_WORKER_BOOTSTRAP=1` (Prisma + DB)
- `npm run smoke:employer` / `npm run smoke:worker`

Those run from the **API repo root**, not from `joballa-web`. This web script is the portable option when you only have the frontend checkout and API URL.

## 7. Verify

1. Sign in as **employer** → dashboard, applicants, jobs, workforce, payroll.
2. Sign in as **worker** → find jobs, applications, saved jobs, profile, earnings (if payments exist).

If lists are still empty, check:

- `NEXT_PUBLIC_USE_DEMO_DATA=false`
- Jobs are **approved** (admin) and **ACTIVE**
- Seed credentials match the users you sign in with
