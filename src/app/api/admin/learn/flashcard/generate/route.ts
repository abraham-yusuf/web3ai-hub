import { NextResponse, type NextRequest } from "next/server"
import OpenAI from "openai"
import { z } from "zod"
import { env } from "@/lib/env"
import { createFlashcardGenerationPrompt } from "@/lib/ai/prompts"
import { rateLimit, RATE_LIMIT_TIERS, rateLimitHeaders, getClientIdentity } from "@/lib/rate-limiter"

const inputSchema = z.object({
  pageTitle: z.string().min(1),
  content: z.string().min(20),
  count: z.number().int().min(1).max(50).default(10),
  language: z.string().default("Indonesian"),
})

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const limiter = rateLimit(getClientIdentity(request), RATE_LIMIT_TIERS.strict, "flash-gen")

  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded", resetAt: limiter.resetAt },
      { status: 429, headers: rateLimitHeaders(limiter) },
    )
  }

  const payload = await request.json().catch(() => null)
  const parsed = inputSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  if (!env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY belum dikonfigurasi" }, { status: 503 })
  }

  const { pageTitle, content, count, language } = parsed.data
  const prompt = createFlashcardGenerationPrompt(pageTitle, content, count, language)

  const encoder = new TextEncoder()
  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY })

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const completion = await client.chat.completions.create({
          model: "gpt-4o-mini",
          stream: true,
          temperature: 0.4,
          messages: [
            {
              role: "system",
              content:
                "Kamu instruktur AI3. Selalu jawab dengan JSON array yang valid. Jangan tambah teks di luar JSON.",
            },
            { role: "user", content: prompt },
          ],
        })

        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content
          if (content) controller.enqueue(encoder.encode(content))
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Gagal membuat flashcard"
        controller.enqueue(encoder.encode(`Error: ${message}`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      ...rateLimitHeaders(limiter),
    },
  })
}