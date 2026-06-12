import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { checkAIRateLimit } from "@/lib/ai/rate-limit"
import { getAISettings } from "@/lib/ai/settings"
import { createBlogContentPrompt, type BlogCategory } from "@/lib/ai/prompts"
import { streamWithProviderFallback } from "@/lib/ai/providers"

export const runtime = "nodejs"

const CATEGORIES: BlogCategory[] = ["web3-fundamentals", "ai-tutorials", "airdrop-guides", "opinion-news"]

const schema = z.object({
  category: z.enum(CATEGORIES as [BlogCategory, ...BlogCategory[]]),
  topic: z.string().min(4),
  language: z.string().min(2).default("id"),
  customPrompt: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const identity = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || session.user.email || "unknown"
  const limiter = checkAIRateLimit(identity)

  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded", resetAt: limiter.resetAt },
      { status: 429 }
    )
  }

  const payload = await request.json().catch(() => null)
  const parsed = schema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 })
  }

  const settings = await getAISettings()
  const prompt = createBlogContentPrompt(
    parsed.data.category,
    parsed.data.topic,
    parsed.data.language,
    parsed.data.customPrompt,
  )

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const startedAt = Date.now()
      try {
        const result = await streamWithProviderFallback(
          {
            provider: "openai",
            model: "gpt-4o-mini",
            prompt,
          },
          settings,
          (chunk) => {
            controller.enqueue(encoder.encode(chunk))
          },
        )

        const duration = Date.now() - startedAt
        console.info("[blog-generator] generated", {
          category: parsed.data.category,
          topic: parsed.data.topic,
          providerRequested: "openai",
          providerUsed: result.providerUsed,
          fallbackUsed: result.fallbackUsed,
          duration,
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to generate content"
        controller.enqueue(encoder.encode(`\n\n[ERROR] ${message}`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "x-ratelimit-remaining": String(limiter.remaining),
      "x-ratelimit-reset": String(limiter.resetAt),
    },
  })
}
