import { AdSlot } from "@/components/ads/ad-slot"
import { PostViewTracker } from "@/components/analytics/post-view-tracker"
import { ShareButtons } from "@/components/blog/share-buttons"
import { InternalLinksBlock } from "@/components/layout/internal-links"
import { components } from "@/components/mdx"
import { Badge } from "@/components/ui/badge"
import { extractToc, getReadingStats, slugifyHeading } from "@/lib/blog"
import { getAuthorProfilesByUsernames } from "@/lib/authors"
import { getPublicBlogPostBySlug, getPublicBlogPosts, getPostTranslationByLocale } from "@/lib/posts"
import { parseLocale, otherLocale, type Locale } from "@/lib/i18n/config"
import type { Metadata } from "next"
import { MDXRemote } from "next-mdx-remote/rsc"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Fragment, type ReactNode } from "react"

interface BlogPostPageProps {
  params: Promise<{ locale: string; slug: string }>
}

function headingWithId(Tag: "h2" | "h3") {
  return function Heading({ children }: { children: ReactNode }) {
    const text = typeof children === "string" ? children : String(children)
    const id = slugifyHeading(text)
    return <Tag id={id}>{children}</Tag>
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const post = await getPublicBlogPostBySlug(slug)



  if (!post) {
    return { title: "Post Not Found" }
  }

  const canonicalUrl = `/${locale}/blog/${post.slug}`
  const loc = parseLocale(locale)
  const otherLoc = otherLocale(loc)

  // Get translation link if exists
  let otherLocaleSlug: string | null = null
  if (post.id) {
    const translation = await getPostTranslationByLocale(post.id, loc === "en" ? "ID" : "EN")
    otherLocaleSlug = translation?.slug ?? null
  }

  const alternates: Metadata["alternates"] = {
    canonical: canonicalUrl,
    languages: {
      [loc === "en" ? "en-US" : "id-ID"]: `/${loc}/blog/${post.slug}`,
      [otherLoc === "en" ? "en-US" : "id-ID"]: otherLocaleSlug
        ? `/${otherLoc}/blog/${otherLocaleSlug}`
        : `/${otherLoc}/blog/${post.slug}`,
      "x-default": `/id/blog/${post.slug}`,
    },
  }

  return {
    title: post.title,
    description: post.excerpt,
    alternates,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  }
}

export async function generateStaticParams() {
  const locales: Locale[] = ["id", "en"]
  const params: { locale: string; slug: string }[] = []

  for (const loc of locales) {
    const posts = await getPublicBlogPosts(loc === "en" ? "EN" : "ID")
    for (const post of posts) {
      params.push({ locale: loc, slug: post.slug })
    }
  }

  return params
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params
  const loc = parseLocale(locale)
  const isEn = loc === "en"

  const posts = await getPublicBlogPosts(isEn ? "EN" : "ID")
  let post = posts.find((p) => p.slug === slug)

  // If not found, try searching in DB directly
  if (!post) {
    const dbPost = await getPublicBlogPostBySlug(slug)
    if (dbPost) post = dbPost
  }

  if (!post) {
    notFound()
  }

  const authorUsernames = post.authors ?? []
  const authorProfiles = await getAuthorProfilesByUsernames(authorUsernames)

  const allPosts = posts
  const currentIndex = allPosts.findIndex((entry) => entry.slug === post!.slug)
  const prevPost = currentIndex >= 0 ? allPosts[currentIndex + 1] ?? null : null
  const nextPost = currentIndex >= 0 ? allPosts[currentIndex - 1] ?? null : null
  const relatedPosts = allPosts
    .filter((entry) => entry.slug !== post!.slug)
    .filter((entry) => entry.category === post!.category || (entry.tags ?? []).some((tag) => (post!.tags ?? []).includes(tag)))
    .slice(0, 3)

  const readingStats = getReadingStats(post.content)
  const toc = extractToc(post.content)

  // Get translation info
  let translationLink: { href: string; label: string; locale: Locale } | null = null
  if (post.id) {
    const targetLocale = isEn ? "ID" : "EN"
    const translation = await getPostTranslationByLocale(post.id, targetLocale)
    if (translation) {
      translationLink = {
        href: `/${otherLocale(loc)}/blog/${translation.slug}`,
        label: loc === "en" ? "Baca dalam Bahasa Indonesia" : "Read in English",
        locale: otherLocale(loc),
      }
    } else {
      // Check if this post has an englishVersion field
      const englishVersion = (post as { englishVersion?: string }).englishVersion
      if (englishVersion && !isEn) {
        translationLink = {
          href: `/en/blog/${englishVersion}`,
          label: "Read in English",
          locale: "en",
        }
      }
    }
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt ?? post.createdAt,
    author:
      authorUsernames.length > 0
        ? authorUsernames.map((username) => ({
            "@type": "Person",
            name: authorProfiles[username]?.name ?? `@${username}`,
            url: `/authors/${username}`,
          }))
        : {
            "@type": "Person",
            name: post.author ?? "Admin",
          },
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-10 lg:grid-cols-[1fr_280px]">
      <article className="max-w-3xl">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

        {post.id && <PostViewTracker postId={post.id} />}

        {/* Translation banner */}
        {translationLink && (
          <Link
            href={translationLink.href}
            className="mb-6 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm transition-colors hover:bg-primary/10"
          >
            <span className="font-medium">{translationLink.label}</span>
            <span className="text-muted-foreground">→</span>
          </Link>
        )}

        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {post.category && (
              <Link href={`/${locale}/blog/category/${slugifyHeading(post.category)}`}>
                <Badge variant="outline">{post.category}</Badge>
              </Link>
            )}
            {(post.tags ?? []).map((tag) => (
              <Link key={tag} href={`/${locale}/blog/tag/${slugifyHeading(tag)}`}>
                <Badge variant="secondary">#{tag}</Badge>
              </Link>
            ))}
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{post.title}</h1>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{(post.publishedAt ?? post.createdAt ?? "").split("T")[0]}</span>
            <span>•</span>
            <div className="flex items-center gap-2">
              By{" "}
              {authorUsernames.length > 0 ? (
                authorUsernames.map((username, index) => {
                  const profile = authorProfiles[username]
                  return (
                    <Fragment key={username}>
                      {index > 0 ? ", " : null}
                      <Link href={`/profile/${username}`} className="font-medium text-foreground underline-offset-4 hover:underline">
                        {profile?.name ?? `@${username}`}
                      </Link>
                      {profile?.socials && (
                        <div className="ml-1 inline-flex items-center gap-1">
                          {profile.socials.twitter && (
                            <a
                              href={`https://twitter.com/${profile.socials.twitter.replace("@", "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-primary"
                            >
                              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                              </svg>
                            </a>
                          )}
                          {profile.socials.github && (
                            <a
                              href={`https://github.com/${profile.socials.github}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-primary"
                            >
                              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                              </svg>
                            </a>
                          )}
                          {profile.socials.telegram && (
                            <a href={`https://t.me/${profile.socials.telegram}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M11.944 0C5.347 0 0 5.347 0 11.944c0 6.597 5.347 11.944 11.944 11.944 6.597 0 11.944-5.347 11.944-11.944C23.888 5.347 18.541 0 11.944 0zm5.426 8.216l-1.848 8.707c-.139.616-.505.767-1.023.477l-2.813-2.074-1.357 1.305c-.15.15-.276.276-.566.276l.201-2.859 5.204-4.699c.226-.201-.049-.313-.35-.113l-6.433 4.049-2.771-.867c-.603-.189-.616-.603.126-.893l10.835-4.179c.502-.183.941.117.791.903z" />
                              </svg>
                            </a>
                          )}
                          {profile.socials.linkedin && (
                            <a
                              href={`https://linkedin.com/in/${profile.socials.linkedin}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-primary"
                            >
                              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                              </svg>
                            </a>
                          )}
                        </div>
                      )}
                    </Fragment>
                  )
                })
              ) : (
                <span>{post.author ?? "Unknown"}</span>
              )}
            </div>
            <span>•</span>
            <span>{readingStats.words} words</span>
            <span>•</span>
            <span>{readingStats.minutes} min read</span>
          </div>

          <ShareButtons title={post.title} />

          {/* Locale switcher */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Language:</span>
            <Link
              href={`/${loc}/blog/${post.slug}`}
              className={`px-2 py-1 rounded ${loc === "id" ? "bg-primary/10 font-medium" : "hover:bg-primary/5"}`}
            >
              🇮🇩 Indonesia
            </Link>
            <Link
              href={translationLink?.locale === "en" ? translationLink.href : `/en/blog/${post.slug}`}
              className={`px-2 py-1 rounded ${loc === "en" ? "bg-primary/10 font-medium" : "hover:bg-primary/5"}`}
            >
              🇬🇧 English
            </Link>
          </div>
        </div>

        <div className="prose prose-zinc max-w-none dark:prose-invert">
          <MDXRemote source={post.content} components={{ ...components, h2: headingWithId("h2"), h3: headingWithId("h3") }} />
        </div>

        <AdSlot section="blog_detail_inline" label="Sponsored content" className="mt-8 rounded-xl border p-4" />

        <div className="mt-12 space-y-6 border-t pt-8">
          <h2 className="text-2xl font-bold">Lanjutkan membaca</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {prevPost ? (
              <Link href={`/${locale}/blog/${prevPost.slug}`} className="rounded-lg border p-4 transition-colors hover:border-primary">
                <p className="text-xs text-muted-foreground">← Previous</p>
                <p className="mt-1 font-medium">{prevPost.title}</p>
              </Link>
            ) : (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Belum ada previous post.</div>
            )}

            {nextPost ? (
              <Link href={`/${locale}/blog/${nextPost.slug}`} className="rounded-lg border p-4 text-right transition-colors hover:border-primary">
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
              {(relatedPosts ?? []).map((relatedPost) => (
                <Link key={relatedPost.slug} href={`/${locale}/blog/${relatedPost.slug}`} className="rounded-lg border p-4 transition-colors hover:border-primary">
                  <p className="text-sm text-muted-foreground">{relatedPost.category ?? "General"}</p>
                  <p className="mt-1 font-semibold">{relatedPost.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{relatedPost.excerpt ?? "Tanpa deskripsi."}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <InternalLinksBlock title="Jelajahi Konten Lain" />
      </article>

      <aside className="hidden lg:block space-y-4">
        <AdSlot section="blog_detail_sidebar" className="rounded-xl border p-4" />
        <div className="sticky top-20 rounded-xl border p-4">
          <p className="mb-3 text-sm font-semibold">Table of contents</p>
          {toc.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {(toc ?? []).map((item) => (
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