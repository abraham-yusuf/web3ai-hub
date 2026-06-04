import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET /api/analytics/posts/popular — get most viewed posts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = Math.min(30, Math.max(1, parseInt(searchParams.get("days") ?? "7", 10)))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)))
    const category = searchParams.get("category")

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const posts = await prisma.post.findMany({
      where: {
        published: true,
        ...(category ? { category } : {}),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        publishedAt: true,
        _count: {
          select: { views: true },
        },
      },
    })

    // Get views in the time period
    const viewCounts = await prisma.postView.groupBy({
      by: ["postId"],
      where: {
        createdAt: { gte: since },
        postId: { in: posts.map(p => p.id) },
      },
      _count: true,
    })

    const viewMap = new Map(viewCounts.map(v => [v.postId, v._count]))

    const ranked = posts
      .map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        category: post.category,
        publishedAt: post.publishedAt,
        totalViews: post._count.views,
        periodViews: viewMap.get(post.id) ?? 0,
      }))
      .sort((a, b) => b.periodViews - a.periodViews)
      .slice(0, limit)

    return NextResponse.json({
      period: `${days} days`,
      posts: ranked,
    })
  } catch (error) {
    console.error("Popular posts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}