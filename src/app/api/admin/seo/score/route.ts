import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const scoreBody = z.object({
  entityType: z.enum(["post", "airdrop", "tool", "learn"]),
  entitySlug: z.string().min(1),
  content: z.string(),
  title: z.string(),
  metaDescription: z.string().optional(),
})

function calculateSeoScore(opts: {
  title: string
  metaDescription?: string
  content: string
}): { score: number; factors: Record<string, number> } {
  const { title, metaDescription, content } = opts
  const factors: Record<string, number> = {}
  let totalScore = 0

  // Title score (0-20)
  const titleLength = title.length
  const hasKeyword = title.length > 0 ? 10 : 0
  const goodLength = titleLength >= 30 && titleLength <= 60 ? 10 : titleLength > 0 ? 5 : 0
  factors.title = Math.min(20, hasKeyword + goodLength)
  totalScore += factors.title

  // Meta description score (0-15)
  const metaLength = metaDescription?.length ?? 0
  factors.meta =
    metaLength >= 120 && metaLength <= 160
      ? 15
      : metaLength > 0
      ? Math.min(10, Math.floor(metaLength / 20))
      : 0
  totalScore += factors.meta

  // Content quality score (0-30)
  const wordCount = content.split(/\s+/).filter(Boolean).length
  const hasHeadings = /^#{1,3}\s+.+$/gm.test(content)
  const hasLists = /^[-*]\s+.+$/gm.test(content) || /^\d+\.\s+.+$/gm.test(content)
  const hasCode = /```[\s\S]+?```/g.test(content)

  let contentScore = 0
  if (wordCount >= 300) contentScore += 10
  else if (wordCount >= 150) contentScore += 6
  else if (wordCount >= 50) contentScore += 3

  if (hasHeadings) contentScore += 8
  if (hasLists) contentScore += 6
  if (hasCode) contentScore += 6

  factors.content = Math.min(30, contentScore)
  totalScore += factors.content

  // Internal/external links score (0-15)
  const internalLinks = (content.match(/\[([^\]]+)\]\([^)]+\)/g) ?? []).length
  const linkScore =
    internalLinks >= 3 ? 15 : internalLinks >= 1 ? Math.min(12, internalLinks * 5) : 0
  factors.links = linkScore
  totalScore += factors.links

  // Technical SEO score (0-20)
  let techScore = 0
  // Has OG image reference
  if (/\!\[.*?\]\(.*?\)/.test(content)) techScore += 5
  // Has CTA
  if (/call[- ]?to[- ]?action|CTA|sign up|register/i.test(content)) techScore += 5
  // Good paragraph length (not too many short paragraphs)
  const paragraphs = content.split(/\n\n+/).filter(Boolean)
  const avgParaLength = paragraphs.length > 0
    ? paragraphs.reduce((sum, p) => sum + p.length, 0) / paragraphs.length
    : 0
  if (avgParaLength >= 100) techScore += 5
  else if (avgParaLength >= 50) techScore += 3
  // Has conclusion
  if (/^(conclusion|summary|kesimpulan|wrap[- ]?up)/gim.test(content)) techScore += 5

  factors.technical = Math.min(20, techScore)
  totalScore += factors.technical

  return { score: Math.min(100, totalScore), factors }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = scoreBody.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body", details: parsed.error.flatten() }, { status: 400 })
    }

    const { entityType, entitySlug, content, title, metaDescription } = parsed.data

    const { score, factors } = calculateSeoScore({ title, metaDescription, content })

    const record = await prisma.seoScore.upsert({
      where: { entityType_entitySlug: { entityType, entitySlug } },
      update: { score, factors, checkedAt: new Date() },
      create: { entityType, entitySlug, score, factors },
    })

    return NextResponse.json({ score: record.score, factors: record.factors })
  } catch (error) {
    console.error("[seo-score] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const entityType = searchParams.get("entityType") as "post" | "airdrop" | "tool" | "learn" | null

  if (!entityType) {
    return NextResponse.json({ error: "entityType is required" }, { status: 400 })
  }

  const scores = await prisma.seoScore.findMany({
    where: { entityType },
    orderBy: { score: "asc" },
    take: 20,
  })

  return NextResponse.json({ scores })
}