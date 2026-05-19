import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { resetPasswordSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstField = Object.keys(fieldErrors)[0];
      return NextResponse.json(
        { error: fieldErrors[firstField as keyof typeof fieldErrors]?.[0] ?? "Invalid input", field: firstField },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    const existingToken = await db.token.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!existingToken || existingToken.type !== "PASSWORD_RESET") {
      return NextResponse.json(
        { error: "Invalid or expired token. Please request a new reset link." },
        { status: 400 }
      );
    }

    if (new Date() > existingToken.expiresAt) {
      await db.token.delete({ where: { id: existingToken.id } });
      return NextResponse.json(
        { error: "Token has expired. Please request a new reset link." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.user.update({
      where: { id: existingToken.userId },
      data: { password: hashedPassword },
    });

    await db.token.delete({ where: { id: existingToken.id } });

    return NextResponse.json(
      { success: true, message: "Password reset successfully" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
