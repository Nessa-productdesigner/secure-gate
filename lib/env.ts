import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL"),
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  /** Resend "from" address. Use onboarding@resend.dev for testing (see Resend dashboard). */
  RESEND_FROM_EMAIL: z.string().min(3).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL must be a valid URL"),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
});

function getEnv() {
  const result = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  if (!result.success) {
    console.error("Invalid environment variables:", result.error.format());
    throw new Error("Invalid environment variables");
  }

  return result.data;
}

export const env = typeof window === "undefined" ? getEnv() : ({} as ReturnType<typeof getEnv>);
