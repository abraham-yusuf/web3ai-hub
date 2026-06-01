import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const inputSchema = z.object({
  pageSlug: z.string().min(1),
  cards: z.array(z.object({ front: z.string(), back: z.string() })),
})

// GET: list flashcards for a page
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pageSlug = searchParams.get("pageSlug")

  if (!pageSlug) {
    return NextResponse.json({ error: "pageSlug required" }, { status: 400 })
  }

  const flashcards = await prisma.flashcard.findMany({
    where: { pageSlug },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(flashcards)
}

// POST: save flashcards
export async function POST(request: Request) {
  const payload = await request.json().catch(() => null)
  const parsed = inputSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const { pageSlug, cards } = parsed.data

  // Delete existing flashcards for this page, then insert new ones
  await prisma.flashcard.deleteMany({ where: { pageSlug } })

  if (cards.length > 0) {
    await prisma.flashcard.createMany({
      data: cards.map((card) => ({ ...card, pageSlug })),
    })
  }

  const flashcards = await prisma.flashcard.findMany({
    where: { pageSlug },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(flashcards)
}

// DELETE: remove all flashcards for a page
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const pageSlug = searchParams.get("pageSlug")

  if (!pageSlug) {
    return NextResponse.json({ error: "pageSlug required" }, { status: 400 })
  }

  await prisma.flashcard.deleteMany({ where: { pageSlug } })
  return NextResponse.json({ success: true })
}