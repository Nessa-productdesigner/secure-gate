---
trigger: always_on
---

# SecureGate Engineering & Code Style Standards

This document defines engineering standards, code organization, naming conventions,
and implementation style for SecureGate.

**Canonical security policy** (error shapes, token rules, route protection, env vars)
lives in `AGENTS.md` at the repo root. **System structure and flows** live in
`.agents/Rules/architecture.md`. This file must stay aligned with both.

SecureGate is a production-grade authentication system. The codebase should communicate
engineering maturity, security awareness, maintainability, and operational discipline.

---

# Engineering Philosophy

## 1. Clarity Over Cleverness

Code should prioritize readability, predictability, maintainability, and explicitness.

Avoid: unnecessary abstraction, over-engineering, magic behavior, hidden side effects,
overly clever code.

## 2. Security First

Authentication systems are security-critical. Prioritize safe defaults, non-leaking
behavior, defensive validation, and explicit boundaries.

## 3. Consistency Matters

SecureGate should feel unified across API routes, `lib/`, middleware, validation,
UI, and error handling.

---

# Repository Workflow (bootstrap only)

Use when creating a **new** clone from scratch—not for every feature:

1. Complete initial scaffold
2. Initialize Prisma and confirm PostgreSQL connectivity
3. Run initial migration / `db push`
4. Push a clean scaffold commit to GitHub

```bash
git commit -m "chore: initial securegate scaffold"
```

---

# Project Structure Standards

Current layout (tokens in email link **paths**; API routes accept JSON bodies):

```txt
/app
  /auth
    /login/page.tsx
    /signup/page.tsx
    /forgot-password/page.tsx
    /reset-password/page.tsx           — legacy ?token= redirect only
    /reset-password/[token]/page.tsx   — reset form
    /verify-email/page.tsx
    /verify-email/confirm/[token]/     — consumes verify token
  /dashboard/page.tsx
  /api/auth
    signup/route.ts
    verify/route.ts
    forgot-password/route.ts
    reset-password/route.ts
    resend-verification/route.ts
    [...nextauth]/route.ts

/components
  /ui                             — Button, Input, Alert, Spinner, PasswordStrength
  /forms                          — LoginForm, SignupForm, etc.

/lib
  auth.ts
  db.ts
  email.ts                        — Resend + inline HTML email bodies
  env.ts                          — Zod-validated env (throws at startup)
  rate-limit.ts
  validations.ts

/middleware.ts
/prisma/schema.prisma
```

---

# Naming Conventions

| Type | Convention |
|---|---|
| Components | PascalCase |
| Files | kebab-case |
| Functions | camelCase |
| Variables | camelCase |
| Constants | UPPER_SNAKE_CASE |
| Prisma Models | PascalCase |

## Route Naming

Routes should be explicit, predictable, and resource-oriented.

Correct:

```txt
/api/auth/signup
/api/auth/verify
/api/auth/forgot-password
/api/auth/reset-password
/api/auth/[...nextauth]
```

Avoid:

```txt
/api/create-user
/api/reset
/api/helper
/api/auth/verify-email
```

---

# File Responsibility Rules

Each file should have a single clear responsibility and limited scope.

Avoid: giant utility files, mixed responsibilities, unrelated logic in shared modules.

Database access: import `db` from `@/lib/db.ts` in API routes and `lib/auth.ts`.
Do not import `@prisma/client` from pages or components.

---

# Component Standards

## UI Components — `/components/ui`

Stateless, reusable primitives: Button, Input, Alert, Spinner, PasswordStrength.

`Input` must wire `label` + `htmlFor` + `id` (and `aria-invalid` / `aria-describedby`
when showing field errors).

## Form Components — `/components/forms`

Auth-specific forms own local state, submission, loading, and client-side UX validation.
Server-side validation is always authoritative (Zod in API routes / NextAuth).

Required UX (see also `AGENTS.md`):

- Accessible labels on every field
- Loading state and disabled submit during async requests
- Password strength indicator (Weak / Fair / Strong) on password fields

## Email

Email HTML and send helpers live in `lib/email.ts` (not `/components/email`).

---

# API Route Standards

API routes are security boundaries. Every route must:

1. Validate input with Zod
2. Execute business logic (hashing, tokens, DB) only after validation
3. Handle failures safely (`try/catch`, no stack traces to client)
4. Return predictable JSON responses

There is no separate “sanitize” step—normalization belongs in Zod schemas
(e.g. `.trim().toLowerCase()` on email) where needed.

## Validation-first

Always validate before: database access, token generation, hashing, auth checks.
Never trust client-side validation alone.

## Response Standards

Success:

```ts
{ success: true, message: "Account created successfully" }
```

Error:

```ts
{ error: "Invalid credentials", field?: "email" }
```

- **400** — Zod / token / field errors: specific, actionable `error`; optional `field`
- **401** — NextAuth credential failures: generic only (via `authorize` returning `null`)
- **500** — Unexpected server errors: generic client message only, e.g. `"Something went wrong"`; log details server-side only

Field-level Zod messages on 400 are allowed. Auth paths must not distinguish
“user not found” vs “wrong password” vs “unverified email.”

## Error Message Rules

Never reveal in client-facing auth responses:

- whether an email exists (except forgot-password, which always returns success)
- whether a password was wrong
- Prisma errors, stack traces, or implementation details

Correct (login): `Invalid credentials` (or NextAuth generic failure).

Incorrect: `User not found`, `Wrong password`, `Please verify your email`.

Token endpoints may return specific token errors (expired / invalid) with a prompt
to re-request—see `AGENTS.md`.

---

# Authentication Architecture

## Session Strategy

JWT sessions via NextAuth (`session.strategy: "jwt"` in `lib/auth.ts`).

Prisma adapter tables exist for NextAuth compatibility; credentials login does not
use database-backed sessions.

## Middleware Enforcement

`middleware.ts` is responsible for **route protection only**:

- `/dashboard/*` — require session; redirect unverified users to `/auth/verify-email`
- `/auth/login`, `/auth/signup` — redirect verified users to `/dashboard`

**Rate limiting** runs in `lib/auth.ts` inside CredentialsProvider `authorize()`
(5 attempts / 10 minutes per IP), not in middleware.

Protected routes must never rely solely on client-side checks.

| State | Action |
|---|---|
| Unauthenticated | Redirect to login |
| Unverified | Redirect to verification notice |
| Verified | Allow access |

## Tokens in URLs

Email links use path segments:

- `/auth/verify-email/confirm/[token]` → `POST /api/auth/verify` with `{ token }`
- `/auth/reset-password/[token]` → form submits `POST /api/auth/reset-password`

Legacy `?token=` links redirect to the path-based confirm route. Do not add new query-token flows.

---

# Password Security Standards

Passwords must remain server-side only, never appear in logs or responses, and
always be hashed:

```ts
await bcrypt.hash(password, 12)
```

---

# Token Standards

| Type | Expiry | Reuse |
|---|---|---|
| EMAIL_VERIFICATION | 1 hour | Delete from DB on successful verify |
| PASSWORD_RESET | 1 hour | Delete from DB on successful reset (single-use) |

Generation:

```ts
crypto.randomBytes(32).toString("hex")
```

Never use: `Math.random`, timestamps, predictable IDs, or sequential values.

Store expiry as `expiresAt` in the `Token` model. Email copy must match the real TTL.

---

# Prisma Standards

- Server-side only, via `db` singleton in `lib/db.ts`
- Validate input before queries
- Prefer `select` / `omit` to avoid loading `password` when the hash is not needed
- Only include `password` in queries when comparing or updating hashes

---

# TypeScript Standards

- `strict: true` — no `any` unless unavoidable and commented
- Explicit types for API payloads, Zod schemas, and component props
- Typed route handler responses where practical

---

# Async Standards

Use `try/catch` in API routes; never leak unhandled rejections. In `catch` blocks
for 500 responses, log server-side only and return a generic JSON error.

---

# Logging Rules

**Forbidden in logs:** passwords, tokens, secrets, session cookies, full reset/verify URLs.

**Allowed:** operational errors, rate-limit backend failures (no token values).

---

# Environment Variable Standards

- Local secrets in `.env.local` only — never commit
- Required vars validated at startup in `lib/env.ts` (throws if missing/invalid)
- Never expose server secrets via `NEXT_PUBLIC_*`

See `AGENTS.md` for the full env list.

---

# Frontend Standards

- Default to React Server Components; use `"use client"` only for forms, hooks, and browser APIs
- Tailwind utility-first styling; prefer shared UI components over one-off patterns
- Minimal inline styles (exception: dynamic widths e.g. password strength bar)

---

# Accessibility Standards

- Keyboard accessible controls
- Visible focus states (see `Input` focus ring)
- Semantic HTML (`form`, `label`, `button`)
- Labels associated with inputs via `htmlFor` / `id`

---

# React Standards

Components stay focused, composable, and predictable. Do not duplicate auth logic
across forms—keep credential checks in NextAuth / API routes.

---

# Git Standards

Commits: small, descriptive, conventional prefixes.

```bash
feat: implement forgot password flow
fix: protect dashboard middleware
refactor: centralize zod validation
```

Avoid: `update stuff`, `fix bugs`, `changes`.

---

# Security Testing Discipline

Before deployment, manually verify:

- invalid login attempts and rate limiting (via NextAuth sign-in)
- expired verification and reset tokens
- reused reset tokens (must fail after consumption)
- unauthorized `/dashboard` access
- malformed / missing JSON bodies
- forgot-password enumeration safety

---

# Engineering Quality Checklist

- [ ] Zod validation on all API inputs
- [ ] Auth errors are generic; token errors are user-safe with re-request guidance
- [ ] Passwords hashed with bcrypt (12 rounds)
- [ ] Tokens: `crypto.randomBytes`, 1h expiry, deleted on use
- [ ] `/dashboard` protected in middleware
- [ ] Login rate limit in `lib/auth.ts` `authorize()`
- [ ] `db` from `lib/db.ts` — no Prisma in pages/components
- [ ] Env validated via `lib/env.ts`
- [ ] No sensitive data in logs
- [ ] Forms: labels, loading, password strength where applicable
- [ ] Aligned with `AGENTS.md` and `architecture.md`

---

# Final Engineering Principle

When implementing SecureGate:

- clarity over cleverness
- security over convenience
- maintainability over speed
- consistency over shortcuts

The system should feel secure, predictable, and production-ready.
