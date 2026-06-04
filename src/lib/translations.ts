import OpenAI from "openai"
import { getAISettings, resolveProviderApiKey } from "@/lib/ai/settings"

type Language = "id" | "en"

const LANGUAGE_LABELS: Record<Language, string> = {
  id: "Bahasa Indonesia",
  en: "English",
}

function buildTranslationPrompt(text: string, from: Language, to: Language): string {
  const fromLang = LANGUAGE_LABELS[from]
  const toLang = LANGUAGE_LABELS[to]
  return `Translate the following text from ${fromLang} to ${toLang}. Preserve markdown formatting, code blocks, and links. Only return the translation, no explanations.\n\n${text}`
}

export async function translateText(
  text: string,
  from: Language,
  to: Language,
): Promise<string> {
  const settings = await getAISettings()
  const apiKey = await resolveProviderApiKey("openai", settings)

  if (!apiKey) {
    throw new Error("OpenAI API key not configured")
  }

  const client = new OpenAI({ apiKey })
  const model = settings.openai.model || "gpt-4o-mini"
  const temperature = settings.openai.temperature ?? 0.3

  const prompt = buildTranslationPrompt(text, from, to)

  const response = await client.chat.completions.create({
    model,
    temperature,
    messages: [{ role: "user", content: prompt }],
  })

  const translated = response.choices[0]?.message?.content
  if (!translated) {
    throw new Error("Translation returned empty response")
  }

  return translated
}