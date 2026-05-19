export const AI_PROVIDERS = ["openai", "anthropic", "google", "groq", "nvidia"] as const

export type AIProvider = (typeof AI_PROVIDERS)[number]

export const AI_WRITER_ACTIONS = [
  "generate",
  "summarize",
  "seo-optimize",
  "title",
  "tags",
  "excerpt",
  "regenerate-section",
] as const

export type AIWriterAction = (typeof AI_WRITER_ACTIONS)[number]

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

export type AIStreamRequest = {
  provider: AIProvider
  model?: string
  prompt: string
  temperature?: number
}
