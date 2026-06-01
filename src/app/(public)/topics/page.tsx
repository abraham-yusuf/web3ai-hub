import { prisma } from "@/lib/prisma"
import { generateSeo } from "@/lib/seo"
import { JsonLdScript, buildWebsiteJsonLd } from "@/components/seo/json-ld"
import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

export const metadata: Metadata = generateSeo({
  title: "Topics",
  description: "Jelajahi topic clusters untuk belajar Web3 & AI secara mendalam.",
  type: "website",
  canonical: "/topics",
})

export default async function TopicsIndexPage() {
  const clusters = await prisma.topicCluster.findMany({
    orderBy: { searchVolume: "desc" },
  })

  const websiteJsonLd = buildWebsiteJsonLd(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://ai3.my.id",
    "AI3"
  )

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <JsonLdScript json={websiteJsonLd} id="website-json-ld" />

      <div>
        <h1 className="text-4xl font-extrabold tracking-tight">Topic Clusters</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Jelajahi topik-topik lengkap untuk menguasai Web3 & AI secara mendalam.
          Setiap cluster berisi blog posts, learn pages, dan airdrops terkait.
        </p>
      </div>

      {clusters.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <p>Belum ada topic cluster.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clusters.map((cluster) => (
            <Link key={cluster.id} href={`/topics/${cluster.slug}`}>
              <Card className="h-full transition-colors hover:border-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{cluster.topic}</CardTitle>
                    {cluster.searchVolume && (
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  {cluster.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {cluster.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {cluster.keywords.slice(0, 4).map((kw) => (
                      <span key={kw} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        #{kw}
                      </span>
                    ))}
                  </div>
                  {cluster.searchVolume && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      ~{cluster.searchVolume.toLocaleString("id-ID")} searches/bulan
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}