import { Suspense } from "react"
import { AdSlot } from "@/components/ads/ad-slot"
import { SortSelect } from "@/components/ai-tools/sort-select"
import { InternalLinksBlock } from "@/components/layout/internal-links"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { prisma } from "@/lib/prisma"
import { generateSeo } from "@/lib/seo"
import { Search, SlidersHorizontal } from "lucide-react"
import type { Metadata } from "next"
import { unstable_cache } from "next/cache"
import Link from "next/link"
import { ToolGrid } from "./tool-grid"
import { ToolGridSkeleton } from "./tool-grid-skeleton"

// ── Removed `force-dynamic` ───────────────────────────────────────────────
// The page is inherently dynamic via `searchParams`, so `force-dynamic` was
// redundant. Removing it lets Next.js apply partial prerendering and edge
// caching for the static shell, improving LCP significantly.

// Filter-independent facet data — cached, revalidates every 5 min.
const getAiToolFacets = unstable_cache(
  async () => {
    const [categories, total] = await Promise.all([
      prisma.aITool.groupBy({ by: ["category"], _count: { id: true }, orderBy: { _count: { id: "desc" } } }),
      prisma.aITool.count(),
    ])
    return { categories, total }
  },
  ["ai-tools-facets"],
  { revalidate: 300, tags: ["ai-tools"] },
)

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
  const compareSlugs = (compare ?? "").split(",").filter(Boolean)

  // Facets are cached — fast lookup for the shell
  const facets = await getAiToolFacets()
  const categories = facets.categories
  const categoryCounts = facets.total

  // URL builder shared between shell and grid
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
      {/* ── Static shell (renders instantly → fast LCP) ────────────────── */}
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
        <SortSelect
          defaultValue={sort ?? "rating"}
          options={SORT_OPTIONS}
          currentParams={{ q, category, pricingType, platform, hasFreeTrial, hasApiAccess, compare: compareSlugs.join(",") }}
        />
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

      {/* ── Streamed content (Suspense boundary for tool grid) ──────── */}
      <Suspense fallback={<ToolGridSkeleton count={8} />}>
        <ToolGrid
          q={q}
          category={category}
          pricingType={pricingType}
          platform={platform}
          hasFreeTrial={hasFreeTrial}
          hasApiAccess={hasApiAccess}
          sort={sort}
          compareSlugs={compareSlugs}
          buildFilterUrl={buildFilterUrl}
        />
      </Suspense>

      <InternalLinksBlock />
    </div>
  )
}
