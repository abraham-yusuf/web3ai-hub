import assert from "node:assert/strict"
import test from "node:test"
import { cn } from "../src/lib/utils"
import {
  rateLimit,
  rateLimitHeaders,
  getClientIdentity,
  RATE_LIMIT_TIERS,
  type RateLimitTier,
} from "../src/lib/rate-limiter"

// ââ cn() â Tailwind class merging utility ââââââââââââââââââââââââââââââââââââ

test("cn concatenates independent class strings with a space separator", () => {
  assert.equal(cn("px-4", "py-2"), "px-4 py-2")
})

test("cn resolves Tailwind conflicts â last padding wins", () => {
  // tailwind-merge keeps the last padding class when two conflict
  assert.equal(cn("p-4", "p-2"), "p-2")
})

test("cn resolves conflicting text-size utilities in favour of the last value", () => {
  assert.equal(cn("text-sm", "text-lg"), "text-lg")
})

test("cn omits falsy conditional values", () => {
  const isActive = false
  assert.equal(cn("base", isActive && "active", "end"), "base end")
})

test("cn handles undefined and null without throwing", () => {
  assert.equal(cn("base", undefined, null as unknown as string, "extra"), "base extra")
})

test("cn returns empty string when every argument is falsy", () => {
  assert.equal(cn(false as unknown as string, null as unknown as string, undefined), "")
})

test("cn merges object-form conditional classes correctly", () => {
  const result = cn({ "font-bold": true, italic: false, underline: true })
  assert.equal(result, "font-bold underline")
})

// ââ rateLimit() â in-memory sliding window âââââââââââââââââââââââââââââââââââ

test("rateLimit allows the first request for a fresh identity", () => {
  const id = `fresh-${Date.now()}-${Math.random()}`
  const result = rateLimit(id, RATE_LIMIT_TIERS.normal)

  assert.equal(result.allowed, true)
  assert.equal(result.limit, 30)
  assert.equal(result.remaining, 29)
  assert.ok(result.resetAt > Date.now(), "resetAt should be in the future")
})

test("rateLimit decrements remaining counter on each subsequent call", () => {
  const id = `count-${Date.now()}-${Math.random()}`
  const r1 = rateLimit(id, RATE_LIMIT_TIERS.strict)
  const r2 = rateLimit(id, RATE_LIMIT_TIERS.strict)
  const r3 = rateLimit(id, RATE_LIMIT_TIERS.strict)

  assert.equal(r1.remaining, 7) // 8 â 1
  assert.equal(r2.remaining, 6)
  assert.equal(r3.remaining, 5)
  assert.equal(r1.allowed, true)
  assert.equal(r2.allowed, true)
  assert.equal(r3.allowed, true)
})

test("rateLimit blocks requests once the window limit is reached", () => {
  const tiny: RateLimitTier = { windowMs: 60_000, maxRequests: 2 }
  const id = `block-${Date.now()}-${Math.random()}`
  const prefix = "block-ns"

  rateLimit(id, tiny, prefix) // 1st  â allowed
  rateLimit(id, tiny, prefix) // 2nd  â allowed (fills limit)
  const third = rateLimit(id, tiny, prefix) // 3rd  â should be blocked

  assert.equal(third.allowed, false)
  assert.equal(third.remaining, 0)
})

test("rateLimit uses prefix to isolate buckets for the same identity", () => {
  const id = `ns-${Date.now()}-${Math.random()}`
  const tiny: RateLimitTier = { windowMs: 60_000, maxRequests: 1 }

  const inNsA = rateLimit(id, tiny, "ns-a")
  const inNsB = rateLimit(id, tiny, "ns-b")

  // Both are first requests in their respective namespaces
  assert.equal(inNsA.allowed, true)
  assert.equal(inNsB.allowed, true)
})

test("rateLimit returns correct limit value from the tier configuration", () => {
  const id = `limit-${Date.now()}-${Math.random()}`
  const relaxed = rateLimit(id, RATE_LIMIT_TIERS.relaxed)

  assert.equal(relaxed.limit, 100)
})

// ââ rateLimitHeaders() â HTTP header builder âââââââââââââââââââââââââââââââââ

test("rateLimitHeaders returns the three standard X-RateLimit headers as strings", () => {
  const headers = rateLimitHeaders({
    allowed: true,
    remaining: 5,
    resetAt: 1_700_000_000,
    limit: 10,
  })

  assert.equal(headers["X-RateLimit-Remaining"], "5")
  assert.equal(headers["X-RateLimit-Reset"], "1700000000")
  assert.equal(headers["X-RateLimit-Limit"], "10")
})

test("rateLimitHeaders works correctly when remaining is zero", () => {
  const headers = rateLimitHeaders({ allowed: false, remaining: 0, resetAt: 9999, limit: 8 })

  assert.equal(headers["X-RateLimit-Remaining"], "0")
  assert.equal(headers["X-RateLimit-Limit"], "8")
})

// ââ getClientIdentity() â IP extraction âââââââââââââââââââââââââââââââââââââ

test("getClientIdentity returns the first IP from X-Forwarded-For", () => {
  const req = new Request("http://localhost", {
    headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8, 9.10.11.12" },
  })
  assert.equal(getClientIdentity(req), "1.2.3.4")
})

test("getClientIdentity falls back to X-Real-IP when X-Forwarded-For is absent", () => {
  const req = new Request("http://localhost", {
    headers: { "x-real-ip": "9.9.9.9" },
  })
  assert.equal(getClientIdentity(req), "9.9.9.9")
})

test("getClientIdentity returns 'anonymous' when neither IP header is present", () => {
  const req = new Request("http://localhost")
  assert.equal(getClientIdentity(req), "anonymous")
})

test("getClientIdentity trims whitespace around the forwarded IP", () => {
  const req = new Request("http://localhost", {
    headers: { "x-forwarded-for": "  10.0.0.1  , 10.0.0.2" },
  })
  assert.equal(getClientIdentity(req), "10.0.0.1")
})
