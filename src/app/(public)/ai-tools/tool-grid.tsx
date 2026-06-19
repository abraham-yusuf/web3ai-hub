import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { Star, TrendingUp, Zap, GitCompare, X } from "lucide-react"
import { unstable_cache } from "next/cache"
import Link from "next/link"

// ── Types ──────────────────────────────────────────────────────────────────
type ToolGridProps = {
  q?: string
  category?: string
  pricingType?: string
  platform?: string
  hasFreeTrial?: string
  hasApiAccess?: string
  sort?: string
  compareSlugs: string[]
  buildFilterUrl: (overrides: Record<string, string | undefined>) => string
}

// ── Cached query ───────────────────────────────────────────────────────────
// Cache the tools query keyed by all filter params.
// Revalidates every 60s; call revalidateTag("ai-tools") after admin CRUD
// for instant refresh.
function getCachedTools(
  where: Record<string, unknown>,
  orderBy: Record<string, unknown>,
  cacheKey: string,
) {
  return unstable_cache(
    async () => {
      return prisma.aITool.findMany({
        where,
        orderBy,
        include: {
          _count: { select: { reviews: { where: { status: "APPROVED" } } } },
        },
      })
    },
    ["ai-tools-grid", cacheKey],
    { revalidate: 60, tags: ["ai-tools"] },
  )()
}

// ── Component ──────────────────────────────────────────────────────────────
export async function ToolGrid({
  q,
  category,
  pricingType,
  platform,
  hasFreeTrial,
  hasApiAccess,
  sort,
  compareSlugs,
  buildFilterUrl,
}: ToolGridProps) {
  const maxCompare = 20

  // Build dynamic WHERE clause
  const where: Record<string, unknown> = { AND: [] }

  if (q) {
    ;(where.AND as unknown[]).push({ name: { contains: q, mode: "insensitive" } })
  }
  if (category) {
    ;(where.AND as unknown[]).push({ category: { contains: category, mode: "insensitive" } })
  }
  if (pricingType) {
    ;(where.AND as unknown[]).push({ pricingType: pricingType as "FREE" | "FREEMIUM" | "PAID" | "SUBSCRIPTION" })
  }
  if (platform) {
    ;(where.AND as unknown[]).push({ platforms: { has: platform } })
  }
  if (hasFreeTrial === "true") {
    ;(where.AND as unknown[]).push({ hasFreeTrial: true })
  }
  if (hasApiAccess === "true") {
    ;(where.AND as unknown[]).push({ hasApiAccess: true })
  }
  if ((where.AND as unknown[]).length === 0) {
    delete where.AND
  }

  // Sort
  let orderBy: Record<string, unknown> = { rating: "desc" }
  switch (sort) {
    case "trending":
    case "views":
      orderBy = { viewCount: "desc" }
      break
    case "newest":
      orderBy = { createdAt: "desc" }
      break
    case "name":
      orderBy = { name: "asc" }
      break
    default:
      orderBy = { rating: "desc" }
  }

  // Stable cache key from filter params
  const cacheKey = JSON.stringify({ q, category, pricingType, platform, hasFreeTrial, hasApiAccess, sort })

  const tools = await getCachedTools(where, orderBy, cacheKey)

  // Sponsored tools float to top
  const sponsoredTools = tools.filter((t) => t.sponsored)
  const regularTools = tools.filter((t) => !t.sponsored)
  const sortedTools = [...sponsoredTools, ...regularTools]

  return (
    <>
      {/* Compare Selection Bar */}
      {compareSlugs.length > 0 && (
        <div className="sticky top-16 z-40 rounded-xl border bg-background/95 p-4 shadow-md backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <GitCompare className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  Compare Queue ({compareSlugs.length}{maxCompare < 999 ? `/${maxCompare}` : ""})
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {compareSlugs.join(" • ")}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {compareSlugs.length >= 2 && (
                <Link
                  href={`/ai-tools/compare?slugs=${compareSlugs.join(",")}`}
                  className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Compare {compareSlugs.length} Tools
                </Link>
              )}
              <Link
                href={`/ai-tools?q=${encodeURIComponent(q ?? "")}`}
                className="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Results grid — min-height prevents CLS on mobile */}
      {sortedTools.length > 0 ? (
        <div className="grid min-h-[400px] gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedTools.map((tool, idx) => {
            const isInCompare = compareSlugs.includes(tool.slug)
            const isNew = !tool.sponsored && idx < 3 && tool.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            const nextCompare = isInCompare
              ? compareSlugs.filter((s) => s !== tool.slug)
              : [...compareSlugs, tool.slug]
            const reviewCount = tool._count?.reviews ?? 0

            return (
              <Card
                key={tool.id}
                className={`relative flex h-full flex-col transition-colors hover:border-primary ${isInCompare ? "ring-2 ring-primary" : ""}`}
              >
                {isInCompare && (
                  <div className="absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {compareSlugs.indexOf(tool.slug) + 1}
                  </div>
                )}

                {/* Sponsored badge */}
                {tool.sponsored && (
                  <div className="absolute -top-2 left-3 z-10 flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                    <Zap className="h-3 w-3" /> Sponsored
                  </div>
                )}

                <CardHeader className="relative">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <Badge variant="secondary">{tool.category}</Badge>
                    <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                      <Star className="h-4 w-4 fill-current" />
                      {tool.rating > 0 ? tool.rating.toFixed(1) : "—"}
                      {reviewCount > 0 && <span className="text-xs text-muted-foreground">({reviewCount})</span>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tool.sponsored && <Badge variant="outline" className="border-amber-500 text-amber-500">Featured</Badge>}
                    {tool.featured && !tool.sponsored && <Badge>Featured</Badge>}
                    {isNew && <Badge variant="outline">New</Badge>}
                    {tool.pricingType === "FREE" && <Badge variant="outline" className="border-green-500 text-green-500">Free</Badge>}
                    {tool.pricingType === "FREEMIUM" && <Badge variant="outline" className="border-blue-500 text-blue-500">Freemium</Badge>}
                    {tool.hasFreeTrial && <Badge variant="outline">🎁 Trial</Badge>}
                    {tool.hasApiAccess && <Badge variant="outline">🔌 API</Badge>}
                  </div>
                  <CardTitle className="line-clamp-2 leading-tight">{tool.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{tool.tagline}</CardDescription>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col justify-end gap-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{tool.pricing}</Badge>
                    <div className="flex items-center gap-2">
                      {tool.viewCount > 0 && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <TrendingUp className="h-3 w-3" />{tool.viewCount.toLocaleString()}
                        </span>
                      )}
                      <Link href={`/ai-tools/${tool.slug}`} className="text-xs font-medium text-primary hover:underline">
                        Detail →
                      </Link>
                    </div>
                  </div>

                  {/* Compare action */}
                  {isInCompare ? (
                    <Link
                      href={buildFilterUrl({ compare: nextCompare.join(",") })}
                      className="inline-flex h-8 items-center justify-center rounded-md border border-red-200 bg-red-50 px-3 text-xs font-medium text-red-600 hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:text-red-400"
                    >
                      Remove from Compare
                    </Link>
                  ) : compareSlugs.length < maxCompare ? (
                    <Link
                      href={buildFilterUrl({ compare: nextCompare.join(",") })}
                      className="inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-medium hover:bg-muted"
                    >
                      + Compare
                    </Link>
                  ) : null}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="rounded-lg border bg-muted/20 py-20 text-center">
          <p className="text-muted-foreground">Tidak ada tools AI yang cocok dengan filter Anda.</p>
          <Link href="/ai-tools" className="mt-3 inline-block text-sm text-primary hover:underline">
            Reset filters
          </Link>
        </div>
      )}
    </>
  )
}
