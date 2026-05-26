# SecureGate API Route Scaffolder

Use when adding or modifying Route Handlers under `app/api/auth/`.

## Template

```ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { enforceRateLimit } from "@/lib/api-rate-limit";
// import schema from @/lib/validations

export async function POST(req: NextRequest) {
  try {
    const rateLimited = await enforceRateLimit(req, "scope-name");
    if (rateLimited) return rateLimited;

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", field: "..." },
        { status: 400 }
      );
    }

    // business logic after validation

    return NextResponse.json({ success: true, message: "..." }, { status: 200 });
  } catch (error) {
    console.error("[scope-name]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
```

## Rules

1. Validate with Zod before any DB access.
2. Use `enforceRateLimit` for auth-related routes.
3. Errors: `{ error: string, field?: string }`.
4. Auth errors stay generic; token errors may prompt re-request.
5. Never log passwords, tokens, or secrets.
6. Use `BCRYPT_ROUNDS` and `TOKEN_EXPIRY_MS` from `@/lib/constants` when applicable.
7. Add matching schema to `lib/validations.ts` (emails: trim + lowercase).

## Existing routes

| Route | Purpose |
|--------|---------|
| `signup` | Create user, issue verify token, send email |
| `verify` | Consume EMAIL_VERIFICATION token |
| `forgot-password` | Issue PASSWORD_RESET token |
| `reset-password` | Update password, delete token |
| `resend-verification` | Re-issue verify token |
| `[...nextauth]` | NextAuth handler |

Do not duplicate logic that belongs in `lib/auth.ts` for sessions.
