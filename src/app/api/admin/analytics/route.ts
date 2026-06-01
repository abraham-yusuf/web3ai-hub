import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Affiliate clicks — last 30 days grouped by day
    const affiliateClicks = await prisma.affiliateClick.groupBy({
      by: ["toolId", "createdAt"],
      _count: { id: true },
      where: { createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: "asc" },
    })

    // Group clicks by date
    const clicksByDate: Record<string, number> = {}
    affiliateClicks.forEach((click) => {
      const dateKey = click.createdAt.toISOString().split("T")[0]
      clicksByDate[dateKey] = (clicksByDate[dateKey] ?? 0) + click._count.id
    })

    // Fill in missing dates
    const dateSeries: { date: string; clicks: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const key = d.toISOString().split("T")[0]
      dateSeries.push({ date: key, clicks: clicksByDate[key] ?? 0 })
    }

    // Top tools by clicks
    const toolClickCounts = await prisma.affiliateClick.groupBy({
      by: ["toolId"],
      _count: { id: true },
      where: { createdAt: { gte: thirtyDaysAgo } },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    })

    const toolIds = toolClickCounts.map((t) => t.toolId)
    const tools = await prisma.aITool.findMany({
      where: { id: { in: toolIds } },
      select: { id: true, name: true, slug: true, category: true },
    })
    const toolMap = Object.fromEntries(tools.map((t) => [t.id, t]))

    const topTools = toolClickCounts.map((t) => ({
      toolId: t.toolId,
      name: toolMap[t.toolId]?.name ?? "Unknown",
      slug: toolMap[t.toolId]?.slug ?? "",
      category: toolMap[t.toolId]?.category ?? "",
      clicks: t._count.id,
    }))

    // Content stats
    const [postCount, airdropCount, learnPageCount, userCount] = await Promise.all([
      prisma.post.count({ where: { published: true } }),
      prisma.airdrop.count(),
      prisma.learnPage.count(),
      prisma.user.count(),
    ])

    // Total affiliate clicks
    const totalClicks = await prisma.affiliateClick.count()

    // Last 7 days clicks
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const weeklyClicks = await prisma.affiliateClick.count({ where: { createdAt: { gte: last7Days } } })

    return NextResponse.json({
      dateSeries,
      topTools,
      stats: {
        totalClicks,
        weeklyClicks,
        totalPosts: postCount,
        totalAirdrops: airdropCount,
        totalLearnPages: learnPageCount,
        totalUsers: userCount,
      },
    })
  } catch (error) {
    console.error("[ANALYTICS_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}