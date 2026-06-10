import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getAISettings } from "@/lib/ai/settings"
import { streamWithProviderFallback } from "@/lib/ai/providers"
import { rateLimit, RATE_LIMIT_TIERS, rateLimitHeaders, getClientIdentity } from "@/lib/rate-limiter"
import { createAiTranslateContentPrompt } from "@/lib/ai/prompts"

const translateSchema = z.object({
  content: z.string().min(1),
  targetLocale: z.enum(["id", "en"]),
  sourceLocale: z.enum(["id", "en"]).optional(),
})

export const runtime = "nodejs"

/**
 * Detect language from content (simple heuristic)
 */
function detectLanguage(text: string): "id" | "en" {
  const idChars = /[aiueoAIUEO]/gi
  const idWords = /\b(dan|yang|di|ke|dari|untuk|dengan|tidak|ini|itu|adalah|pada|dalam|telah|akan|saya|kamu|nya)\b/gi
  const enWords = /\b(the|and|is|in|to|of|a|for|on|that|this|with|are|from|by|be|or|as|at|it|has|have|was|were)\b/gi

  const idMatch = text.match(idWords)
  const enMatch = text.match(enWords)

  return (enMatch?.length ?? 0) > (idMatch?.length ?? 0) ? "en" : "id"
}

/**
 * Extract JSON array from AI response (handles markdown code blocks)
 */
function extractJSONArray(raw: string): string | null {
  const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) return codeBlockMatch[1].trim()

  const arrayMatch = raw.match(/\[[\s\S]*\]/)
  return arrayMatch ? arrayMatch[0] : null
}

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const identity = session.user.email || getClientIdentity(req)
    const limiter = rateLimit(identity, RATE_LIMIT_TIERS.strict, "translate")
    if (!limiter.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", resetAt: limiter.resetAt },
        { status: 429, headers: rateLimitHeaders(limiter) },
      )
    }

    // 2. Parse body
    const body = await req.json()
    const parsed = translateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { content, targetLocale, sourceLocale } = parsed.data

    // 3. Detect source locale if not provided
    const detectedLocale = sourceLocale ?? detectLanguage(content)

    // 4. Build prompt
    const prompt = createAiTranslateContentPrompt(content, targetLocale, detectedLocale)
    const settings = await getAISettings()

    // 5. Generate translation via AI with streaming
    let translatedContent = ""
    await streamWithProviderFallback(
      {
        provider: "openai",
        prompt,
        temperature: 0.3,
      },
      settings,
      (chunk) => {
        translatedContent += chunk
      },
    )

    // 6. Clean up any markdown code block wrapper if present
    translatedContent = translatedContent.replace(/```(?:json)?|```/g, "").trim()

    return NextResponse.json(
      {
        translatedContent,
        detectedLocale,
        targetLocale,
      },
      { headers: rateLimitHeaders(limiter) },
    )
  } catch (error) {
    console.error("[AI_TRANSLATE_ERROR]", error)
    const message = error instanceof Error ? error.message : "Translation failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}