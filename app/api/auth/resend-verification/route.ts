import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/validations";
import { sendVerificationEmail } from "@/lib/email";
import { enforceRateLimit } from "@/lib/api-rate-limit";
import { TOKEN_EXPIRY_MS } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email address", field: "email" },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    const rateLimited = await enforceRateLimit(req, "resend-verification");
    if (rateLimited) return rateLimited;

    const emailRateLimited = await enforceRateLimit(
      req,
      "resend-verification-email",
      email
    );
    if (emailRateLimited) return emailRateLimited;

    const user = await db.user.findUnique({ where: { email } });

    if (user && !user.emailVerified) {
      await db.token.deleteMany({
        where: { userId: user.id, type: "EMAIL_VERIFICATION" },
      });

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

      await db.token.create({
        data: {
          token,
          type: "EMAIL_VERIFICATION",
          expiresAt,
          userId: user.id,
        },
      });

      try {
        await sendVerificationEmail(email, token);
      } catch (e) {
        console.error("[resend-verification] Failed to send email:", e);
      }
    }

    return NextResponse.json({
      success: true,
      message:
        "If an unverified account exists for this email, a new verification link has been sent.",
    });
  } catch (error) {
    console.error("[resend-verification]", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
