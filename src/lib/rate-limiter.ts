/**
 * Generic in-memory rate limiter for API routes.
 *
 * Supports multiple tiers (e.g., "strict" for AI routes, "normal" for public APIs).
 *
 * For production with multiple server instances, replace the in-memory Map
 * with Redis (e.g., @upstash/ratelimit) or use Vercel Edge middleware.
 */

type Bucket = {
  count: number
  resetAt: number
}

const store = new Map<string, Bucket>()

/** Periodic cleanup to prevent memory leaks */
const CLEANUP_INTERVAL_MS = 5 * 60_000
const MAX_BUCKET_AGE_MS = 10 * 60_000

if (typeof globalThis !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [key, bucket] of store) {
      if (now - bucket.resetAt > MAX_BUCKET_AGE_MS) {
        store.delete(key)
      }
    }
  }, CLEANUP_INTERVAL_MS).unref()
}

export interface RateLimitTier {
  windowMs: number
  maxRequests: number
}

export const RATE_LIMIT_TIERS = {
  /** Strict — AI generation routes (admin only but expensive) */
  strict: { windowMs: 60_000, maxRequests: 8 } as RateLimitTier,
  /** Normal — Public API routes (auth, reports, etc.) */
  normal: { windowMs: 60_000, maxRequests: 30 } as RateLimitTier,
  /** Relaxed — Read-heavy routes (listings, search, fetch) */
  relaxed: { windowMs: 60_000, maxRequests: 100 } as RateLimitTier,
} as const

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  limit: number
}

/**
 * Check rate limit for a given identity + tier combination.
 *
 * @param identity - Unique identifier (IP, userId, email, session, etc.)
 * @param tier - Preconfigured rate limit tier
 * @param prefix - Optional key prefix for namespace isolation (e.g., "ai", "api")
 */
export function rateLimit(
  identity: string,
  tier: RateLimitTier,
  prefix = "global",
): RateLimitResult {
  const key = `${prefix}:${identity}`
  const now = Date.now()
  const current = store.get(key)

  if (!current || current.resetAt <= now) {
    const bucket: Bucket = {
      count: 1,
      resetAt: now + tier.windowMs,
    }
    store.set(key, bucket)

    return {
      allowed: true,
      remaining: tier.maxRequests - 1,
      resetAt: bucket.resetAt,
      limit: tier.maxRequests,
    }
  }

  if (current.count >= tier.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: current.resetAt,
      limit: tier.maxRequests,
    }
  }

  current.count += 1
  store.set(key, current)

  return {
    allowed: true,
    remaining: tier.maxRequests - current.count,
    resetAt: current.resetAt,
    limit: tier.maxRequests,
  }
}

/**
 * Extract client identity from a NextRequest.
 * Uses X-Forwarded-For (set by proxy/CDN) or falls back to "anonymous".
 */
export function getClientIdentity(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  const realIp = request.headers.get("x-real-ip")
  if (realIp) {
    return realIp.trim()
  }

  return "anonymous"
}

/**
 * Build standard rate limit headers for HTTP responses.
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.resetAt),
    "X-RateLimit-Limit": String(result.limit),
  }
}
