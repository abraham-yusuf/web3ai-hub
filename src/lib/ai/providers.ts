import Anthropic from "@anthropic-ai/sdk"
import { GoogleGenerativeAI } from "@google/generative-ai"
import OpenAI from "openai"
import { createWriterPrompt } from "@/lib/ai/prompts"
import { getDefaultModel, resolveProviderApiKey } from "@/lib/ai/settings"
import { AI_PROVIDERS, type AIProvider, type AISettings, type AIWriterRequest } from "@/lib/ai/types"

type StreamChunkHandler = (text: string) => void

function providerOrder(primary: AIProvider): AIProvider[] {
  return [primary, ...AI_PROVIDERS.filter((provider) => provider !== primary)]
}

async function streamOpenAI(
  apiKey: string,
  model: string,
  prompt: string,
  temperature: number,
  onChunk: StreamChunkHandler,
) {
  const client = new OpenAI({ apiKey })
  const stream = await client.chat.completions.create({
    model,
    stream: true,
    temperature,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  })

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content
    if (content) onChunk(content)
  }
}

async function streamAnthropic(
  apiKey: string,
  model: string,
  prompt: string,
  temperature: number,
  onChunk: StreamChunkHandler,
) {
  const client = new Anthropic({ apiKey })

  const stream = client.messages.stream({
    model,
    max_tokens: 3000,
    temperature,
    messages: [{ role: "user", content: prompt }],
  })

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      onChunk(event.delta.text)
    }
  }
}

async function streamGoogle(
  apiKey: string,
  model: string,
  prompt: string,
  _temperature: number,
  onChunk: StreamChunkHandler,
) {
  const client = new GoogleGenerativeAI(apiKey)
  const generated = await client.getGenerativeModel({ model }).generateContentStream(prompt)

  for await (const chunk of generated.stream) {
    const text = chunk.text()
    if (text) onChunk(text)
  }
}

async function streamGroq(
  apiKey: string,
  model: string,
  prompt: string,
  temperature: number,
  onChunk: StreamChunkHandler,
) {
  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  })

  const stream = await client.chat.completions.create({
    model,
    stream: true,
    temperature,
    messages: [{ role: "user", content: prompt }],
  })

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content
    if (content) onChunk(content)
  }
}

async function streamFromProvider(
  provider: AIProvider,
  request: AIWriterRequest,
  settings: AISettings,
  onChunk: StreamChunkHandler,
) {
  const apiKey = await resolveProviderApiKey(provider, settings)

  if (!apiKey || !settings[provider].enabled) {
    throw new Error(`Provider ${provider} tidak aktif atau API key belum di-set.`)
  }

  const model = request.model || settings[provider].model || getDefaultModel(provider)
  const prompt = createWriterPrompt(request)
  const temperature = settings[provider].temperature

  if (provider === "openai") {
    await streamOpenAI(apiKey, model, prompt, temperature, onChunk)
    return
  }

  if (provider === "anthropic") {
    await streamAnthropic(apiKey, model, prompt, temperature, onChunk)
    return
  }

  if (provider === "google") {
    await streamGoogle(apiKey, model, prompt, temperature, onChunk)
    return
  }

  await streamGroq(apiKey, model, prompt, temperature, onChunk)
}

export async function streamWithProviderFallback(
  request: AIWriterRequest,
  settings: AISettings,
  onChunk: StreamChunkHandler,
): Promise<{ providerUsed: AIProvider; fallbackUsed: boolean }> {
  const errors: string[] = []

  for (const provider of providerOrder(request.provider)) {
    try {
      await streamFromProvider(provider, request, settings, onChunk)
      return {
        providerUsed: provider,
        fallbackUsed: provider !== request.provider,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown provider error"
      errors.push(`${provider}: ${message}`)
    }
  }

  throw new Error(`Semua provider gagal. ${errors.join(" | ")}`)
}
