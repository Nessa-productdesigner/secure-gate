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
API routes. The database is PostgreSQL, accessed exclusively through Prisma ORM.
Email delivery is handled by Resend.

```
Browser
  │
  ▼
Next.js 14 (App Router)
  ├── Pages (RSC + Client Components)
  ├── API Routes (/app/api/*)
  ├── Middleware (route protection only)
  │
  ▼
Business Logic Layer (/lib/*)
  ├── NextAuth.js (session management, login rate limiting)
  ├── bcryptjs (password hashing)
  ├── Zod (input validation)
  ├── Resend (email delivery)
  └── Rate Limiter (Upstash or in-memory fallback)
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
  /auth/signup/route.ts           — Creates user, issues verification token, sends email
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

Middleware runs on matched routes before they reach a page. It handles **route
protection only** (not rate limiting).

**Route Protection**
Checks the NextAuth JWT session on protected routes.

```
Request to /dashboard/*
  │
  ├── No session → redirect to /auth/login
  ├── Session exists, emailVerified: false → redirect to /auth/verify-email
  └── Session exists, emailVerified: true → allow through

Request to /auth/login or /auth/signup
  │
  └── Session exists, emailVerified: true → redirect to /dashboard
```

**Rate Limiting (login only)**
Applied in `lib/auth.ts` inside the CredentialsProvider `authorize` callback,
not in middleware. When over limit, `authorize` returns `null` and NextAuth
surfaces a generic sign-in failure.

```
POST /api/auth/[...nextauth] (credentials login)
  │
  ├── Under limit → continue credential check
  └── Over limit → authorize returns null (generic failure)
```

**Rule:** Middleware is the first line of defence for `/dashboard` access.
Do not rely solely on client-side redirects.

---

### 4. Business Logic Layer — `/lib`

All shared logic, clients, and utilities live here.

| File | Responsibility |
|---|---|
| `auth.ts` | NextAuth configuration: CredentialsProvider, JWT callbacks, login rate limiting |
| `db.ts` | Prisma client singleton — prevents connection pool exhaustion in dev |
| `email.ts` | Resend client, inline HTML email helpers for verification and reset |
| `env.ts` | Validated environment variables (throws at startup if missing) |
| `rate-limit.ts` | Rate limiter (Upstash Redis when configured, in-memory fallback) |
| `validations.ts` | All Zod schemas for every form and API input |

**Rule:** Pages must not import `@prisma/client` directly. API routes and
`lib/auth.ts` access the database via the `db` singleton from `lib/db.ts`.

---

### 5. Component Layer — `/components`

```
/components
  /ui        — Primitive components: Button, Input, Alert, Badge, PasswordStrength
  /forms     — Feature-specific form components per auth screen
```

**Rule:** UI components in `/ui` are stateless and reusable.
Form components in `/forms` own their local state and validation display.
Email bodies are built as inline HTML in `lib/email.ts` and sent via Resend
(not separate React Email template files).

---

### 6. Data Layer — Prisma + PostgreSQL

Prisma is the sole interface to the database. Raw SQL queries are not used.

**Models:**

```
User
  ├── id (cuid)
  ├── email (unique)
  ├── password (hashed)
  ├── emailVerified (DateTime? — null = unverified, set on verification)
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

Account, Session, VerificationToken — NextAuth Prisma adapter tables
```

**Token lifecycle:**
1. Token is generated with `crypto.randomBytes(32).toString('hex')`
2. Token is stored in the database with an expiry 1 hour from creation
3. On use: expiry is checked, token is validated, action is performed
4. Used or expired tokens are deleted immediately (single-use)

---

## Authentication Flow Diagrams

### Sign Up Flow

```
User submits sign up form → POST /api/auth/signup
  │
  ▼
Zod validates input (email, password strength)
  │
  ├── Invalid → return 400 with field errors
  │
  ▼
Check if email already exists in DB
  │
  ├── Exists → return 400, generic message (same shape as other client errors)
  │
  ▼
Hash password with bcryptjs (salt rounds: 12)
  │
  ▼
Create User record (emailVerified: null)
  │
  ▼
Generate EMAIL_VERIFICATION token → store in DB (1 hour expiry)
  │
  ▼
Send verification email via Resend
  │
  ▼
Return 201 success → client shows verification notice
```

---

### Login Flow

```
User submits login form → NextAuth credentials sign-in
  │
  ▼
Rate limiter checks IP in authorize() (lib/auth.ts)
  │
  ├── Over limit → authorize returns null → generic sign-in failure
  │
  ▼
Zod validates input
  │
  ├── Invalid → authorize returns null → generic sign-in failure
  │
  ▼
Look up user by email
  │
  ├── Not found → authorize returns null → generic sign-in failure
  │
  ▼
bcryptjs.compare(inputPassword, storedHash)
  │
  ├── No match → authorize returns null → generic sign-in failure
  │
  ▼
Check user.emailVerified is set (DateTime)
  │
  ├── null → authorize returns null → generic sign-in failure (no distinct message)
  │
  ▼
NextAuth issues JWT → sets HttpOnly session cookie
  │
  ▼
Redirect to /dashboard
```

---

### Email Verification Flow

```
User clicks link in verification email
  ├── Link: /auth/verify-email?token=<token> (email deep link only)
  │
  ▼
verify-email-client reads token, router.replace() strips query from URL
  │
  ▼
POST /api/auth/verify with { token } in JSON body (not in URL)
  │
  ▼
Look up token in DB where type = EMAIL_VERIFICATION
  │
  ├── Not found → 400, prompt to re-request
  │
  ▼
Check token.expiresAt > now
  │
  ├── Expired → delete token, 400, prompt to re-request
  │
  ▼
Set user.emailVerified = new Date()
  │
  ▼
Delete token from DB
  │
  ▼
Client shows success on /auth/verify-email (user signs in separately)
```

---

### Forgot Password Flow

```
User submits email on forgot password page → POST /api/auth/forgot-password
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

User opens reset link: /auth/reset-password?token=<token>
  │
  ▼
Form reads token from query once, submits via POST /api/auth/reset-password
  with { token, password } in JSON body
  │
  ├── Missing token in URL → show invalid link error (no API call)
  │
  ▼
Validate token (exists, not expired, type = PASSWORD_RESET)
  │
  ├── Invalid or expired → 400, prompt to re-request
  │
  ▼
Hash new password with bcryptjs
  │
  ▼
Update user.password in DB
  │
  ▼
Delete token from DB (consumes token — no reuse)
  │
  ▼
Client redirects to /auth/login
```

---

## Session Architecture

NextAuth uses **JWT session strategy** (`session.strategy: "jwt"` in `lib/auth.ts`).
The Prisma adapter is configured for schema compatibility; session rows are not
used for the credentials-only flow.

- Session payload is encoded in a signed JWT
- JWT is stored in an HttpOnly, Secure, SameSite cookie via NextAuth
- `jwt` and `session` callbacks copy `id` and `emailVerified` (boolean) into the session
- Middleware and UI read `emailVerified` as a boolean on the session token
- Database `User.emailVerified` is `DateTime?`; null means unverified
- On logout: `signOut()` clears the session cookie; JWT cannot be server-revoked before expiry without extra infrastructure
- Server: `getServerSession(authOptions)`; client: `useSession()`

---

## Security Architecture

| Concern | Implementation |
|---|---|
| Password storage | bcryptjs, salt rounds: 12 |
| Token generation | `crypto.randomBytes(32).toString('hex')` |
| Token expiry | 1 hour for all token types |
| Token reuse | Deleted from DB on successful verify or reset |
| Session cookies | HttpOnly, Secure, SameSite via NextAuth |
| CSRF protection | Enabled by default on NextAuth routes — do not disable |
| Custom API routes | JSON POST bodies; tokens sent in body after page load where possible |
| Tokens in URLs | Email links use `?token=` for one-time navigation; verify flow strips query immediately; prefer POST body for API calls |
| Brute force | Rate limiting on login only (`authorize` in `lib/auth.ts`), 5 attempts / 10 min per IP |
| Rate limit backend | Upstash Redis when env vars set; in-memory fallback per instance in dev |
| Upstash outage | If Redis client throws, logs server-side and allows the request (`success: true`); without Upstash env vars, uses in-memory limiter per instance |
| Error leakage | Generic messages on all auth errors — no internal details exposed |
| Email enumeration | Forgot password returns same response whether email exists or not |
| Env secrets | Validated at startup via `lib/env.ts` — missing vars throw, no silent failure |

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
Upstash (Redis — rate limiting, optional)
```

**Environment separation:**
- `main` branch → Production deployment
- Feature branches → Preview deployments (use separate DB or mocked email)

---

## Key Architectural Decisions

**Why Next.js App Router instead of Pages Router?**
App Router enables React Server Components, which reduce client bundle size
and allow direct database access in server components without an extra API call.

**Why JWT sessions instead of database sessions?**
CredentialsProvider with JWT keeps session handling simple for this demo app.
The tradeoff is that sessions cannot be centrally revoked before JWT expiry without
a denylist or shorter maxAge. Database session tables remain in the schema via
the Prisma adapter for consistency with NextAuth conventions.

**Why a single Token model for both verification and reset?**
Consolidating token types into one model with a `TokenType` enum keeps the
schema simple, reduces join complexity, and makes token lifecycle management
(expiry checks, deletion) consistent across both flows.

**Why inline HTML in `lib/email.ts` instead of separate template files?**
Keeps the email surface small for a demo IAM app: one place to edit copy and
links without a separate React Email build step.

**Why Zod on the server only?**
Client-side validation improves UX but is never a security boundary.
Zod runs on the server as the authoritative validation layer. Client-side
feedback is handled separately in form components.
