import { env } from "./env";

const attempts = new Map<string, { count: number; resetAt: number }>();

const LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;

export async function rateLimit(identifier: string): Promise<{
  success: boolean;
  remaining: number;
}> {
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const { Ratelimit } = await import("@upstash/ratelimit");
      const { Redis } = await import("@upstash/redis");

      const ratelimit = new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(LIMIT, "10 m"),
      });

      const result = await ratelimit.limit(identifier);
      return {
        success: result.success,
        remaining: result.remaining,
      };
    } catch (e) {
      console.error("[rate-limit] Upstash Redis error, falling back to in-memory:", e);
      return { success: true, remaining: LIMIT };
    }
  }

  const now = Date.now();
  const record = attempts.get(identifier);

  if (!record || now > record.resetAt) {
    attempts.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return { success: true, remaining: LIMIT - 1 };
  }

  if (record.count >= LIMIT) {
    return { success: false, remaining: 0 };
  }

  record.count++;
  return { success: true, remaining: LIMIT - record.count };
}
