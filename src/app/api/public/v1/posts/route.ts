import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { rateLimit, getClientIdentity, rateLimitHeaders } from "@/lib/rate-limiter"

/**
 * GET /api/public/v1/posts
 * Public REST API — no authentication required.
 * Query params:
 *   ?page=1      — pagination (default: 1)
 *   ?limit=10    — items per page (default: 10, max: 50)
 *   ?category=web3 — filter by category slug
 *   ?lang=id     — filter by language ("id" | "en")
 *
 * Rate limited: 100 req/hour per IP
 */
export async function GET(request: NextRequest) {
  // Rate limit: 100 req/hour per IP
  const ip = getClientIdentity(request)
  const rl = rateLimit(ip, { windowMs: 60 * 60_000, maxRequests: 100 }, "public-v1-posts")
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. 100 requests per hour per IP." },
      { status: 429, headers: rateLimitHeaders(rl) }
    )
  }

  const { searchParams } = request.nextUrl
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)))
  const category = searchParams.get("category") ?? undefined
  const lang = searchParams.get("lang") ?? undefined

  const where: Record<string, unknown> = {
    status: "PUBLISHED",
    published: true,
  }

  if (category) where.category = category
  if (lang) where.language = lang

  try {
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { publishedAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          category: true,
          tags: true,
          wordCount: true,
          readingTime: true,
          language: true,
          publishedAt: true,
          author: {
            select: { name: true, username: true },
          },
        },
      }),
      prisma.post.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json(
      {
        data: posts,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
      {
        headers: {
          ...rateLimitHeaders(rl),
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    )
  } catch (err) {
    console.error("[public/v1/posts] DB error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
