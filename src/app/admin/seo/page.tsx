import { prisma } from "@/lib/prisma"
import type { Metadata } from "next"
import { generateSeo } from "@/lib/seo"

export const metadata: Metadata = generateSeo({
  title: "SEO Dashboard",
  description: "Monitor and improve SEO scores across all content.",
  type: "website",
  canonical: "/admin/seo",
})

export default async function SeoDashboardPage() {
  const [postScores, toolScores, airdropScores] = await Promise.all([
    prisma.seoScore.findMany({ where: { entityType: "post" }, orderBy: { score: "asc" }, take: 10 }),
    prisma.seoScore.findMany({ where: { entityType: "tool" }, orderBy: { score: "asc" }, take: 10 }),
    prisma.seoScore.findMany({ where: { entityType: "airdrop" }, orderBy: { score: "asc" }, take: 10 }),
  ])

  const allScores = [...postScores, ...toolScores, ...airdropScores]
  const avgScore = allScores.length > 0
    ? Math.round(allScores.reduce((sum, s) => sum + s.score, 0) / allScores.length)
    : 0

  const scoreColor = (score: number) =>
    score >= 80 ? "text-green-500" : score >= 60 ? "text-yellow-500" : "text-red-500"

  const scoreBg = (score: number) =>
    score >= 80 ? "bg-green-500/10 border-green-500/20" :
    score >= 60 ? "bg-yellow-500/10 border-yellow-500/20" :
    "bg-red-500/10 border-red-500/20"

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SEO Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Monitor dan tingkatkan SEO score untuk semua konten.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Avg Score", value: avgScore, suffix: "/100" },
          { label: "Blog Posts", value: postScores.length, suffix: " scored" },
          { label: "AI Tools", value: toolScores.length, suffix: " scored" },
          { label: "Airdrops", value: airdropScores.length, suffix: " scored" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-6">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold">
              {stat.value}<span className="text-lg text-muted-foreground">{stat.suffix}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Score distribution */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Score Distribution</h2>
        <div className="flex items-center gap-2">
          {["0-39", "40-59", "60-79", "80-100"].map((range, i) => {
            const ranges = [[0, 39], [40, 59], [60, 79], [80, 100]]
            const [min, max] = ranges[i]
            const count = allScores.filter((s) => s.score >= min && s.score <= max).length
            const pct = allScores.length > 0 ? Math.round((count / allScores.length) * 100) : 0
            const colors = ["bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"]
            return (
              <div key={range} className="flex-1">
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>{range}</span><span>{pct}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-muted">
                  <div
                    className={`h-3 rounded-full ${colors[i]}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-1 text-center text-xs font-medium">{count}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Needs improvement */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Needs Improvement (score &lt; 60)</h2>
        {allScores.filter((s) => s.score < 60).length === 0 ? (
          <p className="text-muted-foreground">Semua konten sudah memiliki score bagus! 🎉</p>
        ) : (
          <div className="rounded-xl border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Slug</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Score</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Factors</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {allScores.filter((s) => s.score < 60).map((record) => {
                  const factors = record.factors as Record<string, number> | null
                  return (
                    <tr key={`${record.entityType}-${record.entitySlug}`} className="hover:bg-muted/30">
                      <td className="px-4 py-3 text-sm capitalize">{record.entityType}</td>
                      <td className="px-4 py-3 text-sm font-mono">{record.entitySlug}</td>
                      <td className={`px-4 py-3 text-right text-sm font-bold ${scoreColor(record.score)}`}>
                        {record.score}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                        {factors ? (
                          <span>
                            T:{factors.title ?? 0} M:{factors.meta ?? 0} C:{factors.content ?? 0} L:{factors.links ?? 0} Tech:{factors.technical ?? 0}
                          </span>
                        ) : "N/A"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* All scores */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">All Content Scores</h2>
        <div className="rounded-xl border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Slug</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Score</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Last Checked</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {allScores.map((record) => (
                <tr key={`${record.entityType}-${record.entitySlug}`} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm capitalize">{record.entityType}</td>
                  <td className="px-4 py-3 text-sm font-mono">{record.entitySlug}</td>
                  <td className={`px-4 py-3 text-right text-sm font-bold ${scoreColor(record.score)}`}>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${scoreBg(record.score)}`}>
                      {record.score}/100
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                    {record.checkedAt?.toLocaleDateString("id-ID")}
                  </td>
                </tr>
              ))}
              {allScores.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Belum ada data score. Gunakan API untuk men-scan konten.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}