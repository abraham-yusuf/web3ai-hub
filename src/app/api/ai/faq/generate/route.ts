import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getAISettings } from "@/lib/ai/settings"
import { streamWithProviderFallback } from "@/lib/ai/providers"
import { rateLimit, RATE_LIMIT_TIERS, rateLimitHeaders, getClientIdentity } from "@/lib/rate-limiter"
import { createFaqGeneratorPrompt } from "@/lib/ai/prompts"

const faqGenerateSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  count: z.number().min(1).max(20).optional().default(5),
  language: z.enum(["id", "en"]).optional().default("id"),
})

export const runtime = "nodejs"

interface FaqItem {
  question: string
  answer: string
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
    const limiter = rateLimit(identity, RATE_LIMIT_TIERS.strict, "faq-gen")
    if (!limiter.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", resetAt: limiter.resetAt },
        { status: 429, headers: rateLimitHeaders(limiter) },
      )
    }

    // 2. Parse body
    const body = await req.json()
    const parsed = faqGenerateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { topic, count, language } = parsed.data

    // 3. Build prompt
    const prompt = createFaqGeneratorPrompt(topic, count, language)
    const settings = await getAISettings()

    // 4. Generate FAQ items via AI
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
      return NextResponse.json({ error: "Could not parse FAQ response from AI" }, { status: 500 })
    }

    let faqItems: FaqItem[]
    try {
      faqItems = JSON.parse(jsonStr)
    } catch {
      return NextResponse.json({ error: "Invalid JSON in FAQ response" }, { status: 500 })
    }

    // 6. Save to database (upsert to handle duplicates gracefully)
    const savedFaqs = await Promise.all(
      faqItems.map(async (item) => {
        const baseSlug = generateSlug(item.question) || `faq-${Date.now()}`
        const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`

        const result = await prisma.faq.upsert({
          where: { slug },
          update: {
            question: item.question,
            answer: item.answer,
            category: item.category || null,
            language,
            isPublished: false,
          },
          create: {
            question: item.question,
            answer: item.answer,
            slug,
            category: item.category || null,
            language,
            isPublished: false,
            order: 0,
          },
        })

        return {
          question: result.question,
          answer: result.answer,
          category: result.category,
        }
      }),
    )

    return NextResponse.json(
      {
        faqs: savedFaqs,
        count: savedFaqs.length,
      },
      { headers: rateLimitHeaders(limiter) },
    )
  } catch (error) {
    console.error("[AI_FAQ_GENERATE_ERROR]", error)
    const message = error instanceof Error ? error.message : "FAQ generation failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}