# AGENT.md — SecureGate

This file is the operational guide for any AI coding agent working in this repository.
Read this file fully before making any changes. Follow every rule here on every task.

---

## Project Overview

SecureGate is a standalone authentication application built with Next.js 14 (App Router).
It implements a complete identity and access management (IAM) layer including sign up,
login, email verification, password reset, session handling, and brute-force protection.

This is not a full product. Every file, decision, and implementation in this repo exists
to demonstrate correct, secure, production-quality auth engineering.

---

## Tech Stack

| Layer           | Technology                            |
|-----------------|---------------------------------------|
| Framework       | Next.js 14 (App Router)               |
| Language        | TypeScript                            |
| Database        | PostgreSQL via Prisma ORM             |
| Auth            | NextAuth.js (Auth.js)                 |
| Passwords       | bcryptjs                              |
| Email           | Resend + React Email                  |
| Validation      | Zod                                   |
| Rate Limiting   | Upstash/ratelimit or custom middleware|
| Deployment      | Vercel                                |
| Version Control | GitHub                                |

---

## Project Structure

```
/app
  /auth
    /login/page.tsx
    /signup/page.tsx
    /verify-email/page.tsx
    /forgot-password/page.tsx
    /reset-password/page.tsx
  /dashboard/page.tsx
  /api
    /auth/[...nextauth]/route.ts
    /auth/verify/route.ts
    /auth/forgot-password/route.ts
    /auth/reset-password/route.ts
/components
  /ui              — Shared UI primitives (inputs, buttons, alerts)
  /forms           — Form components per auth screen
  /email           — React Email templates
/lib
  /auth.ts         — NextAuth configuration
  /db.ts           — Prisma client singleton
  /email.ts        — Resend client and send helpers
  /rate-limit.ts   — Rate limiter initialisation
  /validations.ts  — All Zod schemas
/middleware.ts     — Route protection and rate limiting
/prisma
  /schema.prisma
```

Do not create files outside this structure without a clear reason.
Do not move or rename existing files unless explicitly instructed.

---

## Database Schema

The Prisma schema defines three core models. Do not alter the schema without instruction.

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  password      String
  emailVerified Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  tokens        Token[]
}

model Token {
  id        String    @id @default(cuid())
  token     String    @unique
  type      TokenType
  expiresAt DateTime
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  createdAt DateTime  @default(now())
}

enum TokenType {
  EMAIL_VERIFICATION
  PASSWORD_RESET
}
```

> NextAuth manages its own session tables via the Prisma adapter.
> Do not create a Session model manually.

---

## Environment Variables

Never hardcode secrets. All secrets are injected via environment variables.
The following must exist in `.env.local` locally and in Vercel for production.

```env
# Database
DATABASE_URL=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=

# Upstash (if used for rate limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

If a required variable is missing, throw a startup error — do not fail silently.

---

## Coding Rules

### General
- All files must be TypeScript. No `.js` files.
- Use strict types everywhere. No `any` unless absolutely unavoidable and commented.
- All server-side inputs must be validated with Zod before processing.
- Never trust client-side data. Validate on the server, always.

### Authentication
- Use NextAuth for all session management. Do not roll a custom session system.
- Password hashing must use bcryptjs with a salt round of 12.
- Never log, return, or expose passwords at any point in the codebase.
- All tokens must be generated with `crypto.randomBytes` — not `Math.random`.
- Verification and reset tokens must expire within 1 hour of generation.
- Once a reset token is used, mark it as consumed. Reject reuse.

### Error Handling
- All API routes must return errors in this shape: `{ error: string, field?: string }`
- Zod errors → 400 with field-level messages
- Auth errors → 401 with a generic message only (e.g. "Invalid credentials")
- Token errors → 400 with a user-facing message and a prompt to re-request
- Server errors → 500 with a generic client message; log full error server-side only
- Never expose stack traces, database errors, or internal logic to the client

### Security
- Do not disable CSRF protection. NextAuth enables it by default — keep it active.
- Sessions must use HttpOnly, Secure cookies. Do not change cookie configuration.
- Rate limiting must be active on the `/api/auth/login` endpoint.
- No sensitive data (tokens, passwords, user IDs) in URL query parameters.

### UI & Forms
- Every form must have accessible labels tied to their inputs via `htmlFor` / `id`.
- Every form must show a loading state during async submission.
- Validation messages must be specific and actionable — never "Something went wrong."
- The password input must render a strength indicator: Weak / Fair / Strong.
  - Weak: short length, no variety
  - Fair: moderate length or some variety
  - Strong: 8+ characters with uppercase, number, and symbol

---

## Route Protection Rules

Implement the following redirect logic in `middleware.ts`:

| User State                        | Destination              |
|-----------------------------------|--------------------------|
| Unauthenticated                   | Redirect to `/auth/login`|
| Authenticated, unverified email   | Redirect to `/auth/verify-email` notice |
| Authenticated and verified        | Allow access to `/dashboard` |

The middleware must cover all `/dashboard` routes. Do not rely on client-side
redirect logic as the sole protection layer.

---

## Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Generate Prisma client after schema changes
npx prisma generate

# Push schema to database
npx prisma db push

# Open Prisma Studio (visual DB browser)
npx prisma studio

# Build for production
npm run build

# Run production build locally
npm start
```

---

## What Not to Do

- Do not install new packages without checking if the existing stack already covers it
- Do not create new API routes for logic that belongs in a server action
- Do not store session data in localStorage or cookies you manage manually
- Do not return different error messages for "user not found" vs "wrong password" — both must return the same generic response
- Do not skip Zod validation on any route that accepts user input
- Do not commit `.env.local` to the repository

---

## Definition of Done

A feature is complete when:

- [ ] It works end-to-end in the browser
- [ ] All inputs are validated server-side with Zod
- [ ] Errors are handled and return the correct shape
- [ ] No sensitive data is exposed in responses or logs
- [ ] The UI shows loading and error states correctly
- [ ] TypeScript reports zero errors (`tsc --noEmit` passes)
- [ ] The relevant security rules above are satisfied