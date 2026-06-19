import { type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiErrorResponse } from "@/lib/api-response"

/**
 * Affiliate stats API — returns click/conversion data for the admin dashboard.
 *
 * GET /api/affiliate/stats?period=7d (default 30d)
 * GET /api/affiliate/stats?experiment=<id>
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const period = searchParams.get("period") ?? "30d"
    const experimentId = searchParams.get("experiment")

    const days = period === "7d" ? 7 : period === "90d" ? 90 : 30
    const since = new Date()
    since.setDate(since.getDate() - days)

    // If experiment-specific stats requested
    if (experimentId) {
      const [experiment, clicks, conversions] = await Promise.all([
        prisma.affiliateExperiment.findUnique({ where: { id: experimentId } }),
        prisma.affiliateClick.groupBy({
          by: ["variant"],
          where: { experimentId, createdAt: { gte: since } },
          _count: { id: true },
        }),
        prisma.affiliateConversion.findMany({
          where: {
            createdAt: { gte: since },
            sessionId: {
              in: (await prisma.affiliateClick.findMany({
                where: { experimentId, createdAt: { gte: since } },
                select: { sessionId: true },
                distinct: ["sessionId"],
              })).map((c) => c.sessionId).filter(Boolean) as string[],
            },
          },
          select: { sessionId: true, type: true, revenue: true },
        }),
      ])

      return Response.json({ experiment, clicks, conversions, period: days })
    }

    // General stats: top tools by clicks + conversions
    const [clicksByTool, conversionsByTool, totalClicks, totalConversions, totalRevenue, dailyClicks] =
      await Promise.all([
        prisma.affiliateClick.groupBy({
          by: ["toolId"],
          where: { createdAt: { gte: since } },
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
          take: 20,
        }),
        prisma.affiliateConversion.groupBy({
          by: ["toolId"],
          where: { createdAt: { gte: since } },
          _count: { id: true },
          _sum: { revenue: true },
          orderBy: { _count: { id: "desc" } },
          take: 20,
        }),
        prisma.affiliateClick.count({ where: { createdAt: { gte: since } } }),
        prisma.affiliateConversion.count({ where: { createdAt: { gte: since } } }),
        prisma.affiliateConversion.aggregate({
          where: { createdAt: { gte: since } },
          _sum: { revenue: true },
        }),
        // Daily click trend
        prisma.$queryRaw`
          SELECT DATE(created_at) as date, COUNT(*)::int as clicks
          FROM "AffiliateClick"
          WHERE created_at >= ${since}
          GROUP BY DATE(created_at)
          ORDER BY date ASC
        ` as Promise<Array<{ date: string; clicks: number }>>,
      ])

    // Enrich with tool names
    const toolIds = [
      ...new Set([
        ...clicksByTool.map((c) => c.toolId),
        ...conversionsByTool.map((c) => c.toolId),
      ]),
    ]
    const tools = await prisma.aITool.findMany({
      where: { id: { in: toolIds } },
      select: { id: true, name: true, slug: true },
    })
    const toolMap = Object.fromEntries(tools.map((t) => [t.id, t]))

    // Merge clicks + conversions per tool
    const toolStats = clicksByTool.map((c) => {
      const conv = conversionsByTool.find((cv) => cv.toolId === c.toolId)
      const tool = toolMap[c.toolId]
      return {
        toolId: c.toolId,
        name: tool?.name ?? "Unknown",
        slug: tool?.slug ?? "",
        clicks: c._count.id,
        conversions: conv?._count.id ?? 0,
        revenue: conv?._sum.revenue ?? 0,
        conversionRate:
          c._count.id > 0
            ? Math.round(((conv?._count.id ?? 0) / c._count.id) * 10000) / 100
            : 0,
        revenuePerClick:
          c._count.id > 0
            ? Math.round(((conv?._sum.revenue ?? 0) / c._count.id) * 100) / 100
            : 0,
      }
    })

    return Response.json({
      period: days,
      summary: {
        totalClicks,
        totalConversions,
        totalRevenue: totalRevenue._sum.revenue ?? 0,
        overallCR: totalClicks > 0 ? Math.round((totalConversions / totalClicks) * 10000) / 100 : 0,
      },
      toolStats,
      dailyClicks,
    })
  } catch (error) {
    return apiErrorResponse(error, "GET /api/affiliate/stats")
  }
}
