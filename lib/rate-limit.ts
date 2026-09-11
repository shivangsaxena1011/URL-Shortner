import { NextRequest } from "next/server";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory store for rate limiting
const memoryStore = new Map<string, RateLimitRecord>();

// Periodic cleanup of expired rate limit records (every 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    memoryStore.forEach((record, key) => {
      if (now > record.resetAt) {
        memoryStore.delete(key);
      }
    });
  }, 5 * 60 * 1000);
}

export interface RateLimitConfig {
  limit: number; // max allowed requests within window
  windowSeconds: number; // window size in seconds
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

/**
 * Check if the request is within rate limits.
 * @param identifier Unique identifier for the client (e.g., IP or userId)
 * @param config RateLimitConfig
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { limit: 10, windowSeconds: 60 }
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const key = `ratelimit:${identifier}`;

  const current = memoryStore.get(key);

  if (!current || now > current.resetAt) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + windowMs,
    };
    memoryStore.set(key, newRecord);
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      reset: Math.ceil((newRecord.resetAt - now) / 1000),
    };
  }

  if (current.count >= config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      reset: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  current.count += 1;
  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - current.count,
    reset: Math.ceil((current.resetAt - now) / 1000),
  };
}
