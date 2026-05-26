import { z } from "zod";

const PLACEHOLDER_PATTERN = /placeholder|changeme|example/i;

const envSchema = z
  .object({
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
    NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL"),
    RESEND_API_KEY: z
      .string()
      .min(1, "RESEND_API_KEY is required")
      .refine((key) => key.startsWith("re_"), "RESEND_API_KEY must start with re_"),
    RESEND_FROM_EMAIL: z.string().min(3).optional(),
    NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL must be a valid URL"),
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  })
  .refine(
    (data) => {
      const hasUrl = !!data.UPSTASH_REDIS_REST_URL;
      const hasToken = !!data.UPSTASH_REDIS_REST_TOKEN;
      return hasUrl === hasToken;
    },
    { message: "Set both UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN, or neither" }
  )
  .refine(
    (data) => {
      if (process.env.VERCEL_ENV !== "production") return true;
      return data.NEXTAUTH_SECRET.length >= 32;
    },
    { message: "NEXTAUTH_SECRET must be at least 32 characters in production" }
  )
  .refine(
    (data) => {
      if (process.env.VERCEL_ENV !== "production") return true;
      const urls = [data.NEXT_PUBLIC_APP_URL, data.NEXTAUTH_URL];
      return !urls.some((url) => /localhost|127\.0\.0\.1/i.test(url));
    },
    {
      message:
        "On Vercel production, NEXT_PUBLIC_APP_URL and NEXTAUTH_URL must use your live domain (not localhost)",
    }
  )
  .refine(
    (data) => !PLACEHOLDER_PATTERN.test(data.RESEND_API_KEY),
    { message: "RESEND_API_KEY must be a real API key from resend.com" }
  )
  .refine(
    (data) => {
      if (process.env.VERCEL_ENV !== "production") return true;
      return !PLACEHOLDER_PATTERN.test(data.NEXTAUTH_SECRET);
    },
    { message: "NEXTAUTH_SECRET must not be a placeholder value in production" }
  );

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
