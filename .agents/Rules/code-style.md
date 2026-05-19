---
trigger: always_on
---

# code-style.md

# SecureGate Engineering & Code Style Standards

This document defines the engineering standards, architectural discipline,
code organization rules, naming conventions, backend structure,
and implementation philosophy for SecureGate.

SecureGate is a production-grade authentication system.

The codebase should communicate:
- engineering maturity,
- security awareness,
- maintainability,
- and operational discipline.

This is NOT a tutorial project.

Every implementation decision should feel intentional.

---

# Engineering Philosophy

## 1. Clarity Over Cleverness

Code should prioritize:
- readability,
- predictability,
- maintainability,
- and explicitness.

Avoid:
- unnecessary abstraction
- over-engineering
- magic behavior
- hidden side effects
- overly clever code

Future maintainers should understand the system quickly.

---

## 2. Security First

Authentication systems are security-critical infrastructure.

All code must prioritize:
- safe defaults,
- non-leaking behavior,
- defensive validation,
- and explicit boundaries.

Never optimize away security clarity.

---

## 3. Consistency Matters

Consistent systems are:
- easier to debug,
- easier to scale,
- easier to audit,
- and safer to maintain.

SecureGate should feel unified across:
- API routes,
- database access,
- middleware,
- validation,
- UI logic,
- and error handling.

---

# Repository Workflow

Before implementing authentication features:

1. Complete initial scaffold
2. Initialize Prisma
3. Confirm PostgreSQL connectivity
4. Run initial migration
5. Push clean scaffold commit to GitHub

This establishes:
- incremental engineering discipline
- rollback safety
- clean project history
- reproducible setup state

Recommended first commit:

```bash
git commit -m "chore: initial securegate scaffold"
```

---

# Project Structure Standards

Recommended structure:

```txt
/app
  /auth
    /login
    /signup
    /forgot-password
    /reset-password
    /verify-email

  /verify-email/[token]
  /reset-password/[token]

  /api
    /auth
      /signup
      /forgot-password
      /reset-password
      /verify-email
      /[...nextauth]

/components
  /ui
  /forms
  /email

/lib
  auth.ts
  db.ts
  email.ts
  rate-limit.ts
  validations.ts

/prisma
  schema.prisma
```

---

# Naming Conventions

## General Naming Rules

| Type | Convention |
|---|---|
| Components | PascalCase |
| Files | kebab-case |
| Functions | camelCase |
| Variables | camelCase |
| Constants | UPPER_SNAKE_CASE |
| Prisma Models | PascalCase |

---

## Route Naming

Routes should remain:
- explicit,
- predictable,
- and resource-oriented.

Correct:

```txt
/api/auth/signup
/api/auth/forgot-password
/api/auth/reset-password
/api/auth/verify-email
```

Avoid:

```txt
/api/create-user
/api/reset
/api/helper
```

---

# File Responsibility Rules

Each file should have:
- a single clear responsibility,
- predictable behavior,
- and limited scope.

Avoid:
- giant utility files
- mixed responsibilities
- unrelated logic in shared modules

---

# Component Standards

## UI Components

Reusable UI components belong in:

```txt
/components/ui
```

Examples:
- Button
- Input
- Alert
- Spinner

---

## Form Components

Auth-specific forms belong in:

```txt
/components/forms
```

Examples:
- LoginForm
- SignupForm
- ForgotPasswordForm

---

## Email Templates

React Email templates belong in:

```txt
/components/email
```

Examples:
- VerifyEmailTemplate
- ResetPasswordTemplate

---

# API Route Standards

API routes are backend security boundaries.

Every route must:
1. validate input,
2. sanitize data,
3. execute business logic,
4. handle failures safely,
5. return predictable responses.

---

## Validation-first Architecture

Always validate before:
- database access
- token generation
- hashing
- authentication checks

Never trust client-side validation alone.

Use:
```txt
Zod
```

for ALL external input.

---

## Response Standards

Success response example:

```ts
{
  success: true,
  message: "Account created successfully"
}
```

Error response example:

```ts
{
  error: "Invalid credentials"
}
```

---

## Error Message Rules

Error messages must NEVER reveal:
- whether an email exists
- whether a password is incorrect
- internal Prisma errors
- stack traces
- implementation details

Correct:

```txt
Invalid credentials
```

Incorrect:

```txt
User not found
Wrong password
```

---

# Authentication Architecture

## Session Strategy

SecureGate uses:
```txt
JWT sessions via NextAuth
```

Reasons:
- stateless authentication
- simpler deployment
- fewer database reads
- better serverless compatibility
- lower operational complexity

---

## Middleware Enforcement

Middleware is responsible for:
- route protection
- auth redirects
- verification enforcement
- protected route access
- rate limit integration

Protected routes must NEVER rely solely on client-side checks.

---

## Protected Route Rules

Protected routes require:
- authenticated session
- verified email

Route behavior:

| State | Action |
|---|---|
| Unauthenticated | Redirect to login |
| Unverified | Redirect to verification notice |
| Verified | Allow access |

---

# Password Security Standards

Passwords must:
- remain server-side only
- never appear in logs
- never be returned in responses
- always be hashed

Required hashing:

```ts
bcrypt.hash(password, 12)
```

---

# Token Standards

## Verification Tokens

Purpose:
- email verification

Rules:
- cryptographically random
- expire after 15 minutes
- single-purpose

---

## Password Reset Tokens

Purpose:
- password recovery

Rules:
- cryptographically random
- expire after 1 hour
- single-use only

---

## Token Generation

Use:

```ts
crypto.randomBytes(32).toString("hex")
```

Never use:
- timestamps
- predictable IDs
- sequential values

---

# Prisma Standards

## Database Access

Prisma access should remain:
- server-side only
- centralized
- predictable

Use singleton Prisma pattern.

---

## Query Safety

Always:
- validate input first
- select only needed fields
- avoid overfetching

Good:

```ts
select: {
  id: true,
  email: true
}
```

Avoid:

```ts
select: {
  password: true
}
```

unless necessary.

---

# TypeScript Standards

## Strict Typing

Avoid:
- `any`
- weak typing
- ambiguous return types

Prefer:
- explicit interfaces
- typed responses
- predictable contracts

---

## Type Safety

All:
- API responses,
- validation schemas,
- Prisma interactions,
- and component props

should remain strongly typed.

---

# Async Standards

Async operations must:
- use proper `try/catch`
- handle failures gracefully
- avoid unhandled promises

Correct:

```ts
try {
  // logic
} catch (error) {
  // safe handling
}
```

---

# Logging Rules

Allowed:
- development debugging
- operational logging
- server-side diagnostics

Forbidden:
- passwords
- tokens
- secrets
- session cookies

Sensitive data must NEVER appear in logs.

---

# Environment Variable Standards

Sensitive values belong ONLY in:
```txt
.env.local
```

Examples:
- DATABASE_URL
- NEXTAUTH_SECRET
- RESEND_API_KEY

Never:
- hardcode secrets
- commit secrets
- expose private env variables to the client

---

# Frontend Standards

## Client Components

Use client components ONLY when needed.

Examples:
- form interaction
- local state
- event handling

Prefer server components by default.

---

## Form UX

Every form must include:
- labels
- loading states
- validation feedback
- accessible inputs
- disabled submit during async requests

---

# Accessibility Standards

Required:
- keyboard accessibility
- visible focus states
- semantic HTML
- accessible labels
- proper input associations

Avoid inaccessible custom controls.

---

# React Standards

## Component Design

Components should:
- remain focused
- avoid excessive props
- stay composable
- remain predictable

Avoid:
- giant multi-purpose components
- duplicated auth logic

---

# Styling Standards

Use:
```txt
Tailwind CSS
```

Guidelines:
- utility-first styling
- consistent spacing
- reusable patterns
- minimal visual noise

Avoid:
- arbitrary inconsistent spacing
- inline style clutter
- deeply nested conditional styling

---

# Git Standards

## Commit Discipline

Commits should remain:
- small,
- descriptive,
- and intentional.

Good:

```bash
feat: implement forgot password flow
fix: protect dashboard middleware
refactor: centralize zod validation
```

Bad:

```bash
update stuff
fix bugs
changes
```

---

# Security Testing Discipline

Before deployment manually test:

- invalid login attempts
- expired verification tokens
- reused reset tokens
- unauthorized route access
- malformed requests
- missing fields
- rate limiting behavior

Document:
- expected behavior
- actual behavior
- mitigation applied

---

# Engineering Quality Checklist

Before finalizing features verify:

- [ ] Validation exists
- [ ] Errors are non-revealing
- [ ] Passwords are hashed
- [ ] Tokens expire correctly
- [ ] Protected routes use middleware
- [ ] TypeScript typing is strict
- [ ] Components are reusable
- [ ] API responses are consistent
- [ ] Environment variables are secure
- [ ] No sensitive logs exist
- [ ] Accessibility standards are met
- [ ] Git history remains clean

---

# Expected Code Quality

SecureGate code should feel appropriate for:
- production SaaS systems,
- enterprise authentication platforms,
- and security-focused engineering environments.

The codebase should communicate:
- intentional architecture,
- operational maturity,
- and engineering discipline.

---

# Final Engineering Principle

When implementing SecureGate:
- prioritize clarity over cleverness,
- prioritize security over convenience,
- prioritize maintainability over speed,
- and prioritize consistency over shortcuts.

The system should feel:
- secure,
- predictable,
- scalable,
- and production-ready.