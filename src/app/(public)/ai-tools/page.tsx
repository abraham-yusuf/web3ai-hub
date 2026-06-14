import { AdSlot } from "@/components/ads/ad-slot"
import { InternalLinksBlock } from "@/components/layout/internal-links"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { prisma } from "@/lib/prisma"
import { generateSeo } from "@/lib/seo"
import { Search, Star, X, GitCompare, SlidersHorizontal, TrendingUp, Crown, Zap } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

export const dynamic = "force-dynamic"
export const revalidate = 3600

export const metadata: Metadata = generateSeo({
  title: "AI Tools Directory",
  description: "Koleksi tools AI terbaik untuk produktivitas dan kreativitas.",
  type: "website",
  canonical: "/ai-tools",
})

const PLATFORM_OPTIONS = ["web", "ios", "android", "desktop", "api"]
const PRICING_TYPES = [
  { value: "FREE", label: "Free" },
  { value: "FREEMIUM", label: "Freemium" },
  { value: "PAID", label: "Paid" },
  { value: "SUBSCRIPTION", label: "Subscription" },
]
const SORT_OPTIONS = [
  { value: "rating", label: "⭐ Rating Tertinggi" },
  { value: "trending", label: "🔥 Trending" },
  { value: "newest", label: "🕐 Terbaru" },
  { value: "name", label: "🔤 Nama A–Z" },
  { value: "views", label: "👁️ Paling Dilihat" },
]

export default async function AiToolsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    category?: string
    pricingType?: string
    platform?: string
    hasFreeTrial?: string
    hasApiAccess?: string
    sort?: string
    compare?: string
  }>
}) {
  const { q, category, pricingType, platform, hasFreeTrial, hasApiAccess, sort, compare } = await searchParams

  // Unlimited compare
  const compareSlugs = (compare ?? "").split(",").filter(Boolean)
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

  // Remove empty AND
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

  const [tools, categories, categoryCounts] = await Promise.all([
    prisma.aITool.findMany({
      where,
      orderBy,
      include: {
        _count: { select: { reviews: { where: { status: "APPROVED" } } } },
      },
    }),
    prisma.aITool.groupBy({ by: ["category"], _count: { id: true }, orderBy: { _count: { id: "desc" } } }),
    prisma.aITool.count(),
  ])

  // Sponsored tools float to top when filter is active (or always show first)
  const sponsoredTools = tools.filter((t) => t.sponsored)
  const regularTools = tools.filter((t) => !t.sponsored)
  const sortedTools = [...sponsoredTools, ...regularTools]

  // Build compare URL helper
  const compareBase = `/ai-tools?q=${encodeURIComponent(q ?? "")}&sort=${sort ?? ""}`
  const buildFilterUrl = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (sort) params.set("sort", sort)
    const merged = { category, pricingType, platform, hasFreeTrial, hasApiAccess, compare: compareSlugs.join(","), ...overrides }
    for (const [k, v] of Object.entries(merged)) {
      if (v && v !== "false" && v !== "") params.set(k, v)
    }
    return `/ai-tools?${params.toString()}`
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">AI Tools Directory</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {categoryCounts} tools AI untuk produktivitas dan kreativitas Anda.
        </p>
      </div>

      <AdSlot section="tools_list" className="rounded-xl border p-4" />

      {/* Search + Sort Row */}
      <form method="GET" className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari tools AI..." className="pl-10" name="q" defaultValue={q} />
        </div>
        {/* Sort dropdown */}
        <select
          name="sort"
          defaultValue={sort ?? "rating"}
          className="h-10 rounded-md border bg-background px-3 text-sm"
          onChange={(e) => {
            const form = e.target.closest("form")!
            const url = new URL(form.action)
            url.searchParams.set("sort", e.target.value)
            if (q) url.searchParams.set("q", q)
            if (category) url.searchParams.set("category", category)
            if (pricingType) url.searchParams.set("pricingType", pricingType)
            if (platform) url.searchParams.set("platform", platform)
            if (hasFreeTrial) url.searchParams.set("hasFreeTrial", hasFreeTrial)
            if (hasApiAccess) url.searchParams.set("hasApiAccess", hasApiAccess)
            window.location.href = url.toString()
          }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <input type="hidden" name="compare" value={compareSlugs.join(",")} />
        <Button type="submit" variant="default">Search</Button>
      </form>

      {/* Filter Row */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" />
          Filter:
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          <Link href={buildFilterUrl({ category: undefined })}>
            <Badge variant={!category ? "default" : "outline"} className="cursor-pointer">All</Badge>
          </Link>
          {categories.map((cat) => (
            <Link key={cat.category} href={buildFilterUrl({ category: cat.category })}>
              <Badge variant={category === cat.category ? "default" : "outline"} className="cursor-pointer hover:bg-primary/10">
                {cat.category} ({cat._count.id})
              </Badge>
            </Link>
          ))}
        </div>

        {/* Pricing Type chips */}
        <div className="flex flex-wrap gap-2">
          {PRICING_TYPES.map((pt) => (
            <Link key={pt.value} href={buildFilterUrl({ pricingType: pricingType === pt.value ? undefined : pt.value })}>
              <Badge variant={pricingType === pt.value ? "default" : "outline"} className="cursor-pointer">
                {pt.label}
              </Badge>
            </Link>
          ))}
        </div>

        {/* Feature toggles */}
        <div className="flex flex-wrap gap-2">
          <Link href={buildFilterUrl({ hasFreeTrial: hasFreeTrial === "true" ? undefined : "true" })}>
            <Badge variant={hasFreeTrial === "true" ? "default" : "outline"} className="cursor-pointer">
              🎁 Free Trial
            </Badge>
          </Link>
          <Link href={buildFilterUrl({ hasApiAccess: hasApiAccess === "true" ? undefined : "true" })}>
            <Badge variant={hasApiAccess === "true" ? "default" : "outline"} className="cursor-pointer">
              🔌 API Access
            </Badge>
          </Link>
          {PLATFORM_OPTIONS.map((pf) => (
            <Link key={pf} href={buildFilterUrl({ platform: platform === pf ? undefined : pf })}>
              <Badge variant={platform === pf ? "default" : "outline"} className="cursor-pointer capitalize">
                {pf}
              </Badge>
            </Link>
          ))}
        </div>

        {/* Active filter summary */}
        {(category || pricingType || platform || hasFreeTrial || hasApiAccess) && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Active:</span>
            {category && <Badge variant="secondary">{category} <Link href={buildFilterUrl({ category: undefined })} className="ml-1">×</Link></Badge>}
            {pricingType && <Badge variant="secondary">{pricingType} <Link href={buildFilterUrl({ pricingType: undefined })} className="ml-1">×</Link></Badge>}
            {platform && <Badge variant="secondary">{platform} <Link href={buildFilterUrl({ platform: undefined })} className="ml-1">×</Link></Badge>}
            {hasFreeTrial === "true" && <Badge variant="secondary">Free Trial <Link href={buildFilterUrl({ hasFreeTrial: undefined })} className="ml-1">×</Link></Badge>}
            {hasApiAccess === "true" && <Badge variant="secondary">API Access <Link href={buildFilterUrl({ hasApiAccess: undefined })} className="ml-1">×</Link></Badge>}
            <Link href={`/ai-tools?q=${encodeURIComponent(q ?? "")}`} className="text-xs text-muted-foreground hover:text-primary ml-2">
              Clear all
            </Link>
          </div>
        )}
      </div>

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

      {/* Results */}
      {sortedTools.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

      <InternalLinksBlock />
    </div>
  )
}