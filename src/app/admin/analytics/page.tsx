"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, TrendingUp, MousePointerClick, FileText, Users } from "lucide-react"
import Link from "next/link"

type AnalyticsData = {
  dateSeries: { date: string; clicks: number }[]
  topTools: { toolId: string; name: string; slug: string; category: string; clicks: number }[]
  stats: {
    totalClicks: number
    weeklyClicks: number
    totalPosts: number
    totalAirdrops: number
    totalLearnPages: number
    totalUsers: number
  }
}

function MiniBarChart({ data }: { data: { date: string; clicks: number }[] }) {
  const max = Math.max(...data.map((d) => d.clicks), 1)
  const recent = data.slice(-14)
  const barWidth = Math.max(4, Math.floor(560 / recent.length) - 2)

  return (
    <svg viewBox={`0 0 ${recent.length * (barWidth + 2)} 80`} className="w-full h-20 overflow-visible">
      {recent.map((d, i) => {
        const height = Math.max(2, (d.clicks / max) * 72)
        const x = i * (barWidth + 2)
        const y = 76 - height
        return (
          <g key={d.date}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={height}
              rx={2}
              fill="hsl(var(--primary))"
              opacity={d.clicks > 0 ? 0.7 + (d.clicks / max) * 0.3 : 0.15}
            />
            <title>{`${d.date}: ${d.clicks} clicks`}</title>
          </g>
        )
      })}
    </svg>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = "primary",
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  accent?: string
}) {
  const colors: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    green: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    orange: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
            <p className="mt-1 text-3xl font-bold">{value}</p>
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={`rounded-lg p-2.5 ${colors[accent] ?? colors.primary}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return <p className="text-muted-foreground">Failed to load analytics.</p>
  }

  const { dateSeries, topTools, stats } = data

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Affiliate clicks, content stats, and platform overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Affiliate Clicks"
          value={stats.totalClicks.toLocaleString()}
          subtitle={`${stats.weeklyClicks} in the last 7 days`}
          icon={MousePointerClick}
          accent="primary"
        />
        <StatCard
          title="This Week"
          value={stats.weeklyClicks}
          subtitle="Affiliate link clicks"
          icon={TrendingUp}
          accent="green"
        />
        <StatCard
          title="Published Posts"
          value={stats.totalPosts}
          subtitle="Blog articles"
          icon={FileText}
          accent="blue"
        />
        <StatCard
          title="Registered Users"
          value={stats.totalUsers}
          subtitle={`${stats.totalLearnPages} learn pages`}
          icon={Users}
          accent="orange"
        />
      </div>

      {/* Affiliate Click Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Affiliate Clicks — Last 14 Days</CardTitle>
          <CardDescription>Daily affiliate link clicks across all AI tools.</CardDescription>
        </CardHeader>
        <CardContent>
          {dateSeries.length > 0 ? (
            <MiniBarChart data={dateSeries} />
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No clicks recorded yet. Share affiliate links to see data here.
            </p>
          )}
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{dateSeries[0]?.date}</span>
            <span>{dateSeries[dateSeries.length - 1]?.date}</span>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Tools */}
      <Card>
        <CardHeader>
          <CardTitle>Top AI Tools — Last 30 Days</CardTitle>
          <CardDescription>Most clicked affiliate links from your audience.</CardDescription>
        </CardHeader>
        <CardContent>
          {topTools.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No clicks yet. Add affiliate links to your AI tools.
            </p>
          ) : (
            <div className="space-y-3">
              {topTools.map((tool, i) => {
                const maxClicks = topTools[0]?.clicks ?? 1
                const pct = Math.round((tool.clicks / maxClicks) * 100)
                return (
                  <div key={tool.toolId} className="flex items-center gap-3">
                    <span className="w-5 text-right text-xs font-medium text-muted-foreground">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm truncate">{tool.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="secondary" className="text-xs">{tool.category}</Badge>
                          <span className="text-xs font-semibold tabular-nums">{tool.clicks} clicks</span>
                          <Link
                            href={`/ai-tools/${tool.slug}`}
                            target="_blank"
                            className="text-muted-foreground hover:text-primary"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}