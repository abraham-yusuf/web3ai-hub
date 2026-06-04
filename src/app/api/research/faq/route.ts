import { NextResponse } from "next/server"
import OpenAI from "openai"
import { z } from "zod"
import { env } from "@/lib/env"
import { prisma } from "@/lib/prisma"

const inputSchema = z.object({
  topic: z.string(),
  category: z.string().default(""),
  count: z.number().min(1).max(20).default(5),
  language: z.string().default("Indonesian"),
})

export const runtime = "nodejs"

function toSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
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

  const { topic, category, count, language } = parsed.data

  const prompt = [
    `Kamu adalah content editor untuk platform AI3 yang membuat FAQ.`,
    `Gunakan bahasa: ${language}.`,
    "",
    `Buat ${count} FAQ (Question & Answer) tentang topik: ${topic}`,
    category ? `Kategori: ${category}` : "",
    "",
    "Setiap FAQ harus dalam format JSON:",
    "[",
    '  { "question": "...", "answer": "..." },',
    "  ...",
    "]",
    "",
    "Question harus jelas dan spesifik (bukan judul topik).",
    "Answer harus komprehensif tapi ringkas (40-80 kata).",
    "Urutan: dari yang paling fundamental → advanced.",
  ].join("\n")

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

  const arrayMatch = jsonStr.match(/\[[\s\S]*\]/)
  if (!arrayMatch) {
    return NextResponse.json({ error: "Could not parse FAQ response" }, { status: 500 })
  }

  let entries: Array<{ question: string; answer: string }>
  try {
    entries = JSON.parse(arrayMatch[0])
  } catch {
    return NextResponse.json({ error: "Invalid JSON in FAQ response" }, { status: 500 })
  }

  const langCode = language === "English" ? "en" : "id"

  // Bulk upsert entries
  const savedEntries = await Promise.all(
    entries.map(async (entry) => {
      const slug = (toSlug(entry.question).slice(0, 80) || `faq-${Date.now()}`)
      const result = await prisma.faq.upsert({
        where: { slug },
        update: {
          question: entry.question,
          answer: entry.answer,
          language: langCode,
          category: category || null,
        },
        create: {
          question: entry.question,
          answer: entry.answer,
          slug,
          category: category || null,
          language: langCode,
          isPublished: false,
          order: 0,
        },
      })
      return {
        question: result.question,
        slug: result.slug,
      }
    })
  )

  return NextResponse.json({
    saved: savedEntries.length,
    entries: savedEntries,
  })
}