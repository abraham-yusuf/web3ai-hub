import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

// POST /api/analytics/posts/[id]/view — track a post view
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const headersList = await headers()

    const userAgent = headersList.get("user-agent") ?? ""
    const referer = headersList.get("referer") ?? ""

    // Determine device type from UA
    let device = "desktop"
    if (/mobile/i.test(userAgent)) device = "mobile"
    else if (/tablet|ipad/i.test(userAgent)) device = "tablet"

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id },
      select: { id: true, slug: true },
    })
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Parse optional fields
    const readingTime = typeof body.readingTime === "number" ? body.readingTime : 0
    const sessionId = typeof body.sessionId === "string" ? body.sessionId : null

    // Try to get user ID from session (if authenticated)
    const userId = typeof body.userId === "string" ? body.userId : null

    await prisma.postView.create({
      data: {
        postId: id,
        slug: post.slug,
        userId: userId || null,
        sessionId,
        referrer: referer.slice(0, 500),
        userAgent: userAgent.slice(0, 500),
        device,
        readingTime,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Post view tracking error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET /api/analytics/posts/[id]/view — get view stats for a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const [post, totalViews, recentViews, byDevice, byDay] = await Promise.all([
      prisma.post.findUnique({
        where: { id },
        select: { id: true, title: true, slug: true, publishedAt: true },
      }),
      prisma.postView.count({ where: { postId: id } }),
      prisma.postView.count({
        where: {
          postId: id,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.postView.groupBy({
        by: ["device"],
        where: { postId: id },
        _count: true,
      }),
      prisma.$queryRaw<{ day: string; count: bigint }[]>`
        SELECT DATE(created_at) as day, COUNT(*) as count
        FROM "PostView"
        WHERE post_id = ${id}
          AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY day ASC
      `,
    ])

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json({
      postId: id,
      title: post.title,
      slug: post.slug,
      totalViews,
      viewsLast7Days: recentViews,
      byDevice: byDevice.reduce((acc, d) => {
        if (d.device) acc[d.device] = d._count
        return acc
      }, {} as Record<string, number>),
      dailyStats: byDay.map(d => ({ day: d.day, views: Number(d.count) })),
    })
  } catch (error) {
    console.error("Post view stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}