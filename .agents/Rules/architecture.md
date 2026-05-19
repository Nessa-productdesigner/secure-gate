---
trigger: always_on
---

# ARCHITECTURE.md — SecureGate

This document describes the technical architecture of SecureGate.
It exists to give any developer or AI agent a clear mental model of how the
system is structured, how data flows through it, and why key decisions were made.

---

## System Overview

SecureGate is a server-rendered Next.js 14 application using the App Router.
It handles the full authentication lifecycle: registration, email verification,
login, session management, password reset, and protected routing.

There is no separate backend service. All API logic lives inside Next.js
API routes and server actions. The database is PostgreSQL, accessed exclusively
through Prisma ORM. Email delivery is handled by Resend.

```
Browser
  │
  ▼
Next.js 14 (App Router)
  ├── Pages (RSC + Client Components)
  ├── API Routes (/app/api/*)
  ├── Middleware (route protection + rate limiting)
  │
  ▼
Business Logic Layer (/lib/*)
  ├── NextAuth.js (session management)
  ├── bcryptjs (password hashing)
  ├── Zod (input validation)
  ├── Resend (email delivery)
  └── Rate Limiter (Upstash or custom)
  │
  ▼
Prisma ORM
  │
  ▼
PostgreSQL (hosted on Vercel Postgres or Railway)
```

---

## Layer Breakdown

### 1. Presentation Layer — `/app`

All pages live inside the `/app` directory following Next.js App Router conventions.

Pages are React Server Components (RSC) by default. Client interactivity
(forms, loading states, password strength indicator) is handled by dedicated
Client Components inside `/components`.

```
/app
  /auth
    /login/page.tsx           — Login page
    /signup/page.tsx          — Sign up page
    /verify-email/page.tsx    — Verification notice + token handling
    /forgot-password/page.tsx — Request password reset
    /reset-password/page.tsx  — Submit new password via token
  /dashboard/page.tsx         — Protected, verified-users-only page
```

**Rule:** Pages are thin. They import form components and handle layout only.
Business logic never lives in a page file.

---

### 2. API Layer — `/app/api`

All server-side operations are exposed as Next.js Route Handlers.

```
/app/api
  /auth/[...nextauth]/route.ts    — NextAuth catch-all handler
  /auth/verify/route.ts           — Handles email verification token
  /auth/forgot-password/route.ts  — Sends reset email
  /auth/reset-password/route.ts   — Validates token, updates password
```

**Rule:** Every route handler must:
1. Validate input with Zod before any database operation
2. Return errors in the shape `{ error: string, field?: string }`
3. Never expose internal error details to the client

---

### 3. Middleware Layer — `/middleware.ts`

Middleware runs on every request before it reaches a page or API route.
It handles two concerns:

**Route Protection**
Checks the NextAuth session on every request to protected routes.

```
Request to /dashboard/*
  │
  ├── No session → redirect to /auth/login
  ├── Session exists, emailVerified: false → redirect to /auth/verify-email
  └── Session exists, emailVerified: true → allow through
```

**Rate Limiting**
Applied specifically to the login endpoint to prevent brute-force attacks.

```
POST /api/auth/[...nextauth] (credentials login)
  │
  ├── Under limit → allow request
  └── Over limit → return 429, generic message
```

**Rule:** Middleware is the first and primary line of defence for route protection.
Do not rely solely on client-side redirects.

---

### 4. Business Logic Layer — `/lib`

All shared logic, clients, and utilities live here.

| File | Responsibility |
|---|---|
| `auth.ts` | NextAuth configuration: providers, callbacks, Prisma adapter |
| `db.ts` | Prisma client singleton — prevents connection pool exhaustion in dev |
| `email.ts` | Resend client initialisation and send helper functions |
| `rate-limit.ts` | Rate limiter setup (Upstash or in-memory fallback) |
| `validations.ts` | All Zod schemas for every form and API input |

**Rule:** No page or API route imports Prisma directly.
All database access goes through functions defined in `/lib`.

---

### 5. Component Layer — `/components`

```
/components
  /ui        — Primitive components: Button, Input, Alert, Badge
  /forms     — Feature-specific form components per auth screen
  /email     — React Email templates for verification and reset emails
```

**Rule:** UI components in `/ui` are stateless and reusable.
Form components in `/forms` own their local state and validation display.
Email templates in `/email` are React components rendered server-side by Resend.

---

### 6. Data Layer — Prisma + PostgreSQL

Prisma is the sole interface to the database. Raw SQL queries are not used.

**Models:**

```
User
  ├── id (cuid)
  ├── email (unique)
  ├── password (hashed)
  ├── emailVerified (boolean)
  ├── createdAt
  ├── updatedAt
  └── tokens → Token[]

Token
  ├── id (cuid)
  ├── token (unique, cryptographically random)
  ├── type (EMAIL_VERIFICATION | PASSWORD_RESET)
  ├── expiresAt
  ├── userId → User
  └── createdAt

(NextAuth session tables managed by Prisma adapter)
```

**Token lifecycle:**
1. Token is generated with `crypto.randomBytes(32).toString('hex')`
2. Token is stored in the database with an expiry 1 hour from creation
3. On use: expiry is checked, token is validated, action is performed
4. Used or expired tokens are deleted or invalidated immediately

---

## Authentication Flow Diagrams

### Sign Up Flow

```
User submits sign up form
  │
  ▼
Zod validates input (email, password strength)
  │
  ├── Invalid → return 400 with field errors
  │
  ▼
Check if email already exists in DB
  │
  ├── Exists → return 400, generic message
  │
  ▼
Hash password with bcryptjs (salt rounds: 12)
  │
  ▼
Create User record (emailVerified: false)
  │
  ▼
Generate EMAIL_VERIFICATION token → store in DB
  │
  ▼
Send verification email via Resend
  │
  ▼
Return success → redirect user to verification notice
```

---

### Login Flow

```
User submits login form
  │
  ▼
Rate limiter checks request (by IP)
  │
  ├── Over limit → return 429, generic message
  │
  ▼
NextAuth CredentialsProvider receives email + password
  │
  ▼
Zod validates input
  │
  ├── Invalid → return 401, generic message
  │
  ▼
Look up user by email
  │
  ├── Not found → return 401, "Invalid credentials"
  │
  ▼
bcryptjs.compare(inputPassword, storedHash)
  │
  ├── No match → return 401, "Invalid credentials"
  │
  ▼
Check emailVerified === true
  │
  ├── false → return 401, "Please verify your email"
  │
  ▼
NextAuth creates session → sets HttpOnly cookie
  │
  ▼
Redirect to /dashboard
```

---

### Email Verification Flow

```
User clicks link in verification email
  ├── Link contains: /auth/verify-email?token=<token>
  │
  ▼
API route receives token
  │
  ▼
Look up token in DB where type = EMAIL_VERIFICATION
  │
  ├── Not found → return error, prompt to re-request
  │
  ▼
Check token.expiresAt > now
  │
  ├── Expired → delete token, return error, prompt to re-request
  │
  ▼
Set user.emailVerified = true
  │
  ▼
Delete token from DB
  │
  ▼
Redirect to /auth/login with success message
```

---

### Forgot Password Flow

```
User submits email on forgot password page
  │
  ▼
Look up user by email
  │
  ├── Not found → return same success message (do not reveal existence)
  │
  ▼
Delete any existing PASSWORD_RESET tokens for this user
  │
  ▼
Generate new PASSWORD_RESET token → store in DB (expires: 1 hour)
  │
  ▼
Send reset email via Resend
  │
  ▼
Return success message regardless of outcome

User clicks reset link
  ├── Link contains: /auth/reset-password?token=<token>
  │
  ▼
Validate token (exists, not expired, type = PASSWORD_RESET)
  │
  ├── Invalid or expired → return error, prompt to re-request
  │
  ▼
User submits new password
  │
  ▼
Zod validates new password (strength requirements)
  │
  ▼
Hash new password with bcryptjs
  │
  ▼
Update user.password in DB
  │
  ▼
Delete token from DB
  │
  ▼
Redirect to /auth/login with success message
```

---

## Session Architecture

NextAuth manages sessions using the Prisma adapter with a database strategy.

- Sessions are stored in the database, not in JWTs by default
- Session token is stored in an HttpOnly, Secure cookie on the client
- The session record links to the User record in the database
- On logout: `signOut()` destroys the session record in the database and clears the cookie
- Session data available in server components via `getServerSession(authOptions)`
- Session data available in client components via `useSession()` hook

---

## Security Architecture

| Concern | Implementation |
|---|---|
| Password storage | bcryptjs, salt rounds: 12 |
| Token generation | `crypto.randomBytes(32).toString('hex')` |
| Token expiry | 1 hour for all token types |
| Session cookies | HttpOnly, Secure, SameSite via NextAuth |
| CSRF protection | Enabled by default in NextAuth — not disabled |
| Brute force | Rate limiting on login endpoint via Upstash or middleware |
| Error leakage | Generic messages on all auth errors — no internal details exposed |
| Email enumeration | Forgot password returns same response whether email exists or not |

---

## Deployment Architecture

```
GitHub (source of truth)
  │
  ▼
Vercel (CI/CD + hosting)
  ├── Automatic deployments on push to main
  ├── Environment variables managed in Vercel dashboard
  └── Edge middleware supported natively
  │
  ▼
PostgreSQL (Vercel Postgres or Railway)
  │
  ▼
Resend (transactional email)
Upstash (Redis — rate limiting)
```

**Environment separation:**
- `main` branch → Production deployment
- Feature branches → Preview deployments (use separate DB or mocked email)

---

## Key Architectural Decisions

**Why Next.js App Router instead of Pages Router?**
App Router enables React Server Components, which reduce client bundle size
and allow direct database access in server components without an extra API call.

**Why database sessions instead of JWT?**
Database sessions allow immediate session invalidation on logout or account
compromise. JWTs cannot be revoked before expiry without additional infrastructure.

**Why a single Token model for both verification and reset?**
Consolidating token types into one model with a `TokenType` enum keeps the
schema simple, reduces join complexity, and makes token lifecycle management
(expiry checks, deletion) consistent across both flows.

**Why Resend + React Email instead of Nodemailer?**
Resend has a reliable delivery infrastructure and React Email allows email
templates to be written and previewed as React components — consistent with
the rest of the codebase and easier to maintain.

**Why Zod on the server only?**
Client-side validation improves UX but is never a security boundary.
Zod runs on the server as the authoritative validation layer. Client-side
feedback is handled separately in form components.