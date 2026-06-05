import { NextResponse } from "next/server"
import OpenAI from "openai"
import { z } from "zod"
import { env } from "@/lib/env"
import { rateLimit, RATE_LIMIT_TIERS, rateLimitHeaders, getClientIdentity } from "@/lib/rate-limiter"
import {
  createQuizGenerationPrompt,
  createFlashcardGenerationPrompt,
  createLessonGenerationPrompt,
} from "@/lib/ai/prompts"
import { prisma } from "@/lib/prisma"

const inputSchema = z.object({
  pageTitle: z.string().min(1),
  content: z.string().min(20),
  count: z.number().int().min(1).max(20).default(5),
  language: z.string().default("Indonesian"),
  mode: z.enum(["quiz", "flashcard", "lesson"]).default("quiz"),
  trackTitle: z.string().optional(),
  level: z.string().optional(),
})

export const runtime = "nodejs"

export async function POST(request: Request) {
  const identity = getClientIdentity(request)
  const limiter = rateLimit(identity, RATE_LIMIT_TIERS.normal, "learn-chat")

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

  const { pageTitle, content, count, language, mode, trackTitle, level } = parsed.data

  let prompt: string
  switch (mode) {
    case "flashcard":
      prompt = createFlashcardGenerationPrompt(pageTitle, content, count, language)
      break
    case "lesson":
      prompt = createLessonGenerationPrompt(
        pageTitle,
        trackTitle ?? "General",
        level ?? "intermediate",
        language,
      )
      break
    default:
      prompt = createQuizGenerationPrompt(pageTitle, content, count, language)
  }

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
                "Kamu instruktur AI3. Selalu jawab dengan JSON yang valid sesuai format yang diminta. Jangan tambah teks di luar JSON.",
            },
            { role: "user", content: prompt },
          ],
        })

        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content
          if (content) controller.enqueue(encoder.encode(content))
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Gagal membuat kuis"
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

// GET: fetch existing quiz/flashcards for a page
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pageSlug = searchParams.get("pageSlug")
  const type = searchParams.get("type") // "quiz" | "flashcard"

  if (!pageSlug || !type) {
    return NextResponse.json({ error: "pageSlug and type required" }, { status: 400 })
  }

  if (type === "quiz") {
    const quiz = await prisma.quiz.findUnique({ where: { pageSlug } })
    return NextResponse.json(quiz)
  }

  const flashcards = await prisma.flashcard.findMany({
    where: { pageSlug },
    orderBy: { createdAt: "asc" },
  })
  return NextResponse.json(flashcards)
}

// POST: save quiz results
export async function PUT(request: Request) {
  const payload = await request.json().catch(() => null)
  const { pageSlug, title, questions } = payload ?? {}

  if (!pageSlug || !title || !questions) {
    return NextResponse.json({ error: "pageSlug, title, questions required" }, { status: 400 })
  }

  const quiz = await prisma.quiz.upsert({
    where: { pageSlug },
    update: { title, questions },
    create: { pageSlug, title, questions },
  })

  return NextResponse.json(quiz)
}

// DELETE: remove quiz/flashcards
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const pageSlug = searchParams.get("pageSlug")
  const type = searchParams.get("type")
  const id = searchParams.get("id")

  if (!pageSlug || !type) {
    return NextResponse.json({ error: "pageSlug and type required" }, { status: 400 })
  }

  if (type === "quiz") {
    await prisma.quiz.deleteMany({ where: { pageSlug } })
  } else if (id) {
    await prisma.flashcard.deleteMany({ where: { id, pageSlug } })
  } else {
    await prisma.flashcard.deleteMany({ where: { pageSlug } })
  }

  return NextResponse.json({ success: true })
}
