import { AdSlot } from "@/components/ads/ad-slot"
import { InternalLinksBlock } from "@/components/layout/internal-links"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { slugifyHeading } from "@/lib/blog"
import { getPublicBlogPosts, getBlogTaxonomies } from "@/lib/posts"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Blog",
  description: "Artikel terbaru seputar Web3, AI, dan teknologi masa depan.",
  alternates: { canonical: "/blog" },
}

export default async function BlogPage() {
  const posts = await getPublicBlogPosts()
  const { categories, tags } = await getBlogTaxonomies()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
        <p className="mt-2 text-lg text-muted-foreground">Artikel terbaru seputar Web3, AI, dan teknologi masa depan.</p>
      </div>

      <AdSlot section="blog_list" className="rounded-xl border p-4" />
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link key={category} href={`/blog/category/${slugifyHeading(category)}`}>
              <Badge variant="outline">{category}</Badge>
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link key={tag} href={`/blog/tag/${slugifyHeading(tag)}`}>
              <Badge variant="secondary">#{tag}</Badge>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <Card className="h-full transition-colors hover:border-primary">
              <CardHeader>
                <div className="mb-2 text-xs font-medium text-primary">{post.category}</div>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>{post.createdAt}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <InternalLinksBlock />
    </div>
  )
}
