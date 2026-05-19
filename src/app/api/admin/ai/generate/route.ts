import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { checkAIRateLimit } from "@/lib/ai/rate-limit"
import { getAISettings } from "@/lib/ai/settings"
import {
  createExcerptPrompt,
  createSectionRewritePrompt,
  createSeoOptimizerPrompt,
  createSummaryPrompt,
  createTagsPrompt,
  createTitlePrompt,
  createWriterPrompt,
} from "@/lib/ai/prompts"
import { streamWithProviderFallback } from "@/lib/ai/providers"
import { AI_PROVIDERS, AI_WRITER_ACTIONS } from "@/lib/ai/types"

export const runtime = "nodejs"

const baseSchema = z.object({
  action: z.enum(AI_WRITER_ACTIONS),
  provider: z.enum(AI_PROVIDERS),
  model: z.string().optional(),
})

const generateSchema = baseSchema.extend({
  action: z.literal("generate"),
  topic: z.string().min(4),
  language: z.string().min(2),
  tone: z.enum(["professional", "casual", "educational", "technical"]),
  length: z.enum(["short", "medium", "long"]),
  template: z.enum(["tutorial", "opinion", "news", "tool-review", "airdrop-guide"]),
})

const contentSchema = baseSchema.extend({
  action: z.enum(["summarize", "seo-optimize", "title", "tags", "excerpt"]),
  content: z.string().min(20),
  language: z.string().min(2).optional(),
  topic: z.string().optional(),
})

const regenerateSchema = baseSchema.extend({
  action: z.literal("regenerate-section"),
  content: z.string().min(20),
  selection: z.string().min(10),
  instruction: z.string().optional(),
  language: z.string().min(2).optional(),
})

const inputSchema = z.discriminatedUnion("action", [generateSchema, contentSchema, regenerateSchema])

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const identity = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || session.user.email || "unknown"
  const limiter = checkAIRateLimit(identity)

  if (!limiter.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        resetAt: limiter.resetAt,
      },
      {
        status: 429,
        headers: {
          "x-ratelimit-remaining": String(limiter.remaining),
          "x-ratelimit-reset": String(limiter.resetAt),
        },
      },
    )
  }

  const payload = await request.json().catch(() => null)
  const parsed = inputSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 })
  }

  const settings = await getAISettings()
  let prompt = ""

  switch (parsed.data.action) {
    case "generate":
      prompt = createWriterPrompt(parsed.data)
      break
    case "summarize":
      prompt = createSummaryPrompt(parsed.data.content, parsed.data.language)
      break
    case "seo-optimize":
      prompt = createSeoOptimizerPrompt(parsed.data.content, parsed.data.language)
      break
    case "title":
      prompt = createTitlePrompt(parsed.data.content, parsed.data.language)
      break
    case "tags":
      prompt = createTagsPrompt(parsed.data.content, parsed.data.language)
      break
    case "excerpt":
      prompt = createExcerptPrompt(parsed.data.content, parsed.data.language)
      break
    case "regenerate-section":
      prompt = createSectionRewritePrompt(
        parsed.data.selection,
        parsed.data.content,
        parsed.data.instruction,
        parsed.data.language,
      )
      break
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const startedAt = Date.now()
      try {
         const result = await streamWithProviderFallback(
           {
             provider: parsed.data.provider,
             model: parsed.data.model,
             prompt,
           },
           settings,
           (chunk) => {
             controller.enqueue(encoder.encode(chunk))
           },
         )

         const duration = Date.now() - startedAt
         console.info("[ai-writer] generated", {
           action: parsed.data.action,
           providerRequested: parsed.data.provider,
           providerUsed: result.providerUsed,
           fallbackUsed: result.fallbackUsed,
          duration,
          model: parsed.data.model,
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
