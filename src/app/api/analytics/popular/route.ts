import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/analytics/popular
 * Returns popular posts ranked by viewCount.
 * Query params:
 *   limit: number (default 10, max 50)
 *   period: "all" | "7d" | "30d" (default "all")
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number(searchParams.get("limit") ?? 10), 50)
    const period = searchParams.get("period") ?? "all"

    const where: Record<string, unknown> = { published: true }

    if (period === "7d") {
      where.publishedAt = { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    } else if (period === "30d") {
      where.publishedAt = { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        publishedAt: true,
      },
    })

    const total = await prisma.post.count({ where })

    return NextResponse.json({
      posts,
      total,
      period,
      limit,
    })
  } catch (err) {
    console.error("[analytics/popular]", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}