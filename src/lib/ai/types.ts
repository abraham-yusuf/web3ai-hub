export const AI_PROVIDERS = ["openai", "anthropic", "google", "groq"] as const

export type AIProvider = (typeof AI_PROVIDERS)[number]

export type WriterTone = "professional" | "casual" | "educational" | "technical"

export type ProviderRuntimeConfig = {
  enabled: boolean
  model: string
  temperature: number
  encryptedApiKey: string | null
}

export type AISettings = Record<AIProvider, ProviderRuntimeConfig>

export type AIWriterRequest = {
  topic: string
  language: string
  tone: WriterTone
  length: "short" | "medium" | "long"
  template: "tutorial" | "opinion" | "news" | "tool-review" | "airdrop-guide"
  provider: AIProvider
  model?: string
}
