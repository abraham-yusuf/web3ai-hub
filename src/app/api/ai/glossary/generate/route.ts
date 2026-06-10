import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getAISettings } from "@/lib/ai/settings"
import { streamWithProviderFallback } from "@/lib/ai/providers"
import { rateLimit, RATE_LIMIT_TIERS, rateLimitHeaders, getClientIdentity } from "@/lib/rate-limiter"
import { createGlossaryTermExtractPrompt } from "@/lib/ai/prompts"

const glossaryGenerateSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  count: z.number().min(1).max(50).optional().default(10),
  language: z.enum(["id", "en"]).optional().default("id"),
})

export const runtime = "nodejs"

interface GlossaryItem {
  term: string
  definition: string
  category: string
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

function getLetter(term: string): string {
  const firstChar = term.trim()[0]?.toUpperCase() ?? "#"
  return /[A-Z]/.test(firstChar) ? firstChar : "#"
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
    const limiter = rateLimit(identity, RATE_LIMIT_TIERS.strict, "glossary-gen")
    if (!limiter.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", resetAt: limiter.resetAt },
        { status: 429, headers: rateLimitHeaders(limiter) },
      )
    }

    // 2. Parse body
    const body = await req.json()
    const parsed = glossaryGenerateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { topic, count, language } = parsed.data

    // 3. Build prompt
    const prompt = createGlossaryTermExtractPrompt(topic, count, language)
    const settings = await getAISettings()

    // 4. Generate glossary terms via AI
    let rawResponse = ""
    await streamWithProviderFallback(
      {
        provider: "openai",
        prompt,
        temperature: 0.7,
      },
      settings,
      (chunk) => {
        rawResponse += chunk
      },
    )

    // 5. Parse JSON response
    const jsonStr = extractJSONArray(rawResponse)
    if (!jsonStr) {
      return NextResponse.json({ error: "Could not parse glossary response from AI" }, { status: 500 })
    }

    let glossaryItems: GlossaryItem[]
    try {
      glossaryItems = JSON.parse(jsonStr)
    } catch {
      return NextResponse.json({ error: "Invalid JSON in glossary response" }, { status: 500 })
    }

    // 6. Save to database (upsert to handle duplicates gracefully)
    const savedEntries = await Promise.all(
      glossaryItems.map(async (item) => {
        const baseSlug = generateSlug(item.term) || `glossary-${Date.now()}`
        const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`
        const letter = getLetter(item.term)

        const result = await prisma.glossaryEntry.upsert({
          where: { slug },
          update: {
            term: item.term,
            definition: item.definition,
            category: item.category || null,
            language,
            isPublished: false,
          },
          create: {
            term: item.term,
            slug,
            definition: item.definition,
            category: item.category || null,
            language,
            tags: [],
            isPublished: false,
          },
        })

        return {
          term: result.term,
          definition: result.definition,
          category: result.category,
          letter,
        }
      }),
    )

    return NextResponse.json(
      {
        entries: savedEntries,
        count: savedEntries.length,
      },
      { headers: rateLimitHeaders(limiter) },
    )
  } catch (error) {
    console.error("[AI_GLOSSARY_GENERATE_ERROR]", error)
    const message = error instanceof Error ? error.message : "Glossary generation failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}