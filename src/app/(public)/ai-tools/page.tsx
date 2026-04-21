import { AdSlot } from "@/components/ads/ad-slot"
import { InternalLinksBlock } from "@/components/layout/internal-links"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { prisma } from "@/lib/prisma"
import { Search, Star } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "AI Tools Directory",
  description: "Koleksi tools AI terbaik untuk produktivitas dan kreativitas.",
  alternates: { canonical: "/ai-tools" },
}

export default async function AiToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; pricing?: string; compare?: string }>
}) {
  const { q, category, pricing, compare } = await searchParams
  const compareSlugs = (compare ?? "").split(",").filter(Boolean).slice(0, 3)

  const tools = await prisma.aITool.findMany({
    where: {
      AND: [
        q ? { name: { contains: q, mode: "insensitive" } } : {},
        category ? { category: { contains: category, mode: "insensitive" } } : {},
        pricing ? { pricing } : {},
      ],
    },
    orderBy: { rating: "desc" },
  })

  const categories = [
    "Writing & Content",
    "Image Generation",
    "Video Generation",
    "Coding & Development",
    "Audio & Music",
    "Web3 & Crypto",
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">AI Tools Directory</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Koleksi tools AI terbaik untuk membantu produktivitas dan kreativitas Anda.
        </p>
      </div>

      <AdSlot section="tools_list" className="rounded-xl border p-4" />

      <form method="GET" className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari tools AI..." className="pl-10" name="q" defaultValue={q} />
        </div>
        <input type="hidden" name="compare" value={compareSlugs.join(",")} />
        <button type="submit" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Search</button>
      </form>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Link key={cat} href={`/ai-tools?category=${encodeURIComponent(cat)}${compareSlugs.length ? `&compare=${compareSlugs.join(",")}` : ""}`}>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
              {cat}
            </Badge>
          </Link>
        ))}
      </div>

      {compareSlugs.length > 0 && (
        <div className="rounded-xl border p-4">
          <p className="text-sm font-medium">Compare queue: {compareSlugs.join(", ")}</p>
          <div className="mt-3 flex gap-2">
            <Link href={`/ai-tools/compare?slugs=${compareSlugs.join(",")}`} className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground">Compare Now</Link>
            <Link href="/ai-tools" className="inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium">Clear</Link>
          </div>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tools.length > 0 ? (
          tools.map((tool) => {
            const isNew = tool.createdAt.getTime() === tool.updatedAt.getTime()
            const canAddToCompare = !compareSlugs.includes(tool.slug) && compareSlugs.length < 3
            const nextCompare = [...compareSlugs, tool.slug].slice(0, 3)

            return (
              <Card key={tool.id} className="flex h-full flex-col transition-colors hover:border-primary">
                <CardHeader>
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <Badge variant="secondary">{tool.category}</Badge>
                    <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                      <Star className="h-4 w-4 fill-current" />
                      {tool.rating}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {tool.featured && <Badge>Featured</Badge>}
                    {isNew && <Badge variant="outline">New</Badge>}
                  </div>
                  <CardTitle>{tool.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{tool.tagline}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-end gap-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{tool.pricing}</Badge>
                    <Link href={`/ai-tools/${tool.slug}`} className="text-xs font-medium text-primary hover:underline">Detail →</Link>
                  </div>
                  {canAddToCompare ? (
                    <Link href={`/ai-tools?q=${encodeURIComponent(q ?? "")}&compare=${nextCompare.join(",")}`} className="inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-medium">
                      Add to compare
                    </Link>
                  ) : (
                    <span className="text-xs text-muted-foreground">Compare max 3 tools</span>
                  )}
                </CardContent>
              </Card>
            )
          })
        ) : (
          <div className="col-span-full rounded-lg border bg-muted/20 py-20 text-center">
            <p className="text-muted-foreground">Belum ada tools AI yang ditemukan.</p>
          </div>
        )}
      </div>

      <InternalLinksBlock />
    </div>
  )
}
