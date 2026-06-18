import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { auth } from "@/auth"

export const dynamic = "force-dynamic"

async function checkDatabaseHealth() {
  const start = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    return { ok: true, latencyMs: Date.now() - start }
  } catch {
    return { ok: false, latencyMs: Date.now() - start }
  }
}

async function getContentStats() {
  const [tools, airdrops, posts, users, reports] = await Promise.all([
    prisma.aITool.count(),
    prisma.airdrop.count(),
    prisma.post.count({ where: { published: true } }),
    prisma.user.count(),
    prisma.contentReport.count({ where: { status: "PENDING" } }).catch(() => 0),
  ])
  return { tools, airdrops, posts, users, pendingReports: reports }
}

async function getActivityMetrics() {
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [views24h, views7d, latestPost, latestTool] = await Promise.all([
    prisma.postView.count({ where: { createdAt: { gte: oneDayAgo } } }).catch(() => 0),
    prisma.postView.count({ where: { createdAt: { gte: sevenDaysAgo } } }).catch(() => 0),
    prisma.post.findFirst({ where: { published: true }, orderBy: { createdAt: "desc" }, select: { createdAt: true, title: true } }),
    prisma.aITool.findFirst({ orderBy: { createdAt: "desc" }, select: { createdAt: true, name: true } }),
  ])

  return { views24h, views7d, latestPost, latestTool }
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span className={`inline-block h-3 w-3 rounded-full ${ok ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
  )
}

function formatAge(date: Date | null | undefined): string {
  if (!date) return "—"
  const ms = Date.now() - new Date(date).getTime()
  const hours = Math.floor(ms / 3_600_000)
  if (hours < 1) return "< 1 hour ago"
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default async function MonitoringPage() {
  const session = await auth()
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
    return (
      <div className="p-10 text-center">
        <p className="text-muted-foreground">Access denied. Admin/Editor only.</p>
      </div>
    )
  }

  const [dbHealth, stats, activity] = await Promise.all([
    checkDatabaseHealth(),
    getContentStats(),
    getActivityMetrics(),
  ])

  const allHealthy = dbHealth.ok

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitoring</h1>
          <p className="mt-1 text-muted-foreground">System health, performance, and content freshness.</p>
        </div>
        <Badge variant={allHealthy ? "default" : "destructive"} className="text-sm">
          {allHealthy ? "✅ All Systems Operational" : "⚠️ Degraded"}
        </Badge>
      </div>

      {/* Health Checks */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">System Health</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <StatusDot ok={dbHealth.ok} />
                <CardTitle className="text-sm">Database</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${dbHealth.ok ? "text-emerald-400" : "text-red-400"}`}>
                {dbHealth.ok ? `${dbHealth.latencyMs}ms` : "DOWN"}
              </p>
              <p className="text-xs text-muted-foreground">Query latency</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <StatusDot ok />
                <CardTitle className="text-sm">Application</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-400">Running</p>
              <p className="text-xs text-muted-foreground">Next.js + Vercel</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <StatusDot ok />
                <CardTitle className="text-sm">Error Tracking</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-400">Active</p>
              <p className="text-xs text-muted-foreground">Sentry @sentry/nextjs</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content Stats */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Content Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "AI Tools", value: stats.tools, icon: "🤖" },
            { label: "Airdrops", value: stats.airdrops, icon: "🪂" },
            { label: "Posts", value: stats.posts, icon: "📝" },
            { label: "Users", value: stats.users, icon: "👥" },
            { label: "Pending Reports", value: stats.pendingReports, icon: "🚨", alert: stats.pendingReports > 0 },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="pt-6">
                <div className="flex items-baseline gap-2">
                  <span>{item.icon}</span>
                  <span className={`text-2xl font-bold ${item.alert ? "text-amber-400" : ""}`}>
                    {item.value}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Activity & Freshness */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Activity &amp; Freshness</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Page Views (24h)</CardTitle>
            </CardHeader>
            <CardContent><p className="text-3xl font-bold">{activity.views24h}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Page Views (7d)</CardTitle>
            </CardHeader>
            <CardContent><p className="text-3xl font-bold">{activity.views7d}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Latest Post</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">{formatAge(activity.latestPost?.createdAt)}</p>
              <CardDescription className="truncate">{activity.latestPost?.title ?? "No posts yet"}</CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Latest Tool Added</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">{formatAge(activity.latestTool?.createdAt)}</p>
              <CardDescription className="truncate">{activity.latestTool?.name ?? "No tools yet"}</CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Health Check Endpoint */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Uptime Monitoring</h2>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm">
              Health check endpoint for uptime monitors (UptimeRobot, Pingdom, Sentry Crons):
            </p>
            <code className="mt-2 block rounded bg-muted px-3 py-2 text-sm">
              GET {process.env.NEXT_PUBLIC_APP_URL ?? "https://ai3.web.id"}/api/health
            </code>
            <p className="mt-2 text-xs text-muted-foreground">
              Returns 200 (healthy) or 503 (degraded) with DB latency. Safe to poll every 60s.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
