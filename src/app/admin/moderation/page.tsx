import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { moderateReportAction } from "./actions"
import type { ReportStatus } from "@prisma/client"

export const dynamic = "force-dynamic"

const STATUS_COLORS: Record<ReportStatus, string> = {
  PENDING: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  REVIEWING: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  RESOLVED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  DISMISSED: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
}

const CONTENT_TYPE_LABELS: Record<string, string> = {
  AIRDROP: "🪂 Airdrop",
  AI_TOOL: "🤖 AI Tool",
  POST: "📝 Post",
  REVIEW: "⭐ Review",
  COMMENT: "💬 Comment",
}

export default async function ModerationPage() {
  const [pending, reviewing, recentResolved] = await Promise.all([
    prisma.contentReport.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.contentReport.findMany({
      where: { status: "REVIEWING" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.contentReport.findMany({
      where: { status: { in: ["RESOLVED", "DISMISSED"] } },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
  ])

  const allActive = [...pending, ...reviewing]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Moderation Queue</h1>
        <p className="mt-1 text-muted-foreground">
          Review and resolve community reports.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-amber-400">{pending.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">In Review</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-blue-400">{reviewing.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Resolved (recent)</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-emerald-400">{recentResolved.length}</p></CardContent>
        </Card>
      </div>

      {/* Active reports */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Active Reports ({allActive.length})
        </h2>
        {allActive.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              ✅ No pending reports — all clear!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {allActive.map((report) => (
              <Card key={report.id}>
                <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={STATUS_COLORS[report.status]}>
                        {report.status}
                      </Badge>
                      <span className="text-sm font-medium">
                        {CONTENT_TYPE_LABELS[report.contentType] ?? report.contentType}
                      </span>
                      <Badge variant="secondary">{report.reason}</Badge>
                    </div>
                    {report.message && (
                      <p className="text-sm text-muted-foreground">{report.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Reported {report.createdAt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      {" · ID: "}{report.contentId.slice(0, 8)}…
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <form action={async () => { "use server"; await moderateReportAction(report.id, "resolve") }}>
                      <button type="submit" className="inline-flex h-8 items-center rounded-md bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-700">
                        ✓ Resolve
                      </button>
                    </form>
                    <form action={async () => { "use server"; await moderateReportAction(report.id, "dismiss") }}>
                      <button type="submit" className="inline-flex h-8 items-center rounded-md bg-zinc-600 px-3 text-xs font-medium text-white hover:bg-zinc-700">
                        ✗ Dismiss
                      </button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent resolved */}
      {recentResolved.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-muted-foreground">Recently Resolved</h2>
          <div className="space-y-2">
            {recentResolved.map((report) => (
              <div key={report.id} className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={STATUS_COLORS[report.status]}>
                    {report.status}
                  </Badge>
                  <span>{CONTENT_TYPE_LABELS[report.contentType] ?? report.contentType}</span>
                  <span className="text-muted-foreground">— {report.reason}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {report.updatedAt.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
