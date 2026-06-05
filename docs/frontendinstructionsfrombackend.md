# Frontend Integration Guide

> **Superseded for auth:** The web app now uses direct Joballa JWT auth (`POST /auth/register`, `/auth/login`, etc.). See **[auth-api.md](./auth-api.md)** for the current routes. The Clerk + `POST /auth/sync` flow below is historical.

This document is for the frontend team.

It explains:

- how auth works
- how Clerk and the backend work together
- what routes are available
- what each route expects
- what each route returns

Important:

The backend does **not** handle raw email/password signup or login directly.

Those actions happen in Clerk.

The backend expects a valid Clerk session token after auth is already complete.

## The Big Idea

The frontend talks to **two systems**:

1. Clerk
2. Joballa backend

### Clerk handles

- sign up
- sign in
- OTP verification
- email verification
- phone verification
- social login
- session token creation

### Joballa backend handles

- creating the local app user
- assigning local role
- creating profile shell
- profile read/update
- route permissions

## Frontend Environment Variables

These should exist on the frontend side.

### Next.js web

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
NEXT_PUBLIC_API_BASE_URL="http://localhost:5000"
```

### Expo mobile

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
EXPO_PUBLIC_API_BASE_URL="http://localhost:5000"
```

You will also need your normal Clerk redirect/deep-link setup inside the frontend app.

## How To Authenticate Requests To The Backend

After the user is signed in with Clerk, get the session token from Clerk and send it like this:

```http
Authorization: Bearer <clerk_session_token>
```

All protected backend routes expect that header.

## Golden Rule

### After signup

Call:

```http
POST /auth/sync
```

### After normal login

Call:

```http
GET /auth/me
```

### After first social login with no local role yet

Call:

```http
GET /auth/me
```

If `needsRoleSelection` is `true`, show the role selector and then call:

```http
POST /auth/select-role
```

## Expected User Flow

## Worker or employer signup with code verification

1. Collect:

- name
- email or phone
- password
- selected role

2. Complete signup in Clerk

3. Complete code verification in Clerk

4. Activate the Clerk session

5. Get session token

6. Call:

```http
POST /auth/sync
```

Body:

```json
{
  "role": "WORKER",
  "name": "Jane Doe",
  "languagePreference": "EN"
}
```

7. Read the response

8. Redirect using `dashboardRoute`

## Normal login

1. Sign in with Clerk
2. Get session token
3. Call `GET /auth/me`
4. Redirect using `dashboardRoute`

## First social login

1. Sign in with Google / Apple / Facebook using Clerk
2. Get session token
3. Call `GET /auth/me`
4. If `needsRoleSelection` is `true`, ask the user to choose:

- Worker
- Employer

5. Call `POST /auth/select-role`
6. Redirect using `dashboardRoute`

## Base Response Shape For Auth Routes

Auth routes return this shape:

```json
{
  "authenticated": true,
  "needsRoleSelection": false,
  "dashboardRoute": "/worker/dashboard",
  "clerk": {
    "clerkUserId": "user_123",
    "sessionId": "sess_123",
    "email": "jane@example.com",
    "phone": null,
    "firstName": "Jane",
    "lastName": "Doe",
    "fullName": "Jane Doe",
    "imageUrl": "https://...",
    "emailVerified": true,
    "phoneVerified": false
  },
  "user": {
    "id": "local-user-id",
    "clerkId": "user_123",
    "email": "jane@example.com",
    "phone": null,
    "role": "WORKER",
    "languagePreference": "EN",
    "verificationStatus": "PENDING",
    "isActive": true,
    "createdAt": "2026-04-28T12:00:00.000Z",
    "updatedAt": "2026-04-28T12:00:00.000Z"
  },
  "profileType": "worker",
  "profile": {
    "id": "worker-profile-id",
    "userId": "local-user-id",
    "fullName": "Jane Doe",
    "city": null,
    "region": null,
    "dateOfBirth": null,
    "bio": null,
    "preferredJobCategories": [],
    "languagesSpoken": [],
    "availabilityStatus": "AVAILABLE",
    "skills": [],
    "workHistory": [],
    "education": [],
    "nationalIdDocUrl": null,
    "verificationStatus": "PENDING",
    "verificationNotes": null,
    "uploadedResumeUrl": null,
    "profileCompleteness": 14,
    "mobileMoneyProvider": null,
    "mobileMoneyNumber": null,
    "createdAt": "2026-04-28T12:00:00.000Z",
    "updatedAt": "2026-04-28T12:00:00.000Z"
  }
}
```

## Route Reference

## 1. `GET /auth/me`

Purpose:

- ask the backend, "Who is this user inside Joballa?"

Auth:

- required

Headers:

```http
Authorization: Bearer <clerk_session_token>
```

Body:

- none

Frontend use:

- after login
- after app refresh
- after social login
- on protected app bootstrap

Special meaning:

- if `needsRoleSelection` is `true`, the user exists in Clerk but not yet in Joballa local DB

## 2. `POST /auth/sync`

Purpose:

- create or update the local Joballa account after Clerk auth

Auth:

- required

Headers:

```http
Authorization: Bearer <clerk_session_token>
Content-Type: application/json
```

Body:

```json
{
  "role": "WORKER",
  "name": "Jane Doe",
  "languagePreference": "EN"
}
```

Body fields:

- `role`
  required only on first local sync
  allowed public values:
  - `WORKER`
  - `EMPLOYER`

- `name`
  optional but strongly recommended
  used to seed the first profile

- `languagePreference`
  optional
  allowed values:
  - `EN`
  - `FR`

What the backend does:

- verifies the Clerk token
- loads Clerk user info
- finds local user by `clerkId`
- creates local user if missing
- creates worker or employer profile shell
- syncs Clerk metadata
- returns full auth state

## 3. `POST /auth/select-role`

Purpose:

- finish onboarding when a user signed in with social auth but still has no Joballa role

Auth:

- required

Body:

```json
{
  "role": "EMPLOYER",
  "name": "Acme Services",
  "languagePreference": "FR"
}
```

Use this when:

- `GET /auth/me` returns `needsRoleSelection: true`

## 4. `GET /worker-profiles/me`

Purpose:

- get the current worker profile

Auth:

- required

Role:

- `WORKER`

Body:

- none

Returns:

- full worker profile object

## 5. `PATCH /worker-profiles/me`

Purpose:

- update the current worker profile

Auth:

- required

Role:

- `WORKER`

Accepted body fields:

```json
{
  "fullName": "Jane Doe",
  "city": "Douala",
  "region": "Littoral",
  "dateOfBirth": "1998-06-15",
  "bio": "Reliable and detail-oriented worker.",
  "preferredJobCategories": ["DOMESTIC", "EVENTS"],
  "languagesSpoken": ["English", "French"],
  "availabilityStatus": "AVAILABLE",
  "skills": ["Cleaning", "Childcare"],
  "workHistory": [
    {
      "employer": "Home Services Ltd",
      "role": "Cleaner",
      "startDate": "2024-01-01",
      "endDate": "2024-10-31",
      "description": "Daily cleaning and support."
    }
  ],
  "education": [
    {
      "institution": "Bilingual High School",
      "qualification": "Advanced Level",
      "startYear": 2018,
      "endYear": 2020
    }
  ],
  "nationalIdDocUrl": "https://...",
  "uploadedResumeUrl": "https://...",
  "mobileMoneyProvider": "MTN_MOMO",
  "mobileMoneyNumber": "670000000"
}
```

Returns:

- updated worker profile

Note:

- `profileCompleteness` is recalculated by the backend

## 6. `GET /employer-profiles/me`

Purpose:

- get the current employer profile

Auth:

- required

Role:

- `EMPLOYER`

Returns:

- full employer profile object

## 7. `PATCH /employer-profiles/me`

Purpose:

- update the current employer profile

Auth:

- required

Role:

- `EMPLOYER`

Accepted body fields:

```json
{
  "companyName": "Acme Services",
  "industry": "Logistics",
  "location": "Douala",
  "logoUrl": "https://...",
  "website": "https://acme.example.com",
  "about": "We hire workers across logistics and delivery.",
  "businessRegDocUrl": "https://...",
  "paymentProvider": "ORANGE_MONEY",
  "paymentAccount": "690000000"
}
```

Returns:

- updated employer profile

## Public Route

## `GET /`

Purpose:

- root terminal-style backend status page

Auth:

- not required

## Recommended Frontend API Wrapper

Every protected request should:

1. ask Clerk for the current session token
2. send `Authorization: Bearer <token>`
3. call the backend

Pseudo flow:

```ts
const token = await getToken();

await fetch(`${API_BASE_URL}/auth/me`, {
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

## Error Handling Guide

`400`

- request body is wrong
- missing first-time role
- invalid enum value

Frontend action:

- show validation message

`401`

- token missing
- token invalid
- session expired

Frontend action:

- send user back to auth flow

`403`

- valid token, wrong Joballa role

Frontend action:

- block access and show permission message

`404`

- local profile does not exist

Frontend action:

- call `POST /auth/sync` if appropriate

`503`

- Clerk backend configuration missing

Frontend action:

- show backend configuration issue

## Frontend Team Checklist

Before saying the integration is done, confirm:

1. Clerk signup works
2. Clerk verification works
3. Clerk session token can be read
4. token is sent to backend
5. `POST /auth/sync` works after signup
6. `GET /auth/me` works after login
7. first social login handles `needsRoleSelection`
8. worker profile screen uses `GET /worker-profiles/me`
9. worker profile save uses `PATCH /worker-profiles/me`
10. employer profile screen uses `GET /employer-profiles/me`
11. employer profile save uses `PATCH /employer-profiles/me`
