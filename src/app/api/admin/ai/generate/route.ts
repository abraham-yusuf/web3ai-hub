import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { checkAIRateLimit } from "@/lib/ai/rate-limit"
import { getAISettings } from "@/lib/ai/settings"
import { streamWithProviderFallback } from "@/lib/ai/providers"
import { AI_PROVIDERS } from "@/lib/ai/types"

export const runtime = "nodejs"

const inputSchema = z.object({
  topic: z.string().min(4),
  language: z.string().min(2),
  tone: z.enum(["professional", "casual", "educational", "technical"]),
  length: z.enum(["short", "medium", "long"]),
  template: z.enum(["tutorial", "opinion", "news", "tool-review", "airdrop-guide"]),
  provider: z.enum(AI_PROVIDERS),
  model: z.string().optional(),
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

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const startedAt = Date.now()
      try {
        const result = await streamWithProviderFallback(parsed.data, settings, (chunk) => {
          controller.enqueue(encoder.encode(chunk))
        })

        const duration = Date.now() - startedAt
        console.info("[ai-writer] generated", {
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
