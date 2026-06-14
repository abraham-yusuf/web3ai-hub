import assert from "node:assert/strict"
import test from "node:test"
import { AI_PROVIDERS, AI_WRITER_ACTIONS, type AIProvider, type AISettings } from "../src/lib/ai/types"

// ââ Helpers ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

function makeSettings(
  enabledProviders: AIProvider[] = [],
  modelOverride?: string,
): AISettings {
  return AI_PROVIDERS.reduce(
    (acc, p) => {
      acc[p] = {
        enabled: enabledProviders.includes(p),
        model:
          modelOverride ??
          (p === "openai"
            ? "gpt-4o-mini"
            : p === "anthropic"
              ? "claude-3-5-haiku-latest"
              : "test-model"),
        temperature: 0.7,
        encryptedApiKey: null,
      }
      return acc
    },
    {} as AISettings,
  )
}

// ââ AI_PROVIDERS constant ââââââââââââââââââââââââââââââââââââââââââââââââââââ

test("AI_PROVIDERS lists exactly five providers in declaration order", () => {
  assert.deepEqual([...AI_PROVIDERS], ["openai", "anthropic", "google", "groq", "nvidia"])
})

test("AI_PROVIDERS length matches the five known integration targets", () => {
  assert.equal(AI_PROVIDERS.length, 5)
})

// ââ AI_WRITER_ACTIONS constant âââââââââââââââââââââââââââââââââââââââââââââââ

test("AI_WRITER_ACTIONS covers all seven expected action types", () => {
  const expected = [
    "generate",
    "summarize",
    "seo-optimize",
    "title",
    "tags",
    "excerpt",
    "regenerate-section",
  ] as const
  assert.deepEqual([...AI_WRITER_ACTIONS], [...expected])
})

test("AI_WRITER_ACTIONS includes generate and seo-optimize", () => {
  assert.ok(AI_WRITER_ACTIONS.includes("generate"))
  assert.ok(AI_WRITER_ACTIONS.includes("seo-optimize"))
})

// ââ getDefaultModel ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

test("getDefaultModel returns the correct default model slug for each provider", async (t) => {
  // Stub the modules that settings.ts loads at module-evaluation time
  t.mock.module("../src/lib/prisma", { namedExports: { prisma: {} } })
  t.mock.module("../src/lib/env", {
    namedExports: {
      env: {
        OPENAI_API_KEY: undefined,
        ANTHROPIC_API_KEY: undefined,
        GOOGLE_AI_API_KEY: undefined,
        GROQ_API_KEY: undefined,
      },
    },
  })
  t.mock.module("../src/lib/ai/encryption", {
    namedExports: { decryptSecret: async (s: string) => s },
  })

  const { getDefaultModel } = await import("../src/lib/ai/settings")

  const expected: Record<AIProvider, string> = {
    openai: "gpt-4o-mini",
    anthropic: "claude-3-5-haiku-latest",
    google: "gemini-1.5-flash",
    groq: "llama-3.3-70b-versatile",
    nvidia: "nvidia/llama-3.1-405b-instruct",
  }

  for (const provider of AI_PROVIDERS) {
    assert.equal(
      getDefaultModel(provider),
      expected[provider],
      `Default model for provider "${provider}"`,
    )
  }
})

// ââ streamWithProviderFallback â all providers disabled ââââââââââââââââââââââ

test("streamWithProviderFallback throws with Indonesian error when all providers have no key", async (t) => {
  t.mock.module("../src/lib/ai/settings", {
    namedExports: {
      resolveProviderApiKey: async () => null,
      getDefaultModel: () => "gpt-4o-mini",
    },
  })
  // Minimal stubs so static SDK imports in providers.ts do not throw
  t.mock.module("openai", { defaultExport: class NullOpenAI {} })
  t.mock.module("@anthropic-ai/sdk", { defaultExport: class NullAnthropic {} })
  t.mock.module("@google/generative-ai", {
    namedExports: { GoogleGenerativeAI: class NullGoogle {} },
  })

  const { streamWithProviderFallback } = await import("../src/lib/ai/providers")
  const settings = makeSettings() // none enabled

  await assert.rejects(
    () => streamWithProviderFallback({ provider: "openai", prompt: "test" }, settings, () => {}),
    (err: Error) => {
      assert.ok(err instanceof Error)
      assert.match(err.message, /Semua provider gagal/)
      return true
    },
  )
})

test("streamWithProviderFallback error message includes per-provider failure entries", async (t) => {
  t.mock.module("../src/lib/ai/settings", {
    namedExports: {
      resolveProviderApiKey: async () => null,
      getDefaultModel: () => "test-model",
    },
  })
  t.mock.module("openai", { defaultExport: class NullOpenAI {} })
  t.mock.module("@anthropic-ai/sdk", { defaultExport: class NullAnthropic {} })
  t.mock.module("@google/generative-ai", {
    namedExports: { GoogleGenerativeAI: class NullGoogle {} },
  })

  const { streamWithProviderFallback } = await import("../src/lib/ai/providers")
  const settings = makeSettings()

  let thrown: Error | null = null
  try {
    await streamWithProviderFallback({ provider: "groq", prompt: "fail" }, settings, () => {})
  } catch (err) {
    thrown = err as Error
  }

  assert.ok(thrown, "Expected an error to be thrown")
  // The error should mention at least one provider slug
  assert.ok(
    AI_PROVIDERS.some((p) => thrown!.message.includes(p)),
    `Error message should reference a provider: "${thrown!.message}"`,
  )
})

// ââ streamWithProviderFallback â OpenAI success ââââââââââââââââââââââââââââââ

test("streamWithProviderFallback streams OpenAI chunks and returns correct metadata", async (t) => {
  t.mock.module("../src/lib/ai/settings", {
    namedExports: {
      resolveProviderApiKey: async () => "sk-test-key",
      getDefaultModel: () => "gpt-4o-mini",
    },
  })

  const fakeStream = async function* () {
    yield { choices: [{ delta: { content: "He" } }] }
    yield { choices: [{ delta: { content: "llo" } }] }
    yield { choices: [{ delta: {} }] } // empty delta â should be skipped
  }

  t.mock.module("openai", {
    defaultExport: class FakeOpenAI {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      constructor(_opts: unknown) {}
      chat = {
        completions: {
          create: async () => ({ [Symbol.asyncIterator]: fakeStream }),
        },
      }
    },
  })
  t.mock.module("@anthropic-ai/sdk", { defaultExport: class NullAnthropic {} })
  t.mock.module("@google/generative-ai", {
    namedExports: { GoogleGenerativeAI: class NullGoogle {} },
  })

  const { streamWithProviderFallback } = await import("../src/lib/ai/providers")
  const chunks: string[] = []
  const settings = makeSettings(["openai"])

  const result = await streamWithProviderFallback(
    { provider: "openai", prompt: "Say hello", temperature: 0.5 },
    settings,
    (c) => chunks.push(c),
  )

  assert.equal(result.providerUsed, "openai")
  assert.equal(result.fallbackUsed, false)
  assert.deepEqual(chunks, ["He", "llo"])
})

// ââ streamWithProviderFallback â Anthropic fallback ââââââââââââââââââââââââââ

test("streamWithProviderFallback falls back to anthropic when openai key is absent", async (t) => {
  t.mock.module("../src/lib/ai/settings", {
    namedExports: {
      resolveProviderApiKey: async (provider: AIProvider) =>
        provider === "anthropic" ? "ant-test-key" : null,
      getDefaultModel: () => "claude-3-5-haiku-latest",
    },
  })

  const fakeAnthropicStream = async function* () {
    yield { type: "content_block_delta", delta: { type: "text_delta", text: "Fallback" } }
    yield { type: "content_block_delta", delta: { type: "text_delta", text: "!" } }
    yield { type: "message_stop" } // non-delta event â should be ignored
  }

  t.mock.module("@anthropic-ai/sdk", {
    defaultExport: class FakeAnthropic {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      constructor(_opts: unknown) {}
      messages = {
        stream: () => ({ [Symbol.asyncIterator]: fakeAnthropicStream }),
      }
    },
  })
  t.mock.module("openai", { defaultExport: class NullOpenAI {} })
  t.mock.module("@google/generative-ai", {
    namedExports: { GoogleGenerativeAI: class NullGoogle {} },
  })

  const { streamWithProviderFallback } = await import("../src/lib/ai/providers")
  const chunks: string[] = []
  // openai disabled â will fail; anthropic enabled â fallback succeeds
  const settings = makeSettings(["anthropic"])

  const result = await streamWithProviderFallback(
    { provider: "openai", prompt: "test fallback" },
    settings,
    (c) => chunks.push(c),
  )

  assert.equal(result.providerUsed, "anthropic")
  assert.equal(result.fallbackUsed, true)
  assert.deepEqual(chunks, ["Fallback", "!"])
})

test("streamWithProviderFallback reports fallbackUsed=false when primary succeeds", async (t) => {
  t.mock.module("../src/lib/ai/settings", {
    namedExports: {
      resolveProviderApiKey: async () => "sk-any-key",
      getDefaultModel: () => "gpt-4o-mini",
    },
  })
  t.mock.module("openai", {
    defaultExport: class FakeOpenAI {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      constructor(_opts: unknown) {}
      chat = {
        completions: {
          create: async () => ({
            [Symbol.asyncIterator]: async function* () {
              yield { choices: [{ delta: { content: "ok" } }] }
            },
          }),
        },
      }
    },
  })
  t.mock.module("@anthropic-ai/sdk", { defaultExport: class NullAnthropic {} })
  t.mock.module("@google/generative-ai", {
    namedExports: { GoogleGenerativeAI: class NullGoogle {} },
  })

  const { streamWithProviderFallback } = await import("../src/lib/ai/providers")
  const settings = makeSettings(["openai"])

  const result = await streamWithProviderFallback(
    { provider: "openai", prompt: "ping" },
    settings,
    () => {},
  )

  assert.equal(result.fallbackUsed, false)
})
