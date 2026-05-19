---
trigger: always_on
---

# security.md

# SecureGate — Security Architecture & Policies

This document defines the security standards, authentication safeguards,
threat protections, middleware enforcement rules, and operational
security policies for SecureGate.

SecureGate is a production-grade authentication and identity management layer.
Security is treated as foundational infrastructure — not a feature.

The system must demonstrate:
- secure authentication architecture,
- production-safe engineering,
- defensive backend design,
- and real-world security discipline.

---

# Security Philosophy

SecureGate follows these principles:

1. Never trust user input
2. Minimize attack surface
3. Fail securely
4. Protect sensitive data by default
5. Avoid leaking implementation details
6. Assume hostile traffic exists
7. Prefer explicit security boundaries
8. Design for auditability and maintainability

---

# Threat Model

SecureGate is specifically designed to defend against:

- Brute-force login attacks
- Credential stuffing
- User enumeration
- Token replay attacks
- Session hijacking
- CSRF attacks
- Timing attacks
- Weak password usage
- Insecure password storage
- Expired token abuse
- Sensitive data leakage
- Insecure cookie access
- Malicious form input
- Basic abuse and spam traffic
- Unauthorized protected route access

---

# Session Strategy

## Chosen Strategy: JWT Sessions

SecureGate uses JWT sessions via NextAuth.

Reasons:
- stateless authentication
- reduced database reads
- simpler deployment on Vercel
- better compatibility with serverless environments
- lower session management complexity
- appropriate for an auth-focused standalone application

JWT sessions are preferred here because SecureGate focuses on
authentication infrastructure rather than large-scale multi-device
session management.

---

# Authentication Security

## Password Storage

Passwords must NEVER:
- be stored in plaintext
- be logged
- be returned in responses
- be cached insecurely

All passwords must be hashed using:

```txt
bcryptjs
```

Configuration:
```txt
Salt rounds: 12
```

Example:
```ts
const hashedPassword = await bcrypt.hash(password, 12)
```

---

## Password Requirements

Minimum requirements:
- 8+ characters
- uppercase letter
- lowercase letter
- number
- symbol recommended

Frontend:
- password strength indicator required

Backend:
- validation enforced with Zod

Frontend validation alone is NOT sufficient.

---

## Authentication Responses

Authentication responses must NEVER reveal:
- whether a user exists
- whether a password is incorrect
- whether an email is registered

Always use generic messages.

Correct:
```txt
Invalid credentials
```

Incorrect:
```txt
Email does not exist
Wrong password
Account not found
```

This prevents user enumeration attacks.

---

# Session Security

## NextAuth Configuration

NextAuth must:
- use secure cookies
- use HttpOnly cookies
- use SameSite protections
- keep CSRF protection enabled

Never disable built-in security protections.

---

## Session Rules

Protected routes must verify:
- authenticated session exists
- email is verified

Access policy:

| State | Action |
|---|---|
| Unauthenticated | Redirect to login |
| Authenticated but unverified | Redirect to verification notice |
| Authenticated and verified | Allow access |

---

## Logout Security

Logout must:
- fully destroy session state
- invalidate cookies properly
- redirect away from protected routes

No residual session state should remain after logout.

---

# Middleware Enforcement

Middleware is responsible for:

- route protection
- authentication redirects
- email verification enforcement
- protected route gating
- rate limiting integration
- auth boundary enforcement

Protected routes must NEVER rely solely on client-side checks.

Middleware should validate:
- authenticated session presence
- verification state
- protected route eligibility

Recommended protected routes:
```txt
/dashboard
/settings
/account
```

---

# Token Security

## VerificationToken Model

Verification tokens must:
- belong to a specific user
- expire after 15 minutes
- be cryptographically random
- be single-purpose

Recommended schema:
```prisma
model VerificationToken {
  id         String   @id @default(cuid())
  identifier String
  token      String   @unique
  expires    DateTime

  userId     String
  user       User @relation(fields: [userId], references: [id])

  createdAt  DateTime @default(now())
}
```

---

## PasswordResetToken Model

Password reset tokens must:
- remain unique
- expire after 1 hour
- never be reusable
- remain isolated from verification logic

Recommended schema:
```prisma
model PasswordResetToken {
  id         String   @id @default(cuid())
  email      String
  token      String   @unique
  expires    DateTime

  createdAt  DateTime @default(now())
}
```

---

## Token Generation

All verification and reset tokens must be:
- cryptographically random
- unique
- unguessable

Use:
```ts
crypto.randomBytes(32).toString("hex")
```

Never use:
- timestamps
- sequential IDs
- predictable hashes
- user IDs directly

---

## Token Validation Rules

Every token validation flow must check:
- token exists
- token is valid
- token is unexpired
- token type matches expected action

Failure responses must remain safe and generic.

---

# Email Security

## Verification Emails

Verification emails must:
- contain signed token links
- expire properly
- avoid exposing sensitive information

Verification route:
```txt
/verify-email/[token]
```

---

## Password Reset Emails

Password reset emails must:
- avoid exposing whether the email exists
- include expiry-based reset tokens
- use HTTPS URLs only

Reset route:
```txt
/reset-password/[token]
```

Correct response:
```txt
If an account exists, a reset link has been sent.
```

Incorrect response:
```txt
Email not found
```

---

# Email Template Standards

React Email templates must:
- remain minimal
- render correctly across email clients
- avoid heavy styling complexity
- clearly communicate actions
- include expiration messaging
- use accessible text contrast

Emails should remain:
- concise,
- readable,
- and trustworthy.

---

# Input Validation Security

## Validation Rules

ALL external input must be validated with Zod.

This includes:
- forms
- query params
- API payloads
- token input
- URL params

Never trust:
- frontend validation
- browser constraints
- client-side sanitization

---

## Validation Order

Required order:
1. Receive request
2. Validate input
3. Reject invalid data
4. Continue business logic

Never access the database before validation.

---

# Rate Limiting

## Login Protection

Rate limiting must be applied to:
- login endpoint
- forgot-password endpoint
- verification resend endpoint (if implemented)

Recommended policy:
```txt
5 attempts per IP every 10 minutes
```

Purpose:
- prevent brute-force attacks
- reduce automated abuse
- slow credential stuffing attempts

---

## Limit Responses

Rate limit responses must NOT reveal:
- exact thresholds
- security configuration
- tracking details

Correct:
```txt
Too many attempts. Please try again later.
```

Incorrect:
```txt
You exceeded 5 login attempts.
```

---

# API Security

## Error Handling

Rules:
- never expose stack traces
- never expose internal database details
- never expose Prisma errors directly
- log sensitive details server-side only

Public responses must remain generic.

---

## Response Consistency

All errors must follow:

```ts
{
  error: string,
  field?: string
}
```

This prevents:
- inconsistent behavior
- accidental information leakage
- unpredictable frontend handling

---

# Database Security

## User Model Requirements

The User model must include:

```prisma
model User {
  id                    String   @id @default(cuid())
  name                  String?
  email                 String   @unique
  password              String
  emailVerified         Boolean  @default(false)
  createdAt             DateTime @default(now())
}
```

Passwords must always remain hashed.

---

## Query Safety

Rules:
- validate input before queries
- avoid overfetching
- select only required fields
- never expose password hashes

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

unless explicitly necessary.

---

# Environment Variable Security

## Secret Handling

Secrets must:
- exist only in environment variables
- never be committed
- never be hardcoded

Sensitive variables include:
- DATABASE_URL
- NEXTAUTH_SECRET
- RESEND_API_KEY
- UPSTASH_REDIS_REST_TOKEN

---

## Deployment Rules

Before deployment:
- verify all variables exist in Vercel
- verify production secrets differ from development
- verify `.env.local` is ignored in Git

---

# HTTP Security Headers

SecureGate must configure:

```txt
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

Headers should be configured inside:

```txt
next.config.js
```

Purpose:
- clickjacking protection
- MIME sniffing prevention
- safer referrer handling

---

# Frontend Security

## Client Safety

Never expose:
- password hashes
- secrets
- internal tokens
- private API keys

Only expose:
```txt
NEXT_PUBLIC_*
```

variables when truly necessary.

---

## Form Security

Forms must:
- validate client-side
- validate server-side
- disable submit during requests
- handle async states safely

---

# Logging Policy

Allowed:
- server errors
- debugging in development
- operational logs

Forbidden:
- passwords
- tokens
- session cookies
- secrets
- auth headers

Sensitive data must NEVER appear in logs.

---

# CSRF Protection

NextAuth provides CSRF protection automatically.

Rules:
- never disable CSRF protection
- avoid insecure custom auth flows
- ensure forms use proper submission methods

---

# Cookie Security

Authentication cookies must be:
- HttpOnly
- Secure
- SameSite protected

This helps defend against:
- XSS
- session theft
- client-side token access

---

# Secure Error Messaging

## Good Error Messages

```txt
Invalid credentials
Something went wrong
Token has expired
Too many attempts. Please try again later.
```

---

## Dangerous Error Messages

```txt
Email does not exist
Password incorrect
Database query failed
User lookup failed
```

Dangerous messages leak implementation details.

---

# Security QA Testing

Before deployment manually test:

- invalid credentials
- expired verification tokens
- reused password reset links
- malformed tokens
- missing fields
- rate limit abuse
- unauthorized dashboard access
- direct protected route access
- invalid email formats
- missing environment variables

Document:
- expected behavior
- actual behavior
- mitigation implemented

---

# Security Review Checklist

Before deployment confirm:

- [ ] Passwords are hashed with bcryptjs
- [ ] Tokens use crypto.randomBytes
- [ ] Verification tokens expire after 15 minutes
- [ ] Reset tokens expire after 1 hour
- [ ] JWT sessions are configured securely
- [ ] No secrets are hardcoded
- [ ] No sensitive logs exist
- [ ] Rate limiting is active
- [ ] CSRF protection remains enabled
- [ ] Secure cookies are enabled
- [ ] Middleware protects private routes
- [ ] All API input is validated
- [ ] Error messages are non-revealing
- [ ] Protected routes enforce verification
- [ ] Password reset flow is secure
- [ ] Verification flow rejects expired tokens
- [ ] Environment variables are configured securely
- [ ] Security headers are active

---

# Final Security Principle

SecureGate should demonstrate the standards expected from:
- production authentication systems,
- enterprise-grade IAM layers,
- and security-conscious engineering teams.

Every authentication flow should prioritize:
- confidentiality,
- integrity,
- predictability,
- and resilience against abuse.

The system should feel:
- deliberate,
- hardened,
- auditable,
- and production-ready.