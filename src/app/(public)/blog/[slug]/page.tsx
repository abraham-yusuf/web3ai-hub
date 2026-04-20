import { components } from "@/components/mdx"
import { Badge } from "@/components/ui/badge"
import { getPrevNextPosts, getReadingStats, getRelatedPosts, getPublishedBlogPosts, extractToc, slugifyHeading } from "@/lib/blog"
import { getFileBySlug } from "@/lib/mdx"
import type { Metadata } from "next"
import { MDXRemote } from "next-mdx-remote/rsc"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { ReactNode } from "react"
import { ShareButtons } from "@/components/blog/share-buttons"

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  return getPublishedBlogPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getFileBySlug("blog", slug)

  if (!post) {
    return {
      title: "Post Not Found",
    }
  }

  const title = post.frontMatter.title
  const description = post.frontMatter.excerpt ?? `Baca artikel ${title} di Web3AI Hub.`
  const canonicalUrl = `/blog/${post.frontMatter.slug}`

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

function headingWithId(Tag: "h2" | "h3") {
  return function Heading({ children }: { children: ReactNode }) {
    const text = typeof children === "string" ? children : String(children)
    const id = slugifyHeading(text)
    return <Tag id={id}>{children}</Tag>
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getFileBySlug("blog", slug)

  if (!post) {
    notFound()
  }

  const readingStats = getReadingStats(post.content)
  const toc = extractToc(post.content)
  const relatedPosts = getRelatedPosts(post.frontMatter)
  const { prevPost, nextPost } = getPrevNextPosts(post.frontMatter.slug)

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.frontMatter.title,
    description: post.frontMatter.excerpt,
    datePublished: post.frontMatter.date,
    author: {
      "@type": "Person",
      name: post.frontMatter.author,
    },
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-10 lg:grid-cols-[1fr_280px]">
      <article className="max-w-3xl">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {post.frontMatter.category && <Badge variant="outline">{post.frontMatter.category}</Badge>}
            {post.frontMatter.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">
                #{tag}
              </Badge>
            ))}
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{post.frontMatter.title}</h1>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{post.frontMatter.date ?? "No date"}</span>
            <span>•</span>
            <span>By {post.frontMatter.author ?? "Unknown"}</span>
            <span>•</span>
            <span>{readingStats.words} words</span>
            <span>•</span>
            <span>{readingStats.minutes} min read</span>
          </div>

          <ShareButtons title={post.frontMatter.title} />
        </div>

        <div className="prose prose-zinc max-w-none dark:prose-invert">
          <MDXRemote source={post.content} components={{ ...components, h2: headingWithId("h2"), h3: headingWithId("h3") }} />
        </div>

        <div className="mt-12 space-y-6 border-t pt-8">
          <h2 className="text-2xl font-bold">Lanjutkan membaca</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {prevPost ? (
              <Link href={`/blog/${prevPost.slug}`} className="rounded-lg border p-4 transition-colors hover:border-primary">
                <p className="text-xs text-muted-foreground">← Previous</p>
                <p className="mt-1 font-medium">{prevPost.title}</p>
              </Link>
            ) : (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Belum ada previous post.</div>
            )}

            {nextPost ? (
              <Link href={`/blog/${nextPost.slug}`} className="rounded-lg border p-4 text-right transition-colors hover:border-primary">
                <p className="text-xs text-muted-foreground">Next →</p>
                <p className="mt-1 font-medium">{nextPost.title}</p>
              </Link>
            ) : (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Belum ada next post.</div>
            )}
          </div>
        </div>

        {relatedPosts.length > 0 && (
          <div className="mt-12 space-y-4 border-t pt-8">
            <h2 className="text-2xl font-bold">Related posts</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`} className="rounded-lg border p-4 transition-colors hover:border-primary">
                  <p className="text-sm text-muted-foreground">{relatedPost.category ?? "General"}</p>
                  <p className="mt-1 font-semibold">{relatedPost.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{relatedPost.excerpt ?? "Tanpa deskripsi."}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <aside className="hidden lg:block">
        <div className="sticky top-20 rounded-xl border p-4">
          <p className="mb-3 text-sm font-semibold">Table of contents</p>
          {toc.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {toc.map((item) => (
                <li key={item.id} className={item.level === 3 ? "ml-4" : ""}>
                  <a href={`#${item.id}`} className="text-muted-foreground transition-colors hover:text-primary">
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Heading belum tersedia.</p>
          )}
        </div>
      </aside>
    </div>
  )
}
