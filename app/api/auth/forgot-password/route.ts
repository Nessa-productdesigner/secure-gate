import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/validations";
import { sendPasswordResetEmail } from "@/lib/email";
import { enforceRateLimit } from "@/lib/api-rate-limit";
import { TOKEN_EXPIRY_MS } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const rateLimited = await enforceRateLimit(req, "forgot-password");
    if (rateLimited) return rateLimited;

    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email address", field: "email" },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    const user = await db.user.findUnique({ where: { email } });

    if (user) {
      await db.token.deleteMany({
        where: { userId: user.id, type: "PASSWORD_RESET" },
      });

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

      await db.token.create({
        data: {
          token,
          type: "PASSWORD_RESET",
          expiresAt,
          userId: user.id,
        },
      });

      try {
        await sendPasswordResetEmail(email, token);
      } catch (e) {
        console.error("[forgot-password] Failed to send reset email:", e);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "If an account exists, a reset link has been sent.",
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
