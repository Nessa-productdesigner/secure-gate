import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyEmailSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = verifyEmailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 400 }
      );
    }

    const { token } = parsed.data;

    const existingToken = await db.token.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!existingToken || existingToken.type !== "EMAIL_VERIFICATION") {
      return NextResponse.json(
        { error: "Invalid or expired token. Please request a new verification email." },
        { status: 400 }
      );
    }

    if (new Date() > existingToken.expiresAt) {
      await db.token.delete({ where: { id: existingToken.id } });
      return NextResponse.json(
        { error: "Token has expired. Please request a new verification email." },
        { status: 400 }
      );
    }

    await db.user.update({
      where: { id: existingToken.userId },
      data: { emailVerified: new Date() },
    });

    await db.token.delete({ where: { id: existingToken.id } });

    return NextResponse.json(
      { success: true, message: "Email verified successfully" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
