// Upstash Redis caching layer
// Falls back to in-memory cache when REDIS_URL is not configured
type CacheEntry = { value: string; expiresAt: number }
const memoryCache = new Map<string, CacheEntry>()

async function getRedisClient() {
  const url = "placeholder"
  const token = "placeholder"
  if (!url || !token) return null
  return { url, token }
}

export async function cacheGet(key: string): Promise<string | null> {
  // Try Redis first
  const redis = await getRedisClient()
  if (redis) {
    try {
      const res = await fetch(`${redis.url}/get/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${redis.token}` }
      })
      if (res.ok) {
        const data = await res.json()
        return data.result
      }
    } catch { /* fall through to memory */ }
  }
  // In-memory fallback
  const entry = memoryCache.get(key)
  if (entry && entry.expiresAt > Date.now()) return entry.value
  return null
}

export async function cacheSet(key: string, value: string, ttlSeconds = 3600): Promise<void> {
  const redis = await getRedisClient()
  if (redis) {
    try {
      await fetch(`${redis.url}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}?ex=${ttlSeconds}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${redis.token}` }
      })
      return
    } catch { /* fall through */ }
  }
  // In-memory fallback
  memoryCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 })
  // Evict if too large
  if (memoryCache.size > 500) {
    const oldest = memoryCache.keys().next().value
    if (oldest) memoryCache.delete(oldest)
  }
}

export async function cacheDel(key: string): Promise<void> {
  const redis = await getRedisClient()
  if (redis) {
    try {
      await fetch(`${redis.url}/del/${encodeURIComponent(key)}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${redis.token}` }
      })
    } catch { /* ignore */ }
  }
  memoryCache.delete(key)
}

// Convenience: hash a string key for AI response cache
export function aiCacheKey(provider: string, model: string, prompt: string): string {
  // Simple hash using string content
  let hash = 0
  const str = `${provider}:${model}:${prompt}`
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return `ai:${Math.abs(hash).toString(36)}`
}
