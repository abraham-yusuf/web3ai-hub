import { prisma } from "@/lib/prisma"
import { getPublicBlogPosts } from "@/lib/posts"
import { getAllFilesMetadata } from "@/lib/mdx"
import { generateSeo } from "@/lib/seo"
import { JsonLdScript, buildWebsiteJsonLd, buildBreadcrumbJsonLd } from "@/components/seo/json-ld"
import { InternalLinksBlock } from "@/components/layout/internal-links"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, FileText, Gift } from "lucide-react"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const cluster = await prisma.topicCluster.findUnique({ where: { slug } })

  if (!cluster) return { title: "Topic Not Found" }

  return generateSeo({
    title: `${cluster.topic} — Topic Hub`,
    description: cluster.description ?? `Kumpulan konten lengkap tentang ${cluster.topic} di AI3. Blog, learn, dan airdrop.`,
    type: "website",
    canonical: `/topics/${slug}`,
    keywords: cluster.keywords,
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Topics", href: "/topics" },
      { label: cluster.topic, href: `/topics/${slug}` },
    ],
  })
}

export default async function TopicClusterPage({ params }: Props) {
  const { slug } = await params
  const cluster = await prisma.topicCluster.findUnique({ where: { slug } })

  if (!cluster) notFound()

  const relatedUrls = (cluster.relatedUrls ?? {}) as {
    blogSlugs?: string[]
    learnSlugs?: string[]
    airdropSlugs?: string[]
  }

  const allPosts = await getPublicBlogPosts()
  const allLearn = getAllFilesMetadata("learn")
  const airdrops = relatedUrls.airdropSlugs
    ? await prisma.airdrop.findMany({
        where: { slug: { in: relatedUrls.airdropSlugs } },
        select: { slug: true, name: true, network: true, status: true },
        take: 6,
      })
    : []

  const blogPosts = allPosts.filter(
    (p) => relatedUrls.blogSlugs?.includes(p.slug) ?? false
  )
  const learnPages = allLearn.filter(
    (l) => relatedUrls.learnSlugs?.includes(l.slug) ?? false
  )

  const websiteJsonLd = buildWebsiteJsonLd(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://ai3.my.id",
    "AI3"
  )
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(
    [
      { label: "Home", href: "/" },
      { label: "Topics", href: "/topics" },
      { label: cluster.topic, href: `/topics/${slug}` },
    ],
    process.env.NEXT_PUBLIC_APP_URL ?? "https://ai3.my.id"
  )

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-10">
      <JsonLdScript json={websiteJsonLd} id="website-json-ld" />
      <JsonLdScript json={breadcrumbJsonLd} id="breadcrumb-json-ld" />

      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{cluster.difficulty ?? "medium"}</Badge>
          {cluster.searchVolume && (
            <Badge variant="secondary">{cluster.searchVolume.toLocaleString("id-ID")}/mo searches</Badge>
          )}
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">{cluster.topic}</h1>
        {cluster.description && (
          <p className="text-lg text-muted-foreground">{cluster.description}</p>
        )}
        <div className="flex flex-wrap gap-2 pt-2">
          {cluster.keywords.map((kw) => (
            <Badge key={kw} variant="secondary">#{kw}</Badge>
          ))}
        </div>
      </div>

      {/* Content sections */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Blog posts */}
        {blogPosts.length > 0 && (
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <FileText className="h-5 w-5 text-primary" />
              Blog Posts
            </h2>
            <div className="space-y-3">
              {blogPosts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`}>
                  <Card className="transition-colors hover:border-primary">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{post.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Learn pages */}
        {learnPages.length > 0 && (
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <BookOpen className="h-5 w-5 text-secondary" />
              Learn Pages
            </h2>
            <div className="space-y-3">
              {learnPages.map((page) => (
                <Link key={page.slug} href={`/learn/${page.slug}`}>
                  <Card className="transition-colors hover:border-secondary">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{page.title}</CardTitle>
                      {page.excerpt && (
                        <CardDescription className="line-clamp-2">{page.excerpt}</CardDescription>
                      )}
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Airdrops */}
        {airdrops.length > 0 && (
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <Gift className="h-5 w-5 text-accent" />
              Related Airdrops
            </h2>
            <div className="space-y-3">
              {airdrops.map((airdrop) => (
                <Link key={airdrop.slug} href={`/airdrop/${airdrop.slug}`}>
                  <Card className="transition-colors hover:border-accent">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{airdrop.name}</CardTitle>
                        <Badge variant="outline">{airdrop.network}</Badge>
                      </div>
                      <CardDescription>Status: {airdrop.status}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Empty state */}
      {blogPosts.length === 0 && learnPages.length === 0 && airdrops.length === 0 && (
        <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <p>Belum ada konten yang terhubung dengan topic ini.</p>
          <p className="mt-1 text-sm">Tambahkan slugs di admin Topic Clusters untuk menampilkan konten.</p>
        </div>
      )}

      <InternalLinksBlock />
    </div>
  )
}