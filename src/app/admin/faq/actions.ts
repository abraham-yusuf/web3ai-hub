"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"

function getString(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

function toSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export async function getFaqEntriesAction(language?: string, category?: string) {
  return prisma.faq.findMany({
    where: {
      ...(language && language !== "all" ? { language } : {}),
      ...(category && category !== "all" ? { category } : {}),
    },
    orderBy: [{ category: "asc" }, { order: "asc" }],
  })
}

export async function getFaqByIdAction(id: string) {
  return prisma.faq.findUnique({ where: { id } })
}

export async function createFaqEntryAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const question = getString(formData, "question")
  const answer = getString(formData, "answer")
  const category = getString(formData, "category")
  const language = getString(formData, "language") || "id"
  const orderStr = getString(formData, "order")
  const isPublished = formData.get("isPublished") === "on"

  if (!question || !answer) throw new Error("Question and answer are required")

  const slug = toSlug(question).slice(0, 80)
  if (!slug) throw new Error("Invalid slug from question")

  const order = parseInt(orderStr, 10) || 0

  const existing = await prisma.faq.findUnique({ where: { slug }, select: { id: true } })
  if (existing) throw new Error("Slug sudah digunakan. Gunakan question lain.")

  await prisma.faq.create({
    data: {
      question,
      answer,
      slug,
      category: category || null,
      language,
      order,
      isPublished,
    },
  })

  revalidatePath("/faq")
  revalidatePath("/admin/faq")
  redirect("/admin/faq")
}

export async function updateFaqEntryAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const id = getString(formData, "id")
  const question = getString(formData, "question")
  const answer = getString(formData, "answer")
  const category = getString(formData, "category")
  const language = getString(formData, "language") || "id"
  const orderStr = getString(formData, "order")
  const isPublished = formData.get("isPublished") === "on"

  if (!question || !answer) throw new Error("Question and answer are required")

  const existing = await prisma.faq.findUnique({ where: { id } })
  if (!existing) throw new Error("Entry not found")

  const slug = toSlug(question).slice(0, 80)
  const order = parseInt(orderStr, 10) || 0

  const duplicate = await prisma.faq.findFirst({
    where: { slug, NOT: { id } },
    select: { id: true },
  })
  if (duplicate) throw new Error("Slug sudah digunakan. Gunakan question lain.")

  await prisma.faq.update({
    where: { id },
    data: {
      question,
      answer,
      slug,
      category: category || null,
      language,
      order,
      isPublished,
    },
  })

  revalidatePath("/faq")
  revalidatePath("/admin/faq")
  redirect("/admin/faq")
}

export async function deleteFaqEntryAction(formData: FormData) {
  const id = getString(formData, "id")
  await prisma.faq.delete({ where: { id } })
  revalidatePath("/faq")
  revalidatePath("/admin/faq")
}

export async function updateFaqOrderAction(id: string, newOrder: number) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.faq.update({
    where: { id },
    data: { order: newOrder },
  })
  revalidatePath("/admin/faq")
}

export async function importFaqFromTopicAction(topic: string, category: string, count: number, language: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
    throw new Error("Unauthorized")
  }

  const langCode = language === "en" ? "en" : "id"
  const langLabel = language === "en" ? "English" : "Indonesian"

  const prompt = [
    `Kamu adalah content editor untuk platform AI3 yang membuat FAQ.`,
    `Gunakan bahasa: ${langLabel}.`,
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

  const { default: OpenAI } = await import("openai")
  const { env } = await import("@/lib/env")

  if (!env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY belum dikonfigurasi")

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
  if (!arrayMatch) throw new Error("Could not parse FAQ response")

  let entries: Array<{ question: string; answer: string }>
  try {
    entries = JSON.parse(arrayMatch[0])
  } catch {
    throw new Error("Invalid JSON in FAQ response")
  }

  const savedEntries = await Promise.all(
    entries.map(async (entry) => {
      const slug = toSlug(entry.question).slice(0, 80) || `faq-${Date.now()}`
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
      return result
    })
  )

  revalidatePath("/faq")
  revalidatePath("/admin/faq")

  return { saved: savedEntries.length }
}