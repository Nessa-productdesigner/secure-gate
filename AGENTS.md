# AGENT.md — SecureGate

Operational guide for AI agents. Read fully before making changes.

**Also read:** `.agents/Rules/architecture.md`, `.agents/Rules/code-style.md`, `.agents/Rules/security.md`

---

## Project Overview

SecureGate is a Next.js 14 (App Router) authentication demo: sign up, email verification,
login, password reset, sessions, and protected routing. Not a full product.

---

## Tech Stack

| Layer | Technology |
|--------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL via Prisma 7 |
| Auth | NextAuth.js (JWT sessions) |
| Passwords | bcryptjs (12 rounds) |
| Email | Resend + inline HTML in `lib/email.ts` |
| Validation | Zod |
| Rate limiting | `lib/rate-limit.ts` (Upstash or in-memory) |
| Deployment | Vercel |

---

## Project Structure

```
/app
  /auth/login, signup, verify-email, forgot-password, reset-password
  /auth/verify-email/confirm/[token]   — consumes verify token from email
  /auth/reset-password/[token]         — reset form (token in path, not query)
  /dashboard/page.tsx
  /api/auth/signup, verify, forgot-password, reset-password, resend-verification
  /api/auth/[...nextauth]/route.ts
/components/ui, /components/forms, /components/providers.tsx
/lib/auth.ts, db.ts, email.ts, env.ts, validations.ts, rate-limit.ts, constants.ts
/middleware.ts
/prisma/schema.prisma, /prisma/migrations
/types/next-auth.d.ts
```

---

## Database Schema (summary)

- **User** — `emailVerified` is `DateTime?` (null = unverified)
- **Token** — single model with `TokenType` enum; 1-hour expiry; deleted on use
- **Account, Session, VerificationToken** — NextAuth Prisma adapter tables

Do not alter schema without instruction. Use `npm run db:migrate` for production.

---

## Environment Variables

Copy `.env.example` → `.env.local`. Required:

```env
DATABASE_URL=          # pooled Supabase URL for app (port 6543 + pgbouncer)
DIRECT_URL=            # direct URL for Prisma CLI migrations (port 5432)
NEXTAUTH_SECRET=       # 32+ chars in production
NEXTAUTH_URL=
RESEND_API_KEY=        # starts with re_
NEXT_PUBLIC_APP_URL=
RESEND_FROM_EMAIL=     # optional; default onboarding@resend.dev for testing
UPSTASH_REDIS_REST_URL= # optional; set both Upstash vars or neither
UPSTASH_REDIS_REST_TOKEN=
```

Validated at startup in `lib/env.ts`. Never commit `.env` or `.env.local`.

---

## Coding Rules

### General
- TypeScript only. Strict types. Server-side Zod on all API inputs.
- Import `db` from `@/lib/db` — not `@prisma/client` in pages/components.

### Authentication
- NextAuth JWT sessions (`session.strategy: "jwt"` in `lib/auth.ts`).
- Passwords: `bcrypt` with `BCRYPT_ROUNDS` from `lib/constants.ts` (12).
- Tokens: `crypto.randomBytes(32).toString("hex")`, 1-hour expiry, delete on use.
- Email links: `/auth/verify-email/confirm/[token]`, `/auth/reset-password/[token]`.
- Legacy `?token=` query links redirect to confirm path.

### Error handling
- Shape: `{ error: string, field?: string }`
- Auth failures: generic (e.g. "Invalid credentials")
- Token errors: 400 with safe message + re-request prompt
- 500: generic client message; log details server-side only

### Security
- Rate limits: login (`lib/auth.ts`), signup, forgot-password, reset-password, verify, resend-verification (`lib/api-rate-limit.ts`).
- Middleware: route protection only (not rate limiting). Must match `/dashboard` and `/dashboard/*`.
- No secrets in logs. CSRF enabled on NextAuth.

### UI
- Labels, loading states, password strength on signup/reset.
- `SessionProvider` in `components/providers.tsx`.

---

## Route Protection (`middleware.ts`)

| State | Destination |
|--------|-------------|
| Unauthenticated | `/auth/login` |
| Unverified | `/auth/verify-email` |
| Verified | `/dashboard` |

Dashboard page also checks `session.user.emailVerified` server-side.

---

## Commands

```bash
npm install
npm run dev
npm run build              # prisma generate && next build
npm run db:migrate         # production: prisma migrate deploy
npm run db:migrate:dev     # local migration development
npm run db:push            # local quick sync only
npx prisma studio
```

Vercel build (optional): `prisma migrate deploy && npm run build`

---

## What Not to Do

- Do not add `/components/email` — emails live in `lib/email.ts`
- Do not put tokens in query strings for new features (use path + POST body)
- Do not skip Zod on API routes
- Do not return different messages for "user not found" vs "wrong password"
- Do not commit secrets

---

## Definition of Done

- [ ] Works end-to-end in browser
- [ ] Server-side Zod validation
- [ ] Correct error shapes; no sensitive leakage
- [ ] Loading/error UI states
- [ ] `npm run build` passes
- [ ] Security rules satisfied
