import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/env";

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

export type RateLimitTier = "expensive" | "standard" | "cheap";

// Rate limits for anonymous users
const anonymousLimiters = {
  expensive: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 h"),
    prefix: "ratelimit:anon:expensive",
  }),
  standard: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 h"),
    prefix: "ratelimit:anon:standard",
  }),
  cheap: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"),
    prefix: "ratelimit:anon:cheap",
  }),
};

// Rate limits for authenticated users
const authenticatedLimiters = {
  expensive: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 h"),
    prefix: "ratelimit:auth:expensive",
  }),
  standard: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 h"),
    prefix: "ratelimit:auth:standard",
  }),
  cheap: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(500, "1 m"),
    prefix: "ratelimit:auth:cheap",
  }),
};

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export async function checkRateLimit(
  tier: RateLimitTier,
  identifier: string,
  isAuthenticated: boolean,
): Promise<RateLimitResult> {
  const limiters = isAuthenticated ? authenticatedLimiters : anonymousLimiters;
  const limiter = limiters[tier];

  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}
