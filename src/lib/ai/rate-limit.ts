type Bucket = {
  count: number
  resetAt: number
}

const memoryStore = new Map<string, Bucket>()
const WINDOW_MS = 60_000
const MAX_REQUESTS_PER_WINDOW = 8

export function checkAIRateLimit(identity: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const current = memoryStore.get(identity)

  if (!current || current.resetAt <= now) {
    const nextBucket = {
      count: 1,
      resetAt: now + WINDOW_MS,
    }

    memoryStore.set(identity, nextBucket)

    return {
      allowed: true,
      remaining: MAX_REQUESTS_PER_WINDOW - 1,
      resetAt: nextBucket.resetAt,
    }
  }

  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: current.resetAt,
    }
  }

  current.count += 1
  memoryStore.set(identity, current)

  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_WINDOW - current.count,
    resetAt: current.resetAt,
  }
}
