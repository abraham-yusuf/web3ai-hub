import assert from "node:assert/strict"
import test from "node:test"

// ââ POST /api/airdrop/report ââââââââââââââââââââââââââââââââââââââââââââââââââ
// This route only depends on zod + api-response (no auth, no Prisma, no AI),
// so it can be imported and exercised directly without any module mocking.
import { POST as postAirdropReport } from "../src/app/api/airdrop/report/route"

/** Build a standard POST Request with a JSON body */
function jsonPost(url: string, body: unknown): Request {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

test("POST /api/airdrop/report accepts valid payload and returns { ok: true }", async () => {
  const req = jsonPost("http://localhost/api/airdrop/report", {
    slug: "layerzero-airdrop",
    message: "This project seems suspicious and should be flagged by the team.",
  })

  const res = await postAirdropReport(req)
  const body = await res.json()

  assert.equal(res.status, 200)
  assert.deepEqual(body, { ok: true })
})

test("POST /api/airdrop/report rejects a slug that is only one character", async () => {
  const req = jsonPost("http://localhost/api/airdrop/report", {
    slug: "x", // min 2 chars
    message: "A sufficiently long message for the report.",
  })

  const res = await postAirdropReport(req)
  assert.equal(res.status, 400)
})

test("POST /api/airdrop/report rejects a message shorter than 8 characters", async () => {
  const req = jsonPost("http://localhost/api/airdrop/report", {
    slug: "valid-slug",
    message: "short", // min 8 chars
  })

  const res = await postAirdropReport(req)
  assert.equal(res.status, 400)
})

test("POST /api/airdrop/report rejects a body missing the message field", async () => {
  const req = jsonPost("http://localhost/api/airdrop/report", {
    slug: "valid-slug",
  })

  const res = await postAirdropReport(req)
  assert.equal(res.status, 400)
})

test("POST /api/airdrop/report rejects a body missing both required fields", async () => {
  const req = jsonPost("http://localhost/api/airdrop/report", {})

  const res = await postAirdropReport(req)
  assert.equal(res.status, 400)
})

test("POST /api/airdrop/report handles malformed JSON body gracefully", async () => {
  const req = new Request("http://localhost/api/airdrop/report", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "not-valid-json{{{",
  })

  const res = await postAirdropReport(req)
  // null payload â Zod parse throws â apiErrorResponse â 400
  assert.equal(res.status, 400)
})

test("POST /api/airdrop/report handles null JSON body gracefully", async () => {
  const req = new Request("http://localhost/api/airdrop/report", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "null",
  })

  const res = await postAirdropReport(req)
  assert.equal(res.status, 400)
})

test("POST /api/airdrop/report response error field is a non-empty string on failure", async () => {
  const req = jsonPost("http://localhost/api/airdrop/report", {
    slug: "ok",
    message: "x", // too short
  })

  const res = await postAirdropReport(req)
  const body = await res.json()

  assert.equal(res.status, 400)
  // api-response wraps Zod errors with a "Validasi gagal" message
  assert.ok(typeof body.error === "string" && body.error.length > 0)
})

// ââ POST /api/ai/translate ââââââââââââââââââââââââââââââââââââââââââââââââââââ
// This route uses auth, rate-limiter, AI settings, and AI providers.
// All heavy dependencies are mocked via t.mock.module so no real APIs are called.

// Helper: builds a minimal authenticated mock session
const authedSession = { user: { email: "test@web3hub.com", id: "user-1" } }

// Helper: builds rate-limit mock that always allows
const allowedRateLimit = () => ({
  allowed: true,
  remaining: 7,
  resetAt: Date.now() + 60_000,
  limit: 8,
})

test("POST /api/ai/translate returns 401 when session is absent", async (t) => {
  t.mock.module("../src/auth", { namedExports: { auth: async () => null } })
  t.mock.module("../src/lib/prisma", { namedExports: { prisma: {} } })
  t.mock.module("../src/lib/ai/settings", {
    namedExports: { getAISettings: async () => ({}) },
  })
  t.mock.module("../src/lib/ai/providers", {
    namedExports: { streamWithProviderFallback: async () => ({}) },
  })
  t.mock.module("../src/lib/ai/prompts", {
    namedExports: { createAiTranslateContentPrompt: () => "mock-prompt" },
  })

  const { POST: postTranslate } = await import("../src/app/api/ai/translate/route")
  const req = jsonPost("http://localhost/api/ai/translate", {
    content: "Hello World",
    targetLocale: "id",
  })

  const res = await postTranslate(req)
  const body = await res.json()

  assert.equal(res.status, 401)
  assert.ok(body.error, "Response should include an error message")
})

test("POST /api/ai/translate returns 429 when rate limit is exceeded", async (t) => {
  t.mock.module("../src/auth", {
    namedExports: { auth: async () => authedSession },
  })
  t.mock.module("../src/lib/rate-limiter", {
    namedExports: {
      rateLimit: () => ({ allowed: false, remaining: 0, resetAt: Date.now() + 60_000, limit: 8 }),
      rateLimitHeaders: () => ({ "X-RateLimit-Remaining": "0" }),
      getClientIdentity: () => "127.0.0.1",
      RATE_LIMIT_TIERS: { strict: { windowMs: 60_000, maxRequests: 8 } },
    },
  })
  t.mock.module("../src/lib/prisma", { namedExports: { prisma: {} } })
  t.mock.module("../src/lib/ai/settings", {
    namedExports: { getAISettings: async () => ({}) },
  })
  t.mock.module("../src/lib/ai/providers", {
    namedExports: { streamWithProviderFallback: async () => ({}) },
  })
  t.mock.module("../src/lib/ai/prompts", {
    namedExports: { createAiTranslateContentPrompt: () => "mock-prompt" },
  })

  const { POST: postTranslate } = await import("../src/app/api/ai/translate/route")
  const req = jsonPost("http://localhost/api/ai/translate", {
    content: "Hello World",
    targetLocale: "id",
  })

  const res = await postTranslate(req)
  const body = await res.json()

  assert.equal(res.status, 429)
  assert.ok(body.error)
  assert.ok(body.resetAt, "Response should include a resetAt timestamp")
})

test("POST /api/ai/translate returns 400 when content field is missing", async (t) => {
  t.mock.module("../src/auth", {
    namedExports: { auth: async () => authedSession },
  })
  t.mock.module("../src/lib/rate-limiter", {
    namedExports: {
      rateLimit: allowedRateLimit,
      rateLimitHeaders: () => ({}),
      getClientIdentity: () => "127.0.0.1",
      RATE_LIMIT_TIERS: { strict: { windowMs: 60_000, maxRequests: 8 } },
    },
  })
  t.mock.module("../src/lib/prisma", { namedExports: { prisma: {} } })
  t.mock.module("../src/lib/ai/settings", {
    namedExports: { getAISettings: async () => ({}) },
  })
  t.mock.module("../src/lib/ai/providers", {
    namedExports: { streamWithProviderFallback: async () => ({}) },
  })
  t.mock.module("../src/lib/ai/prompts", {
    namedExports: { createAiTranslateContentPrompt: () => "mock-prompt" },
  })

  const { POST: postTranslate } = await import("../src/app/api/ai/translate/route")
  const req = jsonPost("http://localhost/api/ai/translate", {
    targetLocale: "id",
    // missing content
  })

  const res = await postTranslate(req)
  const body = await res.json()

  assert.equal(res.status, 400)
  assert.ok(body.error)
})

test("POST /api/ai/translate returns 400 for an unsupported targetLocale", async (t) => {
  t.mock.module("../src/auth", {
    namedExports: { auth: async () => authedSession },
  })
  t.mock.module("../src/lib/rate-limiter", {
    namedExports: {
      rateLimit: allowedRateLimit,
      rateLimitHeaders: () => ({}),
      getClientIdentity: () => "127.0.0.1",
      RATE_LIMIT_TIERS: { strict: { windowMs: 60_000, maxRequests: 8 } },
    },
  })
  t.mock.module("../src/lib/prisma", { namedExports: { prisma: {} } })
  t.mock.module("../src/lib/ai/settings", {
    namedExports: { getAISettings: async () => ({}) },
  })
  t.mock.module("../src/lib/ai/providers", {
    namedExports: { streamWithProviderFallback: async () => ({}) },
  })
  t.mock.module("../src/lib/ai/prompts", {
    namedExports: { createAiTranslateContentPrompt: () => "mock-prompt" },
  })

  const { POST: postTranslate } = await import("../src/app/api/ai/translate/route")
  const req = jsonPost("http://localhost/api/ai/translate", {
    content: "Hello World",
    targetLocale: "fr", // only "id" | "en" are valid
  })

  const res = await postTranslate(req)

  assert.equal(res.status, 400)
})

test("POST /api/ai/translate returns 200 with translated content on success", async (t) => {
  t.mock.module("../src/auth", {
    namedExports: { auth: async () => authedSession },
  })
  t.mock.module("../src/lib/rate-limiter", {
    namedExports: {
      rateLimit: allowedRateLimit,
      rateLimitHeaders: () => ({}),
      getClientIdentity: () => "127.0.0.1",
      RATE_LIMIT_TIERS: { strict: { windowMs: 60_000, maxRequests: 8 } },
    },
  })
  t.mock.module("../src/lib/ai/settings", {
    namedExports: {
      getAISettings: async () => ({
        openai: { enabled: true, model: "gpt-4o-mini", temperature: 0.3, encryptedApiKey: null },
      }),
    },
  })
  t.mock.module("../src/lib/ai/providers", {
    namedExports: {
      streamWithProviderFallback: async (
        _req: unknown,
        _settings: unknown,
        onChunk: (c: string) => void,
      ) => {
        onChunk("Halo ")
        onChunk("Dunia")
        return { providerUsed: "openai", fallbackUsed: false }
      },
    },
  })
  t.mock.module("../src/lib/ai/prompts", {
    namedExports: {
      createAiTranslateContentPrompt: () => "mocked-translate-prompt",
    },
  })
  t.mock.module("../src/lib/prisma", { namedExports: { prisma: {} } })

  const { POST: postTranslate } = await import("../src/app/api/ai/translate/route")
  const req = jsonPost("http://localhost/api/ai/translate", {
    content: "Hello World",
    targetLocale: "id",
    sourceLocale: "en",
  })

  const res = await postTranslate(req)
  const body = await res.json()

  assert.equal(res.status, 200)
  assert.equal(body.translatedContent, "Halo Dunia")
  assert.equal(body.targetLocale, "id")
  assert.equal(body.detectedLocale, "en")
})

test("POST /api/ai/translate strips markdown code-block wrapper from AI output", async (t) => {
  t.mock.module("../src/auth", {
    namedExports: { auth: async () => authedSession },
  })
  t.mock.module("../src/lib/rate-limiter", {
    namedExports: {
      rateLimit: allowedRateLimit,
      rateLimitHeaders: () => ({}),
      getClientIdentity: () => "127.0.0.1",
      RATE_LIMIT_TIERS: { strict: { windowMs: 60_000, maxRequests: 8 } },
    },
  })
  t.mock.module("../src/lib/ai/settings", {
    namedExports: { getAISettings: async () => ({}) },
  })
  t.mock.module("../src/lib/ai/providers", {
    namedExports: {
      streamWithProviderFallback: async (
        _req: unknown,
        _settings: unknown,
        onChunk: (c: string) => void,
      ) => {
        // Simulate AI wrapping output in markdown code block
        onChunk("```\nKonten terjemahan\n```")
        return { providerUsed: "openai", fallbackUsed: false }
      },
    },
  })
  t.mock.module("../src/lib/ai/prompts", {
    namedExports: { createAiTranslateContentPrompt: () => "mock-prompt" },
  })
  t.mock.module("../src/lib/prisma", { namedExports: { prisma: {} } })

  const { POST: postTranslate } = await import("../src/app/api/ai/translate/route")
  const req = jsonPost("http://localhost/api/ai/translate", {
    content: "Some content",
    targetLocale: "id",
    sourceLocale: "en",
  })

  const res = await postTranslate(req)
  const body = await res.json()

  assert.equal(res.status, 200)
  // Route strips ``` wrappers via regex replace
  assert.ok(!body.translatedContent.includes("```"), "Code block markers should be stripped")
  assert.ok(body.translatedContent.includes("Konten terjemahan"))
})
