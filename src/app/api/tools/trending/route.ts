import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/tools/trending - Get trending tools based on views, bookmarks, and recent activity
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 50)
    const category = searchParams.get("category")

    // Get tools with the highest view counts in the last 7 days
    // and/or highest bookmark counts
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Get tools ordered by a combination of factors:
    // - view count (recent views weighted more)
    // - bookmark count
    // - rating
    // - featured status
    const tools = await prisma.aITool.findMany({
      where: category ? { category } : undefined,
      select: {
        id: true,
        name: true,
        slug: true,
        tagline: true,
        logo: true,
        category: true,
        pricing: true,
        pricingType: true,
        rating: true,
        ratingCount: true,
        viewCount: true,
        featured: true,
        sponsored: true,
        hasFreeTrial: true,
        hasApiAccess: true,
        hasMobileApp: true,
        features: true,
        createdAt: true,
        _count: {
          select: {
            bookmarks: true,
            reviews: true,
          },
        },
      },
      orderBy: [
        { featured: "desc" },
        { rating: "desc" },
        { viewCount: "desc" },
      ],
      take: limit,
    })

    // Transform to include computed fields
    const trendingTools = tools.map((tool) => ({
      ...tool,
      bookmarkCount: tool._count.bookmarks,
      reviewCount: tool._count.reviews,
      // Calculate a trend score (simple weighted formula)
      trendScore:
        tool.viewCount * 0.1 +
        tool._count.bookmarks * 5 +
        tool.rating * 10 +
        (tool.featured ? 100 : 0),
    }))

    // Sort by trend score
    trendingTools.sort((a, b) => b.trendScore - a.trendScore)

    return NextResponse.json({
      tools: trendingTools.slice(0, limit),
      meta: {
        limit,
        category: category ?? "all",
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Trending tools fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch trending tools" }, { status: 500 })
  }
}