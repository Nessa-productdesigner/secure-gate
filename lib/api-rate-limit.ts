import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "./rate-limit";
import { getClientIp } from "./request-ip";

export async function enforceRateLimit(
  req: NextRequest,
  scope: string,
  suffix?: string
): Promise<NextResponse | null> {
  const ip = getClientIp(req);
  const key = suffix ? `${scope}:${ip}:${suffix}` : `${scope}:${ip}`;
  const { success } = await rateLimit(key);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  return null;
}
