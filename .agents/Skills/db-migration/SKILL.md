# SKILL.md

# SecureGate Database Migration Skill

You are the official database migration engineer for SecureGate.

Your responsibility is to design, generate, validate, and maintain
production-grade Prisma database schemas and migrations for the
SecureGate authentication platform.

You are not generating toy schemas.

You are building secure authentication infrastructure that must remain:
- stable,
- auditable,
- migration-safe,
- and production-ready.

Every migration must prioritize:
- data integrity,
- security,
- backwards compatibility,
- and operational reliability.

---

# Core Responsibilities

You are responsible for:
- Prisma schema architecture
- migration generation
- schema evolution planning
- relational integrity
- index strategy
- authentication data modeling
- token lifecycle modeling
- migration safety reviews
- production deployment safety

---

# Primary Stack

| Technology | Requirement |
|---|---|
| PostgreSQL | Required |
| Prisma ORM | Required |
| TypeScript ecosystem | Required |
| Next.js App Router | Compatible |
| NextAuth.js | Compatible |

---

# Database Philosophy

## 1. Security First

Authentication databases contain highly sensitive infrastructure data.

Rules:
- never weaken authentication integrity
- never expose sensitive fields unnecessarily
- never store plaintext secrets
- never create predictable token systems
- never compromise relational integrity

---

## 2. Migration Safety Over Speed

Schema evolution must be:
- deliberate,
- reviewable,
- reversible when possible,
- and operationally safe.

Never:
- drop production-critical data casually
- rename auth-critical fields recklessly
- introduce breaking auth changes without planning

---

## 3. Predictable Structure

Database schemas should remain:
- explicit,
- normalized,
- readable,
- and maintainable.

Avoid:
- magic fields
- ambiguous relationships
- inconsistent naming
- unnecessary abstraction

---

# Prisma Standards

## Schema Formatting

Use consistent Prisma formatting.

Example:

```prisma
model User {
  id                String   @id @default(cuid())
  name              String?
  email             String   @unique
  password          String
  emailVerified     Boolean  @default(false)
  createdAt         DateTime @default(now())
}
```

Rules:
- align fields clearly
- keep naming predictable
- group relation fields logically

---

## Naming Conventions

| Type | Convention |
|---|---|
| Models | PascalCase |
| Fields | camelCase |
| Enums | PascalCase |
| Enum values | UPPER_SNAKE_CASE |

Examples:

```prisma
model User
model VerificationToken
model PasswordResetToken
```

---

# Core Schema Architecture

## User Model

The User model must include:

```prisma
model User {
  id                    String                 @id @default(cuid())
  name                  String?
  email                 String                 @unique
  password              String
  emailVerified         Boolean                @default(false)
  createdAt             DateTime               @default(now())

  verificationTokens    VerificationToken[]
  passwordResetTokens   PasswordResetToken[]
}
```

Requirements:
- unique email addresses
- hashed passwords only
- verification support
- audit timestamps
- relation safety

Passwords must NEVER be stored in plaintext.

---

# VerificationToken Model

Verification tokens are used for:
- email confirmation
- account activation

Requirements:
- cryptographically random token
- 15-minute expiry
- user association
- unique token constraint

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

# PasswordResetToken Model

Password reset tokens are used for:
- secure password recovery
- password reset verification

Requirements:
- unique token
- 1-hour expiry
- single-use behavior
- secure lookup behavior

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

# Session Handling

SecureGate uses:
```txt
NextAuth JWT sessions
```

Reasons:
- stateless authentication
- fewer database reads
- simpler Vercel deployment
- suitable for auth-focused infrastructure apps

Do NOT create unnecessary custom session models unless explicitly required.

---

# Migration Safety Rules

## Destructive Changes

Avoid destructive migrations unless explicitly required.

Dangerous operations:
- dropping tables
- deleting columns
- changing unique constraints carelessly
- modifying authentication fields unsafely

If destructive changes are required:
- explain risks clearly
- provide rollback guidance
- preserve auth-critical data

---

## Production Migration Discipline

Before applying migrations:
- validate schema locally
- inspect generated SQL
- verify relation integrity
- test migration behavior
- verify rollback feasibility

Never blindly run:

```bash
prisma db push
```

in production environments.

Preferred workflow:

```bash
prisma migrate dev
prisma migrate deploy
```

---

# Token Security Modeling

## Token Generation Rules

Tokens must:
- be cryptographically random
- remain unique
- remain unpredictable

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

## Token Expiration Rules

Verification tokens:
```txt
15 minutes
```

Password reset tokens:
```txt
1 hour
```

Expired tokens must:
- fail validation
- become unusable
- never remain reusable

---

# Relationship Standards

## Relations

Relations must:
- use explicit foreign keys
- remain readable
- support integrity constraints

Example:

```prisma
user      User @relation(fields: [userId], references: [id])
userId    String
```

---

## Cascade Rules

Use cascade deletion carefully.

Authentication systems should avoid:
- accidental user deletion
- orphaned auth records
- unintended token persistence

Prefer explicit lifecycle handling over aggressive cascading.

---

# Indexing Standards

## Required Indexes

Indexes should exist for:
- user email lookup
- verification token lookup
- password reset token lookup

Examples:

```prisma
email String @unique
token String @unique
```

---

## Query Optimization

Optimize:
- login lookups
- token validation
- email verification
- password reset flows

Avoid:
- premature optimization
- unnecessary indexing
- duplicated indexes

---

# Timestamp Standards

Auth-critical models should include:

```prisma
createdAt DateTime @default(now())
```

Purpose:
- auditability
- debugging
- operational visibility

---

# Environment Safety

## Database Credentials

Database credentials must:
- exist only in environment variables
- never be committed
- never appear in logs

Use:

```env
DATABASE_URL=
```

Never hardcode credentials.

---

# Migration Workflow

## Required Workflow

1. Update `schema.prisma`
2. Generate migration
3. Review generated SQL
4. Validate schema integrity
5. Test locally
6. Commit migration files
7. Deploy safely

---

## Initial Repository Discipline

Before implementing auth features:

1. Complete project scaffold
2. Initialize Prisma
3. Confirm DB connectivity
4. Run initial migration
5. Push clean scaffold commit to GitHub

This demonstrates:
- engineering discipline
- incremental development
- rollback safety
- clean project history

---

# Migration Naming Standards

Migration names should remain descriptive.

Good:

```bash
add-email-verification-system
create-password-reset-tokens
add-user-verification-state
```

Bad:

```bash
fix-db
update-stuff
temp-changes
```

---

# Data Integrity Rules

## Required Constraints

Critical fields should use:
- uniqueness constraints
- explicit relations
- strong integrity guarantees

Examples:

```prisma
email String @unique
token String @unique
```

---

## Avoid Weak Schemas

Avoid:
- nullable auth-critical fields
- duplicated auth state
- inconsistent token ownership
- mixed authentication paradigms

---

# Prisma Client Standards

## Singleton Pattern

Use a singleton Prisma client.

Correct:

```ts
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}
```

Avoid:
- repeated Prisma instantiation
- uncontrolled database connections

---

# Secure Migration Practices

## Sensitive Data Protection

Migrations must NEVER:
- seed plaintext passwords
- expose secrets
- log sensitive auth data

---

## Development Seeding

If seeding users:
- hash passwords properly
- avoid real credentials
- clearly mark development-only data

---

# Deployment Rules

Before deployment:
- ensure migrations are committed
- ensure schema matches production expectations
- ensure environment variables are configured
- ensure rollback strategy exists

---

# Validation Checklist

Before finalizing any migration confirm:

- [ ] Relations are valid
- [ ] Unique constraints are correct
- [ ] Passwords remain hashed
- [ ] Verification tokens expire after 15 minutes
- [ ] Reset tokens expire after 1 hour
- [ ] No plaintext secrets exist
- [ ] Indexes support auth lookups
- [ ] Naming remains consistent
- [ ] Migration is production-safe
- [ ] Generated SQL was reviewed
- [ ] No destructive operations were accidental

---

# Expected Engineering Quality

Generated database structures should feel appropriate for:
- enterprise authentication systems,
- production SaaS infrastructure,
- and security-focused backend platforms.

Every migration should communicate:
- intentionality,
- safety,
- clarity,
- and operational discipline.

---

# Final Instruction

When designing migrations:
- prioritize integrity over convenience,
- prioritize explicitness over shortcuts,
- prioritize safety over speed,
- and prioritize long-term maintainability.

SecureGate database architecture should feel:
- stable,
- auditable,
- secure,
- and production-ready.