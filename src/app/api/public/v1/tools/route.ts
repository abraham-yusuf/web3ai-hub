import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { rateLimit, getClientIdentity, rateLimitHeaders } from "@/lib/rate-limiter"

/**
 * GET /api/public/v1/tools
 * Public REST API for AI tools — no authentication required.
 * Query params:
 *   ?page=1      — pagination (default: 1)
 *   ?limit=10    — items per page (default: 10, max: 50)
 *   ?category=writing — filter by tool category
 *   ?pricing=free     — filter by pricingType (FREE | FREEMIUM | PAID | SUBSCRIPTION)
 *
 * Rate limited: 100 req/hour per IP
 */
export async function GET(request: NextRequest) {
  // Rate limit: 100 req/hour per IP
  const ip = getClientIdentity(request)
  const rl = rateLimit(ip, { windowMs: 60 * 60_000, maxRequests: 100 }, "public-v1-tools")
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
  const pricing = searchParams.get("pricing")?.toUpperCase() ?? undefined

  const where: Record<string, unknown> = {}
  if (category) where.category = category
  if (pricing) where.pricingType = pricing

  try {
    const [tools, total] = await Promise.all([
      prisma.aITool.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ featured: "desc" }, { rating: "desc" }, { viewCount: "desc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          tagline: true,
          description: true,
          category: true,
          pricing: true,
          pricingType: true,
          rating: true,
          ratingCount: true,
          viewCount: true,
          features: true,
          platforms: true,
          hasFreeTrial: true,
          hasApiAccess: true,
          websiteUrl: true,
          featured: true,
        },
      }),
      prisma.aITool.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json(
      {
        data: tools,
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
    console.error("[public/v1/tools] DB error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
