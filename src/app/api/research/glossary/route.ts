import { NextResponse } from "next/server"
import OpenAI from "openai"
import { z } from "zod"
import { env } from "@/lib/env"
import { createGlossaryGeneratorPrompt } from "@/lib/ai/prompts"
import { prisma } from "@/lib/prisma"

const inputSchema = z.object({
  topic: z.string(),
  sector: z.string().default(""),
  count: z.number().min(1).max(50).default(15),
  language: z.string().default("Indonesian"),
})

export const runtime = "nodejs"

function generateSlug(term: string): string {
  return term
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null)
  const parsed = inputSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  if (!env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY belum dikonfigurasi" }, { status: 503 })
  }

  const { topic, sector, count, language } = parsed.data

  const prompt = createGlossaryGeneratorPrompt(topic, sector, count, language)

  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    stream: false,
  })

  const rawContent = completion.choices[0]?.message?.content ?? "[]"

  // Extract JSON from markdown code block if present
  let jsonStr = rawContent
  const codeBlockMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1]
  }

  // Try to find JSON array in the content
  const arrayMatch = jsonStr.match(/\[[\s\S]*\]/)
  if (!arrayMatch) {
    return NextResponse.json({ error: "Could not parse glossary response" }, { status: 500 })
  }

  let entries: Array<{ term: string; definition: string; example?: string }>
  try {
    entries = JSON.parse(arrayMatch[0])
  } catch {
    return NextResponse.json({ error: "Invalid JSON in glossary response" }, { status: 500 })
  }

  // Map language string to code
  const langCode = language === "English" ? "en" : "id"

  // Bulk upsert entries
  const savedEntries = await Promise.all(
    entries.map(async (entry) => {
      const slug = generateSlug(entry.term)
      const result = await prisma.glossaryEntry.upsert({
        where: { slug },
        update: {
          term: entry.term,
          definition: entry.definition,
          example: entry.example ?? null,
          language: langCode,
        },
        create: {
          term: entry.term,
          slug,
          definition: entry.definition,
          example: entry.example ?? null,
          language: langCode,
          tags: [],
          isPublished: false,
        },
      })
      return {
        term: result.term,
        slug: result.slug,
        definition: result.definition,
      }
    })
  )

  return NextResponse.json({
    saved: savedEntries.length,
    entries: savedEntries,
  })
}