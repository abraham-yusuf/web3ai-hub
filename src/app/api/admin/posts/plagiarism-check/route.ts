import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { calculateSimilarity } from "@/lib/content-similarity"

export const runtime = "nodejs"

const schema = z.object({
  content: z.string().min(20),
  title: z.string().min(1),
  excludeSlug: z.string().optional(),
})

/** Strip markdown to plain text for excerpt extraction */
function stripMarkdown(text: string): string {
  return text
    .replace(/^---[sS]*?---/m, "")
    .replace(/#{1,6}s/g, "")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/[*_~`]/g, "")
    .replace(/\n+/g, " ")
    .trim()
}

/** Return the first ~200 chars of content as a readable excerpt */
function makeExcerpt(content: string, maxLen = 200): string {
  const plain = stripMarkdown(content)
  return plain.length > maxLen ? plain.slice(0, maxLen).trimEnd() + "…" : plain
}

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const payload = await request.json().catch(() => null)
  const parsed = schema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { content, excludeSlug } = parsed.data

  // Fetch all published posts for comparison
  const publishedPosts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, title: true, content: true },
  })

  const THRESHOLD = 0.30
  const TOP_N = 5

  type Match = { slug: string; title: string; similarity: number; excerpt: string }
  const matches: Match[] = []

  for (const post of publishedPosts) {
    if (excludeSlug && post.slug === excludeSlug) continue

    const similarity = calculateSimilarity(content, post.content)
    if (similarity > THRESHOLD) {
      matches.push({
        slug: post.slug,
        title: post.title,
        similarity: Math.round(similarity * 1000) / 1000,
        excerpt: makeExcerpt(post.content),
      })
    }
  }

  // Sort descending, keep top 5
  matches.sort((a, b) => b.similarity - a.similarity)
  const topMatches = matches.slice(0, TOP_N)
  const score = topMatches.length > 0 ? topMatches[0].similarity : 0

  return NextResponse.json({
    score,
    matches: topMatches,
  })
}
