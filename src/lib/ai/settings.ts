import { prisma } from "@/lib/prisma"
import { env } from "@/lib/env"
import { decryptSecret } from "@/lib/ai/encryption"
import { AI_PROVIDERS, type AIProvider, type AISettings } from "@/lib/ai/types"

type PartialProviderConfig = Partial<{
  enabled: boolean
  model: string
  temperature: number
  encryptedApiKey: string | null
}>

type StoredAIProviders = Partial<Record<AIProvider, PartialProviderConfig>>

const defaultModels: Record<AIProvider, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-3-5-haiku-latest",
  google: "gemini-1.5-flash",
  groq: "llama-3.3-70b-versatile",
}

const envProviderKeys: Record<AIProvider, string | undefined> = {
  openai: env.OPENAI_API_KEY,
  anthropic: env.ANTHROPIC_API_KEY,
  google: env.GOOGLE_AI_API_KEY,
  groq: env.GROQ_API_KEY,
}

export async function getAISettings(): Promise<AISettings> {
  const record = await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: { id: "default", aiProviders: {} },
    update: {},
    select: { aiProviders: true },
  })

  const raw = (record.aiProviders ?? {}) as StoredAIProviders

  return AI_PROVIDERS.reduce((acc, provider) => {
    const providerConfig = raw[provider]
    const hasEnvKey = Boolean(envProviderKeys[provider])

    acc[provider] = {
      enabled: providerConfig?.enabled ?? hasEnvKey,
      model: providerConfig?.model ?? defaultModels[provider],
      temperature: providerConfig?.temperature ?? 0.7,
      encryptedApiKey: providerConfig?.encryptedApiKey ?? null,
    }

    return acc
  }, {} as AISettings)
}

export async function resolveProviderApiKey(
  provider: AIProvider,
  settings: AISettings,
): Promise<string | null> {
  const encrypted = settings[provider].encryptedApiKey

  if (encrypted) {
    return decryptSecret(encrypted)
  }

  return envProviderKeys[provider] ?? null
}

export function getDefaultModel(provider: AIProvider): string {
  return defaultModels[provider]
}
