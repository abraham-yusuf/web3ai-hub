import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { auth } from "@/auth"

export const dynamic = "force-dynamic"

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const session = await auth()
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
    return (
      <div className="p-10 text-center">
        <p className="text-muted-foreground">Access denied. Admin/Editor only.</p>
      </div>
    )
  }

  const params = await searchParams
  const days = Math.min(90, Math.max(1, parseInt(params.period ?? "7", 10)))
  // eslint-disable-next-line react-hooks/purity -- server components run per-request, Date.now() is safe
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  // Fetch all data in parallel
  const [
    totalViews,
    totalPosts,
    recentViews,
    postsWithViews,
    topPosts,
    byDeviceRaw,
    byDayRaw,
    topAuthors,
  ] = await Promise.all([
    // Total views (all time)
    prisma.postView.count(),
    // Total published posts
    prisma.post.count({ where: { published: true } }),
    // Views in the period
    prisma.postView.count({ where: { createdAt: { gte: since } } }),
    // Posts with view counts
    prisma.post.findMany({
      where: { published: true },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        wordCount: true,
        readingTime: true,
        publishedAt: true,
        _count: { select: { views: true } },
      },
      orderBy: { views: { _count: "desc" } },
      take: 20,
    }),
    // Top posts by views in period
    prisma.postView.groupBy({
      by: ["postId"],
      where: { createdAt: { gte: since } },
      _count: true,
      orderBy: { _count: { createdAt: "desc" } },
      take: 10,
    }),
    // Device breakdown
    prisma.postView.groupBy({
      by: ["device"],
      where: { createdAt: { gte: since } },
      _count: true,
    }),
    // Daily views (raw query)
    prisma.$queryRaw<{ day: string; count: bigint }[]>`
      SELECT DATE(created_at) as day, COUNT(*)::bigint as count
      FROM "PostView"
      WHERE created_at >= ${since}
      GROUP BY DATE(created_at)
      ORDER BY day ASC
    `,
    // Top authors by total views
    prisma.postView.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: since }, userId: { not: null } },
      _count: true,
      orderBy: { _count: { createdAt: "desc" } },
      take: 5,
    }),
  ])

  // Build top posts with titles
  const topPostIds = topPosts.map(p => p.postId)
  const topPostTitles = await prisma.post.findMany({
    where: { id: { in: topPostIds } },
    select: { id: true, title: true, slug: true },
  })
  const titleMap = new Map(topPostTitles.map(p => [p.id, p]))

  const topPostsWithTitles = topPosts.map(p => ({
    ...p,
    post: titleMap.get(p.postId),
    views: p._count,
  }))

  // Device totals
  const deviceMap: Record<string, number> = {}
  for (const d of byDeviceRaw) {
    if (d.device) deviceMap[d.device] = d._count
  }
  const deviceTotal = Object.values(deviceMap).reduce((a, b) => a + b, 0)

  // Avg reading time
  const avgReadingTimeResult = await prisma.postView.aggregate({
    where: { createdAt: { gte: since }, readingTime: { gt: 0 } },
    _avg: { readingTime: true },
    _count: true,
  })

  const avgReadingTime = avgReadingTimeResult._avg.readingTime
    ? Math.round(avgReadingTimeResult._avg.readingTime / 60) // seconds → minutes
    : 0

  const uniqueReaders = await prisma.postView.groupBy({
    by: ["sessionId"],
    where: { createdAt: { gte: since }, sessionId: { not: null } },
    _count: true,
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Content Analytics</h1>
        <p className="text-muted-foreground">Track blog performance and reader engagement</p>
      </div>

      {/* Period selector */}
      <div className="flex gap-2">
        {[7, 14, 30, 60, 90].map((d) => (
          <Link
            key={d}
            href={`/admin/analytics?period=${d}`}
            className={`inline-flex h-8 items-center rounded-md px-3 text-xs font-medium transition-colors ${
              days === d
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background hover:bg-muted"
            }`}
          >
            {d}d
          </Link>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100 p-5 dark:from-blue-950/30 dark:to-blue-900/20">
          <p className="text-sm text-muted-foreground">Total Views (all time)</p>
          <p className="text-3xl font-bold tabular-nums">{totalViews.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{totalPosts} published posts</p>
        </div>
        <div className="rounded-lg border bg-gradient-to-br from-green-50 to-green-100 p-5 dark:from-green-950/30 dark:to-green-900/20">
          <p className="text-sm text-muted-foreground">Views (last {days} days)</p>
          <p className="text-3xl font-bold tabular-nums">{recentViews.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">
            ~{Math.round(recentViews / days)}/day avg
          </p>
        </div>
        <div className="rounded-lg border bg-gradient-to-br from-purple-50 to-purple-100 p-5 dark:from-purple-950/30 dark:to-purple-900/20">
          <p className="text-sm text-muted-foreground">Unique Readers (est.)</p>
          <p className="text-3xl font-bold tabular-nums">{uniqueReaders.length.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Sessions in {days} days</p>
        </div>
        <div className="rounded-lg border bg-gradient-to-br from-amber-50 to-amber-100 p-5 dark:from-amber-950/30 dark:to-amber-900/20">
          <p className="text-sm text-muted-foreground">Avg Reading Time</p>
          <p className="text-3xl font-bold tabular-nums">{avgReadingTime}m</p>
          <p className="text-xs text-muted-foreground">
            {(avgReadingTimeResult._count ?? 0).toLocaleString()} tracked reads
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Content */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-semibold">Top Content ({days}d)</h2>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-right">Views</th>
                  <th className="px-4 py-2 text-right">Words</th>
                  <th className="px-4 py-2 text-right">Read Time</th>
                </tr>
              </thead>
              <tbody>
                {topPostsWithTitles.map((item, idx) => (
                  <tr key={item.postId} className="border-t">
                    <td className="px-4 py-2 text-muted-foreground">{idx + 1}</td>
                    <td className="px-4 py-2">
                      <p className="font-medium">{item.post?.title ?? "Unknown"}</p>
                      <Link
                        href={`/blog/${item.post?.slug}`}
                        className="text-xs text-primary hover:underline"
                        target="_blank"
                      >
                        /blog/{item.post?.slug}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-right font-bold tabular-nums">
                      {item.views.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {postsWithViews.find(p => p.id === item.postId)?.wordCount.toLocaleString() ?? "—"}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {postsWithViews.find(p => p.id === item.postId)?.readingTime ?? "—"}m
                    </td>
                  </tr>
                ))}
                {topPostsWithTitles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No view data yet for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Device Breakdown */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 text-sm font-semibold">Device Breakdown</h3>
            {deviceTotal > 0 ? (
              <div className="space-y-2">
                {(["desktop", "mobile", "tablet"] as const).map((dev) => {
                  const count = deviceMap[dev] ?? 0
                  const pct = deviceTotal > 0 ? Math.round((count / deviceTotal) * 100) : 0
                  return (
                    <div key={dev}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="capitalize">{dev}</span>
                        <span className="tabular-nums">{count.toLocaleString()} ({pct}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No device data yet.</p>
            )}
          </div>

          {/* Daily Traffic Chart (ASCII style) */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 text-sm font-semibold">Daily Views (last {days}d)</h3>
            {byDayRaw.length > 0 ? (
              <div className="space-y-1">
                {byDayRaw.slice(-14).map((row) => {
                  const count = Number(row.count)
                  const max = Math.max(...byDayRaw.map(r => Number(r.count)), 1)
                  const pct = Math.round((count / max) * 20)
                  const bar = "█".repeat(pct)
                  return (
                    <div key={row.day} className="flex items-center gap-2 text-xs">
                      <span className="w-10 text-muted-foreground tabular-nums shrink-0">
                        {row.day.slice(5)}
                      </span>
                      <span className="tabular-nums w-8 text-right shrink-0">
                        {count}
                      </span>
                      <span className="text-primary font-mono">{bar}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No traffic data yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* All Posts with Views */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">All Posts by Total Views</h2>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-right">Total Views</th>
                <th className="px-4 py-2 text-right">Words</th>
                <th className="px-4 py-2 text-left">Published</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {postsWithViews.map((post) => (
                <tr key={post.id} className="border-t">
                  <td className="px-4 py-2">
                    <p className="font-medium">{post.title}</p>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">{post.category}</td>
                  <td className="px-4 py-2 text-right font-bold tabular-nums">
                    {post._count.views.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {post.wordCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="text-xs text-primary hover:underline"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/admin/posts/${post.id}/revisions`}
                        className="text-xs text-primary hover:underline"
                      >
                        History
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {postsWithViews.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No published posts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revenue Overview (stub — wired when payment provider is connected) */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Revenue Overview</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Monthly Recurring Revenue", value: "Rp 0", sub: "Midtrans/Stripe pending" },
            { label: "Active Subscribers", value: "0", sub: "Pro + Enterprise" },
            { label: "Lifetime Value (avg)", value: "—", sub: "Requires payment data" },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-lg border bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 dark:from-emerald-950/30 dark:to-emerald-900/20">
              <p className="text-sm text-muted-foreground">{kpi.label}</p>
              <p className="text-3xl font-bold tabular-nums">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.sub}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl border p-6 text-center text-muted-foreground text-sm">
          Connect Midtrans or Stripe to unlock MRR, churn, and LTV metrics.{" "}
          <a href="/admin/subscriptions" className="text-primary underline underline-offset-2">Manage subscriptions →</a>
        </div>
      </div>
    </div>
  )
}