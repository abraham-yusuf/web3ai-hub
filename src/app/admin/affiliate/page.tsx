import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { calculateSignificance } from "@/lib/affiliate"
import type { Prisma } from "@prisma/client"

export const dynamic = "force-dynamic"

interface DailyRow {
  date: string
  clicks: number
}

export default async function AffiliateDashboard({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const { period = "30d" } = await searchParams
  const days = period === "7d" ? 7 : period === "90d" ? 90 : 30
  const since = new Date()
  since.setDate(since.getDate() - days)

  const [
    totalClicks,
    totalConversions,
    revenueAgg,
    clicksByTool,
    conversionsByTool,
    recentExperiments,
    dailyClicks,
    topPages,
  ] = await Promise.all([
    prisma.affiliateClick.count({ where: { createdAt: { gte: since } } }),
    prisma.affiliateConversion.count({ where: { createdAt: { gte: since } } }),
    prisma.affiliateConversion.aggregate({
      where: { createdAt: { gte: since } },
      _sum: { revenue: true },
    }),
    prisma.affiliateClick.groupBy({
      by: ["toolId"],
      where: { createdAt: { gte: since } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    prisma.affiliateConversion.groupBy({
      by: ["toolId"],
      where: { createdAt: { gte: since } },
      _count: { id: true },
      _sum: { revenue: true },
    }),
    prisma.affiliateExperiment.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.$queryRaw`
      SELECT DATE("createdAt") as date, COUNT(*)::int as clicks
      FROM "AffiliateClick"
      WHERE "createdAt" >= ${since}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    ` as Promise<DailyRow[]>,
    prisma.affiliateClick.groupBy({
      by: ["page"],
      where: { createdAt: { gte: since } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
  ])

  const totalRevenue = revenueAgg._sum.revenue ?? 0
  const overallCR = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0

  // Enrich tool data
  const toolIds = [
    ...new Set([
      ...clicksByTool.map((c) => c.toolId),
      ...conversionsByTool.map((c) => c.toolId),
    ]),
  ]
  const tools = toolIds.length > 0
    ? await prisma.aITool.findMany({
        where: { id: { in: toolIds } },
        select: { id: true, name: true, slug: true, affiliateLink: true },
      })
    : []
  const toolMap = Object.fromEntries(tools.map((t) => [t.id, t]))

  const toolStats = clicksByTool.map((c) => {
    const conv = conversionsByTool.find((cv) => cv.toolId === c.toolId)
    const tool = toolMap[c.toolId]
    const clicks = c._count.id
    const conversions = conv?._count.id ?? 0
    const revenue = conv?._sum.revenue ?? 0
    return {
      name: tool?.name ?? "Unknown",
      slug: tool?.slug ?? "",
      hasAffiliate: !!tool?.affiliateLink,
      clicks,
      conversions,
      revenue,
      cr: clicks > 0 ? Math.round((conversions / clicks) * 10000) / 100 : 0,
      rpc: clicks > 0 ? Math.round((revenue / clicks) * 100) / 100 : 0,
    }
  })

  // Sparkline: simple ASCII bar for daily clicks
  const maxDaily = Math.max(...dailyClicks.map((d) => d.clicks), 1)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Affiliate Dashboard</h1>
          <p className="text-muted-foreground">
            Performance tracking & A/B testing
          </p>
        </div>
        <div className="flex gap-2">
          {["7d", "30d", "90d"].map((p) => (
            <Link
              key={p}
              href={`/admin/affiliate?period=${p}`}
              className={`inline-flex h-8 items-center rounded-md px-3 text-xs font-medium transition-colors ${
                period === p
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-background hover:bg-muted"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border p-6">
          <p className="text-sm text-muted-foreground">Total Clicks</p>
          <p className="text-3xl font-bold">{totalClicks.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border p-6">
          <p className="text-sm text-muted-foreground">Conversions</p>
          <p className="text-3xl font-bold">{totalConversions.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border p-6">
          <p className="text-sm text-muted-foreground">Revenue</p>
          <p className="text-3xl font-bold">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border p-6">
          <p className="text-sm text-muted-foreground">Conversion Rate</p>
          <p className="text-3xl font-bold">{overallCR.toFixed(2)}%</p>
        </div>
      </div>

      {/* Daily Click Trend */}
      {dailyClicks.length > 0 && (
        <div className="rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-semibold">Click Trend ({days}d)</h2>
          <div className="flex items-end gap-1" style={{ height: "80px" }}>
            {dailyClicks.map((d, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-primary/80 transition-all hover:bg-primary"
                style={{ height: `${(d.clicks / maxDaily) * 100}%`, minHeight: "2px" }}
                title={`${String(d.date).split("T")[0]}: ${d.clicks} clicks`}
              />
            ))}
          </div>
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>{String(dailyClicks[0]?.date ?? "").split("T")[0]}</span>
            <span>{String(dailyClicks[dailyClicks.length - 1]?.date ?? "").split("T")[0]}</span>
          </div>
        </div>
      )}

      {/* Click Source Breakdown */}
      {topPages.length > 0 && (
        <div className="rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-semibold">Click Sources</h2>
          <div className="flex flex-wrap gap-3">
            {topPages.map((p) => (
              <div key={p.page ?? "unknown"} className="rounded-lg border px-4 py-2 text-sm">
                <span className="font-medium capitalize">{p.page ?? "direct"}</span>
                <span className="ml-2 text-muted-foreground">{p._count.id} clicks</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Tools Table */}
      <div className="rounded-xl border">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Top Tools by Clicks</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left">Tool</th>
                <th className="px-6 py-3 text-right">Clicks</th>
                <th className="px-6 py-3 text-right">Conversions</th>
                <th className="px-6 py-3 text-right">Revenue</th>
                <th className="px-6 py-3 text-right">CR%</th>
                <th className="px-6 py-3 text-right">RPC</th>
              </tr>
            </thead>
            <tbody>
              {toolStats.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                    Belum ada data affiliate clicks.
                  </td>
                </tr>
              )}
              {toolStats.map((t) => (
                <tr key={t.slug} className="border-t hover:bg-muted/30">
                  <td className="px-6 py-3">
                    <span className="font-medium">{t.name}</span>
                    {!t.hasAffiliate && (
                      <Badge variant="outline" className="ml-2 text-xs">No link</Badge>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right font-mono">{t.clicks}</td>
                  <td className="px-6 py-3 text-right font-mono">{t.conversions}</td>
                  <td className="px-6 py-3 text-right font-mono">${t.revenue.toFixed(2)}</td>
                  <td className="px-6 py-3 text-right">
                    <span className={t.cr > 5 ? "text-green-500" : t.cr > 0 ? "text-yellow-500" : "text-muted-foreground"}>
                      {t.cr}%
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right font-mono">${t.rpc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* A/B Experiments */}
      <div className="rounded-xl border">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">A/B Experiments</h2>
          <Link
            href="/admin/affiliate/experiments/new"
            className="inline-flex h-8 items-center rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground"
          >
            + New Experiment
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Target</th>
                <th className="px-6 py-3 text-left">Variants</th>
                <th className="px-6 py-3 text-left">Winner</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentExperiments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                    Belum ada experiment. Klik &quot;+ New Experiment&quot; untuk mulai A/B testing.
                  </td>
                </tr>
              )}
              {recentExperiments.map((exp) => {
                const variants = (exp.variants as Array<{ id: string; label: string }>) ?? []
                return (
                  <tr key={exp.id} className="border-t hover:bg-muted/30">
                    <td className="px-6 py-3 font-medium">{exp.name}</td>
                    <td className="px-6 py-3">
                      <Badge
                        variant={
                          exp.status === "running" ? "default" :
                          exp.status === "completed" ? "secondary" : "outline"
                        }
                      >
                        {exp.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 capitalize text-muted-foreground">{exp.targetPage ?? "all"}</td>
                    <td className="px-6 py-3 text-muted-foreground">{variants.length} variants</td>
                    <td className="px-6 py-3">
                      {exp.winnerId ? (
                        <Badge variant="secondary">{exp.winnerId}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <Link
                        href={`/admin/affiliate/experiments/${exp.id}`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
