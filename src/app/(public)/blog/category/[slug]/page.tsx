import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getPublicBlogPosts } from "@/lib/posts"
import { slugifyHeading } from "@/lib/blog"
import Link from "next/link"

interface BlogCategoryPageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogCategoryPage({ params }: BlogCategoryPageProps) {
  const { slug } = await params
  const posts = await getPublicBlogPosts()
  const filtered = posts.filter((post) => slugifyHeading(post.category ?? "general") === slug)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Category: {slug}</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>{post.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{post.excerpt}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && <p className="text-muted-foreground">Belum ada post pada kategori ini.</p>}
      </div>
    </div>
  )
}
